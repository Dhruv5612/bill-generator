import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CompanyModal from "../components/CompanyModal";
import ProfileDropdown from "../components/ProfileDropdown";
import { API_BASE_URL } from "../config/api";
import { toast } from "react-toastify";
import {
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyRupee,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCheckCircle,
  HiOutlineDocumentDuplicate,
  HiOutlineTruck,
  HiOutlineBanknotes,
} from "react-icons/hi2";

const Dashboard = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // State for Companies
  const [companies, setCompanies] = useState([]);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [expandedCompanyIndex, setExpandedCompanyIndex] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "companies", "invoices"

  const toggleCompanyExpand = (index) => {
    setExpandedCompanyIndex(expandedCompanyIndex === index ? null : index);
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    let userObj = null;
    if (storedUser) {
      userObj = JSON.parse(storedUser);
      setUser(userObj);
    }

    // Load Companies
    const companyKey = userObj ? `savedCompanies_${userObj.id}` : "savedCompanies";
    const storedCompanies = localStorage.getItem(companyKey);
    if (storedCompanies) {
      try {
        setCompanies(JSON.parse(storedCompanies));
      } catch (e) {
        setCompanies([]);
      }
    }

    const fetchInvoices = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const token = sessionStorage.getItem("token");
      toast.info(`Preparing Invoice #${invoiceNumber}...`);
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${(invoiceNumber || "doc").replace('/', '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Invoice downloaded!");
      } else {
        toast.error("Failed to download PDF.");
      }
    } catch (error) {
      toast.error("Error downloading invoice.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice record?")) return;
    
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setInvoices(invoices.filter((inv) => inv._id !== id));
        toast.success("Invoice record deleted.");
      } else {
        toast.error("Failed to delete invoice.");
      }
    } catch (error) {
      toast.error("Error deleting invoice.");
    }
  };

  const handleSaveCompany = (companyData) => {
    let updated;
    if (editingCompany) {
      const index = companies.findIndex((c) => c.companyName === editingCompany.companyName);
      if (index !== -1) {
        updated = [...companies];
        updated[index] = companyData;
      } else {
        updated = [companyData, ...companies];
      }
    } else {
      const existingIndex = companies.findIndex(
        (c) => c.companyName.toLowerCase() === companyData.companyName.trim().toLowerCase()
      );
      if (existingIndex >= 0) {
        updated = [...companies];
        updated[existingIndex] = companyData;
      } else {
        updated = [companyData, ...companies];
      }
    }
    
    setCompanies(updated);
    const companyKey = user ? `savedCompanies_${user.id}` : "savedCompanies";
    localStorage.setItem(companyKey, JSON.stringify(updated));
    toast.success(`Saved profile for "${companyData.companyName}"!`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastActivity");
    navigate("/");
  };

  const openAddCompanyModal = () => {
    setEditingCompany(null);
    setIsCompanyModalOpen(true);
  };

  const openEditCompanyModal = (company) => {
    setEditingCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleDeleteCompany = (companyName) => {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"?`)) return;
    const updated = companies.filter((c) => c.companyName !== companyName);
    setCompanies(updated);
    const companyKey = user ? `savedCompanies_${user.id}` : "savedCompanies";
    localStorage.setItem(companyKey, JSON.stringify(updated));
    toast.success("Company profile deleted.");
  };

  // State for Type Filter ("all", "sales", "purchase")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");

  // KPI Calculations
  const salesInvoices = invoices.filter((inv) => inv.billType !== "purchase");
  const purchaseInvoices = invoices.filter((inv) => inv.billType === "purchase");

  const totalSalesRevenue = salesInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalPurchaseSpend = purchaseInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalInvoicesCount = invoices.length;
  const totalCompaniesCount = companies.length;

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    // Type Filter
    if (selectedTypeFilter === "sales" && inv.billType === "purchase") return false;
    if (selectedTypeFilter === "purchase" && inv.billType !== "purchase") return false;

    const q = searchQuery.toLowerCase();
    const invNum = (inv.invoiceNumber || "").toLowerCase();
    const buyer = (inv.buyerName || inv.clientName || inv.supplierName || "").toLowerCase();
    const supplier = (inv.supplierName || "").toLowerCase();
    const company = (inv.companyName || "").toLowerCase();
    const date = (inv.billDate || "").toLowerCase();
    const typeLabel = inv.billType === "purchase" ? "purchase purser inward" : "sales buyer outward";
    return (
      invNum.includes(q) ||
      buyer.includes(q) ||
      supplier.includes(q) ||
      company.includes(q) ||
      date.includes(q) ||
      typeLabel.includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
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
                BillCraft <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold tracking-normal">Dashboard</span>
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
                className="px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 font-bold transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/invoice-generator')}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Generator
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/invoice-generator')}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg shadow-xs transition cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4" /> New Invoice
            </button>
            {user && <ProfileDropdown user={user} handleLogout={handleLogout} />}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-8">
        
        {/* Welcome & KPI Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Business Owner"} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your company tax profiles, invoices, and billing history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddCompanyModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition cursor-pointer"
            >
              <HiOutlineBuildingOffice2 className="w-4 h-4 text-blue-600" />
              + Add Company
            </button>
            <button
              onClick={() => navigate('/invoice-generator')}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <HiOutlineCurrencyRupee className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales Billed</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                ₹ {totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold">{salesInvoices.length} Sales Invoices</p>
            </div>
          </div>

          {/* Card 2: Total Purchases */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <HiOutlineBanknotes className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Purchases</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                ₹ {totalPurchaseSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold">{purchaseInvoices.length} Purchase Bills</p>
            </div>
          </div>

          {/* Card 3: Active Companies */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <HiOutlineBuildingOffice2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved Companies</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                {totalCompaniesCount}
              </h3>
            </div>
          </div>

          {/* Card 4: Quick Action */}
          <div
            onClick={() => navigate('/invoice-generator')}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm shadow-blue-500/20 flex items-center justify-between cursor-pointer hover:shadow-md hover:from-blue-700 hover:to-indigo-800 transition"
          >
            <div>
              <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Fast Generator</p>
              <h3 className="text-lg font-bold text-white mt-0.5">New Tax Bill</h3>
              <p className="text-[11px] text-blue-100/80 mt-1">Generate PDF in 30s →</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <HiOutlineDocumentDuplicate className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Companies Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HiOutlineBuildingOffice2 className="w-5 h-5 text-blue-600" />
                My Business Profiles ({companies.length})
              </h2>
              <p className="text-xs text-slate-500">Entities configured for invoice header details and banking</p>
            </div>
            <button
              onClick={openAddCompanyModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer flex items-center gap-1"
            >
              <HiOutlinePlus className="w-3.5 h-3.5" /> Add Entity
            </button>
          </div>

          {companies.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-slate-300 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <HiOutlineBuildingOffice2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No company profile saved</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Add your business name, address, GSTIN, and bank account details so you can create invoices with 1-click selection.
              </p>
              <button
                onClick={openAddCompanyModal}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <HiOutlinePlus className="w-4 h-4" /> Add Company Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((company, index) => {
                const isExpanded = expandedCompanyIndex === index;
                const companyInvoices = invoices.filter(
                  (inv) => (inv.companyName || "").toLowerCase() === (company.companyName || "").toLowerCase()
                );

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div
                      className="p-5 flex justify-between items-start cursor-pointer select-none"
                      onClick={() => toggleCompanyExpand(index)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                            {company.companyName.charAt(0)}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{company.companyName}</h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{company.companyAddress || "No address provided"}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                          {company.companyGSTIN && (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
                              GST: {company.companyGSTIN}
                            </span>
                          )}
                          {company.bankName && (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <HiOutlineBanknotes className="w-3 h-3" /> {company.bankName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                          {companyInvoices.length} {companyInvoices.length === 1 ? "bill" : "bills"}
                        </span>
                        <div className="text-slate-400 p-1">
                          {isExpanded ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-700">Email:</span> {company.companyEmail || "N/A"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Phone:</span> {company.companyMobile || "N/A"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">PAN:</span> {company.companyPAN || "N/A"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">A/C:</span> {company.bankAcNo || "N/A"} ({company.bankIFSC || "N/A"})
                          </div>
                        </div>

                        {/* Company Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/invoice-generator', { state: { selectedCompany: company.companyName } });
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                          >
                            <HiOutlinePlus className="w-3.5 h-3.5" /> Generate Bill
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCompanyModal(company);
                              }}
                              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-white border border-slate-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <HiOutlinePencilSquare className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company.companyName);
                              }}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 border border-red-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoice Records Section */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HiOutlineDocumentDuplicate className="w-5 h-5 text-indigo-600" />
                Bills & Invoices Archive ({invoices.length})
              </h2>
              <p className="text-xs text-slate-500">Historical records of sales invoices and purchase bills saved in database.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <HiOutlineMagnifyingGlass className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bill #, buyer, vendor, date..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition bg-white"
              />
            </div>
          </div>

          {/* Bill Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTypeFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedTypeFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Records ({invoices.length})
            </button>
            <button
              onClick={() => setSelectedTypeFilter("sales")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedTypeFilter === "sales"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Sales Bills ({salesInvoices.length})
            </button>
            <button
              onClick={() => setSelectedTypeFilter("purchase")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedTypeFilter === "purchase"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Purchase Bills ({purchaseInvoices.length})
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
              Loading invoices from database...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <HiOutlineDocumentText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {searchQuery || selectedTypeFilter !== "all"
                  ? "No matching bills or invoices found"
                  : "No invoices generated yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {searchQuery || selectedTypeFilter !== "all"
                  ? "Try adjusting your search filter or selecting another tab."
                  : "Generate your first GST compliant sales or purchase invoice with automatic tax calculations."}
              </p>
              {!searchQuery && selectedTypeFilter === "all" && (
                <button
                  onClick={() => navigate('/invoice-generator')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                >
                  <HiOutlinePlus className="w-4 h-4" /> Generate First Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Bill #</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">Counterparty (Buyer / Vendor)</th>
                      <th className="p-4 text-right">Grand Total</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredInvoices.map((inv) => {
                      const isPurchase = inv.billType === "purchase";
                      return (
                        <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-mono font-bold">
                            <span className={isPurchase ? "text-emerald-700" : "text-blue-600"}>
                              {inv.invoiceNumber}
                            </span>
                          </td>
                          <td className="p-4">
                            {isPurchase ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Purchase Bill
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Sales Invoice
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 whitespace-nowrap">
                            {inv.billDate}
                          </td>
                          <td className="p-4 text-slate-800 font-semibold max-w-[150px] truncate">
                            {inv.companyName || "N/A"}
                          </td>
                          <td className="p-4 text-slate-700 max-w-[180px] truncate">
                            <span className="font-semibold text-slate-900">
                              {inv.supplierName || inv.buyerName || inv.clientName || (isPurchase ? "Vendor" : "Cash Customer")}
                            </span>
                            <span
                              className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isPurchase
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {isPurchase ? "Vendor" : "Buyer"}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                            ₹ {(inv.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                              <HiOutlineCheckCircle className="w-3 h-3" /> Stored
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleDownload(inv._id, inv.invoiceNumber)}
                                className={`inline-flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                                  isPurchase
                                    ? "text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100"
                                    : "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
                                }`}
                                title="Download PDF"
                              >
                                <HiOutlineArrowDownTray className="w-3.5 h-3.5" /> PDF
                              </button>
                              <button
                                onClick={() => handleDelete(inv._id)}
                                className="inline-flex items-center text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                                title="Delete Invoice Record"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <CompanyModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          onSave={handleSaveCompany}
          initialData={editingCompany}
        />
      </main>
    </div>
  );
};

export default Dashboard;
