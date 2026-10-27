// Сцена 8 (102,5–111 с): вместе искать постоянное решение. Родители
// кладут рядом расписания обоих детей; папа пододвигает карточку дочери к
// карточке сына, мама сверяет время: «Кел, экөөнүн убактысын жазып, алдын
// ала арыз калтыралы.» Папа: «Маршрутубуз боюнча сүйлөшүп көрөлү.» Мама
// заполняет предварительную заявку BalaGo (условная иллюстрация, без URL)
// — «Алдын ала арыз калтырылды» для обсуждения маршрута и времени.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { CuesContext } from "../context";
import { Actor } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, easeInOut, keys, keysV } from "../rig/motion";
import { TS2_TEXT } from "../script";
import { PhoneFrame, RegForm } from "../screens";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, ShoeBench, TableFront, Teapot, WarmLamp } from "../sets/Home";
import { box, camMove, Shot } from "../shots";
import { lineFrames, onTable, seated, seatOf } from "./common";
import { EVE_TEAPOT } from "./Evening";

export const PLAN = { slide: 76, form: 160, tap: 204, sent: 210 };
const FILLS = [166, 174, 182, 190];

// Карточка расписания ребёнка (крупно).
const ScheduleCard: React.FC<{ who: string; time: string; note: string; color: string; x: number; y: number; rot: number; hi?: number }> = ({ who, time, note, color, x, y, rot, hi = 0 }) => (
  <div style={box({ left: x, top: y, width: 400, padding: "30px 32px", borderRadius: 22, backgroundColor: "#FFFDF6", rotate: `${rot}deg`, boxShadow: "0 22px 40px rgba(60,40,20,0.3)", fontFamily, color: "#1E2235", border: `6px solid ${hi > 0 ? `rgba(255,201,14,${hi})` : "transparent"}` })}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: color }} />
      <div style={{ fontSize: 50, fontWeight: 900 }}>{who}</div>
    </div>
    <div style={{ fontSize: 34, fontWeight: 700, color: "#5A6B8C", marginTop: 10 }}>{note}</div>
    <div style={{ fontSize: 96, fontWeight: 900, marginTop: 6 }}>{time}</div>
  </div>
);

