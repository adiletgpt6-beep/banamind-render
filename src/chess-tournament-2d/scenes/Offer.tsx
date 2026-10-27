// Сцена 3. Возможность участвовать (N03).
// A. Кружок: тренер спокойно подходит к столу дочки с листом, кладёт его
//    рядом с доской и доброжелательно показывает на него пальцем. Дочка
//    переводит взгляд на лист.
// B. Лист на столе крупно: заголовок → «Аяктоо: 15:00» (подсветка). Её
//    кисть берётся за край, и лист уходит вверх в её руке (касание видно).
// C. Она держит лист, оживляется и поднимает взгляд на тренера.
import { AbsoluteFill } from "remotion";
import { clamp, cruise, easeInOut, keys, lerp, type Vec } from "../rig/motion";
import { CLUB_POSITION } from "../script";
import { box, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { ROOM } from "../sets/Home";
import { CloseHand, SKIN } from "../props/CloseHand";
import { SCHEDULE_RATIO, ScheduleArt } from "../props/Schedule";
import type { BoardPiece } from "../props/Chess";
import { RoomShot, TABLE_Y, type ActorSpec } from "./shots";
import { ClubBehind, girlSchool, girlSchoolPose, opponent } from "./Club";
import { H } from "./common";

export const offerPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "offer");
  const walk: [number, number] = [0, 56];
  const put: [number, number] = [walk[1] + 2, walk[1] + 22];
  const point = put[1] + 4;
  const close = Math.max(point + 30, T.word("N03", "Кошумча") - 4);
  const mark = close + 26;
  const take = Math.max(mark + 26, T.to("N03") - 30);
  return { walk, put, point, close, mark, take, lift: take + 8, back: take + 44, len: T.len };
};
type P = ReturnType<typeof offerPlan>;

const CLUB_AFTER: BoardPiece[] = CLUB_POSITION.pieces.map((p) => (p.id === "wR" ? { ...p, at: CLUB_POSITION.move.to } : p));
const SHEET: Vec = { x: 430, y: TABLE_Y - 6 };
const SW = 72;

const Wide: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const coachPlace = (t: number) => {
    const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
    return { x: lerp(980, 600, u), y: ROOM.floorY - 44, h: H.coach * 0.96 };
  };
  const sheetC = (t: number): { c: Vec; flat: number } => {
    const pl = coachPlace(t);
    const carry = { x: pl.x - 40, y: 1110 };
    if (t < p.put[0]) return { c: carry, flat: 0 };
    const u = easeInOut(clamp((t - p.put[0]) / (p.put[1] - p.put[0])));
    return { c: { x: lerp(carry.x, SHEET.x, u), y: lerp(carry.y, SHEET.y, u) }, flat: u };
  };
  const coach: ActorSpec = {
    uid: "coach",
    look: "coach",
    place: coachPlace,
    face: (t) => (t < p.walk[1] - 6 ? -0.6 : -0.45),
    pose: (t) => {
      const sh = sheetC(t);
      const pointing = t >= p.point && t < p.point + 40;
      return {
        expr: t < p.put[1] ? "calm" : "softSmile",
        lookY: t >= p.put[0] ? 0.6 : 0.2,
        lean: keys(t, [[p.put[0], 0], [p.put[1], 14], [p.point + 40, 14], [p.point + 56, 4]]),
        armL:
          t < p.put[1] + 2
            ? { target: { x: sh.c.x + 18, y: sh.c.y - 10 }, shape: "pinch", elbow: "down", behind: false }
            : pointing
              ? { target: { x: SHEET.x + 30, y: SHEET.y - 14 }, shape: "point", elbow: "down", behind: false }
              : { target: null },
        armR: { target: null },
      };
    },
    seed: 8,
    blinkShift: 29,
    walkFrom: 0,
  };
  const girlPose = (t: number) => ({ ...girlSchoolPose({ lookY: t >= p.put[0] ? 0.6 : 0.3, expr: t >= p.point ? "softSmile" : "calm" }), lookX: t >= p.walk[1] - 10 && t < p.put[0] ? 0.6 : 0.4 });
  const sh = sheetC(f);
  return (
    <RoomShot
      f={f}
      set="club"
      cam={{ x: 560, y: 1110, zoom: 1.45 }}
      girl={girlSchool(girlPose)}
      dad={opponent}
      extras={[coach]}
      pieces={CLUB_AFTER}
      notebook={false}
      behind={<ClubBehind f={f} />}
      overTable={
        <Svg>
          <g transform={`translate(${sh.c.x} ${sh.c.y}) rotate(${-4 * sh.flat}) scale(1 ${1 - 0.76 * sh.flat})`}>
            <ScheduleArt w={SW} detail={false} />
          </g>
        </Svg>
      }
    />
  );
};

