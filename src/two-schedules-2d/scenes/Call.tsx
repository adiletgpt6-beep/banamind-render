// Сцена 4 (41–55 с): неожиданный звонок. Мама печатает; телефон на столе
// вибрирует (двигается только телефон). Мама замечает его последовательно:
// глаза → голова → корпус → рука; берёт телефон (поворачивается из лежачего
// положения в руке) — на экране «Кызым». Дочь у тех же ворот рядом с
// учительницей: «Апа, бүгүн сабагыбыз эрте бүттү. Мени алып кетесиңби?»
// Мама: «Ооба, кызым. Азыр даярданып, жолго чыгам.» — и на мгновение
// смотрит на незаконченную задачу на экране ноутбука.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, keys, keysV, type Vec } from "../rig/motion";
import { CallScreen, LaptopScreen, PhoneFrame } from "../screens";
import { PhoneFlat } from "../sets/Apartment";
import { BagOnTable, ChairBack, HOME, HomeBack, LaptopSide, Piala, PlateOnTable, ShoeBench, TableFront } from "../sets/Home";
import { SchoolBack, SchoolFence } from "../sets/School";
import { box, camMove, Shot } from "../shots";
import { H, lineFrames, onTable, placeAt, seated, seatOf } from "./common";

export const CALL = {
  buzz: 14, // телефон начинает вибрировать
  eyes: 24,
  head: 32,
  reach: 46,
  pick: 62, // телефон в руке
  answer: 116, // ответ на звонок (на экране)
};
// вибрация телефона на столе (смещение px)
export const phoneShake = (t: number) => (t >= CALL.buzz && t < CALL.pick ? Math.sin(t * 2.6) * 5 * (Math.floor((t - CALL.buzz) / 12) % 3 === 2 ? 0 : 1) : 0);

