import { afterEach, describe, expect, it } from "vitest";
import { isEmailVerificationEnabled } from "./config";

describe("isEmailVerificationEnabled", () => {
  const ORIGINAL = process.env.EMAIL_VERIFICATION_ENABLED;

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.EMAIL_VERIFICATION_ENABLED;
    } else {
      process.env.EMAIL_VERIFICATION_ENABLED = ORIGINAL;
    }
  });

  it("is enabled only for the literal string 'true'", () => {
    process.env.EMAIL_VERIFICATION_ENABLED = "true";
    expect(isEmailVerificationEnabled()).toBe(true);
  });

  it("defaults to disabled when unset", () => {
    delete process.env.EMAIL_VERIFICATION_ENABLED;
    expect(isEmailVerificationEnabled()).toBe(false);
  });

  it("is disabled for any other value", () => {
    process.env.EMAIL_VERIFICATION_ENABLED = "1";
    expect(isEmailVerificationEnabled()).toBe(false);
  });
});
