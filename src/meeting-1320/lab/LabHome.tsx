// Площадка предпросмотра (не кадр фильма): ассеты группы «Home» по отдельности —
// сеты, предметы, анимации. Композиция M13LabHome (папка Scenes в Studio):
//   npx remotion still src/index.ts M13LabHome out.png --frame=N
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fonts";
import { SceneContext } from "../context";
import { box, Grain, Shot } from "../kit";
import { Actor } from "../rig/Actor";
import { clamp, lerp } from "../rig/motion";
import { H, seatOf } from "../scenes/common";
import { GD_POS, GrandmaDoor, HM_POS, HM_WALL_S, HomeRoom, MO_POS, MomOffice } from "../sets/Home31";
import { C, F } from "../theme";
import { BalagoPage, FormScreen, Phone, PhoneHold, phonePt, SearchScreen } from "../props/Phone31";
import { DrawingArt, DrawingFront, PapersFront, PapersTop, POLO_PAINT, RouteBadge, TableTop } from "../props/HomeProps";
import { CloseHand } from "../props/CloseHand";
import { M13_HANDS } from "../props/hands";
import { CarSide } from "../props/Car";
import { CAR_SCALE } from "../scenes/common";

const r = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

type Sec = { readonly from: number; readonly len: number; readonly name: string; readonly draw: (t: number, f: number) => React.ReactNode };

