import { useMemo } from "react";
import { AbsoluteFill, Html5Audio as Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "./fonts";
import { HHContext, HHRenderScaleContext } from "./half-hour/context";
import { CtaScene } from "./half-hour/scenes/Cta";
import { AfternoonScene, HomeScene, FormScene } from "./half-hour/scenes/Home";
import { DeskScene, MeetingScene, OfficeScene } from "./half-hour/scenes/Office";
import { RoadScene } from "./half-hour/scenes/Road";
import { PickupScene, SchoolScene } from "./half-hour/scenes/School";
import { HH_VIDEO } from "./half-hour/script";
import { HH_SHOTS, placeLines, type HHManifest, type HHShotId } from "./half-hour/timeline";

export type BalaGoHalfHourProps = {
  // Заполняется в calculateMetadata из public/audio/half-hour/manifest.json.
  readonly manifest: HHManifest;
  readonly audioOnly?: boolean;
  // Native stills and silent picture chunks keep all visual timing but never
  // mount audio decoders. Motion previews and the audio master keep sound.
  readonly visualOnly?: boolean;
  readonly renderScale?: number;
};

const SCENES: Record<HHShotId, React.FC> = {
  office: OfficeScene,
  desk: DeskScene,
  meeting: MeetingScene,
  school: SchoolScene,
  road: RoadScene,
  pickup: PickupScene,
  afternoon: AfternoonScene,
  home: HomeScene,
  form: FormScene,
  cta: CtaScene,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Музыка: спокойно → лёгкое напряжение в середине → тепло вечером.
// Слои одной длины, темпа и гармонии (из седьмого ролика, сгенерированы кодом).
const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 26, gain: 0.85 },
  { src: "audio/music-story-pulse.mp3", from: 25, to: 46, gain: 0.85 },
  { src: "audio/music-story-tense.mp3", from: 45, to: 66, gain: 0.9 },
  { src: "audio/music-story-low.mp3", from: 65, to: 96, gain: 0.95 },
  { src: "audio/music-story-warm.mp3", from: 95, to: 121, gain: 1 },
];
const MUSIC_VOLUME = 0.32;
const MUSIC_UNDER_VOICE = 0.075;
const VOICE_VOLUME = 1;

// Звуки (секунды ролика): умеренно, не поверх реплик.
type Sfx = { at: number; src: string; volume: number; dur?: number };
const SFX: readonly Sfx[] = [
  { at: 0.0, src: "audio/sfx-typing.mp3", volume: 0.18 },
  { at: 12.35, src: "audio/sfx-vibrate.mp3", volume: 0.5 },
  { at: 12.0, src: "audio/sfx-typing.mp3", volume: 0.14, dur: 0.9 },
  { at: 30.2, src: "audio/sfx-bell.mp3", volume: 0.28 },
  { at: 35.9, src: "audio/sfx-tap.mp3", volume: 0.3 },
  { at: 37.0, src: "audio/sfx-notify.mp3", volume: 0.42 },
  { at: 38.9, src: "audio/sfx-tap.mp3", volume: 0.25 },
  { at: 39.3, src: "audio/sfx-tap.mp3", volume: 0.25 },
  { at: 39.8, src: "audio/sfx-pop.mp3", volume: 0.3 },
  { at: 45.0, src: "audio/sfx-traffic.mp3", volume: 0.3 },
  { at: 54.0, src: "audio/sfx-traffic.mp3", volume: 0.26 },
  { at: 62.2, src: "audio/sfx-car.mp3", volume: 0.3 },
  { at: 86.0, src: "audio/sfx-vibrate.mp3", volume: 0.35 },
  { at: 104.6, src: "audio/sfx-tap.mp3", volume: 0.3 },
  { at: 109.4, src: "audio/sfx-tap.mp3", volume: 0.22 },
  { at: 110.6, src: "audio/sfx-tap.mp3", volume: 0.22 },
  { at: 111.7, src: "audio/sfx-tap.mp3", volume: 0.22 },
  { at: 112.7, src: "audio/sfx-tap.mp3", volume: 0.3 },
  { at: 113.1, src: "audio/sfx-chime.mp3", volume: 0.32 },
];

