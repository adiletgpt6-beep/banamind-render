// Универсальные сцены BM-037:
//   duo      — мини-история двух людей: реплики-облачка по ходу речи банана,
//              смена эмоций и поз; ярлык-источник («рассказ слушателя курсов» и т. п.);
//   compare  — два столбца «так — не так» с зачёркиванием и галочкой;
//   rule     — правило главы дословно (слова Карнеги) + отдельная пометка фильма;
//   phrase   — фраза рассыпается точками и собирается в предметную форму;
//   dotsQ    — большой знак вопроса из точек для пауз-вопросов.
import React from "react";
import { interpolate } from "remotion";
import { accentOf, C, DISPLAY, FONT } from "../theme";
import { Bubble, PhraseBurst } from "./bridge";
import { dotsOf, Swarm } from "./dots";
import { Card, Label, OL, Person, type FigMood, type FigPose, type Who } from "./draw";
import { Appear, area, at, Check, clamp01, Cross, Drift, ramp, Txt, type VisualProps } from "./kit";
import { SHAPES, type ShapeName } from "./shapes";
import { Setting, type SettingName } from "./settings";

// Ярлык «откуда это»: данные исследования, вывод автора и метафора фильма различаются.
export const SRC_KIND = {
  data: "данные исследования Коллинза",
  author: "вывод автора книги",
  interview: "из интервью в книге",
  history: "история из книги",
  quote: "цитата из книги",
  film: "метафора фильма",
} as const;
export type SrcKind = keyof typeof SRC_KIND;

export const SourceChip: React.FC<{ kind: SrcKind; x: number; y: number; opacity?: number }> = ({ kind, x, y, opacity = 1 }) => {
  const text = SRC_KIND[kind];
  const size = 28;
  const w = text.length * size * 0.58 + 90;
  const film = kind === "film";
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2} y={-26} width={w} height={48} rx={24} fill={film ? C.yellow : "rgba(255,255,255,0.92)"} stroke={OL} strokeWidth={3} />
      <circle cx={-w / 2 + 28} cy={-2} r={10} fill={film ? OL : C.teal} />
      <text x={18} y={8} fontFamily={FONT} fontWeight={800} fontSize={size} fill={OL} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

type Beat = { at: number; side: "a" | "b"; text?: string; mood?: FigMood; pose?: FigPose; until?: number };
type DuoP = {
  host?: string;
  a: Who;
  b: Who;
  aLabel?: string;
  bLabel?: string;
  setting?: SettingName;
  src?: SrcKind;
  beats?: Beat[];
  aMood?: FigMood;
  bMood?: FigMood;
  aPose?: FigPose;
  bPose?: FigPose;
  title?: string;
  shape?: ShapeName; // финальная форма из точек над героями
  shapeAt?: number;
  shapeText?: string;
  part?: string;
};

