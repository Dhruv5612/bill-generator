/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  HiOutlineArrowPath,
  HiOutlineCubeTransparent,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineSquare3Stack3D,
} from "react-icons/hi2";
import {
  createBackEmblemTexture,
  createInvoiceCardTexture,
  createRupeeCoinTexture,
  createStageGlowTexture,
} from "../utils/billCraft3dTextures";

const MODE_ITEMS = [
  { id: "gst", label: "Tax Invoice" },
  { id: "fuel", label: "Fuel & Fleet" },
  { id: "vault", label: "Company Vault" },
];

const PART_INSIGHTS = {
  invoice: {
    title: "Vector A4 Tax Invoice Core",
    detail: "Live CGST/SGST math, HSN codes, QR verification & instant PDF dispatch.",
    accent: "text-sky-300",
  },
  rupee: {
    title: "Precision Indian Billing (₹)",
    detail: "Auto-rounded Grand Total with Indian Crore/Lakh amount-in-words output.",
    accent: "text-amber-300",
  },
  tax: {
    title: "Automated 50/50 CGST & SGST Split",
    detail: "Dual tax cubes represent real-time intra-state 0%, 5%, 12%, 18% & 28% slabs.",
    accent: "text-indigo-300",
  },
  fuel: {
    title: "Fuel Station & Fleet Logistics Pod",
    detail: "Dedicated Lorry Receipt (L.R. No), Vehicle No & bulk diesel delivery memos.",
    accent: "text-emerald-300",
  },
  vault: {
    title: "Multi-Company Profile Vault",
    detail: "Switch saved GSTIN, PAN, Bank & IFSC profiles in 1 click or enter manually.",
    accent: "text-violet-300",
  },
};

const MODE_DEFAULT_PART = {
  gst: "invoice",
  fuel: "fuel",
  vault: "vault",
};

function createRoundedCardGeometry(width, height, radius, depth) {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

function tagInteractivePart(object3d, partId) {
  object3d.userData.partId = partId;
  object3d.traverse((child) => {
    child.userData.partId = partId;
  });
}

function disposeObjectResources(root) {
  root.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => {
      if (!mat) return;
      if (mat.map) mat.map.dispose();
      mat.dispose();
    });
  });
}

