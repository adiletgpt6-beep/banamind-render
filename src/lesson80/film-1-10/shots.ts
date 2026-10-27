// Монтажный план фильма 80-1-10: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, действия). Общий план объясняет пространство,
// средний — разговор, крупный — реакции, вид сверху на стол — рисование,
// заголовок, карточки и сборку; крупный план лодочки — сгиб и его
// восстановление (непрерывно, без склейки в момент исправления). Склейки
// спокойные; мягкий наплыв — только при смене этапа сборки (время сжато).
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import { AT_BOARD, AT_TABLE } from "./layout.ts";
import type { Plan } from "./plan.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "desk" | "boat";
export type DeskCamName = "poster" | "title" | "textOne" | "textTwo" | "yusufCard" | "amirCard" | "bilalCard" | "three" | "treeCard" | "folder" | "assembly";
export type ShotSpec = {
  readonly from: number; // кадры, [from, to)
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly desk?: DeskCamName;
  readonly dissolve?: number; // кадров наплыва в начале
  readonly freezeFrom?: number; // кадр, до которого план показывает «будущее» (сжатие времени при наплыве)
  readonly label: string;
};

export const CAM = {
  wide: { x: 1420, y: 870, zoom: 0.74 },
  wideIn: { x: 1560, y: 930, zoom: 0.86 },
  classWide: { x: 1080, y: 1000, zoom: 1.0 },
  classRight: { x: 1460, y: 1060, zoom: 1.45 },
  birdPass: { x: 1680, y: 1110, zoom: 2.0 },
  table: { x: 2060, y: 1080, zoom: 1.15 },
  boys: { x: 1975, y: 1090, zoom: 1.55 },
  teacherYusuf: { x: 2205, y: 1050, zoom: 1.6 },
  amirYusuf: { x: 2040, y: 1085, zoom: 2.0 },
  // на высоте детей: Юсуф и лодочка на столе; учитель срезан по плечи, а не по лицу
  yusuf: { x: 2110, y: 1175, zoom: 3.1 },
  amir: { x: AT_TABLE.amir.x + 10, y: 1065, zoom: 2.8 },
  bilal: { x: AT_TABLE.bilal.x + 10, y: 1040, zoom: 2.7 },
  teacher: { x: 2290, y: 1010, zoom: 1.9 },
  teacherMed: { x: 2235, y: 1000, zoom: 1.5 },
  boardMed: { x: 760, y: 640, zoom: 1.12 },
  board: { x: 700, y: 520, zoom: 1.55 },
  boardYusuf: { x: 980, y: 600, zoom: 2.0 },
  boardAmir: { x: 900, y: 560, zoom: 2.0 },
  boardBilal: { x: 840, y: 540, zoom: 2.0 },
  boardBoys: { x: 960, y: 600, zoom: 1.7 },
  finalWide: { x: 1240, y: 830, zoom: 0.79 },
} as const satisfies Record<string, Cam>;

const s2f = (s: number) => Math.round(s * FPS);
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const ease = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const push = (a: Cam, b: Cam, from: number, to: number) => (f: number) => mix(a, b, ease((f - from) / Math.max(1, to - from)));

