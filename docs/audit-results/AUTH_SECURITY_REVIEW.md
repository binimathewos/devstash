# DevStash Auth Security Review

**Last audited:** 2026-06-06

## Scope

This review covers the authentication and account-management layer of DevStash:
`src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`, `src/lib/verification.ts`,
`src/lib/email.ts`, `src/lib/config.ts`, `src/lib/session.ts`, `src/lib/prisma.ts`,
the custom API routes `src/app/api/auth/{register,verify-email,resend-verification,
forgot-password,reset-password}/route.ts` and `src/app/api/account/{route,
change-password/route}.ts`, `src/app/profile/page.tsx`, `src/lib/db/users.ts`
(plus `src/lib/db/items.ts`/`collections.ts` for ownership-scoping spot checks),
`prisma/schema.prisma`, `.env.example`, and `.gitignore`. The review focuses on
areas NextAuth v5 does not handle automatically — password hashing, custom-route
rate limiting, verification/reset token generation and lifecycle, account
enumeration, email-verification enforcement, and ownership scoping on
profile/account endpoints — and explicitly excludes CSRF, cookie flags, OAuth
state/PKCE, and JWT signing, which are managed by NextAuth/Auth.js.

## Summary

- Critical: 0
- High: 0
- Medium: 1
- Low: 1

