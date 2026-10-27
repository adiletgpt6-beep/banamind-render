// Монтажные переходы — короткие графические связки в языке референса.
// Форма из конца сцены заполняет кадр и сжимается в форму начала следующей
// (карточка пустой строки → лист приглашения; фото из класса → фото на
// домашнем столе; телефон в руке → экран телефона), ленты и круги для смены
// времени и места, линия «Көпүрө» → настил бумажного моста. На стыке сцен
// кадр закрыт, склейка не видна. Предметы внутри действия не превращаются
// друг в друга. Разговор отца и сына (сцены 6–10) идёт без связок.
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { clamp, easeIn, easeInOut, easeOut, lerp } from "./rig/motion";
import { type Iw2SceneId } from "./script";
import { C } from "./theme";
import { HOOK_CARD } from "./scenes/Hook";
import { BLANK_RECT } from "./scenes/Blank";
import { IDEA_SPAN } from "./scenes/Idea";
import { TEST_GEO, TEST_ZOOM } from "./scenes/Test";
import { PHOTO_CARD } from "./scenes/Photo";
import { PARENTS_CAM, PHOTO_ON_TABLE } from "./scenes/Parents";
import { PHONE_SCREEN } from "./scenes/Balago";

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
const FULL: Rect = { x: -20, y: -20, w: 1120, h: 1960 };
const lerpR = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

// Линия пролёта в кадре сцены 10 (камера x 640, y 1090, zoom ≈ 2.05) и
// настил моста в кадре сцены 11 (масштаб TEST_ZOOM от точки 540, 1150).
const IDEA_Z = 2.05;
const ideaLine = { x0: 540 + (IDEA_SPAN.x0 - 640) * IDEA_Z, x1: 540 + (IDEA_SPAN.x1 - 640) * IDEA_Z, y: 960 + (IDEA_SPAN.y - 6 - 1090) * IDEA_Z };
const over = TEST_GEO.bookW * 0.62;
const deckTop = TEST_GEO.tableY - TEST_GEO.stackH;
const testLine = { x0: 540 + (TEST_GEO.cx - TEST_GEO.span / 2 - over - 540) * TEST_ZOOM, x1: 540 + (TEST_GEO.cx + TEST_GEO.span / 2 + over - 540) * TEST_ZOOM, y: 1150 + (deckTop - 1150) * TEST_ZOOM };
const photoTable = { x: 540 + (PHOTO_ON_TABLE.x - PARENTS_CAM.x) * PARENTS_CAM.zoom, y: 960 + (PHOTO_ON_TABLE.y - PARENTS_CAM.y) * PARENTS_CAM.zoom, w: 150 * PARENTS_CAM.zoom };
const photoCardH = PHOTO_CARD.w * 0.78;

type T =
  | { readonly kind: "rect"; readonly into: Iw2SceneId; readonly color: string; readonly a: Rect; readonly b: Rect; readonly pre?: number; readonly post?: number; readonly border?: boolean }
  | { readonly kind: "bands"; readonly into: Iw2SceneId; readonly colors: readonly string[]; readonly pre?: number; readonly post?: number }
  | { readonly kind: "circle"; readonly into: Iw2SceneId; readonly color: string; readonly p0: { x: number; y: number }; readonly p1: { x: number; y: number }; readonly r0: number; readonly r1: number; readonly pre?: number; readonly post?: number }
  | { readonly kind: "line"; readonly into: Iw2SceneId; readonly color: string; readonly a: { x0: number; x1: number; y: number }; readonly b: { x0: number; x1: number; y: number }; readonly pre?: number; readonly post?: number };

