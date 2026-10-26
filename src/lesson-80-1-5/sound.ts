// Звуковые события (кадры ролика): бумага и вода в те же моменты, что и
// анимация (по действиям шкалы). Без зависимостей от Remotion.
import type { L815Timeline } from "./timing";

export type L815Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
const OWN = (n: string) => `audio/lesson-80-1-5/sfx/${n}.mp3`;

export const l815Sound = (tl: L815Timeline): L815Sfx[] => {
  const a = (id: string) => {
    const x = tl.actions.find((y) => y.id === id)!;
    return { ...x, len: x.to - x.from };
  };
  const c = (id: string) => tl.cues.find((x) => x.id === id)!;
  const out: L815Sfx[] = [];
  // сцена 1: последний сгиб, раскрытие, борт, подъём, вода
  const hands = a("s1-hands");
  out.push({ at: hands.from + 12, src: OWN("paper-crease-0"), volume: 0.5 });
  out.push({ at: hands.from + 56, src: OWN("paper-crease-1"), volume: 0.45 });
  const open = a("s1-open");
  out.push({ at: open.from + 18, src: OWN("paper-open"), volume: 0.55 });
  out.push({ at: open.from + Math.round(open.len * 0.5), src: OWN("paper-crease-2"), volume: 0.4 });
  out.push({ at: open.from + Math.round(open.len * 0.78), src: OWN("paper-crease-0"), volume: 0.35 });
  const water = a("s1-water");
  out.push({ at: water.from + Math.round(water.len * 0.55), src: OWN("water-touch"), volume: 0.5 });
  const float = a("s1-float");
  out.push({ at: water.from + Math.round(water.len * 0.55), src: OWN("water-lap"), volume: 0.45, dur: (float.to - water.from) / 30 + 2, fade: 1.2 });
  // сцена 2: Амир берёт сухой образец
  out.push({ at: a("s2-sample").from + 10, src: OWN("paper-take"), volume: 0.4 });
  // сцена 3: учитель кладёт лист; Амир показывает сгибы
  out.push({ at: a("s3-sheet").from + 20, src: OWN("paper-take"), volume: 0.4 });
  out.push({ at: a("s3-sheet").from + 78, src: OWN("paper-put"), volume: 0.5 });
  out.push({ at: a("s3-creases").from + 16, src: OWN("paper-crease-1"), volume: 0.3 });
  out.push({ at: a("s3-creases").from + 64, src: OWN("paper-crease-2"), volume: 0.28 });
  // сцена 4: Юсуф берёт край листа; мел на доске
  out.push({ at: a("s4-edge").from + 14, src: OWN("paper-take"), volume: 0.3 });
  out.push({ at: c("l20").fromFrame + 30, src: OWN("chalk-0"), volume: 0.35 });
  out.push({ at: c("l22").fromFrame + 10, src: OWN("chalk-1"), volume: 0.35 });
  out.push({ at: c("l22").fromFrame + 70, src: OWN("chalk-0"), volume: 0.3 });
  out.push({ at: a("s4-board").from + 10, src: OWN("chalk-1"), volume: 0.3 });
  // сцена 6: пекарь и плотник на доске; образец поднят и возвращён
  out.push({ at: a("s6-lift").from + 14, src: OWN("paper-take"), volume: 0.35 });
  out.push({ at: c("l34").fromFrame + 12, src: OWN("chalk-0"), volume: 0.3 });
  out.push({ at: c("l35").fromFrame + 40, src: OWN("chalk-1"), volume: 0.3 });
  out.push({ at: a("s6-return").from + 40, src: OWN("paper-put"), volume: 0.45 });
  // сцена 8: новый лист из стопки, показ сгиба, первый сгиб Юсуфа
  out.push({ at: a("s8-take").from + 22, src: OWN("paper-take"), volume: 0.45 });
  out.push({ at: a("s8-show").from + 40, src: OWN("paper-crease-0"), volume: 0.4 });
  out.push({ at: a("s8-show").from + 110, src: OWN("paper-crease-1"), volume: 0.35 });
  out.push({ at: a("s8-fold").from + 50, src: OWN("paper-crease-2"), volume: 0.45 });
  out.push({ at: a("s8-fold").from + 120, src: OWN("paper-crease-0"), volume: 0.35 });
  // вода: редкое очень тихое движение, пока лодочка плавает
  for (let t = float.to; t < tl.durationInFrames - 200; t += 420) out.push({ at: t, src: OWN("water-lap"), volume: 0.18, dur: 6, fade: 1.5 });
  return out.filter((x) => x.at >= 0 && x.at < tl.durationInFrames).sort((p, q) => p.at - q.at);
};
