// Сцена 9. «Сүрөт» (вечер третьего дня). Дочка входит с рисунком
// (бумага прижата к груди), протягивает его маме; Айжан берёт тот же лист.
// Крупно: большой стол, люди, имя «Айжан» на нарисованной двери (тонкая
// рамка и стрелка). «Муну кайда коёбуз?» — «Сенин жаңы жумушуңа. Сен
// жетекчи болосуң да?» — короткая пауза — «Абдан каалайм.» Затем время на
// взгляд на рисунок и на дочку. Темп спокойнее, ведущая меньше, крупных
// титров на бумаге нет. Рисунок — единый ассет ChildDrawing.
import { ChildDrawing, DRAWING_H, DRAWING_W } from "../graphics/Drawing";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { ChairBack, HOME, HomeBack, LaptopSide, TableFront, WarmLamp } from "../sets/Home";
import { box as wbox } from "../shots";
import { C } from "../theme";
import { H, onTable, placeAt, seated, seatOf } from "./common";
import { EVE_MOM } from "./Evening";
import { box, crossfade, PanelArea, Stage, usePanel, useScene } from "./kit";

export const PAPER_BACK = "#F3EEDF";

// Лист в мире (обратная сторона к зрителю, пока рисунок смотрит мама).
const PaperBack: React.FC<{ at: Vec; rot: number; w?: number }> = ({ at, rot, w = 170 }) => (
  <div style={wbox({ left: at.x - w / 2, top: at.y - (w * DRAWING_H) / DRAWING_W / 2, width: w, height: (w * DRAWING_H) / DRAWING_W, backgroundColor: PAPER_BACK, borderRadius: 4, rotate: `${rot}deg`, boxShadow: "0 6px 12px rgba(40,25,10,0.25)" })}>
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

// Крупный план рисунка в руках Айжан; zoom — к имени на двери.
const DrawingClose: React.FC<{ f: number; zoomName: number; frame: number; a: number }> = ({ f, zoomName, frame, a }) => {
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
        <HoldingHands w={w} x={x} y={y + h - 110} />
      </div>
    </div>
  );
};

