// Рабочий лист героев №31 (не кадр фильма): все облики фильма спереди,
// в три четверти и сбоку (face 0 / 0,5 / 0,85) тем же ригом и в тех же
// пропорциях, что в сценах, и ключевые позы. Композиция M13CharacterSheet
// (папка Scenes в Studio, 30 кадров) — четыре страницы по кадрам:
//   кадр 0  — директор, помощница, заказчик, сотрудница;
//   кадр 8  — директор дома, мама (офис и дом), сотрудник;
//   кадр 16 — сын (школа и дом), бабушка, сравнение роста;
//   кадр 24 — позы: ключи, телефон у уха, ручка, планшет, рюкзак, рисунок,
//             приветствие бабушки, заказчик сидит, отец и сын рядом.
// npx remotion still src/index.ts M13CharacterSheet out.png --frame=24
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "./fonts";
import { SceneContext, TimelineContext } from "./context";
import { Actor, type Place, type PoseIn } from "./rig/Actor";
import type { LookId } from "./rig/looks";
import { buildM13Timeline, estimateM13Manifest } from "./timing";
import { C, F } from "./theme";
import { H, seatOf } from "./scenes/common";
import { Grain } from "./kit";
import { blinkAt } from "./rig/motion";

const tl = buildM13Timeline(estimateM13Manifest());
// Лист — без моргания: первый seed от base, при котором глаза открыты.
const openSeed = (base: number) => {
  let s = base;
  while (blinkAt(10, s) > 0) s += 17;
  return s;
};
const TURNS = [0, 0.5, 0.85];

type Row = { readonly look: LookId; readonly h: number; readonly label: string };
const PAGES: readonly (readonly Row[])[] = [
  [
    { look: "m13Director", h: H.dad, label: "Директор" },
    { look: "m13Assistant", h: H.assistant, label: "Жардамчы" },
    { look: "m13Client", h: H.client, label: "Кардар" },
    { look: "m13ColleagueW", h: H.colleagueW, label: "Кызматкер" },
  ],
  [
    { look: "m13DirectorHome", h: H.dad, label: "Директор үйдө" },
    { look: "m13Mom", h: H.mom, label: "Апасы (кеңседе)" },
    { look: "m13MomHome", h: H.mom, label: "Апасы (үйдө)" },
    { look: "m13ColleagueM", h: H.colleagueM, label: "Кызматкер" },
  ],
  [
    { look: "m13Son", h: H.son, label: "Уулу (мектепте)" },
    { look: "m13SonHome", h: H.son, label: "Уулу (үйдө)" },
    { look: "m13Grandma", h: H.grandma, label: "Чоң энеси" },
  ],
];

const Label: React.FC<{ x: number; y: number; text: string; w?: number; center?: boolean }> = ({ x, y, text, w = 600, center }) => (
  <div style={{ position: "absolute", left: center ? x - w / 2 : x, top: y, width: w, textAlign: center ? "center" : "left", fontFamily: F.text, fontWeight: 800, fontSize: 32, color: C.navy }}>{text}</div>
);

// Пол: тёплая линия и мягкая полоса тени.
const Floor: React.FC<{ y: number }> = ({ y }) => <div style={{ position: "absolute", left: 40, top: y - 2, width: 1000, height: 4, borderRadius: 2, background: C.paperDeep }} />;

const Turnaround: React.FC<{ rows: readonly Row[]; extra?: React.ReactNode }> = ({ rows, extra }) => {
  const rowH = 465;
  return (
    <>
      {rows.map((r, i) => {
        const top = 20 + i * rowH;
        const floor = top + rowH - 22;
        const h = r.h * 0.52;
        return (
          <div key={r.look}>
            <Label x={40} y={top} text={r.label} />
            <Floor y={floor} />
            {TURNS.map((tv, j) => (
              <Actor key={j} uid={`cs-${r.look}-${j}`} look={r.look} f={10} place={() => ({ x: 220 + j * 320, y: floor, h })} face={() => tv} pose={() => ({ expr: j === 1 ? "softSmile" : "calm" })} seed={openSeed(i * 3 + j + 1)} />
            ))}
          </div>
        );
      })}
      {extra}
    </>
  );
};

// Сравнение роста: отец (800) и сын (600) рядом, бабушка — тот же масштаб.
const Scale: React.FC = () => {
  const top = 20 + 3 * 465;
  const floor = top + 465 - 22;
  const k = 0.52;
  const lines = [800, 600];
  return (
    <div>
      <Label x={40} y={top} text="Бою: 800 / 600" />
      <Floor y={floor} />
      {lines.map((v) => (
        <div key={v} style={{ position: "absolute", left: 120, top: floor - v * k, width: 860, borderTop: `3px dashed ${C.blueSoft}` }} />
      ))}
      <Actor uid="sc-dad" look="m13Director" f={10} place={() => ({ x: 380, y: floor, h: H.dad * k })} face={() => 0.35} pose={() => ({ expr: "softSmile", lookY: 0.5 })} seed={openSeed(4)} />
      <Actor uid="sc-son" look="m13Son" f={10} place={() => ({ x: 560, y: floor, h: H.son * k })} face={() => -0.35} pose={() => ({ expr: "smile", lookY: -0.4 })} seed={openSeed(7)} />
      <Actor uid="sc-gm" look="m13Grandma" f={10} place={() => ({ x: 800, y: floor, h: H.grandma * k })} face={() => -0.2} pose={() => ({ expr: "softSmile" })} seed={openSeed(8)} />
    </div>
  );
};

