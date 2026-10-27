// Временная шкала ролика 80-1-3 — единственный источник длительности.
// Опора — фактические границы речи в манифесте озвучки: каждая реплика
// начинается через заданный промежуток после конца предыдущей речи (или
// после действия), поэтому замена одного файла предсказуемо сдвигает всё
// следующее (сцены, действия, планы и субтитры считаются от этих времён).
//
// Обязательные паузы для ответа зрителя заданы ОДИН раз — событием pause
// (от конца произнесённого вопроса до начала ответа), а не тишиной в файле.
// Невербальный опыт сцены 2 (вдох, выдох Юсуфа, первый отклик вертушки) —
// отдельное действие blow без речи, не пауза для зрителя.
// Файл без зависимостей от Remotion: его используют скрипты (SRT, проверки).
import { A3_BLOW_SEC, A3_LINES, A3_VIEWER_PAUSES, type A3Line, type A3SceneId } from "./script.ts";

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

type Flow = { scene: A3SceneId } | { seg: string; gap?: number } | { hold: string; sec: number } | { pause: string };

const n = (k: number) => `80-1-3-${String(k).padStart(3, "0")}`;
// запас сверх обязательной паузы: граница речи по таймингам синтеза может
// быть на несколько сотых раньше акустического затухания
export const PAUSE_MARGIN = 0.1;

// gap — тишина между концом предыдущей речи/действия и началом этой речи.
export const A3_FLOW: Flow[] = [
  { scene: "spin" },
  { hold: "open", sec: 5.0 }, // общий план: класс, учитель у окна, вертушка вращается, название
  { hold: "notice", sec: 1.8 }, // Юсуф замечает вертушку и подаётся вперёд
  { seg: n(1), gap: 0.1 },
  { seg: n(2), gap: 0.85 }, // Амир: ротор → палочка и подставка
  { seg: n(3), gap: 0.85 }, // Билал смотрит на окно
  { seg: n(4), gap: 1.05 }, // учитель у окна
  { hold: "detail", sec: 3.4 }, // крупно: неподвижная палочка, крепление, ротор
  { seg: n(5), gap: 0.2 },
  { hold: "spinEnd", sec: 1.0 },

  { scene: "blow" },
  { seg: n(6), gap: 0.3 },
  { hold: "take", sec: 2.4 }, // берёт вертушку за палочку вместе с подставкой, вторая рука — под подставку
  { hold: "walkA", sec: 3.2 }, // уходит от окна по проходу за рядами; ротор замедляется
  { hold: "walkB", sec: 3.0 }, // (склейка) подходит вдоль переднего края ковра к Юсуфу
  { hold: "kneel", sec: 1.6 }, // опускается на колени рядом с Юсуфом
  { hold: "place", sec: 2.6 }, // ставит подставку на край столика, вынимает вертушку
  { hold: "stopLook", sec: 1.8 }, // Юсуф видит: вертушка стоит
  { seg: n(7), gap: 0.1 },
  { seg: n(8), gap: 0.85 },
  { hold: "present", sec: 1.5 }, // учитель держит вертушку в 15–20 см от лица Юсуфа
  { hold: "blow", sec: A3_BLOW_SEC }, // вдох, выдох, первый отклик (без речи)
  { seg: n(9), gap: 0.15 },
  { hold: "spinDown", sec: 1.6 }, // ротор ещё вращается по инерции
  { seg: n(10), gap: 0.3 },
  { hold: "cheek", sec: 1.0 }, // Амир подносит ладонь к щеке
  { seg: n(11), gap: 0.2 },
  { seg: n(12), gap: 0.85 },

  { scene: "senses" },
  { seg: n(13), gap: 1.15 }, // два коротких воспоминания об опыте
  { seg: n(14), gap: 0.95 },
  { seg: n(15), gap: 0.95 },
  { hold: "calm", sec: 1.8 }, // спокойный план класса, вертушка неподвижна
  { seg: n(16), gap: 0.3 },
  { pause: n(16) }, // 4 с для ответа зрителя
  { seg: n(17), gap: 0 },
  { seg: n(18), gap: 0.85 },
  { hold: "sensesEnd", sec: 1.4 },

  { scene: "question" },
  { hold: "yThink", sec: 2.2 }, // Юсуф наклоняет голову, собирается с мыслью
  { seg: n(19), gap: 0.1 },
  { seg: n(20), gap: 1.15 },
  { seg: n(21), gap: 1.05 },
  { seg: n(22), gap: 1.15 },
  { seg: n(23), gap: 0.95 }, // короткий возврат к яблоне
  { seg: n(24), gap: 1.05 }, // вид через знакомое окно
  { hold: "questionEnd", sec: 2.0 },

  { scene: "creation" },
  { hold: "yLook", sec: 1.6 }, // Юсуф: вертушка → учитель
  { seg: n(25), gap: 0.1 },
  { seg: n(26), gap: 1.05 },
  { hold: "insert", sec: 4.0 }, // учитель ставит вертушку в подставку на столике
  { seg: n(27), gap: 0.4 },
  { seg: n(28), gap: 1.05 },
  { hold: "creationEnd", sec: 1.6 },

  { scene: "invisible" },
  { hold: "aThink", sec: 2.0 }, // Амир задумывается, поднимает руку
  { seg: n(29), gap: 0.1 },
  { seg: n(30), gap: 1.05 },
  { seg: n(31), gap: 1.05 }, // Билал смотрит на неподвижную вертушку
  { seg: n(32), gap: 1.05 },
  { seg: n(33), gap: 1.15 },
  { seg: n(34), gap: 0.85 },
  { hold: "invisibleEnd", sec: 1.6 },

  { scene: "two" },
  { hold: "turn", sec: 1.2 }, // учитель обращается ко всей группе
  { seg: n(35), gap: 0.2 },
  { pause: n(35) }, // 4 с для ответа зрителя
  { seg: n(36), gap: 0 },
  { seg: n(37), gap: 1.05 },
  { pause: n(37) }, // 5 с для ответа зрителя
  { seg: n(38), gap: 0 },
  { seg: n(39), gap: 0.95 },
  { hold: "twoEnd", sec: 1.6 },

  { scene: "ask" },
  { hold: "ySmile", sec: 1.2 },
  { seg: n(40), gap: 0.1 },
  { seg: n(41), gap: 0.95 },
  { hold: "pickUp", sec: 3.0 }, // берёт вертушку с подставкой, поднимается
  { hold: "walkC", sec: 2.8 }, // уходит вдоль переднего края ковра
  { hold: "walkD", sec: 3.2 }, // (склейка) подходит по проходу к окну
  { hold: "setDown", sec: 2.8 }, // ставит у окна; ротор начинает вращаться
  { seg: n(42), gap: 0.5 },
  { hold: "final", sec: 4.6 }, // надпись держится после последней реплики
  { hold: "fadeOut", sec: 1.0 },
];

