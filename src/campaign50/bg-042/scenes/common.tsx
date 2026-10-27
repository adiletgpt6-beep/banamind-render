// Общие части сцен BG-042: ведущий за столом в студии, «экран-окно» для
// перехода между миром офиса и телестудией (наезд в экран кружки/монитора
// и обратный отъезд), офис мамы целиком.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, seatOf, type PoseIn } from "../Actor";
import { toScreen, type Cam } from "../Camera";
import { fontFamily } from "../../../fonts";
import { BG42_TEXT } from "../script";
import { Chair, DeskFront, DeskTop, Monitor, MugTv, MUG_SCREEN, OFFICE, OfficeBack } from "../sets/Office";
import { STUDIO, StudioBack, StudioDesk, DeskPapers } from "../sets/Studio";
import { C, H, W } from "../theme";
import { TvIcon } from "../ui";
import { STUDIO_IN_SCREEN } from "./shots";

// ---------- студия ----------

export const ANCHOR_PLACE = { x: STUDIO.anchor.x, y: STUDIO.anchor.y, h: STUDIO.anchor.h };
export const anchorSeat = seatOf(ANCHOR_PLACE);

/** Руки ведущего на столе (мировые координаты студии). */
export const anchorDeskHands = {
  l: { x: 430, y: STUDIO.desk.top + 14 },
  r: { x: 650, y: STUDIO.desk.top + 14 },
};

export type StudioState = {
  /** Кадр сцены: в нём заданы pose/face (функции от кадра сцены). */
  readonly f: number;
  /** Кадр ролика: фон (свет, стена) и губы — непрерывны на стыках сцен. */
  readonly abs: number;
  readonly uid: string;
  readonly wall?: React.ReactNode;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
};

/** Студия целиком в мировых координатах 1080×1920 (без телевизионных плашек). */
export const StudioWorld: React.FC<StudioState> = ({ f, abs, uid, wall, face, pose }) => {
  const poseFn = (t: number): PoseIn => ({
    sit: 1,
    seat: anchorSeat,
    armL: { target: anchorDeskHands.l, shape: "relax", elbow: "down" },
    armR: { target: anchorDeskHands.r, shape: "relax", elbow: "down" },
    ...(pose ? pose(t) : {}),
  });
  return (
    <AbsoluteFill style={{ width: W, height: H }}>
      <StudioBack f={abs} wall={wall} />
      <Actor uid={`${uid}-b`} look="anchor" f={f} abs={abs} place={ANCHOR_PLACE} face={face} pose={poseFn} role="anchor" seed={3} layer="body" suit />
      <StudioDesk />
      <DeskPapers x={760} y={STUDIO.desk.top + 4} />
      <Actor uid={`${uid}-a`} look="anchor" f={f} abs={abs} place={ANCHOR_PLACE} face={face} pose={poseFn} role="anchor" seed={3} layer="arms" />
    </AbsoluteFill>
  );
};

// ---------- офис ----------

export const MOM_PLACE = { x: OFFICE.mom.x, y: OFFICE.mom.y, h: OFFICE.mom.h };
export const momSeat = seatOf(MOM_PLACE);
/** Кисти мамы на клавиатуре (мир). */
export const momKeys = {
  l: { x: 352, y: OFFICE.keyboard.y + 14 },
  r: { x: 492, y: OFFICE.keyboard.y + 14 },
};

export type OfficeState = {
  /** Кадр сцены: в нём заданы pose/face (функции от кадра сцены). */
  readonly f: number;
  /** Кадр ролика: фон (облака, переговорная) и губы — непрерывны на стыках. */
  readonly abs: number;
  readonly uid: string;
  readonly minutes: number;
  readonly monitor: React.ReactNode;
  readonly mug?: React.ReactNode;
  readonly mugPower?: number;
  readonly mugTap?: number;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly phoneGlow?: number;
  /** Дорисовка поверх монитора (например, микрофон, «вылезающий» из экрана). */
  readonly overMonitor?: React.ReactNode;
};