// Ключевые позы: цели кистей — в мировых px через долю роста от точки героя.
type PoseCell = {
  readonly look: LookId;
  readonly h: number;
  readonly label: string;
  readonly face: number;
  readonly pose: (p: Place) => PoseIn;
  readonly chair?: boolean;
};
const at = (p: Place, dx: number, dy: number) => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
const POSES: readonly PoseCell[] = [
  {
    look: "m13Director",
    h: H.dad,
    label: "ачкычтар",
    face: 0.3,
    pose: (p) => ({ expr: "calm", lookY: 0.6, lookX: 0.2, armR: { target: at(p, 46, -585), shape: "fist", item: "keys", elbow: "hang", behind: false } }),
  },
  {
    look: "m13Director",
    h: H.dad,
    label: "телефон кулакта",
    face: -0.45,
    pose: (p) => ({ expr: "thinking", lookX: -0.3, armR: { target: at(p, 60, -840), shape: "phone", item: "phone", glow: -1, itemTilt: 8, elbow: "front", behind: false } }),
  },
  {
    look: "m13Director",
    h: H.dad,
    label: "калем",
    face: 0.15,
    pose: (p) => ({ expr: "thinking", lookY: 0.6, nod: 4, armR: { target: at(p, 30, -610), shape: "fist", item: "pen", elbow: "hang", behind: false }, armL: { target: at(p, -40, -570), shape: "relax", item: "sheets", elbow: "hang", behind: false } }),
  },
  {
    look: "m13Assistant",
    h: H.assistant,
    label: "планшет",
    face: 0.25,
    pose: (p) => ({ expr: "softSmile", lookY: 0.55, armL: { target: at(p, -10, -585), shape: "fist", item: "tablet", facing: "camera", elbow: "hang", behind: false } }),
  },
  {
    look: "m13Son",
    h: H.son,
    label: "рюкзак",
    face: 0.85,
    pose: () => ({ expr: "smile" }),
  },
  {
    look: "m13SonHome",
    h: H.son,
    label: "сүрөт",
    face: -0.2,
    pose: (p) => ({
      expr: "smile",
      lookY: 0.3,
      armL: { target: at(p, -64, -615), shape: "pinch", item: "drawing", facing: "camera", elbow: "hang", behind: false },
      armR: { target: at(p, 64, -615), shape: "pinch", elbow: "hang", behind: false },
    }),
  },
  {
    look: "m13Grandma",
    h: H.grandma,
    label: "салам",
    face: -0.3,
    pose: (p) => ({ expr: "smile", armR: { target: at(p, 150, -940), shape: "wave", elbow: "out", behind: false } }),
  },
  {
    look: "m13Client",
    h: H.client,
    label: "отурат",
    face: -0.6,
    chair: true,
    pose: (p) => ({ sit: 1, seat: seatOf(p.h) + 24, expr: "calm", armL: { target: at(p, -150, -440), shape: "relax", elbow: "down", behind: false } }),
  },
  {
    look: "m13Director",
    h: H.dad,
    label: "сүйлөйт",
    face: 0.1,
    pose: (p) => ({ expr: "softSmile", armL: { target: at(p, -150, -610), shape: "open", wrist: -10, elbow: "front", behind: false } }),
  },
];

// Стул сбоку (в профиль, сиденье на высоте seatOf(h)).
const Chair: React.FC<{ x: number; y: number; h: number; dir: number }> = ({ x, y, h, dir }) => {
  const s = seatOf(h);
  const w = h * 0.26;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g stroke="#4A5468" strokeWidth={3} strokeLinejoin="round">
        <rect x={x + dir * w * 0.45 - 6} y={y - s - h * 0.32} width={12} height={h * 0.34} rx={5} fill="#7A8699" />
        <rect x={x - w / 2} y={y - s - 8} width={w} height={16} rx={7} fill="#8E9AAE" />
        <rect x={x - w * 0.42} y={y - s + 6} width={9} height={s - 6} fill="#5E6A7E" />
        <rect x={x + w * 0.42 - 9} y={y - s + 6} width={9} height={s - 6} fill="#5E6A7E" />
      </g>
    </svg>
  );
};

const Poses: React.FC = () => {
  const cellW = 360;
  const rowH = 620;
  return (
    <>
      {POSES.map((c, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const floor = 20 + row * rowH + rowH - 30;
        const k = 0.6;
        const place: Place = { x: col * cellW + cellW / 2 + (c.chair ? 30 : 0), y: floor, h: c.h * k };
        const ps = c.pose(place);
        return (
          <div key={i}>
            <Label x={col * cellW + cellW / 2} y={20 + row * rowH} w={cellW} center text={c.label} />
            <div style={{ position: "absolute", left: col * cellW + 20, top: floor - 2, width: cellW - 40, height: 4, borderRadius: 2, background: C.paperDeep }} />
            {c.chair ? <Chair x={place.x - 4} y={floor} h={place.h} dir={1} /> : null}
            <Actor uid={`cp-${i}`} look={c.look} f={10} place={() => place} face={() => c.face} pose={() => ps} seed={openSeed(i + 5)} />
          </div>
        );
      })}
    </>
  );
};

export const CharacterSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const page = Math.min(3, Math.floor(frame / 8));
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: 0, to: 30 }}>
        <AbsoluteFill style={{ backgroundColor: C.paper }}>
          {page < 3 ? <Turnaround rows={PAGES[page]} extra={page === 2 ? <Scale /> : null} /> : <Poses />}
          <Grain />
        </AbsoluteFill>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};
