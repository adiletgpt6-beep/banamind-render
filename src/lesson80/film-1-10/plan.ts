// План реквизита фильма 80-1-10: где находится каждая из 25 карточек, сколько
// на ней нарисовано, что написано на плакате, где карандаши, маркер,
// текстовые карточки и полоски крепления — в любой кадр фильма. Все моменты
// берутся из шкалы (реплики, паузы, отрезки действий), поэтому при новой
// озвучке план пересчитывается сам. Чистые функции кадра, без React.
//
// Этапы плаката (как в задании):
//   P0 — лист пуст; P1 — заголовок (пишется на реплике 10); P2 — «Аллах Един»
//   (после ответа Амира, реплики 13–14); P3 — «У Аллаха нет начала» (после
//   реплик 19–22); P4 — лодочка и подпись на карточке Амира, закреплены все 25
//   детских карточек (сцена 7); P5 — плакат на доске (сцена 8).
import { FPS } from "../core/video.ts";
import { clamp, easeInOut, hash01, lerp, type Vec } from "../rig/motion.ts";
import { cellCenter, DESK, posterToDesk, type Vec as LVec } from "./layout.ts";
import { classRoster, type DrawingKind, type RosterEntry } from "./roster.ts";
import { BOAT_YUSUF_SHARE } from "./drawingPaths.ts";
import { textCardSlot } from "./posterText.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type PosterStage = "P0" | "P1" | "P2" | "P3" | "P4" | "P5";

export const sec = (s: number) => Math.round(s * FPS);
export const seg = (t: number, from: number, to: number) => (to <= from ? (t >= to ? 1 : 0) : clamp((t - from) / (to - from)));
// Ключи [[кадр, значение]...] с плавными переходами.
export const keyed = (t: number, pts: readonly (readonly [number, number])[], ease: (x: number) => number = easeInOut) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (t <= t1) return t1 <= t0 ? v1 : lerp(v0, v1, ease((t - t0) / (t1 - t0)));
  }
  return pts[pts.length - 1][1];
};
// Линейные ключи (для доли нарисованного: ровный темп штрихов).
export const linear = (t: number, pts: readonly (readonly [number, number])[]) => keyed(t, pts, (x) => clamp(x));
export const arc = (a: LVec, b: LVec, u: number, lift: number): LVec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) + lift * Math.sin(Math.PI * clamp(u)) });

export type Span = { readonly from: number; readonly to: number };

// Где карточка: у владельца (на его месте/доске для рисования), в руке,
// на плакате (лежит или закреплена), в стопке у Билала/учителя.
export type CardWhere = "owner" | "hand" | "poster" | "stack";
export type CardState = {
  readonly id: string;
  readonly owner: string;
  readonly kind: DrawingKind;
  readonly where: CardWhere;
  readonly holder: string | null; // кто держит (where = "hand")
  readonly desk: LVec | null; // центр на столе (мм), если лежит на столе/плакате
  readonly rot: number;
  readonly progress: number; // доля нарисованного 0…1
  readonly tape: number; // 0…2 полоски
  readonly boat: number; // только карточка Амира
  readonly caption: number;
};

export type PencilState = { readonly color: string; readonly owner: string; readonly inHand: boolean; readonly desk: LVec };

export type Plan = ReturnType<typeof buildPlan>;

const MAIN_DRAW: Record<"yusuf" | "amir" | "bilal", { readonly spot: { x: number; y: number; rot: number } }> = {
  yusuf: { spot: DESK.drawYusuf },
  amir: { spot: DESK.drawAmir },
  bilal: { spot: DESK.drawBilal },
};

