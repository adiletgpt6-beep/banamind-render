// Окно редактора кода и «нить мысли» — главная визуальная метафора ролика.
// Координаты — кадр 1080×1920. Окно в безопасной зоне Reels: сверху от
// 200 px, содержимое кода заканчивается выше субтитров (≈ 1380 px).
//
// Нить мысли — жёлтая линия, проведённая «от руки» через строки кода к
// закрывающей скобке. Она задаётся точками (Catmull-Rom), а рисуется
// кусками (ThreadPiece) — так её можно рвать, разбрасывать и сшивать.
import { fontFamily } from "../../fonts";
import { clamp, hash01, lerp } from "./rig/motion";
import { BG10_TEXT } from "./script";
import { NAVY, YELLOW } from "./sets/Office";

export const MONO = "'DejaVu Sans Mono', 'Liberation Mono', Menlo, Consolas, monospace";

export const WIN = { x: 36, y: 200, w: 1008, h: 1170, bar: 96 } as const;
export const CODE = { x: 150, y: 372, lh: 80, size: 38, gutter: 72 } as const;
export const lineY = (i: number) => CODE.y + i * CODE.lh;

// ---------- Окно ----------
export const EditorWindow: React.FC<{
  readonly tabs: readonly string[];
  readonly active: number;
  readonly tabIn?: number; // появление последней вкладки 0…1
  readonly children: React.ReactNode;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly opacity?: number;
}> = ({ tabs, active, tabIn = 1, children, x = 0, y = 0, scale = 1, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: WIN.x,
      top: WIN.y,
      width: WIN.w,
      height: WIN.h,
      borderRadius: 30,
      backgroundColor: "#FFFFFF",
      boxShadow: "0 30px 70px rgba(31,45,85,0.18), 0 0 0 3px #E6EAF2",
      overflow: "hidden",
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      transformOrigin: "50% 50%",
      opacity,
    }}
  >
    <div style={{ position: "absolute", left: 0, top: 0, width: WIN.w, height: WIN.bar, backgroundColor: "#F3F5FA", borderBottom: "3px solid #E6EAF2" }} />
    {["#FF6B5E", "#FFC727", "#3CC37A"].map((c, i) => (
      <div key={c} style={{ position: "absolute", left: 34 + i * 38, top: 36, width: 24, height: 24, borderRadius: 12, backgroundColor: c }} />
    ))}
    <div style={{ position: "absolute", left: 160, top: 18, display: "flex", gap: 10 }}>
      {tabs.map((t, i) => {
        const last = i === tabs.length - 1;
        const k = last ? tabIn : 1;
        if (k <= 0) return null;
        const on = i === active;
        return (
          <div
            key={t}
            style={{
              padding: "14px 24px",
              borderRadius: "16px 16px 0 0",
              backgroundColor: on ? "#FFFFFF" : "#E7EBF3",
              color: on ? NAVY : "#6B7591",
              fontFamily: on && t === BG10_TEXT.plan.newTab ? fontFamily : MONO,
              fontWeight: on ? 800 : 600,
              fontSize: 28,
              height: 50,
              boxSizing: "border-box",
              lineHeight: "22px",
              opacity: k,
              transform: `translateY(${(1 - k) * 30}px)`,
              borderTop: on ? `5px solid ${YELLOW}` : "5px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </div>
        );
      })}
    </div>
    {/* содержимое обрезается под панелью вкладок */}
    <div style={{ position: "absolute", left: 0, top: WIN.bar, width: WIN.w, height: WIN.h - WIN.bar, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -WIN.x, top: -WIN.y - WIN.bar, width: 1080, height: 1920 }}>{children}</div>
    </div>
  </div>
);

// ---------- Код ----------
const KW = new Set(["function", "const", "for", "of", "if", "continue", "return"]);
const tokens = (s: string) => s.split(/(\s+|[(){}[\].,;=])/).filter((x) => x !== "");
const colorOf = (t: string) => (KW.has(t) ? "#4C5FD5" : /^[(){}[\].,;=]$/.test(t) ? "#8A93A8" : /^[A-Z]/.test(t) ? "#C2571A" : NAVY);

export const CodeView: React.FC<{
  readonly scroll?: number; // смещение строк (px)
  readonly glitch?: number; // 0…1 — строки дрожат и раздваиваются
  readonly fade?: number; // 0…1 — текст расплывается («сброс контекста»)
  readonly seed?: number;
  readonly extra?: React.ReactNode;
}> = ({ scroll = 0, glitch = 0, fade = 0, seed = 1, extra }) => {
  const code = BG10_TEXT.editor.code;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
      {code.map((ln, i) => {
        const y = lineY(i) + scroll;
        const jx = glitch * (hash01(i * 7.1 + seed) - 0.5) * 60;
        const blur = fade * (1.5 + 3 * hash01(i + seed * 3));
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: y - CODE.size, height: CODE.lh, width: 1080 }}>
            <div style={{ position: "absolute", left: CODE.x - CODE.gutter - 10, width: CODE.gutter, textAlign: "right", fontFamily: MONO, fontSize: 30, color: "#B4BBCB", top: 8 }}>{i + 1}</div>
            <div
              style={{
                position: "absolute",
                left: CODE.x + jx,
                top: 0,
                fontFamily: MONO,
                fontSize: CODE.size,
                whiteSpace: "pre",
                filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                opacity: 1 - 0.45 * fade,
                textShadow: glitch > 0.05 ? `${glitch * 6}px 0 rgba(255,199,39,0.8), ${-glitch * 6}px 0 rgba(76,95,213,0.6)` : undefined,
              }}
            >
              {tokens(ln).map((t, k) => (
                <span key={k} style={{ color: colorOf(t), fontWeight: KW.has(t) ? 700 : 500 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {extra}
    </div>
  );
};

// Текстовый курсор (мигает, если blink).
export const Caret: React.FC<{ x: number; y: number; f: number; blink?: boolean; h?: number; color?: string }> = ({ x, y, f, blink = true, h = 50, color = NAVY }) => {
  const on = !blink || Math.floor(f / 15) % 2 === 0;
  return <div style={{ position: "absolute", left: x, top: y - h + 8, width: 5, height: h, borderRadius: 2, backgroundColor: color, opacity: on ? 1 : 0 }} />;
};

// ---------- Нить мысли ----------
type P = { x: number; y: number };
const KNOTS: readonly P[] = [
  { x: 520, y: lineY(0) - 14 },
  { x: 780, y: lineY(2) - 14 },
  { x: 420, y: lineY(4) - 14 },
  { x: 740, y: lineY(6) - 14 },
  { x: 470, y: lineY(8) - 14 },
  { x: 200, y: lineY(10) - 14 },
];
// Закрывающая скобка — цель нити.
export const BRACE: P = { x: CODE.x + 10, y: lineY(10) - 14 };

const catmull = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
};

// Плотные точки нити и накопленная длина (параметр 0…1 — доля длины).
export const THREAD = (() => {
  const pts: P[] = [];
  const k = KNOTS;
  for (let i = 0; i < k.length - 1; i++) {
    const p0 = k[Math.max(0, i - 1)];
    const p3 = k[Math.min(k.length - 1, i + 2)];
    for (let s = 0; s < 80; s++) pts.push(catmull(p0, k[i], k[i + 1], p3, s / 80));
  }
  pts.push(k[k.length - 1]);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = len[len.length - 1];
  return { pts, len: len.map((l) => l / total), total };
})();

// Точка нити на доле длины u.
export const threadAt = (u: number): P => {
  const { pts, len } = THREAD;
  const v = clamp(u);
  let i = 1;
  while (i < len.length - 1 && len[i] < v) i++;
  const t = (v - len[i - 1]) / Math.max(1e-9, len[i] - len[i - 1]);
  return { x: lerp(pts[i - 1].x, pts[i].x, t), y: lerp(pts[i - 1].y, pts[i].y, t) };
};

const slice = (a: number, b: number): P[] => {
  const { pts, len } = THREAD;
  const out: P[] = [threadAt(a)];
  for (let i = 0; i < pts.length; i++) if (len[i] > a && len[i] < b) out.push(pts[i]);
  out.push(threadAt(b));
  return out;
};

export type ThreadPiece = {
  readonly a: number; // доля длины: начало куска
  readonly b: number; // конец куска
  readonly dx?: number;
  readonly dy?: number;
  readonly rot?: number; // градусы, вокруг pivot (по умолчанию — центр куска)
  readonly pivot?: "a" | "b" | "c";
  readonly o?: number;
  readonly sag?: number; // провисание (px) к свободному концу b (обрыв)
  readonly sagA?: number; // провисание к началу a
};

const toPath = (ps: readonly P[]) => ps.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

export const Thread: React.FC<{ readonly pieces: readonly ThreadPiece[]; readonly glow?: number; readonly width?: number; readonly color?: string }> = ({ pieces, glow = 1, width = 13, color = YELLOW }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    {pieces.map((pc, i) => {
      if (pc.b - pc.a < 0.002 || (pc.o ?? 1) <= 0) return null;
      let ps = slice(pc.a, pc.b);
      const n = ps.length;
      if (pc.sag || pc.sagA) {
        ps = ps.map((p, k) => {
          const u = k / Math.max(1, n - 1);
          const dy = (pc.sag ?? 0) * Math.pow(u, 2.2) + (pc.sagA ?? 0) * Math.pow(1 - u, 2.2);
          return { x: p.x, y: p.y + dy };
        });
      }
      const pv = pc.pivot === "a" ? ps[0] : pc.pivot === "b" ? ps[n - 1] : ps[Math.floor(n / 2)];
      const d = toPath(ps);
      return (
        <g key={i} opacity={pc.o ?? 1} transform={`translate(${pc.dx ?? 0} ${pc.dy ?? 0}) rotate(${pc.rot ?? 0} ${pv.x} ${pv.y})`}>
          {glow > 0 ? <path d={d} stroke={color} strokeOpacity={0.28 * glow} strokeWidth={width * 2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={width * 0.28} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2 -3)" />
        </g>
      );
    })}
  </svg>
);

// Кончик «пера» нити: светящаяся точка.
export const PenTip: React.FC<{ p: P; a?: number }> = ({ p, a = 1 }) => (
  <div style={{ position: "absolute", left: p.x - 26, top: p.y - 26, width: 52, height: 52, borderRadius: 26, background: "radial-gradient(circle, #FFFFFF 0%, #FFE48A 35%, rgba(255,199,39,0) 70%)", opacity: a }} />
);

// Искры в точке обрыва (t — кадры после обрыва).
export const SnapSparks: React.FC<{ p: P; t: number }> = ({ p, t }) => {
  if (t < 0 || t > 22) return null;
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = (i / 9) * Math.PI * 2 + hash01(i) * 0.6;
        const r = 10 + t * (5 + 4 * hash01(i + 4));
        const o = 1 - t / 22;
        return <div key={i} style={{ position: "absolute", left: p.x + Math.cos(ang) * r - 7, top: p.y + Math.sin(ang) * r + t * t * 0.08 - 7, width: 14, height: 14, borderRadius: 7, backgroundColor: i % 3 ? YELLOW : "#FFFFFF", opacity: o, boxShadow: "0 0 6px rgba(255,199,39,0.8)" }} />;
      })}
    </>
  );
};

// Разбросанные обрывки нити: 7 кусков; scatter 0 — на месте, 1 — разлетелись.
export const CUTS = [0, 0.13, 0.27, 0.41, 0.55, 0.69, 0.84, 0.97] as const;
export const scattered = (scatter: number, f: number, opts: { readonly drift?: number; readonly o?: number; readonly seed?: number } = {}): ThreadPiece[] => {
  const seed = opts.seed ?? 0;
  return CUTS.slice(0, -1).map((a, i) => {
    const b = CUTS[i + 1] - 0.012;
    const hx = (hash01(i * 3.3 + 1 + seed) - 0.5) * 260;
    const hy = (hash01(i * 5.1 + 2 + seed) - 0.5) * 160;
    const hr = (hash01(i * 2.7 + 3 + seed) - 0.5) * 70;
    const drift = (opts.drift ?? 1) * scatter;
    const fx = Math.sin(f / 26 + i * 1.7) * 10 * drift;
    const fy = Math.cos(f / 31 + i * 2.3) * 12 * drift;
    return { a, b, dx: hx * scatter + fx, dy: hy * scatter + fy, rot: hr * scatter, pivot: "c" as const, o: opts.o ?? 1 };
  });
};

// ---------- Уведомление школы ----------
export const SchoolIcon: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={64 * s} height={64 * s} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={32} fill={YELLOW} />
    <path d="M 14 30 L 32 18 L 50 30 Z" fill={NAVY} />
    <rect x={18} y={30} width={28} height={18} fill={NAVY} />
    <rect x={28} y={36} width={8} height={12} fill={YELLOW} />
    <rect x={21} y={33} width={5} height={5} fill={YELLOW} />
    <rect x={38} y={33} width={5} height={5} fill={YELLOW} />
  </svg>
);

export const Toast: React.FC<{ k: number; y?: number; pulse?: number }> = ({ k, y = 262, pulse = 0 }) => {
  if (k <= 0) return null;
  const t = BG10_TEXT.notify;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        width: 920,
        top: lerp(y - 160, y, k),
        opacity: clamp(k * 1.4),
        height: 132,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.97)",
        boxShadow: `0 20px 50px rgba(31,45,85,0.22), 0 0 0 ${3 + 5 * pulse}px rgba(255,199,39,${0.9 * pulse + 0.1})`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 30px",
        boxSizing: "border-box",
        fontFamily,
        color: NAVY,
      }}
    >
      <SchoolIcon />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#6B7591" }}>{t.app}</div>
        <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1 }}>{t.text}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#8A93A8", alignSelf: "flex-start", marginTop: 26 }}>{t.time}</div>
    </div>
  );
};
