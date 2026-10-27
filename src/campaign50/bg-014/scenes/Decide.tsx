// Сцена 4 (≈29–42 с): поступок родителей до бренда.
// 1) Крупно телефон мамы: уведомления сыплются, «Ким?» мигает — мама
//    нажимает «Алдын ала пландоо», хаос останавливается.
// 2) Мама подходит к сыну, приседает рядом и говорит папе:
//    «Күн сайын шашылбай, мектепке каттамды алдын ала уюштуруунун жолун
//    карайлы.» — и с улыбкой кладёт руку сыну на плечо.
// 3) Папа закрывает ноутбук, достаёт телефон и подходит к ним.
// 4) Крупно телефон папы: страница BalaGo (Бишкек, ҮЙ → МЕКТЕП → ҮЙ),
//    мама нажимает «Шарттарды көрүү» — родители вместе смотрят условия.
import { useCurrentFrame } from "remotion";
import { useLine, useScene } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { cruise, keys, lerp } from "../rig/motion";
import { BalaGoScreen, HoldingHand, MomCalendarScreen, PhoneFrame, TapFinger } from "../screens";
import { BG14_TEXT } from "../script";
import { HOME, HomeBack, Laptop } from "../sets/Home";
import { camMove, Shot } from "../shots";
import { FLOOR, H, SPOT } from "./common";
import { dadTypePose } from "./Plan";

export const DECIDE_TAP = 26; // нажатие мамы на «Алдын ала пландоо»

const BG = "radial-gradient(circle at 50% 35%, #FFFFFF 0%, #FFF6D8 80%)";

