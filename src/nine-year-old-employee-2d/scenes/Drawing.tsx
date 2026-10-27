// Сцена 12. Бейдж и рисунок — перед сном, тёплый свет.
// A. Бектур у своего домашнего стола, в той же рубашке, бейдж на ней.
//    Кисть подходит к клипсе, бейдж отделяется от рубашки; он поднимает
//    руку и вешает бейдж за клипсу на крючок над столом. Рисунок уже лежит
//    на столе — он придвигает лист к стене, под бейдж.
// B. План меняется с рук на рисунок: сначала узнаём корабль и жёлтый
//    флажок, затем камера смещается к маленькому Бектуру на носу (он
//    нарисован заранее, не появляется). Бейдж «Бектур / Жардамчы» и рисунок
//    видны вместе; 1,5–2 с после речи — без надписей поверх рисунка.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, keysV, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { BadgeArt } from "../props/Badge";
import { SHIP, ShipDrawn } from "../props/Ship";
import { ROOM, RoomBack, RoomDesk } from "../sets/Kitchen";

export const drawingPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "drawing");
  const unclip: [number, number] = [T.word("N08", "бейджин") - 10, T.word("N08", "бейджин") + 10];
  const hang: [number, number] = [unclip[1] + 6, Math.max(unclip[1] + 30, T.word("N08", "илип") + 4)];
  const slide: [number, number] = [Math.max(hang[1] + 12, T.word("N08", "Жанына") - 4), Math.max(hang[1] + 40, T.word("N08", "Жанына") + 26)];
  const close = Math.max(slide[1] + 10, T.word("N08", "Кеменин") - 4);
  const pan = Math.max(close + 30, T.word("N08", "тумшугуна") - 6);
  return { unclip, hang, slide, close, pan, len: T.len };
};
type P = ReturnType<typeof drawingPlan>;

// Окно детской в кадре плана A — в него раскрылся экран телефона.
export const ROOM_WINDOW = { x: 330, y: 470, w: 360, h: 460 } as const;
// Флажок рисунка в последнем кадре (из него растёт жёлтый финал).
export const FLAG_FINAL = { x: 635, y: 695 } as const;

const BOY: Place = { x: 380, y: ROOM.floorY, h: 600 };
const HOOK = ROOM.hook;
// Рисунок на столе (вид спереди, сильно сжат) и у стены (почти фронтально).
const DRAW_W = 300;
const DrawingOnDesk: React.FC<{ u: number }> = ({ u }) => {
  // u: 0 — лежит у края стола, 1 — придвинут к стене под бейдж и чуть приподнят
  const x = lerp(700, HOOK.x, u);
  const y = lerp(ROOM.deskTop + 6, ROOM.deskTop - 4, u);
  const sy = lerp(0.24, 0.62, u);
  return (
    <Svg>
      <g transform={`translate(${x} ${y - (DRAW_W * 0.72 * sy) / 2}) scale(1 ${sy})`}>
        <rect x={-DRAW_W / 2} y={-DRAW_W * 0.36} width={DRAW_W} height={DRAW_W * 0.72} fill="#FFFFFF" stroke="#D9D3C6" strokeWidth={3} />
        <g transform={`scale(${DRAW_W / 1300}) translate(0 ${DRAW_W * 0.2 * (1300 / DRAW_W)})`}>
          <ShipDrawn />
        </g>
      </g>
    </Svg>
  );
};

