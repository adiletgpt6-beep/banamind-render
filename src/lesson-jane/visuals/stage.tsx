// «Постановка»: сцена романа из данных сценария — декорация места, герои с
// позами и эмоциями (меняются по репликам ведущего), пузыри реплик, карточки
// цитат, ярлыки, ценники «цена выбора», огонёк голоса Джейн, стрелки, путь
// точек и точечные образы. Время любого элемента — номер реплики сцены
// (целое) или реплика + доля её речи (2.5), см. at() в kit.tsx.
import React from "react";
import { C } from "../theme";
import { Label, OL, Person, type FigMood, type FigPose, type Who } from "./draw";
import { Appear, Arrow, at, clamp01, Cross, ease, ramp, type VisualProps } from "./kit";
import { Particles } from "./particles";
import { Bubble, PriceTag, QuoteBox } from "./scenery";
import { SETS } from "./sets";
import { DotPath, Sparks, VoiceFlame } from "./voice";

type Beat = number;
type CastItem = {
  who: Who; x: number; y?: number; s?: number; mood?: FigMood; pose?: FigPose; flip?: boolean; look?: number;
  at?: Beat; out?: Beat; moods?: [Beat, FigMood, FigPose?][]; move?: [Beat, number, number?]; hold?: "letter" | "book" | "fan";
};
type BubbleItem = { text: string; x: number; y: number; at: Beat; out?: Beat; tail?: "left" | "right" | "down" | "none"; size?: number; serif?: boolean; bg?: string; max?: number };
type LabelItem = { text: string; x: number; y: number; at: Beat; out?: Beat; bg?: string; rot?: number; size?: number; color?: string };
type QuoteItem = { who: string; text: string; ref?: string; x: number; y: number; w?: number; at: Beat; out?: Beat; color?: string; size?: number };
type TagItem = { title: string; text: string; x: number; y: number; at: Beat; color?: string; rot?: number };
type ArrowItem = { x1: number; y1: number; x2: number; y2: number; at: Beat; color?: string; bend?: number; w?: number };
type FlameItem = { x: number; y: number; at?: Beat; s?: number; size?: [Beat, number][]; dim?: [Beat, number][] };
type PartItem = { shape: string; x: number; y: number; s?: number; at: Beat; morphTo?: string; morphAt?: Beat; breakAt?: Beat; mono?: string; r?: number; step?: number };
type PathItem = { pts: [number, number][]; at: Beat; dur?: number; color?: string };

export type StageP = {
  set: string; setP?: Record<string, unknown>;
  // числовые параметры декорации по времени: ключ → [включить, выключить?] (реплики)
  setK?: Record<string, [Beat, Beat?]>;
  props?: { kind: "stool"; x: number; y: number }[];
  storm?: Beat; // гроза: небо темнеет мягко, молния раскалывает каштан
  cast?: CastItem[]; bubbles?: BubbleItem[]; labels?: LabelItem[]; quotes?: QuoteItem[]; tags?: TagItem[];
  arrows?: ArrowItem[]; crosses?: { x: number; y: number; at: Beat; s?: number }[]; flame?: FlameItem;
  sparks?: { x: number; y: number; at: Beat }[]; dots?: PartItem[]; path?: PathItem;
  cam?: { x?: number; y?: number; zoom?: number; at?: Beat; to?: number }; wash?: string; host?: string;
};

// значение по ключевым точкам [beat, value] (плавно, 0.6 с)
const keyed = (ctx: VisualProps, keys: [Beat, number][] | undefined, def: number) => {
  if (!keys?.length) return def;
  let v = def;
  for (const [b, val] of keys) {
    const k = ramp(ctx.t, at(ctx, b), 0.6);
    v = v + (val - v) * k;
  }
  return v;
};

const vis = (ctx: VisualProps, a: Beat | undefined, o: Beat | undefined) => {
  const inK = a === undefined ? 1 : ramp(ctx.t, at(ctx, a), 0.45);
  const outK = o === undefined ? 1 : 1 - ramp(ctx.t, at(ctx, o), 0.35);
  return Math.min(inK, outK);
};

