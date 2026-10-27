import { Audio } from "@remotion/media";
import {
  getStaticFiles,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { AUDIO, SFX_CUES, VIDEO } from "./config";
import { scheduleVoiceClips, type VoiceClip } from "./voice-timing";

export type { VoiceClip } from "./voice-timing";

// Загружает manifest.json озвучки (его создаёт scripts/generate-voice.mjs).
// Если озвучки ещё нет — возвращает пустой список, и ролик собирается
// с музыкой и эффектами.
export const loadVoiceClips = async (): Promise<VoiceClip[]> => {
  const manifest = `${AUDIO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === manifest)) {
    return [];
  }
  const res = await fetch(staticFile(manifest));
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) {
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  }
  const data = (await res.json()) as { lines: VoiceClip[] };
  return scheduleVoiceClips(data.lines, VIDEO.fps, VIDEO.durationInFrames);
};

// Громкость музыки в кадре: тише, пока звучит голос (плавно, за 6–10 кадров).
const musicVolumeAt = (frame: number, voice: VoiceClip[], fps: number) => {
  let volume: number = AUDIO.musicVolume;
  for (const clip of voice) {
    const start = clip.startFrame;
    const end = clip.startFrame + Math.ceil(clip.durationSec * fps);
    const v = interpolate(
      frame,
      [start - 8, start, end, end + 12],
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
  return volume;
};

export const Soundtrack: React.FC<{ readonly voice: VoiceClip[] }> = ({
  voice,
}) => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Audio
        name="Музыка"
        src={staticFile(AUDIO.music)}
        volume={(f) => musicVolumeAt(f, voice, fps)}
      />
      {SFX_CUES.map((cue) => (
        <Audio
          key={`${cue.sound}-${cue.frame}`}
          name={`Эффект: ${cue.sound}`}
          from={cue.frame}
          premountFor={fps}
          src={staticFile(AUDIO.sfx[cue.sound])}
          volume={cue.volume}
        />
      ))}
      {voice.map((clip) => (
        <Audio
          key={clip.id}
          name={`Голос: ${clip.id}`}
          from={clip.startFrame}
          premountFor={fps}
          src={staticFile(`${AUDIO.voiceDir}/${clip.file}`)}
          volume={AUDIO.voiceVolume}
        />
      ))}
    </>
  );
};
