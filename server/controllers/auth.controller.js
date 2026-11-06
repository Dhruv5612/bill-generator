const User = require("../models/user.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");

// In-memory fallback user store for local development when MongoDB is unreachable
const inMemoryUsers = new Map();
const demoSalt = bcrypt.genSaltSync(10);
const demoHash = bcrypt.hashSync("password123", demoSalt);
inMemoryUsers.set("demo@example.com", {
  _id: "demo-user-id-001",
  name: "Demo Merchant",
  email: "demo@example.com",
  password: demoHash,
  isVerified: true,
  verificationOtp: undefined,
  otpExpiresAt: undefined,
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const shouldExposeDevOtp = () => {
  return process.env.NODE_ENV !== "production" || !process.env.EMAIL_USER;
};

const findUserByEmail = async (email) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email });
      if (user) return user;
    } catch (e) {
      console.warn("MongoDB query warning:", e.message);
    }
  }
  return inMemoryUsers.get(email) || null;
};

const saveUserRecord = async (userObj, isNew = false) => {
  if (mongoose.connection.readyState === 1) {
    try {
      if (typeof userObj.save === "function") {
        return await userObj.save();
      } else {
        const doc = new User(userObj);
        return await doc.save();
      }
    } catch (e) {
      console.warn("MongoDB save warning, syncing to local memory:", e.message);
    }
  }

  // Fallback to in-memory store
  if (!userObj._id) {
    userObj._id = "user_" + Date.now();
  }
  inMemoryUsers.set(userObj.email, userObj);
  return userObj;
};

const createOtpEmailHtml = (userName, otp, purpose = "login") => {
  const isLogin = purpose === "login";
  const title = isLogin ? "Login Verification Code" : "Verify Your Account";
  const desc = isLogin
    ? "We received a sign in attempt for your BillCraft account. Use the one-time security code (OTP) below to complete your login."
    : "Thank you for creating a BillCraft account. Please use the verification code below to activate your account.";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; padding: 10px 18px; border-radius: 12px; font-weight: bold; font-size: 18px; letter-spacing: 0.5px;">
          BillCraft GST Pro
        </div>
      </div>
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; text-align: center; margin: 0 0 12px;">${title}</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align: center;">
        Hello <strong>${userName || "there"}</strong>,<br/>
        ${desc}
      </p>
      <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1e293b; display: inline-block;">
          ${otp}
        </span>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin: 0 0 16px;">
        ⏰ This verification code will expire in <strong>10 minutes</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.4;">
        If you did not request this code, you can safely ignore this email or change your password if you suspect unauthorized access.
      </p>
    </div>
  `;
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await findUserByEmail(normalizedEmail);
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists and is verified. Please sign in." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      if (mongoose.connection.readyState === 1) {
        user = new User({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          isVerified: false,
          verificationOtp: otp,
          otpExpiresAt,
        });
      } else {
        user = {
          _id: "user_" + Date.now(),
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          isVerified: false,
          verificationOtp: otp,
          otpExpiresAt,
        };
      }
    } else {
      user.name = name.trim();
      user.password = hashedPassword;
      user.verificationOtp = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await saveUserRecord(user, true);

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: "Verify Your Account - BillCraft",
      text: `Your account verification code is: ${otp}. It will expire in 10 minutes.`,
      html: createOtpEmailHtml(user.name, otp, "register"),
    });

    console.log(`[AUTH] Registration OTP generated for ${normalizedEmail}: ${otp}`);

    res.status(201).json({
      message: "Registration successful. Please check your email for the verification code.",
      requiresVerification: true,
      requiresOtp: true,
      email: user.email,
      ...(shouldExposeDevOtp() ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Something went wrong during registration." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate new OTP for 2FA / Login Verification
    const otp = generateOTP();
    user.verificationOtp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await saveUserRecord(user);

    // Send verification email
    await sendEmail({
      to: normalizedEmail,
      subject: "Your Login Verification Code - BillCraft",
      text: `Your login verification code is: ${otp}. It will expire in 10 minutes.`,
      html: createOtpEmailHtml(user.name, otp, "login"),
    });

    console.log(`[AUTH] Login 2FA OTP generated for ${normalizedEmail}: ${otp}`);

    res.status(200).json({
      message: "Credentials verified! A 6-digit OTP has been sent to your email.",
      requiresOtp: true,
      requiresVerification: true,
      email: user.email,
      ...(shouldExposeDevOtp() ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong during login." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and 6-digit OTP code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    if (!user.verificationOtp) {
      return res.status(400).json({ message: "No pending OTP found. Please request a new code." });
    }

    if (user.verificationOtp !== cleanOtp) {
      return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    // Mark as verified and clear temporary OTP fields
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiresAt = undefined;
    await saveUserRecord(user);

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    console.log(`[AUTH] User verified and logged in successfully: ${normalizedEmail}`);

    res.status(200).json({
      message: "Signed in successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Something went wrong during verification." });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const otp = generateOTP();
    user.verificationOtp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await saveUserRecord(user);

    await sendEmail({
      to: normalizedEmail,
      subject: "Your New Verification Code - BillCraft",
      text: `Your new verification code is: ${otp}. It will expire in 10 minutes.`,
      html: createOtpEmailHtml(user.name, otp, user.isVerified ? "login" : "register"),
    });

    console.log(`[AUTH] Resent OTP for ${normalizedEmail}: ${otp}`);

    res.status(200).json({
      message: "A new verification code has been sent to your email.",
      email: user.email,
      ...(shouldExposeDevOtp() ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ message: "Failed to resend verification code." });
  }
};

module.exports = { register, login, verifyOtp, resendOtp };
