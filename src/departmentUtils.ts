import { DepartmentType, UrgencyLevel, ComplaintStatus } from "./types";

export interface DepartmentInfo {
  name: DepartmentType;
  iconName: string;
  emoji: string;
  badgeColor: string;
  description: string;
}

export const DEPARTMENTS: Record<DepartmentType, DepartmentInfo> = {
  Electricity: {
    name: "Electricity",
    iconName: "Zap",
    emoji: "⚡",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Fans, lights, AC cooling, charging sockets, electrical short circuits",
  },
  Cleanliness: {
    name: "Cleanliness",
    iconName: "Sparkles",
    emoji: "🧹",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Bio-toilets, dirty coaches, overflowing bins, pests, washroom water",
  },
  "Smoking / Drunk": {
    name: "Smoking / Drunk",
    iconName: "CigaretteOff",
    emoji: "🚭",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
    description: "Illegal smoking in vestibules, alcohol consumption, intoxicated nuisance",
  },
  Medical: {
    name: "Medical",
    iconName: "HeartPulse",
    emoji: "🏥",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    description: "Emergency healthcare, severe illness, heart/chest pain, injuries",
  },
  "Women Safety": {
    name: "Women Safety",
    iconName: "ShieldAlert",
    emoji: "🛡️",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    description: "Female passenger safety, eve teasing, stalking, distress assistance",
  },
  Other: {
    name: "Other",
    iconName: "ClipboardList",
    emoji: "📋",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    description: "Pantry/catering, ticketing, delays, luggage, general assistance",
  },
};

export function getUrgencyBadge(urgency: UrgencyLevel) {
  switch (urgency) {
    case "High":
      return {
        label: "High Urgency",
        classes: "bg-red-100 text-red-700 border-red-200 font-medium",
        dotColor: "bg-red-500",
      };
    case "Medium":
      return {
        label: "Medium Urgency",
        classes: "bg-amber-100 text-amber-800 border-amber-200 font-medium",
        dotColor: "bg-amber-500",
      };
    case "Low":
    default:
      return {
        label: "Low Urgency",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-200 font-medium",
        dotColor: "bg-emerald-500",
      };
  }
}

export function getStatusBadge(status: ComplaintStatus) {
  switch (status) {
    case "Resolved":
      return {
        label: "Resolved",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-300",
        dotColor: "bg-emerald-500",
      };
    case "In Progress":
      return {
        label: "In Progress",
        classes: "bg-blue-50 text-blue-700 border-blue-300",
        dotColor: "bg-blue-500 animate-pulse",
      };
    case "Assigned":
      return {
        label: "Assigned",
        classes: "bg-indigo-50 text-indigo-700 border-indigo-300",
        dotColor: "bg-indigo-500",
      };
    case "Submitted":
    default:
      return {
        label: "Submitted",
        classes: "bg-slate-100 text-slate-700 border-slate-300",
        dotColor: "bg-slate-400",
      };
  }
}
