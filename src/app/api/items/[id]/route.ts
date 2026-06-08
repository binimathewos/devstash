import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/items/[id] — full item detail for the item drawer, scoped to the
// signed-in user. Returns 404 (not 403) for items owned by someone else, so
// the response doesn't reveal whether the id exists at all.
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "You must be signed in." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const item = await getItemDetail(userId, id);
  if (!item) {
    return NextResponse.json(
      { success: false, error: "Item not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: item }, { status: 200 });
}
