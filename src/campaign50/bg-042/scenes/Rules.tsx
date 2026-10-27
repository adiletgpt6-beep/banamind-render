// 4. Студийная графика правил. Снова студия «КЕҢСЕ ЖАҢЫЛЫГЫ»: ведущий
// спокойно объясняет настоящие условия BalaGo, видеостена показывает их по
// словам: сначала родитель сообщает дарек, мектеп и убакыт; затем ищется
// подходящая группа (совместимые дома и одна школа); сразу начать не
// обещают — поиск до 2 недель, группа не гарантирована.
// Вход — под телевизионной шторкой; выход — нейтральная стена-логотип и
// камера RULES_TRIAL_CAM (стык со сценой «trial»).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { PoseIn } from "../Actor";
import { beats } from "../beats";
import { Camera, mixCam, type Cam } from "../Camera";
import { useScene } from "../context";
import { BG42_TEXT } from "../script";
import { STUDIO } from "../sets/Studio";
import { C, drift, easeInOut, keys, ramp } from "../theme";
import { LowerThird, NewsTopBar } from "../ui";
import { StudioWorld, WallLogo, anchorDeskHands } from "./common";
import { RulesWall } from "./RulesParts";
import { RULES_TRIAL_CAM } from "./shots";

/** Начало: ведущий и стена чуть крупнее общего плана. */
const CAM_OPEN: Cam = { x: 540, y: 905, zoom: 1.08 };
/** На карте: мягкий наезд на видеостену (лицо ведущего остаётся в кадре). */
const CAM_MAP: Cam = { x: 560, y: 850, zoom: 1.14 };

export const RulesScene: React.FC = () => {
  const { f, abs, at, len, word, tl } = useScene("rules");
  const b = beats(tl).rules;
  const AD = at(b.address);
  const SC = at(b.school);
  const TI = at(b.time);
  const MP = at(b.map);
  const NS = at(b.noStart);
  const END = len - 1;
  const SETTLE = END - 16;
  const A2 = word("a2", 0);
  const A3 = word("a3", 0);
  const shake0 = word("a3", 4); // «дароо баштоо…»

  // ---------- ведущий ----------
  // правая рука (справа на экране): «представляет» каждую карточку
  const pose = (t: number): PoseIn => {
    const present = keys(t, [
      [A2 - 8, 0],
      [A2 + 4, 1],
      [MP + 6, 1],
      [MP + 18, 0],
    ]);
    const bt = keys(t, [
      [AD - 6, 0],
      [AD + 2, 1],
      [AD + 12, 0.4],
      [SC - 6, 0.4],
      [SC + 2, 1],
      [SC + 12, 0.4],
      [TI - 6, 0.4],
      [TI + 2, 1],
      [TI + 12, 0.4],
    ]);
    // «не сразу»: обе ладони спокойно ложатся на стол чуть шире
    const calm = keys(t, [
      [shake0 - 8, 0],
      [shake0 + 4, 1],
      [Math.max(shake0 + 5, SETTLE - 14), 1],
      [Math.max(shake0 + 18, SETTLE), 0],
    ]);
    const rest = anchorDeskHands;
    const rx = rest.r.x + (738 - rest.r.x) * present + 16 * bt * present + 30 * calm;
    const ry = rest.r.y + (1158 - rest.r.y) * present - 18 * bt * present;
    const lx = rest.l.x - 30 * calm;
    // покачивание головой «не сразу» (2 цикла)
    const sh = t > shake0 && t < shake0 + 30 ? Math.sin(((t - shake0) / 30) * Math.PI * 4) * 3 * Math.sin(((t - shake0) / 30) * Math.PI) : 0;
    return {
      expr: t < A3 ? "smile" : t < shake0 ? "calm" : t < SETTLE - 10 ? "apologetic" : "softSmile",
      armR: { target: { x: rx, y: ry }, shape: present > 0.4 || calm > 0.4 ? "open" : "relax", elbow: present > 0.3 ? "out" : "down", wrist: -10 * present },
      armL: { target: { x: lx, y: rest.l.y }, shape: calm > 0.4 ? "open" : "relax", elbow: "down" },
      headTilt: sh + keys(t, [
        [A2, 0],
        [A2 + 10, 2],
        [MP, 2],
        [MP + 12, 0],
      ]),
      nod: keys(t, [
        [AD - 2, 0],
        [AD + 4, 2.5],
        [AD + 12, 0],
        [SC - 2, 0],
        [SC + 4, 2.5],
        [SC + 12, 0],
        [TI - 2, 0],
        [TI + 4, 2.5],
        [TI + 12, 0],
      ]),
      lean: 2 * present * (t < SETTLE ? 1 : 0),
    };
  };
  const face = (t: number) =>
    keys(t, [
      [0, 0],
      [A2, 0],
      [A2 + 10, 0.12],
      [MP, 0.12],
      [MP + 10, -0.08],
      [Math.max(MP + 11, SETTLE - 10), -0.08],
      [Math.max(MP + 20, SETTLE), 0],
    ]);

  // ---------- стена ----------
  const logo = ramp(f, END - 14, END - 2);
  const wall = (
    <>
      <RulesWall f={f} b={{ address: AD, school: SC, time: TI, map: MP, radar: at(b.radar), match: at(b.match), noStart: NS }} fadeToLogo={logo} />
      {logo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: logo }}>
          <WallLogo />
        </div>
      ) : null}
    </>
  );

  // ---------- камера ----------
  const toMap = easeInOut(ramp(f, MP - 6, MP + 24, (x) => x));
  const toEnd = easeInOut(ramp(f, END - 40, END - 10, (x) => x));
  const base = mixCam(mixCam(CAM_OPEN, CAM_MAP, toMap), RULES_TRIAL_CAM, toEnd);
  const dr = drift(f, 2.5, 7);
  const dk = 1 - ramp(f, END - 40, END - 10);
  const cam: Cam = f >= END - 10 ? RULES_TRIAL_CAM : { x: base.x + dr.x * dk, y: base.y + dr.y * dk, zoom: base.zoom };

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Camera cam={cam}>
        <StudioWorld f={f} abs={abs} uid="rules-st" wall={wall} face={face} pose={pose} />
      </Camera>
      <NewsTopBar f={f} at={-30} plate={BG42_TEXT.jokePlate} />
      <LowerThird f={f} at={at(b.lower)} out={END - 21} tag={BG42_TEXT.channel} text={BG42_TEXT.rules} y={STUDIO.desk.top + 66} />
    </AbsoluteFill>
  );
};
