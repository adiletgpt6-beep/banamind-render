// Вид сверху на низкий столик (вставные планы фильма 80-1-10): деревянная
// столешница, большой лист с заголовком и карточками, рисунки детей, пенал,
// маркер, закрытая папка «Наши вопросы», текстовые карточки, полоски
// крепления, лодочка — и руки учителя и мальчиков, входящие снизу кадра.
// Состояние кадра — из плана реквизита (plan.ts), плана лодочки
// (boatPlan.ts) и хореографии рук (deskHands.ts); компонент только рисует.
//
// Вид «со стороны детей, зеркально по горизонтали»: x экрана растёт с u
// (Билал слева … учитель справа, как в комнате), край у детей (v = 0)
// внизу, заголовок плаката — вверху, все надписи читаются прямо.
import { useMemo } from "react";
import { easeInOut } from "../rig/motion";
import { PaperBoatTop } from "./boat";
import { BOAT_LENGTH_MM } from "./boatModel";
import type { BoatPlan } from "./boatPlan";
import {
  buildDeskHands,
  CAP_LEN,
  DEAL_STEP,
  deskToView,
  dirV,
  HAND_BUILD,
  handGeom,
  MARKER_LEN,
  markerLying,
  PENCIL_LEN,
  pencilBackAt,
  pencilInTray,
  pencilLiesAtRest,
  PENCIL_REST_ANGLE,
  posterRoll,
  rotV,
  TRAY_PENCILS,
  trayPencilTip,
  type Chain,
  type DeskHand,
  type DeskHandWho,
  type DeskItem,
} from "./deskHands";
import { CardBack, CardFace } from "./drawings";
import { CARD_MM, CARD_UNITS, DESK, deskToPoster, POSTER, POSTER_ON_DESK, TABLE_DEPTH_MM, TABLE_LEN_MM, type Vec } from "./layout";
import type { Plan } from "./plan";
import { PAPER, PAPER_EDGE, PosterContent, TextCardFace, TITLE_INK, type PosterCard, type PosterView } from "./poster";
import { textCardSize } from "./posterText";
import { ClosedFolderFace } from "./props";
import { rosterById, type DrawingKind } from "./roster";

// ---------- камера ----------
// Точка стола (u, v мм) в центре кадра и масштаб (px на мм).
export type DeskCam = { readonly u: number; readonly v: number; readonly scale: number };

export const DESK_CAMS = {
  // весь лист и немного стола (видны папка справа и место Билала слева)
  poster: { u: 790, v: 345, scale: 1.42 },
  // верхняя часть листа: заголовок и места текстовых карточек
  title: { u: 788, v: 488, scale: 2.6 },
  // место «Аллах Един» с заголовком над ним (заголовок целиком в кадре)
  textOne: { u: 788, v: 545, scale: 2.9 },
  // место «У Аллаха нет начала» с заголовком над ним (заголовок целиком)
  textTwo: { u: 788, v: 545, scale: 2.9 },
  // карточки главных героев при рисовании (сцена 1): карточка ≈ 57 % ширины кадра
  yusufCard: { u: 922, v: 140, scale: 10.5 },
  amirCard: { u: 490, v: 144, scale: 10.5 },
  bilalCard: { u: 194, v: 224, scale: 10.5 },
  // средний ряд: птица, Земля, дерево, яблоко
  three: { u: 727, v: 283, scale: 3.3 },
  // карточка Амира крупно: лодочка и подпись «Лодочку сложил Амир» читаются
  treeCard: { u: 789, v: 282, scale: 9.6 },
  // закрытая папка «Наши вопросы»
  folder: { u: 1262, v: 205, scale: 2.75 },
  // лист с нижними рядами и углами (сборка)
  assembly: { u: 788, v: 255, scale: 1.9 },
} as const satisfies Record<string, DeskCam>;

// ---------- цвета ----------
const WOOD = "#A3784F";
const WOOD_DARK = "#8A623F";
const WOOD_LIGHT = "#B98D61";
const FLOOR = "#6B5140";
const SHADOW = "#3A2414";

type Sleeve = {
  readonly kind: "suit" | "sweater" | "shirt" | "bare";
  readonly color: string;
  readonly dark: string;
  readonly light: string;
  readonly cuff: string;
  readonly cuffDark: string;
  readonly cuffFrom: number;
  readonly cuffTo: number;
};
type Look = { readonly skin: string; readonly shade: string; readonly light: string; readonly nail: string; readonly sleeve: Sleeve };
const LOOK: Record<DeskHandWho, Look> = {
  teacher: {
    skin: "#E0AF8B",
    shade: "#CA9772",
    light: "#EEC6A6",
    nail: "#F2D6C6",
    sleeve: { kind: "suit", color: "#2F4A7A", dark: "#243B64", light: "#3C5C92", cuff: "#FFFFFF", cuffDark: "#D9E0EA", cuffFrom: 16, cuffTo: 34 },
  },
  yusuf: {
    skin: "#E8B48D",
    shade: "#D29A73",
    light: "#F4CAA8",
    nail: "#F8DDCD",
    sleeve: { kind: "bare", color: "#F2C53D", dark: "#D7A82A", light: "#F8D766", cuff: "#F2C53D", cuffDark: "#D7A82A", cuffFrom: 0, cuffTo: 0 },
  },
  amir: {
    skin: "#EBBE9A",
    shade: "#D8A57F",
    light: "#F6D3B6",
    nail: "#F9E0D2",
    sleeve: { kind: "sweater", color: "#3E6FB5", dark: "#325D9C", light: "#4E80C4", cuff: "#3765A9", cuffDark: "#2C5590", cuffFrom: 11, cuffTo: 33 },
  },
  bilal: {
    skin: "#D9A67E",
    shade: "#C38E66",
    light: "#E7BC99",
    nail: "#EFD0BC",
    sleeve: { kind: "shirt", color: "#4E8F5E", dark: "#407A4F", light: "#5FA170", cuff: "#4A8858", cuffDark: "#3B6F48", cuffFrom: 15, cuffTo: 33 },
  },
};

