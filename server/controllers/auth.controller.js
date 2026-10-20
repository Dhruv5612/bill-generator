const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already exists and is verified." });
      }
      // If user exists but is not verified, we allow them to re-register/update password and send a new OTP
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      // Create user
      user = new User({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationOtp: otp,
        otpExpiresAt,
      });
    } else {
      user.name = name;
      user.password = hashedPassword;
      user.verificationOtp = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await user.save();

    // Send email
    await sendEmail({
      to: email,
      subject: "Verify Your Email - Bill Generator",
      text: `Your email verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.status(201).json({
      message: "Registration successful. Please check your email for the verification code.",
      requiresVerification: true,
      email: user.email
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isVerified) {
      // Generate new OTP and ask for verification
      const otp = generateOTP();
      user.verificationOtp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        to: email,
        subject: "Verify Your Email - Bill Generator",
        text: `Your new email verification code is: ${otp}. It will expire in 10 minutes.`,
      });

      return res.status(403).json({
        message: "Email not verified. A new verification code has been sent to your email.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    if (user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please log in to get a new one." });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Email verified successfully.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = { register, login, verifyOtp };
