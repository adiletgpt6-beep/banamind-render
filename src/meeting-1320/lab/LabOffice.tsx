// Площадка предпросмотра (не кадр фильма): календарь, офис, переговорная и
// предметный план ключей по очереди, параметры анимируются. Композиция
// M13LabOffice (папка Scenes в Studio), 600 кадров:
//   npx remotion still src/index.ts M13LabOffice out.png --frame=N
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fonts";
import { SceneContext } from "../context";
import { box, Grain, Shot } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, glide } from "../rig/motion";
import { H, seatOf } from "../scenes/common";
import { DIRF, DIRF_CAM, DIRR, DirectorFront, DirectorReverse, MEET_CAM, MEET_POS, MeetingRoom, O31_CAM, O31_POS, o31S, OfficeWide } from "../sets/Office31";
import { C, F } from "../theme";
import { DeskTopDown, keysPickupAt, KeysPickup } from "../props/DeskProps";
import { CalendarBackdrop, CalendarDay, CalendarGlance, CalendarWeek, DAY_POS, DigitalClock, MacroTime, NotifyCard, ScreenInsert, TabletScreen, dayChipRect, DAY_DETAIL, MysteryDetail, weekDragCursor, weekPoint } from "../props/CalendarUI";

const r = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

type Sec = { readonly from: number; readonly len: number; readonly name: string; readonly draw: (t: number, f: number) => React.ReactNode };

