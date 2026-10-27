// Монтажный план фильма 80-1-12: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, действия). Общий план объясняет пространство,
// средний — разговор, крупный — переживания Юсуфа и короткие реплики детей,
// вид сверху — устройство картинки и каждое действие рук с деталями.
// Склейки спокойные, без вспышек, шторок и цифровых наездов; камера в
// комнате движется плавно (вход и выход), в статичных планах едва «дышит».
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import { easeInOut } from "../rig/motion.ts";
import { SEAT } from "./layout.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "top";
export type TopCam = { readonly u: number; readonly w: number; readonly k: number };
export type ShotSpec = {
  readonly from: number; // кадры
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly top?: TopCam | ((f: number) => TopCam);
  readonly dissolve?: number; // кадров наплыва в начале
  readonly label: string;
};

export const CAM = {
  wide: { x: 1390, y: 800, zoom: 0.72 },
  establish: { x: 1240, y: 830, zoom: 0.78 },
  tableMed: { x: 2220, y: 1090, zoom: 1.6 },
  // Юсуф крупно: он в левой трети кадра, справа — Амир; учитель слева за кадром
  yusufMed: { x: 2262, y: 1150, zoom: 2.6 },
  yusufCU: { x: 2105, y: 1134, zoom: 3.8 }, // Юсуф слева, Амир справа целиком в кадре; учитель за кадром
  amirCU0: { x: SEAT.amirStart.x, y: 1082, zoom: 3.1 },
  amirCU: { x: SEAT.amirNear.x + 20, y: 1104, zoom: 3.1 }, // стол с коробкой виден внизу, без касательной к краю кадра
  yusufAmir0: { x: 2185, y: 1128, zoom: 2.3 },
  yusufAmir: { x: 2188, y: 1128, zoom: 2.95 },
  amirMed: { x: 2172, y: 1130, zoom: 2.6 }, // Амир, Юсуф и картинка на столе
  askTeacher: { x: 1760, y: 845, zoom: 1.12 },
  walkA: { x: 1690, y: 850, zoom: 1.1 },
  walkB: { x: 1880, y: 1045, zoom: 1.95 }, // в конце посадки столешница видна целиком, не полоской у края
  // до того как Амир придвинулся: узко (Амир на старом месте за кадром)
  teacherYusuf0: { x: 1820, y: 1010, zoom: 2.5 },
  // после: шире — Амир рядом, карточка «Проверить росток» целиком
  teacherYusuf: { x: 1880, y: 1010, zoom: 2.2 },
  teacherCU: { x: 1665, y: 935, zoom: 3.1 },
  bilalCU: { x: SEAT.bilal.x + 56, y: 960, zoom: 3.0 },
  bilalTeacher: { x: 1680, y: 1000, zoom: 2.1 },
  group: { x: 1800, y: 1035, zoom: 1.6 },
  trio: { x: 2000, y: 1055, zoom: 1.95 },
  scoot: { x: 2050, y: 1040, zoom: 1.85 },
  friends: { x: 1880, y: 1035, zoom: 1.5 },
  classMid: { x: 860, y: 860, zoom: 1.25 },
} as const satisfies Record<string, Cam>;

export const TOP = {
  hands: { u: 2041, w: 98, k: 6.2 },
  puzzle: { u: 2029, w: 106, k: 5.3 },
  leaf: { u: 2053, w: 110, k: 6.4 },
  // поворот: деталь в руках перед картинкой и путь к гнезду — целиком в кадре
  turn: { u: 2040, w: 132, k: 6.2 },
  right: { u: 1979, w: 106, k: 5.8 },
  edge: { u: 2021, w: 118, k: 6.0 },
} as const satisfies Record<string, TopCam>;

