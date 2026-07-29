import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompanyModal from "../components/CompanyModal";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // State for Companies
  const [companies, setCompanies] = useState([]);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Load Companies
    const storedCompanies = localStorage.getItem("savedCompanies");
    if (storedCompanies) setCompanies(JSON.parse(storedCompanies));

    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`);
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to download");
      }
    } catch (error) {
      console.error("Error downloading invoice", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setInvoices(invoices.filter(inv => inv._id !== id));
      } else {
        console.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting invoice", error);
    }
  };

  const handleSaveCompany = (companyData) => {
    const existingIndex = companies.findIndex(c => c.companyName.toLowerCase() === companyData.companyName.trim().toLowerCase());
    let updated;
    if (existingIndex >= 0) {
      updated = [...companies];
      updated[existingIndex] = companyData;
    } else {
      updated = [companyData, ...companies];
    }
    setCompanies(updated);
    localStorage.setItem("savedCompanies", JSON.stringify(updated));
    toast.success(`Saved company profile for "${companyData.companyName}"!`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastActivity");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center border-b border-gray-200">
        <div className="flex gap-6 items-center">
          <h2 className="text-xl font-bold text-gray-800">Invoice Dashboard</h2>
          <nav className="flex gap-4">
            <button className="text-blue-600 font-semibold border-b-2 border-blue-600">Dashboard</button>
            <button onClick={() => navigate('/invoice-generator')} className="text-gray-500 hover:text-gray-800 transition font-semibold">Generator</button>
          </nav>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200 cursor-pointer"
            >
              Log Out
            </button>
          </div>
        )}
      </header>

      <div className="p-8 max-w-6xl w-full mx-auto flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Invoices</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsCompanyModalOpen(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer font-medium shadow-sm"
            >
              + Add Company
            </button>
            <button 
              onClick={() => navigate('/invoice-generator')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium shadow-sm"
            >
              + Create New Invoice
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading your invoices...</p>
        ) : invoices.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-medium text-gray-600 mb-4">No invoices found</h3>
            <p className="text-gray-500 mb-6">You haven't generated any invoices yet.</p>
            <div className="flex gap-4 justify-center mt-4">
              <button 
                onClick={() => setIsCompanyModalOpen(true)}
                className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition cursor-pointer font-medium"
              >
                Add Company First
              </button>
              <button 
                onClick={() => navigate('/invoice-generator')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Generate First Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Invoice No</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Client Name</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-blue-600">{inv.invoiceNumber}</td>
                    <td className="p-4 text-gray-600">{inv.billDate}</td>
                    <td className="p-4 text-gray-800">{inv.clientName}</td>
                    <td className="p-4 text-gray-800 font-medium text-right">${inv.grandTotal?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Saved
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleDownload(inv._id, inv.invoiceNumber)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition cursor-pointer"
                      >
                        Download PDF
                      </button>
                      <button 
                        onClick={() => handleDelete(inv._id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm border border-red-500 hover:bg-red-50 px-3 py-1 rounded transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <CompanyModal 
          isOpen={isCompanyModalOpen} 
          onClose={() => setIsCompanyModalOpen(false)} 
          onSave={handleSaveCompany} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
