export type VoiceClip = {
  readonly id: string;
  readonly file: string;
  readonly startFrame: number;
  readonly durationSec: number;
};

// Между фразами оставляем 3 кадра. Если голос не помещается в ролик,
// останавливаем сборку с подсказкой: обрезанная озвучка не должна попадать в MP4.
export const scheduleVoiceClips = (
  clips: VoiceClip[],
  fps: number,
  durationInFrames: number,
): VoiceClip[] => {
  if (!Array.isArray(clips)) {
    throw new Error("Некорректный manifest озвучки: ожидается массив lines.");
  }
  for (const clip of clips) {
    if (
      !clip ||
      !Number.isInteger(clip.startFrame) ||
      clip.startFrame < 0 ||
      !Number.isFinite(clip.durationSec) ||
      clip.durationSec <= 0
    ) {
      throw new Error("Некорректные тайминги в manifest озвучки.");
    }
  }
  const sorted = [...clips].sort((a, b) => a.startFrame - b.startFrame);
  let prevEnd = -3;
  return sorted.map((clip) => {
    const startFrame = Math.max(clip.startFrame, prevEnd + 3);
    const endFrame = startFrame + Math.ceil(clip.durationSec * fps);
    if (endFrame > durationInFrames) {
      throw new Error(
        `Озвучка ${clip.id} заканчивается на кадре ${endFrame}, за пределами ролика (${durationInFrames}). Сократите текст VOICE_LINES.`,
      );
    }
    prevEnd = endFrame;
    return { ...clip, startFrame };
  });
};
