// Декорация сцены 5 «trial»: светлая диорама-панорама Бишкека (макет
// городка; будильники смотрят на неё с полки переднего плана).
// Сзади — небо (утром тёплое, после уроков ярче), солнце, облака, хребет
// Ала-Тоо со снежными шапками и дальние дома; слева — ҮЙ (уютный дом с
// дверью, круглым чердачным окном и табличкой), справа — МЕКТЕП (простой
// фасад без флага, жёлтые двери и табличка), между ними тополя. Через всю
// сцену — тротуар и дорога, спереди газон с белым заборчиком.
// Отдельно — белый седан с жёлтой фирменной полосой (вид сбоку): водитель
// держит руль обеими руками, в заднем окне ребёнок, хорошо видна
// диагональная лямка ремня безопасности.
// Мир — px кадра 1080×1920 при zoom 1; всё детерминированно по кадру.
import { fontFamily } from "../../../fonts";
import { clamp, lerp } from "../anim";
import { C } from "../palette";
import { BG43_TEXT } from "../script";

const T = BG43_TEXT.trial;

// ---------- Раскладка диорамы (мировые px) ----------
export const DIO = {
  // границы панорамы (шире кадра при любом положении камеры)
  box: { x0: -320, x1: 1400, y0: -440, y1: 1180 },
  base: 936, // низ стен домов
  walk: 946, // линия ступней на тротуаре
  curb: 964, // край тротуара
  road1: 1072, // низ дороги
  lane: 1018, // разметка
  wheel: 1004, // низ колёс машины (ближняя к тротуару полоса)
  home: { x0: 66, x1: 382, top: 628, peak: 520, door: 300, doorW: 76, doorTop: 700 },
  school: { x0: 596, x1: 1012, top: 652, mid0: 706, mid1: 906, midTop: 604, door: 806, doorW: 108, doorTop: 700 },
} as const;

// Смешение цветов #RRGGBB.
export const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const k = clamp(t);
  const c = [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), k)).toString(16).padStart(2, "0"));
  return `#${c.join("")}`;
};

const OUT = C.navy;

