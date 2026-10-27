import * as THREE from "three";

// Sculpted silhouettes and swept locks. These are actual 3D surfaces, not
// billboard images: profile and three-quarter views keep their volume.
// Head shape: children have a wide, round skull and cheeks; adults a smaller,
// longer oval with a narrower jaw so the family reads as grown-ups and a child.
export const headShape = (child: boolean) => ({
  rx: child ? 0.185 : 0.158,
  ry: child ? 0.204 : 0.224,
  rz: 0.145,
  jaw: child ? 0.12 : 0.30,
});
const cheekAt = (uy: number, child: boolean) =>
  1 + (child ? 0.10 : 0.06) * Math.exp(-(((uy + 0.18) / 0.45) ** 2));
const chinAt = (uy: number, jaw: number) => (uy < -0.45 ? 1 - (Math.abs(uy) - 0.45) * jaw : 1);

// Front surface depth of the head at (x, y): eyes, brows and mouth are seated
// on the actual skin instead of floating in front of it.
export const headSurfaceZ = (child: boolean, x: number, y: number) => {
  const h = headShape(child);
  const uy = y / h.ry;
  const ux = x / (h.rx * cheekAt(uy, child) * chinAt(uy, h.jaw));
  return Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy)) * h.rz * 1.03;
};

export const headGeometry = (child: boolean) => {
  const h = headShape(child);
  const g = new THREE.SphereGeometry(1, 64, 48);
  const a = g.getAttribute("position");
  const colors: number[] = [];
  const peach = new THREE.Color("#F5BCAD");
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
    const px = x * h.rx * cheekAt(y, child) * chinAt(y, h.jaw);
    const py = y * h.ry;
    const pz = z * h.rz * (z > 0 ? 1.03 : 1);
    a.setXYZ(i, px, py, pz);
    const bx = child ? 0.109 : 0.094;
    const blush = z > 0 ? Math.exp(-(((Math.abs(px) - bx) / 0.031) ** 2) - ((py + 0.035) / 0.028) ** 2) * (child ? 0.5 : 0.28) : 0;
    const c = new THREE.Color("#FFFFFF").lerp(peach, blush);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
};

export type HairStyle = {
  front: (ux: number) => number; // hairline height on the face (unit sphere y)
  side: number; // lowest hair at the temples/ears
  back: number; // lowest hair at the nape
  volume: number; // extra thickness on the crown
  bob?: boolean; // hangs straight down around the cheeks and neck
};

// One continuous hair mass around the skull. Outside the hair region the
// shell sinks under the skin, so the hairline is a soft rounded edge and the
// silhouette is closed: no thin tubes, spikes or holes.
export const hairShell = (child: boolean, style: HairStyle) => {
  const h = headShape(child);
  const g = new THREE.SphereGeometry(1, 128, 96);
  const a = g.getAttribute("position");
  const smooth = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
    const az = Math.abs(Math.atan2(x, z));
    const front = 1 - smooth(0.62, 1.12, az);
    const back = smooth(1.75, 2.55, az);
    const bound = THREE.MathUtils.lerp(THREE.MathUtils.lerp(style.side, style.back, back), style.front(x), front);
    const m = smooth(bound - 0.05, bound + 0.13, y);
    const k = 0.9 + (1.035 + style.volume * Math.max(0, y) - 0.9) * m;
    let hx = x * cheekAt(y, child) * chinAt(y, h.jaw), hz = z;
    if (style.bob && y < 0.15 && front < 0.5) {
      const r = Math.hypot(hx, hz), want = Math.max(r, 0.985);
      const f = m * (1 - front * 2);
      hx *= THREE.MathUtils.lerp(1, want / Math.max(r, 1e-4), f); hz *= THREE.MathUtils.lerp(1, want / Math.max(r, 1e-4), f);
    }
    a.setXYZ(i, hx * h.rx * k, y * h.ry * (k + style.volume * 0.4 * Math.max(0, y) * m), hz * h.rz * (z > 0 ? 1.03 : 1) * k);
  }
  g.computeVertexNormals();
  return g;
};

// Spherical cap facing +z with a planar UV, so a round iris texture wraps the
// eyeball surface without stretching.
export const sphereCap = (radius: number, angle: number) => {
  const g = new THREE.SphereGeometry(radius, 40, 12, 0, Math.PI * 2, 0, angle);
  g.rotateX(Math.PI / 2);
  const pos = g.getAttribute("position"), uv = g.getAttribute("uv");
  const span = 2 * radius * Math.sin(angle);
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / span, 0.5 + pos.getY(i) / span);
  return g;
};

export const sweptLock = (points: readonly number[][], width: number, thickness: number) => {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number, number, number])), false, "centripetal");
  const frames = curve.computeFrenetFrames(28, false);
  const pos: number[] = [], uv: number[] = [], indices: number[] = [];
  const ring = 14;
  for (let j = 0; j <= 28; j++) {
    const u = j / 28, center = curve.getPoint(u);
    const taper = Math.max(0.025, Math.sin(Math.PI * u) ** 0.70) * (1 - u * 0.22);
    for (let k = 0; k <= ring; k++) {
      const a = k / ring * Math.PI * 2;
      const p = center.clone().addScaledVector(frames.normals[j], Math.cos(a) * width * taper)
        .addScaledVector(frames.binormals[j], Math.sin(a) * thickness * taper);
      pos.push(...p.toArray()); uv.push(k / ring, u);
    }
  }
  for (let j = 0; j < 28; j++) for (let k = 0; k < ring; k++) {
    const a = j * (ring + 1) + k, b = a + ring + 1;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  // Closed roots and tips: an open sweep looks like a hollow tube in close-up.
  for (const end of [0, 1]) {
    const center = pos.length / 3;
    pos.push(...curve.getPoint(end).toArray()); uv.push(0.5, end);
    const offset = end * 28 * (ring + 1);
    for (let k = 0; k < ring; k++) {
      if (end === 0) indices.push(center, offset + k + 1, offset + k);
      else indices.push(center, offset + k, offset + k + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices); g.computeVertexNormals(); return g;
};

export const irisTexture = () => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 14, 128, 128, 128);
  r.addColorStop(0, "#120D0B"); r.addColorStop(0.36, "#1A120E");
  r.addColorStop(0.47, "#7A5236"); r.addColorStop(0.78, "#5C3D27"); r.addColorStop(0.93, "#3A281B"); r.addColorStop(1, "#2A1D15");
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 96; i++) {
    const a = i * Math.PI * 2 / 96;
    g.strokeStyle = i % 3 ? "rgba(227,168,93,0.16)" : "rgba(18,12,10,0.25)"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(128 + Math.cos(a) * 54, 128 + Math.sin(a) * 54);
    g.lineTo(128 + Math.cos(a + 0.01) * 112, 128 + Math.sin(a + 0.01) * 112); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
