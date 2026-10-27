// Сцена 3. Обычное утро (без паники — просто плотное).
// A. Переход: оранжевый кружок солнышка с рисунка становится пятном
//    утреннего света на кухонной столешнице; руки мамы закрывают рабочую
//    сумку (застёжка).
// B. Прихожая: мама наклоняется и поправляет лямку рюкзака дочки.
// C. Во дворе: мама открывает заднюю дверь обычной семейной машины
//    (без брендинга), дочка подходит.
// D. Через открытую дверь: дочка садится, затем пристёгивает ремень; мама
//    закрывает дверь.
// E. Короткий внешний план у школы: дочка идёт к входу.
import { Actor, type Place } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { HALL, HallBack } from "../sets/Home";
import { H, HANDS } from "./common";
import { CarStreet, carStreetTimes, SchoolDrop, SeatView, seatTimes } from "./CarBits";

export const morningPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "morning");
  const bag: [number, number] = [22, 44]; // клапан сумки закрывается
  const hall = 62;
  const tug: [number, number] = [hall + 22, hall + 40];
  const street = hall + 66;
  const S = carStreetTimes(street);
  const seat = S.end;
  const Se = seatTimes(seat);
  const school = Se.end;
  return { bag, hall, tug, street, seat, doorOpen: S.open[1], doorClose: Se.close[1], school, len: T.len };
};

// A. Сумка на столешнице: вид спереди-сверху.
const BagShot: React.FC<{ f: number; p: ReturnType<typeof morningPlan> }> = ({ f, p }) => {
  const sun = easeInOut(clamp(f / 16)); // кружок → пятно света
  const flap = easeInOut(clamp((f - p.bag[0]) / (p.bag[1] - p.bag[0]))); // 0 — открыт, 1 — закрыт
  const handY = 870 + lerp(36, 230, flap);
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#E9DFCC">
      {/* стена и столешница */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 980, backgroundColor: C.wallKitchen })} />
      <div style={box({ left: 0, top: 980, width: 1080, height: 940, backgroundColor: "#EDE6DA" })} />
      {/* пятно утреннего света (из солнышка рисунка) */}
      <div
        style={box({
          left: lerp(540 - 70, 120, sun),
          top: lerp(960 - 70, 1020, sun),
          width: lerp(140, 820, sun),
          height: lerp(140, 520, sun),
          borderRadius: "50%",
          background: sun < 0.6 ? C.orange : "radial-gradient(ellipse, rgba(255,214,140,0.55), rgba(255,214,140,0) 70%)",
          opacity: sun < 0.6 ? 1 - sun * 0.6 : 1,
        })}
      />
      {/* сумка */}
      <Svg>
        <rect x={250} y={900} width={580} height={420} rx={36} fill={C.navy} opacity={clamp((f - 8) / 6)} />
        <rect x={420} y={860} width={240} height={60} rx={30} fill="none" stroke="#141C38" strokeWidth={22} opacity={clamp((f - 8) / 6)} />
        {/* клапан опускается от верхнего края и закрывает сумку */}
        <g opacity={clamp((f - 8) / 6)}>
          <rect x={240} y={890} width={600} height={lerp(36, 230, flap)} rx={30} fill="#2A3768" />
          {flap > 0.8 ? <rect x={500} y={890 + lerp(36, 230, flap) - 40} width={80} height={36} rx={8} fill={C.orange} /> : null}
        </g>
      </Svg>
      {f >= 10 ? (
        <Svg>
          <CloseHand x={360} y={handY - 110} angle={-8} size={170} {...HANDS.mom} shape="pinch" />
          <CloseHand x={720} y={handY - 110} angle={8} size={170} {...HANDS.mom} shape="pinch" mirror />
        </Svg>
      ) : null}
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: TINT.cool })} />
    </Shot>
  );
};

// B. Прихожая: лямка рюкзака.
const HallShot: React.FC<{ f: number; p: ReturnType<typeof morningPlan> }> = ({ f, p }) => {
  const girl: Place = { x: 600, y: HALL.floorY + 20, h: H.girl };
  const mom: Place = { x: 330, y: HALL.floorY, h: H.mom };
  const strap = { x: girl.x - 0.09 * girl.h, y: girl.y - 0.6 * girl.h };
  const reach = easeOut(clamp((f - p.hall - 6) / 14));
  const tug = easeInOut(clamp((f - p.tug[0]) / (p.tug[1] - p.tug[0])));
  const back = easeInOut(clamp((f - p.tug[1] - 6) / 12));
  return (
    <Shot f={f} cam={{ x: 470, y: 1180, zoom: 1.3 }} bg={C.wallHome}>
      <HallBack />
      <Actor
        uid="m3-mom"
        look="su2Mom"
        f={f}
        place={() => mom}
        face={() => 0.6}
        pose={() => ({
          lean: 14 * (1 - back),
          expr: "softSmile",
          lookY: 0.35,
          bagOnShoulder: 1,
          armR: { target: { x: lerp(mom.x + 100, strap.x, reach * (1 - back)), y: lerp(mom.y - 330, strap.y + 16 * tug, reach * (1 - back)) }, shape: reach > 0.7 && back < 0.3 ? "pinch" : "relax", elbow: "down", behind: false },
        })}
        seed={5}
      />
      <Actor uid="m3-girl" look="su2Girl" f={f} place={() => girl} face={() => -0.55} pose={() => ({ expr: "calm", strapTug: tug * (1 - back * 0.3), lookY: -0.15 })} seed={7} blinkShift={23} />
      <div style={box({ left: -600, top: -600, width: 2400, height: 3200, backgroundColor: TINT.cool })} />
    </Shot>
  );
};

export const MorningScene: React.FC = () => {
  const { f } = useScene("morning");
  const p = usePlan(morningPlan);
  if (f < p.hall) return <BagShot f={f} p={p} />;
  if (f < p.street) return <HallShot f={f} p={p} />;
  if (f < p.seat) return <CarStreet f={f} t0={p.street} adult="su2Mom" kid="su2Girl" />;
  if (f < p.school) return <SeatView f={f} t0={p.seat} kid="su2Girl" />;
  return <SchoolDrop f={f} t0={p.school} kid="su2Girl" len={p.len - p.school} />;
};
