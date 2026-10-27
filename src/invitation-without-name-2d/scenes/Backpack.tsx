// Сцена 6. Мама находит лист. Тот же вечер дома.
// A — крупно рюкзак: рука мамы ведёт бегунок молнии, рюкзак открывается;
//     рука входит внутрь и достаёт за угол помятый лист (видно, как он
//     выходит из рюкзака, а не появляется из воздуха).
// B — сверху: лист ложится на стол, рука отходит; видна пустая строка.
// C — общий план стола: мама у стола, папа наклоняется к листу и замечает
//     пустую строку; Эмир перестаёт рисовать, узнаёт лист и притихает.
import { AbsoluteFill } from "remotion";
import { type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { box, Paper, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { INVITE_RATIO, InvitationArt } from "../props/Invitation";
import { CloseHand, SKIN } from "../props/CloseHand";
import { HOME, OnTable } from "../sets/Home";
import { DAD_CHAIR, HomeShot, SHEET_AT, SON_AT } from "./HomeShot";
import { H } from "./common";

export const backpackPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "backpack");
  const n05End = T.to("N05");
  const top = Math.max(84, T.word("N05", "кагазын") - 10);
  const wide = n05End + 10;
  return { zip: [6, 30] as const, reach: [32, 46] as const, pull: [48, 80] as const, top, land: top + 16, leave: top + 26, wide, notice: wide + 8, quiet: wide + 26, len: T.len };
};
type P = ReturnType<typeof backpackPlan>;

// ---------- A: рюкзак крупно ----------
const ZX0 = 300;
const ZX1 = 780;
const zy = (x: number) => 880 + 0.00045 * (x - 540) * (x - 540);
const SHEET_W = 420;