// ---------- геометрия контуров ----------
const f2 = (n: number) => (Math.round(n * 100) / 100).toString();
const P = (p: Vec) => `${f2(p.x)} ${f2(p.y)}`;
const addV = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const subV = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const mulV = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
const lenV = (a: Vec) => Math.hypot(a.x, a.y);
const normV = (a: Vec): Vec => {
  const l = lenV(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
const lerpV = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// Гладкий замкнутый контур через точки (Катмулл — Ром).
const closedPath = (pts: readonly Vec[]) => {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = addV(p1, mulV(subV(p2, p0), 1 / 6));
    const c2 = subV(p2, mulV(subV(p3, p1), 1 / 6));
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return `${d}Z`;
};

// Трубка (рука, рукав) по осевой линии с шириной в каждой точке; концы скруглены.
const tube = (pts: readonly Vec[], ws: readonly number[], capA = 0.55, capB = 0.55) => {
  const n = pts.length;
  const dirs = pts.map((p, i) => normV(subV(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])));
  const L = pts.map((p, i) => addV(p, mulV({ x: -dirs[i].y, y: dirs[i].x }, ws[i] / 2)));
  const R = pts.map((p, i) => subV(p, mulV({ x: -dirs[i].y, y: dirs[i].x }, ws[i] / 2)));
  const side = (q: readonly Vec[]) => {
    let d = "";
    for (let i = 0; i < q.length - 1; i++) {
      const p0 = q[Math.max(0, i - 1)];
      const p1 = q[i];
      const p2 = q[i + 1];
      const p3 = q[Math.min(q.length - 1, i + 2)];
      d += `C${P(addV(p1, mulV(subV(p2, p0), 1 / 6)))} ${P(subV(p2, mulV(subV(p3, p1), 1 / 6)))} ${P(p2)}`;
    }
    return d;
  };
  const dB = dirs[n - 1];
  const dA = dirs[0];
  const Rr = [...R].reverse();
  return (
    `M${P(L[0])}` +
    side(L) +
    `C${P(addV(L[n - 1], mulV(dB, ws[n - 1] * capB)))} ${P(addV(R[n - 1], mulV(dB, ws[n - 1] * capB)))} ${P(R[n - 1])}` +
    side(Rr) +
    `C${P(subV(R[0], mulV(dA, ws[0] * capA)))} ${P(subV(L[0], mulV(dA, ws[0] * capA)))} ${P(L[0])}Z`
  );
};

// ---------- стол ----------
const grain = (() => {
  const lines: { d: string; c: string; w: number; o: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const y0 = 8 + i * 15.2 + Math.sin(i * 2.3) * 5;
    const amp = 2 + ((i * 7) % 5);
    const ph = i * 1.7;
    let d = `M-20 ${f2(y0)}`;
    for (let x = 0; x <= 1640; x += 80) {
      const y = y0 + Math.sin(x / 210 + ph) * amp + Math.sin(x / 57 + ph * 2) * 0.8;
      d += `L${x} ${f2(y)}`;
    }
    lines.push({ d, c: i % 3 === 0 ? WOOD_LIGHT : WOOD_DARK, w: i % 4 === 0 ? 2.2 : 1.1, o: i % 3 === 0 ? 0.32 : 0.22 });
  }
  // сучки
  const knots = [
    { x: 260, y: 140, r: 9 },
    { x: 1460, y: 610, r: 7 },
    { x: 980, y: 30, r: 6 },
  ];
  return { lines, knots };
})();

const TableTop: React.FC<{ readonly uid: string }> = ({ uid }) => {
  const W = TABLE_LEN_MM;
  const H = TABLE_DEPTH_MM;
  return (
    <g>
      <rect x={-3000} y={-3000} width={W + 6000} height={H + 6000} fill={FLOOR} />
      <rect x={-3000} y={-3000} width={W + 6000} height={H + 6000} fill={`url(#${uid}-floor)`} />
      {/* тень столешницы на полу */}
      {[0, 6, 13, 22].map((e, i) => (
        <rect key={e} x={4 - e} y={6 - e} width={W + 8 + e * 2} height={H + 14 + e * 2} rx={18 + e} fill={SHADOW} opacity={[0.22, 0.12, 0.08, 0.05][i]} />
      ))}
      <rect x={0} y={0} width={W} height={H} rx={16} fill={WOOD} />
      <g clipPath={`url(#${uid}-tableclip)`}>
        {grain.lines.map((l, i) => (
          <path key={i} d={l.d} stroke={l.c} strokeWidth={l.w} opacity={l.o} fill="none" />
        ))}
        {grain.knots.map((k, i) => (
          <g key={i} opacity={0.3}>
            <ellipse cx={k.x} cy={k.y} rx={k.r * 2.2} ry={k.r} fill="none" stroke={WOOD_DARK} strokeWidth={1.2} />
            <ellipse cx={k.x} cy={k.y} rx={k.r * 1.1} ry={k.r * 0.45} fill={WOOD_DARK} />
          </g>
        ))}
        <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-tablelight)`} />
      </g>
      {/* скруглённая кромка: блик по краю, у детей — бортик */}
      <rect x={1.5} y={1.5} width={W - 3} height={H - 3} rx={15} fill="none" stroke={WOOD_LIGHT} strokeWidth={3} opacity={0.55} />
      <path d={`M14 ${H - 5} L${W - 14} ${H - 5}`} stroke="#C9A174" strokeWidth={3.5} opacity={0.7} />
      <path d={`M10 ${H + 2.5} L${W - 10} ${H + 2.5}`} stroke="#7C5737" strokeWidth={5} opacity={0.9} />
      <path d={`M16 ${H + 6} L${W - 16} ${H + 6}`} stroke="#5E4128" strokeWidth={2.5} opacity={0.7} />
    </g>
  );
};

// ---------- карандаш, маркер ----------
const PencilTop: React.FC<{ readonly tip: Vec; readonly angle: number; readonly elev: number; readonly len: number; readonly color: string }> = ({ tip, angle, elev, len, color }) => {
  const k = Math.cos((elev * Math.PI) / 180);
  const L = len * k;
  const cone = 17 * k;
  const lead = 4.6 * k;
  const w = 7.2;
  const bodyTop = -L;
  return (
    <g transform={`translate(${f2(tip.x)} ${f2(tip.y)}) rotate(${f2(angle)})`}>
      <rect x={-w / 2} y={bodyTop} width={w} height={L - cone} rx={0.6} fill={color} />
      <rect x={-w / 2} y={bodyTop} width={w * 0.3} height={L - cone} fill="#FFFFFF" opacity={0.22} />
      <rect x={w / 2 - w * 0.3} y={bodyTop} width={w * 0.3} height={L - cone} fill="#000000" opacity={0.16} />
      <rect x={-w / 2} y={bodyTop} width={w} height={2.2 * k + 0.6} rx={0.6} fill="#000000" opacity={0.18} />
      {/* заточка: дерево с волнистым краем покраски и цветной грифель */}
      <path
        d={`M${-w / 2} ${-cone} Q ${-w / 4} ${-cone - 1.6 * k} 0 ${-cone} Q ${w / 4} ${-cone - 1.6 * k} ${w / 2} ${-cone} L 1.5 ${-lead} L -1.5 ${-lead} Z`}
        fill="#EBCB9C"
      />
      <path d={`M${w / 2} ${-cone} L 1.5 ${-lead} L 0.4 ${-lead} L ${w / 6} ${-cone} Z`} fill="#C9A273" opacity={0.7} />
      <path d={`M -1.5 ${-lead} L 0 0.3 L 1.5 ${-lead} Z`} fill={color} />
      <path d={`M -1.5 ${-lead} L 0 0.3 L -0.2 ${-lead} Z`} fill="#FFFFFF" opacity={0.25} />
    </g>
  );
};

const MARKER_W = 15;
const MarkerTop: React.FC<{ readonly tip: Vec; readonly angle: number; readonly elev: number; readonly cap: "on" | "off" }> = ({ tip, angle, elev, cap }) => {
  const k = Math.cos((elev * Math.PI) / 180);
  const L = MARKER_LEN * k;
  const nib = 9 * k;
  const collar = 16 * k;
  const w = MARKER_W;
  return (
    <g transform={`translate(${f2(tip.x)} ${f2(tip.y)}) rotate(${f2(angle)})`}>
      <rect x={-w / 2} y={-L} width={w} height={L - collar} rx={4} fill={TITLE_INK} />
      <rect x={-w / 2} y={-L * 0.72} width={w} height={L * 0.3} fill="#F4F1E8" opacity={0.9} />
      <rect x={-w / 2} y={-L} width={w * 0.28} height={L - collar} rx={3} fill="#FFFFFF" opacity={0.18} />
      <rect x={w / 2 - w * 0.25} y={-L} width={w * 0.25} height={L - collar} rx={3} fill="#000000" opacity={0.18} />
      <path d={`M${-w / 2} ${-collar} L ${w / 2} ${-collar} L ${w * 0.28} ${-nib} L ${-w * 0.28} ${-nib} Z`} fill="#D8DCE3" />
      <path d={`M${-w * 0.2} ${-nib} L ${w * 0.2} ${-nib} L ${w * 0.08} 0.5 L ${-w * 0.08} 0.5 Z`} fill={TITLE_INK} />
      {cap === "on" ? <CapShape y0={-CAP_LEN * k + 6 * k} k={k} /> : null}
    </g>
  );
};
// Колпачок маркера (локально: ось вдоль y, открытый конец к +y).
const CapShape: React.FC<{ readonly y0: number; readonly k: number }> = ({ y0, k }) => (
  <g>
    <rect x={-MARKER_W / 2 - 1} y={y0} width={MARKER_W + 2} height={CAP_LEN * k} rx={5} fill="#2A4479" />
    <rect x={-MARKER_W / 2 - 1} y={y0} width={(MARKER_W + 2) * 0.3} height={CAP_LEN * k} rx={4} fill="#FFFFFF" opacity={0.16} />
    <rect x={MARKER_W / 2 - 3.6} y={y0 + 4 * k} width={3} height={CAP_LEN * k * 0.7} rx={1.5} fill="#9AA8C2" />
  </g>
);
const CapLoose: React.FC<{ readonly center: Vec; readonly rot: number }> = ({ center, rot }) => (
  <g transform={`translate(${f2(center.x)} ${f2(center.y)}) rotate(${f2(rot)})`}>
    <CapShape y0={-CAP_LEN / 2} k={1} />
  </g>
);

// ---------- реквизит ----------
const KX = CARD_MM.w / CARD_UNITS.w;
const CardTop: React.FC<{
  readonly center: Vec; // вид
  readonly rot: number;
  readonly lift?: number;
  readonly kind?: DrawingKind;
  readonly progress?: number;
  readonly boat?: number;
  readonly caption?: number;
  readonly back?: boolean;
  readonly uid: string;
}> = ({ center, rot, lift = 0, kind, progress = 1, boat = 0, caption = 0, back = false, uid }) => {
  const sh = 1.2 + lift * 0.45;
  return (
    <g transform={`translate(${f2(center.x)} ${f2(center.y)}) rotate(${f2(rot)})`}>
      <rect x={-CARD_MM.w / 2 + sh * 0.6} y={-CARD_MM.h / 2 + sh} width={CARD_MM.w} height={CARD_MM.h} rx={2} fill={SHADOW} opacity={0.2 - Math.min(0.08, lift * 0.004)} />
      <g transform={`translate(${-CARD_MM.w / 2} ${-CARD_MM.h / 2}) scale(${KX})`}>{back || !kind ? <CardBack uid={uid} /> : <CardFace kind={kind} progress={progress} boat={boat} caption={caption} uid={uid} />}</g>
    </g>
  );
};

const PencilTray: React.FC<{ readonly present: (owner: string | undefined, color: string) => boolean }> = ({ present }) => {
  const t = DESK.pencilTray;
  const c = deskToView({ x: t.x, y: t.y });
  const w = t.w + 12;
  const h = t.h + 12;
  return (
    <g>
      <rect x={c.x - w / 2 + 2} y={c.y - h / 2 + 3} width={w} height={h} rx={7} fill={SHADOW} opacity={0.3} />
      <rect x={c.x - w / 2} y={c.y - h / 2} width={w} height={h} rx={7} fill="#3F6FA8" />
      <rect x={c.x - w / 2 + 4} y={c.y - h / 2 + 4} width={w - 8} height={h - 8} rx={4} fill="#2F5A90" />
      <rect x={c.x - w / 2 + 4} y={c.y - h / 2 + 4} width={w - 8} height={3} rx={1.5} fill="#000000" opacity={0.15} />
      {TRAY_PENCILS.map((p, i) => {
        if (!present(p.owner, p.color)) return null;
        const tip = p.owner ? deskToView(trayPencilTip(p.owner)) : deskToView({ x: t.x - PENCIL_LEN / 2 + p.du, y: t.y + p.dv });
        return <PencilTop key={i} tip={tip} angle={90 + (i % 2 ? 0.8 : -0.6)} elev={0} len={PENCIL_LEN} color={p.color} />;
      })}
      <rect x={c.x - w / 2} y={c.y - h / 2} width={w} height={h} rx={7} fill="none" stroke="#5A86BC" strokeWidth={1.4} opacity={0.7} />
    </g>
  );
};

const FolderTop: React.FC = () => {
  const c = deskToView({ x: DESK.folder.x, y: DESK.folder.y });
  return (
    <g transform={`translate(${c.x} ${c.y}) rotate(${DESK.folder.rot})`}>
      <rect x={-118 + 3} y={-159 + 5} width={236} height={318} rx={9} fill={SHADOW} opacity={0.3} />
      <rect x={-118 + 1.5} y={-159 + 2.5} width={236} height={318} rx={9} fill="#A9895F" />
      <g transform="translate(-118 -159)">
        <ClosedFolderFace />
      </g>
    </g>
  );
};

const TapeHolderTop: React.FC = () => {
  const t = DESK.tapeHolder;
  const c = deskToView({ x: t.x, y: t.y });
  return (
    <g transform={`translate(${c.x - t.w / 2} ${c.y - t.h / 2})`}>
      <rect x={2} y={4} width={t.w} height={t.h} rx={6} fill={SHADOW} opacity={0.28} />
      <rect x={0} y={0} width={t.w} height={t.h} rx={6} fill="#EDE6D6" stroke="#CFC3A8" strokeWidth={1.2} />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={14} y={14 + i * 22} width={68} height={12} rx={1.5} fill="#F3E6BC" stroke="#DCCB93" strokeWidth={0.6} opacity={0.92} />
          <rect x={14} y={14 + i * 22} width={68} height={3} fill="#FFFFFF" opacity={0.35} />
        </g>
      ))}
    </g>
  );
};

const TextCardTop: React.FC<{ readonly which: "one" | "two"; readonly center: Vec; readonly rot: number; readonly flip?: number; readonly lift?: number }> = ({ which, center, rot, flip = 0, lift = 0 }) => {
  const s = textCardSize(which);
  const sy = Math.max(0.04, Math.abs(Math.cos(Math.PI * flip)));
  const sh = 1.2 + lift * 0.45;
  return (
    <g transform={`translate(${f2(center.x)} ${f2(center.y)}) rotate(${f2(rot)})`}>
      <rect x={-s.w / 2 + sh * 0.6} y={(-s.h / 2) * sy + sh} width={s.w} height={s.h * sy} rx={2.5} fill={SHADOW} opacity={0.2} />
      <g transform={`scale(1 ${f2(sy)})`}>
        <TextCardFace which={which} back={flip < 0.5} />
        {flip > 0.02 && flip < 0.98 ? <rect x={-s.w / 2} y={-s.h / 2} width={s.w} height={s.h} rx={2.5} fill="#000000" opacity={0.12 * (1 - sy)} /> : null}
      </g>
    </g>
  );
};

const StackTop: React.FC<{ readonly ids: readonly string[]; readonly center: Vec; readonly rot: number; readonly uid: string }> = ({ ids, center, rot, uid }) => {
  const n = ids.length;
  if (!n) return null;
  const layers = Math.min(6, n);
  const thick = Math.min(5, n * 0.22);
  const top = rosterById(ids[0]);
  return (
    <g transform={`translate(${f2(center.x)} ${f2(center.y)}) rotate(${f2(rot)})`}>
      <rect x={-CARD_MM.w / 2 + 1.5} y={-CARD_MM.h / 2 + 2.5 + thick} width={CARD_MM.w} height={CARD_MM.h} rx={2} fill={SHADOW} opacity={0.22} />
      {Array.from({ length: layers - 1 }, (_, i) => {
        const k = layers - 1 - i;
        const j = ((k * 37) % 7) - 3;
        return (
          <g key={k} transform={`translate(${f2(k * 0.35)} ${f2((k * thick) / layers)}) rotate(${f2(j * 0.6)})`}>
            <rect x={-CARD_MM.w / 2} y={-CARD_MM.h / 2} width={CARD_MM.w} height={CARD_MM.h} rx={1.8} fill="#FBF8F0" stroke="#D2C8B3" strokeWidth={0.5} />
          </g>
        );
      })}
      <g transform={`translate(${-CARD_MM.w / 2} ${-CARD_MM.h / 2}) scale(${KX})`}>
        <CardFace kind={top.drawing} progress={1} uid={`${uid}-stack-${top.id}`} />
      </g>
    </g>
  );
};

const TapeBit: React.FC<{ readonly center: Vec; readonly rot: number }> = ({ center, rot }) => (
  <g transform={`translate(${f2(center.x)} ${f2(center.y)}) rotate(${f2(rot)})`}>
    <rect x={-11} y={-3.6} width={22} height={7.2} rx={0.8} fill="#F3E6BC" stroke="#DCCB93" strokeWidth={0.5} opacity={0.9} />
  </g>
);

// ---------- лист ----------
const PosterOnDesk: React.FC<{ readonly t: number; readonly plan: Plan; readonly uid: string }> = ({ t, plan, uid }) => {
  const s = plan.posterSpread(t);
  const y0 = TABLE_DEPTH_MM - (POSTER_ON_DESK.v0 + POSTER.h);
  const x0 = POSTER_ON_DESK.u0;
  if (s < 1) {
    // рулон раскатывают слева направо: развёрнутая часть и сам рулон
    const r = posterRoll(s);
    const flatW = Math.max(0, r.edgeU - x0);
    const rr = Math.max(0.5, r.r);
    return (
      <g>
        {flatW > 0 ? (
          <>
            <rect x={x0 + 2} y={y0 + 4} width={flatW} height={POSTER.h} rx={3} fill={SHADOW} opacity={0.12} />
            <rect x={x0} y={y0} width={flatW} height={POSTER.h} rx={3} fill={PAPER} stroke={PAPER_EDGE} strokeWidth={1.4} />
            <rect x={Math.max(x0, r.edgeU - 70)} y={y0} width={Math.min(70, flatW)} height={POSTER.h} fill={`url(#${uid}-curlL)`} opacity={0.5} />
          </>
        ) : null}
        {/* рулон: цилиндр вдоль v, тень справа */}
        <rect x={r.edgeU + rr * 0.6} y={y0 + 3} width={rr * 2.2} height={POSTER.h} rx={rr} fill={SHADOW} opacity={0.16} />
        <rect x={r.edgeU + rr * 0.8} y={y0 + 4} width={rr * 2.6 + 3} height={POSTER.h + 2} rx={rr + 2} fill={SHADOW} opacity={0.1} />
        <rect x={r.edgeU} y={y0 - 1} width={rr * 2} height={POSTER.h + 2} rx={Math.min(rr, 4)} fill={`url(#${uid}-roll)`} stroke={PAPER_EDGE} strokeWidth={0.9} />
        <path d={`M${r.edgeU + rr * 0.55} ${y0 + 2} L${r.edgeU + rr * 0.55} ${y0 + POSTER.h - 2}`} stroke="#FFFFFF" strokeWidth={Math.max(0.6, rr * 0.25)} opacity={0.55} />
      </g>
    );
  }
  // лист разглажен: лёгкая волна у правого края исчезает, пока учитель разглаживает
  const sm = plan.smooth;
  const curl = 1 - easeInOut(Math.max(0, Math.min(1, (t - sm.from) / Math.max(1, sm.to - sm.from))));
  const v = posterViewFor(plan, t);
  return (
    <g transform={`translate(${x0} ${y0})`}>
      <PosterContent v={v} uid={`${uid}-poster`} />
      {curl > 0.01 ? <rect x={POSTER.w - 60} y={0} width={60} height={POSTER.h} fill={`url(#${uid}-curlL)`} opacity={0.45 * curl} /> : null}
    </g>
  );
};

