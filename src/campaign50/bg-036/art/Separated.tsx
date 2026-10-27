// Разделённая лента — конечное состояние сцены bonus и начальное сцены
// trial (общая геометрия, чтобы стык был без скачка):
//   слева — четыре аккуратно сложенных «десятка» (оплаченные 40),
//   справа — столбик из 5 белых бонусных ячеек (41–45),
//   между ними — пунктир, по которому рука мамы разделила части.
// Координаты мира (камера сцены по умолчанию {540, 955, 1}).
import type React from "react";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { CELL_H, CELL_W, Cell, GRID, TICK_H, TripStamp, paperShadow } from "./Tape";
import { Pill } from "./ui";
import { box } from "./World";

export const SEP = {
  ten: { x: 110, w: 320, h: 110, gap: 128 }, // блок k: y = GRID.y + k·gap
  bonus: { x: 700, gapY: 0 }, // ячейка i: y = GRID.y + i·(CELL_H + gapY), ширина CELL_W
  divider: { x: 565, y0: GRID.y - 30, y1: GRID.y + 5 * CELL_H + 30 },
  labelY: GRID.y - 92, // подписи над столбцами
} as const;

export const tenXY = (k: number) => ({ x: SEP.ten.x, y: GRID.y + k * SEP.ten.gap });
export const bonusXY = (i: number) => ({ x: SEP.bonus.x, y: GRID.y + i * (CELL_H + SEP.bonus.gapY) });

// «Десяток»: 10 ячеек, сложенных гармошкой в аккуратную пачку (видны
// края слоёв), сверху — штамп поездки и крупно «10».
export const TenBlock: React.FC<{ readonly k: number; readonly style?: React.CSSProperties }> = ({ k, style }) => {
  const { w, h } = SEP.ten;
  return (
    <div style={{ position: "absolute", width: w, height: h, ...style }}>
      {/* края сложенных слоёв */}
      {[3, 2, 1].map((i) => (
        <div
          key={i}
          style={box({
            left: i * 5,
            top: i * 5,
            width: w,
            height: h,
            borderRadius: 6,
            backgroundColor: i % 2 ? "#F2C224" : C.yellowCell,
            border: "1.5px solid rgba(150,105,0,0.35)",
            boxShadow: i === 3 ? paperShadow : undefined,
          })}
        />
      ))}
      <div
        style={box({
          left: 0,
          top: 0,
          width: w,
          height: h,
          borderRadius: 6,
          backgroundColor: C.yellowCell,
          border: "1.5px solid rgba(150,105,0,0.45)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 26px 0 18px",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: 0, top: 0, width: w, height: 16, backgroundColor: C.paper, borderBottom: "1px solid rgba(160,120,20,0.3)" })}>
          <svg width={w} height={16} style={{ display: "block" }}>
            {Array.from({ length: 21 }).map((_, i) => (
              <rect key={i} x={i * (w / 20) - 1} y={0} width={i % 2 ? 1.5 : 2.5} height={i % 2 ? 5 : 9} fill={C.navy} opacity={0.7} />
            ))}
          </svg>
        </div>
        <div style={{ marginTop: 14 }}>
          <TripStamp size={70} rot={-8 + k * 5} />
        </div>
        <div style={{ marginTop: 14, fontFamily, fontSize: 70, fontWeight: 1000, color: C.navy, lineHeight: 1 }}>
          {BG36_TEXT.bonus.ten}
        </div>
      </div>
    </div>
  );
};

// Столбик бонусных ячеек 41–45 (вертикальная бумажная полоска).
export const BonusColumn: React.FC<{ readonly glow?: number; readonly style?: React.CSSProperties }> = ({ glow = 0.6, style }) => (
  <div style={{ position: "absolute", width: CELL_W + TICK_H, height: 5 * CELL_H, ...style }}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: CELL_W + TICK_H,
        height: 5 * CELL_H,
        backgroundColor: C.white,
        outline: `2px solid ${C.yellowDeep}`,
        boxShadow: paperShadow,
      })}
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i}>
        <Cell n={41 + i} glow={glow} style={{ left: TICK_H, top: i * CELL_H }} />
        <div
          style={box({
            left: 0,
            top: i * CELL_H,
            width: TICK_H,
            height: CELL_H,
            fontFamily,
            fontSize: 13,
            fontWeight: 900,
            color: C.yellowDeep,
            writingMode: "vertical-rl",
            textAlign: "center",
            lineHeight: `${TICK_H}px`,
          })}
        >
          {41 + i}
        </div>
      </div>
    ))}
  </div>
);

// Вся разделённая раскладка. labels — подписи «40 төлөйсүз» / «+5 бонус»
// (0…1 — проявление), divider — пунктир между частями (0…1 — длина).
export const SeparatedTape: React.FC<{
  readonly labels?: number;
  readonly divider?: number;
  readonly glow?: number;
}> = ({ labels = 1, divider = 1, glow = 0.6 }) => (
  <>
    {[0, 1, 2, 3].map((k) => {
      const p = tenXY(k);
      return <TenBlock key={k} k={k} style={{ left: p.x, top: p.y }} />;
    })}
    <BonusColumn glow={glow} style={{ left: SEP.bonus.x - TICK_H, top: GRID.y }} />
    {divider > 0 ? (
      <svg width={10} height={10} style={{ position: "absolute", left: SEP.divider.x, top: SEP.divider.y0, overflow: "visible" }}>
        <path
          d={`M 0 0 L 0 ${(SEP.divider.y1 - SEP.divider.y0) * divider}`}
          stroke={C.navy}
          strokeWidth={5}
          strokeDasharray="16 12"
          strokeLinecap="round"
          opacity={0.55}
        />
      </svg>
    ) : null}
    {labels > 0 ? (
      <>
        <div style={box({ left: SEP.ten.x, width: SEP.ten.w, top: SEP.labelY, display: "flex", justifyContent: "center", opacity: labels })}>
          <Pill tone="navy" size={40}>
            {BG36_TEXT.bonus.paidLabel}
          </Pill>
        </div>
        <div
          style={box({ left: SEP.bonus.x - 120, width: CELL_W + 240, top: SEP.labelY, display: "flex", justifyContent: "center", opacity: labels })}
        >
          <Pill tone="yellow" size={40}>
            {BG36_TEXT.bonus.badge}
          </Pill>
        </div>
      </>
    ) : null}
  </>
);
