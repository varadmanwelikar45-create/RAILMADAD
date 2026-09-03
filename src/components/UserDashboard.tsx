import React from "react";
import { FileText, Camera, Mic, Phone, Eye, Shield, LogOut, Sparkles, CheckCircle, Clock } from "lucide-react";
import { Complaint, UserProfile } from "../types";
import { DEPARTMENTS, getStatusBadge, getUrgencyBadge } from "../departmentUtils";

interface Props {
  user: UserProfile;
  complaints: Complaint[];
  onOpenTextComplaint: () => void;
  onOpenImageComplaint: () => void;
  onOpenVoiceComplaint: () => void;
  onOpenCall139: () => void;
  onTrackComplaint: (complaint: Complaint) => void;
  onLogout: () => void;
}

export const UserDashboard: React.FC<Props> = ({
  user,
  complaints,
  onOpenTextComplaint,
  onOpenImageComplaint,
  onOpenVoiceComplaint,
  onOpenCall139,
  onTrackComplaint,
  onLogout,
}) => {
  // Only show complaints belonging to this passenger account
  const userComplaints = complaints.filter((c) => {
    // If logged in as the demo passenger Rahul Sharma, include pre-seeded demo complaints
    if (user.email === "rahul.sharma@example.com") {
      return (
        c.userId === "rahul.sharma@example.com" ||
        c.userId === "user_default" ||
        c.userName === "Rahul Sharma"
      );
    }
    // For registered passenger, strictly match their email, mobile, or assigned identifier
    return (
      c.userId === user.email ||
      (user.mobile && c.userPhone === user.mobile) ||
      (c.userName && c.userName.toLowerCase() === user.name.toLowerCase() && c.userId !== "user_default")
    );
  });

  // Compute user initials for avatar
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "PS";

  return (
    <div className="min-h-screen off-white navy-text flex flex-col">
      {/* Top Nav Bar (Clean Minimalism Navy Header) */}
      <header className="navy-bg text-white px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚆</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">RAIL MADAD AI</h1>
            <p className="text-xs opacity-70">Government of India • Ministry of Railways • Passenger Portal</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-sm font-semibold leading-tight">{user.name}</p>
            <p className="text-xs opacity-60">
              {user.mobile ? `+91 ${user.mobile}` : user.email}
            </p>
          </div>

          <div
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white shadow-inner"
            title={user.email}
          >
            {initials}
          </div>

          <button
            id="user-logout-btn"
            onClick={onLogout}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Grid Layout (Clean Minimalism: 12-Column Responsive Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): How can we help you + 4 Options + AI Engine Banner */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#002147] tracking-tight">
              How can we help you?
            </h2>
            <p className="text-slate-500 mb-6 text-sm sm:text-base">
              Report your problem instantly. AI will route it to the right department.
            </p>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 📝 Text Complaint */}
              <div
                id="report-option-text"
                onClick={onOpenTextComplaint}
                className="card p-6 border-2 border-transparent hover:border-blue-200 cursor-pointer flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-2xl transition-colors">
                  📝
                </div>
                <h3 className="font-bold text-[#002147] text-base group-hover:text-blue-900 transition-colors">
                  Text Complaint
                </h3>
                <p className="text-sm text-slate-500">
                  Type your problem in any language
                </p>
              </div>

              {/* 📷 Image Upload */}
              <div
                id="report-option-image"
                onClick={onOpenImageComplaint}
                className="card p-6 border-2 border-transparent hover:border-orange-200 cursor-pointer flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-100 rounded-full flex items-center justify-center text-2xl transition-colors">
                  📷
                </div>
                <h3 className="font-bold text-[#002147] text-base group-hover:text-orange-900 transition-colors">
                  Image Upload
                </h3>
                <p className="text-sm text-slate-500">
                  AI understands the photo of the issue
                </p>
              </div>

              {/* 🎤 Voice Message */}
              <div
                id="report-option-voice"
                onClick={onOpenVoiceComplaint}
                className="card p-6 border-2 border-transparent hover:border-green-200 cursor-pointer flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-full flex items-center justify-center text-2xl transition-colors">
                  🎤
                </div>
                <h3 className="font-bold text-[#002147] text-base group-hover:text-green-900 transition-colors">
                  Voice Message
                </h3>
                <p className="text-sm text-slate-500">
                  Speak your complaint naturally
                </p>
              </div>

              {/* 📞 AI Call Assistant */}
              <div
                id="report-option-call"
                onClick={onOpenCall139}
                className="card p-6 border-2 border-transparent hover:border-blue-200 cursor-pointer flex flex-col items-center text-center gap-3 bg-blue-50/30 group"
              >
                <div className="w-12 h-12 navy-bg text-white rounded-full flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  📞
                </div>
                <h3 className="font-bold text-[#002147] text-base">
                  AI Call Assistant
                </h3>
                <p className="text-sm text-slate-500">
                  Dial 139 to talk with Rail AI
                </p>
              </div>
            </div>
          </section>

          {/* AI Classification Engine Banner (Matching Design HTML & PRD) */}
          <section className="bg-white rounded-2xl p-6 border-l-4 border-orange-400 shadow-sm transition-shadow">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-500 block">
                  AI Classification Engine
                </span>
                <h3 className="text-lg font-bold text-[#002147]">
                  3-Point Automated Routing
                </h3>
              </div>
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span>REAL-TIME ENGINE ACTIVE</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-8 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">●</span>
                <span><strong>1. Complaint:</strong> Core issue extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-bold">●</span>
                <span><strong>2. Department:</strong> 6 Railway wings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">●</span>
                <span><strong>3. Urgency:</strong> Low / Med / High</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): My Complaints Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#002147]">My Complaints</h2>
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  {userComplaints.length} REGISTERED
                </span>
              </div>

              {userComplaints.length === 0 ? (
                <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 mb-6">
                  <p className="text-sm font-semibold text-slate-700">No active complaints</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select any of the 4 reporting options on the left to lodge a complaint.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {userComplaints.map((complaint) => {
                    const dept = DEPARTMENTS[complaint.department] || DEPARTMENTS.Other;
                    const statusBadge = getStatusBadge(complaint.status);
                    const urgency = getUrgencyBadge(complaint.urgency);

                    // Determine dot status style
                    const isResolved = complaint.status === "Resolved";
                    const isInProgress = complaint.status === "In Progress";
                    const isAssigned = complaint.status === "Assigned";

                    return (
                      <div
                        key={complaint.id}
                        id={`complaint-card-${complaint.id}`}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-all space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-400">#{complaint.id}</p>
                              <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${dept.badgeColor}`}>
                                {dept.emoji} {dept.name}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#002147] mt-1 line-clamp-2">
                              {complaint.complaint}
                            </h4>
                          </div>

                          <div
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap ${
                              isResolved
                                ? "bg-emerald-100 text-emerald-700"
                                : isInProgress
                                ? "bg-orange-100 text-orange-700"
                                : isAssigned
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {complaint.status}
                          </div>
                        </div>

                        {/* Minimalist 4-Stage Progress Tracker Indicator */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                          <div className="flex items-center gap-1.5 flex-1">
                            {/* Submitted */}
                            <div
                              className="status-dot status-resolved"
                              title="Submitted"
                            />
                            <div className={`h-1 flex-1 rounded-full ${isAssigned || isInProgress || isResolved ? "bg-emerald-400" : "bg-slate-200"}`} />

                            {/* Assigned */}
                            <div
                              className={`status-dot ${isAssigned || isInProgress || isResolved ? "status-resolved" : "status-submitted"}`}
                              title="Assigned"
                            />
                            <div className={`h-1 flex-1 rounded-full ${isInProgress || isResolved ? "bg-emerald-400" : "bg-slate-200"}`} />

                            {/* In Progress */}
                            <div
                              className={`status-dot ${isInProgress ? "status-progress" : isResolved ? "status-resolved" : "status-submitted"}`}
                              title="In Progress"
                            />
                            <div className={`h-1 flex-1 rounded-full ${isResolved ? "bg-emerald-400" : "bg-slate-200"}`} />

                            {/* Resolved */}
                            <div
                              className={`status-dot ${isResolved ? "status-resolved" : "status-submitted"}`}
                              title="Resolved"
                            />
                          </div>

                          <button
                            id={`track-btn-${complaint.id}`}
                            onClick={() => onTrackComplaint(complaint)}
                            className="px-3 py-1 bg-[#002147] hover:bg-[#001733] text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Track</span>
                          </button>
                        </div>

                        {complaint.coach && (
                          <p className="text-[10px] text-slate-400 italic">
                            Coach: {complaint.coach} {complaint.berth && `• Berth: ${complaint.berth}`} • {complaint.assignedOfficer || "Duty Staff"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Passenger Assistance Helpline Card */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full navy-bg text-white flex items-center justify-center text-lg shrink-0">
                  🛡️
                </div>
                <div>
                  <p className="text-xs font-bold text-[#002147]">24×7 Passenger Emergency</p>
                  <p className="text-[11px] text-slate-500">Security & Medical Railway Helpline: 139</p>
                </div>
              </div>
              <button
                id="passenger-call-139-action"
                onClick={onOpenCall139}
                className="btn-rounded navy-bg hover:opacity-90 text-white text-xs font-bold py-2 px-4 shrink-0 transition-all cursor-pointer"
              >
                Call 139
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

