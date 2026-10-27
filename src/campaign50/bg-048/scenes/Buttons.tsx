// Сцена 2 — «Бир күн — көп иш». Апа жмёт три кнопки: «МЕКТЕП» (выскакивает
// учебник, карточка «13:00 Сабак бүтөт»), телефон (вибрирует), «ЖУМУШ»
// (раскрывается ноутбук «Жолугушуу 13:00», вторая карточка 13:00 наезжает
// на первую). Приборы сходят с ума: «ШАШУУ» в красном, «ТЫНЧТЫК» падает,
// мягкая янтарная тревога, принтер печатает «13:00 = 13:00 ?!», на экране
// бумажная мама растягивается между школой и работой. Апа (мягко, без
// ссоры): «…кайра дал келип калды!» Ата чешет затылок. Из-за пульта
// выглядывают глаза дочери (подсказка). Кот прыгает на «ЖЫЙЫН» —
// пружина-хлопушка, кот пугается, родители смеются.
import { AbsoluteFill, interpolate } from "remotion";
import { useScene, useViseme } from "../context";
import { BUTTONS, CONSOLE_IDLE } from "../sets/Console";
import { lerpCam, type Cam } from "../shots";
import { Confetti, Exclaim, Pop, Sweat } from "../props/Fx";
import { B48_TEXT } from "../script";
import { breath, clamp, face, idleTilt, prog, talkNod } from "./common";
import { handKeys, pressAt, ramp, W } from "./acting";
import { Caption, FantasyBadge } from "./Overlays";
import { FANT } from "./Hook";
import { KitchenWorld, SEATS } from "./World";

const camAt = (t: number, keys: readonly (readonly [number, Cam])[]): Cam => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i];
    const [tb, b] = keys[i + 1];
    if (t <= tb) return lerpCam(a, b, ramp(t, ta, tb));
  }
  return keys[keys.length - 1][1];
};

type Span = { readonly from: number; readonly to: number };

// Ключевые моменты сцены (секунды от начала сцены) — общие для анимации и звука.
export const buttonsBeats = (m01: Span) => {
  const c0 = m01.to + 0.35;
  const catJump = c0 + 0.9;
  const catLand = catJump + 0.42;
  return { pMektep: 0.6, pPhone: 1.4, pJumush: 2.25, clash: 2.9, c0, catJump, catLand, catBack: catLand + 0.45 };
};

