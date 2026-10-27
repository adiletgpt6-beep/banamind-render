// Звук фильма №36: голоса (по шкале фактической речи), своя спокойная
// музыка (scripts/sd2d-music.mjs: фетровое фортепиано, в поездке — щипки
// струн; без вокала и ударных) и немногие тихие бытовые звуки из звуковых
// планов сцен (у каждого есть видимое действие), плюс очень тихие атмосферы.
// Речь всегда главная: музыка под речью ≈ на 20 дБ ниже голоса (под голосом
// ребёнка — ещё на 2 дБ), между репликами — заметно тише голоса; входы и
// выходы плавные. В сценах бейджа и просьбы сына подложка тише всего.
// В последние 2,5 с всё плавно затихает. Итог нормализуется отдельно
// (scripts/sd2d-loudness.mjs: ≈ −16,5 LUFS, true peak ≤ −1 dBTP).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { SD2_VIDEO, type Sd2SceneId } from "./script";
import { SCENE_SFX } from "./scenes";
import type { Sd2Sfx, Sd2SfxKind } from "./sfx";

const FPS = SD2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = SD2_VIDEO.voiceDir;

// Музыка по сценам.
const MOOD: Record<Sd2SceneId, string> = {
  suitcase: "sd2d-home",
  invite: "sd2d-home",
  schedule: "sd2d-home",
  who: "sd2d-home",
  dinner: "sd2d-evening",
  three: "sd2d-evening",
  meetings: "sd2d-warm",
  pack: "sd2d-warm",
  request: "sd2d-warm",
  trip: "sd2d-trip",
  call: "sd2d-trip",
  back: "sd2d-tender",
  badge: "sd2d-tender",
  photo: "sd2d-tender",
  folder: "sd2d-tender",
  cta: "sd2d-end",
};
// Громкость подложки по сценам (доля от базовой).
const MOOD_GAIN: Partial<Record<Sd2SceneId, number>> = { dinner: 0.85, three: 0.8, badge: 0.6, photo: 0.7, folder: 0.8, cta: 1.05 };

const MUSIC_FREE = 0.3; // между репликами
const MUSIC_UNDER = 0.12; // под речью (≈ −20 дБ к голосу)
const MUSIC_UNDER_CHILD = 0.095;
const XFADE = 36; // кадров перекрёстного затухания между настроениями

// Громкость и длительность эффектов по умолчанию.
const SFX: Record<Sd2SfxKind, { file: string; volume: number; dur?: number }> = {
  "folder-down": { file: "folder-down", volume: 0.3 },
  paper: { file: "paper", volume: 0.22 },
  zip: { file: "zip", volume: 0.24 },
  lid: { file: "lid", volume: 0.3 },
  tap: { file: "tap", volume: 0.25 },
  notify: { file: "notify", volume: 0.18 },
  door: { file: "door", volume: 0.24 },
  "car-door": { file: "car-door", volume: 0.26 },
  belt: { file: "belt", volume: 0.22 },
  spoon: { file: "spoon", volume: 0.2 },
  chair: { file: "chair", volume: 0.18 },
  "suitcase-set": { file: "suitcase-set", volume: 0.28 },
  call: { file: "call", volume: 0.2 },
  room: { file: "room", volume: 0.5, dur: 30 },
  yard: { file: "yard", volume: 0.18, dur: 8 },
  hall: { file: "hall", volume: 0.45, dur: 20 },
  car: { file: "car", volume: 0.35, dur: 20 },
  chime: { file: "chime", volume: 0.16 },
};
const LONG: ReadonlySet<Sd2SfxKind> = new Set(["room", "yard", "hall", "car"]);

export const Sd2Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  // интервалы речи; близкие реплики объединяются — музыка между ними не поднимается
  const spans = useMemo(() => {
    const out: { a: number; b: number; child: boolean }[] = [];
    for (const c of tl.cues.filter((x) => x.file)) {
      const a = Math.round(c.from * FPS);
      const b = Math.round(c.to * FPS);
      const last = out[out.length - 1];
      if (last && a - last.b < Math.round(1.2 * FPS)) {
        last.b = b;
        last.child = last.child || c.role === "son";
      } else out.push({ a, b, child: c.role === "son" });
    }
    return out;
  }, [tl]);
  const duck = (f: number) => {
    let v = MUSIC_FREE;
    for (const s of spans) {
      const under = s.child ? MUSIC_UNDER_CHILD : MUSIC_UNDER;
      v = Math.min(v, interpolate(f, [s.a - 14, s.a, s.b, s.b + 20], [MUSIC_FREE, under, under, MUSIC_FREE], clamp));
    }
    return v * interpolate(f, [0, 12, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  // участки одного настроения подряд → одна дорожка с перекрёстными затуханиями
  const runs = useMemo(() => {
    const out: { src: string; from: number; to: number; scenes: Sd2SceneId[] }[] = [];
    for (const sc of tl.scenes) {
      const src = MOOD[sc.id];
      const last = out[out.length - 1];
      if (last && last.src === src) {
        last.to = sc.to;
        last.scenes.push(sc.id);
      } else out.push({ src, from: sc.from, to: sc.to, scenes: [sc.id] });
    }
    return out;
  }, [tl]);
  const sceneGain = (f: number) => {
    const sc = tl.scenes.find((s) => f >= s.from && f < s.to) ?? tl.scenes[tl.scenes.length - 1];
    const prev = tl.scenes[tl.scenes.indexOf(sc) - 1];
    const g = MOOD_GAIN[sc.id] ?? 1;
    const pg = prev ? MOOD_GAIN[prev.id] ?? 1 : g;
    return interpolate(f, [sc.from, sc.from + 30], [pg, g], clamp);
  };
  const sfx = useMemo(() => {
    const out: (Sd2Sfx & { abs: number })[] = [];
    for (const sc of tl.scenes) for (const s of SCENE_SFX[sc.id](tl)) out.push({ ...s, abs: sc.from + s.at });
    return out;
  }, [tl]);
  return (
    <>
      {runs.map((m, i) => {
        const a = Math.max(0, m.from - (i > 0 ? XFADE / 2 : 0));
        const b = Math.min(total, m.to + (i < runs.length - 1 ? XFADE / 2 : 0));
        return (
          <Sequence key={`${m.src}-${m.from}`} name={`Музыка: ${m.src}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(`${DIR}/music/${m.src}.mp3`)}
              trimBefore={a}
              volume={(f) =>
                duck(f + a) *
                sceneGain(f + a) *
                interpolate(f + a, [a, a + XFADE, b - XFADE, b], [i === 0 ? 1 : 0, 1, 1, i === runs.length - 1 ? 1 : 0], clamp)
              }
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const def = SFX[x.kind];
        const dur = LONG.has(x.kind) ? Math.round((x.dur ?? def.dur ?? 4) * FPS) : undefined;
        const vol = x.volume ?? def.volume;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.kind}`} from={x.abs} durationInFrames={dur} premountFor={FPS}>
            <Audio
              src={staticFile(`${DIR}/sfx/${def.file}.mp3`)}
              loop={LONG.has(x.kind)}
              loopVolumeCurveBehavior="extend"
              volume={(f) => vol * (dur ? interpolate(f, [0, 18, dur - 18, dur], [0, 1, 1, 0], clamp) : 1) * interpolate(f + x.abs, [total - 2.5 * FPS, total - 2], [1, 0], clamp)}
            />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${DIR}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
