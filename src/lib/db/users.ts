import { prisma } from "@/lib/prisma";

// The signed-in user's details for the profile page. `hasPassword` lets the UI
// show the change-password action only for email/password accounts (GitHub
// OAuth-only accounts have no password set).
export interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  hasPassword: boolean;
  createdAt: Date;
}

// Load the profile user. Returns null if the user no longer exists (e.g. the
// account was just deleted but the session JWT is still around).
export async function getProfileUser(
  userId: string,
): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: Boolean(user.password),
    createdAt: user.createdAt,
  };
}
