// 1. Хук. На столе мамы — кружка-подставка для ручек, на её боку крошечный
// «телевизор»: идёт выпуск шуточных офисных новостей. Сразу видны баннер
// «ШАШЫЛЫШ КАБАР», логотип канала и плашка «Тамаша, ойдон чыгарылган».
// Камера ныряет в экран кружки → студия на весь кадр; ведущий драматично
// показывает на часы на видеостене и разводит руками на «кайра көтөрүлдү».
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { fontFamily } from "../../../fonts";
import type { PoseIn } from "../Actor";
import { beats } from "../beats";
import { Camera, mixCam } from "../Camera";
import { useScene } from "../context";
import { BG42_TEXT } from "../script";
import { MUG_SCREEN } from "../sets/Office";
import { STUDIO } from "../sets/Studio";
import { C, clamp, drift, easeInOut, keys, pop, ramp } from "../theme";
import { BreakingBanner, LowerThird, NewsTopBar, SchoolIcon } from "../ui";
import { FULL_RECT, OfficeWorld, ScreenWindow, StudioWorld, anchorDeskHands, lerpRect, rectOnScreen, windowFraming } from "./common";
import { MUG_CLOSE, STUDIO_IN_SCREEN, officeMinutes } from "./shots";

/** Видеостена хука: большие часы (справа) и «мектеп 16:00» (слева). */
const HookWall: React.FC<{ readonly f: number; readonly min: number; readonly ring: number }> = ({ f, min, ring }) => {
  const W0 = STUDIO.wall;
  const cx = W0.w - 230;
  const cy = 280;
  const r = 150;
  const m = ((min % 60) / 60) * 360;
  const h = (((min / 60) % 12) / 12) * 360;
  const wob = Math.sin(f / 2.2) * 3 * ring;
  const hand = (ang: number, len: number, w: number, col: string) => (
    <line x1={cx} y1={cy} x2={cx + len * Math.sin((ang * Math.PI) / 180)} y2={cy - len * Math.cos((ang * Math.PI) / 180)} stroke={col} strokeWidth={w} strokeLinecap="round" />
  );
  const pin = pop(f, 20, 14);
  return (
    <>
      <svg width={W0.w} height={W0.h} style={{ position: "absolute", inset: 0 }}>
        {/* «звон» часов: мягкие дуги (без вспышек) */}
        {[0, 1].map((i) => (
          <path key={i} d={`M ${cx - r - 30 - i * 26} ${cy - 70} Q ${cx - r - 50 - i * 26} ${cy} ${cx - r - 30 - i * 26} ${cy + 70}`} stroke={C.yellow} strokeWidth={8} fill="none" strokeLinecap="round" opacity={ring * (0.8 - i * 0.3)} />
        ))}
        <g transform={`rotate(${wob} ${cx} ${cy + r})`}>
          <circle cx={cx - 96} cy={cy - 118} r={30} fill={C.yellow} />
          <circle cx={cx + 96} cy={cy - 118} r={30} fill={C.yellow} />
          <circle cx={cx} cy={cy} r={r + 14} fill={C.yellow} />
          <circle cx={cx} cy={cy} r={r} fill={C.white} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={cx + (r - 14) * Math.sin(a)} y1={cy - (r - 14) * Math.cos(a)} x2={cx + (r - (i % 3 ? 26 : 38)) * Math.sin(a)} y2={cy - (r - (i % 3 ? 26 : 38)) * Math.cos(a)} stroke={C.navy} strokeWidth={i % 3 ? 5 : 9} strokeLinecap="round" />;
          })}
          {hand(h, r * 0.5, 16, C.navy)}
          {hand(m, r * 0.78, 10, C.navy)}
          <circle cx={cx} cy={cy} r={13} fill={C.yellow} stroke={C.navy} strokeWidth={5} />
        </g>
      </svg>
      {/* слева: мектеп и время забрать ребёнка */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 130,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          fontFamily,
          opacity: interpolate(pin, [0, 0.4], [0, 1], clamp),
          transform: `translateY(${(1 - pin) * 30}px)`,
        }}
      >
        <div style={{ width: 170, height: 170, borderRadius: 40, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SchoolIcon size={128} />
        </div>
        <div style={{ padding: "8px 26px", borderRadius: 999, background: C.yellow, color: C.navy, fontWeight: 1000, fontSize: 56 }}>16:00</div>
      </div>
    </>
  );
};

