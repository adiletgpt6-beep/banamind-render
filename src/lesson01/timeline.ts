// Временная шкала урока 1: единственный источник длительности — фактические
// границы речи в манифесте озвучки. Каждая реплика начинается через заданный
// промежуток после конца предыдущей речи (или после действия), поэтому
// изменение длины одного файла предсказуемо сдвигает всё следующее.
//
// Обязательные паузы для ответа зрителя отсчитываются от конца
// произнесённого вопроса до начала следующего ответа.
// Файл без зависимостей от Remotion: его используют скрипты (SRT, проверки).
import { L1_LINES, L1_SCENES, L1_VIEWER_PAUSES, type L1SceneId } from "./script.ts";

export type ManifestLine = {
  segId: string;
  line: string;
  role: string;
  text: string;
  file: string;
  durationSec: number;
  speechStart: number;
  speechEnd: number;
  words: { text: string; start: number; end: number }[];
  chars: { c: string; start: number; end: number }[];
  env: number[];
  source?: string;
};
export type Manifest = { version: number; complete: boolean; missing: string[]; lines: ManifestLine[] };

// Поток событий по сценам: реплики (сегменты), действия без речи, паузы.
type Flow = { scene: L1SceneId } | { seg: string; gap?: number } | { hold: string; sec: number };

// gap — тишина между концом предыдущей речи/действия и началом этой речи.
export const L1_FLOW: Flow[] = [
  { scene: "riddle" },
  { hold: "houseDetail", sec: 4.6 }, // крупно: красная крыша и кубики
  { hold: "reveal", sec: 3.6 }, // отъезд: Юсуф и Амир, затем класс
  { seg: "L01", gap: 0.2 },
  { seg: "L02", gap: 1.35 },
  { hold: "teacherKneel", sec: 1.6 }, // Мухаммад присаживается к младшим
  { seg: "L03", gap: 0.3 },
  { seg: "L04", gap: 0.81 },
  { seg: "L05", gap: 1.35 },
  { hold: "title", sec: 3.8 },
  { hold: "houseLook", sec: 2.2 }, // «Кто построил домик?» — читают старшие

  { scene: "self" },
  { seg: "L06", gap: 1.08 },
  { hold: "consider", sec: 1.6 }, // учитель внимательно слушает догадку
  { seg: "L07", gap: 0.3 },
  { hold: "cardBefore", sec: 3.6 }, // одна картинка: домика ещё нет
  { hold: "cardAfter", sec: 4.0 }, // рядом — готовый домик
  { seg: "L08", gap: 0.4 },
  { seg: "L09", gap: 1.35 },
  { hold: "keyThought", sec: 2.0 },
  { seg: "L10", gap: 0.3 },
  { seg: "L11", gap: 1.22 },
  { hold: "backToHouse", sec: 2.6 },

  { scene: "builder" },
  { seg: "L12", gap: 0.68 },
  { hold: "toMemory", sec: 1.4 }, // крупно крыша → утро
  { hold: "memory", sec: 15.6 }, // Мухаммад утром строит домик
  { hold: "fromMemory", sec: 1.4 }, // та же крыша → настоящее
  { hold: "recognize", sec: 2.4 }, // Юсуф узнаёт и улыбается
  { seg: "L13", gap: 0.1 },
  { seg: "L14", gap: 1.22 },
  { seg: "L15", gap: 1.62 },
  { seg: "L16", gap: 1.08 },
  { hold: "afterQuestions", sec: 2.4 },

  { scene: "world" },
  { seg: "L17", gap: 0.4 },
  { hold: "toWindow", sec: 3.6 }, // дети поворачиваются, герои поднимаются
  { hold: "atWindow", sec: 3.2 },
  { seg: "L18", gap: 0.1 },
  { hold: "treeLook", sec: 3.2 },
  { seg: "L19", gap: 0.3 },
  { hold: "skyLook", sec: 3.2 },
  { seg: "L20", gap: 0.81 },
  { hold: "nightLook", sec: 5.0 },
  { seg: "L21", gap: 0.68 },
  { seg: "L22", gap: 1.35 },
  { hold: "worldEnd", sec: 2.6 },

  { scene: "question" },
  { seg: "L23", gap: 0.4 },
  { hold: "toBoard", sec: 1.4 },
  { seg: "L24", gap: 0.2 },
  { hold: "earthLook", sec: 1.6 },
  { seg: "L25", gap: 0.81 },
  { hold: "pause1", sec: L1_VIEWER_PAUSES.L25 + 0.15 }, // 4 с тишины для ответа зрителя
  { seg: "L26", gap: 0.0 },
  { seg: "L27", gap: 1.35 },
  { hold: "questionEnd", sec: 3.2 },

  { scene: "parents" },
  { seg: "L28", gap: 0.81 },
  { hold: "homeInsert", sec: 3.0 }, // мама и папа помогают надеть куртку
  { seg: "L29", gap: 0.2 },
  { seg: "L30", gap: 1.22 },
  { seg: "L31", gap: 1.22 },
  { hold: "parentsEnd", sec: 2.4 },

  { scene: "whoAllah" },
  { hold: "raiseHand", sec: 2.6 }, // Билал поднимает руку, учитель переводит внимание
  { seg: "L32", gap: 0.0 },
  { seg: "L33a", gap: 1.35 },
  { hold: "alwaysPause", sec: 1.8 }, // спокойная пауза после «Он был всегда»
  { seg: "L33b", gap: 0.0 },
  { hold: "beforeYusuf", sec: 1.6 },
  { seg: "L34", gap: 0.0 },
  { seg: "L35", gap: 1.35 },
  { hold: "needEnd", sec: 2.8 },

  { scene: "answer" },
  { seg: "L36", gap: 0.81 },
  { hold: "pause2", sec: L1_VIEWER_PAUSES.L36 + 0.15 }, // 5 с
  { seg: "L37", gap: 0.0 },
  { seg: "L38", gap: 1.89 },
  { hold: "pause3", sec: L1_VIEWER_PAUSES.L38 + 0.15 }, // 4 с
  { seg: "L39", gap: 0.0 },
  { hold: "placeTree", sec: 5.0 }, // Юсуф ставит деревце рядом с домиком
  { seg: "L40", gap: 0.68 },
  { hold: "ending", sec: 4.0 },
];

