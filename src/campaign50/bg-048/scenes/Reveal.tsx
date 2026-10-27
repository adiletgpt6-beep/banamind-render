// Сцена 3 — «Кыялдан — пландоого». Папа снимает наушники; бейдж «Кыялдагы
// тамаша» отклеивается; всё вокруг «выцветает» в картон с рисунком
// маркером, панели складываются, как страницы книжки-раскладушки, а
// огромный стол-пульт сжимается в картонную коробку на обычном кухонном
// столе; камера отъезжает — обычная кухня в Бишкеке. Из-за коробки
// выскакивает дочь: «Апа, ата, бул пультту мен жасадым! Сиздерге жактыбы?»
// Мама смеётся: «Абдан жакты, кызым!» Папа надевает дочери наушники-
// стаканчики («главный диспетчер»), ласково стучит по картону:
// «Чыныгы пульт жок да. Анда … уюштуруп көрөлүчү?» Мама кивает и берёт
// телефон — сама начинает искать решение.
import { AbsoluteFill, interpolate } from "remotion";
import { useScene, useViseme } from "../context";
import { Heart, Sparkles } from "../props/Fx";
import { BOX, CONSOLE_IDLE, Headset } from "../sets/Console";
import { LOOKS } from "../rig/looks";
import { lerpCam, type Cam } from "../shots";
import { B48_TEXT } from "../script";
import { breath, clamp, face, idleTilt, prog, talkNod } from "./common";
import { handKeys, ramp, W, type Pt } from "./acting";
import { Caption, FantasyBadge } from "./Overlays";
import { KitchenWorld, SEATS } from "./World";

export const MED: Cam = { cx: 780, cy: 1062, z: 1.12 };
export const WIDE: Cam = { cx: 800, cy: 1262, z: 0.76 };
export const FAMILY: Cam = { cx: 805, cy: 1095, z: 1.02 };

