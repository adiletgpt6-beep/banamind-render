// Часть «Выбор»: точка отсчёта (Джек и Джилл), неприятие потерь (монета и весы),
// кривая теории перспектив, эффект владения (кружки), четыре настроения риска,
// рамки формулировки (90/10, 600 человек, мили на галлон) и широкая рамка
// (100 ставок, портфель, билет в метель, вариант по умолчанию).
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { OL } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, ease, pop, ramp, wob, type VisualCtx, type VisualProps } from "./kit";

// ───────────────────────── общие детали ─────────────────────────

// окно видимости фазы: плавно появляется в a, плавно уходит к b
const win = (t: number, a: number, b?: number) => ramp(t, a - 0.15, 0.5) * (b === undefined ? 1 : 1 - ramp(t, b - 0.45, 0.45));

const Phase: React.FC<{ k: number; children: React.ReactNode }> = ({ k, children }) =>
  k <= 0.001 ? null : (
    <g opacity={k} transform={`translate(0 ${(1 - k) * 24})`}>
      {children}
    </g>
  );

const Lbl: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; weight?: number; k?: number }> = ({
  x,
  y,
  text,
  size = 34,
  color = C.ink,
  anchor = "middle",
  weight = 800,
  k = 1,
}) => (k <= 0 ? null : <Txt x={x} y={y} size={size} color={color} anchor={anchor} weight={weight} opacity={clamp01(k)}>{text}</Txt>);

// нейтральный человечек с настроением (без конкретной личности)
type Mood = "neutral" | "happy" | "sad";
const Figure: React.FC<{ x: number; y: number; s?: number; color: string; mood: Mood; t: number; arms?: number; hair?: boolean; seed?: number }> = ({
  x,
  y,
  s = 1,
  color,
  mood,
  t,
  arms = 0,
  hair,
  seed = 0,
}) => {
  const bob = Math.sin(t * 2.4 + seed) * 2 + (mood === "happy" ? -Math.abs(Math.sin(t * 5)) * 6 * arms : 0);
  const droop = mood === "sad" ? 1 : 0;
  const mouth = mood === "happy" ? "M -13 -100 Q 0 -86 13 -100" : mood === "sad" ? "M -12 -92 Q 0 -103 12 -92" : "M -10 -96 L 10 -96";
  const armY = -30 - arms * 70 + droop * 20;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d="M -14 -10 L -18 30 M 14 -10 L 18 30" stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <path d={`M -26 -60 L ${-52 + droop * 14} ${armY} M 26 -60 L ${52 - droop * 14} ${armY}`} stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <rect x={-30} y={-80} width={60} height={76} rx={22} fill={color} stroke={OL} strokeWidth={4} />
      <g transform={`rotate(${droop * 8} 0 -80)`}>
        {hair && <path d="M -34 -112 Q -36 -150 0 -146 Q 36 -150 34 -112 L 38 -70 L 22 -80 L 24 -118 L -24 -118 L -22 -80 L -38 -70 Z" fill="#7a4a24" stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
        <circle cx={0} cy={-110} r={30} fill="#f2c79b" stroke={OL} strokeWidth={4} />
        {!hair && <path d="M -28 -122 Q -10 -150 22 -134 Q 30 -128 29 -118 Q 10 -134 -28 -122 Z" fill="#4a3420" />}
        <circle cx={-10} cy={-114} r={4} fill={OL} />
        <circle cx={10} cy={-114} r={4} fill={OL} />
        {mood === "sad" && <path d="M -18 -126 L -4 -122 M 18 -126 L 4 -122" stroke={OL} strokeWidth={3} strokeLinecap="round" />}
        <path d={mouth} stroke={OL} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {mood === "sad" && <path d={`M 14 -106 q -5 ${10 + (t * 20) % 14} 0 ${14 + (t * 20) % 14} q 5 -4 0 -14`} fill={C.sky} opacity={0.9} />}
      </g>
    </g>
  );
};

const Sparkle: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = C.yellowDeep }) => {
  const k = 0.7 + 0.3 * Math.sin(t * 5 + x);
  return <path transform={`translate(${x} ${y}) scale(${s * k})`} d="M 0 -22 Q 3 -3 22 0 Q 3 3 0 22 Q -3 3 -22 0 Q -3 -3 0 -22 Z" fill={color} />;
};

// ───────────────────────── k28 Точка отсчёта ─────────────────────────

export const ReferencePoint: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const base = 790;
  const u = 50; // пикселей на миллион
  const showPast = ramp(t, at(c, 1.45), 0.9);
  const moodK = t >= at(c, 2) - 0.1;
  const people = [
    { name: "Джек", px: 690, x: 950, past: 1, color: C.sky, hair: false, mood: (moodK ? "happy" : "neutral") as Mood, col: C.green },
    { name: "Джилл", px: 1350, x: 1610, past: 9, color: C.coral, hair: true, mood: (moodK ? "sad" : "neutral") as Mood, col: C.red },
  ];
  const ped = 5 * u;
  const eqK = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 1.45), 0.4));
  const qK = pop(t, at(c, 0.6)) * (1 - ramp(t, at(c, 1) - 0.2, 0.3));
  const refK = ramp(t, at(c, 2.45), 0.8);
  return (
    <g>
      {/* пол */}
      <rect x={580} y={base} width={1280} height={10} rx={5} fill={C.ink} opacity={0.18} />
      {people.map((pp, i) => {
        const pedK = pop(t, 0.3 + i * 0.25);
        const ph = pp.past * u * showPast;
        const arrK = ramp(t, at(c, 1.7) + i * 0.35, 0.8);
        const happy = pp.mood === "happy";
        return (
          <g key={pp.name}>
            {/* вчера */}
            {showPast > 0 && (
              <g opacity={showPast}>
                <rect x={pp.px - 70} y={base - ph} width={140} height={ph} rx={14} fill="#fff" fillOpacity={0.75} />
                <rect x={pp.px - 70} y={base - ph} width={140} height={ph} rx={14} fill={pp.col} fillOpacity={0.14} stroke={pp.col} strokeWidth={5} strokeDasharray="16 10" />
                <Lbl x={pp.px} y={base - ph - 62} text="вчера" size={30} color={C.inkSoft} weight={700} />
                <Lbl x={pp.px} y={base - ph - 20} text={`${pp.past} млн`} size={40} color={pp.col} weight={900} />
              </g>
            )}
            {/* линия точки отсчёта */}
            {refK > 0 && (
              <g opacity={refK}>
                <line x1={pp.px - 90} y1={base - pp.past * u} x2={pp.px - 90 + (pp.x + 210 - pp.px) * refK} y2={base - pp.past * u} stroke={C.violet} strokeWidth={5} strokeDasharray="14 10" />
              </g>
            )}
            {/* сегодня — пьедестал 5 млн */}
            <g transform={`translate(${pp.x} ${base}) scale(${pedK})`} opacity={clamp01(pedK * 1.5)}>
              <rect x={-115} y={-ped} width={230} height={ped} rx={16} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <rect x={-115} y={-ped} width={230} height={26} rx={12} fill={C.yellowDeep} opacity={0.6} />
              <Txt x={0} y={-ped / 2 + 6} size={50} weight={900}>5 млн</Txt>
              <Txt x={0} y={-ped / 2 + 52} size={30} weight={700} color={C.inkSoft}>сегодня</Txt>
              <Figure x={0} y={-ped - 30} s={1.35} color={pp.color} mood={pp.mood} t={t} arms={happy ? 1 : 0} hair={pp.hair} seed={i * 2} />
            </g>
            <Pop t={t} at={0.6 + i * 0.25} x={pp.x} y={base - ped - 270}>
              <Tag x={0} y={0} text={pp.name} size={36} color="#fff" />
            </Pop>
            {/* стрелка вчера → сегодня */}
            <Arrow x1={pp.px + (pp.past > 5 ? 40 : 80)} y1={base - pp.past * u - (pp.past > 5 ? -10 : 20)} x2={pp.x - 125} y2={base - ped + (pp.past > 5 ? -12 : 30)} k={arrK} color={pp.col} w={11} bend={pp.past > 5 ? -0.25 : 0.25} />
            {happy &&
              [
                [-140, -250],
                [140, -280],
                [150, -150],
              ].map(([dx, dy], j) => <Sparkle key={j} x={pp.x + dx} y={base - ped + dy + wob(t, j, 6)} t={t + j} s={0.9} />)}
          </g>
        );
      })}
      {/* вопрос и «классическая теория» */}
      {qK > 0 && (
        <g transform={`translate(1280 360) scale(${qK})`}>
          <circle r={56} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={26} size={80} weight={900} color={C.violet}>?</Txt>
        </g>
      )}
      {eqK > 0 && (
        <g opacity={eqK}>
          <Tag x={1280} y={180} text="классика: денег поровну" size={36} color="#fff" />
          <Txt x={1280} y={420} size={110} weight={900} color={C.inkSoft}>=</Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 2.4)} x={1280} y={150}>
        <Tag x={0} y={0} text="точка отсчёта" size={46} color={C.violet} textColor="#fff" />
      </Pop>
    </g>
  );
};

