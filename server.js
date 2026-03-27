import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4000);
const DATA_DIR = path.join(__dirname, "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const isProduction = process.env.NODE_ENV === "production";
const APP_URL = process.env.APP_URL || "https://mbomsign.com";
const MAIL_FROM = process.env.MAIL_FROM || "MbomSign <noreply@mbomsign.com>";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

function smtpTransportOptions() {
  const port = SMTP_PORT;
  const implicitTls = port === 465;
  const secure =
    implicitTls ||
    (process.env.SMTP_SECURE === "true" && port !== 587 && port !== 2525);
  return {
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    requireTLS: !secure && port !== 25,
    tls: { minVersion: "TLSv1.2" },
  };
}

function hasSmtpConfig() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function buildWelcomeEmailHtml(recipientEmail) {
  const currentYear = new Date().getFullYear();
  return `
  <div style="margin:0;padding:0;background:#f3f6fc;font-family:'Plus Jakarta Sans',Inter,'Segoe UI',Arial,sans-serif;color:#334155;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f3f6fc;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe4f3;box-shadow:0 14px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(120deg,#0f235c,#162e78);">
                <img src="cid:mbomsignlogo" alt="MbomSign" style="display:block;width:168px;max-width:100%;border-radius:10px;background:#ffffff;padding:6px;" />
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 14px;">
                <h1 style="margin:0 0 10px;font-size:34px;line-height:1.12;letter-spacing:-0.02em;color:#0f172a;">Welcome to MbomSign</h1>
                <p style="margin:0 0 14px;color:#475569;font-size:16px;line-height:1.7;">
                  Thanks for joining our launch waitlist with <strong>${recipientEmail}</strong>.
                  MbomSign is the first Cameroonian all-in-one trust platform built with Nordic standards.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:14px 0 0;background:#f8faff;border:1px solid #d9e5ff;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px;color:#1e3a8a;font-size:14px;line-height:1.6;">
                      <strong>Notification policy:</strong> We will only email you when we go live or when there is an important change to our launch timeline.
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 12px;color:#0f172a;font-size:17px;line-height:1.5;font-weight:700;">
                  What our products do
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 10px;">
                  <tr>
                    <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.65;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#e0e7ff;color:#3730a3;font-weight:700;font-size:12px;margin-right:8px;">1</span>
                      <strong>Contract Signings:</strong> legally traceable e-signature workflows for agreements.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.65;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#e0e7ff;color:#3730a3;font-weight:700;font-size:12px;margin-right:8px;">2</span>
                      <strong>Identity Verification:</strong> confidence checks to reduce fraud and impersonation risk.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.65;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#e0e7ff;color:#3730a3;font-weight:700;font-size:12px;margin-right:8px;">3</span>
                      <strong>E-Invoicing:</strong> compliant digital invoicing and payment-ready records.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.65;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#e0e7ff;color:#3730a3;font-weight:700;font-size:12px;margin-right:8px;">4</span>
                      <strong>Smart Forms & Automation:</strong> automate repetitive approval and document tasks.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.65;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#e0e7ff;color:#3730a3;font-weight:700;font-size:12px;margin-right:8px;">5</span>
                      <strong>Document Certification:</strong> tamper-evident proof and trusted document authenticity.
                    </td>
                  </tr>
                </table>
                <p style="margin:14px 0 0;color:#0f172a;font-size:17px;line-height:1.5;font-weight:700;">
                  How MbomSign is secured
                </p>
                <ul style="padding-left:20px;margin:8px 0 18px;color:#475569;font-size:15px;line-height:1.8;">
                  <li>Strong encryption in transit and at rest.</li>
                  <li>Audit trails for key trust actions and signatures.</li>
                  <li>Secure-by-design architecture aligned with Nordic-grade reliability practices.</li>
                </ul>
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:10px;background:#1d4ed8;">
                      <a href="${APP_URL}" style="display:inline-block;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                        Visit MbomSign
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
                  You are receiving this because you subscribed on our coming-soon page.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;background:#f8fafc;">
                © ${currentYear} MbomSign. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

async function sendWelcomeEmail(recipientEmail) {
  if (!hasSmtpConfig()) {
    console.warn("SMTP not configured. Skipping welcome email.");
    return { sent: false, reason: "smtp_not_configured" };
  }

  const transporter = nodemailer.createTransport(smtpTransportOptions());

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: recipientEmail,
    subject: "Welcome to MbomSign - You are on the list",
    html: buildWelcomeEmailHtml(recipientEmail),
    attachments: [
      {
        filename: "mbomsign-logo.png",
        path: path.join(__dirname, "public", "mbomsign-logo.png"),
        cid: "mbomsignlogo",
      },
    ],
  });

  console.log("Welcome email delivered to SMTP provider:", {
    to: recipientEmail,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  return { sent: true };
}

async function ensureSubscribersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SUBSCRIBERS_FILE);
  } catch {
    await fs.writeFile(SUBSCRIBERS_FILE, "[]", "utf8");
  }
}

async function readSubscribers() {
  await ensureSubscribersFile();
  const raw = await fs.readFile(SUBSCRIBERS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSubscribers(subscribers) {
  await fs.writeFile(
    SUBSCRIBERS_FILE,
    JSON.stringify(subscribers, null, 2),
    "utf8",
  );
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mbomsign-coming-soon-api" });
});

app.post("/api/subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return res.status(400).json({ success: false, message: "Invalid email." });
    }

    const subscribers = await readSubscribers();
    const exists = subscribers.some((entry) => entry.email === email);

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }

    subscribers.push({
      email,
      createdAt: new Date().toISOString(),
      source: "coming-soon-page",
    });
    await writeSubscribers(subscribers);

    let mailWasSent = false;
    let mailFailureReason = "";
    try {
      const mailResult = await sendWelcomeEmail(email);
      mailWasSent = mailResult.sent;
      mailFailureReason = mailResult.reason || "";
    } catch (error) {
      console.error("Welcome email send failed:", error);
      mailFailureReason = "send_failed";
    }

    if (!mailWasSent) {
      return res.status(202).json({
        success: true,
        message:
          "Thanks. You are on the waiting list, but the welcome email was not sent. Please check SMTP settings.",
        mailSent: false,
        reason: mailFailureReason,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Thanks. You are on the MbomSign waiting list. A welcome email has been sent.",
      mailSent: true,
    });
  } catch (error) {
    console.error("/api/subscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not save your email. Please try again.",
    });
  }
});

if (isProduction) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

ensureSubscribersFile().then(() => {
  if (hasSmtpConfig()) {
    const verifier = nodemailer.createTransport(smtpTransportOptions());

    verifier.verify().then(
      () =>
        console.log("SMTP connection verified.", {
          host: SMTP_HOST,
          port: SMTP_PORT,
          userHint: SMTP_USER ? `${SMTP_USER.slice(0, 4)}...` : "none",
        }),
      (error) => console.error("SMTP verification failed:", error.message),
    );
  }

  app.listen(PORT, () => {
    console.log(`MbomSign app listening on port ${PORT}`);
  });
});
