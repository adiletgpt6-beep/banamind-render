// Персонажи ролика: пропорции и внешность. Одинаковы во всех сценах.
// Единицы рисунка: высота взрослого ≈ 1000 (ступни в y = 0, вверх — минус).

export type Build = {
  readonly headY: number; // центр головы
  readonly headRx: number;
  readonly headRy: number;
  readonly neckTop: number;
  readonly shoulderY: number;
  readonly shoulderHalf: number;
  readonly waistY: number;
  readonly waistHalf: number;
  readonly hipY: number; // верх бёдер (пояс)
  readonly hipHalf: number;
  readonly hipJointY: number;
  readonly hipJointX: number;
  readonly thigh: number;
  readonly shin: number;
  readonly upperArm: number;
  readonly forearm: number;
  readonly hand: number;
  readonly limb: number; // толщина руки
  readonly leg: number; // толщина ноги
  readonly foot: number; // длина стопы (в профиль)
  readonly stride: number; // длина шага
  readonly kid?: boolean; // №31: детские черты лица (крупнее глаза, круглее щёки)
};

const ADULT: Build = {
  headY: -884,
  headRx: 60,
  headRy: 72,
  neckTop: -820,
  shoulderY: -778,
  shoulderHalf: 88,
  waistY: -575,
  waistHalf: 62,
  hipY: -520,
  hipHalf: 72,
  hipJointY: -478,
  hipJointX: 38,
  thigh: 240,
  shin: 222,
  upperArm: 160,
  forearm: 146,
  hand: 50,
  limb: 40,
  leg: 52,
  foot: 92,
  stride: 240,
};

// Ребёнок 7–8 лет: голова крупнее, ноги и руки короче.
const CHILD: Build = {
  headY: -836,
  headRx: 74,
  headRy: 84,
  neckTop: -752,
  shoulderY: -718,
  shoulderHalf: 76,
  waistY: -545,
  waistHalf: 60,
  hipY: -500,
  hipHalf: 66,
  hipJointY: -448,
  hipJointX: 32,
  thigh: 220,
  shin: 212,
  upperArm: 150,
  forearm: 132,
  hand: 44,
  limb: 36,
  leg: 46,
  foot: 80,
  stride: 180,
};

// Девочка 11–12 лет: между ребёнком и взрослым — голова меньше детской,
// шея и ноги длиннее, плечи уже взрослых.
const TEEN: Build = {
  headY: -868,
  headRx: 64,
  headRy: 76,
  neckTop: -794,
  shoulderY: -756,
  shoulderHalf: 76,
  waistY: -566,
  waistHalf: 56,
  hipY: -516,
  hipHalf: 64,
  hipJointY: -472,
  hipJointX: 33,
  thigh: 236,
  shin: 222,
  upperArm: 156,
  forearm: 140,
  hand: 46,
  limb: 36,
  leg: 46,
  foot: 86,
  stride: 220,
};

// №31: взрослая женщина — плечи уже, талия тоньше; голова чуть крупнее
// базы №30 (лицо читается на средних планах).
const WOMAN: Build = { ...ADULT, headY: -886, headRx: 60, headRy: 73, neckTop: -820, shoulderHalf: 80, waistHalf: 55, hipHalf: 72, limb: 36, leg: 47 };
// №31: взрослый мужчина (директор, заказчик, сотрудник).
const MAN: Build = { ...ADULT, headY: -890, headRx: 65, headRy: 78, neckTop: -822, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, limb: 44, leg: 56 };
// №31: сын, 9 лет — школьник (не малыш): голова ≈ 1/6 роста, шея и
// ноги длиннее, чем у дошкольника; детские черты лица (kid).
const SCHOOLBOY: Build = { ...CHILD, kid: true, headY: -842, headRx: 73, headRy: 83, neckTop: -764, shoulderY: -724, shoulderHalf: 72, waistHalf: 57, hipHalf: 60, limb: 34, leg: 44 };
// №31: бабушка — ниже за счёт роста H, чуть круглее и мягче, плечи
// немного опущены, шаг короче.
const GRANNY: Build = { ...ADULT, headY: -880, headRx: 62, headRy: 74, neckTop: -814, shoulderY: -770, shoulderHalf: 86, waistHalf: 78, hipHalf: 86, limb: 40, leg: 50, stride: 200 };

