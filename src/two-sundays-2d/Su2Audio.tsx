// Звук «Эмне үчүн анын эки жекшембиси бар?»: голоса (по шкале фактической
// речи), своя музыка по настроению сцен (scripts/su2d-music.mjs — без бочки
// и щелчков) и немногие тихие эффекты, у каждого из которых есть видимое
// действие (scenes/sfx.ts). Шагов нет ни в одном пути звука.
// Музыка: под речью заметно ниже голоса; в объяснении дочки (D02) — ещё
// тише; в последние 2,5 с плавно затихает к последнему кадру.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { SU2_VIDEO, type Su2SceneId } from "./script";
import { su2Sfx } from "./scenes/sfx";

const FPS = SU2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = "audio/two-sundays-2d";

// Музыка по сценам: дорожка → сцены.
export const MOOD: Record<Su2SceneId, string> = {
  calendar: "su2d-open",
  special: "su2d-open",
  morning: "su2d-weekday",
  office: "su2d-weekday",
  grandma: "su2d-weekday",
  wednesday: "su2d-wednesday",
  meeting: "su2d-wednesday",
  dinner: "su2d-wednesday",
  why: "su2d-quiet",
  showDad: "su2d-quiet",
  memory: "su2d-wednesday",
  search: "su2d-focus",
  shared: "su2d-end",
  fridge: "su2d-end",
  contact: "su2d-end",
};
const MOOD_GAIN: Record<string, number> = { "su2d-open": 1, "su2d-weekday": 0.9, "su2d-wednesday": 1, "su2d-quiet": 0.6, "su2d-focus": 0.85, "su2d-end": 1 };

export const Su2Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  // интервалы речи (кадры) для приглушения музыки; под голосом дочки — сильнее
  const spans = useMemo(() => tl.cues.map((c) => ({ a: Math.round(c.from * FPS), b: Math.round(c.to * FPS), low: c.id === "D02" ? 0.03 : c.role === "daughter" ? 0.06 : 0.085 })), [tl]);
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
  const sfx = useMemo(() => su2Sfx(tl), [tl]);
  const BASE = 0.3;
  const duck = (f: number) => {
    let v = BASE;
    for (const s of spans) v = Math.min(v, interpolate(f, [s.a - 10, s.a, s.b, s.b + 18], [BASE, s.low, s.low, BASE], clamp));
    return v * interpolate(f, [0, 12, total - 75, total - 1], [0, 1, 1, 0], clamp);
  };
  const XF = 30; // перекрёстное затухание 1 с
  return (
    <>
      {music.map((m, i) => {
        const a = Math.max(0, m.from - (i > 0 ? XF / 2 : 0));
        const b = Math.min(total, m.to + (i < music.length - 1 ? XF / 2 : 0));
        const g = MOOD_GAIN[m.src] ?? 1;
        return (
          <Sequence key={`${m.src}-${i}`} name={`Музыка: ${m.src}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(`${DIR}/music/${m.src}.mp3`)}
              trimBefore={(i * 13 * FPS) % (120 * FPS)}
              volume={(f) => duck(f + a) * g * interpolate(f + a, [a, a + XF, b - XF, b], [i === 0 ? 1 : 0, 1, 1, i === music.length - 1 ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.frame} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={dur ? (f) => x.volume * interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp) : x.volume} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${SU2_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
