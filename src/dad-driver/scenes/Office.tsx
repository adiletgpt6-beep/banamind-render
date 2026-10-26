// Сцена 8. Посещение офиса (VO10).
// Вход через ту же конструкцию: кадр начинается на экране монитора папы
// (тот же роликовый конвейер), камера отъезжает — кабинет инженеров в
// выходной. «ДЕМ АЛЫШ КҮНҮ». Папа с сыном входят, коллега у своего стола
// оборачивается и приветливо машет. Средний план: папа показывает рабочее
// место и монитор, сын рассматривает экран, подаётся вперёд. «Кесиптеши
// менен тааныштырды» — папа открытой ладонью показывает на коллегу, она
// улыбается, кивает и показывает на мониторе новый проект: «ЖАҢЫ ДОЛБООР».
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame, wordAt } from "../context";
import { C, Chip, Vignette } from "../kit";
import { Conveyor } from "../props/Conveyor";
import { Actor } from "../rig/Actor";
import { cruise, easeInOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { MonitorScreen, OFFICE, OfficeDesk, OfficeRoom } from "../sets/Office";
import { Shot, type Cam } from "../shots";
import { DD_TEXT } from "../script";
import { H } from "./common";

const T = DD_TEXT.office;

// Позиции у стола папы (используются и в сцене 9).
export const DAD_AT_DESK = { x: 1150, y: OFFICE.feetY, h: H.dad } as const;
export const SON_AT_DESK = { x: 740, y: OFFICE.feetY, h: H.son } as const;
export const COLLEAGUE = { x: 1700, y: OFFICE.feetY, h: H.colleague } as const;

const useBeats = () => {
  const cue = useCue("vo10");
  const w = (i: number) => wordAt(cue, i);
  return {
    cue,
    weekend: w(0) - 2,
    walk0: 4,
    walk1: w(6) + 6, // дошли до стола к «барды»
    wave: w(3), // коллега машет
    cutB: w(7) - 6, // «Иштеген жерин көрсөтүп»
    show: w(7),
    cutC: w(15) - 10, // «кесиптеши менен тааныштырды»
    intro: w(15),
    project: w(11), // «жаңы долбоорду»
  };
};

export const OfficeScene: React.FC = () => {
  const t = useSceneFrame();
  const b = useBeats();
  return (
    <AbsoluteFill style={{ backgroundColor: "#E3E9EC" }}>
      <OfficeWorld t={t} b={b} />
      <Chip x={540} y={330} t={t} at={b.weekend} out={b.cutB - 4} accent={C.yellow} size={60}>
        <span>{T.weekend}</span>
      </Chip>
      {t >= b.cutC ? (
        <Chip x={600} y={600} t={t} at={b.intro + 4} accent={C.cyan} size={52}>
          <span style={{ color: C.cyan }}>{T.project}</span>
        </Chip>
      ) : null}
    </AbsoluteFill>
  );
};

type Beats = ReturnType<typeof useBeats>;

const dadPlace = (b: Beats) => (t: number) => {
  const u = cruise((t - b.walk0) / Math.max(20, b.walk1 - b.walk0));
  return { x: lerp(160, DAD_AT_DESK.x, u), y: OFFICE.feetY, h: H.dad };
};
const sonPlace = (b: Beats) => (t: number) => {
  const u = cruise((t - b.walk0 - 6) / Math.max(20, b.walk1 - b.walk0 - 4));
  return { x: lerp(60, SON_AT_DESK.x, u), y: OFFICE.feetY, h: H.son };
};

// Камера: экран монитора → общий план → средний у стола → к коллеге.
const camAt = (t: number, b: Beats): Cam => {
  const screen = { x: OFFICE.monitor.x + OFFICE.monitor.w / 2, y: OFFICE.monitor.y + OFFICE.monitor.h / 2, zoom: 5.2 };
  const wide = { x: 990, y: 1110, zoom: 0.66 };
  const mid = { x: 960, y: 1060, zoom: 1.45 };
  const colleague = { x: 1400, y: 1060, zoom: 1.3 };
  const mix = (a: Cam, c: Cam, u: number): Cam => ({ x: lerp(a.x, c.x, u), y: lerp(a.y, c.y, u), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(c.zoom), u)) });
  if (t < b.cutB) return mix(screen, wide, easeInOut((t + 6) / 34));
  if (t < b.cutC) return mix(mid, { ...mid, zoom: 1.52 }, easeInOut((t - b.cutB) / 80));
  return mix(mid, colleague, easeInOut((t - b.cutC) / 18));
};