export const buildShots = (tl: L80Timeline, pl: Plan, teacherX: (f: number) => number): ShotSpec[] => {
  const L = (id: number) => {
    const c = cueById(tl, id);
    return { from: s2f(c.from), to: s2f(c.to) };
  };
  const M = (label: string) => {
    const m = markOf(tl, label);
    return { from: s2f(m.from), to: s2f(m.to) };
  };
  const P = (id: string) => {
    const p = tl.pauses.find((x) => x.id === id)!;
    return { from: s2f(p.from), to: s2f(p.to) };
  };
  const end = tl.durationInFrames;
  const shots: ShotSpec[] = [];
  let cursor = 0;
  // план до кадра to (начало — конец предыдущего плана)
  const add = (to: number, kind: ShotKind, label: string, extra: Partial<ShotSpec> = {}) => {
    if (to <= cursor) return;
    shots.push({ from: cursor, to, kind, label, ...extra });
    cursor = to;
  };
  const room = (to: number, label: string, cam: Cam | ((f: number) => Cam), extra: Partial<ShotSpec> = {}) => add(to, "room", label, { cam, ...extra });
  const desk = (to: number, label: string, d: DeskCamName, extra: Partial<ShotSpec> = {}) => add(to, "desk", label, { desk: d, ...extra });
  const boat = (to: number, label: string, extra: Partial<ShotSpec> = {}) => add(to, "boat", label, extra);

  // ---------- сцена 1 ----------
  const s1 = M("общий план: лист");
  const l1 = L(1);
  const l1mid = l1.from + Math.round((l1.to - l1.from) * 0.55);
  room(l1mid, "общий план: учитель расправляет лист", push(CAM.wide, CAM.wideIn, s2f(0.6), l1mid));
  room(l1.to + s2f(0.3), "класс: у каждого карточка", push({ x: 760, y: 1010, zoom: 1.25 }, { x: 1420, y: 1030, zoom: 1.25 }, l1mid, l1.to + s2f(0.3)));
  room(L(5).to + s2f(0.3), "учитель и мальчики: карточки и карандаши", push(CAM.table, CAM.boys, pl.deal.to, L(4).to));
  void s1;
  const dY = M("рисует Юсуф");
  const dA = M("рисует Амир");
  const dB = M("рисует Билал");
  desk(dY.to, "яблоко Юсуфа", "yusufCard");
  desk(dA.to, "дерево Амира", "amirCard");
  desk(dB.to, "Земля Билала", "bilalCard");
  room(M("класс рисует").to, "класс рисует", push(CAM.classWide, { x: 1240, y: 1020, zoom: 1.05 }, M("класс рисует").from, M("класс рисует").to));

  // ---------- сцена 2 ----------
  desk(M("рисунки готовы").to, "Юсуф дорисовывает яблоко", "yusufCard");
  const p1 = P("pause01");
  desk(p1.from + s2f(2.6), "три рисунка на листе; вопрос", "three");
  room(L(8).to + s2f(0.3), "пауза 1 → Юсуф: Аллах! → учитель", CAM.teacherYusuf);
  room(pl.write.start - 2, "Амир: и нас тоже; учитель берёт маркер", CAM.amirYusuf);
  desk(M("заголовок пишется").to, "заголовок пишется", "title");
  const tg = M("заголовок готов");
  room(tg.from + Math.round((tg.to - tg.from) * 0.5), "реакция мальчиков", CAM.boys);
  desk(tg.to, "три рисунка под заголовком", "poster");

  // ---------- сцена 3 ----------
  const bird = M("птица от ученика");
  room(bird.from + s2f(2.1), "ученик передаёт птицу", CAM.birdPass);
  desk(bird.to, "птица рядом с Землёй", "three");
  room(L(11).to + s2f(0.3), "Билал: такие разные", CAM.bilal);
  room(L(12).to, "учитель: сколько Создателей?", CAM.teacherMed);
  const p2 = P("pause02");
  desk(p2.from + s2f(2.5), "пауза 2: рисунки и заголовок", "poster");
  room(L(14).to + s2f(0.3), "пауза 2 → Амир: Один! → учитель: Аллах Един", CAM.boys);
  desk(M("карточка «Аллах Един»").to, "карточка «Аллах Един»", "textOne");
  room(M("рассматривают рисунки").to, "мальчики рассматривают рисунки", CAM.boys);

  // ---------- сцена 4 ----------
  const fo = M("Юсуф и папка");
  desk(fo.from + s2f(2.2), "ладонь на закрытой папке", "folder");
  room(L(18).to, "Юсуф и учитель: вопрос из папки", CAM.teacherYusuf);
  const p3 = P("pause03");
  desk(p3.from + s2f(2.4), "пауза 3: закрытая папка", "folder");
  room(L(19).to + s2f(0.4), "пауза 3 → Юсуф: Аллаха никто не создал", CAM.yusuf);
  room(L(22).to + s2f(0.3), "учитель и Билал: у Аллаха нет начала", CAM.table);
  desk(M("карточка «У Аллаха нет начала»").to, "карточка «У Аллаха нет начала»", "textTwo");

  // ---------- сцена 5 ----------
  boat(M("лодочка к карточке").to, "Амир ставит лодочку рядом с карточкой дерева");
  room(L(25).to + s2f(0.3), "Юсуф и Амир: а ты тоже Создатель?", CAM.amirYusuf);
  const l26 = L(26);
  room(l26.from + Math.round((l26.to - l26.from) * 0.45), "учитель: из готовой бумаги", CAM.teacherYusuf);
  boat(l26.to + s2f(0.3), "складки бумажной лодочки");
  room(L(28).to - s2f(0.6), "Билал и Амир: создал Аллах; подпишем", CAM.boys);
  desk(M("свободное место на карточке").to, "свободное место внизу карточки", "treeCard");

  // ---------- сцена 6 ----------
  boat(M("Юсуф берёт лодочку").to, "Юсуф берёт лодочку: уголок разогнулся");
  room(L(29).to + s2f(0.3), "Юсуф: я испортил?", CAM.yusuf);
  room(L(31).to, "Амир садится рядом; учитель: как можно помочь?", CAM.teacherYusuf);
  const p4 = P("pause04");
  room(p4.from + s2f(2.4), "пауза 4: смотрят на лодочку", CAM.amirYusuf);
  // непрерывный план исправления: с середины паузы до того, как лодочка держит форму
  boat(M("лодочка держит форму").to, "непрерывное исправление сгиба");
  room(M("спокойные лица").to, "спокойные лица", CAM.amirYusuf);

  // ---------- сцена 7 ----------
  room(L(36).to + s2f(0.2), "спасибо, Амир", CAM.amirYusuf);
  desk(M("подпись под лодочкой").to, "лодочку рисуют вместе, подпись", "treeCard");
  desk(M("карточка Амира").to, "карточка Амира", "treeCard");
  room(L(37).to + s2f(0.5), "Билал: можно собирать", CAM.boys);
  const pass = M("сборка: карточки передают");
  room(pass.to, "ряды передают стопки, Билал собирает", push(CAM.classWide, CAM.classRight, pass.from, pass.from + Math.round((pass.to - pass.from) * 0.6)));
  room(L(38).to + s2f(0.2), "учитель закрепляет, мальчики держат лист", CAM.table);
  desk(pl.lapse.from, "карточки закрепляют", "assembly");
  desk(M("сетка готова").to, "сетка готова", "poster", { dissolve: pl.lapse.at - pl.lapse.from, freezeFrom: pl.lapse.at });
  room(L(39).to + s2f(0.3), "Юсуф: Альхамдулиллях", CAM.yusuf);

  // ---------- сцена 8 ----------
  const tb = M("к доске");
  const lift = M("учитель поднимает лист");
  const follow = (f: number): Cam => {
    if (f < lift.to) return CAM.teacherMed;
    const x = Math.max(820, Math.min(2120, teacherX(f) - 60));
    const u = Math.max(0, Math.min(1, (f - lift.to) / Math.max(1, tb.to - lift.to)));
    const k = ease(Math.min(1, (f - lift.to) / s2f(1.2)));
    return mix(CAM.teacherMed, { x, y: 900 - 160 * ease(u), zoom: 1.0 + 0.1 * ease(u) }, k);
  };
  room(tb.to, "учитель поднимает лист и несёт к доске", follow);
  const hg = M("крепит на доске");
  room(L(40).to + s2f(0.3), "плакат на доске; учитель: каждый добавил своё", push({ x: 820, y: 740, zoom: 1.1 }, CAM.boardMed, hg.from, hg.to));
  room(L(41).to + s2f(0.3), "Юсуф: рисунки сделали мы", CAM.boardYusuf);
  room(L(43).to + s2f(0.2), "Амир и Билал: Он Един, у Него нет начала", CAM.boardBoys);
  const l44 = L(44);
  // реплика 44 — средний план у доски, затем мягкий отъезд к общему плану;
  // общий план готов к концу реплики и держится до конца фильма
  room(end, "финал: общий план", (f) => (f < l44.from ? CAM.boardMed : mix(CAM.boardMed, CAM.finalWide, ease((f - l44.from) / Math.max(1, l44.to + s2f(0.2) - l44.from)))));
  void AT_BOARD;
  return shots;
};

export const shotAt = (shots: readonly ShotSpec[], f: number): ShotSpec => {
  for (const s of shots) if (f >= s.from && f < s.to) return s;
  return shots[shots.length - 1];
};