// ───────────────────────── k29 Неприятие потерь ─────────────────────────

const Coin: React.FC<{ x: number; y: number; r: number; phase: number }> = ({ x, y, r, phase }) => {
  const cs = Math.cos(phase);
  const head = cs >= 0;
  const sy = Math.max(0.06, Math.abs(cs));
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${sy})`}>
      <circle r={r} cy={10} fill={C.bananaDark} stroke={OL} strokeWidth={5} />
      <circle r={r} fill={head ? C.yellow : "#ffd9a8"} stroke={OL} strokeWidth={5} />
      <circle r={r * 0.82} fill="none" stroke={head ? C.yellowDeep : "#e6a65c"} strokeWidth={6} strokeDasharray="4 10" />
      <Txt x={0} y={-r * 0.18} size={r * 0.24} weight={800} color={C.inkSoft}>{head ? "орёл" : "решка"}</Txt>
      <Txt x={0} y={r * 0.32} size={r * 0.44} weight={900} color={head ? C.greenDeep : C.red}>{head ? "+150 $" : "−100 $"}</Txt>
    </g>
  );
};

const Weight: React.FC<{ x: number; y: number; text: string; color: string; w?: number; k?: number }> = ({ x, y, text, color, w = 210, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d={`M ${-w / 2} 0 L ${-w / 2 + 18} ${-110} L ${w / 2 - 18} ${-110} L ${w / 2} 0 Z`} fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-26} y={-134} width={52} height={28} rx={12} fill="none" stroke={OL} strokeWidth={6} />
    <Txt x={0} y={-38} size={48} weight={900} color="#fff">{text}</Txt>
  </g>
);

export const LossAversion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = 700;
  const coinK = win(t, 0.2, at(c, 2));
  const scaleK = win(t, at(c, 2), undefined);
  // монета: быстро крутится в 1-й реплике, в паузе-вопросе медленно парит
  const hover = t >= at(c, 1);
  const phase = hover ? Math.PI * 2 * 0.0 + Math.sin((t - at(c, 1)) * 1.3) * 1.2 + (t - at(c, 1)) * 1.6 : t * 7;
  const coinY = 400 + (hover ? wob(t, 0, 16) : -Math.abs(Math.sin(t * 3.5)) * 60);
  const leftCard = pop(t, at(c, 0.25));
  const rightCard = pop(t, at(c, 0.65));
  // весы
  const tipK = ramp(t, at(c, 2) + 0.5, 1.2);
  const levelK = ramp(t, at(c, 3.2), 1.4);
  const morph = ramp(t, at(c, 3.08), 0.6);
  const ang = ((-13 * tipK) * (1 - levelK) + Math.sin(t * 2) * 0.6 * (1 - levelK * 0.7)) * (Math.PI / 180);
  const px = cx;
  const py = 360;
  const L = 330;
  const lx = px - L * Math.cos(ang);
  const ly = py - L * Math.sin(ang);
  const rx = px + L * Math.cos(ang);
  const ry = py + L * Math.sin(ang);
  const hang = 170;
  return (
    <g>
      <Phase k={coinK}>
        <ellipse cx={cx} cy={640} rx={140 - (hover ? 0 : Math.abs(Math.sin(t * 3.5)) * 40)} ry={20} fill="#000" opacity={0.1} />
        <Coin x={cx} y={coinY} r={150} phase={phase} />
        {leftCard > 0 && (
          <g transform={`translate(260 420) scale(${leftCard})`}>
            <Panel x={-170} y={-120} w={340} h={220} r={30} />
            <Txt x={0} y={-50} size={38} weight={800} color={C.inkSoft}>решка</Txt>
            <Txt x={0} y={40} size={72} weight={900} color={C.red}>−100 $</Txt>
          </g>
        )}
        {rightCard > 0 && (
          <g transform={`translate(1140 420) scale(${rightCard})`}>
            <Panel x={-170} y={-120} w={340} h={220} r={30} />
            <Txt x={0} y={-50} size={38} weight={800} color={C.inkSoft}>орёл</Txt>
            <Txt x={0} y={40} size={72} weight={900} color={C.greenDeep}>+150 $</Txt>
          </g>
        )}
        {hover && (
          <Pop t={t} at={at(c, 1) + 0.2} x={cx} y={150}>
            <Tag x={0} y={0} text="сыграть?" size={44} color="#fff" />
          </Pop>
        )}
      </Phase>
      <Phase k={scaleK}>
        {/* стойка */}
        <path d={`M ${px} ${py} L ${px} 740`} stroke={OL} strokeWidth={14} strokeLinecap="round" />
        <rect x={px - 130} y={735} width={260} height={34} rx={17} fill={C.inkSoft} stroke={OL} strokeWidth={4} />
        {/* коромысло */}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={16} strokeLinecap="round" />
        <circle cx={px} cy={py} r={22} fill={C.yellow} stroke={OL} strokeWidth={5} />
        {[
          { x: lx, y: ly },
          { x: rx, y: ry },
        ].map((e, i) => (
          <g key={i}>
            <path d={`M ${e.x} ${e.y} L ${e.x - 120} ${e.y + hang} M ${e.x} ${e.y} L ${e.x + 120} ${e.y + hang}`} stroke={OL} strokeWidth={4} />
            <path d={`M ${e.x - 150} ${e.y + hang} Q ${e.x} ${e.y + hang + 60} ${e.x + 150} ${e.y + hang} Z`} fill="#c9d3e3" stroke={OL} strokeWidth={5} />
          </g>
        ))}
        <Weight x={lx} y={ly + hang} text="−100 $" color={C.red} />
        <g opacity={1 - morph}>
          <Weight x={rx} y={ry + hang} text="+150 $" color={C.green} w={210} />
        </g>
        {morph > 0 && (
          <g opacity={morph}>
            <Weight x={rx} y={ry + hang} text="+200 $" color={C.greenDeep} w={250} k={0.9 + 0.1 * pop(t, at(c, 3.08))} />
          </g>
        )}
        <g opacity={1 - ramp(t, at(c, 3.3), 0.4)}>
          <Pop t={t} at={at(c, 2.45)} x={px} y={150}>
            <Tag x={0} y={0} text="потеря тянет сильнее" size={40} color="#ffd6d6" />
          </Pop>
        </g>
        <g opacity={1 - ramp(t, at(c, 3), 0.4)}>
          <Pop t={t} at={at(c, 2.2)} x={1080} y={680}>
            <g>
              <Txt x={0} y={0} size={34} weight={700} color={C.inkSoft}>расчёт:</Txt>
              <Txt x={0} y={50} size={40} weight={900} color={C.greenDeep}>в среднем +25 $</Txt>
            </g>
          </Pop>
        </g>
        <Pop t={t} at={at(c, 3.3)} x={1080} y={690}>
          <g>
            <Check x={-112} y={-12} s={40} k={ramp(t, at(c, 3.35), 0.5)} />
            <Txt x={30} y={0} size={36} weight={900} color={C.greenDeep}>равновесие</Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 3.4)} x={px} y={150}>
          <Tag x={0} y={0} text="потери ≈ ×2 (1,5–2,5)" size={44} color={C.violet} textColor="#fff" />
        </Pop>
        <Pop t={t} at={at(c, 3.75)} x={px} y={250}>
          <Tag x={0} y={0} text="неприятие потерь" size={36} color="#fff" />
        </Pop>
      </Phase>
    </g>
  );
};

// ───────────────────────── k30 Кривая ценности ─────────────────────────

const OX = 1240;
const OY = 470;
const XR = 540;
const gainV = (u: number) => (250 * (1 - Math.exp(-3 * u))) / (1 - Math.exp(-3));
const lossV = (u: number) => (-330 * (1 - Math.exp(-6 * u))) / (1 - Math.exp(-6));
const curvePath = (side: 1 | -1) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const v = side === 1 ? gainV(u) : lossV(u);
    pts.push(`${i === 0 ? "M" : "L"} ${(OX + side * u * XR).toFixed(1)} ${(OY - v).toFixed(1)}`);
  }
  return pts.join(" ");
};
const GAIN_D = curvePath(1);
const LOSS_D = curvePath(-1);

export const ValueCurve: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const axK = ramp(t, 0.3, 1);
  const gK = ramp(t, at(c, 0.35), 1.6);
  const lK = ramp(t, at(c, 0.6), 1.6);
  const m1 = ramp(t, at(c, 1.4), 0.8);
  const m2 = ramp(t, at(c, 1.7), 0.8);
  const steep = ramp(t, at(c, 2), 0.8);
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  const mk = (m: number) => OX + (m / 1000) * XR;
  const vy = (m: number) => OY - gainV(m / 1000);
  const markers = [
    { a: 100, b: 200, k: m1, col: C.greenDeep, label: "100 → 200" },
    { a: 900, b: 1000, k: m2, col: C.skyDeep, label: "900 → 1000" },
  ];
  return (
    <g>
      <Panel x={590} y={110} w={1290} h={760} r={40} fill="#ffffff" />
      {/* оси */}
      <g opacity={axK}>
        <line x1={OX - XR * axK - 20} y1={OY} x2={OX + XR * axK + 20} y2={OY} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={OX} y1={OY + 360 * axK} x2={OX} y2={OY - 300 * axK} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d={`M ${OX + XR + 30} ${OY} l -18 -12 l 0 24 Z M ${OX - XR - 30} ${OY} l 18 -12 l 0 24 Z M ${OX} ${OY - 315} l -12 18 l 24 0 Z`} fill={C.ink} />
        <Lbl x={OX + XR - 80} y={OY - 24} text="выигрыши →" anchor="end" size={34} color={C.greenDeep} />
        <Lbl x={OX - XR - 10} y={OY + 54} text="← потери" anchor="start" size={34} color={C.red} />
        <Lbl x={OX + 20} y={OY - 290} text="ценность" anchor="start" size={34} color={C.inkSoft} />
        <Lbl x={OX - 14} y={OY + 40} text="0" anchor="end" size={30} color={C.inkSoft} />
      </g>
      {/* ветвь потерь подсвечивается */}
      {steep > 0 && <path d={LOSS_D} fill="none" stroke={C.red} strokeWidth={30} strokeLinecap="round" opacity={0.18 * steep * (0.6 + 0.4 * glow)} />}
      <path d={GAIN_D} fill="none" stroke={C.green} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - gK} />
      <path d={LOSS_D} fill="none" stroke={C.red} strokeWidth={10 + steep * 4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lK} />
      {gK > 0.02 && gK < 1 && <circle cx={OX + gK * XR} cy={OY - gainV(gK)} r={12} fill={C.greenDeep} />}
      {/* убывающая чувствительность */}
      {markers.map((m, i) =>
        m.k <= 0 ? null : (
          <g key={i} opacity={m.k}>
            <rect x={mk(m.a)} y={OY + 6} width={mk(m.b) - mk(m.a)} height={16} rx={8} fill={m.col} opacity={0.8} />
            <line x1={mk(m.a)} y1={OY} x2={mk(m.a)} y2={vy(m.a)} stroke={m.col} strokeWidth={3} strokeDasharray="8 7" />
            <line x1={mk(m.b)} y1={OY} x2={mk(m.b)} y2={vy(m.b)} stroke={m.col} strokeWidth={3} strokeDasharray="8 7" />
            <path d={`M ${mk(m.a)} ${vy(m.a)} L ${mk(m.b)} ${vy(m.a)} L ${mk(m.b)} ${vy(m.b)}`} fill="none" stroke={m.col} strokeWidth={6} strokeLinecap="round" />
            <rect x={mk(m.b) + 8} y={vy(m.b)} width={18} height={Math.max(4, vy(m.a) - vy(m.b)) * m.k} rx={6} fill={m.col} />
            <Lbl x={(mk(m.a) + mk(m.b)) / 2 + (i === 0 ? 10 : -60)} y={OY + 66} text={m.label} size={32} color={m.col} weight={900} />
          </g>
        ),
      )}
      <Pop t={t} at={at(c, 1.8)} x={OX + 420} y={OY + 140}>
        <Tag x={0} y={0} text="почти не заметно" size={32} color={C.cream} />
      </Pop>
      <Pop t={t} at={at(c, 1.05)} x={OX + 330} y={OY - 100}>
        <Tag x={0} y={0} text="выполаживается" size={32} color="#ddf5e8" />
      </Pop>
      {/* круче в потерях */}
      <Pop t={t} at={at(c, 2.1)} x={OX - 330} y={OY + 150}>
        <Tag x={0} y={0} text="потери — круче!" size={38} color={C.red} textColor="#fff" />
      </Pop>
      <Pop t={t} at={at(c, 2.35)} x={880} y={180}>
        <Tag x={0} y={0} text="выигрыш → осторожность" size={30} color="#ddf5e8" />
      </Pop>
      <Pop t={t} at={at(c, 2.65)} x={880} y={250}>
        <Tag x={0} y={0} text="верная потеря → риск" size={30} color="#ffe0e0" />
      </Pop>
    </g>
  );
};

// ───────────────────────── k31 Эффект владения ─────────────────────────

const Mug: React.FC<{ x: number; y: number; s?: number; tilt?: number }> = ({ x, y, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M 70 -110 Q 130 -110 130 -60 Q 130 -10 70 -14" fill="none" stroke={OL} strokeWidth={22} strokeLinecap="round" />
    <path d="M 70 -110 Q 130 -110 130 -60 Q 130 -10 70 -14" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
    <path d="M -80 -150 L 80 -150 L 72 0 Q 70 14 56 14 L -56 14 Q -70 14 -72 0 Z" fill="#fff" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={-150} rx={80} ry={14} fill="#e9eef6" stroke={OL} strokeWidth={6} />
    <rect x={-80} y={-128} width={154} height={12} fill={S_UNI} opacity={0.9} />
    {/* эмблема университета */}
    <path d="M -34 -96 L 34 -96 L 34 -56 Q 34 -24 0 -12 Q -34 -24 -34 -56 Z" fill={S_UNI} stroke={OL} strokeWidth={4} />
    <path d="M -18 -82 L 0 -90 L 18 -82 L 0 -74 Z" fill={C.yellow} />
    <text x={0} y={-36} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={30} fill="#fff">U</text>
    <path d="M -60 -130 Q -66 -70 -54 -10" stroke="#fff" strokeWidth={8} opacity={0.7} fill="none" strokeLinecap="round" />
  </g>
);
const S_UNI = "#2f5fb3";

const PriceTag: React.FC<{ x: number; y: number; main: string; sub: string; color: string; k: number; swing: number }> = ({ x, y, main, sub, color, k, swing }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${k})`}>
      <path d="M -120 -60 L 90 -60 L 140 0 L 90 60 L -120 60 Q -134 60 -134 46 L -134 -46 Q -134 -60 -120 -60 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={100} cy={0} r={11} fill="#fff" stroke={OL} strokeWidth={4} />
      <Txt x={-20} y={14} size={64} weight={900} color="#fff">{main}</Txt>
      <Txt x={-10} y={104} size={30} weight={700} color={C.inkSoft}>{sub}</Txt>
    </g>
  );

