// Один постоянный лист 80-1-14 (320 × 226 ед. листа) с семью местами для
// рисунков Билала и полосой для заголовка. Рисунки — быстрые штрихи
// цветными карандашами: контур, затем короткая штриховка. Каждый рисунок —
// один пример; восьмого значка нет. Незаполненное место (270, 168) остаётся
// пустым — на него смотрит Юсуф в сцене 4.
import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import type { PencilId } from "./Props";
import { PENCILS } from "./Props";

export const SHEET = { w: 320, h: 226 } as const;

export type IconId = "water" | "food" | "care" | "tree" | "air" | "study" | "help";

type Stroke = { d: string; w?: number; hatch?: boolean };
export type IconDef = { id: IconId; cx: number; cy: number; pencil: PencilId; strokes: Stroke[] };

const T = (cx: number, cy: number, d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, a, b) => `${(Number(a) + cx).toFixed(1)},${(Number(b) + cy).toFixed(1)}`);

const icon = (id: IconId, cx: number, cy: number, pencil: PencilId, strokes: Stroke[]): IconDef => ({
  id,
  cx,
  cy,
  pencil,
  strokes: strokes.map((s) => ({ ...s, d: T(cx, cy, s.d) })),
});

// Порядок — порядок предложений героев.
export const ICONS: readonly IconDef[] = [
  icon("water", 45, 92, "blue", [
    { d: "M 0,-26 C 6,-14 19,-3 19,10 C 19,22 10,28 0,28 C -10,28 -19,22 -19,10 C -19,-3 -6,-14 0,-26" },
    { d: "M -9,6 L -3,0 M -11,14 L 1,2 M -8,20 L 6,6 M -2,23 L 11,10 M 5,24 L 13,16", w: 1.4, hatch: true },
    { d: "M 9,4 Q 12,10 10,16", w: 1.6 },
  ]),
  icon("food", 120, 92, "red", [
    { d: "M 0,-12 C -8,-20 -24,-16 -23,1 C -22,18 -9,27 0,21 C 9,27 22,18 23,1 C 24,-16 8,-20 0,-12" },
    { d: "M 0,-12 Q 1,-20 5,-25" },
    { d: "M 4,-21 Q 13,-29 19,-22 Q 11,-16 4,-21" },
    { d: "M -16,-2 L -8,-8 M -17,7 L -4,-4 M -14,14 L 2,1 M -8,18 L 9,4 M 0,19 L 15,7", w: 1.4, hatch: true },
  ]),
  icon("care", 195, 92, "orange", [
    // взрослый слева, ребёнок справа; рука взрослого на плече ребёнка
    { d: "M -12,-24 C -18,-24 -18,-14 -12,-14 C -6,-14 -6,-24 -12,-24" },
    { d: "M -12,-14 L -12,8 M -12,8 L -18,26 M -12,8 L -6,26" },
    { d: "M -12,-8 L -20,4 M -12,-8 Q -2,-8 9,-3" },
    { d: "M 13,-10 C 8,-10 8,-2 13,-2 C 18,-2 18,-10 13,-10" },
    { d: "M 13,-2 L 13,13 M 13,13 L 9,26 M 13,13 L 17,26 M 13,3 L 20,11" },
  ]),
  icon("tree", 270, 92, "green", [
    { d: "M -4,26 L -3,4 M 4,26 L 3,4 M -4,26 L 4,26" },
    { d: "M -3,4 C -18,6 -24,-6 -16,-13 C -18,-24 -6,-29 0,-23 C 6,-29 18,-24 16,-13 C 24,-6 18,6 3,4" },
    { d: "M -14,-8 L -6,-16 M -12,0 L 2,-14 M -4,0 L 10,-14 M 4,0 L 14,-9", w: 1.4, hatch: true },
  ]),
  icon("air", 45, 168, "blue", [
    { d: "M -24,-12 C -16,-18 -8,-6 0,-12 C 8,-18 14,-8 22,-13 C 27,-16 26,-22 21,-21" },
    { d: "M -26,0 C -18,-6 -10,6 -2,0 C 6,-6 12,4 20,-1" },
    { d: "M -22,12 C -14,6 -6,18 2,12 C 10,6 16,16 24,11 C 29,8 27,2 22,4" },
  ]),
  icon("study", 120, 168, "brown", [
    { d: "M 0,-9 Q -12,-16 -26,-12 L -26,15 Q -12,11 0,17 Q 12,11 26,15 L 26,-12 Q 12,-16 0,-9 L 0,17" },
    { d: "M -20,-5 Q -12,-8 -5,-4 M -20,2 Q -12,-1 -5,3 M -20,9 Q -12,6 -5,10 M 5,-4 Q 12,-8 20,-5 M 5,3 Q 12,-1 20,2 M 5,10 Q 12,6 20,9", w: 1.2 },
  ]),
  icon("help", 195, 168, "orange", [
    // два ребёнка одного роста; один протягивает другому небольшой предмет
    { d: "M -15,-14 C -20,-14 -20,-6 -15,-6 C -10,-6 -10,-14 -15,-14" },
    { d: "M -15,-6 L -15,10 M -15,10 L -19,24 M -15,10 L -11,24 M -15,-1 L -2,2" },
    { d: "M -3,-3 L 3,-3 L 3,5 L -3,5 Z", w: 1.6 },
    { d: "M 16,-14 C 11,-14 11,-6 16,-6 C 21,-6 21,-14 16,-14" },
    { d: "M 16,-6 L 16,10 M 16,10 L 12,24 M 16,10 L 20,24 M 16,-1 L 4,1 M 16,-1 L 23,7" },
  ]),
];

