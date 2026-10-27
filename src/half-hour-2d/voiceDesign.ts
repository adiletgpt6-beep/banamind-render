// Голоса с кыргызским произношением для BalaGoHalfHour2D: описание для
// ElevenLabs Voice Design (eleven_ttv_v3) и текст пробы на кыргызском.
// Стандартные голоса ElevenLabs — англоязычные дикторы, и в кыргызской
// речи у них слышен акцент. Здесь голос создаётся сразу как голос
// носителя кыргызского языка.
//
// Сын: детский голос Voice Design не создаёт (политика сервиса; запрос с
// упоминанием озвучки школьника заблокирован, обходить это не пытаемся).
// Мальчика озвучивает голос взрослой молодой женщины со светлым тембром —
// как обычно в анимации; в описании голоса ребёнок не упоминается.
//
// Файл без зависимостей от Remotion (читается scripts/hh2d-voice-design.mjs).
import type { Hh2Role } from "./script.ts";

export type Hh2DesignSpec = {
  readonly description: string;
  readonly text: string; // 100–1000 символов, кыргызский
};

const STUDIO = "Clear, close-mic studio recording, no background noise, natural conversational pace, not theatrical.";

export const HH2_DESIGN: Record<Hh2Role, Hh2DesignSpec> = {
  mother: {
    description: `A warm, gentle Kyrgyz woman in her mid-thirties from Bishkek, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Soft, caring, slightly tired mother's voice. ${STUDIO}`,
    text: "Уулумду мектептен алып келишим керек. Жарым саатка чыгып, кайра келем. Уулум, кечигип калдым. Сени көп күттүрүп койдум. Кечирип кой. Күн сайын же жумушка, же уулума кечигип жатам.",
  },
  son: {
    description: `A young Kyrgyz woman in her early twenties with a light, bright, clear voice, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Sincere, simple and soft. ${STUDIO}`,
    text: "Апа, сабак бүттү. Апа, эмнеге мени дайыма эң акырында алып кетесиң? Мен сени көпкө күттүм. Эртең эртерээк келесиңби? Макул, апа.",
  },
  husband: {
    description: `A calm, kind Kyrgyz man in his late thirties from Bishkek, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Low, warm, reassuring voice of a husband at home. ${STUDIO}`,
    text: "Кел, анын мектепке жолун алдын ала уюштуралы. Мына, БалаГо — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат. Тынчсызданба, бирге чечебиз.",
  },
  teacher: {
    description: `A friendly Kyrgyz schoolteacher, a woman in her forties, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Kind, calm and reassuring. ${STUDIO}`,
    text: "Апаң азыр келет. Мен сени менен чогуу күтүп турам. Бүгүн сабакта абдан жакшы иштедиң. Кел, бул жерге отура туралы.",
  },
  boss: {
    description: `A polite, calm Kyrgyz office manager, a man in his fifties, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Measured, friendly, understanding. ${STUDIO}`,
    text: "Макул, бара бериңиз. Балаңызды алып келиңиз, андан кийин ишти бүтүрөбүз. Эч кабатыр болбоңуз, түшүнөм.",
  },
  colleague: {
    description: `A young Kyrgyz office worker, a man in his late twenties, a native speaker of the Kyrgyz language with an authentic Kyrgyz accent. Friendly, casual, a bit hurried. ${STUDIO}`,
    text: "Айгерим, бир аз жардам берип коёсуңбу? Бул таблицаны бирге карап чыгалы. Көп убактыңды албайм, бир нече эле мүнөт.",
  },
};

// Выбранные варианты Voice Design: роль → generated_voice_id из
// voice-samples/half-hour-2d/design/report.json. Скрипт создаёт из них
// голоса в аккаунте ElevenLabs (один раз) и записывает voice_id в
// voice-samples/half-hour-2d/design/voices.json.
// Выбор — по распознаванию Meta MMS (asr-mms.json: меньше ошибок по буквам)
// и по тембру (основной тон): мама 2 (CER 1,8 %, тёплый), сын 1 (4,2 %,
// самый светлый, ≈286 Гц), муж 2 (2,2 %, низкий, ≈110 Гц), учительница 2
// (3,7 %), руководитель 2 (3,1 %), коллега 1 (9,2 % — лучший из трёх).
export const HH2_DESIGN_PICK: Partial<Record<Hh2Role, string>> = {
  mother: "5Xx0r0RX4XWEq5vEdv8p",
  son: "Oxj8oi9pAu19zqQOffmM",
  husband: "NVEGeFqcDqc5o29VoAQm",
  teacher: "EBOfpUWl9G5ltD2PkFgy",
  boss: "yCcjraKUNFsfIv02eS9D",
  colleague: "S87HaYymDP3SARzmBPgS",
};
