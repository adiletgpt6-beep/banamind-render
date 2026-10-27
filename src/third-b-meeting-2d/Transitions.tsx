// Монтажные переходы между сценами — короткие предметные связки, по
// референсу: один главный объект, непрерывность формы и направления.
//   • окно видеозвонка (сцена 1) → прямоугольная форма → крышка ноутбука
//     в студии (сцена 2);
//   • янтарная светящаяся линия на почти чёрном фоне (единственный
//     «неоновый» акцент): линия эскиза вывески продолжается в линию
//     нового дня (сцена 3);
//   • вечер: тёмный круг смыкается и раскрывается на тёплой лампе
//     (сцена 13);
//   • тёплый жёлтый круг из центра рисунка → фон контактной карточки.
// Подготовка → действие → короткое завершение; на стыке кадр закрыт, склейка
// не видна. Внутри сцен предметы не превращаются друг в друга.
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { clamp, easeIn, easeInOut, easeOut, lerp } from "./rig/motion";
import { type T3bSceneId } from "./script";
import { C } from "./theme";

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
const FULL: Rect = { x: -20, y: -20, w: 1120, h: 1960 };
const lerpR = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

type T =
  | { readonly kind: "rect"; readonly into: T3bSceneId; readonly color: string; readonly a: Rect; readonly b: Rect; readonly pre?: number; readonly post?: number }
  | { readonly kind: "line"; readonly into: T3bSceneId; readonly pre?: number; readonly post?: number }
  | { readonly kind: "circle"; readonly into: T3bSceneId; readonly color: string; readonly p0: { x: number; y: number }; readonly p1: { x: number; y: number }; readonly r0: number; readonly r1: number; readonly pre?: number; readonly post?: number };

// окно звонка в сцене 1 (кадр веб-камеры, масштаб 1,95) и крышка ноутбука
// в общем плане студии
const CALL_WINDOW: Rect = { x: 0, y: 900 - 270 * 1.95, w: 1080, h: 540 * 1.95 };
const STUDIO_LID: Rect = { x: 650, y: 1108, w: 300, h: 192 };

export const TRANSITIONS: readonly T[] = [
  { kind: "rect", into: "studio", color: "#B7BCC5", a: CALL_WINDOW, b: STUDIO_LID, pre: 12, post: 16 },
  { kind: "line", into: "calendar", pre: 14, post: 12 },
  { kind: "circle", into: "search", color: "#22283A", p0: { x: 540, y: 900 }, p1: { x: 940, y: 920 }, r0: 30, r1: 90, pre: 14, post: 16 },
  { kind: "circle", into: "contact", color: C.yellow, p0: { x: 540, y: 980 }, p1: { x: 540, y: 960 }, r0: 20, r1: 1300, pre: 14, post: 0 },
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
        if (tr.kind === "rect") {
          const r = f < b ? lerpR(tr.a, FULL, u) : lerpR(FULL, tr.b, v);
          const o = f < b ? clamp(u * 3) : 1 - clamp((v - 0.8) / 0.2);
          return <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: tr.color, borderRadius: 18 * (f < b ? 1 - u : v), opacity: o }} />;
        }
        if (tr.kind === "line") {
          // тёмный фон наплывает, янтарная линия прочерчивается слева
          // направо (как штрих эскиза) и уходит вправо, открывая сцену
          const dark = f < b ? easeInOut(clamp((f - (b - pre)) / (pre * 0.6))) : 1 - easeInOut(clamp((f - b) / post));
          const draw = f < b ? easeInOut(clamp((f - (b - pre)) / pre)) : 1;
          const leave = f >= b ? easeIn(clamp((f - b) / post)) : 0;
          const x0 = lerp(80, 1100, leave);
          const x1 = lerp(80, 1000, draw) + leave * 200;
          return (
            <svg key={i} width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
              <rect x={0} y={0} width={1080} height={1920} fill={C.night} opacity={0.94 * dark} />
              <line x1={x0} y1={960} x2={Math.max(x0, x1)} y2={960} stroke={C.amber} strokeWidth={34} strokeLinecap="round" opacity={0.35} />
              <line x1={x0} y1={960} x2={Math.max(x0, x1)} y2={960} stroke="#FFD9A8" strokeWidth={10} strokeLinecap="round" />
            </svg>
          );
        }
        const p = f < b ? tr.p0 : tr.p1;
        const R = 2300;
        const r = f < b ? lerp(tr.r0, R, u) : lerp(R, tr.r1, v);
        const o = f < b ? 1 : post ? 1 - clamp((v - 0.75) / 0.25) : 0;
        return <div key={i} style={{ position: "absolute", left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: "50%", backgroundColor: tr.color, opacity: o }} />;
      })}
    </>
  );
};
