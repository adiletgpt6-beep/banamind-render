// Сцена 13. Конверты в коробке (N08, затем без речи).
// A. Мама подходит к открытой двери комнаты и останавливается в проёме.
//    Аян у стола собирает конверты.
// B. Сверху: ряд конвертов сдвигается в ровную пачку, пачка уходит в
//    деревянную коробку (без исчезновения через прозрачность).
// C. Завершение (монтажное сокращение): в коробке 24, «Эмир» лежит на столе
//    отдельно; рядом ручка и новый комикс Аяна.
// D. Аян открывает «Эмир» и достаёт ту же записку (две строки благодарности).
// E. Записка лежит на столе; Аян берёт ручку.
// F. Крупно: кончик ручки на бумаге — под старыми строками проявляется
//    «Эртең…», склейка, он заканчивает последнее слово и отрывает ручку.
// G. Новая строка открыта и читается (≈ 3 с), ручка лежит рядом.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { EMIR, NOTE } from "../script";
import { box, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { CloseHand, SKIN } from "../props/CloseHand";
import { HeldEnvelope, WarmBg } from "../props/Held";
import { ADDED_LINE, NOTE_H, NOTE_W, NoteSheet, Pen, penTipAt } from "../props/Note";
import { gridLayout, TOP, type EnvState } from "../sets/Room";
import { DeskTop } from "./desk";
import { ayanSeated, AYAN_SEAT, onDesk, RoomFront, type ActorSpec } from "./room";
import { H } from "./common";

export const boxPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "box");
  const L = T.len;
  const a = Math.max(T.to("N08") + 4, 80);
  const write1 = a + 186;
  return {
    door: [4, 30] as const,
    gather: [a + 8, a + 34] as const,
    drop: [a + 40, a + 64] as const,
    done: a + 70,
    open: a + 96,
    held: { turn: [a + 100, a + 112], flap: [a + 114, a + 126], pull: [a + 128, a + 150] } as const,
    desk: a + 154,
    penUp: [a + 160, a + 180] as const,
    write1,
    write1End: write1 + 50,
    write2: write1 + 50,
    write2End: write1 + 86,
    lift: write1 + 90,
    len: L,
  };
};
type P = ReturnType<typeof boxPlan>;

// Конверты, которые Аян собирает в кадре B (ряд 3: пять имён).
const ROW = 3;

export const finalItems = (): EnvState[] => gridLayout().map((e) => (e.env.id === EMIR.id ? e : { ...e, hidden: true }));

const u = (f: number, ab: readonly [number, number]) => easeInOut(clamp((f - ab[0]) / Math.max(1, ab[1] - ab[0])));

// Сколько букв новой строки видно: «Эртең» — первый план, затем склейка на
// последнее слово «келем.»
export const writtenChars = (f: number, p: P) => {
  const n = [...NOTE.added].length;
  const first = [..."Эртең"].length;
  const lastFrom = NOTE.added.lastIndexOf(" ") + 1;
  if (f < p.write1) return 0;
  if (f < p.write1End) return lerp(0, first, clamp((f - p.write1) / (p.write1End - p.write1 - 6)));
  if (f < p.write2End) return lerp(lastFrom, n, clamp((f - p.write2) / (p.write2End - p.write2 - 4)));
  return n;
};

// Записка крупно с рукой и ручкой (координаты кадра).
const SHEET = { x: 60, y: 560 } as const;
const PEN_A = 138; // ручка наклонена к руке: кисть снизу справа от строки
const Writing: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const chars = writtenChars(f, p);
  const lift = keys(f, [[p.write2End, 0], [p.lift, 16], [p.lift + 20, 60]]);
  const tip0 = penTipAt(NOTE.added, ADDED_LINE.x, ADDED_LINE.y, Math.max(0.001, chars));
  const tip = { x: SHEET.x + tip0.x, y: SHEET.y + tip0.y - lift };
  // после письма рука уходит вправо, ручка ложится у края листа
  const away = clamp((f - p.lift - 10) / 18);
  const r = (PEN_A * Math.PI) / 180;
  const grip = { x: tip.x + 110 * Math.sin(r), y: tip.y - 110 * Math.cos(r) };
  const L = 240;
  const wrist = { x: grip.x + 0.55 * L * Math.sin(r) + away * 420, y: grip.y - 0.55 * L * Math.cos(r) + away * 380 };
  const penRest = { x: SHEET.x + NOTE_W - 120, y: SHEET.y + NOTE_H + 70 };
  return (
    <WarmBg>
      <div style={box({ left: SHEET.x, top: SHEET.y })}>
        <NoteSheet added={chars} fold={1} />
      </div>
      <Svg>
        {away < 1 ? <Pen x={tip.x} y={tip.y} angle={PEN_A} len={300} lift={0} /> : <Pen x={penRest.x} y={penRest.y} angle={80} len={300} />}
        {away < 1 ? <CloseHand x={wrist.x} y={wrist.y} angle={PEN_A} size={L} {...SKIN.ayan} shape="pinch" armLen={4} /> : null}
      </Svg>
    </WarmBg>
  );
};

// Записка на столе сверху (масштаб 0,5 от крупного плана).
const NoteOnDesk: React.FC<{ added?: number }> = ({ added = 0 }) => (
  <div style={box({ left: TOP.noteSpot.x - NOTE_W * 0.25, top: TOP.noteSpot.y - NOTE_H * 0.25, transform: "scale(0.5)", transformOrigin: "0 0" })}>
    <NoteSheet added={added} fold={1} />
  </div>
);

