// Рисунки фильма BM-030 — собственный 2D-стиль BanaMind «Масштаб выбора»:
// чёткие силуэты людей эпохи (вырезанная бумага с тонкой светлой кромкой),
// предметы, карты и сеть ярких точек-решений. Без кадров экранизаций, портретов
// актёров, чужих карт и картин. Персонажи — литературные герои; исторические
// лица показаны только условными силуэтами.
import React from "react";
import { C, FONT, SERIF } from "../theme";

export const OL = "#1d2340";

// детерминированная «случайность» — кадр одинаков при любом рендере
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export type Who =
  | "pierre" | "andrei" | "natasha" | "marya" | "nikolai" | "sonya" | "petya" | "karataev" | "kutuzov" | "napoleon"
  | "oldPrince" | "helene" | "anatole" | "dolokhov" | "annaP" | "countR" | "countessR" | "soldier" | "officer"
  | "peasant" | "lady" | "child" | "nikolenka" | "denisov" | "frenchman" | "lise" | "boris";

type Look = {
  fill: string; // основной цвет силуэта
  trim?: string; // светлая кромка/акцент костюма
  h?: number; // рост относительно нормы
  w?: number; // ширина корпуса
  dress?: boolean; // платье с высокой талией (ампир)
  hat?: "bicorne" | "shako" | "cap" | "top" | "kerchief" | "whiteHat" | "bonnet" | "fur";
  coat?: "tails" | "greatcoat" | "hussar" | "uniform" | "kaftan" | "robe";
  glasses?: boolean;
  epaulettes?: boolean;
  hair?: "up" | "curls" | "long" | "short" | "bald" | "braid";
  sash?: string;
};

export const LOOKS: Record<Who, Look> = {
  pierre: { fill: "#3d3f63", trim: "#b8c2e6", w: 1.35, h: 1.06, coat: "tails", glasses: true, hair: "short" },
  andrei: { fill: "#2e3f5e", trim: "#e8c46a", h: 1.02, w: 0.92, coat: "uniform", epaulettes: true, hair: "short" },
  natasha: { fill: "#5a3f73", trim: "#f6c8e0", h: 0.9, w: 0.82, dress: true, hair: "curls" },
  marya: { fill: "#3f4a5e", trim: "#cdd6ec", h: 0.92, w: 0.98, dress: true, hair: "up" },
  nikolai: { fill: "#6a2f3c", trim: "#f2c46a", h: 1.0, coat: "hussar", hat: "shako", hair: "short" },
  sonya: { fill: "#3f5a5a", trim: "#bfe6d8", h: 0.88, w: 0.8, dress: true, hair: "braid" },
  petya: { fill: "#5a3a3f", trim: "#f2c46a", h: 0.8, w: 0.8, coat: "hussar", hat: "shako", hair: "short" },
  karataev: { fill: "#6a5a44", trim: "#f2dcae", h: 0.9, w: 1.1, coat: "kaftan", hat: "kerchief", sash: "#c98a1c" },
  kutuzov: { fill: "#34405a", trim: "#e8c46a", h: 0.96, w: 1.45, coat: "greatcoat", hat: "cap", epaulettes: true },
  napoleon: { fill: "#2a2f4a", trim: "#e8c46a", h: 0.86, w: 1.12, coat: "greatcoat", hat: "bicorne" },
  oldPrince: { fill: "#3a3550", trim: "#e6e0cf", h: 0.94, w: 0.9, coat: "tails", hair: "bald" },
  helene: { fill: "#6a3a5a", trim: "#ffd1e8", h: 0.98, w: 0.9, dress: true, hair: "up" },
  anatole: { fill: "#4a3550", trim: "#f2c46a", h: 1.06, coat: "uniform", hair: "curls" },
  dolokhov: { fill: "#2f3550", trim: "#9fb2e6", h: 1.0, coat: "uniform", hair: "curls" },
  annaP: { fill: "#584066", trim: "#f2d6a8", h: 0.9, w: 0.92, dress: true, hair: "up" },
  countR: { fill: "#5a4a3a", trim: "#f2dcae", h: 0.98, w: 1.25, coat: "tails", hair: "bald" },
  countessR: { fill: "#4f4560", trim: "#e8d6f0", h: 0.92, w: 1.0, dress: true, hat: "bonnet" },
  soldier: { fill: "#3b4560", trim: "#cdd6ec", h: 1.0, coat: "greatcoat", hat: "shako" },
  officer: { fill: "#2f4060", trim: "#e8c46a", h: 1.0, coat: "uniform", epaulettes: true, hat: "bicorne" },
  peasant: { fill: "#6a5a44", trim: "#f2dcae", h: 0.96, w: 1.05, coat: "kaftan", hat: "fur", sash: "#a85a3a" },
  lady: { fill: "#5a4a6a", trim: "#f2dcef", h: 0.9, w: 0.86, dress: true, hair: "up" },
  child: { fill: "#5a5a7a", trim: "#f2e6c8", h: 0.55, w: 0.75, dress: true, hair: "braid" },
  nikolenka: { fill: "#3f4a6a", trim: "#f2e6c8", h: 0.7, w: 0.75, coat: "tails", hair: "curls" },
  denisov: { fill: "#5a2f3c", trim: "#f2c46a", h: 0.86, coat: "hussar", hat: "shako", hair: "curls" },
  frenchman: { fill: "#3a3f6a", trim: "#e6e6ff", h: 1.0, coat: "uniform", hat: "shako", epaulettes: true },
  lise: { fill: "#5f4a6e", trim: "#f6d8e8", h: 0.84, w: 0.92, dress: true, hair: "curls" },
  boris: { fill: "#34455e", trim: "#cfe0ff", h: 1.0, coat: "uniform", hair: "short" },
};

