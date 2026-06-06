import Image from "next/image";

import { cn } from "@/lib/utils";

// Derive up to two uppercase initials from a name ("Brad Traversy" → "BT").
// Falls back to "?" when there's nothing usable.
export function initialsFromName(name?: string | null) {
  if (!name) return "?";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "?";
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  // Rendered pixel size (width === height). Defaults to 36px (size-9).
  size?: number;
  className?: string;
}

// Reusable avatar: shows the user's GitHub image when present, otherwise a
// circular initials fallback derived from the name.
export function UserAvatar({
  name,
  image,
  size = 36,
  className,
}: UserAvatarProps) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initialsFromName(name)}
    </span>
  );
}
