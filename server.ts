import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "" || key.length < 15) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Fallback rule-based classifier when API key is unavailable or during network anomalies
function fallbackAnalyze(text: string) {
  const t = text || "";
  
  // Medical
  if (
    /\b(medical|doctor|heart|chest pain|blood|vomit|unconscious|fever|pregnant|emergency|injured|injury|sick|patient|pain)\b/i.test(t)
  ) {
    return {
      complaint: text || "Medical emergency reported by passenger",
      department: "Medical",
      urgency: "High",
      reasoning: "Health-related symptoms or medical emergency requiring immediate railway healthcare intervention.",
    };
  }

  // Women Safety
  if (
    /\b(women|woman|harass|eve teasing|stalk|safety|scared|threat|misbehave|ladies|molest|molestation)\b/i.test(t)
  ) {
    return {
      complaint: text || "Women safety concern reported",
      department: "Women Safety",
      urgency: "High",
      reasoning: "Security and safety concern affecting female passenger; routed to RPF / Women Safety squad.",
    };
  }

  // Smoking / Drunk
  if (
    /\b(smoke|smoking|cigarette|bidi|drunk|alcohol|liquor|intoxicated|fighting|fight|drugs|beer)\b/i.test(t)
  ) {
    return {
      complaint: text || "Smoking or intoxicated passenger nuisance reported",
      department: "Smoking / Drunk",
      urgency: "Medium",
      reasoning: "Illegal smoking or unruly behavior reported under Railway Act.",
    };
  }

  // Cleanliness
  if (
    /\b(clean|dirty|toilet|washroom|flush|water|cockroach|rat|smell|garbage|trash|dustbin|stain|basin|drainage|leakage|hygiene|soap)\b/i.test(t)
  ) {
    return {
      complaint: text || "Coach cleanliness and sanitation issue",
      department: "Cleanliness",
      urgency: /\b(overflow|no water|leak|jammed)\b/i.test(t) ? "Medium" : "Low",
      reasoning: "Sanitation and onboard housekeeping services (OBHS) required.",
    };
  }

  // Electricity
  if (
    /\b(fan|fans|light|lights|ac|cooling|charger|charging|socket|plug|switch|power|wire|wiring|short circuit|electricity)\b/i.test(t) ||
    /air\s*condition/i.test(t)
  ) {
    const isUrgent = /\b(short circuit|spark|fire|wire burning|smoke from switch)\b/i.test(t);
    return {
      complaint: text || "Electrical equipment malfunction",
      department: "Electricity",
      urgency: isUrgent ? "High" : "Medium",
      reasoning: "Issue involves coach electrical utilities (fans, lights, AC, or charging points).",
    };
  }

  // Default Other
  return {
    complaint: text || "General passenger grievance",
    department: "Other",
    urgency: "Medium",
    reasoning: "Grievance routed to Commercial / Station Supervisor for review.",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Complaint Analysis (supports text, image base64, voice transcripts)
  app.post("/api/ai/analyze", async (req, res) => {
    const { text, imageBase64, mimeType } = req.body;

    if (!text && !imageBase64) {
      res.status(400).json({ error: "Please provide either complaint text or an image." });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback mode
      const result = fallbackAnalyze(text || "Issue captured in uploaded photo");
      res.json({
        ...result,
        source: "rule-engine",
      });
      return;
    }

    try {
      const contents: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        });
      }

      const promptText = `
You are the official AI Complaint Categorization Engine for Rail Madad (Indian Railways).
Analyze the following passenger report (from text, voice transcript, and/or image).

Input text: "${text || "No text provided, examine image strictly"}"

Task:
Extract and determine exactly three things:
1. "complaint": A clear, concise 1-2 sentence summary of what the exact problem is (include coach/seat/location if mentioned).
2. "department": Must be EXACTLY ONE of these 6 options:
   - "Electricity" (fans, lights, AC, sockets, switches, wiring)
   - "Cleanliness" (dirty toilets, garbage, smell, water supply, cockroaches/pests, basin)
   - "Smoking / Drunk" (illegal smoking, alcohol, nuisance, harassment by drunk passenger)
   - "Medical" (sick passenger, chest pain, injury, fever, emergency doctor needed)
   - "Women Safety" (harassment of female passenger, stalking, misbehavior, safety distress)
   - "Other" (pantry/food, delays, ticketing, berth dispute, luggage, etc.)
3. "urgency": Must be EXACTLY ONE of: "Low", "Medium", "High".
   (Medical & Women Safety are almost always High; Electricity/Water/AC are Medium or High; cosmetic trash is Low or Medium).

Return strictly JSON with keys: "complaint", "department", "urgency", "reasoning".
`;

      contents.push({ text: promptText });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timed out")), 4500)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
        timeoutPromise,
      ]);

      const raw = response.text || "{}";
      const parsed = JSON.parse(raw);

      // Validate department
      const validDepts = [
        "Electricity",
        "Cleanliness",
        "Smoking / Drunk",
        "Medical",
        "Women Safety",
        "Other",
      ];
      const department = validDepts.includes(parsed.department) ? parsed.department : "Other";
      const urgency = ["Low", "Medium", "High"].includes(parsed.urgency) ? parsed.urgency : "Medium";
      const complaint = parsed.complaint || text || "Railway grievance reported";

      res.json({
        complaint,
        department,
        urgency,
        reasoning: parsed.reasoning || "Categorized by Rail Madad AI engine",
        source: "gemini-3.8-flash",
      });
    } catch (err: any) {
      console.error("Gemini AI error:", err);
      // Seamlessly fallback so user experience never breaks
      const fallbackResult = fallbackAnalyze(text || "Photo complaint analysis");
      res.json({
        ...fallbackResult,
        source: "rule-engine-fallback",
      });
    }
  });

  // AI 139 Call Assistant Endpoint
  app.post("/api/ai/call-assistant", async (req, res) => {
    const { userMessage, history } = req.body;
    const ai = getGeminiClient();

    if (!userMessage) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!ai) {
      // Dynamic conversational fallback for 139
      const analysis = fallbackAnalyze(userMessage);
      res.json({
        reply: `Namaste! Rail Madad 139 AI Helpline here. I understand your issue regarding: "${analysis.complaint}". I am forwarding this immediately to the ${analysis.department} Department with ${analysis.urgency} priority. An onboard railway team is being alerted.`,
        detectedComplaint: analysis,
        shouldRegister: true,
      });
      return;
    }

    try {
      const systemInstruction = `
You are the Indian Railways "139 Rail Madad AI Voice Assistant" speaking to a train passenger on a live helpline call.
Keep your answers brief, polite, empathetic, and spoken in conversational style (1-2 sentences maximum).
Greet the passenger respectfully ("Namaste", "Hello"), acknowledge their problem directly, ask for coach or seat number if not provided, and confirm you are routing it to the correct department.

Valid Departments:
- Electricity
- Cleanliness
- Smoking / Drunk
- Medical
- Women Safety
- Other

Output valid JSON with:
{
  "reply": "string (the voice assistant's response to be read to the caller)",
  "isComplaintIdentified": boolean (true if user described a problem),
  "complaint": "brief summary of the problem if identified",
  "department": "One of the 6 valid departments",
  "urgency": "Low" | "Medium" | "High"
}
`;

      const contents = [
        {
          text: `${systemInstruction}\nPassenger says: "${userMessage}"\nPrevious context: ${JSON.stringify(history || [])}`,
        },
      ];

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI assistant timed out")), 4500)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
        timeoutPromise,
      ]);

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        reply: parsed.reply || "Thank you for contacting 139 Rail Madad. We are logging your complaint and dispatching our team.",
        detectedComplaint: parsed.isComplaintIdentified
          ? {
              complaint: parsed.complaint || userMessage,
              department: parsed.department || "Other",
              urgency: parsed.urgency || "Medium",
            }
          : null,
        shouldRegister: Boolean(parsed.isComplaintIdentified),
      });
    } catch (err: any) {
      console.error("139 assistant error:", err);
      const analysis = fallbackAnalyze(userMessage);
      res.json({
        reply: `Rail Madad 139 received your report: "${analysis.complaint}". Routing directly to ${analysis.department} department (${analysis.urgency} priority).`,
        detectedComplaint: analysis,
        shouldRegister: true,
      });
    }
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rail Madad server running on port ${PORT}`);
  });
}

startServer();