// Состояние листа с плавным выпрямлением карточки в момент закрепления.
const posterViewFor = (plan: Plan, t: number): PosterView => {
  const cards: PosterCard[] = [];
  for (const c of plan.cards(t)) {
    if (c.where !== "poster" || !c.desk) continue;
    let rot = c.rot;
    const at = plan.fixTimes.get(c.owner);
    if (at !== undefined && t >= at - 8 && t < at) rot = c.rot * (1 - easeInOut((t - at + 8) / 8));
    cards.push({ id: c.id, kind: c.kind, pos: deskToPoster(c.desk), rot, tape: c.tape, progress: c.progress, boat: c.boat, caption: c.caption });
  }
  const text = (w: "one" | "two") => {
    const s = plan.textState(w, t);
    return s.where === "poster" ? { pos: deskToPoster(s.desk), rot: 0, tape: s.tape } : null;
  };
  return { title: plan.titleProgress(t), one: text("one"), two: text("two"), cards };
};

// ---------- кисть и предплечье ----------
const armPoints = (h: DeskHand) => {
  const b = HAND_BUILD[h.who];
  const W = deskToView(h.wrist);
  const S = deskToView(h.shoulder);
  const F = b.fore;
  const U = b.upper;
  // Кисть, убранная за кадр к плечу, может почти совпасть с ним: тогда формула
  // локтя вырождается (локоть «улетает» и рукав пересекает кадр). Расстояние
  // не меньше |F − U| + 1, направление на плечо — устойчивое.
  const D0 = lenV(subV(S, W));
  const D = Math.max(D0, Math.abs(F - U) + 1, 1);
  const d = D0 > 0.5 ? normV(subV(S, W)) : { x: 0, y: 1 };
  let E: Vec;
  if (D >= F + U - 1) E = addV(W, mulV(d, (F * D) / (F + U)));
  else {
    const a = Math.max(-F, Math.min(F, (F * F - U * U + D * D) / (2 * D)));
    const hh = Math.sqrt(Math.max(0, F * F - a * a)) * 0.5;
    const perp = { x: -d.y, y: d.x };
    const out = h.side === "R" ? 1 : -1;
    const sg = perp.x * out >= 0 ? 1 : -1;
    E = addV(addV(W, mulV(d, a)), mulV(perp, hh * sg));
  }
  return { W, E, S, b };
};