// ---------- Задник: небо, солнце, облака, горы, дальний город ----------
// day: 0 — утро, 1 — после уроков. sun — положение солнца (мир).
export const DioramaBack: React.FC<{ readonly f: number; readonly day: number; readonly sun: { readonly x: number; readonly y: number } }> = ({ f, day, sun }) => {
  const { x0, x1, y0 } = DIO.box;
  const w = x1 - x0;
  // утром у горизонта тёплый персиковый свет, после уроков небо ярче
  const top = mixHex("#BCDCF7", "#A3D0F6", day);
  const mid = mixHex("#DCEBFA", "#CFE6FA", day);
  const low = mixHex("#FFE4C6", "#EEF7FD", day);
  // хребет: дальний и ближний (y вершин)
  // вершины хребта: [x мира, y]
  const far = [
    [-320, 560],
    [-180, 512],
    [-40, 572],
    [90, 536],
    [180, 572],
    [290, 500],
    [420, 566],
    [560, 514],
    [680, 560],
    [840, 494],
    [990, 552],
    [1120, 520],
    [1260, 566],
    [1400, 530],
  ] as const;
  const near = [
    [-320, 640],
    [-200, 604],
    [-60, 650],
    [80, 618],
    [220, 652],
    [360, 596],
    [500, 648],
    [640, 608],
    [800, 660],
    [930, 618],
    [1080, 652],
    [1220, 610],
    [1400, 648],
  ] as const;
  const X = (x: number) => x;
  const ridge = (pts: readonly (readonly [number, number])[], bottom: number) => `M ${x0} ${bottom} ${pts.map(([u, y]) => `L ${X(u)} ${y}`).join(" ")} L ${x1} ${bottom} Z`;
  // снежная шапка у вершины i
  const cap = (pts: readonly (readonly [number, number])[], i: number, depth: number) => {
    const [u, y] = pts[i];
    const [ul, yl] = pts[i - 1];
    const [ur, yr] = pts[i + 1];
    const kl = depth / (yl - y);
    const kr = depth / (yr - y);
    const lx = X(u) + (X(ul) - X(u)) * kl;
    const rx = X(u) + (X(ur) - X(u)) * kr;
    return `M ${lx} ${y + depth} L ${X(u)} ${y} L ${rx} ${y + depth} L ${lerp(X(u), rx, 0.55)} ${y + depth * 0.7} L ${lerp(X(u), rx, 0.25)} ${y + depth * 1.05} L ${lerp(lx, X(u), 0.6)} ${y + depth * 0.75} Z`;
  };
  const rays = f * 0.6;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="bg43-trial-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.62" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <radialGradient id="bg43-trial-sunglow">
          <stop offset="0" stopColor="#FFF4C2" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFF4C2" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={x0} y={y0} width={w} height={DIO.base - y0} fill="url(#bg43-trial-sky)" />
      {/* солнце с мягким свечением и медленно вращающимися лучами */}
      <g transform={`translate(${sun.x} ${sun.y})`}>
        <circle r={92} fill="url(#bg43-trial-sunglow)" />
        <g transform={`rotate(${rays})`}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={-4} y={-58} width={8} height={16} rx={4} fill="#FFD84A" transform={`rotate(${i * 36})`} />
          ))}
        </g>
        <circle r={34} fill="#FFD84A" />
        <circle r={27} fill="#FFE57F" />
      </g>
      {/* облака дрейфуют */}
      {(
        [
          [140, 470, 1, 0],
          [640, 430, 0.8, 2],
          [930, 500, 0.9, 4],
          [380, 250, 1.1, 1],
          [860, 200, 0.9, 3],
          [-60, 330, 1, 5],
        ] as const
      ).map(([cx, cy, s, ph], i) => {
        const x = cx + ((f * 0.22 + ph * 40) % 260) - 60;
        return (
          <g key={i} transform={`translate(${x} ${cy}) scale(${s})`} opacity={0.92}>
            <ellipse cx={0} cy={0} rx={56} ry={20} fill="#FFFFFF" />
            <ellipse cx={-20} cy={-12} rx={26} ry={20} fill="#FFFFFF" />
            <ellipse cx={14} cy={-16} rx={30} ry={24} fill="#FFFFFF" />
          </g>
        );
      })}
      {/* хребет Ала-Тоо */}
      <path d={ridge(far, 820)} fill={C.mountainFar} />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <path key={`cf${i}`} d={cap(far, i, 30)} fill={C.snow} />
      ))}
      <path d={ridge(near, 820)} fill={C.mountain} />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <path key={`cn${i}`} d={cap(near, i, 22)} fill={C.snow} opacity={0.95} />
      ))}
      {/* дальний город: панельные дома */}
      {(
        [
          [-260, 712, 130],
          [-100, 690, 110],
          [60, 700, 120],
          [190, 726, 96],
          [400, 690, 104],
          [520, 716, 80],
          [610, 700, 130],
          [770, 730, 100],
          [900, 694, 140],
          [1070, 716, 120],
          [1220, 698, 130],
        ] as const
      ).map(([bx, by, bw], i) => (
        <g key={`b${i}`}>
          <rect x={bx} y={by} width={bw} height={DIO.base - by} fill={i % 2 ? "#E6EDF6" : "#DAE4F0"} />
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: Math.floor(bw / 26) }, (_, c) => <rect key={`${r}-${c}`} x={bx + 8 + c * 26} y={by + 10 + r * 24} width={14} height={11} rx={2} fill="#C3D3E6" />),
          )}
        </g>
      ))}
      {/* зелёная полоса парка за домами */}
      <rect x={x0} y={828} width={w} height={DIO.base - 828} fill="#CFE6BE" />
      {[-250, -150, -40, 70, 160, 430, 520, 580, 700, 980, 1100, 1220, 1330].map((tx, i) => (
        <ellipse key={`p${i}`} cx={tx} cy={846 + (i % 2) * 8} rx={46} ry={34} fill={i % 2 ? "#A9D39B" : "#9CCB8E"} />
      ))}
    </svg>
  );
};

