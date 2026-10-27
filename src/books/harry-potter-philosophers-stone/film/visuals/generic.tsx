// Универсальные сцены BM-031:
//   compare  — два столбца с зачёркиванием и галочкой (или без вердикта);
//   phrase   — фраза рассыпается точками и собирается в предметную форму;
//   dotsQ    — большой знак вопроса из точек для пауз-вопросов.
import React from "react";
import { interpolate } from "remotion";
import { accentOf, C, DISPLAY } from "../theme";
import { PhraseBurst } from "./bridge";
import { dotsOf, Swarm } from "./dots";
import { Card, Label, OL } from "./draw";
import { Appear, area, at, Check, clamp01, Cross, Drift, ramp, Txt, type VisualProps } from "./kit";
import { SHAPES, type ShapeName } from "./shapes";

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
          <Txt x={0} y={0} size={50} color="#fff">
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
          <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
            {p.text}
          </text>
        </Appear>
      )}
    </Drift>
  );
};