export const HookScene: React.FC = () => {
  const { f, abs, at, tl } = useScene("hook");
  const b = beats(tl).hook;
  const dive = easeInOut(ramp(f, at(b.diveStart), at(b.diveEnd), (x) => x));
  // ---------- ведущий ----------
  const P0 = at(b.point);
  const P1 = at(b.pointEnd);
  const S0 = at(b.shrug);
  const point = keys(f, [
    [P0 - 6, 0],
    [P0 + 6, 1],
    [P1, 1],
    [P1 + 10, 0],
  ]);
  const shrug = keys(f, [
    [S0 - 6, 0],
    [S0 + 6, 1],
    [S0 + 26, 1],
    [S0 + 40, 0],
  ]);
  const face = (t: number) =>
    keys(t, [
      [P0 - 4, 0],
      [P0 + 8, 0.42],
      [P1 - 4, 0.42],
      [P1 + 8, 0],
    ]);
  const pose = (t: number): PoseIn => {
    const pt = keys(t, [
      [P0 - 6, 0],
      [P0 + 6, 1],
      [P1, 1],
      [P1 + 10, 0],
    ]);
    const sh = keys(t, [
      [S0 - 6, 0],
      [S0 + 6, 1],
      [S0 + 26, 1],
      [S0 + 40, 0],
    ]);
    const rHand = {
      x: anchorDeskHands.r.x + (716 - anchorDeskHands.r.x) * pt + 60 * sh * (1 - pt),
      y: anchorDeskHands.r.y + (812 - anchorDeskHands.r.y) * pt - 120 * sh * (1 - pt),
    };
    const lHand = { x: anchorDeskHands.l.x - 60 * sh, y: anchorDeskHands.l.y - 120 * sh };
    return {
      expr: t < P0 ? "surprised" : t < S0 - 4 ? "worried" : t < S0 + 30 ? "surprised" : "softSmile",
      armR: { target: rHand, shape: pt > 0.5 ? "point" : sh > 0.5 ? "open" : "relax", elbow: pt > 0.3 ? "out" : "down", wrist: pt > 0.5 ? -8 : 0 },
      armL: { target: lHand, shape: sh > 0.5 ? "open" : "relax", elbow: "down" },
      shoulders: 0.5 * sh,
      headTilt: -4 * sh + 3 * pt,
      lean: 3 * pt,
      nod: 2 * Math.sin(t / 9) * (1 - pt),
    };
  };
  const minutes = 15 * 60 + 44 + f * 0.18;
  const ring = Math.max(point, shrug * 0.7);
  const studio = (
    <StudioWorld uid="hook-st" f={f} abs={abs} face={face} pose={pose} wall={<HookWall f={f} min={minutes} ring={ring} />} />
  );
  // камера студии: медленный наезд + короткий «драматичный» наезд на «кайра көтөрүлдү»
  // (центр камеры не выходит за край мира: при zoom ≥ 1,012 запас ≥ 6 px)
  const zoom = 1.012 + 0.035 * ramp(f, at(b.diveEnd), at(b.diveEnd) + 90) + 0.06 * shrug;
  const dr = drift(f, 3, 2);
  const studioCam = { x: 540 + dr.x, y: 960 + dr.y + 40 * (zoom - 1.012), zoom };
  // ---------- офис: крупный план кружки ----------
  const camA = { ...MUG_CLOSE, x: MUG_CLOSE.x + drift(f, 2, 5).x / 6 };
  const camB = { ...camA, zoom: camA.zoom * 2.6 };
  const officeCam = mixCam(camA, camB, dive);
  const r0 = rectOnScreen(camA, MUG_SCREEN.x, MUG_SCREEN.y, MUG_SCREEN.w, MUG_SCREEN.h, MUG_SCREEN.r);
  const rect = lerpRect(r0, FULL_RECT, dive);
  const fr = windowFraming(r0, STUDIO_IN_SCREEN, dive);
  // после наезда — обычная камера студии (плавно)
  const k = ramp(f, at(b.diveEnd) - 2, at(b.diveEnd) + 24);
  const px = fr.px + (studioCam.x - fr.px) * k;
  const py = fr.py + (studioCam.y - fr.py) * k;
  const s = fr.s * (1 + (studioCam.zoom - 1) * k);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {dive < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, at(b.diveStart) + 14, at(b.diveEnd)) }}>
          <Camera cam={officeCam}>
            <OfficeWorld f={f} abs={abs} uid="hook-of" minutes={officeMinutes(abs / 30)} monitor={null} mug={null} />
          </Camera>
        </AbsoluteFill>
      ) : null}
      <ScreenWindow rect={rect} px={px} py={py} s={s} shadow={dive < 1}>
        {studio}
      </ScreenWindow>
      {/* телевизионная графика */}
      <NewsTopBar f={f} at={-14} plate={BG42_TEXT.jokeShort} />
      <BreakingBanner f={f} at={at(b.banner) - 10} y={344} />
      <LowerThird f={f} at={at(b.lower)} text={BG42_TEXT.lowerHook} y={1262} size={40} />
    </AbsoluteFill>
  );
};
