import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/account — permanently delete the signed-in user's account.
// Deleting the User row cascades to their items, collections, tags, custom item
// types, sessions, and OAuth accounts (see onDelete: Cascade in schema.prisma).
// The client signs out afterward to clear the session JWT.
export async function DELETE() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in." },
        { status: 401 },
      );
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
