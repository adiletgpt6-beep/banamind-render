// Одиннадцатый ролик в 2D: «Бүгүн алмаштыра турган киши жок»
// («Сегодня некому подменить», композиция BalaGoNoBackup2D, ровно 120 с).
//
// Папа обычно отвозит дочку в школу по дороге на работу, но сегодня его
// вызывают на час раньше. Бабушка идёт к врачу, брат после ночной смены,
// подруга на другом конце города — никто не виноват. Мама сама отвозит
// дочку и опаздывает на работу. Вечером родители оставляют предварительную
// заявку BalaGo (только предварительная регистрация: без цен, гарантий,
// контактов и подтверждённых поездок).
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const NB2_VIDEO = {
  id: "BalaGoNoBackup2D",
  output: "balago-no-backup-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  voiceDir: "audio/no-backup-2d",
} as const;

export const NB2_FRAMES = NB2_VIDEO.durationSec * NB2_VIDEO.fps;

// ---------- Сцены (фиксированная шкала, секунды) ----------
// Монтаж построен по фактической длительности записанных реплик: короткие
// естественные паузы, середина (дорога, школа, офис) с живыми репликами.
export type Nb2SceneId = "prologue" | "search" | "reassure" | "drive" | "school" | "evening" | "decision" | "cta";
export const NB2_SCENES = [
  { id: "prologue", title: "Кечинде: план өзгөрдү", from: 0, to: 12.6 },
  { id: "search", title: "Үч чалуу", from: 12.6, to: 46.45 },
  { id: "reassure", title: "Кызын тынчтандыруу", from: 46.45, to: 52.6 },
  { id: "drive", title: "Эртеси апасы жеткирет", from: 52.6, to: 74.5 },
  { id: "school", title: "Мектеп жана жумуш", from: 74.5, to: 93.5 },
  { id: "evening", title: "Күндүн жыйынтыгы", from: 93.5, to: 103 },
  { id: "decision", title: "Алдын ала уюштуруу", from: 103, to: 115 },
  { id: "cta", title: "BalaGo · WhatsApp", from: 115, to: 120 },
] as const;

// ---------- Голоса ----------
export type Nb2Role = "mother" | "father" | "daughter" | "grandmother" | "brother" | "friend" | "colleague";

export const NB2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 111,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Голоса создаются ElevenLabs Voice Design как голоса носителей
// кыргызского языка (стандартные англоязычные голоса дают акцент).
// Детская роль — актёрское исполнение с естественно светлым тембром.
// Высота и скорость звука не изменяются механически.
const STUDIO =
  "Clear close-mic studio recording, no background noise, natural relaxed conversational pace, not theatrical, not announcer-like.";

// Голос актрисы для дочки уже доступен в проекте. Используем его
// напрямую; новый Voice Design для этой роли не запрашивается.
// Коллега читает сообщение за кадром сохранённым кыргызским голосом
// KG-teacher из ролика №10 (спокойный деловой женский голос, отличается
// от голоса мамы); новый Voice Design для одной реплики не создаётся.
export const NB2_EXISTING_VOICES: Partial<Record<Nb2Role, { readonly voiceId: string; readonly source: string }>> = {
  daughter: { voiceId: "gtJEwH1YEkKKie4gBpH7", source: "Сохранённый голос актрисы BalaGo NB2 daughter" },
  colleague: { voiceId: "EBOfpUWl9G5ltD2PkFgy", source: "Сохранённый голос KG-teacher (half-hour-2d)" },
};

