// Звуковой слой №34 вне React. Тихая подложка и комнатная атмосфера —
// громкость по кадрам: мягкий вход, приглушение под каждой репликой
// (рампы 0,3 с), тёплое разрешение под финальным экраном. Эффекты —
// только реальные действия в кадре; кадры берутся из тех же планов сцен
// (linePlan, blockPlan, …), что и анимация, поэтому звук совпадает
// с действием при любой длине реплик.
// Файлы — public/audio/extra-line-34/sfx (scripts/el34-sound.mjs). Каждый
// приведён к громкости реплик, поэтому уровни здесь — в дБ относительно
// речи: −16 — на 16 дБ тише голоса.
import { EL_VIDEO, type ElMode, type ElSceneId } from "./script";
import type { ElTimeline } from "./timing";
import { linePlan } from "./scenes/Line";
import { familyPlan } from "./scenes/Family";
import { blockPlan } from "./scenes/Block";
import { askPlan } from "./scenes/Ask";
import { readingPlan } from "./scenes/Reading";
import { toyPlan } from "./scenes/Toy";
import { balagoPlan } from "./scenes/Balago";
import { trialPlan } from "./scenes/Trial";
import { deletePlan } from "./scenes/Delete";
import { bookmarkPlan } from "./scenes/Bookmark";

const FPS = EL_VIDEO.fps;
export const SOUND_DIR = `${EL_VIDEO.voiceDir}/sfx`;
export const dB = (db: number) => Math.pow(10, db / 20);
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

// ---------- Эффекты действий ----------
export type SfxName =
  | "typing" // набор на ноутбуке (12 с, берутся отрезки)
  | "key" // одна мягкая клавиша (выделение строк)
  | "key-delete" // клавиша удаления
  | "page-turn" // страница книги
  | "page-riffle" // несколько страниц подряд (поиск места)
  | "book-open" // книга ложится на колени и раскрывается
  | "book-take" // книгу передают из рук в руки (или берут с полки)
  | "bookmark" // закладка входит между страницами
  | "cloth" // ткань, мягкая игрушка
  | "cloth-long" // подушку отодвигают
  | "sit" // садятся на диван
  | "phone-tap" // касание экрана телефона
  | "click" // щелчок тачпада
  | "tick"; // тихий «тик» карточки

export type SfxCue = {
  readonly id: string; // «сцена:действие» — для таблицы и Studio
  readonly file: string; // путь для staticFile
  readonly frame: number; // абсолютный кадр начала звука
  readonly volume: number; // линейная громкость
  readonly dur?: number; // кадры: звучит только отрезок файла (с мягким концом)
  readonly trim?: number; // кадры: начало отрезка в файле
};

// put(id, звук, кадр сцены, уровень дБ относительно речи[, отрезок])
export type SfxPut = (id: string, name: SfxName, frame: number, db: number, cut?: { readonly dur: number; readonly trim: number }) => void;
type SceneSfx = (tl: ElTimeline, put: SfxPut) => void;

// Набор на ноутбуке в кадрах сцены [a, b): отрезок записи typing.mp3.
// Место отрезка в файле зависит от id — у каждой фразы свой ритм.
const TYPING_FRAMES = 12 * FPS;
const typing = (put: SfxPut, id: string, a: number, b: number, db: number) => {
  const dur = Math.max(6, Math.min(TYPING_FRAMES - FPS, Math.round(b - a)));
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  put(id, "typing", a, db, { dur, trim: h % (TYPING_FRAMES - dur) });
};

// Страница книги: в page-turn.mp3 страница ложится через 0,6 с — за кадр
// до turn1 (конец поворота в плане сцены; поворот — easeInOut).
const PAGE_LAND = Math.round(0.6 * FPS);
const pageTurn = (put: SfxPut, id: string, turn1: number, db: number) => put(id, "page-turn", turn1 - PAGE_LAND - 1, db);

