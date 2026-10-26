// Монтажный план фильма 80-1-9: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, действия) и хореографии. Вопрос — лицо Юсуфа,
// объяснение — учитель и слушатели, помощь — руки и взгляды. Комната всегда
// в одной проекции (направления взглядов сохраняются). Склейки простые;
// короткое мягкое растворение — только на входе и выходе вставки сада.
// В зрительских паузах — нейтральные планы без подсказок; перед ответом
// камера переходит на отвечающего лишь за 2/3 секунды до конца паузы.
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import type { Choreo } from "./choreo.ts";
import { AT_TABLE, PLATES, QURAN_SHELF } from "./layout.ts";
import { CAPTIONS } from "./script.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "garden";
export type ShotSpec = {
  readonly from: number; // кадры
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly garden?: "tree" | "worker";
  readonly gardenFrom?: number; // кадр начала вставки (локальное время сада)
  readonly dissolve?: number; // кадров растворения в начале плана
  readonly label: string;
};

export type CaptionSpec = { readonly from: number; readonly to: number; readonly text: string; readonly big?: boolean };

export const CAM = {
  wide: { x: 1330, y: 905, zoom: 0.74 },
  wideTable: { x: 1560, y: 950, zoom: 0.86 },
  classWide: { x: 1180, y: 1010, zoom: 1.0 },
  table: { x: 2070, y: 1075, zoom: 1.2 },
  teacherYusuf: { x: (AT_TABLE.yusuf.x + AT_TABLE.teacher.x) / 2, y: 1075, zoom: 1.65 },
  teacherQuran: { x: 1985, y: 830, zoom: 1.32 },
  yusuf: { x: AT_TABLE.yusuf.x - 40, y: 1112, zoom: 3.3 },
  yusufPlate: { x: AT_TABLE.yusuf.x - 20, y: 1170, zoom: 2.7 },
  amir: { x: AT_TABLE.amir.x + 10, y: 1085, zoom: 2.8 },
  bilal: { x: AT_TABLE.bilal.x + 5, y: 1075, zoom: 2.8 },
  teacher: { x: AT_TABLE.teacher.x + 5, y: 1010, zoom: 2.3 },
  plate: { x: PLATES.yusuf.x - 20, y: 1215, zoom: 3.0 },
  apple: { x: PLATES.yusuf.x, y: 1285, zoom: 6.5 },
  water: { x: 2250, y: 1225, zoom: 2.6 },
  boys: { x: 2010, y: 1075, zoom: 1.9 },
  hands: { x: 2060, y: 1200, zoom: 3.0 },
  shelf: { x: QURAN_SHELF.x - 40, y: 560, zoom: 2.4 },
} as const satisfies Record<string, Cam>;

