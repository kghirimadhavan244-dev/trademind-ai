
import nodemailer from "nodemailer";
import axios from "axios";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded:", !!process.env.EMAIL_PASS);
console.log("EMAIL_PROXY_URL set:", !!process.env.EMAIL_PROXY_URL);

export async function sendOTP(email: string, otp: string) {
  console.log("------------------------------------------");
  console.log(`🔑 [OTP SERVICE] Verification code for ${email} is: ${otp}`);
  console.log("------------------------------------------");

  // Try routing through HTTPS proxy first (bypasses Render SMTP port blocking)
  if (process.env.EMAIL_PROXY_URL) {
    try {
      console.log(`✉️ [OTP SERVICE] Dispatching email via proxy: ${process.env.EMAIL_PROXY_URL}`);
      const response = await axios.post(process.env.EMAIL_PROXY_URL, {
        email,
        otp,
        secret: process.env.EMAIL_PROXY_SECRET || "super_secret_email_proxy_key_123!",
      });
      if (response.data && response.data.success) {
        console.log(`✉️ [OTP SERVICE] Email successfully dispatched via proxy to ${email}`);
        return;
      }
    } catch (proxyError: any) {
      console.warn(
        "⚠️ [OTP SERVICE] Email proxy dispatch failed. Attempting local SMTP fallback:",
        proxyError.response?.data || proxyError.message
      );
    }
  }

  // Fallback to local direct SMTP (works locally where port 587 is not blocked)
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("ℹ️ [OTP SERVICE] SMTP credentials not set. Falling back to console-only OTP.");
      return;
    }
    
    await transporter.sendMail({
      from: `"TradeMind AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "TradeMind AI - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify your email</h2>
          <p>Your TradeMind AI verification code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    console.log(`✉️ [OTP SERVICE] Email successfully dispatched via SMTP to ${email}`);
  } catch (error) {
    console.warn("⚠️ [OTP SERVICE] SMTP delivery failed. Using terminal verification code instead:", (error as Error).message);
  }
}

