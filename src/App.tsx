import React, { useState, useEffect } from "react";
import { Complaint, UserProfile, DepartmentType, UrgencyLevel } from "./types";
import {
  getStoredComplaints,
  saveComplaints,
  addComplaint,
  updateComplaintStatus,
  getStoredUser,
  saveCurrentUser,
} from "./storage";
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { UserDashboard } from "./components/UserDashboard";
import { OfficerDashboard } from "./components/OfficerDashboard";
import { TextComplaintModal } from "./components/TextComplaintModal";
import { ImageComplaintModal } from "./components/ImageComplaintModal";
import { VoiceComplaintModal } from "./components/VoiceComplaintModal";
import { Call139Modal } from "./components/Call139Modal";
import { ComplaintTrackerModal } from "./components/ComplaintTrackerModal";
import { CheckCircle2, Sparkles, X } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [complaints, setComplaints] = useState<Complaint[]>(() => getStoredComplaints());

  // Modal controls
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    role: "passenger" | "officer";
    mode: "login" | "signup";
  }>({
    isOpen: false,
    role: "passenger",
    mode: "signup",
  });

  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCall139Open, setIsCall139Open] = useState(false);
  const [trackingComplaint, setTrackingComplaint] = useState<Complaint | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if another tab or event modifies it
  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4500);
  };

  // Auth Handlers
  const handleOpenAuth = (role: "passenger" | "officer", mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, role, mode });
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
    showToast(`Welcome ${user.name}! Logged in successfully.`);
  };

  const handleQuickDemoLogin = (role: "passenger" | "officer") => {
    if (role === "passenger") {
      const demoUser: UserProfile = {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        mobile: "9876543210",
        role: "passenger",
      };
      setCurrentUser(demoUser);
      showToast("Logged in as Passenger (Rahul Sharma)");
    } else {
      const demoOfficer: UserProfile = {
        name: "Officer EMP-4091",
        email: "emp4091@railways.gov.in",
        mobile: "011-2338-1234",
        role: "officer",
        employeeId: "EMP-4091",
        assignedDepartment: "Electricity",
      };
      setCurrentUser(demoOfficer);
      showToast("Logged in as Railway Officer (EMP-4091)");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast("Logged out successfully.");
  };

  const handleSwitchRole = (newRole: "passenger" | "officer") => {
    if (newRole === "passenger") {
      setCurrentUser({
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        mobile: "9876543210",
        role: "passenger",
      });
      showToast("Switched to Passenger View");
    } else {
      setCurrentUser({
        name: "Officer EMP-4091",
        email: "emp4091@railways.gov.in",
        mobile: "011-2338-1234",
        role: "officer",
        employeeId: "EMP-4091",
        assignedDepartment: "Electricity",
      });
      showToast("Switched to Officer Portal");
    }
  };

  // Complaint Submission Handler
  const handleNewComplaint = (data: {
    complaint: string;
    department: DepartmentType;
    urgency: UrgencyLevel;
    submissionType: "text" | "image" | "voice" | "call_139";
    imageUrl?: string;
    coach?: string;
    berth?: string;
    pnr?: string;
  }) => {
    const created = addComplaint({
      userId: currentUser?.email || "user_default",
      userName: currentUser?.name || "Passenger",
      userPhone: currentUser?.mobile,
      complaint: data.complaint,
      department: data.department,
      urgency: data.urgency,
      status: "Submitted",
      submissionType: data.submissionType,
      imageUrl: data.imageUrl,
      coach: data.coach,
      berth: data.berth,
      pnr: data.pnr,
    });

    const updatedList = getStoredComplaints();
    setComplaints(updatedList);

    // Close any open modals
    setIsTextModalOpen(false);
    setIsImageModalOpen(false);
    setIsVoiceModalOpen(false);
    setIsCall139Open(false);

    showToast(
      `✓ Complaint #${created.id} registered & auto-routed to ${created.department} Department!`
    );

    // Promptly open tracker for the newly created complaint so passenger sees the status progression
    setTrackingComplaint(created);
  };

  // Officer Status Update Handler
  const handleUpdateComplaintStatus = (
    id: string,
    newStatus: "Assigned" | "In Progress" | "Resolved",
    note?: string
  ) => {
    const updated = updateComplaintStatus(
      id,
      newStatus,
      currentUser?.employeeId || "EMP-4091",
      note
    );
    setComplaints(updated);

    // If currently tracked modal is this complaint, keep it updated
    if (trackingComplaint && trackingComplaint.id === id) {
      const found = updated.find((c) => c.id === id);
      if (found) setTrackingComplaint(found);
    }

    showToast(`Complaint #${id} status updated to: ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Toast Message */}
      {toastMessage && (
        <div
          id="status-toast"
          className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-3"
        >
          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed flex-1">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white shrink-0 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main View Switcher */}
      {!currentUser ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onQuickDemoLogin={handleQuickDemoLogin}
        />
      ) : currentUser.role === "passenger" ? (
        <UserDashboard
          user={currentUser}
          complaints={complaints}
          onOpenTextComplaint={() => setIsTextModalOpen(true)}
          onOpenImageComplaint={() => setIsImageModalOpen(true)}
          onOpenVoiceComplaint={() => setIsVoiceModalOpen(true)}
          onOpenCall139={() => setIsCall139Open(true)}
          onTrackComplaint={(comp) => setTrackingComplaint(comp)}
          onSwitchToOfficer={() => handleSwitchRole("officer")}
          onLogout={handleLogout}
        />
      ) : (
        <OfficerDashboard
          officer={currentUser}
          complaints={complaints}
          onUpdateStatus={handleUpdateComplaintStatus}
          onSwitchToPassenger={() => handleSwitchRole("passenger")}
          onLogout={handleLogout}
        />
      )}

      {/* Modals */}
      {authModal.isOpen && (
        <AuthModal
          initialRole={authModal.role}
          initialMode={authModal.mode}
          onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={handleAuthSuccess}
        />
      )}

      {isTextModalOpen && (
        <TextComplaintModal
          onClose={() => setIsTextModalOpen(false)}
          onSubmit={handleNewComplaint}
        />
      )}

      {isImageModalOpen && (
        <ImageComplaintModal
          onClose={() => setIsImageModalOpen(false)}
          onSubmit={handleNewComplaint}
        />
      )}

      {isVoiceModalOpen && (
        <VoiceComplaintModal
          onClose={() => setIsVoiceModalOpen(false)}
          onSubmit={handleNewComplaint}
        />
      )}

      {isCall139Open && (
        <Call139Modal
          onClose={() => setIsCall139Open(false)}
          onSubmit={handleNewComplaint}
        />
      )}

      {trackingComplaint && (
        <ComplaintTrackerModal
          complaint={trackingComplaint}
          onClose={() => setTrackingComplaint(null)}
        />
      )}
    </div>
  );
}
