// Графический язык ролика №32 — по мотивам референса: крупные заголовки
// с цветной плашкой на ключевом слове, тёмные сине-бирюзовые панели со
// светящимися контурами, последовательно проявляющиеся детали, мягкие
// тени. Одна толщина линий, один свет (сверху слева), один шрифт.
import { fontFamily } from "../fonts";
import { clamp, easeInOut, easeOut, hash01, lerp } from "./rig/motion";

export const C = {
  navy: "#101827",
  deep: "#122C40",
  tealDeep: "#12506A",
  light: "#F6F7F9",
  yellow: "#FFD34E",
  yellowDeep: "#F2B92B",
  cyan: "#73DCE8",
  cyanSoft: "rgba(115,220,232,0.35)",
  ink: "#101827",
  inkSoft: "#3A4660",
  paper: "#FBF8F1",
  pencil: "#4A4E5C",
  white: "#FFFFFF",
  coral: "#E07A5F",
  // дом: тёплые стены, дерево
  wall: "#EFE3D1",
  wallShade: "#E3D3BD",
  wood: "#B9824F",
  woodDark: "#93633A",
  woodLight: "#D2A271",
  floor: "#C99A6B",
} as const;

// Толщина «инженерной» линии и обводки графики (px кадра).
export const LINE = 4;

export { fontFamily };

// ---------- Заголовок ----------
// Сегменты строки: обычный текст или слово на цветной плашке.
export type HeadSeg = { readonly text: string; readonly hl?: "yellow" | "teal" | "none" };