const Bag: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const z = easeInOut(clamp((f - p.zip[0]) / (p.zip[1] - p.zip[0])));
  const xz = lerp(ZX0 + 4, ZX1, z);
  const N = 24;
  const gap = (x: number) => (xz - ZX0 < 10 ? 0 : 44 * Math.sin((Math.PI * (x - ZX0)) / (xz - ZX0)));
  const xs = Array.from({ length: N + 1 }, (_, i) => ZX0 + ((xz - ZX0) * i) / N);
  const upper = xs.map((x) => `${x.toFixed(1)},${(zy(x) - gap(x)).toFixed(1)}`);
  const lower = [...xs].reverse().map((x) => `${x.toFixed(1)},${(zy(x) + gap(x) * 0.45).toFixed(1)}`);
  const lens = [...upper, ...lower].join(" ");
  // область над нижней кромкой проёма — всё, что «внутри», ниже не видно
  const clip = `M -100 -100 L 1180 -100 L 1180 ${zy(ZX1)} ${xs
    .slice()
    .reverse()
    .map((x) => `L ${x.toFixed(1)} ${(zy(x) + gap(x) * 0.45).toFixed(1)}`)
    .join(" ")} L -100 ${zy(ZX0)} Z`;
  // рука: бегунок → в проём → вниз за листом → вверх с листом
  const tab = { x: xz + 10, y: zy(xz) + 4 };
  const pull = easeInOut(clamp((f - p.pull[0]) / (p.pull[1] - p.pull[0])));
  const sheetTop = lerp(zy(540) + 160, zy(540) - SHEET_W * INVITE_RATIO - 40, pull);
  const grip = { x: 470, y: sheetTop + 26 };
  const hand =
    f < p.zip[1] + 2
      ? { x: tab.x + 60, y: tab.y - 210, a: 18 }
      : f < p.pull[0]
        ? { ...keysV(f, [[p.zip[1] + 2, { x: tab.x + 60, y: tab.y - 210 }], [p.reach[0], { x: 600, y: zy(540) - 260 }], [p.reach[1], { x: 520, y: zy(540) - 60 }]], anticipate), a: 8 }
        : { x: grip.x + 30, y: grip.y - 214, a: 8 };
  const holding = f >= p.pull[0];
  return (
    <AbsoluteFill style={{ backgroundColor: C.wallWarm }}>
      <Paper color={C.wallWarm} dots="rgba(23,23,23,0.05)" />
      <div style={box({ left: 0, top: 1560, width: 1080, height: 360, backgroundColor: "#D9B27F" })} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <defs>
          <clipPath id="bp6-in">
            <path d={clip} />
          </clipPath>
        </defs>
        {/* лямки и ручка сверху */}
        <path d="M 440 820 Q 540 700 640 820" stroke="#2522A8" strokeWidth={30} fill="none" strokeLinecap="round" />
        {/* корпус рюкзака */}
        <path d="M 230 900 Q 230 780 540 770 Q 850 780 850 900 L 880 1600 Q 880 1660 820 1660 L 260 1660 Q 200 1660 200 1600 Z" fill={C.blue} />
        <path d="M 300 1180 L 780 1180 L 790 1520 Q 790 1560 750 1560 L 330 1560 Q 290 1560 290 1520 Z" fill="#2B28C6" />
        <path d="M 330 1240 L 750 1240" stroke="#D9D8FB" strokeWidth={8} strokeDasharray="18 12" opacity={0.6} />
        {/* проём */}
        {z > 0.02 ? <polygon points={lens} fill="#14134F" /> : null}
        {/* лист (внутри рюкзака не виден) */}
        <g clipPath="url(#bp6-in)">
          {f >= p.pull[0] ? (
            <g transform={`translate(540 ${sheetTop + (SHEET_W * INVITE_RATIO) / 2}) rotate(${lerp(4, -3, pull)})`}>
              <InvitationArt w={SHEET_W} />
            </g>
          ) : null}
          <CloseHand x={hand.x} y={hand.y} angle={hand.a} size={220} {...SKIN.mama} shape={f < p.zip[1] + 2 || holding ? "pinch" : "open"} armLen={5} />
        </g>
        {/* молния и бегунок */}
        <path d={`M ${ZX0} ${zy(ZX0)} Q 540 ${zy(540) - 30} ${ZX1} ${zy(ZX1)}`} stroke="#1E1C8F" strokeWidth={10} fill="none" opacity={1 - z * 0.7} />
        <g transform={`translate(${tab.x} ${tab.y}) rotate(10)`}>
          <rect x={-10} y={-8} width={22} height={16} rx={4} fill="#C9CDD3" />
          <rect x={-6} y={6} width={14} height={34} rx={6} fill="#AEB4BC" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- B: лист ложится на стол ----------
const Table: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.top;
  const land = easeOut(clamp(t / (p.land - p.top)));
  const W = 700;
  const lift = (1 - land) * 60;
  const scale = 1 + (1 - land) * 0.06;
  const hand = keysV(f, [[p.top, { x: 820, y: 400 - lift }], [p.land, { x: 800, y: 470 }], [p.leave, { x: 820, y: 470 }], [p.leave + 14, { x: 1100, y: 140 }]], anticipate);
  const push = easeInOut(clamp((f - p.leave) / 50));
  return (
    <AbsoluteFill style={{ backgroundColor: "#D9B27F", transform: `scale(${1 + push * 0.18})`, transformOrigin: "50% 74%" }}>
      <Paper color="#D9B27F" dots="rgba(23,23,23,0.04)" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(${540 + lift * 0.4} ${980 - lift}) rotate(-3) scale(${scale})`}>
          <InvitationArt w={W} name={0} />
        </g>
        {f < p.leave + 16 ? <CloseHand x={hand.x} y={hand.y} angle={30} size={230} {...SKIN.mama} shape={f < p.land + 2 ? "pinch" : "open"} armLen={5} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- C: общий план стола ----------
const MOM: Place = { x: 210, y: HOME.floorY, h: H.mom };
export const DAD_STAND: Place = { x: 960, y: HOME.floorY, h: H.dad };
export const SonDrawing: React.FC = () => (
  <OnTable x={445} y={1270} rot={-4}>
    <rect x={-80} y={-110} width={160} height={220} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={3} />
    <path d="M -50 40 L -10 -40 L 30 40 Z M -60 60 L 60 60" stroke={C.blue} strokeWidth={6} fill="none" />
  </OnTable>
);

const Wide: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const momPose = () => ({
    expr: "calm" as const,
    lookX: 0.3,
    lookY: 0.55,
    armR: { target: { x: 300, y: 1262 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armL: { target: { x: 170, y: 1170 }, shape: "relax" as const, elbow: "down" as const },
  });
  const dadPose = (tt: number) => ({
    lean: keys(tt, [[p.notice, 0], [p.notice + 16, 14]]),
    expr: tt < p.notice + 10 ? ("calm" as const) : ({ browIn: 6, browOut: 2, lid: 0.1, smile: 0 } as const),
    lookX: -0.5,
    lookY: keys(tt, [[p.notice, 0.3], [p.notice + 12, 0.7]]),
    armR: { target: { x: 1000, y: 1180 }, shape: "relax" as const, elbow: "down" as const },
    armL: { target: keys(tt, [[p.notice + 4, 0], [p.notice + 18, 1]]) > 0.5 ? { x: 850, y: 1250 } : { x: 905, y: 1180 }, shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  const sonPose = (tt: number) => {
    const stop = tt >= p.quiet;
    return {
      sit: 1,
      seat: 186,
      expr: stop ? ({ browIn: 5, browOut: -2, lid: 0.22, smile: -0.12 } as const) : ("calm" as const),
      lookX: stop ? 0.5 : 0,
      lookY: stop ? keys(tt, [[p.quiet, 0.5], [p.quiet + 30, 0.75]]) : 0.7,
      nod: stop ? keys(tt, [[p.quiet + 10, 0], [p.quiet + 30, 6]]) : 2,
      shoulders: stop ? keys(tt, [[p.quiet + 10, 0], [p.quiet + 30, 0.4]]) : 0,
      armR: { target: { x: stop ? 480 : 470 + Math.sin(tt / 4) * 10, y: 1262 }, shape: "pinch" as const, item: "pencil" as const, itemColor: C.yellow, elbow: "down" as const, behind: false },
      armL: { target: { x: 420, y: 1266 }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  return (
    <HomeShot
      f={f}
      cam={{ x: 590, y: 1110, zoom: 1.3 }}
      chairs={[{ x: SON_AT.x }, { x: DAD_CHAIR }]}
      actors={[
        { uid: "b6-mom", look: "mama", place: () => MOM, face: () => -0.35, pose: momPose, seed: 5, blinkShift: 19 },
        { uid: "b6-dad", look: "azamat", place: () => DAD_STAND, face: () => -0.45, pose: dadPose, seed: 2 },
        { uid: "b6-son", look: "emir", place: () => SON_AT, face: (tt) => (tt >= p.quiet ? 0.25 : 0), pose: sonPose, seed: 4, blinkShift: 37 },
      ]}
      onTable={
        <>
          <SonDrawing />
          <OnTable x={SHEET_AT.x} y={SHEET_AT.y} rot={-6}>
            <InvitationArt w={170} detail={false} />
          </OnTable>
        </>
      }
    />
  );
};

export const BackpackScene: React.FC = () => {
  const { f } = useScene("backpack");
  const p = usePlan(backpackPlan);
  if (f >= p.wide) return <Wide f={f} p={p} />;
  if (f >= p.top) return <Table f={f} p={p} />;
  return <Bag f={f} p={p} />;
};
