// Монтажный план фильма 80-1-8: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, действия). Камера наблюдает за разговором: общий
// план объясняет пространство, средний — разговор, крупный — короткие вопросы
// детей и ответ Юсуфа, предметные планы — лист рядом с лодочкой, книга на
// подставке, карточка. Склейки спокойные, без вспышек и шторок; мягкий
// наплыв только на переходах к виду карточки сверху.
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import type { Choreo } from "./choreo.ts";
import { AT_TABLE, CARD, FOLDER, QURAN_ON_STAND, SHEET_SLOT } from "./layout.ts";
import { CAPTIONS } from "./script.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "card";
export type ShotSpec = {
  readonly from: number; // кадры
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly caption?: string;
  readonly dissolve?: number; // кадров наплыва в начале
  readonly cardFinished?: boolean;
  readonly label: string;
};

export const CAM = {
  wide: { x: 1420, y: 870, zoom: 0.74 },
  wideRight: { x: 1600, y: 900, zoom: 0.8 },
  classWide: { x: 1150, y: 1000, zoom: 1.05 },
  table: { x: 2060, y: 1060, zoom: 1.12 },
  teacherYusuf: { x: 2215, y: 1030, zoom: 1.55 },
  boys: { x: 1965, y: 1060, zoom: 1.5 },
  yusuf: { x: AT_TABLE.yusuf.x, y: 1100, zoom: 3.4 },
  amir: { x: AT_TABLE.amir.x, y: 1050, zoom: 3.0 },
  bilal: { x: AT_TABLE.bilal.x, y: 1020, zoom: 2.9 },
  teacher: { x: AT_TABLE.teacher.x, y: 1010, zoom: 1.9 },
  teacherMed: { x: 2240, y: 985, zoom: 1.5 },
  propsBoat: { x: SHEET_SLOT.x + 40, y: 1255, zoom: 2.6 },
  propsFolder: { x: FOLDER.x - 40, y: 1250, zoom: 2.4 },
  book: { x: QURAN_ON_STAND.x - 70, y: 1130, zoom: 1.9 },
  cardTable: { x: CARD.x + 20, y: 1250, zoom: 2.6 },
  sprout: { x: 2180, y: 540, zoom: 1.7 },
  drawing: { x: FOLDER.x, y: 1282, zoom: 3.2 },
} as const satisfies Record<string, Cam>;

