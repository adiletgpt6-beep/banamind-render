// Синтетическая камера поверх оригинальной съёмки BalaGoLive04Motion.
// Только мягкие движения: наезд на старте, короткий «толчок» на склейках
// (match cut с графикой), отъезд в 2.5D-карточку на «Бирок» и в финале.
// Без тряски и случайных зумов.
import type { Camera } from "../live/LiveFootage";
import { easeInOut, easeOut, mix, ramp } from "../live/sync";
import { CUE, LIVE04 } from "./cues";

// Отъезд кадра в карточку (scale s, верх top, центр по X cx).
const ORIGIN_X = 540;
const ORIGIN_Y = 0.45 * 1920;
const cardAt = (s: number, left: number, top: number) => ({
  x: left - (ORIGIN_X - s * ORIGIN_X),
  y: top - (ORIGIN_Y - s * ORIGIN_Y),
});

export const live04Camera = (t: number): Camera => {
  // базовая «дыхательная» прогрессия: медленный наезд внутри каждого плана
  const cuts = [0, ...LIVE04.cuts, LIVE04.sourceDuration];
  let shot = 0;
  for (let i = 0; i < cuts.length - 1; i++) if (t >= cuts[i]) shot = i;
  const local = (t - cuts[shot]) / (cuts[shot + 1] - cuts[shot]);
  let scale = 1 + 0.035 * Math.min(1, Math.max(0, local));
  let x = 0;
  let y = 0;
  let blur = 0;
  // толчок на склейке: входящий план чуть крупнее и «доезжает» за 0,35 с
  if (shot > 0) {
    const p = ramp(t, cuts[shot], 0.35, easeOut);
    scale *= mix(1.07, 1, p);
    blur = (1 - p) * 4;
  }
  // старт: мягкий наезд из размытия
  if (t < 0.6) {
    const p = ramp(t, 0, 0.6, easeOut);
    scale *= mix(1.14, 1, p);
    blur = Math.max(blur, (1 - p) * 8);
  }

  // «Бирок»: отъезд в карточку сверху (неделя внизу), возврат — на склейке 18,2
  const back = ramp(t, CUE.birok - 0.05, 0.5, easeInOut) * (1 - ramp(t, LIVE04.cuts[3] - 0.25, 0.25, easeInOut));
  // финал: кадр уходит в портрет слева на фирменной карточке
  const end = ramp(t, CUE.lastWordEnd + 0.05, 0.6, easeInOut);

  let radius = 0;
  let rotateY = 0;
  if (back > 0) {
    const s = 0.46;
    const c = cardAt(s, ORIGIN_X - (s * 1080) / 2, 240);
    scale = mix(scale, s, back);
    x = mix(x, c.x, back);
    y = mix(y, c.y, back);
    radius = 46 * back / s;
    rotateY = -6 * back;
  }
  if (end > 0) {
    const s = 0.36;
    const c = cardAt(s, 80, 240);
    scale = mix(scale, s, end);
    x = mix(x, c.x, end);
    y = mix(y, c.y, end);
    radius = (46 * end) / s;
    rotateY = 7 * end;
  }
  return { scale, x, y, blur, radius, rotateY };
};
