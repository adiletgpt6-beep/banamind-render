// Звук «13:20дагы жолугушуу»: голоса (по шкале фактической речи), своя
// спокойная инструментальная музыка по настроению сцен
// (scripts/m1320-music.mjs, без вокала и ударных), тихая атмосфера мест
// (офис, улица/двор, комната) и немногие эффекты, у каждого из которых есть
// видимое действие (scenes/sfx.ts). Звуков ходьбы нет.
// Музыка под речью заметно ниже голоса; в вечерней сцене с рисунком —
// особенно тихо; в последние 2,5 с плавно затихает к последнему кадру.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { getStaticFiles, interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { M13_VIDEO, type M13SceneId } from "./script";
import { m13Sfx } from "./scenes/sfx";

const FPS = M13_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = M13_VIDEO.assetDir;

// Музыка по сценам: дорожка → сцены (соседние сцены с одной дорожкой
// звучат непрерывно).
export const MOOD: Record<M13SceneId, string> = {
  calendar: "m1320-mystery",
  notice: "m1320-mystery",
  ask: "m1320-mystery",
  drive: "m1320-road",
  reveal: "m1320-warm",
  grandma: "m1320-warm",
  back: "m1320-day",
  evening: "m1320-day",
  home: "m1320-home",
  drawing: "m1320-home",
  brand: "m1320-brand",
};
const MOOD_GAIN: Record<string, number> = {
  "m1320-mystery": 1,
  "m1320-road": 0.95,
  "m1320-warm": 0.95,
  "m1320-day": 0.9,
  "m1320-home": 0.85,
  "m1320-brand": 1,
};
// Уровень музыки в паузах по сценам (вечерняя сцена с рисунком — тише).
const SCENE_BASE: Partial<Record<M13SceneId, number>> = { drawing: 0.16, home: 0.22 };
const BASE = 0.28;

// Тихая атмосфера мест (своя, scripts/m1320-foley.mjs): дорожка → сцены.
const AMBIENCE: Partial<Record<M13SceneId, { src: string; gain: number }>> = {
  notice: { src: "amb-office", gain: 0.22 },
  ask: { src: "amb-office", gain: 0.2 },
  drive: { src: "amb-city", gain: 0.24 },
  reveal: { src: "amb-yard", gain: 0.24 },
  grandma: { src: "amb-room", gain: 0.16 },
  back: { src: "amb-city", gain: 0.2 },
  evening: { src: "amb-office", gain: 0.16 },
  home: { src: "amb-room", gain: 0.14 },
  drawing: { src: "amb-room", gain: 0.12 },
};

// Есть ли файл в public/ (черновые кадры до генерации музыки и эффектов
// собираются без них; финальный CI сначала создаёт все файлы).
const useHas = () => {
  const names = useMemo(() => new Set(getStaticFiles().map((f) => f.name)), []);
  return (path: string) => names.size === 0 || names.has(path);
};

export const M13Audio: React.FC = () => {
  const tl = useTimeline();
  const has = useHas();
  const total = tl.frames;
  // интервалы речи (кадры) для приглушения музыки; живая речь — сильнее
  const spans = useMemo(
    () =>
      tl.cues.map((c) => ({
        a: Math.round(c.from * FPS),
        b: Math.round(c.to * FPS),
        low: c.scene === "drawing" ? 0.035 : c.mode === "live" ? 0.04 : 0.075,
      })),
    [tl],
  );
  const sceneAt = (f: number) => tl.scenes.find((s) => f >= s.from && f < s.to)?.id ?? "brand";
  const music = useMemo(() => {
    const out: { src: string; from: number; to: number }[] = [];
    for (const sc of tl.scenes) {
      const src = MOOD[sc.id];
      const last = out[out.length - 1];
      if (last && last.src === src) last.to = sc.to;
      else out.push({ src, from: sc.from, to: sc.to });
    }
    return out;
  }, [tl]);
  const amb = useMemo(() => {
    const out: { src: string; gain: number; from: number; to: number }[] = [];
    for (const sc of tl.scenes) {
      const a = AMBIENCE[sc.id];
      if (!a) continue;
      const last = out[out.length - 1];
      if (last && last.src === a.src && last.to === sc.from) last.to = sc.to;
      else out.push({ ...a, from: sc.from, to: sc.to });
    }
    return out;
  }, [tl]);
  const sfx = useMemo(() => m13Sfx(tl), [tl]);
  const duck = (f: number) => {
    const sc = sceneAt(f);
    const base = SCENE_BASE[sc] ?? BASE;
    let v = base;
    for (const s of spans) v = Math.min(v, interpolate(f, [s.a - 10, s.a, s.b, s.b + 18], [base, Math.min(base, s.low), Math.min(base, s.low), base], clamp));
    return v * interpolate(f, [0, 20, total - 75, total - 1], [0, 1, 1, 0], clamp);
  };
  // атмосфера под речью тише: под живыми репликами — вдвое, под диктором — на четверть
  const ambDuck = (f: number) => {
    let v = 1;
    for (const s of spans) v = Math.min(v, interpolate(f, [s.a - 8, s.a, s.b, s.b + 12], [1, s.low < 0.075 ? 0.45 : 0.75, s.low < 0.075 ? 0.45 : 0.75, 1], clamp));
    return v;
  };
  const XF = 30; // перекрёстное затухание 1 с
  return (
    <>
      {music.filter((m) => has(`${DIR}/music/${m.src}.mp3`)).map((m, i, all) => {
        const music = all;
        const a = Math.max(0, m.from - (i > 0 ? XF / 2 : 0));
        const b = Math.min(total, m.to + (i < music.length - 1 ? XF / 2 : 0));
        const g = MOOD_GAIN[m.src] ?? 1;
        return (
          <Sequence key={`${m.src}-${i}`} name={`Музыка: ${m.src}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(`${DIR}/music/${m.src}.mp3`)}
              volume={(f) => duck(f + a) * g * interpolate(f + a, [a, a + XF, b - XF, b], [i === 0 ? 1 : 0, 1, 1, i === music.length - 1 ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {amb.filter((m) => has(`${DIR}/sfx/${m.src}.mp3`)).map((m, i) => {
        const dur = m.to - m.from;
        return (
          <Sequence key={`amb-${i}`} name={`Атмосфера: ${m.src}`} from={m.from} durationInFrames={dur}>
            <Audio
              src={staticFile(`${DIR}/sfx/${m.src}.mp3`)}
              loop
              volume={(f) => m.gain * ambDuck(f + m.from) * interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.filter((x) => has(x.src)).map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.frame} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={dur ? (f) => x.volume * interpolate(f, [0, 6, dur - 8, dur], [0, 1, 1, 0], clamp) : x.volume} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${M13_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
