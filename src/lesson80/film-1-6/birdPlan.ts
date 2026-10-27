// План действий самки дрозда на весь фильм — небольшая система состояний с
// чёткими переходами, привязанными к репликам шкалы (voice-first).
// Материал (травинка) в каждый момент ровно в одном месте:
// ground → beak → nest. Гнездо начато до фильма; за фильм птица приносит
// несколько травинок и не достраивает его.
import { FPS } from "../core/video.ts";
import { buildTimeline, estimateManifest, type Timeline } from "../core/timing.ts";

export type BirdState =
  | "perchLow" // сидит на нижней ветке с травинкой в клюве
  | "takeOff"
  | "flyIn" // летит к гнезду (с травинкой)
  | "land"
  | "place" // укладывает травинку в гнездо
  | "adjust" // поправляет материал клювом
  | "idleNest" // сидит у гнезда, осматривается
  | "flyOut" // улетает за материалом (клюв пуст)
  | "away" // вне кадра
  | "groundLook" // на лужайке, осматривается
  | "pick" // поворот головы → наклон → захват травинки
  | "holdGround" // стоит с травинкой, готовится к взлёту
  | "flyUp"; // взлёт с земли и полёт к нижней ветке

export type Material = "ground" | "beak" | "nest" | "none";

export type Segment = { readonly state: BirdState; readonly at: number; readonly dur: number; readonly blade: number; readonly from?: "ground" | "low" | "nest"; readonly to?: "low" | "nest" | "away" | "ground" };

const DUR: Record<BirdState, number> = {
  perchLow: 0,
  takeOff: 0.45,
  flyIn: 2.1,
  land: 0.5,
  place: 2.6,
  adjust: 1.5,
  idleNest: 0,
  flyOut: 1.9,
  away: 0,
  groundLook: 0,
  pick: 2.2,
  holdGround: 0,
  flyUp: 2.0,
};

// Сегменты строятся по якорям реплик. Нулевая длительность — «до следующего».
export const buildBirdPlan = (tl: Timeline): Segment[] => {
  const c = (id: number) => {
    const q = tl.cues.find((x) => x.id === id);
    if (!q) throw new Error(`нет реплики ${id}`);
    return q;
  };
  const s = (id: number) => tl.scenes.find((x) => x.id === id)!;
  const seg: Segment[] = [];
  let t = 0;
  let blade = 1; // номер травинки, которую несёт птица (1 — первая в фильме)
  const push = (state: BirdState, at: number, extra: Partial<Segment> = {}) => {
    const dur = extra.dur ?? DUR[state];
    seg.push({ state, at, dur, blade, ...extra });
    t = at + dur;
  };
  // ---- Сцена 1: с травинкой на нижней ветке → к гнезду → укладка ----
  push("perchLow", s(1).from);
  const go1 = c(4).to + 0.5;
  push("takeOff", go1, { from: "low" });
  push("flyIn", t, { from: "low", to: "nest" });
  push("land", t);
  push("place", t);
  push("adjust", t);
  push("idleNest", t);
  // ---- Сцена 2: у гнезда, спокойно; небольшая поправка ----
  push("adjust", c(10).from + 0.6);
  push("idleNest", t);
  // ---- Сцена 3: при вопросе Юсуфа поправляет материал; в конце улетает ----
  push("adjust", c(12).from - 0.6);
  push("idleNest", t);
  push("flyOut", s(3).to - 3.2, { from: "nest", to: "ground" });
  blade = 2;
  push("groundLook", t);
  // ---- Сцена 4: захват → перелёт → на ветке лапами → укладка → взлёт ----
  push("pick", c(18).from - 1.4);
  push("holdGround", t);
  push("flyUp", c(18).to + 0.3, { from: "ground", to: "nest", dur: 1.8 });
  push("land", t);
  push("idleNest", t); // держит травинку, лапы на ветке (реплика 19)
  push("place", c(19).to + 0.3, { dur: 2.0 });
  push("takeOff", t + 0.2, { from: "nest" });
  push("flyOut", t, { from: "nest", to: "ground", dur: 1.6 });
  blade = 3;
  push("groundLook", t);
  push("pick", c(23).from + 0.7);
  push("holdGround", t);
  // ---- Сцена 5: возвращается к дереву с травинкой ----
  push("flyUp", s(5).from + 0.2, { from: "ground", to: "nest", dur: 2.4 });
  push("land", t);
  push("place", t);
  push("adjust", t);
  push("idleNest", t);
  push("adjust", c(28).from + 0.4);
  push("idleNest", t);
  // ---- Сцена 6: у гнезда; после реплики 33 улетает за новым материалом ----
  push("adjust", c(32).from - 0.2);
  push("idleNest", t);
  push("takeOff", c(33).to + 0.7, { from: "nest" });
  push("flyOut", t, { from: "nest", to: "away" });
  blade = 4;
  push("away", t);
  // ---- Сцена 7: прилетает с травинкой на нижнюю ветку, затем к гнезду ----
  push("flyIn", s(7).from - 0.4, { from: "ground", to: "low", dur: 2.0 });
  push("land", t);
  push("perchLow", t);
  push("takeOff", c(38).to + 0.5, { from: "low" });
  push("flyIn", t, { from: "low", to: "nest" });
  push("land", t);
  push("place", t);
  push("adjust", t);
  push("idleNest", t);
  push("takeOff", c(42).to + 0.3, { from: "nest" });
  push("flyOut", t, { from: "nest", to: "away" });
  blade = 5;
  push("away", t);
  // ---- Сцена 8: возвращается с очередной травинкой после последней реплики ----
  push("flyIn", c(45).to + 1.4, { from: "ground", to: "nest", dur: 2.4 });
  push("land", t);
  push("place", t);
  push("adjust", t);
  push("idleNest", t);
  return seg;
};

