// Сцена 2 «family» (N02): «Үйдө эки бала бар: мектепте окуган уулу жана
// кичинекей кызы. Апасы компаниядагы жумушуна кайтып жатты. Атасы бөлүмдү
// жетектейт, жыйындары көп.»
// Карточка объявления из сцены 1 уменьшается в экран ноутбука, камера
// отъезжает — общий план гостиной: мама за столом, сын с рюкзаком входит
// («уулу»), малышка с зайчиком на ковре («кызы»). Затем короткие вставки:
// мама в офисе за столом с рабочей сумкой; папа ведёт совещание у доски.
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { box, camMove, Shot, type Cam, useScene } from "../kit";
import { Laptop, lerpQuad, laptopScreenQuad, ScreenIn, type Quad } from "../props/Laptop";
import { AdCard } from "../ui/AdCard";
import { DiningTable, LIVING } from "../sets/Living";
import { MEETING, MeetingBack, MeetingTable, OFFICE, OfficeBack, OfficeChair, OfficeDesk } from "../sets/Office";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { CAM_DESK, CARD, cardQuad, MOM_DESK, toScreen, typingPose } from "./AdDesk";
import { BUNNY_SCALE, H } from "./common";
import { LINE_END_AD, lineEndZoom } from "./Line";
import { Room } from "./Room";

const L = LIVING;
const O = OFFICE;
const M = MEETING;
export const CAM_WIDE: Cam = { x: 1060, y: 1215, zoom: 0.86 };

export const familyPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "family");
  const son = T.word("N02", "уулу");
  const girl = T.word("N02", "кичинекей");
  const office = T.word("N02", "Апасы") - 4;
  const meeting = T.word("N02", "Атасы") - 4;
  return { into: 26, son, girl, office, meeting, len: T.len };
};

// Экран ноутбука показывает то же объявление (компактно) — в мире.
// compact 0…1 — переход тени крупной карточки в экранную (монтаж из сц. 1).
export const LaptopAd: React.FC<{ readonly ad?: Parameters<typeof AdCard>[0]; readonly quad: Quad; readonly h: number; readonly opacity?: number; readonly compact?: number }> = ({ ad = LINE_END_AD, quad, h, opacity = 1, compact = 1 }) => (
  <ScreenIn quad={quad} w={CARD.w} h={h} opacity={opacity}>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F7F5EF", opacity: compact }} />
    <AdCard {...ad} w={CARD.w} x={0} y={0} compact={compact} />
  </ScreenIn>
);