export type Span = { start: number; end: number };
export type SegTime = Span & { fileStart: number; m: ManifestLine; role: string; line: string };
export type Timeline = {
  fps: number;
  seg: Record<string, SegTime>;
  hold: Record<string, Span>;
  pause: Record<string, Span>; // по id вопроса
  scenes: Record<A3SceneId, Span>;
  total: number;
  frames: number;
  estimated: boolean;
};

// Оценка длительности до появления озвучки (черновая сборка).
const estimate = (segId: string, lines: readonly A3Line[]): ManifestLine => {
  const line = lines.find((l) => l.id === segId)!;
  const rate = line.role === "teacher" ? 15 : 14;
  const dur = 0.3 + line.text.length / rate;
  return { segId, line: line.id, role: line.role, text: line.text, file: "", durationSec: dur + 0.3, speechStart: 0.15, speechEnd: 0.15 + dur, words: [], chars: [], env: [] };
};

export const pauseSec = (q: string) => A3_VIEWER_PAUSES.find((p) => p.q === q)!.sec;

// lines — реплики языковой версии (для оценки длительностей без озвучки).
export const buildTimeline = (manifest: Manifest | null, fps = 30, lines: readonly A3Line[] = A3_LINES): Timeline => {
  const bySeg = new Map((manifest?.lines ?? []).map((l) => [l.segId, l]));
  const seg: Record<string, SegTime> = {};
  const hold: Record<string, Span> = {};
  const pause: Record<string, Span> = {};
  const scenes = {} as Record<A3SceneId, Span>;
  let cursor = 0;
  let scene: A3SceneId | null = null;
  let estimated = false;
  for (const item of A3_FLOW) {
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
      m = estimate(item.seg, lines);
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
  A3_VIEWER_PAUSES.map(({ q, a, sec }) => {
    const qEnd = Math.ceil(t.seg[q].end * t.fps);
    const aStart = Math.floor(t.seg[a].start * t.fps);
    const seconds = t.seg[a].start - t.seg[q].end;
    return { q, a, need: sec * t.fps, frames: aStart - qEnd, seconds, ok: aStart - qEnd >= sec * t.fps && seconds >= sec };
  });
