// Общие помощники сцен фильма №36: время сцены и реплик, камера и планы,
// рисованный стиль референса — кремовая бумага с широкими мягкими
// диагоналями и неподвижным зерном, тонкий слегка неровный контур
// (неровность задана один раз, детерминированно), карандашная штриховка,
// тёмно-синие схемы-вставки со светлыми линиями, обводящие круги и стрелки.
import { createContext, useContext, useMemo } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { sceneTools } from "./plan";
import type { Sd2Timeline } from "./timing";
import { clamp, easeInOut, easeOut, hash01, lerp } from "./rig/motion";
import { SD2_VIDEO, type Sd2SceneId } from "./script";
import { C, INK_PX } from "./theme";
import { fontFamily } from "../fonts";

export const FPS = SD2_VIDEO.fps;
export const FONT = fontFamily;
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Кадр сцены и инструменты времени (plan.ts) текущей сцены.
export const useScene = (id: Sd2SceneId) => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  return { f, tl, ...sceneTools(tl, id) };
};

// План сцены: чистая функция от шкалы (кадры действий), одна и та же для
// анимации и звука.
export const usePlan = <T,>(fn: (tl: Sd2Timeline) => T): T => {
  const tl = useTimeline();
  return useMemo(() => fn(tl), [fn, tl]);
};

// ---------- Камера ----------
export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };
export const camMove = (f: number, a: number, b: number, c0: Cam, c1: Cam, ease = easeInOut): Cam => {
  const t = ease((f - a) / Math.max(1, b - a));
  return { x: lerp(c0.x, c1.x, t), y: lerp(c0.y, c1.y, t), zoom: lerp(c0.zoom, c1.zoom, t) };
};
// Несколько положений камеры подряд: [[кадр, Cam], …].
export const camKeys = (f: number, pts: readonly (readonly [number, Cam])[], ease = easeInOut): Cam => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (f <= pts[i][0]) return camMove(f, pts[i - 1][0], pts[i][0], pts[i - 1][1], pts[i][1], ease);
  }
  return pts[pts.length - 1][1];
};

const CamCtx = createContext<Cam>({ x: 540, y: 960, zoom: 1 });
export const useCam = () => useContext(CamCtx);

// Толщина контура в единицах мира для заданной толщины в пикселях кадра.
export const useInk = (px: number = INK_PX.main) => px / useCam().zoom;

// План: мир сцены в своих координатах (px), камера — точка мира в центре
// кадра 1080×1920 и масштаб. Рисуется только в кадрах [from, to).
export const Shot: React.FC<{
  readonly f: number;
  readonly from?: number;
  readonly to?: number;
  readonly cam: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
  readonly tint?: string; // лёгкий тон света поверх мира (тёплый/прохладный)
}> = ({ f, from = -1e9, to = 1e9, cam, bg = C.bg, children, overlay, tint }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: bg })}>
      <CamCtx.Provider value={cam}>
        <div
          style={box({
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
          })}
        >
          {children}
        </div>
      </CamCtx.Provider>
      {tint ? <div style={box({ inset: 0, backgroundColor: tint, pointerEvents: "none" })} /> : null}
      {overlay}
    </div>
  );
};

// SVG-слой в координатах мира.
export const Svg: React.FC<{ readonly children: React.ReactNode; readonly opacity?: number; readonly style?: React.CSSProperties }> = ({ children, opacity = 1, style }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity, ...style })}>
    {children}
  </svg>
);

// ---------- Бумага ----------
// Неподвижное зерно бумаги: один заранее созданный PNG (scripts/sd2d-paper.mjs),
// лежит в мире сцены и движется вместе с рисунком — не мерцает.
export const GRAIN = "assets/suitcase-36/paper-grain.png";

export type StripeTone = "warm" | "cool" | "green" | "none";
const STRIPES: Record<Exclude<StripeTone, "none">, string> = {
  warm: C.stripeA,
  cool: C.stripeB,
  green: "#E9EEDD",
};