/** Офис целиком в мировых координатах. */
export const OfficeWorld: React.FC<OfficeState> = (s) => {
  const poseFn = (t: number): PoseIn => ({
    sit: 1,
    seat: momSeat,
    armL: { target: momKeys.l, shape: "relax", elbow: "hang" },
    armR: { target: momKeys.r, shape: "relax", elbow: "hang" },
    ...(s.pose ? s.pose(t) : {}),
  });
  return (
    <AbsoluteFill style={{ width: W, height: H }}>
      <OfficeBack f={s.abs} minutes={s.minutes} />
      <Chair x={MOM_PLACE.x} />
      <Actor uid={`${s.uid}-b`} look="mom" f={s.f} abs={s.abs} place={MOM_PLACE} face={s.face} pose={poseFn} role="mother" seed={1} layer="body" />
      <DeskTop phoneGlow={s.phoneGlow} />
      <Monitor screen={s.monitor} />
      {s.overMonitor}
      <MugTv screen={s.mug} power={s.mugPower ?? 1} tap={s.mugTap ?? 0} />
      <Actor uid={`${s.uid}-a`} look="mom" f={s.f} abs={s.abs} place={MOM_PLACE} face={s.face} pose={poseFn} role="mother" seed={1} layer="arms" />
      <DeskFront />
    </AbsoluteFill>
  );
};

/**
 * Шуточные новости в экране кружки (содержимое MugTv): студия целиком,
 * уменьшенная в экран MUG_SCREEN (кадрирование STUDIO_IN_SCREEN).
 */
export const MugStudio: React.FC<{ readonly f: number; readonly abs: number; readonly uid: string; readonly wall?: React.ReactNode }> = ({ f, abs, uid, wall }) => {
  const s = MUG_SCREEN.w / STUDIO_IN_SCREEN.cropW;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H,
        transformOrigin: "0 0",
        transform: `translate(${MUG_SCREEN.w / 2}px, ${MUG_SCREEN.h / 2}px) scale(${s}) translate(${-STUDIO_IN_SCREEN.px}px, ${-STUDIO_IN_SCREEN.py}px)`,
      }}
    >
      <StudioWorld f={f} abs={abs} uid={uid} wall={wall ?? <WallLogo />} />
    </div>
  );
};

/** Нейтральная видеостена: логотип канала (стык сцен 4→5, фон экрана кружки). */
export const WallLogo: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, fontFamily }}>
    <TvIcon size={150} color={C.white} accent={C.yellow} />
    <div style={{ color: C.white, fontWeight: 1000, fontSize: 64, letterSpacing: 3 }}>{BG42_TEXT.channel}</div>
    <div style={{ width: 220, height: 12, borderRadius: 6, background: C.yellow }} />
  </AbsoluteFill>
);

// ---------- экран-окно ----------

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly r: number };

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
  r: a.r + (b.r - a.r) * t,
});

/** Прямоугольник мира на экране для камеры cam. */
export const rectOnScreen = (cam: Cam, x: number, y: number, w: number, h: number, r: number): Rect => {
  const p = toScreen(cam, x, y);
  return { x: p.x, y: p.y, w: w * cam.zoom, h: h * cam.zoom, r: r * cam.zoom };
};

export const FULL_RECT: Rect = { x: 0, y: 0, w: W, h: H, r: 0 };

/**
 * «Окно» на экране (rect, экранные px), внутри — мир 1080×1920 (children),
 * отображённый так, что точка мира (px, py) стоит в центре окна с масштабом s.
 */
export const ScreenWindow: React.FC<{
  readonly rect: Rect;
  readonly px: number;
  readonly py: number;
  readonly s: number;
  readonly children: React.ReactNode;
  readonly shadow?: boolean;
}> = ({ rect, px, py, s, children, shadow = false }) => (
  <div
    style={{
      position: "absolute",
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: rect.r,
      overflow: "hidden",
      boxShadow: shadow ? "0 30px 80px rgba(14,29,69,0.35)" : undefined,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H,
        transformOrigin: "0 0",
        transform: `translate(${rect.w / 2}px, ${rect.h / 2}px) scale(${s}) translate(${-px}px, ${-py}px)`,
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Кадрирование содержимого окна: при t=0 — «маленький экран» r0 (в нём видна
 * ширина cropW мира вокруг точки px, py), при t=1 — полный кадр 1:1.
 */
export const windowFraming = (r0: Rect, small: { readonly px: number; readonly py: number; readonly cropW: number }, t: number) => {
  const s0 = r0.w / small.cropW;
  const s = Math.exp(Math.log(s0) * (1 - t));
  return { px: small.px + (W / 2 - small.px) * t, py: small.py + (H / 2 - small.py) * t, s };
};