const s2f = (s: number) => Math.round(s * FPS);
// Едва заметное «дыхание» статичного плана (как camHold в core/shots.tsx;
// здесь — без зависимости от React, чтобы план читали Node-скрипты и тесты).
const camHold = (f: number, c: Cam, amp = 0.004): Cam => ({
  x: c.x + Math.sin(f / 97) * amp * 400,
  y: c.y + Math.cos(f / 131) * amp * 260,
  zoom: c.zoom * (1 + Math.sin(f / 151) * amp),
});
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const hold = (c: Cam) => (f: number) => camHold(f, c, 0.0025);
const move = (a: Cam, b: Cam, from: number, to: number) => (f: number) => camHold(f, mix(a, b, easeInOut((f - from) / Math.max(1, to - from))), 0.0015);

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
  const top = (from: number, to: number, label: string, t: TopCam | ((f: number) => TopCam), extra: Partial<ShotSpec> = {}) => {
    if (to > from) shots.push({ from, to, kind: "top", label, top: t, ...extra });
  };

  // ---------- сцена 1: тихая просьба ----------
  const study = M("Юсуф рассматривает картинку");
  const take = M("Юсуф берёт деталь");
  const aside = M("Юсуф откладывает деталь");
  const look = M("Юсуф смотрит на картинку");
  room(0, study.from + s2f(0.5), "комната: свет из окна на столе", move(CAM.establish, CAM.tableMed, s2f(0.6), study.from + s2f(0.4)));
  room(study.from + s2f(0.5), take.from + s2f(0.3), "Юсуф рассматривает картинку", CAM.yusufMed);
  top(take.from + s2f(0.3), aside.to, "руки: деталь не подходит, отложена", TOP.hands);
  room(aside.to, L(1).to + s2f(0.5), "Юсуф: тихая просьба", CAM.yusufCU);
  room(L(1).to + s2f(0.5), L(2).to + s2f(0.25), "Амир поднимает голову", CAM.amirCU0);
  room(L(2).to + s2f(0.25), L(3).to + s2f(0.3), "Юсуф отвечает Амиру", CAM.yusufAmir0);
  room(L(3).to + s2f(0.3), L(4).to + s2f(0.8), "Юсуф спрашивает учителя", CAM.askTeacher);
  void look;

  // ---------- сцена 2: Аллах слышит ----------
  void M("учитель подходит");
  const sit = M("учитель садится");
  const book = M("Билал откладывает книгу");
  const p1 = P(0);
  room(L(4).to + s2f(0.8), sit.to, "учитель подходит и садится рядом", move(CAM.walkA, CAM.walkB, sit.from, sit.to));
  room(sit.to, book.to, "Билал откладывает книгу", CAM.bilalTeacher);
  room(book.to, p1.from + s2f(2.6), "вопрос классу и пауза P1", CAM.group);
  room(p1.from + s2f(2.6), p1.to - s2f(0.2), "пауза P1: Юсуф думает", CAM.yusufCU);
  room(p1.to - s2f(0.2), L(6).to + s2f(0.4), "Билал отвечает", CAM.bilalCU);
  const l7 = L(7);
  const mid7 = l7.from + Math.round((l7.to - l7.from) * 0.42);
  room(L(6).to + s2f(0.4), mid7, "учитель: Аллах назван Слышащим", CAM.teacherYusuf0);
  room(mid7, L(8).to + s2f(0.3), "реакция Юсуфа: даже тихо-тихо?", CAM.yusufCU);
  const calm = M("Юсуф успокаивается");
  room(L(8).to + s2f(0.3), calm.from + s2f(0.5), "учитель: да", CAM.teacherYusuf0);
  room(calm.from + s2f(0.5), calm.to, "Юсуф успокаивается и смотрит на картинку", CAM.yusufMed);

  // ---------- сцена 3: что такое дуа ----------
  room(calm.to, L(10).to + s2f(0.4), "групповой план: дуа", CAM.trio);
  room(L(10).to + s2f(0.4), L(11).to + s2f(0.3), "Юсуф: уже сделал дуа?", CAM.yusufCU);
  room(L(11).to + s2f(0.3), L(12).to + s2f(0.4), "учитель отвечает", CAM.teacherYusuf0);
  room(L(12).to + s2f(0.4), L(13).to + s2f(0.3), "Билал: о чём можно просить?", CAM.bilalCU);
  const l14 = L(14);
  const mid14 = l14.from + Math.round((l14.to - l14.from) * 0.55);
  room(L(13).to + s2f(0.3), mid14, "учитель: о хорошем", CAM.teacherCU);
  room(mid14, L(14).to + s2f(0.5), "класс слушает", CAM.friends);
  const scoot = M("Амир придвигается");
  room(L(14).to + s2f(0.5), M("дети слушают").to, "заинтересованные ученики", CAM.classMid);
  room(M("дети слушают").to, scoot.to, "Амир придвигается к Юсуфу", CAM.scoot);

  // ---------- сцена 4: простые слова ----------
  const p2 = P(1);
  room(M("учитель смотрит на детей").from, p2.from + s2f(0.8), "учитель спрашивает класс", CAM.teacherCU);
  room(p2.from + s2f(0.8), p2.to - s2f(0.2), "пауза P2: Юсуф думает", CAM.yusufMed);
  room(p2.to - s2f(0.2), L(16).to + s2f(0.4), "Юсуф: помоги понять и научиться", CAM.yusufCU);
  room(L(16).to + s2f(0.4), L(17).to + s2f(0.3), "Амир: быть хорошим другом", CAM.amirCU);
  room(L(17).to + s2f(0.3), M("согласие").to, "учитель: хорошие просьбы", CAM.trio);

  // ---------- сцена 5: просить и стараться ----------
  const notDone = M("картинка не собрана");
  top(notDone.from, M("Юсуф поднимает голову").from + s2f(0.4), "картинка ещё не собрана", TOP.puzzle);
  room(M("Юсуф поднимает голову").from + s2f(0.4), L(19).to + s2f(0.4), "Юсуф: почему картинка не собралась?", CAM.yusufMed);
  const l20 = L(20);
  const mid20 = l20.from + Math.round((l20.to - l20.from) * 0.45);
  room(L(19).to + s2f(0.4), mid20, "учитель: просим и стараемся", CAM.teacherCU);
  room(mid20, L(20).to + s2f(0.5), "Юсуф задумался", CAM.yusufCU);
  room(L(20).to + s2f(0.5), L(21).to + s2f(0.3), "Билал: даже если не видим результата?", CAM.bilalCU);
  room(L(21).to + s2f(0.3), L(22).to + s2f(0.5), "учитель: продолжай стараться", CAM.teacherYusuf);
  const back = M("Юсуф поворачивается к картинке");
  const takeLeaf = M("Юсуф берёт деталь с листиком");
  room(L(22).to + s2f(0.5), takeLeaf.from + s2f(0.9), "Юсуф поворачивается к картинке", CAM.yusufMed);
  void back;
  top(takeLeaf.from + s2f(0.9), M("Юсуф рассматривает листик").to, "деталь с листиком в маленькой руке", TOP.leaf);

  // ---------- сцена 6: попробуем вместе ----------
  const p3 = P(2);
  room(L(23).from - s2f(0.2), p3.from + s2f(0.8), "учитель спрашивает класс", CAM.teacherCU);
  top(p3.from + s2f(0.8), p3.from + s2f(3.4), "пауза P3: неподходящая деталь", TOP.puzzle);
  room(p3.from + s2f(3.4), p3.to - s2f(0.2), "пауза P3: Юсуф и Амир смотрят на рисунок", CAM.yusufAmir);
  room(p3.to - s2f(0.2), M("Амир наклоняется к Юсуфу").to, "Амир: подобрать края, я покажу (в кадре картинка)", CAM.amirMed);
  room(M("Амир наклоняется к Юсуфу").to, L(25).to + s2f(0.2), "Юсуф: вот эта, с листиком?", CAM.yusufAmir);
  const turn = M("поворот и соединение");
  top(L(25).to + s2f(0.2), turn.from, "Амир показывает, где продолжается ветка", TOP.puzzle);
  room(turn.from, turn.from + s2f(1.4), "Юсуф смотрит на веточку и на край", CAM.yusufCU);
  top(turn.from + s2f(1.4), turn.to, "поворот на четверть оборота и соединение", TOP.turn);
  room(turn.to, L(27).to + s2f(0.5), "Юсуф: подошла!", CAM.yusufMed);
  room(L(27).to + s2f(0.5), L(28).to + s2f(0.3), "Билал: теперь сам", CAM.bilalCU);
  room(L(28).to + s2f(0.3), M("учитель наблюдает").to, "учитель наблюдает", CAM.teacherYusuf);

  // ---------- сцена 7: получилось ----------
  top(M("две детали").from, M("шестая деталь").to, "пятая и шестая детали", TOP.right);
  top(M("картинка собрана").from, M("картинка собрана").to, "картинка собрана", TOP.puzzle);
  room(M("картинка собрана").to, L(29).to + s2f(0.5), "Юсуф: я собрал! (в кадре готовая картинка)", CAM.yusufMed);
  room(L(29).to + s2f(0.5), L(30).to + s2f(0.3), "Амир: ты внимательно смотрел", CAM.amirCU);
  room(L(30).to + s2f(0.3), L(31).to + s2f(0.4), "Юсуф благодарит друзей", CAM.friends);
  room(L(31).to + s2f(0.4), L(32).to + s2f(0.4), "учитель подводит итог", CAM.teacherYusuf);
  top(L(32).to + s2f(0.4), M("палец вдоль края").to, "палец вдоль края готовой картинки", TOP.edge);

  // ---------- сцена 8: я могу обращаться к Аллаху ----------
  room(M("палец вдоль края").to, L(33).to + s2f(0.4), "учитель: теперь ты знаешь", CAM.teacherYusuf);
  room(L(33).to + s2f(0.4), L(34).to + s2f(0.4), "Юсуф: Аллах слышит меня", CAM.yusufCU);
  room(L(34).to + s2f(0.4), L(35).to + s2f(0.3), "Билал: дуа — это просьба", CAM.bilalCU);
  room(L(35).to + s2f(0.3), L(36).to + s2f(0.3), "Амир: просим и стараемся", CAM.amirCU);
  room(L(36).to + s2f(0.3), L(37).to + s2f(0.5), "Юсуф: можно помочь другу", CAM.yusufAmir);
  const bx = M("коробка");
  room(L(37).to + s2f(0.5), bx.to, "Амир передаёт пустую коробку", CAM.yusufAmir);
  const pull = M("камера отходит");
  room(bx.to, end, "камера отходит: весь класс", move(CAM.trio, CAM.wide, pull.from, pull.to));

  // непрерывность: без зазоров и наложений
  shots.sort((a, b) => a.from - b.from);
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i];
    const b = shots[i + 1];
    if (b.from !== a.to) shots[i] = { ...a, to: b.from };
  }
  return shots.filter((s) => s.to > s.from);
};

export const shotAt = (shots: readonly ShotSpec[], f: number): ShotSpec => shots.find((s) => f >= s.from && f < s.to) ?? shots[shots.length - 1];