// Кремовый лист с широкими мягкими диагоналями (по референсу) и зерном.
export const Paper: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly color?: string;
  readonly stripes?: StripeTone;
  readonly band?: number; // ширина полосы, px мира
  readonly grain?: number; // непрозрачность зерна
  readonly radius?: number;
}> = ({ x = -400, y = -400, w = 1880, h = 2720, color = C.bg, stripes = "warm", band = 150, grain = 0.5, radius = 0 }) => (
  <div style={box({ left: x, top: y, width: w, height: h, backgroundColor: color, overflow: "hidden", borderRadius: radius })}>
    {stripes !== "none" ? (
      <div
        style={box({
          inset: 0,
          backgroundImage: `repeating-linear-gradient(-38deg, ${STRIPES[stripes]} 0px, ${STRIPES[stripes]} ${band - 2}px, ${color} ${band + 2}px, ${color} ${band * 2 - 2}px, ${STRIPES[stripes]} ${band * 2 + 2}px)`,
          opacity: 0.85,
        })}
      />
    ) : null}
    <Grain opacity={grain} w={w} h={h} />
  </div>
);

// Зерно — плиткой из одного PNG (Img: Remotion ждёт загрузку перед кадром).
export const Grain: React.FC<{ readonly opacity?: number; readonly w?: number; readonly h?: number }> = ({ opacity = 0.5, w = 1880, h = 2720 }) => {
  const T = 512;
  const nx = Math.ceil(w / T);
  const ny = Math.ceil(h / T);
  return (
    <div style={box({ inset: 0, mixBlendMode: "multiply", opacity, overflow: "hidden" })}>
      {Array.from({ length: nx * ny }, (_, i) => (
        <Img key={i} src={staticFile(GRAIN)} style={box({ left: (i % nx) * T, top: Math.floor(i / nx) * T, width: T, height: T })} />
      ))}
    </div>
  );
};

// Мелкая «чертёжная» точка-крестик, как метки на полях референса.
export const PlusMark: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly color?: string }> = ({ x, y, s = 9, color = "rgba(36,50,74,0.25)" }) => (
  <path d={`M ${x - s} ${y} L ${x + s} ${y} M ${x} ${y - s} L ${x} ${y + s}`} stroke={color} strokeWidth={2} />
);

// ---------- Рисованный контур ----------
// Неровность — детерминированный шум по seed: одна и та же в каждом кадре.
const jit = (seed: number, i: number, amp: number) => (hash01(seed * 97.13 + i * 13.7) - 0.5) * 2 * amp;

// Чуть изогнутый отрезок: середина смещена поперёк, концы — немного.
const wobSeg = (x1: number, y1: number, x2: number, y2: number, seed: number, amp: number, first: boolean) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = jit(seed, 1, amp) * Math.min(1, len / 120);
  const mx = (x1 + x2) / 2 + nx * bow;
  const my = (y1 + y2) / 2 + ny * bow;
  const ex = x2 + jit(seed, 2, amp * 0.35);
  const ey = y2 + jit(seed, 3, amp * 0.35);
  const sx = x1 + jit(seed, 4, amp * 0.35);
  const sy = y1 + jit(seed, 5, amp * 0.35);
  return `${first ? `M ${sx.toFixed(1)} ${sy.toFixed(1)} ` : ""}Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
};

// Ломаная с рисованной неровностью (closed — замкнуть).
export const roughPath = (pts: readonly (readonly [number, number])[], seed = 1, amp = 2.2, closed = false) => {
  const n = pts.length;
  const segs: string[] = [];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    segs.push(wobSeg(a[0], a[1], b[0], b[1], seed + i * 3.1, amp, i === 0));
  }
  return segs.join(" ") + (closed ? " Z" : "");
};

// Прямоугольник со скруглёнными углами и рисованной неровностью.
export const roughRect = (x: number, y: number, w: number, h: number, r = 8, seed = 1, amp = 2.2) => {
  const j = (i: number) => jit(seed, i + 20, amp * 0.4);
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rr + j(0)} ${y + j(1)}`,
    `Q ${x + w / 2} ${y + jit(seed, 30, amp)} ${x + w - rr + j(2)} ${y + j(3)}`,
    `Q ${x + w} ${y} ${x + w + j(4)} ${y + rr + j(5)}`,
    `Q ${x + w + jit(seed, 31, amp)} ${y + h / 2} ${x + w + j(6)} ${y + h - rr + j(7)}`,
    `Q ${x + w} ${y + h} ${x + w - rr + j(8)} ${y + h + j(9)}`,
    `Q ${x + w / 2} ${y + h + jit(seed, 32, amp)} ${x + rr + j(10)} ${y + h + j(11)}`,
    `Q ${x} ${y + h} ${x + j(12)} ${y + h - rr + j(13)}`,
    `Q ${x + jit(seed, 33, amp)} ${y + h / 2} ${x + j(14)} ${y + rr + j(15)}`,
    `Q ${x} ${y} ${x + rr + j(0)} ${y + j(1)} Z`,
  ].join(" ");
};

