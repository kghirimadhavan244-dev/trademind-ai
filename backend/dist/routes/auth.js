"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const email_1 = require("../services/email");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "development_secret_change_me";
// Health check
router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Auth router is working!",
    });
});
router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma_1.default.emailVerification.upsert({
            where: {
                email,
            },
            update: {
                otp,
                expiresAt,
                verified: false,
            },
            create: {
                email,
                otp,
                expiresAt,
            },
        });
        // Do NOT await sendOTP so that SMTP port blocks (like on Render free tier) do not hang the HTTP request.
        // The email will attempt to send in the background.
        (0, email_1.sendOTP)(email, otp).catch((err) => {
            console.error("Background SMTP send error:", err);
        });
        return res.json({
            success: true,
            message: "OTP sent successfully.",
            otp, // Return the OTP in the response for demo/testing convenience
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP.",
        });
    }
});
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = await prisma_1.default.emailVerification.findUnique({
            where: {
                email,
            },
        });
        if (!record) {
            return res.status(404).json({
                success: false,
                message: "OTP not found.",
            });
        }
        if (record.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired.",
            });
        }
        if (record.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }
        await prisma_1.default.emailVerification.update({
            where: {
                email,
            },
            data: {
                verified: true,
            },
        });
        return res.json({
            success: true,
            message: "Email verified successfully.",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP.",
        });
    }
});
// Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }
        const verification = await prisma_1.default.emailVerification.findUnique({
            where: {
                email,
            },
        });
        if (!verification || !verification.verified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email before signing up.",
            });
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists.",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
        }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({
            success: true,
            message: "Signup successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
        }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
// GET user profile
router.get("/profile/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                cash: true,
                riskProfile: true,
                investmentGoal: true,
                monthlyBudget: true,
                timeHorizon: true,
                sectorPreference: true,
            }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.json({ success: true, user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});
// UPDATE user profile
router.put("/profile", async (req, res) => {
    try {
        const { userId, name, riskProfile, investmentGoal, monthlyBudget, timeHorizon, sectorPreference } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: parseInt(userId) },
            data: {
                name,
                riskProfile,
                investmentGoal,
                monthlyBudget: parseFloat(monthlyBudget),
                timeHorizon,
                sectorPreference,
            },
            select: {
                id: true,
                name: true,
                email: true,
                cash: true,
                riskProfile: true,
                investmentGoal: true,
                monthlyBudget: true,
                timeHorizon: true,
                sectorPreference: true,
            }
        });
        return res.json({ success: true, message: "Profile updated successfully.", user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});
// CHANGE password
router.put("/change-password", async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { id: parseInt(userId) },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const passwordMatch = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password." });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return res.json({ success: true, message: "Password updated successfully." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});
// FORGOT password (send OTP)
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User with this email does not exist." });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await prisma_1.default.emailVerification.upsert({
            where: { email },
            update: { otp, expiresAt, verified: false },
            create: { email, otp, expiresAt },
        });
        // Do NOT await sendOTP to prevent SMTP connection hangs from blocking the HTTP response.
        (0, email_1.sendOTP)(email, otp).catch((err) => {
            console.error("Background SMTP send error (forgot password):", err);
        });
        return res.json({
            success: true,
            message: "Password reset OTP sent to email.",
            otp, // Return the OTP in the response for demo/testing convenience
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});
// RESET password (verify OTP & save password)
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const record = await prisma_1.default.emailVerification.findUnique({
            where: { email },
        });
        if (!record || record.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
        if (record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired." });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        // Mark OTP as verified/used
        await prisma_1.default.emailVerification.delete({
            where: { email },
        });
        return res.json({ success: true, message: "Password has been reset successfully." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});
exports.default = router;
