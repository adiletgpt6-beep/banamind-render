// Ролик BalaGoInvitationWithoutName2D — «Аты жок чакыруу» («Приглашение без
// имени»), сценарий №24.
//
// Учительница говорит папе: сын очень хотел, чтобы он пришёл на школьный
// день профессий. Папа ничего не знал: приглашение неделю лежало в рюкзаке,
// строка для имени гостя пустая. Дома мама находит лист; папа садится рядом
// с Эмиром и спрашивает, почему тот не отдал приглашение. Сын объясняет:
// папа и так каждый день уходит с работы, чтобы забрать его, и возвращается
// обратно — просить ещё раз казалось слишком. Папа молча вписывает своё имя
// «Азамат» и спрашивает, что они покажут классу. Вечером — бумажный мост:
// плоский лист прогибается, сложенный выдерживает игрушечную машинку. В
// классе опыт удаётся. Вечером родители сами находят BalaGo и оставляют
// предварительную заявку (без водителя, оплаты и подтверждённого маршрута).
// Перед сном приглашение с именем и фото из класса висят над столом сына.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const IW2_VIDEO = {
  id: "BalaGoInvitationWithoutName2D",
  output: "balago-invitation-without-name-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/invitation-without-name-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика.
export const IW2_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type Iw2SceneId =
  | "hook"
  | "blank"
  | "careers"
  | "proud"
  | "route"
  | "backpack"
  | "ask"
  | "why"
  | "name"
  | "idea"
  | "test"
  | "list"
  | "class"
  | "demo"
  | "photo"
  | "parents"
  | "balago"
  | "bedtime"
  | "contact";

