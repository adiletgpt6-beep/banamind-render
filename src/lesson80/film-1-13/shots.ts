// Монтажный план фильма 80-1-13: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, действия). Общий план объясняет пространство (где
// доска, где полка, почему учитель не видит книжку), средний — разговор,
// крупный — вопросы Юсуфа и реакции, деталь — руки с деталями и книжки на
// полке. Склейки спокойные, без вспышек и шторок; камера движется плавно
// (вход и выход), в статичных планах едва «дышит». Ракурс — всегда обычная
// камера комнаты (никакого «взгляда сверху» в разговоре об Аллахе; вид сверху
// есть только на руки Амира с деталями в сцене 1).
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import { easeInOut } from "../rig/motion.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "top";
export type TopCam = { readonly u: number; readonly w: number; readonly k: number };
export type ShotSpec = {
  readonly from: number;
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly top?: TopCam | ((f: number) => TopCam);
  readonly dissolve?: number;
  readonly label: string;
};

export const CAM = {
  wide: { x: 1300, y: 760, zoom: 0.74 },
  // Амир за столом, полка и Юсуф у полки
  pack: { x: 1830, y: 1070, zoom: 1.7 },
  // учитель у доски и полка у него за спиной — ясно, почему он не видит книжку
  board: { x: 1230, y: 762, zoom: 1.1 },
  // Амир несёт коробку к полке
  carry: { x: 1720, y: 1060, zoom: 1.75 },
  shelfYusuf: { x: 1520, y: 1080, zoom: 2.15 },
  pick: { x: 1450, y: 1065, zoom: 2.1 },
  place: { x: 1470, y: 1030, zoom: 2.3 },
  walkT: { x: 1200, y: 860, zoom: 1.5 },
  // разговор: учитель на ковре, Юсуф стоит перед ним, Билал и Амир рядом
  group: { x: 1190, y: 885, zoom: 1.83 },
  groupWide: { x: 1190, y: 860, zoom: 1.45 },
  yusufTeacher: { x: 1165, y: 790, zoom: 2.8 },
  yusufCU: { x: 1236, y: 786, zoom: 3.3 },
  teacherCU: { x: 1112, y: 740, zoom: 3.1 },
  teacherCU2: { x: 1116, y: 745, zoom: 3.35 },
  bilalCU: { x: 1010, y: 925, zoom: 3.0 },
  amirCU: { x: 1394, y: 770, zoom: 3.0 },
  boys: { x: 1330, y: 820, zoom: 2.6 }, // Юсуф и Амир
  shelfInsert: { x: 1566, y: 1100, zoom: 3.3 },
  pencils: { x: 620, y: 1260, zoom: 3.2 },
  tableWide: { x: 1540, y: 1010, zoom: 1.45 },
  tableMed: { x: 1660, y: 1020, zoom: 1.7 },
  shelfBoys: { x: 1700, y: 930, zoom: 2.1 },
  teacherBilal: { x: 1060, y: 830, zoom: 2.4 },
  final: { x: 1300, y: 770, zoom: 0.74 },
} as const satisfies Record<string, Cam>;

export const TOP = {
  pack: { u: 1950, w: 132, k: 5.0 },
} as const satisfies Record<string, TopCam>;

const s2f = (s: number) => Math.round(s * FPS);
const camHold = (f: number, c: Cam, amp = 0.004): Cam => ({
  x: c.x + Math.sin(f / 97) * amp * 400,
  y: c.y + Math.cos(f / 131) * amp * 260,
  zoom: c.zoom * (1 + Math.sin(f / 151) * amp),
});
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const hold = (c: Cam) => (f: number) => camHold(f, c, 0.0025);
const move = (a: Cam, b: Cam, from: number, to: number) => (f: number) => camHold(f, mix(a, b, easeInOut((f - from) / Math.max(1, to - from))), 0.0015);
// неподвижный план (паузы: 5 с устойчивого кадра)
const still = (c: Cam) => () => c;

