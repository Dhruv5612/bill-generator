import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
    bankIFSC: ""
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
        bankIFSC: ""
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Company" : "Add Company"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          <form id="company-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter Company Name"
                required
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter Company Address"
                rows="2"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Email Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                type="text"
                name="companyMobile"
                value={formData.companyMobile}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Mobile Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="companyPAN"
                value={formData.companyPAN}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="PAN Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                type="text"
                name="companyGSTIN"
                value={formData.companyGSTIN}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="GSTIN"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mt-2 mb-2 border-b pb-1">Bank Details</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Bank Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="bankAcNo"
                value={formData.bankAcNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Account Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="bankIFSC"
                value={formData.bankIFSC}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="IFSC Code"
              />
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="company-form"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium shadow-sm"
          >
            Save Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