export const ICON_INDEX: Record<IconId, number> = Object.fromEntries(ICONS.map((ic, i) => [ic.id, i])) as Record<IconId, number>;
export const EMPTY_SPOT = { x: 270, y: 168 } as const;

// Длины штрихов (для точного положения кончика карандаша).
const LENS = ICONS.map((ic) => ic.strokes.map((s) => getLength(s.d)));

const subpaths = (d: string) => d.split(/(?=M )/).map((s) => s.trim()).filter(Boolean);
const SUBLENS = ICONS.map((ic) => ic.strokes.map((s) => subpaths(s.d).map((sp) => getLength(sp))));

// Кончик карандаша при прогрессе p (0…1) рисования значка i.
export const pencilTip = (i: number, p: number): { x: number; y: number; down: boolean } => {
  const ic = ICONS[i];
  const total = LENS[i].reduce((a, b) => a + b, 0);
  // между штрихами карандаш коротко отрывается: 8 % времени на переходы
  let L = Math.max(0, Math.min(1, p)) * total;
  for (let s = 0; s < ic.strokes.length; s++) {
    const subs = subpaths(ic.strokes[s].d);
    for (let k = 0; k < subs.length; k++) {
      const len = SUBLENS[i][s][k];
      if (L <= len) {
        const pt = getPointAtLength(subs[k], L)!;
        return { x: pt.x, y: pt.y, down: true };
      }
      L -= len;
    }
  }
  const last = ic.strokes[ic.strokes.length - 1];
  const subs = subpaths(last.d);
  const sp = subs[subs.length - 1];
  const pt = getPointAtLength(sp, getLength(sp))!;
  return { x: pt.x, y: pt.y, down: false };
};

const pencilColor = (id: PencilId) => PENCILS.find((p) => p.id === id)!.color;

const DrawnIcon: React.FC<{ ic: IconDef; i: number; p: number }> = ({ ic, i, p }) => {
  if (p <= 0) return null;
  const col = pencilColor(ic.pencil);
  const total = LENS[i].reduce((a, b) => a + b, 0);
  let L = p * total;
  return (
    <g>
      {ic.strokes.map((s, k) => {
        const len = LENS[i][k];
        const vis = Math.max(0, Math.min(len, L));
        L -= len;
        if (vis <= 0) return null;
        const w = s.w ?? 2.1;
        return (
          <g key={k}>
            <path d={s.d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${vis} ${len + 1}`} opacity={s.hatch ? 0.55 : 0.92} />
            {!s.hatch ? (
              <path d={s.d} stroke={col} strokeWidth={w * 0.45} fill="none" strokeLinecap="round" strokeDasharray={`${vis} ${len + 1}`} opacity={0.4} transform="translate(0.6 0.5)" />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

export type SheetState = {
  readonly icons: readonly number[]; // прогресс 7 значков, 0…1
  readonly title: number; // 0…1 — надпись в сцене 8
  readonly highlight?: IconId | null; // мягкое выделение уже существующего значка
  readonly highlightAmt?: number;
};

export const TITLE_LINES = ["Дары, которые", "мы заметили"] as const;

// Содержимое листа в его собственных координатах; трансформацию задаёт родитель,
// поэтому рисунки и надпись всегда движутся вместе с листом.
export const SheetContent: React.FC<{ s: SheetState; uid: string }> = ({ s, uid }) => {
  const t = Math.max(0, Math.min(1, s.title));
  const l1 = Math.min(1, t * 2);
  const l2 = Math.max(0, t * 2 - 1);
  return (
    <g>
      <rect x={0} y={0} width={SHEET.w} height={SHEET.h} fill="#FFFEFA" />
      <rect x={0} y={0} width={SHEET.w} height={SHEET.h} fill="none" stroke="#D9D2C2" strokeWidth={1.2} />
      {s.highlight && (s.highlightAmt ?? 0) > 0 ? (
        <circle cx={ICONS[ICON_INDEX[s.highlight]].cx} cy={ICONS[ICON_INDEX[s.highlight]].cy} r={33} fill="#FFE9A8" opacity={0.55 * (s.highlightAmt ?? 0)} />
      ) : null}
      {ICONS.map((ic, i) => (
        <DrawnIcon key={ic.id} ic={ic} i={i} p={s.icons[i] ?? 0} />
      ))}
      {t > 0 ? (
        <g>
          <clipPath id={`title1-${uid}`}>
            <rect x={0} y={0} width={84 + l1 * 158} height={36} />
          </clipPath>
          <clipPath id={`title2-${uid}`}>
            <rect x={0} y={34} width={95 + l2 * 132} height={30} />
          </clipPath>
          <text x={SHEET.w / 2} y={27} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={21} fill="#24427A" clipPath={`url(#title1-${uid})`}>
            {TITLE_LINES[0]}
          </text>
          <text x={SHEET.w / 2} y={52} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={21} fill="#24427A" clipPath={`url(#title2-${uid})`}>
            {TITLE_LINES[1]}
          </text>
        </g>
      ) : null}
    </g>
  );
};

// Положение маркера при надписи (в координатах листа).
export const titleTip = (t: number) => {
  const l1 = Math.min(1, t * 2);
  const l2 = Math.max(0, t * 2 - 1);
  if (t < 0.5) return { x: 84 + l1 * 158, y: 21 + Math.sin(l1 * 60) * 3 };
  return { x: 95 + l2 * 132, y: 46 + Math.sin(l2 * 50) * 3 };
};
