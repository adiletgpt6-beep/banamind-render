// Фильм №33 «Мама на старом видео» (композиция BalaGo33MomsOldVideo).
//
// Бишкек. Мама руководит проектами в компании и любит свою работу, но
// ежедневная поездка за сыном из школы прерывает её день — незаконченные
// задачи переходят на вечер. Сын находит старое видео, где мама танцует на
// сцене, и открывает в ней человека, которого раньше не знал. Родители
// оставляют предварительную заявку BalaGo, чтобы обсудить школьный маршрут
// (поездки ещё не начались), а мама записывается на пробное занятие в
// субботу. В конце папа снимает новую семейную запись: мама танцует с сыном.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки и тесты.

export const MOV_VIDEO = {
  id: "BalaGo33MomsOldVideo",
  output: "balago-33-moms-old-video",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/moms-old-video",
} as const;

// ---------- Сцены ----------
// Длительность каждой сцены подобрана по фактической озвучке (manifest.json):
// речь не ускоряется, сцены и паузы подстраиваются под неё.
export type MovSceneId =
  | "hook"
  | "workday"
  | "evening"
  | "remember"
  | "moves"
  | "wish"
  | "schedule"
  | "route"
  | "balago"
  | "pick"
  | "packing"
  | "studio"
  | "newVideo"
  | "cta";

const SCENE_LIST: readonly { readonly id: MovSceneId; readonly title: string; readonly dur: number }[] = [
  { id: "hook", title: "1. Бул чын эле сенсиңби?", dur: 8.8 },
  { id: "workday", title: "2. Апанын жумуш күнү", dur: 12.6 },
  { id: "evening", title: "3. Иштер кечке калат", dur: 11.4 },
  { id: "remember", title: "4. Апа эстейт", dur: 9.2 },
  { id: "moves", title: "5. Эки кыймыл", dur: 17.1 },
  { id: "wish", title: "6. Кайра бийлегиси келет", dur: 11.0 },
  { id: "schedule", title: "7. Кечки убакыт бош эмес", dur: 8.0 },
  { id: "route", title: "8. Мектеп жолу", dur: 10.4 },
  { id: "balago", title: "9. BalaGo менен таанышуу", dur: 8.2 },
  { id: "pick", title: "10. Биринчи кадам", dur: 6.4 },
  { id: "packing", title: "11. Уулу жардам берет", dur: 9.4 },
  { id: "studio", title: "12. Жаңы кыймыл", dur: 11.2 },
  { id: "newVideo", title: "13. Жаңы үй-бүлөлүк видео", dur: 8.8 },
  { id: "cta", title: "14. BalaGo финалы", dur: 23.4 },
];