export const TRANSITIONS: readonly T[] = [
  // карточка с пустой строкой раскрывается в лист приглашения
  { kind: "rect", into: "blank", color: C.sheet, a: HOOK_CARD, b: BLANK_RECT, pre: 10, post: 12, border: true },
  // в школу (неделю назад): тёмно-синяя и коралловая ленты
  { kind: "bands", into: "careers", colors: [C.navy, C.coral] },
  // синий круг — к чертежу
  { kind: "circle", into: "proud", color: C.blue, p0: { x: 540, y: 1000 }, p1: { x: 540, y: 1250 }, r0: 40, r1: 50 },
  // вечер дома: тёмный круг смыкается и раскрывается у лампы
  { kind: "circle", into: "backpack", color: C.night, p0: { x: 540, y: 1000 }, p1: { x: 540, y: 900 }, r0: 30, r1: 60 },
  // линия «Көпүрө» становится настилом моста
  { kind: "line", into: "test", color: C.blue, a: ideaLine, b: testLine, pre: 8, post: 14 },
  // на следующий день — в класс: жёлтая и синяя ленты
  { kind: "bands", into: "class", colors: [C.yellow, C.blue] },
  // снимок из класса ложится на домашний стол
  { kind: "rect", into: "parents", color: C.white, a: { x: PHOTO_CARD.x - PHOTO_CARD.w / 2, y: PHOTO_CARD.y - photoCardH / 2, w: PHOTO_CARD.w, h: photoCardH }, b: { x: photoTable.x - photoTable.w / 2, y: photoTable.y - 20, w: photoTable.w, h: 50 }, pre: 8, post: 14 },
  // телефон в руке мамы раскрывается в экран
  { kind: "rect", into: "balago", color: C.navy, a: { x: 470, y: 1030, w: 70, h: 120 }, b: { x: PHONE_SCREEN.x - 24, y: PHONE_SCREEN.y - 64, w: PHONE_SCREEN.w + 48, h: PHONE_SCREEN.h + 128 }, pre: 10, post: 12 },
  // ночь: тёмный круг к детской
  { kind: "circle", into: "bedtime", color: C.night, p0: { x: 540, y: 900 }, p1: { x: 300, y: 820 }, r0: 30, r1: 80 },
  // жёлтая машинка на столе → жёлтый финал
  { kind: "circle", into: "contact", color: C.yellow, p0: { x: 868, y: 1860 }, p1: { x: 540, y: 500 }, r0: 26, r1: 1400, pre: 12, post: 0 },
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
        const u = f < b ? easeIn((f - (b - pre)) / pre) : 0;
        const v = f >= b ? easeOut((f - b) / Math.max(1, post)) : 0;
        if (tr.kind === "rect") {
          const r = f < b ? lerpR(tr.a, FULL, u) : lerpR(FULL, tr.b, v);
          const o = f < b ? clamp(u * 3) : 1 - clamp((v - 0.8) / 0.2);
          return <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: tr.color, opacity: o, border: tr.border ? `4px solid ${C.ink}` : undefined, boxSizing: "border-box" }} />;
        }
        if (tr.kind === "line") {
          const k = f < b ? easeInOut((f - (b - pre)) / pre) : 0;
          const w = f < b ? lerp(8, 18, k) : lerp(18, 6, v);
          const l = f < b ? tr.a : { x0: lerp(tr.a.x0, tr.b.x0, v), x1: lerp(tr.a.x1, tr.b.x1, v), y: lerp(tr.a.y, tr.b.y, v) };
          const o = f < b ? 1 : 1 - clamp((v - 0.75) / 0.25);
          return (
            <svg key={i} width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
              <line x1={l.x0} y1={l.y} x2={l.x1} y2={l.y} stroke={tr.color} strokeWidth={w} strokeLinecap="round" />
            </svg>
          );
        }
        if (tr.kind === "bands") {
          const n = tr.colors.length;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {tr.colors.map((c, k) => {
                const lag = (k / n) * 0.35;
                const inT = f < b ? easeInOut(clamp((f - (b - pre)) / pre / (1 - lag) - lag)) : 1;
                const outT = f >= b ? easeInOut(clamp(((f - b) / post - (n - 1 - k) * 0.12) / 0.7)) : 0;
                const x = f < b ? lerp(-2400, -400, inT) : lerp(-400, 1560, outT);
                return <div key={c + k} style={{ position: "absolute", left: x, top: -140, width: 1900, height: 2200, backgroundColor: c, transform: "skewX(-14deg)" }} />;
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
