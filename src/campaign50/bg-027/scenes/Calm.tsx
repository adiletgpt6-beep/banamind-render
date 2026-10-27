// Сцена 5: мама спокойно продолжает рабочую встречу, карточка встречи
// стоит рядом. Жёлтая рамка карточки раскрывается и возвращает нас к
// ладоням у ворот, как в хуке, — но теперь взрослый обозначен: Эже
// протягивает руку, ребёнок берёт её, над ней плашка с галочкой.
// Камера отъезжает: они идут к калитке, водитель машет. Надпись
// «Алдын ала билүү — тынчтык».
import { useCurrentFrame } from "remotion";
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, lerp, type Vec } from "../../../two-schedules-2d/rig/motion";
import { seatH } from "../../../two-schedules-2d/sets/Home";
import { camMove, Shot, box } from "../../../two-schedules-2d/shots";
import { fontFamily } from "../../../fonts";
import { useSceneFrames } from "../context";
import { BG27_TEXT } from "../script";
import { AgreedBadge, GATE, GateStreet, H, Marker, NAVY, OFFICE, OfficeBack, OfficeChairBack, OfficeDeskFront, WhiteCar, YELLOW } from "../sets";
import { DRIVER, driverRest } from "./Hook";
import { EJE_STOP, HAND_Y } from "./Handover";
import { MOM } from "./Mom";

const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });
const onDesk = (x: number, dy = 0): Vec => ({ x, y: OFFICE.deskTop + 6 + dy });
const typing = (k: number, t: number): Vec => onDesk(OFFICE.laptop - 150 + k * 40 + Math.sin(t * 1.7 + k) * 4, -6 - Math.abs(Math.sin(t * 1.3 + k * 2)) * 6);

export const CALM = { wipe: 132, gate: 150 } as const;