// Крупный заголовок вверху кадра (y ≈ 150…440). Строки поднимаются по
// очереди, плашка ключевого слова «наливается» слева направо.
export const Headline: React.FC<{
  readonly t: number; // кадр сцены
  readonly at: number; // начало появления
  readonly lines: readonly (readonly HeadSeg[])[];
  readonly tone?: "onDark" | "onLight";
  readonly y?: number;
  readonly size?: number;
  readonly out?: number; // кадр начала исчезновения
  readonly hlAt?: number; // кадр, когда наливается плашка (по слову речи)
}> = ({ t, at, lines, tone = "onDark", y = 170, size = 88, out, hlAt }) => {
  const fadeOut = out === undefined ? 1 : 1 - easeInOut((t - out) / 8);
  if (t < at - 1 || fadeOut <= 0) return null;
  const textColor = tone === "onDark" ? C.light : C.ink;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size * 0.1,
        opacity: fadeOut,
        pointerEvents: "none",
      }}
    >
      {lines.map((segs, li) => {
        const u = easeOut((t - at - li * 5) / 10);
        return (
          <div
            key={li}
            style={{
              display: "flex",
              gap: size * 0.22,
              alignItems: "center",
              transform: `translateY(${(1 - u) * 26}px)`,
              opacity: u,
            }}
          >
            {segs.map((sg, si) => {
              const hl = sg.hl && sg.hl !== "none" ? sg.hl : null;
              const fill = easeInOut((t - (hlAt ?? at + li * 5 + 6)) / 9);
              return (
                <span
                  key={si}
                  style={{
                    position: "relative",
                    fontFamily,
                    fontWeight: 900,
                    fontSize: size,
                    lineHeight: 1.05,
                    letterSpacing: -1,
                    color: hl ? (fill > 0.5 ? C.ink : textColor) : textColor,
                    padding: hl ? `${size * 0.02}px ${size * 0.16}px` : 0,
                    textShadow: tone === "onDark" && !(hl && fill > 0.5) ? "0 4px 18px rgba(5,10,25,0.55)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hl ? (
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: size * 0.14,
                        background: hl === "yellow" ? C.yellow : C.cyan,
                        transformOrigin: "left center",
                        transform: `scaleX(${fill})`,
                        boxShadow: `0 0 ${size * 0.4}px ${hl === "yellow" ? "rgba(255,211,78,0.45)" : "rgba(115,220,232,0.5)"}`,
                      }}
                    />
                  ) : null}
                  <span style={{ position: "relative" }}>{sg.text}</span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Плашка-чип ----------
// Тёмная пилюля со светящимся контуром (как «864 сервер» в референсе)
// или светлая — на дневном фоне.
export const Chip: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly at: number;
  readonly children: React.ReactNode;
  readonly accent?: string;
  readonly variant?: "dark" | "light";
  readonly size?: number;
  readonly out?: number;
  readonly anchor?: "center" | "left" | "right";
}> = ({ x, y, t, at, children, accent = C.cyan, variant = "dark", size = 54, out, anchor = "center" }) => {
  const u = easeOut((t - at) / 9);
  const o = out === undefined ? 1 : 1 - easeInOut((t - out) / 8);
  if (u <= 0 || o <= 0) return null;
  const tx = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${0.86 + 0.14 * u})`,
        opacity: u * o,
        padding: `${size * 0.22}px ${size * 0.5}px`,
        borderRadius: size,
        background: variant === "dark" ? "rgba(16,24,39,0.9)" : "rgba(255,255,255,0.96)",
        border: `${Math.max(3, size * 0.06)}px solid ${accent}`,
        boxShadow: variant === "dark" ? `0 0 ${size * 0.5}px ${accent}66, 0 8px 24px rgba(5,10,25,0.35)` : "0 8px 24px rgba(30,30,50,0.18)",
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        color: variant === "dark" ? C.light : C.ink,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: size * 0.3,
        lineHeight: 1.1,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Тёмная панель-«доска» ----------
// Градиент глубокий синий → бирюзовая глубина, тонкий светящийся контур,
// едва заметная сетка и частицы. Дочерние элементы — в координатах панели.
export const Board: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly t: number;
  readonly children?: React.ReactNode;
  readonly radius?: number;
  readonly grid?: boolean;
  readonly glow?: number;
}> = ({ x, y, w, h, t, children, radius = 36, grid = true, glow = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: radius,
      overflow: "hidden",
      background: `linear-gradient(170deg, ${C.deep} 0%, ${C.navy} 62%, #0B1220 100%)`,
      boxShadow: `0 0 0 3px rgba(115,220,232,${0.28 * glow}), 0 0 40px rgba(115,220,232,${0.16 * glow}), 0 24px 60px rgba(5,10,25,0.45)`,
    }}
  >
    {grid ? <GridDots w={w} h={h} t={t} /> : null}
    {children}
  </div>
);

// Сетка-точки и медленно плывущие частицы (детерминированно).
export const GridDots: React.FC<{ readonly w: number; readonly h: number; readonly t: number; readonly n?: number }> = ({ w, h, t, n = 26 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      <pattern id={`grid-${w}-${h}`} width={48} height={48} patternUnits="userSpaceOnUse">
        <circle cx={24} cy={24} r={1.6} fill="rgba(115,220,232,0.18)" />
      </pattern>
      <radialGradient id={`glow-${w}-${h}`} cx="50%" cy="38%" r="70%">
        <stop offset="0%" stopColor="rgba(18,80,106,0.55)" />
        <stop offset="100%" stopColor="rgba(18,80,106,0)" />
      </radialGradient>
    </defs>
    <rect width={w} height={h} fill={`url(#glow-${w}-${h})`} />
    <rect width={w} height={h} fill={`url(#grid-${w}-${h})`} />
    {Array.from({ length: n }, (_, i) => {
      const px = hash01(i * 3.1 + 1) * w;
      const sp = 0.25 + hash01(i * 7.7) * 0.5;
      const py = (((hash01(i * 5.3) * h - t * sp) % h) + h) % h;
      const r = 1.5 + hash01(i * 2.9) * 2.5;
      return <circle key={i} cx={px} cy={py} r={r} fill={i % 5 === 0 ? C.yellow : C.cyan} opacity={0.18 + hash01(i * 9.1) * 0.3} />;
    })}
  </svg>
);

// ---------- Светящаяся линия, которая «рисуется» ----------
// Путь в SVG с прогрессом 0…1 (длина известна заранее или оценивается).
export const GlowPath: React.FC<{
  readonly d: string;
  readonly len: number;
  readonly progress: number;
  readonly color?: string;
  readonly width?: number;
  readonly dashed?: boolean;
  readonly glow?: boolean;
}> = ({ d, len, progress, color = C.cyan, width = LINE + 2, dashed, glow = true }) => {
  const p = clamp(progress);
  if (p <= 0) return null;
  const dash = dashed ? undefined : `${len} ${len}`;
  const offset = dashed ? undefined : len * (1 - p);
  return (
    <g>
      {glow ? <path d={d} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={width * 3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={offset} /> : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? `${width * 0.1} ${width * 3}` : dash}
        strokeDashoffset={offset}
        opacity={dashed ? p : 1}
      />
    </g>
  );
};

// ---------- Мелкие помощники анимации ----------
// Появление: 0 → 1 за dur кадров после at (с мягким выходом).
export const appear = (t: number, at: number, dur = 10) => easeOut((t - at) / dur);
// Видимость с появлением и исчезновением.
export const window01 = (t: number, a: number, b: number, fin = 8, fout = 8) =>
  Math.min(easeOut((t - a) / fin), 1 - easeInOut((t - b) / fout));
// Плавный наезд камеры на 3–7 % за отрезок.
export const pushIn = (t: number, a: number, b: number, from = 1, to = 1.05) => lerp(from, to, easeInOut((t - a) / Math.max(1, b - a)));

// Мягкая виньетка поверх дневных сцен (единый свет).
export const Vignette: React.FC<{ readonly strength?: number }> = ({ strength = 0.22 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: `radial-gradient(ellipse 85% 70% at 48% 42%, rgba(0,0,0,0) 55%, rgba(20,16,30,${strength}) 100%)`,
    }}
  />
);

// Стрелка маршрута «ҮЙ → МЕКТЕП → ЖУМУШ» — плашки со стрелками, по очереди.
export const RouteChips: React.FC<{
  readonly t: number;
  readonly at: number;
  readonly items: readonly string[];
  readonly y: number;
  readonly step?: number;
  readonly size?: number;
  readonly active?: number; // индекс подсвеченной плашки
  readonly variant?: "dark" | "light";
  readonly out?: number;
}> = ({ t, at, items, y, step = 8, size = 44, active, variant = "dark", out }) => {
  const o = out === undefined ? 1 : 1 - easeInOut((t - out) / 8);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: size * 0.28, opacity: o, transform: "translateY(-50%)" }}>
      {items.map((it, i) => {
        const u = easeOut((t - at - i * step) / 8);
        const on = active === i;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: size * 0.28, opacity: u, transform: `translateY(${(1 - u) * 14}px)` }}>
            {i > 0 ? <span style={{ fontFamily, fontWeight: 900, fontSize: size * 0.9, color: variant === "dark" ? C.cyan : C.inkSoft }}>→</span> : null}
            <span
              style={{
                fontFamily,
                fontWeight: 900,
                fontSize: size,
                padding: `${size * 0.14}px ${size * 0.38}px`,
                borderRadius: size * 0.36,
                color: on ? C.ink : variant === "dark" ? C.light : C.ink,
                background: on ? C.yellow : variant === "dark" ? "rgba(16,24,39,0.85)" : "rgba(255,255,255,0.95)",
                border: `3px solid ${on ? C.yellow : variant === "dark" ? "rgba(115,220,232,0.6)" : "rgba(16,24,39,0.15)"}`,
                whiteSpace: "nowrap",
              }}
            >
              {it}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Мягкое затемнение верха кадра под заголовком (на светлых крупных
// планах: лист, стол) — заголовок читается и не спорит с фоном.
// strong — почти сплошная тёмная полоса под заголовком (когда под ним текст).
export const TopScrim: React.FC<{ readonly o?: number; readonly h?: number; readonly strong?: boolean }> = ({ o = 1, h = 380, strong = false }) =>
  o > 0 ? (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: h,
        opacity: o,
        pointerEvents: "none",
        background: strong
          ? "linear-gradient(180deg, rgba(16,24,39,0.94) 0%, rgba(16,24,39,0.9) 62%, rgba(16,24,39,0) 100%)"
          : "linear-gradient(180deg, rgba(16,24,39,0.62) 0%, rgba(16,24,39,0.35) 55%, rgba(16,24,39,0) 100%)",
      }}
    />
  ) : null;
