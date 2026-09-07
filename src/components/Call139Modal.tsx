import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle,
  Send,
  X,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { DepartmentType, UrgencyLevel, Complaint } from "../types";
import { DEPARTMENTS, getUrgencyBadge } from "../departmentUtils";
import { cleanDuplicateWordsAndPhrases } from "./VoiceComplaintModal";
import { AppLogo } from "./AppLogo";

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

const CALL_QUICK_OPTIONS: {
  label: string;
  phrase: string;
  dept: DepartmentType;
  urgency: UrgencyLevel;
  coach: string;
  emoji: string;
}[] = [
  {
    label: "Fan / AC Broken",
    phrase: "Hello, the fan and AC in coach B2 are not working, please send a technician.",
    dept: "Electricity",
    urgency: "Medium",
    coach: "B2",
    emoji: "⚡",
  },
  {
    label: "Medical Emergency",
    phrase: "Urgent! Passenger having severe dizziness and chest tightness in Coach A1.",
    dept: "Medical",
    urgency: "High",
    coach: "A1",
    emoji: "🏥",
  },
  {
    label: "Washroom Sanitation",
    phrase: "The bio-toilet in coach S4 is jammed with water leaking all over the floor.",
    dept: "Cleanliness",
    urgency: "Medium",
    coach: "S4",
    emoji: "🚾",
  },
  {
    label: "Smoking in Coach",
    phrase: "Passenger is smoking cigarettes in coach S2 near the doorway, causing nuisance.",
    dept: "Smoking / Drunk",
    urgency: "Medium",
    coach: "S2",
    emoji: "🚬",
  },
];

