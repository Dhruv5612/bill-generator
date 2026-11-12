import * as THREE from "three";

const MODE_PALETTES = {
  gst: {
    badge: "GST TAX INVOICE",
    title: "SHREE GANESH ENTERPRISE",
    subtitle: "G.I.D.C. Phase-II, Ahmedabad • GSTIN: 24AABCS1429B1Z5",
    accentStart: "#2563eb",
    accentEnd: "#4f46e5",
    pillBg: "#dbeafe",
    pillText: "#1d4ed8",
    tagLeft: "INV #GT/2026/842",
    tagRight: "HSN 27101930",
    line1: "High Speed Diesel (Bulk)",
    line2: "15W-40 Fleet Engine Oil",
  },
  fuel: {
    badge: "FUEL & FLEET MEMO",
    title: "HIGHWAY PETROLEUM LOGISTICS",
    subtitle: "NH-48 Corridor Hub • Vehicle: MH-04-CX-8899",
    accentStart: "#059669",
    accentEnd: "#0284c7",
    pillBg: "#d1fae5",
    pillText: "#047857",
    tagLeft: "L.R. NO: LR-90421",
    tagRight: "FLEET DISPATCH",
    line1: "HSD Tanker Delivery (Ltr)",
    line2: "AdBlue DEF Diesel Exhaust",
  },
  vault: {
    badge: "MULTI-COMPANY VAULT",
    title: "SAVED BUSINESS PROFILES",
    subtitle: "1-Click Auto-Fill • GSTIN, PAN, Bank & IFSC Ready",
    accentStart: "#4f46e5",
    accentEnd: "#7c3aed",
    pillBg: "#ede9fe",
    pillText: "#5b21b6",
    tagLeft: "3 VERIFIED ENTITIES",
    tagRight: "AUTO-FILL LOCKED",
    line1: "24AABCS1429B1Z5 • Gujarat",
    line2: "27AAACN8821K1Z2 • Maharashtra",
  },
};

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function formatInr(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function drawQrBlock(ctx, x, y, size) {
  ctx.fillStyle = "#f8fafc";
  drawRoundedRect(ctx, x, y, size, size, 12);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.stroke();

  const cells = 7;
  const pad = 12;
  const cellSize = (size - pad * 2) / cells;
  ctx.fillStyle = "#0f172a";

  // Deterministic QR-like matrix pattern representing verified e-invoice hash
  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const isCorner =
        (row < 2 && col < 2) ||
        (row < 2 && col >= cells - 2) ||
        (row >= cells - 2 && col < 2);
      const pseudoBit = ((row * 7 + col * 13 + row * col) % 3) === 0;
      if (isCorner || pseudoBit) {
        ctx.fillRect(
          x + pad + col * cellSize + 1,
          y + pad + row * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
      }
    }
  }
}

/**
 * Generates a high-DPI 3D invoice card CanvasTexture synced with live BillCraft GST math.
 */
