// Сцена 5. Школа ближе к дому (N04). Ранний вечер, ужин всей семьёй.
// A. Кухонный стол спереди: папа слева, Аян посередине, мама справа с
//    телефоном; папа наклоняется посмотреть. Аян ест и тоже за столом —
//    участник семейной сцены, а не подслушивает за дверью.
// B. Экран телефона: «Үйгө жакын мектеп», несколько строк о занятиях —
//    без заявления, приказа и зачисления. Обычная светлая школа.
// C. Аян: взгляд на родителей, потом на значок своей школы на рюкзаке
//    (рюкзак висит на крючке у стены). Он молчит; рассказчик его вывод не
//    объясняет.
// D. Крупно: значок на жёлтом рюкзаке.
import { AbsoluteFill } from "remotion";
import { clamp, easeOut, keys } from "../rig/motion";
import { TE2_TEXT } from "../script";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { C, F } from "../theme";
import { Act, type ActorSpec } from "./room";
import { H, seatOf } from "./common";

export const dinnerPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "dinner");
  const L = T.len;
  const screen = T.word("N04", "Маалыматын") - 4;
  const ayan = T.word("N04", "Азырынча") - 6;
  return { screen, screenEnd: ayan - 2, ayan, lookBadge: ayan + 40, badge: Math.min(L - 40, ayan + 78), len: L };
};
type P = ReturnType<typeof dinnerPlan>;

const FLOOR = 1540;
const TABLE = { top: 1300, x0: 120, x1: 960 };
const DAD = { x: 290, y: FLOOR, h: H.dad };
const AYAN = { x: 545, y: FLOOR, h: H.ayan };
const MOM = { x: 790, y: FLOOR, h: H.mom };
const BAG = { x: 1010, y: 1040 };

export const KitchenBack: React.FC = () => (
  <div style={box({ left: -700, top: -500 })}>
    <div style={box({ left: 0, top: 0, width: 2600, height: FLOOR + 500, backgroundColor: "#EFDCC0" })} />
    {/* окно: ранний вечер */}
    <div style={box({ left: 800, top: 1040, width: 520, height: 470, background: "linear-gradient(180deg, #7D8DB8, #E9B79A)", border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    <div style={box({ left: 1052, top: 1040, width: 14, height: 470, backgroundColor: C.paper })} />
    {/* полка с пиалами и лампа над столом */}
    <div style={box({ left: 1500, top: 1200, width: 300, height: 14, backgroundColor: C.woodDark })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 1520 + i * 90, top: 1150, width: 70, height: 50, borderRadius: "0 0 35px 35px", backgroundColor: ["#FFFFFF", C.blueSoft, "#FFFFFF"][i], border: "3px solid #D5DCE6" })} />
    ))}
    <div style={box({ left: 1236, top: 500, width: 4, height: 360, backgroundColor: "#5A4630" })} />
    <div style={box({ left: 1160, top: 850, width: 160, height: 80, borderRadius: "80px 80px 10px 10px", backgroundColor: C.yellow })} />
    <div style={box({ left: 940, top: 900, width: 600, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.35), rgba(255,214,140,0) 70%)" })} />
    <div style={box({ left: 0, top: FLOOR + 500, width: 2600, height: 1200, backgroundColor: "#C9A983" })} />
  </div>
);

