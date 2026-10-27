// 2. Календарь: из рисунка — в экран календаря (склейка), камера отъезжает
// от телефона к родителям. Мама спрашивает, кто утром отвезёт сына, папа
// отвечает про встречу. Общий план: сын с альбомом стоит рядом,
// рисунок никто не заметил — альбом медленно опускается.
import { AbsoluteFill } from "remotion";
import { useScene, useTimeline } from "../context";
import { keys, tw } from "../rig/motion";
import { RoomBack, RoomFront, WarmGrade } from "../sets/LivingRoom";
import { lerpCam, World, type Cam } from "../shots";
import { BusyParents } from "./Parents";
import { StandingSon } from "./Son";

const PHONE: Cam = { cx: 650, cy: 1284, z: 9.5 };
const TWO: Cam = { cx: 830, cy: 1150, z: 1.6 };
const WIDE: Cam = { cx: 1000, cy: 1200, z: 1.12 };

export const PlansScene: React.FC = () => {
  const { t, dur, cue, abs } = useScene();
  const { cues } = useTimeline();
  const m01 = cue("m01");
  const f01 = cue("f01");
  const cut = f01.to + 0.25;
  const wide = t >= cut;
  // отъезд от экрана — плавно, с замедлением
  const k = tw(t, 0.25, 1.7, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const cam = wide ? lerpCam(WIDE, { ...WIDE, z: 1.17, cx: 1030 }, (t - cut) / (dur - cut)) : lerpCam(PHONE, { ...TWO, z: TWO.z + t * 0.012 }, k);
  const momTurn = keys(t, [
    [0, 0],
    [m01.from - 0.35, 0],
    [m01.from + 0.15, 1],
    [f01.to + 0.1, 1],
    [f01.to + 0.6, 0.15],
  ]);
  const dadTurn = keys(t, [
    [0, 0],
    [m01.to - 0.2, 0],
    [m01.to + 0.3, 1],
    [f01.to + 0.4, 1],
    [f01.to + 1.0, 0.2],
  ]);
  const shrug = keys(t, [
    [f01.from + 0.3, 0],
    [f01.from + 0.8, 0.8],
    [f01.to, 0],
  ]);
  const ay = keys(t, [
    [cut, 112],
    [cut + 0.6, 116],
    [dur - 0.2, 190],
  ]);
  return (
    <AbsoluteFill>
      <World cam={cam}>
        <RoomBack t={abs} />
        <BusyParents
          t={t}
          abs={abs}
          cues={cues}
          s={{
            momTurn,
            dadTurn,
            dadShrug: shrug,
            calendarRow: t < m01.to ? 0 : 2,
            calendarMark: tw(t, m01.from + 0.6, m01.from + 1.4, 0, 1),
            momPoint: keys(t, [
              [m01.from + 0.3, 0],
              [m01.from + 0.9, 1],
              [f01.to + 0.2, 1],
              [f01.to + 0.8, 0],
            ]),
          }}
        />
        <StandingSon
          t={t}
          abs={abs}
          cues={cues}
          album={{ y: ay, rot: tw(t, cut, dur, -2, 4) }}
          pose={{ lean: tw(t, cut, dur, 0, -2) }}
          f={{
            turn: -0.45,
            lookX: keys(t, [
              [cut, -0.85],
              [dur - 1.2, -0.6],
              [dur - 0.4, -0.1],
            ]),
            lookY: tw(t, cut + 0.8, dur - 0.3, 0.1, 0.7),
            worry: tw(t, cut, dur - 0.5, 0.45, 0.8),
            smile: tw(t, cut, dur - 0.5, 0.12, -0.3),
            lid: tw(t, cut + 0.8, dur, 0, 0.45),
          }}
          blinks={[cut + 0.9]}
        />
        <RoomFront />
      </World>
      <WarmGrade />
    </AbsoluteFill>
  );
};
