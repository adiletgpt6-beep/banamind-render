// Складная бумажная метрическая лента: секции по 10 ячеек (как деления
// рулетки), сверху полоска делений с номером ячейки. Жёлтая ячейка —
// одна оплаченная полная поездка (штамп: дом → школа → дом), белая
// ячейка с жёлтым пунктиром — бонусная (41–45).
// Плоская раскладка (сетка) в координатах мира: GRID; секции k = 0…3 —
// ячейки 1–40, секция 4 (половинная) — ячейки 41–45.
import type React from "react";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { clamp, hash01, lerp } from "./motion";
import { box } from "./World";

export const CELL_W = 80;
export const CELL_H = 100;
export const TICK_H = 22; // полоска делений сверху секции
export const PANEL_H = TICK_H + CELL_H; // 122
export const PANEL_W = CELL_W * 10; // 800
export const GRID = { x: 140, y: 650 } as const; // левый верхний угол секции 0

// Левый верхний угол ячейки n (1…45) в плоской раскладке.
export const cellXY = (n: number) => {
  const row = Math.floor((n - 1) / 10);
  const col = (n - 1) % 10;
  return { x: GRID.x + col * CELL_W, y: GRID.y + row * PANEL_H + TICK_H };
};
// Центр ячейки n.
export const cellCenter = (n: number) => {
  const p = cellXY(n);
  return { x: p.x + CELL_W / 2, y: p.y + CELL_H / 2 };
};
export const panelTop = (k: number) => GRID.y + k * PANEL_H;

