// Сцена 2 (6,2–17,6 с): параллельный монтаж. Кадр делится пополам:
// вверху — сын в школьном коридоре звонит папе, внизу — папа в офисе
// берёт телефон, за его спиной коллеги идут в переговорную.
// Сын: «Ата, бүгүн мектептен сиз алып кетесизби?» Папа: «Балам,
// убакытты тактап алайын.» — и переводит взгляд на календарь на мониторе.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../../../config";
import { CuesContext } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV, type Vec } from "../rig/motion";
import { OFFICE } from "../sets/Office";
import { SchoolHall } from "../sets/SchoolHall";
import { box, Pane } from "../shots";
import { H, lineFrames, onDesk, placeAt, seatedDad, seatOf } from "./common";
import { OfficeWorld, type Walker } from "./OfficeWorld";

export const CALL = { pick: 18, ear: 40, look: 0 } as const;
const SPLIT = 950;

const WALKERS: readonly Walker[] = [
  { uid: "call-a", look: "parentA", place: (t) => placeAt(keys(t, [[20, 380], [260, 1600]], (x) => x), 1490, H.colleagueB), pose: () => ({ expr: "calm", armR: { target: null, shape: "fist", item: "notebook" } }), seed: 7, walkFrom: 20 },
];

export const CallScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const s01 = lineFrames(cues, "s01", "call");
  const f01 = lineFrames(cues, "f01", "call");
  const dad = seatedDad();
  const ear: Vec = { x: dad.x - 0.1 * dad.h, y: dad.y - 0.66 * dad.h };
  const phoneDesk: Vec = { x: OFFICE.phone.x, y: OFFICE.phone.y - 6 };
  const lookMon = f01.to + 14;
  const dadPose = (t: number) => ({
    expr: t < s01.to ? ("calm" as const) : t < f01.to ? ("thinking" as const) : ("worried" as const),
    sit: 1,
    seat: seatOf(dad),
    lean: keys(t, [[CALL.pick - 6, 2], [CALL.pick, 8], [CALL.ear + 6, 3]]),
    lookY: keys(t, [[0, 0.4], [CALL.pick + 4, 0.4], [CALL.ear, 0.05]]),
    lookX: keys(t, [[lookMon - 2, 0], [lookMon + 4, 0.7], [lookMon + 30, 0.3]]),
    armL: {
      target: keysV(t, [[0, onDesk(dad.x - 0.13 * dad.h, -4)], [CALL.pick - 4, phoneDesk], [CALL.pick + 4, phoneDesk], [CALL.ear, ear]], anticipate),
      shape: t >= CALL.pick ? ("phone" as const) : ("open" as const),
      item: t >= CALL.pick ? ("phone" as const) : ("none" as const),
      flat: t >= CALL.pick ? 1 - clamp((t - CALL.pick) / 14) : 1,
      glow: 1,
      itemTilt: keys(t, [[CALL.pick + 10, 0], [CALL.ear, 18]]),
      elbow: "down" as const,
      behind: false,
    },
    armR: { target: onDesk(OFFICE.folder.x + 40, -4), shape: "relax" as const, elbow: "down" as const },
    nod: keys(t, [[f01.from, 0], [f01.from + 8, 4], [f01.from + 18, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[0, -0.1], [s01.from, -0.1], [s01.from + 10, 0.05], [lookMon, 0.05], [lookMon + 12, 0.6]]);

  const son = placeAt(860, 1500, H.son);
  const sonPose = (t: number) => ({
    expr: t < f01.from ? ("softSmile" as const) : ("calm" as const),
    armR: { target: { x: son.x + 0.12 * son.h, y: son.y - 0.84 * son.h }, shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: -16, elbow: "down" as const, behind: false },
    armL: { target: { x: son.x - 0.12 * son.h, y: son.y - 0.6 * son.h }, shape: "fist" as const, elbow: "down" as const },
    strapTug: 0.7,
    headTilt: keys(t, [[s01.from, 0], [s01.from + 14, -5], [f01.from, -5], [f01.from + 16, 2]]),
    nod: keys(t, [[f01.to, 0], [f01.to + 8, 5], [f01.to + 18, 0]]),
    lookY: keys(t, [[f01.to + 10, 0], [f01.to + 22, 0.3]]),
  });
  const sonFace = () => -0.25;

  const slide = easeOut(f / 14);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <Pane top={0} height={SPLIT} offsetX={-(1 - slide) * 1080} cam={{ x: 860 + f * 0.08, y: 1170, zoom: 1.22 }}>
        <SchoolHall minutes={13 * 60 + 58} />
        <Actor uid="son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} />
      </Pane>
      <Pane top={SPLIT + 16} height={1920 - SPLIT - 16} offsetX={(1 - slide) * 1080} cam={{ x: 900 - f * 0.06, y: 1150, zoom: 1.25 }}>
        <OfficeWorld
          f={f}
          dad={() => dad}
          dadFace={dadFace}
          dadPose={dadPose}
          walkers={WALKERS}
          sitters={1}
          doorOpen={1}
          phone={f < CALL.pick ? { glow: 1, shake: f < CALL.pick - 2 ? Math.sin(f * 2.6) * 4 : 0 } : null}
        />
      </Pane>
      <div style={box({ left: 0, right: 0, top: SPLIT, height: 16, backgroundColor: COLORS.yellow, scale: `${slide} 1` })} />
    </div>
  );
};
