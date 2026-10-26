// Монтаж истории по РЕАЛЬНЫМ длительностям реплик (manifest.json озвучки).
// Реплики идут одна за другой с паузами из сценария; сцена длится до
// конца своей последней реплики + хвост, но не меньше minSec (время на
// действие без слов). Финальный экран — не меньше MS_CTA_HOLD_SEC после
// последней реплики. Без озвучки длительности оцениваются по тексту.
//
// Без зависимостей от Remotion: используется и Node-скриптами.
import {
  MS_CTA_HOLD_SEC,
  MS_LINES,
  MS_SCENES,
  MS_VIDEO,
  type RoleId,
  type StorySceneId,
} from "./script.ts";

export type StoryWord = {
  readonly text: string;
  readonly start: number; // с от начала файла реплики
  readonly end: number;
};

export type StoryManifestLine = {
  readonly id: string;
  readonly scene: StorySceneId;
  readonly role: RoleId;
  readonly character: string;
  readonly text: string;
  readonly spoken: string;
  readonly voiceName: string;
  readonly voiceId: string;
  readonly modelId: string;
  readonly voiceSettings: { stability: number; similarity_boost: number };
  readonly seed: number;
  readonly hash: string;
  readonly file: string; // относительно voiceDir
  readonly durationSec: number;
  // Начало/конец речи внутри файла (файл обрезан с небольшим запасом).
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words: readonly StoryWord[];
  // Положение на общей шкале ролика (с), заполняет скрипт озвучки.
  readonly timelineStartSec?: number;
  readonly timelineEndSec?: number;
};

export type StoryManifest = {
  readonly version: 1;
  readonly kind: "story";
  readonly estimated?: boolean;
  readonly lines: readonly StoryManifestLine[];
};

export type LineTiming = {
  readonly id: string;
  readonly scene: StorySceneId;
  readonly role: RoleId;
  readonly from: number; // кадр ролика, где начинается файл реплики
  readonly durationInFrames: number;
  readonly speechFrom: number; // кадр начала речи
  readonly speechTo: number; // кадр конца речи
  readonly file: string | null;
  readonly words: readonly { text: string; from: number; to: number }[];
};

export type StorySceneTiming = {
  readonly id: StorySceneId;
  readonly from: number;
  readonly durationInFrames: number;
};

export type StoryTimeline = {
  readonly fps: number;
  readonly durationInFrames: number;
  readonly scenes: readonly StorySceneTiming[];
  readonly lines: readonly LineTiming[];
  readonly speechEndFrame: number;
  readonly estimated: boolean;
};

// Оценка без озвучки: ~14 символов в секунду (темп голосов eleven_v3).
export const estimateStoryManifest = (): StoryManifest => ({
  version: 1,
  kind: "story",
  estimated: true,
  lines: MS_LINES.map((l) => {
    const words: StoryWord[] = [];
    let t = 0.05;
    for (const w of l.text.split(/\s+/).filter(Boolean)) {
      if (!/[\p{L}\p{N}]/u.test(w)) continue;
      const d = Math.max(0.2, w.length / 14);
      words.push({ text: w, start: t, end: t + d });
      t += d + (/[.,?!…:]$/.test(w) ? 0.25 : 0.05);
    }
    const end = words.length ? words[words.length - 1].end : 0.4;
    return {
      id: l.id,
      scene: l.scene,
      role: l.role,
      character: l.role,
      text: l.text,
      spoken: l.spoken ?? l.text,
      voiceName: "",
      voiceId: "",
      modelId: "",
      voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
      seed: 0,
      hash: "",
      file: "",
      durationSec: end + 0.15,
      speechStart: 0.05,
      speechEnd: end,
      words,
    };
  }),
});

