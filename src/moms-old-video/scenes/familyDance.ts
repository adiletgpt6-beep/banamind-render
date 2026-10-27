// Семейный танец (сцены 13 и 14): мама и сын рядом делают те же два
// движения, что и мама на старой записи. Одна хореография и одни места
// для общего плана, для изображения в телефоне папы и для карточки в
// финале — запись продолжается без скачка между сценами.
import type { Place } from "../rig/Actor";
import type { DanceSeg } from "../rig/dance";
import { H, placeAt, sceneLen } from "./common";

export const FAMILY_MOM: Place = placeAt(1010, 1600, H.mom);
export const FAMILY_SON: Place = placeAt(1265, 1620, H.son);
// папа снимает справа (встал с дивана в конце сцены 12), смотрит влево
export const FAMILY_DAD: Place = placeAt(1620, 1580, H.dad);

// время записи: от начала сцены 13 (в сцене 14 — продолжается)
export const familyT13 = (f: number) => f;
export const familyT14 = (f: number) => sceneLen("newVideo") + f;

// A — шаг (78 кадров), B — руки (56); повторяются весь эпизод
const build = (): DanceSeg[] => {
  const out: DanceSeg[] = [];
  let t = 6;
  while (t < 1000) {
    out.push({ move: "A", from: t, dur: 78 });
    t += 82;
    out.push({ move: "B", from: t, dur: 56 });
    t += 62;
  }
  return out;
};
export const FAMILY_SEGS: readonly DanceSeg[] = build();
export const FAMILY_SON_SEGS: readonly DanceSeg[] = FAMILY_SEGS.map((s) => ({ ...s, size: 0.9 }));

// камера записи (мир гостиной): общий план обоих
export const REC_WIDE = { x: 1135, y: 1240, zoom: 0.62 } as const;
