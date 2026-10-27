// Механика счётчика BG-035: магнитные жетоны поездок.
//   • оплаченный жетон — жёлтый круг со знаком «туда и обратно»
//     (каждый жетон = 1 толук сапар: ҮЙ → МЕКТЕП → ҮЙ);
//   • бонусный жетон «АКЫСЫЗ» — мятный круг той же величины (такая же
//     полная поездка), со звездой;
//   • фишка «СЫНОО» — белый скруглённый квадрат с тёмно-синим контуром:
//     другая форма, никогда не лежит в лотке 20 + 2.
// Лоток — кольцо из 20 гнёзд (не сетка недели/месяца: пакет продаётся по
// числу поездок, а не по календарю) и отдельная пара гнёзд «+2» снизу.
// В центре кольца — барабанный счётчик 00 → 20 → 22.
import type React from "react";
import { fontFamily } from "../../fonts";
import { clamp } from "../../two-schedules-2d/rig/motion";
import { C } from "./palette";
import { BG35_TEXT, BG35_TOKENS } from "./script";
import { box } from "./ui";

export type TokenKind = "paid" | "bonus";

// Раскладка лотка (мир 1080 × 1920). Кольцо: 20 гнёзд по часовой стрелке
// от верхней точки; пара «+2» — под кольцом; фишка «Сыноо» — слева,
// за вертикальным разделителем (вне лотка).
export const TRAY = {
  cx: 540,
  cy: 820,
  R: 290,
  r: 42, // радиус жетона в кольце
  bonusY: 1272,
  bonusDx: 66, // половина расстояния между бонусными гнёздами
  bonusR: 48,
  trialX: 118,
  trialY: 1272,
  dividerX: 214,
} as const;

// Центр гнезда i (0…19) кольца.
export const ringPos = (i: number, cx = TRAY.cx, cy = TRAY.cy, R = TRAY.R) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / BG35_TOKENS.paid;
  return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
};

// Центр бонусного гнезда j (0…1).
export const bonusPos = (j: number) => ({
  x: TRAY.cx + (j === 0 ? -TRAY.bonusDx : TRAY.bonusDx),
  y: TRAY.bonusY,
});

// Знак «туда и обратно»: две дуги со стрелками, замкнутые в круг.
const LoopGlyph: React.FC<{ readonly color: string }> = ({ color }) => (
  <g fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M -22 -6 A 24 24 0 0 1 20 -12" />
    <path d="M 12 -22 L 21 -11 L 8 -6" />
    <path d="M 22 6 A 24 24 0 0 1 -20 12" />
    <path d="M -12 22 L -21 11 L -8 6" />
  </g>
);

const Star: React.FC<{ readonly color: string }> = ({ color }) => (
  <path
    d="M 0 -26 L 7.6 -10.4 L 24.7 -8 L 12.4 4 L 15.3 21 L 0 13 L -15.3 21 L -12.4 4 L -24.7 -8 L -7.6 -10.4 Z"
    fill={color}
  />
);