// tail — время после конца последней реплики (действие, реакция, переход);
// min — нижняя граница длительности сцены. Сцена без речи имеет длину min.
export type Iw2SceneSpec = {
  readonly id: Iw2SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const IW2_SCENE_SPECS: readonly Iw2SceneSpec[] = [
  { id: "hook", title: "1. Күтүлбөгөн сөз", tail: 1.5, min: 6.5 },
  { id: "blank", title: "2. Бош сап", tail: 1.6, min: 8 },
  { id: "careers", title: "3. Кесиптер күнү", tail: 1.1, min: 6 },
  { id: "proud", title: "4. Атасы — инженер", tail: 1.7, min: 9 },
  { id: "route", title: "5. Күнүмдүк жол", tail: 1.4, min: 7 },
  { id: "backpack", title: "6. Апасы кагазды тапты", tail: 2.6, min: 7 },
  { id: "ask", title: "7. Бир деңгээлде", tail: 1.0, min: 9 },
  { id: "why", title: "8. Эмне үчүн сурабады", tail: 0.5, min: 11 },
  { id: "name", title: "9. Ысым жазылды", tail: 0, min: 7.2 },
  { id: "idea", title: "10. Көпүрө", tail: 1.6, min: 7 },
  { id: "test", title: "11. Эки тажрыйба", tail: 4.4, min: 13.4 },
  { id: "list", title: "12. Тизме", tail: 0, min: 4.5 },
  { id: "class", title: "13. Атасы келди", tail: 1.4, min: 10 },
  { id: "demo", title: "14. Класста сыноо", tail: 1.8, min: 9 },
  { id: "photo", title: "15. Эстелик сүрөт", tail: 0, min: 3.6 },
  { id: "parents", title: "16. Ата-эне кеңешет", tail: 2.3, min: 11 },
  { id: "balago", title: "17. BalaGo: алдын ала өтүнмө", tail: 2.4, min: 9 },
  { id: "bedtime", title: "18. Аты жазылган чакыруу", tail: 3.4, min: 10 },
  { id: "contact", title: "19. Байланыш", tail: 0, min: IW2_CONTACT_FRAMES / 30 },
];

// ---------- Голоса ----------
export type Iw2Role = "narrator" | "father" | "son" | "mother" | "teacher";

export const IW2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 241,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design, носители
// кыргызского языка). Новые голоса не создаются.
//   narrator — KG-teacher: тёплый спокойный голос рассказчика (ролики №10–22);
//   father   — KG-husband: спокойный низкий мужской голос папы;
//   mother   — KG-mother: тёплый уверенный женский голос;
//   son      — KG-boy a2-3: голос мальчика, выбранный пробами ролика №22
//              (слепое прослушивание: «мальчик-подросток», F0 ≈ 270 Гц);
//              прежний KG-son не используется — он звучит как взрослая
//              женщина;
//   teacher  — KG-friend (ролик «Запасного нет»): открытый дружелюбный
//              женский голос, создан как отличный от голоса мамы.
export const IW2_VOICES: Record<Iw2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  son: { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
  teacher: { name: "KG-friend", voiceId: "YFFd51gsFa9VT4xGD15W" },
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо»); tag — аудиотег eleven_v3 (не
// звучит, в субтитры не попадает); note — режиссёрское пояснение (в TTS не
// отправляется).
export type Iw2Line = {
  readonly id: string;
  readonly role: Iw2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note: string;
};

export const IW2_LINES: readonly Iw2Line[] = [
  { id: "T01", role: "teacher", text: "Уулуңуз сиздин келишиңизди аябай каалаган.", tag: "[warmly]", note: "спокойно и доброжелательно, без упрёка" },
  { id: "F01", role: "father", text: "Эмнеге мага айткан жок?", tag: "[surprised]", note: "искреннее удивление, интерес, не раздражение" },
  {
    id: "N01",
    role: "narrator",
    text: "Бирок чакыруу кагазы бир жума бою сумкасында жатты. Аты-жөнү жазыла турган сап бош эле.",
    tag: "[curious]",
    note: "лёгкая интрига",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Мектепте кесиптер күнү өтмөк. Ата-энелер балдарга өз иши тууралуу айтып беришмек.",
    note: "спокойный контекст",
  },
  { id: "N03", role: "narrator", text: "Атасы — инженер. Эмир анын чиймелерин кызыгуу менен карачу.", tag: "[warmly]", note: "тепло" },
  { id: "S01", role: "son", text: "Менин атам чыныгы имараттарды долбоорлойт!", tag: "[excited]", note: "естественная гордость, без скачка тембра" },
  { id: "N04", role: "narrator", text: "Күн сайын ал уулун мектептен алып, кайра жумушка кайтып барчу.", note: "спокойно, без драматизма" },
  { id: "N05", role: "narrator", text: "Үйдө апасы сумкадан бырышып калган чакыруу кагазын тапты.", note: "спокойно, чуть тише" },
  { id: "F02", role: "father", text: "Менин келишимди кааладың беле?", tag: "[gently]", note: "мягко" },
  { id: "F03", role: "father", text: "Анда эмнеге чакырууну бербедиң?", tag: "[gently]", note: "с интересом, без укора" },
  {
    id: "S02",
    role: "son",
    text: "Сен мени мектептен алып кетиш үчүн күн сайын жумуштан чыгасың. Анан кайра жумушка кайтасың. Дагы бир жолу сурансам... ашыкча болуп калат го деп ойлодум.",
    note: "тихо, ясно, без плача; паузы после «чыгасың», «кайтасың», заминка после «сурансам»",
  },
  { id: "F04", role: "father", text: "Классыңа эмне көрсөтөбүз?", tag: "[warmly]", note: "тепло, с готовностью участвовать" },
  { id: "S03", role: "son", text: "Көпүрө! Кагаздан көпүрө жасасак болобу?", tag: "[excited]", note: "заинтересованно, чуть радостнее" },
  {
    id: "N06",
    role: "narrator",
    text: "Ошол кечте алар ар кандай көпүрөлөрдү жасап көрүштү. Бирөө ийилип калды. Экинчиси оюнчук машинаны көтөрдү.",
    tag: "[warmly]",
    note: "с лёгким интересом",
  },
  { id: "N07", role: "narrator", text: "Эртеси Эмир классташтарына атасын тааныштырды.", note: "светло" },
  {
    id: "F05",
    role: "father",
    text: "Инженерлер имараттарды, жолдорду, көпүрөлөрдү долбоорлошот. Бүгүн кагаздан жасалган көпүрөбүздү сынайбыз.",
    note: "уверенно, доступно детям, без пафоса",
  },
  { id: "N08", role: "narrator", text: "Кечээги тажрыйба класста да ийгиликтүү өттү.", tag: "[warmly]", note: "тепло, после успеха" },
  {
    id: "M01",
    role: "mother",
    text: "Мектепке барып-келүүнү алдын ала уюштуралы. Ошондо жумушубузду да жеңилирээк пландайбыз.",
    note: "деловито и мягко",
  },
  { id: "F06", role: "father", text: "Макул. Маршрут менен убактысын сүйлөшүп алалы.", note: "согласие, вместе" },
  {
    id: "N09",
    role: "narrator",
    text: "Алар BalaGo'ну таап, мектепке барып-келүү убактысын сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    spoken: "Алар БалаГону таап, мектепке барып-келүү убактысын сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    note: "спокойно, по делу",
  },
  { id: "F07", role: "father", text: "Сактап коёсуңбу?", tag: "[softly]", note: "с лёгкой улыбкой" },
  { id: "S04", role: "son", text: "Албетте. Бул жерде сенин атың жазылган да.", note: "спокойно и уверенно" },
  {
    id: "N10",
    role: "narrator",
    text: "BalaGo — балдар үчүн такси.",
    spoken: "БалаГо — балдар үчүн такси.",
    note: "коротко и уверенно",
  },
];

// ---------- Речевые сегменты на шкале ----------
// mode: narration — закадровый текст (рты закрыты); live — живая речь.
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или от
// конца предыдущей реплики той же сцены. В паузах — действие и реакции.
export type Iw2Mode = "narration" | "live";
export type Iw2SegSpec = {
  readonly id: string;
  readonly scene: Iw2SceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const IW2_SEG_SPECS: readonly Iw2SegSpec[] = [
  { id: "T01", scene: "hook", gap: 0.7, action: "учительница у кабинета 203 обращается к папе" },
  { id: "F01", scene: "hook", gap: 1.0, action: "взгляд папы меняется; крупно — удивление" },
  { id: "N01", scene: "blank", gap: 1.5, action: "строки приглашения по очереди; пустая строка гостя; «Бир жума»" },
  { id: "N02", scene: "careers", gap: 0.6, action: "доска «КЕСИПТЕР КҮНҮ», предметы профессий; учительница раздаёт листы" },
  { id: "N03", scene: "proud", gap: 0.6, action: "папа над чертежом; Эмир рассматривает линии" },
  { id: "S01", scene: "proud", gap: 1.4, action: "Эмир с двумя одноклассниками; дети реагируют" },
  { id: "N04", scene: "route", gap: 0.8, action: "карандаш отложен → машина у школы → снова за чертежом; линия Кеңсе → Мектеп → Үй → Кеңсе" },
  { id: "N05", scene: "backpack", gap: 0.7, action: "молния открыта, рука в рюкзаке, лист на столе" },
  { id: "F02", scene: "ask", gap: 3.6, action: "папа подходит, отодвигает стул, садится рядом" },
  { id: "F03", scene: "ask", gap: 2.0, action: "сын молча кивает" },
  { id: "S02", scene: "why", gap: 1.8, action: "сын смотрит на лист, затем на папу; общий → крупный сына → реакция папы" },
  { id: "F04", scene: "idea", gap: 1.3, action: "папа придвигает заполненное приглашение к сыну" },
  { id: "S03", scene: "idea", gap: 1.0, action: "сын выпрямляется, берёт чистый лист; линия пролёта" },
  { id: "N06", scene: "test", gap: 1.2, action: "плоский лист прогибается; сгибают второй; машинка проезжает" },
  { id: "N07", scene: "class", gap: 1.6, action: "учительница встречает папу; Эмир показывает, куда поставить модель" },
  { id: "F05", scene: "class", gap: 1.2, action: "папа показывает на чертёж, затем на мост" },
  { id: "N08", scene: "demo", gap: 5.6, action: "после проезда машинки и аплодисментов" },
  { id: "M01", scene: "parents", gap: 1.4, action: "родители за столом: фото, телефон, расписание" },
  { id: "F06", scene: "parents", gap: 0.8, action: "папа соглашается; мама открывает поиск" },
  { id: "N09", scene: "balago", gap: 1.0, action: "поиск → карточка BalaGo → страница → форма → «Жөнөтүү» → «Өтүнмө жөнөтүлдү»" },
  { id: "F07", scene: "bedtime", gap: 3.2, action: "папа подходит к столу сына, видит приглашение и фото" },
  { id: "S04", scene: "bedtime", gap: 0.8, action: "сын отвечает; папа смотрит на имя и на сына" },
  { id: "N10", scene: "contact", gap: 0.6, action: "контактная карточка BalaGo" },
];

export const modeOf = (lineId: string): Iw2Mode => (lineId.startsWith("N") ? "narration" : "live");

export const lineById = (id: string) => {
  const l = IW2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type Iw2SceneSpan = { readonly id: Iw2SceneId; readonly title: string; readonly from: number; readonly to: number }; // кадры
export type Iw2SegAt = { readonly id: string; readonly scene: Iw2SceneId; readonly at: number; readonly end: number };
export type Iw2Layout = {
  readonly scenes: readonly Iw2SceneSpan[];
  readonly segments: readonly Iw2SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // первый кадр контактной карточки
};

// Сцены идут подряд: [from, to) — to не входит в сцену и совпадает с from
// следующей. Контакты — кадры [frames − 150, frames).
export const layoutTimeline = (speech: (id: string) => number): Iw2Layout => {
  const fps = IW2_VIDEO.fps;
  const scenes: Iw2SceneSpan[] = [];
  const segments: Iw2SegAt[] = [];
  let frame = 0;
  for (const sc of IW2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of IW2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len = sc.id === "contact" ? IW2_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return { scenes, segments, frames: frame, contactFrom: frame - IW2_CONTACT_FRAMES };
};

// Оценка длительности речи по тексту (≈ 13 букв/с, паузы на знаках) —
// только до генерации озвучки (превью в Studio).
export const estimateSpeech = (id: string) => {
  const l = lineById(id);
  const text = l.spoken ?? l.text;
  const letters = [...text].filter((c) => /\p{L}/u.test(c)).length;
  const marks = (text.match(/[.,!?—]/g) ?? []).length;
  return letters / 13 + marks * 0.25;
};

// ---------- Экранные надписи (кыргызча) ----------
export const IW2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  son: "Эмир",
  father: "Азамат",
  room: "203",
  // Один и тот же лист приглашения во всех кадрах.
  invitation: {
    title: "КЕСИПТЕР КҮНҮ",
    day: "Күнү: жума",
    time: "Убактысы: 10:00",
    room: "Кабинет: 203",
    guest: "Чакырылган конок:",
    name: "Азамат",
  },
  week: "Бир жума",
  board: "КЕСИПТЕР КҮНҮ",
  bridge: "Көпүрө",
  routeNodes: ["Кеңсе", "Мектеп", "Үй", "Кеңсе"],
  list: ["Кагаз", "Оюнчук машина", "Карандаш"],
  caption: "Менин атам — инженер",
  // Обращение BalaGo (иллюстративный интерфейс, без URL, рейтингов и номеров).
  search: { query: "Бишкек балдар үчүн такси", hint: "Издөө" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    section: "Алдын ала каттоо",
  },
  form: {
    title: "Алдын ала каттоо",
    name: "Аты-жөнү",
    nameValue: "Азамат",
    school: "Мектеп",
    schoolValue: "Эмирдин мектеби",
    route: "Маршрут",
    routeValue: "Үй → Мектеп → Үй",
    time: "Убакыт",
    timeValue: "Сабактан кийин",
    send: "Жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
  },
  // Контактная карточка — последние 5 с.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    whatsapp: "WhatsApp: 0998 08 38 28",
    link: "Маалымат жана алдын ала каттоо — профилдеги шилтемеде",
  },
} as const;
