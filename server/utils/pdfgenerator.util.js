const { jsPDF } = require("jspdf");
require("jspdf-autotable");

function numberToWords(num) {
    if (num === 0) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
}

function convertAmountToWords(amount) {
    const splitStr = amount.toFixed(2).split('.');
    const rupees = parseInt(splitStr[0]);
    const paise = parseInt(splitStr[1]);
    let rupeesStr = rupees > 0 ? numberToWords(rupees) : 'Zero';
    if (paise > 0) {
        let paiseStr = numberToWords(paise);
        return `${rupeesStr} And ${paiseStr} Paise Only`;
    }
    return `${rupeesStr} Only`;
}

const generatePDF = async (billData) => {
  const isPurchase = (billData.billType === "purchase");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const midX = pageWidth / 2;
  
  // Outer Border
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

  if (isPurchase) {
    // ==========================================
    // PURCHASE BILL (INWARD SUPPLY) LAYOUT
    // ==========================================
    
    // Top Section: Header with Purchase distinction
    doc.setFillColor(220, 240, 230); // Soft emerald tint
    doc.rect(margin, margin, pageWidth - 2 * margin, 12, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20, 80, 50);
    doc.text("PURCHASE INVOICE", pageWidth / 2, margin + 8, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Purchaser / Record for: ${billData.companyName || "COMPANY NAME"}`, pageWidth / 2, margin + 17, { align: "center" });
    
    doc.setFontSize(8);
    doc.text(`E-mail : ${billData.companyEmail || ""}`, margin + 2, margin + 22);
    doc.text(`Mo : ${billData.companyMobile || ""}`, pageWidth - margin - 2, margin + 22, { align: "right" });
    
    // Line below header
    doc.line(margin, margin + 24, pageWidth - margin, margin + 24);

    // Subheader
    doc.setFont("helvetica", "bold");
    doc.text("Purchase Voucher", margin + 2, margin + 28);
    doc.setFontSize(10);
    doc.text("INWARD SUPPLY / PURCHASE BILL", pageWidth / 2, margin + 28, { align: "center" });
    doc.setFontSize(8);
    doc.text("Original for Purchaser", pageWidth - margin - 2, margin + 28, { align: "right" });

    // Line below subheader
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

    // Party Split: Supplier on Left, Purchaser on Right
    doc.line(midX, margin + 30, midX, margin + 75);

    // Left Side: Supplier / Vendor (Billed By)
    const supplierName = billData.supplierName || billData.buyerName || "";
    const supplierAddr = billData.supplierAddress || billData.buyerAddress || "";
    const supplierPos = billData.supplierPlaceOfSupply || billData.buyerPlaceOfSupply || "";
    const supplierPan = billData.supplierPAN || billData.buyerPAN || "";
    const supplierGst = billData.supplierGSTIN || billData.buyerGSTIN || "";

    doc.setFont("helvetica", "bold");
    doc.text("Supplier / Vendor (Billed By)", margin + (midX - margin)/2, margin + 34, { align: "center" });
    doc.text(`M/s. : ${supplierName}`, margin + 2, margin + 39);
    doc.setFont("helvetica", "normal");
    doc.text(supplierAddr, margin + 12, margin + 44);
    
    doc.setFont("helvetica", "bold");
    doc.text("Place of Supply :", margin + 2, margin + 50);
    doc.setFont("helvetica", "normal");
    doc.text(supplierPos, margin + 28, margin + 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("PAN No. :", margin + 2, margin + 55);
    doc.setFont("helvetica", "normal");
    doc.text(supplierPan, margin + 28, margin + 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN No. :", margin + 2, margin + 60);
    doc.setFont("helvetica", "normal");
    doc.text(supplierGst, margin + 28, margin + 60);

    // Right Side: Purchaser / Consignee (Billed To)
    doc.setFont("helvetica", "bold");
    doc.text("Purchaser / Consignee (Billed To)", midX + (pageWidth - midX - margin)/2, margin + 34, { align: "center" });
    doc.text(`M/s. : ${billData.companyName || ""}`, midX + 2, margin + 39);
    doc.setFont("helvetica", "normal");
    doc.text(billData.companyAddress || "", midX + 12, margin + 44);

    doc.setFont("helvetica", "bold");
    doc.text("Place of Supply :", midX + 2, margin + 50);
    doc.setFont("helvetica", "normal");
    doc.text(billData.buyerPlaceOfSupply || "24-Gujarat", midX + 28, margin + 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("PAN No. :", midX + 2, margin + 55);
    doc.setFont("helvetica", "normal");
    doc.text(billData.companyPAN || "", midX + 28, margin + 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN No. :", midX + 2, margin + 60);
    doc.setFont("helvetica", "normal");
    doc.text(billData.companyGSTIN || "", midX + 28, margin + 60);

    // Line below parties
    doc.line(margin, margin + 62, pageWidth - margin, margin + 62);

    // Transport Details & Purchase Numbers
    doc.setFont("helvetica", "bold");
    doc.text("Transporter :", margin + 2, margin + 66);
    doc.setFont("helvetica", "normal");
    doc.text(billData.transporter || "-", margin + 25, margin + 66);
    
    doc.setFont("helvetica", "bold");
    doc.text("L.R.No. :", margin + 2, margin + 70);
    doc.setFont("helvetica", "normal");
    doc.text(billData.lrNo || "-", margin + 25, margin + 70);
    
    doc.setFont("helvetica", "bold");
    doc.text("Vehicle No. :", margin + 2, margin + 74);
    doc.setFont("helvetica", "normal");
    doc.text(billData.vehicleNo || "-", margin + 25, margin + 74);

    doc.setFont("helvetica", "bold");
    doc.text("Purchase Bill #:", midX + 2, margin + 66);
    doc.setFont("helvetica", "normal");
    doc.text(billData.invoiceNumber || "", midX + 28, margin + 66);
    
    doc.setFont("helvetica", "bold");
    doc.text("Purchase Date :", midX + 2, margin + 70);
    doc.setFont("helvetica", "normal");
    doc.text(billData.billDate || "", midX + 28, margin + 70);

    doc.setFont("helvetica", "bold");
    doc.text("Vendor Bill Ref:", midX + 2, margin + 74);
    doc.setFont("helvetica", "normal");
    doc.text(billData.vendorBillNo ? `${billData.vendorBillNo} (${billData.vendorBillDate || billData.billDate})` : "-", midX + 28, margin + 74);

  } else {
    // ==========================================
    // SALES BILL (OUTWARD TAX INVOICE) LAYOUT
    // ==========================================

    // Top Section: Company Header
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, margin, pageWidth - 2 * margin, 12, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(billData.companyName || "COMPANY NAME", pageWidth / 2, margin + 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(billData.companyAddress || "Address here", pageWidth / 2, margin + 17, { align: "center" });
    
    doc.setFontSize(8);
    doc.text(`E-mail : ${billData.companyEmail || ""}`, margin + 2, margin + 22);
    doc.text(`Mo : ${billData.companyMobile || ""}`, pageWidth - margin - 2, margin + 22, { align: "right" });
    
    // Draw line below header
    doc.line(margin, margin + 24, pageWidth - margin, margin + 24);

    // Subheader: Debit Memo / TAX INVOICE / Duplicate
    doc.setFont("helvetica", "bold");
    doc.text("Debit Memo", margin + 2, margin + 28);
    doc.setFontSize(10);
    doc.text("TAX INVOICE", pageWidth / 2, margin + 28, { align: "center" });
    doc.setFontSize(8);
    doc.text("Original for Recipient", pageWidth - margin - 2, margin + 28, { align: "right" });

    // Draw line below subheader
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

    // Buyer & Ship To Split (Y: 30 to 60)
    doc.line(midX, margin + 30, midX, margin + 75);

    // Left Side: Buyer To Party
    doc.setFont("helvetica", "bold");
    doc.text("Buyer To Party", margin + (midX - margin)/2, margin + 34, { align: "center" });
    doc.text(`M/s. : ${billData.buyerName || ""}`, margin + 2, margin + 39);
    doc.setFont("helvetica", "normal");
    doc.text(billData.buyerAddress || "", margin + 12, margin + 44);
    
    doc.setFont("helvetica", "bold");
    doc.text("Place of Supply :", margin + 2, margin + 50);
    doc.setFont("helvetica", "normal");
    doc.text(billData.buyerPlaceOfSupply || "", margin + 28, margin + 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("PAN No. :", margin + 2, margin + 55);
    doc.setFont("helvetica", "normal");
    doc.text(billData.buyerPAN || "", margin + 28, margin + 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN No. :", margin + 2, margin + 60);
    doc.setFont("helvetica", "normal");
    doc.text(billData.buyerGSTIN || "", margin + 28, margin + 60);

    // Right Side: Ship To Party
    doc.setFont("helvetica", "bold");
    doc.text("Ship To Party", midX + (pageWidth - midX - margin)/2, margin + 34, { align: "center" });
    doc.text(`M/s. : ${billData.shipName || billData.buyerName || ""}`, midX + 2, margin + 39);
    doc.setFont("helvetica", "normal");
    doc.text(billData.shipAddress || billData.buyerAddress || "", midX + 12, margin + 44);

    doc.setFont("helvetica", "bold");
    doc.text("Place of Supply :", midX + 2, margin + 50);
    doc.setFont("helvetica", "normal");
    doc.text(billData.shipPlaceOfSupply || billData.buyerPlaceOfSupply || "", midX + 28, margin + 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("PAN No. :", midX + 2, margin + 55);
    doc.setFont("helvetica", "normal");
    doc.text(billData.shipPAN || billData.buyerPAN || "", midX + 28, margin + 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN No. :", midX + 2, margin + 60);
    doc.setFont("helvetica", "normal");
    doc.text(billData.shipGSTIN || billData.buyerGSTIN || "", midX + 28, margin + 60);

    // Draw line below parties
    doc.line(margin, margin + 62, pageWidth - margin, margin + 62);

    // Transport Details & Invoice Details
    doc.setFont("helvetica", "bold");
    doc.text("Transporter :", margin + 2, margin + 66);
    doc.setFont("helvetica", "normal");
    doc.text(billData.transporter || "", margin + 25, margin + 66);
    
    doc.setFont("helvetica", "bold");
    doc.text("L.R.No. :", margin + 2, margin + 70);
    doc.setFont("helvetica", "normal");
    doc.text(billData.lrNo || "", margin + 25, margin + 70);
    
    doc.setFont("helvetica", "bold");
    doc.text("Vehicle No. :", margin + 2, margin + 74);
    doc.setFont("helvetica", "normal");
    doc.text(billData.vehicleNo || "", margin + 25, margin + 74);

    doc.setFont("helvetica", "bold");
    doc.text("Invoice No. :", midX + 2, margin + 66);
    doc.setFont("helvetica", "normal");
    doc.text(billData.invoiceNumber || "", midX + 25, margin + 66);
    
    doc.setFont("helvetica", "bold");
    doc.text("Date :", midX + 2, margin + 74);
    doc.setFont("helvetica", "normal");
    doc.text(billData.billDate || "", midX + 25, margin + 74);
  }

  // ==========================================
  // LINE ITEMS TABLE (Common Table Structure)
  // ==========================================
  const tableY = margin + 75;
  const tableData = (billData.items || []).map((item, i) => [
    i + 1,
    item.productName,
    item.hsnSac || "",
    Number(item.qty).toFixed(3),
    item.unit || "Ton",
    Number(item.rate).toFixed(2),
    Number(item.gstPercent).toFixed(2),
    Number(item.amount).toFixed(2)
  ]);

  const headerFill = isPurchase ? [235, 247, 240] : [245, 247, 250];

  doc.autoTable({
    startY: tableY,
    head: [['SrNo', 'Product Name', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'GST %', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: headerFill, textColor: [0, 0, 0], lineWidth: 0.5, lineColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.5, lineColor: [0, 0, 0], fontSize: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'right', cellWidth: 25 },
    },
    margin: { left: margin, right: margin },
    tableLineWidth: 0.5,
    tableLineColor: [0, 0, 0],
  });

  const finalY = doc.lastAutoTable.finalY;

  // Render Total Qty and Subtotal Row
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(margin, finalY, pageWidth - 2 * margin, 8); // Box for Total
  
  doc.setFont("helvetica", "bold");
  doc.text("PAN No.: " + (billData.companyPAN || ""), margin + 2, finalY + 4);
  doc.text("GSTIN No.: " + (billData.companyGSTIN || ""), margin + 2, finalY + 7);
  
  // Calculate X positions for total boxes
  const qtyColX = doc.lastAutoTable.settings.margin.left + doc.lastAutoTable.columns[0].width + doc.lastAutoTable.columns[1].width + doc.lastAutoTable.columns[2].width;
  const qtyWidth = doc.lastAutoTable.columns[3].width;
  const amountColX = pageWidth - margin - doc.lastAutoTable.columns[7].width;

  doc.text("Total", qtyColX - 10, finalY + 5);
  doc.text(billData.totalQty ? billData.totalQty.toFixed(3) : "0.000", qtyColX + qtyWidth - 2, finalY + 5, { align: "right" });
  
  doc.text("Sub Total", amountColX - 15, finalY + 5);
  doc.text(billData.subTotal ? billData.subTotal.toFixed(2) : "0.00", pageWidth - margin - 2, finalY + 5, { align: "right" });

  // Bank & Taxes Section
  const footerStartY = finalY + 8;
  doc.rect(margin, footerStartY, pageWidth - 2 * margin, 25);
  doc.line(amountColX - 18, footerStartY, amountColX - 18, footerStartY + 25); // Split for Tax block

  doc.setFont("helvetica", "bold");
  doc.text(isPurchase ? "Purchaser Bank" : "Bank Name", margin + 2, footerStartY + 5);
  doc.text("Bank A/c. No.", margin + 2, footerStartY + 10);
  doc.text("RTGS/IFSC Code", margin + 2, footerStartY + 15);

  doc.setFont("helvetica", "normal");
  doc.text(": " + (billData.bankName || "N/A"), margin + 28, footerStartY + 5);
  doc.text(": " + (billData.bankAcNo || "N/A"), margin + 28, footerStartY + 10);
  doc.text(": " + (billData.bankIFSC || "N/A"), margin + 28, footerStartY + 15);

  // Tax Block
  doc.setFont("helvetica", "bold");
  doc.text(isPurchase ? "Taxable (Purch)" : "Taxable Amount", amountColX - 16, footerStartY + 5);
  doc.text(billData.subTotal ? billData.subTotal.toFixed(2) : "0.00", pageWidth - margin - 2, footerStartY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(isPurchase ? "Input CGST" : "Central Tax", amountColX - 16, footerStartY + 10);
  doc.text(isPurchase ? "Input SGST" : "State/UT Tax", amountColX - 16, footerStartY + 15);
  doc.text("Round Off", amountColX - 16, footerStartY + 20);

  // Get average GST for display
  const gstPercent = (billData.items && billData.items.length > 0) ? billData.items[0].gstPercent / 2 : 2.5;
  doc.text(`${gstPercent.toFixed(2)}%`, amountColX + 5, footerStartY + 10, { align: "right" });
  doc.text(`${gstPercent.toFixed(2)}%`, amountColX + 5, footerStartY + 15, { align: "right" });

  doc.text(billData.cgst ? billData.cgst.toFixed(2) : "0.00", pageWidth - margin - 2, footerStartY + 10, { align: "right" });
  doc.text(billData.sgst ? billData.sgst.toFixed(2) : "0.00", pageWidth - margin - 2, footerStartY + 15, { align: "right" });
  doc.text(billData.roundOff ? billData.roundOff.toFixed(2) : "0.00", pageWidth - margin - 2, footerStartY + 20, { align: "right" });

  // Amount In Words Section
  const amountWordsY = footerStartY + 25;
  doc.rect(margin, amountWordsY, pageWidth - 2 * margin, 12);
  
  doc.setFont("helvetica", "bold");
  doc.text(isPurchase ? "Total Input GST :" : "Total GST :", margin + 2, amountWordsY + 4);
  doc.text(isPurchase ? "Net Purchase Amt :" : "Bill Amount :", margin + 2, amountWordsY + 9);

  const totalGST = (billData.cgst || 0) + (billData.sgst || 0);
  doc.setFont("helvetica", "italic");
  doc.text(convertAmountToWords(totalGST), margin + 30, amountWordsY + 4);
  doc.text(convertAmountToWords(billData.grandTotal || 0), margin + 30, amountWordsY + 9);

  // Note Section
  doc.rect(margin, amountWordsY + 12, pageWidth - 2 * margin, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(isPurchase ? "Purchase Entry Note :" : "Note :", margin + 2, amountWordsY + 16);

  // Grand Total Box
  doc.rect(amountColX - 18, amountWordsY + 12, pageWidth - amountColX + 18 - margin, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Grand Total", amountColX - 16, amountWordsY + 16);
  doc.text(billData.grandTotal ? billData.grandTotal.toFixed(2) : "0.00", pageWidth - margin - 2, amountWordsY + 16, { align: "right" });

  // Terms & Conditions and Signature
  const termsY = amountWordsY + 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  if (isPurchase) {
    doc.text("Terms & Verification :", margin + 2, termsY + 4);
    doc.text("1. Goods/fuel received in sound condition and verified against purchase PO.", margin + 2, termsY + 8);
    doc.text("2. Eligible for Input Tax Credit (ITC) under Section 16 of CGST Act.", margin + 2, termsY + 12);
    doc.text("3. Discrepancies if any must be intimated to vendor within 48 hours.", margin + 2, termsY + 16);
    doc.text("4. Subject to Jurisdiction only. E.&.O.E", margin + 2, termsY + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Receiver / Storekeeper Signature", margin + 2, termsY + 26);
    doc.text(`For, ${billData.companyName || "COMPANY"}`, pageWidth - margin - 2, termsY + 4, { align: "right" });
    doc.text("(Purchaser Authorised Signatory)", pageWidth - margin - 2, termsY + 20, { align: "right" });
  } else {
    doc.text("Terms & Condition :", margin + 2, termsY + 4);
    doc.text("1. Goods once sold will not be taken back.", margin + 2, termsY + 8);
    doc.text("2. Interest @18% p.a. will be charged if payment is not made within due date.", margin + 2, termsY + 12);
    doc.text("3. Our risk and responsibility ceases as soon as the goods leave our premises.", margin + 2, termsY + 16);
    doc.text("4. Subject to Jurisdiction only. E.&.O.E", margin + 2, termsY + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`For, ${billData.companyName || "COMPANY"}`, pageWidth - margin - 2, termsY + 4, { align: "right" });
    doc.text("(Authorised Signatory)", pageWidth - margin - 2, termsY + 20, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
};

module.exports = { generatePDF };
