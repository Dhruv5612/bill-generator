import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import {
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlinePrinter,
  HiOutlineEnvelope,
  HiOutlineTruck,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineCalculator,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentDuplicate,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

// Helper for Indian numbering in words
function numberToWords(num) {
  if (num <= 0) return "Zero";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num.toString().length > 9) return "Overflow";
  const n = ("000000000" + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += n[5] != 0 ? (str != "" ? "And " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : "";
  return str.trim() + " Rupees Only";
}

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState("gst"); // "gst" or "fuel"
  const [faqOpen, setFaqOpen] = useState(null);

  // Live Calculator State
  const [calcQty, setCalcQty] = useState(10);
  const [calcRate, setCalcRate] = useState(95.5);
  const [calcGstPercent, setCalcGstPercent] = useState(5);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (e) => {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (e, sectionId) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser({ name: "User" });
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastActivity");
    sessionStorage.removeItem("lastRoute");
    setUser(null);
    toast.success("Logged out successfully.");
    navigate("/");
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Calculator Math
  const calcSubtotal = (Number(calcQty) || 0) * (Number(calcRate) || 0);
  const calcTaxAmount = (calcSubtotal * (Number(calcGstPercent) || 0)) / 100;
  const calcCgst = calcTaxAmount / 2;
  const calcSgst = calcTaxAmount / 2;
  const calcGrandTotal = Math.round(calcSubtotal + calcTaxAmount);

  const brandLogos = [
    { name: "Indian Oil", src: "/indian_oil.png" },
    { name: "Bharat Petroleum", src: "/bharat_petroleum.png" },
    { name: "HP Lubricants & Fuel", src: "/hp_oil.png" },
    { name: "Essar Oil", src: "/essar_oil.png" },
    { name: "Jio-bp Energy", src: "/jio.png" },
    { name: "Narayana Transports", src: "/narayana.png" },
  ];

  const features = [
    {
      icon: <HiOutlineSparkles className="w-6 h-6 text-blue-600" />,
      title: "Automated GST Calculation",
      description: "Automatic splitting of CGST & SGST with precision rounding, HSN/SAC codes, and instant amount in words.",
      badge: "Smart Tax",
    },
    {
      icon: <HiOutlinePrinter className="w-6 h-6 text-indigo-600" />,
      title: "One-Click Vector PDF Export",
      description: "Generate compliant, print-ready A4 Tax Invoices and Debit Memos formatted for Indian accounting standards.",
      badge: "Print Ready",
    },
    {
      icon: <HiOutlineTruck className="w-6 h-6 text-emerald-600" />,
      title: "Transport & Fuel Specialized",
      description: "Tailored fields for fleet operators and petrol stations: Lorry Receipt (L.R. No), Vehicle No, and Transporter details.",
      badge: "Logistics Ready",
    },
    {
      icon: <HiOutlineEnvelope className="w-6 h-6 text-purple-600" />,
      title: "Direct Client Email Dispatch",
      description: "Send generated invoice PDFs directly to buyers, clients, or internal accountants with a single click.",
      badge: "SMTP Delivery",
    },
    {
      icon: <HiOutlineBuildingOffice2 className="w-6 h-6 text-sky-600" />,
      title: "Multi-Company Profiles",
      description: "Save unlimited company entities with dedicated GSTINs, PANs, bank accounts, and IFSC codes. Switch instantly.",
      badge: "Multi-Tenant",
    },
    {
      icon: <HiOutlineDocumentDuplicate className="w-6 h-6 text-amber-600" />,
      title: "Sales & Purchase Bill Differentiation",
      description: "Generate differentiated Outward Sales Invoices for buyers and Inward Purchase Bills for suppliers with custom numbering and tax vouchers.",
      badge: "Dual Billing",
    },
  ];

  const faqs = [
    {
      q: "Are the invoices generated by this system GST compliant?",
      a: "Yes. Invoices follow Indian GST guidelines including Tax Invoice subheaders, GSTIN, PAN, Place of Supply across all 38 Indian states/UTs, HSN/SAC codes, CGST & SGST splitting, and amount in words.",
    },
    {
      q: "Can I manage multiple businesses or fuel stations?",
      a: "Absolutely! You can save and manage multiple company profiles from your dashboard. Each profile retains its own GSTIN, address, bank account number, and IFSC code for fast 1-click selection.",
    },
    {
      q: "How does the PDF download and email delivery work?",
      a: "When you click 'Generate Tax Invoice', a vector PDF is compiled dynamically and downloaded immediately to your browser. If you provide a recipient email, an attached copy is delivered seamlessly.",
    },
    {
      q: "Is there any cost or subscription fee?",
      a: "No! BillCraft is free for small enterprises, transport operators, fuel pump dealers, and freelancers. There are no watermarks or hidden export limits.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs font-medium py-2 px-4 text-center">
        <span className="inline-flex items-center gap-2">
          <span className="bg-blue-500/40 text-blue-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-400/30">
            Updated
          </span>
          Automated CGST/SGST Split • Instant PDF Export • Fuel & Transport Memo Ready
          <Link
            to={user ? "/invoice-generator" : "/signup"}
            className="underline font-semibold hover:text-blue-200 ml-1 inline-flex items-center gap-0.5"
          >
            Try Now <HiOutlineArrowRight className="w-3 h-3 inline" />
          </Link>
        </span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={scrollToTop}
            id="nav-logo-link"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <HiOutlineDocumentText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                BillCraft <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold tracking-normal">GST Pro</span>
              </span>
              <p className="text-[10px] font-medium text-slate-500 -mt-1 hidden sm:block">Invoice & Fuel Billing Suite</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button type="button" onClick={(e) => scrollToSection(e, "features")} className="hover:text-blue-600 transition-colors cursor-pointer">Features</button>
            <button type="button" onClick={(e) => scrollToSection(e, "calculator")} className="hover:text-blue-600 transition-colors cursor-pointer">Live Calculator</button>
            <button type="button" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-blue-600 transition-colors cursor-pointer">How It Works</button>
            <button type="button" onClick={(e) => scrollToSection(e, "preview")} className="hover:text-blue-600 transition-colors cursor-pointer">Preview</button>
            <button type="button" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-blue-600 transition-colors cursor-pointer">FAQ</button>
          </nav>

          {/* Auth CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  id="nav-dashboard-btn"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/invoice-generator"
                  id="nav-create-invoice-btn"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <HiOutlineDocumentText className="w-4 h-4" />
                  Create Invoice
                </Link>
                {/* Profile Button with full details & modal */}
                <ProfileDropdown user={user} handleLogout={handleLogout} />
                {/* Quick Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  id="nav-logout-btn"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  id="nav-signin-btn"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  id="nav-signup-btn"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all cursor-pointer"
                >
                  Get Started Free
                  <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, "features")}
              className="block w-full text-left py-2 text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, "calculator")}
              className="block w-full text-left py-2 text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              Live Calculator
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="block w-full text-left py-2 text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, "faq")}
              className="block w-full text-left py-2 text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              FAQ
            </button>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  {/* Mobile User Profile Card */}
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200/70 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <HiOutlineShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Pro
                      </span>
                      <span className="text-slate-500 font-mono">
                        #{user.id ? user.id.slice(-6).toUpperCase() : "PRO"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Dashboard & Saved Profiles
                  </Link>
                  <Link
                    to="/invoice-generator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create Invoice
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background Gradient Blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-300/30 via-indigo-200/20 to-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Modern GST & Transport Billing for India
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Generate Compliant{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
                GST & Fuel Invoices
              </span>{" "}
              in Seconds.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Automated CGST/SGST tax splitting, vector PDF exports, multi-company profiles, Lorry Receipts, and instant client email dispatch. Built for fuel dealers, transport fleets, and modern Indian businesses.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? "/invoice-generator" : "/signup"}
                id="hero-primary-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-base font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <HiOutlineDocumentText className="w-5 h-5" />
                {user ? "Generate New Invoice" : "Create Invoice Free"}
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold px-6 py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <HiOutlineCalculator className="w-5 h-5 text-blue-600" />
                Try Live GST Calculator
              </a>
            </div>

            {/* Trust points */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Auto CGST/SGST 2.5% or custom
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Direct vector PDF download
              </span>
            </div>
          </div>

          {/* Interactive Invoice Mockup Showcase */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-2xl p-2 sm:p-4 shadow-2xl shadow-slate-900/20 border border-slate-800">
              {/* Window Controls & Tab switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 px-2 gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="ml-2 text-xs font-mono text-slate-400">billcraft-invoice-preview.pdf</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setPreviewTab("gst")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      previewTab === "gst" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    GST Tax Invoice
                  </button>
                  <button
                    onClick={() => setPreviewTab("fuel")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      previewTab === "fuel" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Fuel & Fleet Memo
                  </button>
                </div>
              </div>

              {/* Sample Invoice Sheet */}
              <div className="bg-white rounded-xl p-6 sm:p-10 text-slate-800 font-sans shadow-inner my-2">
                {/* Header Section */}
                <div className="border border-slate-800 rounded-md overflow-hidden">
                  <div className="bg-slate-100 p-3 text-center border-b border-slate-800">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide uppercase">
                      {previewTab === "gst" ? "SHREE GANESH ENTERPRISE & TRADING CO." : "HIGHWAY PETROLEUM & FLEET LOGISTICS"}
                    </h3>
                    <p className="text-xs text-slate-600">
                      G.I.D.C. Industrial Estate, Phase-II, Ahmedabad, Gujarat - 382445
                    </p>
                    <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium px-2 pt-1">
                      <span>E-mail: accounts@enterprise.com</span>
                      <span>Mo: +91 98765 43210</span>
                    </div>
                  </div>

                  {/* Subheader */}
                  <div className="flex justify-between items-center px-4 py-1.5 bg-slate-50 border-b border-slate-800 text-xs font-bold text-slate-800">
                    <span>Debit Memo</span>
                    <span className="text-blue-700 tracking-wider">TAX INVOICE</span>
                    <span className="text-slate-500 font-medium">Original for Recipient</span>
                  </div>

                  {/* Buyer & Ship Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 text-xs border-b border-slate-800">
                    <div className="p-3 space-y-1">
                      <p className="font-bold text-slate-900">Buyer (Billed To):</p>
                      <p className="font-semibold text-blue-900">M/s. Acme Logistics & Infrastructure Ltd.</p>
                      <p className="text-slate-600">Plot 45, Trans-Delhi Signature Highway, Ghaziabad, UP</p>
                      <p><span className="font-semibold">GSTIN:</span> 09AAACA1234F1Z1 • <span className="font-semibold">PAN:</span> AAACA1234F</p>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-900">Invoice No:</span>
                        <span className="font-bold text-blue-700 font-mono">GT/2026/842</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Date:</span>
                        <span>{new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Vehicle No:</span>
                        <span className="font-mono font-bold text-slate-800">{previewTab === "gst" ? "GJ-01-AB-4921" : "MH-04-CX-8899"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">L.R. No:</span>
                        <span className="font-mono text-slate-700">LR-90421</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table Mockup */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 border-b border-slate-800 text-slate-900 font-bold">
                        <tr>
                          <th className="p-2 border-r border-slate-800 w-8 text-center">#</th>
                          <th className="p-2 border-r border-slate-800">Product / Item Name</th>
                          <th className="p-2 border-r border-slate-800 text-center">HSN/SAC</th>
                          <th className="p-2 border-r border-slate-800 text-right">Qty</th>
                          <th className="p-2 border-r border-slate-800 text-center">Unit</th>
                          <th className="p-2 border-r border-slate-800 text-right">Rate (₹)</th>
                          <th className="p-2 border-r border-slate-800 text-center">GST %</th>
                          <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewTab === "gst" ? (
                          <>
                            <tr>
                              <td className="p-2 border-r border-slate-800 text-center">1</td>
                              <td className="p-2 border-r border-slate-800 font-medium">High Speed Diesel (Fleet Bulk Delivery)</td>
                              <td className="p-2 border-r border-slate-800 text-center font-mono">27101930</td>
                              <td className="p-2 border-r border-slate-800 text-right font-mono">250.000</td>
                              <td className="p-2 border-r border-slate-800 text-center">Ltr</td>
                              <td className="p-2 border-r border-slate-800 text-right font-mono">92.40</td>
                              <td className="p-2 border-r border-slate-800 text-center">5%</td>
                              <td className="p-2 text-right font-mono font-medium">₹ 23,100.00</td>
                            </tr>
                            <tr>
                              <td className="p-2 border-r border-slate-800 text-center">2</td>
                              <td className="p-2 border-r border-slate-800 font-medium">Heavy Duty Engine Oil 15W-40</td>
                              <td className="p-2 border-r border-slate-800 text-center font-mono">27101980</td>
                              <td className="p-2 border-r border-slate-800 text-right font-mono">20.000</td>
                              <td className="p-2 border-r border-slate-800 text-center">Ltr</td>
                              <td className="p-2 border-r border-slate-800 text-right font-mono">310.00</td>
                              <td className="p-2 border-r border-slate-800 text-center">5%</td>
                              <td className="p-2 text-right font-mono font-medium">₹ 6,200.00</td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="p-2 border-r border-slate-800 text-center">1</td>
                              <td className="p-2 border-r border-slate-800 font-medium">Express Full-Truck Transport Freight</td>
                              <td className="p-2 border-r border-slate-800 text-center font-mono">996511</td>
                              <td className="p-2 border-r border-slate-800 text-right font-mono">1.000</td>
                              <td className="p-2 border-r border-slate-800 text-center">Trip</td>
                              <td className="p-2 border-r border-slate-800 text-right font-mono">35,000.00</td>
                              <td className="p-2 border-r border-slate-800 text-center">5%</td>
                              <td className="p-2 text-right font-mono font-medium">₹ 35,000.00</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Calculations Footer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-slate-800 text-xs">
                    <div className="p-3 border-r border-slate-800 space-y-2 bg-slate-50/50">
                      <p className="font-bold text-slate-800">Amount in Words:</p>
                      <p className="text-slate-700 italic">
                        {previewTab === "gst" ? "Thirty Thousand Seven Hundred Sixty-Five Rupees Only" : "Thirty-Six Thousand Seven Hundred Fifty Rupees Only"}
                      </p>
                      <div className="pt-2 text-[11px] text-slate-500">
                        <p>Bank: HDFC Bank Ltd • A/C: 50200012345678 • IFSC: HDFC0000123</p>
                      </div>
                    </div>

                    <div className="p-3 space-y-1.5 font-medium">
                      <div className="flex justify-between text-slate-600">
                        <span>Taxable Subtotal:</span>
                        <span className="font-mono">{previewTab === "gst" ? "₹ 29,300.00" : "₹ 35,000.00"}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST (2.5%):</span>
                        <span className="font-mono">{previewTab === "gst" ? "₹ 732.50" : "₹ 875.00"}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST (2.5%):</span>
                        <span className="font-mono">{previewTab === "gst" ? "₹ 732.50" : "₹ 875.00"}</span>
                      </div>
                      <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-sm text-slate-900">
                        <span>Grand Total:</span>
                        <span className="font-mono text-blue-700">{previewTab === "gst" ? "₹ 30,765.00" : "₹ 36,750.00"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated action buttons */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    ✓ Rendered with real jsPDF & autoTable schema
                  </span>
                  <Link
                    to={user ? "/invoice-generator" : "/signup"}
                    className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-800 transition"
                  >
                    Open Generator to customize & download <HiOutlineArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands & Fuel Station Logistics Section */}
      <section className="py-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by Fuel Stations, Transporters & Commercial Dealers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center">
            {brandLogos.map((brand, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-16 hover:shadow-sm hover:border-slate-200 transition-all group"
              >
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="max-h-10 max-w-[110px] object-contain opacity-75 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Live GST & Bill Calculator Widget */}
      <section id="calculator" className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
              <HiOutlineCalculator className="w-4 h-4" /> Live Utility
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Instant GST & Bill Calculator
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Test your quantity, unit rate, and GST slab right here. See the exact split and words formatting.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            {/* Input Controls */}
            <div className="p-6 sm:p-8 md:col-span-7 space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center justify-between">
                <span>Item & Tax Parameters</span>
                <span className="text-xs font-normal text-slate-400">Updates live</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity (e.g., Liters, Units, Tons)
                  </label>
                  <input
                    type="number"
                    value={calcQty}
                    onChange={(e) => setCalcQty(e.target.value)}
                    min="1"
                    className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-slate-900 outline-none"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unit Rate (₹ per item)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={calcRate}
                      onChange={(e) => setCalcRate(e.target.value)}
                      step="0.01"
                      className="w-full pl-8 pr-3 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-slate-900 outline-none"
                      placeholder="Enter price per unit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    GST Tax Slab Rate
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCalcGstPercent(rate)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          calcGstPercent === rate
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-6 sm:p-8 md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Tax Calculation Breakdown
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Taxable Base:</span>
                    <span className="font-mono font-medium">₹ {calcSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>CGST ({calcGstPercent / 2}%):</span>
                    <span className="font-mono font-medium">₹ {calcCgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>SGST ({calcGstPercent / 2}%):</span>
                    <span className="font-mono font-medium">₹ {calcSgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Tax ({calcGstPercent}%):</span>
                    <span className="font-mono font-medium text-emerald-400">₹ {calcTaxAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-slate-700 pt-3">
                    <span className="text-xs text-slate-400 block">Total Payable</span>
                    <span className="text-3xl font-black text-white font-mono tracking-tight">
                      ₹ {calcGrandTotal.toLocaleString('en-IN')}.00
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 mt-3 text-xs text-slate-300 italic">
                    "{numberToWords(calcGrandTotal)}"
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to={user ? "/invoice-generator" : "/signup"}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Create Full Invoice with this Data
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Engineered for Speed, Precision & Compliance
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              No bloated accounting software. Just straightforward, robust invoicing made for everyday commercial operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 group-hover:scale-110 transition-transform">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Effortless Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Three Simple Steps to Official Invoices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm mb-6 shadow-md shadow-blue-500/20">
                1
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Configure Company & Buyer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Select your pre-saved company profile or enter your business GSTIN, PAN, and address. Enter buyer details and state.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm mb-6 shadow-md shadow-blue-500/20">
                2
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Add Items & Transport Info</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Add line items, quantities, rates, and HSN codes. Enter Lorry Receipt (L.R.) and vehicle registration number for transport bills.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm mb-6 shadow-md shadow-blue-500/20">
                3
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Download PDF or Email</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hit generate to receive your print-ready A4 Tax Invoice instantly. Optionally dispatch directly to client email in background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex justify-between items-center hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-base">{faq.q}</span>
                  <HiOutlineChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform ${
                      faqOpen === index ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {faqOpen === index && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-200 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Streamline Your Billing Today?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-base">
            Create professional GST tax invoices and fuel bills without any subscription fees or limits.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/invoice-generator" : "/signup"}
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 text-base font-extrabold px-8 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              {user ? "Go to Invoice Generator" : "Get Started for Free"}
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            onClick={scrollToTop}
            id="footer-logo-link"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
              <HiOutlineDocumentText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">BillCraft</span>
              <p className="text-xs text-slate-500">Fast GST & Fuel Invoice Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button type="button" onClick={(e) => scrollToSection(e, "features")} className="hover:text-white transition cursor-pointer">Features</button>
            <button type="button" onClick={(e) => scrollToSection(e, "calculator")} className="hover:text-white transition cursor-pointer">Calculator</button>
            <button type="button" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-white transition cursor-pointer">Workflow</button>
            <Link to="/signin" className="hover:text-white transition">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition">Sign Up</Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} BillCraft. Free to use for commercial & personal invoices.
          </p>
        </div>
      </footer>

      {/* Floating Scroll To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          id="floating-scroll-top-btn"
          className="fixed bottom-6 right-6 z-50 p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-1 cursor-pointer flex items-center justify-center animate-in fade-in zoom-in-75 duration-200"
          title="Back to top"
          aria-label="Back to top"
        >
          <HiOutlineChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

export default Home;