const SECS: readonly Sec[] = [
  {
    from: 0,
    len: 60,
    name: "GrandmaDoor",
    draw: (t, f) => {
      const g = GD_POS.grandma;
      const s = GD_POS.son;
      const d = GD_POS.father;
      return (
        <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }}>
          <GrandmaDoor
            open={r(t, 0.1, 0.5)}
            inside={<Actor uid="lh-g" look="m13Grandma" f={f} place={() => ({ x: g.x, y: g.y, h: H.grandma * g.s })} face={() => -0.4} pose={() => ({ expr: "smile" })} seed={9} opacity={r(t, 0.3, 0.5)} />}
            front={
              <>
                <Actor uid="lh-s" look="m13Son" f={f} place={() => ({ x: s.x, y: s.y, h: H.son * s.s })} face={() => 0.4} seed={5} />
                <Actor uid="lh-d" look="m13Director" f={f} place={() => ({ x: d.x, y: d.y, h: H.dad * d.s })} face={() => 0.5} seed={3} />
              </>
            }
          />
        </Shot>
      );
    },
  },
  {
    from: 60,
    len: 60,
    name: "MomOffice",
    draw: (t, f) => {
      const m = MO_POS.mom;
      const kb = { x: m.x + 190, y: MO_POS.desk.top - 6 };
      const pose = () => ({ sit: 1, seat: seatOf(H.mom), expr: "calm" as const, lookY: 0.05, armL: { target: { x: kb.x - 30, y: kb.y }, elbow: "down" as const }, armR: { target: { x: kb.x + 26, y: kb.y + 4 }, elbow: "down" as const } });
      return (
        <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }}>
          <MomOffice
            typing={Math.floor(t * 6)}
            back={<Actor uid="lh-c" look="m13ColleagueW" f={f} place={() => ({ x: 980, y: 1560, h: H.colleagueW * 0.8 })} face={() => -0.3} seed={8} />}
            mid={<Actor uid="lh-m" look="m13Mom" f={f} place={() => ({ x: m.x, y: m.y, h: H.mom })} face={() => 0.85} pose={pose} seed={6} layer="body" />}
            front={<Actor uid="lh-m" look="m13Mom" f={f} place={() => ({ x: m.x, y: m.y, h: H.mom })} face={() => 0.85} pose={pose} seed={6} layer="arms" />}
          />
        </Shot>
      );
    },
  },
  {
    from: 120,
    len: 60,
    name: "HomeRoom",
    draw: (t, f) => {
      const mo = HM_POS.mother;
      const fa = HM_POS.father;
      const T = HM_POS.table;
      const mPose = () => ({ sit: 1, seat: seatOf(H.mom), expr: "calm" as const, armL: { target: { x: mo.x - 50, y: T.top + 40 }, elbow: "hang" as const }, armR: { target: { x: mo.x + 50, y: T.top + 42 }, elbow: "hang" as const } });
      const fPose = () => ({ sit: 1, seat: seatOf(H.dad), expr: "calm" as const, lookY: 0.3, armL: { target: { x: fa.x - 56, y: T.top + 42 }, elbow: "hang" as const }, armR: { target: { x: fa.x + 60, y: T.top + 44 }, elbow: "hang" as const } });
      return (
        <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }}>
          <HomeRoom
            late={t}
            chairs={[{ x: mo.x, seat: seatOf(H.mom) }, { x: fa.x, seat: seatOf(H.dad) }, { x: HM_POS.sonChair.x, seat: seatOf(H.dad) }]}
            back={<Actor uid="lh-son" look="m13SonHome" f={f} place={() => ({ x: HM_POS.doorway.x, y: HM_POS.doorway.y, h: H.son * HM_WALL_S })} face={() => -0.6} seed={5} />}
            seated={
              <>
                <Actor uid="lh-mo" look="m13MomHome" f={f} place={() => ({ x: mo.x, y: mo.y, h: H.mom })} face={() => 0.3} pose={mPose} seed={6} layer="body" />
                <Actor uid="lh-fa" look="m13DirectorHome" f={f} place={() => ({ x: fa.x, y: fa.y, h: H.dad })} face={() => -0.1} pose={fPose} seed={3} layer="body" />
              </>
            }
            arms={
              <>
                <Actor uid="lh-mo" look="m13MomHome" f={f} place={() => ({ x: mo.x, y: mo.y, h: H.mom })} face={() => 0.3} pose={mPose} seed={6} layer="arms" />
                <Actor uid="lh-fa" look="m13DirectorHome" f={f} place={() => ({ x: fa.x, y: fa.y, h: H.dad })} face={() => -0.1} pose={fPose} seed={3} layer="arms" />
              </>
            }
          />
        </Shot>
      );
    },
  },
  {
    from: 180,
    len: 60,
    name: "Phone: search → page",
    draw: (t, f) => {
      const hand = M13_HANDS.directorHome;
      return (
        <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3A2C22">
          <PhoneHold layer="back" x={540} y={880} k={1.45} angle={-3} {...hand} />
          <Phone x={540} y={880} k={1.45} angle={-3}>
            {t < 0.5 ? <SearchScreen f={f} typed={r(t, 0, 0.25)} results={r(t, 0.28, 0.4)} pick={r(t, 0.42, 0.5)} /> : <BalagoPage scroll={r(t, 0.55, 0.8)} press={r(t, 0.85, 0.98)} />}
          </Phone>
          <PhoneHold layer="front" x={540} y={880} k={1.45} angle={-3} {...hand} />
          <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
            {(() => {
              const p = phonePt(540, 880, 1.45, -3, 180, 700);
              return <CloseHand {...hand} x={p.x + 150} y={p.y + 300} angle={152} size={200} shape="point" armLen={3} />;
            })()}
          </svg>
        </Shot>
      );
    },
  },
  {
    from: 240,
    len: 60,
    name: "Phone: form → sent",
    draw: (t, f) => (
      <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3A2C22">
        <Phone x={540} y={900} k={1.6} angle={2}>
          <FormScreen fill={r(t, 0, 0.6) * 4} press={r(t, 0.62, 0.72)} sent={r(t, 0.74, 1)} />
        </Phone>
      </Shot>
    ),
  },
  {
    from: 300,
    len: 40,
    name: "Drawing + papers top",
    draw: (t, f) => {
      const hand = M13_HANDS.directorHome;
      const px = lerp(620, 300, r(t, 0.1, 0.7));
      return (
        <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }}>
          <TableTop late={1}>
            <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
              <PapersTop x={px} y={900} w={520} angle={-6} />
              <CloseHand {...hand} x={px + 300} y={1000} angle={110} size={190} shape="open" armLen={3} />
              <CloseHand {...hand} x={px + 260} y={760} angle={120} size={190} shape="open" armLen={3} mirror />
              <g transform={`translate(760 ${lerp(2300, 1400, r(t, 0.6, 1))}) rotate(8)`}>
                <DrawingArt w={460} line={5} />
              </g>
            </svg>
          </TableTop>
        </Shot>
      );
    },
  },
  {
    from: 340,
    len: 40,
    name: "Route + Polo + table props",
    draw: (t, f) => (
      <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }}>
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: C.paper })} />
        <RouteBadge x={540} y={500} k={1.2} draw={t} />
        <CarSide x={540} y={1000} s={CAR_SCALE * 0.4} layer="back" paint={POLO_PAINT} />
        <CarSide x={540} y={1000} s={CAR_SCALE * 0.4} layer="body" paint={POLO_PAINT} />
        <div style={box({ left: 0, top: 1100, width: 1080, height: 600, background: C.woodLight })} />
        <PapersFront x={400} y={1300} w={260} />
        <DrawingFront x={760} y={1300} w={300} angle={6} />
      </Shot>
    ),
  },
];

export const LabHome: React.FC = () => {
  const f = useCurrentFrame();
  const sec = SECS.find((s) => f >= s.from && f < s.from + s.len) ?? SECS[SECS.length - 1];
  const t = clamp((f - sec.from) / Math.max(1, sec.len - 1));
  return (
    <SceneContext.Provider value={{ from: 0, to: 600 }}>
      <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
        {sec.draw(t, f)}
        <Grain />
        <div style={box({ left: 24, top: 24, padding: "6px 14px", borderRadius: 10, backgroundColor: "rgba(23,42,70,0.55)", color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 30 })}>{`${sec.name} · ${f}`}</div>
      </AbsoluteFill>
    </SceneContext.Provider>
  );
};
