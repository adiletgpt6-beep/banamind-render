// Pre-rendered sprites (built once per render worker) for the many repeated natural objects.
import { rng } from "../engines/math";
import { leafOutline, secondaryVein, SECONDARY_A0 } from "../engines/LeafGeometry";
import { SUN } from "../engines/EarthRenderer";

const mk = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return { c, g: c.getContext("2d")! };
};
// light comes from the upper-left (screen) — same sun as the planet
const LX = SUN[0], LY = -SUN[1];

const blob = (g: CanvasRenderingContext2D, x: number, y: number, r: number, hi: string, mid: string, lo: string) => {
  const gr = g.createRadialGradient(x + LX * r * 0.45, y + LY * r * 0.45, r * 0.05, x, y, r);
  gr.addColorStop(0, hi); gr.addColorStop(0.55, mid); gr.addColorStop(1, lo);
  g.fillStyle = gr;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
};

const cache: Record<string, HTMLCanvasElement> = {};

/** Broadleaf crown seen from above (with its cast shadow). Size S×S, crown radius S*0.36. */
export const crownSprite = (variant: number, hero = false) => {
  const key = `crown${variant}${hero}`;
  if (cache[key]) return cache[key];
  const S = hero ? 512 : 192;
  const { c, g } = mk(S, S);
  const R = rng(100 + variant), cx = S / 2, cy = S / 2, r = S * 0.36;
  // shadow toward lower-right
  g.fillStyle = "rgba(5,20,12,0.45)";
  g.filter = `blur(${S * 0.03}px)`;
  g.beginPath(); g.ellipse(cx - LX * r * 0.35, cy - LY * r * 0.35, r * 1.02, r * 0.95, 0, 0, Math.PI * 2); g.fill();
  g.filter = "none";
  const hues = hero
    ? ["#c9e88a", "#7fc16a", "#2f6a3c"]
    : [["#9fd27e", "#4f9a55", "#1f4a2c"], ["#8cc47a", "#3f8a4f", "#173f27"], ["#b0d888", "#5aa45a", "#24522f"], ["#93c98a", "#468f5c", "#1a4430"]][variant % 4];
  const n = hero ? 26 : 9;
  const parts = Array.from({ length: n }, () => {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.62;
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: r * (hero ? 0.26 + R() * 0.16 : 0.36 + R() * 0.2) };
  }).sort((p, q) => (q.x * LX + q.y * LY) - (p.x * LX + p.y * LY));
  blob(g, cx, cy, r * 0.95, hues[1], hues[2], hues[2]);
  for (const p of parts) blob(g, p.x, p.y, p.r, hues[0], hues[1], hues[2]);
  cache[key] = c;
  return c;
};

/** Conifer (spruce) from above: a dark jagged star with a lit side. */
export const coniferSprite = (variant: number) => {
  const key = `con${variant}`;
  if (cache[key]) return cache[key];
  const S = 160;
  const { c, g } = mk(S, S);
  const R = rng(300 + variant), cx = S / 2, cy = S / 2, r = S * 0.34;
  g.fillStyle = "rgba(4,16,10,0.5)";
  g.filter = "blur(4px)";
  g.beginPath(); g.ellipse(cx - LX * r * 0.4, cy - LY * r * 0.4, r, r * 0.9, 0, 0, Math.PI * 2); g.fill();
  g.filter = "none";
  for (let layer = 0; layer < 3; layer++) {
    const rr = r * (1 - layer * 0.28);
    g.beginPath();
    const k = 11 + layer * 2;
    for (let i = 0; i <= k * 2; i++) {
      const a = (i / (k * 2)) * Math.PI * 2 + R() * 0.15;
      const d = i % 2 ? rr * (0.55 + R() * 0.1) : rr * (0.95 + R() * 0.08);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    const gr = g.createRadialGradient(cx + LX * rr * 0.4, cy + LY * rr * 0.4, 1, cx, cy, rr);
    gr.addColorStop(0, ["#4f8f5e", "#5c9c66", "#6aa86e"][layer]);
    gr.addColorStop(1, ["#0f2e1f", "#173a26", "#21462d"][layer]);
    g.fillStyle = gr; g.fill();
  }
  cache[key] = c;
  return c;
};

/** Single leaf (tip pointing right, 512×(512*0.7)) — shade 0 bright … 2 dark. */
export const leafSprite = (shade: number) => {
  const key = `leaf${shade}`;
  if (cache[key]) return cache[key];
  const W = 512, H = 360;
  const { c, g } = mk(W, H);
  const s = (W * 0.94) / 900;
  g.translate(W / 2, H / 2);
  g.scale(s, s);
  const out = leafOutline(90, 4);
  g.beginPath();
  out.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
  g.closePath();
  const gr = g.createLinearGradient(-200, -300, 200, 300);
  const pal = [["#a9e07e", "#5cb35e", "#2f7a45"], ["#86c66c", "#479a52", "#24603a"], ["#5e9e5a", "#2f7444", "#173f28"]][shade];
  gr.addColorStop(0, pal[0]); gr.addColorStop(0.5, pal[1]); gr.addColorStop(1, pal[2]);
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(10,40,20,0.35)"; g.lineWidth = 6; g.stroke();
  g.strokeStyle = "rgba(230,250,190,0.55)"; g.lineWidth = 10;
  g.beginPath(); g.moveTo(-450, 0); g.lineTo(440, 0); g.stroke();
  g.lineWidth = 5; g.strokeStyle = "rgba(230,250,190,0.35)";
  for (const a0 of SECONDARY_A0) for (const sd of [1, -1] as const) {
    const v = secondaryVein(a0, sd);
    g.beginPath(); v.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
  }
  cache[key] = c;
  return c;
};
