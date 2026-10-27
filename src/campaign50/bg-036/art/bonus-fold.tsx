// Детали сцены bonus (только для неё): бумажная гармошка «десятка»,
// цепочка из пяти бонусных ячеек в полёте, пунктир-разделитель, который
// проявляется за пальцами, механический счётчик-барабан для заголовка,
// вспышка ячейки и блик по бумаге. Координаты — мир сцены (как в Tape /
// Separated); в покое всё совпадает с SeparatedTape без скачков.
import type React from "react";
import { C } from "../palette";
import { clamp, easeInOut, lerp } from "./motion";
import { SEP, tenXY } from "./Separated";
import { CELL_H, CELL_W, Cell, GRID, PANEL_H, PANEL_W, TICK_H, TickBand, panelTop } from "./Tape";
import { box } from "./World";

// ---------- Гармошка: секция из 10 ячеек складывается в «десяток» ----------

// Доля сжатия ячейки i (0…9) при общем прогрессе u: правый край ленты
// начинает складываться первым, волна идёт влево (как мех гармошки).
const WAVE = 0.6;
const sliceU = (u: number, i: number) => easeInOut(clamp(u * (1 + WAVE) - ((9 - i) / 9) * WAVE));

// Светотень грани: чётные грани смотрят к свету (слева сверху), нечётные —
// в тень; у «долины» сгиба темнее.
const faceShade = (odd: boolean, s: number) =>
  odd
    ? `linear-gradient(90deg, rgba(150,96,0,${0.2 * s}) 0%, rgba(120,70,0,${0.42 * s}) 100%)`
    : `linear-gradient(90deg, rgba(150,96,0,${0.1 * s}) 0%, rgba(255,250,230,${0.4 * s}) 100%)`;