// Рюкзак Аяна на крючке: жёлтый, на клапане — круглый значок школы.
const Backpack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <Svg>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-120} r={8} fill="#8A6A4A" />
      <path d="M -24 -112 Q 0 -150 24 -112" stroke="#2E3D5C" strokeWidth={8} fill="none" />
      <rect x={-80} y={-110} width={160} height={210} rx={44} fill={C.yellow} />
      <rect x={-56} y={10} width={112} height={74} rx={18} fill={C.yellowDeep} />
      <path d="M -80 -60 Q 0 -30 80 -60 L 80 -84 Q 0 -54 -80 -84 Z" fill={C.yellowDeep} />
      {/* значок школы: синий круг, раскрытая книга и звезда */}
      <circle cx={0} cy={-30} r={30} fill={C.navy} stroke="#FFFFFF" strokeWidth={5} />
      <path d="M -16 -26 Q -8 -32 0 -26 Q 8 -32 16 -26 L 16 -12 Q 8 -18 0 -12 Q -8 -18 -16 -12 Z" fill="#FFFFFF" />
      <path d="M 0 -50 l 3 6 l 6 1 l -5 4 l 2 6 l -6 -3 l -6 3 l 2 -6 l -5 -4 l 6 -1 Z" fill={C.yellow} />
    </g>
  </Svg>
);

const TableFront: React.FC = () => (
  <Svg>
    <rect x={TABLE.x0} y={TABLE.top} width={TABLE.x1 - TABLE.x0} height={34} fill="#F4EEE2" />
    <rect x={TABLE.x0} y={TABLE.top + 34} width={TABLE.x1 - TABLE.x0} height={FLOOR + 40 - TABLE.top} fill="#E5D8C2" />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={TABLE.x0 + 20 + i * 92} y={TABLE.top + 34} width={46} height={FLOOR + 40 - TABLE.top} fill="#DCCBB0" opacity={0.6} />
    ))}
    {/* тарелки, хлеб, чайник, пиалы */}
    {[DAD.x, AYAN.x, MOM.x].map((x) => (
      <g key={x}>
        <ellipse cx={x} cy={TABLE.top + 10} rx={70} ry={14} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
        <ellipse cx={x} cy={TABLE.top + 6} rx={40} ry={8} fill="#E7C27A" />
      </g>
    ))}
    <ellipse cx={420} cy={TABLE.top + 6} rx={46} ry={12} fill="#D8A15F" />
    <circle cx={665} cy={TABLE.top - 20} r={30} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
    <path d="M 690 1270 q 22 -6 26 -24" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" />
  </Svg>
);

const family = (p: P): ActorSpec[] => [
  {
    uid: "dn-dad",
    look: "dadHome",
    place: () => DAD,
    face: () => 0.55,
    pose: (t) => ({ sit: 1, seat: seatOf(H.dad), lean: keys(t, [[10, 2], [40, 12]]), expr: "thinking", lookY: 0.5, nod: 5, armL: { target: { x: 250, y: TABLE.top - 6 }, shape: "relax", elbow: "down" }, armR: { target: { x: 360, y: TABLE.top - 6 }, shape: "relax", elbow: "down" } }),
    seed: 51,
  },
  {
    uid: "dn-ayan",
    look: "ayanHome",
    place: () => AYAN,
    // ест → смотрит на родителей → на значок рюкзака справа
    face: (t) => keys(t, [[p.ayan - 50, 0], [p.ayan - 30, 0.35], [p.lookBadge - 8, 0.35], [p.lookBadge + 6, 0.9]]),
    pose: (t) => {
      const eating = t < p.ayan - 40;
      const sp = eating ? Math.max(0, Math.sin(t / 9)) : 0;
      return {
        sit: 1,
        seat: seatOf(H.ayan, true) + 56,
        lean: 6,
        expr: t < p.ayan - 30 ? "calm" : t < p.lookBadge ? { browIn: 4, browOut: 1, lid: 0.08, smile: 0 } : { browIn: 5, browOut: -1, lid: 0.2, smile: -0.08 },
        lookY: t < p.ayan - 30 ? 0.6 : t < p.lookBadge ? 0.1 : 0.15,
        nod: t < p.ayan - 30 ? 6 : 0,
        armR: { target: { x: AYAN.x + 40, y: TABLE.top - 8 - sp * 70 }, shape: "fist", elbow: "down", item: "spoon" },
        armL: { target: { x: AYAN.x - 60, y: TABLE.top - 6 }, shape: "relax", elbow: "down" },
      };
    },
    seed: 11,
  },
  {
    uid: "dn-mom",
    look: "momHome",
    place: () => MOM,
    face: () => -0.35,
    pose: () => ({ sit: 1, seat: seatOf(H.mom), lean: 6, expr: "calm", lookY: 0.55, nod: 6, armL: { target: { x: 735, y: 1215 }, shape: "phone", elbow: "down", item: "phone", glow: 1, itemTilt: 10 }, armR: { target: { x: 760, y: 1225 }, shape: "point", elbow: "down" } }),
    seed: 12,
  },
];

