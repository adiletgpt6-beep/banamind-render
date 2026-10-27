// 3. Рисунок: сын кладёт альбом на столик и спрашивает, посмотрят ли
// родители рисунок. Мама впервые поднимает глаза от телефона — замечает.
// Вставка сверху: рисунок рядом с календарём. Диктор: «Айрым кечтерде…».
// Родители переглядываются, папа опускает блокнот — осознание.
import { AbsoluteFill } from "remotion";
import { useScene, useTimeline } from "../context";
import { Album } from "../props";
import { keys, keys2, tw } from "../rig/motion";
import { RoomBack, RoomFront, WarmGrade } from "../sets/LivingRoom";
import { lerpCam, World, type Cam } from "../shots";
import { BusyParents } from "./Parents";
import { SON_SCALE, SON_X, SON_Y, StandingSon } from "./Son";
import { TableTop } from "./TableTop";

// альбом лежит на столике (мировые координаты)
export const TABLE_ALBUM = { x: 1105, y: 1528 };

const MED: Cam = { cx: 1170, cy: 1380, z: 1.65 };
const SON_CU: Cam = { cx: 1335, cy: 1150, z: 3.1 };
const MOM_CU: Cam = { cx: 660, cy: 1060, z: 3.0 };
const TWO: Cam = { cx: 840, cy: 1160, z: 1.55 };

// Альбом: из рук сына → на стол (сплющивается — лежит плашмя).
export const albumWorld = (t: number) => {
  const [x, y] = keys2(t, [
    [0.2, SON_X, SON_Y + 190 * SON_SCALE],
    [1.15, TABLE_ALBUM.x, TABLE_ALBUM.y],
  ]);
  return { x, y, flat: tw(t, 0.55, 1.15, 1, 0.3), rot: tw(t, 0.2, 1.15, 0, -4) };
};

export const DrawingScene: React.FC = () => {
  const { t, dur, cue, abs } = useScene();
  const { cues } = useTimeline();
  const c02 = cue("c02");
  const n01 = cue("n01");
  const insertFrom = n01.from + 0.3;
  const insertTo = n01.from + (n01.to - n01.from) * 0.58;
  const a = albumWorld(t);
  // руки сына держат альбом, пока он не лёг на стол
  const held = t < 1.2;
  const toLocal = (wx: number, wy: number) => ({ x: (wx - SON_X) / SON_SCALE, y: (wy - SON_Y) / SON_SCALE });
  const lh = toLocal(a.x - 128 * SON_SCALE * a.flat, a.y + 4);
  const rh = toLocal(a.x + 128 * SON_SCALE * a.flat, a.y + 8);
  const lean = keys(t, [
    [0, 0],
    [0.4, -10],
    [1.1, -16],
    [1.6, -3],
  ]);
  let cam: Cam;
  let shot: "world" | "top" = "world";
  if (t < c02.from - 0.15) cam = lerpCam(MED, { ...MED, z: 1.75 }, t / 1.6);
  else if (t < c02.to + 0.25) cam = lerpCam(SON_CU, { ...SON_CU, z: 3.3 }, (t - c02.from) / 2.5);
  else if (t < insertFrom) cam = lerpCam(MOM_CU, { ...MOM_CU, z: 3.25 }, (t - c02.to) / 2);
  else if (t < insertTo) {
    shot = "top";
    cam = MED;
  } else cam = lerpCam(TWO, { ...TWO, z: 1.7 }, (t - insertTo) / (dur - insertTo));
  const notice = c02.to + 0.35; // мама замечает
  const momLook = tw(t, notice, notice + 0.5, 0, 1);
  if (shot === "top") {
    return <TableTop k={(t - insertFrom) / (insertTo - insertFrom)} hand={tw(t, insertTo - 1.4, insertTo - 0.2, 0, 1)} />;
  }
  const late = t >= insertTo;
  return (
    <AbsoluteFill>
      <World cam={cam}>
        <RoomBack t={abs} />
        <BusyParents
          t={t}
          abs={abs}
          cues={cues}
          s={{
            momTurn: late ? tw(t, insertTo + 0.2, insertTo + 0.9, 0.2, 0.9) : 0.05,
            dadTurn: late ? tw(t, insertTo + 0.6, insertTo + 1.3, 0.1, 1) : 0.05,
            calendarRow: 2,
            // мама замечает рисунок: глаза к столу, брови вверх, улыбка теплеет
            momFace: late
              ? { lookY: 0.1, lid: 0, raise: 0.1, worry: 0.45, smile: tw(t, insertTo, dur, 0.15, 0.4), turn: 0.4, lookX: 0.9 }
              : {
                  lookX: 0.15 + momLook * 0.75,
                  lookY: 0.75 - momLook * 0.25,
                  lid: 0.45 * (1 - momLook),
                  raise: momLook * 0.45,
                  worry: 0.15 + momLook * 0.3,
                  smile: tw(t, notice + 0.6, insertFrom, 0.05, 0.25),
                  turn: 0.1 + momLook * 0.25,
                },
            momBlinks: [notice + 0.55],
            dadFace: late ? { worry: 0.4, lookY: tw(t, insertTo + 0.6, insertTo + 1.2, 0.8, 0.1), lid: tw(t, insertTo + 0.6, insertTo + 1.2, 0.4, 0) } : {},
          }}
        />
        <StandingSon
          t={t}
          abs={abs}
          cues={cues}
          album={null}
          pose={{
            lean,
            // при вопросе — открытая ладонь к альбому на столе
            l: held
              ? { ...lh, kind: "hold" }
              : {
                  x: keys(t, [[1.2, lh.x], [c02.from, -100], [c02.to + 0.4, -100], [c02.to + 1, -64]]),
                  y: keys(t, [[1.2, lh.y], [c02.from, 112], [c02.to + 0.4, 112], [c02.to + 1, 138]]),
                  kind: t > 1.4 && t < c02.to + 0.7 ? "open" : "rest",
                },
            r: held ? { ...rh, kind: "hold" } : { x: tw(t, 1.2, 1.7, rh.x, 64), y: tw(t, 1.2, 1.7, rh.y, 138), kind: "rest" },
          }}
          f={{
            turn: -0.5,
            lookX: t < 1.3 ? -0.3 : -0.9,
            lookY: t < 1.3 ? 0.8 : 0.1,
            raise: t < 1.3 ? 0 : 0.35,
            worry: 0.35,
            smile: tw(t, 1.3, c02.from, 0, 0.3),
          }}
          blinks={[1.35]}
        />
        <RoomFront>
          <g transform={`translate(${a.x} ${a.y}) rotate(${a.rot}) scale(${0.4 * SON_SCALE} ${0.4 * SON_SCALE * a.flat})`}>
            <Album uid="album-table" />
          </g>
        </RoomFront>
      </World>
      <WarmGrade />
    </AbsoluteFill>
  );
};
