// Сцена 1 — хук: кыялдагы пульт. С первого кадра действие: кресла
// диспетчеров разворачиваются к зрителю, лампы мигают (≤ 2 Гц), катушки
// крутятся. Ата: «Даярсыңбы?» — Апа шутливо отдаёт честь: «Даярмын,
// командир!» — Ата указывает на табло «ОПЕРАЦИЯ» и хлопает по кнопке «ЖОЛ»:
// огни становятся зелёными. Бейдж «Кыялдагы тамаша» — всё время фантазии.
import { AbsoluteFill } from "remotion";
import { useScene, useTimeline, useViseme } from "../context";
import { CONSOLE_IDLE, BUTTONS } from "../sets/Console";
import { lerpCam } from "../shots";
import { Sparkles } from "../props/Fx";
import { breath, face, idleTilt, prog, talkNod, wordAt, backOut } from "./common";
import { handKeys, pressAt, ramp, W } from "./acting";
import { FantasyBadge } from "./Overlays";
import { KitchenWorld, SEATS } from "./World";

// Средний план фантазии: баннер с названием ниже верхней служебной зоны
// Reels, полоса субтитров над головами, приборы на столе-пульте.
export const FANT = { cx: 780, cy: 1062, z: 1.12 } as const;

// Ключевой момент: папа хлопает по «ЖОЛ» сразу после своей реплики.
export const hookSlam = (f02: { readonly to: number }) => f02.to + 0.12;

