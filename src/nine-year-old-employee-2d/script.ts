// Ролик BalaGoNineYearOldEmployee2D — «Тогуз жаштагы кызматкердин арызы»
// («Заявление девятилетнего сотрудника»), сценарий №22.
//
// Девятилетний Бектур кладёт папе на стол заявление: «Мага эртерээк кетүүгө
// уруксат беришиңизди суранам». Папа руководит небольшой IT-компанией,
// мама — стоматолог; после школы сын едет в папин офис (офис рядом со
// школой). В офисе его любят: стол у окна, шуточный бейдж «Жардамчы».
// Настоящая причина — друзья строят во дворе картонный корабль. Папа
// слышит сына, сам решает закончить работу раньше и помогает укрепить
// мачту. Вечером родители сами находят BalaGo и оставляют предварительную
// заявку (без цен, дат, водителей и подтверждённого маршрута). Перед сном
// сын вешает бейдж над столом, рядом — рисунок корабля с собой на носу.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const NY2_VIDEO = {
  id: "BalaGoNineYearOldEmployee2D",
  output: "balago-nine-year-old-employee-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/nine-year-old-employee-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика.
export const NY2_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type Ny2SceneId =
  | "letter"
  | "parents"
  | "route"
  | "helper"
  | "quit"
  | "ship"
  | "badge"
  | "early"
  | "yard"
  | "evening"
  | "balago"
  | "drawing"
  | "contact";

