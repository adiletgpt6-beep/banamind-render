// Рисунки фильма «Масштаб выбора»: место схемы рядом с бананом, силуэты героев,
// бумажная карта с условной местностью, сеть ярких точек-решений, небо, дуб,
// дом с окном, книга и цитатная карточка. Всё — оригинальные простые векторные
// формы BanaMind: не иллюстрации изданий, не кадры экранизаций и не карты сражений.
import React from "react";
import { C, FONT, HERO } from "../theme";
import { clamp01 } from "./kit";

// Где рисовать схему, чтобы не закрывать банана: панель 1280 px смещается по X.
export const panelX = (host: unknown) => {
  if (host === "left") return 600;
  if (host === "right" || host === "peek") return 40;
  return 320;
};

export const Stage: React.FC<{ host: unknown; children: React.ReactNode; y?: number }> = ({ host, children, y = 0 }) => (
  <g transform={`translate(${panelX(host)} ${y})`}>{children}</g>
);

let uid = 0;
// уникальные id градиентов в пределах кадра (компоненты рисуются заново каждый кадр)
export const useId = (name: string) => React.useMemo(() => `${name}-${uid++}`, [name]);

export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// подпись-оговорка курсивом («схема BanaMind», «условно» и т. п.)
export const Note: React.FC<{ x: number; y: number; text: string; o?: number; anchor?: "start" | "middle" | "end"; size?: number; color?: string }> = ({ x, y, text, o = 1, anchor = "middle", size = 26, color = C.dim }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={700} fontSize={size} fill={color} opacity={o} fontStyle="italic">
    {text}
  </text>
);

// ── силуэт человека: голова, корпус, условная одежда эпохи; без лиц и портретного сходства ──
export type Dress = "coat" | "uniform" | "dress" | "peasant" | "frock" | "child";
export type Hat = "none" | "bicorne" | "cap" | "white" | "shako" | "kerchief" | "bonnet";

