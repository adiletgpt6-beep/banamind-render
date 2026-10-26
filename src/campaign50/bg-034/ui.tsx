// Общие элементы ролика BG-034: светлый «стол» с мягкими пятнами,
// бумажный билет-конверт BalaGo (корешок с перфорацией, клапан конверта),
// оттиск печати «ТОЛУК / САПАР», резиновый штамп, компостер, плашки,
// иконки дома и школы, стрелки в надписях и метка условного примера.
// Все размеры — px кадра 1080×1920; безопасная зона Reels: сверху ≥ 250,
// снизу ≥ 400, справа ≥ 150 px.
import type React from "react";
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../../two-schedules-2d/rig/motion";
import { C } from "./palette";
import { BG34_TEXT, BG34_VIDEO } from "./script";

// Безопасная область текста: слева 60, справа 150 px → ширина 870 px.
export const SAFE = {
  left: 60,
  right: 150,
  top: 262,
  bottom: 400,
  width: 870,
} as const;

// Появление элемента: прозрачность и подъём снизу.
export const rise = (
  f: number,
  at: number,
  d = 12,
  dist = 26,
): React.CSSProperties => {
  const a = easeOut((f - at) / d);
  return { opacity: a, translate: `0 ${(1 - a) * dist}px` };
};

// Упругое появление (масштаб с небольшим перелётом), 0…~1.06…1.
export const popScale = (f: number, at: number, d = 12) => {
  const t = clamp((f - at) / d);
  if (t <= 0) return 0;
  const s = 1.70158 * 1.2;
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};

