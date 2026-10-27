// Сцена 4. «Наш помощник» — короткий тёплый монтаж привычных дней.
// A. Вход в офис: коллега машет Бектуру, он отвечает.
// B. Детский стол у окна: он решает задание.
// C. Графическая вставка: крупный бейдж «Бектур / Жардамчы» на жёлтом поле.
// D. Руки: карандаш оставляет штрих только при касании (задание).
// E. Он рисует — штрихи появляются вместе с движением карандаша.
// F. Переговорная: раскладывает чистые листы, коллега благодарит жестом.
// G. Папа за своим столом смотрит на сына, улыбается и показывает на бейдж;
//    сын отвечает небольшой улыбкой и затем смотрит на уголок фотографии в
//    рюкзаке, потом в окно. Фотография не раскрывается.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { C } from "../theme";
import { box, Paper, settle, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { BadgeArt } from "../props/Badge";
import { CloseHand, SKIN } from "../props/CloseHand";
import { LaptopFront } from "../props/Laptop";
import { DadChairBack, DadDeskFront, OFFICE, OfficeWall } from "../sets/Office";
import { KID, KidChairBack, KidDeskFront, PackOnFloor, WindowWall } from "../sets/Window";
import { H, seatOf } from "./common";

// Синий круг перехода раскрывается в доску с синей рамкой на стене офиса
// (первый план сцены: камера x 480, y 1060, zoom 1,15; центр доски в мире —
// 290, 725).
export const OFFICE_WINDOW = { x: 540 + (290 - 480) * 1.15, y: 960 + (725 - 1060) * 1.15 } as const;
const DESK_CAM = { x: 600, y: 1130, zoom: 1.7 } as const;

export const helperPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "helper");
  const b = Math.max(96, T.word("N04", "Терезенин") - 4);
  const c = Math.max(b + 50, T.word("N04", "Тамашалап") - 4);
  const d = Math.max(c + 40, T.from("N05") - 4);
  const e = Math.max(d + 40, T.word("N05", "сүрөт") - 2);
  const fF = Math.max(e + 34, T.wordEnd("N05", "тартат") - 4);
  const g = Math.max(fF + 50, T.word("N05", "жагат") - 4);
  return { b, c, d, e, f: fF, g, sheets: [fF + 16, fF + 28, fF + 40], len: T.len };
};
type P = ReturnType<typeof helperPlan>;

// ---------- A. Вход ----------
const boyIn = (tt: number): Place => ({ x: lerp(-80, 420, cruise(clamp((tt - 6) / 56), 0.3)), y: 1500, h: 600 });
const dadIn = (tt: number): Place => ({ x: lerp(-320, 200, cruise(clamp((tt - 2) / 64), 0.3)), y: 1470, h: 790 });
const COL_W: Place = { x: 830, y: 1490, h: 780 };
const wave = (tt: number, from: number) => {
  const u = clamp((tt - from) / 40);
  return u < 1 ? Math.sin(u * Math.PI * 4) : 0;
};
const Entrance: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} cam={{ x: 480, y: 1060, zoom: 1.15 }} bg={C.wall}>
    <OfficeWall />
    <div style={box({ left: -200, top: 640, width: 260, height: 800, backgroundColor: "#6B4A3A" })} />
    <Actor uid="h4-dad" look="dadIT" f={f} place={dadIn} face={(tt) => (tt < 66 ? 0.8 : 0.4)} pose={() => ({ expr: "smile" })} seed={2} />
    <Actor
      uid="h4-colw"
      look="colleagueW"
      f={f}
      place={() => COL_W}
      face={() => -0.55}
      pose={(tt) => {
        const w = wave(tt, 24);
        const up = clamp((tt - 18) / 8) * (1 - clamp((tt - 66) / 10));
        return { expr: "smile", armR: { target: { x: 900, y: lerp(1210, 900, up) + w * 10 }, shape: up > 0.5 ? "wave" : "relax", elbow: "out", wrist: w * 14 } };
      }}
      seed={8}
    />
    <Actor
      uid="h4-boy"
      look="bektur"
      f={f}
      place={boyIn}
      face={(tt) => (tt < 50 ? 0.8 : 0.5)}
      pose={(tt) => {
        const w = wave(tt, 44);
        const b = boyIn(tt);
        const up = clamp((tt - 40) / 8) * (1 - clamp((tt - 86) / 10));
        return {
          expr: tt > 34 ? "smile" : "calm",
          badge: 1,
          armR: up > 0 ? { target: { x: b.x + 0.22 * b.h, y: lerp(b.y - 0.42 * b.h, b.y - 0.86 * b.h, up) + w * 8 }, shape: up > 0.5 ? "wave" : "relax", elbow: "out", wrist: w * 14 } : undefined,
        };
      }}
      role="son"
      seed={4}
      blinkShift={37}
    />
  </Shot>
);

