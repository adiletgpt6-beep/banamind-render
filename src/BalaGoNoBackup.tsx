import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { fontFamily } from "./fonts";
import { NBContext } from "./no-backup/context";
import { CtaScene } from "./no-backup/scenes/Cta";
import { DriveScene } from "./no-backup/scenes/Drive";
import { EveningScene, FormScene } from "./no-backup/scenes/Evening";
import { CallScene, DecideScene, MorningScene, TriesScene } from "./no-backup/scenes/Home";
import { OfficeScene } from "./no-backup/scenes/Office";
import { NB_VIDEO } from "./no-backup/script";
import { NB_SHOTS, placeLines, type NBManifest, type NBShotId } from "./no-backup/timeline";

export type BalaGoNoBackupProps = {
  // Заполняется в calculateMetadata из public/audio/no-backup/manifest.json.
  readonly manifest: NBManifest;
};

const SCENES: Record<NBShotId, React.FC> = {
  morning: MorningScene,
  call: CallScene,
  tries: TriesScene,
  decide: DecideScene,
  drive: DriveScene,
  office: OfficeScene,
  evening: EveningScene,
  form: FormScene,
  cta: CtaScene,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Музыка: спокойное утро → лёгкая пульсация, пока ищут, кто отвезёт →
// дорога → усталость в офисе → тепло вечером. Слои одной длины, темпа и
// гармонии (из седьмого ролика, сгенерированы кодом).
const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 32, gain: 0.85 },
  { src: "audio/music-story-pulse.mp3", from: 31, to: 62, gain: 0.8 },
  { src: "audio/music-story-tense.mp3", from: 61, to: 81, gain: 0.8 },
  { src: "audio/music-story-low.mp3", from: 80, to: 95, gain: 0.9 },
  { src: "audio/music-story-warm.mp3", from: 94, to: 121, gain: 1 },
];
// Музыка заметно тише диалога: под речью −20 дБ от и без того тихого фона.
const MUSIC_VOLUME = 0.42;
const MUSIC_UNDER_VOICE = 0.07;
const VOICE_VOLUME = 1.05;

// Звуки (секунды ролика): умеренно и не поверх реплик.
type Sfx = { at: number; src: string; volume: number; dur?: number };
const SFX: readonly Sfx[] = [
  { at: 0.5, src: "audio/sfx-vibrate.mp3", volume: 0.3, dur: 0.8 },
  { at: 12.9, src: "audio/sfx-tap.mp3", volume: 0.2 },
  { at: 14.4, src: "audio/sfx-tap.mp3", volume: 0.22 },
  { at: 14.7, src: "audio/sfx-ringback.mp3", volume: 0.2, dur: 1.4 },
  { at: 32.6, src: "audio/sfx-notify.mp3", volume: 0.3 },
  { at: 33.4, src: "audio/sfx-tap.mp3", volume: 0.22 },
  { at: 38.4, src: "audio/sfx-notify.mp3", volume: 0.3 },
  { at: 43.6, src: "audio/sfx-tick.mp3", volume: 0.18, dur: 2.2 },
  { at: 61.3, src: "audio/sfx-car.mp3", volume: 0.25 },
  { at: 65.6, src: "audio/sfx-tap.mp3", volume: 0.35 },
  { at: 67.2, src: "audio/sfx-traffic.mp3", volume: 0.22 },
  { at: 76.4, src: "audio/sfx-bell.mp3", volume: 0.2 },
  { at: 80.2, src: "audio/sfx-typing.mp3", volume: 0.12, dur: 2.5 },
  { at: 92.6, src: "audio/sfx-vibrate.mp3", volume: 0.3, dur: 0.8 },
  { at: 104.1, src: "audio/sfx-tap.mp3", volume: 0.25 },
  { at: 108.9, src: "audio/sfx-tap.mp3", volume: 0.2 },
  { at: 109.9, src: "audio/sfx-tap.mp3", volume: 0.2 },
  { at: 110.9, src: "audio/sfx-tap.mp3", volume: 0.2 },
  { at: 111.6, src: "audio/sfx-tap.mp3", volume: 0.28 },
  { at: 111.95, src: "audio/sfx-chime.mp3", volume: 0.3 },
];

// Ролик №11: «Бүгүн жеткире турган киши жок» (3D, ровно 120 с).
export const BalaGoNoBackup: React.FC<BalaGoNoBackupProps> = ({ manifest }) => {
  const { fps } = useVideoConfig();
  const lines = useMemo(() => placeLines(manifest), [manifest]);
  const total = NB_VIDEO.durationSec * fps;
  const speech = useMemo(() => {
    const out: [number, number][] = [];
    for (const l of lines) {
      const a = Math.round(l.speechFromSec * fps);
      const b = Math.round(l.speechToSec * fps);
      const last = out[out.length - 1];
      if (last && a - last[1] < fps) last[1] = b;
      else out.push([a, b]);
    }
    return out;
  }, [lines, fps]);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of speech)
      v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.8 * fps, total - 2.5 * fps, total - 4], [0, 1, 1, 0], clamp);
  };
  return (
    <NBContext.Provider value={lines}>
      <AbsoluteFill style={{ backgroundColor: "#000000", fontFamily }}>
        {NB_SHOTS.map((s) => {
          const Scene = SCENES[s.id];
          const from = Math.round(s.from * fps);
          return (
            <Sequence key={s.id} name={s.title} from={from} durationInFrames={Math.round(s.to * fps) - from} premountFor={fps}>
              <Scene />
            </Sequence>
          );
        })}
        {MUSIC.map((m) => {
          const a = m.from * fps;
          const b = m.to * fps;
          return (
            <Audio
              key={m.src}
              name={`Музыка: ${m.src}`}
              src={staticFile(m.src)}
              volume={(f) => duck(f) * m.gain * interpolate(f, [a - 0.8 * fps, a + 0.8 * fps, b - 0.8 * fps, b + 0.8 * fps], [a <= 0 ? 1 : 0, 1, 1, 0], clamp)}
            />
          );
        })}
        {SFX.map((s, i) => (
          <Sequence key={`sfx${i}`} name={`Эффект: ${s.src}`} from={Math.round(s.at * fps)} durationInFrames={s.dur ? Math.round(s.dur * fps) : undefined} premountFor={fps}>
            <Audio src={staticFile(s.src)} volume={s.volume} />
          </Sequence>
        ))}
        {lines.map((l) =>
          l.file ? (
            <Sequence key={l.id} name={`Голос: ${l.id} (${l.role})`} from={Math.round(l.startSec * fps)} durationInFrames={Math.ceil(l.durationSec * fps) + 2} premountFor={fps}>
              <Audio src={staticFile(`${NB_VIDEO.voiceDir}/${l.file}`)} volume={VOICE_VOLUME} />
            </Sequence>
          ) : null,
        )}
      </AbsoluteFill>
    </NBContext.Provider>
  );
};