const ArrowGlyph: React.FC<{ readonly both?: boolean }> = ({ both }) => (
  <svg
    viewBox="0 0 40 20"
    style={{
      width: "1.05em",
      height: "0.6em",
      margin: "0 0.22em",
      verticalAlign: "0.06em",
      overflow: "visible",
    }}
  >
    <path
      d={
        both
          ? "M 6 10 L 34 10 M 26 3 L 34 10 L 26 17 M 14 3 L 6 10 L 14 17"
          : "M 3 10 L 34 10 M 25 2 L 35 10 L 25 18"
      }
      fill="none"
      stroke="currentColor"
      strokeWidth={4.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Текст со стрелками «→» и «↔», нарисованными линией (одинаково во всех шрифтах).
export const Txt: React.FC<{ readonly children: string }> = ({ children }) => {
  const parts = children.split(/\s*(→|↔)\s*/);
  return (
    <>
      {parts.map((p, i) =>
        p === "→" ? (
          <ArrowGlyph key={i} />
        ) : p === "↔" ? (
          <ArrowGlyph key={i} both />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export const Check: React.FC<{
  readonly size: number;
  readonly color?: string;
  readonly width?: number;
}> = ({ size, color = "#FFFFFF", width = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <path
      d="M 4 10.5 L 8.5 15 L 16 5.5"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HomeIcon: React.FC<{
  readonly size: number;
  readonly color?: string;
}> = ({ size, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M 6 19 L 20 7 L 34 19"
      fill="none"
      stroke={color}
      strokeWidth={3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 10 17 L 10 33 L 30 33 L 30 17"
      fill={C.yellowSoft}
      stroke={color}
      strokeWidth={3.2}
      strokeLinejoin="round"
    />
    <rect x={17} y={23} width={7} height={10} rx={1.5} fill={color} />
  </svg>
);

export const SchoolIcon: React.FC<{
  readonly size: number;
  readonly color?: string;
}> = ({ size, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M 5 16 L 20 8 L 35 16"
      fill="none"
      stroke={color}
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x={8}
      y={16}
      width={24}
      height={17}
      fill="#FFFFFF"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <rect x={12} y={20} width={4} height={4} fill={color} />
    <rect x={24} y={20} width={4} height={4} fill={color} />
    <rect
      x={17.5}
      y={25}
      width={5}
      height={8}
      fill={C.yellow}
      stroke={color}
      strokeWidth={1.6}
    />
    <circle
      cx={20}
      cy={13}
      r={2.4}
      fill={C.yellow}
      stroke={color}
      strokeWidth={1.4}
    />
  </svg>
);

// Пиктограмма «утро» (солнце над горизонтом) и «после уроков» (рюкзак).
export const SunIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle
      cx={20}
      cy={24}
      r={8}
      fill={C.yellow}
      stroke={C.yellowDeep}
      strokeWidth={2}
    />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = Math.PI * (1 + i / 4);
      return (
        <path
          key={i}
          d={`M ${20 + 12 * Math.cos(a)} ${24 + 12 * Math.sin(a)} L ${20 + 17 * Math.cos(a)} ${24 + 17 * Math.sin(a)}`}
          stroke={C.yellowDeep}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      );
    })}
    <path
      d="M 4 30 L 36 30"
      stroke={C.navy}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  </svg>
);

export const BagIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M 14 12 Q 14 6 20 6 Q 26 6 26 12"
      fill="none"
      stroke={C.navy}
      strokeWidth={2.6}
    />
    <rect
      x={9}
      y={11}
      width={22}
      height={24}
      rx={6}
      fill="#6FA8DC"
      stroke={C.navy}
      strokeWidth={2.6}
    />
    <rect
      x={13}
      y={22}
      width={14}
      height={8}
      rx={2.5}
      fill={C.yellow}
      stroke={C.navy}
      strokeWidth={2}
    />
  </svg>
);

// Светлый «стол»: тёплый фон, мягкие пятна и едва заметная точечная сетка.
export const Paper: React.FC<{ readonly tint?: "warm" | "sky" }> = ({
  tint = "warm",
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: tint === "warm" ? C.paper : "#F6FAFE",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: -260,
        top: -220,
        width: 820,
        height: 820,
        borderRadius: 410,
        backgroundColor: tint === "warm" ? C.yellowSoft : C.sky,
        opacity: 0.9,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -240,
        bottom: -160,
        width: 700,
        height: 700,
        borderRadius: 350,
        backgroundColor: tint === "warm" ? C.sky : C.yellowSoft,
        opacity: 0.85,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(rgba(20,40,90,0.07) 2px, transparent 2.5px)",
        backgroundSize: "36px 36px",
      }}
    />
  </div>
);

// Метка «Шарттуу мисал: топ түзүлгөндөн кийин» — сюжет показан как
// условный будущий пример, а не как уже доступная поездка.
export const ExampleTag: React.FC<{
  readonly f: number;
  readonly at?: number;
  readonly top?: number;
}> = ({ f, at = 4, top = SAFE.top }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.left,
      right: SAFE.right,
      top,
      display: "flex",
      fontFamily,
      ...rise(f, at),
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 24px 10px 14px",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.95)",
        border: `3px solid ${C.yellow}`,
        color: C.navy,
        fontSize: 30,
        fontWeight: 800,
        boxShadow: "0 8px 20px rgba(20,40,90,0.12)",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: C.yellow,
          color: C.navy,
          fontSize: 22,
          fontWeight: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        i
      </div>
      {BG34_TEXT.example}
    </div>
  </div>
);

// Плашка-надпись (тёмно-синяя или жёлтая).
export const Pill: React.FC<{
  readonly children: React.ReactNode;
  readonly tone?: "navy" | "yellow" | "white" | "green";
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, tone = "navy", size = 40, style }) => {
  const bg =
    tone === "navy"
      ? C.navy
      : tone === "yellow"
        ? C.yellow
        : tone === "green"
          ? C.greenSoft
          : "#FFFFFF";
  const fg =
    tone === "navy" ? "#FFFFFF" : tone === "green" ? "#1F7A45" : C.navy;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: `${Math.round(size * 0.28)}px ${Math.round(size * 0.7)}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color: fg,
        fontFamily,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        border:
          tone === "white"
            ? `3px solid ${C.skyDeep}`
            : tone === "green"
              ? `3px solid ${C.trialEdge}`
              : "none",
        boxShadow: "0 10px 26px rgba(20,40,90,0.16)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Билет-конверт BalaGo ----------
// Пропорции 200 × 124: слева корешок с жёлтой полосой и логотипом,
// перфорация с полукруглыми вырезами, справа поле билета с клапаном
// конверта. children рисуются в поле билета (координаты 0…1 по ширине
// поля через проценты). flap — клапан открыт (0…1). dashed — пунктирный
// контур (пробная поездка: не из пакета).
export const TICKET_RATIO = 124 / 200;
export const STUB = 0.28; // доля корешка

export const TicketBody: React.FC<{
  readonly w: number;
  readonly flap?: number;
  readonly dashed?: boolean;
  readonly fill?: string;
  readonly edge?: string;
  readonly band?: string;
  readonly logo?: boolean;
  readonly glow?: number;
  readonly children?: React.ReactNode;
}> = ({
  w,
  flap = 0,
  dashed,
  fill = C.ticket,
  edge = C.ticketEdge,
  band = C.ticketBand,
  logo = true,
  glow = 0,
  children,
}) => {
  const h = w * TICKET_RATIO;
  const sx = 200 * STUB;
  const body = `M 8 0 H ${sx - 8} A 8 8 0 0 0 ${sx + 8} 0 H 192 Q 200 0 200 8 V 116 Q 200 124 192 124 H ${sx + 8} A 8 8 0 0 0 ${sx - 8} 124 H 8 Q 0 124 0 116 V 8 Q 0 0 8 0 Z`;
  const stub = `M 8 0 H ${sx - 8} A 8 8 0 0 0 ${sx} 8 V 116 A 8 8 0 0 0 ${sx - 8} 124 H 8 Q 0 124 0 116 V 8 Q 0 0 8 0 Z`;
  // клапан конверта: треугольник от верхнего края поля к его центру;
  // при открытии переворачивается вверх (масштаб по y от 1 до −1).
  const fx0 = sx + 8;
  const fx1 = 196;
  const fy = 52;
  const k = 1 - 2 * clamp(flap);
  const sw = Math.max(1.6, 400 / w);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 200 124"
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        {glow > 0 ? (
          <path
            d={body}
            fill="none"
            stroke={C.yellow}
            strokeWidth={10}
            opacity={glow * 0.8}
          />
        ) : null}
        <path
          d={body}
          fill={fill}
          stroke={edge}
          strokeWidth={sw}
          strokeDasharray={dashed ? "7 5" : undefined}
        />
        {dashed ? null : <path d={stub} fill={band} opacity={0.9} />}
        <path
          d={`M ${sx} 12 V 112`}
          stroke={dashed ? edge : "rgba(20,40,90,0.35)"}
          strokeWidth={sw * 0.8}
          strokeDasharray="4 4"
        />
        {/* клапан конверта */}
        {k > 0 ? (
          <path
            d={`M ${fx0} 2 L ${(fx0 + fx1) / 2} ${2 + fy * k} L ${fx1} 2`}
            fill={k > 0.02 ? "rgba(231,214,166,0.35)" : "none"}
            stroke={edge}
            strokeWidth={sw * 0.9}
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M ${fx0} 2 L ${(fx0 + fx1) / 2} ${2 + fy * k} L ${fx1} 2 Z`}
            fill="#FFF3CF"
            stroke={edge}
            strokeWidth={sw * 0.9}
            strokeLinejoin="round"
          />
        )}
      </svg>
      {logo && !dashed ? (
        <Img
          src={staticFile(BG34_VIDEO.logo)}
          style={{
            position: "absolute",
            left: w * STUB * 0.5 - w * 0.1,
            top: h * 0.5 - w * 0.1,
            width: w * 0.2,
            height: w * 0.2,
            borderRadius: w * 0.1,
            objectFit: "cover",
            boxShadow: "0 2px 6px rgba(20,40,90,0.18)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: w * STUB + w * 0.03,
          top: 0,
          width: w * (1 - STUB) - w * 0.06,
          height: h,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Маленький билет пакета: на поле — дом → школа → дом.
export const MiniTicket: React.FC<{
  readonly w: number;
  readonly flap?: number;
  readonly glow?: number;
  readonly stamp?: number; // оттиск печати 0…1
  readonly stampRot?: number;
  readonly stampW?: number; // ширина оттиска (доля ширины билета)
}> = ({ w, flap = 0, glow = 0, stamp = 0, stampRot = -12, stampW = 0.62 }) => {
  const h = w * TICKET_RATIO;
  const ic = w * 0.13;
  return (
    <TicketBody w={w} flap={flap} glow={glow}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: h * 0.12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: w * 0.01,
          color: C.navy,
          fontSize: w * 0.07,
        }}
      >
        <HomeIcon size={ic} />
        <Txt>→</Txt>
        <SchoolIcon size={ic} />
        <Txt>→</Txt>
        <HomeIcon size={ic} />
      </div>
      {stamp > 0 ? (
        <StampMark
          w={w * stampW}
          t={stamp}
          rot={stampRot}
          style={{ left: w * 0.02, top: h * 0.08 }}
        />
      ) : null}
    </TicketBody>
  );
};

// Оттиск печати «ТОЛУК / САПАР» (две строки): t — появление 0…1
// (ударом: из крупного прозрачного в чёткий оттиск).
export const StampMark: React.FC<{
  readonly w: number;
  readonly t: number;
  readonly rot?: number;
  readonly style?: React.CSSProperties;
}> = ({ w, t, rot = -12, style }) => {
  const a = clamp(t);
  const s = 1 + 0.5 * (1 - easeOut(a));
  const [l1, l2] = BG34_TEXT.ten.stamp.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: w * 0.52,
        borderRadius: w * 0.08,
        border: `${Math.max(2, w * 0.035)}px solid ${C.stampInk}`,
        color: C.stampInk,
        fontFamily,
        fontWeight: 1000,
        fontSize: w * 0.17,
        lineHeight: 1.0,
        letterSpacing: w * 0.006,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: Math.min(1, a * 1.6) * 0.92,
        mixBlendMode: "multiply",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <span>{l1}</span>
      <span>{l2}</span>
    </div>
  );
};

// Резиновый штамп (вид сбоку): ручка, корпус, подушка. (x, y) — низ подушки.
export const RubberStamp: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly tilt?: number;
}> = ({ x, y, s = 1, tilt = 0 }) => (
  <svg
    width={160 * s}
    height={220 * s}
    viewBox="-80 -220 160 220"
    style={{
      position: "absolute",
      left: x - 80 * s,
      top: y - 220 * s,
      overflow: "visible",
      transform: `rotate(${tilt}deg)`,
      transformOrigin: "50% 100%",
    }}
  >
    <ellipse
      cx={0}
      cy={-178}
      rx={34}
      ry={30}
      fill="#B8834F"
      stroke="#7A5A3A"
      strokeWidth={4}
    />
    <rect
      x={-13}
      y={-160}
      width={26}
      height={70}
      rx={8}
      fill="#C89462"
      stroke="#7A5A3A"
      strokeWidth={4}
    />
    <rect x={-62} y={-96} width={124} height={54} rx={12} fill={C.navy} />
    <rect x={-56} y={-90} width={112} height={12} rx={6} fill="#2E4A8A" />
    <rect
      x={-66}
      y={-44}
      width={132}
      height={22}
      rx={6}
      fill={C.yellow}
      stroke={C.yellowDeep}
      strokeWidth={3}
    />
    <rect x={-62} y={-22} width={124} height={22} rx={4} fill={C.stampInk} />
  </svg>
);

// Компостер-щипцы (как у кондуктора), вид спереди: две ручки с жёлтыми
// накладками и пружиной сходятся к шарниру, внизу — головка с пуансоном.
// press — нажатие 0…1 (ручки сжимаются, головка опускается). (x, y) — точка пробивки.
export const Punch: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly press: number;
}> = ({ x, y, s = 1, press }) => {
  const p = clamp(press);
  const spread = 70 - 34 * p; // разведение концов ручек
  const dy = -46 * (1 - p); // головка над билетом
  return (
    <svg
      width={260 * s}
      height={360 * s}
      viewBox="-130 -340 260 360"
      style={{
        position: "absolute",
        left: x - 130 * s,
        top: y - 340 * s,
        overflow: "visible",
      }}
    >
      <ellipse
        cx={0}
        cy={4}
        rx={40 * (0.4 + 0.6 * p)}
        ry={8}
        fill="rgba(20,40,90,0.16)"
      />
      <g transform={`translate(0 ${dy})`}>
        {/* ручки */}
        <path
          d={`M -8 -120 Q ${-spread * 0.6} -200 ${-spread} -300`}
          stroke={C.navy}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M 8 -120 Q ${spread * 0.6} -200 ${spread} -300`}
          stroke={C.navy}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${-spread * 0.82} -250 L ${-spread} -300`}
          stroke={C.yellow}
          strokeWidth={26}
          strokeLinecap="round"
        />
        <path
          d={`M ${spread * 0.82} -250 L ${spread} -300`}
          stroke={C.yellow}
          strokeWidth={26}
          strokeLinecap="round"
        />
        {/* пружина между ручками */}
        <path
          d={`M ${-spread * 0.38} -175 q 6 -10 12 0 q 6 10 12 0 q 6 -10 12 0 q 6 10 12 0 L ${spread * 0.38} -175`}
          stroke="#9AA6B8"
          strokeWidth={5}
          fill="none"
        />
        {/* шарнир и челюсти */}
        <circle
          cx={0}
          cy={-118}
          r={18}
          fill="#C9D1DD"
          stroke={C.navy}
          strokeWidth={6}
        />
        <rect x={-22} y={-104} width={44} height={70} rx={10} fill={C.navy} />
        <rect
          x={-10}
          y={-36}
          width={20}
          height={34}
          rx={5}
          fill="#C9D1DD"
          stroke={C.navy}
          strokeWidth={4}
        />
      </g>
    </svg>
  );
};

// Пробитое отверстие в билете (с маленькими конфетти бумаги).
export const PunchHole: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly t: number;
}> = ({ x, y, r, t }) => {
  if (t <= 0) return null;
  const a = clamp(t);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          backgroundColor: "#DCE6F2",
          border: `5px solid ${C.yellow}`,
          boxSizing: "border-box",
          boxShadow:
            "inset 0 4px 8px rgba(20,40,90,0.35), 0 0 0 3px rgba(20,40,90,0.25)",
          transform: `scale(${0.4 + 0.6 * easeOut(a * 3)})`,
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = (i / 5) * Math.PI * 2 + 0.6;
        const d = r * (1.2 + 2.2 * easeOut(a));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r + Math.cos(ang) * d - 5,
              top: r + Math.sin(ang) * d - 5 + 30 * a * a,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: C.ticketEdge,
              opacity: 1 - a,
            }}
          />
        );
      })}
    </div>
  );
};

