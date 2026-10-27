// Хэш реплики седьмого ролика: если не изменились текст, тег, голос,
// модель, настройки и seed — сохранённый файл используется повторно
// (без запроса к ElevenLabs).
import { createHash } from "node:crypto";
import { MS_TTS } from "../../src/morning-story/script.ts";

export const lineHash = (line, voiceId) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        v: 1,
        text: line.spoken ?? line.text,
        tag: line.tag ?? null,
        voiceId,
        modelId: MS_TTS.modelId,
        languageCode: MS_TTS.languageCode,
        voiceSettings: MS_TTS.voiceSettings,
        seed: MS_TTS.seed,
      }),
    )
    .digest("hex")
    .slice(0, 16);
