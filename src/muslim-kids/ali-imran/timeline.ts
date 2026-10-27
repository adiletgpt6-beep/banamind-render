// Монтаж под речь: длительности сцен и тайминги слов берутся из манифеста
// озвучки (public/muslim-kids/ali-imran/voice/manifest.json). Пока озвучки нет,
// тайминги оцениваются по длине текста — ролик собирается и проверяется.
import { createContext, useContext } from "react";
import { FPS } from "../theme.ts";
import { LINES, SCENES } from "./script.ts";

export type VoiceWord = { text: string; start: number; end: number };
export type VoiceLine = {
  id: string;
  file: string;
  duration: number;
  speechStart: number;
  speechEnd: number;
  words: VoiceWord[];
};
export type VoiceManifest = {
  version: 1;
  engine?: string;
  voice?: string;
  lines: VoiceLine[];
};

export type TlWord = { text: string; from: number; to: number };
export type TlLine = {
  id: string;
  // кадр начала аудиофайла, null — оценка без файла
  audioFrom: number;
  file: string | null;
  speechFrom: number;
  speechTo: number;
  words: TlWord[];
};
export type TlScene = { id: string; from: number; dur: number };
export type Timeline = {
  total: number;
  scenes: TlScene[];
  lines: TlLine[];
  estimated: boolean;
};

const letters = (s: string) =>
  [...s].filter((c) => /[\p{L}\p{N}]/u.test(c)).length;

// оценка речи без файла: ~12.5 букв/с при speed 0.92 + паузы на знаках
const estimateLine = (text: string): VoiceLine => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const words: VoiceWord[] = [];
  let t = 0.05;
  for (const tok of tokens) {
    const d = Math.max(0.16, letters(tok) / 12.5);
    if (letters(tok) > 0)
      words.push({ text: tok, start: +t.toFixed(3), end: +(t + d).toFixed(3) });
    t +=
      d +
      0.05 +
      (/[,:;—]$/.test(tok) ? 0.22 : 0) +
      (/[.!?»]$/.test(tok) ? 0.3 : 0);
  }
  const end = words[words.length - 1]?.end ?? 0.5;
  return {
    id: "",
    file: "",
    duration: end + 0.25,
    speechStart: words[0]?.start ?? 0,
    speechEnd: end,
    words,
  };
};

export const buildTimeline = (manifest: VoiceManifest | null): Timeline => {
  const byId = new Map((manifest?.lines ?? []).map((l) => [l.id, l]));
  const estimated = LINES.some((l) => !byId.has(l.id));
  const scenes: TlScene[] = [];
  const lines: TlLine[] = [];
  let sceneStart = 0;
  for (const scene of SCENES) {
    let cursor = sceneStart; // сек: конец предыдущей речи
    for (const line of scene.lines) {
      const v = byId.get(line.id);
      const voice = v ?? estimateLine(line.text);
      const speechAt = cursor + line.before;
      const audioAt = speechAt - voice.speechStart;
      lines.push({
        id: line.id,
        audioFrom: Math.round(audioAt * FPS),
        file: v ? v.file : null,
        speechFrom: Math.round(speechAt * FPS),
        speechTo: Math.round((audioAt + voice.speechEnd) * FPS),
        words: voice.words.map((w) => ({
          text: w.text,
          from: Math.round((audioAt + w.start) * FPS),
          to: Math.round((audioAt + w.end) * FPS),
        })),
      });
      cursor = audioAt + voice.speechEnd;
    }
    const dur = Math.max(scene.planned, cursor - sceneStart + scene.tail);
    scenes.push({
      id: scene.id,
      from: Math.round(sceneStart * FPS),
      dur: Math.round(dur * FPS),
    });
    sceneStart += Math.round(dur * FPS) / FPS;
  }
  return { total: Math.round(sceneStart * FPS), scenes, lines, estimated };
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

export class Cues {
  readonly tl: Timeline;
  constructor(tl: Timeline) {
    this.tl = tl;
  }
  scene(id: string): TlScene {
    const s = this.tl.scenes.find((x) => x.id === id);
    if (!s) throw new Error(`Нет сцены ${id}`);
    return s;
  }
  line(id: string): TlLine {
    const l = this.tl.lines.find((x) => x.id === id);
    if (!l) throw new Error(`Нет реплики ${id}`);
    return l;
  }
  // кадр начала (или конца) слова: по номеру или по началу слова
  word(
    lineId: string,
    w: number | string,
    edge: "from" | "to" = "from",
  ): number {
    const l = this.line(lineId);
    const word =
      typeof w === "number"
        ? l.words[w]
        : l.words.find((x) => norm(x.text).startsWith(norm(w)));
    if (!word) throw new Error(`Нет слова «${w}» в ${lineId}`);
    return word[edge];
  }
  // кадр относительно начала сцены
  local(sceneId: string, frame: number) {
    return frame - this.scene(sceneId).from;
  }
}

export const TimelineCtx = createContext<Cues | null>(null);
export const useCues = () => {
  const c = useContext(TimelineCtx);
  if (!c) throw new Error("TimelineCtx не задан");
  return c;
};
