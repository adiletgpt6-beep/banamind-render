// Синтез реплик Lesson80_1_7 (ElevenLabs eleven_v3, русский) — экземпляр
// общей фабрики scripts/lib/l80-tts-core.mjs с параметрами фильма 80-1-7.
import { FILM, L80_TTS } from "../../src/lesson80/film-1-7/script.ts";
import { createL80Tts } from "./l80-tts-core.mjs";

export const { lineSeed, l80Hash, synthLine, finish, rmsDb } = createL80Tts({ FILM, L80_TTS });
