// Временная шкала ролика 80-1-2 — единственный источник длительности.
// Опора — фактические границы речи в манифесте озвучки: каждая реплика
// начинается через заданный промежуток после конца предыдущей речи (или
// после действия), поэтому замена одного файла предсказуемо сдвигает всё
// следующее (сцены, жесты, планы и субтитры считаются от этих времён).
//
// Обязательные паузы для ответа зрителя заданы ОДИН раз — событием pause
// (от конца произнесённого вопроса до начала ответа), а не тишиной в файле.
// Файл без зависимостей от Remotion: его используют скрипты (SRT, проверки).
import { A2_LINES, A2_SCENES, A2_VIEWER_PAUSES, type A2SceneId } from "./script.ts";

export type ManifestLine = {
  segId: string;
  line: string;
  role: string;
  text: string;
  file: string;
  durationSec: number;
  speechStart: number; // начало речи внутри файла, с
  speechEnd: number; // конец речи внутри файла, с
  words: { text: string; start: number; end: number }[];
  chars: { c: string; start: number; end: number }[];
  env: number[];
  source?: string;
};
export type Manifest = { version: number; complete: boolean; missing: string[]; lines: ManifestLine[] };

type Flow = { scene: A2SceneId } | { seg: string; gap?: number } | { hold: string; sec: number } | { pause: string };

const n = (k: number) => `80-1-2-${String(k).padStart(3, "0")}`;
// запас сверх обязательной паузы: граница речи по таймингам синтеза может
// быть на несколько сотых раньше акустического затухания
export const PAUSE_MARGIN = 0.1;

// gap — тишина между концом предыдущей речи/действия и началом этой речи.
export const A2_FLOW: Flow[] = [
  { scene: "apple" },
  { hold: "placeApple", sec: 3.4 }, // рука кладёт яблоко на тарелку
  { hold: "notice", sec: 1.0 }, // Юсуф замечает и подаётся вперёд
  { seg: n(1), gap: 0.1 },
  { seg: n(2), gap: 0.8 }, // общий план: класс, стол, учитель
  { seg: n(3), gap: 0.7 },
  { seg: n(4), gap: 0.8 },
  { hold: "cut", sec: 6.4 }, // нож → разрез → нож на место → половинки
  { hold: "reveal", sec: 2.8 }, // сердцевина, название ролика
  { seg: n(5), gap: 0.2 },
  { hold: "lookSeeds", sec: 1.4 },
  { seg: n(6), gap: 0.9 },
  { hold: "think1", sec: 1.6 },

  { scene: "seed" },
  { hold: "takeSeed", sec: 3.8 }, // одно семечко — на отдельное блюдце
  { hold: "seedLook", sec: 1.0 }, // семечко на блюдце крупно
  { seg: n(7), gap: 0.6 },
  { hold: "boardTree", sec: 0.8 },
  { seg: n(8), gap: 0.6 },
  { seg: n(9), gap: 0.9 }, // вставка: семечко в почве → росток → годы
  { hold: "growth", sec: 8.6 },
  { hold: "growthBack", sec: 1.2 },
  { seg: n(10), gap: 0.5 },
  { seg: n(11), gap: 0.8 },
  { hold: "toGarden", sec: 1.8 }, // рисунок яблони на доске → сад

  { scene: "roots" },
  { hold: "gardenLook", sec: 2.0 }, // сад; камера опускается к земле
  { seg: n(12), gap: 0.2 },
  { hold: "rootsReveal", sec: 2.6 }, // разрез почвы открывает корни
  { seg: n(13), gap: 0.3 },
  { seg: n(14), gap: 1.0 },
  { hold: "rain", sec: 5.2 }, // дождь → влажная почва → стрелки к корням
  { seg: n(15), gap: 0.3 },
  { seg: n(16), gap: 0.8 },
  { hold: "watering", sec: 2.8 },
  { hold: "rootsBack", sec: 2.2 }, // снова класс

  { scene: "leaves" },
  { hold: "toLeaves", sec: 2.4 }, // та же яблоня: камера поднимается к листьям
  { seg: n(17), gap: 0.2 },
  { seg: n(18), gap: 1.0 }, // лист: вода, свет, воздух → питание
  { hold: "leafDone", sec: 2.6 },
  { hold: "spring", sec: 2.4 }, // весна: две яблони в цвету, прилетает пчела
  { seg: n(19), gap: 0.1 },
  { seg: n(20), gap: 0.6 }, // пыльца с цветка яблони A на цветок яблони B
  { hold: "pollinate", sec: 2.4 },
  { hold: "fruitTime", sec: 9.0 }, // лепестки опали → завязи → спелые яблоки
  { seg: n(21), gap: 0.3 },
  { seg: n(22), gap: 1.0 }, // спелое яблоко → половинка на столе
  { hold: "leavesEnd", sec: 1.2 },

  { scene: "gather" },
  { hold: "boardSet", sec: 2.4 }, // учитель обращает внимание на схему
  { seg: n(23), gap: 0.2 },
  { pause: n(23) }, // 4 с для ответа зрителя
  { seg: n(24), gap: 0 },
  { seg: n(25), gap: 0.7 },
  { seg: n(26), gap: 0.7 },
  { seg: n(27), gap: 1.0 }, // стрелки: вода → корни, свет → листья
  { hold: "gatherEnd", sec: 2.0 },

  { scene: "creator" },
  { hold: "amirLook", sec: 1.2 }, // Амир смотрит на рисунок ростка
  { seg: n(28), gap: 0.1 },
  { seg: n(29), gap: 0.9 },
  { seg: n(30), gap: 0.7 },
  { seg: n(31), gap: 1.1 },
  { hold: "afterQuran", sec: 1.4 },
  { seg: n(32), gap: 0.2 },
  { seg: n(33), gap: 0.9 },
  { hold: "creatorEnd", sec: 2.0 },

  { scene: "viewer" },
  { seg: n(34), gap: 0.4 },
  { pause: n(34) }, // 5 с для ответа зрителя
  { seg: n(35), gap: 0 },
  { hold: "yusufLook", sec: 2.0 }, // Юсуф: половинка яблока → рисунок дерева
  { seg: n(36), gap: 0.2 },
  { seg: n(37), gap: 0.7 },
  { seg: n(38), gap: 0.8 },
  { hold: "viewerEnd", sec: 1.8 },

  { scene: "notice" },
  { hold: "slide", sec: 3.4 }, // Юсуф придвигает блюдце с семечком
  { seg: n(39), gap: 0.2 },
  { seg: n(40), gap: 0.8 },
  { hold: "toOrchard", sec: 6.0 }, // яблоня на доске → яблоко среди листьев → класс
  { seg: n(41), gap: 0.5 },
  { seg: n(42), gap: 0.7 },
  { seg: n(43), gap: 1.0 },
  { hold: "ending", sec: 4.2 }, // финальный кадр после последнего слова
];

