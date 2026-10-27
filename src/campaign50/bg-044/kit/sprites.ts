// Пиксельные спрайты BG-044 (аркадная игра). Каждая строка — ряд пикселей,
// буквы — цвета палитры PX (palette.ts), «.» — прозрачный пиксель.
// Стиль: 16-бит, контур тёмно-синий (K), светлые чистые цвета.
// Рисуются через <Sprite rows={…} px={…} /> / <SpriteG …/> (Sprite.tsx).
//
// Персонажи смотрят ВПРАВО (вид 3/4). Отражение влево — prop flip.
// У всех кадров одного персонажа одинаковые размеры и одна и та же
// «точка опоры»: центр тела — колонка cx, низ подошв — нижняя строка
// (h). Поэтому кадры можно менять без дрожания:
//   x = centerX - MOM.cx * px;  y = groundY - MOM.h * px
//
// Этот файл без зависимостей от Remotion (только данные) — его можно
// читать из Node для проверки.
import type { SpriteRows } from "./Sprite";

// ---------- вспомогательные функции (сборка кадров из частей) ----------
// заменить строку y
const setRow = (rows: readonly string[], y: number, row: string): string[] => rows.map((r, i) => (i === y ? row : r));
// наложить заплатку: «.» — оставить пиксель, «-» — стереть, иначе — закрасить
const paint = (rows: readonly string[], x: number, y: number, patch: readonly string[]): string[] =>
  rows.map((r, i) => {
    const p = patch[i - y];
    if (p === undefined) return r;
    const a = r.split("");
    p.split("").forEach((ch, j) => {
      if (ch === "." || x + j < 0 || x + j >= a.length) return;
      a[x + j] = ch === "-" ? "." : ch;
    });
    return a.join("");
  });
// дополнить слева l пустыми колонками и обрезать/дополнить до ширины w
const padRows = (rows: readonly string[], l: number, w: number): string[] =>
  rows.map((r) => {
    const s = repeatDot(l) + r + repeatDot(w);
    return s.slice(0, w);
  });
const repeatDot = (n: number) => {
  let s = "";
  for (let i = 0; i < n; i++) s += ".";
  return s;
};

// ======================================================================
// МАМА — игрок «ОЮНЧУ: АПА». Кыргызка ~35 лет: тёмные волосы, низкий
// пучок с жёлтой резинкой, тёплая кожа, мягко-синяя кофта (B), тёмно-синие
// брюки. Кадр 22×28, тело в колонках 3…18, центр тела cx = 11.
// ======================================================================
const MOM_HEAD = [
  ".....KKKKKK.....",
  "....KHHHHHHKK...",
  "...KHHTTHHHHHK..",
  "..KHHTHHHHHHHHK.",
  "..KHHHHHHHHSSHK.",
  "..KHHHHHSSSSSSK.",
  "..KHHHsSKSSSKSK.",
  ".KKHHHsSKSSSKSK.",
  "KHHKHHHrSSSSSrK.",
  "KHHYHHHKSSRRSSK.",
  ".KKKKKKKKSSSSK..",
  "........KSSK....",
];
const MOM_HEAD_TALK = setRow(setRow(MOM_HEAD, 9, "KHHYHHHKSSKKSSK."), 10, ".KKKKKKKKSRRSK..");
const MOM_HEAD_TALK_HALF = setRow(MOM_HEAD, 9, "KHHYHHHKSSSKSSK.");
const MOM_HEAD_BLINK = setRow(setRow(MOM_HEAD, 6, "..KHHHsSSSSSSSK."), 7, ".KKHHHsSKSSSKSK.");
const MOM_HEAD_HAPPY = setRow(
  setRow(setRow(setRow(MOM_HEAD, 6, "..KHHHsSSSSSSSK."), 7, ".KKHHHsKKSSKKSK."), 9, "KHHYHHHKSKWWKSK."),
  10,
  ".KKKKKKKKSRRSK..",
);
const MOM_HEAD_THINK = setRow(setRow(setRow(MOM_HEAD, 6, "..KHHHsSSKSSSKK."), 7, ".KKHHHsSSSSSSSK."), 9, "KHHYHHHKSSSsSSK.");