// Жетон: центр (x, y) в px мира, радиус r. lift — подъём (тень больше),
// glow — подсветка ободка (0…1), flip — поворот вокруг вертикали (−1…1:
// cos масштаб по x), label — подпись под знаком (видна при r ≥ 60).
export const Token: React.FC<{
  readonly kind: TokenKind;
  readonly x: number;
  readonly y: number;
  readonly r?: number;
  readonly opacity?: number;
  readonly rot?: number;
  readonly lift?: number;
  readonly glow?: number;
  readonly squash?: number; // 0…1 — сплющивание при «защёлкивании»
  readonly showLabel?: boolean;
}> = ({ kind, x, y, r = TRAY.r, opacity = 1, rot = 0, lift = 0, glow = 0, squash = 0, showLabel }) => {
  const paid = kind === "paid";
  const fill = paid ? C.yellow : C.mint;
  const rim = paid ? C.yellowDeep : C.mintDeep;
  const label = showLabel ?? r >= 60;
  const sx = 1 + 0.08 * squash;
  const sy = 1 - 0.1 * squash;
  return (
    <div
      style={box({
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        opacity,
        transform: `rotate(${rot}deg) scale(${sx}, ${sy})`,
        filter: `drop-shadow(0 ${4 + 14 * lift}px ${6 + 16 * lift}px rgba(20,40,90,${0.18 + 0.12 * lift}))`,
      })}
    >
      <svg width={2 * r} height={2 * r} viewBox="-60 -60 120 120" style={{ overflow: "visible" }}>
        {glow > 0 ? <circle r={58 + 6 * glow} fill="none" stroke={paid ? C.yellow : C.mint} strokeWidth={8} opacity={0.45 * glow} /> : null}
        <circle r={56} fill={rim} />
        <circle r={49} fill={fill} />
        <circle r={41} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
        <g transform={label ? "translate(0 -10) scale(0.82)" : undefined}>
          {paid ? <LoopGlyph color={C.navy} /> : <Star color="#FFFFFF" />}
        </g>
        {label ? (
          <text
            y={30}
            textAnchor="middle"
            fontFamily={fontFamily}
            fontWeight={900}
            fontSize={paid ? 15 : 14}
            fill={paid ? C.navy : "#145C36"}
          >
            {paid ? BG35_TEXT.fill.tokenPaid : BG35_TEXT.fill.tokenBonus}
          </text>
        ) : null}
      </svg>
    </div>
  );
};