export type FigPose = "stand" | "walk" | "run" | "lie" | "sit" | "reach" | "dance" | "kneel" | "point" | "bow" | "read" | "arms" | "banner" | "look";

type Limb = { a: number; e?: number }; // угол плеча/бедра (0 — вниз), колено/локоть
type PoseDef = { la: Limb; ra: Limb; ll: Limb; rl: Limb; lean: number; drop?: number };

const POSE: Record<FigPose, PoseDef> = {
  stand: { la: { a: 8, e: 6 }, ra: { a: -8, e: -6 }, ll: { a: 4 }, rl: { a: -4 }, lean: 0 },
  walk: { la: { a: 22, e: 10 }, ra: { a: -22, e: -14 }, ll: { a: 18, e: -10 }, rl: { a: -16, e: 12 }, lean: 3 },
  run: { la: { a: 50, e: 60 }, ra: { a: -40, e: -50 }, ll: { a: 35, e: -40 }, rl: { a: -30, e: 40 }, lean: 12 },
  lie: { la: { a: 30 }, ra: { a: -30 }, ll: { a: 4 }, rl: { a: -4 }, lean: 0 },
  sit: { la: { a: 20, e: 40 }, ra: { a: -20, e: -40 }, ll: { a: 80, e: -80 }, rl: { a: 76, e: -80 }, lean: -2, drop: 0.36 },
  reach: { la: { a: 10, e: 4 }, ra: { a: -100, e: -10 }, ll: { a: 6 }, rl: { a: -10 }, lean: 6 },
  dance: { la: { a: 120, e: 30 }, ra: { a: -60, e: -40 }, ll: { a: 14, e: -14 }, rl: { a: -20, e: 20 }, lean: -5 },
  kneel: { la: { a: 20, e: 20 }, ra: { a: -20, e: -30 }, ll: { a: 90, e: -95 }, rl: { a: 10, e: 85 }, lean: 6, drop: 0.3 },
  point: { la: { a: 6, e: 4 }, ra: { a: -82, e: -2 }, ll: { a: 4 }, rl: { a: -4 }, lean: 2 },
  bow: { la: { a: 20, e: 4 }, ra: { a: -20, e: -4 }, ll: { a: 4 }, rl: { a: -4 }, lean: 14 },
  read: { la: { a: 40, e: 90 }, ra: { a: -40, e: -90 }, ll: { a: 4 }, rl: { a: -4 }, lean: 6 },
  arms: { la: { a: 120, e: 20 }, ra: { a: -120, e: -20 }, ll: { a: 8 }, rl: { a: -8 }, lean: 0 },
  banner: { la: { a: 60, e: 50 }, ra: { a: -150, e: -10 }, ll: { a: 35, e: -40 }, rl: { a: -30, e: 40 }, lean: 10 },
  look: { la: { a: 10, e: 30 }, ra: { a: -30, e: -100 }, ll: { a: 4 }, rl: { a: -4 }, lean: -4 },
};