const MOM_T_IDLE = [
  ".....KBBBSSBBK..",
  "....KBBBBBSBBBK.",
  "...KBKBBBBBBKBK.",
  "...KBKbBBBBBKNK.",
  "...KBKbBBBBBKNK.",
  "...KSKBBBBBBKSK.",
  "...KKKBBBBBBKKK.",
];
const MOM_T_WALK_A = [
  ".....KBBBSSBBK..",
  "....KBBBBBSBBBK.",
  "...KBKBBBBBBKBK.",
  "..KBKKbBBBBBKNK.",
  "..KBKKbBBBBBKSK.",
  "..KSK.KBBBBBKKK.",
  "..KKK.KBBBBBK...",
];
const MOM_T_WALK_C = [
  ".....KBBBSSBBK..",
  "....KBBBBBSBBBK.",
  "...KBKBBBBBBKBK.",
  "...KBKbBBBBBKNKK",
  "...KBBKBBBBBKKNK",
  "....KSKBBBBBK.KSK",
  "....KKKBBBBBK.KKK",
];
const MOM_L_IDLE = [
  ".....KNNNNNNNK..",
  ".....KNNNKNNNK..",
  ".....KNNNKNNNK..",
  ".....KNNNKNNNK..",
  ".....KNNNKNNNK..",
  ".....KNNNKNNNK..",
  ".....KNNNKNNNK..",
  "......KNNKKNNK..",
  ".....KTTTKKTTTK.",
];
const MOM_L_STRIDE = [
  ".....KNNNNNNNK..",
  "....KNNNKKNNNK..",
  "....KNNK..KNNNK.",
  "...KNNK...KNNNK.",
  "...KNNK....KNNK.",
  "..KNNK.....KNNK.",
  "..KNNK.....KNNNK",
  ".KTTTK.....KTTTK",
];
const MOM_L_PASS = [
  ".....KNNNNNNNK..",
  ".....KNNNNNNNK..",
  ".....KNNNKNNNK..",
  ".....KNNNKNNNK..",
  "....KNNNKKNNNK..",
  "...KNNNK.KNNK...",
  "..KTNNK..KNNK...",
  "..KTKK...KNNK...",
  ".........KTTTK..",
];
const E16 = "................";
const MOM_W = 22;
const momFrame = (rows: readonly string[]) => padRows(rows, 3, MOM_W);
const momIdle1 = momFrame([...MOM_HEAD, ...MOM_T_IDLE, ...MOM_L_IDLE]);

// жесты (тело уже в колонках 3…18 кадра шириной 22)
const momPoint = paint(momIdle1, 0, 12, [
  "........KBBBSSBBKKKKK.",
  ".......KBBBBBSBBBBBSSS",
  "......KBKBBBBBBBBBBSSK",
  "......KBKbBBBBBKKKKKK.",
  "......KBKbBBBBBK------",
  "......KSKBBBBBBK------",
  "......KKKBBBBBBK------",
]);
const momShrug = paint(momFrame([...MOM_HEAD_TALK_HALF, ...MOM_T_IDLE, ...MOM_L_IDLE]), 0, 11, [
  "......................",
  "..KK....KBBBSSBBK..KK.",
  ".KSSK..KBBBBBSBBBK.KSSK",
  ".KSBK.KBKBBBBBBKBK.KBSK",
  "..KBBKKBKbBBBBBKBKKBBK.",
  "...KBBBBKbBBBBBKBBBBK..",
  "....KKKKKBBBBBBKKKKK...",
  "........KBBBBBBK.......",
]);
const momThink = paint(momFrame([...MOM_HEAD_THINK, ...MOM_T_IDLE, ...MOM_L_IDLE]), 0, 9, [
  "...............KKK....",
  "..............KSSSK...",
  "..............KSsSK...",
  "...............KSSK...",
  "...............KBBK...",
  "...............KBBK...",
  "...............KBBK...",
  "...............KBBK...",
  "...............KBBK...",
  "...............KKK-...",
]);

