// Голос ElevenLabs. Кандидаты — готовые кыргызские голоса, уже проверенные
// в проекте (распознавание MMS CER 1,8–2,2 %). Выбор — после проб
// (tools/voice.mjs --samples); текущий: спокойный тёплый женский.
export const VOICES = {
  teacher: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  husband: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
} as const;

export const TTS = {
  voice: "teacher" as keyof typeof VOICES,
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 61,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  sampleText: "Кээде бир эле нерсе бүт образды өзгөртөт. Жумшак, жеңил жана ар бир деталы ойлонулган.",
} as const;