// Лист крупно: от заголовка к «Аяктоо: 15:00»; её рука берёт лист.
const Close: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const W = 820;
  const H0 = W * SCHEDULE_RATIO;
  const lift = easeInOut(clamp((f - p.lift) / 26));
  const c = { x: 540, y: lerp(980, 380, lift) };
  const pan = easeInOut(clamp((f - p.close) / 30));
  const z = lerp(1.0, 1.12, pan);
  const ty = lerp(120, -130, pan);
  // кисть подходит снизу к нижнему краю листа и берёт его щепотью
  const edge = { x: c.x + 120, y: c.y + H0 / 2 - 10 };
  const reach = easeInOut(clamp((f - (p.take - 14)) / 14));
  const L = 220;
  const wrist = { x: lerp(edge.x + 220, edge.x + 0.3 * L, reach), y: lerp(2300, edge.y + 0.88 * L, reach) };
  return (
    <AbsoluteFill style={{ backgroundColor: "#C9A57B" }}>
      <div style={box({ inset: 0, transform: `translateY(${ty}px) scale(${z})`, transformOrigin: "50% 50%" })}>
        <div style={box({ left: -200, top: -400, width: 1480, height: 2800, background: "linear-gradient(180deg, #B98A5E, #D2A877)" })} />
        <Svg>
          <g transform={`translate(${c.x} ${c.y})`}>
            <ScheduleArt w={W} mark={easeInOut(clamp((f - p.mark) / 10))} />
          </g>
          {f >= p.take - 14 ? <CloseHand x={wrist.x} y={wrist.y} angle={162} size={L} {...SKIN.girlSchool} shape={reach > 0.85 ? "pinch" : "rest"} armLen={4} /> : null}
        </Svg>
      </div>
      <div style={box({ inset: 0, backgroundColor: "rgba(200,225,255,0.08)" })} />
    </AbsoluteFill>
  );
};

// Лист в руках, она оживилась и смотрит на тренера.
const Holding: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const up = { x: 452, y: 1150 };
  const girlPose = (t: number) => ({
    ...girlSchoolPose({ expr: "softSmile" }),
    lookY: t < p.back + 14 ? 0.5 : -0.2,
    lookX: 0.5,
    expr: { browIn: 3, browOut: 4, lid: 0.05, smile: 0.55 },
    armL: { target: { x: up.x - SW * 0.42, y: up.y + SW * 0.3 }, shape: "pinch" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: up.x + SW * 0.42, y: up.y + SW * 0.3 }, shape: "pinch" as const, elbow: "down" as const, behind: false },
  });
  const coach: ActorSpec = { uid: "coach", look: "coach", place: () => ({ x: 600, y: ROOM.floorY - 44, h: H.coach * 0.96 }), face: () => -0.45, pose: () => ({ expr: "softSmile", lookY: 0.3, lean: 4 }), seed: 8, blinkShift: 29 };
  return (
    <RoomShot
      f={f}
      set="club"
      cam={{ x: 470, y: 1060, zoom: 2.0 }}
      girl={girlSchool(girlPose)}
      dad={opponent}
      extras={[coach]}
      pieces={CLUB_AFTER}
      notebook={false}
      behind={<ClubBehind f={f} />}
      overTable={
        <Svg>
          <g transform={`translate(${up.x} ${up.y}) rotate(4)`}>
            <ScheduleArt w={SW} detail={false} />
          </g>
        </Svg>
      }
    />
  );
};

export const OfferScene: React.FC = () => {
  const { f } = useScene("offer");
  const p = usePlan(offerPlan);
  if (f < p.close) return <Wide f={f} p={p} />;
  if (f < p.back) return <Close f={f} p={p} />;
  return <Holding f={f} p={p} />;
};