export const Mugs: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const mugIn = pop(t, 0.3);
  const give = ramp(t, at(c, 0.25), 1.1); // кружка переезжает к владельцу
  const mx = interpolate(give, [0, 1], [700, 410]);
  const my = interpolate(give, [0, 1], [560, 690]);
  const ownerK = pop(t, at(c, 0.15));
  const buyerK = pop(t, at(c, 1));
  const glow = give * (0.75 + 0.25 * Math.sin(t * 3));
  const ghostK = ramp(t, at(c, 1.1), 0.6);
  const sameK = pop(t, at(c, 1.55));
  const effK = pop(t, at(c, 2));
  const lossK = pop(t, at(c, 2.35));
  return (
    <g>
      {/* владелец */}
      {ownerK > 0 && (
        <g opacity={clamp01(ownerK * 1.5)}>
          <Figure x={240} y={720} s={1.7 * (0.8 + 0.2 * ownerK)} color={C.green} mood="happy" t={t} arms={0.35} />
          <Tag x={240} y={810} text="владелец" size={34} color="#ddf5e8" />
        </g>
      )}
      {/* покупатель */}
      {buyerK > 0 && (
        <g opacity={clamp01(buyerK * 1.5)}>
          <Figure x={1140} y={720} s={1.7 * (0.8 + 0.2 * buyerK)} color={C.sky} mood="neutral" t={t} hair seed={3} />
          <Tag x={1140} y={810} text="покупатель" size={34} color="#dbeeff" />
        </g>
      )}
      {/* свечение «моё» */}
      {glow > 0.01 && (
        <g>
          <circle cx={mx} cy={my - 75} r={135} fill={C.yellow} opacity={0.25 * glow} />
          <circle cx={mx} cy={my - 75} r={100} fill={C.yellow} opacity={0.35 * glow} />
          {[0, 1, 2, 3].map((j) => (
            <Sparkle key={j} x={mx + Math.cos(t * 0.8 + j * 1.57) * 135} y={my - 75 + Math.sin(t * 0.8 + j * 1.57) * 110} s={0.7} t={t + j} />
          ))}
        </g>
      )}
      {mugIn > 0 && <Mug x={mx} y={my + wob(t, 1, 4)} s={mugIn * (1 - give * 0.2)} tilt={wob(t, 2, 3)} />}
      {/* такая же кружка перед покупателем — без свечения */}
      {ghostK > 0 && (
        <g opacity={ghostK}>
          <Mug x={960} y={690 + wob(t, 5, 3)} s={0.8} />
        </g>
      )}
      {sameK > 0 && (
        <g transform={`translate(685 600) scale(${sameK})`}>
          <Txt x={0} y={20} size={90} weight={900} color={C.inkSoft}>=</Txt>
          <Txt x={0} y={90} size={30} weight={800} color={C.inkSoft}>та же кружка</Txt>
        </g>
      )}
      {/* цены */}
      <PriceTag x={330} y={250} main="≈ 7 $" sub="просит: 7,12 $" color={C.greenDeep} k={pop(t, at(c, 0.6))} swing={wob(t, 0, 3)} />
      <PriceTag x={1060} y={250} main="< 3 $" sub="даёт: 2,87 $" color={C.skyDeep} k={pop(t, at(c, 1.3))} swing={wob(t, 4, 3)} />
      {effK > 0 && (
        <g transform={`translate(695 135) scale(${effK})`}>
          <Tag x={0} y={0} text="эффект владения" size={50} color={C.violet} textColor="#fff" />
        </g>
      )}
      {lossK > 0 && (
        <g transform={`translate(695 440) scale(${lossK})`}>
          <Tag x={0} y={0} text="отдать = потерять" size={38} color="#ffe0e0" />
        </g>
      )}
    </g>
  );
};

