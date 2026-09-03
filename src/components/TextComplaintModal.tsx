import React, { useState } from "react";
import { FileText, Sparkles, Send, X, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { DepartmentType, UrgencyLevel, AIAnalysis, Complaint } from "../types";
import { DEPARTMENTS, getUrgencyBadge } from "../departmentUtils";

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    complaint: string;
    department: DepartmentType;
    urgency: UrgencyLevel;
    coach?: string;
    berth?: string;
    pnr?: string;
    submissionType: "text";
  }) => void;
}

const QUICK_SUGGESTIONS = [
  "Fan not working in Coach B2.",
  "Bio-toilet jammed and water leaking in Coach S4 washroom.",
  "Passenger smoking cigarette near coach door.",
  "Elderly passenger needs medical attention in A1.",
  "AC temperature is too warm and fan speed low in B1.",
];

export const TextComplaintModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [text, setText] = useState("");
  const [coach, setCoach] = useState("B2");
  const [berth, setBerth] = useState("42");
  const [pnr, setPnr] = useState("2847193012");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${text.trim()} (Coach: ${coach || "N/A"}, Berth: ${berth || "N/A"})`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const data = await response.json();
      setAnalysis({
        complaint: data.complaint || text,
        department: data.department || "Other",
        urgency: data.urgency || "Medium",
        reasoning: data.reasoning,
        source: data.source,
      });
    } catch {
      // Rule-based fallback
      const lower = text.toLowerCase();
      let department: DepartmentType = "Other";
      let urgency: UrgencyLevel = "Medium";

      if (lower.includes("fan") || lower.includes("ac") || lower.includes("light") || lower.includes("charging")) {
        department = "Electricity";
      } else if (lower.includes("toilet") || lower.includes("clean") || lower.includes("washroom") || lower.includes("dirty")) {
        department = "Cleanliness";
      } else if (lower.includes("smoke") || lower.includes("drunk") || lower.includes("alcohol")) {
        department = "Smoking / Drunk";
      } else if (lower.includes("medical") || lower.includes("doctor") || lower.includes("chest") || lower.includes("sick")) {
        department = "Medical";
        urgency = "High";
      } else if (lower.includes("women") || lower.includes("harass") || lower.includes("safety")) {
        department = "Women Safety";
        urgency = "High";
      }

      setAnalysis({
        complaint: text,
        department,
        urgency,
        reasoning: "Rule-based analysis engine assigned department automatically",
      });
    } finally {
      setIsAnalyzing(false);
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
      pnr: pnr.trim() || undefined,
      submissionType: "text",
    });
  };

  return (
    <div
      id="text-complaint-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="navy-bg text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="font-bold text-base">Text Complaint</h3>
              <p className="text-xs text-white/70">AI automatically detects department & urgency</p>
            </div>
          </div>
          <button
            id="close-text-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Coach & Berth details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Coach</label>
              <input
                id="coach-input"
                type="text"
                value={coach}
                onChange={(e) => setCoach(e.target.value.toUpperCase())}
                placeholder="e.g. B2"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Berth / Seat</label>
              <input
                id="berth-input"
                type="text"
                value={berth}
                onChange={(e) => setBerth(e.target.value)}
                placeholder="e.g. 42"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PNR (optional)</label>
              <input
                id="pnr-input"
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="10-digit PNR"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe your problem
            </label>
            <textarea
              id="complaint-textarea"
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (analysis) setAnalysis(null);
              }}
              placeholder="E.g., Fan not working in Coach B2, or Washroom tap leaking heavily..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1.5">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  id={`suggestion-${idx}`}
                  type="button"
                  onClick={() => {
                    setText(s);
                    if (analysis) setAnalysis(null);
                  }}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 border border-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI Analysis Result Card */}
          {analysis && (
            <div
              id="ai-analysis-preview"
              className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#002147]">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Automated Routing</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-2">
                <div>
                  <span className="text-xs text-slate-400 block">Problem:</span>
                  <p className="text-sm font-semibold text-[#002147]">{analysis.complaint}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Target Department:</span>
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
                    <span className="text-xs text-slate-400 block">Assigned Urgency:</span>
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
                    <span className="font-medium">Routing Logic:</span> {analysis.reasoning}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            id="cancel-text-modal"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          {!analysis ? (
            <button
              id="analyze-text-btn"
              type="button"
              disabled={!text.trim() || isAnalyzing}
              onClick={handleAnalyze}
              className="btn-rounded navy-bg hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-5 transition-all cursor-pointer flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Analyze with AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              id="submit-text-complaint-btn"
              type="button"
              onClick={handleConfirmSubmit}
              className="btn-rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Dispatch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
