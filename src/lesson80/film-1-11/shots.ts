// Монтажный план фильма 80-1-11: планы по абсолютным кадрам, вычисленные из
// шкалы (реплики, паузы, действия). Камера — на уровне детей: общий план
// объясняет пространство (вход, все 25 учеников), средние планы — разговор,
// крупные — реплики, детали — листья, земля, кувшин, чашка, карточка.
// Вопросы зрителю (08, 24, 31) и паузы после них — на устойчивом среднем
// плане без склеек. Склейки обычные; мягкий наплыв — только на вид карточки
// сверху и на финальный общий план. Камера не трясётся и не «дышит».
import type { Cam } from "../core/shots.ts";
import { FPS } from "../core/video.ts";
import { easeInOut } from "../rig/motion.ts";
import type { Choreo } from "./choreo.ts";
import { AT_SPROUT, AT_TABLE, CARD_SPOT, CUP_HOME, POT, SEATS_MAIN } from "./layout.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type ShotKind = "room" | "card";
export type ShotSpec = {
  readonly from: number;
  readonly to: number;
  readonly kind: ShotKind;
  readonly cam?: Cam | ((f: number) => Cam);
  readonly dissolve?: number;
  readonly cardFinished?: boolean;
  readonly title?: boolean; // вступительная надпись поверх первого общего плана
  readonly label: string;
};

export const CAM = {
  wide: { x: 1300, y: 806, zoom: 0.74 },
  left: { x: 640, y: 1070, zoom: 1.55 }, // три друга на своих местах
  three: { x: 600, y: 1100, zoom: 1.95 }, // устойчивый план троих (вопрос 08 и пауза)
  yusufSeat: { x: SEATS_MAIN.yusuf.x + 30, y: 1150, zoom: 2.9 },
  amirSeat: { x: SEATS_MAIN.amir.x + 10, y: 1110, zoom: 2.7 },
  bilalStart: { x: SEATS_MAIN.bilalStart.x - 30, y: 1080, zoom: 2.5 },
  bilalSeat: { x: SEATS_MAIN.bilal.x + 10, y: 1085, zoom: 2.6 },
  yusufAmir: { x: 500, y: 1120, zoom: 2.4 },
  table: { x: 2070, y: 1035, zoom: 1.4 },
  tableUp: { x: 2010, y: 880, zoom: 1.05 }, // у столика, учитель стоит в рост
  tableQuran: { x: 1700, y: 815, zoom: 0.96 }, // учитель с детьми и полочка с Кораном
  amirStand: { x: AT_TABLE.amir.x + 20, y: 905, zoom: 2.25 },
  teacherSit: { x: AT_TABLE.teacher.x - 20, y: 975, zoom: 2.05 },
  amirTable: { x: AT_TABLE.amir.x + 10, y: 1100, zoom: 2.6 },
  yusufTable: { x: AT_TABLE.yusuf.x, y: 1130, zoom: 2.8 },
  bilalTable: { x: AT_TABLE.bilal.x + 10, y: 1085, zoom: 2.6 },
  boysTable: { x: 1962, y: 1095, zoom: 1.9 },
  groupTable: { x: 2060, y: 1070, zoom: 1.5 }, // учитель и трое (вопрос 24 и пауза)
  leaves: { x: POT.x - 72, y: POT.base - 150, zoom: 3.4 },
  sprout: { x: 2190, y: 716, zoom: 1.2 }, // зона ростка, учитель в рост (вопрос 31 и пауза)
  amirSprout: { x: AT_SPROUT.amir.x + 50, y: 700, zoom: 2.2 },
  teacherSprout: { x: AT_SPROUT.teacher.x - 60, y: 540, zoom: 1.9 },
  teacherCheck: { x: AT_SPROUT.teacherCheck.x - 70, y: 560, zoom: 1.8 },
  soil: { x: POT.x + 10, y: POT.soilY - 6, zoom: 4.2 },
  jug: { x: CUP_HOME.x + 40, y: CUP_HOME.y - 70, zoom: 3.2 },
  handoff: { x: 2220, y: 660, zoom: 1.5 },
  water: { x: POT.x - 30, y: POT.rimY - 10, zoom: 3.0 },
  watchers: { x: 1940, y: 760, zoom: 2.0 },
  cupDown: { x: 2090, y: 800, zoom: 2.5 },
  yusufSprout: { x: AT_SPROUT.yusuf.x + 20, y: 840, zoom: 2.6 },
  bilalSprout: { x: AT_SPROUT.bilal.x + 40, y: 680, zoom: 2.3 },
  lowTable: { x: 1860, y: 1110, zoom: 1.6 },
  cardWork: { x: 1830, y: 1170, zoom: 2.4 },
  amirAtCard: { x: 1740, y: 930, zoom: 2.4 },
  yusufAtCard: { x: 1940, y: 1010, zoom: 2.6 },
  bilalAtCard: { x: 1812, y: 1060, zoom: 2.6 },
  cardAtPot: { x: CARD_SPOT.x - 20, y: CARD_SPOT.y - 60, zoom: 3.2 },
  s8: { x: 2170, y: 740, zoom: 1.22 },
  amirS8: { x: 1900, y: 740, zoom: 2.2 },
  teacherS8: { x: 2420, y: 545, zoom: 1.9 },
  yusufS8: { x: 1990, y: 790, zoom: 2.1 },
  touch: { x: 1930, y: 780, zoom: 2.05 },
} as const satisfies Record<string, Cam>;

