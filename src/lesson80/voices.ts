// Голоса 80-1-14 (ElevenLabs eleven_v3, русский). Подбор — CI-лаборатория
// scripts/lesson80/voice-lab.mjs (замеры MMS «rus»: CER и медиана F0) на
// фразах «Вода такая обычная…» и «Да. В Коране говорится…».
//
// Voice Design ElevenLabs отклоняет описания детских голосов (правила
// безопасности сервиса), поэтому детей, как принято в анимации, озвучивают
// светлые высокие голоса без искусственного сдвига тона и темпа:
// Юсуф — самый высокий и звонкий, Амир — ниже, Билал — спокойнее и ниже всех.
export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 140,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

export const L80_VOICES = {
  // голос проекта (2D №10), ≈286 Гц, CER 0 %
  yusuf: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  // голос проекта (2D №11), без тегов ≈242–258 Гц на всех репликах —
  // самый ровный из пяти проверенных (scripts/lesson80/voice-lab-amir.mjs)
  amir: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
  // ≈200 Гц, CER 0 %
  bilal: { name: "River", voiceId: "SAz9YHcvj6GT2YYXdXww" },
  // спокойный низкий голос проекта (2D №10), ≈111 Гц, CER 0 %
  teacher: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
} as const;
