// 6. Рассказ и контакты: из листа-маршрута — в тот же рисунок в руках сына
// (склейка), камера отъезжает: сын сидит между родителями и наконец
// рассказывает о рисунке, показывая пальцем: «бул — сиз, апа…». Родители
// слушают и улыбаются. Затем камера чуть поднимается, и поверх нижней
// части кадра появляется неподвижная карточка с контактами.
import { AbsoluteFill } from "remotion";
import { useScene, useTimeline, visemeAt } from "../context";
import { Album } from "../props";
import { Person } from "../rig/Person";
import { keys, tw } from "../rig/motion";
import { ROOM, RoomBack, RoomFront, WarmGrade } from "../sets/LivingRoom";
import { lerpCam, World, type Cam } from "../shots";
import { breath, face, idleTilt, talkNod } from "./common";
import { CtaCard } from "./Cta";

const MOM_X = 620;
const SON_X = 840;
const DAD_X = 1060;
const SON_S = 1.15;
const SON_Y = ROOM.seatY - 148 * SON_S;
const ALB = { x: 0, y: 128, s: 0.4 };
// фигуры на рисунке (координаты альбома)
const FIG = { ata: [-174, 20], apa: [-51, 30], men: [59, 62] } as const;

const albumWorld = { x: SON_X + ALB.x * SON_S, y: SON_Y + ALB.y * SON_S };
const CLOSE: Cam = { cx: albumWorld.x, cy: albumWorld.y, z: 3.4 };
const MID: Cam = { cx: 840, cy: 1185, z: 1.5 };
const END: Cam = { cx: 840, cy: 1335, z: 1.36 };

export const StoryScene: React.FC = () => {
  const { t, cue, abs } = useScene();
  const { cues, ctaFrom } = useTimeline();
  const c03 = cue("c03");
  const c03cue = cues.find((c) => c.id === "c03");
  const off = t - abs;
  const w = (i: number, fb: number) => (c03cue && c03cue.words[i] ? c03cue.words[i].start + off : c03.from + fb);
  const pApa = w(1, 0.5);
  const pAta = w(4, 1.6);
  const pMen = w(7, 2.7);
  const cta = ctaFrom + off;
  const sv = visemeAt(cues, "son", abs);
  const mv = visemeAt(cues, "mother", abs);
  const dv = visemeAt(cues, "father", abs);
  const pull = tw(t, 0.1, 1.6, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const cam = t < cta - 0.8 ? lerpCam(CLOSE, MID, pull) : lerpCam(MID, END, tw(t, cta - 0.8, cta + 0.6, 0, 1));
  // палец сына — к фигуре на рисунке
  const fig = t < pApa - 0.15 ? null : t < pAta - 0.15 ? FIG.apa : t < pMen - 0.15 ? FIG.ata : t < c03.to + 0.6 ? FIG.men : null;
  const pointTo = fig ? { x: ALB.x + fig[0] * ALB.s * 1.02 - 26, y: ALB.y + fig[1] * ALB.s * 1.02 + 14 } : { x: 60, y: ALB.y + 30 };
  const sonLook =
    t < pApa ? { turn: 0, lookX: 0, lookY: 0.7 } : t < pAta ? { turn: -0.45, lookX: -0.95, lookY: 0 } : t < pMen ? { turn: 0.45, lookX: 0.95, lookY: 0 } : t < c03.to + 0.8 ? { turn: 0.05, lookX: 0, lookY: 0.15 } : { turn: -0.3, lookX: -0.8, lookY: 0.1 };
  const laugh = keys(t, [
    [pMen, 0],
    [pMen + 0.3, 1],
    [c03.to + 1.0, 1],
    [c03.to + 1.8, 0.4],
  ]);
  return (
    <AbsoluteFill>
      <World cam={cam}>
        <RoomBack t={abs} />
        <Person
          uid="mom-story"
          look="mom"
          x={MOM_X}
          y={ROOM.seatY - 220}
          pose={{
            lean: 4 + laugh * 2,
            tilt: idleTilt(t, 1, 1.2) + 5 + laugh * 3,
            nod: talkNod(mv, abs, 1) + laugh * 2 * Math.abs(Math.sin(t * 9)),
            breathe: breath(t, 1),
            l: { x: 10, y: 205, kind: "rest" },
            // ладонь на спине сына
            r: { x: 150, y: 120, kind: "flat", behind: true },
          }}
          face={face(abs, 1, mv, {
            turn: 0.45,
            lookX: t < pApa ? 0.8 : 0.6,
            lookY: t < pMen ? 0.55 : 0.3,
            raise: t > pApa && t < pAta ? 0.4 : 0.15,
            worry: 0.1,
            smile: 0.55 + laugh * 0.4,
            mouth: { open: laugh * 0.35, round: 0, wide: 0, talking: false },
          })}
        />
        <Person
          uid="dad-story"
          look="dad"
          x={DAD_X}
          y={ROOM.seatY - 236}
          pose={{
            lean: -5,
            tilt: idleTilt(t, 2, 1.2) - 4,
            nod: talkNod(dv, abs, 2) + laugh * 1.5 * Math.abs(Math.sin(t * 8)),
            breathe: breath(t, 2),
            // рука за спиной сына, на его плече
            l: { x: -230, y: 60, kind: "flat", behind: true },
            r: { x: 40, y: 210, kind: "rest" },
          }}
          face={face(abs, 2, dv, {
            turn: -0.45,
            lookX: -0.7,
            lookY: t < pAta ? 0.5 : t < pMen ? 0.1 : 0.4,
            raise: t > pAta && t < pMen ? 0.45 : 0.1,
            smile: 0.5 + laugh * 0.35,
            lid: laugh * 0.4,
          })}
        />
        <Person
          uid="son-story"
          look="son"
          x={SON_X}
          y={SON_Y}
          scale={SON_S}
          pose={{
            legs: "sit",
            lean: 0,
            tilt: idleTilt(t, 3, 1.5) + (fig === FIG.men ? -3 : 0),
            nod: talkNod(sv, abs, 3),
            breathe: breath(t, 3),
            // альбом держит снизу левой рукой (рука за альбомом); правой показывает
            l: { x: ALB.x - 100, y: ALB.y + 60, kind: "hold", behind: true },
            r: fig ? { x: pointTo.x, y: pointTo.y, kind: "point", elbowIn: true } : { x: ALB.x + 100, y: ALB.y + 64, kind: "hold", behind: true },
          }}
          face={face(
            abs,
            3,
            sv,
            {
              ...sonLook,
              raise: 0.3,
              worry: 0,
              smile: t < pMen ? 0.55 : 0.85,
            },
            [pAta - 0.15, c03.to + 0.7],
          )}
          prop={
            <g transform={`translate(${ALB.x} ${ALB.y}) scale(${ALB.s})`}>
              <Album uid="album-story" glow={tw(t, pApa, pApa + 0.6, 0, 0.5)} />
            </g>
          }
        />
        <RoomFront />
      </World>
      <WarmGrade />
      {t >= cta ? <CtaCard t={t - cta} /> : null}
    </AbsoluteFill>
  );
};