const s2f = (s: number) => Math.round(s * FPS);
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const ease = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const buildShots = (tl: L80Timeline, ch: Choreo): ShotSpec[] => {
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
  const ev = ch.events;
  const shots: ShotSpec[] = [];
  const add = (from: number, to: number, kind: ShotKind, label: string, extra: Partial<ShotSpec> = {}) => {
    if (to <= from) return;
    shots.push({ from, to, kind, label, ...extra });
  };

  // ---------- сцена 1 ----------
  const s1 = M("лодочка и рисунок");
  add(0, s1.from + s2f(2.4), "room", "общий план: занятие", { cam: (f) => mix(CAM.wide, CAM.wideRight, ease((f - s2f(0.4)) / s2f(2.0))) });
  add(s1.from + s2f(2.4), ev.sheetLaid + 10, "room", "Юсуф придвигает лодочку, кладёт рисунок", { cam: CAM.propsFolder });
  add(ev.sheetLaid + 10, L(2).to + 8, "room", "Юсуф и Амир", { cam: CAM.boys });
  add(L(2).to + 8, L(3).to + 10, "room", "Юсуф: вопрос", { cam: CAM.yusuf });
  const lean = M("учитель наклоняется к Юсуфу");
  add(L(3).to + 10, L(5).to + 10, "room", "учитель слышит вопрос и отвечает", { cam: CAM.teacherYusuf });
  void lean;
  // ---------- сцена 2 ----------
  add(L(5).to + 10, L(6).to + 6, "room", "Юсуф: ещё до дома?", { cam: CAM.yusuf });
  add(L(6).to + 6, L(7).to + 10, "room", "учитель: до Земли и Солнца", { cam: CAM.teacherYusuf });
  add(L(7).to + 10, L(8).to + 6, "room", "Билал уточняет", { cam: CAM.bilal });
  const nod = M("Юсуф кивает");
  add(L(8).to + 6, nod.to, "room", "«Верно» и кивок Юсуфа", { cam: CAM.table });
  // ---------- сцена 3 ----------
  const take = M("Амир берёт лист");
  add(take.from, ev.looseTaken + 4, "room", "Амир смотрит на стопку и берёт лист", { cam: CAM.boys });
  add(ev.looseTaken + 4, L(10).from - 2, "room", "лист ложится рядом с лодочкой", { cam: CAM.propsBoat });
  add(L(10).from - 2, L(10).to + 6, "room", "Амир: лист и лодочка", { cam: CAM.amir });
  add(L(10).to + 6, L(11).to + 8, "room", "учитель: у лодочки есть начало", { cam: CAM.teacherMed });
  add(L(11).to + 8, L(12).to + 6, "room", "Юсуф: а у Аллаха?", { cam: CAM.yusuf });
  add(L(12).to + 6, L(13).to + 8, "room", "учитель: Создатель", { cam: CAM.teacherYusuf });
  const sprout = M("росток и рисунок");
  add(sprout.from, sprout.from + s2f(1.8), "room", "росток у окна", { cam: CAM.sprout });
  add(sprout.from + s2f(1.8), L(14).from - 4, "room", "рисунок Земли", { cam: CAM.drawing });
  add(L(14).from - 4, L(14).to + 4, "room", "Билал: творения?", { cam: CAM.bilal });
  const listen1 = M("класс слушает");
  add(L(14).to + 4, listen1.from, "room", "учитель: да", { cam: CAM.teacherMed });
  add(listen1.from, listen1.to, "room", "класс слушает", { cam: CAM.classWide });
  // ---------- сцена 4 ----------
  const raise = M("Амир поднимает руку");
  add(raise.from, L(16).to + 6, "room", "Амир поднимает руку и спрашивает", { cam: CAM.boys });
  add(L(16).to + 6, L(17).to + 10, "room", "учитель: не создавал Самого Себя", { cam: CAM.teacherMed });
  add(L(17).to + 10, L(18).to + 6, "room", "Юсуф: был всегда?", { cam: CAM.yusuf });
  add(L(18).to + 6, L(19).to + 6, "room", "учитель: да", { cam: CAM.teacherYusuf });
  add(L(19).to + 6, L(20).to + 6, "room", "Билал уточняет", { cam: CAM.bilal });
  const listen2 = M("Юсуф слушает");
  add(L(20).to + 6, listen2.to, "room", "«Верно»", { cam: CAM.table });
  // ---------- сцена 5 ----------
  add(listen2.to, L(22).to + 6, "room", "Билал: откуда мы знаем?", { cam: CAM.bilal });
  const book = M("учитель берёт Коран");
  add(L(22).to + 6, ev.bookLifted + 6, "room", "учитель берёт книгу", { cam: CAM.teacherMed });
  add(ev.bookLifted + 6, book.to, "room", "книга на подставке", { cam: CAM.book });
  add(book.to, L(23).to + 8, "room", "учитель: из Корана", { cam: CAM.teacher });
  add(L(23).to + 8, L(24).to + 8, "room", "Юсуф: первым сел на ковёр?", { cam: CAM.yusuf });
  const cap1 = M("подпись: смысл аята");
  add(L(24).to + 8, cap1.to, "room", "смысл имени «Первый»", { cam: CAM.teacherMed, caption: CAPTIONS.first });
  add(cap1.to, L(26).to + 6, "room", "Амир: творения?", { cam: CAM.amir });
  const bookLook = M("Билал смотрит на книгу");
  add(L(26).to + 6, L(27).to + 6, "room", "учитель: не похож на творения", { cam: CAM.teacher });
  add(L(27).to + 6, bookLook.to, "room", "Билал смотрит на книгу", { cam: CAM.table });
  // ---------- сцена 6 ----------
  add(bookLook.to, L(28).to + 8, "room", "Юсуф: был маленьким?", { cam: CAM.yusuf });
  const cap2 = M("подпись: смысл аятов");
  add(L(28).to + 8, cap2.to, "room", "смысл суры «Аль-Ихляс»", { cam: CAM.teacherMed, caption: CAPTIONS.ikhlas });
  add(cap2.to, L(30).to + 6, "room", "Амир: не вырос, как мы?", { cam: CAM.amir });
  const l31 = L(31);
  const mid31 = l31.from + Math.round((l31.to - l31.from) * 0.55);
  add(L(30).to + 6, mid31, "room", "учитель: не похож на людей", { cam: CAM.teacher });
  const listen3 = M("дети слушают");
  add(mid31, listen3.to, "room", "класс и росток у окна", { cam: CAM.wideRight });
  // ---------- сцена 7 ----------
  const toClass = M("учитель к классу");
  add(toClass.from, L(32).from - 2, "room", "учитель к классу", { cam: CAM.table });
  const p1 = P(0);
  const p2 = P(1);
  const p3 = P(2);
  add(L(32).from - 2, p1.to - 20, "room", "вопрос 1 и пауза P1", { cam: CAM.teacherMed });
  add(p1.to - 20, L(33).to + 8, "room", "Амир отвечает", { cam: CAM.amir });
  add(L(33).to + 8, p2.to - 20, "room", "вопрос 2 и пауза P2 (с Билалом)", { cam: CAM.table });
  add(p2.to - 20, L(35).to + 8, "room", "Билал отвечает", { cam: CAM.bilal });
  add(L(35).to + 8, p3.to - 20, "room", "вопрос 3 и пауза P3 (с Юсуфом)", { cam: CAM.teacherYusuf });
  add(p3.to - 20, L(37).to + 8, "room", "Юсуф отвечает", { cam: CAM.yusuf });
  add(L(37).to + 8, L(38).to + 6, "room", "учитель подтверждает", { cam: CAM.teacherMed });
  const cm = M("Юсуф придвигает карточку");
  add(L(38).to + 6, cm.to, "room", "карточка Амиру", { cam: CAM.boys });
  // ---------- сцена 8 ----------
  const w1 = M("письмо: начало");
  const cut = M("Юсуф смотрит, как пишет Амир");
  const w2 = M("письмо: конец");
  add(cm.to, ev.writeStart + 2, "room", "Юсуф диктует, Амир готов писать", { cam: CAM.cardTable });
  add(ev.writeStart + 2, w1.to, "card", "письмо: первые слова", { dissolve: 10 });
  add(w1.to, cut.to, "room", "Юсуф смотрит, как пишет Амир", { cam: CAM.yusuf });
  add(cut.to, w2.to, "card", "письмо: последние слова", { dissolve: 8 });
  add(w2.to, L(40).to + 6, "room", "Амир: готово", { cam: CAM.cardTable });
  const done = M("готовая карточка");
  add(L(40).to + 6, done.to, "card", "готовая карточка", { cardFinished: true, dissolve: 8 });
  add(done.to, L(41).to + 8, "room", "Юсуф: теперь я знаю ответ", { cam: CAM.yusuf });
  add(L(41).to + 8, L(42).to + 6, "room", "учитель: спрашивать и разбираться", { cam: CAM.table });
  const fol = M("карточка в папку");
  add(L(42).to + 6, fol.to, "room", "карточка в папку", { cam: CAM.propsFolder });
  add(fol.to, end, "room", "финал: класс", { cam: CAM.wide, dissolve: 10 });
  // непрерывность: заполнить возможные зазоры предыдущим планом
  shots.sort((a, b) => a.from - b.from);
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i];
    const b = shots[i + 1];
    if (b.from !== a.to) shots[i] = { ...a, to: b.from };
  }
  return shots;
};

export const shotAt = (shots: readonly ShotSpec[], f: number): ShotSpec => shots.find((s) => f >= s.from && f < s.to) ?? shots[shots.length - 1];