export const ButtonsScene: React.FC = () => {
  const { t, cue, start, dur } = useScene();
  const dadV = useViseme("father");
  const momV = useViseme("mother");
  const m01 = cue("m01");
  const dadAt = SEATS.dad;
  const momAt = SEATS.mom;

  // моменты нажатий и кота (после реплики мамы)
  const { pMektep, pPhone, pJumush, clash, c0, catJump, catLand, catBack } = buttonsBeats(m01);

  // ---------- Апа ----------
  const restML = W("mom", momAt, 1, 1000, 1236);
  const restMR = W("mom", momAt, 1, 1222, 1250);
  const hover = (x: number, y: number) => W("mom", momAt, 1, x, y - 46);
  const on = (x: number, y: number) => W("mom", momAt, 1, x, y - 6);
  const momL = handKeys(t, [
    [0.05, restML],
    [pMektep - 0.25, hover(BUTTONS.mektep.x, BUTTONS.mektep.y), "flat"],
    [pMektep, on(BUTTONS.mektep.x, BUTTONS.mektep.y), "flat"],
    [pMektep + 0.35, hover(BUTTONS.mektep.x + 20, BUTTONS.mektep.y), "flat"],
    [clash + 0.1, restML],
    [m01.from + 0.2, { x: -86, y: 118 }, "open"],
    [m01.to + 0.2, { x: -92, y: 112 }, "open"],
    [catLand + 0.3, { x: -70, y: 70 }, "open"],
  ]);
  const momR = handKeys(t, [
    [0.05, restMR],
    [pPhone - 0.25, hover(BUTTONS.phone.x, BUTTONS.phone.y), "point"],
    [pPhone, on(BUTTONS.phone.x, BUTTONS.phone.y), "point"],
    [pPhone + 0.25, hover(BUTTONS.phone.x + 40, BUTTONS.phone.y), "flat"],
    [pJumush - 0.2, hover(BUTTONS.jumush.x, BUTTONS.jumush.y), "flat"],
    [pJumush, on(BUTTONS.jumush.x, BUTTONS.jumush.y), "flat"],
    [pJumush + 0.4, hover(BUTTONS.jumush.x + 30, BUTTONS.jumush.y), "flat"],
    [clash + 0.15, W("mom", momAt, 1, 1230, 1200), "open"],
    [m01.from + 0.2, { x: 88, y: 116 }, "open"],
    [m01.to + 0.2, { x: 94, y: 110 }, "open"],
    [catLand + 0.3, { x: 74, y: 66 }, "open"],
  ]);
  const surprised = ramp(t, clash - 0.05, clash + 0.1) * (1 - ramp(t, clash + 0.8, clash + 1.3));
  const laugh = ramp(t, catLand + 0.25, catLand + 0.45);
  const momTurn = 0.25 * ramp(t, 0, 0.3) * (1 - ramp(t, clash, clash + 0.3)) - 0.45 * ramp(t, m01.from, m01.from + 0.4) * (1 - ramp(t, m01.from + 1.6, m01.from + 2.1)) + 0.5 * ramp(t, c0, c0 + 0.4);
  const mom = {
    look: "mom" as const,
    ...momAt,
    headset: { paper: 0 },
    face: face(t, 2, momV, {
      turn: momTurn,
      lookX: momTurn * 0.7,
      lookY: 0.35 * ramp(t, 0.1, 0.4) * (1 - ramp(t, clash - 0.2, clash)),
      wide: surprised,
      worry: 0.55 * ramp(t, clash + 0.4, m01.from + 0.3) * (1 - ramp(t, m01.to, m01.to + 0.4)),
      raise: 0.35 * surprised + 0.2 * ramp(t, m01.from, m01.from + 0.3),
      smile: 0.3 + 0.2 * (1 - surprised) + 0.4 * laugh,
      laugh,
    }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 2),
      tilt: idleTilt(t, 2) + 4 * ramp(t, m01.from, m01.from + 0.5) * (1 - ramp(t, m01.to, m01.to + 0.5)),
      nod: talkNod(momV, t, 2) + 4 * laugh * Math.abs(Math.sin(t * 9)),
      shrug: 0.6 * ramp(t, m01.from + 0.2, m01.from + 0.6) * (1 - ramp(t, m01.to - 0.3, m01.to + 0.2)),
      lean: -3 * ramp(t, pMektep - 0.3, pMektep) * (1 - ramp(t, pMektep + 0.3, pMektep + 0.6)),
      l: momL,
      r: momR,
    },
  };

  // ---------- Ата ----------
  const restDL = W("dad", dadAt, 1, 430, 1236);
  const restDR = W("dad", dadAt, 1, 600, 1230);
  const scratch = ramp(t, m01.from + 0.6, m01.from + 1.0) * (1 - ramp(t, m01.to - 0.2, m01.to + 0.2));
  const dadL = handKeys(t, [
    [0, restDL],
    [clash, restDL],
    [clash + 0.15, W("dad", dadAt, 1, 380, 1150), "open"],
    [m01.from + 0.5, W("dad", dadAt, 1, 400, 1190), "open"],
    [m01.from + 1.0, { x: -72, y: -168 + 6 * Math.sin(t * 14) * scratch }, "open"],
    [m01.to - 0.2, { x: -70, y: -166 + 6 * Math.sin(t * 14) * scratch }, "open"],
    [m01.to + 0.3, restDL],
  ]);
  const dadR = handKeys(t, [
    [0, restDR],
    [clash, restDR],
    [clash + 0.15, W("dad", dadAt, 1, 660, 1150), "open"],
    [m01.from + 0.5, restDR],
    [catLand + 0.2, restDR],
    [catLand + 0.5, { x: 70, y: 100 }, "open"],
  ]);
  const dadTurn = 0.55 * ramp(t, 0.2, 0.6) * (1 - ramp(t, clash, clash + 0.3)) + 0.15 * ramp(t, m01.from + 0.3, m01.from + 0.8) + 0.4 * ramp(t, c0, c0 + 0.4);
  const dad = {
    look: "dad" as const,
    ...dadAt,
    headset: { paper: 0 },
    face: face(t, 1, dadV, {
      turn: dadTurn,
      lookX: dadTurn * 0.8,
      lookY: -0.5 * ramp(t, clash, clash + 0.3) * (1 - ramp(t, m01.from + 0.6, m01.from + 1.0)),
      wide: surprised * 0.9,
      worry: 0.7 * ramp(t, clash + 0.3, clash + 0.6) * (1 - ramp(t, m01.to, m01.to + 0.4)),
      smile: 0.25 + 0.5 * laugh,
      laugh,
    }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 1),
      tilt: idleTilt(t, 1) - 6 * scratch,
      nod: talkNod(dadV, t, 1) + 4 * laugh * Math.abs(Math.sin(t * 8 + 1)),
      shrug: 0.5 * surprised,
      l: dadL,
      r: dadR,
    },
  };

  // ---------- Дочь выглядывает из-за пульта (подсказка) ----------
  const peek = ramp(t, m01.from + 1.2, m01.from + 1.6) * (1 - ramp(t, m01.from + 2.9, m01.from + 3.3));
  const girl = {
    look: "girl" as const,
    x: SEATS.girl.x,
    y: SEATS.girl.hiddenFantasy - 146 * peek,
    armsBehind: true,
    face: face(t, 3, { open: 0, round: 0, wide: 0, talking: false }, { lookX: 0.5, lookY: -0.2, smile: 0.5, wide: 0.3 }),
    pose: { legs: "none" as const, l: { x: -50, y: 110 }, r: { x: 50, y: 110 } },
  };

  // ---------- Кот ----------
  const crouch = ramp(t, c0 + 0.3, c0 + 0.6);
  const jk = prog(t, catJump, catLand);
  const back = prog(t, catBack, catBack + 0.45);
  const start0 = { x: 1470, y: 1222 };
  const onBtn = { x: BUTTONS.jyiyn.x + 6, y: BUTTONS.jyiyn.y - 6 };
  // пружина подбрасывает кота: он едет на «шляпе» хлопушки, потом отпрыгивает
  const springK = prog(t, catLand, catLand + 1.7);
  const up = interpolate(springK, [0, 0.18, 0.3, 1], [0, 1.15, 0.95, 1], clamp);
  const rideY = onBtn.y + (BUTTONS.jyiyn.y - 30 - 190 * up - 80 - onBtn.y) * Math.min(1, up);
  const topY = onBtn.y + (BUTTONS.jyiyn.y - 30 - 190 * 0.95 - 80 - onBtn.y);
  const catX = t < catLand ? start0.x + (onBtn.x - start0.x) * jk : onBtn.x + (start0.x + 30 - onBtn.x) * back;
  const catY =
    t < catLand
      ? start0.y + (onBtn.y - start0.y) * jk - 70 * Math.sin(Math.PI * jk)
      : t < catBack
        ? rideY
        : topY + (start0.y - topY) * back - 60 * Math.sin(Math.PI * back);
  const startled = t >= catLand + 0.05;
  const cat = {
    flip: true,
    x: catX,
    y: catY,
    scale: 0.85,
    pose: (t < c0 + 0.3 ? "sit" : t < catJump ? "crouch" : t < catLand ? "jump" : startled ? "startled" : "sit") as "sit" | "crouch" | "jump" | "startled",
    k: t < catJump ? Math.abs(Math.sin(t * 14)) * crouch : t < catLand ? jk : back,
    look: t < c0 + 0.3 ? -0.6 : -0.2,
    tail: Math.sin(t * 2.2),
    puff: startled ? 1 - ramp(t, catBack + 0.6, catBack + 1.4) : 0,
    blink: 0,
  };

  // ---------- Пульт ----------
  const spring = springK;
  const cs = {
    ...CONSOLE_IDLE,
    t: start + t,
    go: 1 - ramp(t, clash, clash + 0.3),
    mission: 1,
    press: {
      mektep: pressAt(t, pMektep),
      phone: pressAt(t, pPhone),
      jumush: pressAt(t, pJumush),
      jyiyn: t > catLand ? Math.max(0, 1 - ramp(t, catLand + 0.3, catLand + 0.5)) : 0,
    },
    book: ramp(t, pMektep + 0.02, pMektep + 0.8),
    phone: Math.min(0.94, ramp(t, pPhone + 0.02, pPhone + 0.2, 0, 0.2) + ramp(t, pPhone + 0.2, clash + 1.2, 0, 0.74)) + 0.06 * ramp(t, clash + 1.2, clash + 1.3),
    laptop: ramp(t, pJumush + 0.02, pJumush + 0.75),
    cardA: ramp(t, pMektep + 0.2, pMektep + 0.7),
    cardB: ramp(t, pJumush + 0.25, clash),
    bump: prog(t, clash, clash + 0.9),
    rush: 0.25 + 0.72 * ramp(t, clash, clash + 0.5) - 0.3 * ramp(t, m01.to + 0.5, dur),
    calm: 0.78 - 0.66 * ramp(t, clash, clash + 0.6) + 0.2 * laugh,
    alarm: ramp(t, clash, clash + 0.4) * (1 - ramp(t, m01.to + 0.4, m01.to + 1.4)),
    ticker: ramp(t, clash + 0.15, clash + 1.4),
    split: ramp(t, clash + 0.3, clash + 0.9),
    spring,
  };

  // ---------- Камера ----------
  const MED: Cam = FANT;
  const cam = camAt(t, [
    [0, MED],
    [0.45, { cx: 1000, cy: 958, z: 1.36 }],
    [clash - 0.2, { cx: 1010, cy: 945, z: 1.4 }],
    [clash + 0.7, MED],
    [m01.to + 0.25, { cx: 790, cy: 1064, z: 1.13 }],
    [c0 + 0.6, { cx: 1080, cy: 985, z: 1.28 }],
    [catLand + 0.6, { cx: 1070, cy: 1026, z: 1.18 }],
  ]);

  const dadHead = { x: dadAt.x, y: dadAt.y - 99 };
  return (
    <AbsoluteFill>
      <KitchenWorld
        w={{
          t: start + t,
          cam,
          console: cs,
          fantasy: 1,
          dad,
          mom,
          girl,
          cat,
          over: (
            <>
              <Exclaim k={prog(t, clash, clash + 1.2)} x={momAt.x + 60} y={momAt.y - 260} text="?!" scale={1.1} />
              <Sweat k={prog(t, m01.from + 0.8, m01.from + 2.4)} x={dadHead.x + 78} y={dadHead.y - 30} />
              <Pop k={prog(t, catLand, catLand + 0.6)} x={BUTTONS.jyiyn.x} y={BUTTONS.jyiyn.y - 150} color="#FF8FC7" scale={1.3} />
              <Confetti k={prog(t, catLand + 0.05, catLand + 1.8)} x={BUTTONS.jyiyn.x} y={BUTTONS.jyiyn.y - 200} scale={1.2} />
            </>
          ),
        }}
      />
      <FantasyBadge t={t + 1} />
      <Caption t={t} from={0.35} to={m01.from - 0.15} text={B48_TEXT.captions.buttons} top={486} />
    </AbsoluteFill>
  );
};
