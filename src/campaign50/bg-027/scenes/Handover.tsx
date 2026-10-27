// Сцена 4: условный пример после создания маршрута (метка видна всю
// сцену). Белая машина подъезжает и останавливается у ворот. Ребёнок
// уже на тротуаре рядом с водителем (вышел со стороны тротуара). Подходит
// Эже — над ней та же иконка с галочкой, что на карточке. Ребёнок узнаёт
// её и машет; водитель (телефон не в руках) кивает и жестом отпускает
// ребёнка к ней. Никаких документов, сканирования или «проверки личности».
// На второй фразе: «Белгисиз адамга тапшырылбайт».
import { useCurrentFrame } from "remotion";
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { cruise, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../../../two-schedules-2d/rig/motion";
import { camMove, Shot, box } from "../../../two-schedules-2d/shots";
import { fontFamily } from "../../../fonts";
import { useLine, useSceneFrames, useWord } from "../context";
import { BG27_TEXT } from "../script";
import { AdultIcon, AgreedBadge, GATE, GateStreet, H, Marker, NAVY, WhiteCar } from "../sets";
import { DRIVER, driverRest } from "./Hook";

const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });

export const HAND_Y = GATE.footY - 330; // высота, где взрослый берёт ребёнка за руку
export const EJE_STOP = 1240;

// Моменты сцены (кадры).
export const useHandoverBeats = () => {
  const n3 = useLine("n3");
  const n4 = useLine("n4");
  const end = useSceneFrames("handover");
  const cut = 84;
  const arrive = cut + 96;
  return { n3, n4, end, cut, carStop: 70, ejeFrom: cut + 4, arrive, wave: arrive + 6, badge: useWord("n3", 9), nod: n4.from + 6, kidGo: n4.from + 24, kidAt: n4.from + 84 };
};