export const buildPlan = (tl: L80Timeline) => {
  const L = (id: number): Span => {
    const c = cueById(tl, id);
    return { from: sec(c.from), to: sec(c.to) };
  };
  const M = (label: string): Span => {
    const m = markOf(tl, label);
    return { from: sec(m.from), to: sec(m.to) };
  };
  const word = (id: number, prefix: string, fallback: number) => {
    const c = cueById(tl, id);
    const w = c.words.find((x) => x.text.replace(/[«»"]/g, "").toLowerCase().startsWith(prefix.toLowerCase()));
    return w ? sec(w.start) : sec(c.from + (c.to - c.from) * fallback);
  };
  const pauses = tl.pauses.map((p) => ({ id: p.id, from: sec(p.from), to: sec(p.to) }));
  const inPause = (t: number) => pauses.some((p) => t >= p.from - 2 && t < p.to);

  // ---------- сцена 1: лист, карточки, карандаши, рисование ----------
  const s1 = M("общий план: лист");
  const spread = { from: s1.from + sec(0.5), to: s1.from + sec(2.5) };
  const smooth = { from: s1.from + sec(2.5), to: s1.from + sec(3.9) };
  const deal = M("карточки каждому");
  // учитель отдаёт три чистые карточки: Юсуфу, затем Амиру и Билалу (из рук в руки)
  const dealTo = {
    yusuf: { give: deal.from + sec(0.25), land: deal.from + sec(0.95) },
    amir: { give: deal.from + sec(1.05), land: deal.from + sec(1.85) },
    bilal: { give: deal.from + sec(1.95), land: deal.from + sec(3.0) },
  } as const;
  // карандаши: каждый берёт свой цвет из пенала незадолго до своей реплики
  const pencilTake = {
    yusuf: { reach: L(2).from - sec(0.7), grab: L(2).from - sec(0.25), back: L(2).from + sec(0.45), color: "#D94A3A" },
    amir: { reach: L(3).from - sec(0.6), grab: L(3).from - sec(0.2), back: L(3).from + sec(0.5), color: "#4E9A4A" },
    bilal: { reach: L(4).from - sec(0.7), grab: L(4).from - sec(0.2), back: L(4).from + sec(0.6), color: "#4A86C8" },
  } as const;
  const drawY = M("рисует Юсуф");
  const drawA = M("рисует Амир");
  const drawB = M("рисует Билал");
  const ready = M("рисунки готовы");
  const drawStart = { yusuf: pencilTake.yusuf.back + sec(0.4), amir: pencilTake.amir.back + sec(0.4), bilal: pencilTake.bilal.back + sec(0.4) };
  // Прогресс рисунков. В крупных планах сцены 1 (отрезки «рисует …» и
  // «рисунки готовы») каждый рисует только штрихи цвета своего карандаша:
  // Юсуф — красные заливки яблока, Амир — светло-зелёную крону, Билал —
  // голубой океан. Штрихи других цветов (контуры, ствол, листик, материки)
  // рисуются, пока мальчик не в крупном плане. Границы штрихов —
  // strokeEndFractions(DRAWING_PLANS[…]) в drawingPaths.ts (проверяет тест).
  const m = sec(0.2);
  const mainProgress = {
    yusuf: (t: number) =>
      linear(t, [
        [drawStart.yusuf, 0],
        [drawY.from - m, 0.38],
        [drawY.to + m, 0.52],
        [ready.from - m, 0.85],
        [ready.from + sec(1.2), 1],
      ]),
    amir: (t: number) =>
      linear(t, [
        [drawStart.amir, 0],
        [drawA.from - m, 0.4],
        [drawA.to + m, 0.56],
        [ready.from - sec(0.8), 1],
      ]),
    bilal: (t: number) =>
      linear(t, [
        [drawStart.bilal, 0],
        [drawB.from - m, 0.29],
        [drawB.to + m, 0.45],
        [ready.from + sec(0.9), 1],
      ]),
  };
  // карандаш кладут не раньше чем через 0,5 с после последнего штриха
  const pencilDown = { yusuf: ready.from + sec(1.75), amir: ready.from - sec(0.2), bilal: ready.from + sec(1.4) };

  // ---------- сцена 2: три рисунка ложатся на лист; заголовок ----------
  const lay = M("три рисунка на лист");
  // учитель берёт яблоко со стола у Юсуфа, дерево и Землю — из протянутых рук
  const layOf = {
    yusuf: { take: lay.from + sec(0.35), put: lay.from + sec(1.15) },
    amir: { offer: lay.from + sec(0.9), take: lay.from + sec(1.45), put: lay.from + sec(2.2) },
    bilal: { offer: lay.from + sec(1.7), take: lay.from + sec(2.4), put: lay.from + sec(3.2) },
  } as const;
  const write = { cap: L(10).from + sec(0.1), start: L(10).from + sec(0.9), end: M("заголовок пишется").to - sec(0.25) };
  const titleProgress = (t: number) => linear(t, [[write.start, 0], [write.end, 1]]);
  const markerDown = M("заголовок готов").from + sec(0.6);

  // ---------- сцена 3: птица; «Аллах Един» ----------
  const bird = M("птица от ученика");
  const birdPass = { offer: bird.from + sec(0.2), take: bird.from + sec(1.0), put: bird.from + sec(2.3), back: bird.from + sec(3.0) };
  const textOne = M("карточка «Аллах Един»");
  // карточку несут от стопки 1,1 с (без рывка в крупном плане), переворачивают
  // над местом, кладут и прижимают двумя полосками
  const textOneEv = { take: textOne.from + sec(0.2), flip: textOne.from + sec(1.3), flipped: textOne.from + sec(1.75), put: textOne.from + sec(2.25), tape1: textOne.from + sec(2.8), tape2: textOne.from + sec(3.3) };

  // ---------- сцена 4: папка; «У Аллаха нет начала» ----------
  const folder = M("Юсуф и папка");
  const folderTouch = { reach: folder.from + sec(0.4), touch: folder.from + sec(1.0), off: folder.from + sec(2.4), back: folder.from + sec(2.9) };
  const textTwo = M("карточка «У Аллаха нет начала»");
  const textTwoEv = { take: textTwo.from + sec(0.2), flip: textTwo.from + sec(1.3), flipped: textTwo.from + sec(1.8), put: textTwo.from + sec(2.35), tape1: textTwo.from + sec(2.95), tape2: textTwo.from + sec(3.5) };

  // ---------- сцена 7: лодочка на карточке, подпись, сборка ----------
  const boatDraw = M("рисуем лодочку");
  const caption = M("подпись под лодочкой");
  // карандаш для лодочки (синий): Юсуф берёт из пенала, рисует нижнюю линию
  // корпуса, передаёт карандаш Амиру; Амир заканчивает контур, затем подпись
  const boatPencil = {
    // Юсуф тянется к синему карандашу, пока Амир договаривает; от пенала до
    // карточки — около секунды
    yReach: L(36).to - sec(0.45),
    yGrab: boatDraw.from - sec(0.1),
    yStart: boatDraw.from + sec(0.95),
    yEnd: boatDraw.from + sec(2.1),
    handoff: boatDraw.from + sec(2.55),
    aStart: boatDraw.from + sec(2.95),
    aEnd: boatDraw.to - sec(0.2),
    capStart: caption.from + sec(0.25),
    capEnd: caption.to - sec(0.35),
    down: M("карточка Амира").from + sec(0.25),
  };
  const BOAT_Y_SHARE = BOAT_YUSUF_SHARE; // доля контура лодочки, которую рисует Юсуф (нижняя линия)
  const boatProgress = (t: number) =>
    linear(t, [
      [boatPencil.yStart, 0],
      [boatPencil.yEnd, BOAT_Y_SHARE],
      [boatPencil.aStart, BOAT_Y_SHARE],
      [boatPencil.aEnd, 1],
    ]);
  const captionProgress = (t: number) => linear(t, [[boatPencil.capStart, 0], [boatPencil.capEnd, 1]]);

  // Сборка: Билал передаёт учителю свою Землю (реплика 37), ряды передают
  // стопки карточек к столику, Билал собирает их и относит учителю; учитель закрепляет все карточки, Юсуф и Амир
  // придерживают нижние углы листа.
  const pass = M("сборка: карточки передают");
  const l37 = L(37);
  const earthHand = { take: l37.to + sec(0.1), give: l37.to + sec(0.6), put: pass.from + sec(0.5) };

  // ---------- передача карточек по рядам ----------
  // Каждый из трёх ближних рядов спокойно передаёт стопку слева направо, к
  // столику: стопка останавливается у очередного ученика, он кладёт сверху
  // свою карточку и передаёт стопку соседу справа. Ученики заднего ряда
  // отдают свои карточки вперёд — ближайшему в третьем ряду — до того, как
  // стопка дойдёт до него. Билал встаёт и собирает стопки у концов рядов
  // (ряд 0, 1, 2), относит их к столику и отдаёт Амиру, Амир — учителю.
  type Hop = { readonly holder: string; readonly at: number }; // с какого кадра держит
  const byRow = (row: number) => classRoster.filter((r) => !r.main && r.seat.row === row).sort((a, b) => a.seat.x - b.seat.x);
  const rows = [0, 1, 2, 3].map(byRow);
  const HOP = sec(0.45);
  const passStart = pass.from + sec(0.3);
  const rowStart = [passStart, passStart + sec(0.15), passStart + sec(0.4)] as const;
  // момент, когда стопка ряда r пришла к ученику с индексом i
  const stackArrive = (row: number, i: number) => rowStart[row] + i * HOP;
  // Билал: встаёт, обходит концы рядов, относит стопку учителю и садится
  const P0 = pass.from;
  const bilalWalk = {
    stand: P0 + sec(0.3),
    go: P0 + sec(0.9),
    at0: P0 + sec(2.6),
    collect: [P0 + sec(2.9), P0 + sec(3.75), P0 + sec(4.6)] as const,
    at1: P0 + sec(3.55),
    at2: P0 + sec(4.35),
    leave2: P0 + sec(4.75),
    atTable: P0 + sec(5.2),
    atTeacher: P0 + sec(6.45),
    handTeacher: P0 + sec(6.85),
    leaveTeacher: P0 + sec(7.0),
    backTable: P0 + sec(8.25),
    atSeat: P0 + sec(8.6),
    seated: P0 + sec(9.1),
  };
  const rowEndId = (row: number) => rows[row][rows[row].length - 1].id;
  // ближайший ученик третьего ряда перед учеником заднего ряда
  const frontOf = (r: RosterEntry) => [...rows[2]].sort((a, b) => Math.abs(a.seat.x - r.seat.x) - Math.abs(b.seat.x - r.seat.x))[0];
  const hops = new Map<string, readonly Hop[]>();
  for (const row of [0, 1, 2]) {
    rows[row].forEach((r, k) => {
      if (r.drawing === "bird") return; // птица уже на листе
      const seq: Hop[] = [{ holder: r.id, at: 0 }];
      for (let i = k + 1; i < rows[row].length; i++) seq.push({ holder: rows[row][i].id, at: stackArrive(row, i) });
      seq.push({ holder: "bilal", at: bilalWalk.collect[row] });
      hops.set(r.id, seq);
    });
  }
  for (const r of rows[3]) {
    const f2 = frontOf(r);
    const k2 = rows[2].findIndex((x) => x.id === f2.id);
    const give = stackArrive(2, k2) - sec(0.55);
    const seq: Hop[] = [{ holder: r.id, at: 0 }, { holder: f2.id, at: give }];
    for (let i = k2 + 1; i < rows[2].length; i++) seq.push({ holder: rows[2][i].id, at: stackArrive(2, i) });
    seq.push({ holder: "bilal", at: bilalWalk.collect[2] });
    hops.set(r.id, seq);
  }
  // Билал отдаёт стопку учителю (в начале реплики 38)
  const stackToTeacher = { offer: bilalWalk.handTeacher - sec(0.35), take: bilalWalk.handTeacher };
  const fixes = M("сборка: крепления");
  const gridDone = M("сетка готова");

  // Закрепление: Земля, дерево, яблоко, птица (уже лежат на листе), затем 21
  // карточка из стопки. Первые восемь — в реальном темпе (сборка в комнате, на
  // реплике 38), две — крупно сверху, затем мягкий монтажный переход к почти
  // заполненной сетке (lapse: карточки 11–24 закреплены «за кадром»), последняя —
  // крупно, в отрезке «сетка готова».
  const fixOrder: readonly string[] = (() => {
    const first = ["bilal", "amir", "yusuf", "pupil05"];
    // змейкой по рядам (слева направо, затем справа налево): соседние по
    // времени карточки — соседние на листе, рука учителя не мечется по листу
    const rest = classRoster
      .filter((r) => !first.includes(r.id))
      .sort((a, b) => a.cell.row - b.cell.row || (a.cell.row % 2 === 0 ? a.cell.col - b.cell.col : b.cell.col - a.cell.col))
      .map((r) => r.id);
    return [...first, ...rest];
  })();
  const FIX_LEN = sec(0.6); // положить карточку и прижать две полоски
  const PICK_LEAD = sec(0.4); // карточку берут из стопки за 0,4 с до закрепления
  const lapse = { from: fixes.to - sec(0.7), at: fixes.to };
  const fixAt = (k: number): number => {
    if (k === 0) return earthHand.put + sec(0.3);
    if (k < 4) return pass.from + sec(0.5 + 0.95 * k);
    if (k < 8) {
      // стопку сначала перекладывают в левую руку (0,45 с), первая карточка — после
      const a = stackToTeacher.take + sec(0.95);
      return a + ((k - 4) * Math.max(sec(0.5), fixes.from - a)) / 4;
    }
    // крупно сверху — две карточки по 1,2 с (взять, положить, две полоски)
    if (k < 10) return fixes.from + sec(0.25) + (k - 8) * sec(1.2);
    if (k < fixOrder.length - 1) return lapse.at - FIX_LEN;
    return gridDone.from + sec(0.25);
  };
  const fixTimes = new Map<string, number>(fixOrder.map((id, k) => [id, Math.round(fixAt(k))]));

  // ---------- сцена 8: плакат на доске ----------
  const lift = M("учитель поднимает лист");
  const hang = M("крепит на доске");
  const posterLift = { grip: lift.from + sec(0.5), up: lift.from + sec(1.4), stand: lift.to };
  const hangEv = { press: hang.from + sec(0.4), top1: hang.from + sec(1.0), top2: hang.from + sec(1.6), bottom1: hang.from + sec(2.3), bottom2: hang.from + sec(2.9), step: hang.from + sec(3.2) };

  // ---------- рисование фоновых учеников ----------
  // Каждый рисует в сцене 1 и понемногу дальше; к сцене 6 все рисунки
  // готовы. В зрительских паузах и во время вопросов никто не рисует.
  const s3 = M("птица от ученика").from;
  const s6 = M("Юсуф берёт лодочку").from;
  const bgDraw = (r: RosterEntry) => {
    const h = hash01(r.pupil.seed + 21);
    const start = deal.to - sec(0.6) + Math.round(h * sec(1.4));
    const midP = 0.45 + 0.25 * hash01(r.pupil.seed + 5);
    const birdDone = r.id === "pupil05" ? s3 - sec(2) : null;
    const done = birdDone ?? s3 + Math.round((s6 - s3) * (0.25 + 0.6 * hash01(r.pupil.seed + 8)));
    return { start, mid: ready.to, midP, done };
  };
  const bgDrawing = new Map(classRoster.filter((r) => !r.main).map((r) => [r.id, bgDraw(r)]));
  const bgProgress = (id: string, t: number) => {
    const d = bgDrawing.get(id)!;
    return linear(t, [
      [d.start, 0],
      [d.mid, d.midP],
      [d.done, 1],
    ]);
  };
  // рисует ли ученик сейчас (рука с карандашом движется)
  const bgDrawingNow = (id: string, t: number) => {
    const d = bgDrawing.get(id)!;
    // рядом с паузой (8 кадров до и после) не рисуют: рука успевает спокойно
    // опуститься до паузы и в паузе неподвижна
    if (inPause(t) || inPause(t + 8) || inPause(t - 8) || t < d.start || t > d.done) return false;
    // мелкие паузы между штрихами
    const r = classRoster.find((x) => x.id === id)!;
    const ph = (t + Math.floor(hash01(r.pupil.seed) * 90)) % 70;
    return ph < 52;
  };

  // ---------- состояние карточек ----------
  const cellDesk = (r: RosterEntry): LVec => posterToDesk(cellCenter(r.cell.row, r.cell.col));
  const cellRot = (r: RosterEntry) => (hash01(r.pupil.seed + 40) - 0.5) * 2.2;
  const tapeOf = (id: string, t: number) => {
    const at = fixTimes.get(id)!;
    return clamp((t - at) / (FIX_LEN * 0.5), 0, 2);
  };

  const cardState = (r: RosterEntry, t: number): CardState => {
    const base = { id: r.cardId, owner: r.id, kind: r.drawing, tape: 0, boat: 0, caption: 0 };
    const isTree = r.id === "amir";
    const extra = isTree ? { boat: boatProgress(t), caption: captionProgress(t) } : {};
    const fixAtT = fixTimes.get(r.id)!;
    const onPoster = (from: number): CardState | null =>
      t >= from ? { ...base, ...extra, where: "poster", holder: null, desk: cellDesk(r), rot: t >= fixAtT ? 0 : cellRot(r), progress: 1, tape: tapeOf(r.id, t) } : null;
    if (r.main) {
      const id = r.id as "yusuf" | "amir" | "bilal";
      const spot = MAIN_DRAW[id].spot;
      const progress = mainProgress[id](t);
      const d = dealTo[id];
      if (t < d.give) return { ...base, where: "hand", holder: "muhammad", desk: null, rot: 0, progress: 0 };
      if (t < d.land) return { ...base, where: "hand", holder: id === "yusuf" ? "muhammad" : t < (d.give + d.land) / 2 ? "muhammad" : id, desk: null, rot: 0, progress: 0 };
      // Земля Билала в сцене 7: Билал берёт её с листа и передаёт учителю
      if (id === "bilal" && t >= earthHand.take && t < earthHand.put) return { ...base, where: "hand", holder: t < earthHand.give ? "bilal" : "muhammad", desk: null, rot: 0, progress: 1 };
      if (id === "bilal" && t >= earthHand.put) return onPoster(earthHand.put)!;
      const lo = layOf[id];
      const put = lo.put;
      const fromHand = "offer" in lo ? lo.offer : lo.take;
      if (t < fromHand) return { ...base, where: "owner", holder: null, desk: { x: spot.x, y: spot.y }, rot: spot.rot, progress };
      if (t < put) return { ...base, where: "hand", holder: "offer" in lo && t < lo.take ? id : "muhammad", desk: null, rot: 0, progress: 1 };
      return onPoster(put)!;
    }
    // птица: у владельца → Билалу → на лист
    if (r.id === "pupil05") {
      const progress = bgProgress(r.id, t);
      if (t < birdPass.offer) return { ...base, where: "owner", holder: null, desk: null, rot: 0, progress };
      if (t < birdPass.put) return { ...base, where: "hand", holder: t < birdPass.take ? "pupil05" : "bilal", desk: null, rot: 0, progress: 1 };
      return onPoster(birdPass.put)!;
    }
    // остальные: у владельца → стопка ряда → Билал → Амир → учитель → лист
    const seq = hops.get(r.id)!;
    const progress = bgProgress(r.id, t);
    // карточку берут с планшета, когда к владельцу пришла стопка ряда (первый в
    // ряду начинает стопку; ученик заднего ряда передаёт карточку вперёд)
    const k = rows[r.seat.row].findIndex((x) => x.id === r.id);
    const joins = r.seat.row === 3 ? seq[1].at - sec(0.35) : k === 0 ? rowStart[r.seat.row] : stackArrive(r.seat.row, k);
    if (t < joins) return { ...base, where: "owner", holder: null, desk: null, rot: 0, progress };
    for (let i = seq.length - 1; i >= 0; i--) {
      if (t >= seq[i].at) {
        if (seq[i].holder === "bilal") {
          if (t < stackToTeacher.take) return { ...base, where: "stack", holder: "bilal", desk: null, rot: 0, progress: 1 };
          const at = fixTimes.get(r.id)!;
          // стопка в левой руке учителя; верхнюю карточку берут за PICK_LEAD до закрепления
          if (t < at - PICK_LEAD) return { ...base, where: "stack", holder: "muhammad", desk: null, rot: 0, progress: 1 };
          if (t < at) return { ...base, where: "hand", holder: "muhammad", desk: null, rot: 0, progress: 1 };
          return onPoster(at)!;
        }
        return { ...base, where: "stack", holder: seq[i].holder, desk: null, rot: 0, progress: 1 };
      }
    }
    return { ...base, where: "stack", holder: r.id, desk: null, rot: 0, progress: 1 };
  };

  const cards = (t: number) => classRoster.map((r) => cardState(r, t));

  // ---------- текстовые карточки учителя ----------
  type TextState = { readonly where: "stack" | "hand" | "poster"; readonly flip: number; readonly desk: LVec; readonly tape: number };
  const textState = (which: "one" | "two", t: number): TextState => {
    const ev = which === "one" ? textOneEv : textTwoEv;
    const slot = posterToDesk(textCardSlot(which));
    const stack = { x: DESK.textStack.x, y: DESK.textStack.y + (which === "two" ? 0 : 4) };
    if (t < ev.take) return { where: "stack", flip: 0, desk: stack, tape: 0 };
    if (t < ev.put) {
      const u = easeInOut(seg(t, ev.take, ev.put));
      return { where: "hand", flip: easeInOut(seg(t, ev.flip, ev.flipped)), desk: arc(stack, slot, u, 0), tape: 0 };
    }
    return { where: "poster", flip: 1, desk: slot, tape: clamp(seg(t, ev.tape1 - sec(0.25), ev.tape1) + seg(t, ev.tape2 - sec(0.25), ev.tape2), 0, 2) };
  };

  const stage = (t: number): PosterStage => {
    if (t >= hangEv.top1) return "P5";
    if (t >= Math.max(...fixTimes.values()) + FIX_LEN && captionProgress(t) >= 1) return "P4";
    if (t >= textTwoEv.put) return "P3";
    if (t >= textOneEv.put) return "P2";
    if (t >= write.start) return "P1";
    return "P0";
  };

  // ---------- карандаши главных героев ----------
  const pencil = (id: "yusuf" | "amir" | "bilal", t: number): PencilState => {
    const p = pencilTake[id];
    const tray: LVec = { x: DESK.pencilTray.x + (id === "yusuf" ? 38 : id === "amir" ? -8 : -50), y: DESK.pencilTray.y };
    const spot = MAIN_DRAW[id].spot;
    const rest: LVec = { x: spot.x + 70, y: spot.y + 10 };
    const inHand = t >= p.grab && t < pencilDown[id];
    return { color: p.color, owner: id, inHand, desk: t < p.grab ? tray : rest };
  };

  return {
    L,
    M,
    word,
    pauses,
    inPause,
    spread,
    smooth,
    deal,
    dealTo,
    pencilTake,
    pencilDown,
    drawStart,
    mainProgress,
    lay,
    layOf,
    write,
    titleProgress,
    markerDown,
    birdPass,
    textOneEv,
    folderTouch,
    textTwoEv,
    boatPencil,
    boatProgress,
    captionProgress,
    BOAT_Y_SHARE,
    earthHand,
    hops,
    HOP,
    passStart,
    rows,
    rowStart,
    stackArrive,
    bilalWalk,
    rowEndId,
    stackToTeacher,
    fixOrder,
    fixTimes,
    FIX_LEN,
    PICK_LEAD,
    lapse,
    posterLift,
    hangEv,
    bgProgress,
    bgDrawingNow,
    // доля «рисует» с плавными переходами (±6 кадров) — для руки фоновых учеников
    bgDrawWeight: (id: string, t: number) => {
      let n = 0;
      for (let k = -6; k <= 6; k++) n += bgDrawingNow(id, t + k) ? 7 - Math.abs(k) : 0;
      return n / 49;
    },
    cards,
    cardState: (id: string, t: number) => cardState(classRoster.find((r) => r.id === id)!, t),
    textState,
    stage,
    pencil,
    posterSpread: (t: number) => easeInOut(seg(t, spread.from, spread.to)),
  };
};

export type { Vec };