// Телефон мамы (лежит на столе, потом в руках) — мировые координаты.
export const MomPhone: React.FC<{ readonly x: number; readonly y: number; readonly a?: number; readonly s?: number; readonly lit?: number }> = ({ x, y, a = 0, s = 1, lit = 0 }) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${s})`}>
    <rect x={-34} y={-62} width={68} height={124} rx={14} fill="#2B2F3A" />
    <rect x={-29} y={-55} width={58} height={110} rx={9} fill={lit > 0.5 ? "#EAF4FF" : "#3C4352"} />
    {lit > 0.5 ? <rect x={-22} y={-44} width={44} height={10} rx={5} fill="#F7C531" /> : null}
  </g>
);

type Span = { readonly from: number; readonly to: number };

// Ключевые моменты сцены — общие для анимации и звука.
export const revealBeats = (d01: Span, m02: Span, f03: Span) => ({
  lift: 0.3,
  paper: 0.55,
  folds: [0.9, 1.3, 1.7, 2.1],
  pop: 2.65,
  give0: m02.to - 0.2,
  give1: m02.to + 0.75,
  patT0: f03.from + 0.15,
  grab: f03.to - 0.5,
  d01from: d01.from,
});

export const RevealScene: React.FC = () => {
  const { t, cue, start } = useScene();
  const dadV = useViseme("father");
  const momV = useViseme("mother");
  const girlV = useViseme("daughter");
  const d01 = cue("d01");
  const m02 = cue("m02");
  const f03 = cue("f03");
  const dadAt = SEATS.dad;
  const momAt = SEATS.mom;
  const dl = LOOKS.dad.build;

  // ---------- Раскрытие ----------
  const paper = ramp(t, 0.55, 1.25);
  const fold = ramp(t, 0.95, 2.45);
  const shrink = ramp(t, 1.15, 2.6);
  const fantasy = 1 - ramp(t, 1.3, 2.4);
  const boxIn = ramp(t, 2.1, 2.6);
  const pop = interpolate(t, [2.65, 3.05, 3.25], [0, 1.08, 1], { ...clamp });
  // отъезд на общий план (обычная кухня) → средний план семьи → к маме с телефоном
  const camK = ramp(t, 0.85, 3.05);
  const famK = ramp(t, d01.from - 0.1, d01.from + 1.1);
  const tailK = ramp(t, f03.to + 0.2, f03.to + 2.2);
  const cam = lerpCam(lerpCam(lerpCam(MED, WIDE, camK), FAMILY, famK), { cx: 930, cy: 1100, z: 1.06 }, tailK);

  // ---------- Наушники папы: сняты → на стол → на голову дочери ----------
  const dadHead: Pt = { x: dadAt.x, y: dadAt.y - dl.neck - dl.headRy * 0.9 };
  // дочь появляется из-за коробки (до её появления не рисуется вовсе)
  const girlY = SEATS.girl.hidden + (SEATS.girl.y - SEATS.girl.hidden) * pop;
  const gl = LOOKS.girl.build;
  const girlHead: Pt = { x: SEATS.girl.x, y: girlY - gl.neck - gl.headRy * 0.9 };
  const lift = ramp(t, 0.3, 0.85, 0, 120);
  const onTable: Pt = { x: 395, y: 1262 };
  const beats = revealBeats(d01, m02, f03);
  const { give0, give1 } = beats;
  const toTable = ramp(t, 0.85, 1.45);
  const toGirl = ramp(t, give0, give1);
  const hsOnGirl = t >= give1;
  const hsWorld: Pt = (() => {
    const lifted = { x: dadHead.x, y: dadHead.y - lift };
    const a = { x: lifted.x + (onTable.x - lifted.x) * toTable, y: lifted.y + (onTable.y - lifted.y) * toTable - 40 * Math.sin(Math.PI * toTable) };
    return { x: a.x + (girlHead.x - a.x) * toGirl, y: a.y + (girlHead.y - a.y) * toGirl - 70 * Math.sin(Math.PI * toGirl) };
  })();
  const dadWearing = t < 0.3;
  const hsScale = 1 - 0.1 * toTable * (1 - toGirl) - 0.04 * toGirl;

  // ---------- Ата ----------
  const restDL = W("dad", dadAt, 1, 430, 1290);
  const restDR = W("dad", dadAt, 1, 610, 1290);
  const pat = (k: number) => W("dad", dadAt, 1, BOX.x + 40, BOX.y + 6 - 18 * Math.abs(Math.sin(k)));
  const patT0 = beats.patT0;
  const dadR = handKeys(t, [
    [0, W("dad", dadAt, 1, 600, 1230)],
    [0.3, { x: 72, y: -98 }, "hold"],
    [0.85, { x: 70, y: -98 - 120 }, "hold"],
    [1.45, W("dad", dadAt, 1, onTable.x + 60, onTable.y), "hold"],
    [1.8, restDR],
    [give0 - 0.35, restDR],
    [give0, W("dad", dadAt, 1, onTable.x + 60, onTable.y), "hold"],
    [give1, W("dad", dadAt, 1, girlHead.x - 20, girlHead.y - 60), "hold"],
    [give1 + 0.35, restDR],
    [patT0, pat(0)],
    [patT0 + 0.9, pat(Math.max(0, t - patT0) * 9)],
    [patT0 + 1.2, restDR],
    [f03.from + 2.4, restDR],
    [f03.from + 2.9, W("dad", dadAt, 1, 760, 1150), "open"],
    [f03.to - 0.4, W("dad", dadAt, 1, 780, 1140), "open"],
    [f03.to + 0.3, restDR],
  ], { elbowIn: t > patT0 - 0.5 && t < patT0 + 1.6 });
  const dadL = handKeys(t, [
    [0, W("dad", dadAt, 1, 430, 1236)],
    [0.3, { x: -72, y: -98 }, "hold"],
    [0.85, { x: -70, y: -98 - 120 }, "hold"],
    [1.45, W("dad", dadAt, 1, onTable.x - 60, onTable.y), "hold"],
    [1.8, restDL],
  ]);
  const laughD = ramp(t, d01.to - 0.4, d01.to) * (1 - ramp(t, m02.to + 0.5, m02.to + 1));
  const surprisedAll = ramp(t, 2.7, 2.95) * (1 - ramp(t, 3.4, 3.9));
  const dadTurn = 0.5 * ramp(t, 2.7, 3.0) * (1 - ramp(t, f03.from + 1.6, f03.from + 2.0)) + 0.55 * ramp(t, f03.from + 2.0, f03.from + 2.4) * (1 - ramp(t, f03.to + 0.6, f03.to + 1.0));
  const dad = {
    look: "dad" as const,
    ...dadAt,
    headset: dadWearing ? { paper, lift: 0 } : null,
    face: face(t, 1, dadV, {
      turn: dadTurn,
      lookX: dadTurn * 0.8,
      lookY: 0.2 * ramp(t, 0.9, 1.4) * (1 - ramp(t, 2.6, 2.9)),
      wide: surprisedAll * 0.8,
      raise: 0.3 * surprisedAll + 0.2 * ramp(t, f03.from, f03.from + 0.4),
      smile: 0.35 + 0.35 * ramp(t, 3.3, 3.8) + 0.2 * laughD,
      laugh: laughD,
      lid: 0.3 * ramp(t, 0.9, 1.3) * (1 - ramp(t, 2.6, 2.9)),
    }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 1),
      tilt: idleTilt(t, 1) + 5 * ramp(t, f03.from + 2.0, f03.from + 2.4) * (1 - ramp(t, f03.to, f03.to + 0.5)),
      nod: talkNod(dadV, t, 1) + 4 * laughD * Math.abs(Math.sin(t * 8)),
      l: dadL,
      r: dadR,
    },
  };

  // ---------- Апа ----------
  const restML = W("mom", momAt, 1, 1010, 1290);
  const restMR = W("mom", momAt, 1, 1190, 1290);
  const phoneTable: Pt = { x: 1200, y: 1288 };
  const grab = beats.grab;
  const hold: Pt = { x: 1085, y: 1185 };
  const momR = handKeys(t, [
    [0, W("mom", momAt, 1, 1222, 1250)],
    [1.6, restMR],
    [m02.from - 0.2, restMR],
    [m02.from + 0.1, { x: 14, y: 118 }, "open"],
    [m02.from + 0.3, { x: 34, y: 112 }, "open"],
    [m02.from + 0.5, { x: 14, y: 118 }, "open"],
    [m02.to + 0.3, restMR],
    [grab - 0.3, restMR],
    [grab, W("mom", momAt, 1, phoneTable.x + 30, phoneTable.y - 10), "hold"],
    [grab + 0.6, W("mom", momAt, 1, hold.x + 36, hold.y + 40), "hold"],
  ]);
  const momL = handKeys(t, [
    [0, W("mom", momAt, 1, 1000, 1236)],
    [1.6, restML],
    [m02.from - 0.2, restML],
    [m02.from + 0.1, { x: -14, y: 118 }, "open"],
    [m02.from + 0.3, { x: -34, y: 112 }, "open"],
    [m02.from + 0.5, { x: -14, y: 118 }, "open"],
    [m02.to + 0.3, restML],
    [grab + 0.2, restML],
    [grab + 0.6, W("mom", momAt, 1, hold.x - 36, hold.y + 40), "hold"],
  ]);
  const phoneK = ramp(t, grab, grab + 0.6);
  const phonePos: Pt = { x: phoneTable.x + (hold.x - phoneTable.x) * phoneK, y: phoneTable.y + (hold.y - phoneTable.y) * phoneK };
  const laughM = ramp(t, d01.to - 0.3, d01.to + 0.1) * (1 - ramp(t, m02.to + 0.6, m02.to + 1.1));
  const nodM = f03.from + 3.6 < t && t < f03.to ? 5 * Math.max(0, Math.sin((t - f03.from - 3.6) * 7)) : 0;
  const momTurn = -0.55 * ramp(t, 2.7, 3.0) * (1 - ramp(t, f03.from + 1.8, f03.from + 2.2)) - 0.4 * ramp(t, f03.from + 2.2, f03.from + 2.5) * (1 - ramp(t, grab, grab + 0.4));
  const mom = {
    look: "mom" as const,
    ...momAt,
    headset: { paper },
    face: face(t, 2, momV, {
      turn: momTurn,
      lookX: momTurn * 0.8,
      lookY: 0.55 * ramp(t, grab + 0.3, grab + 0.7),
      wide: surprisedAll * 0.7,
      raise: 0.3 * surprisedAll,
      smile: 0.4 + 0.3 * ramp(t, 3.3, 3.8) + 0.25 * laughM,
      laugh: laughM,
    }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 2),
      tilt: idleTilt(t, 2) - 4 * ramp(t, 3.0, 3.4),
      nod: talkNod(momV, t, 2) + 4 * laughM * Math.abs(Math.sin(t * 9)) + nodM,
      l: momL,
      r: momR,
    },
  };

  // ---------- Дочь ----------
  const tada = ramp(t, 2.75, 3.1) * (1 - ramp(t, d01.from + 0.2, d01.from + 0.6));
  const present = ramp(t, d01.from + 0.3, d01.from + 0.7) * (1 - ramp(t, d01.to + 0.2, d01.to + 0.6));
  const salute = ramp(t, give1 + 0.1, give1 + 0.4) * (1 - ramp(t, give1 + 1.4, give1 + 1.8));
  const gL = handKeys(t, [
    [2.7, { x: -50, y: 110 }],
    [3.1, { x: -98, y: -110 }, "open"],
    [d01.from + 0.3, { x: -98, y: -104 }, "open"],
    [d01.from + 0.7, W("girl", { x: SEATS.girl.x, y: girlY }, 1, BOX.x + 30, BOX.y + 30), "open"],
    [d01.to + 0.3, W("girl", { x: SEATS.girl.x, y: girlY }, 1, BOX.x + 30, BOX.y + 30), "open"],
    [d01.to + 0.6, { x: -60, y: 70 }, "rest"],
    [give1 + 0.1, { x: -60, y: 70 }, "rest"],
    [give1 + 0.4, { x: -76, y: -104 }, "flat"],
    [give1 + 1.4, { x: -76, y: -104 }, "flat"],
    [give1 + 1.8, { x: -60, y: 80 }, "rest"],
  ]);
  const gR = handKeys(t, [
    [2.7, { x: 50, y: 110 }],
    [3.1, { x: 98, y: -110 }, "open"],
    [d01.from + 0.3, { x: 98, y: -104 }, "open"],
    [d01.from + 0.7, W("girl", { x: SEATS.girl.x, y: girlY }, 1, BOX.x + BOX.w - 30, BOX.y + 30), "open"],
    [d01.to + 0.3, W("girl", { x: SEATS.girl.x, y: girlY }, 1, BOX.x + BOX.w - 30, BOX.y + 30), "open"],
    [d01.to + 0.6, { x: 60, y: 70 }, "rest"],
  ]);
  const girlLaugh = ramp(t, give1 - 0.1, give1 + 0.2) * (1 - ramp(t, give1 + 1.0, give1 + 1.3));
  const girlTurn = -0.45 * ramp(t, d01.from, d01.from + 0.3) * (1 - ramp(t, d01.from + 1.2, d01.from + 1.5)) + 0.45 * ramp(t, d01.from + 1.3, d01.from + 1.6) * (1 - ramp(t, d01.to, d01.to + 0.3)) + 0.4 * ramp(t, f03.to + 0.3, f03.to + 0.8);
  const girl = {
    look: "girl" as const,
    x: SEATS.girl.x,
    y: girlY,
    armsBehind: pop < 0.5,
    headset: hsOnGirl ? { paper: 1 } : null,
    face: face(t, 3, girlV, {
      turn: girlTurn,
      lookX: girlTurn * 0.8,
      smile: 0.75 + 0.2 * tada,
      raise: 0.4 * tada,
      laugh: girlLaugh,
      wide: 0.25 * tada,
    }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 3),
      tilt: idleTilt(t, 3, 2.2) + 6 * tada * Math.sin(t * 5) - 5 * salute + 4 * present,
      nod: talkNod(girlV, t, 3),
      l: gL,
      r: gR,
    },
  };

  // ---------- Кот: с пульта на обычный стол ----------
  const hop = prog(t, 2.0, 2.55);
  const cat = {
    flip: true,
    x: 1470 + (1268 - 1470) * hop,
    y: 1222 + (1300 - 1222) * hop - 80 * Math.sin(Math.PI * hop),
    scale: 0.85,
    pose: (t < 2.0 ? "sit" : t < 2.55 ? "jump" : "sit") as "sit" | "jump",
    k: hop,
    look: -0.7,
    tail: Math.sin(t * 2),
    blink: 0,
  };

  const cs = {
    ...CONSOLE_IDLE,
    t: start + t,
    paper,
    fold,
    shrink,
    mission: 1,
    rush: 0.4 - 0.2 * paper,
    calm: 0.3 + 0.4 * paper,
    cardA: 1,
    cardB: 1,
    split: 1,
    ticker: 1,
  };

  const loose = !dadWearing && !hsOnGirl;
  return (
    <AbsoluteFill>
      <KitchenWorld
        w={{
          t: start + t,
          cam,
          console: cs,
          fantasy,
          dad,
          mom,
          girl: boxIn > 0.95 ? girl : null,
          cat,
          box: { appear: boxIn },
          onTable: (
            <>
              <MomPhone x={phonePos.x} y={phonePos.y} a={-90 + 90 * phoneK} s={0.9 + 0.3 * phoneK} lit={phoneK} />
              {loose ? (
                <g transform={`translate(${hsWorld.x.toFixed(1)} ${hsWorld.y.toFixed(1)}) scale(${hsScale.toFixed(3)})`}>
                  <Headset rx={dl.headRx} ry={dl.headRy} paper={paper} t={start + t} />
                </g>
              ) : null}
            </>
          ),
          over: (
            <>
              <Sparkles k={prog(t, 2.8, 3.7)} x={SEATS.girl.x} y={girlY - 150} scale={1.4} />
              <Heart k={prog(t, m02.from, m02.to + 0.6)} x={momAt.x - 40} y={momAt.y - 230} scale={1.2} />
              <Heart k={prog(t, m02.from + 0.25, m02.to + 0.9)} x={momAt.x + 50} y={momAt.y - 210} scale={0.9} />
              <Sparkles k={prog(t, give1 - 0.1, give1 + 0.8)} x={girlHead.x} y={girlHead.y - 40} scale={1.1} />
            </>
          ),
        }}
      />
      <FantasyBadge t={t + 2} peel={ramp(t, 0.35, 1.2)} />
      <Caption t={t} from={f03.to + 0.2} to={f03.to + 2.2} text={B48_TEXT.captions.reveal} top={300} left={150} rotate={-1.5} />
    </AbsoluteFill>
  );
};
