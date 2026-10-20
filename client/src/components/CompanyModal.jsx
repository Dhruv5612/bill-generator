import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineBuildingOffice2,
  HiOutlineIdentification,
  HiOutlineBanknotes,
  HiOutlineXMark,
  HiOutlineCheck,
} from "react-icons/hi2";

const CompanyModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyMobile: "",
    companyPAN: "",
    companyGSTIN: "",
    bankName: "",
    bankAcNo: "",
    bankIFSC: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        companyName: "",
        companyAddress: "",
        companyEmail: "",
        companyMobile: "",
        companyPAN: "",
        companyGSTIN: "",
        bankName: "",
        bankAcNo: "",
        bankIFSC: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-uppercase tax IDs
    if (name === "companyGSTIN" || name === "companyPAN" || name === "bankIFSC") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error("Company Name is required.");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <HiOutlineBuildingOffice2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {initialData ? "Edit Business Profile" : "Add New Business Profile"}
              </h2>
              <p className="text-xs text-slate-500">Configure company details, GSTIN and bank account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              <HiOutlineBuildingOffice2 className="w-4 h-4 text-blue-600" />
              <span>Business Identity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="e.g. Reliance Petroleum & Logistics Ltd."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Address
                </label>
                <textarea
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="Building, Street, Industrial Area, City, State - PIN"
                  rows="2"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="billing@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone / Mobile
                </label>
                <input
                  type="text"
                  name="companyMobile"
                  value={formData.companyMobile}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tax Identification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              <HiOutlineIdentification className="w-4 h-4 text-indigo-600" />
              <span>Tax & Registration Numbers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN Number (15 Digits)
                </label>
                <input
                  type="text"
                  name="companyGSTIN"
                  value={formData.companyGSTIN}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="24AAAAA0000A1Z5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN Number (10 Digits)
                </label>
                <input
                  type="text"
                  name="companyPAN"
                  value={formData.companyPAN}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Remittance Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              <HiOutlineBanknotes className="w-4 h-4 text-emerald-600" />
              <span>Bank Remittance for Invoice Memos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="e.g. State Bank of India"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Account No.
                </label>
                <input
                  type="text"
                  name="bankAcNo"
                  value={formData.bankAcNo}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm font-mono rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="123456789012"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="bankIFSC"
                  value={formData.bankIFSC}
                  onChange={handleChange}
                  className="w-full p-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 outline-none transition"
                  placeholder="SBIN0001234"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <HiOutlineCheck className="w-4 h-4" />
              {initialData ? "Save Changes" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal;
