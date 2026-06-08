import { describe, expect, it, vi } from "vitest";

// `./items` imports `@/auth`, which pulls in next-auth's Next.js runtime —
// not resolvable in Vitest's node environment. Mock it so only the pure
// `updateItemSchema` (what this file actually tests) gets evaluated.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn() }));

const { updateItemSchema } = await import("./items");

const VALID_PAYLOAD = {
  title: "useDebounce Hook",
  description: "Debounce a rapidly changing value",
  content: "export function useDebounce() {}",
  url: null,
  language: "typescript",
  tags: ["react", "hooks"],
};

describe("updateItemSchema", () => {
  it("accepts a fully populated payload", () => {
    const result = updateItemSchema.safeParse(VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    const result = updateItemSchema.safeParse({
      ...VALID_PAYLOAD,
      description: null,
      content: null,
      language: null,
    });
    expect(result.success).toBe(true);
  });

  it("trims the title and rejects an empty one", () => {
    const trimmed = updateItemSchema.safeParse({ ...VALID_PAYLOAD, title: "  Hi  " });
    expect(trimmed.success).toBe(true);
    if (trimmed.success) expect(trimmed.data.title).toBe("Hi");

    const empty = updateItemSchema.safeParse({ ...VALID_PAYLOAD, title: "   " });
    expect(empty.success).toBe(false);
  });

  it("requires url to be a valid URL when not null", () => {
    const valid = updateItemSchema.safeParse({ ...VALID_PAYLOAD, url: "https://example.com" });
    expect(valid.success).toBe(true);

    const invalid = updateItemSchema.safeParse({ ...VALID_PAYLOAD, url: "not-a-url" });
    expect(invalid.success).toBe(false);
  });

  it("rejects empty strings in the tags array", () => {
    const result = updateItemSchema.safeParse({ ...VALID_PAYLOAD, tags: ["react", "  "] });
    expect(result.success).toBe(false);
  });

  it("trims tag names", () => {
    const result = updateItemSchema.safeParse({ ...VALID_PAYLOAD, tags: [" react ", "hooks"] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(["react", "hooks"]);
  });

  it("accepts an empty tags array", () => {
    const result = updateItemSchema.safeParse({ ...VALID_PAYLOAD, tags: [] });
    expect(result.success).toBe(true);
  });
});