// Крупная надпись по центру безопасной зоны.
export const Headline: React.FC<{
  readonly top: number;
  readonly size: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly color?: string;
}> = ({ top, size, children, style, color = C.navy }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.left,
      width: SAFE.width,
      top,
      textAlign: "center",
      fontFamily,
      fontSize: size,
      fontWeight: 1000,
      lineHeight: 1.08,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

// Стопка из 10 билетов пакета (центр (x, y), ширина билета w), со
// штампами и бумажной лентой «10» (band 0…1). Видны края всех десяти.
export const TicketStack: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly band?: number;
  readonly stamped?: boolean;
  readonly glow?: number;
  readonly style?: React.CSSProperties;
}> = ({ x, y, w, band = 0, stamped = true, glow = 0, style }) => {
  const h = w * TICKET_RATIO;
  const step = w * 0.022;
  const b = clamp(band);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        ...style,
      }}
    >
      {Array.from({ length: 10 }, (_, i) => {
        const k = 9 - i; // нижние — дальше
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: k * step * 0.6,
              top: k * step,
              width: w,
              height: h,
              filter:
                i === 9
                  ? "drop-shadow(0 10px 16px rgba(20,40,90,0.2))"
                  : undefined,
            }}
          >
            {i === 9 ? (
              <MiniTicket
                w={w}
                stamp={stamped ? 1 : 0}
                glow={glow}
                stampW={0.5}
              />
            ) : (
              <TicketBody w={w} logo={false} />
            )}
          </div>
        );
      })}
      {b > 0 ? (
        <div
          style={{
            position: "absolute",
            // лента на корешке: поле билета (печать и ҮЙ → МЕКТЕП → ҮЙ) открыто
            left: w * STUB * 0.5 - w * 0.075,
            top: -h * 0.06,
            width: w * 0.15,
            height: (h + 9 * step) * (0.2 + 0.8 * easeOut(b)) + h * 0.12,
            backgroundColor: C.navy,
            border: `3px solid ${C.yellow}`,
            borderRadius: 8,
            boxShadow: "0 6px 14px rgba(20,40,90,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontWeight: 1000,
            fontSize: w * 0.1,
            color: C.yellow,
            overflow: "hidden",
          }}
        >
          <span style={{ opacity: clamp((b - 0.6) / 0.4) }}>10</span>
        </div>
      ) : null}
    </div>
  );
};