// ───────────────────────── k32 Четыре настроения риска ─────────────────────────

const WEIGHTS: [number, number][] = [
  [0, 0],
  [5, 13.2],
  [10, 18.6],
  [20, 26.1],
  [50, 42.1],
  [80, 60.1],
  [90, 71.2],
  [95, 79.3],
  [100, 100],
];

const Ticket: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${-8 + wob(t, 1, 3)})`}>
    <path d="M -90 -55 L 90 -55 L 90 -18 Q 74 0 90 18 L 90 55 L -90 55 L -90 18 Q -74 0 -90 -18 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <line x1={40} y1={-50} x2={40} y2={50} stroke={OL} strokeWidth={3} strokeDasharray="6 6" />
    <path d="M -28 -26 L -18 -4 L 6 -2 L -12 12 L -6 36 L -28 22 L -50 36 L -44 12 L -62 -2 L -38 -4 Z" fill={C.coral} stroke={OL} strokeWidth={3} />
  </g>
);
const Shield: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y + wob(t, 2, 3)})`}>
    <path d="M 0 -70 L 60 -48 L 60 0 Q 60 50 0 74 Q -60 50 -60 0 L -60 -48 Z" fill={C.skyDeep} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -24 0 L -6 18 L 26 -18" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const SafeBag: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y + wob(t, 3, 2)})`}>
    <path d="M -26 -50 Q 0 -36 26 -50 L 18 -34 Q 66 -10 62 34 Q 58 66 0 66 Q -58 66 -62 34 Q -66 -10 -18 -34 Z" fill="#d9a65a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -22 -36 L 22 -36" stroke={OL} strokeWidth={6} strokeLinecap="round" />
    <Txt x={0} y={36} size={50} weight={900} color="#fff">$</Txt>
    {/* синица на мешке */}
    <g transform="translate(40 -54)">
      <ellipse rx={20} ry={15} fill={C.yellow} stroke={OL} strokeWidth={3} />
      <circle cx={14} cy={-12} r={10} fill="#2b3a55" stroke={OL} strokeWidth={3} />
      <path d="M 23 -12 L 32 -9 L 23 -6 Z" fill={C.yellowDeep} />
      <path d="M -18 0 L -32 -6 L -28 8 Z" fill="#2b3a55" />
    </g>
  </g>
);
const Dice: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const r = Math.sin(t * 2.2) * 8;
  const die = (dx: number, dy: number, rot: number, dots: [number, number][]) => (
    <g transform={`translate(${dx} ${dy}) rotate(${rot})`}>
      <rect x={-36} y={-36} width={72} height={72} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
      {dots.map(([a, b], i) => (
        <circle key={i} cx={a * 18} cy={b * 18} r={6.5} fill={C.red} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {die(-34, 8, -14 + r, [
        [-1, -1],
        [0, 0],
        [1, 1],
      ])}
      {die(40, -16, 18 - r, [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
        [0, 0],
      ])}
    </g>
  );
};

export const Fourfold: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const scK = win(t, 0.2, at(c, 1));
  const gridK = win(t, at(c, 1), undefined);
  const x0 = 690;
  const x1 = 1790;
  const W = x1 - x0;
  const topY = 330;
  const botY = 610;
  const mapK = ramp(t, at(c, 0.25), 1);
  const j1 = ramp(t, at(c, 0.3), 0.6);
  const j2 = ramp(t, at(c, 0.55), 0.6);
  const mid = ramp(t, at(c, 0.8), 0.6);
  const px = (p: number) => x0 + (p / 100) * W;
  // сетка 2×2
  const cols = [
    { title: "высокий шанс", x: 800 },
    { title: "малый шанс", x: 1320 },
  ];
  const rows = [
    { title: "выигрыш", y: 170, col: C.greenDeep },
    { title: "потеря", y: 515, col: C.red },
  ];
  const cw = 500;
  const ch = 325;
  type Cell = { r: number; c: number; at: number; icon: (x: number, y: number) => React.ReactNode; title: string; verdict: string; risk: boolean };
  const cells: Cell[] = [
    { r: 0, c: 1, at: at(c, 1.3), icon: (x, y) => <Ticket x={x} y={y} t={t} />, title: "лотерея", verdict: "риск", risk: true },
    { r: 1, c: 1, at: at(c, 1.72), icon: (x, y) => <Shield x={x} y={y} t={t} />, title: "страховка", verdict: "осторожность", risk: false },
    { r: 0, c: 0, at: at(c, 2.05), icon: (x, y) => <SafeBag x={x} y={y} t={t} />, title: "синица в руке", verdict: "осторожность", risk: false },
    { r: 1, c: 0, at: at(c, 2.5), icon: (x, y) => <Dice x={x} y={y} t={t} />, title: "отчаянный риск", verdict: "риск", risk: true },
  ];
  return (
    <g>
      <Phase k={scK}>
        <Panel x={610} y={140} w={1260} h={660} r={40} />
        <Lbl x={x0} y={240} text="шанс на деле" anchor="start" size={34} color={C.inkSoft} />
        <Lbl x={x0} y={770} text="как мы его чувствуем" anchor="start" size={34} color={C.violet} k={mapK} />
        {/* верхняя ровная шкала */}
        <line x1={x0} y1={topY} x2={x1} y2={topY} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        {/* нижняя «чувственная» шкала */}
        <g opacity={mapK}>
          <line x1={x0} y1={botY} x2={x1} y2={botY} stroke={C.violet} strokeWidth={8} strokeLinecap="round" />
          {j1 > 0 && <rect x={px(0)} y={botY - 16} width={(px(13.2) - px(0)) * j1} height={32} rx={14} fill={C.yellow} stroke={OL} strokeWidth={3} />}
          {j2 > 0 && <rect x={px(79.3)} y={botY - 16} width={(px(100) - px(79.3)) * j2} height={32} rx={14} fill={C.yellow} stroke={OL} strokeWidth={3} />}
          {mid > 0 && <rect x={px(13.2)} y={botY - 9} width={px(79.3) - px(13.2)} height={18} rx={9} fill={C.violet} opacity={0.25 * mid} />}
        </g>
        {WEIGHTS.map(([p, w], i) => {
          const k = ramp(t, at(c, 0.25) + i * 0.08, 0.6) * mapK;
          const hot = (p <= 5 && j1 > 0) || (p >= 95 && j2 > 0);
          const xb = px(p) + (px(w) - px(p)) * k;
          return (
            <g key={p}>
              <line x1={px(p)} y1={topY - 16} x2={px(p)} y2={topY + 16} stroke={C.ink} strokeWidth={5} />
              <Lbl
                x={px(p) + (p === 0 || p === 95 ? 8 : p === 5 || p === 100 ? -8 : 0)}
                y={topY - 30}
                text={`${p}%`}
                anchor={p === 0 || p === 95 ? "end" : p === 5 || p === 100 ? "start" : "middle"}
                size={32}
                color={hot ? C.red : C.ink}
                weight={hot ? 900 : 800}
                k={p === 10 || p === 90 ? 0 : 1}
              />
              {k > 0 && (
                <g>
                  <line x1={px(p)} y1={topY + 20} x2={xb} y2={topY + 20 + (botY - topY - 40) * k} stroke={hot ? C.red : C.inkSoft} strokeWidth={hot ? 5 : 3} opacity={hot ? 0.9 : 0.45} />
                  <circle cx={xb} cy={botY} r={hot ? 11 : 8} fill={hot ? C.red : C.violet} opacity={k} />
                </g>
              )}
            </g>
          );
        })}
        <Pop t={t} at={at(c, 0.35)} x={(px(0) + px(13.2)) / 2 + 40} y={botY + 60}>
          <Tag x={0} y={0} text="скачок!" size={32} color={C.yellow} />
        </Pop>
        <Pop t={t} at={at(c, 0.6)} x={(px(79.3) + px(100)) / 2 - 30} y={botY + 60}>
          <Tag x={0} y={0} text="скачок!" size={32} color={C.yellow} />
        </Pop>
        <Pop t={t} at={at(c, 0.82)} x={(px(13.2) + px(79.3)) / 2} y={botY - 50}>
          <Tag x={0} y={0} text="середина сжата" size={32} color="#e8e1ff" />
        </Pop>
      </Phase>
      <Phase k={gridK}>
        {cols.map((cc, i) => (
          <Pop key={i} t={t} at={at(c, 1) + i * 0.15} x={cc.x + cw / 2} y={130}>
            <Txt x={0} y={0} size={38} weight={900} color={C.ink}>{cc.title}</Txt>
          </Pop>
        ))}
        {rows.map((rr, i) => (
          <Pop key={i} t={t} at={at(c, 1) + 0.3 + i * 0.15} x={700} y={rr.y + ch / 2 + 12}>
            <g transform="rotate(-90)">
              <Txt x={0} y={14} size={40} weight={900} color={rr.col}>{rr.title}</Txt>
            </g>
          </Pop>
        ))}
        {rows.map((rr, ri) =>
          cols.map((cc, ci) => (
            <rect key={`${ri}${ci}`} x={cc.x} y={rr.y} width={cw - 20} height={ch - 20} rx={28} fill="#fff" opacity={0.45 * ramp(t, at(c, 1) + 0.2, 0.5)} stroke={C.ink} strokeOpacity={0.15} strokeWidth={3} strokeDasharray="12 10" />
          )),
        )}
        {cells.map((cl, i) => {
          const k = pop(t, cl.at);
          if (k <= 0.001) return null;
          const x = cols[cl.c].x;
          const y = rows[cl.r].y;
          const fill = cl.risk ? "#ffe3dc" : "#dcefff";
          const vc = cl.risk ? C.red : C.skyDeep;
          return (
            <g key={i} transform={`translate(${x + (cw - 20) / 2} ${y + (ch - 20) / 2}) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.5)}>
              <rect x={-(cw - 20) / 2} y={-(ch - 20) / 2} width={cw - 20} height={ch - 20} rx={28} fill={fill} stroke={vc} strokeWidth={5} />
              {cl.icon(-130, -10)}
              <Txt x={90} y={-40} size={cl.title.length > 12 ? 32 : 38} weight={900}>{cl.title}</Txt>
              <g transform="translate(90 50)">
                <rect x={-120} y={-34} width={240} height={58} rx={29} fill={vc} />
                <Txt x={0} y={7} size={cl.verdict.length > 8 ? 28 : 34} weight={900} color="#fff">{cl.verdict}</Txt>
              </g>
            </g>
          );
        })}
      </Phase>
    </g>
  );
};

// ───────────────────────── k33 Рамка формулировки ─────────────────────────

const Car: React.FC<{ x: number; y: number; s?: number; color: string; t: number }> = ({ x, y, s = 1, color, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 8) * 1.5}) scale(${s})`}>
    <path d="M -110 -20 L -100 -60 Q -95 -70 -80 -70 L -50 -70 L -20 -110 Q -12 -118 0 -118 L 50 -118 Q 64 -118 72 -108 L 100 -70 Q 120 -66 120 -48 L 120 -20 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -36 -72 L -12 -104 L 18 -104 L 18 -72 Z M 30 -72 L 30 -104 L 54 -104 L 80 -72 Z" fill="#dff3ff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    {[-62, 72].map((wx) => (
      <g key={wx} transform={`translate(${wx} -16) rotate(${t * 200})`}>
        <circle r={28} fill="#2b2b2b" stroke={OL} strokeWidth={4} />
        <circle r={11} fill="#bbb" />
        <line x1={0} y1={-11} x2={0} y2={11} stroke="#777" strokeWidth={4} />
      </g>
    ))}
    <circle cx={112} cy={-50} r={7} fill={C.yellow} />
  </g>
);

const FuelCan: React.FC<{ x: number; y: number; h: number; level: number; color: string }> = ({ x, y, h, level, color }) => {
  const w = 150;
  const fh = (h - 20) * clamp01(level);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-w / 2 + 20} ${-h} L ${w / 2 - 40} ${-h} L ${w / 2} ${-h + 40} L ${w / 2} 0 L ${-w / 2} 0 L ${-w / 2} ${-h + 20} Z`} fill="#f4f6fa" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <clipPath id={`can-${x}`}>
        <path d={`M ${-w / 2 + 20} ${-h} L ${w / 2 - 40} ${-h} L ${w / 2} ${-h + 40} L ${w / 2} 0 L ${-w / 2} 0 L ${-w / 2} ${-h + 20} Z`} />
      </clipPath>
      <rect x={-w / 2} y={-fh} width={w} height={fh} fill={color} clipPath={`url(#can-${x})`} opacity={0.9} />
      <rect x={-w / 2 + 34} y={-h - 26} width={34} height={26} rx={6} fill={C.inkSoft} stroke={OL} strokeWidth={4} />
      <path d={`M ${-w / 2 + 30} ${-h + 30} L ${w / 2 - 50} ${-h + 30}`} stroke={OL} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

export const Framing: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const aK = win(t, 0.2, at(c, 2));
  const bK = win(t, at(c, 2), at(c, 4));
  const cK = win(t, at(c, 4), undefined);
  // фаза A: донат 90/10
  const donutK = ramp(t, 0.3, 1);
  const gHi = ramp(t, at(c, 0.42), 0.5);
  const rHi = ramp(t, at(c, 0.78), 0.5);
  const gOnly = gHi * (1 - rHi);
  const b1 = ramp(t, at(c, 1.3), 1);
  const b2 = ramp(t, at(c, 1.65), 1);
  const R = 140;
  const circ = 2 * Math.PI * R;
  // фаза B: 600 человек
  const dotsK = ramp(t, at(c, 2), 1.4);
  const saveK = pop(t, at(c, 2.4));
  const dieK = pop(t, at(c, 2.75));
  const reK = pop(t, at(c, 3.15));
  // фаза C: мили на галлон
  const s1 = pop(t, at(c, 4) + 0.2);
  const s2 = pop(t, at(c, 4.13));
  const seem = ramp(t, at(c, 4.3), 0.5) * (1 - ramp(t, at(c, 4.5), 0.4));
  const cans = ramp(t, at(c, 4.52), 1.4);
  const canIn = ramp(t, at(c, 4.25), 0.6);
  const tog = ramp(t, at(c, 4.8), 0.7);
  return (
    <g>
      <Phase k={aK}>
        <Panel x={90} y={140} w={560} h={640} r={40} />
        <Txt x={370} y={210} size={40} weight={900}>операция</Txt>
        {/* иконка-крестик медицины */}
        <path d="M 520 175 h 22 v 22 h 22 v 22 h -22 v 22 h -22 v -22 h -22 v -22 h 22 Z" fill={C.red} transform="translate(0 -12) scale(1)" />
        <g transform={`translate(370 430) rotate(-90)`} opacity={donutK}>
          <circle r={R} fill="none" stroke="#eef1f6" strokeWidth={64} />
          <circle r={R} fill="none" stroke={C.green} strokeWidth={64 + gOnly * 14} strokeDasharray={`${circ * 0.9 * donutK} ${circ}`} opacity={1 - rHi * 0.55} />
          <circle r={R} fill="none" stroke={C.red} strokeWidth={64 + rHi * 14} strokeDasharray={`${circ * 0.1 * donutK} ${circ}`} strokeDashoffset={-circ * 0.9} opacity={0.55 + rHi * 0.45} />
        </g>
        <Txt x={370} y={445} size={54} weight={900} color={rHi > 0.5 ? C.red : C.greenDeep}>{rHi > 0.5 ? "10%" : "90%"}</Txt>
        <Pop t={t} at={at(c, 0.42)} x={370} y={660}>
          <Tag x={0} y={0} text="выживают 90%" size={38} color={gOnly > 0.4 ? C.green : "#ddf5e8"} textColor={gOnly > 0.4 ? "#fff" : C.greenDeep} />
        </Pop>
        <Pop t={t} at={at(c, 0.78)} x={370} y={740}>
          <Tag x={0} y={0} text="умирают 10%" size={38} color={rHi > 0.4 ? C.red : "#ffe0e0"} textColor="#fff" />
        </Pop>
        {/* одно и то же */}
        <Pop t={t} at={at(c, 1)} x={1000} y={160}>
          <Tag x={0} y={0} text="одно и то же!" size={40} color={C.yellow} />
        </Pop>
        <Lbl x={1000} y={250} text="выбрали операцию" size={36} color={C.inkSoft} k={ramp(t, at(c, 1.25), 0.5)} />
        {[
          { x: 850, v: 0.84, k: b1, lk: gHi, col: C.green, label: "«выживают»", val: "84%" },
          { x: 1150, v: 0.5, k: b2, lk: rHi, col: C.red, label: "«умирают»", val: "≈ 50%" },
        ].map((b, i) => {
          const hh = 420 * b.v * b.k;
          return b.lk <= 0 ? null : (
            <g key={i} opacity={clamp01(b.lk * 2)}>
              <rect x={b.x - 90} y={760 - 420} width={180} height={420} rx={18} fill="#fff" opacity={0.5} stroke={b.col} strokeOpacity={0.5} strokeWidth={4} strokeDasharray="12 10" />
              {b.k > 0 && <rect x={b.x - 90} y={760 - hh} width={180} height={hh} rx={18} fill={b.col} stroke={OL} strokeWidth={4} />}
              {b.k > 0.3 && <Txt x={b.x} y={760 - hh - 20} size={52} weight={900}>{b.val}</Txt>}
              <Txt x={b.x} y={810} size={34} weight={800} color={b.col === C.red ? C.red : C.greenDeep}>{b.label}</Txt>
            </g>
          );
        })}
      </Phase>
      <Phase k={bK}>
        <Lbl x={120} y={170} text="600 человек" anchor="start" size={44} weight={900} />
        {Array.from({ length: 600 }).map((_, i) => {
          const col = Math.floor(i / 15);
          const row = i % 15;
          const k = clamp01(dotsK * 1.6 - (col / 40) * 0.6);
          const saved = i < 200;
          const color = saved ? C.green : "#e58a8c";
          return <circle key={i} cx={130 + col * 29.5} cy={240 + row * 33} r={11 * k} fill={color} opacity={reK > 0 ? 0.55 : 1} />;
        })}
        {/* граница 200 / 400 */}
        <line x1={130 + 13.33 * 29.5 - 15} y1={215} x2={130 + 13.33 * 29.5 - 15} y2={730} stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" opacity={dotsK} />
        <Pop t={t} at={at(c, 2.4)} x={130 + 6.5 * 29.5} y={790}>
          <Tag x={0} y={0} text="«спасём 200»" size={40} color={C.green} textColor="#fff" />
        </Pop>
        <Pop t={t} at={at(c, 2.75)} x={130 + 26.5 * 29.5} y={790}>
          <Tag x={0} y={0} text="«умрут 400»" size={40} color={C.red} textColor="#fff" />
        </Pop>
        <Lbl x={900} y={170} text="цифры одни и те же" size={38} color={C.violet} weight={900} k={ramp(t, at(c, 2.85), 0.5) * saveK * dieK} />
        {reK > 0 && (
          <g transform={`translate(700 470) scale(${reK})`}>
            <rect x={-360} y={-90} width={720} height={170} rx={40} fill="#fff" stroke={C.violet} strokeWidth={6} />
            <g transform={`translate(-260 -5) rotate(${t * 60})`}>
              <path d="M -40 0 A 40 40 0 0 1 34 -20" fill="none" stroke={C.violet} strokeWidth={10} strokeLinecap="round" />
              <path d="M 40 0 A 40 40 0 0 1 -34 20" fill="none" stroke={C.violet} strokeWidth={10} strokeLinecap="round" />
              <path d="M 34 -20 l 6 -22 l 14 26 Z M -34 20 l -6 22 l -14 -26 Z" fill={C.violet} />
            </g>
            <Txt x={60} y={18} size={52} weight={900} color={C.violet}>перескажите иначе</Txt>
          </g>
        )}
      </Phase>
      <Phase k={cK}>
        <g transform="translate(0 40)">
        {[
          { x: 360, name: "Адам", k: s1, from: 12, to: 14, l1: "19,6", l2: "16,8", gal: 119, color: C.coral },
          { x: 1000, name: "Бет", k: s2, from: 30, to: 40, l1: "7,8", l2: "5,9", gal: 83, color: C.sky },
        ].map((p, i) =>
          p.k <= 0.001 ? null : (
            <g key={i} opacity={clamp01(p.k * 1.5)}>
              <Panel x={p.x - 290} y={120} w={580} h={690} r={40} />
              <Txt x={p.x - 150} y={190} size={46} weight={900}>{p.name}</Txt>
              <Car x={p.x + 110} y={240} s={0.75} color={p.color} t={t} />
              {/* мили на галлон ↔ л/100 км */}
              <g opacity={1 - tog}>
                <Txt x={p.x} y={320} size={60} weight={900}>{`${p.from} → ${p.to}`}</Txt>
                <Txt x={p.x} y={368} size={32} weight={700} color={C.inkSoft}>миль на галлон</Txt>
              </g>
              {tog > 0 && (
                <g opacity={tog}>
                  <Txt x={p.x} y={320} size={60} weight={900} color={C.violet}>{`${p.l1} → ${p.l2}`}</Txt>
                  <Txt x={p.x} y={368} size={32} weight={700} color={C.inkSoft}>л/100 км</Txt>
                </g>
              )}
              {i === 1 && seem > 0 && (
                <g opacity={seem}>
                  <Tag x={p.x} y={440} text="+10 — кажется, больше?" size={32} color={C.yellow} />
                </g>
              )}
              {i === 0 && seem > 0 && (
                <g opacity={seem}>
                  <Tag x={p.x} y={440} text="+2" size={32} color="#eef1f6" />
                </g>
              )}
              {canIn > 0 && (
                <g opacity={canIn}>
                  <FuelCan x={p.x - 90} y={760} h={260} level={(p.gal / 130) * cans} color={C.greenDeep} />
                  {cans <= 0 && <Txt x={p.x - 90} y={660} size={80} weight={900} color={C.inkSoft}>?</Txt>}
                  {cans > 0 && <Txt x={p.x + 120} y={640} size={72} weight={900} color={C.greenDeep}>{`${Math.round(p.gal * cans)}`}</Txt>}
                  <Txt x={p.x + 120} y={690} size={32} weight={800} color={C.inkSoft}>галлонов</Txt>
                  <Txt x={p.x + 120} y={735} size={30} weight={700} color={C.inkSoft}>на 10 000 миль</Txt>
                </g>
              )}
            </g>
          ),
        )}
        {tog > 0.9 && (
          <g opacity={ramp(t, at(c, 4.85), 0.5)}>
            <Lbl x={360} y={420} text="−2,8 л" size={38} color={C.greenDeep} weight={900} />
            <Lbl x={1000} y={420} text="−1,9 л" size={38} color={C.skyDeep} weight={900} />
          </g>
        )}
        </g>
        {/* переключатель */}
        {tog > 0 && (
          <g transform={`translate(680 ${118}) scale(${0.8 + 0.2 * tog})`} opacity={tog}>
            <rect x={-170} y={-36} width={340} height={72} rx={36} fill="#fff" stroke={OL} strokeWidth={4} />
            <rect x={-166 + 168 * ease(tog)} y={-32} width={164} height={64} rx={32} fill={C.violet} />
            <Txt x={-84} y={11} size={30} weight={900} color={tog > 0.5 ? C.inkSoft : "#fff"}>мили/гал</Txt>
            <Txt x={84} y={11} size={30} weight={900} color={tog > 0.5 ? "#fff" : C.inkSoft}>л/100 км</Txt>
          </g>
        )}
      </Phase>
    </g>
  );
};

// ───────────────────────── k34 Широкая рамка и т. д. ─────────────────────────

// распределение среднего итога на одну ставку (−100 $ или +200 $, шанс 50/50)
const NS = [1, 2, 3, 5, 10, 20, 50, 100];
const BIN0 = -100;
const NB = 31; // корзины по 10 $: −100 … +200
const logC = (n: number, k: number) => {
  let s = 0;
  for (let i = 1; i <= k; i++) s += Math.log((n - k + i) / i);
  return s;
};
const HIST: number[][] = NS.map((n) => {
  const bins = new Array(NB).fill(0);
  for (let w = 0; w <= n; w++) {
    const avg = (300 * w) / n - 100;
    const b = Math.min(NB - 1, Math.max(0, Math.round((avg - BIN0) / 10)));
    bins[b] += Math.exp(logC(n, w) - n * Math.log(2));
  }
  const mx = Math.max(...bins);
  return bins.map((v) => v / mx);
});
const histAt = (k: number) => {
  const f = clamp01(k) * (NS.length - 1);
  const i = Math.min(NS.length - 2, Math.floor(f));
  const fr = f - i;
  return HIST[i].map((v, j) => v * (1 - fr) + HIST[i + 1][j] * fr);
};

const Flake: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <circle cx={x} cy={y} r={r} fill="#fff" opacity={0.95} />;

const Briefcase: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-60} y={-200} width={120} height={50} rx={20} fill="none" stroke={OL} strokeWidth={12} />
    <rect x={-210} y={-170} width={420} height={260} rx={30} fill="#8a5a2b" stroke={OL} strokeWidth={6} />
    <rect x={-210} y={-90} width={420} height={14} fill={OL} opacity={0.3} />
    {Array.from({ length: 12 }).map((_, i) => {
      const plus = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1][i];
      const cx = -165 + (i % 6) * 66;
      const cy = -30 + Math.floor(i / 6) * 70 + wob(t, i, 2);
      return (
        <g key={i}>
          <rect x={cx - 26} y={cy - 26} width={52} height={52} rx={12} fill={plus ? C.green : C.coral} stroke={OL} strokeWidth={3} />
          <Txt x={cx} y={cy + 13} size={38} weight={900} color="#fff">{plus ? "+" : "−"}</Txt>
        </g>
      );
    })}
  </g>
);

