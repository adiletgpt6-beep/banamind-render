// Временная шкала ролика 80-1-4 «Один Создатель» — единственный источник
// длительности. Опора — фактические границы речи в манифесте озвучки: каждая
// реплика начинается через заданный промежуток после конца предыдущей речи
// (или после действия), поэтому замена одного файла предсказуемо сдвигает всё
// следующее (сцены, действия, планы, надписи и субтитры считаются от этих
// времён). Длительность композиции = конец последнего события.
//
// Обязательные паузы для ответа зрителя заданы ОДИН раз — событием pause
// (от конца произнесённого вопроса до начала ответа), а не тишиной в файле.
// Файл без зависимостей от Remotion: его используют скрипты (SRT, проверки).
import { type A4Lang, a4Pack, isA4Lang } from "./lang.ts";
import { A4_SCENES, A4_VIEWER_PAUSES, type A4SceneId } from "./script.ts";

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
// lang — язык озвучки (нет поля — русская версия)
export type Manifest = { version: number; lang?: string; complete: boolean; missing: string[]; lines: ManifestLine[] };

type Flow = { scene: A4SceneId } | { seg: string; gap?: number } | { hold: string; sec: number } | { pause: string };

const n = (k: number) => `80-1-4-${String(k).padStart(3, "0")}`;
// запас сверх обязательной паузы: граница речи по таймингам синтеза может
// быть на несколько сотых раньше акустического затухания
export const PAUSE_MARGIN = 0.1;