// Штамп поездки: круглая печать, машинка и стрелка туда-обратно
// (ҮЙ → МЕКТЕП → ҮЙ = одна полная поездка).
export const TripStamp: React.FC<{ readonly size?: number; readonly rot?: number; readonly ink?: string; readonly opacity?: number }> = ({
  size = 54,
  rot = 0,
  ink = C.navy,
  opacity = 0.8,
}) => (
  <svg width={size} height={size} viewBox="-30 -30 60 60" style={{ display: "block", transform: `rotate(${rot}deg)`, opacity }}>
    <circle r={26} fill="none" stroke={ink} strokeWidth={3} />
    {/* машинка (вид сбоку) с одним длинным окном */}
    <path
      d="M -17 1 L -17 -4 Q -16 -7.5 -11.5 -8 L -7.5 -13.5 Q -5.5 -15.5 -1.5 -15.5 L 5 -15.5 Q 8.5 -15.5 10.5 -12.5 L 13.5 -8 Q 17 -7.5 17 -4 L 17 1 Z"
      fill={ink}
    />
    <path d="M -5.5 -9 L -3.4 -12.6 Q -2.4 -13.4 -0.6 -13.4 L 4.6 -13.4 Q 6.6 -13.4 7.8 -11.6 L 9.4 -9 Z" fill={C.yellowCell} />
    <circle cx={-9.5} cy={1.5} r={4.4} fill={ink} />
    <circle cx={9.5} cy={1.5} r={4.4} fill={ink} />
    {/* туда-обратно */}
    <path d="M -12 14 L 12 14" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
    <path d="M -8 10.5 L -12.5 14 L -8 17.5 M 8 10.5 L 12.5 14 L 8 17.5" fill="none" stroke={ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Бонусный знак: звезда-подарок «+1» жёлтыми чернилами.
export const BonusStamp: React.FC<{ readonly size?: number; readonly rot?: number; readonly opacity?: number }> = ({ size = 54, rot = 0, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="-30 -30 60 60" style={{ display: "block", transform: `rotate(${rot}deg)`, opacity }}>
    <circle r={26} fill="none" stroke={C.yellowDeep} strokeWidth={3} />
    <text x={0} y={8} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={24} fill={C.yellowDeep}>
      +1
    </text>
  </svg>
);

export type CellKind = "paid" | "bonus";

// Ячейка ленты без полоски делений (CELL_W × CELL_H).
export const Cell: React.FC<{
  readonly n: number;
  readonly kind?: CellKind;
  readonly stamp?: number; // 0…1 — видимость штампа (оттиск)
  readonly glow?: number; // 0…1 — подсветка (бонус)
  readonly w?: number;
  readonly h?: number;
  readonly style?: React.CSSProperties;
}> = ({ n, kind = n > 40 ? "bonus" : "paid", stamp = 1, glow = 0, w = CELL_W, h = CELL_H, style }) => {
  const rot = (hash01(n * 3.7) - 0.5) * 26;
  const paid = kind === "paid";
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        boxSizing: "border-box",
        backgroundColor: paid ? C.yellowCell : C.white,
        borderRight: paid ? "2px dashed rgba(150,105,0,0.35)" : `2px dashed ${C.yellowDeep}`,
        boxShadow: glow > 0 ? `0 0 ${18 + 26 * glow}px rgba(255,201,14,${0.75 * glow}), inset 0 0 0 ${3 * glow}px ${C.yellow}` : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {stamp > 0 ? (
        <div style={{ transform: `scale(${lerp(1.35, 1, clamp(stamp))})`, opacity: clamp(stamp * 1.6) }}>
          {paid ? <TripStamp size={Math.min(w, h) * 0.66} rot={rot} /> : <BonusStamp size={Math.min(w, h) * 0.66} rot={rot * 0.5} />}
        </div>
      ) : null}
    </div>
  );
};

// Полоска делений над ячейками from…from+n−1 (как у рулетки): мелкие
// деления, номер ячейки над её серединой, десятки — крупнее.
export const TickBand: React.FC<{ readonly from: number; readonly n: number; readonly bonus?: boolean }> = ({ from, n, bonus }) => (
  <svg width={n * CELL_W} height={TICK_H} style={{ position: "absolute", left: 0, top: 0, display: "block" }}>
    <rect width={n * CELL_W} height={TICK_H} fill={bonus ? "#FFFFFF" : C.paper} />
    {Array.from({ length: n * 4 + 1 }).map((_, i) => {
      const major = i % 4 === 0;
      return (
        <rect
          key={i}
          x={i * (CELL_W / 4) - (major ? 1.25 : 0.75)}
          y={0}
          width={major ? 2.5 : 1.5}
          height={major ? 10 : 5}
          fill={bonus ? C.yellowDeep : C.navy}
          opacity={major ? 0.9 : 0.55}
        />
      );
    })}
    {Array.from({ length: n }).map((_, i) => {
      const num = from + i;
      const ten = num % 10 === 0;
      return (
        <text
          key={num}
          x={i * CELL_W + CELL_W / 2}
          y={TICK_H - 3.5}
          textAnchor="middle"
          fontFamily={fontFamily}
          fontWeight={ten ? 1000 : 800}
          fontSize={ten ? 15 : 12.5}
          fill={bonus ? C.yellowDeep : C.navy}
        >
          {num}
        </text>
      );
    })}
  </svg>
);

// Лицевая сторона секции: полоска делений и ячейки.
export const PanelFace: React.FC<{
  readonly from: number;
  readonly n: number;
  readonly stamp?: (num: number) => number;
  readonly glow?: (num: number) => number;
}> = ({ from, n, stamp, glow }) => {
  const bonus = from > 40;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: n * CELL_W,
        height: PANEL_H,
        backgroundColor: bonus ? C.white : C.paper,
        outline: bonus ? `2px solid ${C.yellowDeep}` : "1.5px solid rgba(160,120,20,0.35)",
        backfaceVisibility: "hidden",
      }}
    >
      <TickBand from={from} n={n} bonus={bonus} />
      {Array.from({ length: n }).map((_, i) => (
        <Cell
          key={i}
          n={from + i}
          stamp={stamp ? stamp(from + i) : 1}
          glow={glow ? glow(from + i) : 0}
          style={{ left: i * CELL_W, top: TICK_H }}
        />
      ))}
    </div>
  );
};

// Оборот секции: чистая бумага с волокнами.
export const PanelBack: React.FC<{ readonly n: number }> = ({ n }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: n * CELL_W,
      height: PANEL_H,
      backgroundColor: "#FFF4CF",
      backgroundImage:
        "repeating-linear-gradient(115deg, rgba(200,160,60,0.07) 0 2px, transparent 2px 9px), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(0,0,0,0.03))",
      outline: "1.5px solid rgba(160,120,20,0.35)",
      backfaceVisibility: "hidden",
      transform: "rotateX(180deg)",
    }}
  />
);

// Тень бумаги на столе под плоской раскладкой.
export const paperShadow = "0 10px 22px rgba(40,48,70,0.16), 0 2px 4px rgba(40,48,70,0.12)";