// ---------- Дерево: тополь или круглое ----------
const Tree: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly kind: "poplar" | "round"; readonly f: number; readonly ph?: number; readonly shadow: number }> = ({ x, y, s, kind, f, ph = 0, shadow }) => {
  const sway = Math.sin(f / 34 + ph) * 1.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={shadow * 26} cy={2} rx={40} ry={7} fill={OUT} opacity={0.08} />
      <rect x={-5} y={-70} width={10} height={70} rx={4} fill="#A87F55" />
      <g transform={`rotate(${sway} 0 -60)`}>
        {kind === "poplar" ? (
          <>
            <ellipse cx={0} cy={-170} rx={34} ry={120} fill="#8CC583" />
            <ellipse cx={-9} cy={-182} rx={16} ry={92} fill="#A6D59B" opacity={0.85} />
          </>
        ) : (
          <>
            <circle cx={0} cy={-104} r={52} fill="#8CC583" />
            <circle cx={-22} cy={-118} r={30} fill="#A6D59B" />
            <circle cx={24} cy={-92} r={28} fill="#7DB874" />
          </>
        )}
      </g>
    </g>
  );
};

// ---------- Табличка (жёлтая — ҮЙ, тёмно-синяя — МЕКТЕП) ----------
const Plate: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly text: string; readonly dark?: boolean; readonly pulse?: number }> = ({ x, y, w, text, dark, pulse = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${1 + 0.08 * pulse})`}>
    <rect x={-w / 2} y={-25} width={w} height={50} rx={12} fill={dark ? C.navy : C.yellow} stroke={dark ? C.yellow : OUT} strokeWidth={4} />
    <text x={0} y={12} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={900} fill={dark ? "#FFFFFF" : OUT} letterSpacing={1}>
      {text}
    </text>
  </g>
);

// ---------- ҮЙ: дом с дверью (door — открытие 0…1) ----------
export const HomeHouse: React.FC<{ readonly door: number; readonly pulse?: number }> = ({ door, pulse = 0 }) => {
  const h = DIO.home;
  const base = DIO.base;
  const dl = h.door - h.doorW / 2;
  const leaf = h.doorW * (1 - 0.82 * clamp(door));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* труба */}
      <rect x={292} y={540} width={32} height={48} rx={3} fill="#D9705A" stroke="#B85A47" strokeWidth={3} />
      <rect x={286} y={534} width={44} height={12} rx={4} fill="#C9634F" />
      {/* стены */}
      <rect x={h.x0} y={h.top} width={h.x1 - h.x0} height={base - h.top} fill="#FFF5E4" stroke="#E5D3B6" strokeWidth={4} />
      <rect x={h.x0} y={base - 14} width={h.x1 - h.x0} height={14} fill="#EADBC3" />
      {/* крыша */}
      <path d={`M ${h.x0 - 22} ${h.top + 8} L ${(h.x0 + h.x1) / 2} ${h.peak} L ${h.x1 + 22} ${h.top + 8} Z`} fill="#FFF5E4" />
      <path d={`M ${h.x0 - 26} ${h.top + 10} L ${(h.x0 + h.x1) / 2} ${h.peak - 4} L ${h.x1 + 26} ${h.top + 10}`} fill="none" stroke={C.coral} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M ${h.x0 - 20} ${h.top + 6} L ${(h.x0 + h.x1) / 2} ${h.peak - 8} L ${h.x1 + 20} ${h.top + 6}`} fill="none" stroke="#F09A84" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      {/* круглое чердачное окно */}
      <circle cx={(h.x0 + h.x1) / 2} cy={592} r={21} fill="#CFE6F7" stroke="#FFFFFF" strokeWidth={6} />
      <path d={`M ${(h.x0 + h.x1) / 2 - 18} 592 L ${(h.x0 + h.x1) / 2 + 18} 592 M ${(h.x0 + h.x1) / 2} 574 L ${(h.x0 + h.x1) / 2} 610`} stroke="#FFFFFF" strokeWidth={4} />
      {/* окно с занавесками и цветочным ящиком */}
      <rect x={96} y={724} width={128} height={104} rx={6} fill="#CFE6F7" stroke="#FFFFFF" strokeWidth={8} />
      <path d="M 104 732 Q 122 770 110 820 L 104 820 Z M 216 732 Q 198 770 210 820 L 216 820 Z" fill="#FFE7A0" />
      <path d="M 160 724 L 160 828 M 96 776 L 224 776" stroke="#FFFFFF" strokeWidth={6} />
      <rect x={90} y={828} width={140} height={16} rx={4} fill="#D9B48A" />
      {[104, 128, 152, 176, 200, 220].map((fx, i) => (
        <circle key={fx} cx={fx} cy={824} r={7} fill={i % 2 ? C.coral : C.yellow} />
      ))}
      {/* дверь: тёплый свет внутри, створка открывается к петлям слева */}
      <rect x={dl - 8} y={h.doorTop - 8} width={h.doorW + 16} height={base - h.doorTop + 8} rx={6} fill="#FFFFFF" />
      <rect x={dl} y={h.doorTop} width={h.doorW} height={base - h.doorTop} fill="#FFE2A8" />
      <rect x={dl} y={h.doorTop} width={h.doorW} height={30} fill="#F7C978" opacity={0.6} />
      <g>
        <rect x={dl} y={h.doorTop} width={leaf} height={base - h.doorTop} fill={mixHex("#2B4C8F", "#3D63AE", door)} />
        <rect x={dl + leaf * 0.16} y={h.doorTop + 22} width={leaf * 0.68} height={84} rx={4} fill="#244277" opacity={0.6} />
        <rect x={dl + leaf * 0.16} y={h.doorTop + 124} width={leaf * 0.68} height={90} rx={4} fill="#244277" opacity={0.6} />
        <circle cx={dl + leaf * 0.82} cy={h.doorTop + 122} r={5.5} fill={C.yellow} opacity={leaf > 30 ? 1 : 0} />
      </g>
      {/* табличка ҮЙ над дверью */}
      <Plate x={h.door} y={664} w={96} text={T.home} pulse={pulse} />
      {/* фонарик и водосток */}
      <rect x={366} y={h.top + 8} width={8} height={base - h.top - 8} rx={3} fill="#E5D3B6" />
      <rect x={232} y={724} width={14} height={24} rx={5} fill={C.yellow} stroke="#E0B23A" strokeWidth={2} />
      {/* крыльцо */}
      <rect x={h.door - 56} y={base - 2} width={112} height={12} rx={4} fill="#E2D8C8" />
    </svg>
  );
};

