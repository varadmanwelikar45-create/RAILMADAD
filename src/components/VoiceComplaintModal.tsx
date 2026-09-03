import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Send, X, Volume2, Play, Square, Loader2, RefreshCw } from "lucide-react";
import { DepartmentType, UrgencyLevel, AIAnalysis } from "../types";
import { DEPARTMENTS, getUrgencyBadge } from "../departmentUtils";

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    complaint: string;
    department: DepartmentType;
    urgency: UrgencyLevel;
    coach?: string;
    berth?: string;
    submissionType: "voice";
  }) => void;
}

const SAMPLE_VOICE_SCRIPTS = [
  {
    label: "Electricity issue",
    text: "Namaste, the AC cooling has stopped in coach B3 berth 18 and it is very hot.",
    coach: "B3",
    berth: "18",
  },
  {
    label: "Medical emergency",
    text: "Please send help, an elderly passenger in coach S2 seat 34 has severe chest pain.",
    coach: "S2",
    berth: "34",
  },
  {
    label: "Cleanliness complaint",
    text: "The washroom in coach S7 is dirty and the water tap is not working at all.",
    coach: "S7",
    berth: "Washroom",
  },
];

export const VoiceComplaintModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState<number[]>([10, 24, 45, 30, 60, 20, 15]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [coach, setCoach] = useState("B3");
  const [berth, setBerth] = useState("18");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // English (India) or Hindi

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + " ";
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
      };

      recognition.onend = () => {
        setIsRecording(false);
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

  // Animate audio waveform while recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 50) + 15,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 95) + 30,
          Math.floor(Math.random() * 60) + 20,
          Math.floor(Math.random() * 85) + 25,
          Math.floor(Math.random() * 40) + 10,
          Math.floor(Math.random() * 70) + 20,
        ]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
    } else {
      setTranscript("");
      setAnalysis(null);
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // If browser mic permission is blocked or iframe, simulate realistic speech entry
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    // If Web Speech API not available or blocked in container
    const sample = SAMPLE_VOICE_SCRIPTS[0];
    setTimeout(() => {
      setTranscript(sample.text);
      setCoach(sample.coach);
      setBerth(sample.berth);
      setIsRecording(false);
    }, 2500);
  };

  const handleProcessVoice = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Voice recording from passenger: "${transcript}". Coach: ${coach}, Berth: ${berth}`,
        }),
      });

      if (!response.ok) throw new Error("Voice analysis failed");

      const data = await response.json();
      setAnalysis({
        complaint: data.complaint || transcript,
        department: data.department || "Electricity",
        urgency: data.urgency || "Medium",
        reasoning: data.reasoning,
        source: data.source,
      });
    } catch {
      // Fallback
      const lower = transcript.toLowerCase();
      let department: DepartmentType = "Electricity";
      let urgency: UrgencyLevel = "Medium";

      if (lower.includes("medical") || lower.includes("chest") || lower.includes("doctor")) {
        department = "Medical";
        urgency = "High";
      } else if (lower.includes("toilet") || lower.includes("water") || lower.includes("clean")) {
        department = "Cleanliness";
      } else if (lower.includes("smoke") || lower.includes("drunk")) {
        department = "Smoking / Drunk";
      }

      setAnalysis({
        complaint: transcript,
        department,
        urgency,
        reasoning: "Voice transcript categorized by Rail Madad engine",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSubmit = () => {
    if (!analysis) return;
    onSubmit({
      complaint: analysis.complaint,
      department: analysis.department,
      urgency: analysis.urgency,
      coach: coach.trim() || undefined,
      berth: berth.trim() || undefined,
      submissionType: "voice",
    });
  };

  return (
    <div
      id="voice-complaint-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="navy-bg text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎙️</span>
            <div>
              <h3 className="font-bold text-base">Voice Complaint</h3>
              <p className="text-xs text-white/70">Speak naturally. AI converts speech & routes it.</p>
            </div>
          </div>
          <button
            id="close-voice-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Animated Microphone & Recording Studio */}
          <div className="flex flex-col items-center justify-center py-5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="relative mb-4">
              {isRecording && (
                <div className="absolute -inset-3 rounded-full bg-red-400/20 animate-ping" />
              )}
              <button
                id="mic-record-btn"
                type="button"
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white scale-105"
                    : "navy-bg hover:opacity-90 text-white"
                }`}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            {/* Audio Waveform visualization */}
            <div className="flex items-center justify-center gap-1.5 h-10 w-48 mb-2">
              {audioLevel.map((lvl, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-full transition-all duration-100 ${
                    isRecording ? "bg-red-500" : "bg-slate-300"
                  }`}
                  style={{ height: isRecording ? `${lvl}%` : "15%" }}
                />
              ))}
            </div>

            <p className="text-xs font-semibold text-slate-700">
              {isRecording ? "Listening... Speak your railway issue now" : "Tap microphone to start speaking"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports English, Hindi, and regional speech</p>
          </div>

          {/* Quick Voice Pre-sets for fast testing */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Or test with sample voice transcripts:
            </span>
            <div className="space-y-1.5">
              {SAMPLE_VOICE_SCRIPTS.map((script, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(script.text);
                    setCoach(script.coach);
                    setBerth(script.berth);
                    setAnalysis(null);
                  }}
                  className="w-full text-left p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-xs transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5 text-[#0B2447] shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-800">{script.label}: </span>
                    <span className="text-slate-600">"{script.text}"</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Speech Transcript Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Speech to Text Transcript
              </label>
              {transcript && (
                <button
                  type="button"
                  onClick={() => {
                    setTranscript("");
                    setAnalysis(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-red-600"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (analysis) setAnalysis(null);
              }}
              placeholder="Your spoken words will appear here in real time..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
            />
          </div>

          {/* Coach / Berth inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Coach</label>
              <input
                type="text"
                value={coach}
                onChange={(e) => setCoach(e.target.value.toUpperCase())}
                placeholder="e.g. B3"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Berth</label>
              <input
                type="text"
                value={berth}
                onChange={(e) => setBerth(e.target.value)}
                placeholder="e.g. 18"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
              />
            </div>
          </div>

          {/* AI Analysis Preview */}
          {analysis && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#002147]">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Speech Understanding</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-2">
                <div>
                  <span className="text-xs text-slate-400 block">Understood Problem:</span>
                  <p className="text-sm font-semibold text-[#002147]">{analysis.complaint}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Department:</span>
                    <span
                      className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        DEPARTMENTS[analysis.department]?.badgeColor || "bg-slate-100"
                      }`}
                    >
                      <span className="mr-1">{DEPARTMENTS[analysis.department]?.emoji}</span>
                      {analysis.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Urgency:</span>
                    <span
                      className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        getUrgencyBadge(analysis.urgency).classes
                      }`}
                    >
                      {analysis.urgency}
                    </span>
                  </div>
                </div>

                {analysis.reasoning && (
                  <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span className="font-medium">AI Reasoning:</span> {analysis.reasoning}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          {!analysis ? (
            <button
              type="button"
              disabled={!transcript.trim() || isProcessing}
              onClick={handleProcessVoice}
              className="btn-rounded navy-bg hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-5 transition-all cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing Audio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>AI Understand Voice</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="btn-rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Voice Complaint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
