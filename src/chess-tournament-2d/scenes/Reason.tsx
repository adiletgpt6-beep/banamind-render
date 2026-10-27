// Сцена 9. Настоящая причина (F02, F03, D03).
// A. Папа (в пиджаке) входит от двери — один-два спокойных шага — встаёт
//    перед своим стулом напротив дочки и садится: корпус вперёд, колени
//    сгибаются, таз опускается на сиденье, остановка. Доска между ними.
//    Дочка поднимает глаза. «Мага да көрсөтөсүңбү?» (F02).
// B. Дочка придвигает тетрадь к середине стола и показывает на доску.
//    Совместное раздумье монтажом: лицо папы над доской → доска со
//    стороны папы, его палец задерживается над клеткой и отходит → взгляд
//    дочки на папу.
// C. Двое: «Турнирге катышкың келет, туурабы?» (F03). Дочка сначала
//    кивает, потом смотрит на папу.
// D. «Ооба. Бирок анда…» (D03) — лицо дочки; на «Сенин жолугушууларың»
//    — папа слушает (рот закрыт, взгляд на ней, без улыбки); на «Апамдын
//    да иши бар» — снова дочка. Пауза и мягкая реакция папы.
import { AbsoluteFill } from "remotion";
import { type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { POSITION_A } from "../script";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { NotebookFlat, ROOM } from "../sets/Home";
import { SKIN } from "../props/CloseHand";
import { squareAt } from "../props/Chess";
import { BoardTop, DAD_Q, RoomShot, TABLE_Y, wristForGrip, type ActorSpec } from "./shots";
import { GIRL_SPEC, girlAtBoard } from "./Light";
import { H, sitDown } from "./common";

export const reasonPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "reason");
  const walk: [number, number] = [6, 62];
  const sit = walk[1] + 4;
  const f02 = T.from("F02");
  const f02End = T.to("F02");
  const slide: [number, number] = [f02End + 6, f02End + 30]; // тетрадь к середине
  const think = f02End + 34; // монтаж раздумья
  const f03 = T.from("F03");
  const thinkShots = [think, think + Math.round((f03 - 8 - think) * 0.36), think + Math.round((f03 - 8 - think) * 0.72), f03 - 8];
  const d03 = T.from("D03");
  return {
    walk,
    sit,
    notice: walk[0] + 26,
    f02,
    f02End,
    slide,
    think,
    thinkShots,
    f03,
    f03End: T.to("F03"),
    nod: T.to("F03") + 6,
    d03,
    listen: [T.word("D03", "Сенин") - 4, T.word("D03", "Апамдын") - 4] as const,
    d03End: T.to("D03"),
    len: T.len,
  };
};
type P = ReturnType<typeof reasonPlan>;

// Папа: от двери к стулу и посадка.
const DOOR: Place = { x: 1004, y: ROOM.floorY - 40, h: H.dad * 0.95 };
const CHAIR: Place = { x: ROOM.dadChair, y: ROOM.floorY, h: H.dad };
const dadPlace = (p: P) => (t: number): Place => {
  const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
  return { x: lerp(DOOR.x, CHAIR.x, u), y: lerp(DOOR.y, CHAIR.y, u), h: lerp(DOOR.h, CHAIR.h, u) };
};

// Сидящий папа: кисти на столе, корпус чуть вперёд.
export const dadSeated = (o: { lean?: number; lookY?: number; nod?: number } = {}) => ({
  sit: 1,
  seat: ROOM.seat,
  lean: o.lean ?? 8,
  lookY: o.lookY ?? 0.45,
  lookX: -0.45,
  nod: o.nod ?? 3,
  armL: { target: { x: 694, y: TABLE_Y - 2 }, shape: "relax" as const, elbow: "down" as const },
  armR: { target: { x: 716, y: TABLE_Y - 6 }, shape: "relax" as const, elbow: "down" as const },
});
export const DAD_SEATED_PLACE = CHAIR;

const LISTEN = { browIn: 4, browOut: 1, lid: 0.1, smile: 0 } as const;
const UNDERSTAND = { browIn: 5, browOut: 0, lid: 0.16, smile: 0.22 } as const;

// Планы комнаты для разговора у доски.
export const ROOM_CAMS = {
  wide: { x: 610, y: 1170, zoom: 1.42 },
  two: { x: 590, y: 1130, zoom: 1.5 },
  girl: { x: 345, y: 1150, zoom: 2.35 },
  dad: { x: 800, y: 1060, zoom: 2.2 },
} as const;