export const Stage: React.FC<VisualProps<StageP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Set = SETS[p.set];
  if (!Set) throw new Error(`Нет декорации ${p.set}`);
  // медленная камера: наезд к точке внимания
  const cam = p.cam ?? {};
  const camK = cam.at === undefined ? clamp01(t / Math.max(1, dur)) : ease(clamp01((t - at(ctx, cam.at)) / Math.max(0.5, (cam.to !== undefined ? at(ctx, cam.to) : dur) - at(ctx, cam.at))));
  const z = 1 + ((cam.zoom ?? 1.06) - 1) * camK;
  const cx = cam.x ?? 960;
  const cy = cam.y ?? 540;
  const setP: Record<string, unknown> = { ...(p.setP ?? {}) };
  for (const [key, [on, off]] of Object.entries(p.setK ?? {})) setP[key] = Math.min(ramp(t, at(ctx, on), 0.6), off === undefined ? 1 : 1 - ramp(t, at(ctx, off), 0.8));
  if (p.storm !== undefined) {
    setP.storm = t >= at(ctx, p.storm);
    setP.split = ramp(t, at(ctx, p.storm) + 0.6, 1.4);
  }
  return (
    <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`}>
      <Set t={t} p={setP} />
      {p.wash && <rect x={0} y={0} width={1920} height={1080} fill={p.wash} opacity={0.18} />}
      {p.path && (
        <DotPath pts={p.path.pts} k={ease(clamp01((t - at(ctx, p.path.at)) / (p.path.dur ?? 2.4)))} n={46} r={11} t={t} color={p.path.color ?? C.gold} />
      )}
      {p.dots?.map((d, i) => (
        <Particles key={i} shape={d.shape} t={t} at={at(ctx, d.at)} x={d.x} y={d.y} s={d.s ?? 0.6} r={d.r ?? 6} step={d.step ?? 15} morphTo={d.morphTo} morphAt={d.morphAt !== undefined ? at(ctx, d.morphAt) : undefined} breakAt={d.breakAt !== undefined ? at(ctx, d.breakAt) : undefined} mono={d.mono} spread={700} />
      ))}
      {p.props?.map((pr, i) => (
        <g key={i} transform={`translate(${pr.x} ${pr.y})`}>
          <rect x={-90} y={-118} width={180} height={22} rx={8} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
          <path d="M -70 -96 L -80 0 M 70 -96 L 80 0 M -60 -40 L 60 -40" stroke={OL} strokeWidth={10} strokeLinecap="round" />
        </g>
      ))}
      {p.cast?.map((c, i) => {
        const op = vis(ctx, c.at, c.out);
        if (op <= 0.01) return null;
        let mood = c.mood ?? "neutral";
        let pose = c.pose ?? "stand";
        for (const [b, m, ps] of c.moods ?? []) {
          if (t >= at(ctx, b)) {
            mood = m;
            if (ps) pose = ps;
          }
        }
        let x = c.x;
        let y = c.y ?? 900;
        let moving = false;
        if (c.move) {
          const a = at(ctx, c.move[0]);
          const k = ease(clamp01((t - a) / 1.6));
          moving = k > 0 && k < 1;
          x = c.x + (c.move[1] - c.x) * k;
          if (c.move[2] !== undefined) y = y + (c.move[2] - y) * k;
        }
        const rise = (1 - op) * 30;
        return <Person key={i} who={c.who} x={x} y={y + rise} s={c.s ?? 1} mood={mood} pose={moving ? "walk" : pose} t={t} flip={c.flip} look={c.look ?? 0} opacity={op} seed={i * 3} hold={c.hold} />;
      })}
      {p.flame && (
        <VoiceFlame x={p.flame.x} y={p.flame.y} t={t} s={(p.flame.s ?? 0.7) * ramp(t, at(ctx, p.flame.at ?? 0), 0.6)} size={keyed(ctx, p.flame.size, 1)} dim={keyed(ctx, p.flame.dim, 0)} />
      )}
      {p.sparks?.map((s, i) => <Sparks key={i} x={s.x} y={s.y} t={t} at={at(ctx, s.at)} />)}
      {p.arrows?.map((a, i) => <Arrow key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} k={ramp(t, at(ctx, a.at), 0.7)} color={a.color ?? C.inkSoft} bend={a.bend ?? 0.15} w={a.w ?? 9} />)}
      {p.quotes?.map((q, i) => {
        const k = vis(ctx, q.at, q.out);
        if (k <= 0.01) return null;
        return (
          <g key={i} transform={`translate(0 ${(1 - k) * 24})`}>
            <QuoteBox x={q.x} y={q.y} w={q.w ?? 760} who={q.who} text={q.text} refText={q.ref} color={q.color} size={q.size ?? 38} k={k} />
          </g>
        );
      })}
      {p.bubbles?.map((b, i) => (
        <Bubble key={i} x={b.x} y={b.y} text={b.text} size={b.size ?? 36} tail={b.tail ?? "down"} serif={b.serif} bg={b.bg} k={vis(ctx, b.at, b.out)} maxChars={b.max ?? 26} />
      ))}
      {p.crosses?.map((c, i) => <Cross key={i} x={c.x} y={c.y} s={c.s ?? 120} k={ramp(t, at(ctx, c.at), 0.5)} />)}
      {p.labels?.map((l, i) => {
        const k = vis(ctx, l.at, l.out);
        if (k <= 0.01) return null;
        return (
          <Appear key={i} t={t} at={at(ctx, l.at)}>
            <Label x={l.x} y={l.y} text={l.text} bg={l.bg ?? C.cream} rot={l.rot ?? 0} size={l.size ?? 32} color={l.color} opacity={k} />
          </Appear>
        );
      })}
      {p.tags?.map((g, i) => <PriceTag key={i} x={g.x} y={g.y} title={g.title} text={g.text} color={g.color} k={ramp(t, at(ctx, g.at), 0.5)} rot={g.rot} />)}
    </g>
  );
};