// lead — время до первой реплики сцены (с); tail — время после конца
// последней реплики (действие, реакция, переход); min — нижняя граница
// длительности сцены. Сцена без речи (contact) имеет фиксированную длину.
export type Ny2SceneSpec = {
  readonly id: Ny2SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const NY2_SCENE_SPECS: readonly Ny2SceneSpec[] = [
  { id: "letter", title: "1. Арыз", tail: 2.6, min: 8 },
  { id: "parents", title: "2. Эки жумуш күнү", tail: 1.3, min: 9 },
  { id: "route", title: "3. Мектептен кеңсеге", tail: 11.4, min: 15 },
  { id: "helper", title: "4. Жардамчы", tail: 4.6, min: 13 },
  { id: "quit", title: "5. Жумуштан кетүүнү чечтиңби?", tail: 3.2, min: 10 },
  { id: "ship", title: "6. Картон кеме", tail: 1.6, min: 9 },
  { id: "badge", title: "7. Эмне үчүн айтпады", tail: 2.6, min: 16 },
  { id: "early", title: "8. Эртерээк бүтүрдү", tail: 3.2, min: 8 },
  { id: "yard", title: "9. Кемеде орун бар", tail: 6.8, min: 14 },
  { id: "evening", title: "10. Ата-эне кеңешет", tail: 1.2, min: 9 },
  { id: "balago", title: "11. BalaGo: алдын ала арыз", tail: 4.8, min: 14 },
  { id: "drawing", title: "12. Бейдж жана сүрөт", tail: 2.4, min: 10 },
  { id: "contact", title: "13. Байланыш", tail: 0, min: NY2_CONTACT_FRAMES / 30 },
];

// ---------- Голоса ----------
export type Ny2Role = "narrator" | "father" | "son" | "mother";

export const NY2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 221,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design):
//   narrator — KG-teacher, тёплый спокойный голос рассказчика;
//   father   — KG-husband, спокойный низкий мужской голос;
//   mother   — KG-mother, тёплый уверенный женский голос.
//   son      — KG-boy a2-3: выбран по пробам (scripts/ny2d-son-probe.mjs,
//              docs/nine-year-old-employee-2d.md) — Voice Design из описания
//              взрослой актрисы озвучания с лёгким хрипловатым голосом (F0 ≈
//              250–285 Гц); слепое прослушивание чаще всего относит его к
//              мальчику-подростку. Прежний KG-son не используется: он
//              звучит как взрослая женщина.
export const NY2_VOICES: Record<Ny2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  son: { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо», IT → «ай-ти»); tag — аудиотег
// eleven_v3 (не звучит, в субтитры не попадает).
export type Ny2Line = {
  readonly id: string;
  readonly role: Ny2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

export const NY2_LINES: readonly Ny2Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Уулу атасынын үстөлүнө арыз койду. Анда эртерээк кетүүгө уруксат сураган. Бала болгону тогуз жашта эле.",
    tag: "[curious]",
    note: "с любопытством и улыбкой в голосе",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Атасы чакан IT-компанияны жетектейт. Апасы — тиш доктуру. Түштөн кийин ал бейтаптарды кабыл алат.",
    spoken: "Атасы чакан ай-ти компанияны жетектейт. Апасы тиш доктуру. Түштөн кийин ал бейтаптарды кабыл алат.",
    note: "спокойно, по-деловому",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Кеңсе мектепке жакын. Атасы уулун ошол жакка алып келет. Үйгө жеткирип, кайра кайтуу жумуштан көпкө алаксытат.",
    note: "объясняет схему",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Кеңседегилер баланы жакшы көрүшөт. Терезенин жанына үстөл коюп беришкен. Тамашалап, ага бейдж да жасап беришкен.",
    tag: "[warmly]",
    note: "тепло",
  },
  {
    id: "N05",
    role: "narrator",
    text: "Ал үй тапшырмасын аткарат, сүрөт тартат. Атасы уулуна бул жер жагат деп ойлойт.",
    note: "спокойно; во второй фразе — лёгкая неуверенность",
  },
  { id: "F01", role: "father", text: "Жумуштан кетүүнү чечтиңби?", tag: "[playfully]", note: "добрая шутка, улыбка слышна" },
  { id: "S01", role: "son", text: "Жок. Болгону эртерээк кетким келет.", note: "серьёзно, по-детски просто" },
  { id: "F02", role: "father", text: "Эмне болду?", tag: "[gently]", note: "уже настоящий интерес" },
  {
    id: "S02",
    role: "son",
    text: "Досторум дүйшөмбүдө кеме жасай башташкан. Кечээ капитандын бөлмөсүн бүтүрүшүптүр. Мен да жардам бергим келген.",
    note: "заинтересованно, в конце — тихое сожаление без плача",
  },
  { id: "F03", role: "father", text: "Айтсаң болмок да.", tag: "[softly]", note: "мягкое приглашение, без упрёка" },
  {
    id: "S03",
    role: "son",
    text: "Кечээ бейджимди көрсөтүп, жардамчымсың дедиң. Мен бул жерде болсом, сен кубанасың деп ойлогом.",
    note: "искренне, с небольшой паузой между мыслями",
  },
  {
    id: "F04",
    role: "father",
    text: "Сени менен бирге болуу мага абдан жагат. Кеме тууралуу да баарын уккум келет.",
    tag: "[warmly]",
    note: "тепло и искренне, акцент на корабле",
  },
  { id: "N06", role: "narrator", text: "Ошол күнү атасы жумушун эртерээк бүтүрдү.", note: "спокойно" },
  {
    id: "N07",
    role: "narrator",
    text: "Үйгө келишти. Уулу короого чуркады. Атасы балдарга кеменин мачтасын бекемдөөгө жардам берди.",
    tag: "[warmly]",
    note: "светло",
  },
  { id: "S04", role: "son", text: "Мен да жардам берем!", tag: "[excited]", note: "оживлённо, без скачка тембра" },
  {
    id: "F05",
    role: "father",
    text: "Үйгө эртерээк келгиси келиптир. Бирок күн сайын жеткирип, кайра кеңсеге кайтуу кыйын.",
    tag: "[thoughtfully]",
    note: "спокойно ищет решение",
  },
  { id: "M01", role: "mother", text: "Үйдө чоң апасы тосуп алат. Балдар үчүн такси издеп көрөлү.", note: "уверенно, участвует" },
  {
    id: "M02",
    role: "mother",
    text: "Мына, BalaGo. Алдын ала арыз кабыл алып жатышыптыр.",
    spoken: "Мына, БалаГо. Алдын ала арыз кабыл алып жатышыптыр.",
    note: "читает страницу",
  },
  { id: "F06", role: "father", text: "Мектептен үйгө алып келүү тууралуу сурап көрөлү.", note: "решение вместе" },
  { id: "M03", role: "mother", text: "Макул. Мектебин, үйдүн дарегин, сабак бүткөн убакытты жазалы.", note: "деловито" },
  {
    id: "N08",
    role: "narrator",
    text: "Уктаар алдында уулу бейджин чечип, үстөлүнүн жогору жагына илип койду. Жанына кеменин сүрөтүн койду. Кеменин тумшугуна өзүн тартыптыр.",
    tag: "[softly]",
    note: "спокойно и тепло",
  },
];