const LimbPath: React.FC<{ x: number; y: number; len: number; w: number; a: number; e?: number; fill: string; foot?: boolean; hand?: boolean }> = ({ x, y, len, w, a, e = 0, fill, foot, hand }) => {
  const half = len / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <rect x={-w / 2} y={0} width={w} height={half + w / 2} rx={w / 2} fill={fill} />
      <g transform={`translate(0 ${half}) rotate(${e})`}>
        <rect x={-w * 0.45} y={0} width={w * 0.9} height={half + w * 0.3} rx={w * 0.45} fill={fill} />
        {foot && <ellipse cx={w * 0.45} cy={half + w * 0.15} rx={w * 0.85} ry={w * 0.42} fill={fill} />}
        {hand && <circle cx={0} cy={half + w * 0.25} r={w * 0.55} fill={fill} />}
      </g>
    </g>
  );
};

// Силуэт: (x, y) — между ступнями; рост ≈ 300 × s × h.
export const Figure: React.FC<{
  who: Who;
  x: number;
  y: number;
  s?: number;
  pose?: FigPose;
  flip?: boolean;
  t?: number;
  rim?: string; // цвет световой кромки (по умолчанию из костюма)
  opacity?: number;
  fill?: string;
}> = ({ who, x, y, s = 1, pose = "stand", flip = false, t = 0, rim, opacity = 1, fill }) => {
  const L = LOOKS[who];
  const f = fill ?? L.fill;
  const trim = rim ?? L.trim ?? "#fff";
  const P = POSE[pose];
  const h = L.h ?? 1;
  const w = L.w ?? 1;
  const breathe = Math.sin(t * 1.6 + x * 0.01) * 1.2;
  if (pose === "lie") {
    return (
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(-90)`} opacity={opacity}>
        <Figure who={who} x={0} y={0} s={1} pose="stand" fill={fill} rim={rim} t={0} />
      </g>
    );
  }
  const legLen = 128 * h;
  const torsoH = 108 * h;
  const hipY = -legLen + (P.drop ?? 0) * legLen;
  const shoulderY = hipY - torsoH + breathe;
  const tw = 46 * w;
  const headR = 25 * Math.min(1.08, 0.9 + 0.1 * h);
  const headY = shoulderY - headR - 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
      {/* ноги (за платьем видны лишь ступни) — не наклоняются вместе с корпусом */}
      {!L.dress && (
        <>
          <LimbPath x={-tw * 0.3} y={hipY} len={legLen} w={20 * Math.min(1.2, w)} a={P.ll.a} e={P.ll.e} fill={f} foot />
          <LimbPath x={tw * 0.3} y={hipY} len={legLen} w={20 * Math.min(1.2, w)} a={P.rl.a} e={P.rl.e} fill={f} foot />
        </>
      )}
      <g transform={`rotate(${P.lean} 0 ${hipY})`}>
        {/* корпус */}
        {L.dress ? (
          <path
            d={`M ${-tw * 0.5} ${shoulderY + 6} Q 0 ${shoulderY - 6} ${tw * 0.5} ${shoulderY + 6} L ${tw * 0.42} ${shoulderY + 34} Q ${tw * 1.25} ${(P.drop ? hipY : 0) * 0.4 + shoulderY * 0.0} ${tw * 1.05 + Math.sin(t * 2) * 3} ${P.drop ? hipY + 40 : -4} L ${-tw * 1.05 + Math.sin(t * 2 + 1) * 3} ${P.drop ? hipY + 40 : -4} Q ${-tw * 1.25} ${shoulderY * 0.0} ${-tw * 0.42} ${shoulderY + 34} Z`}
            fill={f}
          />
        ) : (
          <path
            d={`M ${-tw * 0.5} ${shoulderY + 4} Q 0 ${shoulderY - 8} ${tw * 0.5} ${shoulderY + 4} L ${tw * 0.48} ${hipY + 10} ${L.coat === "tails" || L.coat === "greatcoat" || L.coat === "kaftan" || L.coat === "robe" ? `L ${tw * 0.62} ${hipY + (L.coat === "greatcoat" || L.coat === "kaftan" ? 70 : 52)} L ${tw * 0.1} ${hipY + 30}` : ""} L ${-tw * 0.1} ${hipY + 30} ${L.coat === "greatcoat" || L.coat === "kaftan" ? `L ${-tw * 0.62} ${hipY + 70}` : ""} L ${-tw * 0.48} ${hipY + 10} Z`}
            fill={f}
          />
        )}
        {/* световая кромка: пояс, ворот, эполеты */}
        {L.dress && <path d={`M ${-tw * 0.44} ${shoulderY + 32} Q 0 ${shoulderY + 40} ${tw * 0.44} ${shoulderY + 32}`} stroke={trim} strokeWidth={5} fill="none" strokeLinecap="round" />}
        {L.sash && <rect x={-tw * 0.5} y={hipY - 8} width={tw} height={12} rx={6} fill={L.sash} />}
        {L.coat === "hussar" && [0, 1, 2, 3].map((i) => <line key={i} x1={-tw * 0.3} x2={tw * 0.3} y1={shoulderY + 22 + i * 18} y2={shoulderY + 22 + i * 18} stroke={trim} strokeWidth={4} strokeLinecap="round" />)}
        {L.epaulettes && (
          <>
            <ellipse cx={-tw * 0.5} cy={shoulderY + 4} rx={13} ry={6} fill={trim} />
            <ellipse cx={tw * 0.5} cy={shoulderY + 4} rx={13} ry={6} fill={trim} />
          </>
        )}
        {(L.coat === "uniform" || L.coat === "greatcoat") && <line x1={0} y1={shoulderY + 8} x2={0} y2={hipY + 4} stroke={trim} strokeOpacity={0.6} strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" />}
        {/* руки */}
        <LimbPath x={-tw * 0.46} y={shoulderY + 8} len={96 * h} w={16 * Math.min(1.25, w)} a={P.la.a} e={P.la.e} fill={f} hand />
        <LimbPath x={tw * 0.46} y={shoulderY + 8} len={96 * h} w={16 * Math.min(1.25, w)} a={P.ra.a} e={P.ra.e} fill={f} hand />
        {/* шея и голова */}
        <rect x={-8} y={shoulderY - 12} width={16} height={18} fill={f} />
        <circle cx={0} cy={headY} r={headR} fill={f} />
        <path d={`M ${headR * 0.55} ${headY - headR * 0.75} A ${headR} ${headR} 0 0 1 ${headR * 0.98} ${headY + headR * 0.1}`} stroke={trim} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* профиль: нос по направлению взгляда */}
        <path d={`M ${headR * 0.9} ${headY - 4} L ${headR + 7} ${headY + 6} L ${headR * 0.92} ${headY + 9} Z`} fill={f} />
        {L.hair === "up" && <circle cx={-headR * 0.35} cy={headY - headR * 0.95} r={headR * 0.48} fill={f} />}
        {L.hair === "curls" && [0, 1, 2].map((i) => <circle key={i} cx={-headR * 0.7 + i * 6} cy={headY + headR * 0.4 + i * 7} r={7} fill={f} />)}
        {L.hair === "braid" && <path d={`M ${-headR * 0.8} ${headY} Q ${-headR * 1.3} ${headY + 40} ${-headR * 0.9} ${headY + 70}`} stroke={f} strokeWidth={9} fill="none" strokeLinecap="round" />}
        {L.glasses && <circle cx={headR * 0.55} cy={headY - 2} r={7} fill="none" stroke={trim} strokeWidth={3} />}
        {L.hat === "bicorne" && <path d={`M ${-headR * 1.7} ${headY - headR * 0.4} Q 0 ${headY - headR * 2.4} ${headR * 1.7} ${headY - headR * 0.4} Q 0 ${headY - headR * 0.9} ${-headR * 1.7} ${headY - headR * 0.4} Z`} fill={f} stroke={trim} strokeWidth={2.5} />}
        {(L.hat === "shako") && <path d={`M ${-headR * 0.8} ${headY - headR * 0.6} L ${-headR * 0.95} ${headY - headR * 2.1} L ${headR * 0.95} ${headY - headR * 2.1} L ${headR * 0.8} ${headY - headR * 0.6} Z`} fill={f} stroke={trim} strokeWidth={2.5} />}
        {L.hat === "cap" && <path d={`M ${-headR * 1.05} ${headY - headR * 0.45} Q 0 ${headY - headR * 1.7} ${headR * 1.05} ${headY - headR * 0.45} L ${headR * 1.5} ${headY - headR * 0.3} Z`} fill={f} stroke={trim} strokeWidth={2.5} />}
        {L.hat === "top" && <rect x={-headR * 0.8} y={headY - headR * 2.3} width={headR * 1.6} height={headR * 1.7} rx={4} fill={f} />}
        {L.hat === "whiteHat" && <path d={`M ${-headR * 1.5} ${headY - headR * 0.55} L ${headR * 1.5} ${headY - headR * 0.55} L ${headR * 0.8} ${headY - headR * 0.75} L ${headR * 0.7} ${headY - headR * 1.9} L ${-headR * 0.7} ${headY - headR * 1.9} L ${-headR * 0.8} ${headY - headR * 0.75} Z`} fill="#f4f1e8" />}
        {L.hat === "kerchief" && <path d={`M ${-headR * 1.05} ${headY} Q 0 ${headY - headR * 1.8} ${headR * 1.05} ${headY} Z`} fill={f} stroke={trim} strokeWidth={2.5} />}
        {L.hat === "fur" && <ellipse cx={0} cy={headY - headR * 0.85} rx={headR * 1.05} ry={headR * 0.6} fill={f} stroke={trim} strokeWidth={2.5} />}
        {L.hat === "bonnet" && <path d={`M ${-headR * 1.2} ${headY + 6} Q ${-headR * 0.6} ${headY - headR * 1.9} ${headR * 1.1} ${headY - headR * 0.6}`} fill={f} stroke={trim} strokeWidth={3} />}
      </g>
    </g>
  );
};

// Пьер на Бородинском поле — в белой шляпе и фраке (штатский среди военных).
export const PierreWhiteHat: React.FC<{ x: number; y: number; s?: number; t?: number; pose?: FigPose; flip?: boolean }> = (p) => (
  <g>
    <Figure who="pierre" {...p} />
    <g transform={`translate(${p.x} ${p.y}) scale(${(p.flip ? -1 : 1) * (p.s ?? 1)} ${p.s ?? 1})`}>
      <path d="M -40 -296 L 40 -296 L 22 -300 L 20 -334 L -20 -334 L -22 -300 Z" fill="#f4f1e8" transform="translate(0 -2)" />
    </g>
  </g>
);

export const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; bg?: string; opacity?: number; serif?: boolean }> = ({ x, y, text, size = 34, color = C.ink, bg = C.paper, opacity = 1, serif }) => {
  const w = text.length * size * 0.56 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.55} rx={size * 0.5} fill={OL} opacity={0.18} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.55} rx={size * 0.5} fill={bg} />
      <text x={0} y={size * 0.12} fontFamily={serif ? SERIF : FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// Карточка-цитата: «бумага» с текстом и подписью источника.
export const QuoteCardObj: React.FC<{ x: number; y: number; w?: number; text: string; who: string; size?: number }> = ({ x, y, w = 1100, text, who, size = 44 }) => {
  const lines = wrap(text, Math.floor(w / (size * 0.5)));
  const h = lines.length * size * 1.25 + 120;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={28} fill={OL} opacity={0.2} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={C.paper} />
      <rect x={-w / 2} y={-h / 2} width={14} height={h} rx={7} fill={C.gold} />
      <text x={-w / 2 + 50} y={-h / 2 + 28 + size} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={size} fill={C.ink}>
        {lines.map((l, i) => (
          <tspan key={i} x={-w / 2 + 50} dy={i === 0 ? 0 : size * 1.25}>
            {l}
          </tspan>
        ))}
      </text>
      <text x={w / 2 - 40} y={h / 2 - 30} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.inkSoft} textAnchor="end">
        {who}
      </text>
    </g>
  );
};

export const wrap = (text: string, max: number): string[] => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};

// Сеть точек-решений: N точек вокруг центра, связи с ближайшими соседями.
export type Dot = { x: number; y: number; c: string; r: number; ph: number };
export const makeDots = (n: number, cx: number, cy: number, rx: number, ry: number, seed = 1): Dot[] =>
  Array.from({ length: n }).map((_, i) => {
    const a = rnd(i * 3 + seed) * Math.PI * 2;
    const d = Math.sqrt(rnd(i * 7 + seed * 5));
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, c: C.dots[(i + seed) % C.dots.length], r: 6 + rnd(i + seed * 11) * 6, ph: rnd(i * 13 + seed) * 6.28 };
  });

export const DotNet: React.FC<{ dots: Dot[]; t: number; k?: number; links?: number; drift?: number; linkColor?: string; linkOpacity?: number }> = ({ dots, t, k = 1, links = 2, drift = 8, linkColor = "#fff", linkOpacity = 0.28 }) => {
  const pos = dots.map((d, i) => ({ ...d, x: d.x + Math.sin(t * 0.5 + d.ph) * drift, y: d.y + Math.cos(t * 0.43 + d.ph) * drift * 0.7, i }));
  const shown = Math.floor(pos.length * Math.max(0, Math.min(1, k)));
  const segs: React.ReactNode[] = [];
  for (let i = 0; i < shown; i++) {
    const near = pos
      .slice(0, shown)
      .filter((q) => q.i !== i)
      .map((q) => ({ q, d: Math.hypot(q.x - pos[i].x, q.y - pos[i].y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, links);
    for (const { q } of near) if (q.i > i || links === 1) segs.push(<line key={`${i}-${q.i}`} x1={pos[i].x} y1={pos[i].y} x2={q.x} y2={q.y} stroke={linkColor} strokeOpacity={linkOpacity} strokeWidth={2.5} />);
  }
  return (
    <g>
      {segs}
      {pos.slice(0, shown).map((d) => (
        <g key={d.i}>
          <circle cx={d.x} cy={d.y} r={d.r + 3} fill="#fff" />
          <circle cx={d.x} cy={d.y} r={d.r} fill={d.c} />
        </g>
      ))}
    </g>
  );
};

// Толстая «стрела полководца» (может распадаться: k — доля распада).
export const BigArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; w?: number; color?: string; grow?: number; opacity?: number }> = ({ x1, y1, x2, y2, w = 70, color = C.red, grow = 1, opacity = 1 }) => {
  const ex = x1 + (x2 - x1) * grow;
  const ey = y1 + (y2 - y1) * grow;
  const ang = Math.atan2(ey - y1, ex - x1);
  const len = Math.hypot(ex - x1, ey - y1);
  if (len < 4) return null;
  const head = w * 1.5;
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${(ang * 180) / Math.PI})`} opacity={opacity}>
      <path d={`M 0 ${-w / 2} L ${Math.max(0, len - head)} ${-w / 2} L ${Math.max(0, len - head)} ${-w} L ${len} 0 L ${Math.max(0, len - head)} ${w} L ${Math.max(0, len - head)} ${w / 2} L 0 ${w / 2} Z`} fill={color} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// Небольшая стрелка-решение
export const SmallArrow: React.FC<{ x: number; y: number; ang: number; len?: number; color: string; k?: number }> = ({ x, y, ang, len = 46, color, k = 1 }) => {
  if (k <= 0) return null;
  const l = len * k;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <line x1={0} y1={0} x2={l} y2={0} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${l + 4} 0 L ${l - 10} -9 L ${l - 10} 9 Z`} fill={color} />
    </g>
  );
};

// Лист бумаги/карты
export const Paper: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; fill?: string; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, fill = C.paper, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={14} fill={OL} opacity={0.22} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={fill} />
    <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={8} fill="none" stroke={C.sepia} strokeOpacity={0.5} strokeWidth={3} />
    {children}
  </g>
);

// Облако (чёткие круги, без размытия)
export const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = "#fff", opacity = 0.9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={color}>
    <ellipse cx={0} cy={0} rx={120} ry={34} />
    <circle cx={-50} cy={-18} r={40} />
    <circle cx={10} cy={-34} r={52} />
    <circle cx={66} cy={-14} r={36} />
  </g>
);

// Дуб: bare (голый, корявый) → leaf (в молодой листве), k — доля листвы
export const Oak: React.FC<{ x: number; y: number; s?: number; leaf?: number; t?: number }> = ({ x, y, s = 1, leaf = 0, t = 0 }) => {
  const br = [
    "M 0 0 L -10 -240",
    "M -6 -150 Q -90 -200 -150 -260",
    "M -8 -200 Q 40 -280 120 -300",
    "M -10 -240 Q -40 -330 -20 -380",
    "M -90 -205 Q -150 -190 -200 -220",
    "M 60 -265 Q 110 -250 170 -270",
    "M -20 -330 Q 30 -360 70 -400",
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -40 0 Q -24 -120 -26 -240 L 12 -240 Q 10 -120 34 0 Z" fill="#5b4632" />
      {br.map((d, i) => (
        <path key={i} d={d} stroke="#5b4632" strokeWidth={i === 0 ? 0 : 22 - i * 2} fill="none" strokeLinecap="round" />
      ))}
      {leaf > 0 &&
        Array.from({ length: 34 }).map((_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const d = 40 + rnd(i + 9) * 170;
          const cx = -20 + Math.cos(a) * d * 1.3;
          const cy = -300 + Math.sin(a) * d * 0.62;
          const k = Math.max(0, Math.min(1, leaf * 1.6 - (i / 34) * 0.6));
          return <circle key={i} cx={cx + Math.sin(t + i) * 2} cy={cy} r={(26 + rnd(i + 3) * 22) * k} fill={i % 3 ? C.oak : "#8fbf4f"} />;
        })}
    </g>
  );
};

// Звёзды — чёткие точки разных цветов
export const Stars: React.FC<{ n?: number; x0?: number; x1?: number; y0?: number; y1?: number; t: number; seed?: number; k?: number }> = ({ n = 60, x0 = 0, x1 = 1920, y0 = 0, y1 = 600, t, seed = 3, k = 1 }) => (
  <g>
    {Array.from({ length: Math.floor(n * k) }).map((_, i) => {
      const x = x0 + rnd(i + seed) * (x1 - x0);
      const y = y0 + rnd(i * 5 + seed) * (y1 - y0);
      const r = 2 + rnd(i * 3 + seed) * 3.5;
      return <circle key={i} cx={x + Math.sin(t * 0.1 + i) * 2} cy={y} r={r} fill={i % 5 === 0 ? C.dots[i % 8] : "#fff"} />;
    })}
  </g>
);

// Окно (Отрадное, лунная ночь)
export const Window: React.FC<{ x: number; y: number; w?: number; h?: number; glow?: string; children?: React.ReactNode }> = ({ x, y, w = 360, h = 460, glow = "#fff3c4", children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 20} y={-h / 2 - 20} width={w + 40} height={h + 40} rx={18} fill="#5a4a3a" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={glow} />
    {children}
    <line x1={0} y1={-h / 2} x2={0} y2={h / 2} stroke="#5a4a3a" strokeWidth={14} />
    <line x1={-w / 2} y1={-h / 8} x2={w / 2} y2={-h / 8} stroke="#5a4a3a" strokeWidth={14} />
  </g>
);

// Свеча
export const Candle: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number }> = ({ x, y, s = 1, t, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-90} width={28} height={90} rx={6} fill="#f4ead2" />
    <rect x={-30} y={-6} width={60} height={12} rx={6} fill={C.goldDeep} />
    {lit > 0 && (
      <g opacity={lit}>
        <circle cx={0} cy={-118} r={34} fill={C.yellow} opacity={0.22} />
        <path d={`M 0 ${-140 + Math.sin(t * 5) * 2} Q 14 -112 0 -96 Q -14 -112 0 ${-140 + Math.sin(t * 5) * 2} Z`} fill={C.amber} />
        <path d="M 0 -124 Q 6 -110 0 -100 Q -6 -110 0 -124 Z" fill={C.yellow} />
      </g>
    )}
  </g>
);

// Монета
export const Coin: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 26, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.15, Math.abs(Math.cos(spin)))} 1)`}>
    <circle r={r} fill={C.gold} stroke={C.goldDeep} strokeWidth={4} />
    <circle r={r * 0.6} fill="none" stroke={C.goldDeep} strokeWidth={3} />
  </g>
);

// Изба (Фили, деревня), дом (Лысые Горы), купола (Москва — условный силуэт города)
export const Izba: React.FC<{ x: number; y: number; s?: number; lit?: boolean }> = ({ x, y, s = 1, lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-170} width={300} height={170} fill="#7a5a3e" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line key={i} x1={-150} x2={150} y1={-150 + i * 28} y2={-150 + i * 28} stroke="#5f4530" strokeWidth={5} />
    ))}
    <path d="M -180 -165 L 0 -290 L 180 -165 Z" fill="#5f4530" />
    <rect x={-40} y={-130} width={80} height={70} rx={6} fill={lit ? "#ffe39a" : "#c9cde6"} stroke="#4a3626" strokeWidth={8} />
  </g>
);