export const buildShots = (tl: L80Timeline): ShotSpec[] => {
  const L = (id: number) => {
    const c = cueById(tl, id);
    return { from: s2f(c.from), to: s2f(c.to) };
  };
  const M = (label: string) => {
    const m = markOf(tl, label);
    return { from: s2f(m.from), to: s2f(m.to) };
  };
  const P = (i: number) => ({ from: s2f(tl.pauses[i].from), to: s2f(tl.pauses[i].to) });
  const end = tl.durationInFrames;
  const shots: ShotSpec[] = [];
  const room = (from: number, to: number, label: string, cam: Cam | ((f: number) => Cam), extra: Partial<ShotSpec> = {}) => {
    if (to > from) shots.push({ from, to, kind: "room", label, cam: typeof cam === "function" ? cam : hold(cam), ...extra });
  };
  const top = (from: number, to: number, label: string, t: TopCam) => {
    if (to > from) shots.push({ from, to, kind: "top", label, top: t });
  };

  // ---------- сцена 1: незаметная помощь ----------
  const pack = M("Амир кладёт детали");
  const close = M("Амир закрывает коробку");
  const notice = M("Юсуф замечает книжку");
  const approach = M("Юсуф подходит к книжке");
  const pick = M("Юсуф поднимает книжку");
  const placeG = M("Юсуф ставит книжку");
  room(0, pack.from + s2f(0.9), "комната: класс, доска, полка, стол", CAM.wide);
  room(pack.from + s2f(0.9), pack.from + s2f(3.5), "Амир убирает детали", CAM.pack);
  top(pack.from + s2f(3.5), close.to, "руки: детали в коробку, крышка", TOP.pack);
  room(close.to, L(1).to + s2f(0.35), "учитель у доски благодарит Амира", CAM.board);
  room(L(1).to + s2f(0.35), L(2).to + s2f(0.4), "Амир несёт коробку на полку", CAM.carry);
  room(L(2).to + s2f(0.4), approach.to - s2f(0.2), "Юсуф замечает книжку", CAM.shelfYusuf);
  room(approach.to - s2f(0.2), pick.to + s2f(0.2), "Юсуф поднимает книжку", CAM.pick);
  room(pick.to + s2f(0.2), placeG.to, "Юсуф ставит книжку на полку", CAM.place);
  void notice;

  // ---------- сцена 2: А Аллах видел? ----------
  const toT = M("Юсуф идёт к учителю");
  const sitT = M("учитель садится");
  const p1 = P(0);
  room(toT.from, sitT.to, "Юсуф подходит к учителю у доски; учитель садится", move(CAM.board, CAM.walkT, toT.from, sitT.from));
  room(sitT.to, L(5).to + s2f(0.3), "Юсуф рассказывает учителю и спрашивает «А Аллах видел?»", CAM.yusufTeacher);
  room(L(5).to + s2f(0.3), p1.to, "вопрос классу и пауза P1", still(CAM.groupWide));
  room(p1.to, L(7).to + s2f(0.3), "Билал отвечает", CAM.bilalCU);
  room(L(7).to + s2f(0.3), L(8).to + s2f(0.5), "учитель: цитата", move(CAM.teacherCU, CAM.teacherCU2, L(8).from, L(8).to));

  // ---------- сцена 3: добро приносит пользу ----------
  const lookShelf = M("Юсуф смотрит на полку");
  const amirLook = M("Амир смотрит на полку");
  const insert = M("книжка на полке");
  const smile = M("Юсуф улыбается");
  room(L(8).to + s2f(0.5), amirLook.from, "Юсуф смотрит на полку и уточняет; учитель отвечает", CAM.yusufTeacher);
  room(amirLook.from, L(11).to + s2f(0.1), "Амир смотрит на полку", CAM.amirCU);
  room(L(11).to + s2f(0.1), insert.to, "книжка на полке", CAM.shelfInsert);
  room(insert.to, smile.to, "учитель благодарит Юсуфа", CAM.yusufTeacher);
  void lookShelf;

  // ---------- сцена 4: даже маленькое добро ----------
  const compare = M("Юсуф смотрит на книжку и коробку");
  const think = M("дети думают");
  room(compare.from, L(13).to + s2f(0.4), "Юсуф: «только поднял книжку»", CAM.yusufCU);
  room(L(13).to + s2f(0.4), L(14).to + s2f(0.6), "учитель: малое добро", move(CAM.teacherCU, CAM.teacherCU2, L(14).from, L(14).to));
  room(L(14).to + s2f(0.6), think.to, "«Совсем маленькое?» — «Да»; Билал делает вывод", CAM.group);

  // ---------- сцена 5: что мы можем сделать? ----------
  const show = M("учитель показывает комнату");
  const p2 = P(1);
  const pencils = M("карандаши");
  const amirSmile = M("Амир улыбается");
  const smiles = M("улыбки");
  room(show.from, L(19).to + s2f(0.2), "вопрос классу, пауза P2, Амир: карандаши", (f) => (f <= p2.to ? CAM.groupWide : hold(CAM.groupWide)(f)));
  room(L(19).to + s2f(0.2), pencils.to, "карандаши на ковре", CAM.pencils);
  room(pencils.to, smiles.to, "Билал: спросить; Юсуф улыбается другу; учитель: улыбка — добро", CAM.group);
  void amirSmile;

  // ---------- сцена 6: можно радоваться благодарности ----------
  const amirGo = M("Амир идёт к столику");
  room(smiles.to, L(23).to + s2f(0.3), "Юсуф: «а если похвалят?»", CAM.yusufCU);
  room(L(23).to + s2f(0.3), L(24).to + s2f(0.5), "учитель: похвала может радовать", CAM.teacherCU);
  room(L(24).to + s2f(0.5), L(27).to + s2f(0.5), "Билал и учитель: намерение; Юсуф: «чтобы другу было легче»", CAM.group);
  room(L(27).to + s2f(0.5), amirGo.to, "Амир идёт к столику", CAM.tableWide);

  // ---------- сцена 7: помочь ещё раз ----------
  const allLook = M("все смотрят на столик");
  const p3 = P(2);
  const yWalk = M("Юсуф идёт к столику");
  const each = M("мальчики смотрят друг на друга");
  room(amirGo.to, allLook.from, "Амир переносит две книжки", CAM.tableMed);
  // вопрос, пауза P3, ответ Юсуфа и его путь к столику — один план (в паузе камера неподвижна)
  room(allLook.from, yWalk.to - s2f(0.6), "вопрос классу, пауза P3, «Я отнесу эту книжку», Юсуф идёт к столику", (f) => (f <= p3.to ? CAM.tableWide : hold(CAM.tableWide)(f)));
  room(yWalk.to - s2f(0.6), each.to, "Юсуф переносит красную книжку", CAM.tableMed);

  // ---------- сцена 8: добро имеет значение ----------
  const ret = M("дети возвращаются");
  const pull = M("камера отходит");
  room(each.to, L(32).to + s2f(0.4), "мальчики у полки", CAM.shelfBoys);
  room(L(32).to + s2f(0.4), L(34).to + s2f(0.4), "учитель и Билал", CAM.teacherBilal);
  room(L(34).to + s2f(0.4), ret.from + s2f(1.2), "Юсуф: «Теперь всё на месте!»", CAM.shelfBoys);
  room(ret.from + s2f(1.2), end, "дети возвращаются, камера отходит к общему плану", move(CAM.tableWide, CAM.final, ret.from + s2f(1.4), pull.to));
  // непрерывность: без зазоров и наложений
  shots.sort((a, b) => a.from - b.from);
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i];
    const b = shots[i + 1];
    if (b.from !== a.to) shots[i] = { ...a, to: b.from };
  }
  return shots.filter((s) => s.to > s.from);
};

export const shotAt = (shots: readonly ShotSpec[], f: number): ShotSpec => {
  for (const s of shots) if (f >= s.from && f < s.to) return s;
  return shots[shots.length - 1];
};
