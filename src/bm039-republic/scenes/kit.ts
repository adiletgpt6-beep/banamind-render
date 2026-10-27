// Общие помощники сценария: реплики, вопросы, места для фигур и пометки статуса мысли.
import type { MoodName, PoseName } from "../../banana-host";
import { DOT } from "../theme.ts";
import type { Line, Overlay, ShapeSpec } from "../types";

export const L = (id: string, text: string, pose?: PoseName, mood?: MoodName, extra: Partial<Line> = {}): Line => ({ id, text, pose, mood, ...extra });
// вопрос зрителю: после него спокойная карточка и пауза «подумайте» (без таймера)
export const Q = (id: string, text: string, extra: Partial<Line> = {}): Line => ({ id, text, pose: "ask", mood: "wonder", wait: 6, ...extra });

// где рисовать фигуру: банан слева → сцена справа, и наоборот
export const AT = {
  right: { x: 1190, y: 550, s: 0.86 }, // банан слева
  left: { x: 750, y: 550, s: 0.86 }, // банан справа
  mid: { x: 960, y: 545, s: 0.9 }, // банан в углу/за кадром
  big: { x: 960, y: 520, s: 0.92 },
};
export const shape = (kind: string, at: { x: number; y: number; s: number }, extra: Record<string, unknown> = {}): ShapeSpec => ({ kind, ...at, ...extra });

// пометки статуса мысли (правый верхний угол)
const B = (text: string, color: string) => (at: number, until?: number): Overlay => ({ at, until, kind: "badge", text, color });
export const SAYS = (who: string) => B(`В ДИАЛОГЕ: ${who.toUpperCase()}`, DOT.sky);
export const MODEL = B("МОДЕЛЬ ПЛАТОНА — НЕ ДОКАЗАННЫЙ ЗАКОН", DOT.amber);
export const MYTH = B("МИФ ВНУТРИ ДИАЛОГА — НЕ ФАКТ", DOT.pink);
export const OURS = B("ТОЛКОВАНИЕ BANAMIND", DOT.gold);
export const DISPUTED = B("СПОРНОЕ МЕСТО", DOT.red);

export const chip = (at: number, text: string, x: number, y: number, color: string = DOT.gold, extra: Record<string, unknown> = {}): Overlay => ({ at, kind: "chip", text, x, y, color, ...extra });
export const title = (at: number, text: string, extra: Record<string, unknown> = {}): Overlay => ({ at, kind: "title", text, ...extra });
export const quote = (at: number, text: string, ref: string, extra: Record<string, unknown> = {}): Overlay => ({ at, kind: "quote", text, ref: `Платон, «Государство», ${ref} (пер. А. Н. Егунова)`, ...extra });
export const chapter = (at: number, num: string, text: string, extra: Record<string, unknown> = {}): Overlay => ({ at, kind: "chapter", num, text, ...extra });