// gap — тишина между концом предыдущей речи/действия и началом этой речи.
// hold — действие без речи (имя используется режиссурой).
export const A4_FLOW: Flow[] = [
  // 1. Сейчас вырастет!
  { scene: "water" },
  { hold: "open", sec: 6.0 }, // общий план комнаты → внимание к ростку у окна
  { hold: "rise", sec: 2.0 }, // Юсуф поднимается с ковра
  { hold: "walk", sec: 2.8 }, // короткие шаги к столику и учителю
  { seg: n(1), gap: 0.3 },
  { hold: "tKneel", sec: 1.7 }, // учитель смотрит, улыбается, приседает у горшка
  { seg: n(2), gap: 0.2 },
  { hold: "soil", sec: 2.6 }, // палец касается верхнего слоя земли; Амир наклоняется
  { seg: n(3), gap: 0.2 },
  { hold: "lift", sec: 1.9 }, // Юсуф поднимает лейку двумя руками
  { seg: n(4), gap: 0.2 },
  { seg: n(5), gap: 0.6 }, // учитель мягко поддерживает лейку
  { hold: "pour", sec: 1.6 }, // крупно: наклон, вода уходит в землю
  { seg: n(6), gap: 0.3 },
  { seg: n(7), gap: 1.2 },
  { hold: "pourEnd", sec: 3.2 }, // лейка выпрямлена, вода впитывается, учитель отпускает

  // 2. Почему он не вырос сразу?
  { scene: "wait" },
  { hold: "setCan", sec: 2.2 }, // Юсуф осторожно ставит лейку рядом с горшком
  { hold: "crouch", sec: 1.6 }, // присаживается перед ростком
  { hold: "watch", sec: 4.0 }, // смотрит, моргает, наклоняет голову, снова смотрит
  { hold: "lean", sec: 0.7 },
  { seg: n(8), gap: 0.1 },
  { hold: "funny", sec: 2.6 }, // ничего не происходит: росток прежний
  { hold: "come", sec: 5.4 }, // Амир (и следом Билал) подходят к столику
  { seg: n(9), gap: 0.2 },
  { hold: "bilalIn", sec: 1.6 }, // Билал садится у ростка
  { seg: n(10), gap: 0.5 }, // крупно росток на «стебелёк и листья»
  { seg: n(11), gap: 0.8 },
  { seg: n(12), gap: 0.8 }, // «ухаживать» — Юсуф снова берёт лейку
  { hold: "wonder", sec: 2.2 },

  // 3. Не только вода
  { scene: "needs" },
  { hold: "toAll", sec: 1.2 }, // учитель поворачивается ко всем
  { seg: n(13), gap: 0.2 },
  { pause: n(13) }, // 4 с для ответа зрителя
  { seg: n(14), gap: 0 },
  { seg: n(15), gap: 0.6 },
  { hold: "toWindow", sec: 1.2 }, // взгляды к окну
  { seg: n(16), gap: 0.3 }, // вставки: почва, листья, подоконник, свет
  { hold: "sill", sec: 1.6 },
  { hold: "yLook", sec: 1.0 }, // Юсуф смотрит в окно, удивляется
  { seg: n(17), gap: 0.1 },
  { hold: "sky", sec: 3.4 }, // спокойный вид неба и дневного света в окне
  { seg: n(18), gap: 0.3 },
  { hold: "leafLight", sec: 3.0 }, // листья в обычном дневном свете

  // 4. Разные создатели?
  { scene: "cards" },
  { hold: "cardsOut", sec: 8.2 }, // учитель по одной раскладывает четыре карточки
  { hold: "compare", sec: 2.0 }, // Амир переводит взгляд между карточками
  { seg: n(19), gap: 0.4 },
  { seg: n(20), gap: 1.1 },
  { seg: n(21), gap: 0.9 },
  { seg: n(22), gap: 0.9 }, // Билал указывает на горшок
  { seg: n(23), gap: 0.8 },
  { hold: "amirThinks", sec: 3.2 }, // камера плавно к Амиру: солнце, капля, наклон головы
  { seg: n(24), gap: 0.1 },
  { hold: "listen", sec: 1.0 }, // учитель спокойно дослушал
  { seg: n(25), gap: 0.3 },
  { hold: "cardsBack", sec: 3.2 }, // карточки и росток

  // 5. Что значит «Един»?
  { scene: "one" },
  { hold: "handUp", sec: 1.5 }, // Билал поднимает руку, учитель переводит взгляд
  { seg: n(26), gap: 0.1 },
  { seg: n(27), gap: 0.8 }, // закрытый Коран на подставке; надпись «Аллах Един»
  { hold: "caption", sec: 3.4 },
  { seg: n(28), gap: 0.5 }, // Юсуф поднимает один палец
  { seg: n(29), gap: 0.9 },
  { seg: n(30), gap: 1.2 }, // Амир вспоминает карточки
  { seg: n(31), gap: 0.8 },
  { hold: "understand", sec: 3.2 },

  // 6. А мы?
  { scene: "us" },
  { hold: "palm", sec: 3.8 }, // Юсуф рассматривает ладонь, поворачивает её
  { seg: n(32), gap: 0.1 },
  { seg: n(33), gap: 0.9 }, // взгляд переходит от мальчика к мальчику
  { hold: "help", sec: 3.8 }, // Билал придвигает поддон, Юсуф ставит лейку
  { seg: n(34), gap: 0.3 },
  { seg: n(35), gap: 0.9 },
  { hold: "amirFwd", sec: 0.8 }, // Амир подаётся вперёд
  { seg: n(36), gap: 0.1 },
  { seg: n(37), gap: 0.9 },
  { hold: "quiet", sec: 3.0 },

  // 7. Проверим, что поняли
  { scene: "check" },
  { hold: "turn", sec: 1.6 }, // учитель обращается к зрителям
  { seg: n(38), gap: 0.2 },
  { pause: n(38) }, // 5 с
  { seg: n(39), gap: 0 },
  { seg: n(40), gap: 1.2 },
  { pause: n(40) }, // 5 с
  { seg: n(41), gap: 0 },
  { seg: n(42), gap: 1.2 },
  { pause: n(42) }, // 5 с
  { seg: n(43), gap: 0 },
  { hold: "checkEnd", sec: 2.6 },

  // 8. Маленький росток и большие горы
  { scene: "end" },
  { hold: "yPlant", sec: 3.0 }, // Юсуф спокойно смотрит на росток, потом к окну
  { hold: "mountains", sec: 2.6 }, // вид из знакомого окна: далёкие горы
  { seg: n(44), gap: 0.1 },
  { seg: n(45), gap: 1.0 },
  { hold: "tidy", sec: 5.6 }, // Амир складывает карточки, Билал ставит горшок на светлое место
  { seg: n(46), gap: 0.3 },
  { seg: n(47), gap: 1.0 },
  { hold: "final", sec: 6.5 }, // последний кадр, надпись ≈ 4,5 с, мягкое затухание
];

