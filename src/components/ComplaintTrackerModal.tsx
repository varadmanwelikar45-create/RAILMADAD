import React from "react";
import { Check, Clock, AlertCircle, CheckCircle2, ArrowRight, X, Train, MapPin, Calendar, Shield } from "lucide-react";
import { Complaint, ComplaintStatus } from "../types";
import { DEPARTMENTS, getUrgencyBadge, getStatusBadge } from "../departmentUtils";

interface Props {
  complaint: Complaint;
  onClose: () => void;
}

const STAGES: { key: ComplaintStatus; label: string; description: string }[] = [
  { key: "Submitted", label: "Submitted", description: "Complaint received by Rail Madad AI" },
  { key: "Assigned", label: "Assigned", description: "AI assigned complaint to designated department" },
  { key: "In Progress", label: "In Progress", description: "Railway field staff attending problem" },
  { key: "Resolved", label: "Resolved", description: "Work completed & issue resolved" },
];

export const ComplaintTrackerModal: React.FC<Props> = ({ complaint, onClose }) => {
  const dept = DEPARTMENTS[complaint.department] || DEPARTMENTS.Other;
  const urgency = getUrgencyBadge(complaint.urgency);
  const statusBadge = getStatusBadge(complaint.status);

  const getStageState = (stageKey: ComplaintStatus) => {
    const order: ComplaintStatus[] = ["Submitted", "Assigned", "In Progress", "Resolved"];
    const currentIndex = order.indexOf(complaint.status);
    const stageIndex = order.indexOf(stageKey);

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) {
      return stageKey === "Resolved" ? "completed" : "current";
    }
    return "pending";
  };

  return (
    <div
      id="tracker-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="tracker-modal-card"
        className="w-full max-w-lg card bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="navy-bg text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚆</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Complaint #{complaint.id}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${urgency.classes}`}>
                  {urgency.label}
                </span>
              </div>
              <p className="text-xs text-white/70">Live Status & Railway Action Tracker</p>
            </div>
          </div>
          <button
            id="close-tracker-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Main Info Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${dept.badgeColor}`}>
                <span className="mr-1.5">{dept.emoji}</span>
                {dept.name} Department
              </span>
              <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border ${statusBadge.classes}`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${statusBadge.dotColor}`} />
                {statusBadge.label}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#002147] mt-2">
              "{complaint.complaint}"
            </p>

            {(complaint.coach || complaint.berth || complaint.pnr) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                {complaint.coach && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Coach: <strong className="text-slate-900">{complaint.coach}</strong>
                  </span>
                )}
                {complaint.berth && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Berth: <strong className="text-slate-900">{complaint.berth}</strong>
                  </span>
                )}
                {complaint.pnr && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    PNR: <strong className="text-slate-900">{complaint.pnr}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Minimalist 4-Stage Progress Tracker (Matching Clean Minimalism Design) */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Tracking Progress
            </h4>
            <div className="space-y-4 relative">
              {/* Connecting line */}
              <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-200 -z-0" />

              {STAGES.map((stage, idx) => {
                const state = getStageState(stage.key);
                return (
                  <div key={stage.key} className="flex items-start space-x-3.5 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        state === "completed"
                          ? "status-resolved text-white shadow-xs"
                          : state === "current"
                          ? "navy-bg text-white ring-4 ring-blue-100"
                          : "bg-white border-2 border-slate-300 text-slate-400"
                      }`}
                    >
                      {state === "completed" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : state === "current" ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="pt-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-semibold ${
                            state === "completed"
                              ? "text-emerald-700"
                              : state === "current"
                              ? "text-[#002147] font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {state === "completed" && "✓ "}
                          {state === "current" && "● "}
                          {state === "pending" && "○ "}
                          {stage.label}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline History */}
          {complaint.timeline && complaint.timeline.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Action Log & Updates
              </h4>
              <div className="space-y-2.5">
                {complaint.timeline.map((item, i) => (
                  <div key={i} className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-bold text-[#002147]">{item.status}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {complaint.officerNotes && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
              <span className="font-bold block mb-0.5">Railway Officer Note:</span>
              {complaint.officerNotes}
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            id="dismiss-tracker-btn"
            onClick={onClose}
            className="btn-rounded navy-bg hover:opacity-90 text-white text-xs font-bold transition-all py-2 px-5 cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

