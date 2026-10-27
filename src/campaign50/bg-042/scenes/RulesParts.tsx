// Видеостена сцены «rules» (локальные px стены STUDIO.wall: 940×500).
// 1) по словам ведущего всплывают карточки «Дарек», «Мектеп», «Убакыт»;
// 2) карточки уходят в компактную колонку слева, справа — светлая схема
//    города (без подписей): дома семей разными цветами, от «нашего» дома
//    расходятся мягкие круги поиска, три совместимых дома соединяются
//    пунктиром с одной школой — это и есть подходящая группа;
// 3) внизу — честные плашки: поиск до 2 недель, группа не гарантирована.
import React from "react";
import { interpolate } from "remotion";
import { fontFamily } from "../../../fonts";
import { BG42_TEXT } from "../script";
import { C, clamp, clamp01, easeInOut, lerp, pop, ramp } from "../theme";
import { BrandLogo, BrandWord, ClockIcon, HourglassIcon, HouseIcon, SchoolIcon } from "../ui";

/** Кадры (сцены) опорных моментов стены. */
export type RulesWallBeats = {
  readonly address: number;
  readonly school: number;
  readonly time: number;
  readonly map: number;
  readonly radar: number;
  readonly match: number;
  readonly noStart: number;
};

// Карта: прямоугольник внутри стены.
const MAP = { x: 268, y: 26, w: 646, h: 448 } as const;
// Дома (координаты карты) и школа. ok — совместим по адресу/школе/времени.
const HOMES: readonly { readonly x: number; readonly y: number; readonly ok: boolean; readonly c: string }[] = [
  { x: 110, y: 205, ok: true, c: C.yellow }, // «наш» дом
  { x: 235, y: 145, ok: true, c: C.yellow },
  { x: 250, y: 280, ok: true, c: C.yellow },
  { x: 560, y: 130, ok: false, c: C.blue },
  { x: 585, y: 300, ok: false, c: C.teal },
  { x: 70, y: 330, ok: false, c: C.coral },
  { x: 470, y: 330, ok: false, c: C.blue },
  { x: 610, y: 215, ok: false, c: C.coral },
];
const SCHOOL = { x: 405, y: 205 };

