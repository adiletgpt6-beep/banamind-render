// Сцена 2. Это специально.
// A. Средний план комнаты: дочка рисует за своим столом. Мама подходит,
//    замечает лист и присаживается рядом — глаза на высоте ребёнка.
// B. Через плечо мамы: лист сверху — семь клеток; на «Биздин жекшемби»
//    камера подходит к третьей клетке.
// C. M01: план на высоте дочки — мама спрашивает, глядя на лист.
// D. D01: дочка отвечает спокойно и уверенно, придерживая лист пальцами.
// E. Полсекунды реакции: мама переводит взгляд с дочки на рисунок.
import { clamp, cruise, keys, lerp } from "../rig/motion";
import { camMove, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { ROOM } from "../sets/Home";
import { H, sitDown } from "./common";
import { DeskSet, GIRL_AT_DESK, girlDeskPose, MOM_CROUCH_X, OUR_SUNDAY_TOP, OverShoulder } from "./DeskTalk";
import { SHEET_CENTER } from "./CalendarTop";
import { C } from "../theme";

export const specialPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "special");
  const walk: [number, number] = [0, 62];
  const crouch: [number, number] = [walk[1] + 8, walk[1] + 34];
  const over = Math.max(crouch[1] + 6, T.word("N02", "Жети") - 4);
  const push = T.word("N02", "Биздин") - 6;
  const two = T.from("M01") - 10;
  const girl = T.from("D01") - 8;
  const react = T.to("D01") + 6;
  return { walk, crouch, over, push, two, girl, react, len: T.len };
};

export const SpecialScene: React.FC = () => {
  const { f } = useScene("special");
  const p = usePlan(specialPlan);
  const momPlace = (t: number) => ({ x: lerp(-260, MOM_CROUCH_X, cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])))), y: ROOM.floorY + 10, h: H.mom });
  const momPose = (t: number) => {
    const sd = sitDown(t, p.crouch[0], p.crouch[1] - p.crouch[0]);
    const c = sd.sit;
    const looksGirl = t >= p.two && t < p.react;
    return {
      sit: c,
      seat: ROOM.stool.h + 10,
      lean: sd.lean + 6 * c,
      expr: t < p.two ? ("calm" as const) : t < p.girl ? ("surprised" as const) : ("softSmile" as const),
      lookY: looksGirl ? 0.05 : t > p.walk[1] - 10 ? 0.55 : 0.1,
      armR: c < 0.02 ? undefined : { target: { x: MOM_CROUCH_X + lerp(70, 170, c), y: lerp(ROOM.floorY - 330, ROOM.desk.top + 8, c) }, shape: "relax" as const, elbow: "down" as const, behind: false },
      armL: c < 0.02 ? undefined : { target: { x: MOM_CROUCH_X + lerp(-60, 30, c), y: lerp(ROOM.floorY - 330, ROOM.floorY - 200, c) }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  const momFace = (t: number) => (t < p.walk[1] ? 0.7 : t >= p.two && t < p.react ? 0.75 : t >= p.react ? keys(t, [[p.react, 0.75], [p.react + 12, 0.45]]) : 0.5);
  const girlPose = (t: number) =>
    girlDeskPose({
      expr: t >= p.girl ? "softSmile" : "calm",
      lookY: t < p.two - 30 ? 0.6 : 0.1,
      armR: t < p.walk[1] + 20 ? { target: { x: ROOM.sheet.x + 20 + 30 * Math.sin(t / 5), y: ROOM.desk.top + 2 }, shape: "pinch", item: "pencil", itemColor: C.orange, elbow: "down", behind: false } : { target: { x: ROOM.sheet.x + 60, y: ROOM.desk.top + 4 }, shape: "pinch", elbow: "down", behind: false },
    });
  const girlFace = (t: number) => (t < p.two - 30 ? -0.1 : -0.55);
  const wide = { x: 560, y: 1160, zoom: 1.0 };
  const eye = { x: (MOM_CROUCH_X + GIRL_AT_DESK.x) / 2 + 20, y: 1130, zoom: 1.45 };
  const girlCu = { x: GIRL_AT_DESK.x - 60, y: 1110, zoom: 2.1 };
  const momCu = { x: MOM_CROUCH_X + 40, y: 1080, zoom: 2.1 };
  const set = <DeskSet f={f} mom={{ place: momPlace, face: momFace, pose: momPose, walkFrom: 0 }} girl={{ face: girlFace, pose: girlPose }} />;
  if (f < p.over) {
    return (
      <Shot f={f} cam={camMove(f, 0, p.over, wide, { ...wide, zoom: 1.12, x: 520 })} bg={C.wallHome}>
        {set}
      </Shot>
    );
  }
  if (f < p.two) {
    const a = { x: SHEET_CENTER.x, y: SHEET_CENTER.y + 120, zoom: 0.95 };
    const b = { x: OUR_SUNDAY_TOP.x, y: OUR_SUNDAY_TOP.y + 220, zoom: 1.7 };
    return (
      <Shot f={f} cam={camMove(f, p.push, p.push + 26, a, b)} bg={C.woodLight}>
        <OverShoulder />
      </Shot>
    );
  }
  const cam = f < p.girl ? eye : f < p.react ? girlCu : camMove(f, p.react, p.react + 30, momCu, { ...momCu, zoom: 2.08 });
  return (
    <Shot f={f} cam={cam} bg={C.wallHome}>
      {set}
    </Shot>
  );
};