export const PlanScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const m09 = lineFrames(cues, "m09", "plan");
  const f03 = lineFrames(cues, "f03", "plan");
  const mom = seated("mom", HOME.seat.mom);
  const dad = seated("dad", HOME.seat.dad);
  const cardSon = onTable(1060, 2);
  const cardGirl = (t: number) => onTable(keys(t, [[20, 1250], [50, 1140]]), 2);
  const momPose = (t: number) => ({
    expr: t < m09.to ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(mom),
    lean: 6,
    armR: { target: keysV(t, [[0, onTable(mom.x + 0.12 * mom.h, -4)], [m09.from + 6, onTable(1050, -6)], [m09.from + 30, onTable(1050, -6)], [m09.from + 44, onTable(1130, -6)]], anticipate), shape: "point" as const, elbow: "down" as const, behind: false },
    armL: { target: onTable(mom.x - 0.12 * mom.h, -4), shape: "fist" as const, item: "phone" as const, flat: 0.8, glow: 1, elbow: "down" as const },
    lookY: 0.45,
    nod: keys(t, [[f03.from + 30, 0], [f03.from + 38, 5], [f03.from + 50, 0]]),
  });
  const momFace = (t: number) => keys(t, [[0, 0.3], [f03.from - 4, 0.3], [f03.from + 8, 0.55]]);
  const dadPose = (t: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(dad),
    lean: keys(t, [[10, 0], [26, 10], [56, 10], [70, 2]]),
    armL: { target: keysV(t, [[0, onTable(dad.x - 0.12 * dad.h, -4)], [20, { x: cardGirl(20).x + 10, y: cardGirl(20).y - 4 }], [50, { x: cardGirl(50).x + 10, y: cardGirl(50).y - 4 }], [66, onTable(dad.x - 0.14 * dad.h, -4)]], anticipate), shape: "open" as const, elbow: "down" as const, behind: false },
    armR: { target: onTable(dad.x + 0.13 * dad.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: keys(t, [[0, 0.45], [f03.from - 6, 0.45], [f03.from + 4, 0.05]]),
    nod: keys(t, [[f03.from + 4, 0], [f03.from + 12, 4], [f03.from + 24, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[0, -0.35], [f03.from - 6, -0.35], [f03.from + 4, -0.6]]);
  const card = (x: number, y: number, c: string) => (
    <div style={box({ left: x - 50, top: y - 14, width: 100, height: 22, borderRadius: 4, backgroundColor: "#FFFDF6", boxShadow: "0 3px 6px rgba(60,40,20,0.2)" })}>
      <div style={box({ left: 8, top: 6, width: 12, height: 12, borderRadius: 6, backgroundColor: c })} />
    </div>
  );
  const world = (
    <>
      <HomeBack minutes={20 * 60 + 5 + f / 300} evening={1} f={f} />
      <ShoeBench sonPack girlPack bag />
      <WarmLamp />
      <ChairBack x={mom.x} evening={1} />
      <ChairBack x={dad.x} evening={1} />
      <Actor uid="p8-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <Actor uid="p8-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <LaptopSide x={820} y={HOME.laptop.y} open={0} />
      <Teapot x={EVE_TEAPOT.x} y={EVE_TEAPOT.y} s={0.85} />
      {card(cardSon.x, cardSon.y, LOOKS.son.backpack)}
      {card(cardGirl(f).x, cardGirl(f).y, LOOKS.daughter.backpack)}
      <Actor uid="p8-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <Actor uid="p8-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
    </>
  );
  const [s, g] = TS2_TEXT.schedules;
  const slide = easeInOut((f - PLAN.slide) / 26);
  // кончик пальца мамы на форме: поля по очереди, затем кнопка
  const fx = keys(f, [[PLAN.form, 220], [FILLS[0] - 4, 520], [FILLS[3] + 8, 520], [PLAN.tap, 520], [PLAN.tap + 18, 200]]);
  const fy = keys(f, [[PLAN.form, 1900], [FILLS[0] - 4, 520], [FILLS[1], 680], [FILLS[2], 840], [FILLS[3], 1000], [PLAN.tap - 6, 1170], [PLAN.tap, 1160], [PLAN.tap + 18, 1900]]);
  return (
    <>
      <Shot f={f} from={0} to={64} cam={camMove(f, 0, 64, { x: 1130, y: 1090, zoom: 1.5 }, { x: 1125, y: 1095, zoom: 1.58 })}>
        {world}
      </Shot>
      {/* расписания рядом: папа пододвигает карточку дочери, мама сверяет время */}
      <Shot
        f={f}
        from={64}
        to={112}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #EADCC5, #CDB592)" })}>
            <ScheduleCard who={s.who} time={s.time} note={s.note} color={LOOKS.son.backpack} x={90} y={330} rot={-4} hi={0} />
            <ScheduleCard who={g.who} time={g.time} note={g.note} color={LOOKS.daughter.backpack} x={600 - 70 * slide} y={420 + 340 * (1 - slide) - 30 * slide} rot={4 - 2 * slide} hi={0} />
            {/* рука папы двигает карточку */}
            <div style={box({ left: 880 - 70 * slide, top: 700 + 340 * (1 - slide), width: 260, height: 120, borderRadius: 60, backgroundColor: LOOKS.dad.topColor, rotate: "-20deg" })} />
            <div style={box({ left: 860 - 70 * slide, top: 660 + 340 * (1 - slide), width: 120, height: 140, borderRadius: 50, backgroundColor: LOOKS.dad.skin })} />
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={112} to={PLAN.form} cam={camMove(f, 112, PLAN.form, { x: 1150, y: 1070, zoom: 1.75 }, { x: 1155, y: 1070, zoom: 1.82 })}>
        {world}
      </Shot>
      {/* предварительная заявка */}
      <Shot
        f={f}
        from={PLAN.form}
        to={255}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #F1DEC2, #C9A985)" })}>
            <PhoneFrame x={190} y={110} w={700} tilt={-1}>
              <RegForm f={f} fills={FILLS} tapAt={PLAN.tap} sentAt={PLAN.sent} />
            </PhoneFrame>
            {f < PLAN.tap + 18 ? (
              <>
                <div style={box({ left: fx - 150, top: fy + 150, width: 120, height: 420, borderRadius: 60, backgroundColor: LOOKS.mom.topColor, rotate: "28deg", transformOrigin: "50% 0%" })} />
                <div style={box({ left: fx - 96, top: fy + 56, width: 92, height: 140, borderRadius: 44, backgroundColor: LOOKS.mom.skin, rotate: "26deg" })} />
                <div style={box({ left: fx - 16, top: fy - 4, width: 32, height: 92, borderRadius: 16, backgroundColor: LOOKS.mom.skin, rotate: "22deg", transformOrigin: "50% 0%", boxShadow: "3px 4px 8px rgba(20,30,60,0.2)" })} />
              </>
            ) : null}
          </div>
        }
      >
        {null}
      </Shot>
    </>
  );
};
