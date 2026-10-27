import { mouthAt, type Word } from "./poses";
import { blinkAt, setMorphs, turn, X, type Rig } from "./rig";

// Лицо: губы по словам + настроение + моргание (одним вызовом в кадре).
export type Mood = {
  smile?: number;
  worry?: number; // брови домиком
  frown?: number;
  wide?: number; // глаза шире (удивление)
  squint?: number;
};

export const face = (rig: Rig, t: number, words: readonly Word[], mood: Mood = {}, seed = 0) => {
  const m = mouthAt(words, t);
  const frame = Math.round(t * 30);
  const b = blinkAt(frame, seed);
  turn(rig, "jaw", X, m.jaw);
  const worry = mood.worry ?? 0;
  setMorphs(rig, {
    blink_L: Math.max(b, (mood.squint ?? 0) * 0.3),
    blink_R: Math.max(b, (mood.squint ?? 0) * 0.3),
    squint_L: mood.squint ?? 0,
    squint_R: mood.squint ?? 0,
    // чуть шире открытые глаза (у моделей MakeHuman веки тяжеловаты)
    eyeWide_L: (mood.wide ?? 0) + 0.18,
    eyeWide_R: (mood.wide ?? 0) + 0.18,
    browInnerUp_L: worry * 0.6,
    browInnerUp_R: worry * 0.6,
    browDown_L: (mood.frown ?? 0) * 0.4,
    browDown_R: (mood.frown ?? 0) * 0.4,
    smile: Math.max(0, (mood.smile ?? 0) - m.pucker * 0.5),
    frown: (mood.frown ?? 0) * 0.5 + worry * 0.15,
    jawOpen: m.jawOpen,
    wide: m.wide,
    pucker: m.pucker,
    press: m.press,
  });
};
