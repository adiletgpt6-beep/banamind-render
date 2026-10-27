// Сцена 11. Два понятных опыта. Тёплый вечерний свет, стол, две одинаковые
// стопки книг, одна жёлтая машинка.
// a — папа и сын кладут плоский лист на опоры (руки держат края);
// b — палец Эмира толкает машинку с левой опоры на лист: лист заметно
//     прогибается; папа спокойно берёт машинку и возвращает её на книги;
// c — сверху: вдвоём сгибают следующий лист вдоль (бортики поднимаются по
//     линиям сгиба), рядом — разрез жёлоба;
// d — тот же пролёт, те же опоры: сложенный лист держит, машинка проезжает
//     на другую сторону;
// e — Эмир радуется, папа отвечает улыбкой.
// N06 распределён по действиям: «Бирөө ийилип калды» — на прогибе,
// «Экинчиси…» — на сгибании и проезде.
import { AbsoluteFill } from "remotion";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { box, Paper, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { BridgeSide, ChannelSection, deckY, FoldSheetTop, foldEdges, type BridgeGeo } from "../props/Bridge";
import { CloseHand, SKIN } from "../props/CloseHand";
import { HomeShot, SON_AT } from "./HomeShot";
import { DAD_SEATED, dadSeated, sonSeated } from "./HomeCast";

export const testPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "test");
  const one = T.word("N06", "Бирөө");
  const push: [number, number] = [one - 26, one + 22];
  const catchAt = push[1] + 4;
  const fold: [number, number] = [catchAt + 30, catchAt + 30 + 50];
  const second: [number, number] = [fold[1] + 4, fold[1] + 4 + 80];
  const cheer = second[1] + 6;
  return { place: [6, 34] as const, push, catchAt, back: catchAt + 22, fold, second, cross: [second[0] + 14, second[1] - 6] as const, cheer, len: T.len };
};
type P = ReturnType<typeof testPlan>;

export const TEST_GEO: BridgeGeo = { cx: 540, tableY: 1260, span: 420, bookW: 160, stackH: 150 };
const G = TEST_GEO;
const CAR = 130;
const LEFT = G.cx - G.span / 2 - G.bookW / 2; // машинка на левой стопке
const RIGHT = G.cx + G.span / 2 + G.bookW / 2;
const TOP = G.tableY - G.stackH;

export const TEST_ZOOM = 1.3;
// Планы с мостом — ближе (мост ≈ на всю ширину кадра).
const ZOOM: React.CSSProperties = { transform: `scale(${TEST_ZOOM})`, transformOrigin: "540px 1150px" };

const Table: React.FC = () => (
  <>
    <Paper color={C.wallWarm} dots="rgba(23,23,23,0.04)" />
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(ellipse at 50% 30%, rgba(255,212,59,0.25), rgba(255,212,59,0) 60%)" })} />
    <div style={box({ left: 0, top: G.tableY, width: 1080, height: 660, backgroundColor: "#D9B27F" })} />
    <div style={box({ left: 0, top: G.tableY + 140, width: 1080, height: 520, backgroundColor: C.woodDark })} />
  </>
);

// Положение пальца, толкающего машинку (позади машинки, у заднего бампера).
const pusher = (carX: number, y: number) => ({ x: carX - CAR * 0.55, y: y - CAR * 0.18 });