const momIdle2 = momFrame([E16, ...MOM_HEAD.slice(0, 11), ...MOM_T_IDLE, ...MOM_L_IDLE]);
const momWalk1 = momFrame([E16, ...MOM_HEAD, ...MOM_T_WALK_A, ...MOM_L_STRIDE]);
const momWalk2 = momFrame([...MOM_HEAD, ...MOM_T_IDLE, ...MOM_L_PASS]);
const momWalk3 = momFrame([E16, ...MOM_HEAD, ...MOM_T_WALK_C, ...MOM_L_STRIDE]);
const momWalk4 = momFrame([...MOM_HEAD, ...MOM_T_IDLE, ...MOM_L_PASS]);

export const MOM = {
  w: MOM_W,
  h: 28,
  cx: 11, // центр тела (колонка)
  idle1: momIdle1,
  idle2: momIdle2, // «вдох»: голова на 1 пиксель ниже
  idle: [momIdle1, momIdle2] as const,
  blink: momFrame([...MOM_HEAD_BLINK, ...MOM_T_IDLE, ...MOM_L_IDLE]),
  walk1: momWalk1,
  walk2: momWalk2,
  walk3: momWalk3,
  walk4: momWalk4,
  walk: [momWalk1, momWalk2, momWalk3, momWalk4] as const,
  talk: momFrame([...MOM_HEAD_TALK, ...MOM_T_IDLE, ...MOM_L_IDLE]), // рот открыт
  talkHalf: momFrame([...MOM_HEAD_TALK_HALF, ...MOM_T_IDLE, ...MOM_L_IDLE]), // рот приоткрыт
  shrug: momShrug, // «не работает?» — руки в стороны ладонями вверх
  point: momPoint, // рука вытянута вправо
  think: momThink, // рука у подбородка, взгляд вверх
  happy: momFrame([...MOM_HEAD_HAPPY, ...MOM_T_IDLE, ...MOM_L_IDLE]),
} as const;

// ======================================================================
// ДЕТИ. Кадр 16×22, тело в колонках 1…14, центр тела cx = 8.
// Главный — мальчик ~8 лет: чёрные волосы, белая рубашка, тёмно-синий
// жилет (N), серые брюки, жёлтый рюкзак (Y).
// ======================================================================
const KID_W = 16;
const kidFrame = (rows: readonly string[]) => padRows(rows, 1, KID_W);
const E14 = "..............";
const KID_HEAD = [
  "....KKKKK.....",
  "..KKHHHHHKK...",
  ".KHHHHHHHHHK..",
  ".KHHHHHHHHHHK.",
  ".KHHHHHHSHSHK.",
  ".KHHHHSSSSSSK.",
  ".KHHsSKSSSKSK.",
  ".KHHsSKSSSKSK.",
  "..KHSrSSSSSrK.",
  "..KKSSSSRRSK..",
  "....KKKSSKK...",
];
const KID_T_IDLE = [
  "..KKKNWWWNK...",
  ".KYYKYNWNNNK..",
  ".KYYKWKNWNKWK.",
  ".KYOKWKNWNKWK.",
  ".KYOKSKNWNKSK.",
  ".KKKKKKNNNKKK.",
];
const KID_T_WALK_A = [
  "..KKKNWWWNK...",
  ".KYYKYNWNNNK..",
  ".KYYKWKNWNKWK.",
  ".KYOKWKNWNKSK.",
  ".KYOKSKNWNKKK.",
  ".KKKKKKNNNK...",
];
const KID_T_WALK_C = [
  "..KKKNWWWNK...",
  ".KYYKYNWNNNK..",
  ".KYYKWKNWNKWK.",
  ".KYOKSKNWNKWK.",
  ".KYOKKKNWNKWK.",
  ".KKKK.KNNNKSK.",
];
const KID_L_IDLE = [
  "....KgggggK...",
  "....KggKggK...",
  "....KggKggK...",
  "...KWWKKWWK...",
  "...KKKK.KKK...",
];
const KID_L_STRIDE = [
  "....KgggggK...",
  "...KggKKKggK..",
  "..KWWK...KWWK.",
  "..KKKK...KKKK.",
];
const KID_L_PASS = [
  "....KgggggK...",
  "....KggKggK...",
  "...KWWKKggK...",
  "...KKK.KWWK...",
  ".......KKKK...",
];
const kidIdle = kidFrame([...KID_HEAD, ...KID_T_IDLE, ...KID_L_IDLE]);
// поднятая правая рука (машет) — заплатка в координатах кадра 16×22
const WAVE_UP = [
  "............KKKK",
  "............KSSK",
  "............KSSK",
  "............KWWK",
  "............KWWK",
  "...........KKWWK",
  "..........KWWWWK",
  "...........KKKKK",
  "...........K----",
  "...........K----",
  "...........K----",
];
const WAVE_TILT = [
  "...........KKK..",
  "...........KSSK.",
  "............KSSK",
  "............KWWK",
  "............KWWK",
  "...........KKWWK",
  "..........KWWWWK",
  "...........KKKKK",
  "...........K----",
  "...........K----",
  "...........K----",
];
const waveOf = (base: readonly string[], patch: readonly string[]) => paint(base, 0, 5, patch);
const kidWalk1 = kidFrame([E14, ...KID_HEAD, ...KID_T_WALK_A, ...KID_L_STRIDE]);
const kidWalk2 = kidFrame([...KID_HEAD, ...KID_T_IDLE, ...KID_L_PASS]);
const kidWalk3 = kidFrame([E14, ...KID_HEAD, ...KID_T_WALK_C, ...KID_L_STRIDE]);
const KID_HEAD_TALK = setRow(KID_HEAD, 9, "..KKSSSSKRSK..");
const KID_HEAD_HAPPY = setRow(setRow(setRow(KID_HEAD, 6, ".KHHsSSSSSSSK."), 7, ".KHHsKKSSKKSK."), 9, "..KKSSSKWWKK..");

