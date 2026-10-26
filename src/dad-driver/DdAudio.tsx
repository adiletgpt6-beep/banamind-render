// Звук ролика №32: голоса (файл на реплику, по фактической шкале), очень
// тихая спокойная подложка — мягкий пэд и редкие «капли» (слой
// music-story-morning проекта, без ударных и электронного пульса), под
// речью она приглушается; едва слышная атмосфера комнаты/офиса и редкие
// бытовые звуки (sound.ts). Начало мягкое, после последнего слова
// подложка плавно затихает.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { SCENE_BEATS } from "./scenes";
import { DD_VIDEO } from "./script";
import { ddSound } from "./sound";

const FPS = DD_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-morning.mp3"; // −20 LUFS сам по себе
export const MUSIC_VOLUME = 0.2; // ≈ −34 LUFS в паузах
export const MUSIC_UNDER_VOICE = 0.085; // ≈ −41 LUFS под речью
const BED_LOOP = 12; // с, длина петли атмосферы
// Общий уровень микса: интегрально ≈ −16 LUFS, пик ≤ −1,5 dBTP.
export const MASTER = 0.88;

export const DdAudio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  // интервалы речи; близкие реплики объединяются — музыка между ними не
  // поднимается рывком
  const spans = useMemo(() => {
    const out: [number, number][] = [];
    for (const c of tl.cues) {
      const a = s(c.from);
      const b = s(c.to);
      const last = out[out.length - 1];
      if (last && a - last[1] < s(1.6)) last[1] = b;
      else out.push([a, b]);
    }
    return out;
  }, [tl]);
  const lastWord = s(tl.cues[tl.cues.length - 1].to);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) {
      v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    }
    // мягкий вход и затухание после последнего слова
    return v * interpolate(f, [0, s(1.2)], [0, 1], clamp) * interpolate(f, [lastWord, total - 2], [1, 0], clamp);
  };
  const { sfx, beds } = useMemo(() => ddSound(tl, SCENE_BEATS(tl)), [tl]);
  return (
    <>
      <Sequence name="Музыка (тихая подложка)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={(f) => MASTER * duck(f)} />
      </Sequence>
      {beds.flatMap((bd, i) => {
        const len = bd.to - bd.from;
        const loops = Math.ceil(len / s(BED_LOOP - 1));
        return Array.from({ length: loops }, (_, k) => {
          const from = bd.from + k * s(BED_LOOP - 1);
          const dur = Math.min(s(BED_LOOP), bd.to - from);
          return (
            <Sequence key={`bed-${i}-${k}`} name={`Атмосфера: ${bd.src.split("/").pop()}`} from={from} durationInFrames={dur}>
              <Audio src={staticFile(bd.src)} volume={(f) => MASTER * bd.volume * interpolate(f, [0, 12, dur - 12, dur], [k === 0 ? 0 : 1, 1, 1, from + dur >= bd.to ? 0 : 1], clamp)} />
            </Sequence>
          );
        });
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => MASTER * x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${DD_VIDEO.voiceDir}/${c.file}`)} volume={MASTER} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
