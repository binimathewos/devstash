import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Formats an ISO date string ("2026-01-15") as a short label ("Jan 15").
// Parses the parts directly to avoid timezone shifts from `new Date()`.
export function formatShortDate(isoDate: string) {
  const [, month, day] = isoDate.split("-").map(Number);
  if (!month || !day) return isoDate;
  return `${MONTHS[month - 1]} ${day}`;
}