export const KID = {
  w: KID_W,
  h: 22,
  cx: 8,
  idle: kidIdle,
  idle2: kidFrame([E14, ...KID_HEAD.slice(0, 10), ...KID_T_IDLE, ...KID_L_IDLE]),
  talk: kidFrame([...KID_HEAD_TALK, ...KID_T_IDLE, ...KID_L_IDLE]),
  happy: kidFrame([...KID_HEAD_HAPPY, ...KID_T_IDLE, ...KID_L_IDLE]),
  walk1: kidWalk1,
  walk2: kidWalk2,
  walk: [kidWalk1, kidWalk2, kidWalk3, kidWalk2] as const,
  wave: waveOf(kidIdle, WAVE_UP),
  wave2: waveOf(kidIdle, WAVE_TILT),
} as const;

// ---------- ещё трое детей для «группы» ----------
// девочка с хвостиками (коралловое платье R, голубой рюкзак b)
const GIRL_HEAD = [
  ".....KKKKK......",
  "...KKHHHHHKK....",
  "..KHHHHHHHHHK...",
  "..KHHHHHHHHHHK..",
  ".KKHHHHHHHHHHKK.",
  "KYKHHHHSSSSSSKYK",
  "KHKHHsSKSSSKSKHK",
  "KHKHHsSKSSSKSKHK",
  "KHKKHSrSSSSSrKHK",
  "KHK.KKSSSSRRSKHK",
  ".K....KKKSSKK.K.",
];
const GIRL_T = [
  "...KKKRWWWRK....",
  "..KbbKRRWRRRK...",
  "..KbbKRKRRRKRK..",
  "..KbbKSKRRRKSK..",
  "..KbgKSKRRRKSK..",
  "..KKKKKRRRRRKK..",
  ".....KRRRRRRRK..",
];
const GIRL_L = [
  "......KwwKwwK...",
  "......KwwKwwK...",
  ".....KRRKKRRK...",
  ".....KKKK.KKK...",
];
// мальчик в очках (голубая рубашка b, тёмно-синие брюки, зелёный рюкзак G)
const GLASSES_HEAD = [
  "....KKKKKK....",
  "..KKHHHHHHK...",
  ".KHHHHHHHHHK..",
  ".KHHHHHHHHHHK.",
  ".KHHHHHHHHSSK.",
  ".KHHHbbbSbbbK.",
  ".KHHsbKbKbKbK.",
  ".KHHsbKbSbKbK.",
  "..KHSrSSSSSrK.",
  "..KKSSSSRRSK..",
  "....KKKSSKK...",
];
const GLASSES_T = [
  "..KKKbWWWbK...",
  ".KGGKbbWbbbK..",
  ".KGGKbKbbbKbK.",
  ".KGDKbKbbbKbK.",
  ".KGDKSKbbbKSK.",
  ".KKKKKKbbbKKK.",
];
const GLASSES_L = [
  "....KNNNNNK...",
  "....KNNKNNK...",
  "....KNNKNNK...",
  "...KWWKKWWK...",
  "...KKKK.KKK...",
];
// девочка с каре (фиолетовая кофта P, заколка P, жёлтый рюкзак y)
const BOB_HEAD = [
  "....KKKKK.....",
  "..KKHHHHHKK...",
  ".KHHHHHHHPPK..",
  ".KHHHHHHHPPHK.",
  ".KHHHHHHHHHHK.",
  ".KHHHHSSSSSSK.",
  ".KHHHSKSSSKSK.",
  ".KHHHSKSSSKSK.",
  ".KHHHrSSSSSrK.",
  ".KHHKSSSSRRSK.",
  "..KK.KKKSSKK..",
];
const BOB_T = [
  "..KKKPWWWPK...",
  ".KyyKPPWPPPK..",
  ".KyyKPKPWPKPK.",
  ".KyOKPKPWPKPK.",
  ".KyOKSKPWPKSK.",
  ".KKKKKKPPPKKK.",
];
const BOB_L = [
  "....KNNNNNK...",
  "....KSSKSSK...",
  "....KSSKSSK...",
  "...KPPKKPPK...",
  "...KKKK.KKK...",
];
const girlIdle = [...GIRL_HEAD, ...GIRL_T, ...GIRL_L];
const glassesIdle = kidFrame([...GLASSES_HEAD, ...GLASSES_T, ...GLASSES_L]);
const bobIdle = kidFrame([...BOB_HEAD, ...BOB_T, ...BOB_L]);
export const KIDS = {
  boy: { idle: KID.idle, wave: KID.wave, wave2: KID.wave2 },
  girl: { idle: girlIdle, wave: waveOf(girlIdle, WAVE_UP), wave2: waveOf(girlIdle, WAVE_TILT) },
  glasses: { idle: glassesIdle, wave: waveOf(glassesIdle, WAVE_UP), wave2: waveOf(glassesIdle, WAVE_TILT) },
  bob: { idle: bobIdle, wave: waveOf(bobIdle, WAVE_UP), wave2: waveOf(bobIdle, WAVE_TILT) },
} as const;
// порядок «группы»: главный мальчик, девочка с хвостиками, мальчик в очках, девочка с каре
export const KID_LIST = [KIDS.boy, KIDS.girl, KIDS.glasses, KIDS.bob] as const;