// ---------- МЕКТЕП: простой фасад без флага (doors — открытие 0…1) ----------
export const SchoolHouse: React.FC<{ readonly doors: number; readonly pulse?: number }> = ({ doors, pulse = 0 }) => {
  const s = DIO.school;
  const base = DIO.base;
  const wall = "#F2F6FC";
  const edge = "#CCD7E6";
  const dl = s.door - s.doorW / 2;
  const half = (s.doorW / 2) * (1 - 0.8 * clamp(doors));
  const win = (x: number, y: number, w: number, hh: number, k: string) => (
    <g key={k}>
      <rect x={x} y={y} width={w} height={hh} rx={5} fill="#CFE6F7" stroke="#FFFFFF" strokeWidth={5} />
      <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + hh}`} stroke="#FFFFFF" strokeWidth={4} />
      <rect x={x - 4} y={y + hh} width={w + 8} height={6} rx={2} fill={edge} />
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* крылья */}
      <rect x={s.x0} y={s.top} width={s.x1 - s.x0} height={base - s.top} fill={wall} stroke={edge} strokeWidth={4} />
      <rect x={s.x0 - 8} y={s.top - 12} width={s.x1 - s.x0 + 16} height={16} rx={4} fill="#2B4C8F" />
      {/* центральная часть с фронтоном */}
      <rect x={s.mid0} y={s.midTop} width={s.mid1 - s.mid0} height={base - s.midTop} fill="#FAFCFF" stroke={edge} strokeWidth={4} />
      <path d={`M ${s.mid0 - 10} ${s.midTop} L ${(s.mid0 + s.mid1) / 2} ${s.midTop - 34} L ${s.mid1 + 10} ${s.midTop} Z`} fill={C.navy} />
      <path d={`M ${s.mid0 + 20} ${s.midTop - 4} L ${(s.mid0 + s.mid1) / 2} ${s.midTop - 24} L ${s.mid1 - 20} ${s.midTop - 4} Z`} fill={C.yellow} />
      <rect x={s.x0} y={base - 16} width={s.x1 - s.x0} height={16} fill="#DDE5F0" />
      {/* окна крыльев: два ряда */}
      {[612, 658, 922, 968].flatMap((x) => [win(x, 676, 34, 50, `u${x}`), win(x, 784, 34, 58, `d${x}`)])}
      {/* узкие окна у входа */}
      {win(718, 716, 26, 84, "l")}
      {win(868, 716, 26, 84, "r")}
      {/* двери: светлый холл, две жёлтые створки расходятся */}
      <rect x={dl - 10} y={s.doorTop - 10} width={s.doorW + 20} height={base - s.doorTop + 10} rx={8} fill="#2B4C8F" />
      <rect x={dl} y={s.doorTop} width={s.doorW} height={base - s.doorTop} fill="#FFF1C9" />
      <rect x={dl} y={s.doorTop} width={s.doorW} height={26} fill="#F6D98A" opacity={0.6} />
      {([-1, 1] as const).map((side) => {
        const x = side < 0 ? dl : s.door + s.doorW / 2 - half;
        return (
          <g key={side}>
            <rect x={x} y={s.doorTop} width={half} height={base - s.doorTop} fill={C.yellow} stroke={OUT} strokeWidth={3} />
            <rect x={x + half * 0.18} y={s.doorTop + 18} width={half * 0.64} height={96} rx={4} fill="#CFE6F7" opacity={half > 12 ? 1 : 0} />
            <rect x={side < 0 ? x + half - 9 : x + 4} y={s.doorTop + 128} width={5} height={30} rx={2.5} fill={OUT} opacity={half > 12 ? 1 : 0} />
          </g>
        );
      })}
      {/* ступени */}
      <rect x={dl - 26} y={base - 4} width={s.doorW + 52} height={10} rx={3} fill="#D9E1EC" />
      <rect x={dl - 40} y={base + 4} width={s.doorW + 80} height={8} rx={3} fill="#E6ECF4" />
      {/* табличка МЕКТЕП */}
      <Plate x={s.door} y={652} w={196} text={T.school} dark pulse={pulse} />
    </svg>
  );
};

// ---------- Деревья между домами (за людьми) ----------
export const DioramaTrees: React.FC<{ readonly f: number; readonly day: number }> = ({ f, day }) => {
  const sh = lerp(1, -1, day);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <Tree x={424} y={DIO.base} s={0.92} kind="poplar" f={f} shadow={sh} />
      <Tree x={474} y={DIO.base} s={1.05} kind="poplar" f={f} ph={1.3} shadow={sh} />
      <Tree x={540} y={DIO.base} s={0.9} kind="round" f={f} ph={2.1} shadow={sh} />
      <Tree x={36} y={DIO.base} s={0.7} kind="round" f={f} ph={3.1} shadow={sh} />
      <Tree x={-60} y={DIO.base} s={0.95} kind="poplar" f={f} ph={2.6} shadow={sh} />
      <Tree x={-170} y={DIO.base} s={0.85} kind="round" f={f} ph={1.9} shadow={sh} />
      <Tree x={1040} y={DIO.base} s={0.82} kind="poplar" f={f} ph={0.7} shadow={sh} />
      <Tree x={1110} y={DIO.base} s={0.9} kind="round" f={f} ph={4.2} shadow={sh} />
      <Tree x={1200} y={DIO.base} s={1} kind="poplar" f={f} ph={5.1} shadow={sh} />
    </svg>
  );
};

// ---------- Тротуар и дорога ----------
export const DioramaStreet: React.FC = () => {
  const { x0, x1 } = DIO.box;
  const w = x1 - x0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={x0} y={DIO.base} width={w} height={DIO.curb - DIO.base} fill="#EFE8DC" />
      {Array.from({ length: 37 }, (_, i) => (
        <path key={i} d={`M ${x0 + 20 + i * 48} ${DIO.base + 4} L ${x0 + 14 + i * 48} ${DIO.curb - 4}`} stroke="#E0D7C7" strokeWidth={2.5} />
      ))}
      <rect x={x0} y={DIO.curb - 4} width={w} height={8} fill="#D8CEBE" />
      <rect x={x0} y={DIO.curb + 4} width={w} height={DIO.road1 - DIO.curb - 4} fill="#AEB6C3" />
      <rect x={x0} y={DIO.curb + 4} width={w} height={10} fill="#A3ACBA" />
      {Array.from({ length: 19 }, (_, i) => (
        <rect key={`d${i}`} x={x0 + 30 + i * 92} y={DIO.lane - 4} width={52} height={8} rx={4} fill="#FFFFFF" opacity={0.9} />
      ))}
      <rect x={x0} y={DIO.road1 - 6} width={w} height={6} fill="#D8CEBE" />
    </svg>
  );
};

// ---------- Газон с белым заборчиком (перед машиной) ----------
export const DioramaFront: React.FC<{ readonly f: number }> = ({ f }) => {
  const { x0, x1, y1 } = DIO.box;
  const w = x1 - x0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={x0} y={DIO.road1} width={w} height={y1 - DIO.road1} fill="#CBE7B6" />
      <rect x={x0} y={DIO.road1} width={w} height={10} fill="#B9DDA1" />
      {/* заборчик */}
      {Array.from({ length: 46 }, (_, i) => {
        const px = x0 + 10 + i * 38;
        return <path key={i} d={`M ${px} 1146 L ${px} 1104 L ${px + 7} 1096 L ${px + 14} 1104 L ${px + 14} 1146 Z`} fill="#FFFFFF" stroke="#D6DFEA" strokeWidth={2} />;
      })}
      <rect x={x0} y={1112} width={w} height={7} fill="#FFFFFF" stroke="#D6DFEA" strokeWidth={2} />
      <rect x={x0} y={1132} width={w} height={7} fill="#FFFFFF" stroke="#D6DFEA" strokeWidth={2} />
      {/* кусты и цветы */}
      {[-200, 60, 250, 470, 700, 900, 1030, 1250].map((bx, i) => (
        <g key={`k${i}`} transform={`translate(${bx} 1160) scale(${1 + 0.02 * Math.sin(f / 22 + i)})`}>
          <ellipse cx={0} cy={0} rx={62} ry={30} fill={i % 2 ? "#9CCB8E" : "#8CC583"} />
          <circle cx={-24} cy={-12} r={6} fill={C.yellow} />
          <circle cx={10} cy={-20} r={6} fill="#FFFFFF" />
          <circle cx={30} cy={-6} r={6} fill={C.coral} />
        </g>
      ))}
    </svg>
  );
};

// Обрезка по границам панорамы.
export const DioramaClip: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const { x0, x1, y0, y1 } = DIO.box;
  return (
    <div
      style={{
        position: "absolute",
        left: x0,
        top: y0,
        width: x1 - x0,
        height: y1 - y0,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: -x0, top: -y0, width: 1, height: 1 }}>{children}</div>
    </div>
  );
};

// ---------- Белый седан с жёлтой полосой (вид сбоку) ----------
// x — центр машины, y — линия земли (низ колёс). dir: 1 — едет вправо,
// −1 — влево. wheel — поворот колёс (°), pitch — клевок корпуса (°),
// bob — подпрыгивание (px). kid — ребёнок в заднем окне (0…1), belt —
// ремень застёгнут (0…1, лямка «вытягивается» от стойки к замку),
// wave — ребёнок машет (0…1).
export type CarProps = {
  readonly uid: string;
  readonly x: number;
  readonly y: number;
  readonly dir: 1 | -1;
  readonly wheel: number;
  readonly pitch?: number;
  readonly bob?: number;
  readonly kid: number;
  readonly belt: number;
  readonly wave?: number;
  readonly f: number;
  readonly s?: number;
};

const BODY =
  "M -160 -24 Q -170 -26 -170 -44 L -168 -70 Q -164 -82 -142 -84 L -112 -88 Q -96 -140 -58 -146 L 30 -146 Q 54 -144 84 -98 L 100 -90 Q 150 -86 164 -72 Q 172 -60 170 -42 L 168 -30 Q 166 -22 156 -22 L -152 -22 Q -158 -22 -160 -24 Z";
const WIN_REAR = "M -102 -90 Q -88 -134 -58 -138 L -15 -138 L -15 -90 Z";
const WIN_FRONT = "M -5 -90 L -5 -138 L 28 -138 Q 48 -136 74 -98 L 76 -90 Z";
const SKIN_KID = "#E8B48D";
// лямка: верхнее крепление у стойки → плечо → замок у бедра
const BELT = "M -17 -128 L -37 -105 L -64 -89";
const SKIN_DRIVER = "#DCAA84";

export const Car: React.FC<CarProps> = ({ uid, x, y, dir, wheel, pitch = 0, bob = 0, kid, belt, wave = 0, f, s = 1 }) => {
  const id = `bg43car-${uid}`;
  const bl = clamp(belt);
  const kidO = clamp(kid);
  const beltLen = 62;
  const waveA = Math.sin(f / 2.6) * 22;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`${id}-win`}>
          <path d={WIN_REAR} />
          <path d={WIN_FRONT} />
        </clipPath>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.62" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3E9F2" />
        </linearGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
        {/* тень */}
        <ellipse cx={0} cy={2} rx={162} ry={10} fill={OUT} opacity={0.16} />
        <g transform={`translate(0 ${-bob}) rotate(${pitch} 0 -60)`}>
          {/* кузов */}
          <path d={BODY} fill={`url(#${id}-paint)`} />
          {/* салон за стёклами */}
          <g clipPath={`url(#${id}-win)`}>
            <rect x={-110} y={-150} width={190} height={64} fill="#B7CDE3" />
            {/* сиденья */}
            <rect x={-78} y={-134} width={46} height={48} rx={10} fill="#93A3BC" />
            <rect x={-2} y={-132} width={26} height={46} rx={8} fill="#93A3BC" />
            {/* водитель: смотрит вперёд, обе руки на руле */}
            <g>
              <path d="M -2 -88 Q -2 -104 14 -106 L 34 -104 Q 44 -100 44 -88 Z" fill="#45597F" />
              <circle cx={22} cy={-118} r={14} fill={SKIN_DRIVER} />
              <path d="M 8 -120 Q 8 -136 24 -134 Q 34 -133 36 -124 Q 26 -128 18 -122 L 14 -112 Q 8 -114 8 -120 Z" fill="#2A2420" />
              <circle cx={16} cy={-116} r={3.4} fill="#C99672" />
              <circle cx={30} cy={-119} r={1.9} fill={OUT} />
              <path d="M 35 -116 Q 38 -113 35 -111" fill="none" stroke="#C99672" strokeWidth={1.8} strokeLinecap="round" />
              {/* руль (вид сбоку) и руки */}
              <path d="M 58 -94 L 68 -86" stroke="#3A4256" strokeWidth={4} strokeLinecap="round" />
              <ellipse cx={60} cy={-104} rx={4.5} ry={15} fill="none" stroke="#2E3445" strokeWidth={4} transform="rotate(-22 60 -104)" />
              <path d="M 24 -100 Q 44 -106 63 -114" fill="none" stroke="#3B4D72" strokeWidth={6} strokeLinecap="round" />
              <path d="M 28 -96 Q 42 -92 56 -95" fill="none" stroke="#45597F" strokeWidth={6.5} strokeLinecap="round" />
              <circle cx={63.5} cy={-114} r={4.4} fill={SKIN_DRIVER} />
              <circle cx={56} cy={-95} r={4.4} fill={SKIN_DRIVER} />
            </g>
            {/* ребёнок в заднем окне: лицом к зрителю, пристёгнут */}
            <g opacity={kidO} transform={`translate(0 ${(1 - kidO) * 12})`}>
              <path d="M -74 -86 Q -74 -104 -60 -106 L -44 -106 Q -30 -104 -30 -86 Z" fill="#2F4A7A" />
              <path d="M -58 -106 L -52 -97 L -46 -106 Z" fill="#FFFFFF" />
              <circle cx={-52} cy={-120} r={13.5} fill={SKIN_KID} />
              <path d="M -66 -120 Q -67 -136 -52 -136 Q -37 -136 -38 -120 Q -42 -128 -52 -127 Q -60 -128 -66 -120 Z" fill="#221B19" />
              <circle cx={-56.5} cy={-119} r={1.9} fill={OUT} />
              <circle cx={-47.5} cy={-119} r={1.9} fill={OUT} />
              <path d="M -56 -113 Q -52 -109.5 -48 -113" fill="none" stroke="#9E4E4A" strokeWidth={1.8} strokeLinecap="round" />
              <circle cx={-61} cy={-114} r={2.6} fill={C.blush} opacity={0.6} />
              <circle cx={-43} cy={-114} r={2.6} fill={C.blush} opacity={0.6} />
              {/* ремень безопасности: светлая лямка с тёмной каймой через грудь к замку */}
              <path d={BELT} fill="none" stroke="#3C4458" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${beltLen * bl} ${beltLen + 10}`} />
              <path d={BELT} fill="none" stroke="#C3CAD6" strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${beltLen * bl} ${beltLen + 10}`} />
              <rect x={-70} y={-93} width={10} height={8} rx={2} fill="#E9EDF3" stroke="#3C4458" strokeWidth={1.6} opacity={bl > 0.96 ? 1 : 0} />
              <rect x={-21} y={-132} width={8} height={8} rx={2} fill="#C9D0DB" stroke="#3C4458" strokeWidth={1.4} />
              {/* машет рукой */}
              {wave > 0.01 ? (
                <g opacity={clamp(wave * 2)} transform={`rotate(${waveA * wave} -70 -100)`}>
                  <path d="M -70 -100 L -76 -124" stroke="#2F4A7A" strokeWidth={6} strokeLinecap="round" />
                  <circle cx={-77} cy={-127} r={4.5} fill={SKIN_KID} />
                </g>
              ) : null}
            </g>
            {/* блики стекла */}
            <path d="M -96 -92 L -66 -140 L -52 -140 L -82 -92 Z" fill="#FFFFFF" opacity={0.22} />
            <path d="M 34 -92 L 58 -132 L 68 -124 L 50 -92 Z" fill="#FFFFFF" opacity={0.22} />
          </g>
          {/* рамки окон и стойка */}
          <path d={WIN_REAR} fill="none" stroke="#7D8AA3" strokeWidth={2.5} />
          <path d={WIN_FRONT} fill="none" stroke="#7D8AA3" strokeWidth={2.5} />
          {/* жёлтая фирменная полоса */}
          <g clipPath={`url(#${id}-body)`}>
            <rect x={-180} y={-64} width={360} height={11} fill={C.yellow} />
            <rect x={-180} y={-53} width={360} height={2.5} fill={C.yellowDeep} opacity={0.7} />
            <rect x={-180} y={-36} width={360} height={14} fill="#DCE3EE" />
          </g>
          {/* двери, ручки, зеркало, фары */}
          <path d="M -10 -90 L -10 -30 M 80 -92 Q 84 -60 80 -30 M -104 -88 Q -112 -60 -100 -30" fill="none" stroke="#B9C4D6" strokeWidth={2.2} />
          <rect x={-44} y={-80} width={18} height={5} rx={2.5} fill="#AEB9CB" />
          <rect x={44} y={-80} width={18} height={5} rx={2.5} fill="#AEB9CB" />
          <path d="M 76 -100 L 90 -104 L 92 -94 L 80 -92 Z" fill="#FFFFFF" stroke={OUT} strokeWidth={2} strokeLinejoin="round" />
          <path d="M 156 -76 Q 168 -72 169 -62 L 158 -62 Z" fill="#FFE9A6" stroke="#E9B949" strokeWidth={1.6} />
          <rect x={-170} y={-78} width={9} height={16} rx={3} fill={C.coral} />
          {/* контур кузова */}
          <path d={BODY} fill="none" stroke={OUT} strokeWidth={3.2} strokeLinejoin="round" />
          {/* колёсные арки и колёса */}
          {[-104, 104].map((wx) => (
            <g key={wx}>
              <path d={`M ${wx - 36} -22 A 36 36 0 0 1 ${wx + 36} -22 Z`} fill="#3A4256" />
            </g>
          ))}
        </g>
        {[-104, 104].map((wx) => (
          <g key={`w${wx}`} transform={`translate(${wx} -28) rotate(${wheel})`}>
            <circle r={28} fill="#2E3445" />
            <circle r={16} fill="#D5DBE5" />
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x={-2.5} y={-15} width={5} height={11} rx={2} fill="#9AA5B8" transform={`rotate(${a})`} />
            ))}
            <circle r={5} fill="#7D8AA3" />
            <circle cx={0} cy={-21.5} r={2.6} fill="#5A6378" />
          </g>
        ))}
      </g>
    </svg>
  );
};