// Эллипс с рисованной неровностью (контур чуть «не сходится»).
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed = 1, amp = 2) => {
  const N = 10;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.2;
    const k = 1 + jit(seed, i % N, amp / Math.max(rx, ry));
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  // сглаженная кривая через точки (Catmull-Rom → Безье)
  const P = pts.map((p) => p.split(" ").map(Number));
  let d = `M ${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

// Заливка + рисованный контур (контур поверх, толщина ink).
export const RoughBox: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly r?: number;
  readonly fill: string;
  readonly ink: number;
  readonly seed?: number;
  readonly hatch?: string; // id узора штриховки
  readonly stroke?: string;
  readonly opacity?: number;
}> = ({ x, y, w, h, r = 8, fill, ink, seed = 1, hatch, stroke = C.ink, opacity = 1 }) => {
  const d = roughRect(x, y, w, h, r, seed, Math.min(2.4, ink * 0.7));
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} />
      {hatch ? <path d={d} fill={`url(#${hatch})`} /> : null}
      <path d={d} fill="none" stroke={stroke} strokeWidth={ink} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

// Узоры карандашной штриховки (вставлять один раз в <defs> SVG сцены).
export const HatchDefs: React.FC<{ readonly id: string; readonly color?: string; readonly step?: number; readonly width?: number; readonly angle?: number }> = ({
  id,
  color = C.hatch,
  step = 11,
  width = 2,
  angle = -38,
}) => (
  <defs>
    <pattern id={id} patternUnits="userSpaceOnUse" width={step} height={step} patternTransform={`rotate(${angle})`}>
      <line x1={0} y1={0} x2={0} y2={step} stroke={color} strokeWidth={width} />
    </pattern>
  </defs>
);

// ---------- Акценты (появляются в момент повествования) ----------
// Обводящий круг с четырьмя засечками (как в референсе). t — кадры от начала.
export const Ring: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly t: number; readonly color?: string; readonly width?: number; readonly dur?: number; readonly out?: number }> = ({
  x,
  y,
  r,
  t,
  color = C.yellowDeep,
  width = 4,
  dur = 14,
  out = 1e9,
}) => {
  if (t < 0) return null;
  const p = easeOut(t / dur);
  const o = 1 - clamp((t - out) / 8);
  const L = 2 * Math.PI * r;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={width} strokeDasharray={`${L * p} ${L}`} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
      {[45, 135, 225, 315].map((a) => {
        const ra = (a * Math.PI) / 180;
        const cx = x + Math.cos(ra) * r;
        const cy = y + Math.sin(ra) * r;
        const s = 9 * clamp((t - dur * 0.6) / 6);
        return <path key={a} d={`M ${cx - s} ${cy - s} L ${cx + s} ${cy + s} M ${cx - s} ${cy + s} L ${cx + s} ${cy - s}`} stroke={color} strokeWidth={width * 0.8} strokeLinecap="round" />;
      })}
    </g>
  );
};

// Рисованная стрелка по точкам; прорисовывается за dur кадров.
export const DrawArrow: React.FC<{ readonly pts: readonly (readonly [number, number])[]; readonly t: number; readonly dur?: number; readonly color?: string; readonly width?: number; readonly dash?: boolean; readonly head?: boolean; readonly seed?: number }> = ({
  pts,
  t,
  dur = 16,
  color = C.ink,
  width = 4,
  dash = false,
  head = true,
  seed = 3,
}) => {
  if (t < 0) return null;
  const p = easeInOut(t / dur);
  const d = roughPath(pts, seed, 1.5);
  // длина ломаной (приближённо)
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  L *= 1.05;
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const hs = 16 + width * 1.5;
  const hp = clamp((p - 0.85) / 0.15);
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash ? undefined : `${L * p} ${L}`}
        style={dash ? { strokeDasharray: "14 12" } : undefined}
        opacity={dash ? p : 1}
      />
      {head && hp > 0 ? (
        <path
          d={`M ${b[0] - Math.cos(ang - 0.45) * hs} ${b[1] - Math.sin(ang - 0.45) * hs} L ${b[0]} ${b[1]} L ${b[0] - Math.cos(ang + 0.45) * hs} ${b[1] - Math.sin(ang + 0.45) * hs}`}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={hp}
        />
      ) : null}
    </g>
  );
};