export const Person: React.FC<{
  x: number;
  y: number; // точка у ног
  s?: number;
  color: string;
  dress?: Dress;
  hat?: Hat;
  label?: string;
  labelColor?: string;
  lean?: number; // наклон корпуса, градусы
  arm?: number; // поднятая рука: 0 — опущена, 1 — вверх
  o?: number;
  wide?: number; // полнота фигуры 1…1.5
  flip?: boolean;
}> = ({ x, y, s = 1, color, dress = "coat", hat = "none", label, labelColor = C.text, lean = 0, arm = 0, o = 1, wide = 1, flip }) => {
  const bw = 34 * wide;
  const body =
    dress === "dress"
      ? `M ${-bw * 0.55} -120 Q 0 -130 ${bw * 0.55} -120 L ${bw * 1.25} 0 L ${-bw * 1.25} 0 Z`
      : dress === "child"
        ? `M ${-bw * 0.5} -86 Q 0 -94 ${bw * 0.5} -86 L ${bw * 0.62} -10 L ${-bw * 0.62} -10 Z`
        : dress === "frock"
          ? `M ${-bw * 0.62} -122 Q 0 -134 ${bw * 0.62} -122 L ${bw * 0.82} -6 L ${-bw * 0.82} -6 Z`
          : `M ${-bw * 0.6} -122 Q 0 -134 ${bw * 0.6} -122 L ${bw * 0.72} -40 L ${-bw * 0.72} -40 Z`;
  const headY = dress === "child" ? -112 : -150;
  const hr = dress === "child" ? 19 : 23;
  const armAng = -20 - arm * 140;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={o}>
      <g transform={`rotate(${lean})`}>
        {/* ноги */}
        {dress !== "dress" && (
          <g stroke={color} strokeWidth={13} strokeLinecap="round" opacity={0.92}>
            <line x1={-11} y1={dress === "child" ? -14 : -44} x2={-13} y2={-4} />
            <line x1={11} y1={dress === "child" ? -14 : -44} x2={13} y2={-4} />
          </g>
        )}
        {/* рука */}
        {arm > 0 && (
          <line x1={bw * 0.5} y1={-112} x2={bw * 0.5 + 62 * Math.cos((armAng * Math.PI) / 180)} y2={-112 + 62 * Math.sin((armAng * Math.PI) / 180)} stroke={color} strokeWidth={12} strokeLinecap="round" />
        )}
        <path d={body} fill={color} />
        {dress === "uniform" && (
          <g>
            <rect x={-bw * 0.62 - 6} y={-126} width={18} height={8} rx={3} fill={C.yellow} />
            <rect x={bw * 0.62 - 12} y={-126} width={18} height={8} rx={3} fill={C.yellow} />
            <line x1={0} y1={-122} x2={0} y2={-46} stroke="#ffffff" strokeWidth={3} opacity={0.6} />
          </g>
        )}
        {dress === "peasant" && <line x1={-bw * 0.68} y1={-78} x2={bw * 0.68} y2={-78} stroke={C.night} strokeWidth={5} opacity={0.45} />}
        <circle cy={headY} r={hr} fill={color} />
        {hat === "bicorne" && <path d={`M -40 ${headY - 12} Q 0 ${headY - 48} 40 ${headY - 12} Q 0 ${headY - 22} -40 ${headY - 12} Z`} fill={C.night} stroke={color} strokeWidth={3} />}
        {hat === "cap" && (
          <g>
            <rect x={-25} y={headY - 30} width={50} height={16} rx={6} fill="#ffffff" />
            <rect x={-25} y={headY - 18} width={50} height={5} fill={C.red} />
            <path d={`M 2 ${headY - 14} L 34 ${headY - 10} L 2 ${headY - 8} Z`} fill={C.night} />
          </g>
        )}
        {hat === "white" && (
          <g>
            <ellipse cy={headY - 16} rx={38} ry={8} fill="#ffffff" />
            <rect x={-22} y={headY - 42} width={44} height={28} rx={10} fill="#ffffff" />
          </g>
        )}
        {hat === "shako" && <rect x={-20} y={headY - 52} width={40} height={36} rx={4} fill={C.night} stroke={color} strokeWidth={3} />}
        {hat === "kerchief" && <path d={`M -28 ${headY + 4} Q -30 ${headY - 30} 0 ${headY - 30} Q 30 ${headY - 30} 28 ${headY + 4} L 18 ${headY + 22} L -18 ${headY + 22} Z`} fill={C.paper} opacity={0.9} />}
        {hat === "bonnet" && <path d={`M -30 ${headY + 6} Q -32 ${headY - 34} 0 ${headY - 32} Q 32 ${headY - 34} 30 ${headY + 6}`} fill="none" stroke={C.paper} strokeWidth={8} />}
      </g>
      {label && (
        <text y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={labelColor} transform={flip ? "scale(-1 1)" : undefined}>
          {label}
        </text>
      )}
    </g>
  );
};

// герои фильма — один и тот же силуэт в каждой сцене
export const HEROES = {
  pierre: { color: HERO.pierre, dress: "frock" as Dress, hat: "none" as Hat, wide: 1.45, label: "Пьер" },
  andrei: { color: HERO.andrei, dress: "uniform" as Dress, hat: "none" as Hat, wide: 1, label: "Андрей" },
  natasha: { color: HERO.natasha, dress: "dress" as Dress, hat: "none" as Hat, wide: 0.9, label: "Наташа" },
  marya: { color: HERO.marya, dress: "dress" as Dress, hat: "none" as Hat, wide: 1, label: "Марья" },
  nikolai: { color: HERO.nikolai, dress: "uniform" as Dress, hat: "shako" as Hat, wide: 1, label: "Николай" },
  sonya: { color: HERO.sonya, dress: "dress" as Dress, hat: "none" as Hat, wide: 0.9, label: "Соня" },
  karataev: { color: HERO.karataev, dress: "peasant" as Dress, hat: "none" as Hat, wide: 1.3, label: "Каратаев" },
  kutuzov: { color: HERO.kutuzov, dress: "frock" as Dress, hat: "cap" as Hat, wide: 1.5, label: "Кутузов" },
  napoleon: { color: HERO.napoleon, dress: "uniform" as Dress, hat: "bicorne" as Hat, wide: 1.1, label: "Наполеон" },
  helene: { color: HERO.helene, dress: "dress" as Dress, hat: "none" as Hat, wide: 1, label: "Элен" },
  anatole: { color: HERO.anatole, dress: "uniform" as Dress, hat: "none" as Hat, wide: 1, label: "Анатоль" },
  petya: { color: HERO.petya, dress: "child" as Dress, hat: "none" as Hat, wide: 1, label: "Петя" },
  oldPrince: { color: HERO.oldPrince, dress: "frock" as Dress, hat: "none" as Hat, wide: 1, label: "старый князь" },
  vasily: { color: HERO.vasily, dress: "frock" as Dress, hat: "none" as Hat, wide: 1.1, label: "князь Василий" },
  dolokhov: { color: HERO.dolokhov, dress: "uniform" as Dress, hat: "none" as Hat, wide: 1, label: "Долохов" },
};
export type HeroId = keyof typeof HEROES;