// a + b: плоский лист
const Flat: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const land = easeOut(clamp((f - p.place[0]) / (p.place[1] - p.place[0])));
  const lift = (1 - land) * 160;
  const pushU = easeInOut(clamp((f - p.push[0]) / (p.push[1] - p.push[0])));
  const onDeck = f >= p.push[0];
  // машинка: стоит на левой стопке → едет к середине; прогиб растёт
  const carX = onDeck ? lerp(LEFT, G.cx - 40, pushU) : LEFT;
  const caught = f >= p.catchAt;
  const backU = easeInOut(clamp((f - p.catchAt - 4) / (p.back - p.catchAt - 4)));
  const liftCar = caught ? keys(f, [[p.catchAt, 0], [p.catchAt + 6, 40], [p.back - 4, 40], [p.back, 0]]) : 0;
  const cx = caught ? lerp(G.cx - 40, LEFT, backU) : carX;
  const sag = 90;
  const deckAt = (x: number) => deckY(G, "flat", x, caught ? null : carX, sag);
  const fy = deckAt(carX);
  const fing = pusher(carX, fy);
  return (
    <AbsoluteFill style={ZOOM}>
      <Table />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {f < p.place[1] ? (
          <>
            <BridgeSide g={G} mode="flat" sag={0} carLen={CAR} showDeck={false} />
            <rect x={G.cx - G.span / 2 - G.bookW * 0.62} y={TOP - lift - 4} width={G.span + G.bookW * 1.24} height={5} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={1.6} />
            <CloseHand x={G.cx - G.span / 2 - 100} y={TOP - lift - 220} angle={-10} size={190} {...SKIN.azamat} shape="pinch" armLen={4} />
            <CloseHand x={G.cx + G.span / 2 + 100} y={TOP - lift - 220} angle={10} size={170} {...SKIN.emir} shape="pinch" mirror armLen={4} />
          </>
        ) : (
          <BridgeSide g={G} mode="flat" sag={sag} carX={cx} carLen={CAR} carLift={liftCar} carRoll={caught ? 0 : carX - LEFT} />
        )}
        {f >= p.place[1] ? (
          <>
            {/* палец Эмира толкает машинку */}
            {f < p.catchAt + 4 ? <CloseHand x={fing.x - 150} y={fing.y - 140} angle={-47} size={170} {...SKIN.emir} shape="point" mirror armLen={5} /> : null}
            {/* папа берёт машинку сверху и возвращает на книги */}
            {f >= p.catchAt - 10 && f < p.back + 14 ? (
              <CloseHand x={(caught ? cx : G.cx - 40) + 10} y={(caught ? deckAt(cx) - liftCar : keys(f, [[p.catchAt - 10, TOP - 400], [p.catchAt, fy]])) - CAR * 0.4 - 196} angle={4} size={190} {...SKIN.azamat} shape="pinch" armLen={4} />
            ) : null}
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

// c: сгибание сверху
const Fold: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const fold = easeInOut(clamp((f - p.fold[0] - 6) / (p.fold[1] - p.fold[0] - 12)));
  const W = 760;
  const Hh = 420;
  const e = foldEdges(W, Hh, fold);
  return (
    <AbsoluteFill>
      <Paper color="#D9B27F" dots="rgba(23,23,23,0.04)" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform="translate(540 980)">
          <FoldSheetTop w={W} h={Hh} fold={fold} guides={1 - fold * 0.6} />
          {/* папа — верхний край, Эмир — нижний */}
          <CloseHand x={-150} y={e.top - 210} angle={0} size={190} {...SKIN.azamat} shape="pinch" armLen={5} />
          <CloseHand x={170} y={e.top - 210} angle={0} size={190} {...SKIN.azamat} shape="pinch" mirror armLen={5} />
          <CloseHand x={-120} y={e.bottom + 200} angle={180} size={170} {...SKIN.emir} shape="pinch" mirror armLen={5} />
          <CloseHand x={150} y={e.bottom + 200} angle={180} size={170} {...SKIN.emir} shape="pinch" armLen={5} />
        </g>
        {/* разрез: ровная дорожка и бортики */}
        <g transform="translate(830 480)">
          <rect x={-130} y={-100} width={260} height={170} fill={C.sheet} stroke={C.ink} strokeWidth={4} />
          <g transform="translate(0 10)">
            <ChannelSection w={180} fold={fold} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// d: сложенный лист на тех же опорах
const Folded: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const u = easeInOut(clamp((f - p.cross[0]) / (p.cross[1] - p.cross[0])));
  const carX = lerp(LEFT, RIGHT, u);
  const y = deckY(G, "folded", carX, carX, 90);
  const fing = pusher(carX, y);
  return (
    <AbsoluteFill style={ZOOM}>
      <Table />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <BridgeSide g={G} mode="folded" sag={90} carX={carX} carLen={CAR} carRoll={carX - LEFT} />
        {u < 0.98 ? <CloseHand x={fing.x - 150} y={fing.y - 140} angle={-47} size={170} {...SKIN.emir} shape="point" mirror armLen={5} /> : null}
        <g transform="translate(780 820) scale(0.8)">
          <rect x={-110} y={-80} width={220} height={140} fill={C.sheet} stroke={C.ink} strokeWidth={4} />
          <g transform="translate(0 6)">
            <ChannelSection w={150} fold={1} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// e: радость
const Cheer: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.cheer;
  const up = keys(t, [[0, 0], [10, 1], [44, 1], [60, 0]], anticipate);
  return (
    <HomeShot
      f={f}
      cam={{ x: 650, y: 1060, zoom: 2.1 }}
      chairs={[{ x: SON_AT.x }, { x: DAD_SEATED.x }]}
      actors={[
        {
          uid: "t11-son",
          look: "emir",
          place: () => SON_AT,
          face: () => 0.35,
          pose: () =>
            sonSeated({
              expr: { browIn: 4, browOut: 6, lid: 0.02, smile: 1 },
              lookY: 0.05,
              lookX: 0.5,
              lean: -4 * up,
              armL: { target: keysV(t, [[0, { x: 440, y: 1266 }], [10, { x: 420, y: 1060 }], [44, { x: 420, y: 1060 }], [60, { x: 440, y: 1266 }]], anticipate), shape: up > 0.5 ? "fist" : "relax", elbow: "down" },
              armR: { target: keysV(t, [[0, { x: 548, y: 1266 }], [10, { x: 575, y: 1060 }], [44, { x: 575, y: 1060 }], [60, { x: 548, y: 1266 }]], anticipate), shape: up > 0.5 ? "fist" : "relax", elbow: "down", behind: false },
            }),
          seed: 4,
          blinkShift: 37,
        },
        { uid: "t11-dad", look: "azamat", place: () => DAD_SEATED, face: () => -0.42, pose: () => dadSeated({ expr: "smile", lookX: -0.3, lookY: 0.1, nod: keys(t, [[8, 0], [16, 4], [28, 1]]) }), seed: 2 },
      ]}
      onTable={null}
    />
  );
};

export const TestScene: React.FC = () => {
  const { f } = useScene("test");
  const p = usePlan(testPlan);
  if (f >= p.cheer) return <Cheer f={f} p={p} />;
  if (f >= p.second[0]) return <Folded f={f} p={p} />;
  if (f >= p.fold[0]) return <Fold f={f} p={p} />;
  return <Flat f={f} p={p} />;
};
