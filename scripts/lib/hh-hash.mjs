// Хэш реплики BalaGoHalfHour: по нему кэш озвучки понимает, актуален ли файл.
import { createHash } from "node:crypto";
import { HH_TTS } from "../../src/half-hour/script.ts";

export const lineHash = (line, voiceId) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        v: 1,
        text: line.spoken ?? line.text,
        voiceId,
        modelId: HH_TTS.modelId,
        languageCode: HH_TTS.languageCode,
        voiceSettings: HH_TTS.voiceSettings,
        seed: HH_TTS.seed,
        // принятый дубль меняет хэш только у своей реплики
        ...(line.take ? { take: line.take } : {}),
      }),
    )
    .digest("hex")
    .slice(0, 16);
