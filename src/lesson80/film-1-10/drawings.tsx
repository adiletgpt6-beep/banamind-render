// Детские карточки фильма 80-1-10 (SVG): бумага, рисунок, который
// проявляется штрих за штрихом вслед за карандашом, бумажная лодочка и
// подпись «Лодочку сложил Амир» на карточке Амира, чистая оборотная сторона
// и прежний рисунок Земли из 80-1-7. Все компоненты возвращают <g> в своих
// единицах (карточка 300 × 202, прежний лист 300 × 220); id для clipPath и
// pattern строятся только из uid — на кадре одновременно много карточек.
import React from "react";
import { fontFamily } from "../../fonts";
import type { DrawingKind } from "./roster";
import {
  BOAT_BLUE,
  BOAT_PLAN,
  CAPTION_FONT,
  CAPTION_LAYOUT,
  CARD_H,
  CARD_W,
  DRAWING_FRAMES,
  DRAWING_GRAIN,
  DRAWING_PLANS,
  OLD_EARTH_STROKES,
  OLD_EARTH_UNITS,
  captionGlyphReveal,
  drawnLengths,
  type DrawPlan,
  type Stroke,
} from "./drawingPaths";

const PAPER = "#FFFDF6";
const EDGE = "#D8D0BE";

// ---------- Зерно бумаги (общий узор, без фильтров) ----------
// Тёмные волоски — фактура бумаги; светлые крапинки поверх рисунка — бумага,
// проглядывающая сквозь мелок. Один path на каждый слой.
const GRAIN_W = 67;
const GRAIN_H = 53;
const grainPaths = (() => {
  let a = 0x51ed27;
  const rn = () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return a / 4294967296;
  };
  const f = (v: number) => Math.round(v * 10) / 10;
  let dark = "";
  for (let i = 0; i < 40; i++) {
    const x = rn() * GRAIN_W;
    const y = rn() * GRAIN_H;
    const ang = rn() * Math.PI;
    const l = 0.5 + rn() * 1.6;
    dark += `M${f(x)} ${f(y)}l${f(Math.cos(ang) * l)} ${f(Math.sin(ang) * l)}`;
  }
  let light = "";
  for (let i = 0; i < 170; i++) {
    const x = rn() * GRAIN_W;
    const y = rn() * GRAIN_H;
    const ang = (rn() - 0.5) * 0.7 - 0.45;
    const l = 0.15 + rn() * 1.1;
    light += `M${f(x)} ${f(y)}l${f(Math.cos(ang) * l)} ${f(Math.sin(ang) * l)}`;
  }
  return { dark, light };
})();

const GrainPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} x={0} y={0} width={GRAIN_W} height={GRAIN_H} patternUnits="userSpaceOnUse">
    <path d={grainPaths.dark} stroke="#B3A88F" strokeWidth={0.45} strokeLinecap="round" fill="none" opacity={0.16} />
    <path d={grainPaths.light} stroke={PAPER} strokeWidth={0.8} strokeLinecap="round" fill="none" opacity={0.5} />
  </pattern>
);

// Лист карточки: бумага → содержимое → зерно поверх → тонкий край.
const CardPaper: React.FC<{ uid: string; grain?: number; children?: React.ReactNode }> = ({ uid, grain = 1, children }) => (
  <>
    <defs>
      <GrainPattern id={`${uid}-grain`} />
    </defs>
    <rect x={0} y={0} width={CARD_W} height={CARD_H} rx={5} fill={PAPER} />
    {children}
    <rect x={0} y={0} width={CARD_W} height={CARD_H} rx={5} fill={`url(#${uid}-grain)`} opacity={grain < 1 ? grain : undefined} />
    <rect x={0.5} y={0.5} width={CARD_W - 1} height={CARD_H - 1} rx={5} fill="none" stroke={EDGE} strokeWidth={1.6} />
  </>
);

// ---------- Штрихи ----------
// Отсечения рисунка: одинаковые области — один clipPath (clip — где штрих
// виден, cut — второе отсечение: кольцо вокруг листа с «дырами»).
// Порядок вывода: заливки мелком ниже, контуры поверх (проявление — по плану).
type ClipIndex = { list: string[]; clip: number[]; cut: number[]; order: number[] };
const clipIndexCache = new WeakMap<readonly Stroke[], ClipIndex>();
const clipIndex = (strokes: readonly Stroke[]): ClipIndex => {
  const hit = clipIndexCache.get(strokes);
  if (hit) return hit;
  const list: string[] = [];
  const at = (d?: string) => {
    if (!d) return -1;
    let i = list.indexOf(d);
    if (i < 0) {
      list.push(d);
      i = list.length - 1;
    }
    return i;
  };
  const clip = strokes.map((s) => at(s.clip));
  const cut = strokes.map((s) => at(s.cut));
  const order = strokes.map((_, i) => i).sort((x, y) => Number(strokes[y].fill) - Number(strokes[x].fill) || x - y);
  const v = { list, clip, cut, order };
  clipIndexCache.set(strokes, v);
  return v;
};