// ---------- жетоны для карты: головы 10×10 (тот же порядок) ----------
export const TOKENS = [
  [
    "..KKKKKK..",
    ".KHHHHHHK.",
    "KHHHHHHHHK",
    "KHHHSHSHSK",
    "KHSKSSSKSK",
    "KHSKSSSKSK",
    "KSrSSSSSrK",
    ".KSSSRRSK.",
    "..KKSSKK..",
    "....KK....",
  ],
  [
    "..KKKKKK..",
    ".KHHHHHHK.",
    "KHHHHHHHHK",
    "YHHHHHHHHY",
    "HKSKSSKSKH",
    "HKSKSSKSKH",
    "HKrSSSSrKH",
    "K.KSRRSK.K",
    "...KSSK...",
    "....KK....",
  ],
  [
    "..KKKKKK..",
    ".KHHHHHHK.",
    "KHHHHHHHHK",
    "KHHHHHSSSK",
    "KbbbKbbbSK",
    "KbKbKbKbSK",
    "KrSSSSSrSK",
    ".KSSRRSSK.",
    "..KKSSKK..",
    "....KK....",
  ],
  [
    "..KKKKKK..",
    ".KHHHHPPK.",
    "KHHHHHPPHK",
    "KHHHHHHHHK",
    "KHHSSSSHHK",
    "KHKSSSKSHK",
    "KHKSSSKSHK",
    "KHrSRRSrHK",
    ".KKSSSSKK.",
    "...KKKK...",
  ],
] as const;

