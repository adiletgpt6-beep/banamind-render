// Общие сцены BM-040 (из BM-027): карточка проверенной цитаты, карточка вопроса, точечный
// образ, сравнение «что говорит источник / другая сторона», «чего книга не
// утверждает», список-ступени, финал. Тексты приходят из сценария (p), сами сцены — общие.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { Appear, area, at, Check, Cross, Drift, Panel, pop, ramp, Txt, type VisualProps } from "./kit";
import { Particles } from "./particles";
import { Label, OL, QuoteCard } from "./props";
import { clamp01 } from "./kit";

type P = { mode?: string; host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);

// ── Карточка цитаты без конверта (продолжение письма) ──
export const Quote: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const lines = A(p.quote);
  const size = lines.some((l) => l.length > 38) ? 40 : 46;
  const w = Math.min(1180, Ar.x1 - Ar.x0 - 40);
  const qAt = at(ctx, N(p.beat, 0));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={Math.max(0.1, qAt - 0.2)} x={Ar.cx} y={150}>
        <Label x={0} y={0} text={S(p.num, "")} size={34} bg={C.amberSoft} serif />
      </Appear>
      <QuoteCard x={Ar.cx} y={470} w={w} lines={lines} refText={S(p.ref)} k={ramp(t, qAt, 0.6)} size={size} color={p.color === "teal" ? C.teal : C.amber} />
      {S(p.note) && (
        <Appear t={t} at={at(ctx, N(p.noteBeat, 1))} x={Ar.cx} y={470 + (lines.length * size * 1.3 + 150) / 2 + 60}>
          <Label x={0} y={0} text={S(p.note)} size={32} bg={C.tealSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Большой вопрос (карточка-вопрос, не таймер) ──
export const BigQuestion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const lines = A(p.lines);
  const qa = at(ctx, N(p.beat, 0));
  const pre = A(p.pre);
  const preOut = 1 - ramp(t, qa - 0.5, 0.5);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx}>
      {/* до карточки вопроса — короткие ярлыки первой реплики, чтобы кадр не пустовал */}
      {preOut > 0 &&
        pre.map((l, i) => (
          <g key={i} opacity={preOut}>
            <Appear t={t} at={0.3 + i * 0.45} x={Ar.cx + (i - (pre.length - 1) / 2) * 460} y={440 + (i % 2) * 60}>
              <Label x={0} y={0} text={l} size={44} bg={i === pre.length - 1 ? C.tealSoft : C.white} />
            </Appear>
            {i === 0 && p.strike === true && pre.length > 1 && ramp(t, at(ctx, 0.4), 0.5) > 0 && (
              <line x1={Ar.cx - (pre.length - 1) * 230 - l.length * 13} y1={440} x2={Ar.cx - (pre.length - 1) * 230 - l.length * 13 + l.length * 26 * ramp(t, at(ctx, 0.4), 0.5)} y2={440} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
            )}
          </g>
        ))}
      <Appear t={t} at={qa} x={Ar.cx} y={420}>
        <Panel x={-520} y={-200} w={1040} h={lines.length * 74 + 150} fill={C.white} />
        {lines.map((l, i) => (
          <Txt key={i} x={0} y={-110 + i * 74} size={56} weight={900} color={i === lines.length - 1 ? C.tealDeep : C.ink}>
            {l}
          </Txt>
        ))}
        <g transform={`translate(${470} ${-190}) scale(${pop(t, qa + 0.8)})`}>
          <circle r={50} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <text y={24} fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={C.ink} textAnchor="middle">
            ?
          </text>
        </g>
      </Appear>
      {S(p.sub) && (
        <Appear t={t} at={at(ctx, N(p.subBeat, 1))} x={Ar.cx} y={420 + lines.length * 74 + 30}>
          <Label x={0} y={0} text={S(p.sub)} size={34} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Точечный образ: силуэт собирается из точек и может перестроиться ──
// p.shape, p.morphTo, p.morphBeat, p.breakBeat, p.labels [[text, beat, dx, dy]]
export const DotImage: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const x = Ar.cx + N(p.dx, 0);
  const morphAt = p.morphTo ? at(ctx, N(p.morphBeat, 1)) : undefined;
  const breakAt = p.breakBeat !== undefined ? at(ctx, N(p.breakBeat, 2)) : undefined;
  const labels = (Array.isArray(p.labels) ? p.labels : []) as [string, number, number, number, string?][];
  return (
    <Drift t={t} dur={dur} cx={x} amount={0.04}>
      <Particles shape={S(p.shape, "question")} t={t} at={0.2} dur={2.2} x={x} y={N(p.y, 470)} s={N(p.s, 0.95)} r={N(p.r, 5.4)} step={N(p.step, 14)} morphTo={S(p.morphTo) || undefined} morphAt={morphAt} breakAt={breakAt} spread={900} />
      {S(p.title) && (
        <Appear t={t} at={0.6} x={x} y={130}>
          <Label x={0} y={0} text={S(p.title)} size={40} bg={C.white} />
        </Appear>
      )}
      {labels.map(([text, beat, dx, dy, bg], i) => (
        <Appear key={i} t={t} at={at(ctx, beat)} x={Math.max(Ar.x0 + text.length * 9.5 + 30, Math.min(Ar.x1 - text.length * 9.5 - 30, x + dx))} y={N(p.y, 470) + dy}>
          <Label x={0} y={0} text={text} size={34} bg={bg === "teal" ? C.tealSoft : bg === "coral" ? C.coralSoft : bg === "amber" ? C.amberSoft : C.white} />
        </Appear>
      ))}
    </Drift>
  );
};

// ── Сравнение: «что говорит источник» | «другая сторона / наш пример» ──
export const Compare: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const w = (Ar.x1 - Ar.x0 - 80) / 2;
  const L = A(p.left);
  const R = A(p.right);
  const b1 = at(ctx, N(p.rightBeat, 1));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {[
        { x: Ar.x0 + 20, title: S(p.leftTitle, "Что говорит источник"), items: L, col: C.amber, k: ramp(t, 0.2, 0.6), at0: 0.6 },
        { x: Ar.x0 + 60 + w, title: S(p.rightTitle, "Пример фильма"), items: R, col: C.teal, k: ramp(t, b1, 0.6), at0: b1 + 0.4 },
      ].map((c, ci) => (
        <g key={ci} opacity={c.k} transform={`translate(0 ${(1 - c.k) * 30})`}>
          <Panel x={c.x} y={150} w={w} h={Math.max(400, 170 + Math.max(L.length, R.length) * 120)} fill={C.white} />
          <rect x={c.x} y={150} width={w} height={86} rx={36} fill={c.col} />
          <rect x={c.x} y={200} width={w} height={36} fill={c.col} />
          <Txt x={c.x + w / 2} y={208} size={40} color={C.white} weight={900}>
            {c.title}
          </Txt>
          {c.items.map((it, i) => (
            <Appear key={i} t={t} at={c.at0 + i * 0.7} x={c.x + 40} y={300 + i * 120}>
              <circle cx={10} cy={-12} r={12} fill={c.col} />
              <Txt x={40} y={0} size={Math.min(w > 640 ? 34 : 30, Math.floor((w - 90) / (Math.max(...c.items.map((s) => s.length), 1) * 0.55)))} anchor="start" weight={800}>
                {it}
              </Txt>
            </Appear>
          ))}
        </g>
      ))}
    </Drift>
  );
};

// ── Границы: чего аргумент НЕ утверждает (зачёркнутые ярлыки) и что утверждает ──
export const Limits: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const no = A(p.no);
  const yes = S(p.yes);
  const b1 = at(ctx, N(p.yesBeat, 1));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      <Appear t={t} at={0.2} x={Ar.cx} y={150}>
        <Label x={0} y={0} text={S(p.title, "Чего здесь нет")} size={42} bg={C.white} />
      </Appear>
      {no.map((n, i) => {
        const a = 0.6 + i * 0.6;
        const y = 290 + i * 120;
        return (
          <g key={i}>
            <Appear t={t} at={a} x={Ar.cx} y={y}>
              <Label x={0} y={0} text={n} size={36} bg={C.coralSoft} />
            </Appear>
            {ramp(t, a + 0.5, 0.5) > 0 && <line x1={Ar.cx - n.length * 11 - 30} y1={y} x2={Ar.cx - n.length * 11 - 30 + (n.length * 22 + 60) * ramp(t, a + 0.5, 0.5)} y2={y} stroke={C.red} strokeWidth={7} strokeLinecap="round" />}
          </g>
        );
      })}
      {yes && (
        <Appear t={t} at={b1} x={Ar.cx} y={290 + no.length * 120 + 40}>
          <Label x={0} y={0} text={yes} size={40} bg={C.tealSoft} color={C.tealDeep} />
          <Check x={-yes.length * 12 - 60} y={-4} s={40} k={ramp(t, b1 + 0.4, 0.5)} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Список/ступени: пункты появляются по репликам, с галочкой/вопросом ──
export const Steps: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = A(p.items);
  const beats = (Array.isArray(p.beats) ? p.beats : items.map((_, i) => i)) as number[];
  const marks = A(p.marks);
  const w = Math.min(1100, Ar.x1 - Ar.x0 - 60);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {S(p.title) && (
        <Appear t={t} at={0.15} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.title)} size={42} bg={C.yellow} />
        </Appear>
      )}
      {items.map((it, i) => {
        const a = at(ctx, beats[i] ?? i) + 0.2;
        const y = 280 + i * 128;
        const mk = marks[i];
        return (
          <Appear key={i} t={t} at={a} x={Ar.cx - w / 2} y={y}>
            <Panel x={0} y={-52} w={w} h={100} r={26} fill={C.white} />
            <circle cx={60} cy={-2} r={32} fill={mk === "q" ? C.amber : mk === "x" ? C.coral : C.teal} stroke={OL} strokeWidth={3} />
            <text x={60} y={12} fontFamily={HEAVY} fontWeight={900} fontSize={38} fill={C.white} textAnchor="middle">
              {mk === "q" ? "?" : mk === "x" ? "×" : mk === "ok" ? "✓" : String(i + 1)}
            </text>
            <Txt x={115} y={10} size={36} anchor="start" weight={800}>
              {it}
            </Txt>
          </Appear>
        );
      })}
    </Drift>
  );
};