const Room: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const hanging = f >= p.hang[1];
  const slideU = easeInOut(clamp((f - p.slide[0]) / (p.slide[1] - p.slide[0])));
  const pose = (tt: number) => {
    // клипса бейджа на груди (у зрителя справа от центра груди)
    const chest = { x: BOY.x + 0.06 * BOY.h, y: BOY.y - 0.6 * BOY.h };
    const rest = { x: BOY.x + 0.12 * BOY.h, y: BOY.y - 0.42 * BOY.h };
    const hook = { x: HOOK.x - 6, y: HOOK.y + 30 };
    const deskHand = { x: lerp(700, HOOK.x, easeInOut(clamp((tt - p.slide[0]) / (p.slide[1] - p.slide[0])))) - 60, y: ROOM.deskTop - 6 };
    const deskStart = { x: 640, y: ROOM.deskTop - 6 };
    const armR =
      tt < p.slide[0] - 10
        ? keysV(tt, [[p.unclip[0] - 12, rest], [p.unclip[0], chest], [p.unclip[1], chest], [p.hang[0] + 12, hook], [p.hang[1], hook], [p.hang[1] + 12, rest]], anticipate)
        : tt < p.slide[0]
          ? keysV(tt, [[p.slide[0] - 10, rest], [p.slide[0], deskStart]], anticipate)
          : tt < p.slide[1]
            ? deskHand
            : keysV(tt, [[p.slide[1], deskHand], [p.slide[1] + 14, rest]], anticipate);
    const carrying = tt >= p.unclip[1] - 4 && tt < p.hang[1];
    return {
      badge: tt < p.unclip[1] - 4 ? 1 : 0,
      expr: tt < p.slide[1] ? ("calm" as const) : ("softSmile" as const),
      lookY: tt < p.unclip[1] ? 0.6 : tt < p.hang[1] ? -0.6 : 0.5,
      lookX: tt < p.unclip[1] ? -0.1 : 0.3,
      nod: tt < p.unclip[1] ? 10 : 0,
      armR: { target: armR, shape: carrying ? ("pinch" as const) : tt >= p.slide[0] - 2 && tt < p.slide[1] + 2 ? ("open" as const) : ("relax" as const), item: carrying ? ("badge" as const) : ("none" as const), elbow: carrying && tt > p.hang[0] ? ("out" as const) : ("down" as const), behind: false },
      armL: { target: tt >= p.unclip[0] - 4 && tt < p.unclip[1] + 2 ? { x: BOY.x + 0.02 * BOY.h, y: BOY.y - 0.56 * BOY.h } : null, shape: "relax" as const, elbow: "down" as const },
    };
  };
  const face = (tt: number) => (tt < p.unclip[1] ? 0.15 : 0.6);
  const cam = { x: lerp(600, 620, clamp(f / p.close)), y: 1060, zoom: lerp(1.75, 1.82, clamp(f / p.close)) };
  return (
    <Shot f={f} cam={cam} bg="#F6E2BE">
      <RoomBack />
      {hanging ? (
        <Svg>
          <g transform={`translate(${HOOK.x} ${HOOK.y + 70})`}>
            <BadgeArt w={110} detail={false} />
          </g>
        </Svg>
      ) : null}
      <Actor uid="d12-boy" look="bektur" f={f} place={() => BOY} face={face} pose={pose} seed={4} blinkShift={37} />
      <RoomDesk />
      <DrawingOnDesk u={slideU} />
      {/* тёплый вечерний свет */}
      <div style={box({ left: -400, top: -400, width: 2000, height: 3000, backgroundColor: "#FFB547", opacity: 0.1 })} />
    </Shot>
  );
};

// ---------- B. Рисунок и бейдж крупно ----------
const Close: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.pan) / 50));
  // мир плана: бейдж на доске вверху, рисунок под ним
  const DW = 900;
  const dX = 540;
  const dY = 1140;
  const sc = DW / 1300;
  const bowX = dX + SHIP.bow.x * sc;
  const bowY = dY + 180 + SHIP.bow.y * sc - 120;
  const cam = { x: lerp(540, lerp(540, bowX, 0.3), k), y: lerp(960, lerp(960, bowY, 0.15), k), zoom: lerp(1.0, 1.12, k) };
  return (
    <AbsoluteFill>
      <Shot f={f} cam={cam} bg="#C9A574">
        <div style={box({ left: -300, top: -300, width: 1700, height: 2600, backgroundColor: "#C9A574" })} />
        <div style={box({ left: -300, top: -300, width: 1700, height: 2600, backgroundImage: "radial-gradient(circle, rgba(90,60,30,0.18) 2px, transparent 3px)", backgroundSize: "26px 26px" })} />
        <Svg>
          {/* крючок и бейдж */}
          <rect x={530} y={380} width={20} height={44} rx={8} fill="#8A919C" />
          <g transform="translate(540 560) rotate(-2)">
            <BadgeArt w={330} />
          </g>
          {/* рисунок */}
          <g transform={`translate(${dX} ${dY}) rotate(1.5)`}>
            <rect x={-DW / 2} y={-DW * 0.36} width={DW} height={DW * 0.72} fill="#FFFFFF" stroke="#D9D3C6" strokeWidth={4} />
            <g transform={`scale(${sc}) translate(0 ${180 / sc})`}>
              <ShipDrawn />
            </g>
          </g>
        </Svg>
        <div style={box({ left: -300, top: -300, width: 1700, height: 2600, backgroundColor: "#FFB547", opacity: 0.08 })} />
      </Shot>
    </AbsoluteFill>
  );
};

export const DrawingScene: React.FC = () => {
  const { f } = useScene("drawing");
  const p = usePlan(drawingPlan);
  return f < p.close ? <Room f={f} p={p} /> : <Close f={f} p={p} />;
};

