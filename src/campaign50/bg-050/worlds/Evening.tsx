// Мир ответа 2: вечер дома (в окне сумерки над Ала-Тоо, огни панельных
// домов, тёплый торшер). Сын рисует за столом. Папа входит с детской
// поделкой — картонным домиком сына, — берёт свободный стул у стены,
// придвигает его к сыну и ставит поделку на стол. Отвечает: «Кечинде уулум
// менен шашпай сүйлөшөт элем.» Сын поднимает глаза: «Ата, мага дагы
// убакыт бөлөсүзбү?» (на «сиз»). Папа улыбается, кивает, садится рядом и
// кладёт руку сыну на плечо — оба смотрят на домик.
// Мир — px; f — кадр от начала сцены evening (может быть < 0 и больше длины).
import { lineIn, useTimeline } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { box, type Cam } from "../shots";
import { WallClock } from "../sets/Apartment";
import { Chair, FloorLamp, FLOOR, H, RoomShell, TABLE_TOP, TableFront, Window } from "../sets/Room";
import { C } from "../palette";

const SON = { x: 380, seat: 370 } as const;
const DAD_SEAT = 300;
const CHAIR0 = 1190; // свободный стул у стены
const CHAIR1 = 760; // стул рядом с сыном
const CRAFT_ON_TABLE: Vec = { x: 590, y: TABLE_TOP - 4 };

export const eveningKeys = (tl: ReturnType<typeof useTimeline>) => {
  const f01 = lineIn(tl, "f01", "evening");
  const s01 = lineIn(tl, "s01", "evening");
  // папа входит, берёт стул, тянет его, ставит поделку — всё до реплики
  const place = Math.max(70, f01.from - 18);
  const pull1 = place - 8;
  const pull0 = pull1 - 40;
  const grab = pull0 - 8;
  const enter0 = grab - 40;
  const sit0 = s01.to + 10; // шаг к стулу
  const sit1 = sit0 + 34; // сел
  const hug = sit1 + 4; // вместе рассматривают домик
  return { f01, s01, enter0, grab, pull0, pull1, place, sit0, sit1, hug };
};

// Путь папы: входит из коридора, берёт стул, придвигает его к сыну,
// после просьбы сына садится рядом.
export const eveningDad = (k: ReturnType<typeof eveningKeys>) => (t: number): Place => ({
  x:
    t < k.grab
      ? lerp(1560, 1300, cruise(clamp((t - k.enter0) / (k.grab - k.enter0)), 0.3))
      : t < k.pull1
        ? lerp(1300, CHAIR1 + 200, cruise(clamp((t - k.pull0) / (k.pull1 - k.pull0)), 0.3))
        : t < k.sit0
          ? CHAIR1 + 200
          : lerp(CHAIR1 + 200, CHAIR1, cruise(clamp((t - k.sit0) / 20), 0.35)),
  y: FLOOR + 30,
  h: H.dad,
});

export const EVENING_PORTRAIT: Cam = { x: 1520, y: 905, s: 2.2 };
export const EVENING_TILE: Cam = { x: 590, y: 1060, s: 1.5 };
export const eveningCam = (f: number, k: ReturnType<typeof eveningKeys>): Cam => {
  const a: Cam = { x: 720, y: 1030, s: 1.2 };
  const b: Cam = { x: 690, y: 1015, s: 1.32 };
  const c: Cam = { x: 590, y: 1050, s: 1.5 };
  if (f < k.place) return a;
  if (f < k.sit0) {
    const t = easeInOut((f - k.place) / 40);
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t) };
  }
  const t = easeInOut((f - k.sit0) / 40);
  return { x: lerp(b.x, c.x, t), y: lerp(b.y, c.y, t), s: lerp(b.s, c.s, t) };
};

