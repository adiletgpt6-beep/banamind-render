// Монтажный план фильма 80-1-7: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, повороты, действия). Камера наблюдает за действием:
// общий план объясняет пространство, средний — разговор, крупный — рисунки,
// метку и карандаш. Склейки спокойные; редкие короткие наплывы — только там,
// где они не скрывают состояние модели.
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import { GLOBE, LAMP } from "./layout.ts";
import { cueById, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "top" | "paper";
export type ShotSpec = {
  readonly from: number; // кадры
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly inset?: boolean; // вставка «вид сверху»
  readonly caption?: string; // подпись в кадре
  readonly dissolve?: number; // кадров наплыва в начале
  readonly paperFinished?: boolean;
  readonly label: string;
};

export const CAM = {
  wide: { x: 1420, y: 870, zoom: 0.74 },
  wideRight: { x: 1560, y: 900, zoom: 0.8 },
  group: { x: 1640, y: 1050, zoom: 1.05 },
  groupLeft: { x: 1250, y: 1080, zoom: 1.2 },
  kids: { x: 1240, y: 1040, zoom: 1.5 },
  table: { x: 2060, y: 1120, zoom: 1.55 },
  tableKids: { x: 1720, y: 1120, zoom: 1.2 },
  globe: { x: GLOBE.cx, y: GLOBE.cy + 10, zoom: 3.1 },
  globeWide: { x: GLOBE.cx + 40, y: GLOBE.cy + 40, zoom: 2.3 },
  lamp: { x: LAMP.baseX - 90, y: LAMP.headY + 60, zoom: 2.2 },
  lampTeacher: { x: 2200, y: 1060, zoom: 1.6 },
  yusuf: { x: 1240, y: 1010, zoom: 2.5 },
  yusufSheets: { x: 1235, y: 1035, zoom: 3.2 },
  yusufTeacher: { x: 1060, y: 1090, zoom: 1.75 },
  yusufLamp: { x: 1800, y: 1090, zoom: 1.35 },
  amir: { x: 1035, y: 1000, zoom: 2.4 },
  bilal: { x: 1445, y: 990, zoom: 2.3 },
  bilalLamp: { x: 1900, y: 1080, zoom: 1.3 },
  teacher: { x: 2190, y: 900, zoom: 2.0 },
  teacherMed: { x: 2100, y: 1000, zoom: 1.5 },
  window: { x: 2050, y: 720, zoom: 1.05 },
  drawTable: { x: 1830, y: 1270, zoom: 1.7 },
  drawGroup: { x: 1800, y: 1200, zoom: 1.35 },
} as const satisfies Record<string, Cam>;

const s2f = (s: number) => Math.round(s * FPS);
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const ease = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const buildShots = (tl: L80Timeline): ShotSpec[] => {
  const L = (id: number) => {
    const c = cueById(tl, id);
    return { from: s2f(c.from), to: s2f(c.to) };
  };
  const M = (label: string) => {
    const m = tl.marks[label];
    if (!m) throw new Error(`Нет отрезка «${label}»`);
    return { from: s2f(m.from), to: s2f(m.to) };
  };
  const P = (i: number) => ({ from: s2f(tl.pauses[i].from), to: s2f(tl.pauses[i].to) });
  const end = tl.durationInFrames;
  const spinA = tl.spins[0];
  const spinB = tl.spins[1];
  const spinC = tl.spins[2];
  const shots: ShotSpec[] = [];
  const add = (from: number, to: number, kind: ShotKind, label: string, extra: Partial<ShotSpec> = {}) => {
    if (to <= from) return;
    shots.push({ from, to, kind, label, ...extra });
  };
  const gap = (id: number) => Math.round((L(id).from + L(id - 1).to) / 2); // граница между репликами

  // ---------- сцена 1 ----------
  const l1 = L(1);
  const openEnd = l1.to + 8;
  add(0, openEnd, "room", "рисунки → Юсуф и учитель", {
    cam: (f) => mix(CAM.yusufSheets, CAM.yusufTeacher, ease((f - s2f(2.2)) / s2f(3.2))),
  });
  add(openEnd, gap(4), "room", "учитель слушает Юсуфа", { cam: CAM.yusufTeacher });
  add(gap(4), L(4).to + 6, "room", "класс: вопрос Амира", { cam: CAM.wide });
  add(L(4).to + 6, L(5).from - 4, "room", "Амир и Юсуф", { cam: CAM.kids });
  const sceneTwo = s2f(tl.scenes[1].from);
  add(L(5).from - 4, sceneTwo, "room", "учитель: к столику (общий)", { cam: CAM.wide });
  // ---------- сцена 2 ----------
  const l6 = L(6);
  add(sceneTwo, l6.to + 4, "room", "глобус на столик", { cam: CAM.table });
  add(l6.to + 4, L(7).to + 8, "room", "Юсуф наклоняется", { cam: CAM.tableKids });
  add(L(7).to + 8, L(8).to + 10, "room", "метка крупно", { cam: CAM.globe });
  add(L(8).to + 10, L(9).to + 6, "room", "Билал о лампе", { cam: CAM.bilalLamp });
  const sw = M("рука к выключателю");
  add(L(9).to + 6, sw.from + 6, "room", "лампа и глобус", { cam: CAM.table });
  const curtainClose = M("Амир прикрывает занавеску");
  add(sw.from + 6, curtainClose.from, "room", "выключатель", { cam: CAM.lamp });
  const observe = M("наблюдение модели");
  add(curtainClose.from, observe.from, "room", "занавеска", { cam: CAM.window });
  add(observe.from, L(11).from - 6, "room", "модель: метка на свету", { cam: CAM.globeWide });
  // ---------- сцена 3 ----------
  add(L(11).from - 6, L(11).to + 6, "room", "палец у метки", { cam: CAM.globe });
  add(L(11).to + 6, L(12).to + 6, "room", "Юсуф: день", { cam: CAM.yusuf });
  const toGlobe = M("рука к глобусу");
  add(L(12).to + 6, toGlobe.from, "room", "учитель поворачивает", { cam: CAM.table });
  const spinAFrom = s2f(spinA.from);
  const switchTop = spinAFrom + s2f(1.9);
  add(toGlobe.from, switchTop, "room", "глобус начинает поворот", { cam: CAM.globe, inset: true });
  add(switchTop, L(14).to + 6, "top", "вид сверху: метка уходит в тень", { dissolve: 12 });
  add(L(14).to + 6, L(15).to + 10, "room", "Юсуф смотрит на лампу", { cam: CAM.yusufLamp });
  add(L(15).to + 10, L(17).from - 2, "room", "учитель и ночная метка", { cam: CAM.table, inset: true });
  // ---------- сцена 4 ----------
  const p1 = P(0);
  add(L(17).from - 2, p1.to - 20, "room", "вопрос и пауза P1", { cam: CAM.group, inset: true });
  add(p1.to - 20, L(18).to + 6, "room", "Амир отвечает", { cam: CAM.amir });
  const spinBFrom = s2f(spinB.from);
  const spinBTo = s2f(spinB.to);
  add(L(18).to + 6, L(19).to + 12, "room", "метка возвращается к свету", { cam: CAM.globe, inset: true });
  add(L(19).to + 12, Math.max(spinBTo, L(20).to + 6), "room", "учитель: утро", { cam: CAM.table, inset: true });
  const onLight = M("метка на свету");
  add(Math.max(spinBTo, L(20).to + 6), onLight.to, "room", "метка на свету", { cam: CAM.globe });
  add(onLight.to, L(21).to + 6, "room", "Билал: глобус и лампа", { cam: CAM.bilalLamp });
  const toGlobe2From = L(22).from - 4;
  add(L(21).to + 6, toGlobe2From, "room", "учитель: правильно", { cam: CAM.teacher });
  const spinCFrom = s2f(spinC.from);
  add(toGlobe2From, spinCFrom + s2f(1.0), "room", "ещё поворот", { cam: CAM.globe });
  const stopped = M("модель остановлена");
  add(spinCFrom + s2f(1.0), stopped.to, "top", "вид сверху: до ночи", { dissolve: 12 });
  void spinBFrom;
  // ---------- сцена 5 ----------
  add(stopped.to, L(23).to + 6, "room", "Билал: везде ли ночь", { cam: CAM.bilal });
  add(L(23).to + 6, L(24).to + 10, "room", "две стороны", { cam: CAM.globeWide });
  add(L(24).to + 10, L(25).to + 6, "room", "Амир: у нас ночь", { cam: CAM.amir });
  const twoSides = M("две стороны");
  add(L(25).to + 6, twoSides.from, "room", "учитель: по очереди", { cam: CAM.table, inset: true });
  add(twoSides.from, twoSides.to, "room", "рассматриваем две стороны", { cam: CAM.globeWide, inset: true });
  // ---------- сцена 6 ----------
  const open = M("Амир открывает занавеску");
  add(open.from, L(27).from - 4, "room", "занавеска открыта", { cam: CAM.window });
  add(L(27).from - 4, L(27).to + 6, "room", "учитель", { cam: CAM.teacherMed });
  add(L(27).to + 6, L(28).to + 6, "room", "Билал", { cam: CAM.bilal });
  add(L(28).to + 6, L(29).to + 10, "room", "смысл аята", { cam: CAM.teacherMed, caption: "Смысл аята 3:190" });
  add(L(29).to + 10, L(30).to + 6, "room", "Юсуф: знамения?", { cam: CAM.yusuf });
  add(L(30).to + 6, L(31).to + 8, "room", "учитель объясняет", { cam: CAM.teacher });
  add(L(31).to + 8, L(32).to + 6, "room", "Амир: вопросы?", { cam: CAM.amir });
  const listen = M("класс слушает");
  add(L(32).to + 6, listen.from, "room", "учитель улыбается", { cam: CAM.teacherMed });
  add(listen.from, listen.to, "room", "класс слушает", { cam: CAM.wideRight });
  // ---------- сцена 7 ----------
  const p2 = P(1);
  const p3 = P(2);
  const p4 = P(3);
  add(listen.to, L(34).from - 2, "room", "учитель к классу", { cam: CAM.group });
  add(L(34).from - 2, p2.to - 24, "room", "вопрос 1 и пауза P2", { cam: CAM.table, inset: true });
  add(p2.to - 24, L(35).to + 8, "room", "Билал отвечает", { cam: CAM.bilal });
  add(L(35).to + 8, p3.to - 24, "room", "вопрос 2 и пауза P3 (лампа)", { cam: CAM.lampTeacher });
  add(p3.to - 24, L(37).to + 8, "room", "Юсуф: нет!", { cam: CAM.yusuf });
  add(L(37).to + 8, p4.to - 24, "room", "вопрос 3 и пауза P4 (общий)", { cam: CAM.wide });
  add(p4.to - 24, L(39).to + 8, "room", "Амир: Аллах", { cam: CAM.amir });
  const take = M("Юсуф берёт лист");
  add(L(39).to + 8, take.from + 10, "room", "учитель закрепляет", { cam: CAM.group });
  add(take.from + 10, take.to + 8, "room", "Юсуф берёт лист", { cam: CAM.drawGroup });
  // ---------- сцена 8 ----------
  const l43 = L(43);
  add(take.to + 8, L(42).to + 10, "paper", "рисунок Земли", { dissolve: 10 });
  add(L(42).to + 10, l43.to + 8, "room", "Юсуф объясняет", { cam: CAM.drawTable });
  add(l43.to + 8, L(44).to + 8, "room", "учитель: нашли ответ", { cam: CAM.drawGroup });
  const finalPaper = L(44).to + 8;
  add(finalPaper, finalPaper + s2f(1.5), "paper", "финал: рисунки", { paperFinished: true, dissolve: 8 });
  add(finalPaper + s2f(1.5), end, "room", "финал: класс", { cam: CAM.wide, dissolve: 10 });
  // непрерывность: заполнить возможные зазоры предыдущим планом
  shots.sort((a, b) => a.from - b.from);
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i];
    const b = shots[i + 1];
    if (b.from > a.to) shots[i] = { ...a, to: b.from };
    if (b.from < a.to) shots[i] = { ...a, to: b.from };
  }
  return shots;
};

export const shotAt = (shots: readonly ShotSpec[], f: number): ShotSpec => shots.find((s) => f >= s.from && f < s.to) ?? shots[shots.length - 1];
