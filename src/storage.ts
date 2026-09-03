import { Complaint, UserProfile } from "./types";

const STORAGE_KEY_COMPLAINTS = "rail_madad_complaints_v1";
const STORAGE_KEY_CURRENT_USER = "rail_madad_current_user_v1";

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "1025",
    userId: "user_default",
    userName: "Rahul Sharma",
    userPhone: "+91 98765 43210",
    complaint: "Fan not working in Coach B2.",
    department: "Electricity",
    urgency: "Medium",
    status: "In Progress",
    submissionType: "text",
    coach: "B2",
    berth: "42",
    pnr: "2847193012",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    assignedOfficerId: "EMP-4091",
    officerNotes: "Technician dispatched from upcoming junction",
    timeline: [
      {
        status: "Submitted",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        note: "Complaint received via Rail Madad AI text assistant",
      },
      {
        status: "Assigned",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        note: "Auto-routed to Electrical Dept (Officer EMP-4091)",
      },
      {
        status: "In Progress",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        note: "Onboard maintenance technician inspecting B2 fan regulators",
      },
    ],
  },
  {
    id: "1024",
    userId: "user_default",
    userName: "Pooja Verma",
    userPhone: "+91 94567 11223",
    complaint: "Bio-toilet flush jammed and water leakage in washroom coach S4.",
    department: "Cleanliness",
    urgency: "Medium",
    status: "Assigned",
    submissionType: "image",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    coach: "S4",
    berth: "Washroom Near Door",
    pnr: "4920194851",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    assignedOfficerId: "EMP-3012",
    timeline: [
      {
        status: "Submitted",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        note: "Photo complaint uploaded by passenger",
      },
      {
        status: "Assigned",
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        note: "Routed to On-Board Housekeeping Staff (OBHS)",
      },
    ],
  },
  {
    id: "1023",
    userId: "user_other",
    userName: "Amit Trivedi",
    userPhone: "+91 97112 88445",
    complaint: "Co-passenger feeling severe dizziness and chest tightness in coach A1.",
    department: "Medical",
    urgency: "High",
    status: "Submitted",
    submissionType: "call_139",
    coach: "A1",
    berth: "19",
    pnr: "8192304910",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timeline: [
      {
        status: "Submitted",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        note: "Logged via 139 AI Voice Helpline - Priority Alert dispatched",
      },
    ],
  },
  {
    id: "1022",
    userId: "user_default",
    userName: "Rahul Sharma",
    userPhone: "+91 98765 43210",
    complaint: "Co-passenger smoking cigarette in doorway near coach S2.",
    department: "Smoking / Drunk",
    urgency: "Medium",
    status: "Resolved",
    submissionType: "text",
    coach: "S2",
    berth: "Vestibule area",
    pnr: "2847193012",
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    assignedOfficerId: "EMP-8102",
    officerNotes: "RPF squad attended vestibule and passenger was fined under Section 167",
    timeline: [
      {
        status: "Submitted",
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        note: "Passenger reported illegal smoking",
      },
      {
        status: "Assigned",
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        note: "Assigned to RPF Onboard Escort",
      },
      {
        status: "In Progress",
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        note: "Sub-Inspector reaching Coach S2",
      },
      {
        status: "Resolved",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        note: "Issue attended, offender counseled and challaned",
      },
    ],
  },
];

export function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMPLAINTS;
  }
}

export function saveComplaints(complaints: Complaint[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
  } catch (err) {
    console.error("Failed to save complaints:", err);
  }
}

export function addComplaint(complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "timeline">): Complaint {
  const current = getStoredComplaints();
  // Compute next ID
  const numericIds = current.map((c) => parseInt(c.id, 10)).filter((n) => !isNaN(n));
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1025;
  const newId = String(maxId + 1);

  const now = new Date().toISOString();
  const created: Complaint = {
    ...complaint,
    id: newId,
    createdAt: now,
    updatedAt: now,
    status: "Submitted",
    timeline: [
      {
        status: "Submitted",
        timestamp: now,
        note: `Complaint filed via ${complaint.submissionType.toUpperCase().replace("_", " ")}`,
      },
      {
        status: "Assigned",
        timestamp: new Date(Date.now() + 1000).toISOString(),
        note: `AI routed immediately to ${complaint.department} Department`,
      },
    ],
  };

  // Automatically mark Assigned because AI immediately routed it
  created.status = "Assigned";

  const updated = [created, ...current];
  saveComplaints(updated);
  return created;
}

export function updateComplaintStatus(
  id: string,
  newStatus: "Assigned" | "In Progress" | "Resolved",
  officerId?: string,
  note?: string
): Complaint[] {
  const current = getStoredComplaints();
  const now = new Date().toISOString();

  const updated = current.map((comp) => {
    if (comp.id === id) {
      const defaultNote =
        newStatus === "In Progress"
          ? `Officer marked as In Progress. Field action underway.`
          : newStatus === "Resolved"
          ? `Officer marked as Resolved. Problem rectified.`
          : `Status updated to ${newStatus}.`;

      return {
        ...comp,
        status: newStatus,
        updatedAt: now,
        assignedOfficerId: officerId || comp.assignedOfficerId || "OFFICER",
        officerNotes: note || comp.officerNotes,
        timeline: [
          ...comp.timeline,
          {
            status: newStatus,
            timestamp: now,
            note: note || defaultNote,
          },
        ],
      };
    }
    return comp;
  });

  saveComplaints(updated);
  return updated;
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    }
  } catch (err) {
    console.error("Failed to save current user:", err);
  }
}
