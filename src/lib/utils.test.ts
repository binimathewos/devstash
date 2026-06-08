import { describe, expect, it } from "vitest";
import { cn, formatLongDate, formatShortDate } from "./utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-sm", false, null, undefined, "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatShortDate", () => {
  it("formats an ISO date as a short label", () => {
    expect(formatShortDate("2026-01-15")).toBe("Jan 15");
  });

  it("returns the input unchanged when it can't be parsed", () => {
    expect(formatShortDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatLongDate", () => {
  it("formats an ISO date with the year", () => {
    expect(formatLongDate("2026-01-15")).toBe("Jan 15, 2026");
  });

  it("returns the input unchanged when it can't be parsed", () => {
    expect(formatLongDate("not-a-date")).toBe("not-a-date");
  });
});
