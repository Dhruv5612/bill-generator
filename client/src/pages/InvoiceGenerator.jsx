import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

const InvoiceGenerator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const generateInvoiceNumber = () => {
    return `GT/${Math.floor(Math.random() * 100)}`;
  };

  const [formData, setFormData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    billDate: new Date().toISOString().split("T")[0],
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
    buyerPlaceOfSupply: "",
    buyerPAN: "",
    buyerGSTIN: "",
    shipName: "",
    shipAddress: "",
    shipPlaceOfSupply: "",
    shipPAN: "",
    shipGSTIN: "",
    transporter: "",
    lrNo: "",
    vehicleNo: "",
    email: "" // Optional if user wants to send email
  });

  const [savedCompanies, setSavedCompanies] = useState([]);

  useEffect(() => {
    const loaded = localStorage.getItem("savedCompanies");
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        setSavedCompanies(parsed);
        if (parsed.length > 0) {
          setFormData(prev => ({
            ...prev,
            ...parsed[0]
          }));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const single = localStorage.getItem("companyDetails");
      if (single) {
        try {
          const parsed = JSON.parse(single);
          setSavedCompanies([parsed]);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, []);

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
      toast.info(`Loaded company details for "${found.companyName}"`);
    }
  };



  const [items, setItems] = useState([
    { id: uuidv4(), productName: "", hsnSac: "", qty: "", unit: "", rate: "", gstPercent: "", amount: 0 }
  ]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "qty" || field === "rate") {
            updatedItem.amount = Number(updatedItem.qty) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), productName: "", hsnSac: "", qty: "", unit: "", rate: "", gstPercent: "", amount: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Calculations
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty), 0);
  const subTotal = items.reduce((sum, item) => sum + Number(item.amount), 0);
  
  // Calculate average GST or total CGST/SGST based on items
  // Assuming standard 5% split into 2.5% CGST and 2.5% SGST for simplicity of this demo
  let totalCgst = 0;
  let totalSgst = 0;
  items.forEach(item => {
      const taxAmt = (item.amount * (item.gstPercent / 100)) / 2;
      totalCgst += taxAmt;
      totalSgst += taxAmt;
  });

  const grandTotalExact = subTotal + totalCgst + totalSgst;
  const roundOff = Math.round(grandTotalExact) - grandTotalExact;
  const grandTotal = Math.round(grandTotalExact);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      items,
      totalQty,
      subTotal,
      taxableAmount: subTotal,
      cgst: totalCgst,
      sgst: totalSgst,
      roundOff,
      grandTotal
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${formData.invoiceNumber.replace('/','-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Tax Invoice generated and downloaded!");
        setFormData({ ...formData, invoiceNumber: generateInvoiceNumber() });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to generate the invoice.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
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
          <h2 className="text-xl font-bold text-gray-800">GST Invoice Generator</h2>
          <nav className="flex gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800 transition">Dashboard</button>
            <button className="text-blue-600 font-semibold border-b-2 border-blue-600">Generator</button>
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

      <main className="p-8 max-w-7xl mx-auto flex-1 w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-6">
          
          {/* Company Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Select Company</h3>
            {savedCompanies.length > 0 ? (
              <select
                required
                onChange={(e) => handleSelectCompany(e.target.value)}
                className="w-full p-2 border rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={formData.companyName || ""}
              >
                <option value="" disabled>Select a saved company...</option>
                {savedCompanies.map((c, idx) => (
                  <option key={idx} value={c.companyName}>{c.companyName}</option>
                ))}
              </select>
            ) : (
              <p className="text-red-500 text-sm">Please add a company from the Dashboard first.</p>
            )}
          </div>

          {/* Header Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input required type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleFormChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input required type="date" name="billDate" value={formData.billDate} onChange={handleFormChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>


          {/* Transport */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Transport Info</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
                <input type="text" name="transporter" value={formData.transporter} onChange={handleFormChange} className="w-full p-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">L.R. No</label>
                <input type="text" name="lrNo" value={formData.lrNo} onChange={handleFormChange} className="w-full p-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No.</label>
                <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleFormChange} className="w-full p-2 border rounded text-sm uppercase" />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Items</h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded border">
                  <div className="col-span-3"><input type="text" placeholder="Product Name" value={item.productName} onChange={(e) => handleItemChange(item.id, "productName", e.target.value)} className="w-full p-2 border rounded text-sm" required /></div>
                  <div className="col-span-2"><input type="text" placeholder="HSN/SAC" value={item.hsnSac} onChange={(e) => handleItemChange(item.id, "hsnSac", e.target.value)} className="w-full p-2 border rounded text-sm" /></div>
                  <div className="col-span-1"><input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(item.id, "qty", e.target.value)} className="w-full p-2 border rounded text-sm" required /></div>
                  <div className="col-span-1"><input type="text" placeholder="Unit" value={item.unit} onChange={(e) => handleItemChange(item.id, "unit", e.target.value)} className="w-full p-2 border rounded text-sm" required /></div>
                  <div className="col-span-2"><input type="number" placeholder="Rate" value={item.rate} onChange={(e) => handleItemChange(item.id, "rate", e.target.value)} className="w-full p-2 border rounded text-sm" required /></div>
                  <div className="col-span-1"><input type="number" placeholder="GST%" value={item.gstPercent} onChange={(e) => handleItemChange(item.id, "gstPercent", e.target.value)} className="w-full p-2 border rounded text-sm" required /></div>
                  <div className="col-span-1 text-right font-medium text-gray-700">₹{item.amount.toFixed(2)}</div>
                  <div className="col-span-1 text-center"><button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button></div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-blue-600 font-semibold text-sm hover:underline">+ Add Row</button>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md">
            Generate Tax Invoice
          </button>
        </form>

        {/* Live Summary Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Live Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600"><span>Total Qty</span><span className="font-medium text-gray-800">{totalQty.toFixed(3)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Sub Total</span><span className="font-medium text-gray-800">₹{subTotal.toFixed(2)}</span></div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between text-gray-600"><span>CGST</span><span className="font-medium text-gray-800">₹{totalCgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>SGST</span><span className="font-medium text-gray-800">₹{totalSgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Round Off</span><span className="font-medium text-gray-800">{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span></div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between text-gray-800 text-xl font-bold"><span>Grand Total</span><span className="text-blue-600">₹{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default InvoiceGenerator;