const SECS: readonly Sec[] = [
  { from: 0, len: 40, name: "MacroTime", draw: (t) => <MacroTime macro={1 - r(t, 0.15, 0.85)} frame={r(t, 0, 0.3)} day={0} title={r(t, 0.7, 1)} /> },
  {
    from: 40,
    len: 50,
    name: "CalendarDay",
    draw: (t) => (
      <>
        <CalendarBackdrop />
        <CalendarDay x={DAY_POS.x} y={DAY_POS.y} day={2 * r(t, 0.05, 0.8)} title={1} glow={r(t, 0.8, 1)} />
      </>
    ),
  },
  {
    from: 90,
    len: 40,
    name: "MysteryDetail",
    draw: (t) => (
      <>
        <CalendarBackdrop />
        <CalendarDay x={DAY_POS.x} y={DAY_POS.y} day={2} glow={0.6} detail={{ open: r(t, 0, 0.35), fields: [r(t, 0.35, 0.55), r(t, 0.55, 0.75), r(t, 0.75, 0.95)] }} />
      </>
    ),
  },
  {
    from: 130,
    len: 30,
    name: "meaning",
    draw: (t) => (
      <>
        <CalendarBackdrop warm={0.4} />
        <CalendarDay x={DAY_POS.x} y={DAY_POS.y} day={0} glow={0.5} meaning={r(t, 0.1, 0.9)} />
      </>
    ),
  },
  {
    from: 160,
    len: 70,
    name: "CalendarWeek",
    draw: (t) => {
      const grab = r(t, 0.05, 0.12) * (1 - r(t, 0.42, 0.48));
      const drag = r(t, 0.14, 0.42);
      const dc = weekDragCursor(drag, 150);
      const hp = weekPoint(2, 13 * 60 + 40, 150);
      const k = r(t, 0.55, 0.7);
      const cur = { x: dc.x + (hp.x - dc.x) * k, y: dc.y + (hp.y - dc.y) * k, down: grab };
      return (
        <ScreenInsert device="monitor" push={t}>
          <CalendarWeek x={0} y={30} scale={0.82} hourH={150} drag={drag} grab={grab} online={r(t, 0.45, 0.55)} hover={r(t, 0.65, 0.75)} hoverCol={2} client={r(t, 0.8, 0.95)} cursor={cur} card={false} />
        </ScreenInsert>
      );
    },
  },
  {
    from: 230,
    len: 30,
    name: "NotifyCard",
    draw: (t) => (
      <>
        <CalendarBackdrop props={false} />
        <NotifyCard x={130} y={640} appear={r(t, 0, 0.5)} />
      </>
    ),
  },
  { from: 260, len: 30, name: "Tablet proposal", draw: (t) => <><CalendarBackdrop props={false} /><TabletScreen x={130} y={300} scale={0.84} view="proposal" typed={r(t, 0.05, 0.75)} done={r(t, 0.8, 1)} /></> },
  { from: 290, len: 20, name: "Tablet week", draw: (t) => <><CalendarBackdrop props={false} warm={0.6} /><TabletScreen x={130} y={300} scale={0.84} view="week" glowAll={r(t, 0, 0.8)} tomorrow={1} tomorrowOn={r(t, 0.2, 0.6)} /></> },
  { from: 310, len: 20, name: "DigitalClock", draw: (t) => <><CalendarBackdrop props={false} /><DigitalClock x={220} y={760} flip={r(t, 0.2, 0.7)} /></> },
  {
    from: 330,
    len: 50,
    name: "OfficeWide exit",
    draw: (t, f) => {
      const A = O31_POS.assistant;
      const path = O31_POS.exitPath.slice(2);
      const at = (fr: number) => glide(fr, 330, 379, path, (x) => x);
      const place = (fr: number) => {
        const p = at(fr);
        return { x: p.x, y: p.y, h: H.dad * o31S(p.y) };
      };
      const inside = at(f).y < O31_POS.door.y;
      const walker = <Actor uid="lo-w" look="m13Director" f={f} place={place} face={() => -0.8} pose={() => ({ expr: "calm", armR: { target: null, item: "keys" } })} seed={3} walkFrom={330} />;
      const follow = (fr: number) => Math.max(-0.7, Math.min(0.8, (at(fr).x - A.x) / 300));
      const asPose = (): PoseIn => ({ sit: 1, seat: seatOf(H.assistant), expr: "calm", lookY: -0.15, armL: { target: { x: O31_POS.asstKeys.x - 24, y: O31_POS.asstKeys.y + 2 }, elbow: "down" }, armR: { target: { x: O31_POS.asstKeys.x + 28, y: O31_POS.asstKeys.y + 6 }, elbow: "down" } });
      return (
        <Shot f={f} cam={O31_CAM.wide}>
          <OfficeWide
            door={1}
            inRoom={inside ? walker : null}
            mid={inside ? null : walker}
            assistant={<Actor uid="lo-a" look="m13Assistant" f={f} place={() => ({ x: A.x, y: A.y, h: H.assistant })} face={follow} pose={asPose} seed={7} layer="body" />}
            assistantArms={<Actor uid="lo-a" look="m13Assistant" f={f} place={() => ({ x: A.x, y: A.y, h: H.assistant })} face={follow} pose={asPose} seed={7} layer="arms" />}
          />
        </Shot>
      );
    },
  },
  {
    from: 380,
    len: 30,
    name: "Assistant medium",
    draw: (t, f) => {
      const A = O31_POS.assistant;
      const k = O31_POS.asstKeys;
      const look = r(t, 0.3, 0.6);
      const asPose = (): PoseIn => ({ sit: 1, seat: seatOf(H.assistant), expr: look > 0.5 ? "thinking" : "calm", lookY: 0.12 - 0.1 * look, headTilt: 6 * look, armL: { target: { x: k.x - 24, y: k.y + 2 }, elbow: "down" }, armR: { target: { x: k.x + 28, y: k.y + 6 }, elbow: "down" } });
      return (
        <Shot f={f} cam={O31_CAM.assistant}>
          <OfficeWide
            monitorHi={look}
            assistant={<Actor uid="la-a" look="m13Assistant" f={f} place={() => ({ x: A.x, y: A.y, h: H.assistant })} face={() => 0.8} pose={asPose} seed={7} layer="body" />}
            assistantArms={<Actor uid="la-a" look="m13Assistant" f={f} place={() => ({ x: A.x, y: A.y, h: H.assistant })} face={() => 0.8} pose={asPose} seed={7} layer="arms" />}
          />
        </Shot>
      );
    },
  },
  {
    from: 410,
    len: 30,
    name: "DirectorFront",
    draw: (t, f) => {
      const S = DIRF.seat;
      const up = r(t, 0.3, 0.6);
      const pose = (): PoseIn => ({ sit: 1, seat: seatOf(H.dad), expr: up > 0.5 ? "softSmile" : "calm", lookY: 0.45 - 0.5 * up, armL: { target: { x: DIRF.laptop.x - 70, y: DIRF.laptop.y - 6 }, elbow: "down", shape: "relax" }, armR: { target: { x: DIRF.laptop.x + 10, y: DIRF.laptop.y - 8 }, elbow: "down", shape: "relax" } });
      const place = () => ({ x: S.x, y: S.y, h: H.dad });
      return (
        <Shot f={f} cam={DIRF_CAM.medium}>
          <DirectorFront
            clock={<DigitalClock x={DIRF.clock.x} y={DIRF.clock.y} scale={DIRF.clock.scale} flip={r(t, 0.5, 0.9)} />}
            body={<Actor uid="ld-d" look="m13Director" f={f} place={place} face={() => 0.25 - 0.35 * up} pose={pose} seed={3} layer="body" />}
            arms={<Actor uid="ld-d" look="m13Director" f={f} place={place} face={() => 0.25 - 0.35 * up} pose={pose} seed={3} layer="arms" />}
          />
        </Shot>
      );
    },
  },
  {
    from: 440,
    len: 30,
    name: "DirectorReverse",
    draw: (t, f) => {
      const V = DIRR.visitor;
      const pose = (): PoseIn => ({ expr: "calm", lookY: 0.1, armL: { target: { x: V.x - 30 * V.s, y: V.y - 440 * V.s }, elbow: "down", item: "tablet", facing: "self" } });
      return (
        <Shot f={f} cam={DIRR_CAM_MAIN}>
          <DirectorReverse
            door={r(t, 0, 0.3)}
            headUp={r(t, 0.5, 0.8)}
            screen={<CalendarGlance glow={0.5 + 0.5 * r(t, 0.5, 0.8)} />}
            visitor={<Actor uid="lr-a" look="m13Assistant" f={f} place={() => ({ x: V.x, y: V.y, h: H.assistant * V.s })} face={() => -0.3} pose={pose} seed={7} />}
          />
        </Shot>
      );
    },
  },
  {
    from: 470,
    len: 30,
    name: "Office evening",
    draw: (t, f) => {
      const D = O31_POS.director;
      const dk = O31_POS.dirDeskTop;
      const dirPose = (): PoseIn => ({ sit: 1, seat: seatOf(H.dad) * D.s, expr: "calm", lookY: 0.4, armL: { target: { x: D.x - 70 * D.s, y: dk.back + 6 }, elbow: "down" }, armR: { target: { x: D.x + 80 * D.s, y: dk.back + 6 }, elbow: "down" } });
      const din = O31_POS.doorOutside;
      const sO = din.y;
      void sO;
      return (
        <Shot f={f} cam={O31_CAM.wide}>
          <OfficeWide
            evening={1}
            door={1}
            director={<Actor uid="le-d" look="m13Director" f={f} place={() => ({ x: D.x, y: D.y, h: H.dad * D.s })} face={() => -0.3} pose={dirPose} seed={3} layer="body" />}
            directorArms={<Actor uid="le-d" look="m13Director" f={f} place={() => ({ x: D.x, y: D.y, h: H.dad * D.s })} face={() => -0.3} pose={dirPose} seed={3} layer="arms" />}
            mid={<Actor uid="le-a" look="m13Assistant" f={f} place={() => ({ x: din.x, y: din.y, h: H.assistant * ((din.y - 760) / 1140) })} face={() => 0.5} pose={() => ({ expr: "calm", armL: { target: { x: din.x - 10, y: din.y - 300 }, elbow: "down", item: "tablet", facing: "self" } })} seed={7} />}
          />
        </Shot>
      );
    },
  },
  {
    from: 500,
    len: 40,
    name: "MeetingRoom",
    draw: (t, f) => {
      const M = MEET_POS;
      const seat = (p: typeof M.client, look: "m13Client" | "m13Assistant" | "m13ColleagueW" | "m13ColleagueM" | "m13Director", uid: string, layer: "body" | "arms", seed: number) => {
        const pose = (): PoseIn => ({ sit: 1, seat: seatOf(p.h / p.s) * p.s, expr: "calm", lookY: 0.1, armL: { target: { x: p.x + p.face * 150 * p.s - 30 * p.s, y: M.tableTop.near + (M.tableTop.far - M.tableTop.near) * (1.04 - p.s) / 0.4 + 6 }, elbow: "down" }, armR: { target: { x: p.x + p.face * 150 * p.s + 30 * p.s, y: M.tableTop.near + (M.tableTop.far - M.tableTop.near) * (1.04 - p.s) / 0.4 + 8 }, elbow: "down" } });
        return <Actor key={uid + layer} uid={uid} look={look} f={f} place={() => ({ x: p.x, y: p.y, h: p.h })} face={() => p.face} pose={pose} seed={seed} layer={layer} />;
      };
      const all = (layer: "body" | "arms") => [seat(M.client, "m13Client", "mc", layer, 11), seat(M.assistant, "m13Assistant", "ma", layer, 7), seat(M.colleagueW, "m13ColleagueW", "mw", layer, 13), seat(M.director, "m13Director", "md", layer, 3)];
      return (
        <Shot f={f} cam={t < 0.5 ? MEET_CAM.wide : MEET_CAM.screen}>
          <MeetingRoom hi={1} head={<>{seat(M.colleagueM, "m13ColleagueM", "mm", "body", 17)}{seat(M.colleagueM, "m13ColleagueM", "mm", "arms", 17)}</>} seated={<>{all("body")}</>} arms={<>{all("arms")}</>} />
        </Shot>
      );
    },
  },
  {
    from: 540,
    len: 60,
    name: "KeysPickup",
    draw: (t, f) => (
      <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 + 0.04 * t }}>
        <DeskTopDown>
          <KeysPickup {...keysPickupAt(t)} />
        </DeskTopDown>
      </Shot>
    ),
  },
];

const DIRR_CAM_MAIN = { x: 540, y: 1240, zoom: 1 };

export const LabOffice: React.FC = () => {
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

// Неиспользуемые пока помощники (будут в разделах офиса).
void dayChipRect;
void DAY_DETAIL;
void MysteryDetail;
