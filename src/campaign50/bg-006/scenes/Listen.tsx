// Сцена 2 (6,5–16,5 с). Общий план: мама у экрана показывает на слайд,
// коллеги слушают, одна записывает. Диктор: «Жумуштагы маанилүү учурду
// да, балаңыздын мектебин да унуткуңуз келбейт.» Затем коллеги крупнее
// (кивают), и мама, не прерывая доклад, поглядывает на часы — стоп-кадр:
// «Доклад бүтө элек… сабак да бүтүп калат». Мама поднимает глаза и
// уверенно завершает мысль.
import { useCurrentFrame } from "remotion";
import { Freeze, frozenAt } from "../freeze";
import type { PoseIn } from "../rig/Actor";
import { anticipate, keys, keysV } from "../rig/motion";
import { B6_TEXT } from "../script";
import { OFFICE } from "../sets/Office";
import { camMove, Shot, type Cam } from "../shots";
import { H, onTable, restOnTable, seated, seatOf } from "./common";
import { OfficeWorld, type Person } from "./OfficeWorld";

export const LISTEN = { colleagues: 105, momShot: 200, glance: 214, freeze: 238, unfreeze: 292, end: 300 };

const MOM = { x: OFFICE.mom.x, y: OFFICE.mom.y, h: H.mom };
const SCREEN_PT = { x: OFFICE.screen.x + 170, y: OFFICE.screen.y + 140 };
// часы мамы у груди (точка запястья левой руки)
const WATCH = { x: MOM.x - 24, y: MOM.y - 0.6 * MOM.h };

const momPose = (t: number): PoseIn => {
  const g = LISTEN.glance;
  const glance = keys(t, [[g, 0], [g + 12, 1], [LISTEN.freeze + 70, 1], [LISTEN.freeze + 84, 0]]);
  return {
    expr: glance > 0.5 ? "worried" : t > LISTEN.freeze + 84 ? "softSmile" : "calm",
    armR: {
      target: keysV(t, [[0, { x: SCREEN_PT.x, y: SCREEN_PT.y + 60 }], [40, { x: SCREEN_PT.x + 30, y: SCREEN_PT.y + 140 }], [70, { x: SCREEN_PT.x, y: SCREEN_PT.y + 60 }], [150, { x: SCREEN_PT.x - 20, y: SCREEN_PT.y + 200 }], [g, { x: MOM.x + 70, y: MOM.y - 0.42 * MOM.h }]], anticipate),
      shape: t < g ? "point" : "relax",
      elbow: "out",
    },
    armL: {
      target: keysV(t, [[g, { x: MOM.x - 90, y: MOM.y - 0.42 * MOM.h }], [g + 12, WATCH], [LISTEN.freeze + 70, WATCH], [LISTEN.freeze + 84, { x: MOM.x - 80, y: MOM.y - 0.5 * MOM.h }]], anticipate),
      shape: "fist",
      elbow: "down",
      wrist: 70,
    },
    lookY: 0.7 * glance,
    nod: 9 * glance,
    headTilt: -3 * glance,
  };
};
const momFace = (t: number) => keys(t, [[0, 0.45], [60, -0.5], [150, -0.55], [LISTEN.glance, -0.25], [LISTEN.freeze + 84, -0.55]]);

const listener = (uid: string, look: Person["look"], who: "b" | "colleague" | "c", x: number, seed: number, nodAt: number, writes = false): Person => {
  const p = seated(who, x);
  return {
    uid,
    look,
    seed,
    place: () => p,
    face: (t) => keys(t, [[0, 0.55], [60, 0.6], [nodAt + 40, 0.55]]),
    pose: (t) => ({
      sit: 1,
      seat: seatOf(p),
      expr: t > nodAt ? "softSmile" : "calm",
      nod: keys(t, [[nodAt, 0], [nodAt + 6, 7], [nodAt + 14, 0], [nodAt + 22, 5], [nodAt + 30, 0]]),
      lean: 4,
      armL: restOnTable(p, -1),
      armR: writes
        ? { target: onTable(p.x + 0.12 * p.h + Math.sin(t / 3) * 10 * (t % 90 < 50 ? 1 : 0), -2), shape: "pinch", item: "pencil", itemColor: "#2F4A7A", elbow: "down" }
        : restOnTable(p, 1),
      lookY: writes && t % 90 < 50 ? 0.5 : 0.05,
    }),
  };
};

const PEOPLE = {
  b: listener("l-b", "colleagueB", "b", OFFICE.seat.b, 3, 150, true),
  col: listener("l-col", "colleague", "colleague", OFFICE.seat.colleague, 4, 132),
  c: listener("l-c", "colleagueC", "c", OFFICE.seat.c, 5, 168),
};

const toScreen = (cam: Cam, p: { x: number; y: number }) => ({ x: 540 + (p.x - cam.x) * cam.zoom, y: 960 + (p.y - cam.y) * cam.zoom });

export const ListenScene: React.FC = () => {
  const f = useCurrentFrame();
  const ff = frozenAt(f, LISTEN.freeze, LISTEN.unfreeze);
  const mom: Person = { uid: "l-mom", look: "mom", seed: 1, place: () => MOM, face: momFace, pose: momPose, role: "mother" };
  const world = (
    <OfficeWorld
      f={ff}
      minutes={B6_TEXT.clockNow + ff / 600}
      slide={{ reveal: 1, dot: null }}
      seated={[PEOPLE.b, PEOPLE.col, PEOPLE.c]}
      standing={[mom]}
      notepads={[OFFICE.seat.b + 70, OFFICE.seat.c - 60]}
    />
  );
  const momCam = camMove(ff, LISTEN.momShot, LISTEN.end, { x: 1440, y: 1150, zoom: 1.45 }, { x: 1430, y: 1130, zoom: 1.55 });
  const ring = toScreen(momCam, WATCH);
  return (
    <>
      <Shot f={f} from={0} to={LISTEN.colleagues} cam={camMove(f, 0, LISTEN.colleagues, { x: 1330, y: 1000, zoom: 0.74 }, { x: 1320, y: 1010, zoom: 0.79 })}>
        {world}
      </Shot>
      <Shot f={f} from={LISTEN.colleagues} to={LISTEN.momShot} cam={camMove(f, LISTEN.colleagues, LISTEN.momShot, { x: 900, y: 1110, zoom: 1.3 }, { x: 912, y: 1105, zoom: 1.37 })}>
        {world}
      </Shot>
      {f >= LISTEN.momShot ? (
        <Freeze f={f} from={LISTEN.freeze} to={LISTEN.unfreeze} ring={{ x: ring.x, y: ring.y, r: 150 }} label={B6_TEXT.freeze2} labelY={260}>
          <Shot f={f} from={LISTEN.momShot} to={LISTEN.end + 100} cam={momCam}>
            {world}
          </Shot>
        </Freeze>
      ) : null}
    </>
  );
};