// Эффекты по сценам: кадры — от начала сцены (как в планах сцен).
// Новая сцена — новая строка: план сцены экспортирует кадры действий,
// звук ставится одним put(...).
const SCENE_SFX: Partial<Record<ElSceneId, SceneSfx>> = {
  // 1. Две правки пунктов и новая строка: набор, пока появляется текст
  // (текст набирается на 0,3…1 каждой правки — AdCard edit0/edit)
  line: (tl, put) => {
    const P = linePlan(tl);
    typing(put, "line:первая правка", Math.round(P.editA0 + 0.3 * (P.editA1 - P.editA0)), P.editA1, -18.5);
    typing(put, "line:правка пункта", Math.round(P.edit0 + 0.3 * (P.edit1 - P.edit0)), P.edit1, -18.5);
    typing(put, "line:новая строка", P.type0, P.type1, -18.5);
  },
  // 2. Мама допечатывает (общий план, дальше от камеры), вставка — офис
  family: (tl, put) => {
    const P = familyPlan(tl);
    // первые кадры — поза конца сц. 1 (задумалась), печатает с t > 14
    typing(put, "family:ноутбук дома", 15, P.son, -22);
    typing(put, "family:офис", P.office, P.meeting, -22);
  },
  // 3. Отдельный пункт о вождении
  block: (tl, put) => {
    const P = blockPlan(tl);
    typing(put, "block:пункт о вождении", P.lines0, P.lines0 + 30, -18.5);
  },
  // 4. Карточки кандидатов — без звуков (интерфейс, а не действие)
  // 6. Книга переходит к воспитателю, подушка, мальчик садится
  ask: (tl, put) => {
    const P = askPlan(tl);
    put("ask:книга в руки", "book-take", P.reach + 8, -19.5);
    put("ask:подушка", "cloth-long", P.cushion0 - 2, -21);
    put("ask:садится", "sit", P.sit0 + 23, -20.5);
  },
  // 7. Книга раскрывается, страница переворачивается
  reading: (tl, put) => {
    const P = readingPlan(tl);
    put("reading:книга раскрывается", "book-open", P.open0 - 1, -18.5);
    pageTurn(put, "reading:страница", P.turn1, -16);
  },
  // 8. Малышка отдаёт зайчика
  toy: (tl, put) => {
    const P = toyPlan(tl);
    put("toy:зайчик", "cloth", P.take - 8, -18.5);
  },
  // 10. split — без эффектов: разговор и карточки
  // 11. Мама ищет сервис (набор), нажатие «Алдын ала өтүнмө» (тачпад);
  // «Өтүнмө калтырылды» — без сигнала
  balago: (tl, put) => {
    const P = balagoPlan(tl);
    typing(put, "balago:поиск", P.type0, P.type1, -19);
    put("balago:алдын ала өтүнмө", "click", P.press0 - 1, -19);
  },
  // 12. Короткое сообщение в телефоне: палец лежит на экране и между
  // касаниями приподнимается (в позе мамы y − tap·8, tap = max(0, sin((t −
  // tap0) / 2,4))); касание — когда палец снова ложится: (t − tap0) / 2,4 = π + 2πk
  trial: (tl, put) => {
    const P = trialPlan(tl);
    for (let t = P.tap0 + 2.4 * Math.PI, k = 1; t < P.tap1; t += 2.4 * 2 * Math.PI, k++) put(`trial:касание ${k}`, "phone-tap", Math.round(t) - 1, -19);
  },
  // 13. Клавиша удаления пункта
  delete: (tl, put) => {
    const P = deletePlan(tl);
    put("delete:удаление", "key-delete", P.del0 - 1, -16);
  },
  // 14. Книга с полки, страница (поворот turn0 → turn1), закладка
  bookmark: (tl, put) => {
    const P = bookmarkPlan(tl);
    put("bookmark:книга с полки", "book-take", P.take - 8, -20);
    pageTurn(put, "bookmark:страница", P.turn1, -17);
    put("bookmark:закладка", "bookmark", P.mark0, -19);
  },
  // 15. cta — без эффектов: тёплое разрешение подложки (BED_END)
};

// Все эффекты ролика (абсолютные кадры), по времени.
export const sfxCues = (tl: ElTimeline): SfxCue[] => {
  const out: SfxCue[] = [];
  for (const sc of tl.scenes) {
    const add = SCENE_SFX[sc.id];
    if (!add) continue;
    add(tl, (id, name, frame, db, cut) => out.push({ id, file: `${SOUND_DIR}/${name}.mp3`, frame: Math.max(0, sc.from + Math.round(frame)), volume: dB(db), ...cut }));
  }
  return out.sort((a, b) => a.frame - b.frame);
};