const BillCraft3DScene = ({
  mode = "gst",
  onModeChange,
  subtotal = 955,
  cgst = 23.88,
  sgst = 23.88,
  grandTotal = 1003,
  gstPercent = 5,
}) => {
  const mountRef = useRef(null);
  const [internalMode, setInternalMode] = useState(mode);
  const [exploded, setExploded] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [activePart, setActivePart] = useState("invoice");
  const [webglReady, setWebglReady] = useState(true);

  const activeMode = onModeChange ? mode : internalMode;

  const stateRef = useRef({
    mode: activeMode,
    exploded: false,
    autoSpin: true,
    rotX: 0.08,
    rotY: -0.34,
    targetRotX: 0.08,
    targetRotY: -0.34,
    hoverX: 0,
    hoverY: 0,
    isDragging: false,
    dragDistance: 0,
    lastPointerX: 0,
    lastPointerY: 0,
  });

  const sceneHandlesRef = useRef({
    invoiceFrontMaterial: null,
  });

  useEffect(() => {
    stateRef.current.mode = activeMode;
    setActivePart(MODE_DEFAULT_PART[activeMode] || "invoice");
  }, [activeMode]);

  useEffect(() => {
    stateRef.current.exploded = exploded;
  }, [exploded]);

  useEffect(() => {
    stateRef.current.autoSpin = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;
    const handles = sceneHandlesRef.current;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglReady(false);
      return undefined;
    }

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 7.9);

    // Multi-point studio lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
    keyLight.position.set(4.2, 5.5, 5.5);
    scene.add(keyLight);

    const rimBlue = new THREE.PointLight(0x38bdf8, 6.5, 16);
    rimBlue.position.set(-3.8, 2.2, 2.5);
    scene.add(rimBlue);

    const accentEmerald = new THREE.PointLight(0x10b981, 4.5, 14);
    accentEmerald.position.set(3.4, -2.2, 2.4);
    scene.add(accentEmerald);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Backplate slab + rear emblem for full 360-degree rotation
    const backplateGroup = new THREE.Group();
    const backplateGeo = createRoundedCardGeometry(2.74, 3.46, 0.18, 0.08);
    const backplateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.65,
      roughness: 0.32,
    });
    const backplateMesh = new THREE.Mesh(backplateGeo, backplateMat);
    backplateGroup.add(backplateMesh);

    const backEmblemMat = new THREE.MeshStandardMaterial({
      map: createBackEmblemTexture(),
      roughness: 0.35,
      metalness: 0.25,
    });
    const backEmblemFace = new THREE.Mesh(new THREE.PlaneGeometry(2.44, 3.16), backEmblemMat);
    backEmblemFace.rotation.y = Math.PI;
    backEmblemFace.position.z = -0.068;
    backplateGroup.add(backEmblemFace);

    backplateGroup.position.z = -0.18;
    tagInteractivePart(backplateGroup, "invoice");
    rootGroup.add(backplateGroup);

    // 2. Holographic security foil layer
    const foilGeo = createRoundedCardGeometry(2.62, 3.34, 0.15, 0.02);
    const foilMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0.34,
      transmission: 0.35,
      ior: 1.4,
    });
    const foilMesh = new THREE.Mesh(foilGeo, foilMat);
    foilMesh.position.z = -0.06;
    tagInteractivePart(foilMesh, "invoice");
    rootGroup.add(foilMesh);

    // 3. Main Invoice Slab + Live Canvas Texture Front Face
    const invoiceGroup = new THREE.Group();
    const cardFrameGeo = createRoundedCardGeometry(2.54, 3.26, 0.14, 0.06);
    const cardFrameMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.18,
      roughness: 0.35,
    });
    const cardFrameMesh = new THREE.Mesh(cardFrameGeo, cardFrameMat);
    invoiceGroup.add(cardFrameMesh);

    const frontMat = new THREE.MeshStandardMaterial({
      roughness: 0.28,
      metalness: 0.04,
    });
    sceneHandlesRef.current.invoiceFrontMaterial = frontMat;

    const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 3.08), frontMat);
    frontFace.position.z = 0.058;
    invoiceGroup.add(frontFace);

    tagInteractivePart(invoiceGroup, "invoice");
    rootGroup.add(invoiceGroup);

    // 4. Spinning 3D Rupee Coin Token (top-right)
    const coinGroup = new THREE.Group();
    coinGroup.position.set(1.74, 1.18, 0.42);
    const coinSpinPivot = new THREE.Group();
    const coinTex = createRupeeCoinTexture();
    const coinSideMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
    });
    const coinFaceMat = new THREE.MeshStandardMaterial({
      map: coinTex,
      metalness: 0.72,
      roughness: 0.26,
    });
    const coinMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.09, 40),
      [coinSideMat, coinFaceMat, coinFaceMat]
    );
    coinMesh.rotation.x = Math.PI / 2;
    coinSpinPivot.add(coinMesh);
    coinGroup.add(coinSpinPivot);

    const coinRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.018, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.7 })
    );
    coinGroup.add(coinRing);
    tagInteractivePart(coinGroup, "rupee");
    rootGroup.add(coinGroup);

    // 5. Twin CGST & SGST Split Prisms (bottom-right)
    const taxGroup = new THREE.Group();
    taxGroup.position.set(1.78, -0.92, 0.36);

    const cgstBox = new THREE.Mesh(
      createRoundedCardGeometry(0.54, 0.54, 0.08, 0.46),
      new THREE.MeshPhysicalMaterial({
        color: 0x2563eb,
        metalness: 0.25,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      })
    );
    cgstBox.position.set(-0.22, 0.2, 0);

    const sgstBox = new THREE.Mesh(
      createRoundedCardGeometry(0.54, 0.54, 0.08, 0.46),
      new THREE.MeshPhysicalMaterial({
        color: 0x6366f1,
        metalness: 0.25,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      })
    );
    sgstBox.position.set(0.24, -0.22, 0.18);

    taxGroup.add(cgstBox, sgstBox);
    tagInteractivePart(taxGroup, "tax");
    rootGroup.add(taxGroup);

    // 6. Fuel & Fleet Tanker Pod (bottom-left)
    const fuelGroup = new THREE.Group();
    fuelGroup.position.set(-1.82, -0.96, 0.32);

    const tankBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 0.62, 12, 24),
      new THREE.MeshStandardMaterial({
        color: 0x059669,
        metalness: 0.55,
        roughness: 0.25,
      })
    );
    tankBody.rotation.z = Math.PI / 2;
    fuelGroup.add(tankBody);

    const tankCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.028, 12, 36),
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
        metalness: 0.6,
        roughness: 0.2,
      })
    );
    tankCollar.rotation.y = Math.PI / 2;
    fuelGroup.add(tankCollar);

    tagInteractivePart(fuelGroup, "fuel");
    rootGroup.add(fuelGroup);

    // 7. Multi-Company Profile Vault Cards (top-left)
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(-1.76, 0.95, 0.14);
    const vaultColors = [0x1e293b, 0x3b82f6, 0x6366f1];
    const vaultCards = vaultColors.map((hex, index) => {
      const card = new THREE.Mesh(
        createRoundedCardGeometry(0.92, 0.58, 0.07, 0.03),
        new THREE.MeshStandardMaterial({
          color: hex,
          metalness: 0.35,
          roughness: 0.28,
          transparent: true,
          opacity: index === 0 ? 0.95 : 0.85,
        })
      );
      card.position.set(index * 0.1, -index * 0.1, index * 0.12);
      card.rotation.z = -0.08 + index * 0.05;
      vaultGroup.add(card);
      return card;
    });
    tagInteractivePart(vaultGroup, "vault");
    rootGroup.add(vaultGroup);

    // 8. Orbital Pedestal & Floating Ambient Particles
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.96, 0);

    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 5.2),
      new THREE.MeshBasicMaterial({
        map: createStageGlowTexture(),
        transparent: true,
        depthWrite: false,
      })
    );
    glowPlane.rotation.x = -Math.PI / 2;
    pedestalGroup.add(glowPlane);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.014, 10, 80),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    );
    outerRing.rotation.x = Math.PI / 2;
    pedestalGroup.add(outerRing);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.012, 10, 64),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.45 })
    );
    innerRing.rotation.x = Math.PI / 2;
    pedestalGroup.add(innerRing);
    rootGroup.add(pedestalGroup);

    // Subtle particle constellation
    const particleCount = 65;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5 - 0.8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
      })
    );
    scene.add(particles);

    // Pointer Interaction + Raycasting
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const dom = renderer.domElement;

    const handlePointerDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragDistance = 0;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
    };

    const handlePointerMove = (e) => {
      const rect = dom.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.hoverX = nx * 0.14;
      stateRef.current.hoverY = ny * 0.1;

      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastPointerX;
      const dy = e.clientY - stateRef.current.lastPointerY;
      stateRef.current.dragDistance += Math.hypot(dx, dy);
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
      stateRef.current.targetRotY += dx * 0.0085;
      stateRef.current.targetRotX = Math.max(
        -0.55,
        Math.min(0.6, stateRef.current.targetRotX + dy * 0.0065)
      );
    };

    const handlePointerUp = (e) => {
      const wasClick = stateRef.current.isDragging && stateRef.current.dragDistance < 6;
      stateRef.current.isDragging = false;
      if (!wasClick) return;

      const rect = dom.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(rootGroup.children, true);
      const hitPart = hits.find((h) => h.object?.userData?.partId)?.object?.userData?.partId;
      if (hitPart && PART_INSIGHTS[hitPart]) {
        setActivePart(hitPart);
      }
    };

    const handlePointerLeave = () => {
      stateRef.current.isDragging = false;
      stateRef.current.hoverX = 0;
      stateRef.current.hoverY = 0;
    };

    dom.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    dom.addEventListener("pointerleave", handlePointerLeave);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextW = Math.max(260, entry.contentRect.width);
      const nextH = Math.max(320, entry.contentRect.height);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const fuelScaleVec = new THREE.Vector3(1, 1, 1);
    const vaultScaleVec = new THREE.Vector3(1, 1, 1);
    let animId = 0;
    let explodeFactor = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const s = stateRef.current;

      if (s.autoSpin && !s.isDragging) {
        s.targetRotY += 0.0032;
      }

      const desiredX = s.targetRotX - (s.isDragging ? 0 : s.hoverY);
      const desiredY = s.targetRotY + (s.isDragging ? 0 : s.hoverX);
      s.rotX += (desiredX - s.rotX) * 0.08;
      s.rotY += (desiredY - s.rotY) * 0.08;

      rootGroup.rotation.x = s.rotX;
      rootGroup.rotation.y = s.rotY;
      rootGroup.position.y = Math.sin(t * 1.4) * 0.07;

      // Exploded view interpolation
      const targetExplode = s.exploded ? 1 : 0;
      explodeFactor += (targetExplode - explodeFactor) * 0.1;

      backplateGroup.position.z = -0.18 - explodeFactor * 0.55;
      foilMesh.position.z = -0.06 - explodeFactor * 0.16;
      invoiceGroup.position.z = explodeFactor * 0.35;

      // Subsystem micro-animations
      coinGroup.position.y = 1.18 + Math.sin(t * 2.1) * 0.1;
      coinGroup.position.x = 1.74 + explodeFactor * 0.45;
      coinSpinPivot.rotation.y = t * 1.35;
      coinRing.rotation.x = Math.sin(t * 1.2) * 0.45;
      coinRing.rotation.y = t * 0.9;

      taxGroup.position.x = 1.78 + explodeFactor * 0.5;
      cgstBox.rotation.x = t * 0.6;
      cgstBox.rotation.y = t * 0.8;
      sgstBox.rotation.x = -t * 0.5;
      sgstBox.rotation.y = -t * 0.7;

      fuelGroup.position.x = -1.82 - explodeFactor * 0.5;
      fuelGroup.position.y = -0.96 + Math.cos(t * 1.7) * 0.09;
      fuelGroup.rotation.y = Math.sin(t * 0.9) * 0.35;

      vaultGroup.position.x = -1.76 - explodeFactor * 0.5;
      vaultCards.forEach((card, idx) => {
        card.position.z = idx * (0.12 + explodeFactor * 0.24);
        card.position.x = idx * (0.1 + explodeFactor * 0.16);
      });

      outerRing.rotation.z = t * 0.3;
      innerRing.rotation.z = -t * 0.45;
      particles.rotation.y = t * 0.04;

      // Subtle mode highlight scale boost
      const fuelScale = s.mode === "fuel" ? 1.15 : 1;
      const vaultScale = s.mode === "vault" ? 1.15 : 1;
      fuelScaleVec.set(fuelScale, fuelScale, fuelScale);
      vaultScaleVec.set(vaultScale, vaultScale, vaultScale);
      fuelGroup.scale.lerp(fuelScaleVec, 0.1);
      vaultGroup.scale.lerp(vaultScaleVec, 0.1);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      dom.removeEventListener("pointerleave", handlePointerLeave);
      handles.invoiceFrontMaterial = null;
      disposeObjectResources(scene);
      renderer.dispose();
      if (dom.parentNode === container) {
        container.removeChild(dom);
      }
    };
  }, []);

  // Populate and update the live 3D invoice card texture whenever mode or GST math changes
  useEffect(() => {
    const mat = sceneHandlesRef.current.invoiceFrontMaterial;
    if (!mat) return;
    const nextTexture = createInvoiceCardTexture({
      mode: activeMode,
      subtotal,
      cgst,
      sgst,
      grandTotal,
      gstPercent,
    });
    const prevTexture = mat.map;
    mat.map = nextTexture;
    mat.needsUpdate = true;
    if (prevTexture) prevTexture.dispose();
  }, [activeMode, subtotal, cgst, sgst, grandTotal, gstPercent]);

  const handleModeSelect = (nextMode) => {
    if (onModeChange) {
      onModeChange(nextMode);
    } else {
      setInternalMode(nextMode);
    }
  };

  const handleResetView = () => {
    stateRef.current.targetRotX = 0.08;
    stateRef.current.targetRotY = -0.34;
    setExploded(false);
    setAutoSpin(true);
    setActivePart(MODE_DEFAULT_PART[activeMode] || "invoice");
  };

  const activeInfo = PART_INSIGHTS[activePart] || PART_INSIGHTS.invoice;

  if (!webglReady) {
    return (
      <div className="relative h-[440px] sm:h-[490px] w-full rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 p-6 flex flex-col justify-between text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/15 px-3 py-1 rounded-full border border-sky-400/30">
            <HiOutlineSparkles className="w-4 h-4" /> BillCraft 3D Preview
          </span>
          <span className="text-xs font-mono text-emerald-300">GST READY</span>
        </div>
        <div className="my-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transform -rotate-2 shadow-2xl">
          <p className="text-xs uppercase tracking-widest text-sky-300 font-bold">
            Tax Invoice • GSTIN Verified
          </p>
          <p className="text-3xl font-black font-mono mt-2">
            ₹ {Number(grandTotal || 0).toLocaleString("en-IN")}.00
          </p>
          <p className="text-xs text-slate-300 mt-1">
            CGST ({gstPercent / 2}%) + SGST ({gstPercent / 2}%) auto-computed
          </p>
        </div>
        <p className="text-xs text-slate-400">Interactive 3D view requires WebGL enabled in browser.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[450px] sm:h-[510px] w-full rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl shadow-blue-950/30 overflow-hidden select-none">
      {/* Ambient studio glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />

      {/* Top Studio Controls */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80">
          {MODE_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleModeSelect(item.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeMode === item.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setExploded((prev) => !prev)}
            title="Toggle Exploded 3D Layers"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border backdrop-blur-md transition-all cursor-pointer ${
              exploded
                ? "bg-sky-500/25 border-sky-400/60 text-sky-200"
                : "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white"
            }`}
          >
            <HiOutlineSquare3Stack3D className="w-3.5 h-3.5" />
            <span>Explode</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoSpin((prev) => !prev)}
            title={autoSpin ? "Pause rotation" : "Resume rotation"}
            aria-label={autoSpin ? "Pause rotation" : "Resume rotation"}
            className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            {autoSpin ? <HiOutlinePause className="w-3.5 h-3.5" /> : <HiOutlinePlay className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleResetView}
            title="Reset 3D camera"
            aria-label="Reset 3D camera"
            className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <HiOutlineArrowPath className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        aria-label="Interactive 3D GST and Fuel Invoice showcase"
      />

      {/* Bottom Interactive Inspection HUD */}
      <div className="pointer-events-none absolute bottom-3.5 left-3.5 right-3.5 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3.5 py-2.5 max-w-xs shadow-lg">
          <p className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${activeInfo.accent}`}>
            <HiOutlineCubeTransparent className="w-3.5 h-3.5" />
            {activeInfo.title}
          </p>
          <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
            {activeInfo.detail}
          </p>
        </div>

        <span className="self-start sm:self-end text-[10px] font-medium text-slate-400 bg-slate-950/75 border border-slate-800 px-2.5 py-1 rounded-full backdrop-blur-sm">
          Drag 360° • Click 3D parts
        </span>
      </div>
    </div>
  );
};

export default BillCraft3DScene;
