import { Audio } from "@remotion/media";
import {
  getStaticFiles,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { AUDIO, SFX_CUES } from "./config";
import {
  estimateManifest,
  segmentCue,
  speechIntervals,
  type NarrationManifest,
  type Timeline,
} from "./timeline";

// Загружает manifest.json дикторской дорожки (scripts/generate-voice.mjs).
// Если озвучки ещё нет — тайминги оцениваются по тексту, ролик собирается
// с музыкой и эффектами.
export const loadNarration = async (): Promise<NarrationManifest> => {
  const manifest = `${AUDIO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === manifest)) {
    return estimateManifest();
  }
  const res = await fetch(staticFile(manifest));
  if (res.status === 404) {
    return estimateManifest();
  }
  if (!res.ok) {
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  }
  const data = (await res.json()) as NarrationManifest;
  if (data.version !== 2 || !Array.isArray(data.segments)) {
    throw new Error(
      "Устаревший manifest озвучки. Пересоздайте её: npm run audio:voice.",
    );
  }
  return data;
};

// Громкость музыки: мягкое начало, приглушение под голосом, затухание в конце.
const musicVolumeAt = (
  frame: number,
  speech: [number, number][],
  durationInFrames: number,
  fps: number,
) => {
  let volume: number = AUDIO.musicVolume;
  for (const [start, end] of speech) {
    const v = interpolate(
      frame,
      [start - 8, start, end, end + 14],
      [
        AUDIO.musicVolume,
        AUDIO.musicVolumeUnderVoice,
        AUDIO.musicVolumeUnderVoice,
        AUDIO.musicVolume,
      ],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    volume = Math.min(volume, v);
  }
  const fade = interpolate(
    frame,
    [0, 0.4 * fps, durationInFrames - 1.4 * fps, durationInFrames - 2],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return volume * fade;
};

export const Soundtrack: React.FC<{ readonly timeline: Timeline }> = ({
  timeline,
}) => {
  const { fps } = useVideoConfig();
  const speech = speechIntervals(timeline, fps);
  const { file } = timeline.manifest;

  return (
    <>
      <Audio
        name="Музыка"
        src={staticFile(AUDIO.music)}
        volume={(f) => musicVolumeAt(f, speech, timeline.durationInFrames, fps)}
      />
      {SFX_CUES.map((cue) => {
        const scene = timeline.scenes.find((s) => s.id === cue.scene);
        if (!scene) return null;
        const at =
          scene.from +
          (cue.segment
            ? segmentCue(timeline, cue.scene, cue.segment, fps)
            : 0) +
          cue.offset;
        return (
          <Audio
            key={`${cue.sound}-${cue.scene}`}
            name={`Эффект: ${cue.sound}`}
            from={Math.max(0, at)}
            premountFor={fps}
            src={staticFile(AUDIO.sfx[cue.sound])}
            volume={cue.volume}
          />
        );
      })}
      {file ? (
        <Audio
          name="Голос"
          from={timeline.narrationFrom}
          premountFor={fps}
          src={staticFile(`${AUDIO.voiceDir}/${file}`)}
          volume={AUDIO.voiceVolume}
        />
      ) : null}
    </>
  );
};