export type Span = { start: number; end: number };
export type SegTime = Span & { fileStart: number; m: ManifestLine; role: string; line: string };
export type Timeline = {
  fps: number;
  seg: Record<string, SegTime>;
  hold: Record<string, Span>;
  pause: Record<string, Span>; // по id вопроса
  scenes: Record<A2SceneId, Span>;
  total: number;
  frames: number;
  estimated: boolean;
};

// Оценка длительности до появления озвучки (черновая сборка).
const estimate = (segId: string): ManifestLine => {
  const line = A2_LINES.find((l) => l.id === segId)!;
  const rate = line.role === "teacher" ? 14 : 12.5;
  const dur = 0.35 + line.text.length / rate;
  return { segId, line: line.id, role: line.role, text: line.text, file: "", durationSec: dur + 0.3, speechStart: 0.15, speechEnd: 0.15 + dur, words: [], chars: [], env: [] };
};

export const pauseSec = (q: string) => A2_VIEWER_PAUSES.find((p) => p.q === q)!.sec;

export const buildTimeline = (manifest: Manifest | null, fps = 30): Timeline => {
  const bySeg = new Map((manifest?.lines ?? []).map((l) => [l.segId, l]));
  const seg: Record<string, SegTime> = {};
  const hold: Record<string, Span> = {};
  const pause: Record<string, Span> = {};
  const scenes = {} as Record<A2SceneId, Span>;
  let cursor = 0;
  let scene: A2SceneId | null = null;
  let estimated = false;
  for (const item of A2_FLOW) {
    if ("scene" in item) {
      if (scene) scenes[scene].end = cursor;
      scene = item.scene;
      scenes[scene] = { start: cursor, end: cursor };
      continue;
    }
    if ("hold" in item) {
      hold[item.hold] = { start: cursor, end: cursor + item.sec };
      cursor += item.sec;
      continue;
    }
    if ("pause" in item) {
      // пауза от конца речи вопроса; округление вверх до целого кадра
      const sec = pauseSec(item.pause) + PAUSE_MARGIN;
      const end = Math.ceil((cursor + sec) * fps) / fps;
      pause[item.pause] = { start: cursor, end };
      cursor = end;
      continue;
    }
    let m = bySeg.get(item.seg);
    if (!m) {
      m = estimate(item.seg);
      estimated = true;
    }
    const start = cursor + (item.gap ?? 0.6);
    const end = start + (m.speechEnd - m.speechStart);
    seg[item.seg] = { start, end, fileStart: start - m.speechStart, m, role: m.role, line: m.line };
    cursor = end;
  }
  if (scene) scenes[scene].end = cursor;
  return { fps, seg, hold, pause, scenes, total: cursor, frames: Math.ceil(cursor * fps), estimated };
};

// Проверка обязательных пауз: от конца речи вопроса до начала речи ответа.
// Кадры считаются в худшую сторону (конец вопроса — вверх, начало ответа —
// вниз), секунды — по звуку.
export const checkViewerPauses = (t: Timeline) =>
  A2_VIEWER_PAUSES.map(({ q, a, sec }) => {
    const qEnd = Math.ceil(t.seg[q].end * t.fps);
    const aStart = Math.floor(t.seg[a].start * t.fps);
    const seconds = t.seg[a].start - t.seg[q].end;
    return { q, a, need: sec * t.fps, frames: aStart - qEnd, seconds, ok: aStart - qEnd >= sec * t.fps && seconds >= sec };
  });

export const A2_SCENE_ORDER = A2_SCENES.map((s) => s.id);