export const Duo: React.FC<VisualProps<DuoP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const span = Math.min(820, ar.x1 - ar.x0 - 260);
  const ax = cx - span / 2;
  const bx = cx + span / 2;
  const floor = 840;
  const beats = p.beats ?? [];
  // текущее состояние каждого героя — последняя наступившая реплика этой стороны
  const stateOf = (side: "a" | "b") => {
    let mood: FigMood = side === "a" ? p.aMood ?? "neutral" : p.bMood ?? "neutral";
    let pose: FigPose = side === "a" ? p.aPose ?? "stand" : p.bPose ?? "stand";
    for (const b of beats) if (b.side === side && t >= at(ctx, b.at)) {
      mood = b.mood ?? mood;
      pose = b.pose ?? pose;
    }
    return { mood, pose };
  };
  const A = stateOf("a");
  const B = stateOf("b");
  const accent = accentOf(p.part ?? "");
  return (
    <Drift t={t} dur={dur} cx={cx} cy={640} amount={0.03}>
      {p.setting && <Setting name={p.setting} cx={cx} floor={floor} w={span + 520} t={t} />}
      <Appear t={t} at={0.1} dy={40}>
        <Person who={p.a} x={ax} y={floor} s={0.82} mood={A.mood} pose={A.pose} t={t} seed={1} look={0.6} />
      </Appear>
      <Appear t={t} at={0.3} dy={40}>
        <Person who={p.b} x={bx} y={floor} s={0.82} mood={B.mood} pose={B.pose} t={t} seed={2} flip look={0.6} />
      </Appear>
      {p.aLabel && <Label x={ax} y={floor - 455} text={p.aLabel} size={26} />}
      {p.bLabel && <Label x={bx} y={floor - 455} text={p.bLabel} size={26} />}
      {beats.map((b, i) => {
        if (!b.text) return null;
        const a0 = at(ctx, b.at);
        const nextSame = beats.slice(i + 1).find((x) => x.side === b.side && x.text);
        const a1 = b.until !== undefined ? at(ctx, b.until) : nextSame ? at(ctx, nextSame.at) - 0.15 : dur + 1;
        const k = ramp(t, a0, 0.35) * (1 - ramp(t, a1, 0.3));
        if (k <= 0.01) return null;
        const x = b.side === "a" ? ax + 120 : bx - 120;
        return <Bubble key={i} x={x} y={floor - 580 - (b.text.split("\n").length - 1) * 22} text={b.text} size={36} tail={b.side === "a" ? -1 : 1} opacity={k} scale={0.92 + 0.08 * k} />;
      })}
      {p.shape && (
        <PhraseBurst t={t} at={at(ctx, p.shapeAt ?? 1)} appear={at(ctx, p.shapeAt ?? 1) - 0.01} text={p.shapeText ?? ""} bx={cx} by={600} shape={p.shape} sx={cx} sy={600} colors={[accent.color, C.yellow, "#fff", C.woodLight]} scale={0.45} />
      )}
      {p.title && (
        <Appear t={t} at={0} x={cx} y={150}>
          <Txt x={0} y={0} size={46} color={C.ink}>
            {p.title}
          </Txt>
        </Appear>
      )}
      {p.src && <SourceChip kind={p.src} x={cx} y={p.title ? 215 : 160} opacity={ramp(t, 0.2, 0.5)} />}
    </Drift>
  );
};

// ── сравнение ──
type CmpP = { host?: string; left: string[]; right: string[]; lTitle?: string; rTitle?: string; leftAt?: number; rightAt?: number; verdictAt?: number; title?: string; leftBad?: boolean; part?: string };
export const Compare: React.FC<VisualProps<CmpP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const w = Math.min(560, (ar.x1 - ar.x0 - 120) / 2);
  const lx = cx - w / 2 - 30;
  const rx = cx + w / 2 + 30;
  const la = at(ctx, p.leftAt ?? 0);
  const ra = at(ctx, p.rightAt ?? 1);
  const va = at(ctx, p.verdictAt ?? 1.6);
  const h = 120 + Math.max(p.left.length, p.right.length) * 70;
  const bad = p.leftBad !== false;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.025}>
      {p.title && (
        <Appear t={t} at={0} x={cx} y={190}>
          <Txt x={0} y={0} size={50} color={C.ink}>
            {p.title}
          </Txt>
        </Appear>
      )}
      <Appear t={t} at={la} x={lx} y={560}>
        <Card x={0} y={0} w={w} h={h} lines={p.left} size={40} title={p.lTitle} fill={C.paper} edge={bad ? C.red : C.green} />
      </Appear>
      <Appear t={t} at={ra} x={rx} y={560}>
        <Card x={0} y={0} w={w} h={h} lines={p.right} size={40} title={p.rTitle} fill={C.paper} edge={C.green} />
      </Appear>
      {bad && <Cross x={lx + w / 2 - 20} y={560 - h / 2 + 10} s={70} k={ramp(t, va, 0.6)} />}
      <Check x={rx + w / 2 - 30} y={560 - h / 2 + 10} s={56} k={ramp(t, va + 0.3, 0.6)} />
    </Drift>
  );
};

