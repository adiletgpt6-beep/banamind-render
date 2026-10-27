// 5. «Шарттуу мисал»: видеостена переворачивается в условный пример
// «Эгер топ түзүлсө» — одна полная пробная поездка (утром ҮЙ → МЕКТЕП,
// после уроков МЕКТЕП → ҮЙ) бесплатна, дальше решает родитель. На словах
// «Бул тамаша жаңылык болсо да, шарттары чыныгы» камера отъезжает из студии
// обратно в крошечный экран кружки-подставки на столе мамы (обратный ход
// наезда из хука); мама улыбается, касается кружки — «телевизор» гаснет
// как старый кинескоп (мягкая полоска → точка → темно), и она поворачивается
// к монитору со страницей BalaGo. Последний кадр = первый кадр финала.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { PoseIn, WorldArm } from "../Actor";
import { beats } from "../beats";
import { CAM_FULL, Camera, mixCam, type Cam } from "../Camera";
import { useScene } from "../context";
import { BG42_TEXT } from "../script";
import { BrowserScreen } from "../sets/Screens";
import { MUG_SCREEN } from "../sets/Office";
import { C, drift, easeIn, easeInOut, keys, lerp, ramp } from "../theme";
import { ConditionalBadge, LowerThird, NewsTopBar } from "../ui";
import { FULL_RECT, MugStudio, OfficeWorld, ScreenWindow, StudioWorld, WallLogo, lerpRect, momKeys, rectOnScreen, windowFraming } from "./common";
import { MOM_MUG_CAM, MUG_CLOSE, RULES_TRIAL_CAM, STUDIO_IN_SCREEN, TRIAL_END_CAM, officeMinutes } from "./shots";
import { TrialWall } from "./TrialParts";

/** Центр экрана кружки (мир): сюда мама касается пальцем. */
const MUG_TAP = { x: MUG_SCREEN.x + MUG_SCREEN.w / 2, y: MUG_SCREEN.y + MUG_SCREEN.h / 2 + 4 };

