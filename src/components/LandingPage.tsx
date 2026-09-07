import React from "react";
import { User, Shield, ArrowRight, Sparkles, ChevronRight, Zap } from "lucide-react";
import { AppLogo } from "./AppLogo";

interface Props {
  onOpenAuth: (role: "passenger" | "officer", mode: "login" | "signup") => void;
}

export const LandingPage: React.FC<Props> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0B192C] flex flex-col justify-between">
      {/* Top Navigation Bar with New Logo and Colors */}
      <header className="bg-[#0A192F] text-white px-4 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center shadow-md sticky top-0 z-30 border-b border-slate-800">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <AppLogo size="md" showText={true} textLight={true} badgeText="AI HELP" />

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-user-login-btn"
              onClick={() => onOpenAuth("passenger", "login")}
              className="text-xs px-3.5 py-1.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
            >
              Passenger Login
            </button>
            <button
              id="header-officer-login-btn"
              onClick={() => onOpenAuth("officer", "login")}
              className="text-xs px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full transition-all font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Officer Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Action Cards */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Core Hero Headline */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex justify-center mb-4">
            <AppLogo size="xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B192C] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>AI-Driven Railway Grievance System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A192F] tracking-tight mb-3">
            Rail Madad AI
          </h1>

          <p className="text-lg sm:text-xl font-bold text-slate-700 mb-3">
            Report. AI Understands. Railway Responds.
          </p>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg mx-auto">
            Report your railway problem easily. AI understands your complaint and sends it to the right department.
          </p>
        </div>

        {/* Two Main Cards: User & Officer (Clean Minimalism Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full mb-10">
          {/* 👤 User Card */}
          <div
            id="card-user"
            className="card p-6 sm:p-8 flex flex-col justify-between border border-slate-100"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#002147] flex items-center justify-center mb-4 text-2xl">
                👤
              </div>
              <h2 className="text-xl font-bold text-[#002147] mb-1.5 flex items-center">
                <span>Passenger Portal</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Traveling on a train? File issues via <strong>Text</strong>, <strong>Image</strong>, <strong>Voice</strong>, or <strong>AI Call 139</strong> and track live resolution.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="user-signup-btn"
                onClick={() => onOpenAuth("passenger", "signup")}
                className="btn-rounded navy-bg hover:opacity-90 text-white w-full text-sm font-bold shadow-sm transition-all"
              >
                <span>Create Passenger Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5 inline" />
              </button>

              <button
                id="user-login-btn"
                onClick={() => onOpenAuth("passenger", "login")}
                className="btn-rounded bg-slate-100 hover:bg-slate-200 text-[#002147] w-full text-xs sm:text-sm font-semibold transition-all py-2.5"
              >
                Already registered? Login
              </button>
            </div>
          </div>

          {/* 👮 Officer Card */}
          <div
            id="card-officer"
            className="card p-6 sm:p-8 flex flex-col justify-between border border-slate-100"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-4 text-2xl">
                👮
              </div>
              <h2 className="text-xl font-bold text-[#002147] mb-1.5 flex items-center">
                <span>Railway Staff Portal</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Railway department personnel and on-board staff. View AI-routed complaints and update status in real time.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="officer-signup-btn"
                onClick={() => onOpenAuth("officer", "signup")}
                className="btn-rounded navy-bg hover:opacity-90 text-white w-full text-sm font-bold shadow-sm transition-all"
              >
                <span>Create Staff Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5 inline" />
              </button>

              <button
                id="officer-login-btn"
                onClick={() => onOpenAuth("officer", "login")}
                className="btn-rounded bg-slate-100 hover:bg-slate-200 text-[#002147] w-full text-xs sm:text-sm font-semibold transition-all py-2.5"
              >
                Staff Login with Employee ID
              </button>
            </div>
          </div>
        </div>

        {/* Main Flow Diagram */}
        <div className="max-w-3xl mx-auto w-full card p-6 border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
            How Rail Madad AI Works
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-2xl block mb-1">👤</span>
              <span className="text-xs font-bold text-[#002147] block">Passenger</span>
              <span className="text-[10px] text-slate-500">Files issue</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-2xl block mb-1">📝</span>
              <span className="text-xs font-bold text-[#002147] block">Complaint</span>
              <span className="text-[10px] text-slate-500">Text/Pic/Voice/139</span>
            </div>

            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
              <span className="text-2xl block mb-1">🧠</span>
              <span className="text-xs font-bold text-[#002147] block">AI Engine</span>
              <span className="text-[10px] text-orange-700 font-semibold">Understands</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-2xl block mb-1">⚡</span>
              <span className="text-xs font-bold text-[#002147] block">Department</span>
              <span className="text-[10px] text-slate-500">Auto-routes</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-2xl block mb-1">👮</span>
              <span className="text-xs font-bold text-[#002147] block">Officer</span>
              <span className="text-[10px] text-slate-500">Resolves</span>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>Rail Madad AI • Indian Railways Grievance Redressal</p>
      </footer>
    </div>
  );
};