// ---------- Речевые сегменты на шкале ----------
// mode: narration — закадровый текст (рты закрыты); live — живая речь в кадре.
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type Ny2Mode = "narration" | "live";
export type Ny2SegSpec = {
  readonly id: string;
  readonly scene: Ny2SceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const NY2_SEG_SPECS: readonly Ny2SegSpec[] = [
  { id: "N01", scene: "letter", gap: 1.3, action: "рука кладёт лист; «АРЫЗ», текст просьбы; «9 ЖАШ» на «тогуз»" },
  { id: "N02", scene: "parents", gap: 0.8, action: "IT-офис папы → кабинет мамы, подписи" },
  { id: "N03", scene: "route", gap: 0.5, action: "схема Мектеп / Кеңсе / Үй, линии пути" },
  { id: "N04", scene: "helper", gap: 0.6, action: "коллега здоровается; стол у окна; бейдж" },
  { id: "N05", scene: "helper", gap: 0.5, action: "задание, рисунок, листы в переговорной; взгляд отца" },
  { id: "F01", scene: "quit", gap: 2.6, action: "папа берёт лист, читает, улыбается" },
  { id: "S01", scene: "quit", gap: 0.9, action: "сын качает головой" },
  { id: "F02", scene: "quit", gap: 1.2, action: "папа откладывает лист, смотрит на сына" },
  { id: "S02", scene: "ship", gap: 2.2, action: "фото в руках отца; воспоминание: друзья и корабль" },
  { id: "F03", scene: "badge", gap: 1.3, action: "папа поднимает взгляд от фото" },
  { id: "S03", scene: "badge", gap: 1.0, action: "сын касается бейджа; вставка вчерашнего жеста" },
  { id: "F04", scene: "badge", gap: 6.4, action: "папа встаёт, обходит стол, садится рядом; говорит сидя" },
  { id: "N06", scene: "early", gap: 2.6, action: "папа закрывает ноутбук, берёт ключи" },
  { id: "N07", scene: "yard", gap: 0.8, action: "машина у дома, выход, бег к кораблю" },
  { id: "S04", scene: "yard", gap: 0.5, action: "сын остановился у друзей" },
  { id: "F05", scene: "evening", gap: 1.2, action: "родители за столом, телефон мамы на столе" },
  { id: "M01", scene: "evening", gap: 0.7, action: "мама берёт телефон" },
  { id: "M02", scene: "balago", gap: 4.4, action: "поиск «Балдар үчүн такси», страница BalaGo" },
  { id: "F06", scene: "balago", gap: 0.8, action: "папа смотрит на экран, выбирает «Мектеп → Үй»" },
  { id: "M03", scene: "balago", gap: 0.6, action: "форма: Мектеп, Үй, 14:30" },
  { id: "N08", scene: "drawing", gap: 1.0, action: "снимает бейдж, вешает; придвигает рисунок" },
];

export const modeOf = (lineId: string): Ny2Mode => (lineId.startsWith("N") ? "narration" : "live");

export const lineById = (id: string) => {
  const l = NY2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
// speech(id) — длительность речи реплики (с, от первого до последнего
// звука). Возвращает сцены (кадры) и начало каждой реплики (с).
export type Ny2SceneSpan = { readonly id: Ny2SceneId; readonly title: string; readonly from: number; readonly to: number }; // кадры
export type Ny2SegAt = { readonly id: string; readonly scene: Ny2SceneId; readonly at: number; readonly end: number };
export type Ny2Layout = {
  readonly scenes: readonly Ny2SceneSpan[];
  readonly segments: readonly Ny2SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр
};

export const layoutTimeline = (speech: (id: string) => number): Ny2Layout => {
  const fps = NY2_VIDEO.fps;
  const scenes: Ny2SceneSpan[] = [];
  const segments: Ny2SegAt[] = [];
  let frame = 0;
  for (const sc of NY2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of NY2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len = sc.id === "contact" ? NY2_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return { scenes, segments, frames: frame, contactFrom: frame - NY2_CONTACT_FRAMES };
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
export const NY2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  filmTitle: ["Тогуз жаштагы", "кызматкердин", "арызы"],
  age: "9 ЖАШ",
  // А. Детское заявление
  letter: {
    title: "АРЫЗ",
    body: "Мага эртерээк кетүүгө уруксат беришиңизди суранам.",
    sign: "Бектур, 9 жаш",
  },
  // Б. Шуточный бейдж
  badge: { name: "Бектур", role: "Жардамчы" },
  labels: { it: "IT-компания", dentist: "Тиш доктуру", school: "Мектеп", office: "Кеңсе", home: "Үй" },
  // Ж. Обращение BalaGo (постановочный экран, без адресов и номеров)
  search: { query: "Балдар үчүн такси", hint: "Издөө" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "Мектеп → Үй",
    status: "Алдын ала арыз кабыл алынат",
    cta: "Алдын ала арыз",
  },
  form: {
    title: "Алдын ала арыз",
    school: "Мектеп",
    schoolValue: "Бектурдун мектеби",
    home: "Үй",
    homeValue: "Үй дареги",
    time: "Сабактын бүтүү убактысы",
    timeValue: "14:30",
    send: "Арыз жөнөтүү",
    sent: "Алдын ала арыз жөнөтүлдү",
  },
  // Контактная карточка — последние 5 с.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    call: "Алдын ала арыз калтырыңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
  whatsappUrl: "https://wa.me/996998083828",
} as const;
