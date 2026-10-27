// Монтажные переходы. Большинство склеек — прямые (смена плана внутри
// сцены); монтажные рифмы (край конверта → коробка переезда, линия
// маршрута → линия календаря, рисунок → школа) решены в самих сценах
// совпадением формы и места в кадре. Здесь — только мягкие растворения
// там, где меняется время: назад «Бир нече жума мурун», обратно к столу
// и перед контактной карточкой. Предметы не превращаются друг в друга.
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { clamp, easeIn, easeInOut, easeOut, lerp } from "./rig/motion";
import { type Te2SceneId } from "./script";
import { C } from "./theme";
export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
const FULL: Rect = { x: -20, y: -20, w: 1120, h: 1960 };
const lerpR = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

type T =
  | { readonly kind: "rect"; readonly into: Te2SceneId; readonly color: string; readonly a: Rect; readonly b: Rect; readonly pre?: number; readonly post?: number }
  | { readonly kind: "bands"; readonly into: Te2SceneId; readonly colors: readonly string[]; readonly pre?: number; readonly post?: number }
  | { readonly kind: "fade"; readonly into: Te2SceneId; readonly color: string; readonly pre?: number; readonly post?: number }
  | { readonly kind: "circle"; readonly into: Te2SceneId; readonly color: string; readonly p0: { x: number; y: number }; readonly p1: { x: number; y: number }; readonly r0: number; readonly r1: number; readonly pre?: number; readonly post?: number };

export const TRANSITIONS: readonly T[] = [
  // назад во времени («Бир нече жума мурун») и обратно в настоящее —
  // короткое мягкое растворение через светлый фон
  { kind: "fade", into: "office", color: C.paper, pre: 6, post: 10 },
  { kind: "fade", into: "note", color: C.paper, pre: 8, post: 12 },
  // контакты: спокойное появление светлого фона
  { kind: "fade", into: "contact", color: C.paper, pre: 10, post: 8 },
];

export const Transitions: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  return (
    <>
      {TRANSITIONS.map((tr, i) => {
        const b = tl.scenes.find((s) => s.id === tr.into)!.from;
        const pre = tr.pre ?? 10;
        const post = tr.post ?? 10;
        if (f < b - pre || f >= b + post) return null;
        const u = f < b ? easeIn((f - (b - pre)) / pre) : 0; // закрытие кадра
        const v = f >= b ? easeOut((f - b) / Math.max(1, post)) : 0; // раскрытие
        if (tr.kind === "fade") {
          const o = f < b ? easeInOut(clamp((f - (b - pre)) / pre)) : 1 - easeInOut(clamp((f - b) / Math.max(1, post)));
          return <div key={i} style={{ position: "absolute", inset: 0, backgroundColor: tr.color, opacity: o }} />;
        }
        if (tr.kind === "rect") {
          const r = f < b ? lerpR(tr.a, FULL, u) : lerpR(FULL, tr.b, v);
          const o = f < b ? clamp(u * 3) : 1 - clamp((v - 0.8) / 0.2);
          return <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: tr.color, opacity: o }} />;
        }
        if (tr.kind === "bands") {
          const n = tr.colors.length;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {tr.colors.map((c, k) => {
                // ленты наискосок: входят слева по очереди, уходят вправо
                const lag = (k / n) * 0.35;
                const inT = f < b ? easeInOut(clamp((f - (b - pre)) / pre / (1 - lag) - lag)) : 1;
                const outT = f >= b ? easeInOut(clamp(((f - b) / post - (n - 1 - k) * 0.12) / 0.7)) : 0;
                const x = f < b ? lerp(-2400, -400, inT) : lerp(-400, 1560, outT);
                return <div key={c + k} style={{ position: "absolute", left: x, top: -140, width: 1900, height: 2200, backgroundColor: c, transform: "skewX(-14deg)", transformOrigin: "50% 50%" }} />;
              })}
            </div>
          );
        }
        const p = f < b ? tr.p0 : tr.p1;
        const R = 2300;
        const r = f < b ? lerp(tr.r0, R, u) : lerp(R, tr.r1, v);
        const o = f < b ? 1 : 1 - clamp((v - 0.75) / 0.25);
        return <div key={i} style={{ position: "absolute", left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: "50%", backgroundColor: tr.color, opacity: o }} />;
      })}
    </>
  );
};