// ── Финал: три вопроса, ворота мастерской, бренд ──
export const Finale: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "end";
  if (mode === "questions") {
    const qs = A(p.items);
    return (
      <Drift t={t} dur={dur} cx={Ar.cx} amount={0.02}>
        {qs.map((q, i) => (
          <Appear key={i} t={t} at={at(ctx, i) + 0.2} x={Ar.cx} y={250 + i * 200}>
            <Panel x={-560} y={-75} w={1120} h={150} r={34} fill={C.white} />
            <circle cx={-470} cy={0} r={46} fill={[C.amber, C.teal, C.coral][i % 3]} stroke={OL} strokeWidth={4} />
            <text x={-470} y={18} fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={C.white} textAnchor="middle">
              {i + 1}
            </text>
            <Txt x={-390} y={14} size={38} anchor="start" weight={900}>
              {q}
            </Txt>
          </Appear>
        ))}
      </Drift>
    );
  }
  const k = ramp(t, 0.3, 1);
  return (
    <Drift t={t} dur={dur} cx={960} amount={0.02}>
      <g opacity={k} transform={`translate(960 ${430 + (1 - k) * 30})`}>
        <Particles shape="gate" t={t} at={0.2} dur={2.4} x={0} y={0} s={0.62} r={5} step={14} spread={700} />
      </g>
      <Appear t={t} at={1.8} x={960} y={790}>
        <text fontFamily={HEAVY} fontWeight={900} fontSize={84} fill={C.ink} textAnchor="middle">
          {BRAND.name}
        </text>
        <Txt x={0} y={64} size={34} color={C.inkSoft} weight={800}>
          {BRAND.slogan}
        </Txt>
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={0.9} x={960} y={110}>
          <Label x={0} y={0} text={S(p.caption)} size={40} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

export { clamp01, Cross, FONT, SERIF };