export const HandoverScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = useHandoverBeats();

  // машина: подъезжает справа и мягко тормозит
  const carX = lerp(2300, GATE.carStop, cruise(f / b.carStop, 0.1) ** 0.6);
  const wheel = -carX * 0.9;

  const ejePlace = (t: number): Place => ({ x: lerp(1900, EJE_STOP, cruise((t - b.ejeFrom) / (b.arrive - b.ejeFrom))), y: GATE.footY, h: H.adult });
  const kidX = (t: number) => lerp(GATE.kid, EJE_STOP - 190, cruise((t - b.kidGo) / (b.kidAt - b.kidGo)));
  const kidPlace = (t: number): Place => ({ x: kidX(t), y: GATE.footY, h: H.kid });
  const holdAt = (t: number): Vec => ({ x: (kidX(t) + EJE_STOP) / 2 + 10, y: HAND_Y });
  const waving = (t: number, t0: number, dur: number) => (t >= t0 && t < t0 + dur ? Math.sin(((t - t0) / 5) * Math.PI) : null);

  const eje = (t: number): PoseIn => {
    const w = waving(t, b.wave, 40);
    const P = ejePlace(t);
    return {
      expr: t > b.wave - 10 ? "smile" : "softSmile",
      armR: w !== null ? { target: { x: P.x + 0.2 * P.h + w * 18, y: P.y - 0.98 * P.h }, shape: "wave", elbow: "out" } : { target: at(P, 0.12, -0.43), shape: "relax", elbow: "down" },
      armL: t > b.kidAt - 16 ? { target: holdAt(t), shape: "open", elbow: "down" } : { target: at(P, -0.12, -0.43), shape: "relax", elbow: "down" },
    };
  };
  const kid = (t: number): PoseIn => {
    const w = waving(t, b.wave + 14, 34);
    const P = kidPlace(t);
    return {
      expr: t > b.wave ? "smile" : "softSmile",
      armR:
        t > b.kidAt - 16
          ? { target: holdAt(t), shape: "fist", elbow: "down" }
          : w !== null
            ? { target: { x: P.x + 0.22 * P.h + w * 14, y: P.y - 1.0 * P.h }, shape: "wave", elbow: "out" }
            : { target: at(P, 0.15, -0.42), shape: "relax", elbow: "down" },
      armL: { target: at(P, -0.15, -0.42), shape: "relax", elbow: "down" },
    };
  };
  const kidFace = (t: number) => keys(t, [[b.cut, -0.3], [b.ejeFrom + 30, 0.6], [b.kidGo - 8, -0.5], [b.kidGo + 4, 0.6]]);
  const driver = (t: number): PoseIn => ({
    ...driverRest(),
    expr: t > b.wave ? "softSmile" : "calm",
    nod: keys(t, [[b.nod, 0], [b.nod + 8, 9], [b.nod + 18, 0]]),
    armR:
      t > b.nod + 6 && t < b.kidAt + 30
        ? { target: keysV(t, [[b.nod + 6, at(DRIVER, 0.12, -0.43)], [b.nod + 24, at(DRIVER, 0.34, -0.62)]]), shape: "open", elbow: "down" }
        : { target: at(DRIVER, 0.12, -0.43), shape: "relax", elbow: "down" },
  });
  const badgeA = easeOut((f - b.badge) / 10);
  const unknownA = easeOut((f - b.n4.from) / 10);
  const P = ejePlace(f);

  const camB = camMove(f, b.cut, b.end, { x: 1010, y: 900, zoom: 1.06 }, { x: 1050, y: 910, zoom: 1.12 }, easeInOut);
  return (
    <>
      <Shot f={f} from={0} to={b.cut} cam={camMove(f, 0, b.cut, { x: 1140, y: 1250, zoom: 0.9 }, { x: 1000, y: 1250, zoom: 0.96 })} base={{ x: 1000, y: 1250, zoom: 0.96 }}>
        <GateStreet f={f}>
          <div style={box({ left: 0, top: 0 })}>
            <WhiteCarDriven x={carX} wheel={wheel} />
          </div>
        </GateStreet>
      </Shot>
      <Shot f={f} from={b.cut} to={100000} cam={camB} base={{ x: 1010, y: 900, zoom: 1.06 }}>
        <GateStreet f={f} wicketOpen={keys(f, [[b.kidAt + 10, 0], [b.kidAt + 40, 1]])}>
          <Actor uid="ho-driver" look="parentA" f={f} place={() => DRIVER} face={(t) => keys(t, [[b.cut, 0.3], [b.ejeFrom + 30, 0.6]])} pose={driver} seed={8} />
          <Actor uid="ho-eje" look="teacher" f={f} place={ejePlace} face={() => -0.5} pose={eje} walkFrom={b.ejeFrom} seed={5} />
          <Actor uid="ho-kid" look="son" f={f} place={kidPlace} face={kidFace} pose={kid} walkFrom={b.kidGo} seed={4} />
          <AgreedBadge side x={P.x - 0.11 * P.h - 160} y={P.y - P.h + 150} a={badgeA} s={1} />
          <WhiteCar x={GATE.carStop} y={GATE.carY} s={1.6} />
        </GateStreet>
      </Shot>
      <Marker text={BG27_TEXT.markerRoute} f={f} big />
      <div style={box({ left: 60, right: 60, top: 400, textAlign: "center", opacity: unknownA, translate: `0 ${(1 - unknownA) * 24}px` })}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 30px", borderRadius: 999, backgroundColor: "#FFFFFF", boxShadow: "0 12px 30px rgba(20,40,90,0.18)", fontFamily, fontSize: 48, fontWeight: 900, color: NAVY }}>
          <div style={{ position: "relative", width: 76, height: 76 }}>
            <AdultIcon size={76} color="#B9C0CC" unknown />
            <div style={box({ left: -6, top: 34, width: 88, height: 8, borderRadius: 4, backgroundColor: "#D3455B", rotate: "-40deg" })} />
          </div>
          {BG27_TEXT.handover.unknown}
        </div>
      </div>
    </>
  );
};

// Машина в движении (водитель за рулём виден в окне).
const WhiteCarDriven: React.FC<{ x: number; wheel: number }> = ({ x, wheel }) => <WhiteCar x={x} y={GATE.carY} s={1.6} wheel={wheel} withDriver />;