No critical or high-severity issues were found. One systemic medium-severity gap
(no rate limiting on credential/token endpoints) and one low-severity hardening
item (missing password max-length vs. bcrypt's 72-byte truncation) were
identified. Everything else reviewed — hashing cost, token entropy/expiry/
single-use semantics, enumeration resistance, verification enforcement, and
ownership scoping on `/api/account/*` — is implemented correctly.

## Findings

### [Medium] No rate limiting / throttling on credential and token endpoints
- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/resend-verification/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/account/change-password/route.ts`, and the Credentials `authorize` in `src/auth.ts`
- **Lines:** `register/route.ts` 13-123; `forgot-password/route.ts` 8-44; `resend-verification/route.ts` 8-38; `reset-password/route.ts` 9-73; `change-password/route.ts` 13-89; `auth.ts` 36-72
- **Issue:** None of these custom endpoints — credentials sign-in (`authorize`), self-registration, forgot-password, resend-verification, reset-password, or change-password — apply any per-IP or per-account throttling. NextAuth v5 does not provide rate limiting for Credentials `authorize` or for hand-rolled API routes, so this is a real, present gap the project must own. Concretely this allows: unbounded password-guessing against `authorize` (bcrypt is slow but still brute-forceable at scale with no lockout), unlimited account-creation/spam via `register`, repeated triggering of password-reset/verification emails (cost + potential Resend-quota abuse) via `forgot-password`/`resend-verification`, and unlimited guesses against the `currentPassword` check in `change-password` once a session is held.
- **Fix:** Add a shared rate-limiting utility (e.g. `src/lib/rate-limit.ts` using Redis — already in the planned stack per `context/project-overview.md` — or an in-memory/IP+identifier sliding-window limiter for dev) and apply it at the top of each route handler and inside `authorize`, returning the existing `{ success: false, error }` shape with status 429 on the limited path, e.g.:
  ```ts
  const limited = await checkRateLimit(`forgot-password:${normalizedEmail}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (limited) {
    return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }
  ```
  Key the limiter by a combination of IP and the submitted identifier (email) so a single attacker can't bypass it by rotating emails, and apply a coarser IP-only limit to `register`/`authorize` to blunt credential stuffing.

### [Low] No password maximum length enforced (bcrypt 72-byte truncation)
- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/account/change-password/route.ts`
- **Lines:** `register/route.ts` 47-55 / 74; `reset-password/route.ts` 25-33 / 42; `change-password/route.ts` 38-46 / 75
- **Issue:** Each of these routes validates a *minimum* password length (`MIN_PASSWORD_LENGTH = 8`) but never an upper bound before calling `bcrypt.hash`. `bcryptjs` silently truncates input at 72 bytes, so two different passwords that share the same first 72 bytes hash identically and a user who believes they set a long passphrase is actually protected by only its first 72 bytes. This is a low-impact correctness/UX issue rather than a directly exploitable one (an attacker would need to already know ~72 bytes of the victim's password to exploit the collision), but it is genuinely present and worth closing given the project explicitly tracks bcrypt as its hashing mechanism.
- **Fix:** Add a `MAX_PASSWORD_LENGTH` (e.g. 72) check alongside the existing `MIN_PASSWORD_LENGTH` check in all three routes, returning the same `{ success: false, error }` 400 shape:
  ```ts
  const MAX_PASSWORD_LENGTH = 72;
  if (password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }
  ```

## Passed Checks

- **Hashing cost correct everywhere:** `bcrypt.hash(password, 12)` is used consistently in `register/route.ts:74`, `reset-password/route.ts:42`, and `change-password/route.ts:75` — matching the project's documented standard of 12 rounds (verified against the seed script's stated approach). `authorize` in `auth.ts:49` and `change-password/route.ts:67` use `bcrypt.compare` for verification (never plaintext comparison).
- **No plaintext password exposure:** Passwords are never logged, echoed back in any response body, or stored unhashed. `register`'s success response (`auth.ts`/`register/route.ts:103-115`) returns only `id/name/email/verificationRequired/emailSent`; `getProfileUser` (`src/lib/db/users.ts:17-42`) selects the `password` column only to compute a boolean `hasPassword` and never returns the hash itself.
- **Tokens use a CSPRNG with strong entropy:** Both verification and reset tokens are generated via `randomBytes(32).toString("hex")` (`src/lib/verification.ts:34`, `:110`) — 256 bits of entropy, far beyond what's brute-forceable.
- **Tokens are single-use:** `verifyEmailToken` deletes the token row on every terminal outcome (verified, already-verified, expired, invalid-user) at `src/lib/verification.ts:67-69, 77-79, 84-86, 94-96`; `resetPasswordWithToken` deletes the reset token immediately after updating the password (`src/lib/verification.ts:172-174`). Prior tokens for the same identifier are also cleared on (re)issuance (`:37`, `:113`), so only the most recent link is ever valid.
- **Server-side expiry enforcement with correct TTLs:** Verification tokens use a 24h TTL (`TOKEN_TTL_MS`, `src/lib/verification.ts:11`) and reset tokens a 1h TTL (`RESET_TOKEN_TTL_MS`, `:14`), matching the documented design. Both `verifyEmailToken` (`:66`) and `checkPasswordResetToken` (`:140`) compare `record.expires < new Date()` server-side before acting, and clean up expired rows.
- **Verification and reset tokens are namespaced and cannot be cross-used:** Reset tokens are stored with a `reset:<email>` identifier (`RESET_IDENTIFIER_PREFIX`/`resetIdentifier`, `src/lib/verification.ts:20-24`) while verification tokens store the plain lowercased email; `checkPasswordResetToken` explicitly rejects any record whose identifier lacks the `reset:` prefix (`:136-138`), and a reset token routed through `verifyEmailToken` fails to resolve to a real user (its identifier `reset:<email>` never matches a `User.email`) and is simply discarded as invalid — neither flow can be used to satisfy the other.
- **Forgot-password and resend-verification are enumeration-safe:** Both routes always return `{ success: true }` with HTTP 200 regardless of whether the account exists, is OAuth-only, or is already verified (`forgot-password/route.ts:36`, `resend-verification/route.ts:30`), performing the actual send only inside a conditional (`user?.password` / `user?.password && !user.emailVerified`) whose outcome is never reflected in the response, including on email-send failure (caught and logged, not surfaced).
- **Sign-in does not leak which factor failed:** `authorize` (`src/auth.ts:36-72`) checks the password *before* checking verification status, and only throws `EmailNotVerifiedError` after `bcrypt.compare` succeeds — so a wrong-password attempt and an unverified-account attempt are indistinguishable to someone who doesn't already know the password.
- **Email verification enforcement is sound and toggle-safe:** `isEmailVerificationEnabled()` (`src/lib/config.ts:11-13`) defaults OFF (`=== "true"` check against an unset env var), and that single source of truth gates both `register` (creates `emailVerified: new Date()` immediately when off, `:84`) and `authorize` (only throws `EmailNotVerifiedError` when on, and backfills `emailVerified` for legacy unverified accounts when off, `auth.ts:56-64`). The backfill sits below the `!user?.password` early return, so GitHub/OAuth-only accounts (which have no `password`) never reach the verification check and are never wrongly forced through it.
- **All `/api/account/*` routes and the profile page derive identity from the session, never from the request:** `change-password/route.ts:15-22` and `account/route.ts:12-19` both call `auth()` and use `session.user.id` for every subsequent lookup/update/delete (`change-password/route.ts:55, 76-77`; `account/route.ts:21`); `profile/page.tsx:24` uses `requireUserId()`. No route reads an id from the request body, query string, or cookie other than the signed session JWT.
- **Change-password re-verifies the current password:** `change-password/route.ts:67-73` performs `bcrypt.compare(currentPassword, user.password)` and rejects with 400 before allowing the new password to be set, and correctly rejects OAuth-only accounts (`:57-65`, no `password` to change).
- **Account deletion is properly scoped and cascades safely:** `account/route.ts:21` performs `prisma.user.delete({ where: { id: userId } })` keyed only on the session id; `prisma/schema.prisma` defines `onDelete: Cascade` on `Account`, `Session`, `Item`, `ItemType` (user-owned only — system types have `userId: null`), `Collection`, and `Tag`, so deletion removes only the user's own data.
- **Input validation matches the project's standard on every custom mutation route:** `register`, `reset-password`, and `change-password` all check field presence/types, email format (`EMAIL_REGEX`), minimum password length (8), and password-confirmation match before touching the database, and every route (success and error paths) returns the `{ success, data?, error? }` shape with appropriate HTTP status codes (400 validation, 401 unauthenticated, 409 duplicate email, 200/201 success, 500 unexpected).
- **No mass-assignment risk:** Prisma `update`/`create` calls in the auth-related routes pass explicit, hand-built `data` objects (e.g. `{ password: hashedPassword }`, `{ emailVerified: new Date() }`) — never a spread of request-body content — so arbitrary-field writes are not possible.
- **`.env` is genuinely gitignored:** `.gitignore:34-35` contains `.env*` / `!.env.example`, confirming secrets are not tracked; `.env.example` documents only placeholder values (`RESEND_API_KEY="re_..."`, template `DATABASE_URL`, etc.) with no real credentials.