const OfficeWorld: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const dp = dadPlace(b);
  const sp = sonPlace(b);
  const dadFace = (f: number) => (f < b.walk1 ? 0.6 : f < b.cutC ? keys(f, [[b.walk1, -0.3], [b.show, -0.45]]) : keys(f, [[b.cutC, -0.45], [b.intro - 4, 0.55]]));
  const dadPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.smile, f > b.walk1 ? 0.6 : 0.3),
    lookY: f > b.show && f < b.cutC ? 0.1 : 0,
    armL:
      f > b.show && f < b.cutC
        ? { target: { x: OFFICE.monitor.x + OFFICE.monitor.w + 8, y: OFFICE.monitor.y + OFFICE.monitor.h * 0.6 }, shape: "point" as const, elbow: "down" as const }
        : { target: null, shape: "relax" as const },
    armR:
      f > b.intro - 6
        ? { target: { x: DAD_AT_DESK.x + 220, y: 1120 }, shape: "open" as const, elbow: "down" as const }
        : f < b.walk1
          ? { target: { x: dp(f).x + 70, y: 1150 }, shape: "relax" as const, elbow: "down" as const } // ведёт сына
          : { target: null, shape: "relax" as const },
  });
  const sonFace = (f: number) => (f < b.walk1 ? 0.6 : keys(f, [[b.walk1, 0.3], [b.show + 10, 0.35], [b.show + 40, 0.6], [b.show + 52, 0.3], [b.cutC + 6, 0.5]]));
  const sonPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.softSmile, 0.6),
    lean: keys(f, [[b.show, 0], [b.show + 16, 8], [b.cutC, 8], [b.cutC + 12, 2]]),
    lookY: keys(f, [[b.show, 0], [b.show + 10, -0.3]]),
    lookX: keys(f, [[b.show + 38, 0.2], [b.show + 46, 0.7], [b.show + 60, 0.2]]),
    armL: { target: null, shape: "relax" as const },
    armR: { target: null, shape: "relax" as const },
  });
  const colPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.smile, keys(f, [[b.wave - 6, 0], [b.wave + 6, 1]])),
    armR: {
      target: keys(f, [[b.wave - 4, 0], [b.wave + 4, 1], [b.wave + 30, 1], [b.wave + 40, 0]]) > 0.5 ? { x: COLLEAGUE.x + 110, y: 870 + Math.sin(f / 3) * 14 } : { x: OFFICE.monitor2.x + OFFICE.monitor2.w + 6, y: OFFICE.monitor2.y + 90 },
      shape: keys(f, [[b.wave - 4, 0], [b.wave + 4, 1], [b.wave + 30, 1], [b.wave + 40, 0]]) > 0.5 ? ("wave" as const) : ("point" as const),
      elbow: "out" as const,
    },
    armL: { target: null, shape: "relax" as const },
    nod: keys(f, [[b.intro + 4, 0], [b.intro + 12, 5], [b.intro + 22, 0]]),
  });
  const colFace = (f: number) => keys(f, [[b.wave - 10, 0.2], [b.wave - 2, -0.55], [b.intro + 30, -0.55], [b.intro + 44, -0.2]]);
  return (
    <Shot f={t} from={-30} to={99999} cam={camAt(t, b)} bg="#E3E9EC">
      <OfficeRoom t={t} doorOpen={keys(t, [[0, 0.9], [30, 0.9], [60, 0]])} glow2={easeInOut((t - b.intro) / 12)} />
      <OfficeDesk x={OFFICE.desk2.x} w={OFFICE.desk2.w} top={OFFICE.desk2.top} />
      <OfficeDesk x={OFFICE.desk.x} w={OFFICE.desk.w} top={OFFICE.desk.top}>
        <div style={{ position: "absolute", left: OFFICE.desk.x + 30, top: OFFICE.desk.top - 30 }}>
          <Conveyor mode="model" scale={0.16} t={t} />
        </div>
        <div style={{ position: "absolute", left: OFFICE.desk.x + 300, top: OFFICE.desk.top - 34, width: 110, height: 10, borderRadius: 2, backgroundColor: "#DCEBF3", transform: "skewX(-30deg)" }} />
      </OfficeDesk>
      <MonitorScreen x={OFFICE.monitor.x} y={OFFICE.monitor.y} w={OFFICE.monitor.w} h={OFFICE.monitor.h} t={t} mode="blueprint" />
      <Actor uid="of-col" look="colleague" f={t} place={() => COLLEAGUE} face={colFace} pose={colPose} seed={71} />
      <Actor uid="of-dad" look="dad" f={t} place={dp} face={dadFace} pose={dadPose} seed={72} walkFrom={0} />
      <Actor uid="of-son" look="son" f={t} place={sp} face={sonFace} pose={sonPose} seed={73} walkFrom={0} />
      <Vignette strength={0.2} />
    </Shot>
  );
};