export const Manor: React.FC<{ x: number; y: number; s?: number; lit?: number }> = ({ x, y, s = 1, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-200} width={520} height={200} fill="#efe6d2" />
    <path d="M -100 -200 L 0 -280 L 100 -200 Z" fill="#d8c9a6" />
    {[-180, -100, 100, 180].map((cx) => (
      <rect key={cx} x={cx - 14} y={-200} width={28} height={200} fill="#fbf6ea" />
    ))}
    {[-220, -140, -60, 60, 140, 220].map((cx, i) => (
      <rect key={cx} x={cx - 22} y={-150} width={44} height={70} rx={4} fill={i % 2 ? "#ffe39a" : "#ffd47a"} opacity={0.4 + 0.6 * lit} />
    ))}
    <rect x={-30} y={-90} width={60} height={90} rx={6} fill="#a88a5a" />
  </g>
);

export const Domes: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = "#3a3f6a", opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} opacity={opacity}>
    {[
      [-300, 160, 0.8], [-160, 240, 1], [0, 320, 1.25], [160, 220, 0.95], [300, 180, 0.8], [420, 120, 0.6], [-420, 110, 0.6],
    ].map(([cx, hh, k], i) => (
      <g key={i} transform={`translate(${cx} 0)`}>
        <rect x={-40 * k} y={-hh} width={80 * k} height={hh} />
        <path d={`M ${-46 * k} ${-hh} Q ${-60 * k} ${-hh - 60 * k} 0 ${-hh - 100 * k} Q ${60 * k} ${-hh - 60 * k} ${46 * k} ${-hh} Z`} />
        <rect x={-3} y={-hh - 140 * k} width={6} height={44 * k} />
      </g>
    ))}
    <rect x={-520} y={-60} width={1040} height={60} />
  </g>
);