export const Hero: React.FC<{ id: HeroId; x: number; y: number; s?: number; label?: string | false; o?: number; lean?: number; arm?: number; flip?: boolean; hat?: Hat }> = ({ id, x, y, s = 1, label, o, lean, arm, flip, hat }) => {
  const h = HEROES[id];
  return <Person x={x} y={y} s={s} color={h.color} dress={h.dress} hat={hat ?? h.hat} wide={h.wide} label={label === false ? undefined : (label ?? h.label)} labelColor={h.color} o={o} lean={lean} arm={arm} flip={flip} />;
};

// ── бумажная карта: светлая бумага, условная река и холмы; подпись «схема» обязательна ──
export const PaperMap: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; river?: boolean; o?: number; children?: React.ReactNode }> = ({ x, y, w, h, seed = 1, river = true, o = 1, children }) => {
  const contours = Array.from({ length: 6 }).map((_, i) => {
    const cx = w * (0.15 + rnd(seed * 7 + i) * 0.7);
    const cy = h * (0.15 + rnd(seed * 13 + i) * 0.7);
    return { cx, cy, rx: 60 + rnd(seed + i * 3) * 90, ry: 30 + rnd(seed * 5 + i) * 50 };
  });
  let rp = `M -10 ${h * 0.7}`;
  for (let k = 1; k <= 8; k++) rp += ` Q ${(w * (k - 0.5)) / 8} ${h * (0.62 + 0.14 * Math.sin(k * 1.3 + seed))} ${(w * k) / 8} ${h * (0.66 + 0.1 * Math.sin(k * 0.9 + seed * 2))}`;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <rect x={8} y={12} width={w} height={h} rx={18} fill="#000" opacity={0.25} />
      <rect width={w} height={h} rx={18} fill={C.paper} />
      <rect x={10} y={10} width={w - 20} height={h - 20} rx={12} fill="none" stroke={C.paperDark} strokeWidth={3} />
      {contours.map((c, i) => (
        <g key={i} fill="none" stroke="#b9a57e" strokeWidth={2.4} opacity={0.75}>
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} />
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx * 0.6} ry={c.ry * 0.55} />
        </g>
      ))}
      {river && <path d={rp} fill="none" stroke="#7fb3e0" strokeWidth={10} strokeLinecap="round" opacity={0.9} />}
      {children}
    </g>
  );
};

