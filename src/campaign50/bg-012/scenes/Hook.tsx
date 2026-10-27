// 1. Хук: крупный план — сын из-за альбома с ярким рисунком смотрит на
// родителей, набирается смелости (вдох, плечи) и тихо спрашивает. За ним,
// не в фокусе, родители смотрят в календарь. В конце камера въезжает в
// рисунок — предметная склейка с экраном календаря.
import { AbsoluteFill, interpolate } from "remotion";
import { useScene, useTimeline, visemeAt } from "../context";
import { Album } from "../props";
import { Person } from "../rig/Person";
import { keys, tw } from "../rig/motion";
import { RoomBack, RoomFront, WarmGrade } from "../sets/LivingRoom";
import { World } from "../shots";
import { breath, clamp, face, idleTilt, talkNod } from "./common";
import { BusyParents } from "./Parents";

export const HookScene: React.FC = () => {
  const { t, dur, cue, abs } = useScene();
  const { cues } = useTimeline();
  const c01 = cue("c01");
  const vis = visemeAt(cues, "son", abs);
  // альбом: прикрывает лицо → опускается к груди
  const ay = keys(t, [
    [0, 96],
    [0.35, 96],
    [1.05, 196],
  ]);
  const inhale = keys(t, [
    [0, 0],
    [0.5, 0],
    [1.0, 0.5],
    [c01.from + 0.2, 0.15],
  ]);
  // въезд в рисунок в конце сцены (склейка с экраном календаря)
  const push = tw(t, dur - 0.75, dur, 0, 1, (x) => x * x * x);
  const camS = interpolate(t, [0, dur - 0.75], [1, 1.07], clamp) * (1 + push * 1.7);
  // центр въезда — рисунок на альбоме
  const fx = 680;
  const fy = 1080 + (ay + 12) * 2.3;
  const bgCam = { cx: 930, cy: 1150, z: 1.3 + t * 0.01 };
  const lookPar = keys(t, [
    [0, -0.75],
    [c01.from + 0.3, -0.85],
    [c01.to + 0.25, -0.85],
    [c01.to + 0.6, -0.2],
  ]);
  return (
    <AbsoluteFill>
      <World cam={bgCam} blur={7}>
        <RoomBack t={abs} />
        <BusyParents t={t} abs={abs} cues={cues} s={{ momTurn: 0, dadTurn: tw(t, 2.2, 3.0, 0, 0.3), calendarRow: 0 }} />
        <RoomFront />
      </World>
      <AbsoluteFill style={{ background: "rgba(60,30,10,0.12)" }} />
      <AbsoluteFill style={{ transform: `scale(${camS})`, transformOrigin: `${fx}px ${fy}px` }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <g transform="translate(680 1080) scale(2.3)">
            <Person
              uid="son-hook"
              look="son"
              x={0}
              y={0}
              pose={{
                legs: "none",
                lean: -2,
                tilt: -4 + idleTilt(t, 3, 1.5) - inhale * 2,
                nod: talkNod(vis, abs, 3),
                breathe: breath(t, 3) * 0.4 + inhale,
                shrug: inhale * 0.6,
                l: { x: -150, y: ay + 18, kind: "hold" },
                r: { x: 150, y: ay + 22, kind: "hold" },
              }}
              face={face(
                abs,
                3,
                vis,
                {
                  turn: -0.32,
                  lookX: lookPar,
                  lookY: tw(t, 0, 0.8, 0.15, -0.05),
                  raise: 0.25,
                  worry: keys(t, [
                    [0, 0.65],
                    [c01.from, 0.45],
                    [c01.to + 0.3, 0.6],
                  ]),
                  smile: keys(t, [
                    [0, 0],
                    [c01.from - 0.2, 0.18],
                    [c01.to + 0.3, 0.1],
                  ]),
                },
                [0.45, c01.from - 0.25],
              )}
              propFront={
                <g transform={`translate(0 ${ay}) rotate(${-2 + tw(t, 0.35, 1.05, -3, 0)})`}>
                  <g transform="scale(0.5)">
                    <Album uid="album-hook" />
                  </g>
                  {/* большие пальцы на краях альбома */}
                  <ellipse cx={-166} cy={20} rx={9} ry={16} fill="#F4CDA8" />
                  <ellipse cx={166} cy={24} rx={9} ry={16} fill="#F4CDA8" />
                </g>
              }
            />
          </g>
        </svg>
      </AbsoluteFill>
      <WarmGrade />
    </AbsoluteFill>
  );
};