export type Span = { start: number; end: number };
export type SegTime = Span & { fileStart: number; m: ManifestLine; role: string; line: string };
export type Timeline = {
  fps: number;
  seg: Record<string, SegTime>;
  hold: Record<string, Span>;
  scenes: Record<L1SceneId, Span>;
  total: number; // секунды
  frames: number;
  estimated: boolean;
};

// Оценка длительности до появления озвучки (для черновой сборки).
const estimate = (segId: string): ManifestLine => {
  const line = L1_LINES.find((l) => segId.startsWith(l.id))!;
  const part = line.parts ? line.parts["ab".indexOf(segId.slice(3))] : null;
  const text = part ? part.text : line.text;
  const rate = line.role === "teacher" ? 14 : 12.5;
  const dur = 0.35 + text.length / rate;
  return { segId, line: line.id, role: line.role, text, file: "", durationSec: dur + 0.3, speechStart: 0.15, speechEnd: 0.15 + dur, words: [], chars: [], env: [] };
};

export const buildTimeline = (manifest: Manifest | null, fps = 30): Timeline => {
  const bySeg = new Map((manifest?.lines ?? []).map((l) => [l.segId, l]));
  const seg: Record<string, SegTime> = {};
  const hold: Record<string, Span> = {};
  const scenes = {} as Record<L1SceneId, Span>;
  let cursor = 0;
  let scene: L1SceneId | null = null;
  let estimated = false;
  for (const item of L1_FLOW) {
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
    let m = bySeg.get(item.seg);
    if (!m) {
      m = estimate(item.seg);
      estimated = true;
    }
    const start = cursor + (item.gap ?? 0.45);
    const end = start + (m.speechEnd - m.speechStart);
    seg[item.seg] = { start, end, fileStart: start - m.speechStart, m, role: m.role, line: m.line };
    cursor = end;
  }
  if (scene) scenes[scene].end = cursor;
  const total = cursor;
  return { fps, seg, hold, scenes, total, frames: Math.ceil(total * fps), estimated };
};

// Проверка обязательных пауз: от конца вопроса до начала ответа (в кадрах).
export const checkViewerPauses = (t: Timeline) => {
  const pairs: [string, string, number][] = [
    ["L25", "L26", L1_VIEWER_PAUSES.L25],
    ["L36", "L37", L1_VIEWER_PAUSES.L36],
    ["L38", "L39", L1_VIEWER_PAUSES.L38],
  ];
  return pairs.map(([q, a, sec]) => {
    const qEnd = Math.ceil(t.seg[q].end * t.fps);
    const aStart = Math.floor(t.seg[a].start * t.fps);
    return { q, a, need: sec * t.fps, frames: aStart - qEnd, ok: aStart - qEnd >= sec * t.fps };
  });
};

export const L1_SCENE_ORDER = L1_SCENES.map((s) => s.id);