// ---------- Подложка и атмосфера ----------
export type BedSpec = {
  readonly file: string;
  readonly level: number; // дБ относительно речи без приглушения
  readonly duck: Readonly<Record<ElMode, number>>; // дБ под репликой
  readonly ramp: number; // с: мягкий вход/выход приглушения
  readonly hold: number; // с: после конца речи (хвост голоса)
  readonly merge: number; // с: в паузах короче приглушение не снимается
  readonly fadeIn: number; // с от начала ролика
  readonly fadeOut: number; // с до конца ролика
  readonly lift?: number; // дБ: чуть теплее после последней реплики
  readonly scenes?: Partial<Record<ElSceneId, number>>; // поправка сцены, дБ
};

// Подложка — на 20 дБ тише речи в паузах; под репликой ещё тише: рассказчик
// −3,5 дБ, диалог и чтение вслух — глубже (голоса тише и интимнее).
// Вечер и вопрос о машине — чуть тише, финал — чуть теплее; после последней
// реплики подложка за 3 с уходит под тёплое разрешение (BED_END).
export const BED: BedSpec = {
  file: `${SOUND_DIR}/bed.mp3`,
  level: -20,
  duck: { narration: -3.5, dialogue: -5, reading: -5.5 },
  ramp: 0.3,
  hold: 0.12,
  merge: 0.9,
  fadeIn: 2.5,
  fadeOut: 3,
  lift: 0.5,
  scenes: { question: -1, delete: -1.5, bookmark: -1, cta: 0.5 },
};
// Комнатная атмосфера — ещё тише, почти не приглушается (ровный «воздух»).
export const ROOM: BedSpec = {
  file: `${SOUND_DIR}/room.mp3`,
  level: -36,
  duck: { narration: -1.5, dialogue: -1.5, reading: -1.5 },
  ramp: 0.3,
  hold: 0.12,
  merge: 0.9,
  fadeIn: 0.6,
  fadeOut: 1.2,
};

// Громкость (линейная) в кадре ролика по шкале речи.
export const bedVolume = (tl: ElTimeline, spec: BedSpec) => {
  // интервалы речи; короткие паузы между репликами не поднимают подложку
  const spans: { a: number; b: number; d: number }[] = [];
  for (const c of tl.cues) {
    const d = spec.duck[c.mode];
    const last = spans[spans.length - 1];
    if (last && c.from - last.b < spec.merge) {
      last.b = c.to;
      last.d = Math.min(last.d, d);
    } else spans.push({ a: c.from, b: c.to, d });
  }
  const end = tl.frames / FPS;
  const lastTo = spans.length ? spans[spans.length - 1].b : 0;
  // поправки сцен с плавной сменой на границе (1 с)
  const trims = tl.scenes.filter((s) => spec.scenes?.[s.id]).map((s) => ({ a: s.from / FPS, b: s.to / FPS, d: spec.scenes![s.id]! }));
  return (frame: number) => {
    const t = frame / FPS;
    let duck = 0;
    for (const s of spans) duck = Math.min(duck, s.d * smooth((t - s.a + spec.ramp) / spec.ramp) * (1 - smooth((t - s.b - spec.hold) / spec.ramp)));
    let trim = 0;
    for (const s of trims) trim += s.d * smooth(t - s.a + 0.5) * (1 - smooth(t - s.b + 0.5));
    const lift = spec.lift ? spec.lift * smooth((t - lastTo - spec.hold) / 0.8) : 0;
    return dB(spec.level + duck + trim + lift) * smooth(t / spec.fadeIn) * smooth((end - t) / spec.fadeOut);
  };
};

// Тёплое разрешение (bed-end.mp3): Dadd9 вступает под последним словом,
// ноты пианино — сразу после голоса (через ≈ 0,3 с); к последнему кадру
// затихает. Ноты громче среднего уровня файла, поэтому level ниже, чем у BED. Над органным пунктом подложки сочетается с любым её аккордом.
export const BED_END = { file: `${SOUND_DIR}/bed-end.mp3`, level: -25, lead: 0.6, fadeOut: 1.4 } as const;
export const bedEndCue = (tl: ElTimeline) => {
  const last = tl.cues[tl.cues.length - 1];
  const frame = Math.max(0, Math.round(((last ? last.to : tl.frames / FPS) - BED_END.lead) * FPS));
  const dur = Math.max(1, tl.frames - frame);
  return { frame, dur, volume: (f: number) => dB(BED_END.level) * smooth((dur - f) / (BED_END.fadeOut * FPS)) };
};