export type Span = { start: number; end: number };
export type SegTime = Span & { fileStart: number; m: ManifestLine; role: string; line: string };
export type Timeline = {
  fps: number;
  seg: Record<string, SegTime>;
  hold: Record<string, Span>;
  pause: Record<string, Span>; // по id вопроса
  scenes: Record<A4SceneId, Span>;
  total: number;
  frames: number;
  estimated: boolean;
  lang: A4Lang;
};

// Оценка длительности до появления озвучки (черновая сборка).
const estimate = (segId: string, lang: A4Lang): ManifestLine => {
  const line = a4Pack(lang).lines.find((l) => l.id === segId)!;
  const rate = line.role === "teacher" ? 14 : 12.5;
  const dur = 0.35 + line.text.length / rate;
  return { segId, line: line.id, role: line.role, text: line.text, file: "", durationSec: dur + 0.3, speechStart: 0.15, speechEnd: 0.15 + dur, words: [], chars: [], env: [] };
};

export const pauseSec = (q: string) => A4_VIEWER_PAUSES.find((p) => p.q === q)!.sec;

export const buildTimeline = (manifest: Manifest | null, fps = 30, language?: A4Lang): Timeline => {
  const lang: A4Lang = language ?? (isA4Lang(manifest?.lang) ? manifest.lang : "ru");
  const bySeg = new Map((manifest?.lines ?? []).map((l) => [l.segId, l]));
  const seg: Record<string, SegTime> = {};
  const hold: Record<string, Span> = {};
  const pause: Record<string, Span> = {};
  const scenes = {} as Record<A4SceneId, Span>;
  let cursor = 0;
  let scene: A4SceneId | null = null;
  let estimated = false;
  for (const item of A4_FLOW) {
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
      m = estimate(item.seg, lang);
      estimated = true;
    }
    const start = cursor + (item.gap ?? 0.6);
    const end = start + (m.speechEnd - m.speechStart);
    seg[item.seg] = { start, end, fileStart: start - m.speechStart, m, role: m.role, line: m.line };
    cursor = end;
  }
  if (scene) scenes[scene].end = cursor;
  return { fps, seg, hold, pause, scenes, total: cursor, frames: Math.ceil(cursor * fps), estimated, lang };
};

// Проверка обязательных пауз: от конца речи вопроса до начала речи ответа.
// Кадры считаются в худшую сторону (конец вопроса — вверх, начало ответа —
// вниз), секунды — по звуку.
export const checkViewerPauses = (t: Timeline) =>
  A4_VIEWER_PAUSES.map(({ q, a, sec }) => {
    const qEnd = Math.ceil(t.seg[q].end * t.fps);
    const aStart = Math.floor(t.seg[a].start * t.fps);
    const seconds = t.seg[a].start - t.seg[q].end;
    return { q, a, need: sec * t.fps, frames: aStart - qEnd, seconds, ok: aStart - qEnd >= sec * t.fps && seconds >= sec };
  });

// Таблица реплик (рекомендованные поля ТЗ): всё из одного источника — сценарий,
// манифест озвучки и шкала. mouthAnimation — чем двигаются губы.
export const dialogueTable = (t: Timeline) =>
  a4Pack(t.lang).lines.map((l) => {
    const s = t.seg[l.id];
    return {
      id: l.id,
      n: l.n,
      sceneId: l.scene,
      speakerId: l.role,
      text: l.text,
      audioFile: s.m.file || null,
      audioDuration: s.m.durationSec,
      speechDuration: Number((s.m.speechEnd - s.m.speechStart).toFixed(3)),
      startFrame: Math.floor(s.start * t.fps),
      endFrame: Math.ceil(s.end * t.fps),
      emotion: l.emotion,
      animationCue: l.cue,
      mouthAnimation: l.role === "kids" ? "group-envelope" : s.m.chars.length ? "letters+envelope" : s.m.env.length ? "envelope" : "estimate",
    };
  });

export const A4_SCENE_ORDER = A4_SCENES.map((s) => s.id);