const CalPage: React.FC<{ x: number; y: number; day: string; seed: number; rot: number }> = ({ x, y, day, seed, rot }) => {
  const pts = Array.from({ length: 7 }).map((_, i) => `${-90 + i * 30},${Math.sin(i * 2.3 + seed) * 26 + Math.cos(i * 1.7 + seed * 2) * 14 + 30}`);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-120} y={-110} width={240} height={220} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
      <rect x={-120} y={-110} width={240} height={60} rx={20} fill={C.red} />
      <rect x={-120} y={-70} width={240} height={20} fill={C.red} />
      <Txt x={0} y={-68} size={34} weight={900} color="#fff">{day}</Txt>
      <polyline points={pts.join(" ")} fill="none" stroke={C.inkSoft} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={-90 + 4 * 30} cy={Math.sin(4 * 2.3 + seed) * 26 + Math.cos(4 * 1.7 + seed * 2) * 14 + 30} r={9} fill={C.red} />
    </g>
  );
};

const FormCard: React.FC<{ x: number; y: number; title: string; text: string; k: number; tick: number }> = ({ x, y, title, text, k, tick }) =>
  k <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-250} y={-95} width={500} height={185} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
      <Txt x={0} y={-45} size={30} weight={800} color={C.inkSoft}>{title}</Txt>
      <rect x={-190} y={-20} width={76} height={76} rx={14} fill="#fff" stroke={OL} strokeWidth={6} />
      <Check x={-152} y={18} s={42} k={tick} color={C.inkSoft} />
      <Txt x={-84} y={32} size={40} weight={900} anchor="start">{text}</Txt>
    </g>
  );