export const CallScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const d01 = lineFrames(cues, "d01", "call");
  const m04 = lineFrames(cues, "m04", "call");
  const mom = seated("mom", HOME.seat.mom);
  const son = seated("son", HOME.seat.son);
  const ear: Vec = { x: mom.x + 0.1 * mom.h, y: mom.y - 0.66 * mom.h };
  const look: Vec = { x: mom.x + 0.16 * mom.h, y: mom.y - 0.5 * mom.h };
  const phoneOnTable: Vec = { x: HOME.phone.x, y: HOME.phone.y - 6 };
  const key = (k: number, t: number): Vec => onTable(HOME.laptop.x - 52 + k * 22 + Math.sin(t * 1.7 + k) * 3, -4 - Math.abs(Math.sin(t * 1.3 + k * 2)) * 5);
  const hangUp = m04.to + 16;
  const momPose = (t: number) => {
    const typing = t < CALL.reach;
    const after = t > hangUp + 20;
    return {
      expr: t < CALL.eyes ? ("thinking" as const) : t < m04.from ? ("calm" as const) : t < hangUp ? ("softSmile" as const) : ("thinking" as const),
      sit: 1,
      seat: seatOf(mom),
      lean: keys(t, [[CALL.reach - 4, 0], [CALL.pick - 6, 9], [CALL.pick + 14, 2]]),
      lookX: keys(t, [[CALL.eyes - 2, 0], [CALL.eyes + 4, 0.8], [CALL.head + 10, 0.2], [hangUp + 20, 0.2], [hangUp + 28, -0.6]]),
      lookY: keys(t, [[0, 0.35], [CALL.eyes, 0.35], [CALL.eyes + 6, 0.55], [CALL.pick + 10, 0.55], [CALL.pick + 26, 0.25], [CALL.answer, 0.25], [CALL.answer + 10, 0], [hangUp + 20, 0], [hangUp + 30, 0.35]]),
      armR: {
        target: typing
          ? key(3, t)
          : keysV(
              t,
              [
                [CALL.reach, key(3, CALL.reach)],
                [CALL.pick, phoneOnTable],
                [CALL.pick + 26, look],
                [CALL.answer + 6, look],
                [CALL.answer + 22, ear],
                [hangUp, ear],
                [hangUp + 22, onTable(HOME.laptop.x + 100, -8)],
              ],
              anticipate,
            ),
        shape: t >= CALL.pick && t < hangUp + 22 ? ("phone" as const) : typing ? ("relax" as const) : ("open" as const),
        item: t >= CALL.pick && t < hangUp + 22 ? ("phone" as const) : ("none" as const),
        flat: t >= CALL.pick ? 1 - clamp((t - CALL.pick) / 14) + clamp((t - hangUp - 8) / 14) : 1,
        glow: t >= CALL.pick && t < hangUp ? 1 : 0,
        itemTilt: keys(t, [[CALL.answer + 6, 0], [CALL.answer + 22, -18], [hangUp, -18], [hangUp + 14, 0]]),
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: after ? onTable(mom.x - 0.1 * mom.h, -4) : typing ? key(0, t) : keysV(t, [[CALL.reach, key(0, CALL.reach)], [CALL.reach + 20, onTable(mom.x - 0.12 * mom.h, -4)]]), shape: "relax" as const, elbow: "down" as const },
      nod: keys(t, [[m04.from, 0], [m04.from + 8, 5], [m04.from + 18, 0]]),
    };
  };
  // голова поворачивается к телефону после глаз; к ноутбуку — после разговора
  const momFace = (t: number) => keys(t, [[0, 0.45], [CALL.head, 0.45], [CALL.head + 10, 0.75], [CALL.pick + 20, 0.6], [CALL.answer + 10, 0.2], [hangUp + 24, 0.2], [hangUp + 34, 0.5]]);
  const sonPose = (t: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(son),
    packOff: true,
    armR: { target: onTable(HOME.plate.x + 24, 0), shape: "fist" as const, item: "spoon" as const, elbow: "down" as const },
    armL: { target: onTable(HOME.table.x + 30, -2), shape: "relax" as const, elbow: "down" as const },
    lookY: keys(t, [[CALL.buzz, 0.4], [CALL.buzz + 12, 0]]),
  });
  const sonFace = (t: number) => keys(t, [[CALL.buzz, 0.3], [CALL.buzz + 14, 0.6]]);

  const world = (
    <>
      <HomeBack minutes={12 * 60 + 46 + f / 600} f={f} />
      <ShoeBench sonPack girlPack={false} />
      <ChairBack x={HOME.seat.son} />
      <ChairBack x={mom.x} />
      <Actor uid="c4-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} layer="body" />
      <Actor uid="c4-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <TableFront />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      {f < CALL.pick ? <PhoneFlat x={phoneOnTable.x} y={phoneOnTable.y} shake={phoneShake(f)} glow={f >= CALL.buzz ? 1 : 0} /> : null}
      <BagOnTable x={HOME.bag.x} y={HOME.bag.y} />
      <PlateOnTable x={HOME.plate.x + 10} y={HOME.plate.y} eaten={0.6} />
      <Actor uid="c4-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} layer="arms" />
      <Actor uid="c4-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
    </>
  );
  // дочь у ворот школы (те же ворота), рядом учительница
  const girl = placeAt(960, 1742, H.daughter);
  const teacher = placeAt(790, 1716, H.teacher);
  const girlPose = (t: number) => ({
    expr: t < d01.to ? ("calm" as const) : ("softSmile" as const),
    armR: { target: { x: girl.x + 0.1 * girl.h, y: girl.y - 0.86 * girl.h }, shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: -16, elbow: "down" as const, behind: false },
    strapTug: 0.6,
    armL: { target: { x: girl.x - 0.1 * girl.h, y: girl.y - 0.62 * girl.h }, shape: "fist" as const, elbow: "down" as const },
    headTilt: keys(t, [[d01.from, 0], [d01.from + 12, -5]]),
  });
  const teacherPose = () => ({ expr: "softSmile" as const, armL: { target: { x: teacher.x - 0.08 * teacher.h, y: teacher.y - 0.5 * teacher.h }, shape: "fist" as const, item: "notebook" as const, elbow: "down" as const } });
  const school = (
    <>
      <SchoolBack minutes={12 * 60 + 47} />
      <Actor uid="c4-teacher" look="teacher" f={f} place={() => teacher} face={() => 0.35} pose={teacherPose} seed={5} />
      <Actor uid="c4-girl" look="daughter" f={f} place={() => girl} face={() => -0.2} pose={girlPose} role="daughter" seed={3} />
      <SchoolFence />
    </>
  );
  const callStart = 96;
  const schoolFrom = Math.max(callStart + 30, d01.from - 4);
  const back = d01.to + 10;
  const laptopFrom = Math.max(back + 40, hangUp + 30);
  return (
    <>
      <Shot f={f} from={0} to={callStart} cam={camMove(f, 0, callStart, { x: 1090, y: 1090, zoom: 1.55 }, { x: 1110, y: 1095, zoom: 1.65 })}>
        {world}
      </Shot>
      {/* экран звонка крупно: «Кызым» */}
      <Shot
        f={f}
        from={callStart}
        to={schoolFrom}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #F3E6D3, #D9C3A3)" })}>
            <PhoneFrame x={200} y={170} w={680} tilt={-2}>
              <CallScreen f={f} answerAt={CALL.answer} />
            </PhoneFrame>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={schoolFrom} to={back} cam={camMove(f, schoolFrom, back, { x: 900, y: 1390, zoom: 1.5 }, { x: 905, y: 1385, zoom: 1.56 })}>
        {school}
      </Shot>
      <Shot f={f} from={back} to={laptopFrom} cam={camMove(f, back, laptopFrom, { x: 1060, y: 1090, zoom: 1.75 }, { x: 1065, y: 1092, zoom: 1.82 })}>
        {world}
      </Shot>
      {/* незаконченная задача на экране */}
      <Shot
        f={f}
        from={laptopFrom}
        to={420}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #E9DCC7, #D9C6A8)" })}>
            <div style={box({ left: 70, top: 300, width: 940, height: 640, borderRadius: 26, backgroundColor: "#2A2F3A" })}>
              <div style={box({ left: 22, top: 22, right: 22, bottom: 22, borderRadius: 10, overflow: "hidden" })}>
                <LaptopScreen f={f + 60} typeFrom={0} typeTo={1} />
              </div>
            </div>
            <div style={box({ left: 20, top: 940, width: 1040, height: 60, borderRadius: "0 0 30px 30px", backgroundColor: "#B9C0CC" })} />
          </div>
        }
      >
        {null}
      </Shot>
    </>
  );
};
