// Сцена 6 — финал. Дочь сама (рукой, без «волшебства») переворачивает
// картонный круг «МЕКТЕП» на своей коробке, как игральную карту; обратная
// сторона растёт в фирменную карточку: BalaGo, «Бишкек • Балдар үчүн такси»,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз»,
// «WhatsApp: 0998 08 38 28» — все одновременно и неподвижно до конца
// ролика (≥ 5 с, ≥ 3 с после последнего слова). Семья машет над карточкой,
// кот лежит на холодильнике. Субтитров на финале нет.
import { AbsoluteFill } from "remotion";
import { useScene } from "../context";
import { CtaCard } from "../inserts/CtaCard";
import { Sparkles } from "../props/Fx";
import { BOX, CONSOLE_IDLE } from "../sets/Console";
import { B48_CTA_IN } from "../script";
import type { Cam } from "../shots";
import { breath, face, idleTilt, prog } from "./common";
import { handKeys, ramp, W } from "./acting";
import { KitchenWorld, SEATS } from "./World";

const SILENT = { open: 0, round: 0, wide: 0, talking: false };
export const CTA_CAM: Cam = { cx: 800, cy: 1440, z: 0.78 };
// карточка начинает переворот здесь; полностью готова к B48_CTA_IN
export const CTA_FLIP = B48_CTA_IN - 0.85;