export const MOV_SCENES: readonly {
  readonly id: MovSceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = (() => {
  let t = 0;
  return SCENE_LIST.map((s) => {
    const from = t;
    t = Math.round((t + s.dur) * 1000) / 1000;
    return { id: s.id, title: s.title, from, to: t };
  });
})();

export const MOV_DURATION = MOV_SCENES[MOV_SCENES.length - 1].to;
export const MOV_FRAMES = Math.round(MOV_DURATION * MOV_VIDEO.fps);

export const sceneById = (id: MovSceneId) => {
  const s = MOV_SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

// ---------- Голоса ----------
export type MovRole = "mother" | "father" | "son" | "narrator";

export const MOV_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 333,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design, проверены в
// 2D-роликах №10–12 замерами MMS). Новые голоса не создаются.
// Сын — светлый звонкий молодой голос (≈ 280–340 Гц) без механического
// повышения тона и ускорения речи; диктор — спокойный тёплый женский голос.
export const MOV_VOICES: Record<MovRole, { readonly name: string; readonly voiceId: string }> = {
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

// ---------- Реплики ----------
export type MovLine = {
  readonly id: string;
  readonly role: MovRole;
  readonly scene: MovSceneId;
  // Начало речи: секунды от начала своей сцены.
  readonly off: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly pick?: number; // взять ровно этот дубль (seed) после прослушивания/замера
  readonly subtitle?: false; // без субтитра (смех)
  readonly subTop?: true; // субтитр вверху кадра (внизу — ноги в танце)
  readonly volume?: number; // громкость в миксе (смех тише)
};

export const MOV_LINES: readonly MovLine[] = [
  // 1. Старое видео в телефоне сына
  // повторный синтез seed 344 дал «чүнделе» (CER 0,125) — снова три дубля
  { id: "s01", role: "son", scene: "hook", off: 3.9, text: "Апа, бул чын эле сенсиңби? Ушинтип бийлей аласыңбы?", tag: "[curious]", seed: 410 },
  // 2. Рабочий день мамы
  { id: "n01", role: "narrator", scene: "workday", off: 0.6, text: "Апасы компанияда долбоорлорду башкарат. Өз ишин жакшы көрөт.", tag: "[warmly]" },
  {
    id: "n02",
    role: "narrator",
    scene: "workday",
    off: 5.6,
    text: "Бирок сабактан кийин уулун үйгө алып келүү үчүн күн сайын ишин токтотуп, жолго чыгат.",
    tag: "[warmly]",
  },
  // 3. Задачи переходят на вечер
  { id: "n03", role: "narrator", scene: "evening", off: 0.5, text: "Калган иштерди кийин улантат. Кээде кечинде да ноутбугун ачууга туура келет.", tag: "[warmly]" },
  { id: "n04", role: "narrator", scene: "evening", off: 6.2, text: "Уулу апасын көбүнчө ушундай көрүп көнгөн.", tag: "[warmly]" },
  // 4. Мама вспоминает
  { id: "m01", role: "mother", scene: "remember", off: 3.6, text: "Мурда бир нече жыл бийге катышчумун.", tag: "[warmly]" },
  // с [excited] все дубли скомканы (15–17 букв/с, CER ≥ 0,5)
  { id: "s02", role: "son", scene: "remember", off: 6.7, text: "Азыр көрсөтүп берчи!", tag: "[happy]", seed: 420 },
  // 5. Два движения
  // короткая реакция сына на свою ошибку (дальше оба смеются без слов)
  { id: "s06", role: "son", scene: "moves", off: 9.0, text: "Ой!", tag: "[laughs]", volume: 0.85 },
  { id: "f01", role: "father", scene: "moves", off: 12.2, text: "Бул жерде репетиция болуп жатабы?", tag: "[playfully]" },
  { id: "s03", role: "son", scene: "moves", off: 14.6, text: "Апам сахнада бийлептир! Сен билчү белең?", tag: "[excited]" },
  // 6. Желание вернуться
  { id: "n05", role: "narrator", scene: "wish", off: 0.6, text: "Ошол кечте экөө эски видеону кайра көрүштү. Апасы бий студиясын, досторун эстеди.", tag: "[warmly]" },
  { id: "m02", role: "mother", scene: "wish", off: 7.4, text: "Кайра бийлеп көргүм келип жатат.", tag: "[softly]" },
  // 7. Вечер занят
  { id: "n06", role: "narrator", scene: "schedule", off: 0.6, text: "Кечки сабактар бар экен. Бирок дал ошол убакта апасы күндүз бүтпөй калган ишин бүтүрөт.", tag: "[warmly]" },
  // 8. Школьный маршрут
  // «няня» → «бала багуучу»: заимствование звучало неразборчиво во всех дублях
  { id: "n07", role: "narrator", scene: "route", off: 0.6, text: "Үйдө уулун бала багуучу күтүп ала алат.", tag: "[warmly]" },
  { id: "n08", role: "narrator", scene: "route", off: 3.8, text: "Мектептен үйгө чейинки жолду болсо ата-энеси өздөрү уюштуруп жүрүшөт.", tag: "[warmly]" },
  // 9. Знакомство с BalaGo
  {
    id: "n09",
    role: "narrator",
    scene: "balago",
    off: 0.6,
    text: "Экөө BalaGo кызматын таап, каттамды сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    spoken: "Экөө Балаго кызматын таап, каттамды сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    tag: "[warmly]",
  },
  // 10. Первый доступный шаг
  { id: "n10", role: "narrator", scene: "pick", off: 0.5, text: "Апасы болсо алгач ишембидеги сыноо сабагын тандады.", tag: "[warmly]" },
  // 11. Сын помогает
  { id: "n11", role: "narrator", scene: "packing", off: 0.6, text: "Ишембиде уулу апасынын сумкасын чогултууга жардам берди.", tag: "[warmly]" },
  { id: "s04", role: "son", scene: "packing", off: 5.2, text: "Кийин үйрөнгөнүңдү мага көрсөтөсүңбү?", tag: "[curious]" },
  // 12. Новое движение
  { id: "s05", role: "son", scene: "studio", off: 6.6, text: "Токтой тур. Муну да тартып коюш керек!", tag: "[excited]" },
  // 14. Финал BalaGo
  {
    id: "n12",
    role: "narrator",
    scene: "cta",
    off: 1.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Үйдөн мектепке жеткирип, сабактан кийин кайра үйгө алып келебиз.",
    // точка после названия: «Балаго» звучит отчётливо, не сливаясь со следующим словом
    spoken: "Балаго. Бишкектеги балдар үчүн такси. Үйдөн мектепке жеткирип, сабактан кийин кайра үйгө алып келебиз.",
    tag: "[warmly]",
  },
  {
    // призыв и слоган — одним запросом: отдельно короткий слоган шесть раз
    // звучал скомканно для распознавания (CER ≥ 0,24)
    id: "n13",
    role: "narrator",
    scene: "cta",
    off: 9.0,
    // по просьбе заказчика: ссылка в шапке профиля или WhatsApp с номером.
    // Номер читается так, как его диктуют в Бишкеке, группами, как на
    // экране; в субтитре номер — неразрывными пробелами (не делится).
    text: "Профилдин башындагы шилтемеге өтүңүз же WhatsApp аркылуу жазыңыз: 0998\u00A008\u00A038\u00A028. BalaGo менен жолго чыгалы!",
    spoken: "Профилдин башындагы шилтемеге өтүңүз же Ватсап аркылуу жазыңыз: нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз. Балаго менен жолго чыгалы!",
    tag: "[warmly]",
    seed: 480,
  },
];

// Пауза между репликами (с): обычно ≥ 0,3; для отмеченных — больше
// (дыхание между собеседниками, живая пауза перед ответом).
export const MOV_MIN_GAP: Readonly<Record<string, number>> = { s02: 0.5, f01: 0.4, s03: 0.45, m02: 0.7, s04: 0.5 };
// Реплики, которым разрешено накладываться друг на друга (сейчас таких нет).
export const MOV_OVERLAP_OK: ReadonlySet<string> = new Set<string>();

// Последнее слово звучит не позже, чем за 3 с до конца (финальная карточка
// держится для чтения).
export const MOV_SPEECH_END = MOV_DURATION - 3;

export const lineById = (id: string) => {
  const l = MOV_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// Абсолютное начало речи реплики (с).
export const lineAt = (l: MovLine) => sceneById(l.scene).from + l.off;

// ---------- Экранные надписи (кыргызча) ----------
export const MOV_TEXT = {
  hookAccent: "Бул сенсиңби?",
  oldVideoYear: "2014",
  gallery: { title: "Сүрөттөр", album: "Видеолор", duration: "0:48" },
  office: {
    screenTitle: "Долбоордун планы",
    columns: ["Даярдоо", "Иштеп чыгуу", "Текшерүү"],
    progress: "Апта 3 / 6",
  },
  laptop: {
    title: "Долбоордун отчёту",
    task: "Бүгүн бүтүрүү керек",
    progress: "3 / 5",
  },
  schedule: {
    title: "Бий студиясы",
    rows: [
      { name: "Кечки топ", when: "Шейшемби, бейшемби", time: "19:00" },
      { name: "Сыноо сабагы", when: "Ишемби", time: "" },
    ],
    conflictWork: "Бүтпөгөн иш",
    hours: ["18:00", "19:00", "20:00", "21:00"],
  },
  route: { school: "МЕКТЕП", home: "ҮЙ", nanny: "Бала багуучу", question: "?" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
  },
  form: {
    title: "Алдын ала өтүнмө",
    fields: [
      ["Шаар", "Бишкек"],
      ["Маршрут", "Үй → Мектеп → Үй"],
      ["Бала", "1 бала, 8 жаш"],
      ["Эскертүү", "Каттамды сүйлөшөлү"],
    ],
    send: "Өтүнмө калтыруу",
    sent: "Алдын ала өтүнмө калтырылды",
    note: "Каттамды сүйлөшүү үчүн",
  },
  saturday: "Ишемби",
  rec: "00:12",
  memory: "Жаңы видео. Жаңы эскерүү.",
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    button: "Баланы каттоо",
    link: "Шилтеме — профилдин башында",
    // WhatsApp владельца (как FOUNDER_CONTACT в config.ts) — по просьбе заказчика
    phone: "0998 08 38 28",
  },
} as const;