export const FamilyScene: React.FC = () => {
  const { f, tl } = useScene("family");
  const P = familyPlan(tl);
  const into = easeInOut(clamp(f / P.into));
  const cam = camMove(f, 0, P.into + 8, CAM_DESK, CAM_WIDE);
  const camHome = f < P.into + 8 ? cam : camMove(f, P.into + 8, P.office, CAM_WIDE, { x: 1080, y: 1220, zoom: 0.92 });
  const { quad: fromQ, h } = cardQuad(LINE_END_AD, lineEndZoom());
  const lq = laptopScreenQuad(L.laptop.x, L.laptop.y);
  const toQ = lq.map((p) => toScreen(p, camHome)) as unknown as Quad;
  // сын с рюкзаком входит справа и останавливается у мамы
  const sonPlace = (t: number) => {
    const u = cruise((t - (P.son - 20)) / 54, 0.3);
    return { x: lerp(1700, 1370, u), y: 1560, h: H.son };
  };
  const td = { x: 1470, y: 1662, h: H.toddler };
  // начало продолжает позу конца сц. 1 (задумчиво, голова наклонена)
  const momPose = (t: number): PoseIn =>
    typingPose(t, t > 14 && t < P.son ? 1 : 0, {
      expr: t < 10 ? "thinking" : t > P.son + 10 ? "softSmile" : "calm",
      headTilt: keys(t, [[0, -4], [14, 0]]),
      lookY: keys(t, [[0, 0.12], [14, 0.32], [P.son + 6, 0.32], [P.son + 10, 0.05]]),
    });
  const momFace = (t: number) => keys(t, [[0, -0.62], [12, -0.75], [P.son + 6, -0.75], [P.son + 18, 0.55]]);
  const sonPose = (t: number): PoseIn => ({
    expr: "smile",
    armR: t > P.son + 34 ? { target: { x: sonPlace(t).x + 70, y: 1560 - 0.62 * H.son + Math.sin(t / 4) * 8 }, shape: "wave", elbow: "out" } : { target: null, shape: "relax" },
  });
  const tdPose = (t: number): PoseIn => {
    const lift = keys(t, [[P.girl, 0], [P.girl + 14, 1], [P.girl + 50, 1], [P.girl + 64, 0.3]]);
    const bob = Math.sin(t / 7) * 5;
    const hy = td.y - lerp(0.48, 0.66, lift) * td.h + bob;
    return {
      expr: "smile",
      lookY: lerp(0.4, -0.1, lift),
      armL: { target: { x: td.x - 18, y: hy }, shape: "fist", elbow: "hang" },
      armR: { target: { x: td.x + 18, y: hy }, shape: "fist", elbow: "hang", item: "bunny", itemScale: BUNNY_SCALE(td.h) },
    };
  };
  const mom = (layer: "body" | "arms") => <Actor uid="s2-mom" look="mom" f={f} place={() => MOM_DESK} face={momFace} pose={momPose} seed={1} layer={layer} />;
  const blur = 7 * (1 - into);
  return (
    <>
      {/* дома: карточка → экран ноутбука, общий план семьи */}
      {f < P.office ? (
        <>
          <div style={box({ inset: 0, filter: blur > 0.2 ? `blur(${blur}px)` : undefined })}>
            <Shot f={f} cam={camHome}>
              <Room laptop={{ screen: null }} toys />
            </Shot>
          </div>
          <div style={box({ inset: 0, backgroundColor: `rgba(247,245,239,${0.32 * (1 - into)})` })} />
          <Shot f={f} cam={camHome} bg="transparent">
            {mom("body")}
            {/* стол и ноутбук поверх тела мамы — резкие (под ними та же мебель в
                размытом слое); проявляются, пока карточка уходит в экран */}
            <div style={box({ inset: 0, opacity: clamp((into - 0.25) / 0.5) })}>
              <DiningTable />
              <Laptop x={L.laptop.x} y={L.laptop.y} screen={f >= P.into ? <LaptopAdInner h={h} /> : null} />
            </div>
            {mom("arms")}
            {f >= P.son - 22 ? <Actor uid="s2-son" look="son" f={f} place={sonPlace} face={(t) => (t < P.son + 30 ? -0.6 : -0.3)} pose={sonPose} walkFrom={P.son - 20} seed={4} /> : null}
            <Actor uid="s2-td" look="toddler" f={f} place={() => td} face={() => 0.3} pose={tdPose} seed={5} />
          </Shot>
          {f < P.into ? <LaptopAd quad={lerpQuad(fromQ as unknown as Quad, toQ, into)} h={h} compact={into} /> : null}
        </>
      ) : null}
      {/* вставка: мама в офисе */}
      <Shot f={f} from={P.office} to={P.meeting} cam={camMove(f, P.office, P.meeting, { x: 600, y: 1090, zoom: 1.02 }, { x: 600, y: 1070, zoom: 1.1 })} bg="#E8EDF2">
        <OfficeBack />
        <OfficeChair x={O.momSeat.x} />
        <Actor uid="s2-omom" look="mom" f={f} place={() => ({ x: O.momSeat.x, y: O.feetY, h: H.mom })} face={(t) => keys(t, [[P.office, 0.62], [P.office + 40, 0.62], [P.office + 52, 0.8]])} pose={(t) => officePose(t, P.office)} seed={1} layer="body" />
        <OfficeDesk typing={keys(f, [[P.office, 0.2], [P.meeting, 1]])} />
        <Actor uid="s2-omom" look="mom" f={f} place={() => ({ x: O.momSeat.x, y: O.feetY, h: H.mom })} face={(t) => keys(t, [[P.office, 0.62], [P.office + 40, 0.62], [P.office + 52, 0.8]])} pose={(t) => officePose(t, P.office)} seed={1} layer="arms" />
      </Shot>
      {/* вставка: папа ведёт совещание */}
      <Shot f={f} from={P.meeting} to={P.len + 1} cam={camMove(f, P.meeting, P.len, { x: 610, y: 1060, zoom: 0.95 }, { x: 640, y: 1050, zoom: 1.0 })} bg="#EDF0F3">
        <MeetingBack point={keys(f, [[P.meeting + 16, 0], [P.meeting + 34, 1]])} />
        {M.seats.map((x) => (
          <OfficeChair key={`ch${x}`} x={x} />
        ))}
        {M.seats.map((x, i) => (
          <Actor key={`b${x}`} uid={`s2-c${i}`} look={i ? "colleagueW" : "colleagueM"} f={f} place={() => ({ x, y: M.feetY, h: 770 })} face={() => 0.85} pose={(t) => colleaguePose(t, x, i, P.meeting)} layer="body" seed={8 + i} />
        ))}
        <MeetingTable />
        {M.seats.map((x, i) => (
          <Actor key={`a${x}`} uid={`s2-c${i}`} look={i ? "colleagueW" : "colleagueM"} f={f} place={() => ({ x, y: M.feetY, h: 770 })} face={() => 0.85} pose={(t) => colleaguePose(t, x, i, P.meeting)} layer="arms" seed={8 + i} />
        ))}
        <Actor uid="s2-dad" look="dad" f={f} place={() => ({ x: M.dad.x, y: M.feetY, h: H.dad })} face={(t) => keys(t, [[P.meeting, -0.45], [P.meeting + 16, -0.75], [P.len - 30, -0.75], [P.len - 16, -0.4]])} pose={(t) => dadMeetingPose(t, P.meeting, P.len)} seed={2} />
      </Shot>
    </>
  );
};

