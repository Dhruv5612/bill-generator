import React, { useState } from "react";
import {
  HiOutlineShieldExclamation,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineLockClosed,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";

const CompanyDeleteModal = ({ isOpen, onClose, onConfirm, company }) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !company) return null;

  const handleClose = () => {
    setConfirmText("");
    setIsDeleting(false);
    onClose();
  };

  const isConfirmed = confirmText.trim().toUpperCase() === "DELETE" || 
    confirmText.trim().toLowerCase() === company.companyName.trim().toLowerCase();

  const handleExecuteDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onConfirm(company.companyName);
    } finally {
      setIsDeleting(false);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50/50 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <HiOutlineShieldExclamation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                Protected Entity Deletion
                <HiOutlineLockClosed className="w-4 h-4 text-amber-600" />
              </h3>
              <p className="text-xs text-slate-500">Explicit permission required</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <HiOutlineBuildingOffice2 className="w-4 h-4 text-blue-600" />
              <span>{company.companyName}</span>
            </div>
            {company.companyGSTIN && (
              <p className="text-[11px] text-slate-500 font-mono">
                GSTIN: <span className="text-slate-700 font-bold">{company.companyGSTIN}</span>
              </p>
            )}
            {company.companyAddress && (
              <p className="text-[11px] text-slate-500 truncate">{company.companyAddress}</p>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
            <p className="font-semibold text-amber-900 mb-0.5">⚠️ Security Guard Active</p>
            This company is protected to ensure you never lose quick autofill when generating bills. It will NOT be deleted without your direct permission.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Type <span className="font-mono text-red-600">DELETE</span> to grant permission:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE" here'
              autoFocus
              className="w-full p-2.5 text-sm font-semibold rounded-xl border-2 border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 outline-none transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
          >
            Cancel (Keep Safe)
          </button>
          <button
            type="button"
            disabled={!isConfirmed || isDeleting}
            onClick={handleExecuteDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer"
          >
            <HiOutlineTrash className="w-4 h-4" />
            {isDeleting ? "Authorizing Removal..." : "Authorize Deletion"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDeleteModal;