// Десятый сценарий: «Жумуштан жарым саатка» (3D, ровно 120 с).
export const BalaGoHalfHour: React.FC<BalaGoHalfHourProps> = ({ manifest, audioOnly = false, visualOnly = false, renderScale = 1 }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const lines = useMemo(() => placeLines(manifest), [manifest]);
  const total = HH_VIDEO.durationSec * fps;
  const now = frame / fps;
  const subtitle = lines.find((l) => now >= l.speechFromSec - 0.08 && now <= l.speechToSec + 0.16);
  const timeCards = [
    { from: 0, text: "Бишкек · 09:02" }, { from: 12, text: "12:15" },
    { from: 30, text: "12:30" }, { from: 45, text: "12:47" },
    { from: 65, text: "13:05" }, { from: 82, text: "13:24" }, { from: 95, text: "Кечки убакыт" },
  ];
  const card = timeCards.find((c) => now >= c.from && now < c.from + 2.7);
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
      v = Math.min(v, interpolate(f, [a - 12, a, b, b + 30], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.8 * fps, total - 2.5 * fps, total - 4], [0, 1, 1, 0], clamp);
  };
  return (
    <HHRenderScaleContext.Provider value={renderScale}>
    <HHContext.Provider value={lines}>
      <AbsoluteFill style={{ backgroundColor: "#000000", fontFamily }}>
        {!audioOnly && HH_SHOTS.map((s) => {
          const Scene = SCENES[s.id];
          const from = Math.round(s.from * fps);
          return (
            <Sequence key={s.id} name={s.title} from={from} durationInFrames={Math.round(s.to * fps) - from} premountFor={fps}>
              <Scene />
            </Sequence>
          );
        })}
        {!audioOnly && card ? <div style={{ position: "absolute", top: 128, left: 64, padding: "14px 24px", borderRadius: 16,
          backgroundColor: "rgba(22,35,47,0.72)", color: "#FFF8EE", fontSize: 38, fontWeight: 700,
          opacity: interpolate(now - card.from, [0, 0.3, 2.2, 2.7], [0, 1, 1, 0], clamp) }}>{card.text}</div> : null}
        {!audioOnly && subtitle ? <div style={{ position: "absolute", left: 64, right: 64, bottom: 205, display: "flex", justifyContent: "center",
          opacity: Math.min(interpolate(now, [subtitle.speechFromSec - 0.08, subtitle.speechFromSec + 0.08], [0, 1], clamp),
            interpolate(now, [subtitle.speechToSec, subtitle.speechToSec + 0.16], [1, 0], clamp)) }}>
          <div style={{ color: "#FFFDF8", fontSize: 48, fontWeight: 700, lineHeight: 1.25, textAlign: "center",
            padding: "18px 28px", borderRadius: 20, backgroundColor: "rgba(20,30,43,0.78)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>{subtitle.text}</div>
        </div> : null}
        {!visualOnly && MUSIC.map((m) => {
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
        {!visualOnly && SFX.map((s, i) => (
          <Sequence key={`sfx${i}`} name={`Эффект: ${s.src}`} from={Math.round(s.at * fps)} durationInFrames={s.dur ? Math.round(s.dur * fps) : undefined} premountFor={fps}>
            <Audio src={staticFile(s.src)} volume={s.volume} />
          </Sequence>
        ))}
        {!visualOnly && lines.map((l) =>
          l.file ? (
            <Sequence key={l.id} name={`Голос: ${l.id} (${l.role})`} from={Math.round(l.startSec * fps)} durationInFrames={Math.ceil(l.durationSec * fps) + 2} premountFor={fps}>
              <Audio src={staticFile(`${HH_VIDEO.voiceDir}/${l.file}`)} volume={VOICE_VOLUME} />
            </Sequence>
          ) : null,
        )}
      </AbsoluteFill>
    </HHContext.Provider>
    </HHRenderScaleContext.Provider>
  );
};
