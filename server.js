import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dns from "node:dns";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (process.env.SMTP_IPV4_FIRST !== "false") {
  dns.setDefaultResultOrder("ipv4first");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4000);
const DATA_DIR = path.join(__dirname, "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const isProduction = process.env.NODE_ENV === "production";
const APP_URL = process.env.APP_URL || "https://mbomsign.com";
const SMTP_FROM = String(
  process.env.SMTP_FROM || "MbomSign <noreply@mbomsign.com>",
).trim();
const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = String(process.env.SMTP_USER || "").trim();
const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

function smtpTransportOptions() {
  const port = SMTP_PORT;
  const startTlsPorts = new Set([25, 80, 587, 2525, 8025]);
  const implicitTls = port === 465 || port === 8465;
  const encryption = String(process.env.SMTP_ENCRYPTION || "").toLowerCase();
  const wantSsl =
    encryption === "ssl" ||
    encryption === "smtps" ||
    process.env.SMTP_SECURE === "true";
  const secure =
    implicitTls || (wantSsl && !startTlsPorts.has(port));
  return {
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 45_000,
    // SMTP2GO’s sample uses only host/port/auth; forcing requireTLS on 2525/587
    // can break handshakes in some environments.
    requireTLS: process.env.SMTP_REQUIRE_TLS === "true",
    tls: { minVersion: "TLSv1.2" },
    debug: process.env.SMTP_DEBUG === "true",
  };
}

function hasSmtpConfig() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function classifySmtpSendError(error) {
  const err = error instanceof Error ? error : new Error(String(error));
  const blob = `${err.message || ""} ${err.response || ""}`.toLowerCase();
  if (/not verified|verify the sender|sender domain|from header sender/.test(blob)) {
    return "sender_not_verified";
  }
  if (err.code === "EAUTH") {
    return "smtp_auth_failed";
  }
  return "send_failed";
}

const SUBSCRIBERS_ADMIN_SECRET = String(
  process.env.SUBSCRIBERS_ADMIN_SECRET || "",
).trim();
const WAITLIST_ADMIN_USER = String(
  process.env.WAITLIST_ADMIN_USER || "admin",
).trim();

function timingSafeUtf8Equal(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) {
      return false;
    }
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function waitlistAdminConfigured() {
  return Boolean(SUBSCRIBERS_ADMIN_SECRET);
}

function waitlistAdminBasicAuth(req, res, next) {
  if (!waitlistAdminConfigured()) {
    return res
      .status(503)
      .type("text/plain")
      .send("Waitlist admin is not configured (set SUBSCRIBERS_ADMIN_SECRET).");
  }

  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="MbomSign waitlist"');
    return res.status(401).type("text/plain").send("Authentication required.");
  }

  let decoded = "";
  try {
    decoded = Buffer.from(hdr.slice(6).trim(), "base64").toString("utf8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="MbomSign waitlist"');
    return res.status(401).type("text/plain").send("Invalid credentials.");
  }

  const sep = decoded.indexOf(":");
  const givenUser = sep >= 0 ? decoded.slice(0, sep) : decoded;
  const givenPass = sep >= 0 ? decoded.slice(sep + 1) : "";

  const userOk = timingSafeUtf8Equal(givenUser, WAITLIST_ADMIN_USER);
  const passOk = timingSafeUtf8Equal(givenPass, SUBSCRIBERS_ADMIN_SECRET);
  if (!userOk || !passOk) {
    res.setHeader("WWW-Authenticate", 'Basic realm="MbomSign waitlist"');
    return res.status(401).type("text/plain").send("Invalid credentials.");
  }

  next();
}

const WAITLIST_ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MbomSign — Waitlist</title>
  <style>
    :root { font-family: system-ui, sans-serif; color: #0f172a; }
    body { margin: 0; padding: 24px; background: #f1f5f9; }
    main { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px;
      padding: 24px; box-shadow: 0 4px 24px rgba(15,23,42,0.08); }
    h1 { margin: 0 0 8px; font-size: 1.25rem; }
    p.meta { margin: 0 0 20px; color: #64748b; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
    th { color: #475569; font-weight: 600; }
    .actions { margin-top: 20px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    button { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
    .danger { background: #b91c1c; color: #fff; }
    .secondary { background: #e2e8f0; color: #0f172a; }
    .err { color: #b91c1c; margin-top: 12px; font-size: 0.875rem; }
    .ok { color: #15803d; margin-top: 12px; font-size: 0.875rem; }
  </style>
</head>
<body>
  <main>
    <h1>Waitlist subscribers</h1>
    <p class="meta">Signed in with HTTP Basic Auth. Close the tab or clear site data to sign out.</p>
    <div id="status"></div>
    <table>
      <thead><tr><th>Email</th><th>Since</th><th>Source</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
    <div class="actions">
      <button type="button" class="secondary" id="reload">Refresh</button>
      <button type="button" class="danger" id="reset">Reset list (delete all)</button>
    </div>
  </main>
  <script>
    const rows = document.getElementById("rows");
    const status = document.getElementById("status");

    async function load() {
      status.textContent = "";
      rows.innerHTML = "";
      const r = await fetch("/api/waitlist-admin/subscribers", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!r.ok) {
        status.textContent = "Could not load list (" + r.status + ").";
        status.className = "err";
        return;
      }
      const data = await r.json();
      status.className = "ok";
      status.textContent = data.count + " subscriber(s).";
      for (const s of data.subscribers || []) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + (s.email || "") + "</td><td>" + (s.createdAt || "") + "</td><td>" + (s.source || "") + "</td>";
        rows.appendChild(tr);
      }
    }

    document.getElementById("reload").onclick = load;

    document.getElementById("reset").onclick = async () => {
      if (!confirm("Delete every subscriber? This cannot be undone.")) return;
      status.textContent = "";
      const r = await fetch("/api/waitlist-admin/reset", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!r.ok) {
        status.textContent = "Reset failed (" + r.status + ").";
        status.className = "err";
        return;
      }
      status.className = "ok";
      status.textContent = "List cleared.";
      await load();
    };

    load();
  </script>
</body>
</html>`;

function buildWelcomeEmailHtml(recipientEmail, includeLogoCid) {
  const currentYear = new Date().getFullYear();
  const headerBrand = includeLogoCid
    ? `<img src="cid:mbomsignlogo" alt="MbomSign" style="display:block;width:168px;max-width:100%;border-radius:10px;background:#ffffff;padding:6px;" />`
    : `<span style="display:block;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">MbomSign</span>`;
  return `
  <div style="margin:0;padding:0;background:#f3f6fc;font-family:'Plus Jakarta Sans',Inter,'Segoe UI',Arial,sans-serif;color:#334155;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f3f6fc;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe4f3;box-shadow:0 14px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(120deg,#0f235c,#162e78);">
                ${headerBrand}
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

  try {
    const transporter = nodemailer.createTransport(smtpTransportOptions());

    const logoPath = path.join(__dirname, "public", "mbomsign-logo.png");
    let hasLogoFile = false;
    try {
      await fs.access(logoPath);
      hasLogoFile = true;
    } catch {
      hasLogoFile = false;
    }

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject: "Welcome to MbomSign - You are on the list",
      html: buildWelcomeEmailHtml(recipientEmail, hasLogoFile),
      attachments: hasLogoFile
        ? [
            {
              filename: "mbomsign-logo.png",
              path: logoPath,
              cid: "mbomsignlogo",
            },
          ]
        : [],
    });

    const accepted = Array.isArray(info.accepted) ? info.accepted : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];
    const responseLine = String(info.response || "").trim();
    const responseOk = /^2/.test(responseLine);
    const sendOk =
      rejected.length === 0 && (accepted.length > 0 || responseOk);
    if (!sendOk) {
      console.error("SMTP did not accept message:", {
        to: recipientEmail,
        accepted,
        rejected,
        response: info.response,
      });
      return { sent: false, reason: "smtp_rejected" };
    }

    console.log("Welcome email delivered to SMTP provider:", {
      to: recipientEmail,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return { sent: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Welcome email send failed:", {
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });
    return {
      sent: false,
      reason: classifySmtpSendError(err),
    };
  }
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
  res.json({
    ok: true,
    service: "mbomsign-coming-soon-api",
    smtpConfigured: hasSmtpConfig(),
  });
});

app.get("/waitlist-admin", waitlistAdminBasicAuth, (_req, res) => {
  res.type("html").send(WAITLIST_ADMIN_HTML);
});

app.get("/api/waitlist-admin/subscribers", waitlistAdminBasicAuth, async (_req, res) => {
  try {
    const subscribers = await readSubscribers();
    res.json({
      ok: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error("waitlist list error:", error);
    res.status(500).json({ ok: false, message: "Could not read subscribers." });
  }
});

app.post("/api/waitlist-admin/reset", waitlistAdminBasicAuth, async (_req, res) => {
  try {
    await writeSubscribers([]);
    res.json({ ok: true, message: "Subscribers list cleared." });
  } catch (error) {
    console.error("waitlist reset error:", error);
    res.status(500).json({ ok: false, message: "Could not reset subscribers." });
  }
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

    const mailResult = await sendWelcomeEmail(email);
    const mailWasSent = mailResult.sent;
    const mailFailureReason = mailResult.reason || "";

    if (!mailWasSent) {
      let mailMessage =
        "Thanks. You are on the waiting list, but the welcome email was not sent. Please check SMTP settings.";
      if (mailFailureReason === "sender_not_verified") {
        mailMessage =
          "Thanks. You are on the waiting list. The welcome email was not sent: your mail provider rejected the From address. In SMTP2GO (and similar), add or verify the domain or sender under Verified Senders, or set SMTP_FROM to an allowed address.";
      } else if (mailFailureReason === "smtp_auth_failed") {
        mailMessage =
          "Thanks. You are on the waiting list. The welcome email was not sent: SMTP login failed. Check SMTP_USER and SMTP_PASS.";
      }
      return res.status(202).json({
        success: true,
        message: mailMessage,
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

const SPA_NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page not found — MbomSign</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: flex;
      align-items: center; justify-content: center; background: #f1f5f9; color: #0f172a; }
    main { text-align: center; padding: 24px; }
    a { color: #1d4ed8; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>404</h1>
    <p>This page does not exist.</p>
    <p><a href="/">Back to MbomSign</a></p>
  </main>
</body>
</html>`;

if (isProduction) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("/", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.get(/.*/, (_req, res) => {
    res.status(404).type("html").send(SPA_NOT_FOUND_HTML);
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
      (error) =>
        console.error("SMTP verification failed:", {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
        }),
    );
  }

  app.listen(PORT, () => {
    console.log(`MbomSign app listening on port ${PORT}`);
  });
});