export const BoxScene: React.FC = () => {
  const { f } = useScene("box");
  const p = usePlan(boxPlan);
  // ---- A: мама в дверях, Аян собирает конверты ----
  if (f < p.gather[0] - 8) {
    const mom: ActorSpec = {
      uid: "b-mom",
      look: "momHome",
      place: (t) => ({ x: lerp(1330, 1250, easeInOut(clamp((t - p.door[0]) / (p.door[1] - p.door[0])))), y: 1520, h: H.mom * 0.86 }),
      face: () => -0.5,
      pose: () => ({ expr: "softSmile", lookY: 0.35, nod: 4, armL: { target: { x: 1185, y: 1080 }, shape: "open", elbow: "down" } }),
      seed: 12,
      walkFrom: p.door[0] - 2,
    };
    const ayan: ActorSpec = {
      uid: "b-ayan",
      look: "ayanHome",
      place: () => AYAN_SEAT,
      face: () => 0,
      pose: (t) => ayanSeated({ expr: "calm", lookY: 0.7, nod: 8, armL: { target: onDesk(1500 - Math.sin(t / 8) * 80, 1100), shape: "open", elbow: "down" }, armR: { target: onDesk(900, 1100), shape: "open", elbow: "down" } }),
      seed: 11,
    };
    return <RoomFront f={f} cam={{ x: 860, y: 1010, zoom: 1.12 }} items={gridLayout().map((e) => (e.env.row >= ROW + 1 ? { ...e, hidden: true } : e))} boxInside={5} ayan={ayan} momBack={mom} door={1} />;
  }
  // ---- B: ряд → пачка → коробка ----
  if (f < p.done) {
    const g = u(f, p.gather);
    const d = u(f, p.drop);
    const pile = { x: lerp(TOP.grid(ROW, 4).x, TOP.box.x, d), y: lerp(TOP.grid(ROW, 4).y, TOP.box.y, d) - Math.sin(Math.PI * d) * 120 };
    const items = gridLayout()
      .filter((e) => e.env.row !== ROW + 1)
      .map((e) => {
        if (e.env.row > ROW) return { ...e, hidden: true };
        if (e.env.row === ROW) {
          if (d > 0.02) return { ...e, hidden: true };
          return { ...e, x: lerp(e.x, TOP.grid(ROW, 4).x + (4 - e.env.col) * -3, g), y: lerp(e.y, TOP.grid(ROW, 4).y - (4 - e.env.col) * 3, g), rot: lerp(e.rot ?? 0, 0, g) };
        }
        return e;
      });
    const inside = d >= 1 ? 10 : 5;
    const hand = { x: lerp(TOP.grid(ROW, 0).x - 80, pile.x - 40, g) + 0, y: (d > 0 ? pile.y : TOP.grid(ROW, 2).y) + 240 };
    return (
      <DeskTop
        f={f}
        cam={{ x: 1450, y: 900, zoom: 0.62 }}
        items={items}
        boxInside={inside}
        above={
          d > 0.02 && d < 1 ? (
            <Svg>
              {[4, 3, 2, 1, 0].map((k) => (
                <rect key={k} x={pile.x - 150 + k * 2} y={pile.y - 96 - k * 4} width={300} height={192} rx={8} fill={k ? "#EFE6D2" : "#FBF6EA"} stroke="#D9C9A8" strokeWidth={3} />
              ))}
            </Svg>
          ) : null
        }
        hands={[{ x: hand.x + 140, y: hand.y + 60, angle: 160, size: 240, skin: SKIN.ayan, shape: d > 0 && d < 1 ? "pinch" : "open" }]}
      />
    );
  }
  // ---- C: завершение — 24 в коробке, «Эмир» отдельно ----
  if (f < p.open) {
    return <DeskTop f={f} cam={{ x: 1450, y: 1050, zoom: 0.6 }} items={finalItems()} boxInside={24} />;
  }
  // ---- D: Аян открывает «Эмир» ----
  if (f < p.desk) {
    return <HeldEnvelope name={EMIR.name} turn={u(f, p.held.turn)} open={u(f, p.held.flap)} out={u(f, p.held.pull)} content="note" skin={SKIN.ayan} />;
  }
  // ---- E: записка на столе, Аян берёт ручку ----
  if (f < p.write1) {
    const k = u(f, p.penUp);
    const items = finalItems().map((e) => ({ ...e, empty: true, x: TOP.noteSpot.x - 120, y: TOP.noteSpot.y - 330, rot: -6 }));
    return (
      <DeskTop
        f={f}
        cam={{ x: 1350, y: 1300, zoom: 0.95 }}
        items={items}
        boxInside={24}
        pen={k < 0.5 ? { x: TOP.pen.x, y: TOP.pen.y } : { x: lerp(TOP.pen.x, TOP.noteSpot.x, k), y: lerp(TOP.pen.y, TOP.noteSpot.y, k), angle: -40 }}
        above={<NoteOnDesk />}
        hands={[{ x: lerp(TOP.pen.x + 200, TOP.noteSpot.x + 200, k), y: lerp(TOP.pen.y + 160, TOP.noteSpot.y + 160, k), angle: 150, size: 260, skin: SKIN.ayan, shape: "pinch" }]}
      />
    );
  }
  // ---- F, G: письмо и открытая строка ----
  return (
    <AbsoluteFill>
      <Writing f={f} p={p} />
    </AbsoluteFill>
  );
};