// Неполная озвучка (часть реплик ещё не создана): недостающие реплики
// берутся из оценки — без звука. Итоговый ролик требует полный manifest
// (проверяется тестом), это только для промежуточных сборок.
export const completeManifest = (m: StoryManifest): StoryManifest => {
  const have = new Set(m.lines.map((l) => l.id));
  const missing = estimateStoryManifest().lines.filter((l) => !have.has(l.id));
  if (!missing.length) return m;
  const order = new Map(MS_LINES.map((l, i) => [l.id, i]));
  return {
    ...m,
    lines: [...m.lines, ...missing].sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
    ),
  };
};

export const buildStoryTimeline = (
  manifest: StoryManifest,
  fps: number = MS_VIDEO.fps,
): StoryTimeline => {
  const byId = new Map(
    completeManifest(manifest).lines.map((l) => [l.id, l]),
  );
  const f = (sec: number) => Math.round(sec * fps);
  const scenes: StorySceneTiming[] = [];
  const lines: LineTiming[] = [];
  let t = 0; // секунды
  let lastSpeechEnd = 0;
  for (const scene of MS_SCENES) {
    const sceneStart = t;
    let cursor = sceneStart;
    for (const line of scene.lines) {
      const m = byId.get(line.id);
      if (!m) throw new Error(`В озвучке нет реплики «${line.id}».`);
      // Пауза отсчитывается от конца речи предыдущей реплики до начала речи.
      const speechAt = cursor + line.pause;
      const fileAt = speechAt - m.speechStart;
      const from = f(fileAt);
      lines.push({
        id: line.id,
        scene: scene.id,
        role: line.role,
        from,
        durationInFrames: Math.max(1, Math.ceil(m.durationSec * fps)),
        speechFrom: f(speechAt),
        speechTo: f(fileAt + m.speechEnd),
        file: manifest.estimated || !m.file ? null : m.file,
        words: m.words.map((w) => ({
          text: w.text,
          from: f(fileAt + w.start),
          to: f(fileAt + w.end),
        })),
      });
      cursor = fileAt + m.speechEnd;
      lastSpeechEnd = cursor;
    }
    const minEnd = sceneStart + scene.minSec;
    const end =
      scene.id === "s13Cta"
        ? Math.max(minEnd, lastSpeechEnd + MS_CTA_HOLD_SEC)
        : Math.max(minEnd, cursor + scene.tail);
    scenes.push({
      id: scene.id,
      from: f(sceneStart),
      durationInFrames: f(end) - f(sceneStart),
    });
    t = end;
  }
  // Речь реплик не должна накладываться (тихие края файлов — допустимо).
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].speechFrom < lines[i - 1].speechTo) {
      throw new Error(
        `Реплики «${lines[i - 1].id}» и «${lines[i].id}» накладываются.`,
      );
    }
  }
  const last = scenes[scenes.length - 1];
  return {
    fps,
    durationInFrames: last.from + last.durationInFrames,
    scenes,
    lines,
    speechEndFrame: f(lastSpeechEnd),
    estimated: Boolean(manifest.estimated),
  };
};

// Сводка монтажа (timeline.json): начала сцен и реплик в секундах.
export const timelineSummary = (tl: StoryTimeline) => ({
  version: 1,
  fps: tl.fps,
  durationInFrames: tl.durationInFrames,
  durationSec: Number((tl.durationInFrames / tl.fps).toFixed(3)),
  speechEndSec: Number((tl.speechEndFrame / tl.fps).toFixed(3)),
  ctaHoldSec: Number(
    ((tl.durationInFrames - tl.speechEndFrame) / tl.fps).toFixed(3),
  ),
  scenes: tl.scenes.map((s) => ({
    id: s.id,
    startSec: Number((s.from / tl.fps).toFixed(3)),
    endSec: Number(((s.from + s.durationInFrames) / tl.fps).toFixed(3)),
  })),
  lines: tl.lines.map((l) => ({
    id: l.id,
    scene: l.scene,
    role: l.role,
    speechStartSec: Number((l.speechFrom / tl.fps).toFixed(3)),
    speechEndSec: Number((l.speechTo / tl.fps).toFixed(3)),
  })),
});
