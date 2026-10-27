// Сцена 3 (16,5–31 с). После доклада в переговорной остались мама и
// коллега. Мама берёт со стола телефон — на экране календарь недели:
// каждый день «Мектеп 14:30» пересекается с работой; коллега замечает
// это и показывает пальцем (субъективная камера). Мама: «Мектепке
// барып-келүүнү күн сайын графикке батыруу кыйын болуп жатат.»
// Коллега: «Аны алдын ала уюштуруунун жолун карап көрсөңүзчү?» —
// мама кивает и задумчиво смотрит в телефон: здесь рождается поиск.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, easeInOut, keys, keysV } from "../rig/motion";
import { B6_TEXT } from "../script";
import { HoldBack, HoldFront, CalendarScreen, PhoneFrame, TapFinger } from "../screens";
import { OFFICE } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import { H, lineFrames, onTable, restOnTable, seated, seatOf } from "./common";
import { OfficeWorld, type Person } from "./OfficeWorld";

export const TALK = { pick: 10, pov: 48, back: 135 };
const PHONE_X = 1090;
const MOM = { x: 1150, y: OFFICE.seatY, h: H.mom };
const COL = seated("colleague", OFFICE.seat.colleague);
const CHEST = { x: MOM.x - 40, y: MOM.y - 0.56 * MOM.h };

export const TalkScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const m02 = lineFrames(cues, "m02", "talk");
  const c01 = lineFrames(cues, "c01", "talk");
  const picked = f >= TALK.pick + 12;
  const momPose = (t: number): PoseIn => ({
    expr: t < m02.from ? "thinking" : t < m02.to + 6 ? "tired" : t < c01.to ? "calm" : "thinking",
    armL: {
      target: keysV(t, [[TALK.pick, onTable(PHONE_X, -4)], [TALK.pick + 14, CHEST]], anticipate),
      shape: "phone",
      item: t >= TALK.pick + 10 ? "phone" : "none",
      glow: 1,
      elbow: "down",
      itemTilt: -8,
    },
    armR: {
      target: keysV(t, [[0, onTable(MOM.x + 120, -4)], [m02.from + 20, onTable(MOM.x + 120, -4)], [m02.from + 34, { x: MOM.x + 70, y: MOM.y - 0.52 * MOM.h }], [m02.to - 10, { x: MOM.x + 70, y: MOM.y - 0.52 * MOM.h }], [m02.to + 8, onTable(MOM.x + 120, -4)]], anticipate),
      shape: t > m02.from + 20 && t < m02.to ? "open" : "relax",
      elbow: "down",
    },
    lookY: keys(t, [[0, 0.5], [m02.from - 6, 0.5], [m02.from + 4, 0.05], [c01.to + 10, 0.05], [c01.to + 24, 0.55]]),
    nod: keys(t, [[c01.to + 2, 0], [c01.to + 9, 8], [c01.to + 17, 0], [c01.to + 22, 4]]),
    headTilt: keys(t, [[m02.from, 0], [m02.from + 20, -4], [m02.to, -4], [m02.to + 10, 0]]),
  });
  const momFace = (t: number) => keys(t, [[0, 0], [m02.from - 6, -0.1], [m02.from + 4, -0.55], [c01.to + 12, -0.5], [c01.to + 24, -0.1]]);
  const colPose = (t: number): PoseIn => ({
    sit: 1,
    seat: seatOf(COL),
    expr: t < m02.to ? "calm" : t < c01.from ? "thinking" : "softSmile",
    lean: keys(t, [[0, 4], [24, 12], [m02.from, 12], [m02.from + 20, 6]]),
    armL: restOnTable(COL, -1),
    armR: {
      target: keysV(t, [[c01.from + 4, onTable(COL.x + 0.15 * COL.h, -4)], [c01.from + 18, { x: COL.x + 190, y: COL.y - 0.58 * COL.h }], [c01.to - 4, { x: COL.x + 200, y: COL.y - 0.6 * COL.h }], [c01.to + 12, onTable(COL.x + 0.15 * COL.h, -4)]], anticipate),
      shape: t > c01.from + 8 && t < c01.to ? "open" : "relax",
      elbow: "down",
    },
    lookY: keys(t, [[18, 0.05], [28, 0.4], [m02.from - 2, 0.4], [m02.from + 8, 0.05]]),
  });
  const colFace = (t: number) => keys(t, [[16, 0.2], [28, 0.65]]);
  const world = (
    <OfficeWorld
      f={f}
      minutes={B6_TEXT.clockNow + 7 + f / 600}
      slide={{ reveal: 1, dot: null }}
      seated={[{ uid: "t-col", look: "colleague", seed: 4, place: () => COL, face: colFace, pose: colPose, role: "colleague" }]}
      behind={[{ uid: "t-mom", look: "mom", seed: 1, place: () => MOM, face: momFace, pose: momPose, role: "mother" } satisfies Person]}
      standing={[]}
      emptyChairs={[OFFICE.seat.b, OFFICE.seat.c]}
      notepads={[OFFICE.seat.colleague - 70]}
      phone={picked ? null : { x: PHONE_X, glow: 0.4 }}
    />
  );
  // субъективная камера: календарь в руке мамы, коллега показывает пальцем
  const ph = { x: 230, y: 120, w: 620 };
  const k = ph.w / 700;
  const point = easeInOut((f - (TALK.pov + 36)) / 14) * (1 - easeInOut((f - (TALK.back - 12)) / 10));
  const target = { x: ph.x + 400 * k, y: ph.y + (190 + 2 * 196 + 128) * k };
  const col = LOOKS.colleague;
  const mom = LOOKS.mom;
  return (
    <>
      <Shot f={f} from={0} to={TALK.pov} cam={camMove(f, 0, TALK.pov, { x: 1030, y: 1060, zoom: 1.3 }, { x: 1040, y: 1060, zoom: 1.36 })}>
        {world}
      </Shot>
      <Shot
        f={f}
        from={TALK.pov}
        to={TALK.back}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #F3F5F8, #C9D2DD)" })}>
            <HoldBack x={ph.x} y={ph.y} w={ph.w} sleeve={mom.topColor} skin={mom.skin} />
            <PhoneFrame x={ph.x} y={ph.y + Math.sin(f / 30) * 4} w={ph.w} tilt={-1}>
              <CalendarScreen f={f} at={TALK.pov} />
            </PhoneFrame>
            <HoldFront x={ph.x} y={ph.y} w={ph.w} skin={mom.skin} />
            {point > 0.01 ? (
              <div style={box({ inset: 0, translate: `${(1 - point) * 600}px ${(1 - point) * 500}px` })}>
                <TapFinger x={target.x} y={target.y} sleeve={col.topColor} skin={col.skin} />
              </div>
            ) : null}
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={TALK.back} to={9999} cam={camMove(f, TALK.back, 430, { x: 1030, y: 1050, zoom: 1.32 }, { x: 1030, y: 1040, zoom: 1.46 })}>
        {world}
      </Shot>
    </>
  );
};