// Поделка сына: картонный домик с жёлтой крышей и нарисованными окнами.
export const CardboardHouse: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <svg width={1} height={1} style={box({ left: x, top: y, overflow: "visible" })}>
    <g transform={`rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={92} ry={10} fill="rgba(40,30,20,0.16)" />
      <rect x={-78} y={-118} width={156} height={118} rx={4} fill="#D9B07A" stroke="#B88C57" strokeWidth={3} />
      <path d="M -96 -112 L 0 -196 L 96 -112 Z" fill={C.yellow} stroke={C.yellowDeep} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-56} y={-92} width={38} height={34} rx={3} fill="#9FD0F0" stroke="#2F5D9E" strokeWidth={3} />
      <rect x={18} y={-92} width={38} height={34} rx={3} fill="#9FD0F0" stroke="#2F5D9E" strokeWidth={3} />
      <rect x={-16} y={-50} width={32} height={50} rx={3} fill="#2F5D9E" />
      <circle cx={9} cy={-24} r={3} fill={C.yellow} />
      <path d="M 40 -166 L 40 -206 L 66 -196 L 40 -186" fill="#3E86C8" stroke="#2F5D9E" strokeWidth={2} />
    </g>
  </svg>
);

// Рисунок сына на столе (лист и карандаши).
const Drawing: React.FC = () => (
  <svg width={1} height={1} style={box({ left: 300, top: TABLE_TOP - 26, overflow: "visible" })}>
    <path d="M 0 0 L 190 -6 L 214 26 L -16 30 Z" fill="#FFFFFF" stroke="#E2D9C8" strokeWidth={2} />
    <path d="M 40 14 Q 70 2 100 12 T 160 10" stroke="#3E86C8" strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cx={60} cy={4} r={7} fill={C.yellow} />
    <rect x={226} y={10} width={60} height={8} rx={4} fill="#3E86C8" transform="rotate(-8 226 10)" />
    <rect x={232} y={20} width={56} height={8} rx={4} fill={C.yellow} transform="rotate(6 232 20)" />
  </svg>
);

export const EveningWorld: React.FC<{ readonly f: number }> = ({ f }) => {
  const tl = useTimeline();
  const k = eveningKeys(tl);
  // ---------- папа ----------
  const dad = eveningDad(k);
  const chairX = f < k.pull0 ? CHAIR0 : f < k.pull1 ? lerp(CHAIR0, CHAIR1, cruise(clamp((f - k.pull0) / (k.pull1 - k.pull0)), 0.3)) : CHAIR1;
  const P = dad(f);
  const craftHeld = (t: number): Vec => ({ x: dad(t).x - 0.12 * H.dad, y: dad(t).y - 0.5 * H.dad });
  const craftPlaced = f >= k.place + 8;
  const dadPose = (t: number): PoseIn => {
    const p = dad(t);
    const sitting = keys(t, [[k.sit0 + 14, 0], [k.sit1, 1]]);
    const speaking = t >= k.f01.from - 4 && t <= k.f01.to + 4;
    const cx = (tt: number) => (tt < k.pull0 ? CHAIR0 : tt < k.pull1 ? lerp(CHAIR0, CHAIR1, cruise(clamp((tt - k.pull0) / (k.pull1 - k.pull0)), 0.3)) : CHAIR1);
    const chairBack = (tt: number): Vec => ({ x: cx(tt) + 108, y: FLOOR - 270 - 404 });
    const rest = (side: -1 | 1): Vec => ({ x: p.x + side * 0.15 * H.dad, y: p.y - 0.45 * H.dad });
    // ближняя к зрителю рука (правая на экране) держит поделку и ставит её на стол
    const craftTable: Vec = { x: CRAFT_ON_TABLE.x + 50, y: CRAFT_ON_TABLE.y - 112 };
    const armR: PoseIn["armR"] =
      t < k.place - 10
        ? { target: craftHeld(t), shape: "open", elbow: "down", behind: false }
        : t < k.place + 8
          ? { target: keysV(t, [[k.place - 10, craftHeld(k.place - 10)], [k.place + 6, craftTable]], anticipate), shape: "open", elbow: "down", behind: false }
          : t < k.sit0
            ? { target: keysV(t, [[k.place + 8, craftTable], [k.place + 26, rest(1)]], anticipate), shape: "relax", elbow: "down" }
            : { target: keysV(t, [[k.sit0, rest(1)], [k.sit1, { x: CHAIR1 + 40, y: TABLE_TOP - 24 }]], anticipate), shape: "relax", elbow: "down", behind: false };
    // дальняя рука берёт стул за спинку и придвигает его, потом — на плечо сыну
    const armL: PoseIn["armL"] =
      t < k.grab - 8
        ? { target: null, shape: "relax" }
        : t < k.sit0
          ? { target: keysV(t, [[k.grab - 8, rest(-1)], [k.grab + 2, chairBack(t)]], anticipate), shape: "fist", elbow: "down" }
          : t < k.hug
            ? { target: keysV(t, [[k.sit0, chairBack(k.sit0)], [k.sit1, { x: CHAIR1 - 80, y: TABLE_TOP - 26 }]], anticipate), shape: "relax", elbow: "down", behind: false }
            : { target: keysV(t, [[k.hug, { x: CHAIR1 - 80, y: TABLE_TOP - 26 }], [k.hug + 18, { x: CRAFT_ON_TABLE.x + 70, y: CRAFT_ON_TABLE.y - 120 }]], anticipate), shape: "open", wrist: 10, elbow: "down", behind: false };
    return {
      armL,
      armR,
      sit: sitting,
      seat: DAD_SEAT,
      expr: t < k.place ? "calm" : t < k.s01.from ? "softSmile" : t < k.s01.to + 6 ? "calm" : "smile",
      lookY: t < k.place ? 0.25 : t < k.f01.from - 6 ? 0.45 : speaking ? 0 : t < k.sit1 ? 0.3 : 0.35,
      nod: t < k.s01.to ? (speaking ? 2 * Math.sin((t - k.f01.from) / 9) : 0) : keys(t, [[k.s01.to + 2, 0], [k.s01.to + 8, 7], [k.s01.to + 15, 0], [k.hug + 10, 4]]),
      headTilt: t > k.s01.to ? 5 : 0,
      lean: t < k.pull1 && t > k.grab ? 5 : t > k.sit1 ? 4 : 0,
    };
  };
  const dadFace = (t: number) =>
    keys(t, [
      [k.place - 14, -0.7],
      [k.place + 6, -0.55],
      [k.f01.from - 8, -0.5],
      [k.f01.from + 2, -0.08],
      [k.f01.to, -0.08],
      [k.s01.from - 2, -0.7],
      [k.sit0, -0.7],
      [k.sit1, -0.45],
      [k.hug + 20, -0.5],
    ]);
  // ---------- сын ----------
  const son = (): Place => ({ x: SON.x, y: FLOOR + 6, h: H.child });
  const sonPose = (t: number): PoseIn => {
    const drawing = t < k.pull0 + 10;
    const pencil = (tt: number): Vec => ({ x: 400 + 34 * Math.sin(tt / 8), y: TABLE_TOP - 22 + 6 * Math.sin(tt / 5) });
    return {
      sit: 1,
      seat: SON.seat,
      armR: drawing
        ? { target: pencil(t), shape: "pinch", item: "pencil", itemColor: "#3E86C8", elbow: "down", behind: false }
        : t < k.hug + 6
          ? { target: keysV(t, [[k.pull0 + 10, pencil(k.pull0 + 10)], [k.pull0 + 24, { x: 450, y: TABLE_TOP - 24 }]], anticipate), shape: "relax", elbow: "down", behind: false }
          : { target: keysV(t, [[k.hug + 6, { x: 450, y: TABLE_TOP - 24 }], [k.hug + 22, { x: CRAFT_ON_TABLE.x - 66, y: CRAFT_ON_TABLE.y - 70 }]], anticipate), shape: "open", wrist: -10, elbow: "down", behind: false },
      armL: { target: { x: 300, y: TABLE_TOP - 20 }, shape: "open", elbow: "down", behind: false },
      expr: t < k.pull0 ? "calm" : t < k.s01.from ? "smile" : t < k.s01.to + 4 ? { browIn: 6, browOut: 2, lid: 0.05, smile: 0.25 } : "smile",
      lookY: drawing ? 0.6 : t < k.place + 10 ? -0.1 : t < k.f01.to ? keys(t, [[k.place + 10, 0.35], [k.f01.from + 10, -0.3]]) : t < k.hug ? -0.4 : keys(t, [[k.hug, -0.3], [k.hug + 20, 0.35]]),
      lean: keys(t, [[k.hug + 4, 0], [k.hug + 24, 5]]),
      nod: drawing ? 8 : 0,
      headTilt: t >= k.s01.from - 4 && t < k.hug ? 6 : 0,
      shoulders: keys(t, [[k.hug + 8, 0], [k.hug + 18, 0.4], [k.hug + 34, 0]]),
    };
  };
  const sonFace = (t: number) => keys(t, [[k.pull0, 0.05], [k.pull0 + 14, 0.65], [k.place, 0.55], [k.place + 12, 0.45], [k.f01.from + 8, 0.7], [k.hug + 14, 0.75], [k.hug + 30, 0.45]]);
  const craftPos = craftPlaced ? CRAFT_ON_TABLE : { x: craftHeld(f).x + 16, y: craftHeld(f).y + 70 };
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <RoomShell wall="linear-gradient(180deg, #FBF0E2 0%, #F2E3CF 70%, #EBD8BF 100%)" floor="linear-gradient(180deg, #CDB491 0%, #BEA27C 100%)" stripe="#F6D98A" dim={0.05} />
      <Window x={150} y={380} w={460} h={540} light="dusk" curtain="#F6D98A" />
      <WallClock x={880} y={520} r={64} minutes={19 * 60 + 40} />
      {/* полка с книгами */}
      <div style={box({ left: 760, top: 700, width: 300, height: 16, borderRadius: 6, backgroundColor: "#C9A97D" })} />
      {["#3E86C8", C.yellow, "#5E9A93", "#E7DCCB", "#2F4A7A"].map((c, i) => (
        <div key={c} style={box({ left: 780 + i * 50, top: 600 + (i % 2) * 14, width: 40, height: 100 - (i % 2) * 14, borderRadius: 6, backgroundColor: c })} />
      ))}
      {/* дверной проём справа: папа входит из коридора */}
      <div style={box({ left: 1460, top: 640, width: 320, height: FLOOR - 640, backgroundColor: "#E2CFB2", boxShadow: "inset 0 0 0 18px #FFFFFF" })} />
      <FloorLamp x={1130} />
      <Chair x={SON.x} color="#B9895E" />
      <Chair x={chairX} color="#B9895E" />
      <Actor uid="e-son" look="son" f={f} place={son} face={sonFace} pose={sonPose} role="son" seed={21} />
      <Actor uid="e-dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" seed={22} walkFrom={k.enter0 - 2} />
      <TableFront x={120} w={880} color="#E4CBA6" edge="#CDAE84" />
      <Drawing />
      <CardboardHouse x={craftPos.x} y={craftPos.y} s={craftPlaced ? 1 : 0.92} rot={craftPlaced ? 0 : -4} />
      {/* тёплый свет торшера поверх сцены */}
      <div style={box({ left: P.x - 900, top: 200, width: 1800, height: 1600, background: "radial-gradient(ellipse at 70% 30%, rgba(255,214,150,0.12), transparent 60%)" })} />
    </div>
  );
};