// ======================================================================
// МАШИНА BalaGo: белая легковая, вид сбоку (капот справа), жёлтая полоса.
// Кузов 34×15 без колёс; колёса — отдельные кадры 7×7 (вращение: чередовать
// CAR.wheel[0] / [1]), позиции колёс — CAR.wheelAt (левый верхний угол
// колеса в пикселях спрайта). CAR.frames[i] — кузов с колёсами (готово).
// ======================================================================
const CAR_BODY = [
  "...........KKKKKKKKKKK............",
  "..........KbcbbbbKbbcbbK..........",
  ".........KbcbbbbbKbcbbbbK.........",
  "........KbcbbbbbbKcbbbbbbK........",
  "....KKKKWWWWWWWWWKWWWWWWWWKKKK....",
  "...KWWWWWWWWWWgWWKWWWWWgWWWWWWKK..",
  "..KRYYYYYYYYYYYYYKYYYYYYYYYYYYYyK.",
  "..KWWWWKKKKKWWWWWKWWWWWKKKKKWWWWK.",
  "..KWWWKKKKKKKWWWWKWWWWKKKKKKKWWWK.",
  "..KwwwKKKKKKKwwwwKwwwwKKKKKKKwgwK.",
  "...KKK.......KKKKKKKKK.......KKK..",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
];
const WHEEL_A = ["..KKK..", ".KgwgK.", "KggwggK", "KwwKwwK", "KggwggK", ".KgwgK.", "..KKK.."];
const WHEEL_B = ["..KKK..", ".KwggK.", "KgwgwgK", "KggKggK", "KgwgwgK", ".KggwK.", "..KKK.."];
const CAR_WHEEL_AT = [
  { x: 6, y: 8 },
  { x: 22, y: 8 },
] as const;
const carWith = (wheel: readonly string[]) => CAR_WHEEL_AT.reduce<string[]>((rows, p) => paint(rows, p.x, p.y, wheel), [...CAR_BODY]);
export const CAR = {
  w: 34,
  h: 15,
  body: CAR_BODY,
  wheel: [WHEEL_A, WHEEL_B] as const,
  wheelAt: CAR_WHEEL_AT,
  frames: [carWith(WHEEL_A), carWith(WHEEL_B)] as const,
} as const;

