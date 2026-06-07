// Runtime feature flags read from environment variables. Keeping them here
// gives the app a single source of truth so call sites can't drift.

// Whether new email/password registrations must confirm their email (via the
// Resend verification link) before they can sign in.
//
// Defaults to OFF when unset — the verification email can only be delivered to
// the Resend account owner until a sending domain is linked, so requiring it
// would lock most sign-ups out. Set EMAIL_VERIFICATION_ENABLED=true to turn the
// full verify-before-sign-in flow back on. GitHub OAuth is unaffected either way.
export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}