const StrokePath: React.FC<{ s: Stroke; done: number; clipId?: string; cutId?: string }> = ({ s, done, clipId, cutId }) => {
  const full = done >= s.len - 0.01;
  const common = {
    d: s.d,
    fill: "none",
    stroke: s.color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: full ? undefined : s.len,
    strokeDasharray: full ? undefined : `${done} ${s.len + 10}`,
    clipPath: clipId ? `url(#${clipId})` : undefined,
  };
  const body = (
    <>
      {s.under ? <path {...common} strokeWidth={s.under} strokeOpacity={0.24} /> : null}
      <path {...common} strokeWidth={s.w} strokeOpacity={s.o} />
    </>
  );
  return cutId ? <g clipPath={`url(#${cutId})`}>{body}</g> : body;
};

// Рисунок по плану (кривые проявляются по доле progress); frame — общая
// рамка-отсечение рисунка «во весь лист».
const PlanDrawing: React.FC<{ plan: DrawPlan; progress: number; uid: string; tag: string; frame?: string }> = ({ plan, progress, uid, tag, frame }) => {
  const done = drawnLengths(plan, progress);
  const { list, clip, cut, order } = clipIndex(plan.strokes);
  const used = new Set<number>();
  plan.strokes.forEach((_, i) => {
    if (done[i] > 0.05) {
      if (clip[i] >= 0) used.add(clip[i]);
      if (cut[i] >= 0) used.add(cut[i]);
    }
  });
  const id = (ci: number) => (ci >= 0 ? `${uid}-${tag}${ci}` : undefined);
  const strokes = order.map((i) => (done[i] > 0.05 ? <StrokePath key={i} s={plan.strokes[i]} done={done[i]} clipId={id(clip[i])} cutId={id(cut[i])} /> : null));
  return (
    <>
      {used.size > 0 || frame ? (
        <defs>
          {[...used].map((ci) => (
            <clipPath key={ci} id={id(ci)}>
              <path d={list[ci]} clipRule="evenodd" />
            </clipPath>
          ))}
          {frame ? (
            <clipPath id={`${uid}-${tag}f`}>
              <path d={frame} />
            </clipPath>
          ) : null}
        </defs>
      ) : null}
      {frame ? <g clipPath={`url(#${uid}-${tag}f)`}>{strokes}</g> : strokes}
    </>
  );
};

// ---------- Подпись «Лодочку сложил Амир» ----------
// Буквы появляются по одной слева направо вслед за карандашом (captionTip).
const Caption: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  const k = captionGlyphReveal(progress);
  return (
    <text fontFamily={fontFamily} fontWeight={600} fontSize={CAPTION_FONT} fill={BOAT_BLUE} style={{ fontKerning: "none" }}>
      {CAPTION_LAYOUT.map((g, i) =>
        g.ch !== " " && k[i] > 0.01 ? (
          <tspan key={i} x={g.x.toFixed(2)} y={g.y.toFixed(2)} rotate={g.rot.toFixed(1)} fillOpacity={(0.9 * k[i]).toFixed(3)}>
            {g.ch}
          </tspan>
        ) : null,
      )}
    </text>
  );
};

// ---------- Публичные компоненты ----------
// Лицевая сторона карточки (единицы 300 × 202). progress — доля рисунка;
// для дерева Амира boat — доля лодочки, caption — доля подписи.
export const CardFace: React.FC<{ kind: DrawingKind; progress?: number; boat?: number; caption?: number; uid: string }> = ({ kind, progress = 1, boat = 0, caption = 0, uid }) => (
  <g>
    <CardPaper uid={uid} grain={DRAWING_GRAIN[kind]}>
      <PlanDrawing plan={DRAWING_PLANS[kind]} progress={progress} uid={uid} tag="c" frame={DRAWING_FRAMES[kind]} />
      {kind === "tree" && boat > 0 ? <PlanDrawing plan={BOAT_PLAN} progress={boat} uid={uid} tag="b" /> : null}
      {kind === "tree" ? <Caption progress={caption} /> : null}
    </CardPaper>
  </g>
);

// Оборотная сторона: чистая бумага с лёгким зерном.
export const CardBack: React.FC<{ uid: string }> = ({ uid }) => (
  <g>
    <CardPaper uid={uid} />
  </g>
);

// Прежний (законченный) рисунок Земли из 80-1-7, единицы листа 300 × 220.
export const OldEarthSheet: React.FC<{ uid: string }> = ({ uid }) => (
  <g data-sheet={uid}>
    <rect x={0} y={0} width={OLD_EARTH_UNITS.w} height={OLD_EARTH_UNITS.h} rx={4} fill="#FBF8F1" stroke="#D9D2C4" strokeWidth={2} />
    {OLD_EARTH_STROKES.map((s) => (
      <path key={s.id} d={s.d} fill={s.fill ?? "none"} fillOpacity={0.8} stroke={s.color} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </g>
);

export { CARD_W, CARD_H };
