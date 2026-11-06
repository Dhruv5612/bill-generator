import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";
import {
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const SignIn = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Timer countdown effect for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    // Only allow numbers and limit to 6 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleFillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp);
      toast.success("Verification code autofilled!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDevOtp("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresOtp || data.requiresVerification) {
          toast.info(data.message || "Verification code sent to your email.");
          if (data.devOtp) {
            setDevOtp(data.devOtp);
          }
          setStep(2);
          setCountdown(60);
          setOtp("");
        } else if (data.token) {
          // Direct login fallback if ever configured
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          toast.success("Signed in successfully!");
          navigate("/dashboard");
        }
      } else {
        if (response.status === 403 && data.requiresVerification) {
          toast.info(data.message);
          if (data.devOtp) setDevOtp(data.devOtp);
          setStep(2);
          setCountdown(60);
        } else {
          toast.error(data.message || "Invalid credentials.");
        }
      }
    } catch (error) {
      toast.error("Could not connect to the server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.warning("Please enter a valid 6-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        toast.success(data.message || "Signed in successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "OTP verification failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "A new verification code has been sent!");
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
        setCountdown(60);
      } else {
        toast.error(data.message || "Failed to resend code.");
      }
    } catch (error) {
      toast.error("Could not resend code. Please check your connection.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Gradient Spheres */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-300/30 via-indigo-200/20 to-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-2.5 group mb-6 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <HiOutlineDocumentText className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            BillCraft <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold tracking-normal">GST Pro</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {step === 1 ? "Sign in to your account" : "Two-Factor Verification"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {step === 1 ? (
            <>
              Or{" "}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition">
                create a new account for free
              </Link>
            </>
          ) : (
            <span>
              Enter the 6-digit security code sent to <strong className="text-slate-900">{formData.email}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/70 rounded-2xl border border-slate-200/80">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiOutlineEnvelope className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                    placeholder="name@business.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiOutlineLockClosed className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Checking credentials...</span>
                  ) : (
                    <>
                      Sign In & Get OTP
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Demo Credentials Helper */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600" />
                  Two-Factor Authentication Protected
                </p>
                <p className="text-[11px] text-slate-500">
                  After entering your password, a one-time verification code (OTP) will be sent to your registered email for security.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <HiOutlineShieldCheck className="w-8 h-8" />
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enter 6-Digit Security Code
                </label>
                <p className="text-xs text-slate-500 mb-4">
                  Check your inbox and spam folder for the one-time code.
                </p>

                {/* Dev Mode OTP Banner (if devOtp is returned) */}
                {devOtp && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-amber-800">Development / Test Mode</p>
                      <p className="text-xs font-mono font-bold text-amber-900">OTP: {devOtp}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillDevOtp}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition cursor-pointer"
                    >
                      Autofill
                    </button>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    name="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                    maxLength={6}
                    className="block w-full py-3.5 text-center tracking-[0.5em] text-2xl font-bold font-mono rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 outline-none transition shadow-sm"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>

              {/* Resend Code Section */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">Didn't receive the code?</span>
                {countdown > 0 ? (
                  <span className="font-semibold text-slate-400">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {resending ? (
                      <>
                        <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Resend Code"
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <HiOutlineCheckCircle className="w-4 h-4" />
                      Verify & Sign In
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setDevOtp("");
                  }}
                  className="w-full text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  ← Back to Email & Password
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Back to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
