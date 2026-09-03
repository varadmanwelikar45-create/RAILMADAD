import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, CheckCircle, Send, X, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { DepartmentType, UrgencyLevel, Complaint } from "../types";
import { DEPARTMENTS, getUrgencyBadge } from "../departmentUtils";

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    complaint: string;
    department: DepartmentType;
    urgency: UrgencyLevel;
    coach?: string;
    berth?: string;
    submissionType: "call_139";
  }) => void;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

const CALL_QUICK_PHRASES = [
  "Hello, the fan in coach B2 is completely dead and it is suffocating.",
  "Doctor needed urgently in Coach A1, passenger has severe breathing difficulty.",
  "Someone is smoking cigarettes inside coach S3 washroom.",
  "Washroom flush is leaking water all over the floor in S5.",
];

export const Call139Modal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [callState, setCallState] = useState<"dialing" | "connected" | "ended">("dialing");
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMicActive, setIsMicActive] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedComplaint, setDetectedComplaint] = useState<{
    complaint: string;
    department: DepartmentType;
    urgency: UrgencyLevel;
    coach?: string;
  } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle call connect & duration timer
  useEffect(() => {
    let connectTimer: any;
    let durationTimer: any;

    if (callState === "dialing") {
      connectTimer = setTimeout(() => {
        setCallState("connected");
        const welcomeText =
          "Namaste! You have reached Rail Madad 139 AI Helpline. Please tell me your railway grievance or coach problem.";
        setMessages([
          {
            id: "msg-1",
            sender: "ai",
            text: welcomeText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        speakText(welcomeText);
      }, 1800);
    } else if (callState === "connected") {
      durationTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearTimeout(connectTimer);
      clearInterval(durationTimer);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [callState]);

  // Voice synthesis helper
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = "en-IN"; // English (India)
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isAnalyzing) return;

    setUserInput("");
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai/call-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          history: messages.map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      if (!response.ok) throw new Error("Assistant failed");

      const data = await response.json();
      const aiReply =
        data.reply ||
        "I have noted your complaint. Forwarding this to our railway maintenance team immediately.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiReply);

      if (data.detectedComplaint) {
        setDetectedComplaint({
          complaint: data.detectedComplaint.complaint,
          department: data.detectedComplaint.department,
          urgency: data.detectedComplaint.urgency,
          coach: text.match(/coach\s*([a-z0-9]+)/i)?.[1]?.toUpperCase() || "B2",
        });
      }
    } catch {
      // Local fallback for 139 dialogue
      const lower = text.toLowerCase();
      let dept: DepartmentType = "Electricity";
      let urgency: UrgencyLevel = "Medium";

      if (lower.includes("medical") || lower.includes("doctor") || lower.includes("breath")) {
        dept = "Medical";
        urgency = "High";
      } else if (lower.includes("toilet") || lower.includes("leak") || lower.includes("water") || lower.includes("clean")) {
        dept = "Cleanliness";
      } else if (lower.includes("smoke") || lower.includes("drunk")) {
        dept = "Smoking / Drunk";
      } else if (lower.includes("harass") || lower.includes("women")) {
        dept = "Women Safety";
        urgency = "High";
      }

      const reply = `I have understood your problem regarding "${text}". Dispatching this directly to the ${dept} Department with ${urgency} priority. An onboard railway team is being alerted.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      speakText(reply);

      setDetectedComplaint({
        complaint: text,
        department: dept,
        urgency,
        coach: text.match(/coach\s*([a-z0-9]+)/i)?.[1]?.toUpperCase() || "B2",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEndCallAndSubmit = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const finalComplaint = detectedComplaint?.complaint || messages.filter((m) => m.sender === "user").map((m) => m.text).join(". ") || "139 Call Assistance Request";
    const finalDept = detectedComplaint?.department || "Other";
    const finalUrgency = detectedComplaint?.urgency || "Medium";

    onSubmit({
      complaint: finalComplaint,
      department: finalDept,
      urgency: finalUrgency,
      coach: detectedComplaint?.coach || "B2",
      berth: "Call 139 Helpline",
      submissionType: "call_139",
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="call-139-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[600px] max-h-[92vh]">
        {/* Call Status Header */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">139 AI Helpline</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                  {callState === "dialing" ? "Connecting..." : "Live Call"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {callState === "dialing" ? "Establishing secure line..." : `Connected • ${formatTime(callDuration)}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic In-Call Avatar & Wave Animation */}
        <div className="px-6 py-3 bg-gradient-to-b from-slate-950/40 to-slate-900 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {isSpeaking && (
                <div className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping" />
              )}
              <div className="w-9 h-9 rounded-full bg-blue-900/60 border border-blue-400 flex items-center justify-center text-sm">
                🚆
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Rail Madad AI Voice</span>
              <span className="text-[11px] text-slate-400">
                {isSpeaking ? "Speaking through call audio..." : "Listening to passenger..."}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-end h-5 gap-1">
              {[40, 75, 50, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isSpeaking ? "bg-blue-400 animate-pulse" : "bg-slate-700"
                  }`}
                  style={{ height: isSpeaking ? `${h}%` : "30%" }}
                />
              ))}
            </div>
            <Volume2 className={`w-4 h-4 ${isSpeaking ? "text-blue-400" : "text-slate-500"}`} />
          </div>
        </div>

        {/* Live Call Conversation Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/90 text-xs">
          {callState === "dialing" ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
                <Phone className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Dialing 139 Toll-Free...</p>
                <p className="text-slate-500 text-[11px] mt-1">
                  Connecting to Rail Madad Automated Emergency Assistance
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <span className="text-[10px] opacity-60 mt-1 block text-right">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex items-center space-x-2 text-slate-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI assistant is processing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Real-time AI routing badge during call */}
        {detectedComplaint && (
          <div className="mx-4 mb-2 p-2.5 rounded-xl bg-blue-950/70 border border-blue-500/40 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-blue-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Auto-Detected:</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getUrgencyBadge(detectedComplaint.urgency).classes}`}>
                {detectedComplaint.urgency} Urgency
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="text-slate-300 truncate font-medium">"{detectedComplaint.complaint}"</span>
              <span className="shrink-0 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-500/30">
                {detectedComplaint.department}
              </span>
            </div>
          </div>
        )}

        {/* Call Quick Phrases */}
        {callState === "connected" && (
          <div className="px-4 py-1.5 bg-slate-950/40 border-t border-slate-800">
            <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {CALL_QUICK_PHRASES.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(phrase)}
                  className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer text-left whitespace-nowrap"
                >
                  "{phrase.slice(0, 32)}..."
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In-Call Controls & Input */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Speak or type your railway problem to the AI..."
              disabled={callState !== "connected" || isAnalyzing}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || callState !== "connected" || isAnalyzing}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* End Call & Register button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel Call
            </button>

            <button
              id="end-call-dispatch-btn"
              type="button"
              onClick={handleEndCallAndSubmit}
              disabled={callState === "dialing" || messages.length <= 1}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call & Send Complaint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
