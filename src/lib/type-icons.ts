import {
  Code,
  File,
  FileText,
  Image,
  Link as LinkIcon,
  type LucideIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

// Maps the lucide icon names stored in the DB / mock data to their components.
// Keeps things type-safe instead of indexing the whole lucide export.
export const TYPE_ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  FileText,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

// Falls back to a generic file icon for unknown type names.
export function typeIcon(iconName: string): LucideIcon {
  return TYPE_ICONS[iconName] ?? File;
}

// Turns a type name ("Snippets") into its route slug ("snippets").
export function typeSlug(name: string) {
  return name.toLowerCase();
}
