"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { updateItem as updateItemQuery, type ItemDetail } from "@/lib/db/items";

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
  url: z.union([z.url("Must be a valid URL"), z.null()]),
  language: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1, "Tags cannot be empty")),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Updates an item's editable fields from the drawer's edit mode. Validates
// the payload with Zod (source of truth — the client only does basic UX
// guards), checks ownership via the session, and returns the refreshed
// ItemDetail so the drawer can re-render without a second fetch.
export async function updateItem(
  itemId: string,
  data: UpdateItemInput,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const updated = await updateItemQuery(userId, itemId, parsed.data);
  if (!updated) {
    return { success: false, error: "Item not found." };
  }

  return { success: true, data: updated };
}