const LaptopAdInner: React.FC<{ readonly h: number }> = ({ h }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 1000 }}>
    <ScreenFit h={h} />
  </div>
);
// Экран ноутбука в размере LAPTOP_DESIGN: объявление растянуто на весь экран
// (тот же вид, что в конце сцены 1).
const ScreenFit: React.FC<{ readonly h: number }> = ({ h }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: h, transformOrigin: "0 0", transform: `scale(${1600 / CARD.w}, ${1000 / h})` }}>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F7F5EF" }} />
    <AdCard {...LINE_END_AD} w={CARD.w} x={0} y={0} compact />
  </div>
);

const officePose = (t: number, t0: number): PoseIn => {
  const tap = (ph: number) => Math.max(0, Math.sin(t / 2.2 + ph)) * 5;
  return {
    sit: 1,
    seat: OFFICE.momSeat.seat,
    expr: "calm",
    lookY: keys(t, [[t0, 0.5], [t0 + 40, 0.5], [t0 + 52, 0.05]]),
    armL: { target: { x: OFFICE.keyboard.x - 36, y: OFFICE.keyboard.y - 10 - tap(0) }, shape: "relax", elbow: "down" },
    armR: { target: { x: OFFICE.keyboard.x + 30, y: OFFICE.keyboard.y - 12 - tap(1.6) }, shape: "relax", elbow: "down" },
  };
};

const colleaguePose = (t: number, x: number, i: number, t0: number): PoseIn => ({
  sit: 1,
  seat: 205,
  expr: "calm",
  nod: keys(t, [[t0 + 40 + i * 9, 0], [t0 + 47 + i * 9, 5], [t0 + 57 + i * 9, 0]]),
  armL: { target: { x: x + 40, y: MEETING.table.top - 14 }, shape: "relax", elbow: "down" },
  armR: { target: { x: x + 90, y: MEETING.table.top - 14 }, shape: "relax", elbow: "down" },
});

const dadMeetingPose = (t: number, t0: number, end: number): PoseIn => {
  const point = keys(t, [[t0 + 6, 0], [t0 + 20, 1], [end - 34, 1], [end - 18, 0]]);
  return {
    expr: "calm",
    armL: point > 0.05 ? { target: { x: lerp(MEETING.dad.x - 90, MEETING.board.x + 290, point), y: lerp(MEETING.feetY - 420, MEETING.board.y + 200, point) }, shape: point > 0.5 ? "open" : "relax", elbow: "down" } : { target: null, shape: "relax" },
    armR: t > end - 26 ? { target: { x: MEETING.dad.x + 70, y: MEETING.feetY - 470 }, shape: "open", elbow: "down" } : { target: null, shape: "relax" },
  };
};
