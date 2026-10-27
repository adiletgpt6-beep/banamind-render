// Сцена 3: вечер того же вторника, та же кухня (камера ниже, на уровне
// глаз сына). Маме звонит коллега — она слушает и кивает, кладёт телефон,
// снова открывает ноутбук и трёт уставшие глаза. Сын подходит со своим
// рисунком часов, кладёт его рядом: «Апа, сиз бүгүн да чарчадыңызбы?»
// Мама поворачивается к нему с мягкой улыбкой: «Бир аз, балам. Жумуш да,
// жол да узун болду.»
import { easeInOut, easeOut, NAVY, NAVY_SOFT, prog } from "../art";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, cruise, keys, keysV, lerp, type Vec } from "../rig/motion";
import { cueFrames, local, mouthAt, type SceneProps } from "../kit";
import { BG13_TEXT } from "../script";
import { ADULT_H, box, Cam, CHILD_H, DeskFront, FLOOR_Y, Kitchen, KITCHEN, LaptopBack, Papers, PhoneFlat, tableTop } from "./sets";

const H = ADULT_H;
const TOP = tableTop(H);
const seat = 0.27 * H;

export const eveningKeys = (tl: SceneProps["tl"]) => {
  const s02 = cueFrames(tl, "s02");
  const m01 = cueFrames(tl, "m01");
  return {
    s02,
    m01,
    ring: 0,
    pick: 16,
    ear: 28,
    hang: Math.min(84, s02.from - 76),
    open: Math.min(104, s02.from - 54),
    rub: Math.min(122, s02.from - 36),
    sonIn: Math.max(40, s02.from - 70),
    place: s02.from - 14,
  };
};