// Точка на руке на расстоянии s от запястья (вдоль предплечья, затем плеча).
const alongArm = (W: Vec, E: Vec, S: Vec, s: number): Vec => {
  const f = lenV(subV(E, W));
  if (s <= f) return lerpV(W, E, s / Math.max(1, f));
  return lerpV(E, S, Math.min(1, (s - f) / Math.max(1, lenV(subV(S, E)))));
};

const Arm: React.FC<{ readonly h: DeskHand; readonly uid: string }> = ({ h, uid }) => {
  const look = LOOK[h.who];
  const { W, E, S, b } = armPoints(h);
  const sl = look.sleeve;
  const fl = lenV(subV(E, W));
  const ul = lenV(subV(S, E));
  const midF = lerpV(W, E, 0.38);
  const wMid = (b.wristW + b.elbowW) / 2 + 3;
  const skinTube = tube([W, midF, E, lerpV(E, S, 0.5), S], [b.wristW, wMid, b.elbowW, b.upperW, b.upperW]);
  const d = normV(subV(E, W));
  const n = { x: -d.y, y: d.x };
  const gId = `${uid}-${h.key}-armg`;
  const g1 = addV(midF, mulV(n, wMid / 2));
  const g2 = subV(midF, mulV(n, wMid / 2));
  // светлая сторона — к свету (слева сверху)
  const litFirst = n.x + n.y < 0;
  const ol = b.L * 0.0045;
  const sleeveFrom = sl.kind === "bare" ? fl + ul * 0.42 : sl.kind === "suit" ? sl.cuffTo - 4 : sl.cuffFrom;
  const sleevePts: Vec[] = [];
  const sleeveW: number[] = [];
  const thick = sl.kind === "suit" ? 16 : sl.kind === "sweater" ? 12 : sl.kind === "shirt" ? 9 : 14;
  const total = fl + ul;
  const widthAt = (s: number) => {
    if (s <= fl) {
      const u = s / Math.max(1, fl);
      return u < 0.38 ? b.wristW + (wMid - b.wristW) * (u / 0.38) : wMid + (b.elbowW - wMid) * ((u - 0.38) / 0.62);
    }
    return b.elbowW + (b.upperW - b.elbowW) * Math.min(1, (s - fl) / Math.max(1, ul * 0.5));
  };
  for (const s of [sleeveFrom, (sleeveFrom + fl) / 2, fl, (fl + total) / 2, total]) {
    if (s < sleeveFrom - 0.1) continue;
    sleevePts.push(alongArm(W, E, S, s));
    sleeveW.push(widthAt(s) + thick + (s < fl ? 0 : 4));
  }
  const cuffPts = sl.kind === "bare" ? null : [alongArm(W, E, S, sl.cuffFrom), alongArm(W, E, S, (sl.cuffFrom + sl.cuffTo) / 2), alongArm(W, E, S, sl.cuffTo)];
  const cuffW = cuffPts ? [widthAt(sl.cuffFrom) + thick * 0.75, widthAt((sl.cuffFrom + sl.cuffTo) / 2) + thick * 0.8, widthAt(sl.cuffTo) + thick * 0.85] : [];
  const sg1 = addV(alongArm(W, E, S, fl * 0.6), mulV(n, (widthAt(fl * 0.6) + thick) / 2));
  const sg2 = subV(alongArm(W, E, S, fl * 0.6), mulV(n, (widthAt(fl * 0.6) + thick) / 2));
  const sId = `${uid}-${h.key}-slg`;
  return (
    <g>
      <defs>
        <linearGradient id={gId} gradientUnits="userSpaceOnUse" x1={f2((litFirst ? g1 : g2).x)} y1={f2((litFirst ? g1 : g2).y)} x2={f2((litFirst ? g2 : g1).x)} y2={f2((litFirst ? g2 : g1).y)}>
          <stop offset="0" stopColor={look.light} />
          <stop offset="0.45" stopColor={look.skin} />
          <stop offset="1" stopColor={look.shade} />
        </linearGradient>
        <linearGradient id={sId} gradientUnits="userSpaceOnUse" x1={f2((litFirst ? sg1 : sg2).x)} y1={f2((litFirst ? sg1 : sg2).y)} x2={f2((litFirst ? sg2 : sg1).x)} y2={f2((litFirst ? sg2 : sg1).y)}>
          <stop offset="0" stopColor={sl.light} />
          <stop offset="0.5" stopColor={sl.color} />
          <stop offset="1" stopColor={sl.dark} />
        </linearGradient>
      </defs>
      <path d={skinTube} fill={`url(#${gId})`} stroke={look.shade} strokeWidth={ol * 2} />
      {sl.kind === "suit" && cuffPts ? (
        <>
          <path d={tube(cuffPts, cuffW, 0.25, 0.25)} fill={sl.cuff} stroke={sl.cuffDark} strokeWidth={ol * 1.6} />
          <path d={tube(cuffPts, cuffW.map((w) => w * 0.45), 0.25, 0.25)} fill={sl.cuffDark} opacity={0.35} transform={`translate(${f2(n.x * (litFirst ? -1 : 1) * 3)} ${f2(n.y * (litFirst ? -1 : 1) * 3)})`} />
        </>
      ) : null}
      {sleevePts.length >= 2 ? <path d={tube(sleevePts, sleeveW, 0.3, 0.55)} fill={`url(#${sId})`} stroke={sl.dark} strokeWidth={ol * 1.6} /> : null}
      {sl.kind !== "suit" && sl.kind !== "bare" && cuffPts ? (
        <>
          <path d={tube(cuffPts, cuffW, 0.3, 0.2)} fill={sl.cuff} stroke={sl.cuffDark} strokeWidth={ol * 1.4} />
          {sl.kind === "sweater"
            ? Array.from({ length: 7 }, (_, i) => {
                const a = lerpV(addV(cuffPts[0], mulV(n, cuffW[0] * (-0.42 + i * 0.14))), addV(cuffPts[2], mulV(n, cuffW[2] * (-0.42 + i * 0.14))), 0.08);
                const c = lerpV(addV(cuffPts[0], mulV(n, cuffW[0] * (-0.42 + i * 0.14))), addV(cuffPts[2], mulV(n, cuffW[2] * (-0.42 + i * 0.14))), 0.92);
                return <path key={i} d={`M${P(a)} L${P(c)}`} stroke={sl.cuffDark} strokeWidth={ol * 1.2} opacity={0.55} />;
              })
            : null}
          {sl.kind === "shirt" ? <circle cx={f2(addV(cuffPts[1], mulV(n, cuffW[1] * (litFirst ? 0.3 : -0.3))).x)} cy={f2(addV(cuffPts[1], mulV(n, cuffW[1] * (litFirst ? 0.3 : -0.3))).y)} r={2.6} fill="#EDEFE8" stroke="#3B6F48" strokeWidth={0.5} /> : null}
        </>
      ) : null}
    </g>
  );
};