export const ReasonScene: React.FC = () => {
  const { f } = useScene("reason");
  const p = usePlan(reasonPlan);
  const place = dadPlace(p);
  const dadPose = (t: number) => {
    const s = sitDown(t, p.sit, 36);
    const seated = dadSeated({ lookY: t < p.f03 ? 0.5 : 0.1 });
    const expr = t < p.f02 ? ("calm" as const) : t < p.d03 ? ("softSmile" as const) : t < p.d03End + 10 ? LISTEN : UNDERSTAND;
    return {
      ...seated,
      sit: s.sit,
      lean: t < p.sit + 40 ? s.lean : seated.lean + keys(t, [[p.d03End, 0], [p.d03End + 16, 4]]),
      expr,
      // кивает только после её последнего слова
      nod: keys(t, [[p.d03End + 6, 3], [p.d03End + 16, 7], [p.d03End + 30, 4]]),
      armL: t < p.sit + 30 ? { target: null } : seated.armL,
      armR: t < p.sit + 30 ? { target: null } : seated.armR,
    };
  };
  const dad: ActorSpec = { uid: "r-dad", look: "dadSuit", place, face: (t) => (t < p.walk[1] - 10 ? -0.5 : -0.85), pose: dadPose, role: "father", seed: 2, walkFrom: p.walk[0] - 2 };

  const girlPose = (t: number) => {
    const base = girlAtBoard({ expr: "thinking" });
    const nodK = keys(t, [[p.nod, 0], [p.nod + 8, 1], [p.nod + 16, 0], [p.nod + 22, 0.6], [p.nod + 30, 0]]);
    const atDad = t >= p.nod + 30 || (t >= p.notice && t < p.slide[0]) || (t >= p.thinkShots[2] && t < p.thinkShots[3]);
    const lookY = atDad ? -0.1 : 0.5;
    const expr =
      t < p.f02End
        ? ({ browIn: 3, browOut: 2, lid: 0.1, smile: 0.15 } as const)
        : t < p.f03
          ? ("softSmile" as const)
          : t < p.d03
            ? ({ browIn: 5, browOut: -1, lid: 0.18, smile: 0 } as const)
            : t < p.d03End + 8
              ? ({ browIn: 6, browOut: -1, lid: 0.14, smile: -0.05 } as const)
              : ({ browIn: 4, browOut: 1, lid: 0.12, smile: 0.12 } as const);
    // придвигает тетрадь, затем показывает на доску
    const sl = easeInOut(clamp((t - p.slide[0]) / (p.slide[1] - p.slide[0])));
    const pointing = t >= p.slide[1] && t < p.think + 4;
    const armL = t >= p.slide[0] - 8 && t < p.slide[1] + 2 ? { target: { x: lerp(398, 452, sl), y: TABLE_Y }, shape: "open" as const, elbow: "down" as const } : base.armL;
    const armR = pointing ? { target: { x: 470, y: TABLE_Y - 18 }, shape: "point" as const, elbow: "down" as const } : base.armR;
    return { ...base, lookY, expr, nod: base.nod + nodK * 9, armL, armR };
  };
  const girl = GIRL_SPEC(girlPose);
  const nbX = lerp(ROOM.notebook.x, 452, easeInOut(clamp((f - p.slide[0]) / (p.slide[1] - p.slide[0]))));

  const room = (cam: { x: number; y: number; zoom: number }) => (
    <RoomShot f={f} cam={cam} girl={girl} dad={dad} pieces={POSITION_A.pieces} notebook={false} overTable={<NotebookFlat x={nbX} />} />
  );
  // A — общий; B — монтаж раздумья; C — двое; D — лица по смыслу
  if (f < p.think) return room(ROOM_CAMS.wide);
  if (f < p.thinkShots[1]) return room(ROOM_CAMS.dad);
  if (f < p.thinkShots[2]) return <DadTry f={f} from={p.thinkShots[1]} to={p.thinkShots[2]} />;
  if (f < p.f03 - 8) return room(ROOM_CAMS.girl);
  if (f < p.d03 - 2) return room(ROOM_CAMS.two);
  if (f >= p.listen[0] && f < p.listen[1]) return room(ROOM_CAMS.dad);
  if (f < p.d03End + 14) return room(ROOM_CAMS.girl);
  return room(ROOM_CAMS.dad);
};

// Доска со стороны папы: его палец задерживается над клеткой f8 рядом с
// ферзём и отходит, не касаясь фигур.
const DadTry: React.FC<{ f: number; from: number; to: number }> = ({ f, from, to }) => {
  const L = 230;
  const k = f - from;
  const over = squareAt(DAD_Q, "f7");
  const tip = { x: over.x, y: over.y - 20 };
  const ang = 200;
  const near = wristForGrip(tip, L, ang);
  const rest = { x: near.x - 140, y: 2300 };
  const u = easeInOut(clamp(k / 16)) * (1 - easeInOut(clamp((k - (to - from - 16)) / 14)));
  const wrist = { x: lerp(rest.x, near.x, u), y: lerp(rest.y, near.y, u) };
  return (
    <AbsoluteFill>
      <BoardTop q={DAD_Q} pieces={POSITION_A.pieces} hands={[{ wrist, angle: ang, size: L, skin: SKIN.dad, shape: "point" }]} />
    </AbsoluteFill>
  );
};