// Сложенный рисунок часов в руке / на столе.
export const DrawingSheet: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number; readonly s?: number }> = ({ x, y, rot = -8, s = 1 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <g transform={`rotate(${rot}) scale(${s})`}>
      <rect x={-70} y={-54} width={140} height={108} rx={6} fill="#FFFFFF" stroke="#D6DCE6" strokeWidth={3} />
      <circle cx={-6} cy={0} r={32} fill="none" stroke="#3B76D6" strokeWidth={5} />
      <path d="M -6 0 L -6 -22 M -6 0 L 12 6" stroke="#E8463A" strokeWidth={5} strokeLinecap="round" />
      <path d="M 34 -30 Q 52 -6 34 26" stroke="#F2B630" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

export const Evening: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, len } = local(tl, "evening", t);
  const k = eveningKeys(tl);
  const mom: Place = { x: 330, y: FLOOR_Y, h: H };
  const son = (t2: number): Place => ({ x: lerp(1380, 870, cruise(prog(t2, k.sonIn, 44), 0.25)), y: FLOOR_Y + 120, h: CHILD_H * 1.12 });
  const phoneTable: Vec = { x: KITCHEN.phoneX, y: TOP };
  const ear: Vec = { x: mom.x + 0.11 * H, y: FLOOR_Y - 0.665 * H };
  const eye: Vec = { x: mom.x + 0.06 * H, y: FLOOR_Y - 0.69 * H };
  const holding = f >= k.pick && f < k.hang + 12;
  const calling = f < k.pick + 4;
  const laptop = easeInOut(prog(f, k.open, 10));
  const answering = f >= k.s02.from;
  // камера: медленно ниже и ближе к столу — как будто сын подходит
  const z = keys(f, [[0, 1.0], [k.sonIn, 1.02], [k.s02.from, 1.1], [len, 1.14]]);
  const cx = keys(f, [[0, 540], [k.s02.from, 600], [len, 610]]);
  const sheetOnTable = f >= k.place + 10;
  const held = (t2: number): Vec => ({ x: son(t2).x - 0.28 * son(t2).h, y: son(t2).y - 0.6 * son(t2).h });
  const sheetPos = keysV(f, [[k.place - 6, held(f)], [k.place + 6, { x: 790, y: TOP - 34 }]], anticipate);
  return (
    <div style={box({ inset: 0, overflow: "hidden" })}>
      <Cam cx={cx} cy={980} z={z}>
        <Kitchen minutes={20 * 60 + 40 + f * 0.04} stretch={0.35 + 0.2 * Math.sin(f / 15)} evening={1} lamp={1} />
        <Actor
          uid="eve-mom"
          look="mom"
          f={f}
          sceneLen={len}
          seed={51}
          mouth={mouthAt(tl, "mother", "evening", f)}
          place={() => mom}
          face={(t2) => keys(t2, [[k.pick - 6, 0.5], [k.pick + 4, 0.65], [k.hang + 6, 0.55], [k.s02.from + 2, 0.55], [k.s02.from + 12, 0.9]])}
          pose={(t2) => {
            const talk = t2 >= k.ear && t2 < k.hang;
            return {
              expr: answering ? (t2 >= k.m01.from ? ("softSmile" as const) : ("calm" as const)) : t2 > k.open ? ("tired" as const) : ("thinking" as const),
              sit: 1,
              seat,
              lean: keys(t2, [[k.pick - 4, 2], [k.pick, 8], [k.ear, 2], [k.open + 10, 4], [k.s02.from, 4], [k.s02.from + 10, 0]]),
              lookY: keys(t2, [[0, 0.3], [k.pick, 0.6], [k.ear, 0.1], [k.hang, 0.5], [k.open + 8, 0.35], [k.s02.from + 4, 0.35], [k.s02.from + 12, 0.25]]),
              nod: talk ? Math.max(0, Math.sin((t2 - k.ear) / 6)) * 6 : t2 >= k.rub && t2 < k.rub + 24 ? 6 : 0,
              headTilt: talk ? 6 : answering ? 5 : 0,
              exhale: keys(t2, [[k.rub, 0.3], [k.rub + 16, 1], [k.s02.from, 0.7]]),
              armR: {
                target: keysV(
                  t2,
                  [
                    [k.pick - 6, { x: KITCHEN.laptopX - 60, y: TOP - 4 }],
                    [k.pick, phoneTable],
                    [k.ear, ear],
                    [k.hang, ear],
                    [k.hang + 12, phoneTable],
                    [k.open - 4, { x: KITCHEN.laptopX - 40, y: TOP - 30 }],
                    [k.open + 8, { x: KITCHEN.laptopX - 50, y: TOP - 4 }],
                  ],
                  anticipate,
                ),
                shape: holding ? ("phone" as const) : ("relax" as const),
                item: holding ? ("phone" as const) : ("none" as const),
                glow: holding ? 1 : 0,
                flat: 0,
                itemTilt: -10,
                elbow: "down" as const,
                behind: false,
              },
              armL: {
                target: keysV(
                  t2,
                  [
                    [k.rub - 8, { x: KITCHEN.laptopX - 130, y: TOP - 4 }],
                    [k.rub, eye],
                    [k.rub + 22, eye],
                    [k.rub + 32, { x: KITCHEN.laptopX - 140, y: TOP - 4 }],
                  ],
                  anticipate,
                ),
                shape: t2 >= k.rub && t2 < k.rub + 26 ? ("pinch" as const) : ("relax" as const),
                wrist: t2 >= k.rub && t2 < k.rub + 26 ? Math.sin((t2 - k.rub) / 2) * 8 : 0,
                elbow: "down" as const,
                behind: false,
              },
            };
          }}
        />
        <DeskFront x={KITCHEN.tableX} w={KITCHEN.tableW} top={TOP} color="#FFFFFF" edge="#E3CDB0" />
        <LaptopBack x={KITCHEN.laptopX} y={TOP} open={laptop} />
        <Papers x={600} y={TOP + 2} n={0} />
        {f < k.pick || f >= k.hang + 12 ? <PhoneFlat x={phoneTable.x} y={phoneTable.y} glow={calling ? 1 : 0} shake={calling ? Math.sin(f * 2.2) * 4 : 0} /> : null}
        {sheetOnTable ? <DrawingSheet x={760} y={TOP - 30} rot={-10} s={keys(f, [[k.place + 10, 0.9], [k.place + 14, 1]])} /> : null}
        <Actor
          uid="eve-son"
          look="son"
          f={f}
          sceneLen={len}
          seed={52}
          walkFrom={k.sonIn - 2}
          mouth={mouthAt(tl, "son", "evening", f)}
          place={son}
          face={(t2) => keys(t2, [[k.sonIn + 40, -0.8], [k.place + 12, -0.55]])}
          pose={(t2) => {
            const p = son(t2);
            const hand = held(t2);
            return {
              expr: t2 < k.s02.from ? ("calm" as const) : t2 < k.m01.to ? ("worried" as const) : ("softSmile" as const),
              packOff: true,
              lookY: keys(t2, [[k.sonIn + 40, 0], [k.place, 0.3], [k.place + 14, -0.55]]),
              headTilt: answering ? -5 : 0,
              armR: {
                target: keysV(t2, [[k.sonIn, hand], [k.place - 6, hand], [k.place + 6, { x: 790, y: TOP - 34 }], [k.place + 16, { x: p.x - 0.22 * p.h, y: p.y - 0.5 * p.h }]], anticipate),
                shape: t2 < k.place + 8 ? ("pinch" as const) : ("relax" as const),
                elbow: "down" as const,
                behind: false,
              },
              armL: { target: null, shape: "relax" as const },
            };
          }}
        />
        {!sheetOnTable && f >= k.sonIn ? <DrawingSheet x={sheetPos.x - 18} y={sheetPos.y - 8} rot={-14} s={0.7} /> : null}
      </Cam>
      {/* звонок коллеги: подпись на экране телефона крупно */}
      {f < k.hang ? (
        <div
          style={box({
            left: 620,
            top: 250,
            padding: "14px 26px",
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 10px 24px rgba(20,40,75,0.2)",
            opacity: easeOut(prog(f, 2, 8)) * (1 - prog(f, k.hang - 8, 8)),
            fontWeight: 1000,
          })}
        >
          <div style={{ fontSize: 40, color: NAVY }}>{BG13_TEXT.evening.call}</div>
          <div style={{ fontSize: 28, color: NAVY_SOFT }}>{BG13_TEXT.evening.calling}</div>
        </div>
      ) : null}
    </div>
  );
};