// Палец/фаланги: контур, заливка, блик, складки, ноготь (локально кисти).
const Digit: React.FC<{ readonly c: Chain; readonly look: Look; readonly ol: number; readonly L: number; readonly from?: number }> = ({ c, look, ol, L, from = 0 }) => {
  const segs = [0, 1, 2]
    .filter((i) => i >= from)
    .map((i) => ({ i, a: c.pts[i], b: c.pts[i + 1], w: c.w[i], vis: c.vis[i] }))
    .filter((s) => s.vis > 0);
  if (!segs.length) return null;
  const line = (s: (typeof segs)[number], w: number, color: string, extra: React.SVGProps<SVGPathElement> = {}) => (
    <path key={`${s.i}-${color}-${w}`} d={`M${P(s.a)} L${P(s.b)}`} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" {...extra} />
  );
  const dist = segs[segs.length - 1];
  const showNail = dist.i === 2 && dist.vis > 0.32;
  const dv = normV(subV(dist.b, dist.a));
  const nl = lenV(subV(dist.b, dist.a)) * 0.66 + dist.w * 0.18;
  const nw = dist.w * 0.62;
  const nailC = addV(dist.b, mulV(dv, dist.w * 0.3 - nl / 2));
  const nailA = (Math.atan2(dv.y, dv.x) * 180) / Math.PI + 90;
  return (
    <g>
      {segs.map((s) => line(s, s.w + ol * 2, look.shade))}
      {segs.map((s) => line(s, s.w, look.skin))}
      {segs.map((s) => {
        if (s.vis < 0.3) return null;
        const d = normV(subV(s.b, s.a));
        const n = { x: -d.y, y: d.x };
        const o = mulV(n, s.w * 0.17);
        const a = addV(lerpV(s.a, s.b, 0.12), o);
        const b2 = addV(lerpV(s.a, s.b, 0.9), o);
        return <path key={`h${s.i}`} d={`M${P(a)} L${P(b2)}`} stroke={look.light} strokeWidth={s.w * 0.34} strokeLinecap="round" opacity={0.5} />;
      })}
      {/* складки на суставах (тыльная сторона) */}
      {segs.map((s) => {
        if (s.i === 0 || s.vis < 0.28) return null;
        const d = normV(subV(s.b, s.a));
        const n = { x: -d.y, y: d.x };
        const q = addV(s.a, mulV(d, s.w * 0.12));
        const ww = s.w * 0.27;
        const k = s.i === 1 ? 2 : 1;
        return (
          <g key={`k${s.i}`} opacity={0.5}>
            {Array.from({ length: k }, (_, j) => {
              const c0 = addV(q, mulV(d, j * s.w * 0.14));
              return <path key={j} d={`M${P(addV(c0, mulV(n, ww)))} Q${P(addV(c0, mulV(d, s.w * 0.07)))} ${P(subV(c0, mulV(n, ww)))}`} stroke={look.shade} strokeWidth={L * 0.007} fill="none" strokeLinecap="round" />;
            })}
          </g>
        );
      })}
      {showNail ? (
        <g transform={`translate(${f2(nailC.x)} ${f2(nailC.y)}) rotate(${f2(nailA)})`}>
          <rect x={-nw / 2} y={-nl / 2} width={nw} height={nl} rx={nw * 0.45} fill={look.nail} stroke={look.shade} strokeWidth={L * 0.004} strokeOpacity={0.55} />
          <rect x={-nw * 0.3} y={-nl * 0.4} width={nw * 0.22} height={nl * 0.55} rx={nw * 0.1} fill="#FFFFFF" opacity={0.45} />
        </g>
      ) : null}
    </g>
  );
};