const cache = new WeakMap<Timeline, Segment[]>();
export const planOf = (tl: Timeline) => {
  let p = cache.get(tl);
  if (!p) {
    p = buildBirdPlan(tl);
    cache.set(tl, p);
  }
  return p;
};

// Текущий сегмент и доля его выполнения (0…1) в кадре фильма.
export const segmentAt = (tl: Timeline, frame: number): { seg: Segment; u: number; next?: Segment; index: number } => {
  const plan = planOf(tl);
  const t = frame / FPS;
  let i = 0;
  for (let k = 0; k < plan.length; k++) if (plan[k].at <= t) i = k;
  const seg = plan[i];
  const next = plan[i + 1];
  const end = seg.dur > 0 ? seg.at + seg.dur : next ? next.at : t + 1;
  const u = seg.dur > 0 ? Math.max(0, Math.min(1, (t - seg.at) / seg.dur)) : Math.max(0, Math.min(1, (t - seg.at) / Math.max(0.001, end - seg.at)));
  return { seg, u, next, index: i };
};

export const birdStateAt = (tl: Timeline, frame: number): BirdState => segmentAt(tl, frame).seg.state;

// Где материал (текущая травинка) в этот кадр.
export const materialAt = (tl: Timeline, frame: number): Material => {
  const { seg, u } = segmentAt(tl, frame);
  switch (seg.state) {
    case "groundLook":
      return "ground";
    case "pick":
      return u < 0.72 ? "ground" : "beak";
    case "holdGround":
    case "flyUp":
    case "perchLow":
    case "takeOff":
    case "flyIn":
    case "land":
      return seg.state === "takeOff" && seg.from === "nest" ? "none" : "beak";
    case "place":
      return u < 0.62 ? "beak" : "nest";
    case "idleNest":
      // после приземления с травинкой в сцене 4 (реплика 19) — ещё в клюве
      return bladeStillInBeak(tl, frame) ? "beak" : "nest";
    default:
      return "none";
  }
};

// Травинка остаётся в клюве, если после посадки ещё не было укладки.
const bladeStillInBeak = (tl: Timeline, frame: number) => {
  const plan = planOf(tl);
  const { index } = segmentAt(tl, frame);
  for (let k = index; k >= 0; k--) {
    const s = plan[k].state;
    if (s === "place" || s === "adjust" || s === "flyOut" || s === "away") return false;
    if (s === "land") return true;
  }
  return false;
};

// Сколько травинок уложено в гнездо к этому кадру (в фильме; база гнезда — отдельно).
export const nestCountAt = (tl: Timeline, frame: number): number => {
  const plan = planOf(tl);
  const t = frame / FPS;
  let n = 0;
  for (const s of plan) if (s.state === "place" && t >= s.at + s.dur * 0.62) n++;
  return n;
};

// План по оценочной шкале (для тестов и Studio).
export const BIRD_PLAN = buildBirdPlan(buildTimeline(estimateManifest()));
