// Сцена 7. Разговор на одном уровне. Папа подходит к столу, берётся за
// спинку стула, чуть отодвигает его и садится рядом с сыном — примерно на
// уровне его глаз (наклон корпуса). Вопрос F02; сын молча кивает (крупно,
// без автоматического повтора); второй вопрос F03 — без укора.
import { type Place } from "../rig/Actor";
import { clamp, cruise, keys, lerp } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { HOME } from "../sets/Home";
import { DAD_CHAIR, DAD_SIT, HomeShot, SON_AT } from "./HomeShot";
import { dadSeated, SheetOnTable, sonSeated } from "./HomeCast";
import { H, sitDown } from "./common";
import { DAD_STAND } from "./Backpack";

export const askPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "ask");
  const f02 = T.from("F02");
  const sit = Math.max(64, f02 - 40);
  return {
    walk: [4, 30] as const,
    grab: [sit - 30, sit - 22] as const,
    pull: [sit - 22, sit - 10] as const,
    step: [sit - 12, sit] as const,
    sit,
    glance: sit + 26,
    f02,
    f02End: T.to("F02"),
    nod: [T.to("F02") + 10, T.to("F02") + 36] as const,
    f03: T.from("F03"),
    f03End: T.to("F03"),
    len: T.len,
  };
};
type P = ReturnType<typeof askPlan>;

export const chairX = (p: P, tt: number) => lerp(DAD_CHAIR, DAD_SIT, clamp((tt - p.pull[0]) / (p.pull[1] - p.pull[0])));

export const AskScene: React.FC = () => {
  const { f } = useScene("ask");
  const p = usePlan(askPlan);
  const dadPlace = (tt: number): Place => {
    const a = cruise(clamp((tt - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
    const b = cruise(clamp((tt - p.step[0]) / (p.step[1] - p.step[0])), 0.4);
    return { x: lerp(lerp(DAD_STAND.x, 890, a), DAD_SIT, b), y: HOME.floorY, h: H.dad };
  };
  const dadPose = (tt: number) => {
    const s = sitDown(tt, p.sit, 32);
    const holding = tt >= p.grab[0] && tt < p.pull[1] + 2;
    const base = dadSeated({
      expr: tt < p.f02 - 10 ? "calm" : "softSmile",
      nod: keys(tt, [[p.f03 - 8, 0], [p.f03, 3], [p.f03 + 14, 1]]),
      lookY: keys(tt, [[p.nod[0], 0.15], [p.nod[0] + 8, 0.3], [p.nod[1] + 6, 0.15]]),
    });
    return {
      ...base,
      sit: s.sit,
      lean: s.sit < 1 ? s.lean : 8,
      turnBody: s.sit > 0.5 ? 0.55 : 0.8,
      armL: holding ? { target: { x: chairX(p, tt) + 4, y: 1068 }, shape: "fist" as const, elbow: "down" as const, behind: false } : s.sit > 0.6 ? base.armL : { target: null, shape: "relax" as const },
      armR: s.sit > 0.6 ? base.armR : { target: null, shape: "relax" as const },
    };
  };
  // сын: тихо смотрит вниз; когда папа сел — короткий взгляд на него; на
  // вопросе — снова на лист; кивок (один, медленный); на F03 — на папу
  const sonPose = (tt: number) =>
    sonSeated({
      expr: { browIn: 5, browOut: -1, lid: 0.2, smile: -0.08 },
      lookY: tt < p.sit + 20 ? 0.7 : tt < p.f02 ? keys(tt, [[p.glance - 10, 0.7], [p.glance, 0.1]]) : tt < p.nod[1] + 10 ? 0.6 : 0.2,
      lookX: tt > p.sit + 10 ? 0.45 : 0.3,
      nod: keys(tt, [[p.nod[0], 3], [p.nod[0] + 10, 12], [p.nod[0] + 20, 3], [p.nod[1], 2]]),
      shoulders: 0.3,
    });
  const close = f >= p.nod[0] - 6 && f < p.f03 - 4;
  const cam = close ? { x: SON_AT.x + 30, y: 1050, zoom: 3.1 } : f < p.sit - 4 ? { x: 680, y: 1100, zoom: 1.4 } : { x: 655, y: 1060, zoom: keys(f, [[p.sit - 4, 2.1], [p.f02, 2.2]]) };
  return (
    <HomeShot
      f={f}
      cam={cam}
      chairs={[{ x: SON_AT.x }, { x: chairX(p, f) }]}
      actors={[
        { uid: "a7-son", look: "emir", place: () => SON_AT, face: (tt) => (tt > p.sit + 10 ? 0.4 : 0.15), pose: sonPose, role: "son", seed: 4, blinkShift: 37 },
        { uid: "a7-dad", look: "azamat", place: dadPlace, face: (tt) => (tt < p.sit - 2 ? -0.5 : -0.45), pose: dadPose, role: "father", seed: 2, walkFrom: 0 },
      ]}
      onTable={<SheetOnTable />}
    />
  );
};
