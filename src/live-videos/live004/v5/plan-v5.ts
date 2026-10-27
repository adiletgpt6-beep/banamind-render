// LIVE-004 v5 — полировка v4 (V5_BRIEF.md, Issue #72): тот же монтаж,
// эффекты и тайминги, кроме пяти пунктов. Без импортов Remotion.
import { PLAN as V4_PLAN, V4_CUE, V4_EFFECTS, V4_GESTURE, V4_SFX } from "../v4/plan-v4.ts";

export const V5_CUE = V4_CUE;

// Жест вверх уточнён покадрово (шаг 0,1 с): палец поднят 29,65–30,55 с,
// пик ≈ 29,8 с; кончик пальца ≈ (470–500, 725–775) px; очки — правее x ≈ 515.
export const V5_GESTURE = {
  ...V4_GESTURE,
  pointUpPeak: 29.8,
  pointUpTo: 30.55,
  fingertip: { x: 485, y: 740 },
} as const;

export const V5_END_SEC = 34.5;
// Маршрут в v5 держится до 27,75 с (≈0,6 с после склейки), чтобы сигнал
// завершения поездки успели увидеть; остальные эффекты — как в v4.
export const V5_ROUTE_END = 27.75;
export const V5_EFFECTS = V4_EFFECTS.map((e) => (e.id === "route" ? { ...e, to: V5_ROUTE_END } : e));
export const V5_SFX = V4_SFX;

// Пять исправлений v5 (для отчёта и проверок).
export const V5_FIXES = [
  { id: "fountain-grade", from: 18.2, to: 27.1, what: "планы у фонтана светлее в средних тонах и на лице, без пересвета" },
  { id: "tempo-no-numbers", from: V4_CUE.kayra2, to: 14.3, what: "шкала без процентов: «ТЕМП ТҮШТҮ» → «КАЙРА ТЕМПКЕ»" },
  { id: "route-smooth", from: V4_CUE.erteng - 0.3, to: 27.75, what: "плавнее метка, видимее линии и пункты, сигнал завершения поездки" },
  { id: "instagram-safe", from: V4_GESTURE.pointUpFrom, to: V4_CUE.zhe, what: "шапка ниже края, крупнее «шилтеме», стрелка точно в ссылку" },
  { id: "whatsapp-fast", from: V4_CUE.tomonku, to: V5_END_SEC, what: "номер контрастный сразу (≈0,2 с), потом неподвижен" },
] as const;

export const PLAN = {
  ...V4_PLAN,
  version: "v5",
  effects: V5_EFFECTS,
  inserts: V5_EFFECTS.filter((e) => e.kind === "insert" || e.kind === "cta-visual"),
  fixes: V5_FIXES,
} as const;