// ── сеть ярких точек-решений: каждая точка — человек, у каждой своя короткая стрелка.
// align 0 — стрелки в разные стороны, 1 — все совпали в общее движение (dir, рад).
export const DotNet: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  n?: number;
  seed?: number;
  k?: number; // доля проявленных точек 0…1
  align?: number;
  dir?: number;
  arrows?: number; // видимость стрелок 0…1
  r?: number;
  links?: number; // видимость связей между соседями 0…1
  palette?: string[];
  drift?: number; // сдвиг точек вдоль общего движения (px)
}> = ({ x, y, w, h, n = 160, seed = 3, k = 1, align = 0, dir = 0, arrows = 1, r = 6, links = 0, palette, drift = 0 }) => {
  const pal = palette ?? [C.yellow, C.sky, C.pink, C.green, C.amber, C.violet, C.coral, C.cyan];
  const cols = Math.round(Math.sqrt((n * w) / h));
  const rows = Math.ceil(n / cols);
  const pts = Array.from({ length: n }).map((_, i) => {
    const cx = ((i % cols) + 0.5 + (rnd(seed * 31 + i) - 0.5) * 0.7) * (w / cols);
    const cy = (Math.floor(i / cols) + 0.5 + (rnd(seed * 17 + i) - 0.5) * 0.7) * (h / rows);
    const own = rnd(seed * 3 + i * 7) * Math.PI * 2;
    // кратчайший поворот от собственного направления к общему
    let d = dir - own;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    const a = own + d * align;
    return { cx: cx + Math.cos(dir) * drift * (0.6 + rnd(i) * 0.4), cy: cy + Math.sin(dir) * drift * (0.6 + rnd(i) * 0.4), a, c: pal[i % pal.length], show: rnd(seed * 101 + i) };
  });
  return (
    <g transform={`translate(${x} ${y})`}>
      {links > 0 &&
        pts.map((p, i) => {
          const q = pts[i + 1];
          const q2 = pts[i + cols];
          if (p.show > k) return null;
          return (
            <g key={`l${i}`} stroke={C.inkSoft} strokeWidth={1.6} opacity={0.35 * links}>
              {q && i % cols !== cols - 1 && q.show <= k && <line x1={p.cx} y1={p.cy} x2={q.cx} y2={q.cy} />}
              {q2 && q2.show <= k && <line x1={p.cx} y1={p.cy} x2={q2.cx} y2={q2.cy} />}
            </g>
          );
        })}
      {pts.map((p, i) => {
        if (p.show > k) return null;
        const L = r * 3.2;
        const ex = p.cx + Math.cos(p.a) * L;
        const ey = p.cy + Math.sin(p.a) * L;
        return (
          <g key={i}>
            {arrows > 0 && (
              <g stroke={p.c} strokeWidth={2.6} strokeLinecap="round" opacity={arrows}>
                <line x1={p.cx} y1={p.cy} x2={ex} y2={ey} />
                <line x1={ex} y1={ey} x2={ex - Math.cos(p.a - 0.6) * r} y2={ey - Math.sin(p.a - 0.6) * r} />
                <line x1={ex} y1={ey} x2={ex - Math.cos(p.a + 0.6) * r} y2={ey - Math.sin(p.a + 0.6) * r} />
              </g>
            )}
            <circle cx={p.cx} cy={p.cy} r={r} fill={p.c} stroke={C.night} strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
};

// ── большая «стрела полководца» (может распадаться на точки) ──
export const BigArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string; w?: number; o?: number }> = ({ x1, y1, x2, y2, k, color = C.french, w = 46, o = 1 }) => {
  if (k <= 0) return null;
  const ex = x1 + (x2 - x1) * clamp01(k);
  const ey = y1 + (y2 - y1) * clamp01(k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hs = w * 1.6;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={ex - Math.cos(a) * hs * 0.6} y2={ey - Math.sin(a) * hs * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${ex} ${ey} L ${ex - Math.cos(a - 0.5) * hs} ${ey - Math.sin(a - 0.5) * hs} L ${ex - Math.cos(a + 0.5) * hs} ${ey - Math.sin(a + 0.5) * hs} Z`} fill={color} />
    </g>
  );
};

// ── высокое небо: глубокий голубой, медленные серые облака (без блюра) ──
export const HighSky: React.FC<{ x: number; y: number; w: number; h: number; t: number; o?: number }> = ({ x, y, w, h, t, o = 1 }) => {
  const id = useId("sky");
  const clouds = [0, 1, 2, 3, 4].map((i) => ({ cx: ((rnd(i + 40) * w + t * (8 + i * 3)) % (w + 300)) - 150, cy: h * (0.2 + rnd(i + 70) * 0.55), s: 0.7 + rnd(i + 90) * 0.7 }));
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f6fd6" />
          <stop offset="100%" stopColor="#9fd0ff" />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <rect width={w} height={h} rx={28} />
        </clipPath>
      </defs>
      <rect width={w} height={h} rx={28} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}-c)`}>
        {clouds.map((c, i) => (
          <g key={i} transform={`translate(${c.cx} ${c.cy}) scale(${c.s})`} fill="#e9eef7" opacity={0.92}>
            <ellipse rx={90} ry={26} />
            <ellipse cx={-40} cy={-14} rx={46} ry={26} />
            <ellipse cx={30} cy={-20} rx={56} ry={32} />
          </g>
        ))}
      </g>
    </g>
  );
};

// ── дуб: green 0 — голые ветви, 1 — молодая листва ──
export const Oak: React.FC<{ x: number; y: number; s?: number; green: number }> = ({ x, y, s = 1, green }) => {
  const branches = [
    [0, -180, -120, -300],
    [0, -200, 110, -320],
    [0, -240, -40, -380],
    [-60, -250, -170, -260],
    [60, -260, 170, -300],
    [-120, -300, -190, -360],
    [110, -320, 150, -400],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -40 0 Q -30 -100 -22 -200 L 22 -200 Q 30 -100 40 0 Z" fill="#6b4a2f" />
      {branches.map(([a, b, c, d], i) => (
        <path key={i} d={`M ${a} ${b} Q ${(a + c) / 2 + (i % 2 ? 20 : -20)} ${(b + d) / 2} ${c} ${d}`} stroke="#6b4a2f" strokeWidth={16 - i} fill="none" strokeLinecap="round" />
      ))}
      {green > 0 &&
        Array.from({ length: 70 }).map((_, i) => {
          const ang = rnd(i + 3) * Math.PI * 2;
          const rr = 60 + rnd(i + 9) * 170;
          const cx = Math.cos(ang) * rr * 1.1;
          const cy = -300 + Math.sin(ang) * rr * 0.55;
          const show = clamp01(green * 1.4 - rnd(i + 21) * 0.4);
          return show > 0 ? <circle key={i} cx={cx} cy={cy} r={16 * show} fill={i % 3 ? "#4fdc94" : "#23a96b"} /> : null;
        })}
    </g>
  );
};

// ── дом с окном: тёплый свет — «мир» как домашняя жизнь ──
export const House: React.FC<{ x: number; y: number; s?: number; light?: number; color?: string }> = ({ x, y, s = 1, light = 1, color = "#3a2f4a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 0 L -110 -120 L 0 -200 L 110 -120 L 110 0 Z" fill={color} />
    <path d="M -130 -112 L 0 -210 L 130 -112" fill="none" stroke="#5c4a6e" strokeWidth={14} strokeLinejoin="round" />
    {[-55, 55].map((wx) => (
      <g key={wx}>
        <rect x={wx - 26} y={-96} width={52} height={58} rx={6} fill={C.amber} opacity={0.25 + 0.75 * light} />
        <line x1={wx} y1={-96} x2={wx} y2={-38} stroke={color} strokeWidth={5} />
        <line x1={wx - 26} y1={-67} x2={wx + 26} y2={-67} stroke={color} strokeWidth={5} />
      </g>
    ))}
  </g>
);

// ── книга-том с номером ──
export const Volume: React.FC<{ x: number; y: number; label: string; sub?: string; color: string; s?: number }> = ({ x, y, label, sub, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-62} y={-190} width={124} height={190} rx={10} fill={color} />
    <rect x={-62} y={-190} width={18} height={190} rx={6} fill="#000" opacity={0.18} />
    <rect x={-40} y={-150} width={88} height={4} fill="#fff" opacity={0.6} />
    <rect x={-40} y={-40} width={88} height={4} fill="#fff" opacity={0.6} />
    <text x={8} y={-86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.night}>
      {label}
    </text>
    {sub && (
      <text x={8} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.night} opacity={0.8}>
        {sub}
      </text>
    )}
  </g>
);

// ── цитатная карточка: короткая цитата Толстого/героя + источник; шрифт PT Serif ──
export const QuoteCard: React.FC<{ x: number; y: number; w: number; text: string; who: string; k: number; size?: number }> = ({ x, y, w, text, who, k, size = 44 }) => {
  if (k <= 0) return null;
  const lines = text.split("\n");
  const h = lines.length * size * 1.25 + 110;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={clamp01(k * 1.4)}>
      <rect x={8} y={12} width={w} height={h} rx={22} fill="#000" opacity={0.25} />
      <rect width={w} height={h} rx={22} fill={C.paper} />
      <rect width={12} height={h} rx={6} fill={C.gold} />
      <text x={44} y={70} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={size} fill={C.inkBrown}>
        {lines.map((l, i) => (
          <tspan key={i} x={44} dy={i === 0 ? 0 : size * 1.25}>
            {l}
          </tspan>
        ))}
      </text>
      <text x={44} y={h - 32} fontFamily={FONT} fontWeight={800} fontSize={24} fill="#8a6d45">
        {who}
      </text>
    </g>
  );
};

// ── клубы дыма сражения: стилизованные круги, чёткие края, медленный подъём ──
export const Smoke: React.FC<{ x: number; y: number; t: number; n?: number; seed?: number; s?: number; color?: string }> = ({ x, y, t, n = 6, seed = 1, s = 1, color = "#d7dbe6" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, i) => {
      const life = (t * 0.25 + rnd(seed * 9 + i)) % 1;
      return <circle key={i} cx={(rnd(seed + i * 5) - 0.5) * 160 + life * 30} cy={-life * 140} r={22 + life * 34} fill={color} opacity={0.75 * (1 - life)} />;
    })}
  </g>
);

// ── условное пламя (без людей и жертв): три языка, мягкое покачивание ──
export const Flame: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 0 }) => {
  const sw = Math.sin(t * 3 + seed) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -40 0 Q -50 -60 ${-10 + sw} -120 Q 10 -70 40 0 Z`} fill={C.orange} />
      <path d={`M -24 0 Q -28 -40 ${sw * 0.6} -84 Q 14 -46 24 0 Z`} fill={C.amber} />
      <path d={`M -10 0 Q -12 -20 ${sw * 0.3} -44 Q 8 -22 10 0 Z`} fill={C.yellow} />
    </g>
  );
};

// ── метка-«шапка» сцены: том/год/место — ориентир, не таймер ──
export const Chip: React.FC<{ x: number; y: number; text: string; color?: string; k?: number }> = ({ x, y, text, color = C.gold, k = 1 }) => {
  if (k <= 0) return null;
  const w = text.length * 15.5 + 44;
  return (
    <g transform={`translate(${x} ${y})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2} y={-26} width={w} height={44} rx={22} fill="rgba(12,20,40,0.85)" stroke={color} strokeWidth={2} />
      <text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={color} letterSpacing={0.6}>
        {text}
      </text>
    </g>
  );
};

