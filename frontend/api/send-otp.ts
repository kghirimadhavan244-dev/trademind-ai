import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { email, otp, secret } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and OTP are required" });
  }

  // Verify the shared secret to prevent unauthorized usage
  const expectedSecret = process.env.EMAIL_PROXY_SECRET || "super_secret_email_proxy_key_123!";
  if (secret !== expectedSecret) {
    console.warn(`[EMAIL PROXY] Unauthorized request attempt. Provided: ${secret}`);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid secret key" });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("[EMAIL PROXY] Server SMTP configuration missing.");
    return res.status(500).json({ success: false, error: "Server configuration error: SMTP credentials not set" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    console.log(`[EMAIL PROXY] Attempting to send OTP email to ${email}...`);
    await transporter.sendMail({
      from: `"TradeMind AI" <${emailUser}>`,
      to: email,
      subject: "TradeMind AI - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Verify your email</h2>
          <p style="color: #334155; font-size: 16px;">Your TradeMind AI verification code is:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`[EMAIL PROXY] Email successfully dispatched to ${email}`);
    return res.status(200).json({ success: true, message: "Email dispatched successfully" });
  } catch (error) {
    console.error(`[EMAIL PROXY] Error sending email to ${email}:`, error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}
