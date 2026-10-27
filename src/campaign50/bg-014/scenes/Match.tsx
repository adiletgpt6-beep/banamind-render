// Сцена 3 (≈16–29 с): визуальный матч-кат. Те же красные кроссовки —
// неподвижно в центре светлого кадра, а вокруг покадрово (стоп-моушн)
// кружат семь утренних напоминаний. Склейка на сына: он спокойно,
// без обиды поднимает глаза на родителей:
// «Эмне үчүн мен даяр болгондо сиздер дагы эле убакыт издейсиздер?»
// Диктор (общий план: мальчик ждёт у двери, взрослые в телефоне и
// ноутбуке; затем снова кроссовки, напоминания кружат быстрее):
// «Бала даяр. Ал эми чоңдор жолдун графигин кайрадан сүйлөшүп жатышат.»
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useTimeline } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, easeOut, hash01, keys } from "../rig/motion";
import { BG14_TEXT } from "../script";
import { HOME, HomeBack, Laptop } from "../sets/Home";
import { camMove, Shot } from "../shots";
import { C } from "../palette";
import { Sneakers, stopFrame } from "../sneakers";
import { FLOOR, H, ReminderCard, SPOT, wordFrame } from "./common";
import { DAD_DESK, dadTypePose, MOM_AT, momPhonePose } from "./Plan";

export const MATCH = { cardEvery: 7, cardFrom: 4 } as const;

const SON = (): Place => ({ x: SPOT.son, y: FLOOR, h: H.son });

// Кроссовки и кружащие напоминания. speed — скорость кружения.
const Orbit: React.FC<{ readonly f: number; readonly from: number; readonly speed: number; readonly all?: boolean }> = ({ f, from, speed, all }) => {
  const sf = stopFrame(f);
  const items = BG14_TEXT.reminders;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 46%, #FFFFFF 0%, #FFFDF4 50%, #FFF1C2 100%)" }}>
      <div style={{ position: "absolute", left: 140, top: 1210, width: 800, height: 60, borderRadius: "50%", backgroundColor: "rgba(20,30,60,0.08)" }} />
      {items.map((txt, i) => {
        const appear = all ? 1 : easeOut((f - from - MATCH.cardFrom - i * MATCH.cardEvery) / 6);
        if (appear <= 0) return null;
        const ang = (i / items.length) * Math.PI * 2 + (sf / 30) * speed;
        const rx = 270 + 30 * hash01(i + 1);
        const ry = 500 + 60 * hash01(i + 7);
        const x = 540 + Math.cos(ang) * rx;
        const y = 820 + Math.sin(ang) * ry;
        const rot = Math.sin(ang * 2 + i) * 9 + (hash01(sf + i) - 0.5) * 3;
        return <ReminderCard key={i} x={x} y={y} rot={rot} text={txt} a={appear} s={0.8} />;
      })}
      {/* кроссовки неподвижны: шнурки чуть дрогнули, сами — ни с места */}
      <Sneakers x={170} y={1240} s={1.12} f={f} tie={1} jitter={0.25} />
    </div>
  );
};

export const MatchScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames, from } = useScene();
  const s02 = useLine("s02");
  const n01 = useLine("n01");
  const n01cue = useTimeline().cues.find((c) => c.id === "n01")!;
  const back = Math.max(n01.from + 30, wordFrame(n01cue, "ал", 0.4, from) - 4); // «Ал эми чоңдор…»
  const a = s02.from - 10;
  const b = s02.to + 12;
  const sonPose = (t: number): PoseIn => ({
    expr: t < s02.from ? "calm" : t < s02.to ? "thinking" : "softSmile",
    lookY: keys(t, [[a, 0], [a + 12, -0.55]]),
    headTilt: keys(t, [[s02.from, 0], [s02.from + 14, -7], [s02.to, -7], [s02.to + 14, -2]]),
    strapTug: keys(t, [[a, 0], [a + 10, 0.8]]),
    armL: { target: null, shape: "relax" },
    armR: { target: null, shape: "relax" },
    nod: keys(t, [[s02.to - 8, 0], [s02.to, 3], [s02.to + 8, 0]]),
  });
  const sonFace = (t: number) => keys(t, [[a, 0.45], [s02.to, 0.45], [s02.to + 14, 0.2]]);
  const mom = MOM_AT(SPOT.mom);
  const world = (
    <>
      <HomeBack minutes={7 * 60 + 43} />
      <Laptop x={HOME.laptop.x} y={HOME.laptop.y} f={f} title={BG14_TEXT.call.title} />
      <Actor uid="m-mom" look="mom" f={f} place={mom} face={() => 0.1} pose={(t) => ({ ...momPhonePose(mom(), t), expr: "thinking", lookY: 0.45 })} role="mother" seed={6} />
      <Actor uid="m-dad" look="dad" f={f} place={DAD_DESK} face={() => 0.6} pose={(t) => ({ ...dadTypePose(DAD_DESK(), t), expr: "thinking" })} role="father" seed={2} />
      <Actor uid="m-son" look="son" f={f} place={SON} face={sonFace} pose={sonPose} role="son" seed={4} />
    </>
  );
  const orbitShot = (t0: number, speed: number, all?: boolean) => <Orbit f={f} from={t0} speed={speed} all={all} />;
  return (
    <>
      {f < a ? orbitShot(0, 1, false) : null}
      {/* сын снизу вверх смотрит на родителей и спрашивает */}
      <Shot f={f} from={a} to={b} cam={camMove(f, a, b, { x: SPOT.son + 60, y: FLOOR - 0.7 * H.son, zoom: 2.0 }, { x: SPOT.son + 50, y: FLOOR - 0.72 * H.son, zoom: 2.15 })}>
        {world}
      </Shot>
      {/* общий план: мальчик ждёт, взрослые в своих экранах */}
      <Shot f={f} from={b} to={back} cam={camMove(f, b, back, { x: 1240, y: 1180, zoom: 0.62 }, { x: 1250, y: 1170, zoom: 0.66 })}>
        {world}
      </Shot>
      {f >= back ? orbitShot(back - 200, 2.4, true) : null}
      {/* напоминания застывают на последних кадрах — стоп */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: C.yellow, opacity: 0.12 * clamp((f - frames + 10) / 10), pointerEvents: "none" }} />
    </>
  );
};