export const HookScene: React.FC = () => {
  const { t, cue, start } = useScene();
  const tl = useTimeline();
  const dadV = useViseme("father");
  const momV = useViseme("mother");
  const f01 = cue("f01");
  const m00 = cue("m00");
  const f02 = cue("f02");
  const f02cue = tl.cues.find((c) => c.id === "f02");
  const opWord = wordAt(f02cue, "операция", start + f02.from + 0.6) - start;
  const slam = hookSlam(f02);

  // разворот кресел к зрителю (0…0,6 с)
  const sw = prog(t, 0.0, 0.6, backOut);
  const dadAt = SEATS.dad;
  const momAt = SEATS.mom;

  // ---------- Ата ----------
  const dadTurn = -0.95 * (1 - sw) + 0.5 * (ramp(t, f01.from - 0.3, f01.from) - ramp(t, m00.to, m00.to + 0.35)) + 0.12 * ramp(t, f02.from + 0.4, f02.from + 0.8);
  const dadFace = face(t, 1, dadV, {
    turn: dadTurn,
    lookX: dadTurn * 0.6,
    lookY: -0.25 * ramp(t, f02.from + 0.3, f02.from + 0.7),
    raise: 0.5 * ramp(t, f01.from - 0.2, f01.from) + 0.2 * ramp(t, f02.from, f02.from + 0.3),
    smile: 0.35 + 0.3 * ramp(t, m00.from, m00.to) + 0.25 * ramp(t, slam, slam + 0.3),
    wide: 0.35 * ramp(t, opWord - 0.1, opWord + 0.2) * (1 - ramp(t, slam, slam + 0.4)),
  });
  const restDL = W("dad", dadAt, 1, 430, 1236);
  const restDR = W("dad", dadAt, 1, 600, 1230);
  const dadR = handKeys(t, [
    [f01.from - 0.3, restDR],
    [f01.from + 0.05, W("dad", dadAt, 1, 690, 1120), "open"],
    [m00.to, W("dad", dadAt, 1, 690, 1120), "open"],
    [f02.from + 0.1, W("dad", dadAt, 1, 640, 1180), "rest"],
    [f02.from + 0.45, W("dad", dadAt, 1, 820, 860), "point"],
    [slam - 0.25, W("dad", dadAt, 1, 820, 860), "point"],
    [slam - 0.08, W("dad", dadAt, 1, BUTTONS.jol.x, BUTTONS.jol.y - 50), "flat"],
    [slam, W("dad", dadAt, 1, BUTTONS.jol.x, BUTTONS.jol.y - 6), "flat"],
    [slam + 0.5, W("dad", dadAt, 1, BUTTONS.jol.x - 10, BUTTONS.jol.y - 10), "flat"],
  ]);
  const dadL = handKeys(t, [
    [0, restDL],
    [f02.from + 0.3, restDL],
    [f02.from + 0.7, W("dad", dadAt, 1, 380, 1200), "open"],
  ]);
  const dad = {
    look: "dad" as const,
    ...dadAt,
    squash: 0.72 + 0.28 * sw,
    headset: { paper: 0 },
    face: dadFace,
    pose: {
      legs: "none" as const,
      breathe: breath(t, 1),
      tilt: idleTilt(t, 1) + 4 * (ramp(t, f01.from - 0.2, f01.from) - ramp(t, m00.to, m00.to + 0.3)),
      nod: talkNod(dadV, t, 1),
      lean: -2 * ramp(t, f02.from + 0.3, f02.from + 0.6) + 2 * ramp(t, slam - 0.2, slam),
      l: dadL,
      r: dadR,
    },
  };

  // ---------- Апа ----------
  const momTurn = 0.95 * (1 - sw) - 0.45 * (ramp(t, f01.from, f01.from + 0.3) - ramp(t, m00.to + 0.2, m00.to + 0.5)) - 0.2 * ramp(t, f02.from + 0.4, f02.from + 0.8);
  const salute = ramp(t, m00.from - 0.2, m00.from + 0.1) - ramp(t, m00.to + 0.35, m00.to + 0.65);
  const momFace = face(t, 2, momV, {
    turn: momTurn,
    lookX: momTurn * 0.6,
    lookY: -0.4 * ramp(t, f02.from + 0.4, f02.from + 0.8),
    smile: 0.4 + 0.35 * salute + 0.3 * ramp(t, slam, slam + 0.3),
    raise: 0.25 * salute + 0.3 * ramp(t, opWord, opWord + 0.3),
    wide: 0.3 * ramp(t, slam - 0.05, slam + 0.1) * (1 - ramp(t, slam + 0.5, slam + 1)),
  });
  const restML = W("mom", momAt, 1, 1000, 1236);
  const restMR = W("mom", momAt, 1, 1222, 1250);
  const momL = handKeys(t, [
    [m00.from - 0.25, restML],
    [m00.from + 0.05, { x: -50, y: -128 }, "flat"],
    [m00.to + 0.35, { x: -50, y: -128 }, "flat"],
    [m00.to + 0.7, restML],
    [slam - 0.1, restML],
    [slam + 0.15, W("mom", momAt, 1, 960, 1160), "open"],
  ]);
  const momR = handKeys(t, [
    [0, restMR],
    [slam - 0.1, restMR],
    [slam + 0.15, W("mom", momAt, 1, 1230, 1160), "open"],
  ]);
  const mom = {
    look: "mom" as const,
    ...momAt,
    squash: 0.72 + 0.28 * sw,
    headset: { paper: 0 },
    face: momFace,
    pose: {
      legs: "none" as const,
      breathe: breath(t, 2),
      tilt: idleTilt(t, 2) - 5 * salute,
      nod: talkNod(momV, t, 2),
      shrug: 0.3 * ramp(t, slam, slam + 0.2) * (1 - ramp(t, slam + 0.4, slam + 0.8)),
      l: momL,
      r: momR,
    },
  };

  // ---------- Пульт ----------
  const go = ramp(t, slam, slam + 0.25);
  const cs = {
    ...CONSOLE_IDLE,
    t: start + t,
    mission: ramp(t, opWord - 0.1, opWord + 0.4),
    go,
    press: { jol: pressAt(t, slam) },
    rush: 0.2 + 0.06 * Math.sin(t * 1.3),
    calm: 0.78 + 0.05 * Math.sin(t * 0.9),
  };

  // ---------- Камера: от среднего-крупного к среднему на «операции» ----------
  const camK = ramp(t, f02.from + 0.1, f02.from + 1.4);
  const cam = lerpCam({ cx: 790, cy: 1046, z: 1.17 }, FANT, camK);
  const drift = { ...cam, cx: cam.cx + 6 * Math.sin(t * 0.5), cy: cam.cy + 4 * Math.sin(t * 0.4) };

  const girl = {
    look: "girl" as const,
    x: SEATS.girl.x,
    y: SEATS.girl.hiddenFantasy,
    armsBehind: true,
    face: face(t, 3, { open: 0, round: 0, wide: 0, talking: false }, { smile: 0.6 }),
    pose: { legs: "none" as const, l: { x: -50, y: 110 }, r: { x: 50, y: 110 } },
  };

  return (
    <AbsoluteFill>
      <KitchenWorld
        w={{
          t: start + t,
          cam: drift,
          console: cs,
          fantasy: 1,
          dad,
          mom,
          girl,
          cat: { x: 1460, y: 1222, pose: "loaf", scale: 0.85, tail: Math.sin(t * 1.4), blink: 0.6 },
          over: <Sparkles k={prog(t, slam, slam + 0.8)} x={BUTTONS.jol.x} y={BUTTONS.jol.y - 60} scale={1.2} />,
        }}
      />
      <FantasyBadge t={t + 0.5} />
    </AbsoluteFill>
  );
};
