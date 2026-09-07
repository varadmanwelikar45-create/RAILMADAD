import React, { useState } from "react";
import { Shield, CheckCircle, Clock, Check, User, ArrowLeft, LogOut, Filter, Sparkles, MessageSquare, AlertTriangle, Search, Zap } from "lucide-react";
import { Complaint, ComplaintStatus, DepartmentType, UserProfile } from "../types";
import { DEPARTMENTS, getUrgencyBadge, getStatusBadge } from "../departmentUtils";
import { AppLogo } from "./AppLogo";

interface Props {
  officer: UserProfile;
  complaints: Complaint[];
  onUpdateStatus: (id: string, newStatus: "Assigned" | "In Progress" | "Resolved", note?: string) => void;
  onLogout: () => void;
}

export const OfficerDashboard: React.FC<Props> = ({
  officer,
  complaints,
  onUpdateStatus,
  onLogout,
}) => {
  // Always default to "All" so all incoming complaints from passengers are immediately visible
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<DepartmentType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ComplaintStatus>("All");

  // Sort complaints newest first
  const sortedComplaints = [...complaints].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  // Filter complaints by department, status, and search query
  const filteredComplaints = sortedComplaints.filter((c) => {
    if (selectedDeptFilter !== "All" && c.department !== selectedDeptFilter) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (c.complaint || "").toLowerCase();
      const matchId = (c.id || "").toLowerCase();
      const matchCoach = (c.coach || "").toLowerCase();
      const matchUser = (c.userName || "").toLowerCase();
      const matchPnr = (c.pnr || "").toLowerCase();
      const matchDept = (c.department || "").toLowerCase();
      return matchText.includes(q) || matchId.includes(q) || matchCoach.includes(q) || matchUser.includes(q) || matchPnr.includes(q) || matchDept.includes(q);
    }
    return true;
  });

  // Calculate stats
  const newCount = complaints.filter(
    (c) => c.status === "Submitted" || c.status === "Assigned"
  ).length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0B192C] flex flex-col">
      {/* Officer Header with AppLogo and Refined Colors */}
      <header className="bg-[#0A192F] text-white px-4 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center shadow-md sticky top-0 z-30 border-b border-slate-800">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <AppLogo
            size="md"
            showText={true}
            textLight={true}
            subtext={`Wing: ${officer.assignedDepartment || "All Wings"} • ID: ${officer.employeeId || "STAFF-902"}`}
            badgeText="OFFICER PORTAL"
          />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-white border border-white/15">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{officer.name}</span>
            </div>
            <button
              id="officer-logout-btn"
              onClick={onLogout}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content (Matching PRD Section 10: Simple Officer Dashboard) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stats Summary Cards (Matching PRD Section 10 & Clean Minimalism card styling) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 text-center border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              New Complaints
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 my-1 block">
              {newCount}
            </span>
            <span className="text-xs text-slate-500">Awaiting Inspection</span>
          </div>

          <div className="card p-5 text-center border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 my-1 block">
              {inProgressCount}
            </span>
            <span className="text-xs text-slate-500">Staff Dispatched to Coach</span>
          </div>

          <div className="card p-5 text-center border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Resolved
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 my-1 block">
              {resolvedCount}
            </span>
            <span className="text-xs text-slate-500">Attended & Rectified</span>
          </div>
        </div>

        {/* Search Bar & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Complaint #, Coach (B2), PNR, Passenger, or keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden md:inline">Status:</span>
            {(["All", "Submitted", "Assigned", "In Progress", "Resolved"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "navy-bg text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="filter-dept-all"
            onClick={() => setSelectedDeptFilter("All")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedDeptFilter === "All"
                ? "navy-bg text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Wings ({complaints.length})
          </button>
          {Object.values(DEPARTMENTS).map((dept) => {
            const count = complaints.filter((c) => c.department === dept.name).length;
            const isSelected = selectedDeptFilter === dept.name;
            return (
              <button
                key={dept.name}
                id={`filter-dept-${dept.name.toLowerCase().replace(/[^a-z]/g, "")}`}
                onClick={() => setSelectedDeptFilter(dept.name)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "navy-bg text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{dept.emoji}</span>
                <span>{dept.name}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Complaints Feed */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="card p-12 text-center border border-slate-100">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-90" />
              <p className="text-lg font-bold text-[#002147]">No complaints found</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchQuery ? `No results matching "${searchQuery}".` : "All complaints in this filter have been processed."}
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => {
              const dept = DEPARTMENTS[complaint.department] || DEPARTMENTS.Other;
              const urgency = getUrgencyBadge(complaint.urgency);
              const statusBadge = getStatusBadge(complaint.status);
              const isRecent = (Date.now() - new Date(complaint.createdAt).getTime()) < 3600000;

              return (
                <div
                  key={complaint.id}
                  id={`officer-complaint-${complaint.id}`}
                  className="card p-6 border border-slate-100 space-y-4 transition-all hover:shadow-md"
                >
                  {/* Top Bar of Complaint */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-extrabold text-[#002147]">
                        Complaint #{complaint.id}
                      </span>

                      {isRecent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                          <Zap className="w-3 h-3 fill-white" /> NEW
                        </span>
                      )}

                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${dept.badgeColor}`}>
                        <span className="mr-1">{dept.emoji}</span>
                        {dept.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${urgency.classes}`}>
                        {complaint.urgency}
                      </span>

                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusBadge.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${statusBadge.dotColor}`} />
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Complaint Description & Metadata */}
                  <div className="space-y-3">
                    <p className="text-base font-bold text-[#002147] leading-relaxed">
                      "{complaint.complaint}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {complaint.coach && (
                        <span>
                          Coach: <strong className="text-slate-900">{complaint.coach}</strong>
                        </span>
                      )}
                      {complaint.berth && (
                        <span>
                          Berth: <strong className="text-slate-900">{complaint.berth}</strong>
                        </span>
                      )}
                      {complaint.pnr && (
                        <span>
                          PNR: <strong className="text-slate-900">{complaint.pnr}</strong>
                        </span>
                      )}
                      <span>
                        Passenger: <strong className="text-slate-900">{complaint.userName}</strong>
                      </span>
                      <span>
                        Mode:{" "}
                        <strong className="text-slate-900 uppercase">
                          {complaint.submissionType.replace("_", " ")}
                        </strong>
                      </span>
                    </div>

                    {/* Image if attached */}
                    {complaint.imageUrl && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-500 block mb-1">
                          Passenger Uploaded Photo:
                        </span>
                        <div className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={complaint.imageUrl}
                            alt="Complaint photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {complaint.officerNotes && (
                      <p className="text-xs text-blue-900 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                        <strong className="font-bold">Log:</strong> {complaint.officerNotes}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons (Matching PRD Section 7 & 10: [Accept] [In Progress] [Resolved]) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      Update resolution stage (synchronizes to passenger live):
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* [ Accept ] */}
                      <button
                        id={`btn-accept-${complaint.id}`}
                        onClick={() =>
                          onUpdateStatus(
                            complaint.id,
                            "Assigned",
                            `Accepted by Officer ${officer.employeeId || "EMP-4091"}`
                          )
                        }
                        disabled={complaint.status === "Assigned"}
                        className={`btn-rounded text-xs font-bold transition-all py-1.5 px-4 cursor-pointer ${
                          complaint.status === "Assigned"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200 opacity-90 cursor-default"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        [ Accept ]
                      </button>

                      {/* [ In Progress ] */}
                      <button
                        id={`btn-progress-${complaint.id}`}
                        onClick={() =>
                          onUpdateStatus(
                            complaint.id,
                            "In Progress",
                            `Staff dispatched to Coach ${complaint.coach || "B2"}`
                          )
                        }
                        disabled={complaint.status === "In Progress"}
                        className={`btn-rounded text-xs font-bold transition-all py-1.5 px-4 cursor-pointer ${
                          complaint.status === "In Progress"
                            ? "bg-blue-600 text-white shadow-xs cursor-default"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        [ In Progress ]
                      </button>

                      {/* [ Resolved ] */}
                      <button
                        id={`btn-resolved-${complaint.id}`}
                        onClick={() =>
                          onUpdateStatus(
                            complaint.id,
                            "Resolved",
                            `Issue attended and resolved by Railway team`
                          )
                        }
                        disabled={complaint.status === "Resolved"}
                        className={`btn-rounded text-xs font-bold transition-all py-1.5 px-4 cursor-pointer ${
                          complaint.status === "Resolved"
                            ? "bg-emerald-600 text-white shadow-xs cursor-default"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        [ Resolved ]
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