// №31: «bob» — каре до линии челюсти (мама); «shortGrey» — короткая
// стрижка с боковым пробором (заказчик).
export type HairStyle = "momBob" | "dadShort" | "girlBraids" | "longTail" | "shortGrey" | "boyShort" | "bun" | "bob";
// «blazer» — пиджак/жакет нараспашку: лацканы, в вырезе рубашка (inner).
export type Top = "cardigan" | "shirt" | "pinafore" | "jacket" | "sweater" | "tee" | "blazer";

export type Look = {
  readonly build: Build;
  readonly skin: string;
  readonly skinShade: string;
  readonly hair: string;
  readonly hairStyle: HairStyle;
  readonly top: Top;
  readonly topColor: string;
  readonly topShade: string;
  readonly inner: string; // рубашка/блузка под верхом, воротник
  readonly bottom: string; // брюки/юбка
  readonly skirt?: boolean;
  readonly legColor?: string; // колготки
  readonly shoes: string;
  readonly brow: string;
  readonly lips: string;
  readonly earrings?: boolean;
  readonly watch?: boolean; // часы на левой руке
  readonly stubble?: boolean;
  readonly bows?: boolean;
  readonly backpack?: string;
  readonly accent?: string; // цветная полоска на груди (футболка)
  // ---------- №31 (все поля необязательны) ----------
  readonly glasses?: string; // цвет оправы очков
  readonly rolled?: boolean; // рукава подвернуты до середины предплечья
  readonly temples?: string; // седина на висках
  readonly collar?: string; // воротник рубашки поверх выреза (джемпер сына)
  readonly tie?: string; // галстук
  readonly lashes?: boolean; // ресницы у внешнего уголка глаза (женские облики)
  // низ юбки: доля бедра ниже тазобедренного сустава (по умолчанию 0,52;
  // 1,5 — длинная юбка до середины голени)
  readonly skirtLen?: number;
};