// ── крупная надпись-заголовок схемы ──
export const Big: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; k?: number; serif?: boolean }> = ({ x, y, text, size = 64, color = C.text, k = 1, serif }) => {
  if (k <= 0) return null;
  return (
    <text
      x={x}
      y={y + (1 - clamp01(k)) * 20}
      textAnchor="middle"
      fontFamily={serif ? "'PT Serif', Georgia, serif" : "Rubik, Nunito, sans-serif"}
      fontWeight={serif ? 700 : 900}
      fontSize={size}
      fill={color}
      opacity={clamp01(k * 1.4)}
      stroke={C.night}
      strokeWidth={size * 0.08}
      paintOrder="stroke"
    >
      {text.split("\n").map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.15}>
          {l}
        </tspan>
      ))}
    </text>
  );
};

// ── ярлык-стикер (как Tag в kit), но с переносом строк и рамкой ──
export const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; k?: number; dark?: boolean }> = ({ x, y, text, color = C.yellow, size = 34, k = 1, dark = true }) => {
  if (k <= 0) return null;
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + size * 1.2;
  const h = lines.length * size * 1.2 + size * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * clamp01(k)})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(h / 2, 26)} fill={color} />
      <text y={-h / 2 + size * 0.25 + size} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={dark ? C.night : C.white}>
        {lines.map((l, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.2}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// ── звёзды для ночных сцен (неподвижные, чёткие) ──
export const Stars: React.FC<{ x: number; y: number; w: number; h: number; n?: number; seed?: number; o?: number }> = ({ x, y, w, h, n = 40, seed = 5, o = 0.9 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={rnd(seed * 3 + i) * w} cy={rnd(seed * 7 + i * 3) * h} r={i % 7 === 0 ? 3.4 : 2.2} fill={i % 5 === 0 ? "#ffe6b8" : "#eef3ff"} />
    ))}
  </g>
);

// ── свеча ──
export const Candle: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number }> = ({ x, y, s = 1, t, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {lit > 0 && <circle cy={-118} r={70} fill={C.amber} opacity={0.12 * lit} />}
    <rect x={-16} y={-90} width={32} height={90} rx={6} fill={C.paper} />
    <rect x={-30} y={-6} width={60} height={12} rx={6} fill={C.paperDark} />
    {lit > 0 && <path d={`M 0 -136 Q ${10 + Math.sin(t * 4) * 3} -110 0 -96 Q -10 -110 0 -136 Z`} fill={C.amber} opacity={lit} />}
  </g>
);
