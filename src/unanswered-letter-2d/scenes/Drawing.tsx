// Сцена 9. «Сүрөт» (вечер третьего дня) — эмоциональный центр.
// Монтаж — склейками, без наложения планов (нет двойных фигур):
//   общий план: дочка входит с рисунком у груди, протягивает его; лист
//     непрерывно переходит из её рук в руки мамы (дочка держит нижние
//     углы, мама берёт за верхние, затем дочка отпускает);
//   крупно рисунок (что нарисовала дочка): «Муну кайда коёбуз?» — камера к
//     имени «Айжан» на нарисованной двери;
//   мама и дочка: «Сенин жаңы жумушуңа» (дочка показывает на рисунок),
//     «Сен жетекчи болосуң да?» (ладони вместе, искренний интерес); мама
//     задумывается — пауза;
//   мама крупно: «Абдан каалайм.» — от задумчивости к тёплой уверенности;
//   крупно рисунок второй раз (почему это важно маме): мягкое выделение
//     нарисованной мамы во главе стола;
//   общий план: мама кладёт лист на стол рядом с ноутбуком и обнимает дочку
//     за плечо, муж улыбается.
// Рисунок — единый ассет ChildDrawing.
import { ChildDrawing, DRAWING_H, DRAWING_W } from "../graphics/Drawing";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, cruise, easeInOut, easeOut, keys, keysV, type Vec } from "../rig/motion";
import { ChairBack, HOME, HomeBack, LaptopSide, TableFront, WarmLamp } from "../sets/Home";
import { box as wbox } from "../shots";
import { C } from "../theme";
import { H, onTable, placeAt, seated, seatOf } from "./common";
import { EVE_MOM } from "./Evening";
import { box, PanelArea, Stage, usePanel, useScene } from "./kit";

export const PAPER_BACK = "#F3EEDF";
const PAPER_W = 170;
const PAPER_H = (PAPER_W * DRAWING_H) / DRAWING_W;

// Лист в мире (обратная сторона к зрителю, пока рисунок смотрит мама).
const PaperBack: React.FC<{ at: Vec; rot: number }> = ({ at, rot }) => (
  <div style={wbox({ left: at.x - PAPER_W / 2, top: at.y - PAPER_H / 2, width: PAPER_W, height: PAPER_H, backgroundColor: PAPER_BACK, borderRadius: 4, rotate: `${rot}deg`, boxShadow: "0 6px 12px rgba(40,25,10,0.25)" })}>
    {/* сквозь бумагу чуть просвечивает рисунок */}
    <div style={wbox({ left: "18%", top: "26%", width: "40%", height: "36%", borderRadius: "50%", backgroundColor: "rgba(47,156,147,0.12)" })} />
  </div>
);

// Кисти Айжан, держащие лист на крупном плане (рукава кардигана).
const HoldingHands: React.FC<{ w: number; y: number; x: number }> = ({ w, y, x }) => {
  const L = LOOKS.aizhan;
  return (
    <>
      {[-1, 1].map((s) => (
        <div key={s} style={box({ left: x + (s < 0 ? -40 : w - 70), top: y - 10, width: 110, height: 180 })}>
          <div style={box({ left: s < 0 ? -30 : 40, top: 90, width: 100, height: 120, borderRadius: 30, backgroundColor: L.topColor, rotate: `${s * -14}deg` })} />
          <div style={box({ left: 10, top: 30, width: 86, height: 96, borderRadius: 40, backgroundColor: L.skin })} />
          <div style={box({ left: s < 0 ? 62 : 6, top: 0, width: 34, height: 70, borderRadius: 17, backgroundColor: L.skin, boxShadow: `inset 0 -6px 0 ${L.skinShade}` })} />
        </div>
      ))}
    </>
  );
};