// ---------- B / G2. Стол у окна ----------
const BOY_SEAT: Place = { x: KID.boy.x, y: KID.boy.y, h: H.boy };
const DeskBoy: React.FC<{ f: number; mode: "work" | "look"; from: number }> = ({ f, mode, from }) => {
  const pose = (tt: number) => {
    const q = tt - from;
    const write = mode === "work" && Math.sin(q * 0.9) > -0.2;
    return {
      sit: 1,
      seat: seatOf(H.boy, true),
      badge: 1,
      expr: mode === "look" ? (q < 20 ? ("calm" as const) : q < 56 ? ("smile" as const) : ("calm" as const)) : ("calm" as const),
      // смотрит на папу → улыбается → на уголок фото в рюкзаке → в окно
      lookY: mode === "work" ? 0.85 : keys(q, [[0, 0.1], [56, 0.1], [64, 0.8], [96, 0.8], [104, -0.3]]),
      lookX: mode === "look" ? keys(q, [[0, -0.6], [56, -0.6], [64, -0.5], [96, -0.5], [104, 0.4]]) : 0,
      nod: mode === "work" ? 8 : keys(q, [[56, 0], [64, 6], [96, 6], [104, 0]]),
      armR: { target: { x: 660 + (write ? Math.sin(q * 0.5) * 12 : 0), y: KID.deskTop - 8 }, shape: "pinch" as const, item: "pencil" as const, itemColor: C.orange, elbow: "down" as const, behind: false },
      armL: { target: { x: 550, y: KID.deskTop - 4 }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  const face = (tt: number) => (mode === "look" ? keys(tt - from, [[0, -0.45], [56, -0.45], [66, -0.35], [96, -0.35], [106, 0.45]]) : 0);
  return (
    <Shot f={f} cam={DESK_CAM} bg={C.wall}>
      <WindowWall />
      <KidChairBack />
      <Actor uid="h4-boydesk" look="bektur" f={f} place={() => BOY_SEAT} face={face} pose={pose} role="son" seed={4} blinkShift={37} />
      <KidDeskFront />
      <div style={box({ left: 570, top: KID.deskTop - 8, width: 170, height: 12, backgroundColor: "#FFFFFF", border: "2px solid #CFC8BA" })} />
      <PackOnFloor photoPeek={1} />
    </Shot>
  );
};

// ---------- C. Бейдж ----------
const BadgeInsert: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.c;
  const k = settle(t - 3, 14);
  const prep = t < 3 ? t * 6 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.yellow }}>
      <div style={box({ left: -200, top: 1180, width: 1500, height: 160, backgroundColor: C.blue, transform: `translateX(${(1 - easeOut(clamp(t / 14))) * -1500}px) rotate(-8deg)` })} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(540 ${lerp(1500, 880, k) + prep}) rotate(${lerp(-14, -3, k)})`}>
          <BadgeArt w={780} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- D / E. Руки: задание и рисунок ----------
const Pencil: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <rect x={-9} y={-250} width={18} height={220} fill={C.orange} />
    <rect x={-9} y={-270} width={18} height={22} fill={C.pink} />
    <path d="M -9 -30 L 0 0 L 9 -30 Z" fill="#E8C9A0" />
    <path d="M -3 -10 L 0 0 L 3 -10 Z" fill={C.ink} />
  </g>
);

type Stroke = readonly (readonly [number, number])[];
// «12 + 7 = 19» — простые штрихи цифр
const HOMEWORK: readonly Stroke[] = [
  [[250, 900], [262, 885], [262, 960]],
  [[290, 895], [315, 882], [328, 900], [292, 960], [332, 960]],
  [[380, 925], [420, 925]],
  [[400, 905], [400, 945]],
  [[455, 890], [495, 890], [470, 960]],
  [[530, 915], [570, 915]],
  [[530, 935], [570, 935]],
  [[605, 900], [617, 885], [617, 960]],
  [[690, 900], [660, 905], [662, 925], [690, 922], [690, 885], [690, 960]],
];
// солнце и холмы
const SUN: readonly Stroke[] = [
  [[540, 900], [585, 885], [610, 930], [585, 975], [540, 985], [500, 960], [492, 915], [540, 900]],
  [[540, 850], [540, 815]],
  [[620, 880], [650, 855]],
  [[640, 945], [680, 950]],
  [[455, 880], [425, 855]],
  [[300, 1150], [420, 1110], [560, 1140], [700, 1105], [820, 1140]],
];
// Прогресс u по штрихам: видимые части, кончик карандаша и касание бумаги.
const strokesUpTo = (strokes: readonly Stroke[], u: number) => {
  const lens = strokes.map((s) => s.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - s[i][0], q[1] - s[i][1]), 0));
  const HOP = 40; // перенос между штрихами — карандаш приподнят
  const total = lens.reduce((a, b) => a + b, 0) + (strokes.length - 1) * HOP;
  let d = u * total;
  const paths: string[] = [];
  let tip: [number, number] = [strokes[0][0][0], strokes[0][0][1]];
  let touching = false;
  for (let i = 0; i < strokes.length && d > 0; i++) {
    const s = strokes[i];
    let path = `M ${s[0][0]} ${s[0][1]}`;
    let rem = Math.min(d, lens[i]);
    tip = [s[0][0], s[0][1]];
    for (let j = 1; j < s.length && rem > 0; j++) {
      const L = Math.hypot(s[j][0] - s[j - 1][0], s[j][1] - s[j - 1][1]);
      const k = Math.min(1, rem / L);
      tip = [s[j - 1][0] + (s[j][0] - s[j - 1][0]) * k, s[j - 1][1] + (s[j][1] - s[j - 1][1]) * k];
      path += ` L ${tip[0]} ${tip[1]}`;
      rem -= L;
    }
    paths.push(path);
    touching = d < lens[i];
    d -= lens[i];
    if (d > 0 && i + 1 < strokes.length) {
      const k = Math.min(1, d / HOP);
      const n = strokes[i + 1][0];
      tip = [tip[0] + (n[0] - tip[0]) * k, tip[1] + (n[1] - tip[1]) * k];
      touching = false;
      d -= HOP;
    }
  }
  return { paths, tip, touching };
};

const HandsClose: React.FC<{ f: number; from: number; to: number; strokes: readonly Stroke[]; ink: string; paper: string }> = ({ f, from, to, strokes, ink, paper }) => {
  const u = clamp((f - from - 6) / Math.max(10, to - from - 12));
  const { paths, tip, touching } = strokesUpTo(strokes, u);
  const lift = touching ? 0 : 14;
  return (
    <AbsoluteFill style={{ backgroundColor: paper }}>
      <Paper color={paper} dots="rgba(36,57,245,0.16)" step={60} x={0} y={0} w={1080} h={1920} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke={ink} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <CloseHand x={110} y={1320} angle={-100} size={190} {...SKIN.boy} shape="rest" mirror armLen={4} />
        <CloseHand x={tip[0] + 76} y={tip[1] - lift - 150} angle={27} size={170} {...SKIN.boy} shape="pinch" armLen={5} />
        <Pencil x={tip[0]} y={tip[1] - lift} a={28} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- F. Переговорная ----------
const MeetingRoom: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const sheet = (i: number) => {
    const k = easeInOut(clamp((f - (p.sheets[i] - 10)) / 10));
    return { x: lerp(860, 300 + i * 240, k), y: lerp(560, 1080, k), r: lerp(-20, -4 + i * 3, k), k };
  };
  const cur = p.sheets.findIndex((s) => f < s + 2);
  const holding = cur >= 0 ? sheet(cur) : null;
  const thanks = f - (p.sheets[2] + 6);
  return (
    <AbsoluteFill style={{ backgroundColor: C.blueSoft }}>
      <Paper color={C.blueSoft} dots="rgba(36,57,245,0.18)" x={0} y={0} w={1080} h={1920} />
      {/* стол переговорной — вид сверху */}
      <div style={box({ left: 140, top: 820, width: 800, height: 520, backgroundColor: "#FFFDF6", borderRadius: 30, border: `10px solid ${C.ink}`, boxSizing: "border-box" })} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {[0, 1, 2].map((i) => {
          if (f < p.sheets[i] - 10) return null;
          const s = sheet(i);
          return <rect key={i} x={s.x - 85} y={s.y - 115} width={170} height={230} fill="#FFFFFF" stroke="#CFC8BA" strokeWidth={3} transform={`rotate(${s.r} ${s.x} ${s.y})`} />;
        })}
        {/* рука Бектура держит лист за верхний край, пока он не лёг */}
        {holding ? <CloseHand x={holding.x + 30} y={holding.y - 235} angle={12} size={150} {...SKIN.boy} shape="pinch" armLen={6} /> : null}
        {/* коллега благодарит жестом */}
        {thanks > 0 ? <CloseHand x={990} y={1640} angle={180 + keys(thanks, [[0, 24], [10, 0]], anticipate)} size={190} skin={SKIN.friend.skin} shade={SKIN.friend.shade} sleeve="#5E7A6B" cuff="#4C6558" shape="open" armLen={4} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- G1. Папа смотрит на сына ----------
const DadLooks: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const dad = { x: OFFICE.dadSeat.x, y: OFFICE.floorY, h: H.dad };
  const pose = (tt: number) => {
    const q = tt - from;
    const show = q > 12 && q < 46;
    return {
      sit: 1,
      seat: seatOf(H.dad),
      expr: q < 10 ? ("calm" as const) : ("smile" as const),
      lookX: 0.4,
      armL: { target: { x: 340, y: 1150 }, shape: "relax" as const, elbow: "down" as const },
      // показывает на место бейджа у себя на груди («как у тебя»)
      armR: { target: show ? { x: 470, y: 1010 } : { x: 470, y: 1150 }, shape: show ? ("point" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    };
  };
  return (
    <Shot f={f} cam={{ x: 470, y: 1060, zoom: 1.6 }} bg={C.wall}>
      <OfficeWall />
      <DadChairBack />
      <Actor uid="h4-dadlook" look="dadIT" f={f} place={() => dad} face={() => 0.65} pose={pose} role="father" seed={2} />
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} w={OFFICE.laptop.w} open={1} />
      <DadDeskFront />
    </Shot>
  );
};

export const HelperScene: React.FC = () => {
  const { f } = useScene("helper");
  const p = usePlan(helperPlan);
  const g2 = p.g + 52;
  if (f < p.b) return <Entrance f={f} />;
  if (f < p.c) return <DeskBoy f={f} mode="work" from={p.b} />;
  if (f < p.d) return <BadgeInsert f={f} p={p} />;
  if (f < p.e) return <HandsClose f={f} from={p.d} to={p.e} strokes={HOMEWORK} ink="#1F2A5C" paper="#FFFDF6" />;
  if (f < p.f) return <HandsClose f={f} from={p.e} to={p.f} strokes={SUN} ink={C.orange} paper={C.paper} />;
  if (f < p.g) return <MeetingRoom f={f} p={p} />;
  if (f < g2) return <DadLooks f={f} from={p.g} />;
  return <DeskBoy f={f} mode="look" from={g2} />;
};
