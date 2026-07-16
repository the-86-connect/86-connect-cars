import { Resend } from "resend";

// ── Resend email client ──
// From: cars@the86connect.com (verified domain)
// Admin notifications go to: beijingbridgepath@gmail.com

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "cars@the86connect.com";
const ADMIN_EMAIL = "beijingbridgepath@gmail.com";

// Contact info used in email footers
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cars.the86connect.com";
const SUPPORT_EMAIL = "info@the86connect.com";
const SUPPORT_WHATSAPP = "+86 176 1153 3296";

export type QuoteEmailData = {
  name: string;
  email: string;
  whatsapp?: string;
  country?: string;
  vehicleBrand?: string;
  model?: string;
  budget?: string;
  message?: string;
  referenceImages?: string[];
};

// ── Shared layout ──

function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%);padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">86Connect Cars</h1>
              <p style="margin:4px 0 0;color:#fecaca;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Global Vehicle Sourcing</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0 0 8px;font-size:13px;color:#52525b;font-weight:600;">Need help? Reach out:</p>
              <p style="margin:0 0 4px;font-size:13px;color:#71717a;">Email: <a href="mailto:${SUPPORT_EMAIL}" style="color:#b91c1c;text-decoration:none;">${SUPPORT_EMAIL}</a></p>
              <p style="margin:0 0 12px;font-size:13px;color:#71717a;">WhatsApp: <a href="https://wa.me/8617611533296" style="color:#b91c1c;text-decoration:none;">${SUPPORT_WHATSAPP}</a></p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">© ${new Date().getFullYear()} Beijing BridgePath International Consulting Co., Ltd.<br>
              China's international dialing code is 86 — that's where we connect you.<br>
              <a href="${SITE_URL}" style="color:#a1a1aa;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── 1. Quote confirmation to user ──

export async function sendQuoteConfirmationEmail(to: string, q: QuoteEmailData): Promise<void> {
  const vehicle = [q.vehicleBrand, q.model].filter(Boolean).join(" ") || "a vehicle";
  const subject = `We received your quote request for ${vehicle}`;

  const body = `
    <h2 style="margin:0 0 12px;font-size:20px;color:#18181b;font-weight:700;">Hi ${q.name},</h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
      Thanks for your quote request for <strong style="color:#b91c1c;">${vehicle}</strong>.
      Our team will review your details and contact you within <strong>24 hours</strong> via WhatsApp or email.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:12px;padding:20px;margin:0 0 20px;border:1px solid #e4e4e7;">
      <tr><td style="font-size:13px;color:#71717a;padding:4px 0;">Vehicle</td><td style="font-size:13px;color:#18181b;font-weight:600;padding:4px 0;">${vehicle}</td></tr>
      ${q.budget ? `<tr><td style="font-size:13px;color:#71717a;padding:4px 0;">Budget</td><td style="font-size:13px;color:#18181b;font-weight:600;padding:4px 0;">${q.budget}</td></tr>` : ""}
      ${q.country ? `<tr><td style="font-size:13px;color:#71717a;padding:4px 0;">Country</td><td style="font-size:13px;color:#18181b;font-weight:600;padding:4px 0;">${q.country}</td></tr>` : ""}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#52525b;">
      In the meantime, feel free to browse our latest inventory or reach out directly on WhatsApp.
    </p>
    <p style="margin:16px 0 0;">
      <a href="${SITE_URL}/inventory" style="display:inline-block;background:#b91c1c;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">Browse Inventory</a>
    </p>
  `;

  const { error } = await resend.emails.send({
    from: `86Connect Cars <${FROM}>`,
    to,
    subject,
    html: emailShell(subject, body),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ── 2. Quote notification to admin ──

export async function sendQuoteNotificationEmail(q: QuoteEmailData): Promise<void> {
  const vehicle = [q.vehicleBrand, q.model].filter(Boolean).join(" ") || "—";
  const subject = `New Quote Submission — ${q.name} (${vehicle})`;
  const submittedAt = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const rows = [
    ["Name", q.name],
    ["Email", `<a href="mailto:${q.email}" style="color:#b91c1c;text-decoration:none;">${q.email}</a>`],
    ["WhatsApp", q.whatsapp || "—"],
    ["Country", q.country || "—"],
    ["Vehicle", vehicle],
    ["Budget", q.budget || "—"],
  ];

  const detailRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="font-size:13px;color:#71717a;padding:6px 0;width:120px;vertical-align:top;">${k}</td><td style="font-size:13px;color:#18181b;font-weight:600;padding:6px 0;">${v}</td></tr>`,
    )
    .join("");

  const messageBlock = q.message
    ? `<tr><td colspan="2" style="padding:16px 0 4px;"><p style="margin:0 0 6px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Message</p><div style="background:#fafafa;border-left:3px solid #b91c1c;padding:12px 16px;border-radius:6px;font-size:14px;line-height:1.6;color:#3f3f46;">${q.message.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</div></td></tr>`
    : "";

  const imagesBlock =
    q.referenceImages && q.referenceImages.length > 0
      ? `<tr><td colspan="2" style="padding:16px 0 4px;"><p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Reference Images (${q.referenceImages.length})</p>${q.referenceImages
          .map(
            (url) =>
              `<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;margin:0 8px 8px 0;"><img src="${url}" alt="Reference" style="width:96px;height:96px;object-fit:cover;border-radius:8px;border:1px solid #e4e4e7;"></a>`,
          )
          .join("")}</td></tr>`
      : "";

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;font-weight:700;">New Quote Submission</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#71717a;">Received ${submittedAt}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
      ${detailRows}
      ${messageBlock}
      ${imagesBlock}
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#52525b;">
      Review and manage all submissions in the <a href="${SITE_URL}/admin" style="color:#b91c1c;text-decoration:none;font-weight:600;">admin dashboard</a>.
    </p>
  `;

  const { error } = await resend.emails.send({
    from: `86Connect Cars <${FROM}>`,
    to: ADMIN_EMAIL,
    replyTo: q.email,
    subject,
    html: emailShell(subject, body),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ── 3. Welcome email to new user ──

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const firstName = name.split(" ")[0] || name;
  const subject = `Welcome to 86Connect Cars, ${firstName}!`;

  const body = `
    <h2 style="margin:0 0 12px;font-size:20px;color:#18181b;font-weight:700;">Welcome, ${firstName}!</h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
      Your 86Connect Cars account is ready. You can now track your quote requests, save favorite vehicles, and access exclusive inventory updates.
    </p>
    <div style="background:#fafafa;border-radius:12px;padding:20px;margin:0 0 20px;border:1px solid #e4e4e7;">
      <p style="margin:0 0 12px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Get started</p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#3f3f46;">
        <a href="${SITE_URL}/inventory" style="color:#b91c1c;text-decoration:none;font-weight:600;">Browse our inventory</a> — explore vehicles from BYD, Toyota, Geely, and more.
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#3f3f46;">
        <a href="${SITE_URL}/#contact" style="color:#b91c1c;text-decoration:none;font-weight:600;">Request a quote</a> — tell us what you're looking for and our team will respond within 24 hours.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46;">
        <a href="${SITE_URL}/account" style="color:#b91c1c;text-decoration:none;font-weight:600;">View your account</a> — manage your profile, favorites, and submissions.
      </p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#52525b;">
      Questions? Reply to this email or message us on WhatsApp — we're here to help you find the right vehicle.
    </p>
  `;

  const { error } = await resend.emails.send({
    from: `86Connect Cars <${FROM}>`,
    to,
    subject,
    html: emailShell(subject, body),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}