const BroadBet: React.FC<{ c: VisualCtx }> = ({ c }) => {
  const { t } = c;
  const x0 = 690;
  const pxu = 3.75;
  const base = 700;
  const mk = ramp(t, at(c, 0.55), 2.6);
  const hist = histAt(mk);
  const zeroX = x0 + (0 - BIN0) * pxu;
  const chartK = ramp(t, 0.3, 0.8);
  return (
    <g>
      <Panel x={610} y={120} w={1260} h={720} r={40} />
      <g opacity={chartK}>
        <line x1={x0 - 30} y1={base} x2={x0 + 300 * pxu + 30} y2={base} stroke={C.ink} strokeWidth={5} />
        {hist.map((v, j) => {
          const avg = BIN0 + j * 10;
          const h = 400 * v;
          const color = avg < 0 ? C.red : avg === 0 ? "#b8c0cc" : C.green;
          return h < 1 ? null : <rect key={j} x={x0 + j * 10 * pxu - 15} y={base - h} width={30} height={h} rx={6} fill={color} stroke={OL} strokeWidth={2} />;
        })}
        <line x1={zeroX} y1={base + 10} x2={zeroX} y2={250} stroke={C.ink} strokeWidth={3} strokeDasharray="10 8" />
        <Lbl x={x0} y={base + 48} text="−100 $" size={32} color={C.red} />
        <Lbl x={zeroX} y={base + 48} text="0" size={32} />
        <Lbl x={x0 + 300 * pxu} y={base + 48} text="+200 $" size={32} color={C.greenDeep} />
        <Lbl x={x0 + 150 * pxu} y={base + 100} text="итог в среднем на ставку" size={30} color={C.inkSoft} weight={700} />
        <Lbl x={x0 + 45 * pxu} y={240} text="убыток" size={34} color={C.red} weight={900} k={1 - mk * 0.7} />
        <Lbl x={x0 + 230 * pxu} y={240} text="выигрыш" size={34} color={C.greenDeep} weight={900} />
      </g>
      <g opacity={1 - ramp(t, at(c, 0.55), 0.4)}>
        <Pop t={t} at={0.5} x={1250} y={180}>
          <Tag x={0} y={0} text="1 ставка: страшно" size={40} color="#ffe0e0" />
        </Pop>
      </g>
      <Pop t={t} at={at(c, 0.55) + 2.6} x={1250} y={180}>
        <Tag x={0} y={0} text="100 ставок: почти наверняка +" size={38} color="#ddf5e8" />
      </Pop>
    </g>
  );
};

