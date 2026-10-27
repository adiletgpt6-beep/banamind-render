// Подбор голоса рассказчика BalaGoUnansweredLetter2D.
//
// Прежний рассказчик (KG-teacher) звучал напряжённо и «металлически» во
// вступлении. Новый голос подбирается так:
//   1. ElevenLabs Voice Design (eleven_ttv_v3) — по каждому описанию
//      несколько вариантов голоса носителя кыргызского языка, читающих
//      реплики рассказчика ролика (UL2_NARRATOR_DESIGN);
//   2. пробы контрольной фразы уже созданными голосами проекта
//      (UL2_AUDITION): KG-teacher с другими настройками, KG-boss и
//      KG-colleague (кандидат для коллеги);
//   3. все варианты распознаются Meta MMS (CER) и измеряются (F0, темп) в CI,
//      сэмплы и отчёт сохраняются в voice-samples/unanswered-letter-2d/;
//   4. выбранный вариант (UL2_NARRATOR_PICK) один раз сохраняется голосом
//      аккаунта → voice-samples/unanswered-letter-2d/design/voices.json.
// Сохранённые сэмплы и голоса повторно не синтезируются.
//
// Файл без зависимостей от Remotion (читается Node-скриптами).

const STUDIO =
  "Clear, close-mic studio recording, no background noise, relaxed natural breathing, unhurried storytelling pace with natural pauses, not theatrical.";

export const UL2_NARRATOR_TEXT =
  "Айжан бул сунушту эки жыл күткөн. Бирок катка үч күндөн бери жооп бере албай жүрөт. Кызын чоң апасына калтырып, кеңсеге кайтчу. Каттын жообу үч күн бүтпөй турду. Баарын жылдыруу мүмкүн эмес. Чоң апасына күн сайын шаар аралоо да оңой эмес.";

// Контрольная фраза первой итерации подбора (сэмплы уже сохранены).
export const UL2_CONTROL = "Айжан бул сунушту эки жыл күткөн. Бирок катка үч күндөн бери жооп бере албай жүрөт.";

export const UL2_NARRATOR_DESIGN: Record<string, { readonly description: string; readonly text: string }> = {
  // тёплая уверенная рассказчица среднего регистра (не низкий, не хриплый)
  narratorF: {
    description: `A warm, confident Kyrgyz woman narrator in her late thirties from Bishkek, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Clear mid-range voice, kind and calm, gently engaging, like a trusted friend telling a family story. Not deep, not husky, not breathy. ${STUDIO}`,
    text: UL2_NARRATOR_TEXT,
  },
  // спокойный тёплый рассказчик-мужчина (светлый баритон, без «баса»)
  narratorM: {
    description: `A warm, calm Kyrgyz man narrator in his early forties from Bishkek, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Clear, friendly light baritone, confident and kind, like a documentary storyteller for families. Not deep, not gravelly, not dramatic. ${STUDIO}`,
    text: UL2_NARRATOR_TEXT,
  },
};

// Пробы контрольной фразы готовыми голосами проекта (eleven_v3, ky).
// tag — аудиотег eleven_v3 перед текстом (не звучит).
export type Ul2Audition = {
  readonly id: string;
  readonly voiceName: string;
  readonly voiceId: string;
  readonly text: string;
  readonly tag?: string;
  readonly voiceSettings: { readonly stability: number; readonly similarity_boost: number };
};
export const UL2_AUDITION: readonly Ul2Audition[] = [
  { id: "teacher-natural", voiceName: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", text: UL2_CONTROL, voiceSettings: { stability: 0.5, similarity_boost: 0.8 } },
  { id: "teacher-robust", voiceName: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", text: UL2_CONTROL, voiceSettings: { stability: 1.0, similarity_boost: 0.8 } },
  { id: "boss-natural", voiceName: "KG-boss", voiceId: "yCcjraKUNFsfIv02eS9D", text: UL2_CONTROL, voiceSettings: { stability: 0.5, similarity_boost: 0.8 } },
  { id: "colleague-kg", voiceName: "KG-colleague", voiceId: "S87HaYymDP3SARzmBPgS", text: "Куттуктайм! Сен ушуну каалап жүргөн эмес белең?", voiceSettings: { stability: 0.5, similarity_boost: 0.8 } },
];

// Контрольные записи рассказчика (вторая итерация): начало и финальный
// призыв — по одному предложению, тем же голосом в трёх режимах подачи:
//   s05      — stability 0.5 (как реплики ролика);
//   s10      — stability 1.0 (ровнее, без скачков интонации);
//   s05warm  — stability 0.5 с тегом [warmly].
// Сравниваются разборчивость (MMS), темп, паузы и ровность тона; режим,
// выбранный для реплик, — UL2_NARRATOR_SETTINGS.
export const UL2_NARRATOR_CONTROL: readonly { readonly id: string; readonly text: string }[] = [
  { id: "intro1", text: "Айжан бул сунушту эки жыл күткөн." },
  { id: "intro2", text: "Бирок үч күндөн бери жооп бере элек." },
  { id: "cta1", text: "БалаГо — Бишкекте балдарды үйдөн мектепке жана мектептен үйгө жеткирүү кызматы." },
  { id: "cta2", text: "Профилдеги шилтемеге өтүңүз же Ватсапка жазыңыз." },
];
export const UL2_NARRATOR_MODES: Record<string, { readonly tag?: string; readonly voiceSettings: { readonly stability: number; readonly similarity_boost: number } }> = {
  s05: { voiceSettings: { stability: 0.5, similarity_boost: 0.8 } },
  s10: { voiceSettings: { stability: 1.0, similarity_boost: 0.8 } },
  s05warm: { tag: "[warmly]", voiceSettings: { stability: 0.5, similarity_boost: 0.8 } },
};

// Выбранный вариант Voice Design (generated_voice_id из
// voice-samples/unanswered-letter-2d/design/report.json).
// narratorF-2: тёплая уверенная рассказчица; лучшая разборчивость (MMS CER
// 0,4 % против 1,7–9 % у остальных вариантов и 3,7 % у прежнего KG-teacher),
// ровный тон без «надрыва» (F0 p10–p90 131–219 Гц, у KG-teacher 155–291 Гц),
// больше ясности в высоких частотах, естественные паузы между фразами.
// Отличается от голоса Айжан (KG-mother, ≈ 200–230 Гц).
export const UL2_NARRATOR_PICK: { readonly key: string; readonly generatedVoiceId: string } | null = {
  key: "narratorF",
  generatedVoiceId: "4YbRyZQGzRMFNw4Pz5QN",
};
