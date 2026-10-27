// V2 scenes 4 + 5 (9–22 s): the original car/transaction graphics unchanged,
// with the presenter as a small side figure who never covers the diagram:
// left of the car for the price, then in the top-right corner for the deal.
import { CarStory } from "../scenes/CarStory";
import { HorsePresenter, type HorseShot } from "../horse/HorsePresenter";
import type { LipsyncData } from "../horse/lipsync";
import { EXPRESSION, GESTURE } from "../horse/pose";
import { type If01Manifest, wordStart } from "../manifest";
import { sec } from "../motion";

const BASE = 270;

export const carShots = (m: If01Manifest): HorseShot[] => {
  const w = (word: string, fb: number) => sec(wordStart(m, "l5", word, fb));
  const twenty = sec(wordStart(m, "l4", "twenty", 10.4));
  const buys = w("buys", 14.94);
  const resells = w("resells", 16.2);
  const agreed = w("agreed", 17.57);
  const twentyTwo = w("twenty-two", 17.96);
  const paid = w("paid", 19.57);
  const installments = w("installments", 20.0);
  return [
    {
      from: BASE,
      to: BASE + 122,
      place: { x: 150, y: 540, scale: 0.42 },
      enter: "left",
      exit: "left",
      exitFrames: 10,
      beats: [
        { at: BASE, dur: 0, pose: { ...EXPRESSION.explaining, headTurn: 0.5, lookX: 0.8, lookY: 0.3 } },
        { at: BASE + 14, dur: 12, pose: { ...GESTURE.pointRight, headTurn: 0.6, lookX: 0.9, lookY: 0.4 } }, // points at the car
        { at: twenty - 6, dur: 10, pose: { lookX: 0.6, lookY: -0.5, headTurn: 0.4, ...GESTURE.pointUpRight } }, // looks up at the price
        { at: twenty + 10, dur: 8, pose: { ...EXPRESSION.surprised, browTiltL: 0, browTiltR: 0 } }, // reacts to the number
        { at: twenty + 30, dur: 12, pose: { ...EXPRESSION.happy, lookX: 0.1, lookY: 0, headTurn: 0.1, ...GESTURE.rest } },
      ],
    },
    {
      from: BASE + 128,
      to: 660,
      place: { x: 905, y: 150, scale: 0.34 },
      enter: "right",
      exit: "none",
      beats: [
        { at: BASE + 128, dur: 0, pose: { ...EXPRESSION.explaining, headTurn: -0.45, lookX: -0.6, lookY: 0.5 } },
        { at: buys - 8, dur: 12, pose: { ...GESTURE.pointLeft, armLShoulder: 60, armLHoof: -30, headTurn: -0.55, lookX: -0.8, lookY: 0.6 } }, // financier buys → points down-left
        { at: buys + 30, dur: 14, pose: { lookX: -0.4, lookY: 0.7, headTurn: -0.35 } }, // follows the car
        { at: resells - 4, dur: 12, pose: { ...GESTURE.presentLeft, armLShoulder: 48, armLHoof: -50, lookX: -0.2, lookY: 0.8, headTurn: -0.2 } },
        { at: agreed - 4, dur: 10, pose: { ...EXPRESSION.confident, lookX: 0, lookY: 0.75, headNod: 4 } },
        { at: twentyTwo, dur: 8, pose: { ...GESTURE.emphasisRight, browL: 0.5, browR: 0.5 } }, // the agreed price
        { at: twentyTwo + 24, dur: 12, pose: { ...GESTURE.rest, lookX: -0.3, lookY: 0.7 } },
        { at: paid - 4, dur: 12, pose: { ...GESTURE.presentLeft, headTurn: -0.4, lookX: -0.5, lookY: 0.7 } },
        { at: installments + 20, dur: 10, pose: { headNod: 5, ...EXPRESSION.happy } }, // explanatory nod
        { at: installments + 40, dur: 14, pose: { ...EXPRESSION.confident, ...GESTURE.rest, lookX: 0, lookY: 0.2, headTurn: 0 } },
      ],
    },
  ];
};

export const CarStoryV2: React.FC<{ readonly frame: number; readonly manifest: If01Manifest; readonly lipsync: LipsyncData }> = ({ frame: f, manifest, lipsync }) => {
  const abs = BASE + f;
  return (
    <>
      <CarStory frame={f} manifest={manifest} />
      {carShots(manifest).map((shot, i) => (
        <HorsePresenter key={i} frame={abs} shot={shot} lipsync={lipsync} manifest={manifest} />
      ))}
    </>
  );
};