export const NB2_DESIGN: Record<Exclude<Nb2Role, "daughter" | "colleague">, { readonly description: string; readonly text: string }> = {
  mother: {
    description: `A warm, calm Kyrgyz woman in her early thirties from Bishkek, a native speaker of the Kyrgyz language with authentic Kyrgyz pronunciation. Warm intimate everyday dialogue, gently lower medium register, varied sentence rhythm, soft breath and clear endings, never reciting. A caring mother speaking to her own family. ${STUDIO}`,
    text: "Макул, бирөөнөн сурап көрөйүн. Жүр, кызым. Өзүм жеткирип коём. Бир аз кечигем. Кызымды мектепке жеткирип жатам. Албетте барасың, кызым. Мектепке алып барып, кайра үйгө жеткиреби?",
  },
  father: {
    description: `A calm, kind Kyrgyz man in his mid-thirties from Bishkek, a native speaker of the Kyrgyz language with authentic Kyrgyz pronunciation. Warm, low and supportive voice, slightly concerned. ${STUDIO}`,
    text: "Мени жумушка бир саат эрте чакырып калышты. Кечирип кой, бүгүн жардам бере албайм. БалаГо кызматына алдын ала катталсакчы? Ооба, үйдөн мектепке, мектептен үйгө.",
  },
  grandmother: {
    description: `A Kyrgyz woman in her late fifties from Bishkek, native Kyrgyz pronunciation, a warm mature lower female voice, gentle concern and clear everyday speech. ${STUDIO}`,
    text: "Кызым, эртең менен дарыгерге жазылгам. Болбосо жардам берет элем. Айзадага салам айт. Үйгө келгенде чогуу чай ичебиз.",
  },
  brother: {
    description: `A Kyrgyz man in his late twenties, native Kyrgyz pronunciation, an easygoing medium male voice, explaining his night shift kindly and practically. ${STUDIO}`,
    text: "Бүгүн түнкү нөөмөттөмүн. Эртең менен жетише албайм. Кечинде бош болсом, силерге кирип кетем. Айзада сабактарына даярданып жатабы?",
  },
  friend: {
    description: `A Kyrgyz woman in her early thirties, native Kyrgyz pronunciation, an open friendly bright female voice, conversational and willing to help, distinct from the mother. ${STUDIO}`,
    text: "Болот, бирок бизге алып келишиң керек. Биз башка тараптабыз. Эртең менен жолго эртерээк чыгабыз. Кечинде сүйлөшөбүз.",
  },
};

// Высота основного тона, по которой выбирается вариант Voice Design
// (вместе с разборчивостью MMS): мама — средний, папа — низкий,
// дочка — естественно светлый голос, не максимальная высота.
export const NB2_PITCH: Record<Nb2Role, { readonly min: number; readonly max: number; readonly prefer: "low" | "mid" | "high" }> = {
  mother: { min: 160, max: 260, prefer: "mid" },
  father: { min: 70, max: 170, prefer: "low" },
  daughter: { min: 200, max: 380, prefer: "mid" },
  grandmother: { min: 130, max: 220, prefer: "mid" },
  brother: { min: 110, max: 210, prefer: "mid" },
  friend: { min: 170, max: 280, prefer: "mid" },
  colleague: { min: 150, max: 260, prefer: "mid" },
};

// ---------- Реплики ----------
export type Nb2Line = {
  readonly id: string;
  readonly role: Nb2Role;
  readonly scene: Nb2SceneId;
  // Момент начала речи (секунды от начала ролика).
  readonly at: number;
  readonly text: string; // как в сценарии (проверка, экран)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly seed?: number; // свой seed, чтобы перегенерировать только эту реплику
  // Перезапись: прежний дубль измеряется для сравнения, но остаётся в
  // ролике, только если все новые дубли заметно хуже (CER + 0,05).
  readonly retake?: boolean;
  // Без субтитра: текст уже виден на экране (сообщение коллеги).
  readonly noSubtitle?: boolean;
  // Ручное деление субтитра на смысловые фрагменты (вместе — точный text).
  readonly subtitle?: readonly string[];
};

