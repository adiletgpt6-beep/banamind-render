// Ключевые моменты анимации (кадры от начала своей сцены), привязанные к
// фактической озвучке: на них опираются и сцены, и звуки (sound.ts).
import { lineFrames, wordFrame } from "./scenes/common";
import type { Bg8Cue } from "./timing";

// Вибрация телефона: импульс ≈ 1 с, пауза ≈ 0,5 с (кадры начала импульсов).
export const buzzes = (from: number, to: number, period = 45) => {
  const out: number[] = [];
  for (let t = from; t < to - 10; t += period) out.push(t);
  return out;
};
// Телефон вибрирует (0/1) в кадре t: первые 30 кадров каждого импульса.
export const buzzing = (t: number, list: readonly number[]) => list.some((b) => t >= b && t < b + 30);

export const bg8Beats = (cues: readonly Bg8Cue[]) => {
  // 1. хук: салон → телефон крупно → машина трогается
  const hook = { insert: 62, back: 122, go: 132, buzz: buzzes(4, 180) };

  // 2. офис (20 мин назад): печатает → сохраняет → встаёт и уходит;
  //    дорожки появляются, на «жумуштагы» — пересечение звонка с дорогой
  const n02 = lineFrames(cues, "n02", "office");
  const clash = Math.max(60, wordFrame(cues, "n02", "office", "жумуш"));
  const office = { rewindTo: 16, lanesIn: 24, save: 100, stand: 128, walk: 152, clash, n02 };

  // 3. в пути: улица → салон (звонит, руки на руле) → пропущенный
  const drive = { cabin: 62, missed: 146, buzz: buzzes(20, 146), lanesIn: 0 };

  // 4. у школы: машина останавливается, сын садится; кайра чалуу →
  //    «Жооп жок»; календарь недели; мысль мамы (m01)
  const m01 = lineFrames(cues, "m01", "school");
  const callAt = 112; // экран звонка крупно
  const school = {
    stop: 34,
    cabin: 66,
    take: 80,
    ear: 98,
    callAt,
    ring: [callAt + 4, callAt + 4 + 66] as const,
    noAnswer: callAt + 56,
    back: callAt + 68,
    cal: m01.from - 26,
    days: [0, 1, 2, 3, 4].map((i) => m01.from - 20 + i * 7),
    clashAt: m01.from + 16,
    repeatAt: m01.from + 30,
    calOut: Math.max(m01.from + 66, Math.round((m01.from + m01.to) / 2)),
    type: m01.to + 12,
    m01,
  };

  // 5. поиск → BalaGo → маршрут (n03)
  const n03 = lineFrames(cues, "n03", "decide");
  const typeFrom = 8;
  const typeTo = Math.max(typeFrom + 40, Math.min(56, n03.from - 40));
  const found = typeTo + 6;
  const click = Math.max(found + 22, n03.from - 8);
  const expand = click + 12;
  const wAfter = wordFrame(cues, "n03", "decide", "сабактан");
  const decide = { typeFrom, typeTo, found, click, expand, drawFrom: expand + 22, drawTo: Math.max(expand + 70, wAfter - 10), back: wAfter, n03 };

  // 6. дорожки расходятся; шаги по словам n04; пример чата
  const n04 = lineFrames(cues, "n04", "how");
  const steps = [
    Math.max(36, wordFrame(cues, "n04", "how", "алгач")),
    wordFrame(cues, "n04", "how", "топ"),
    wordFrame(cues, "n04", "how", "биринчи"),
    wordFrame(cues, "n04", "how", "акысыз") + 14,
  ];
  const chatIn = wordFrame(cues, "n04", "how", "сапар", 1) - 6;
  const how = { split: 4, steps, chatIn, msg: chatIn + 30, loc: chatIn + 58, n04 };

  return { hook, office, drive, school, decide, how };
};

export type Bg8Beats = ReturnType<typeof bg8Beats>;