export const Call139Modal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [callState, setCallState] = useState<"dialing" | "connected" | "ended">("dialing");
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice recognition setup for in-call microphone
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i][0]?.transcript) {
            text += event.results[i][0].transcript + " ";
          }
        }
        const cleaned = cleanDuplicateWordsAndPhrases(text);
        if (cleaned) {
          setUserInput(cleaned);
          handleSendMessage(cleaned);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleCallMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // If browser mic permission failed, prompt user
          setIsListening(false);
        }
      }
    }
  };

  // Handle call connect & duration timer
  useEffect(() => {
    let connectTimer: any;
    let durationTimer: any;

    if (callState === "dialing") {
      connectTimer = setTimeout(() => {
        connectCall();
      }, 1400);
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

  const connectCall = () => {
    setCallState("connected");
    const welcomeText =
      "Namaste! You have reached Rail Madad 139 AI Helpline. Please state your railway complaint or select your issue.";
    setMessages([
      {
        id: "msg-1",
        sender: "ai",
        text: welcomeText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    speakText(welcomeText);
  };

  // Voice synthesis helper
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = "en-IN";
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
    setIsListening(false);

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
        const coachDetected =
          text.match(/coach\s*([a-z0-9]+)/i)?.[1]?.toUpperCase() ||
          text.match(/\b([abcehs]\d{1,2})\b/i)?.[1]?.toUpperCase() ||
          "B2";

        setDetectedComplaint({
          complaint: data.detectedComplaint.complaint || text,
          department: data.detectedComplaint.department || "Electricity",
          urgency: data.detectedComplaint.urgency || "Medium",
          coach: coachDetected,
        });
      }
    } catch {
      // Local fallback for 139 dialogue
      const lower = text.toLowerCase();
      let dept: DepartmentType = "Electricity";
      let urgency: UrgencyLevel = "Medium";

      if (lower.includes("medical") || lower.includes("doctor") || lower.includes("chest") || lower.includes("breath")) {
        dept = "Medical";
        urgency = "High";
      } else if (lower.includes("toilet") || lower.includes("leak") || lower.includes("water") || lower.includes("clean")) {
        dept = "Cleanliness";
      } else if (lower.includes("smoke") || lower.includes("drunk")) {
        dept = "Smoking / Drunk";
      } else if (lower.includes("harass") || lower.includes("women") || lower.includes("safety")) {
        dept = "Women Safety";
        urgency = "High";
      }

      const coachMatch =
        text.match(/coach\s*([a-z0-9]+)/i)?.[1]?.toUpperCase() ||
        text.match(/\b([abcehs]\d{1,2})\b/i)?.[1]?.toUpperCase() ||
        "B2";

      const reply = `Noted. I have logged your issue regarding "${text}". Routing this to the ${dept} Department with ${urgency} priority. Field staff is alerted.`;
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
        coach: coachMatch,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEndCallAndSubmit = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // If user has typed something that hasn't been sent yet, include it
    let finalComplaint = detectedComplaint?.complaint;
    if (!finalComplaint) {
      if (userInput.trim()) {
        finalComplaint = userInput.trim();
      } else {
        const userMsgs = messages.filter((m) => m.sender === "user");
        if (userMsgs.length > 0) {
          finalComplaint = userMsgs.map((m) => m.text).join(". ");
        } else {
          finalComplaint = "139 Call Helpline: Passenger requested onboard assistance.";
        }
      }
    }

    const finalDept = detectedComplaint?.department || "Electricity";
    const finalUrgency = detectedComplaint?.urgency || "Medium";
    const finalCoach = detectedComplaint?.coach || "B2";

    onSubmit({
      complaint: finalComplaint,
      department: finalDept,
      urgency: finalUrgency,
      coach: finalCoach,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[620px] max-h-[92vh]">
        {/* Call Status Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">139 AI Helpline</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                  {callState === "dialing" ? "Connecting..." : "Active Call"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {callState === "dialing"
                  ? "Establishing secure line to Indian Railways..."
                  : `Toll-Free Connected • ${formatTime(callDuration)}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic In-Call Audio Indicator */}
        <div className="px-5 py-2.5 bg-slate-950/60 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              {isSpeaking && (
                <div className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping" />
              )}
              <AppLogo size="sm" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 block leading-tight">
                Rail Madad AI Voice Operator
              </span>
              <span className="text-[10px] text-slate-400">
                {isSpeaking
                  ? "Speaking to passenger..."
                  : isListening
                  ? "Listening to your voice..."
                  : "Line connected • Speak or select option"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-end h-4 gap-0.5">
              {[40, 75, 50, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isSpeaking || isListening ? "bg-blue-400 animate-pulse" : "bg-slate-700"
                  }`}
                  style={{ height: isSpeaking || isListening ? `${h}%` : "30%" }}
                />
              ))}
            </div>
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-blue-400" : "text-slate-500"}`} />
          </div>
        </div>

        {/* Live Call Conversation Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/90 text-xs">
          {callState === "dialing" ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
                <Phone className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm">Dialing 139 Toll-Free...</p>
                <p className="text-slate-500 text-xs mt-1">
                  Connecting to Rail Madad Automated AI Operator
                </p>
              </div>
              <button
                onClick={connectCall}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                ⚡ Connect Instantly
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
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
                <div className="flex items-center space-x-2 text-slate-400 p-2 bg-slate-800/40 rounded-xl border border-slate-800 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>AI operator analyzing your complaint...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Real-time AI routing badge during call */}
        {detectedComplaint && (
          <div className="mx-4 mb-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Categorized & Ready for Dispatch:</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                  getUrgencyBadge(detectedComplaint.urgency).classes
                }`}
              >
                {detectedComplaint.urgency} Urgency
              </span>
            </div>
            <div className="flex items-center justify-between space-x-2 mt-1.5">
              <span className="text-slate-200 truncate font-medium">"{detectedComplaint.complaint}"</span>
              <span className="shrink-0 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                {detectedComplaint.department} • Coach {detectedComplaint.coach || "B2"}
              </span>
            </div>
          </div>
        )}

        {/* 1-Tap Quick Call Options */}
        {callState === "connected" && (
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              Quick 1-Tap Issue Options:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {CALL_QUICK_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(opt.phrase)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-blue-900/50 text-[11px] text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer text-left flex items-center gap-1.5 truncate"
                >
                  <span className="text-xs">{opt.emoji}</span>
                  <span className="truncate font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In-Call Controls: Microphone + Text Input + Send */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Real Mic Input Button for 139 Call */}
            <button
              id="call-mic-btn"
              type="button"
              onClick={toggleCallMic}
              disabled={callState !== "connected" || isAnalyzing}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                isListening
                  ? "bg-red-600 text-white border-red-500 animate-pulse shadow-md"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak into 139 Helpline"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              id="call-139-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Speak into mic or type your railway problem..."}
              disabled={callState !== "connected" || isAnalyzing}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />

            <button
              id="call-send-btn"
              type="submit"
              disabled={!userInput.trim() || callState !== "connected" || isAnalyzing}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Send to AI Assistant"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* End Call & Register button - FIXED: Never stuck or permanently disabled */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="end-call-dispatch-btn"
              type="button"
              onClick={handleEndCallAndSubmit}
              disabled={callState === "dialing"}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
            >
              <PhoneOff className="w-4 h-4" />
              <span>
                {detectedComplaint
                  ? `End Call & File (${detectedComplaint.department})`
                  : "End Call & Send Complaint"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
