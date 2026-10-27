import { Audio } from "@remotion/media";
import {
  getStaticFiles,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { AUDIO, SFX_CUES, type SceneId, type SfxCue } from "./config";
import {
  estimateManifest,
  segmentCue,
  wordCue,
  speechIntervals,
  type NarrationManifest,
  type Timeline,
} from "./timeline";

// Загружает manifest.json дикторской дорожки (scripts/generate-voice.mjs).
// Если озвучки ещё нет — тайминги оцениваются по тексту, ролик собирается
// с музыкой и эффектами.
export const loadNarration = async (
  voiceDir: string = AUDIO.voiceDir,
  narration?: { segments: readonly { id: string; text: string }[] },
): Promise<NarrationManifest> => {
  const manifest = `${voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === manifest)) {
    return estimateManifest(narration);
  }
  const res = await fetch(staticFile(manifest));
  if (res.status === 404) {
    return estimateManifest(narration);
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

// Музыка ролика: одна дорожка (по умолчанию) или основа + ритмичный слой,
// который плавно уходит к началу сцены rhythmOutScene.
export type MusicSpec = {
  readonly base: string;
  readonly rhythm?: string;
  readonly rhythmOutScene?: SceneId;
  // Дополнительные слои: звучат от начала сцены from до начала сцены to
  // (или до конца ролика) с мягким появлением и затуханием.
  readonly layers?: readonly {
    readonly src: string;
    readonly from: SceneId;
    readonly to?: SceneId;
  }[];
};

export const Soundtrack: React.FC<{
  readonly timeline: Timeline;
  readonly voiceDir?: string;
  readonly sfxCues?: SfxCue[];
  readonly music?: MusicSpec;
}> = ({
  timeline,
  voiceDir = AUDIO.voiceDir,
  sfxCues = SFX_CUES,
  music = { base: AUDIO.music },
}) => {
  const { fps } = useVideoConfig();
  const speech = speechIntervals(timeline, fps);
  const { file } = timeline.manifest;
  const rhythmOut =
    timeline.scenes.find((s) => s.id === music.rhythmOutScene)?.from ??
    timeline.durationInFrames;

  return (
    <>
      <Audio
        name="Музыка"
        src={staticFile(music.base)}
        volume={(f) => musicVolumeAt(f, speech, timeline.durationInFrames, fps)}
      />
      {music.rhythm ? (
        <Audio
          name="Музыка: ритм"
          src={staticFile(music.rhythm)}
          volume={(f) =>
            musicVolumeAt(f, speech, timeline.durationInFrames, fps) *
            interpolate(
              f,
              [rhythmOut - 0.4 * fps, rhythmOut + 1.2 * fps],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
      {(music.layers ?? []).map((layer) => {
        const sceneFrom = (id?: SceneId) =>
          timeline.scenes.find((sc) => sc.id === id)?.from;
        const start = sceneFrom(layer.from) ?? 0;
        const end = sceneFrom(layer.to) ?? timeline.durationInFrames + fps;
        return (
          <Audio
            key={layer.src}
            name={`Музыка: ${layer.src}`}
            src={staticFile(layer.src)}
            volume={(f) =>
              musicVolumeAt(f, speech, timeline.durationInFrames, fps) *
              interpolate(
                f,
                [
                  start - 0.5 * fps,
                  start + 0.8 * fps,
                  end - 0.4 * fps,
                  end + 1.2 * fps,
                ],
                [start <= 0 ? 1 : 0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            }
          />
        );
      })}
      {sfxCues.map((cue) => {
        const scene = timeline.scenes.find((s) => s.id === cue.scene);
        if (!scene) return null;
        const at =
          scene.from +
          (cue.word
            ? wordCue(timeline, cue.scene, cue.word, 0, 0, fps)
            : cue.segment
              ? segmentCue(timeline, cue.scene, cue.segment, fps)
              : 0) +
          cue.offset;
        return (
          <Audio
            key={`${cue.sound}-${cue.scene}-${cue.word ?? cue.segment ?? ""}`}
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
          src={staticFile(`${voiceDir}/${file}`)}
          volume={AUDIO.voiceVolume}
        />
      ) : null}
    </>
  );
};
