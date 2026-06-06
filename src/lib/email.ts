import { Resend } from "resend";

// Lazily construct the Resend client so importing this module never throws at
// load time (e.g. in environments where email isn't configured). We fail loudly
// only when an email is actually sent without a key.
let resend: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  resend ??= new Resend(apiKey);
  return resend;
}

// Sender for transactional email. Resend's onboarding@resend.dev works without a
// verified domain in dev; override with a verified-domain sender in production.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";

// Absolute base URL for links embedded in emails. Defaults to localhost for dev.
export function getBaseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

interface SendVerificationEmailArgs {
  to: string;
  name: string | null;
  verifyUrl: string;
}

// Send the "confirm your email" message with the single-use verification link.
export async function sendVerificationEmail({
  to,
  name,
  verifyUrl,
}: SendVerificationEmailArgs) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 20px;">Verify your email</h1>
        <p>${greeting}</p>
        <p>Thanks for signing up for DevStash. Confirm your email address to activate your account and sign in.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; background: #6d28d9; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
            Verify email address
          </a>
        </p>
        <p style="color: #555; font-size: 14px;">Or paste this link into your browser:</p>
        <p style="color: #555; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
        <p style="color: #555; font-size: 14px;">This link expires in 24 hours. If you didn't create a DevStash account, you can ignore this email.</p>
      </div>
    `,
  });
}