export const TrialScene: React.FC = () => {
  const { f, abs, at, len, word, tl } = useScene("trial");
  const b = beats(tl).trial;
  const WALL = at(b.wall);
  const PS = at(b.pullStart);
  const PE = at(b.pullEnd);
  const TAP = at(b.tap);
  const OFF = at(b.off);
  const OFF_END = at(b.offEnd);
  const TM = at(b.toMonitor);
  const END = len - 1;
  const n1w = (w: number) => word("n1", w);

  // ---------- студия: стена и ведущий ----------
  // переворот стены: логотип канала складывается, условный пример раскрывается;
  // перед отъездом из студии — обратно (пример виден только вместе с меткой
  // «Шарттуу мисал»)
  const flipIn = ramp(f, WALL, WALL + 12, (x) => x);
  const flipOut = ramp(f, PS - 12, PS, (x) => x);
  const showTrial = flipIn >= 0.5 && flipOut < 0.5;
  const fl = flipOut > 0 ? flipOut : flipIn;
  const sy = fl < 0.5 ? 1 - easeIn(fl * 2) : easeInOut((fl - 0.5) * 2);
  const wallBeats = { morning: at(b.morning), afternoon: at(b.afternoon), free: at(b.free), decision: at(b.decision) };
  const wallNode = (
    <div style={{ position: "absolute", inset: 0, transform: `scaleY(${Math.max(0.001, sy)})` }}>
      {showTrial ? (
        <TrialWall f={f - WALL - 6} b={{ morning: wallBeats.morning - WALL - 6, afternoon: wallBeats.afternoon - WALL - 6, free: wallBeats.free - WALL - 6, decision: wallBeats.decision - WALL - 6 }} />
      ) : (
        <WallLogo />
      )}
    </div>
  );
  const anchorPose = (t: number): PoseIn => ({
    expr: t < at(b.free) ? "smile" : "softSmile",
    nod: keys(t, [
      [n1w(2) - 2, 0],
      [n1w(2) + 5, 2.5],
      [n1w(2) + 14, 0],
      [n1w(6) - 2, 0],
      [n1w(6) + 5, 3],
      [n1w(6) + 14, 0],
      [n1w(8) - 2, 0],
      [n1w(8) + 5, 2.5],
      [n1w(8) + 14, 0],
    ]),
    headTilt: keys(t, [
      [at(b.free), 0],
      [at(b.free) + 10, 3],
      [at(b.decision), 3],
      [at(b.decision) + 12, 0],
    ]),
  });
  const anchorFace = (t: number) =>
    keys(t, [
      [0, 0],
      [WALL, 0],
      [WALL + 10, 0.1],
      [at(b.decision), 0.1],
      [at(b.decision) + 12, 0],
    ]);
  const studio = (uid: string) => <StudioWorld f={f} abs={abs} uid={uid} wall={wallNode} face={anchorFace} pose={anchorPose} />;

  // камера студии: с RULES_TRIAL_CAM медленный наезд, к отъезду — ровно весь кадр
  const push = easeInOut(ramp(f, WALL, at(b.decision) + 20, (x) => x));
  const back = easeInOut(ramp(f, PS - 26, PS - 4, (x) => x));
  const near: Cam = { x: 540, y: 935, zoom: 1.07 };
  const sBase = mixCam(mixCam(RULES_TRIAL_CAM, near, push), CAM_FULL, back);
  const dr = drift(f, 2, 9);
  const dk = ramp(f, 10, 30) * (1 - ramp(f, PS - 30, PS - 12));
  const studioCam: Cam = { x: sBase.x + dr.x * dk, y: sBase.y + dr.y * dk, zoom: sBase.zoom };

  // ---------- отъезд в экран кружки ----------
  const pull = easeInOut(ramp(f, PS, PE, (x) => x));
  const r0 = rectOnScreen(MUG_CLOSE, MUG_SCREEN.x, MUG_SCREEN.y, MUG_SCREEN.w, MUG_SCREEN.h, MUG_SCREEN.r);
  const rect = lerpRect(r0, FULL_RECT, 1 - pull);
  const fr = windowFraming(r0, STUDIO_IN_SCREEN, 1 - pull);
  const inOffice = f >= PS;
  const overlay = f >= PS && f < PE;

  // ---------- офис: мама, кружка, монитор ----------
  const toMug = easeInOut(ramp(f, PE, PE + 30, (x) => x));
  const toMon = easeInOut(ramp(f, TM, END - 10, (x) => x));
  const camB: Cam = { ...MUG_CLOSE, zoom: MUG_CLOSE.zoom * 2.6 };
  const officeCam: Cam =
    f < PE ? mixCam(camB, MUG_CLOSE, pull) : f >= END - 10 ? TRIAL_END_CAM : mixCam(mixCam(MUG_CLOSE, MOM_MUG_CAM, toMug), TRIAL_END_CAM, toMon);
  // касание кружки левой рукой (слева на экране)
  const reach = keys(f, [
    [TAP - 16, 0],
    [TAP - 2, 1],
    [OFF + 6, 1],
    [TM + 12, 0],
  ]);
  const tapPulse = keys(f, [
    [TAP - 1, 0],
    [TAP + 2, 1],
    [TAP + 7, 0],
  ]);
  const momFace = (t: number) =>
    keys(t, [
      [PE, 0.15],
      [PE + 20, -0.35],
      [TM, -0.35],
      [TM + 12, 0.55],
    ]);
  const momPose = (t: number): PoseIn => {
    const r = keys(t, [
      [TAP - 16, 0],
      [TAP - 2, 1],
      [OFF + 6, 1],
      [TM + 12, 0],
    ]);
    const press = keys(t, [
      [TAP - 2, 0],
      [TAP + 1, 1],
      [TAP + 5, 0],
    ]);
    const armL: WorldArm = {
      target: { x: lerp(momKeys.l.x, MUG_TAP.x + 10 + 4 * press, r), y: lerp(momKeys.l.y, MUG_TAP.y, r) },
      shape: r > 0.4 ? "point" : "relax",
      elbow: r > 0.2 ? "down" : "hang",
      wrist: -20 * r,
    };
    return {
      expr: t < PE + 14 ? "smile" : "softSmile",
      armL,
      lean: 3 * r,
      nod: keys(t, [
        [PE + 30, 0],
        [PE + 38, 2.5],
        [PE + 48, 0],
      ]),
      lookY: 0.35 * r,
    };
  };
  // «кинескоп» гаснет: картинка сжимается в мягкую полоску, полоска — в точку
  const offT = ramp(f, OFF, OFF_END, (x) => x);
  const crtY = offT < 0.45 ? lerp(1, 0.035, easeIn(offT / 0.45)) : 0.035;
  const crtX = offT < 0.45 ? 1 : lerp(1, 0.05, easeIn((offT - 0.45) / 0.4));
  const lineGlow = offT > 0.25 ? Math.min(1, (offT - 0.25) / 0.2) * (1 - ramp(f, OFF_END - 4, OFF_END)) : 0;
  const mugPower = f < OFF_END ? 1 : 0;
  const mugNode =
    f < PE ? null : (
      <div style={{ position: "absolute", inset: 0, transform: `scale(${crtX}, ${crtY})` }}>
        <MugStudio f={f} abs={abs} uid="trial-mug" wall={wallNode} />
        <div style={{ position: "absolute", inset: 0, background: "#FFF8DC", opacity: lineGlow * 0.9 }} />
      </div>
    );
  const monitor = <BrowserScreen typed={99} results={1} site={1} field={-1} />;

  // ---------- телевизионная графика ----------
  const tvFade = 1 - ramp(f, PS, PS + 14);
  // метка видна, пока виден условный пример (до середины обратного переворота)
  const badgeOn = f >= WALL + 6 && f < PS - 4;
  const badgeO = 1 - ramp(f, PS - 12, PS - 5);

  return (
    <AbsoluteFill style={{ background: C.white }}>
      {inOffice ? (
        <AbsoluteFill style={{ opacity: f < PE ? ramp(f, PS, PS + 10) : 1 }}>
          <Camera cam={officeCam}>
            <OfficeWorld
              f={f}
              abs={abs}
              uid="trial-of"
              minutes={officeMinutes(abs / 30)}
              monitor={monitor}
              mug={mugNode}
              mugPower={mugPower}
              mugTap={tapPulse * reach}
              face={momFace}
              pose={momPose}
            />
          </Camera>
        </AbsoluteFill>
      ) : (
        <Camera cam={studioCam}>{studio("trial-st")}</Camera>
      )}
      {overlay ? (
        <ScreenWindow rect={rect} px={fr.px} py={fr.py} s={fr.s} shadow>
          {studio("trial-st")}
        </ScreenWindow>
      ) : null}
      {tvFade > 0 ? (
        <AbsoluteFill style={{ opacity: tvFade }}>
          <NewsTopBar f={f} at={-30} plate={BG42_TEXT.jokePlate} />
          {badgeOn ? (
            <AbsoluteFill style={{ opacity: badgeO }}>
              <ConditionalBadge f={f} at={WALL + 6} x={90} y={350} />
            </AbsoluteFill>
          ) : null}
          <LowerThird f={f} at={at(b.decision)} out={PS - 12} tag={BG42_TEXT.channel} text={BG42_TEXT.decision} y={1262} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