// Фишка «СЫНОО»: белый скруглённый квадрат (другая форма), центр (x, y).
export const TrialChip: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly opacity?: number;
  readonly rot?: number;
  readonly lift?: number;
  readonly glow?: number;
}> = ({ x, y, size = 96, opacity = 1, rot = 0, lift = 0, glow = 0 }) => (
  <div
    style={box({
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      opacity,
      transform: `rotate(${rot}deg)`,
      borderRadius: size * 0.24,
      backgroundColor: C.trial,
      border: `${Math.max(3, size * 0.045)}px solid ${C.navy}`,
      boxSizing: "border-box",
      boxShadow: `0 ${4 + 14 * lift}px ${8 + 16 * lift}px rgba(20,40,90,${0.18 + 0.12 * lift})${glow > 0 ? `, 0 0 0 ${8 * glow}px rgba(20,40,90,${0.12 * glow})` : ""}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily,
      color: C.navy,
    })}
  >
    <svg width={size * 0.36} height={size * 0.36} viewBox="0 0 40 40">
      {/* лупа: «проба, знакомство» */}
      <circle cx={17} cy={17} r={10} fill="none" stroke={C.navy} strokeWidth={4} />
      <path d="M 25 25 L 33 33" stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
    </svg>
    <div style={{ fontSize: size * 0.2, fontWeight: 900, letterSpacing: 0.5, marginTop: size * 0.02 }}>
      {BG35_TEXT.trial.chip}
    </div>
  </div>
);

// Пустое гнездо лотка.
export const Socket: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r?: number;
  readonly bonus?: boolean;
  readonly opacity?: number;
  readonly lit?: number;
}> = ({ x, y, r = TRAY.r, bonus, opacity = 1, lit = 0 }) => (
  <div
    style={box({
      left: x - r - 4,
      top: y - r - 4,
      width: 2 * r + 8,
      height: 2 * r + 8,
      borderRadius: "50%",
      backgroundColor: bonus ? C.mintSoft : C.socket,
      border: `3px ${bonus ? "dashed" : "solid"} ${bonus ? C.mintDeep : C.socketEdge}`,
      boxSizing: "border-box",
      boxShadow: `inset 0 4px 8px rgba(20,40,90,0.12)${lit > 0 ? `, 0 0 0 ${6 * lit}px rgba(255,201,14,${0.35 * lit})` : ""}`,
      opacity,
    })}
  />
);

// Основа лотка: светлое кольцо-дорожка под гнёздами и площадка «+2».
// fill — доля «заполненной» дорожки (0…1), рисуется жёлтой дугой.
export const TrayBase: React.FC<{
  readonly opacity?: number;
  readonly fill?: number;
  readonly bonusOpen?: number;
  readonly scale?: number;
}> = ({ opacity = 1, fill = 0, bonusOpen = 1, scale = 1 }) => {
  const { cx, cy, R } = TRAY;
  const circ = 2 * Math.PI * R;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity, transform: `scale(${scale})`, transformOrigin: `${cx}px ${cy}px` })}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={R + 70} fill="#FFFFFF" stroke={C.line} strokeWidth={3} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.sky} strokeWidth={104} />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={C.yellowSoft}
          strokeWidth={104}
          strokeDasharray={`${circ * clamp(fill)} ${circ}`}
          transform={`rotate(-99 ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={R - 70} fill="#FFFFFF" stroke={C.line} strokeWidth={3} />
        {/* площадка «+2» — отдельно от кольца */}
        <g opacity={bonusOpen}>
          <rect x={cx - 150} y={TRAY.bonusY - 66} width={300} height={132} rx={66} fill={C.mintSoft} stroke={C.mintDeep} strokeWidth={3} strokeDasharray="10 8" />
          <path d={`M ${cx} ${cy + R + 70} L ${cx} ${TRAY.bonusY - 66}`} stroke={C.mintDeep} strokeWidth={4} strokeDasharray="6 8" />
        </g>
      </svg>
    </div>
  );
};

// Барабанный счётчик: значение v (дробное — цифры прокручиваются).
export const Odometer: React.FC<{
  readonly v: number;
  readonly x: number; // центр
  readonly y: number;
  readonly size?: number;
  readonly color?: string;
  readonly opacity?: number;
}> = ({ v, x, y, size = 170, color = C.navy, opacity = 1 }) => {
  const val = Math.max(0, v);
  const ones = val % 10;
  const tensBase = Math.floor(val / 10);
  // десятки прокручиваются вместе с переходом единиц 9 → 0
  const tens = tensBase + clamp((ones - 9) / 1);
  const digitW = size * 0.62;
  const Column: React.FC<{ readonly d: number }> = ({ d }) => (
    <div style={{ width: digitW, height: size, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: -d * size, width: digitW }}>
        {Array.from({ length: 11 }, (_, k) => (
          <div key={k} style={{ height: size, lineHeight: `${size}px`, textAlign: "center" }}>
            {k % 10}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div
      style={box({
        left: x - digitW,
        top: y - size / 2,
        width: digitW * 2,
        height: size,
        display: "flex",
        fontFamily,
        fontWeight: 1000,
        fontSize: size * 0.92,
        color,
        opacity,
        fontVariantNumeric: "tabular-nums",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, transparent 6%, #000 22%, #000 78%, transparent 94%, transparent 100%)",
      })}
    >
      <Column d={tens} />
      <Column d={ones} />
    </div>
  );
};

// Коробка бонусов «БОНУС» (крышка открывается: open 0…1).
export const BonusBox: React.FC<{
  readonly x: number; // центр низа коробки
  readonly y: number;
  readonly open: number;
  readonly opacity?: number;
  readonly s?: number;
}> = ({ x, y, open, opacity = 1, s = 1 }) => (
  <div style={box({ left: x - 110 * s, top: y - 150 * s, width: 220 * s, height: 150 * s, opacity })}>
    <svg width={220 * s} height={150 * s} viewBox="-110 -150 220 150" style={{ overflow: "visible" }}>
      <rect x={-92} y={-96} width={184} height={96} rx={14} fill={C.mintDeep} />
      <rect x={-92} y={-96} width={184} height={22} fill="rgba(0,0,0,0.12)" />
      <text x={0} y={-30} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={34} fill="#FFFFFF">
        {BG35_TEXT.fill.bonusBox}
      </text>
      {/* крышка откидывается на петле у левого края */}
      <g transform={`rotate(${-34 * clamp(open)} -100 -96)`}>
        <rect x={-100} y={-120} width={200} height={28} rx={10} fill={C.mint} stroke={C.mintDeep} strokeWidth={4} />
      </g>
    </svg>
  </div>
);

// ---------- Непрерывность между сценами 3–6 ----------
// Положение лотка на экране: масштаб s, центр кольца (cx, cy).
// Сцены 3–4: TRAY_HOME; сцена 5 переводит лоток в TRAY_SIDE (освобождая
// место фишке «Сыноо» и шагам); сцена 6 начинается из TRAY_SIDE.
export type TrayView = { readonly s: number; readonly cx: number; readonly cy: number };
export const TRAY_HOME: TrayView = { s: 1, cx: TRAY.cx, cy: TRAY.cy };
export const TRAY_SIDE: TrayView = { s: 0.55, cx: 680, cy: 640 };

export const mixView = (a: TrayView, b: TrayView, t: number): TrayView => ({
  s: a.s + (b.s - a.s) * t,
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
});

// Точка лотка (координаты TRAY) → точка экрана при виде v.
export const trayToScreen = (p: { readonly x: number; readonly y: number }, v: TrayView) => ({
  x: v.cx + (p.x - TRAY.cx) * v.s,
  y: v.cy + (p.y - TRAY.cy) * v.s,
});

// Рамка: всё внутри рисуется в координатах TRAY и показывается в виде v.
export const TrayFrame: React.FC<{ readonly v: TrayView; readonly children: React.ReactNode; readonly opacity?: number }> = ({ v, children, opacity = 1 }) => (
  <div
    style={box({
      left: 0,
      top: 0,
      width: 1080,
      height: 1920,
      opacity,
      transformOrigin: `${TRAY.cx}px ${TRAY.cy}px`,
      transform: `translate(${v.cx - TRAY.cx}px, ${v.cy - TRAY.cy}px) scale(${v.s})`,
    })}
  >
    {children}
  </div>
);

// Полный лоток (конец сцены 3): 20 оплаченных + 2 бонусных жетона,
// счётчик 22 и подпись «толук сапар». hideBonus — какие бонусные жетоны
// не рисовать (их анимирует сцена); glowBonus — подсветка пары «+2».
export const FullTray: React.FC<{
  readonly hideBonus?: readonly [boolean, boolean];
  readonly glowBonus?: number;
  readonly glowPaid?: number;
  readonly counter?: number;
  readonly counterOpacity?: number;
}> = ({ hideBonus = [false, false], glowBonus = 0, glowPaid = 0, counter = 22, counterOpacity = 1 }) => (
  <>
    <TrayBase fill={1} />
    {Array.from({ length: BG35_TOKENS.paid }, (_, i) => {
      const p = ringPos(i);
      return <Token key={`p${i}`} kind="paid" x={p.x} y={p.y} glow={glowPaid} />;
    })}
    {[0, 1].map((j) => {
      const p = bonusPos(j);
      return hideBonus[j] ? (
        <Socket key={`b${j}`} x={p.x} y={p.y} r={TRAY.bonusR} bonus />
      ) : (
        <Token key={`b${j}`} kind="bonus" x={p.x} y={p.y} r={TRAY.bonusR} glow={glowBonus} />
      );
    })}
    <Odometer v={counter} x={TRAY.cx} y={TRAY.cy - 26} color={counter >= 21 ? C.mintDeep : C.navy} opacity={counterOpacity} />
    <div
      style={box({
        left: TRAY.cx - 200,
        top: TRAY.cy + 72,
        width: 400,
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: 36,
        color: C.muted,
        opacity: counterOpacity,
      })}
    >
      {BG35_TEXT.fill.counterOf}
    </div>
  </>
);
