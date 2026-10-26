// Голоса Lesson80_1_5 (русская озвучка). Без зависимостей от Remotion.
//
// Основной провайдер — OpenAI gpt-4o-mini-tts (подключённая интеграция
// проекта): у каждой роли свой голос и инструкция по манере речи; тайминги
// слов для губ — whisper-1. ElevenLabs из окружения сборки недоступен.
//
// Резерв (временная дорожка, помечается temporary: true) — локальные
// офлайн-движки: Piper (нейросетевой голос ru-irinia) и RHVoice (русские
// голоса из пакета rhvoice-russian). Они нужны, чтобы собрать и проверить
// монтаж, когда внешний синтез недоступен; финальный ролик требует
// основного провайдера. Темп и высота голоса не изменяются ни в одном
// провайдере: ни pitch-shift, ни ускорения.
import type { L815Role } from "./script.ts";

export type OpenAIVoice = {
  readonly provider: "openai";
  readonly model: "gpt-4o-mini-tts";
  readonly voice: string;
  readonly instructions: string;
};
export type PiperVoice = {
  readonly provider: "piper";
  readonly model: string; // имя модели в каталоге голосов (scripts/l815-voices/)
  readonly lengthScale?: number; // 1 — обычный темп (не ускорять)
  readonly noiseScale?: number;
  readonly noiseW?: number;
};
export type RhvoiceVoice = {
  readonly provider: "rhvoice";
  readonly voice: string;
  readonly rate?: number; // процент, 100 — обычный темп
};
export type ElevenVoice = {
  readonly provider: "elevenlabs";
  readonly model: "eleven_v3";
  readonly name: string;
  readonly voiceId: string;
  readonly tag?: string; // аудиотег интонации eleven_v3, не звучит
};
export type VoiceSpec = OpenAIVoice | PiperVoice | RhvoiceVoice | ElevenVoice;

// Хор (реплика 43): несколько детских голосов с небольшими сдвигами.
export type ChorusSpec = { readonly voices: readonly VoiceSpec[]; readonly offsetsMs: readonly number[]; readonly gains: readonly number[] };

export const L815_TTS = {
  openaiModel: "gpt-4o-mini-tts",
  transcribeModel: "whisper-1",
  seed: 815,
  sampleRate: 44100,
  // речь выравнивается к −17 дБFS RMS, пик ≤ −2,5 дБFS
  speechDb: -17,
} as const;

const RU = "Говорит по-русски, естественно, без акцента. Ровный темп, без спешки. Только текст реплики, без вступлений.";

// ---------- основной провайдер ----------
export const L815_OPENAI_VOICES: Record<Exclude<L815Role, "kids">, OpenAIVoice> = {
  teacher: {
    provider: "openai",
    model: "gpt-4o-mini-tts",
    voice: "onyx",
    instructions: `Взрослый мужчина 30–35 лет, спокойный доброжелательный преподаватель. Тёплая интонация, ясная дикция, умеренный темп. Не диктор рекламы и не проповедь. ${RU}`,
  },
  yusuf: {
    provider: "openai",
    model: "gpt-4o-mini-tts",
    voice: "coral",
    instructions: `Маленький мальчик четырёх лет. Высокий детский голос, короткие фразы, живое любопытство, без писка и без крика. ${RU}`,
  },
  amir: {
    provider: "openai",
    model: "gpt-4o-mini-tts",
    voice: "sage",
    instructions: `Мальчик восьми лет. Детский голос, немного увереннее и собраннее младшего, радость от своей работы слышна, но без крика. ${RU}`,
  },
  bilal: {
    provider: "openai",
    model: "gpt-4o-mini-tts",
    voice: "ash",
    instructions: `Мальчик одиннадцати лет. Юный, спокойный, рассуждающий голос; заметно моложе взрослого, но ниже и ровнее младших детей. ${RU}`,
  },
};

export const L815_OPENAI_CHORUS: ChorusSpec = {
  voices: [L815_OPENAI_VOICES.yusuf, L815_OPENAI_VOICES.amir, L815_OPENAI_VOICES.bilal],
  offsetsMs: [0, 60, 110],
  gains: [1, 0.9, 0.8],
};

// ---------- ElevenLabs (если задан ELEVENLABS_API_KEY) ----------
// Готовые голоса проекта (Voice Design, см. src/two-schedules-2d/script.ts):
// новые голоса не создаются. eleven_v3 многоязычный; русская речь этими
// голосами в облачном окружении не прослушана — проверьте пробы voice lab.
const EL = (name: string, voiceId: string, tag?: string): ElevenVoice => ({ provider: "elevenlabs", model: "eleven_v3", name, voiceId, tag });
export const L815_ELEVEN_VOICES: Record<Exclude<L815Role, "kids">, ElevenVoice> = {
  teacher: EL("KG-husband", "NVEGeFqcDqc5o29VoAQm", "[calm]"),
  yusuf: EL("KG-son", "Oxj8oi9pAu19zqQOffmM", "[curious]"),
  amir: EL("KG-daughter", "AeboPz5CtE7qRUVvW93b"),
  bilal: EL("KG-teacher", "EBOfpUWl9G5ltD2PkFgy", "[calm]"),
};
export const L815_ELEVEN_CHORUS: ChorusSpec = {
  voices: [L815_ELEVEN_VOICES.yusuf, L815_ELEVEN_VOICES.amir, L815_ELEVEN_VOICES.bilal],
  offsetsMs: [0, 60, 110],
  gains: [1, 0.9, 0.8],
};
export const L815_ELEVEN_TTS = { languageCode: "ru", voiceSettings: { stability: 0.5, similarity_boost: 0.8 }, seed: 815 } as const;

// ---------- резерв: локальные голоса (временная дорожка) ----------
// Значения выбираются voice lab (scripts/l815-voice-lab.mjs) по замерам
// высоты голоса и длительности; см. voice-samples/lesson-80-1-5/.
export const L815_LOCAL_VOICES: Record<Exclude<L815Role, "kids">, VoiceSpec> = {
  // взрослый мужской голос (≈ 142 Гц), лучший по качеству голос RHVoice
  teacher: { provider: "rhvoice", voice: "aleksandr-hq" },
  // самый высокий из доступных голосов (≈ 213 Гц) — младший
  yusuf: { provider: "rhvoice", voice: "anna" },
  // нейросетевой голос Piper (≈ 160–180 Гц), спокойнее и собраннее
  amir: { provider: "piper", model: "ru-irinia-medium" },
  // мягкий, неторопливый (≈ 185 Гц, ≈ 10 букв/с) — старший рассуждает
  bilal: { provider: "rhvoice", voice: "victoria" },
};

export const L815_LOCAL_CHORUS: ChorusSpec = {
  voices: [L815_LOCAL_VOICES.yusuf, L815_LOCAL_VOICES.amir, L815_LOCAL_VOICES.bilal, { provider: "rhvoice", voice: "elena" }],
  offsetsMs: [0, 60, 110, 150],
  gains: [1, 0.9, 0.8, 0.7],
};

export type Provider = "openai" | "elevenlabs" | "local";

export const voicesFor = (provider: Provider) =>
  provider === "openai"
    ? { roles: L815_OPENAI_VOICES, chorus: L815_OPENAI_CHORUS }
    : provider === "elevenlabs"
      ? { roles: L815_ELEVEN_VOICES, chorus: L815_ELEVEN_CHORUS }
      : { roles: L815_LOCAL_VOICES, chorus: L815_LOCAL_CHORUS };