// ---------- Тёмно-синяя схема-вставка ----------
// Полный кадр: тёмно-синий фон с тонкой сеткой, линейками по краям и
// угловыми метками; содержимое — в пикселях кадра (1080×1920).
export const Blueprint: React.FC<{ readonly children?: React.ReactNode; readonly t?: number }> = ({ children, t = 100 }) => {
  const o = clamp(t / 6);
  return (
    <div style={box({ inset: 0, backgroundColor: C.navy, overflow: "hidden" })}>
      <div
        style={box({
          inset: 0,
          background: "radial-gradient(circle at 50% 45%, rgba(70,100,150,0.35), rgba(23,39,68,0) 62%)",
        })}
      />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0, opacity: o })}>
        {/* сетка */}
        {Array.from({ length: 28 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={1920} stroke={C.line} strokeWidth={1} opacity={i % 5 === 0 ? 0.1 : 0.045} />
        ))}
        {Array.from({ length: 49 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={1080} y2={i * 40} stroke={C.line} strokeWidth={1} opacity={i % 5 === 0 ? 0.1 : 0.045} />
        ))}
        {/* линейки по краям */}
        <line x1={44} y1={180} x2={44} y2={1700} stroke={C.line} strokeWidth={2} opacity={0.35} />
        {Array.from({ length: 39 }, (_, i) => (
          <line key={`t${i}`} x1={44} y1={180 + i * 40} x2={i % 5 === 0 ? 62 : 54} y2={180 + i * 40} stroke={C.line} strokeWidth={2} opacity={0.35} />
        ))}
        <line x1={1036} y1={180} x2={1036} y2={1700} stroke={C.line} strokeWidth={2} opacity={0.2} />
        {/* угловые метки */}
        {[
          [90, 150],
          [990, 150],
          [90, 1770],
          [990, 1770],
        ].map(([x, y], i) => (
          <path key={i} d={`M ${x - 14} ${y} L ${x + 14} ${y} M ${x} ${y - 14} L ${x} ${y + 14}`} stroke={C.line} strokeWidth={2} opacity={0.5} />
        ))}
      </svg>
      {children}
    </div>
  );
};

// Линия схемы, прорисовывающаяся от начала к концу (светлая на синем).
export const BpLine: React.FC<{ readonly d: string; readonly len: number; readonly t: number; readonly dur?: number; readonly color?: string; readonly width?: number; readonly dashed?: boolean; readonly glow?: boolean }> = ({
  d,
  len,
  t,
  dur = 18,
  color = C.line,
  width = 3,
  dashed = false,
  glow = false,
}) => {
  if (t < 0) return null;
  const p = easeInOut(t / dur);
  return (
    <g>
      {glow ? <path d={d} fill="none" stroke={color} strokeWidth={width * 4} opacity={0.12 * p} strokeLinecap="round" /> : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? `10 12` : `${len * p} ${len}`}
        opacity={dashed ? p : 1}
      />
    </g>
  );
};

// Плавное «появиться — держаться — исчезнуть» (0…1) по кадрам.
export const fadeIO = (f: number, a: number, b: number, inDur = 8, outDur = 8) =>
  clamp((f - a) / inDur) * (1 - clamp((f - (b - outDur)) / outDur));

// Короткая упругая остановка без перелёта (для эмоциональных сцен —
// без комичного отскока).
export const settle = (t: number, dur = 14) => easeOut(clamp(t / dur));

// Деревья, горы и прочие детали фона используют детерминированный шум.
export const noise = hash01;

export const useFrame = () => useCurrentFrame();
export { Img };
