// Расписание тихих предметных звуков 80-1-14 — по тем же меткам, что
// и анимация: звук совпадает с видимым касанием. Музыки нет.
import type { L80Timeline } from "./timeline";
import { drawsOf } from "./state";

export type Sfx = { name: string; at: number; len: number; gain: number };

export const l80Sounds = (tl: L80Timeline): Sfx[] => {
  const M = (n: string) => tl.marks[n];
  const out: Sfx[] = [];
  const s = (name: string, at: number, len: number, gain: number) => out.push({ name, at: Math.round(at), len: Math.max(4, Math.round(len)), gain });
  // стакан Юсуфа ставится на стол
  s("cup-set", M("s1.set") - 2, 16, 0.32);
  // учитель берёт чистый лист и кладёт перед Билалом
  s("paper-lift", M("s2.paper") + 10, 22, 0.35);
  s("paper-place", M("s2.paperDown") - 4, 15, 0.38);
  // карандаш: взять, менять, отложить
  s("pencil-tap", M("s2.pencil") + 2, 8, 0.32);
  for (const d of drawsOf(tl)) {
    if (d.i > 0) {
      s("pencil-tap", d.swapFrom + 10, 8, 0.28);
      s("pencil-tap", d.swapFrom + 16, 8, 0.22);
    }
    s("pencil", d.drawFrom, d.drawTo - d.drawFrom, 0.42);
  }
  s("pencil-tap", M("s3.stop") + 10, 8, 0.3);
  // сцена 6: Амир ставит свой стакан, учитель ставит, наливает, ставит перед Амиром
  s("cup-set", M("s6.amirSet") - 4, 16, 0.28);
  s("cup-set", M("s6.tset") - 1, 16, 0.32);
  s("pour", M("s6.pour") + 12, M("s6.jugBack") - 10 - (M("s6.pour") + 12), 0.4);
  s("cup-set", M("s6.place") - 7, 16, 0.24); // кувшин возвращается на место
  s("cup-set", M("s6.amirReach") - 5, 16, 0.3);
  s("cup-set", M("s6.end") - 7, 16, 0.26);
  // сцена 7: Билал поднимает лист, учитель кладёт перед Юсуфом
  s("paper-lift", M("s7.turn") + 4, 22, 0.32);
  s("paper-place", M("s7.touch") - 6, 15, 0.34);
  // сцена 8: лист придвигается, надпись маркером, кнопки на доске
  s("paper-lift", M("s8.take") + 4, 22, 0.25);
  s("marker", M("s8.write") + 14, M("s8.board") - 10 - (M("s8.write") + 14), 0.36);
  s("paper-place", M("s8.board") + 20, 15, 0.26);
  s("pin", M("s8.board") + 28, 9, 0.32);
  s("pin", M("s8.board") + 52, 9, 0.32);
  return out;
};
