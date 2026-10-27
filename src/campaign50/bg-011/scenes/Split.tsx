// Сцена 2 (split-screen): кадр делится на три окна, они въезжают по
// очереди. Сверху — папа роется в рабочем портфеле на комоде; слева
// внизу — мама поднимает папки на столе; справа внизу — сын, уже одетый,
// с рюкзаком, ждёт у двери и смотрит на родителей.
// Сын (из детской перспективы): «Ата, ачкычты таптыңызбы?» — папа, не
// поднимая головы: «Азыр, балам!» — мама выпрямляется: «Бүгүн ким
// жеткирет эле?» Папа показывает вниз на маму, мама — вверх на папу, сын
// переводит взгляд — стоп-кадр «Бүгүн ким?».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useLine, useScene } from "../context";
import { Actor, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { BG11_TEXT } from "../script";
import { Briefcase, C, Folder, K, KitchenBack, TableFront } from "../sets/Kitchen";
import { FreezeLook, freezeFrame, View } from "../shots";
import { onDresser, onTable, stand } from "./common";
import { FOLDERS, keySwing } from "./Hook";

// Окна split-screen (px кадра) и линии между ними.
const GAP = 12;
export const PANELS = {
  top: { x: 0, y: 0, w: 1080, h: 900 },
  left: { x: 0, y: 900 + GAP, w: 534, h: 1920 - 900 - GAP },
  right: { x: 534 + GAP, y: 900 + GAP, w: 1080 - 534 - GAP, h: 1920 - 900 - GAP },
} as const;
export const SPLIT_IN = { top: 0, left: 8, right: 16 };

const BRIEF = { x: 905, y: K.dresser.top + 2 };
const TABLE_FOLDERS = [
  [1700, "#4C7BD9"],
  [1790, "#E5677A"],
  [1870, "#3E9C6B"],
] as const;

export const SplitScene: React.FC = () => {
  const fs = useCurrentFrame();
  const { frames } = useScene();
  const s01 = useLine("s01");
  const f01 = useLine("f01");
  const m01 = useLine("m01");
  const point = m01.to + 4; // папа и мама показывают друг на друга
  const freezeAt = Math.min(frames - 24, point + 20);
  const f = freezeFrame(fs, freezeAt);

  const dad = stand("dad", 760);
  const mom = stand("mom", 1690);
  const son = stand("son", 1235);

  // папа: открывает портфель, достаёт бумаги, проверяет карман рубашки
  const papers = keys(f, [[40, 0], [70, 1]]);
  const dadPose = (t: number): PoseIn => ({
    expr: t < point ? (t < f01.from ? "thinking" : "worried") : "surprised",
    lean: keys(t, [[0, 16], [point - 6, 16], [point + 6, 4]]),
    lookY: keys(t, [[0, 0.7], [point - 6, 0.7], [point + 4, 0.9]]),
    nod: keys(t, [[0, 6], [point - 6, 6], [point + 4, 10]]),
    armR: {
      target: keysV(
        t,
        [
          [0, onDresser(BRIEF.x - 70, -40)],
          [20, onDresser(BRIEF.x - 60, -96)],
          [36, onDresser(BRIEF.x - 30, -60)],
          [56, onDresser(BRIEF.x - 10, -92)],
          [80, onDresser(BRIEF.x - 40, -56)],
          [104, onDresser(BRIEF.x - 20, -90)],
          [point - 8, onDresser(BRIEF.x - 40, -60)],
          [point + 8, onDresser(BRIEF.x - 90, -30)],
        ],
        anticipate,
      ),
      shape: "pinch",
      elbow: "down",
      behind: false,
    },
    // левая рука: проверяет карман рубашки, затем показывает вниз — на маму
    armL: {
      target: keysV(t, [[0, onDresser(BRIEF.x - 150, -24)], [90, onDresser(BRIEF.x - 150, -24)], [104, { x: dad.x + 6, y: dad.y - 0.66 * dad.h }], [130, { x: dad.x + 6, y: dad.y - 0.66 * dad.h }], [146, onDresser(BRIEF.x - 150, -24)], [point, onDresser(BRIEF.x - 150, -24)], [point + 10, { x: dad.x - 0.3 * dad.h, y: dad.y - 0.4 * dad.h }]], anticipate),
      shape: t >= point ? "point" : t > 100 && t < 136 ? "open" : "relax",
      elbow: t >= point ? "out" : "down",
      behind: false,
    },
  });
  const dadFace = (t: number) => keys(t, [[0, 0.55], [point - 6, 0.55], [point + 4, 0.1]]);

  // мама: поднимает папки на столе по очереди, затем выпрямляется и
  // спрашивает; показывает вверх на папу
  const lift = (i: number) =>
    keys(f, [
      [[10, 0], [22, 60], [44, 60], [56, 0]],
      [[50, 0], [62, 56], [86, 56], [98, 0]],
      [[96, 0], [108, 62], [130, 62], [142, 0]],
    ][i] as unknown as readonly (readonly [number, number])[]);
  const momPose = (t: number): PoseIn => ({
    expr: t < m01.from - 10 ? "thinking" : t < point ? "worried" : "surprised",
    lean: keys(t, [[0, 14], [m01.from - 14, 14], [m01.from, 2]]),
    lookY: keys(t, [[0, 0.75], [m01.from - 14, 0.75], [m01.from, -0.1], [point + 2, -0.55]]),
    armL: {
      target: keysV(t, [[0, onTable(1650, -8)], [10, onTable(1655, -10)], [22, onTable(1652, -70)], [44, onTable(1652, -70)], [56, onTable(1660, -10)], [m01.from - 14, onTable(1660, -10)], [m01.from, { x: mom.x - 0.18 * mom.h, y: mom.y - 0.5 * mom.h }]]),
      shape: "pinch",
      elbow: "down",
      behind: false,
    },
    armR: {
      target: keysV(
        t,
        [
          [0, onTable(1760, -8)],
          [50, onTable(1745, -10)],
          [62, onTable(1745, -66)],
          [86, onTable(1745, -66)],
          [98, onTable(1800, -10)],
          [108, onTable(1825, -72)],
          [130, onTable(1825, -72)],
          [142, onTable(1790, -10)],
          [m01.from - 14, onTable(1790, -10)],
          [m01.from + 4, { x: mom.x + 0.2 * mom.h, y: mom.y - 0.52 * mom.h }],
          [point, { x: mom.x + 0.2 * mom.h, y: mom.y - 0.52 * mom.h }],
          [point + 8, { x: mom.x + 0.1 * mom.h, y: mom.y - 1.08 * mom.h }],
        ],
        anticipate,
      ),
      shape: t < point ? "pinch" : "point",
      elbow: t < point ? "down" : "out",
      behind: false,
    },
  });
  const momFace = (t: number) => keys(t, [[0, -0.2], [m01.from - 14, -0.2], [m01.from, -0.45]]);

  // сын: ждёт у двери, держит лямки, поднимается на носки; спрашивает
  // папу; на «Бүгүн ким?» смотрит то на папу, то на маму
  const sonPose = (t: number): PoseIn => ({
    expr: t < s01.from - 6 ? "calm" : t < point ? "softSmile" : "surprised",
    strapTug: keys(t, [[0, 0.6], [s01.from - 10, 0.6], [s01.from, 0.2]]),
    armL: { target: { x: son.x - 0.13 * son.h, y: son.y - 0.6 * son.h }, shape: "fist", elbow: "in" },
    armR: {
      target: keysV(t, [[0, { x: son.x + 0.12 * son.h, y: son.y - 0.6 * son.h }], [s01.from - 6, { x: son.x + 0.12 * son.h, y: son.y - 0.6 * son.h }], [s01.from + 6, { x: son.x - 0.24 * son.h, y: son.y - 0.72 * son.h }], [s01.to + 10, { x: son.x - 0.24 * son.h, y: son.y - 0.72 * son.h }], [s01.to + 24, { x: son.x + 0.12 * son.h, y: son.y - 0.6 * son.h }]]),
      shape: t > s01.from && t < s01.to + 14 ? "open" : "fist",
      elbow: "down",
    },
    lookY: keys(t, [[0, -0.15], [point, -0.15], [point + 8, -0.4]]),
    headTilt: keys(t, [[0, 0], [s01.from - 6, 0], [s01.from + 4, -6], [s01.to + 10, -6], [s01.to + 24, 0], [point, 0], [point + 10, 5]]),
    crouch: Math.max(0, Math.sin(t / 9)) * keys(t, [[0, 0.12], [s01.from - 20, 0.12], [s01.from - 10, 0]]),
  });
  const sonFace = (t: number) => keys(t, [[0, 0], [s01.from - 14, 0], [s01.from - 4, -0.6], [s01.to + 20, -0.6], [m01.from, -0.35], [point + 4, -0.7], [point + 14, -0.15]]);

  const world = (
    <>
      <KitchenBack
        minutes={7 * 60 + 42 + f / 60}
        swing={keySwing(f + 400)}
        dresserTop={
          <>
            {FOLDERS.slice(0, 2).map(([x, c], i) => (
              <Folder key={x} x={x - 40} y={K.dresser.top + 2 - i * 3} color={c} w={130} />
            ))}
            <Briefcase x={BRIEF.x} y={BRIEF.y} open={easeInOut(f / 22)} papers={papers} />
          </>
        }
      />
      <Actor uid="s-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} />
      <Actor uid="s-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} />
      <Actor uid="s-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <TableFront />
      {TABLE_FOLDERS.map(([x, c], i) => (
        <Folder key={x} x={x} y={K.table.top + 4 - i * 3} color={c} lift={lift(i)} rot={-lift(i) * 0.35} w={140} />
      ))}
      <Actor uid="s-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
    </>
  );
  // въезд окон: сверху слева, снизу-слева снизу, снизу-справа справа
  const slide = (at: number) => 1 - easeOut((fs - at) / 14);
  const top = slide(SPLIT_IN.top);
  const left = slide(SPLIT_IN.left);
  const right = slide(SPLIT_IN.right);
  const P = PANELS;
  const drift = (a: number) => clamp(f / Math.max(1, freezeAt)) * a;
  const stamp = easeOut((fs - freezeAt - 6) / 8);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.yellow }}>
      <FreezeLook f={fs} at={freezeAt}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: C.yellow }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-1100 * top}px)` }}>
            <View {...P.top} cam={{ x: 830 + drift(10), y: 1145, zoom: 1.3 + drift(0.06) }}>
              {world}
            </View>
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${1100 * left}px)` }}>
            <View {...P.left} cam={{ x: 1745, y: 1185 - drift(10), zoom: 1.32 + drift(0.05) }}>
              {world}
            </View>
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${600 * right}px)` }}>
            <View {...P.right} cam={{ x: 1215, y: 1330, zoom: 1.55 + drift(0.06) }}>
              {world}
            </View>
          </div>
        </div>
      </FreezeLook>
      {stamp > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 905,
            transform: `translate(-50%, -50%) rotate(-6deg) scale(${1.6 - 0.6 * stamp})`,
            opacity: stamp,
            padding: "18px 44px",
            borderRadius: 24,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontFamily,
            fontSize: 92,
            fontWeight: 900,
            border: `8px solid ${C.yellow}`,
            boxShadow: "0 18px 40px rgba(10,20,50,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          {BG11_TEXT.freeze2.title}
        </div>
      ) : null}
    </div>
  );
};