export const NB2_LINES: readonly Nb2Line[] = [
  { id: "f_intro", role: "father", scene: "prologue", at: 2.1, text: "Эртең жумушка бир саат эрте барышым керек." },
  { id: "m_plan", role: "mother", scene: "prologue", at: 4.8, text: "Анда Айзаданы ким жеткирет?" },
  // папа предлагает позвонить близким — участие в общей задаче
  { id: "f_suggest", role: "father", scene: "prologue", at: 7.2, text: "Балким, жакындарыбыздын бирине чалып көрөсүңбү?" },
  // первая запись смазывала «чалып көрөйүн» (CER 0,26) — перезапись с паузой
  { id: "m_call", role: "mother", scene: "prologue", at: 10.25, text: "Макул, чалып көрөйүн.", spoken: "Макул. Чалып көрөйүн.", seed: 151, retake: true },
  { id: "m_grandma", role: "mother", scene: "search", at: 14.05, text: "Апа, эртең Айзаданы мектепке жеткирип коё аласызбы?" },
  { id: "g01", role: "grandmother", scene: "search", at: 17.75, text: "Кызым, эртең менен дарыгерге жазылгам." },
  { id: "m_brother", role: "mother", scene: "search", at: 23.05, text: "Нурбек, эртең Айзаданы мектепке жеткирип коё аласыңбы?" },
  // первая запись — вторая фраза за 1 с; перезапись спокойнее, с паузой
  { id: "b01", role: "brother", scene: "search", at: 26.6, text: "Бүгүн түнкү жумуштамын. Эртең менен жетише албайм.", spoken: "Бүгүн түнкү жумуштамын... Эртең менен, жетише албайм.", seed: 151, retake: true },
  { id: "m_friend", role: "mother", scene: "search", at: 32.75, text: "Айгүл, эртең кызымды мектепке жеткирип коё аласыңбы?" },
  // подруга может отвезти утром, только если ребёнка привезут к ней сегодня вечером
  { id: "a01", role: "friend", scene: "search", at: 36.25, text: "Ооба, бирок бүгүн кечинде биздин үйгө алып келип беришиң керек.", subtitle: ["Ооба, бирок бүгүн кечинде", "биздин үйгө алып келип беришиң керек."] },
  { id: "m_friend2", role: "mother", scene: "search", at: 40.4, text: "Ии, мен анте албайм. Силер алыссыңар да. Макул, башка айласын табайын." },
  { id: "d02", role: "daughter", scene: "reassure", at: 47.7, text: "Апа, эртең мектепке барамбы?" },
  { id: "m04", role: "mother", scene: "reassure", at: 49.9, text: "Албетте барасың, кызым." },
  { id: "m03", role: "mother", scene: "drive", at: 53.1, text: "Кечирим сурайм, бир аз кечигип калам. Кызымды мектепке жеткирем." },
  { id: "m02", role: "mother", scene: "drive", at: 57.6, text: "Жүр, кызым. Өзүм жеткирип коём.", seed: 133 },
  { id: "d_car", role: "daughter", scene: "drive", at: 67.87, text: "Апа, мектепке жетишебизби?" },
  { id: "m_car", role: "mother", scene: "drive", at: 69.93, text: "Жетишебиз, кызым. Шашпай барабыз." },
  { id: "m_bye", role: "mother", scene: "school", at: 76.57, text: "Сабагың жакшы өтсүн, кызым." },
  // сообщение читает голос коллеги за кадром; на экране — «8:00», вслух — «сегизде»
  { id: "c_msg", role: "colleague", scene: "school", at: 83.83, text: "Жыйналыш саат сегизде. Качан келесиң?", noSubtitle: true },
  { id: "m_office", role: "mother", scene: "school", at: 89.3, text: "Кечиресиздер, кечигип калдым." },
  { id: "m_recap", role: "mother", scene: "evening", at: 94.2, text: "Бүгүн кызымды мектепке жеткирип, жумушка кечиктим." },
  { id: "f_support", role: "father", scene: "evening", at: 97.7, text: "Сенин жумушуң да маанилүү." },
  { id: "f_recap", role: "father", scene: "evening", at: 99.8, text: "Күн сайын жардам сурабай, алдын ала уюштуралы." },
  { id: "f02", role: "father", scene: "decision", at: 103.5, text: "BalaGo кызматына алдын ала катталсакчы?", spoken: "БалаГо кызматына алдын ала катталсакчы?" },
  { id: "m05", role: "mother", scene: "decision", at: 106.0, text: "Мектепке алып барып, кайра үйгө жеткиреби?" },
  { id: "f03", role: "father", scene: "decision", at: 108.8, text: "Ооба, үйдөн мектепке, мектептен үйгө." },
  // на карточке уже крупно «WhatsApp · Алдын ала катталуу үчүн жазыңыз» — без дублирующего субтитра
  { id: "m_cta", role: "mother", scene: "cta", at: 115.15, text: "BalaGo. WhatsApp же профилдеги шилтеме аркылуу катталыңыз.", spoken: "БалаГо. Ватсап же профилдеги шилтеме аркылуу катталыңыз.", noSubtitle: true },
];