// ---------- Цвета контура и объёма ----------
const hexRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbHex = (r: number, g: number, b: number) => {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1)}`;
};
// Смешение двух цветов (#rrggbb).
export const mixHex = (a: string, b: string, t: number) => {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return rgbHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
};
// Темнее/светлее в k раз (k < 1 — темнее).
export const scaleHex = (hex: string, k: number) => {
  const [r, g, b] = hexRgb(hex);
  return rgbHex(r * k, g * k, b * k);
};
const lineCache = new Map<string, string>();
// Контур части — тёмный оттенок её же заливки (чуть холоднее, к чернилам).
export const lineOf = (hex: string) => {
  const hit = lineCache.get(hex);
  if (hit) return hit;
  const v = mixHex(scaleHex(hex, 0.6), "#1E2235", 0.22);
  lineCache.set(hex, v);
  return v;
};
// Светлый блик (сторона к свету: слева сверху).
export const lightOf = (hex: string, t = 0.16) => mixHex(hex, "#FFFFFF", t);
// Толщина контура в единицах рисунка: ≈ 2,9 px мира для любого роста
// (у всех героев плана одна толщина, как у предметов; крупный план —
// зум камеры, линия растёт вместе с кадром). Мелкие фигуры дальнего
// плана — не толще 6,5 единиц.
export const lineFor = (h: number) => Math.max(1, Math.min(6.5, 2900 / Math.max(1, h)));

export const LOOKS = {
  // Мама (30–35): тёмные волосы до плеч, кардиган цвета морской волны,
  // кремовая блузка, тёмно-синие брюки; серьги и часы.
  mom: {
    build: ADULT,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "momBob",
    top: "cardigan",
    topColor: "#5E9A93",
    topShade: "#4A7F79",
    inner: "#F5EADB",
    bottom: "#33405F",
    shoes: "#2A2A30",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
    watch: true,
  },
  // Папа (30–40): короткая стрижка, лёгкая щетина, серо-синий свитер.
  dad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "sweater",
    topColor: "#6D7FA3",
    topShade: "#59698B",
    inner: "#E9E4DA",
    bottom: "#45495A",
    shoes: "#3B2E28",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Сын (7–8): короткая стрижка, тёмно-синий школьный пиджак, белая
  // рубашка, серые брюки, зелёный рюкзак.
  son: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#4A5163",
    shoes: "#222228",
    brow: "#221B19",
    lips: "#B86A62",
    backpack: "#3E9C6B",
  },
  // №20. Сын (9 лет): короткая стрижка, тёмно-синий школьный пиджак,
  // белая рубашка, серые брюки, зелёный рюкзак. Чуть старше и выше «son»,
  // голова пропорционально меньше (школьник, не малыш). Один облик во всех
  // сценах (дома — без пиджака, в голубом свитере: «boyHome»).
  boy: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#4A5163",
    shoes: "#222228",
    brow: "#221B19",
    lips: "#B86A62",
    backpack: "#3E9C6B",
  },
  boyHome: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#5D8FC2",
    topShade: "#4C79A8",
    inner: "#FFFFFF",
    bottom: "#4A5163",
    shoes: "#3A4A5E",
    brow: "#221B19",
    lips: "#B86A62",
  },
  // №20. Отец — руководитель отдела продаж: тёмно-синий пиджак поверх
  // светлой рубашки (будни); дома — тот же человек в свитере («dad»).
  salesDad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#2E3D5C",
    topShade: "#24314B",
    inner: "#EEF2F7",
    bottom: "#2E3446",
    shoes: "#2A221E",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Дочь (11–12): хвост, тёмно-синий школьный кардиган и юбка, белая
  // блузка, тёмные колготки, коралловый рюкзак.
  daughter: {
    build: TEEN,
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "longTail",
    top: "cardigan",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FBFBF8",
    bottom: "#26386A",
    skirt: true,
    legColor: "#3B3F55",
    shoes: "#24242A",
    brow: "#2A1F1C",
    lips: "#C46E6A",
    earrings: true,
    backpack: "#E5677A",
  },
  // Учительница: волосы собраны в пучок, бордовый жакет.
  teacher: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "jacket",
    topColor: "#8E3B46",
    topShade: "#76303A",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
    earrings: true,
  },
  // Дочка (8–9 лет): косички с белыми бантами, тёмно-синий школьный
  // жакет и юбка, жёлтый рюкзак. Один облик во всех сценах.
  girl: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "girlBraids",
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#2F4A7A",
    skirt: true,
    legColor: "#E9E6E0",
    shoes: "#24242A",
    brow: "#2A1F1C",
    lips: "#C46E6A",
    bows: true,
    backpack: "#FFC93D",
  },
  // Бабушка: седые волосы в пучке, тёплый коричневый кардиган.
  grandma: {
    build: { ...ADULT, shoulderHalf: 90, waistHalf: 70, hipHalf: 78 },
    skin: "#E0AE8A",
    skinShade: "#C99572",
    hair: "#B9B3AE",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#8A5A44",
    topShade: "#734836",
    inner: "#EFE6D8",
    bottom: "#4A4450",
    skirt: true,
    legColor: "#6B5B55",
    shoes: "#3A3030",
    brow: "#8E8782",
    lips: "#A9675E",
  },
  // Второстепенные: дети и родители у школы.
  kidA: {
    build: CHILD,
    skin: "#E3B08A",
    skinShade: "#CF9873",
    hair: "#3B2B24",
    hairStyle: "girlBraids",
    top: "pinafore",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FFFFFF",
    bottom: "#26386A",
    skirt: true,
    legColor: "#EDEAE4",
    shoes: "#2A2A30",
    brow: "#3B2B24",
    lips: "#C46E6A",
    bows: true,
    backpack: "#7A6BC4",
  },
  parentA: {
    build: { ...ADULT, shoulderHalf: 94, waistHalf: 70 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#5E7A6B",
    topShade: "#4C6558",
    inner: "#EDEDED",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
  // ---------- №22 «Тогуз жаштагы кызматкердин арызы» ----------
  // Бектур (9 лет): короткая стрижка, тёплая жёлтая рубашка (тот же цвет —
  // в его рисунке), тёмно-синие брюки, синий рюкзак. Один облик весь день.
  bektur: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "shirt",
    topColor: "#F2B632",
    topShade: "#D99A1E",
    inner: "#FFFFFF",
    bottom: "#2B3A67",
    shoes: "#2A2A30",
    brow: "#221B19",
    lips: "#B86A62",
  },
  // Папа — руководитель небольшой IT-компании: тёмно-синий свитер поверх
  // светлой рубашки. Аккуратное лицо без бороды и без тени щетины.
  dadIT: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "sweater",
    topColor: "#2F3B66",
    topShade: "#252F52",
    inner: "#EEF2F7",
    bottom: "#3B3F4C",
    shoes: "#2A221E",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
  },
  // Мама — стоматолог: бирюзовая медицинская форма; дома — кардиган.
  momDoc: {
    build: ADULT,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "bun",
    top: "sweater",
    topColor: "#3FA7A0",
    topShade: "#2F8C86",
    inner: "#3FA7A0",
    bottom: "#3FA7A0",
    shoes: "#F2F2F2",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
  },
  momHome: {
    build: ADULT,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#C96B5A",
    topShade: "#B25A4A",
    inner: "#F5EADB",
    bottom: "#33405F",
    shoes: "#2A2A30",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
  },
  // Друзья во дворе: розовая кофта и косички; зелёная футболка; оранжевая
  // толстовка (выше ростом). Цвета — как на фотографии.
  friendA: {
    build: { ...CHILD, headRx: 68, headRy: 78 },
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "girlBraids",
    top: "sweater",
    topColor: "#F0ACC5",
    topShade: "#DB8FAC",
    inner: "#FFFFFF",
    bottom: "#2E3550",
    shoes: "#2A2A30",
    brow: "#2A1F1C",
    lips: "#C46E6A",
  },
  friendB: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#5FA35A",
    topShade: "#4C8A48",
    inner: "#FFFFFF",
    bottom: "#2E3550",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
  friendC: {
    build: { ...TEEN, headRx: 64, headRy: 74 },
    skin: "#E3B08A",
    skinShade: "#CF9873",
    hair: "#3B2B24",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#F08A3C",
    topShade: "#D9732A",
    inner: "#F4F1EA",
    bottom: "#2E3550",
    shoes: "#2A2A30",
    brow: "#3B2B24",
    lips: "#B86A62",
  },
  // Сотрудники офиса.
  colleagueW: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "momBob",
    top: "cardigan",
    topColor: "#F0ACC5",
    topShade: "#D990AC",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
  },
  colleagueM: {
    build: { ...ADULT, shoulderHalf: 92, waistHalf: 68 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "tee",
    topColor: "#5E7A6B",
    topShade: "#4C6558",
    inner: "#5E7A6B",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
  // ---------- №30 «Ал менин атымды билеби?» ----------
  // Мальчик (8–9 лет, 3 «Б»): тёмные волосы с узнаваемым чубчиком, живой
  // взгляд. Дома — светлая футболка с узкой жёлтой полосой; в школьных
  // сценах — аккуратная тёмно-синяя кофта с белым воротником и тот же синий
  // рюкзак. Рост и лицо одинаковы во всех планах.
  m13Boy: {
    build: { ...CHILD, headRx: 68, headRy: 78 },
    skin: "#E3B08A",
    skinShade: "#CD9771",
    hair: "#1E1715",
    hairStyle: "boyShort",
    top: "tee",
    topColor: "#F4F1EA",
    topShade: "#D9D3C6",
    inner: "#F4F1EA",
    bottom: "#3C4A66",
    shoes: "#3A3F4E",
    brow: "#1E1715",
    lips: "#B86A62",
    accent: "#FFD43B",
  },
  m13BoySchool: {
    build: { ...CHILD, headRx: 68, headRy: 78 },
    skin: "#E3B08A",
    skinShade: "#CD9771",
    hair: "#1E1715",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#2B4570",
    topShade: "#22385C",
    inner: "#FFFFFF",
    bottom: "#4A505E",
    shoes: "#24242A",
    brow: "#1E1715",
    lips: "#B86A62",
    backpack: "#2F6FD6",
  },
  // Мальчик дома с рюкзаком (возвращается из школы с няней-сценой).
  m13BoySchoolPack: {
    build: { ...CHILD, headRx: 68, headRy: 78 },
    skin: "#E3B08A",
    skinShade: "#CD9771",
    hair: "#1E1715",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#2B4570",
    topShade: "#22385C",
    inner: "#FFFFFF",
    bottom: "#4A505E",
    shoes: "#24242A",
    brow: "#1E1715",
    lips: "#B86A62",
  },
  // (№30 «m13Mom»/«m13MomHome» заменены обликом мамы №31 — см. ниже.)
  // Папа (35–40, IT): короткая стрижка, без бороды и без щетины, спокойная
  // серо-голубая рубашка (узнаётся во всех сценах), часы.
  m13Dad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#8FAFC8",
    topShade: "#7896B0",
    inner: "#8FAFC8",
    bottom: "#3B3F4C",
    shoes: "#2A221E",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
  },
  // Няня (45–50): волосы в пучке, тёплый ягодный кардиган, длинная юбка —
  // силуэт отличается и от мамы, и от детей.
  m13Nanny: {
    build: { ...ADULT, shoulderHalf: 90, waistHalf: 72, hipHalf: 80 },
    skin: "#E0AE8A",
    skinShade: "#C99674",
    hair: "#4A3A33",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#A85A6E",
    topShade: "#8E4A5C",
    inner: "#F2E6D8",
    bottom: "#5A5560",
    skirt: true,
    legColor: "#8A7C76",
    shoes: "#4A3A33",
    brow: "#4A3A33",
    lips: "#A9675E",
  },
  // Младшая сестрёнка (≈ 3 года): косички с бантиками, розовая кофточка.
  m13Sister: {
    build: { ...CHILD, headRx: 80, headRy: 88 },
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "girlBraids",
    top: "sweater",
    topColor: "#E88AA8",
    topShade: "#D07090",
    inner: "#FFFFFF",
    bottom: "#7A8FC0",
    shoes: "#E2574C",
    brow: "#2A1F1C",
    lips: "#C46E6A",
    bows: true,
  },
  // ---------- №31 «13:20дагы жолугушуу» ----------
  // Директор (38–42): короткая аккуратная тёмная стрижка, без бороды;
  // тёмно-синий пиджак нараспашку, светло-голубая рубашка без галстука,
  // серые брюки, часы на левой руке.
  m13Director: {
    build: MAN,
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "blazer",
    topColor: "#2C3B5E",
    topShade: "#222F4B",
    inner: "#BFD6EE",
    bottom: "#5D6372",
    shoes: "#2A221E",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
  },
  // Он же вечером дома: та же рубашка без пиджака, рукава подвернуты.
  m13DirectorHome: {
    build: MAN,
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#BFD6EE",
    topShade: "#A2BCD8",
    inner: "#BFD6EE",
    bottom: "#5D6372",
    shoes: "#3A3F4C",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    rolled: true,
  },
  // Помощница (27–32): тёмные волосы в аккуратном пучке, бирюзово-зелёный
  // жакет, светлая блузка, тёмные брюки, маленькие серьги.
  m13Assistant: {
    build: WOMAN,
    skin: "#E9B995",
    skinShade: "#D49F7A",
    hair: "#2A1E1B",
    hairStyle: "bun",
    top: "blazer",
    topColor: "#2E9686",
    topShade: "#237A6D",
    inner: "#F7F2E8",
    bottom: "#2C3446",
    shoes: "#2A2A30",
    brow: "#2A1E1B",
    lips: "#C0646A",
    earrings: true,
    lashes: true,
  },
  // Сын (9 лет): короткие тёмные волосы с чёлкой, тёмно-синий школьный
  // джемпер с белым воротником рубашки, серые брюки, ОДИН узнаваемый
  // оранжевый рюкзак (только в этом облике).
  m13Son: {
    build: SCHOOLBOY,
    skin: "#E3B08A",
    skinShade: "#CD9771",
    hair: "#1E1715",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#2A3F6B",
    topShade: "#203257",
    inner: "#FFFFFF",
    collar: "#FFFFFF",
    bottom: "#666D7C",
    shoes: "#24242A",
    brow: "#1E1715",
    lips: "#B86A62",
    backpack: "#E9783A",
  },
  // Сын вечером дома: мягкий голубой домашний свитер, без рюкзака.
  m13SonHome: {
    build: SCHOOLBOY,
    skin: "#E3B08A",
    skinShade: "#CD9771",
    hair: "#1E1715",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#8DB5DD",
    topShade: "#749CC6",
    inner: "#8DB5DD",
    bottom: "#59647D",
    shoes: "#D9D4CB",
    brow: "#1E1715",
    lips: "#B86A62",
  },
  // Мама (35–38): тёмное каре, сливовый жакет, светлая блузка (офис).
  m13Mom: {
    build: WOMAN,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "bob",
    top: "blazer",
    topColor: "#7A3F66",
    topShade: "#633352",
    inner: "#F4EEE6",
    bottom: "#2E2F3E",
    shoes: "#2A2A30",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
    watch: true,
    lashes: true,
  },
  // Она же дома: серо-розовый кардиган.
  m13MomHome: {
    build: WOMAN,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "bob",
    top: "cardigan",
    topColor: "#C09A9E",
    topShade: "#A88387",
    inner: "#F4ECDD",
    bottom: "#4A4F66",
    shoes: "#6B5B55",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
    lashes: true,
  },
  // Бабушка: седые волосы в пучке, тёплый оливковый кардиган, длинная юбка.
  m13Grandma: {
    build: GRANNY,
    skin: "#E0AE8A",
    skinShade: "#C99572",
    hair: "#CBC6C0",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#8A8650",
    topShade: "#727040",
    inner: "#F0E7D8",
    bottom: "#5E5163",
    skirt: true,
    skirtLen: 1.5,
    legColor: "#8B7B74",
    shoes: "#4A3A33",
    brow: "#9C958F",
    lips: "#A9675E",
    lashes: true,
  },
  // Заказчик (≈ 50): седеющие волосы с сединой на висках, очки,
  // графитовый костюм, светлая рубашка, сдержанный синий галстук.
  m13Client: {
    build: { ...MAN, shoulderHalf: 98, waistHalf: 76, hipHalf: 76, headRx: 66 },
    skin: "#D8A47E",
    skinShade: "#C08B66",
    hair: "#4A4543",
    hairStyle: "shortGrey",
    top: "blazer",
    topColor: "#41454D",
    topShade: "#33363D",
    inner: "#EEF1F5",
    tie: "#4E6488",
    bottom: "#41454D",
    shoes: "#24201E",
    brow: "#4A4543",
    lips: "#A06058",
    temples: "#B9B4AE",
    glasses: "#2C2A2E",
    watch: true,
  },
  // Сотрудники: коралловый свитер и хвост; зелёный свитер.
  m13ColleagueW: {
    build: WOMAN,
    skin: "#E3B28E",
    skinShade: "#CC9874",
    hair: "#3A2C26",
    hairStyle: "longTail",
    top: "sweater",
    topColor: "#EC8566",
    topShade: "#D46E51",
    inner: "#EC8566",
    bottom: "#3A4054",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#B95F5C",
    earrings: true,
    lashes: true,
  },
  m13ColleagueM: {
    build: { ...MAN, shoulderHalf: 92, waistHalf: 66 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "sweater",
    topColor: "#5E9A6C",
    topShade: "#4B8258",
    inner: "#5E9A6C",
    bottom: "#41465A",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
