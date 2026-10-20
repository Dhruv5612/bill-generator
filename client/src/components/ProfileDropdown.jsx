import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineShieldCheck,
  HiOutlineIdentification,
  HiOutlineEnvelope,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineSparkles,
} from "react-icons/hi2";

const ProfileDropdown = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [companiesCount, setCompaniesCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      const companyKey = user.id ? `savedCompanies_${user.id}` : "savedCompanies";
      const stored = localStorage.getItem(companyKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCompaniesCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch {
          setCompaniesCount(0);
        }
      }
    }
  }, [user]);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const shortId = user.id ? user.id.slice(-6).toUpperCase() : "PRO";

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Trigger Button */}
        <button
          type="button"
          id="profile-dropdown-btn"
          aria-label="User Profile Menu"
          className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/80 p-1.5 pr-2.5 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-xs transition-all shadow-2xs hover:shadow-xs group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
              {user.name}
            </p>
            <p className="text-[10px] text-blue-600 font-semibold leading-tight">
              Pro Account
            </p>
          </div>
          <HiOutlineChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header with User Info */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md mt-1 border border-emerald-200/60">
                    <HiOutlineShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Business Pro
                  </span>
                </div>
              </div>

              {/* Quick Details Pill Row */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px]">
                <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/50">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">User ID</span>
                  <span className="font-mono font-semibold text-slate-700">#{shortId}</span>
                </div>
                <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/50">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Entities</span>
                  <span className="font-semibold text-blue-700">{companiesCount} Saved</span>
                </div>
              </div>
            </div>

            {/* Navigation & Action Links */}
            <div className="p-2 space-y-1 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowDetailsModal(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer text-slate-700 hover:text-blue-600"
              >
                <HiOutlineIdentification className="w-4 h-4 text-blue-600" />
                View Profile Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer text-slate-700 hover:text-blue-600"
              >
                <HiOutlineBuildingOffice2 className="w-4 h-4 text-indigo-600" />
                Dashboard & Companies
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/invoice-generator");
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer text-slate-700 hover:text-blue-600"
              >
                <HiOutlineDocumentText className="w-4 h-4 text-emerald-600" />
                New Invoice Generator
              </button>
            </div>

            {/* Logout Action */}
            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                id="profile-dropdown-logout-btn"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
      {showDetailsModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlineUser className="w-5 h-5 text-blue-200" />
                  <h3 className="font-bold text-base tracking-tight">Account Profile Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                {/* User Avatar + Name Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-snug">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-200">
                      <HiOutlineShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Pro Member
                    </span>
                  </div>
                </div>

                {/* Detailed Specs List */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <HiOutlineIdentification className="w-4 h-4 text-blue-600" />
                      Account User ID
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {user.id || user._id || "Active-User"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <HiOutlineEnvelope className="w-4 h-4 text-indigo-600" />
                      Primary Email
                    </span>
                    <span className="font-semibold text-slate-800">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <HiOutlineBuildingOffice2 className="w-4 h-4 text-sky-600" />
                      Registered Businesses
                    </span>
                    <span className="font-semibold text-blue-700">{companiesCount} Business Profiles</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <HiOutlineClock className="w-4 h-4 text-amber-600" />
                      Session Inactivity Protection
                    </span>
                    <span className="font-semibold text-emerald-600">30 Min Auto-Timeout</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                  Log Out
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailsModal(false);
                      navigate("/dashboard");
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Open Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ProfileDropdown;
