// Видеостена сцены «trial» (локальные px стены 940×500): условный пример
// «Эгер топ түзүлсө». Две строки полной поездки — утром ҮЙ → МЕКТЕП, после
// уроков МЕКТЕП → ҮЙ (белая машина с жёлтой полосой едет по линии), справа
// отметка «1-толук сыноо сапары — акысыз», внизу — решение родителя.
import React from "react";
import { interpolate } from "remotion";
import { fontFamily } from "../../../fonts";
import { BG42_TEXT } from "../script";
import { C, clamp, easeInOut, lerp, pop, ramp } from "../theme";
import { CarIcon, HouseIcon, ParentIcon, SchoolIcon } from "../ui";

export type TrialWallBeats = {
  readonly morning: number;
  readonly afternoon: number;
  readonly free: number;
  readonly decision: number;
};

const ROUTE = { x0: 74, x1: 556 } as const;

const Stop: React.FC<{ readonly x: number; readonly y: number; readonly kind: "home" | "school"; readonly lit: number }> = ({ x, y, kind, lit }) => (
  <div
    style={{
      position: "absolute",
      left: x - 40,
      top: y - 40,
      width: 80,
      height: 80,
      borderRadius: 24,
      background: C.white,
      border: `5px solid ${lit > 0.5 ? C.yellow : "#C9D6EA"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${1 + 0.08 * lit})`,
    }}
  >
    {kind === "home" ? <HouseIcon size={52} /> : <SchoolIcon size={52} />}
  </div>
);

/** Строка маршрута: подпись, две остановки, линия и машина (t: 0…1 — путь). */
const RouteRow: React.FC<{
  readonly f: number;
  readonly y: number;
  readonly label: string;
  readonly from: "home" | "school";
  readonly to: "home" | "school";
  readonly at: number;
  readonly appear: number;
}> = ({ f, y, label, from, to, at, appear }) => {
  const p = pop(f, appear, 16, 140);
  const t = easeInOut(ramp(f, at, at + 33, (x) => x));
  const carX = lerp(ROUTE.x0 + 30, ROUTE.x1 - 30, t);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: interpolate(p, [0, 0.4], [0, 1], clamp), transform: `translateX(${(1 - p) * -30}px)` }}>
      <div style={{ position: "absolute", left: 24, top: y - 84, fontFamily, fontWeight: 900, fontSize: 32, color: C.white }}>{label}</div>
      <div style={{ position: "absolute", left: ROUTE.x0, top: y - 6, width: ROUTE.x1 - ROUTE.x0, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left: ROUTE.x0, top: y - 6, width: (ROUTE.x1 - ROUTE.x0) * t, height: 12, borderRadius: 6, background: C.yellow }} />
      <Stop x={ROUTE.x0} y={y} kind={from} lit={t > 0 ? 1 : 0} />
      <Stop x={ROUTE.x1} y={y} kind={to} lit={t >= 1 ? 1 : 0} />
      {t > 0 && t < 1 ? (
        <div style={{ position: "absolute", left: carX - 55, top: y - 62 }}>
          <CarIcon width={110} wheel={t * 900} />
        </div>
      ) : null}
    </div>
  );
};

export const TrialWall: React.FC<{ readonly f: number; readonly b: TrialWallBeats }> = ({ f, b }) => {
  const head = pop(f, 0, 16, 140);
  const free = pop(f, b.free, 11, 170);
  const dec = pop(f, b.decision, 15, 140);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily }}>
      {/* заголовок условного примера */}
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 18,
          padding: "8px 24px",
          borderRadius: 999,
          background: C.yellow,
          color: C.navy,
          fontWeight: 1000,
          fontSize: 36,
          opacity: interpolate(head, [0, 0.4], [0, 1], clamp),
          transform: `scale(${0.85 + 0.15 * head})`,
          transformOrigin: "0 50%",
        }}
      >
        {BG42_TEXT.ifGroup}
      </div>
      <RouteRow f={f} y={168} label={BG42_TEXT.morning} from="home" to="school" at={b.morning} appear={b.morning - 14} />
      <RouteRow f={f} y={302} label={BG42_TEXT.afterSchool} from="school" to="home" at={b.afternoon} appear={b.afternoon - 14} />
      {/* отметка: первая полная пробная поездка бесплатна */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 96,
          width: 270,
          padding: "18px 18px 20px",
          borderRadius: 26,
          background: C.yellow,
          border: `5px solid ${C.white}`,
          boxShadow: "0 16px 34px rgba(5, 15, 45, 0.4)",
          color: C.navy,
          fontWeight: 1000,
          fontSize: 34,
          lineHeight: 1.12,
          textAlign: "center",
          opacity: interpolate(free, [0, 0.3], [0, 1], clamp),
          transform: `rotate(${-4 * free}deg) scale(${0.6 + 0.4 * free})`,
        }}
      >
        {BG42_TEXT.trialFree}
      </div>
      {/* решение родителя после пробы */}
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 370,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 24px 10px 14px",
          borderRadius: 22,
          background: C.white,
          color: C.navy,
          fontWeight: 900,
          fontSize: 32,
          whiteSpace: "nowrap",
          opacity: interpolate(dec, [0, 0.4], [0, 1], clamp),
          transform: `translateY(${(1 - dec) * 24}px)`,
        }}
      >
        <ParentIcon size={46} />
        {BG42_TEXT.continue}
      </div>
    </div>
  );
};