export const DrawingScene: React.FC = () => {
  const { f, from, to } = useScene("drawing");
  const m04 = from("m04");
  const d02 = from("d02");
  const m05 = from("m05");
  const reach = 62; // дочка протягивает лист
  const take = 84; // лист у мамы
  const closeA = crossfade(f, take + 14, 8) * (1 - crossfade(f, d02 - 8, 8));
  const close2 = crossfade(f, to("m05") + 18, 10) * (1 - crossfade(f, to("m05") + 90, 10));
  const showClose = Math.max(closeA, close2);
  // дочка входит слева с листом у груди и останавливается рядом с мамой
  const girlPlace = (tt: number): Place => {
    const u = cruise((tt - 2) / 52, 0.25);
    return placeAt(lerp(260, 820, u), 1620, H.girl);
  };
  const G = (tt: number) => girlPlace(tt);
  const chest = (tt: number): Vec => ({ x: G(tt).x + 0.06 * G(tt).h, y: G(tt).y - 0.6 * G(tt).h });
  const handOff: Vec = { x: 905, y: 1170 };
  const momHold: Vec = { x: EVE_MOM.x - 10, y: 1190 };
  const paperAt = (tt: number): Vec =>
    tt < reach - 6 ? chest(tt) : tt < take ? keysV(tt, [[reach - 6, chest(reach - 6)], [take - 6, handOff]], anticipate) : keysV(tt, [[take, handOff], [take + 14, momHold]], easeInOut);
  const girlPose = (tt: number): PoseIn => {
    const p = paperAt(tt);
    const holding = tt < take + 2;
    return {
      expr: tt < d02 - 6 ? "smile" : "softSmile",
      armL: holding ? { target: { x: p.x - 70, y: p.y + 10 }, shape: "pinch", elbow: "down", behind: false } : { target: null, shape: "relax" },
      armR: holding ? { target: { x: p.x + 70, y: p.y + 10 }, shape: "pinch", elbow: "down", behind: false } : { target: tt > to("d02") ? null : null, shape: "relax" },
      lookY: keys(tt, [[reach, 0], [reach + 10, 0.25], [take + 10, 0.25], [take + 20, 0.1]]),
      nod: keys(tt, [[to("d02") - 10, 0], [to("d02") - 2, 4], [to("d02") + 8, 0]]),
      headTilt: keys(tt, [[d02 + 20, 0], [d02 + 36, -5]]),
    };
  };
  const girlFace = (tt: number) => (tt < 50 ? 0.6 : 0.65);
  const momFace = (tt: number) => keys(tt, [[0, 0.3], [30, 0.3], [44, -0.7], [take + 16, -0.45], [d02 - 10, -0.45], [d02, -0.75], [m05 + 30, -0.75], [m05 + 60, -0.5]]);
  const momPose = (tt: number): PoseIn => {
    const p = paperAt(tt);
    const has = tt >= take - 2;
    const reaching = tt > take - 16;
    return {
      expr: tt < take ? "softSmile" : tt < d02 ? "calm" : tt < m05 - 10 ? "softSmile" : "smile",
      sit: 1,
      seat: seatOf(EVE_MOM),
      armL: reaching ? { target: { x: p.x - 84, y: p.y + 18 }, shape: has ? "pinch" : "open", elbow: "down", behind: false } : { target: onTable(EVE_MOM.x - 0.1 * EVE_MOM.h, -4), shape: "relax", elbow: "down", behind: false },
      armR: reaching ? { target: { x: p.x + 84, y: p.y + 18 }, shape: has ? "pinch" : "open", elbow: "down", behind: false } : { target: onTable(EVE_MOM.x + 0.1 * EVE_MOM.h, -4), shape: "relax", elbow: "down", behind: false },
      lookY: keys(tt, [[take, 0.1], [take + 14, 0.45], [d02 - 10, 0.45], [d02, 0.05], [m05 + 30, 0.05], [m05 + 50, 0.3]]),
      nod: keys(tt, [[m05 - 4, 0], [m05 + 6, 3], [m05 + 20, 0]]),
      headTilt: keys(tt, [[m05 + 20, 0], [m05 + 40, 4]]),
    };
  };
  const dad = seated("dad", 1250);
  const dadPose = (tt: number): PoseIn => ({
    expr: tt < m05 ? "softSmile" : "smile",
    sit: 1,
    seat: seatOf(dad),
    armL: { target: onTable(dad.x - 0.12 * dad.h, -4), shape: "relax", elbow: "down" },
    armR: { target: onTable(dad.x + 0.1 * dad.h, -4), shape: "relax", elbow: "down" },
    lookY: 0.15,
  });
  // камера: общий план → ближе к маме на «Абдан каалайм» → мягко назад
  const cam = {
    x: keys(f, [[0, 760], [reach, 880], [d02, 900], [m05 - 20, 960], [m05 + 30, 960], [to("m05") + 100, 900]]),
    y: keys(f, [[0, 1150], [m05 - 20, 1020], [to("m05") + 100, 1080]]),
    zoom: keys(f, [[0, 0.8], [reach, 0.92], [d02, 1.0], [m05 - 20, 1.45], [m05 + 30, 1.45], [to("m05") + 100, 1.08]], easeInOut),
  };
  const nameZoom = keys(f, [[m04 + 10, 0], [m04 + 34, 1]], easeInOut);
  const nameFrame = easeOut((f - (m04 + 30)) / 8);
  const zoom2 = keys(f, [[to("m05") + 18, 0], [to("m05") + 90, 0.25]], easeInOut);
  return (
    <PanelArea>
      <Stage cam={cam} bg="#2B2233">
        <HomeBack minutes={20 * 60 + 40} evening={1} f={f} doorOpen={clamp(1 - (f - 50) / 20)} />
        <WarmLamp />
        <ChairBack x={EVE_MOM.x} evening={1} />
        <ChairBack x={dad.x} evening={1} />
        <Actor uid="s9-dad" look="dad" f={f} place={() => dad} face={() => -0.55} pose={dadPose} seed={2} />
        <Actor uid="s9-mom" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="body" />
        <TableFront evening={1} />
        <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={0.15} glow={0} />
        <Actor uid="s9-girl" look="girlHome" f={f} place={girlPlace} face={girlFace} pose={girlPose} role="daughter" seed={5} walkFrom={0} layer="body" />
        <PaperBack at={paperAt(f)} rot={f < take ? 4 : keys(f, [[take, 4], [take + 14, -6]])} />
        <Actor uid="s9-girl-a" look="girlHome" f={f} place={girlPlace} face={girlFace} pose={girlPose} role="daughter" seed={5} walkFrom={0} layer="arms" />
        <Actor uid="s9-mom-a" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="arms" />
      </Stage>
      {showClose > 0 ? <DrawingClose f={f} zoomName={closeA > 0 ? nameZoom : zoom2} frame={closeA > 0 ? nameFrame : 0} a={showClose} /> : null}
    </PanelArea>
  );
};