const s2f = (s: number) => Math.round(s * FPS);
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const ease = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const buildShots = (tl: L80Timeline, ch: Choreo): { shots: ShotSpec[]; captions: CaptionSpec[] } => {
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
  const at = (id: number, k: number) => L(id).from + Math.round((L(id).to - L(id).from) * k);

  // ---------- сцена 1 ----------
  const open = M("общий план: угощение");
  // общий план держится, пока учитель не сел; затем — тарелка крупно
  const seatedCut = Math.max(open.to, ev.teacherSit.to + 4);
  add(0, seatedCut, "room", "общий план: угощение, Билал раздаёт салфетки", { cam: (f) => mix(CAM.wide, CAM.wideTable, ease((f - s2f(2.6)) / s2f(2.0))) });
  add(seatedCut, ev.plateRelease + 18, "room", "тарелка опускается на столик перед Юсуфом", { cam: CAM.plate });
  add(ev.plateRelease + 18, L(2).to + 10, "room", "спасибо — пожалуйста", { cam: CAM.teacherYusuf });
  add(L(2).to + 10, L(3).to + 12, "room", "Юсуф смотрит на яблоко и спрашивает", { cam: CAM.yusufPlate });
  // ---------- сцена 2 ----------
  const sit = M("учитель присаживается");
  add(L(3).to + 12, L(4).to + 10, "room", "учитель присаживается и отвечает", { cam: (f) => mix(CAM.teacherYusuf, { ...CAM.teacherYusuf, zoom: 1.8, x: 2230 }, ease((f - sit.to) / s2f(3))) });
  add(L(4).to + 10, L(5).to + 6, "room", "Юсуф: и Аллаха, и вас?", { cam: CAM.yusuf });
  const tree = M("сад: яблоня");
  const worker = M("сад: работник");
  const treeFrom = Math.max(L(6).from + s2f(1.2), at(6, 0.74));
  // на «…приносить плоды» — яблоко на тарелке, мягкое растворение в сад
  // (без лиц в кадре: двойного изображения лица и неба не бывает), выход — склейкой
  const appleFrom = Math.max(L(5).to + 6 + s2f(1.5), treeFrom - s2f(1.6));
  add(L(5).to + 6, appleFrom, "room", "учитель: Аллах создал яблони", { cam: CAM.teacher });
  add(appleFrom, treeFrom, "room", "яблоко на тарелке", { cam: CAM.apple });
  add(treeFrom, tree.to, "garden", "сад: яблоня с плодами", { garden: "tree", gardenFrom: treeFrom, dissolve: 10 });
  add(tree.to, worker.to, "garden", "сад: работник снимает яблоко", { garden: "worker", gardenFrom: tree.to });
  add(worker.to, L(7).to + 8, "room", "Амир: люди ухаживали за садом?", { cam: CAM.amir });
  add(L(7).to + 8, L(8).to + 10, "room", "учитель: купил, помыл, нарезал", { cam: CAM.teacherYusuf });
  const treat = M("Юсуф смотрит на угощение");
  add(L(8).to + 10, treat.to, "room", "Юсуф смотрит на угощение", { cam: CAM.yusufPlate });
  // ---------- сцена 3 ----------
  add(treat.to, L(9).to + 8, "room", "Юсуф: как поблагодарить Аллаха?", { cam: CAM.yusuf });
  add(L(9).to + 8, L(10).to + 10, "room", "учитель: Альхамдулиллях", { cam: CAM.teacher });
  add(L(10).to + 10, L(11).to + 8, "room", "Амир: что это означает?", { cam: CAM.amir });
  const cap = M("надпись: значение");
  // план шире: слева в кадре Билал отдаёт салфетку Амиру
  add(L(11).to + 8, cap.to, "room", "учитель: Хвала Аллаху; надпись", { cam: CAM.table });
  const back = M("Билал возвращается");
  add(cap.to, L(13).from - 2, "room", "Билал садится и ставит поднос", { cam: CAM.boys });
  add(L(13).from - 2, L(13).to + 8, "room", "Билал: еда — дар Аллаха?", { cam: CAM.bilal });
  add(L(13).to + 8, L(14).to + 10, "room", "учитель: замечаем то, что Он дал", { cam: CAM.table });
  void back;
  // ---------- сцена 4 ----------
  add(L(14).to + 10, L(15).to + 8, "room", "Билал: о благодарности в Коране?", { cam: CAM.bilal });
  const ayah = M("подпись: смысл аята");
  add(L(15).to + 8, ayah.to, "room", "учитель; Коран на подставке у книг", { cam: CAM.teacherQuran });
  add(ayah.to, L(17).to + 8, "room", "Юсуф: милости — это что?", { cam: CAM.yusuf });
  const water = at(18, 0.55);
  add(L(17).to + 8, water, "room", "учитель: добро, которое Аллах нам дал", { cam: CAM.teacherYusuf });
  add(water, L(18).to + 14, "room", "еда и вода на столике", { cam: CAM.water });
  add(L(18).to + 14, L(19).to + 8, "room", "Амир: то, что бывает каждый день?", { cam: CAM.amir });
  add(L(19).to + 8, L(20).to + 10, "room", "учитель: привычное добро", { cam: CAM.table });
  const plateLook = M("Юсуф смотрит на тарелку");
  add(L(20).to + 10, plateLook.to, "room", "Юсуф смотрит на свою тарелку", { cam: CAM.yusufPlate });
  // ---------- сцена 5 ----------
  const s5 = M("салфетка Юсуфу");
  add(s5.from, ev.yusufNapkinPlaced + 22, "room", "Билал кладёт салфетку перед Юсуфом", { cam: CAM.hands });
  add(ev.yusufNapkinPlaced + 22, L(22).to + 8, "room", "Юсуф благодарит Билала", { cam: CAM.boys });
  add(L(22).to + 8, L(24).to + 10, "room", "Юсуф: вот так можно? — учитель", { cam: CAM.teacherYusuf });
  add(L(24).to + 10, L(25).to + 8, "room", "Амир: мама готовит, друг помогает", { cam: CAM.amir });
  add(L(25).to + 8, L(26).to + 14, "room", "учитель: верно", { cam: CAM.table });
  // ---------- сцена 6 ----------
  const notice = M("Юсуф замечает");
  const nMid = notice.from + Math.round((notice.to - notice.from) * 0.55);
  add(L(26).to + 14, nMid, "room", "Юсуф переводит взгляд: салфетка, Билал", { cam: CAM.boys });
  add(nMid, notice.to, "room", "место Билала без салфетки; одна на подносе", { cam: CAM.hands });
  add(notice.to, L(27).to + 8, "room", "Юсуф: а у него нет!", { cam: CAM.yusuf });
  add(L(27).to + 8, L(28).to + 8, "room", "Билал: я ещё не взял себе", { cam: CAM.bilal });
  add(L(28).to + 8, ev.lastRelease + s2f(0.9), "room", "Юсуф берёт последнюю салфетку и отдаёт Билалу", { cam: CAM.hands });
  add(ev.lastRelease + s2f(0.9), L(30).to + 10, "room", "Билал: спасибо, Юсуф", { cam: CAM.boys });
  add(L(30).to + 10, L(31).to + 10, "room", "учитель: вы заботитесь друг о друге", { cam: CAM.table });
  add(L(31).to + 10, L(32).to + 8, "room", "Амир: не только слова?", { cam: CAM.amir });
  add(L(32).to + 8, L(33).to + 12, "room", "учитель: делами", { cam: CAM.teacherYusuf });
  const listen = M("класс слушает");
  add(L(33).to + 12, listen.to, "room", "класс слушает", { cam: CAM.classWide });
  // ---------- сцена 7 ----------
  const p1 = P(0);
  const p2 = P(1);
  const p3 = P(2);
  const toClass = M("учитель к классу");
  add(toClass.from, p1.to - 20, "room", "вопрос 1 и пауза P1", { cam: CAM.table });
  add(p1.to - 20, L(35).to + 8, "room", "Амир отвечает", { cam: CAM.amir });
  add(L(35).to + 8, p2.to - 20, "room", "вопрос 2 и пауза P2", { cam: CAM.wideTable });
  add(p2.to - 20, L(37).to + 8, "room", "Билал отвечает", { cam: CAM.bilal });
  add(L(37).to + 8, p3.to - 20, "room", "вопрос 3 и пауза P3", { cam: CAM.table });
  add(p3.to - 20, L(39).to + 8, "room", "Юсуф отвечает", { cam: CAM.yusuf });
  add(L(39).to + 8, L(40).to + 14, "room", "учитель: словами и поступками", { cam: CAM.teacherYusuf });
  // ---------- сцена 8 ----------
  const toPlate = M("Юсуф к тарелке");
  add(toPlate.from, L(42).to + 10, "room", "Бисмиллях; еда; Альхамдулиллях", { cam: CAM.yusufPlate });
  add(L(42).to + 10, L(44).to + 10, "room", "спасибо за угощение — пожалуйста", { cam: CAM.teacherYusuf });
  add(L(44).to + 10, L(45).to + 12, "room", "Юсуф: я благодарю Аллаха и людей", { cam: CAM.yusuf });
  add(L(45).to + 12, end, "room", "финал: общий план класса", { cam: (f) => mix(CAM.wideTable, CAM.wide, ease((f - L(45).to - 12) / s2f(2.5))) });

  // непрерывность: заполнить зазоры предыдущим планом
  shots.sort((a, b) => a.from - b.from);
  if (shots[0].from !== 0) shots[0] = { ...shots[0], from: 0 };
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i];
    const b = shots[i + 1];
    if (b.from !== a.to) shots[i] = { ...a, to: b.from };
  }
  shots[shots.length - 1] = { ...shots[shots.length - 1], to: end };

  // ---------- надписи ----------
  const l12 = cueById(tl, 12);
  // значение звучит первым («Хвала Аллаху»); надпись — когда оно уже прозвучало
  const meaningEnd = l12.words.length >= 2 ? l12.words[1].end : l12.from + 1.2;
  const captions: CaptionSpec[] = [
    { from: s2f(meaningEnd + 0.5), to: cap.to - 6, text: CAPTIONS.meaning, big: true },
    { from: at(16, 0.5), to: ayah.to - 4, text: CAPTIONS.ayah },
  ];
  return { shots, captions };
};

export const shotAt = (shots: readonly ShotSpec[], f: number): ShotSpec => shots.find((s) => f >= s.from && f < s.to) ?? shots[shots.length - 1];