export const DecideScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const m02 = useLine("m02");
  const a = Math.max(DECIDE_TAP + 22, m02.from - 6);
  const b = m02.to + 8;
  const c = b + 34;
  const d = c + 54;
  const momTap = Math.min(DECIDE_TAP, a - 18);
  const mom = (t: number): Place => ({ x: lerp(SPOT.mom, SPOT.momNear, cruise((t - (a - 44)) / 38)), y: FLOOR + 10, h: H.mom });
  const son = (): Place => ({ x: SPOT.son, y: FLOOR, h: H.son });
  const dad = (t: number): Place => ({ x: lerp(SPOT.dad, SPOT.dadNear, cruise((t - c) / 50)), y: FLOOR + 20, h: H.dad });
  const hand = m02.from + Math.round((m02.to - m02.from) * 0.7);
  const momPose = (t: number): PoseIn => {
    const p = mom(t);
    const s = son();
    const shoulder = { x: s.x + 0.1 * s.h, y: s.y - 0.7 * s.h };
    const crouch = keys(t, [[a - 4, 0], [a + 14, 0.2], [c + 10, 0.2], [c + 30, 0]]);
    return {
      crouch,
      expr: t < m02.from ? "calm" : t < m02.to ? "softSmile" : "smile",
      armR: { target: { x: p.x + 0.12 * p.h, y: p.y - 0.4 * p.h }, shape: "phone", item: "phone", elbow: "hang", glow: 0 },
      armL: {
        target: keys(t, [[hand, 0], [hand + 14, 1]]) > 0.5 && t < c + 16 ? shoulder : { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h },
        shape: t > hand + 8 ? "open" : "relax",
        elbow: "down",
        behind: false,
      },
      lookY: keys(t, [[a, 0.1], [hand, 0.1], [hand + 10, 0.35], [c, 0.35], [c + 14, 0]]),
      headTilt: keys(t, [[m02.from, 0], [m02.from + 14, 5], [m02.to, 5], [m02.to + 14, -3]]),
      nod: keys(t, [[m02.to - 10, 0], [m02.to - 4, 4], [m02.to + 4, 0]]),
    };
  };
  const momFace = (t: number) => keys(t, [[a, 0.65], [hand - 4, 0.65], [hand + 8, -0.55], [c, -0.55], [c + 10, 0.6]]);
  const sonPose = (t: number): PoseIn => ({
    expr: t < hand ? "calm" : "smile",
    lookY: keys(t, [[a, -0.3], [c + 20, -0.3], [d, -0.5]]),
    headTilt: keys(t, [[hand, 0], [hand + 12, 5]]),
    armL: { target: null, shape: "relax" },
    armR: { target: null, shape: "relax" },
  });
  const sonFace = (t: number) => keys(t, [[a, 0.5], [hand, 0.5], [hand + 10, 0.65], [c + 30, 0.65], [d, 0.8]]);
  const lid = keys(f, [[b + 6, 1], [b + 20, 0]]);
  const dadPose = (t: number): PoseIn => {
    const p = dad(t);
    if (t < b + 4) return { ...dadTypePose(p, t, 0), expr: "thinking", lean: 2, lookY: 0.1 };
    const phone = t > b + 22;
    return {
      expr: t < b + 16 ? "thinking" : "softSmile",
      armL: t < b + 22 ? { target: { x: HOME.laptop.x - 120, y: HOME.laptop.y - 10 - 200 * (1 - lid) * 0.4 }, shape: "open", elbow: "down" } : { target: null, shape: "relax" },
      armR: phone ? { target: { x: p.x + 0.06 * p.h, y: p.y - 0.56 * p.h }, shape: "phone", item: "phone", elbow: "hang", glow: t > b + 28 ? 1 : 0, behind: false } : { target: { x: p.x + 0.16 * p.h, y: p.y - 0.42 * p.h }, shape: "relax", elbow: "out" },
      nod: keys(t, [[b + 16, 0], [b + 22, 5], [b + 28, 0]]),
      lookY: keys(t, [[b + 20, 0.2], [b + 30, 0.4], [c, 0.1]]),
    };
  };
  const dadFace = (t: number) => keys(t, [[b, 0.6], [b + 18, 0.6], [b + 28, -0.5], [d, -0.5], [d + 10, -0.3]]);
  const world = (
    <>
      <HomeBack minutes={7 * 60 + 45} />
      <Laptop x={HOME.laptop.x} y={HOME.laptop.y} f={f} open={lid} title={BG14_TEXT.call.title} />
      <Actor uid="d-son" look="son" f={f} place={son} face={sonFace} pose={sonPose} role="son" seed={4} />
      <Actor uid="d-mom" look="mom" f={f} place={mom} face={momFace} pose={momPose} role="mother" seed={6} walkFrom={a - 46} />
      <Actor uid="d-dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={c - 2} />
    </>
  );
  const momL = LOOKS.mom;
  const dadL = LOOKS.dad;
  const py = 150;
  return (
    <>
      {/* 1. мама останавливает хаос в календаре */}
      {f < a ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: BG }}>
          <PhoneFrame x={230} y={py} w={620} tilt={-1.5}>
            <MomCalendarScreen f={f} tapAt={momTap} />
          </PhoneFrame>
          <HoldingHand x={230} y={py} w={620} sleeve={momL.topColor} skin={momL.skin} />
          <TapFinger x={540} y={py + 22 + 960} f={f} tapAt={momTap} skin={momL.skin} />
        </div>
      ) : null}
      {/* 2. мама рядом с сыном: «…алдын ала уюштуруунун жолун карайлы» */}
      <Shot f={f} from={a} to={b} cam={camMove(f, a, b, { x: 720, y: 1150, zoom: 1.32 }, { x: 700, y: 1160, zoom: 1.42 })}>
        {world}
      </Shot>
      {/* 3. папа закрывает ноутбук и берёт телефон */}
      <Shot f={f} from={b} to={c} cam={camMove(f, b, c, { x: SPOT.dad + 80, y: 1060, zoom: 1.45 }, { x: SPOT.dad + 40, y: 1080, zoom: 1.5 })}>
        {world}
      </Shot>
      {/* 4. папа подходит к семье */}
      <Shot f={f} from={c} to={d} cam={camMove(f, c, d, { x: 1380, y: 1150, zoom: 0.92 }, { x: 900, y: 1150, zoom: 1.0 })}>
        {world}
      </Shot>
      {/* 5. страница BalaGo в телефоне папы — вместе смотрят условия */}
      {f >= d ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: BG }}>
          <PhoneFrame x={230} y={py + 40} w={620} tilt={-2}>
            <BalaGoScreen f={f - d} tapAt={Math.min(50, frames - d - 12)} />
          </PhoneFrame>
          <HoldingHand x={230} y={py + 40} w={620} sleeve={dadL.topColor} skin={dadL.skin} />
          <TapFinger x={540} y={py + 40 + 1010} f={f - d} tapAt={Math.min(50, frames - d - 12)} skin={momL.skin} />
        </div>
      ) : null}
    </>
  );
};