const NearSchoolScreen: React.FC<{ t: number }> = ({ t }) => {
  const N = TE2_TEXT.nearSchool;
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9D3B4" }}>
      <div style={box({ left: 250, top: 160, width: 580, height: 1190, backgroundColor: C.coral, borderRadius: 64 })} />
      <div style={box({ left: 262, top: 172, width: 556, height: 1166, backgroundColor: "#1E2235", borderRadius: 54 })} />
      <div style={box({ left: 274, top: 230, width: 532, height: 1060, backgroundColor: "#FBF9F5", borderRadius: 26, overflow: "hidden" })}>
        {/* светлая иллюстрация школы: обычное здание, деревья */}
        <div style={box({ left: 0, top: 0, width: 532, height: 400, background: "linear-gradient(180deg, #CFE4F4, #EAF2F8)" })} />
        <div style={box({ left: 120, top: 150, width: 300, height: 220, backgroundColor: "#F3DCC4", border: "4px solid #C9A983" })} />
        <div style={box({ left: 104, top: 120, width: 332, height: 40, backgroundColor: C.coral })} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: 150 + i * 90, top: 200, width: 56, height: 56, backgroundColor: "#BFE3F7" })} />
        ))}
        <div style={box({ left: 30, top: 230, width: 80, height: 140, borderRadius: "40px 40px 6px 6px", backgroundColor: "#7FB36B" })} />
        <div style={box({ left: 430, top: 250, width: 70, height: 120, borderRadius: "35px 35px 6px 6px", backgroundColor: "#7FB36B" })} />
        <div style={box({ left: 30, top: 430, fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.ink })}>{N.title}</div>
        {N.lines.map((l, i) => (
          <div key={l} style={box({ left: 30, top: 520 + i * 92, width: 472, height: 74, borderRadius: 14, backgroundColor: "#EEF2F7", opacity: easeOut(clamp((t - 6 - i * 6) / 8)) })}>
            <div style={box({ left: 22, top: 18, fontFamily: F.text, fontWeight: 800, fontSize: 30, color: C.ink, whiteSpace: "nowrap" })}>{l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const DinnerScene: React.FC = () => {
  const { f } = useScene("dinner");
  const p = usePlan(dinnerPlan);
  if (f >= p.screen && f < p.screenEnd) return <NearSchoolScreen t={f - p.screen} />;
  if (f >= p.badge) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#EFDCC0" }}>
        <Shot f={f} cam={{ x: BAG.x, y: BAG.y - 30, zoom: keys(f, [[p.badge, 4.2], [p.len, 4.4]]) }} bg="#EFDCC0">
          <KitchenBack />
          <Backpack x={BAG.x} y={BAG.y} />
        </Shot>
      </AbsoluteFill>
    );
  }
  const fam = family(p);
  const cam = f >= p.ayan ? { x: 600, y: 1100, zoom: 2.5 } : { x: 560, y: 1120, zoom: keys(f, [[0, 1.2], [p.screen, 1.28]]) };
  return (
    <Shot f={f} cam={cam} bg="#EFDCC0">
      <KitchenBack />
      <Backpack x={BAG.x} y={BAG.y} />
      {fam.map((a) => (
        <Act key={a.uid} s={a} f={f} layer="body" />
      ))}
      <TableFront />
      {fam.map((a) => (
        <Act key={`${a.uid}-a`} s={a} f={f} layer="arms" />
      ))}
    </Shot>
  );
};