export const DeskHandView: React.FC<{ readonly h: DeskHand; readonly uid: string; readonly t: number; readonly plan: Plan | null }> = ({ h, uid, t, plan }) => {
  const look = LOOK[h.who];
  const g = handGeom(h.who, h.shape, h.from, h.mix);
  const W = deskToView(h.wrist);
  const sx = h.side === "R" ? 1 : -1;
  const L = g.L;
  const ol = L * 0.0045;
  const T = `translate(${f2(W.x)} ${f2(W.y)}) rotate(${f2(h.angle)}) scale(${sx} 1)`;
  const hasItem = Boolean(h.item);
  // тонкий предмет (карандаш, маркер, колпачок) в щепоти: указательный сверху
  const thin = h.item && (h.item.kind === "pencil" || h.item.kind === "marker" || h.item.kind === "cap");
  const overSet = thin ? [...g.over, 0] : g.over;
  const under = [3, 2, 1, 0].filter((i) => !hasItem || !overSet.includes(i));
  const over = [3, 2, 1, 0].filter((i) => hasItem && overSet.includes(i));
  const palmD = closedPath(g.palm);
  const pg = `${uid}-${h.key}-palm`;
  // тень: смещение растёт с высотой над столом
  const sh = h.lift + 9;
  const shOff = { x: sh * 0.3, y: sh * 0.48 };
  const armShOff = { x: (h.lift + 34) * 0.3, y: (h.lift + 34) * 0.48 };
  const { E, S, b } = armPoints(h);
  const midF = lerpV(W, E, 0.38);
  const armSil = tube([W, midF, E, lerpV(E, S, 0.5), S], [b.wristW, (b.wristW + b.elbowW) / 2 + 3, b.elbowW, b.upperW, b.upperW]);
  // силуэт для тени; e — расширение края (мягкая полутень без фильтров)
  const silhouette = (e: number) => (
    <g transform={T}>
      <path d={palmD} fill={SHADOW} stroke={SHADOW} strokeWidth={e * 2} strokeLinejoin="round" />
      {g.fingers.map((c, i) => (
        <path key={i} d={c.pts.map((p, j) => `${j ? "L" : "M"}${P(p)}`).join("")} stroke={SHADOW} strokeWidth={c.w[0] + e * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      <path d={g.thumb.pts.map((p, j) => `${j ? "L" : "M"}${P(p)}`).join("")} stroke={SHADOW} strokeWidth={g.thumb.w[1] + e * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
  const penShadow = (e: number) =>
    h.item && (h.item.kind === "pencil" || h.item.kind === "marker")
      ? (() => {
          const it = h.item;
          const tip = deskToView(it.tip);
          const k = Math.cos((it.elev * Math.PI) / 180);
          const l = it.len * k;
          const end = addV(tip, mulV(dirV(it.angle), l));
          const hEnd = it.len * Math.sin((it.elev * Math.PI) / 180) + h.lift;
          const s0 = addV(tip, { x: h.lift * 0.3, y: h.lift * 0.48 });
          const s1 = addV(end, { x: hEnd * 0.3, y: hEnd * 0.48 });
          return <path d={`M${P(s0)} L${P(s1)}`} stroke={SHADOW} strokeWidth={(it.kind === "marker" ? MARKER_W : 6) * 0.8 + e * 2} strokeLinecap="round" opacity={Math.max(0.35, 1 - h.lift / 30)} />;
        })()
      : null;
  const SOFT = [
    { e: 0, o: 0.11 },
    { e: 1.6, o: 0.08 },
    { e: 3.4, o: 0.05 },
  ];
  const thumbChain = g.thumb;
  return (
    <g>
      {/* мягкая тень на столе/листе (слои с расширенным краем вместо размытия) */}
      {SOFT.map((l) => (
        <g key={l.e} opacity={l.o}>
          <path d={armSil} fill={SHADOW} stroke={SHADOW} strokeWidth={l.e * 2.4} transform={`translate(${f2(armShOff.x)} ${f2(armShOff.y)})`} />
          <g transform={`translate(${f2(shOff.x)} ${f2(shOff.y)})`}>{silhouette(l.e)}</g>
          {l.e < 3 ? penShadow(l.e * 0.35) : null}
        </g>
      ))}
      <Arm h={h} uid={uid} />
      <defs>
        <radialGradient id={pg} cx="0.42" cy="0.5" r="0.68">
          <stop offset="0" stopColor={look.light} />
          <stop offset="0.55" stopColor={look.skin} />
          <stop offset="1" stopColor={look.shade} />
        </radialGradient>
      </defs>
      <g transform={T}>
        {/* ладонь (тыльная сторона): контур, пальцы под ней, заливка поверх оснований */}
        <path d={palmD} fill={look.skin} stroke={look.shade} strokeWidth={ol * 2} />
        <Digit c={thumbChain} look={look} ol={ol} L={L} from={0} />
        {under.map((i) => (
          <Digit key={i} c={g.fingers[i]} look={look} ol={ol} L={L} />
        ))}
        <path d={palmD} fill={`url(#${pg})`} />
        {/* сухожилия и косточки */}
        {h.who === "teacher"
          ? g.fingers.map((c, i) => (
              <path key={`t${i}`} d={`M${P(lerpV({ x: 0, y: -0.06 * L }, c.pts[0], 0.25))} L${P(lerpV({ x: 0, y: -0.06 * L }, c.pts[0], 0.86))}`} stroke={look.light} strokeWidth={L * 0.014} strokeLinecap="round" opacity={0.35} />
            ))
          : null}
        {g.fingers.map((c, i) => (
          <ellipse key={`k${i}`} cx={f2(c.pts[0].x)} cy={f2(c.pts[0].y - L * 0.012)} rx={f2(c.w[0] * 0.42)} ry={f2(c.w[0] * 0.28)} fill={look.light} opacity={0.45} />
        ))}
        {/* большой палец поверх ладони, если предмета нет */}
        {!hasItem ? <Digit c={thumbChain} look={look} ol={ol} L={L} from={1} /> : null}
      </g>
      {h.item ? <HeldItemView it={h.item} uid={`${uid}-${h.key}`} t={t} plan={plan} /> : null}
      {hasItem ? (
        <g transform={T}>
          {over.map((i) => (
            <Digit key={i} c={g.fingers[i]} look={look} ol={ol} L={L} />
          ))}
          <Digit c={thumbChain} look={look} ol={ol} L={L} from={1} />
        </g>
      ) : null}
    </g>
  );
};

const HeldItemView: React.FC<{ readonly it: DeskItem; readonly uid: string; readonly t: number; readonly plan: Plan | null }> = ({ it, uid, t, plan }) => {
  switch (it.kind) {
    case "card": {
      const cs = plan ? plan.cardState(it.id, t) : { progress: 1, boat: 0, caption: 0 };
      const r = rosterById(it.id);
      return <CardTop center={deskToView(it.center)} rot={it.rot} lift={it.lift} kind={r.drawing} progress={cs.progress} boat={cs.boat} caption={cs.caption} uid={`${uid}-c-${it.id}`} />;
    }
    case "cards": {
      // веер чистых карточек: снизу вверх
      const top = { p: deskToView(it.center), a: it.rot };
      const poses = it.ids.map((_, k) => {
        let pz = top;
        for (let j = 0; j < k; j++) pz = { p: addV(pz.p, rotV(DEAL_STEP.p, pz.a)), a: pz.a + DEAL_STEP.a };
        return pz;
      });
      return (
        <g>
          {[...it.ids.keys()].reverse().map((k) => (
            <CardTop key={it.ids[k]} center={poses[k].p} rot={poses[k].a} lift={10} back uid={`${uid}-deal-${it.ids[k]}`} />
          ))}
        </g>
      );
    }
    case "textCard":
      return <TextCardTop which={it.which} center={deskToView(it.center)} rot={it.rot} flip={it.flip} lift={8} />;
    case "stack":
      return <StackTop ids={it.ids} center={deskToView(it.center)} rot={it.rot} uid={uid} />;
    case "cap":
      return <CapLoose center={deskToView(it.center)} rot={it.rot} />;
    case "tape":
      return <TapeBit center={deskToView(it.center)} rot={it.rot} />;
    case "pencil":
      return <PencilTop tip={deskToView(it.tip)} angle={it.angle} elev={it.elev} len={it.len} color={it.color} />;
    case "marker":
      return <MarkerTop tip={deskToView(it.tip)} angle={it.angle} elev={it.elev} cap={it.cap} />;
    default:
      return null;
  }
};

// ---------- общий вид ----------
type Props = { readonly f: number; readonly plan: Plan; readonly boat: BoatPlan; readonly cam: DeskCam; readonly uid: string; readonly frozenAt?: number };

const MAIN = ["yusuf", "amir", "bilal"] as const;

export const DeskView: React.FC<Props> = ({ f, plan, boat, cam, uid, frozenAt }) => {
  const t = frozenAt ?? f;
  const handsAt = useMemo(() => buildDeskHands(plan, boat), [plan, boat]);
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const hands = handsAt(t);
  const held = (pred: (i: DeskItem) => boolean) => hands.some((h) => h.item && pred(h.item));
  const pencilHeld = (color: string) => held((i) => i.kind === "pencil" && i.color === color);
  const markerHeld = held((i) => i.kind === "marker");
  const stackHeld = held((i) => i.kind === "stack");
  const s = cam.scale;
  const camT = `translate(960 540) scale(${s}) translate(${f2(-cam.u)} ${f2(-(TABLE_DEPTH_MM - cam.v))})`;
  const cards = plan.cards(t);

  // пенал: карандаш лежит, пока его не взяли, и снова — когда вернули
  const back = useMemo(() => pencilBackAt(plan), [plan]);
  const trayPresent = (owner: string | undefined, color: string) => {
    if (pencilHeld(color)) return false;
    if (!owner) return true;
    return pencilInTray(plan, owner as (typeof MAIN)[number] | "boat", t, back);
  };

  // текстовые карточки в стопке (лицом вниз)
  const textStack = (["two", "one"] as const).map((w) => {
    const st = plan.textState(w, t);
    if (st.where !== "stack") return null;
    return <TextCardTop key={`ts-${w}`} which={w} center={deskToView(st.desk)} rot={DESK.textStack.rot} flip={0} />;
  });

  // карточки главных героев на местах рисования
  const ownerCards = MAIN.map((m) => {
    const cs = plan.cardState(m, t);
    if (cs.where !== "owner" || !cs.desk) return null;
    if (held((i) => (i.kind === "card" && i.id === m) || (i.kind === "cards" && i.ids.includes(m)))) return null;
    return <CardTop key={`own-${m}`} center={deskToView(cs.desk)} rot={cs.rot} kind={cs.kind} progress={cs.progress} uid={`${id}-own-${m}`} />;
  });

  // собранная стопка на столе (если её не держат)
  const collectedIds = cards.filter((c) => c.where === "stack" && c.holder === "muhammad").map((c) => c.owner);
  const collected =
    !stackHeld && collectedIds.length ? <StackTop ids={collectedIds} center={deskToView({ x: DESK.collected.x, y: DESK.collected.y })} rot={DESK.collected.rot} uid={`${id}-col`} /> : null;

  // карандаш Билала лежит у его карточки (вне сетки листа)
  const lying = MAIN.map((m) => {
    if (!pencilLiesAtRest(m) || t < back[m]) return null;
    const ps = plan.pencil(m, t);
    if (pencilHeld(ps.color)) return null;
    return <PencilTop key={`pl-${m}`} tip={deskToView(ps.desk)} angle={PENCIL_REST_ANGLE} elev={0} len={PENCIL_LEN} color={ps.color} />;
  });
  const mk = markerLying();
  const markerOnDesk = !markerHeld ? <MarkerTop tip={deskToView(mk.tip)} angle={mk.angle} elev={0} cap="on" /> : null;

  // лодочка
  const bd = deskToView(boat.desk(t));
  const bl = boat.lift(t);
  const boatEl = (
    <g>
      {bl > 0.3 ? <ellipse cx={bd.x + bl * 0.35} cy={bd.y + bl * 0.55} rx={BOAT_LENGTH_MM * 0.42} ry={22} fill={SHADOW} opacity={0.12} /> : null}
      <g transform={`translate(${f2(bd.x)} ${f2(bd.y)}) scale(${f2(1 + bl * 0.003)})`}>
        <PaperBoatTop x={0} y={0} w={BOAT_LENGTH_MM} rot={boat.tilt(t) * 0.3} open={boat.open(t)} />
      </g>
    </g>
  );

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden", backgroundColor: FLOOR }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ display: "block" }}>
        <defs>
          <clipPath id={`${id}-tableclip`}>
            <rect x={0} y={0} width={TABLE_LEN_MM} height={TABLE_DEPTH_MM} rx={16} />
          </clipPath>
          <radialGradient id={`${id}-tablelight`} cx="0.45" cy="0.42" r="0.75">
            <stop offset="0" stopColor="#FFF3DC" stopOpacity={0.16} />
            <stop offset="0.6" stopColor="#FFF3DC" stopOpacity={0} />
            <stop offset="1" stopColor="#3A2414" stopOpacity={0.22} />
          </radialGradient>
          <radialGradient id={`${id}-floor`} cx="0.5" cy="0.5" r="0.6">
            <stop offset="0" stopColor="#8A6A50" stopOpacity={0.5} />
            <stop offset="1" stopColor="#3A2414" stopOpacity={0.3} />
          </radialGradient>
          <linearGradient id={`${id}-roll`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E9E2D0" />
            <stop offset="0.3" stopColor="#FFFDF6" />
            <stop offset="0.75" stopColor="#EEE7D6" />
            <stop offset="1" stopColor="#CFC5AE" />
          </linearGradient>
          <linearGradient id={`${id}-curlL`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B9AE96" stopOpacity={0} />
            <stop offset="0.7" stopColor="#B9AE96" stopOpacity={0.35} />
            <stop offset="0.86" stopColor="#FFFFFF" stopOpacity={0.6} />
            <stop offset="1" stopColor="#B9AE96" stopOpacity={0.4} />
          </linearGradient>
          <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.62" stopColor="#2A170A" stopOpacity={0} />
            <stop offset="1" stopColor="#2A170A" stopOpacity={0.2} />
          </radialGradient>
        </defs>
        <g transform={camT}>
          <TableTop uid={id} />
          <FolderTop />
          <TapeHolderTop />
          {textStack}
          {markerOnDesk}
          <PencilTray present={trayPresent} />
          <PosterOnDesk t={t} plan={plan} uid={id} />
          {ownerCards}
          {collected}
          {lying}
          {boatEl}
          {hands.map((h) => (
            <DeskHandView key={h.key} h={h} uid={id} t={t} plan={plan} />
          ))}
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill={`url(#${id}-vignette)`} />
      </svg>
    </div>
  );
};