export const AccordionRow: React.FC<{
  readonly k: number; // секция 0…3 (ячейки 10k+1 … 10k+10)
  readonly u: number; // 0 — лежит ровно (как FlatTape), 1 — сложена в размер TenBlock
  readonly opacity?: number;
}> = ({ k, u, opacity = 1 }) => {
  const from = k * 10 + 1;
  const cs = Array.from({ length: 10 }, (_, i) => lerp(1, SEP.ten.w / PANEL_W, sliceU(u, i)));
  const lefts = cs.map((_, i) => cs.slice(0, i).reduce((a, c) => a + c * CELL_W, 0));
  const width = lefts[9] + cs[9] * CELL_W;
  const pos = easeInOut(clamp(u * 1.25 - 0.25));
  const hs = lerp(1, SEP.ten.h / PANEL_H, pos);
  const x = lerp(GRID.x, tenXY(k).x, pos);
  const y = lerp(panelTop(k), tenXY(k).y, pos);
  const fold = Math.max(...cs.map((c) => Math.sqrt(Math.max(0, 1 - c * c))));
  return (
    <div
      style={box({
        left: x,
        top: y,
        width,
        height: PANEL_H * hs,
        opacity,
        backgroundColor: C.paper,
        outline: "1.5px solid rgba(160,120,20,0.35)",
        boxShadow: `0 ${10 + 10 * fold}px ${22 + 16 * fold}px rgba(40,48,70,${0.16 + 0.08 * fold}), 0 2px 4px rgba(40,48,70,0.12)`,
      })}
    >
      {cs.map((c, i) => {
        const s = Math.sqrt(Math.max(0, 1 - c * c));
        return (
          <div
            key={i}
            style={box({
              left: lefts[i],
              top: 0,
              width: CELL_W,
              height: PANEL_H,
              overflow: "hidden",
              backgroundColor: C.paper,
              transformOrigin: "0 0",
              transform: `scale(${c}, ${hs})`,
            })}
          >
            <div style={box({ left: -i * CELL_W, top: 0, width: PANEL_W, height: TICK_H })}>
              <TickBand from={from} n={10} />
            </div>
            <Cell n={from + i} style={{ left: 0, top: TICK_H }} />
            {s > 0.01 ? <div style={box({ left: 0, top: 0, width: CELL_W, height: PANEL_H, background: faceShade(i % 2 === 1, s) })} /> : null}
            {s > 0.01 && i % 2 === 0 ? (
              // гребень сгиба — светлая кромка
              <div style={box({ right: 0, top: 0, width: 3, height: PANEL_H, backgroundColor: `rgba(255,255,255,${0.7 * s})` })} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Бонусная полоска 41–45: цепочка ячеек ----------

// Центр ячейки 43 (середина полоски) в начале — плоская раскладка — и в
// конце — столбик BonusColumn.
export const BONUS_FROM = { x: GRID.x + 2.5 * CELL_W, y: GRID.y + 4 * PANEL_H + TICK_H + CELL_H / 2 };
export const BONUS_TO = { x: SEP.bonus.x + CELL_W / 2, y: GRID.y + 2.5 * CELL_H };

const bez = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

// Полоска из 5 ячеек: ось поворачивается от горизонтали (41 слева) к
// вертикали (41 сверху), шаг 80 → 100 px, середина летит по дуге.
// Ячейки — бумажные плитки одной полоски, надписи-штампы остаются прямыми.
export const BonusChain: React.FC<{
  readonly t: number; // полёт 0…1
  readonly air: number; // 0…1 — полоска поднята над столом
  readonly band: number; // 0…1 — видимость полоски делений (до отрыва)
  readonly glow: number;
  readonly dy?: number; // сдвиг лежащей полоски (подвинута гармошкой)
}> = ({ t, air, band, glow, dy = 0 }) => {
  const e = easeInOut(t);
  // сначала полоска уходит вправо (мимо десятков), потом разворачивается
  const phi = (Math.PI / 2) * easeInOut(clamp((t - 0.18) / 0.76));
  const step = lerp(CELL_W, CELL_H, e) * (1 + 0.06 * air);
  const mx = bez(BONUS_FROM.x, 760, BONUS_TO.x, e);
  const my = bez(BONUS_FROM.y + dy, 1235, BONUS_TO.y, e);
  const k = 1 + 0.06 * air;
  const tilt = 7 * Math.sin(Math.PI * clamp(t));
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = mx + (i - 2) * step * Math.cos(phi);
        const cy = my + (i - 2) * step * Math.sin(phi);
        const rot = tilt + (i - 2) * 1.6 * Math.sin(Math.PI * clamp(t));
        return (
          <div
            key={i}
            style={box({
              left: cx - CELL_W / 2,
              top: cy - CELL_H / 2,
              width: CELL_W,
              height: CELL_H,
              transform: `rotate(${rot}deg) scale(${k})`,
              boxShadow: `0 ${10 + 26 * air}px ${22 + 26 * air}px rgba(40,48,70,${0.16 + 0.06 * air}), 0 2px 4px rgba(40,48,70,0.12)`,
              outline: `2px solid ${C.yellowDeep}`,
              backgroundColor: C.white,
            })}
          >
            {band > 0 ? (
              <div style={box({ left: 0, top: -TICK_H, width: CELL_W, height: TICK_H, overflow: "hidden", opacity: band })}>
                <div style={box({ left: -i * CELL_W, top: 0, width: CELL_W * 5, height: TICK_H })}>
                  <TickBand from={41} n={5} bonus />
                </div>
              </div>
            ) : null}
            <Cell n={41 + i} glow={glow} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
    </>
  );
};

// ---------- Пунктир-разделитель ----------

// Тот же пунктир, что в SeparatedTape (та же фаза штрихов от верхнего
// края), но видимый только ниже линии front (px мира).
export const DividerReveal: React.FC<{ readonly front: number }> = ({ front }) => {
  const { x, y0, y1 } = SEP.divider;
  const top = clamp(front, y0 - 6, y1 + 6);
  if (top >= y1 + 5) return null;
  return (
    <div style={box({ left: x - 10, top, width: 20, height: y1 + 6 - top, overflow: "hidden" })}>
      <svg width={10} height={10} style={{ position: "absolute", left: 10, top: y0 - top, overflow: "visible" }}>
        <path d={`M 0 0 L 0 ${y1 - y0}`} stroke={C.navy} strokeWidth={5} strokeDasharray="16 12" strokeLinecap="round" opacity={0.55} />
      </svg>
    </div>
  );
};

// ---------- Вспышка ячейки и блик ----------

// Подсветка бонусной ячейки i (0…4) в столбике поверх SeparatedTape.
export const CellFlash: React.FC<{ readonly i: number; readonly a: number }> = ({ i, a }) =>
  a > 0.005 ? (
    <div
      style={box({
        left: SEP.bonus.x,
        top: GRID.y + i * CELL_H,
        width: CELL_W,
        height: CELL_H,
        backgroundColor: `rgba(255,236,150,${0.38 * a})`,
        boxShadow: `0 0 ${30 + 20 * a}px ${6 * a}px rgba(255,201,14,${0.85 * a}), inset 0 0 0 ${5 * a}px ${C.yellow}`,
      })}
    />
  ) : null;

// Блик, пробегающий по бумаге сверху вниз (t 0…1), в границах прямоугольника.
export const Glint: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly t: number }> = ({
  x,
  y,
  w,
  h,
  t,
}) =>
  t > 0 && t < 1 ? (
    <div style={box({ left: x, top: y, width: w, height: h, overflow: "hidden", pointerEvents: "none" })}>
      <div
        style={box({
          left: -w,
          width: w * 3,
          top: lerp(-140, h + 40, t),
          height: 100,
          transform: "rotate(-24deg)",
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
        })}
      />
    </div>
  ) : null;

// ---------- Механический счётчик (барабан) ----------

// Цифра-барабан: показывает digits[v] и прокручивается вверх при росте v
// (дробное v — между цифрами). Ширина и базовая линия — как у обычной
// цифры last в тексте (невидимый образец), поэтому строка не «дышит».
export const DigitWheel: React.FC<{ readonly v: number; readonly last: number; readonly lineH: number }> = ({ v, last, lineH }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    <span style={{ visibility: "hidden" }}>{String(last)}</span>
    <span style={{ position: "absolute", left: -12, right: -12, top: 0, height: lineH, overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", transform: `translateY(${-v * lineH}px)` }}>
        {Array.from({ length: last + 1 }).map((_, d) => (
          <span key={d} style={{ display: "block", height: lineH, lineHeight: `${lineH}px` }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  </span>
);