const Card: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly k: number; // 0 — большая карточка в ряду, 1 — компактная в колонке
  readonly i: number;
  readonly label: string;
  readonly icon: React.ReactNode;
}> = ({ f, at, k, i, label, icon }) => {
  const p = pop(f, at, 13, 150);
  const big = { x: 40 + i * 300, y: 95, w: 260, h: 300 };
  const small = { x: 16, y: 34 + i * 148, w: 240, h: 128 };
  const x = lerp(big.x, small.x, k);
  const y = lerp(big.y, small.y, k);
  const w = lerp(big.w, small.w, k);
  const h = lerp(big.h, small.h, k);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: C.white,
        border: `5px solid ${C.yellow}`,
        boxShadow: "0 16px 34px rgba(5, 15, 45, 0.35)",
        display: "flex",
        flexDirection: k > 0.5 ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: lerp(16, 12, k),
        fontFamily,
        fontWeight: 1000,
        fontSize: lerp(46, 33, k),
        color: C.navy,
        opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + 0.2 * p})`,
      }}
    >
      <div style={{ width: lerp(130, 56, k), height: lerp(130, 56, k), display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      {label}
    </div>
  );
};

/** Логотип BalaGo на стене до первой карточки (ведущий: «BalaGo'до…»). */
const BrandIntro: React.FC<{ readonly f: number; readonly out: number }> = ({ f, out }) => {
  const p = pop(f, 6, 15, 130);
  const o = 1 - ramp(f, out - 6, out + 4);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: o * interpolate(p, [0, 0.4], [0, 1], clamp) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "26px 42px", borderRadius: 40, background: C.white, transform: `scale(${(0.85 + 0.15 * p) * (0.9 + 0.1 * o)})`, boxShadow: "0 16px 34px rgba(5, 15, 45, 0.35)" }}>
        <BrandLogo size={130} />
        <BrandWord size={96} />
      </div>
    </div>
  );
};

export const RulesWall: React.FC<{ readonly f: number; readonly b: RulesWallBeats; readonly fadeToLogo: number }> = ({ f, b, fadeToLogo }) => {
  // карточки уходят в колонку, появляется карта
  const k = easeInOut(ramp(f, b.map, b.map + 16, (x) => x));
  const mapIn = pop(f, b.map + 4, 16, 130);
  const radar = f >= b.radar ? (f - b.radar) / 30 : -1;
  const match = easeInOut(ramp(f, b.match, b.match + 14, (x) => x));
  const route = ramp(f, b.match + 4, b.match + 26, (x) => x);
  const chips = pop(f, b.noStart, 15, 140);
  const chips2 = pop(f, b.noStart + 6, 15, 140);
  const iconSize = 120;
  const our = HOMES[0];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - fadeToLogo }}>
      {/* карта города */}
      <div
        style={{
          position: "absolute",
          left: MAP.x,
          top: MAP.y,
          width: MAP.w,
          height: MAP.h,
          borderRadius: 26,
          overflow: "hidden",
          background: "#EAF2FB",
          opacity: interpolate(mapIn, [0, 0.4], [0, 1], clamp),
          transform: `scale(${0.92 + 0.08 * mapIn})`,
          transformOrigin: "70% 50%",
          boxShadow: "0 16px 34px rgba(5, 15, 45, 0.35)",
        }}
      >
        <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", inset: 0 }}>
          {/* горы на горизонте и зелень */}
          <path d={`M 0 70 L 70 34 L 130 58 L 200 22 L 270 54 L 340 18 L 420 52 L 500 26 L 580 50 L ${MAP.w} 30 L ${MAP.w} 90 L 0 90 Z`} fill="#C9D7EA" />
          <path d="M 186 30 L 200 22 L 214 31 L 200 28 Z M 326 26 L 340 18 L 354 27 L 340 24 Z M 486 34 L 500 26 L 514 35 L 500 32 Z" fill="#FFFFFF" />
          <rect x={300} y={300} width={90} height={70} rx={20} fill="#D5F0E1" />
          <rect x={40} y={390} width={120} height={50} rx={18} fill="#D5F0E1" />
          {/* улицы */}
          {[110, 180, 260, 340, 410].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={MAP.w} y2={y + 6} stroke="#FFFFFF" strokeWidth={9} />
          ))}
          {[60, 160, 280, 400, 510, 610].map((x) => (
            <line key={`v${x}`} x1={x} y1={90} x2={x - 8} y2={MAP.h} stroke="#FFFFFF" strokeWidth={9} />
          ))}
          {/* круги поиска от «нашего» дома */}
          {radar >= 0 && radar < 2.2
            ? [0, 0.33, 0.66].map((d) => {
                const t = radar - d;
                if (t < 0 || t > 1.2) return null;
                return <circle key={d} cx={our.x} cy={our.y} r={20 + 210 * t} fill="none" stroke={C.yellowDeep} strokeWidth={5 * (1.2 - t)} opacity={0.75 * (1 - t / 1.2)} />;
              })
            : null}
          {/* группа: пунктир от совместимых домов к школе */}
          {HOMES.filter((h) => h.ok).map((h, i) => {
            return (
              <line
                key={i}
                x1={h.x}
                y1={h.y}
                x2={h.x + (SCHOOL.x - h.x) * route}
                y2={h.y + (SCHOOL.y - h.y) * route}
                stroke={C.yellowDeep}
                strokeWidth={7}
                strokeDasharray="14 10"
                strokeLinecap="round"
                opacity={route > 0 ? 1 : 0}
              />
            );
          })}
        </svg>
        {/* дома */}
        {HOMES.map((h, i) => {
          const p = pop(f, b.map + 8 + i * 2, 14, 160);
          const dim = h.ok ? 1 : 1 - 0.6 * match;
          const hi = h.ok ? match : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: h.x - 30,
                top: h.y - 30,
                width: 60,
                height: 60,
                borderRadius: 30,
                background: C.white,
                border: `5px solid ${h.c}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: dim * interpolate(p, [0, 0.4], [0, 1], clamp),
                transform: `scale(${(0.6 + 0.4 * p) * (1 + 0.12 * hi)})`,
                boxShadow: hi > 0 ? `0 0 0 ${8 * hi}px rgba(255, 201, 14, 0.35)` : undefined,
              }}
            >
              <HouseIcon size={34} color={C.navy} accent={h.c} />
            </div>
          );
        })}
        {/* школа появляется вместе с маршрутом группы */}
        <div
          style={{
            position: "absolute",
            left: SCHOOL.x - 42,
            top: SCHOOL.y - 42,
            width: 84,
            height: 84,
            borderRadius: 24,
            background: C.white,
            border: `5px solid ${C.navy}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: clamp01(route * 3),
            transform: `scale(${0.7 + 0.3 * clamp01(route * 2)})`,
          }}
        >
          <SchoolIcon size={56} />
        </div>
        {/* честные плашки */}
        <div style={{ position: "absolute", left: 20, bottom: 18, display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, width: 600, fontFamily }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px 8px 12px",
              borderRadius: 18,
              background: C.navy,
              color: C.white,
              fontWeight: 900,
              fontSize: 31,
              whiteSpace: "nowrap",
              opacity: interpolate(chips, [0, 0.4], [0, 1], clamp),
              transform: `translateY(${(1 - chips) * 20}px)`,
            }}
          >
            <HourglassIcon size={38} color={C.white} accent={C.yellow} />
            {BG42_TEXT.searchUpTo}
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 14,
              background: C.white,
              border: `3px solid ${C.navy}`,
              color: C.navy,
              fontWeight: 900,
              fontSize: 28,
              whiteSpace: "nowrap",
              opacity: interpolate(chips2, [0, 0.4], [0, 1], clamp),
              transform: `translateY(${(1 - chips2) * 20}px)`,
            }}
          >
            {BG42_TEXT.noGuarantee}
          </div>
        </div>
      </div>
      <BrandIntro f={f} out={b.address} />
      {/* карточки данных */}
      <Card f={f} at={b.address} k={k} i={0} label={BG42_TEXT.address} icon={<HouseIcon size={iconSize * lerp(1, 0.44, k)} />} />
      <Card f={f} at={b.school} k={k} i={1} label={BG42_TEXT.school} icon={<SchoolIcon size={iconSize * lerp(1, 0.44, k)} />} />
      <Card f={f} at={b.time} k={k} i={2} label={BG42_TEXT.time} icon={<ClockIcon size={iconSize * lerp(1, 0.44, k)} minutes={40} />} />
    </div>
  );
};
