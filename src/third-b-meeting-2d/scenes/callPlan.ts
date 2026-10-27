// План звонка в абсолютных кадрах ролика: один источник состояния для всех
// ракурсов (A — салон спереди, B — экран через плечо, C — кадр веб-камеры,
// D — монитор клиента). Подъём листа, реакции мамы и клиента — функции
// абсолютного кадра; сцены 7–10 и вступление (сцена 1) берут их отсюда,
// поэтому рисунок не меняет положение при смене камеры.
import { clamp, easeInOut, keys } from "../rig/motion.ts";
import { sceneTools } from "../plan.ts";
import type { T3bTimeline } from "../timing.ts";
import type { FeedFace } from "../props/Call.tsx";
import { T3B_VIDEO } from "../script.ts";

const FPS = T3B_VIDEO.fps;

export const callPlan = (tl: T3bTimeline) => {
  const D = sceneTools(tl, "drawing");
  const J = sceneTools(tl, "joke");
  const P = sceneTools(tl, "present");
  const A = sceneTools(tl, "approved");
  const abs = (T: ReturnType<typeof sceneTools>, f: number) => T.start + f;
  // сцена 8: альбом → лист → взгляд на маму → подъём
  const d = {
    open: [abs(D, 14), abs(D, 40)] as const,
    take: abs(D, 70),
    lookMom: abs(D, 100),
    lift: [abs(D, D.len - 118), abs(D, D.len - 80)] as const,
  };
  // сцена 9: вопрос клиента (C01), замирание, взгляд на рисунок, улыбка,
  // ответ (M04), шутка (C02), лист опускается
  const c01End = abs(J, J.to("C01"));
  const j = {
    c01: [abs(J, J.from("C01")), c01End] as const,
    freeze: [c01End, c01End + 16] as const,
    look: c01End + 16,
    smile: c01End + 26,
    m04: [abs(J, J.from("M04")), abs(J, J.to("M04"))] as const,
    kyz: abs(J, J.word("M04", "кызым")),
    c02: [abs(J, J.from("C02")), abs(J, J.to("C02"))] as const,
    lower: [abs(J, J.to("C02")) + 10, abs(J, J.to("C02")) + 40] as const,
  };
  const m03 = [abs(P, P.from("M03")), abs(P, P.to("M03"))] as const;
  const sample = abs(P, P.word("M03", "Материалдардын"));
  const c03 = [abs(A, A.from("C03")), abs(A, A.to("C03"))] as const;
  const pick = abs(A, A.word("C03", "тандайлы"));
  return { d, j, m03, sample, c03, pick, endCall: abs(A, A.to("M05")) + 20 };
};
export type CallPlan = ReturnType<typeof callPlan>;

// Лист в руках дочки поднят (0…1) в абсолютном кадре t.
export const liftAt = (c: CallPlan, t: number) => {
  if (t < c.d.lift[0]) return 0;
  if (t < c.j.lower[0]) return easeInOut(clamp((t - c.d.lift[0]) / (c.d.lift[1] - c.d.lift[0])));
  return 1 - easeInOut(clamp((t - c.j.lower[0]) / (c.j.lower[1] - c.j.lower[0])));
};

