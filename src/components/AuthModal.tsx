import React, { useState } from "react";
import { User, Shield, Mail, Lock, Phone, UserCheck, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { UserProfile, DepartmentType } from "../types";
import { DEPARTMENTS } from "../departmentUtils";

interface Props {
  initialRole: "passenger" | "officer";
  initialMode: "login" | "signup";
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<Props> = ({
  initialRole,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState<"passenger" | "officer">(initialRole);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // User fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // Officer fields
  const [employeeId, setEmployeeId] = useState("");
  const [officerPassword, setOfficerPassword] = useState("");
  const [assignedDept, setAssignedDept] = useState<DepartmentType | "All">("Electricity");

  // Fill demo shortcut
  const handleFillDemo = () => {
    if (role === "passenger") {
      setName("Rahul Sharma");
      setEmail("rahul.sharma@example.com");
      setMobile("9876543210");
      setUserPassword("railmadad123");
    } else {
      setEmployeeId("EMP-4091");
      setOfficerPassword("officer2026");
      setAssignedDept("Electricity");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "passenger") {
      const user: UserProfile = {
        name: name.trim() || "Passenger",
        email: email.trim() || "passenger@railways.gov.in",
        mobile: mobile.trim() || "9876543210",
        role: "passenger",
      };
      onSuccess(user);
    } else {
      const officer: UserProfile = {
        name: `Officer ${employeeId.trim() || "EMP-4091"}`,
        email: `${(employeeId.trim() || "officer").toLowerCase()}@railways.gov.in`,
        mobile: "011-2338-1234",
        role: "officer",
        employeeId: employeeId.trim() || "EMP-4091",
        assignedDepartment: assignedDept,
      };
      onSuccess(officer);
    }
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="navy-bg text-white px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🚆</span>
              <span className="font-bold text-sm tracking-wide">RAIL MADAD AI</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-1 rounded-full">
            <button
              type="button"
              id="auth-tab-passenger"
              onClick={() => setRole("passenger")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                role === "passenger"
                  ? "bg-white text-[#002147] shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>👤 User</span>
            </button>
            <button
              type="button"
              id="auth-tab-officer"
              onClick={() => setRole("officer")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                role === "officer"
                  ? "bg-white text-[#002147] shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>👮 Officer</span>
            </button>
          </div>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-slate-900">
              {role === "passenger"
                ? mode === "signup"
                  ? "Create User Account"
                  : "Passenger Login"
                : mode === "signup"
                ? "Create Officer Account"
                : "Officer Portal Login"}
            </h3>

            {/* Toggle Mode */}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
            >
              {mode === "login" ? "Need an account? Sign Up" : "Already have account? Login"}
            </button>
          </div>

          {/* User Fields */}
          {role === "passenger" ? (
            <>
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="user-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="user-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="user-mobile-input"
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="user-password-input"
                    type="password"
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Officer Fields */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Railway Employee ID
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="officer-id-input"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. EMP-4091"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Jurisdiction
                </label>
                <select
                  id="officer-dept-select"
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                >
                  <option value="All">All Departments (Senior Divisional Officer)</option>
                  <option value="Electricity">⚡ Electricity Department</option>
                  <option value="Cleanliness">🧹 Cleanliness & OBHS</option>
                  <option value="Smoking / Drunk">🚭 Smoking / Drunk RPF Unit</option>
                  <option value="Medical">🏥 Railway Medical Response</option>
                  <option value="Women Safety">🛡️ Women Safety / RPF Escort</option>
                  <option value="Other">📋 Other Commercial Grievances</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="officer-password-input"
                    type="password"
                    required
                    value={officerPassword}
                    onChange={(e) => setOfficerPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full btn-rounded navy-bg hover:opacity-90 text-white font-bold text-xs py-3 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>
              {role === "passenger"
                ? mode === "signup"
                  ? "Create Account & Enter Dashboard"
                  : "Login to User Dashboard"
                : mode === "signup"
                ? "Register Officer & Open Dashboard"
                : "Login to Officer Dashboard"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Pre-fill */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (role === "passenger") {
                  setName("Rahul Sharma");
                  setEmail("rahul.sharma@example.com");
                  setMobile("9876543210");
                } else {
                  setEmployeeId("EMP-4091");
                  setAssignedDept("Electricity");
                }
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 block text-center w-full"
            >
              Reset to demo credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