// Звонок — последовательность реплик (мама просит, собеседник отвечает,
// у подруги — ещё заключительный ответ мамы). Телефон у уха и экран
// собеседника держатся, пока звучит последняя реплика звонка.
export const NB2_CALLS = [
  { from: 12.6, to: 21.6, contact: "Апам", title: "Апама чалуу", role: "grandmother", look: "grandma", lines: ["m_grandma", "g01"], detail: "Дарыгерге · 08:00" },
  { from: 21.6, to: 31.3, contact: "Нурбек", title: "Нурбекке чалуу", role: "brother", look: "brother", lines: ["m_brother", "b01"], detail: "Түнкү жумуш" },
  { from: 31.3, to: 46.45, contact: "Айгүл", title: "Айгүлгө чалуу", role: "friend", look: "friend", lines: ["m_friend", "a01", "m_friend2"], detail: "Шаардын башка тарабы" },
] as const;
export type Nb2Call = (typeof NB2_CALLS)[number];
export const callRequest = (c: Nb2Call) => c.lines[0];
export const callResponse = (c: Nb2Call) => c.lines[1];

// Последняя фраза звучит на финальной карточке и заканчивается с запасом
// для музыкального завершения.
export const NB2_DIALOG_END = 119.3;

export const lineById = (id: string) => {
  const l = NB2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const NB2_TEXT = {
  daughterName: "Айзада",
  // Сообщение папе с работы вечером накануне.
  work: { from: "Жетекчи", time: "19:40", body: "Эртең саат 7:30да келиңиз." },
  calls: NB2_CALLS.map(({ contact, detail }) => ({ contact, detail })),
  nextMorning: "Эртеси эртең менен",
  colleague: "Жыйналыш саат 8:00дө. Качан келесиң?",
  colleagueFrom: "Кесиптешим",
  // утренний звонок на работу: контакт на экране телефона у уха
  call: { contact: "Жумуш", status: "Сүйлөшүү" },
  school: "№ 12 мектеп-гимназия",
  office: "Кеңсе",
  meeting: "Жыйналыш\n08:00",
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    status: "Алдын ала каттоо жүрүп жатат",
    trip: ["Эртең менен", "Сабактан кийин"],
    button: "Баланы каттоо",
  },
  form: {
    title: "Алдын ала каттоо",
    fields: [
      ["Баланын аты", "Айзада"],
      ["Мектеп", "№ 12 мектеп-гимназия"],
      ["Маршрут", "Үй → Мектеп → Үй"],
      ["Сабак башталат", "08:00"],
    ],
    send: "Арызды жөнөтүү",
    sent: "Арыз жөнөтүлдү",
    contact: "Алдын ала каттоо",
  },
  // Финальная карточка (только в последние 5 с): WhatsApp и ссылка в шапке
  // профиля.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    channel: "WhatsApp",
    phone: "0998 08 38 28",
    invite: "Алдын ала катталуу үчүн жазыңыз",
    or: "же",
    link: "Профилдин башындагы шилтеме",
    linkNote: "аркылуу катталыңыз",
  },
} as const;