// ======================================================================
// ПРЕДМЕТЫ И ЗНАЧКИ
// ======================================================================
// Дом — советская панельная пятиэтажка (25×29), подъезд с козырьком
const HOUSE_FLOOR = (a: string, b: string) => [
  "KgggggggggggggggggggggggK",
  "KwKKKKwKKKKwwwKKKKwKKKKwK",
  `KwKb${a}KwKbcKwwwKb${b}KwKbcKwK`,
  "KwKbbKwKbbKwwwKbbKwKbbKwK",
  "KwKKKKwKKKKwwwKKKKwKKKKwK",
];
export const HOUSE: SpriteRows = [
  "KKKKKKKKKKKKKKKKKKKKKKKKK",
  "KgggggggggggggggggggggggK",
  ...HOUSE_FLOOR("c", "y"),
  ...HOUSE_FLOOR("y", "c"),
  ...HOUSE_FLOOR("c", "c"),
  ...HOUSE_FLOOR("c", "y"),
  "KgggggggggggggggggggggggK",
  "KwKKKKwwwKKKKKKKwwwKKKKwK",
  "KwKbcKwwKgggggggKwwKbyKwK",
  "KwKbbKwwwKTTTTTKwwwKbbKwK",
  "KwKKKKwwwKTTTyTKwwwKKKKwK",
  "KwwwwwwwwKTTTTTKwwwwwwwwK",
  "KKKKKKKKKKKKKKKKKKKKKKKKK",
];
// Школа — двухэтажное здание с часами на фронтоне и крыльцом, без флагов (33×23)
export const SCHOOL: SpriteRows = [
  "...............KKK...............",
  "............KKyKKKyKK............",
  "..........KKyyKWKWKyyKK..........",
  "........KKyyyyKWKKKyyyyKK........",
  "......KKyyyyyyKWWWKyyyyyyKK......",
  "....KKyyyyyyyyyKKKyyyyyyyyyKK....",
  ".KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.",
  "KRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRK",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
  "KyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyK",
  "KyKKKKKyKKKKKyKKKKKyKKKKKyKKKKKyK",
  "KyKbcbKyKbcbKyKbcbKyKbcbKyKbcbKyK",
  "KyKbbbKyKbbbKyKbbbKyKbbbKyKbbbKyK",
  "KyKKKKKyKKKKKyKKKKKyKKKKKyKKKKKyK",
  "KwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwK",
  "KyyyyyyyyyyyyKKKKKKKyyyyyyyyyyyyK",
  "KyKKKKKyKKKKKKgggggKKKKKKyKKKKKyK",
  "KyKbcbKyKbcbKyKbKbKyKbcbKyKbcbKyK",
  "KyKbbbKyKbbbKyKcKcKyKbbbKyKbbbKyK",
  "KyKKKKKyKKKKKyKbKbKyKKKKKyKKKKKyK",
  "KyyyyyyyyyyyyyKbKbKyyyyyyyyyyyyyK",
  "KwwwwwwwwwwwKgggggggKwwwwwwwwwwwK",
  "KKKKKKKKKKKwwwwwwwwwwwKKKKKKKKKKK",
];
// Часы 12×12 (стрелки: 12 и 3 часа)
export const CLOCK: SpriteRows = [
  "....KKKK....",
  "..KKYYYYKK..",
  ".KYYWWWWYYK.",
  ".KYWWWKWWYK.",
  "KYWWWWKWWWYK",
  "KYWWWWKWWWYK",
  "KYWWWWKKKWYK",
  "KYWWWWWWWWYK",
  ".KYWWWWWWYK.",
  ".KYYWWWWYYK.",
  "..KKYYYYKK..",
  "....KKKK....",
];
// Метка на карте 9×12 (жёлтая; другой цвет — prop recolor у Sprite)
export const PIN: SpriteRows = [
  "..KKKKK..",
  ".KYYYYYK.",
  "KYYWWWYOK",
  "KYWWWWWOK",
  "KYWWWWWOK",
  "KYYWWWYOK",
  ".KYYYYOK.",
  ".KYYYOOK.",
  "..KYYOK..",
  "..KYOOK..",
  "...KOK...",
  "....K....",
];
// Песочные часы 9×12 (ожидание, «до 2 недель»)
export const HOURGLASS: SpriteRows = [
  "KKKKKKKKK",
  "KTTTTTTTK",
  "KKKKKKKKK",
  ".KwYYYwK.",
  ".KwYYYwK.",
  "..KwYwK..",
  "...KYK...",
  "..KwYwK..",
  ".KwwYwwK.",
  ".KYYYYYK.",
  "KKKKKKKKK",
  "KTTTTTTTK",
];
// Замок 10×12: закрыт / открыт
export const LOCK_CLOSED: SpriteRows = [
  "..........",
  "...KKKK...",
  "..KggggK..",
  ".KgKKKKgK.",
  ".KgK..KgK.",
  "KKKKKKKKKK",
  "KYYYYYYYOK",
  "KYYYKKYYOK",
  "KYYYKKYYOK",
  "KYYYYKYYOK",
  "KOOOOOOOOK",
  "KKKKKKKKKK",
];
export const LOCK_OPEN: SpriteRows = [
  "...KKKK...",
  "..KggggK..",
  ".KgKKKKgK.",
  ".KKK..KgK.",
  "......KgK.",
  "KKKKKKKKKK",
  "KYYYYYYYOK",
  "KYYYKKYYOK",
  "KYYYKKYYOK",
  "KYYYYKYYOK",
  "KOOOOOOOOK",
  "KKKKKKKKKK",
];
// Подарок 12×12 (для «это не подарок из игры» — сцена может перечеркнуть)
export const GIFT: SpriteRows = [
  "...KK..KK...",
  "..KYYKKYYK..",
  "..KYKYYKYK..",
  "KKKKKYYKKKKK",
  "KRRRKYYKRRRK",
  "KKKKKYYKKKKK",
  ".KRRKYYKRRK.",
  ".KRRKYYKRRK.",
  ".KRRKYYKRRK.",
  ".KRRKYYKRRK.",
  ".KRRKYYKRRK.",
  ".KKKKKKKKKK.",
];
// Лист с данными 10×12 (загнутый уголок, строки)
export const DOC: SpriteRows = [
  "KKKKKKK...",
  "KWWWWWKK..",
  "KWWWWWKwK.",
  "KWKKKWKKKK",
  "KWWWWWWWWK",
  "KWKKKKKKWK",
  "KWWWWWWWWK",
  "KWKKKKKWWK",
  "KWWWWWWWWK",
  "KWYYYYKKWK",
  "KWWWWWWWWK",
  "KKKKKKKKKK",
];
// Галочка 9×8 (зелёная) и мягкий крестик 8×8 (коралловый)
export const CHECK: SpriteRows = [
  "......KKK",
  ".....KGGK",
  "KKK.KGGK.",
  "KGGKKGGK.",
  "KKGGGGK..",
  ".KKGGGK..",
  "..KKGK...",
  "...KKK...",
];
export const CROSS: SpriteRows = [
  ".KK..KK.",
  "KRRKKRRK",
  "KKRRRRKK",
  ".KKRRKK.",
  ".KKRRKK.",
  "KKRRRRKK",
  "KRRKKRRK",
  ".KK..KK.",
];
// Звёздочка 9×9
export const STAR: SpriteRows = [
  "....K....",
  "...KYK...",
  "KKKKYKKKK",
  "KYYYyYYYK",
  ".KYYYYYK.",
  "..KYYYK..",
  ".KYYOYYK.",
  "KYOK.KOYK",
  "KKK...KKK",
];
// Курсор-рука 11×12 и нажатая (палец короче, вспышка — отдельно сценой)
export const CURSOR: SpriteRows = [
  "...KK......",
  "..KWWK.....",
  "..KWWK.....",
  "..KWWK.....",
  "..KWWKKK...",
  "..KWWKWWKK.",
  "KKKWWKWWKWK",
  "KWKWWWWWWWK",
  "KWWWWWWWWWK",
  ".KWWWWWWWwK",
  "..KWWWWWwK.",
  "...KKKKKK..",
];
export const CURSOR_PRESSED: SpriteRows = [
  "...........",
  "...........",
  "...KK......",
  "..KWWK.....",
  "..KWWKKK...",
  "..KWWKWWKK.",
  "KKKWWKWWKWK",
  "KWKWWWWWWWK",
  "KWWWWWWWWWK",
  ".KWWWWWWWwK",
  "..KWWWWWwK.",
  "...KKKKKK..",
];
// Тополь 7×20 (бишкекские тополя вдоль дорог)
export const POPLAR: SpriteRows = [
  "...K...",
  "..KLK..",
  "..KLK..",
  ".KLGGK.",
  ".KLGGK.",
  ".KLGDK.",
  "KLLGGDK",
  "KLGGGDK",
  "KLGGDDK",
  "KLGGGDK",
  "KLLGGDK",
  "KLGGDDK",
  "KLGGGDK",
  ".KGGDK.",
  ".KLGDK.",
  "..KGK..",
  "..KTK..",
  "..KTK..",
  "..KTK..",
  "..KKK..",
];
// Облако 20×8 (без контура — мягкое на светлом небе)
export const CLOUD: SpriteRows = [
  "......WWWW..........",
  "....WWWWWWWW..WWW...",
  "...WWWWWWWWWWWWWWW..",
  ".WWWWWWWWWWWWWWWWWW.",
  "WWWWWWWWWWWWWWWWWWWW",
  "WWWWWWWWWWWWWWWWWWWW",
  ".ccccccccccccccccccc",
  "...cccccccccccccc...",
];
// Куст 12×6
export const BUSH: SpriteRows = [
  "...KKK.KKK..",
  "..KLLGKLLGK.",
  ".KLLGGGLGGDK",
  "KLGGGGGGGGDK",
  "KGGGGGDGGDDK",
  "KKKKKKKKKKKK",
];