// Секция, которая складывается по своему верхнему краю (rotateX).
// Тень-«затемнение» усиливается, когда секция стоит ребром к камере.
const FoldPanel: React.FC<{
  readonly from: number;
  readonly n: number;
  readonly angle: number; // градусы rotateX относительно родителя (0 — лежит ровно)
  readonly top: number; // смещение верхнего края от верха родителя
  readonly flat?: boolean; // вся лента разложена — без 3D
  readonly stamp?: (num: number) => number;
  readonly glow?: (num: number) => number;
  readonly children?: React.ReactNode;
}> = ({ from, n, angle, top, flat, stamp, glow, children }) => {
  const shade = flat ? 0 : Math.abs(Math.sin((angle * Math.PI) / 180)) * 0.28;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: n * CELL_W,
        height: PANEL_H,
        transformOrigin: "50% 0",
        transform: flat ? undefined : `rotateX(${angle}deg)`,
        transformStyle: flat ? undefined : "preserve-3d",
      }}
    >
      <PanelFace from={from} n={n} stamp={stamp} glow={glow} />
      {flat ? null : <PanelBack n={n} />}
      {shade > 0.01 ? (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(40,48,70,${shade})`, pointerEvents: "none" }} />
      ) : null}
      {children}
    </div>
  );
};

// Секция, свёрнутая под родителя (угол ≤ −175°), не рисуется: её всё
// равно не видно, а почти совпадающие плоскости дают мерцание глубины.
const Fold: React.FC<React.ComponentProps<typeof FoldPanel>> = (p) => (p.angle <= -175 ? null : <FoldPanel {...p} />);

// Лента-гармошка: секция 0 лежит на месте, секции 1…3 и половинная
// секция бонусов (41–45) складываются по линиям сгиба. Углы: 0 — секция
// разложена; сложено — FOLDED.
// Секции 1–3 свёрнуты рулоном под секцию 0 (сверху видны только ячейки
// 1–10), каждая следующая выходит из-под предыдущей; бонусная половинка
// спрятана под секцией 3 до своего «выщелкивания».
export const FOLDED = [-179, -179, -179, -179] as const;

export const FanTape: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly fold: readonly [number, number, number, number]; // углы секций 1, 2, 3 и бонусной
  readonly stamp?: (num: number) => number;
  readonly glow?: (num: number) => number;
  readonly perspective?: number;
}> = ({ x = GRID.x, y = GRID.y, fold, stamp, glow, perspective = 2600 }) => {
  // Разложенная лента рисуется без 3D (одинаково на вид): при параллельном
  // рендере видео preserve-3d иногда даёт кадр без ленты.
  const flat = fold.every((a) => Math.abs(a) < 0.01);
  return (
    <div
      style={box({
        left: x,
        top: y,
        width: PANEL_W,
        height: PANEL_H,
        perspective: flat ? undefined : perspective,
        perspectiveOrigin: "50% 40%",
      })}
    >
      <div style={{ position: "absolute", inset: 0, transformStyle: flat ? undefined : "preserve-3d", boxShadow: paperShadow }}>
        <PanelFace from={1} n={10} stamp={stamp} glow={glow} />
        <Fold from={11} n={10} angle={fold[0]} top={PANEL_H} flat={flat} stamp={stamp} glow={glow}>
          <Fold from={21} n={10} angle={fold[1]} top={PANEL_H} flat={flat} stamp={stamp} glow={glow}>
            <Fold from={31} n={10} angle={fold[2]} top={PANEL_H} flat={flat} stamp={stamp} glow={glow}>
              <Fold from={41} n={5} angle={fold[3]} top={PANEL_H} flat={flat} stamp={stamp} glow={glow} />
            </Fold>
          </Fold>
        </Fold>
      </div>
    </div>
  );
};

// Плоская разложенная лента (без 3D): секции 0…3 и бонусная половинка.
export const FlatTape: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly stamp?: (num: number) => number;
  readonly glow?: (num: number) => number;
  readonly bonus?: boolean;
}> = ({ x = GRID.x, y = GRID.y, stamp, glow, bonus = true }) => (
  <div style={box({ left: x, top: y, width: PANEL_W, height: PANEL_H * 5 })}>
    {[0, 1, 2, 3].map((k) => (
      <div key={k} style={box({ left: 0, top: k * PANEL_H, width: PANEL_W, height: PANEL_H, boxShadow: paperShadow })}>
        <PanelFace from={k * 10 + 1} n={10} stamp={stamp} glow={glow} />
      </div>
    ))}
    {bonus ? (
      <div style={box({ left: 0, top: 4 * PANEL_H, width: CELL_W * 5, height: PANEL_H, boxShadow: paperShadow })}>
        <PanelFace from={41} n={5} stamp={stamp} glow={glow} />
      </div>
    ) : null}
  </div>
);