export const BroadFrame: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k1 = win(t, 0.2, at(c, 1));
  const k2 = win(t, at(c, 1), at(c, 2));
  const k3 = win(t, at(c, 2), at(c, 3));
  const k4 = win(t, at(c, 3), undefined);
  // фаза 3: дорога в метель
  const t3 = Math.max(0, t - at(c, 2));
  const carX = 760 + Math.min(1, t3 / Math.max(1, c.ends[2] - c.beats[2])) * 320;
  const giftK = pop(t, at(c, 2.6));
  return (
    <g>
      <Phase k={k1}>
        <BroadBet c={c} />
      </Phase>
      <Phase k={k2}>
        <Pop t={t} at={at(c, 1) + 0.2} x={1450} y={520}>
          <g>
            <Briefcase x={0} y={0} t={t} k={1} />
          </g>
        </Pop>
        <Pop t={t} at={at(c, 1.2)} x={1450} y={250}>
          <g>
            <Tag x={0} y={0} text="риски — одним портфелем" size={38} color="#ddf5e8" />
          </g>
        </Pop>
        {(() => {
          const k = ramp(t, at(c, 1.35), 1);
          return k <= 0 ? null : (
            <g opacity={k}>
              <path d={`M 1250 790 Q 1420 ${790 - 30 * k} ${1250 + 380 * k} ${790 - 110 * k}`} fill="none" stroke={C.greenDeep} strokeWidth={10} strokeLinecap="round" />
              <Lbl x={1250} y={840} text="в целом — рост" anchor="start" size={32} color={C.greenDeep} weight={900} />
              <Check x={1700} y={690} s={50} k={ramp(t, at(c, 1.5), 0.5)} />
            </g>
          );
        })()}
        {[0, 1, 2].map((i) => (
          <Pop key={i} t={t} at={at(c, 1.33) + i * 0.12} x={820 + i * 28} y={450 + i * 20}>
            <CalPage x={0} y={0} day={["пн", "вт", "ср"][2 - i] ?? "пн"} seed={i * 3} rot={-6 + i * 5 + (i === 2 ? wob(t, 2, 2) : 0)} />
          </Pop>
        ))}
        <Pop t={t} at={at(c, 1.45)} x={860} y={250}>
          <Tag x={0} y={0} text="проверять каждый день" size={34} color="#ffe0e0" />
        </Pop>
        <Cross x={870} y={490} s={200} k={ramp(t, at(c, 1.7), 0.6)} />
      </Phase>
      <Phase k={k3}>
        {/* метель */}
        <rect x={600} y={130} width={1270} height={700} rx={40} fill="#dfe9f5" />
        <path d="M 600 600 L 1870 600 L 1870 790 Q 1870 830 1830 830 L 640 830 Q 600 830 600 790 Z" fill="#fff" />
        <path d="M 600 660 L 1870 660 L 1870 760 L 600 760 Z" fill="#8a94a6" />
        <path d="M 620 712 L 1850 712" stroke="#fff" strokeWidth={6} strokeDasharray="40 30" />
        {/* стадион вдали */}
        <g transform="translate(1720 600)">
          <path d="M -120 0 L -110 -90 Q 0 -130 110 -90 L 120 0 Z" fill="#b9c5d8" stroke={OL} strokeWidth={4} />
          <line x1={-90} y1={-100} x2={-90} y2={-170} stroke={OL} strokeWidth={5} />
          <line x1={90} y1={-100} x2={90} y2={-170} stroke={OL} strokeWidth={5} />
          <circle cx={-90} cy={-176} r={12} fill={C.yellow} />
          <circle cx={90} cy={-176} r={12} fill={C.yellow} />
        </g>
        {Array.from({ length: 46 }).map((_, i) => {
          const sx = 620 + ((i * 97) % 1240);
          const sp = 60 + (i % 5) * 18;
          const sy = 140 + ((i * 53 + t * sp) % 680);
          return <Flake key={i} x={sx + Math.sin(t * 1.5 + i) * 10} y={sy} r={4 + (i % 3) * 2} />;
        })}
        <Car x={carX} y={735} s={0.9} color={C.coral} t={t} />
        {/* билет тянет машину */}
        <path d={`M ${carX + 110} 700 Q ${carX + 180} 690 ${carX + 250} 640`} fill="none" stroke={OL} strokeWidth={5} />
        <g transform={`translate(${carX + 310} ${620 + wob(t, 1, 8)}) rotate(${-6 + wob(t, 3, 4)})`}>
          <path d="M -80 -45 L 80 -45 L 80 -14 Q 66 0 80 14 L 80 45 L -80 45 L -80 14 Q -66 0 -80 -14 Z" fill={giftK > 0.5 ? "#ffe3f1" : C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <Txt x={0} y={12} size={34} weight={900}>БИЛЕТ</Txt>
          {giftK > 0 && (
            <g transform={`translate(0 -48) scale(${giftK})`}>
              <path d="M 0 0 Q -40 -34 -44 -6 Q -40 14 0 0 Z M 0 0 Q 40 -34 44 -6 Q 40 14 0 0 Z" fill={C.coral} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
              <circle r={9} fill={C.red} stroke={OL} strokeWidth={3} />
            </g>
          )}
        </g>
        <Pop t={t} at={at(c, 2) + 0.4} x={carX + 310} y={530}>
          <Tag x={0} y={0} text="уже заплачено" size={32} color={C.red} textColor="#fff" />
        </Pop>
        {giftK > 0 && (
          <g transform={`translate(1230 260) scale(${giftK})`}>
            <rect x={-420} y={-70} width={840} height={130} rx={40} fill="#fff" stroke={C.violet} strokeWidth={6} />
            <Txt x={0} y={18} size={46} weight={900} color={C.violet}>а если бы билет подарили?</Txt>
          </g>
        )}
      </Phase>
      <Phase k={k4}>
        {[
          { x: 930, name: "одна страна", v: 1, val: "≈ 100%", col: C.green, title: "отметьте, если", text: "против", fk: at(c, 3.6), bk: at(c, 3.15) },
          { x: 1550, name: "соседняя страна", v: 0.12, val: "≈ 12%", col: C.coral, title: "отметьте, если", text: "согласны", fk: at(c, 3.75), bk: at(c, 3.35) },
        ].map((col, i) => {
          const bk = ramp(t, col.bk, 1);
          const hh = 320 * col.v * bk;
          return (
            <g key={i}>
              <Pop t={t} at={col.bk - 0.1} x={col.x} y={140}>
                <Txt x={0} y={0} size={38} weight={900}>{col.name}</Txt>
              </Pop>
              {bk > 0 && (
                <g opacity={clamp01(bk * 3)}>
                  <rect x={col.x - 110} y={830 - 320} width={220} height={320} rx={20} fill="#fff" opacity={0.5} />
                  <rect x={col.x - 110} y={830 - hh} width={220} height={hh} rx={20} fill={col.col} stroke={OL} strokeWidth={4} />
                  <Txt x={col.x} y={830 - hh - 22} size={54} weight={900}>{col.val}</Txt>
                </g>
              )}
              <FormCard x={col.x} y={318} title={col.title} text={col.text} k={pop(t, col.fk)} tick={0} />
            </g>
          );
        })}
        <Lbl x={1240} y={200} text="согласие на донорство" size={32} color={C.inkSoft} weight={700} k={ramp(t, at(c, 3.2), 0.5)} />
        <Pop t={t} at={at(c, 3.85)} x={1240} y={640}>
          <Tag x={0} y={0} text="по умолчанию" size={36} color={C.violet} textColor="#fff" />
        </Pop>
      </Phase>
    </g>
  );
};
