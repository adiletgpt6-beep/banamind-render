// Сцена 2 (≈5,5–16 с): с высоты ребёнка. Камера на уровне глаз сына,
// в углу кадра — его красные кроссовки (он стоит здесь же, у двери).
// В глубине комнаты мама сверяет календарь в телефоне со временем школы,
// папа у высокого стола — на рабочей встрече в ноутбуке. Все дома,
// ребёнка не оставили одного.
// Мама: «Бүгүн мектепке ким жеткирет?»
// Папа: «Менин эртең менен жыйыным бар. Сиздин график кандай?»
import { useCurrentFrame } from "remotion";
import { useLine, useScene } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { keys } from "../rig/motion";
import { BG14_TEXT } from "../script";
import { HOME, HomeBack, Laptop } from "../sets/Home";
import { camMove, Shot } from "../shots";
import { Sneakers } from "../sneakers";
import { FLOOR, H, SPOT } from "./common";

export const MOM_AT = (x: number) => (): Place => ({ x, y: FLOOR + 10, h: H.mom });
export const DAD_DESK = (): Place => ({ x: SPOT.dad, y: FLOOR + 20, h: H.dad });

// Мама с телефоном: правая рука держит телефон у груди, левая листает.
export const momPhonePose = (p: Place, t: number, scroll = 1): PoseIn => ({
  armR: { target: { x: p.x + 0.06 * p.h, y: p.y - 0.6 * p.h }, shape: "phone", item: "phone", elbow: "hang", glow: 1, behind: false },
  armL: { target: { x: p.x - 0.01 * p.h, y: p.y - 0.58 * p.h + Math.sin(t / 4) * 4 * scroll }, shape: "point", elbow: "down", behind: false },
});

// Папа печатает на ноутбуке (стол справа от него).
export const dadTypePose = (p: Place, t: number, typing = 1): PoseIn => ({
  armR: { target: { x: HOME.laptop.x - 110 + Math.sin(t / 2.2) * 6 * typing, y: HOME.laptop.y - 8 - Math.abs(Math.sin(t / 2.2)) * 6 * typing }, shape: "relax", elbow: "down", behind: false },
  armL: { target: { x: HOME.laptop.x - 170 + Math.sin(t / 2.6 + 1) * 6 * typing, y: HOME.laptop.y - 6 }, shape: "relax", elbow: "down", behind: false },
  lean: 6,
  lookY: 0.3,
});

export const PlanScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const m01 = useLine("m01");
  const f01 = useLine("f01");
  const ask = f01.from + Math.round((f01.to - f01.from) * 0.52); // «Сиздин график кандай?»
  const mom = MOM_AT(SPOT.mom);
  const momFace = (t: number) => keys(t, [[0, 0.1], [m01.from + 10, 0.1], [m01.from + 22, 0.7], [f01.to + 10, 0.7], [f01.to + 24, 0.1]]);
  const momPose = (t: number): PoseIn => ({
    ...momPhonePose(mom(), t, t < m01.from ? 1 : 0.2),
    expr: t < m01.from ? "thinking" : t < f01.to ? "worried" : "thinking",
    lookY: keys(t, [[m01.from + 8, 0.45], [m01.from + 20, 0], [f01.to + 10, 0], [f01.to + 22, 0.45]]),
    headTilt: keys(t, [[m01.from, 0], [m01.from + 14, 5], [m01.to + 6, 5], [m01.to + 20, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[0, 0.6], [f01.from - 6, 0.6], [f01.from + 6, -0.55], [f01.to + 6, -0.55], [f01.to + 20, 0.6]]);
  const dadPose = (t: number): PoseIn => {
    const typing = t < f01.from - 8 || t > f01.to + 16 ? 1 : 0;
    const base = dadTypePose(DAD_DESK(), t, typing);
    const p = DAD_DESK();
    // на «Сиздин график кандай?» — открытая ладонь в сторону мамы
    const gesture = keys(t, [[ask - 10, 0], [ask, 1], [f01.to + 4, 1], [f01.to + 16, 0]]);
    return {
      ...base,
      armL: gesture > 0.05 ? { target: { x: p.x - 0.2 * p.h, y: p.y - 0.5 * p.h + (1 - gesture) * 60 }, shape: "open", elbow: "down", behind: false } : base.armL,
      expr: t < f01.from ? "thinking" : t < ask ? "apologetic" : "calm",
      lean: typing ? 6 : 2,
      lookY: typing ? 0.3 : 0,
      nod: keys(t, [[f01.from + 6, 0], [f01.from + 12, 4], [f01.from + 20, 0]]),
    };
  };
  const world = (
    <>
      <HomeBack minutes={7 * 60 + 41} />
      <Laptop x={HOME.laptop.x} y={HOME.laptop.y} f={f} title={BG14_TEXT.call.title} />
      <Actor uid="p-mom" look="mom" f={f} place={mom} face={momFace} pose={momPose} role="mother" seed={6} />
      <Actor uid="p-dad" look="dad" f={f} place={DAD_DESK} face={dadFace} pose={dadPose} role="father" seed={2} />
    </>
  );
  // POV: у нижнего края — свои кроссовки (нетерпеливо постукивают носком)
  const tap = (t: number) => Math.max(0, Math.sin(t / 3)) * 10;
  const pov = (t: number) => (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, filter: "blur(1.5px)" }}>
        <Sneakers x={-70} y={1990} s={0.9} f={t} tie={1} jitter={0.4} bounce={tap(t)} />
      </div>
    </div>
  );
  const a = m01.from - 6;
  const b = f01.from - 4;
  const c = f01.to + 10;
  return (
    <>
      {/* 1. POV ребёнка: родители заняты, он смотрит снизу */}
      <Shot f={f} from={0} to={a} cam={camMove(f, 0, a, { x: 1480, y: 1130, zoom: 0.8 }, { x: 1440, y: 1110, zoom: 0.86 })} overlay={pov(f)}>
        {world}
      </Shot>
      {/* 2. мама: календарь против времени школы */}
      <Shot f={f} from={a} to={b} cam={camMove(f, a, b, { x: SPOT.mom + 40, y: 1120, zoom: 1.5 }, { x: SPOT.mom + 70, y: 1110, zoom: 1.6 })}>
        {world}
      </Shot>
      {/* 3. папа у ноутбука */}
      <Shot f={f} from={b} to={c} cam={camMove(f, b, c, { x: SPOT.dad + 60, y: 1080, zoom: 1.45 }, { x: SPOT.dad + 20, y: 1090, zoom: 1.55 })}>
        {world}
      </Shot>
      {/* 4. снова POV: оба опять в своих экранах */}
      <Shot f={f} from={c} to={frames + 1} cam={camMove(f, c, frames, { x: 1460, y: 1120, zoom: 0.84 }, { x: 1480, y: 1130, zoom: 0.8 })} overlay={pov(f)}>
        {world}
      </Shot>
    </>
  );
};
