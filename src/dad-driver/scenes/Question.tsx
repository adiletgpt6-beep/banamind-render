// Сцена 9. Сын соединяет два образа папы (VO11 сын, VO12 папа).
// У стола папы в кабинете: сын переводит взгляд с монитора на папу и
// спрашивает; естественная пауза; папа спокойно смотрит на сына, кивает и
// отвечает. После вопроса тихо появляется связка «МЕКТЕП → ҮЙ → ЖУМУШ» и
// мягко исчезает после ответа. В конце — понимание на лице сына
// (задумчивость → мягкая улыбка, кивок). Без чувства вины и «ловушки».
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame } from "../context";
import { RouteChips, Vignette } from "../kit";
import { Actor } from "../rig/Actor";
import { easeInOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { MonitorScreen, OFFICE, OfficeDesk, OfficeRoom } from "../sets/Office";
import { Conveyor } from "../props/Conveyor";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import { H } from "./common";
import { COLLEAGUE, DAD_AT_DESK } from "./Office";

export const QuestionScene: React.FC = () => {
  const t = useSceneFrame();
  const q = useCue("vo11");
  const a = useCue("vo12");
  const turn = q.from - 10; // взгляд на папу до вопроса
  const think = a.to + 4;
  const son = { x: 900, y: OFFICE.feetY, h: H.son };
  const dad = DAD_AT_DESK;
  const sonPose = (f: number) => ({
    expr: f < think ? mixExpr(EXPR.calm, EXPR.thinking, easeInOut((f - (q.to - 10)) / 20) * 0.6) : mixExpr(EXPR.thinking, EXPR.softSmile, easeInOut((f - think) / 18)),
    lookY: keys(f, [[turn, 0.1], [turn + 8, -0.75], [think, -0.75], [think + 10, -0.2], [think + 26, -0.6]]),
    lookX: keys(f, [[turn, -0.4], [turn + 8, 0.35]]),
    headTilt: keys(f, [[q.to, 0], [q.to + 12, 5], [think + 10, 2]]),
    nod: keys(f, [[think + 20, 0], [think + 28, 5], [think + 38, 0]]),
    armL: { target: null, shape: "relax" as const },
    armR: { target: null, shape: "relax" as const },
  });
  const sonFace = (f: number) => keys(f, [[turn - 6, -0.35], [turn + 6, 0.62]]);
  const dadPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.softSmile, easeInOut((f - a.from) / 14)),
    lookY: keys(f, [[q.from, 0.1], [q.from + 12, 0.6]]),
    lookX: -0.2,
    nod: keys(f, [[a.from - 8, 0], [a.from, 6], [a.from + 10, 0]]),
    headTilt: -3,
    armL: { target: { x: OFFICE.desk.x + OFFICE.desk.w - 30, y: OFFICE.desk.top - 20 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: null, shape: "relax" as const },
  });
  const dadFace = (f: number) => keys(f, [[q.from - 4, -0.2], [q.from + 8, -0.62]]);
  const cam = { x: 1010, y: 1020, zoom: lerp(1.75, 1.84, easeInOut(t / 240)) };
  return (
    <AbsoluteFill style={{ backgroundColor: "#E3E9EC" }}>
      <Shot f={t} from={-30} to={99999} cam={cam} bg="#E3E9EC">
        <div style={{ position: "absolute", left: 0, top: 0, filter: "blur(2px)" }}>
          <OfficeRoom t={t} />
          <OfficeDesk x={OFFICE.desk2.x} w={OFFICE.desk2.w} top={OFFICE.desk2.top} />
          <Actor uid="q-col" look="colleague" f={t} place={() => COLLEAGUE} face={() => -0.1} pose={() => ({ expr: EXPR.calm, lookY: 0.4 })} seed={74} />
        </div>
        <OfficeDesk x={OFFICE.desk.x} w={OFFICE.desk.w} top={OFFICE.desk.top}>
          <div style={{ position: "absolute", left: OFFICE.desk.x + 30, top: OFFICE.desk.top - 30 }}>
            <Conveyor mode="model" scale={0.16} t={t} />
          </div>
        </OfficeDesk>
        <MonitorScreen x={OFFICE.monitor.x} y={OFFICE.monitor.y} w={OFFICE.monitor.w} h={OFFICE.monitor.h} t={t} mode="blueprint" />
        <Actor uid="q-dad" look="dad" f={t} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={75} />
        <Actor uid="q-son" look="son" f={t} place={() => son} face={sonFace} pose={sonPose} role="son" seed={76} />
        <Vignette strength={0.22} />
      </Shot>
      <RouteChips t={t} at={q.to + 6} items={DD_TEXT.question.route} y={330} size={50} out={a.to + 12} />
    </AbsoluteFill>
  );
};