// Крупный план рисунка в руках Айжан; zoom — к имени на двери (первый
// показ) или мягкое выделение нарисованной мамы во главе стола (второй).
const DrawingClose: React.FC<{ f: number; zoomName: number; frame: number; a: number; leader?: number }> = ({ f, zoomName, frame, a, leader = 0 }) => {
  const r = usePanel();
  const w = 820;
  const x = (r.w - w) / 2;
  const h = (w * DRAWING_H) / DRAWING_W;
  const y = (r.h - h) / 2 - 20;
  // точка имени на двери в координатах карточки
  const nx = x + (536 / DRAWING_W) * w;
  const ny = y + (160 / DRAWING_H) * h;
  const z = 1 + 0.75 * zoomName;
  const breathe = Math.sin(f / 40) * 2;
  return (
    <div style={box({ inset: 0, opacity: a, background: "radial-gradient(circle at 50% 40%, #6B4E3D, #2B2233 75%)", overflow: "hidden" })}>
      <div style={box({ inset: 0, transformOrigin: `${nx}px ${ny}px`, scale: `${z}`, translate: `${(r.w / 2 - nx) * zoomName * 0.9}px ${(r.h / 2 - ny) * zoomName * 0.6 + breathe}px` })}>
        <ChildDrawing width={w} style={{ position: "absolute", left: x, top: y, rotate: "-1.5deg" }} />
        {/* тонкая рамка вокруг имени и короткая стрелка */}
        <div style={box({ left: nx - 70, top: ny - 34, width: 140, height: 62, borderRadius: 14, border: `3px solid ${C.yellow}`, opacity: frame, scale: `${1.15 - 0.15 * frame}` })} />
        <svg width={120} height={90} style={box({ left: nx - 190, top: ny + 20, opacity: frame })}>
          <path d="M 10 80 Q 50 70 96 20" stroke={C.yellow} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 76 18 L 98 16 L 96 38" stroke={C.yellow} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* второй показ: нарисованная мама во главе стола — тёплый свет */}
        <div style={box({ left: x + (280 / DRAWING_W) * w - 130, top: y + (205 / DRAWING_H) * h - 150, width: 260, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,211,61,0.38), rgba(255,211,61,0) 70%)", opacity: leader })} />
        <HoldingHands w={w} x={x} y={y + h - 110} />
      </div>
    </div>
  );
};

export const DrawingScene: React.FC = () => {
  const { f, from, to } = useScene("drawing");
  const d02 = from("d02");
  const m05 = from("m05");
  const reach = 50; // дочка протягивает лист
  const take = 78; // мама держит лист, дочка отпускает
  // планы (склейки)
  const close1 = take + 12;
  const two = d02 - 8;
  const momClose = m05 - 6;
  const close2 = to("m05") + 40;
  const final = close2 + 66;
  const shot = f < close1 ? "wide" : f < two ? "close1" : f < momClose ? "two" : f < close2 ? "mom" : f < final ? "close2" : "final";
  // дочка входит слева с листом у груди и останавливается рядом с мамой
  const girlPlace = (tt: number): Place => placeAt(keys(tt, [[0, 260], [2, 260], [46, 862]], (x) => cruise(x, 0.25)), 1620, H.girl);
  const G = girlPlace(1000);
  const chest = (tt: number): Vec => ({ x: girlPlace(tt).x + 0.1 * G.h, y: 1620 - 0.52 * G.h });
  const handOff: Vec = { x: 952, y: 1222 };
  const momHold: Vec = { x: EVE_MOM.x - 6, y: 1196 };
  const onTableSpot: Vec = { x: 1080, y: HOME.table.top - 4 };
  const lay = final + 8; // кладёт лист на стол
  const paperAt = (tt: number): Vec =>
    tt < reach ? chest(tt) : tt < take ? keysV(tt, [[reach, chest(reach)], [take - 10, handOff]], anticipate) : tt < lay ? keysV(tt, [[take, handOff], [take + 12, momHold]], easeInOut) : keysV(tt, [[lay, momHold], [lay + 16, onTableSpot]], easeInOut);
  const girlPose = (tt: number): PoseIn => {
    const p = paperAt(tt);
    const holding = tt < take + 2;
    const point = tt > d02 + 2 && tt < d02 + 40; // «Сенин жаңы жумушуңа» — на рисунок
    const clasp = tt >= d02 + 44 && tt < to("d02") + 30; // «Сен жетекчи болосуң да?»
    const girl = girlPlace(tt);
    return {
      expr: tt < d02 - 6 ? "smile" : tt < to("d02") + 20 ? "softSmile" : "smile",
      // держит лист за верхние углы (показывает рисунок маме)
      armL: holding
        ? { target: { x: p.x - 80, y: p.y + 40 }, shape: "pinch", elbow: "hang", behind: false }
        : clasp
          ? { target: { x: girl.x + 0.03 * girl.h, y: 1620 - 0.6 * girl.h }, shape: "relax", elbow: "down", behind: false }
          : { target: null, shape: "relax" },
      armR: holding
        ? { target: { x: p.x + 80, y: p.y + 40 }, shape: "pinch", elbow: "hang", behind: false }
        : point
          ? { target: keysV(tt, [[d02 + 2, { x: girl.x + 0.2 * girl.h, y: 1620 - 0.5 * girl.h }], [d02 + 12, { x: momHold.x - 96, y: momHold.y - 20 }]], anticipate), shape: "point", elbow: "down", behind: false }
          : clasp
            ? { target: { x: girl.x + 0.1 * girl.h, y: 1620 - 0.6 * girl.h }, shape: "relax", elbow: "down", behind: false }
            : { target: null, shape: "relax" },
      lookY: keys(tt, [[reach, 0], [reach + 10, 0.25], [take + 10, 0.25], [take + 20, 0.05]]),
      nod: keys(tt, [[to("d02") - 10, 0], [to("d02") - 2, 4], [to("d02") + 8, 0]]),
      headTilt: keys(tt, [[d02 + 40, 0], [d02 + 54, -6], [to("d02") + 30, -6], [to("d02") + 50, 0], [lay + 10, 0], [lay + 26, 6]]),
      lean: keys(tt, [[lay + 8, 0], [lay + 26, 6]]),
    };
  };
  const girlFace = () => 0.65;
  const momFace = (tt: number) => keys(tt, [[0, 0.3], [24, 0.3], [40, -0.7], [take + 14, -0.45], [d02 - 10, -0.45], [d02, -0.75], [m05 + 30, -0.75], [m05 + 50, -0.55]]);
  const momPose = (tt: number): PoseIn => {
    const p = paperAt(tt);
    const reaching = tt > take - 20 && tt < lay + 16;
    const has = tt >= take - 8;
    const girl = girlPlace(tt);
    const hug = tt > lay + 12;
    return {
      expr: tt < take ? "softSmile" : tt < d02 + 50 ? "calm" : tt < m05 - 4 ? "thinking" : tt < m05 + 6 ? "calm" : "smile",
      sit: 1,
      seat: seatOf(EVE_MOM),
      // берёт лист за верхние углы, держит перед собой
      armL: hug
        ? { target: keysV(tt, [[lay + 12, { x: EVE_MOM.x - 90, y: 1260 }], [lay + 30, { x: girl.x + 0.14 * girl.h, y: 1620 - 0.7 * girl.h }]], anticipate), shape: "open", elbow: "down", behind: false }
        : reaching
          ? { target: { x: p.x - 82, y: p.y + (tt < take + 12 ? -26 : 10) }, shape: has ? "pinch" : "open", elbow: "hang", behind: false }
          : { target: onTable(EVE_MOM.x - 0.05 * EVE_MOM.h, -4), shape: "relax", elbow: "hang", behind: false },
      armR: reaching
        ? { target: { x: p.x + 82, y: p.y + (tt < take + 12 ? -26 : 10) }, shape: has ? "pinch" : "open", elbow: "hang", behind: false }
        : { target: onTable(EVE_MOM.x + 0.05 * EVE_MOM.h, -4), shape: "relax", elbow: "hang", behind: false },
      lookY: keys(tt, [[take, 0.1], [take + 14, 0.45], [d02 - 10, 0.45], [d02, 0.05], [m05 + 30, 0.05], [lay, 0.05], [lay + 8, 0.35], [lay + 20, 0.05]]),
      lookX: keys(tt, [[d02 + 50, 0], [d02 + 62, 0.35], [m05 - 10, 0.35], [m05, 0]]),
      nod: keys(tt, [[m05 - 2, 0], [m05 + 8, 5], [m05 + 22, 0]]),
      headTilt: keys(tt, [[m05 + 20, 0], [m05 + 40, 4]]),
      lean: keys(tt, [[lay + 10, 0], [lay + 30, -4]]),
    };
  };
  const dad = seated("dad", 1250);
  const dadPose = (tt: number): PoseIn => ({
    expr: tt < m05 ? "softSmile" : "smile",
    sit: 1,
    seat: seatOf(dad),
    armL: { target: onTable(dad.x - 0.04 * dad.h, -4), shape: "relax", elbow: "hang" },
    armR: { target: onTable(dad.x + 0.06 * dad.h, -4), shape: "relax", elbow: "hang" },
    lookY: 0.15,
    nod: keys(tt, [[m05 + 10, 0], [m05 + 18, 3], [m05 + 30, 0]]),
  });
  const dadFace = (tt: number) => keys(tt, [[0, -0.55], [m05 - 10, -0.55], [m05, -0.7]]);
  const cams = {
    wide: { x: 880, y: 1110, zoom: 1.0 },
    two: { x: 915, y: 1090, zoom: keys(f, [[two, 1.4], [momClose, 1.46]]) },
    mom: { x: 1000, y: 1020, zoom: keys(f, [[momClose, 1.9], [close2, 2.0]]) },
    final: { x: 990, y: 1110, zoom: keys(f, [[final, 1.2], [final + 90, 1.26]]) },
  } as const;
  const nameZoom = keys(f, [[close1 + 6, 0], [close1 + 34, 1]], easeInOut);
  const nameFrame = easeOut((f - (close1 + 30)) / 8);
  const leader = easeOut((f - close2 - 8) / 14);
  const paper = paperAt(f);
  const paperRot = f < take ? 4 : f < lay ? keys(f, [[take, 4], [take + 12, -4]]) : keys(f, [[lay, -4], [lay + 16, 0]]);
  const stage = shot === "wide" || shot === "two" || shot === "mom" || shot === "final";
  return (
    <PanelArea>
      {stage ? (
        <Stage cam={cams[shot as "wide" | "two" | "mom" | "final"]} bg="#2B2233">
          <HomeBack minutes={20 * 60 + 40} evening={1} f={f} doorOpen={keys(f, [[0, 1], [40, 1], [60, 0]])} />
          <WarmLamp />
          <ChairBack x={EVE_MOM.x} evening={1} />
          <ChairBack x={dad.x} evening={1} />
          <Actor uid="s9-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} seed={2} />
          <Actor uid="s9-mom" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="body" />
          <TableFront evening={1} />
          <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={0.15} glow={0} />
          <Actor uid="s9-girl" look="girlHome" f={f} place={girlPlace} face={girlFace} pose={girlPose} role="daughter" seed={5} walkFrom={0} layer="body" />
          {f >= lay + 16 ? (
            <ChildDrawing width={PAPER_W} style={{ position: "absolute", left: onTableSpot.x - PAPER_W / 2, top: onTableSpot.y - PAPER_H, transformOrigin: "50% 100%", rotate: "-6deg" }} shadow />
          ) : (
            <PaperBack at={paper} rot={paperRot} />
          )}
          <Actor uid="s9-girl-a" look="girlHome" f={f} place={girlPlace} face={girlFace} pose={girlPose} role="daughter" seed={5} walkFrom={0} layer="arms" />
          <Actor uid="s9-mom-a" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="arms" />
        </Stage>
      ) : (
        <DrawingClose f={f} zoomName={shot === "close1" ? nameZoom : 0.15 * easeInOut((f - close2) / 60)} frame={shot === "close1" ? nameFrame : 0} a={1} leader={shot === "close2" ? leader : 0} />
      )}
    </PanelArea>
  );
};