const s2f = (s: number) => Math.round(s * FPS);
const mix = (a: Cam, b: Cam, u: number): Cam => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, zoom: a.zoom + (b.zoom - a.zoom) * u });
const move = (a: Cam, b: Cam, from: number, to: number) => (f: number) => mix(a, b, easeInOut((f - from) / Math.max(1, to - from)));

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

  // ---------- сцена 1 «Обещание» ----------
  const bag = M("Амир кладёт вещи");
  const sitA = M("Амир садится");
  const leaves = M("Юсуф смотрит на листья");
  const awkward = M("неловкость");
  // общий план: комната, дверь, вход Амира; к концу входа — все 25 мальчиков и учитель
  add(0, bag.from + s2f(0.2), "room", "общий план: вход Амира", { cam: CAM.wide, title: true });
  add(bag.from + s2f(0.2), leaves.from, "room", "Амир кладёт сумку и садится", { cam: CAM.left });
  add(leaves.from, leaves.from + s2f(0.7), "room", "Юсуф смотрит в сторону окна", { cam: CAM.yusufSeat });
  add(leaves.from + s2f(0.7), L(1).from + s2f(0.4), "room", "деталь: здоровые листья ростка", { cam: CAM.leaves });
  add(L(1).from + s2f(0.4), L(1).to + s2f(0.3), "room", "Юсуф: зелёные листочки", { cam: CAM.yusufSeat });
  add(L(1).to + s2f(0.3), L(2).to + s2f(0.2), "room", "Билал спрашивает об обещании", { cam: CAM.bilalStart });
  add(L(2).to + s2f(0.2), L(3).to + s2f(0.5), "room", "Амир отвечает и отводит глаза", { cam: CAM.amirSeat });
  void sitA;
  void awkward;
  // ---------- сцена 2 «Сказать, как было» ----------
  const sitB = M("Билал садится рядом");
  add(L(3).to + s2f(0.5), sitB.to, "room", "Билал присаживается рядом", { cam: CAM.left });
  add(sitB.to, L(4).to + s2f(0.3), "room", "Билал: ещё не подходил", { cam: CAM.bilalSeat });
  add(L(4).to + s2f(0.3), L(5).to + s2f(0.3), "room", "Амир признаётся друзьям", { cam: CAM.amirSeat });
  add(L(5).to + s2f(0.3), L(6).to + s2f(0.2), "room", "Юсуф: почему?", { cam: CAM.yusufSeat });
  add(L(6).to + s2f(0.2), L(7).to + s2f(0.4), "room", "Амир: неловко признаться", { cam: CAM.amirSeat });
  const p1 = P(0);
  add(L(7).to + s2f(0.4), p1.to, "room", "вопрос 08 и пауза 1 — трое", { cam: CAM.three });
  add(p1.to, L(9).to + s2f(0.3), "room", "Юсуф: пойду с тобой", { cam: CAM.yusufAmir });
  const stand = M("мальчики встают");
  add(L(9).to + s2f(0.3), stand.to, "room", "«Пойдём», мальчики встают", { cam: CAM.three });
  // ---------- сцена 3 «Можно признать ошибку» ----------
  const go = M("идут к учителю");
  const tSit = M("учитель садится");
  const goWide: Cam = { x: 1320, y: 930, zoom: 0.95 };
  add(stand.to, go.from + s2f(2.6), "room", "мальчики идут к учителю", { cam: move(CAM.left, goWide, stand.to, go.from + s2f(2.6)) });
  add(go.from + s2f(2.6), tSit.to, "room", "учитель замечает, откладывает книгу и садится", { cam: CAM.tableUp });
  add(tSit.to, L(11).to + s2f(0.4), "room", "Амир: простите, я сказал неправду", { cam: CAM.amirStand });
  add(L(11).to + s2f(0.4), L(12).to + s2f(0.3), "room", "учитель: спасибо, что рассказал", { cam: CAM.teacherSit });
  add(L(12).to + s2f(0.3), L(13).to + s2f(0.4), "room", "Амир: что исправить", { cam: CAM.amirStand });
  const sitT = M("мальчики садятся у столика");
  add(L(13).to + s2f(0.4), sitT.to, "room", "мальчики садятся у столика", { cam: CAM.table });
  add(sitT.to, L(14).to + s2f(0.3), "room", "Юсуф: а если я ошибусь?", { cam: CAM.yusufTable });
  add(L(14).to + s2f(0.3), L(15).to + s2f(0.5), "room", "учитель: Милостивый и Прощающий", { cam: CAM.teacherSit });
  // ---------- сцена 4 «Не терять надежду» ----------
  add(L(15).to + s2f(0.5), L(16).to + s2f(0.3), "room", "Амир: попросить прощения", { cam: CAM.amirTable });
  add(L(16).to + s2f(0.3), L(17).to + s2f(0.6), "room", "учитель: в Коране сказано (полочка с Кораном в кадре)", { cam: CAM.tableQuran });
  add(L(17).to + s2f(0.6), L(18).to + s2f(0.3), "room", "Юсуф: не отчаиваться?", { cam: CAM.yusufTable });
  add(L(18).to + s2f(0.3), L(19).to + s2f(0.5), "room", "учитель: не терять надежду", { cam: CAM.teacherSit });
  add(L(19).to + s2f(0.5), L(20).to + s2f(0.3), "room", "Билал: что значит исправиться?", { cam: CAM.bilalTable });
  add(L(20).to + s2f(0.3), L(21).to + s2f(0.5), "room", "учитель: исправиться", { cam: CAM.groupTable });
  add(L(21).to + s2f(0.5), L(22).to + s2f(0.3), "room", "Билал: если снова?", { cam: CAM.bilalTable });
  add(L(22).to + s2f(0.3), L(23).to + s2f(0.4), "room", "учитель: снова попросить прощения", { cam: CAM.teacherSit });
  // ---------- сцена 5 «Своими словами» ----------
  const p2 = P(1);
  add(L(23).to + s2f(0.4), p2.to, "room", "вопрос 24 и пауза 2 — учитель и трое", { cam: CAM.groupTable });
  add(p2.to, L(25).to + s2f(0.6), "room", "Амир: своими словами", { cam: CAM.amirTable });
  add(L(25).to + s2f(0.6), L(26).to + s2f(0.3), "room", "учитель: важно поступать честно", { cam: CAM.teacherSit });
  add(L(26).to + s2f(0.3), L(27).to + s2f(0.3), "room", "Юсуф: а Билалу?", { cam: CAM.yusufTable });
  add(L(27).to + s2f(0.3), L(28).to + s2f(0.3), "room", "учитель: извиниться и вернуться к делу", { cam: CAM.groupTable });
  // ---------- сцена 6 «Вернуться к делу» ----------
  add(L(28).to + s2f(0.3), L(29).to + s2f(0.3), "room", "Амир извиняется перед Билалом", { cam: CAM.boysTable });
  add(L(29).to + s2f(0.3), L(30).to + s2f(0.4), "room", "Билал: я прощаю тебя", { cam: CAM.bilalTable });
  const toSprout = M("к ростку");
  add(L(30).to + s2f(0.4), toSprout.to, "room", "все четверо идут к ростку", { cam: move(CAM.tableUp, CAM.sprout, toSprout.from + s2f(0.6), toSprout.to) });
  const p3 = P(2);
  add(toSprout.to, p3.to, "room", "вопрос 31 и пауза 3 — у ростка", { cam: CAM.sprout });
  add(p3.to, L(32).to + s2f(0.3), "room", "Амир: посмотреть, нужна ли вода", { cam: CAM.amirSprout });
  const check = M("проверка земли");
  add(L(32).to + s2f(0.3), check.from + s2f(1.2), "room", "«Верно», учитель шагает к горшку", { cam: CAM.sprout });
  add(check.from + s2f(1.2), ev.checkEnd - s2f(0.2), "room", "деталь: пальцы у земли", { cam: CAM.soil });
  add(ev.checkEnd - s2f(0.2), L(34).to + s2f(0.4), "room", "учитель: земля подсохла", { cam: CAM.teacherCheck });
  const water = M("вода в чашку");
  add(L(34).to + s2f(0.4), water.to, "room", "небольшая порция воды в чашку", { cam: CAM.jug });
  const hand = M("передача чашки");
  add(water.to, L(35).to + s2f(0.3), "room", "передача чашки и «Сейчас медленно полью»", { cam: CAM.handoff });
  const pour = M("полив");
  add(L(35).to + s2f(0.3), pour.from + s2f(3.0), "room", "полив: тонкая струя на землю", { cam: CAM.water });
  add(pour.from + s2f(3.0), pour.from + s2f(4.0), "room", "Билал и Юсуф смотрят", { cam: CAM.watchers });
  const upright = M("чашка выпрямлена");
  add(pour.from + s2f(4.0), upright.to, "room", "вода заканчивается, чашка выпрямлена", { cam: CAM.water });
  void hand;
  // ---------- сцена 7 «Чтобы не забыть» ----------
  const cupDown = M("чашка на столе");
  add(upright.to, cupDown.to, "room", "пустая чашка на столике", { cam: CAM.cupDown });
  add(cupDown.to, L(36).to + s2f(0.3), "room", "Юсуф: как не забыть?", { cam: CAM.yusufSprout });
  add(L(36).to + s2f(0.3), L(37).to + s2f(0.3), "room", "Билал: сделаем напоминание", { cam: CAM.bilalSprout });
  const lowT = M("к низкому столику");
  add(L(37).to + s2f(0.3), lowT.to, "room", "к низкому столику", { cam: move(CAM.sprout, CAM.lowTable, lowT.from, lowT.to - s2f(0.4)) });
  const take = M("карточка и карандаш");
  add(lowT.to, take.to, "room", "Билал берёт карточку и карандаш", { cam: CAM.cardWork });
  add(take.to, L(38).to + s2f(0.3), "room", "Амир: напиши «Проверить росток»", { cam: CAM.amirAtCard });
  const leaf = M("листик");
  const watch = M("Юсуф смотрит");
  const text = M("надпись");
  add(L(38).to + s2f(0.3), leaf.to, "card", "листик (вид сверху)", { dissolve: 8 });
  add(leaf.to, watch.to, "room", "Юсуф смотрит, как рисует Билал", { cam: CAM.yusufAtCard });
  add(watch.to, text.to, "card", "надпись (вид сверху)", { dissolve: 8 });
  const show = M("Билал показывает карточку");
  add(text.to, show.from + s2f(1.1), "room", "Билал: готово — и показывает карточку друзьям", { cam: CAM.lowTable });
  add(show.from + s2f(1.1), show.to, "card", "готовая карточка", { cardFinished: true, dissolve: 8 });
  const toPot = M("карточку к ростку");
  add(show.to, toPot.to, "room", "карточку несут к ростку", { cam: move(CAM.lowTable, CAM.sprout, toPot.from + s2f(0.5), toPot.to) });
  const atPot = M("карточка у горшка");
  // деталь — когда Билал уже отошёл от столика (карточка видна целиком)
  add(toPot.to, atPot.from + s2f(1.95), "room", "Билал ставит карточку у горшка", { cam: CAM.sprout });
  add(atPot.from + s2f(1.95), atPot.to + s2f(0.3), "room", "деталь: карточка рядом с горшком", { cam: CAM.cardAtPot });
  add(atPot.to + s2f(0.2), L(40).to + s2f(0.4), "room", "учитель: проверять будем вместе", { cam: CAM.teacherS8 });
  add(L(40).to + s2f(0.4), L(41).to + s2f(0.4), "room", "Амир: скажу честно", { cam: CAM.amirS8 });
  // ---------- сцена 8 «Можно исправиться» ----------
  add(L(41).to + s2f(0.4), L(42).to + s2f(0.4), "room", "учитель: ты смог сказать правду", { cam: CAM.s8 });
  add(L(42).to + s2f(0.4), L(43).to + s2f(0.3), "room", "Юсуф: я тоже смогу исправиться", { cam: CAM.yusufS8 });
  add(L(43).to + s2f(0.3), L(44).to + s2f(0.4), "room", "учитель: просить прощения, за помощью — к нам", { cam: CAM.teacherS8 });
  const touch = M("Юсуф касается плеча");
  add(L(44).to + s2f(0.4), touch.to, "room", "Амир благодарит, Юсуф касается плеча", { cam: CAM.touch });
  const ret = M("возвращение на места");
  add(touch.to, ret.to, "room", "мальчики возвращаются на места", { cam: move(CAM.s8, CAM.wide, ret.from + s2f(0.6), ret.to - s2f(0.2)) });
  add(ret.to, end, "room", "финал: класс", { cam: CAM.wide });

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