export const CtaScene: React.FC = () => {
  const { t, cue, start } = useScene();
  const n05 = cue("n05");
  const n07 = cue("n07");
  // камера неподвижна: контакты не «плывут»
  const cam = CTA_CAM;
  const sx = (wx: number) => (wx - cam.cx) * cam.z + 540;
  const sy = (wy: number) => (wy - cam.cy) * cam.z + 960;
  const flip0 = CTA_FLIP;
  const dadAt = SEATS.dad;
  const momAt = SEATS.mom;
  const girlAt = { x: SEATS.girl.x, y: SEATS.girl.y };
  const wave = (k: number, seed: number) => 14 * Math.sin(t * 7 + seed) * k;
  const waveD = ramp(t, n05.from - 0.2, n05.from + 0.3) * (1 - ramp(t, n05.to + 0.6, n05.to + 1.2));
  const cheer = ramp(t, n07.from - 0.1, n07.from + 0.3);
  const reach = ramp(t, 0, flip0 + 0.05) * (1 - ramp(t, flip0 + 0.4, flip0 + 0.8));

  const dad = {
    look: "dad" as const,
    ...dadAt,
    face: face(t, 1, SILENT, { turn: 0.15, smile: 0.6 + 0.3 * cheer, laugh: 0.9 * cheer * (t < n07.to + 1 ? 1 : 0) }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 1),
      tilt: idleTilt(t, 1),
      l: handKeys(t, [
        [0, W("dad", dadAt, 1, 430, 1290)],
        [n07.from - 0.1, W("dad", dadAt, 1, 430, 1290)],
        [n07.from + 0.3, { x: -120, y: -150 }, "open"],
      ]),
      r: handKeys(t, [
        [0, W("dad", dadAt, 1, 610, 1290)],
        [n05.from - 0.2, W("dad", dadAt, 1, 610, 1290)],
        [n05.from + 0.3, { x: 110 + wave(waveD, 0), y: -120 }, "open"],
        [n05.to + 1.0, { x: 110, y: -120 }, "open"],
        [n05.to + 1.5, W("dad", dadAt, 1, 610, 1290)],
        [n07.from - 0.1, W("dad", dadAt, 1, 610, 1290)],
        [n07.from + 0.3, { x: 120, y: -150 }, "open"],
      ]),
    },
  };
  const mom = {
    look: "mom" as const,
    ...momAt,
    headset: { paper: 1 },
    face: face(t, 2, SILENT, { turn: -0.12, smile: 0.65 + 0.3 * cheer, laugh: 0.9 * cheer * (t < n07.to + 1 ? 1 : 0) }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 2),
      tilt: idleTilt(t, 2),
      l: handKeys(t, [
        [0, W("mom", momAt, 1, 1010, 1290)],
        [n05.from - 0.1, W("mom", momAt, 1, 1010, 1290)],
        [n05.from + 0.4, { x: -110 + wave(waveD, 1.3), y: -110 }, "open"],
        [n05.to + 1.0, { x: -110, y: -110 }, "open"],
        [n05.to + 1.5, W("mom", momAt, 1, 1010, 1290)],
        [n07.from - 0.1, W("mom", momAt, 1, 1010, 1290)],
        [n07.from + 0.3, { x: -120, y: -150 }, "open"],
      ]),
      r: handKeys(t, [
        [0, W("mom", momAt, 1, 1190, 1290)],
        [n07.from - 0.1, W("mom", momAt, 1, 1190, 1290)],
        [n07.from + 0.3, { x: 120, y: -150 }, "open"],
      ]),
    },
  };
  // дочь: рука к верхнему краю коробки над кругом «МЕКТЕП» → переворот
  const flipHand = W("girl", girlAt, 1, BOX.mektep.x + 8, BOX.y + 6);
  const girl = {
    look: "girl" as const,
    ...girlAt,
    headset: { paper: 1 },
    face: face(t, 3, SILENT, { turn: -0.2 * reach, lookX: -0.4 * reach, lookY: 0.5 * reach, smile: 0.8, laugh: 0.9 * cheer * (t < n07.to + 1 ? 1 : 0), wide: 0.3 * ramp(t, flip0 + 0.2, flip0 + 0.5) * (1 - ramp(t, flip0 + 1.0, flip0 + 1.4)) }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 3),
      tilt: idleTilt(t, 3, 2.4) + 4 * Math.sin(t * 6) * cheer,
      nod: 6 * cheer * Math.abs(Math.sin(t * 7)),
      l: handKeys(t, [
        [0, { x: -60, y: 80 }],
        [flip0 - 0.1, flipHand, "flat"],
        [flip0 + 0.3, { x: flipHand.x - 20, y: flipHand.y - 40 }, "open"],
        [flip0 + 0.8, { x: -60, y: 80 }],
        [n07.from - 0.1, { x: -60, y: 80 }],
        [n07.from + 0.25, { x: -96, y: -112 }, "open"],
      ]),
      r: handKeys(t, [
        [0, { x: 60, y: 80 }],
        [n05.from, { x: 60, y: 80 }],
        [n05.from + 0.4, { x: 96 + wave(waveD, 2.1) * 0.7, y: -100 }, "open"],
        [n05.to + 1.0, { x: 96, y: -100 }, "open"],
        [n05.to + 1.5, { x: 60, y: 80 }],
        [n07.from - 0.1, { x: 60, y: 80 }],
        [n07.from + 0.25, { x: 96, y: -112 }, "open"],
      ]),
    },
  };

  return (
    <AbsoluteFill>
      <KitchenWorld
        w={{
          t: start + t,
          cam,
          console: { ...CONSOLE_IDLE, t: start + t, paper: 1, fold: 1, shrink: 1 },
          fantasy: 0,
          dad,
          mom,
          girl,
          cat: { x: 230, y: 702, scale: 0.8, pose: "loaf", tail: Math.sin(t * 1.2), blink: 0.4 + 0.3 * Math.sin(t * 0.7), look: 0.6 },
          box: { appear: 1, hideMektep: t >= flip0 },
          over: <Sparkles k={prog(t, n07.from, n07.from + 0.9)} x={800} y={760} scale={1.6} />,
        }}
      />
      {t >= flip0 ? <CtaCard t={t - flip0} fromX={sx(BOX.mektep.x)} fromY={sy(BOX.mektep.y)} /> : null}
    </AbsoluteFill>
  );
};