// Улей (пустеющая Москва — сравнение повествователя)
export const Hive: React.FC<{ x: number; y: number; s?: number; bees?: number; t: number }> = ({ x, y, s = 1, bees = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={0} cy={-40 - i * 52} rx={150 - Math.abs(i - 1.5) * 22} ry={34} fill={i % 2 ? "#e2b04a" : "#d49a32"} />
    ))}
    <ellipse cx={0} cy={-60} rx={26} ry={18} fill="#5a3f1e" />
    {Array.from({ length: Math.round(18 * bees) }).map((_, i) => {
      const a = t * (0.8 + rnd(i) * 0.6) + i;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * (170 + rnd(i + 4) * 80)} ${-140 + Math.sin(a * 1.3) * 120})`}>
          <ellipse rx={10} ry={7} fill={C.yellow} stroke={OL} strokeWidth={2.5} />
          <ellipse cx={-2} cy={-8} rx={6} ry={4} fill="#fff" opacity={0.9} />
        </g>
      );
    })}
  </g>
);

// Лошадь (силуэт, шагом)
export const Horse: React.FC<{ x: number; y: number; s?: number; t?: number; fill?: string; flip?: boolean }> = ({ x, y, s = 1, t = 0, fill = "#3a3550", flip }) => {
  const g = Math.sin(t * 4) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={fill}>
      <ellipse cx={0} cy={-160} rx={130} ry={56} />
      <path d="M 90 -190 Q 140 -280 190 -270 L 205 -240 Q 160 -230 140 -170 Z" />
      <rect x={-110} y={-130} width={20} height={130} rx={10} transform={`rotate(${g} -100 -130)`} />
      <rect x={-70} y={-130} width={20} height={130} rx={10} transform={`rotate(${-g} -60 -130)`} />
      <rect x={60} y={-130} width={20} height={130} rx={10} transform={`rotate(${-g} 70 -130)`} />
      <rect x={95} y={-130} width={20} height={130} rx={10} transform={`rotate(${g} 105 -130)`} />
      <path d="M -125 -175 Q -190 -150 -175 -80" stroke={fill} strokeWidth={18} fill="none" strokeLinecap="round" />
    </g>
  );
};

// Знамя на древке
export const Banner: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = C.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-5} y={-300} width={10} height={300} rx={4} fill="#6a4a2a" />
    <path d={`M 5 -296 Q 70 ${-310 + Math.sin(t * 3) * 14} 140 -292 Q 120 -250 140 -206 Q 70 ${-226 + Math.sin(t * 3 + 1) * 14} 5 -210 Z`} fill={color} stroke="#fff" strokeWidth={4} />
  </g>
);

// Книга (обложка «Война и мир» — собственная, без издательского дизайна)
export const BookObj: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-200} width={300} height={400} rx={16} fill="#24345e" />
    <rect x={-150} y={-200} width={36} height={400} rx={10} fill="#1b2748" />
    <rect x={-100} y={-150} width={220} height={4} fill={C.gold} />
    <rect x={-100} y={150} width={220} height={4} fill={C.gold} />
    <text x={10} y={-70} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.paper} textAnchor="middle">
      Война
    </text>
    <text x={10} y={-10} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.gold} textAnchor="middle">
      и
    </text>
    <text x={10} y={50} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.paper} textAnchor="middle">
      мир
    </text>
    <text x={10} y={120} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.fog} textAnchor="middle">
      Л. Н. Толстой
    </text>
  </g>
);
