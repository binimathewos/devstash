import { describe, expect, it } from "vitest";
import { Code, File } from "lucide-react";
import { typeIcon, typeSlug } from "./type-icons";

describe("typeIcon", () => {
  it("resolves a known icon name to its component", () => {
    expect(typeIcon("Code")).toBe(Code);
  });

  it("falls back to the generic file icon for unknown names", () => {
    expect(typeIcon("NotARealIcon")).toBe(File);
  });
});

describe("typeSlug", () => {
  it("lowercases the type name into a route slug", () => {
    expect(typeSlug("Snippets")).toBe("snippets");
  });
});
