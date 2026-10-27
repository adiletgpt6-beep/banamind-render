// Ключевые моменты анимации (кадры от начала своей сцены), привязанные к
// фактической озвучке: на них опираются и сцены, и звуки (sound.ts).
import type { PageId } from "./screens";
import { easeInOut } from "./rig/motion";
import { lineFrames, wordFrame } from "./scenes/common";
import type { Bg1Cue } from "./timing";

export const bg1Beats = (cues: readonly Bg1Cue[]) => {
  // 1. хук: восемь окон, затем девятое — на слове «Тогузунчусу»
  const ninthAt = Math.max(70, wordFrame(cues, "n01", "hook", "тогуз"));
  const lastOpen = ninthAt - 14;
  const opens = Array.from({ length: 8 }, (_, i) => Math.round(8 + (lastOpen - 8) * (easeInOut(i / 7) * 0.6 + (i / 7) * 0.4)));

  // 2. вкладки: щелчки по словам диктора
  const wReport = wordFrame(cues, "n02", "tabs", "отчет");
  const wClients = wordFrame(cues, "n02", "tabs", "кардар");
  const wSchool = wordFrame(cues, "n02", "tabs", "мектеп");
  const pages: (readonly [number, PageId])[] = [
    [0, "meeting"],
    [wReport, "report"],
    [wClients, "clients"],
    [Math.round((wClients + wSchool) / 2) + 2, "mail"],
    [wSchool, "school"],
  ];
  const tabsCut = wSchool + 34;

  // 3. параллельно: сын спрашивает, мама смотрит на часы и отвечает
  const s01 = lineFrames(cues, "s01", "parallel");
  const m01 = lineFrames(cues, "m01", "parallel");
  const watch = s01.to + 6;

  // 4. мост: календарь (конфликт, неудачный перенос) → мысль мамы → поиск
  const m02 = lineFrames(cues, "m02", "bridge");
  const cal = { clashAt: 10, drag: 34, dragEnd: 54, back: 70, backEnd: 84, cut: 92 };
  const search = { from: m02.to + 6 };
  const typeFrom = search.from + 4;
  const bridge = { m02, cal, search, typeFrom, typeTo: typeFrom + 24, found: typeFrom + 28, click: typeFrom + 46 };

  // 5. маршрут
  const n03 = lineFrames(cues, "n03", "route");
  const wHome = wordFrame(cues, "n03", "route", "үйдөн");
  const wAfter = wordFrame(cues, "n03", "route", "сабактан");
  const street = Math.max(n03.from + 60, wHome - 30); // переход на улицу
  // туда — пока звучит «Үйдөн мектепке», обратно — с «сабактан кийин» и
  // спокойно до конца сцены (машина не стоит без дела)
  const drive = { go: street + 8, arrive: wAfter + 4, back: wAfter + 14, home: Math.max(wAfter + 90, 318) };

  // 5. шаги: вкладку закрывают, карточки — по предложениям
  const n04 = lineFrames(cues, "n04", "steps");
  const steps = [
    wordFrame(cues, "n04", "steps", "адегенде"),
    wordFrame(cues, "n04", "steps", "топ"),
    wordFrame(cues, "n04", "steps", "биринчи"),
    wordFrame(cues, "n04", "steps", "андан"),
  ];
  const close = 14;

  return { ninthAt, opens, pages, tabsCut, s01, m01, watch, bridge, n03, wHome, wAfter, street, drive, n04, steps, close };
};

export type Bg1Beats = ReturnType<typeof bg1Beats>;
