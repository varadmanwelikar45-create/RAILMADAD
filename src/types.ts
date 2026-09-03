export type DepartmentType =
  | "Electricity"
  | "Cleanliness"
  | "Smoking / Drunk"
  | "Medical"
  | "Women Safety"
  | "Other";

export type UrgencyLevel = "Low" | "Medium" | "High";

export type ComplaintStatus = "Submitted" | "Assigned" | "In Progress" | "Resolved";

export interface AIAnalysis {
  complaint: string;
  department: DepartmentType;
  urgency: UrgencyLevel;
  reasoning?: string;
  source?: string;
}

export interface Complaint {
  id: string; // e.g., "1025"
  userId: string;
  userName: string;
  userPhone?: string;
  complaint: string;
  department: DepartmentType;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  submissionType: "text" | "image" | "voice" | "call_139";
  imageUrl?: string;
  coach?: string;
  berth?: string;
  pnr?: string;
  createdAt: string;
  updatedAt: string;
  assignedOfficerId?: string;
  officerNotes?: string;
  timeline: {
    status: ComplaintStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  role: "passenger" | "officer";
  employeeId?: string;
  assignedDepartment?: DepartmentType | "All";
}
