// Сцена trip: мини-кадры большой карточки «1 толук сапар» (условный
// пример). Вид сбоку: панельный дом слева, школа справа, горы Ала-Тоо,
// дорога. Белая машина с пристёгнутым ребёнком едет утром дом → школа,
// после уроков школа → дом, где ребёнка встречает мама.
// Ребёнок выходит на тротуар со стороны бордюра (за машиной), поэтому
// фигурка появляется из-за кузова, а не на проезжей части.
import type React from "react";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { clamp } from "./motion";
import { Figure, HomeBlock, MiniBackdrop, SchoolHouse, SideCar } from "./Street";
import { box } from "./World";

// Размер мини-кадра и линия тротуара (верх дороги).
export const FR = { w: 900, h: 290, road: 214 } as const;
export const HOME_X = 128; // середина дома, дверь подъезда
export const SCHOOL_X = 742; // середина школы
export const SCHOOL_S = 0.76;
export const SCHOOL_DOOR = SCHOOL_X + (147 - 170) * SCHOOL_S; // дверь школы
export const CAR_S = 0.5;
export const CAR_Y = FR.road + 34; // линия колёс (дальняя полоса)
export const CAR_HALF = 248 * CAR_S; // половина длины кузова
export const FIG = { kid: 64, mom: 92 } as const;

// Мягкое облако (дрейфует медленно — кадр не стоит на месте).
const Cloud: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={150 * s} height={60 * s} viewBox="0 0 150 60" style={box({ left: x, top: y, opacity: 0.92 })}>
    <ellipse cx={45} cy={38} rx={38} ry={18} fill="#FFFFFF" />
    <ellipse cx={80} cy={28} rx={34} ry={24} fill="#FFFFFF" />
    <ellipse cx={110} cy={40} rx={32} ry={16} fill="#FFFFFF" />
  </svg>
);

export type FigState = { readonly x: number; readonly step?: number; readonly wave?: number; readonly o?: number; readonly s?: number };

// Один мини-кадр. f — кадр сцены (для дрейфа облаков).
export const TripFrame: React.FC<{
  readonly f: number;
  readonly afternoon?: boolean;
  readonly car: { readonly x: number; readonly dir: 1 | -1; readonly wheel: number; readonly bob: number; readonly kids: number };
  // дети на тротуаре (идут в школу / к маме)
  readonly kids?: readonly (FigState & { readonly coat?: string })[];
  readonly mom?: FigState | null;
  readonly children?: React.ReactNode;
}> = ({ f, afternoon, car, kids = [], mom, children }) => {
  const drift = (f * 0.35) % (FR.w + 300);
  return (
    <div
      style={{
        position: "relative",
        width: FR.w,
        height: FR.h,
        overflow: "hidden",
        borderRadius: 22,
        boxShadow: "inset 0 0 0 3px rgba(20,40,90,0.14)",
      }}
    >
      <MiniBackdrop w={FR.w} h={FR.h} afternoon={afternoon} road={FR.road} />
      <Cloud x={((afternoon ? 520 : 300) + drift) % (FR.w + 200) - 150} y={afternoon ? 26 : 18} s={0.9} />
      <Cloud x={((afternoon ? 80 : 640) + drift * 0.7) % (FR.w + 200) - 150} y={afternoon ? 64 : 58} s={0.7} />
      <HomeBlock x={HOME_X} y={FR.road + 2} s={0.3} />
      <SchoolHouse x={SCHOOL_X} y={FR.road + 2} s={SCHOOL_S} label={BG36_TEXT.school} />
      {/* люди на тротуаре — за машиной */}
      {mom ? (
        <div style={{ opacity: mom.o ?? 1 }}>
          <Figure x={mom.x} y={FR.road + 4} h={FIG.mom * (mom.s ?? 1)} kind="mom" wave={mom.wave ?? 0} step={mom.step ?? 0} />
        </div>
      ) : null}
      {kids.map((kid, i) =>
        (kid.o ?? 1) > 0 ? (
          <div key={i} style={{ opacity: kid.o ?? 1 }}>
            <Figure x={kid.x} y={FR.road + 4} h={FIG.kid * (kid.s ?? 1)} kind="kid" coat={kid.coat} wave={kid.wave ?? 0} step={kid.step ?? 0} />
          </div>
        ) : null,
      )}
      <SideCar x={car.x} y={CAR_Y} s={CAR_S} dir={car.dir} wheel={car.wheel} bob={car.bob} kids={car.kids} />
      {children}
    </div>
  );
};

// Значок «солнце» (утро) и «солнце к вечеру» (после уроков).
export const SunIcon: React.FC<{ readonly size: number; readonly late?: boolean }> = ({ size, late }) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40" style={{ display: "block" }}>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      if (late && Math.sin(a) > 0.2) return null;
      return (
        <path
          key={i}
          d={`M ${Math.cos(a) * 12} ${Math.sin(a) * 12} L ${Math.cos(a) * 17} ${Math.sin(a) * 17}`}
          stroke={late ? C.yellow : C.navy}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
    })}
    {late ? (
      <>
        <path d="M -9 4 A 9 9 0 0 1 9 4 Z" fill={C.yellow} />
        <path d="M -17 6 L 17 6" stroke={C.yellow} strokeWidth={3} strokeLinecap="round" />
      </>
    ) : (
      <circle r={8.5} fill={C.navy} />
    )}
  </svg>
);

// Метка города: булавка и «Бишкек».
export const CityChip: React.FC<{ readonly size?: number }> = ({ size = 30 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: `${size * 0.16}px ${size * 0.5}px ${size * 0.2}px ${size * 0.36}px`,
      borderRadius: 999,
      backgroundColor: C.white,
      border: `3px solid ${C.navy}`,
      color: C.navy,
      fontFamily,
      fontSize: size,
      fontWeight: 900,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
    }}
  >
    <svg width={size * 0.8} height={size * 0.8} viewBox="-12 -14 24 28" style={{ display: "block" }}>
      <path d="M 0 13 C -4 6 -10 1 -10 -4 A 10 10 0 0 1 10 -4 C 10 1 4 6 0 13 Z" fill={C.red} />
      <circle cx={0} cy={-4} r={3.8} fill="#FFFFFF" />
    </svg>
    {BG36_TEXT.city}
  </div>
);

// Галочка «выполнено» в зелёном кружке (рисуется штрихом).
export const DoneMark: React.FC<{ readonly size: number; readonly draw: number }> = ({ size, draw }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", opacity: clamp(draw * 3) }}>
    <circle cx={20} cy={20} r={18} fill={C.green} />
    <path
      d="M 11 20.5 L 17.5 27 L 29.5 13.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={`${clamp(draw)} 1`}
    />
  </svg>
);