// ── правило главы: слова Карнеги отдельно от пометки фильма ──
type RuleP = { host?: string; ch: number | string; text: string; note?: string; noteAt?: number; part?: string };
export const Rule: React.FC<VisualProps<RuleP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const acc = accentOf(p.part ?? "");
  const w = Math.min(1080, ar.x1 - ar.x0 - 80);
  const words = p.text.split(" ");
  // перенос по ширине
  const size = 50;
  const per = Math.floor((w - 120) / (size * 0.55));
  const lines: string[] = [];
  let cur = "";
  for (const wd of words) {
    if ((cur + " " + wd).trim().length > per) {
      lines.push(cur.trim());
      cur = wd;
    } else cur += " " + wd;
  }
  if (cur.trim()) lines.push(cur.trim());
  const h = 150 + lines.length * size * 1.2;
  const k = ramp(t, at(ctx, 0) - 0.2, 0.7);
  const nk = p.note ? ramp(t, at(ctx, p.noteAt ?? 1), 0.6) : 0;
  const y0 = p.note ? 470 : 540;
  const noteText = p.note ? `Фильм уточняет: ${p.note}` : "";
  const nsize = Math.min(36, (w - 90) / (noteText.length * 0.58));
  const nw = noteText.length * nsize * 0.58 + 90;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      <g opacity={k} transform={`translate(${cx} ${y0 + (1 - k) * 30})`}>
        <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={30} fill="#000" opacity={0.18} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={C.paper} stroke={OL} strokeWidth={5} />
        <rect x={-w / 2} y={-h / 2} width={w} height={70} rx={30} fill={acc.color} stroke={OL} strokeWidth={5} />
        <rect x={-w / 2 + 3} y={-h / 2 + 40} width={w - 6} height={30} fill={acc.color} />
        <text x={0} y={-h / 2 + 48} fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
          {typeof p.ch === "number" ? `Коллинз · глава ${p.ch}` : p.ch}
        </text>
        <text x={0} y={-h / 2 + 140} fontFamily={FONT} fontWeight={900} fontSize={size} fill={C.ink} textAnchor="middle">
          {lines.map((l, i) => (
            <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.2}>
              {i === 0 ? "«" : ""}
              {l}
              {i === lines.length - 1 ? "»" : ""}
            </tspan>
          ))}
        </text>
      </g>
      {p.note && nk > 0 && (
        <g opacity={nk} transform={`translate(${cx} ${y0 + h / 2 + 110 + (1 - nk) * 24})`}>
          <rect x={-Math.min(w, nw) / 2} y={-50} width={Math.min(w, nw)} height={100} rx={50} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text x={0} y={12} fontFamily={FONT} fontWeight={900} fontSize={nsize} fill={OL} textAnchor="middle">
            {noteText}
          </text>
        </g>
      )}
    </Drift>
  );
};

// ── фраза → точки → форма (с подписью под формой) ──
type PhraseP = { host?: string; text: string; shape: ShapeName; label?: string; part?: string; burstAt?: number; labelAt?: number; scale?: number; colors?: string[]; second?: { text: string; shape: ShapeName; at: number; label?: string } };
export const Phrase: React.FC<VisualProps<PhraseP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const acc = accentOf(p.part ?? "");
  const colors = p.colors ?? [acc.color, acc.deep, C.yellow, "#ffffff"];
  const two = !!p.second;
  const x1 = two ? cx - 300 : cx;
  const x2 = cx + 300;
  const b1 = at(ctx, p.burstAt ?? 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <PhraseBurst t={t} at={b1} appear={at(ctx, 0) - 0.3} text={p.text} bx={x1} by={300} shape={p.shape} sx={x1} sy={560} colors={colors} scale={p.scale ?? (two ? 0.95 : 1.05)} step={13} r={5.6} />
      {p.label && (
        <Appear t={t} at={at(ctx, p.labelAt ?? 1)} x={x1} y={790}>
          <Label x={0} y={0} text={p.label} size={36} />
        </Appear>
      )}
      {p.second && (
        <>
          <PhraseBurst t={t} at={at(ctx, p.second.at)} appear={at(ctx, p.second.at) - 1.1} text={p.second.text} bx={x2} by={300} shape={p.second.shape} sx={x2} sy={560} colors={[C.green, "#9be7c4", C.yellow, "#ffffff"]} scale={p.scale ?? 0.85} step={13} r={5.6} />
          {p.second.label && (
            <Appear t={t} at={at(ctx, p.second.at) + 1.6} x={x2} y={790}>
              <Label x={0} y={0} text={p.second.label} size={36} />
            </Appear>
          )}
        </>
      )}
    </Drift>
  );
};

// ── большой вопрос из точек ──
export const DotsQ: React.FC<VisualProps<{ host?: string; part?: string; text?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const acc = accentOf(p.part ?? "");
  const pts = dotsOf(`q-${p.part}`, SHAPES.question, ar.cx, 470, [acc.color, acc.deep, C.yellow, "#fff"], 13, 300);
  const k = clamp01(interpolate(t, [0.2, 2.2], [0, 1]));
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.04}>
      <Swarm pts={pts} k={k} t={t} r={6} />
      {p.text && (
        <Appear t={t} at={at(ctx, 0.5)} x={ar.cx} y={150}>
          <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill={C.ink} textAnchor="middle" stroke="#fff" strokeWidth={8} paintOrder="stroke">
            {p.text}
          </text>
        </Appear>
      )}
    </Drift>
  );
};