export const CalmScene: React.FC = () => {
  const f = useCurrentFrame();
  const end = useSceneFrames("calm");
  const g = f - CALM.gate;
  const KID0 = EJE_STOP - 190;

  const mom = (t: number): PoseIn => ({
    sit: 1,
    seat: seatH(MOM.h),
    expr: "softSmile",
    lookY: 0.35,
    nod: keys(t, [[40, 0], [52, 6], [66, 0]]),
    armL: { target: typing(0, t / 3), shape: "relax", elbow: "down" },
    armR: { target: typing(2, t / 3), shape: "relax", elbow: "down" },
  });

  // у ворот: держатся за руки, затем идут к калитке
  const walkFrom = CALM.gate + 120;
  const walk = (t: number) => cruise((t - walkFrom) / 90);
  const ejePlace = (t: number): Place => ({ x: lerp(EJE_STOP, GATE.gate.x + GATE.gate.w - 80, walk(t)), y: GATE.footY, h: H.adult });
  const kidPlace = (t: number): Place => ({ x: lerp(KID0, GATE.gate.x + GATE.gate.w - 210, walk(t)), y: GATE.footY, h: H.kid });
  const hold = (t: number): Vec => ({ x: (ejePlace(t).x + kidPlace(t).x) / 2 + 10, y: HAND_Y });
  const reach = (t: number) => easeInOut((t - (CALM.gate + 14)) / 30);
  const eje = (t: number): PoseIn => {
    const P = ejePlace(t);
    return {
      expr: "smile",
      armL: { target: { x: lerp(P.x - 0.3 * P.h, hold(t).x, reach(t)), y: lerp(P.y - 0.5 * P.h, HAND_Y, reach(t)) }, shape: "open", elbow: "down" },
      armR: { target: at(P, 0.12, -0.43), shape: "relax", elbow: "down" },
    };
  };
  const kid = (t: number): PoseIn => {
    const P = kidPlace(t);
    const k = easeInOut((t - (CALM.gate + 34)) / 22);
    return {
      expr: "smile",
      armR: { target: { x: lerp(P.x + 0.15 * P.h, hold(t).x, k), y: lerp(P.y - 0.42 * P.h, HAND_Y, k) }, shape: k > 0.8 ? "fist" : "open", elbow: "down" },
      armL: { target: at(P, -0.15, -0.42), shape: "relax", elbow: "down" },
    };
  };
  const driver = (t: number): PoseIn => {
    const w = t > walkFrom - 10 && t < walkFrom + 50 ? Math.sin(((t - walkFrom) / 5) * Math.PI) : null;
    return {
      ...driverRest(),
      expr: "softSmile",
      armR: w !== null ? { target: { x: DRIVER.x + 0.22 * DRIVER.h + w * 16, y: DRIVER.y - 0.98 * DRIVER.h }, shape: "wave", elbow: "out" } : driverRest().armR,
    };
  };
  const P = ejePlace(f);
  const camGate = g < 60 ? { x: 1140, y: 1060, zoom: 1.8 } : camMove(f, CALM.gate + 60, end, { x: 1140, y: 1060, zoom: 1.8 }, { x: 1180, y: 920, zoom: 0.92 });
  const wipe = easeInOut((f - CALM.wipe) / 18);
  const title = easeOut((f - (CALM.gate + 50)) / 12);
  return (
    <>
      <Shot f={f} from={0} to={CALM.gate} cam={camMove(f, 0, CALM.gate, { x: 560, y: 1000, zoom: 1.12 }, { x: 600, y: 1020, zoom: 1.2 })}>
        <OfficeBack minutes={16 * 60 + 40 + f / 60} />
        <OfficeChairBack x={MOM.x} />
        <Actor uid="c-mom" look="mom" f={f} place={() => MOM} face={() => 0.3} pose={mom} role="mother" seed={1} layer="body" />
        <OfficeDeskFront cardOnDesk={false} />
        {/* карточка встречи стоит у ноутбука */}
        <div style={box({ left: 140, top: OFFICE.deskTop - 150, width: 170, height: 150, borderRadius: 12, backgroundColor: "#FFFFFF", border: `6px solid ${YELLOW}`, boxSizing: "border-box", rotate: "-5deg", boxShadow: "0 8px 18px rgba(20,40,90,0.15)" })}>
          <div style={box({ left: 18, top: 22, width: 40, height: 40, borderRadius: 20, backgroundColor: "#3A6EA5" })} />
          <div style={box({ left: 18, top: 78, width: 40, height: 40, borderRadius: 20, backgroundColor: "#8E3B46" })} />
          <div style={box({ left: 70, top: 34, width: 70, height: 14, borderRadius: 7, backgroundColor: "#9AA6BC" })} />
          <div style={box({ left: 70, top: 90, width: 70, height: 14, borderRadius: 7, backgroundColor: "#9AA6BC" })} />
        </div>
        <Actor uid="c-mom" look="mom" f={f} place={() => MOM} face={() => 0.3} pose={mom} role="mother" seed={1} layer="arms" />
      </Shot>
      <Shot f={f} from={CALM.gate} to={100000} cam={camGate} base={{ x: 1180, y: 920, zoom: 0.92 }}>
        <GateStreet f={f} wicketOpen={keys(f, [[walkFrom - 20, 0.2], [walkFrom + 10, 1]])}>
          <Actor uid="c-driver" look="parentA" f={f} place={() => DRIVER} face={() => 0.5} pose={driver} seed={8} />
          <Actor uid="c-eje" look="teacher" f={f} place={ejePlace} face={() => -0.4} pose={eje} walkFrom={walkFrom} seed={5} />
          <Actor uid="c-kid" look="son" f={f} place={kidPlace} face={() => 0.5} pose={kid} walkFrom={walkFrom} seed={4} />
          {/* в крупном плане плашка не нужна (рядом метка) — появляется при отъезде камеры */}
          <AgreedBadge side x={P.x - 0.11 * P.h - 160} y={P.y - P.h + 150} a={clamp((1.45 - camGate.zoom) / 0.2)} />
          <WhiteCar x={GATE.carStop} y={GATE.carY} s={1.6} />
        </GateStreet>
      </Shot>
      {/* переход: жёлтая рамка карточки раскрывается на весь кадр */}
      {wipe > 0 && wipe < 1 ? (
        <div style={box({ left: 540 - 540 * wipe * 1.4, top: 960 - 960 * wipe * 1.4, width: 1080 * wipe * 1.4, height: 1920 * wipe * 1.4, borderRadius: 60 * (1 - wipe), border: `${30 * (1 - wipe) + 6}px solid ${YELLOW}`, boxSizing: "border-box", backgroundColor: f < CALM.gate ? `rgba(255,255,255,${0.9 * wipe})` : "transparent" })} />
      ) : null}
      {f >= CALM.gate ? <Marker text={BG27_TEXT.marker} f={g} /> : null}
      <div style={box({ left: 40, right: 40, top: 1190, textAlign: "center", opacity: title, translate: `0 ${(1 - title) * 26}px` })}>
        <span style={{ display: "inline-block", padding: "18px 36px", borderRadius: 30, backgroundColor: "#FFFFFF", boxShadow: "0 14px 34px rgba(20,40,90,0.18)", fontFamily, fontSize: 54, fontWeight: 900, color: NAVY, whiteSpace: "nowrap" }}>
          Алдын ала билүү — <span style={{ color: "#E0A400" }}>тынчтык</span>
        </span>
      </div>
    </>
  );
};