// Лицо мамы в кадре веб-камеры (абсолютный кадр t). Во время презентации —
// спокойно и уверенно, смотрит в камеру; на вопрос — короткое замирание
// (≈ 0,5 с), взгляд на рисунок (влево в кадре), улыбка, уверенный ответ.
export const momFaceAt = (c: CallPlan, t: number): FeedFace => {
  if (t < c.j.c01[0]) {
    const nod = t >= c.d.lift[0] - 60 && t < c.d.lift[1] ? 3 * Math.max(0, Math.sin(((t - c.d.lift[0] + 60) / 30) * Math.PI)) : 0;
    const speaking = t >= c.m03[0] - 4 && t <= c.m03[1] + 4;
    return { expr: speaking ? "calm" : "softSmile", face: 0.04, lookY: 0.05, nod };
  }
  if (t < c.j.freeze[1]) {
    // слушает вопрос, затем замирает
    const fr = clamp((t - c.j.freeze[0]) / 6);
    return { expr: { browIn: 2 + 5 * fr, browOut: 2 + 4 * fr, lid: 0.1 - 0.08 * fr, smile: 0.35 - 0.3 * fr }, face: 0.04, lookY: 0.04 };
  }
  if (t < c.j.m04[0]) {
    // взгляд на рисунок (в кадре слева), затем улыбка
    const lk = easeInOut(clamp((t - c.j.look) / 8));
    const sm = easeInOut(clamp((t - c.j.smile) / 10));
    return { expr: { browIn: 7 - 5 * sm, browOut: 6 - 3 * sm, lid: 0.02 + 0.12 * sm, smile: 0.05 + 0.8 * sm }, face: 0.04 - 0.28 * lk, lookX: -0.7 * lk, lookY: 0.05 };
  }
  if (t < c.j.c02[0]) {
    // отвечает в камеру с улыбкой; на «кызым» снова взгляд на дочку
    const back = easeInOut(clamp((t - c.j.m04[0]) / 8));
    const toKyz = keys(t, [[c.j.kyz - 6, 0], [c.j.kyz + 2, 1], [c.j.m04[1] + 6, 1], [c.j.m04[1] + 16, 0]]);
    return { expr: "smile", face: -0.24 * (1 - back) - 0.22 * toKyz, lookX: -0.7 * Math.max(1 - back, toKyz) };
  }
  if (t < c.j.lower[1] + 10) return { expr: "smile", face: 0.02, lookY: 0.04 };
  return { expr: "calm", face: 0.04, lookY: 0.05 };
};

// Лицо клиента: внимательно слушает; на рисунке — заметил что-то
// неожиданное (брови, взгляд); на шутке — улыбка; при выборе — кивок.
export const clientFaceAt = (c: CallPlan, t: number, hook = false): FeedFace => {
  const notice = hook ? 0 : c.d.lift[1];
  if (!hook && t < notice) return { expr: "calm", face: 0.02, lookY: 0.12, nod: t >= c.m03[0] && t < c.m03[1] ? 2 * Math.max(0, Math.sin(((t - c.m03[0]) / 40) * Math.PI)) : 0 };
  if (!hook && t >= c.j.c02[0]) {
    if (t < c.c03[0] - 30) return { expr: "smile", face: 0.02, lookY: 0.08 };
    const nod = t >= c.pick - 4 && t < c.pick + 26 ? 5 * Math.sin(((t - c.pick + 4) / 30) * Math.PI) : 0;
    return { expr: "softSmile", face: 0.02, lookY: 0.12, nod };
  }
  // замечает рисунок: глаза чуть шире, лёгкий наклон головы, затем мягкая
  // улыбка любопытства
  const k = hook ? 1 : easeInOut(clamp((t - notice) / 14));
  return { expr: { browIn: 3 + 3 * k, browOut: 2 + 4 * k, lid: 0.12 - 0.1 * k, smile: 0.15 + 0.25 * k }, face: 0.02, lookY: 0.1, lookX: -0.15 * k, tilt: -4 * k };
};

export const secOf = (f: number) => f / FPS;

// План сцены 10 (кадры сцены): курсор → «Бүтүрүү» → звонок завершён →
// крышка закрывается → выдох. Общий для анимации, звука и тестов.
export const approvedPlan = (endCall: number, m05: number, m05End: number) => {
  const cursor = m05End + 6;
  const tap = cursor + 22;
  const ended = tap + 3;
  const close: [number, number] = [ended + 24, ended + 50];
  return { m05, m05End, cursor, tap, ended, close, exhale: close[1] + 4, endCall };
};