export function createInvoiceCardTexture({
  mode = "gst",
  subtotal = 955,
  cgst = 23.88,
  sgst = 23.88,
  grandTotal = 1003,
  gstPercent = 5,
} = {}) {
  const palette = MODE_PALETTES[mode] || MODE_PALETTES.gst;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1320;
  const ctx = canvas.getContext("2d");

  // Crisp paper surface background
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1320);
  bgGrad.addColorStop(0, "#ffffff");
  bgGrad.addColorStop(1, "#f1f5f9");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle top accent header card
  const headerGrad = ctx.createLinearGradient(48, 48, 976, 260);
  headerGrad.addColorStop(0, palette.accentStart);
  headerGrad.addColorStop(1, palette.accentEnd);
  ctx.fillStyle = headerGrad;
  drawRoundedRect(ctx, 48, 48, 928, 224, 28);
  ctx.fill();

  // Header badge pill
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  drawRoundedRect(ctx, 84, 82, 290, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  ctx.fillText(palette.badge, 106, 111);

  // Header brand title & subtitle
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 36px Inter, system-ui, sans-serif";
  ctx.fillText(palette.title, 84, 176);
  ctx.fillStyle = "rgba(226, 232, 240, 0.92)";
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.fillText(palette.subtitle, 84, 220);

  // Metadata bar
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, 48, 304, 928, 106, 22);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = palette.pillBg;
  drawRoundedRect(ctx, 76, 332, 260, 50, 14);
  ctx.fill();
  ctx.fillStyle = palette.pillText;
  ctx.font = "700 21px Inter, system-ui, sans-serif";
  ctx.fillText(palette.tagLeft, 96, 365);

  ctx.fillStyle = "#334155";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.fillText("BillCraft GST Pro • Vector A4", 374, 365);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 20px monospace";
  ctx.textAlign = "right";
  ctx.fillText(palette.tagRight, 944, 365);
  ctx.textAlign = "left";

  // Line items table container
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, 48, 444, 928, 336, 24);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Table header row
  ctx.fillStyle = "#f8fafc";
  drawRoundedRect(ctx, 50, 446, 924, 72, 22);
  ctx.fill();

  ctx.fillStyle = "#475569";
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  ctx.fillText("DESCRIPTION / HSN", 84, 490);
  ctx.textAlign = "right";
  ctx.fillText("TAXABLE", 736, 490);
  ctx.fillText("GST", 936, 490);
  ctx.textAlign = "left";

  // Row 1
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 25px Inter, system-ui, sans-serif";
  ctx.fillText(palette.line1, 84, 582);
  ctx.fillStyle = "#64748b";
  ctx.font = "500 20px Inter, system-ui, sans-serif";
  ctx.fillText("Automated CGST/SGST tax split applied", 84, 616);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 24px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`₹ ${formatInr(subtotal)}`, 736, 592);
  ctx.fillStyle = palette.accentStart;
  ctx.fillText(`${gstPercent}%`, 936, 592);
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 650);
  ctx.lineTo(944, 650);
  ctx.stroke();

  // Row 2
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 25px Inter, system-ui, sans-serif";
  ctx.fillText(palette.line2, 84, 706);
  ctx.fillStyle = "#64748b";
  ctx.font = "500 20px Inter, system-ui, sans-serif";
  ctx.fillText("Compliant Indian Tax Format • Instant PDF", 84, 740);

  ctx.fillStyle = "#059669";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("VERIFIED", 936, 718);
  ctx.textAlign = "left";

  // Bottom summary + QR panel
  ctx.fillStyle = "#0f172a";
  drawRoundedRect(ctx, 48, 816, 928, 334, 28);
  ctx.fill();

  drawQrBlock(ctx, 84, 856, 176);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 20px Inter, system-ui, sans-serif";
  ctx.fillText(`CGST (${gstPercent / 2}%)`, 298, 886);
  ctx.fillText(`SGST (${gstPercent / 2}%)`, 298, 932);
  ctx.fillText("Taxable Base", 298, 978);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "700 22px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`₹ ${formatInr(cgst)}`, 936, 886);
  ctx.fillText(`₹ ${formatInr(sgst)}`, 936, 932);
  ctx.fillText(`₹ ${formatInr(subtotal)}`, 936, 978);
  ctx.textAlign = "left";

  // Grand total divider
  ctx.strokeStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(298, 1008);
  ctx.lineTo(936, 1008);
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.fillText("GRAND TOTAL (ROUNDED)", 298, 1054);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 46px monospace";
  ctx.fillText(`₹ ${Number(grandTotal || 0).toLocaleString("en-IN")}.00`, 298, 1114);

  // Compliance stamp bar at bottom
  ctx.fillStyle = "#ecfdf5";
  drawRoundedRect(ctx, 48, 1184, 928, 88, 22);
  ctx.fill();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#047857";
  ctx.font = "800 24px Inter, system-ui, sans-serif";
  ctx.fillText("✓  ORIGINAL FOR RECIPIENT  •  AUTO-PDF & SMTP READY", 92, 1236);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a brushed metallic Rupee (₹) emblem texture for the 3D coin faces.
 */
export function createRupeeCoinTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(200, 180, 30, 256, 256, 256);
  grad.addColorStop(0, "#fde68a");
  grad.addColorStop(0.55, "#f59e0b");
  grad.addColorStop(1, "#b45309");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Concentric engraved rim
  ctx.strokeStyle = "rgba(255, 251, 235, 0.65)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(256, 256, 212, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(120, 53, 15, 0.45)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 184, 0, Math.PI * 2);
  ctx.stroke();

  // Crisp Rupee Symbol
  ctx.fillStyle = "#451a03";
  ctx.font = "900 210px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("₹", 256, 272);

  ctx.fillStyle = "#fef3c7";
  ctx.fillText("₹", 252, 266);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates the backplate emblem texture so rotating the 3D invoice 360 degrees stays detailed.
 */
export function createBackEmblemTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 990;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 768, 990);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(0.5, "#1e1b4b");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 990);

  // Blueprint architectural grid
  ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
  ctx.lineWidth = 1.5;
  for (let x = 48; x < 768; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 990);
    ctx.stroke();
  }
  for (let y = 48; y < 990; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(768, y);
    ctx.stroke();
  }

  // Center holographic ring
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(384, 430, 138, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(384, 430, 162, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.font = "900 84px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BC", 384, 456);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 34px Inter, system-ui, sans-serif";
  ctx.fillText("BILLCRAFT GST PRO", 384, 650);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 20px Inter, system-ui, sans-serif";
  ctx.fillText("VECTOR PDF • FLEET MEMO • AUTO-TAX", 384, 694);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a subtle radial glowing stage texture for the holographic pedestal.
 */
export function createStageGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(256, 256, 16, 256, 256, 256);
  grad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
  grad.addColorStop(0.45, "rgba(79, 70, 229, 0.2)");
  grad.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
