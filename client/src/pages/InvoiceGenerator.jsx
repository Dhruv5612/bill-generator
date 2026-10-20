import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown";
import { API_BASE_URL } from "../config/api";
import {
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineBanknotes,
  HiOutlineEnvelope,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const indianStates = [
  "01-Jammu and Kashmir", "02-Himachal Pradesh", "03-Punjab", "04-Chandigarh", "05-Uttarakhand", 
  "06-Haryana", "07-Delhi", "08-Rajasthan", "09-Uttar Pradesh", "10-Bihar", "11-Sikkim", 
  "12-Arunachal Pradesh", "13-Nagaland", "14-Manipur", "15-Mizoram", "16-Tripura", 
  "17-Meghalaya", "18-Assam", "19-West Bengal", "20-Jharkhand", "21-Odisha", "22-Chhattisgarh", 
  "23-Madhya Pradesh", "24-Gujarat", "25-Daman and Diu", "26-Dadra and Nagar Haveli", 
  "27-Maharashtra", "28-Andhra Pradesh", "29-Karnataka", "30-Goa", "31-Lakshadweep", 
  "32-Kerala", "33-Tamil Nadu", "34-Puducherry", "35-Andaman and Nicobar Islands", "36-Telangana", 
  "37-Andhra Pradesh (New)", "38-Ladakh"
];

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

const InvoiceGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const [billType, setBillType] = useState("sales"); // "sales" or "purchase"

  const generateInvoiceNumber = (type = billType) => {
    const prefix = type === "purchase" ? "PUR" : "INV";
    return `${prefix}/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
  };

  const [formData, setFormData] = useState({
    billType: "sales",
    invoiceNumber: generateInvoiceNumber("sales"),
    billDate: new Date().toISOString().split("T")[0],
    vendorBillNo: "",
    vendorBillDate: new Date().toISOString().split("T")[0],
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyMobile: "",
    companyPAN: "",
    companyGSTIN: "",
    bankName: "",
    bankAcNo: "",
    bankIFSC: "",
    buyerName: "",
    buyerAddress: "",
    buyerPlaceOfSupply: "24-Gujarat",
    buyerPAN: "",
    buyerGSTIN: "",
    supplierName: "",
    supplierAddress: "",
    supplierPlaceOfSupply: "24-Gujarat",
    supplierPAN: "",
    supplierGSTIN: "",
    shipName: "",
    shipAddress: "",
    shipPlaceOfSupply: "",
    shipPAN: "",
    shipGSTIN: "",
    transporter: "",
    lrNo: "",
    vehicleNo: "",
    email: "" // Optional client delivery email
  });

  const handleBillTypeChange = (type) => {
    setBillType(type);
    setFormData((prev) => ({
      ...prev,
      billType: type,
      invoiceNumber: generateInvoiceNumber(type),
    }));
    toast.info(
      `Switched mode to: ${
        type === "purchase"
          ? "Purchase Bill (Inward / Purser)"
          : "Sales Bill (Buyer / Outward Tax Invoice)"
      }`
    );
  };

  const [savedCompanies, setSavedCompanies] = useState([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    const companyKey = userObj ? `savedCompanies_${userObj.id}` : "savedCompanies";
    const loaded = localStorage.getItem(companyKey);
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        setSavedCompanies(parsed);
        
        const defaultCompany = location.state?.selectedCompany 
          ? parsed.find(c => c.companyName.toLowerCase() === location.state.selectedCompany.toLowerCase()) 
          : (parsed.length > 0 ? parsed[0] : null);

        if (defaultCompany) {
          setFormData(prev => ({
            ...prev,
            companyName: defaultCompany.companyName || "",
            companyAddress: defaultCompany.companyAddress || "",
            companyEmail: defaultCompany.companyEmail || "",
            companyMobile: defaultCompany.companyMobile || "",
            companyPAN: defaultCompany.companyPAN || "",
            companyGSTIN: defaultCompany.companyGSTIN || "",
            bankName: defaultCompany.bankName || "",
            bankAcNo: defaultCompany.bankAcNo || "",
            bankIFSC: defaultCompany.bankIFSC || ""
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [location.state]);

  const handleSelectCompany = (compName) => {
    const found = savedCompanies.find(c => c.companyName.toLowerCase() === compName.toLowerCase());
    if (found) {
      setFormData(prev => ({
        ...prev,
        companyName: found.companyName || "",
        companyAddress: found.companyAddress || "",
        companyEmail: found.companyEmail || "",
        companyMobile: found.companyMobile || "",
        companyPAN: found.companyPAN || "",
        companyGSTIN: found.companyGSTIN || "",
        bankName: found.bankName || "",
        bankAcNo: found.bankAcNo || "",
        bankIFSC: found.bankIFSC || ""
      }));
      toast.info(`Loaded profile for "${found.companyName}"`);
    }
  };

  const [items, setItems] = useState([
    { id: uuidv4(), productName: "High Speed Diesel", hsnSac: "27101930", qty: "100", unit: "Ltr", rate: "92.50", gstPercent: 5, amount: 9250 }
  ]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "buyerGSTIN" ||
      name === "buyerPAN" ||
      name === "supplierGSTIN" ||
      name === "supplierPAN" ||
      name === "companyGSTIN" ||
      name === "companyPAN" ||
      name === "vehicleNo"
    ) {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "qty" || field === "rate") {
            const q = Number(field === "qty" ? value : item.qty) || 0;
            const r = Number(field === "rate" ? value : item.rate) || 0;
            updatedItem.amount = q * r;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: uuidv4(), productName: "", hsnSac: "", qty: "1", unit: "Ltr", rate: "0", gstPercent: 5, amount: 0 }
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) {
      toast.warning("Invoice must contain at least one line item.");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  // Calculations
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  let totalCgst = 0;
  let totalSgst = 0;
  items.forEach(item => {
    const taxAmt = ((Number(item.amount) || 0) * (Number(item.gstPercent) || 0)) / 100;
    totalCgst += taxAmt / 2;
    totalSgst += taxAmt / 2;
  });

  const grandTotalExact = subTotal + totalCgst + totalSgst;
  const roundOff = Math.round(grandTotalExact) - grandTotalExact;
  const grandTotal = Math.round(grandTotalExact);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName) {
      toast.warning("Please select or add a company from the Dashboard before generating an invoice.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one line item.");
      return;
    }

    setLoading(true);

    const cleanItems = items.map(item => ({
      ...item,
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
      gstPercent: Number(item.gstPercent) || 0,
      amount: Number(item.amount) || 0
    }));

    const isPurchase = billType === "purchase";
    const payload = {
      ...formData,
      billType,
      supplierName: isPurchase ? (formData.supplierName || formData.buyerName) : "",
      buyerName: isPurchase ? (formData.supplierName || formData.buyerName) : formData.buyerName,
      items: cleanItems,
      totalQty,
      subTotal,
      taxableAmount: subTotal,
      cgst: totalCgst,
      sgst: totalSgst,
      roundOff,
      grandTotal
    };

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/generate-bill`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filePrefix = isPurchase ? "Purchase_Bill" : "Invoice";
        a.download = `${filePrefix}_${formData.invoiceNumber.replace(/[\/\\]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(
          isPurchase
            ? "Purchase Bill PDF downloaded successfully!"
            : "Tax Invoice PDF downloaded successfully!"
        );
        setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber(billType) }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to generate the invoice.");
      }
    } catch (error) {
      toast.error("Something went wrong generating the invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastActivity");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <HiOutlineDocumentText className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                BillCraft <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold tracking-normal">Generator</span>
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 text-sm font-semibold">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Dashboard
              </button>
              <button
                className="px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 font-bold transition"
              >
                Generator
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && <ProfileDropdown user={user} handleLogout={handleLogout} />}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex-1 w-full grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Form Fields (8 Cols on XL) */}
        <form onSubmit={handleSubmit} className="xl:col-span-8 space-y-6">
          
          {/* Bill Type Selector: Sales (Buyer Bill) vs Purchase (Vendor Bill) */}
          <div className="bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => handleBillTypeChange("sales")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                billType === "sales"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <HiOutlineDocumentText className="w-5 h-5" />
              <span>
                Sales / Buyer Bill{" "}
                <span className="text-[11px] opacity-80 font-normal hidden sm:inline">(Tax Invoice to Customer)</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleBillTypeChange("purchase")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                billType === "purchase"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <HiOutlineBuildingOffice2 className="w-5 h-5" />
              <span>
                Purchase Bill{" "}
                <span className="text-[11px] opacity-80 font-normal hidden sm:inline">(Inward / Purser from Vendor)</span>
              </span>
            </button>
          </div>

          {/* Card 1: Select Business Profile */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HiOutlineBuildingOffice2 className={`w-5 h-5 ${billType === 'purchase' ? 'text-emerald-600' : 'text-blue-600'}`} />
                  {billType === "purchase" ? "Purchaser Entity (Your Business Profile)" : "Billed By (Select Business Entity)"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {billType === "purchase"
                    ? "Your registered company receiving the goods/fuel (Consignee / Purchaser)"
                    : "Your registered company supplying the goods/fuel & issuing this Tax Invoice"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold transition cursor-pointer"
              >
                + Manage in Dashboard
              </button>
            </div>

            {savedCompanies.length > 0 ? (
              <div className="space-y-3">
                <select
                  required
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="w-full p-3 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition cursor-pointer"
                  value={formData.companyName || ""}
                >
                  <option value="" disabled>Choose your company profile...</option>
                  {savedCompanies.map((c, idx) => (
                    <option key={idx} value={c.companyName}>{c.companyName}</option>
                  ))}
                </select>

                {formData.companyName && (
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                    <p className="font-bold text-slate-900 text-sm">{formData.companyName}</p>
                    <p>{formData.companyAddress || "No address entered"}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-500 font-medium">
                      <span>GSTIN: <span className="font-mono text-slate-700">{formData.companyGSTIN || "N/A"}</span></span>
                      <span>PAN: <span className="font-mono text-slate-700">{formData.companyPAN || "N/A"}</span></span>
                      <span>Bank: <span className="text-slate-700">{formData.bankName || "N/A"} (A/C: {formData.bankAcNo || 'N/A'}, IFSC: {formData.bankIFSC || 'N/A'})</span></span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-amber-900 font-bold text-sm">No business profiles found</p>
                  <p className="text-amber-700 text-xs mt-0.5">Please configure your company name and GSTIN in Dashboard.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer whitespace-nowrap"
                >
                  Add Company Profile
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Invoice / Purchase Metadata */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiOutlineDocumentText className={`w-5 h-5 ${billType === 'purchase' ? 'text-emerald-600' : 'text-indigo-600'}`} />
              {billType === "purchase" ? "Purchase Bill & Inward Metadata" : "Sales Invoice Metadata"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {billType === "purchase" ? "Purchase Bill Number" : "Sales Invoice Number"}
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleFormChange}
                    className={`w-full p-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 outline-none ${
                      billType === "purchase"
                        ? "text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "text-blue-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, invoiceNumber: generateInvoiceNumber(billType) }))}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="Generate new number"
                  >
                    <HiOutlineArrowPath className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {billType === "purchase" ? "Purchase Entry Date" : "Bill Date"}
                </label>
                <input
                  required
                  type="date"
                  name="billDate"
                  value={formData.billDate}
                  onChange={handleFormChange}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notification / Dispatch Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="accountant@company.com"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Extra Purchase Bill fields: Vendor's Original Invoice reference */}
              {billType === "purchase" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Supplier's Original Bill Ref #
                    </label>
                    <input
                      type="text"
                      name="vendorBillNo"
                      value={formData.vendorBillNo}
                      onChange={handleFormChange}
                      placeholder="e.g. VEN-2026/8841"
                      className="w-full p-2.5 text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Supplier's Bill Date
                    </label>
                    <input
                      type="date"
                      name="vendorBillDate"
                      value={formData.vendorBillDate}
                      onChange={handleFormChange}
                      className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 3: Counterparty Details (Buyer in Sales, Supplier in Purchase) */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiOutlineUser className={`w-5 h-5 ${billType === 'purchase' ? 'text-emerald-600' : 'text-blue-600'}`} />
              {billType === "purchase"
                ? "Supplier / Vendor Details (Purchased From)"
                : "Customer / Buyer Details (Billed To)"}
            </h3>

            {billType === "purchase" ? (
              // Purchase Form: Vendor Details
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier / Vendor Name (M/s.)
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName || formData.buyerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, supplierName: val, buyerName: val }));
                    }}
                    placeholder="e.g. Bharat Petroleum Refinery / Reliance Petro"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Place of Supply (State)
                  </label>
                  <select
                    name="supplierPlaceOfSupply"
                    value={formData.supplierPlaceOfSupply || formData.buyerPlaceOfSupply}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, supplierPlaceOfSupply: val, buyerPlaceOfSupply: val }));
                    }}
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none cursor-pointer"
                  >
                    {indianStates.map((st, i) => (
                      <option key={i} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Full Address
                  </label>
                  <input
                    type="text"
                    name="supplierAddress"
                    value={formData.supplierAddress || formData.buyerAddress}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, supplierAddress: val, buyerAddress: val }));
                    }}
                    placeholder="Industrial Area, Refinery Gate No. 3, Hazira"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    name="supplierGSTIN"
                    value={formData.supplierGSTIN || formData.buyerGSTIN}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormData(prev => ({ ...prev, supplierGSTIN: val, buyerGSTIN: val }));
                    }}
                    maxLength={15}
                    placeholder="24BBBBB1111B1Z2"
                    className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier PAN (10 Digits)
                  </label>
                  <input
                    type="text"
                    name="supplierPAN"
                    value={formData.supplierPAN || formData.buyerPAN}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormData(prev => ({ ...prev, supplierPAN: val, buyerPAN: val }));
                    }}
                    maxLength={10}
                    placeholder="BBBBB1111B"
                    className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 outline-none"
                  />
                </div>
              </div>
            ) : (
              // Sales Form: Customer / Buyer Details
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer Entity / Name (M/s.)
                  </label>
                  <input
                    type="text"
                    name="buyerName"
                    value={formData.buyerName}
                    onChange={handleFormChange}
                    placeholder="e.g. Acme Infra & Transport Corp"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Place of Supply (State)
                  </label>
                  <select
                    name="buyerPlaceOfSupply"
                    value={formData.buyerPlaceOfSupply}
                    onChange={handleFormChange}
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none cursor-pointer"
                  >
                    {indianStates.map((st, i) => (
                      <option key={i} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer Full Address
                  </label>
                  <input
                    type="text"
                    name="buyerAddress"
                    value={formData.buyerAddress}
                    onChange={handleFormChange}
                    placeholder="Plot No. 12, Transport Nagar, Phase-I"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    name="buyerGSTIN"
                    value={formData.buyerGSTIN}
                    onChange={handleFormChange}
                    maxLength={15}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer PAN (10 Digits)
                  </label>
                  <input
                    type="text"
                    name="buyerPAN"
                    value={formData.buyerPAN}
                    onChange={handleFormChange}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Transport Info */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiOutlineTruck className="w-5 h-5 text-amber-600" />
              Transport & Fleet Parameters (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transporter Name
                </label>
                <input
                  type="text"
                  name="transporter"
                  value={formData.transporter}
                  onChange={handleFormChange}
                  placeholder="e.g. Express Roadlines"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  L.R. Number
                </label>
                <input
                  type="text"
                  name="lrNo"
                  value={formData.lrNo}
                  onChange={handleFormChange}
                  placeholder="LR-88219"
                  className="w-full p-2.5 text-sm font-mono rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  name="vehicleNo"
                  value={formData.vehicleNo}
                  onChange={handleFormChange}
                  placeholder="GJ-01-AB-1234"
                  className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Line Items */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HiOutlineSparkles className="w-5 h-5 text-purple-600" />
                Line Items & Products ({items.length})
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                <HiOutlinePlus className="w-4 h-4" /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. High Speed Diesel"
                      value={item.productName}
                      onChange={(e) => handleItemChange(item.id, "productName", e.target.value)}
                      required
                      className="w-full p-2 text-xs font-medium rounded-lg border border-slate-300 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      HSN / SAC
                    </label>
                    <input
                      type="text"
                      placeholder="27101930"
                      value={item.hsnSac}
                      onChange={(e) => handleItemChange(item.id, "hsnSac", e.target.value)}
                      className="w-full p-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                        required
                        min="0.001"
                        step="any"
                        className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-300 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="Ltr"
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                        required
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Rate (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, "rate", e.target.value)}
                      required
                      min="0"
                      step="any"
                      className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-300 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      GST %
                    </label>
                    <select
                      value={item.gstPercent}
                      onChange={(e) => handleItemChange(item.id, "gstPercent", Number(e.target.value))}
                      className="w-full p-2 text-xs font-bold rounded-lg border border-slate-300 bg-white outline-none cursor-pointer"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-2 pb-1">
                    <span className="text-xs font-mono font-bold text-slate-800 sm:hidden">
                      ₹ {Number(item.amount || 0).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Remove Row"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-400 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Another Product Row
            </button>
          </div>

          {/* Mobile Submit Button */}
          <div className="xl:hidden">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                billType === "purchase"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
              }`}
            >
              <HiOutlineArrowDownTray className="w-5 h-5" />
              {loading
                ? "Compiling PDF..."
                : billType === "purchase"
                ? `Generate Purchase Bill (₹ ${grandTotal.toLocaleString("en-IN")})`
                : `Generate Tax Invoice (₹ ${grandTotal.toLocaleString("en-IN")})`}
            </button>
          </div>
        </form>

        {/* Right Column: Sticky Live Summary (4 Cols on XL) */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sticky top-24 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HiOutlineDocumentText className={`w-5 h-5 ${billType === 'purchase' ? 'text-emerald-600' : 'text-blue-600'}`} />
                Live Calculation
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  billType === "purchase"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-blue-700 bg-blue-50 border-blue-200"
                }`}
              >
                {billType === "purchase" ? "Purchase / Inward" : "Sales / Outward"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Quantity:</span>
                <span className="font-mono font-semibold text-slate-900">{totalQty.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">₹ {subTotal.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>{billType === "purchase" ? "Input CGST Total:" : "CGST Total:"}</span>
                  <span className="font-mono font-semibold text-slate-800">₹ {totalCgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{billType === "purchase" ? "Input SGST Total:" : "SGST Total:"}</span>
                  <span className="font-mono font-semibold text-slate-800">₹ {totalSgst.toFixed(2)}</span>
                </div>
                {roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span className="font-mono">{roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-slate-900 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">
                    {billType === "purchase" ? "Net Purchase Amount:" : "Grand Total:"}
                  </span>
                  <span
                    className={`text-2xl font-black font-mono ${
                      billType === "purchase" ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    ₹ {grandTotal.toLocaleString('en-IN')}.00
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 italic">
                "{numberToWords(grandTotal)}"
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3.5 text-white text-sm font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
                  billType === "purchase"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
                }`}
              >
                <HiOutlineArrowDownTray className="w-5 h-5" />
                {loading
                  ? "Generating PDF..."
                  : billType === "purchase"
                  ? "Generate Purchase Bill PDF"
                  : "Generate Tax Invoice PDF"}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/dashboard"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                ← Return to Dashboard
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default InvoiceGenerator;
