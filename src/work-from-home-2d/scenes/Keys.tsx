// Сцена 04 «Кайра ачкыч». День. Курсор остаётся в незаконченной строке
// «Сентябрь», на экране 13:00; руки уходят с клавиатуры. Мама смотрит на
// часы, встаёт и берёт ключи со стола (рука приходит к ключам, связка
// идёт за кистью). У школы: задняя дверь открыта, сын подходит; вставка —
// сын на сиденье, рука мамы протягивает ремень поверх тела и застёгивает
// замок; машина трогается только после закрытой двери. Дома мама ставит
// тарелку с горячим обедом перед сыном.
import { useCurrentFrame } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { LaptopCloseup } from "../screens";
import { Car, MOM_CAR, RearSeat } from "../sets/Car";
import { HOME, Plate } from "../sets/Home";
import { Mountains } from "../sets/Clock";
import { PanelHouse, Sky, Tree } from "../sets/Outdoor";
import { SCHOOL } from "../sets/School";
import { KeysOnTable, WORK } from "../sets/WorkRoom";
import { box, camMove, Shot } from "../shots";
import { H, onTable, placeAt, restOnTable, sceneLen, seated, seatOf, standUp } from "./common";
import { SchoolWorld } from "./Morning";
import { walkLine } from "./Paradox";
import { DESK_FACE, momAtDesk } from "./Work";
import { keyAt, KitchenWorld, WorkWorld } from "./worlds";

export const KEYS_SHOTS = { screen: [0, 66], desk: [66, 150], gate: [150, 204], belt: [204, 252], drive: [252, 296] } as const;
export const KEYS_GRAB = 128; // кадр сцены: ключи в руке

// Ключи лежат у левого края стола (досягаемо со стула).
export const DESK_KEYS = { x: WORK.desk.x + 30, y: WORK.desk.top } as const;

// Улица: дома, деревья, тротуар, дорога (общий план поездки).
export const Street: React.FC<{ offset?: number }> = ({ offset = 0 }) => (
  <>
    <Sky w={2600} h={1400} />
    <div style={box({ left: -offset * 0.2 })}>
      <Mountains x={-300} y={520} w={3200} h={420} />
    </div>
    <div style={box({ left: -offset * 0.5 })}>
      <PanelHouse x={-200} y={1500} w={1300} floors={5} color="#EADFCF" seed={1} />
      <PanelHouse x={1250} y={1500} w={1300} floors={5} color="#E6D3C0" seed={3} />
      <Tree x={1180} y={1520} s={1.1} kind="poplar" />
    </div>
    <div style={box({ left: -1200, top: 1500, width: 5000, height: 240, backgroundColor: "#DAD3C7" })} />
    <div style={box({ left: -1200, top: 1740, width: 5000, height: 40, backgroundColor: "#EFECE6" })} />
    <div style={box({ left: -1200, top: 1780, width: 5000, height: 1400, backgroundColor: "#6E737E" })} />
    <div style={box({ left: -1200 - (offset % 240), top: 2330, width: 5000, height: 16, backgroundImage: "repeating-linear-gradient(90deg, #EDEAE4 0 120px, transparent 120px 240px)" })} />
  </>
);

export const KeysScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("keys");
  const S = KEYS_SHOTS;
  // B. мама: взгляд на часы → встаёт → ключи
  const stand0 = 96;
  const momDesk = (t: number) => {
    const base = momAtDesk(t, 0);
    const su = standUp(t, stand0, 30);
    const p: Place = { x: WORK.chairX, y: WORK.seatY, h: H.mom };
    return {
      ...base,
      sit: su.sit,
      lean: t < stand0 ? 12 : Math.max(su.lean, keys(t, [[stand0 + 26, 0], [KEYS_GRAB - 10, 18], [KEYS_GRAB + 6, 18], [KEYS_GRAB + 18, 4]])),
      expr: "thinking" as const,
      lookX: 0,
      lookY: keys(t, [[S.desk[0], 0.3], [S.desk[0] + 10, -0.55], [S.desk[0] + 26, -0.55], [S.desk[0] + 34, 0.3], [KEYS_GRAB + 6, 0.5], [KEYS_GRAB + 18, 0]]),
      armR: {
        target: keysV(t, [[S.desk[0], keyAt(2, t, 0)], [stand0 - 6, keyAt(2, t, 0)], [stand0 + 20, { x: p.x + 0.12 * p.h, y: p.y - 0.46 * p.h }], [KEYS_GRAB, { x: DESK_KEYS.x - 6, y: DESK_KEYS.y - 10 }], [KEYS_GRAB + 4, { x: DESK_KEYS.x - 6, y: DESK_KEYS.y - 10 }], [KEYS_GRAB + 20, { x: p.x + 0.12 * p.h, y: p.y - 0.46 * p.h }]], anticipate),
        shape: t >= KEYS_GRAB ? ("fist" as const) : ("relax" as const),
        item: t >= KEYS_GRAB ? ("keys" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: { ...base.armL, target: t < stand0 + 4 ? keyAt(0, t, 0) : null },
    };
  };
  // C. ворота школы: сын выходит к машине
  const son = (t: number) => walkLine(t, S.gate[0], S.gate[0] + 44, { x: SCHOOL.gate.x + 200, y: SCHOOL.fenceY + 20 }, { x: 1180, y: 1985 }, H.son, 0.3);
  const momGate = placeAt(1560, 2000, H.mom);
  // D. ремень: от крепления у плеча через грудь к замку у бедра
  const belt = easeInOut((f - S.belt[0] - 8) / 26);
  const anchor = { x: 850, y: 735 };
  const buckle = { x: 330, y: 1200 };
  const mid = { x: 600, y: 940 };
  const beltEnd = belt < 0.5 ? { x: lerp(anchor.x, mid.x, belt * 2), y: lerp(anchor.y, mid.y, belt * 2) } : { x: lerp(mid.x, buckle.x, belt * 2 - 1), y: lerp(mid.y, buckle.y, belt * 2 - 1) };
  // E. поездка: машина трогается после закрытой двери
  const drive = clamp((f - S.drive[0] - 10) / 34);
  const carX = lerp(300, 1500, easeInOut(drive) * 0.9 + drive * 0.1);
  // F. обед
  const sonT = seated("son", HOME.seat.son);
  const give = S.drive[1] + 34;
  const momK = (t: number) => walkLine(t, S.drive[1], S.drive[1] + 26, { x: 1900, y: 1600 }, { x: 1560, y: 1600 }, H.mom, 0.35);
  const plateAt = onTable(HOME.plates.son, 10);
  return (
    <>
      <Shot f={f} from={S.screen[0]} to={S.screen[1]} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<LaptopCloseup f={f} view={{ doc: { filled: 0, cursorRow: 2 }, clock: f < 30 ? "12:59" : "13:00" }} hands={1 - easeInOut((f - 34) / 24)} />}>
        {null}
      </Shot>
      <Shot f={f} from={S.desk[0]} to={S.desk[1]} cam={camMove(f, S.desk[0], S.desk[1], { x: 860, y: 1100, zoom: 1.02 }, { x: 860, y: 1100, zoom: 1.06 })}>
        <WorkWorld
          minutes={13 * 60}
          keys={false}
          mom={{ uid: "k4-mom", look: "mom", f, place: () => ({ x: WORK.chairX, y: WORK.seatY, h: H.mom }), face: (t) => keys(t, [[S.desk[0], DESK_FACE], [S.desk[0] + 10, 0.35], [S.desk[0] + 30, DESK_FACE]]), pose: momDesk, seed: 1 }}
        />
        {f < KEYS_GRAB ? <KeysOnTable x={DESK_KEYS.x} y={DESK_KEYS.y} /> : null}
      </Shot>
      <Shot f={f} from={S.gate[0]} to={S.gate[1]} cam={{ x: 1250, y: 1560, zoom: 0.72 }}>
        <SchoolWorld
          minutes={13 * 60 + 2}
          onWalk={
            <>
              <Actor uid="k4-son" look="son" f={f} place={son} face={() => 0.4} pose={() => ({ expr: "smile" as const })} seed={4} walkFrom={S.gate[0]} />
              <Actor uid="k4-momG" look="mom" f={f} place={() => momGate} face={() => -0.5} pose={() => ({ expr: "softSmile" as const, armL: { target: { x: momGate.x - 0.2 * momGate.h, y: momGate.y - 0.5 * momGate.h }, shape: "fist" as const, behind: false } })} seed={1} />
            </>
          }
          car={<Car x={1650} y={2440} color={MOM_CAR} s={1.25} rearDoor={1} dir={1} />}
        />
      </Shot>
      <Shot f={f} from={S.belt[0]} to={S.belt[1]} cam={{ x: 540, y: 960, zoom: 1 }}>
        <RearSeat />
        <Actor uid="k4-sonSeat" look="son" f={f} place={() => ({ x: 560, y: 1640, h: 1150 })} face={() => 0.15} pose={() => ({ sit: 1, seat: 380, packOff: true, expr: "smile" as const, armL: { target: { x: 420, y: 1240 }, shape: "relax" as const, elbow: "down" as const }, armR: { target: { x: 700, y: 1250 }, shape: "relax" as const, elbow: "down" as const } })} seed={4} />
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
          {/* ремень: поверх плеча и груди, к замку у бедра */}
          <path d={`M ${anchor.x} ${anchor.y} L ${belt < 0.5 ? beltEnd.x : mid.x} ${belt < 0.5 ? beltEnd.y : mid.y} ${belt >= 0.5 ? `L ${beltEnd.x} ${beltEnd.y}` : ""}`} stroke="#2B2E36" strokeWidth={46} strokeLinecap="round" fill="none" />
          <rect x={beltEnd.x - 30} y={beltEnd.y - 22} width={60} height={44} rx={8} fill="#C9CED6" />
        </svg>
        {/* рука мамы держит язычок ремня */}
        <div style={box({ left: beltEnd.x + 10, top: beltEnd.y - 50, width: 520, height: 120, opacity: belt < 1 ? 1 : 1 - clamp((f - S.belt[0] - 40) / 6) })}>
          <div style={box({ left: 90, top: 10, width: 460, height: 110, borderRadius: 55, backgroundColor: "#5E9A93" })} />
          <div style={box({ left: 0, top: 0, width: 140, height: 110, borderRadius: 50, backgroundColor: "#E6B590" })} />
        </div>
      </Shot>
      <Shot f={f} from={S.drive[0]} to={S.drive[1]} cam={{ x: 900, y: 1500, zoom: 0.62 }}>
        <Street offset={0} />
        <Car x={carX} y={2250} color={MOM_CAR} s={1.15} wheel={drive * 900} />
      </Shot>
      <Shot f={f} from={S.drive[1]} to={len} cam={camMove(f, S.drive[1], len, { x: 1450, y: 1170, zoom: 1.0 }, { x: 1430, y: 1160, zoom: 1.04 })}>
        <KitchenWorld
          minutes={13 * 60 + 25}
          seated={[{ uid: "k4-sonT", look: "son", f, place: () => sonT, face: (t) => keys(t, [[0, 0.5], [give + 16, 0.2]]), pose: (t) => ({ sit: 1, seat: seatOf(sonT), packOff: true, expr: t > give ? ("smile" as const) : ("calm" as const), armL: restOnTable(sonT, -1), armR: restOnTable(sonT, 1), lookY: t > give - 10 ? 0.45 : 0 }), seed: 4 }]}
          items={f >= give ? <Plate x={plateAt.x} y={plateAt.y + 6} steam={1} f={f} /> : null}
          standing={[
            {
              uid: "k4-momK",
              look: "mom",
              f,
              place: momK,
              face: () => -0.5,
              walkFrom: S.drive[1],
              pose: (t) => ({
                expr: "softSmile" as const,
                lean: keys(t, [[give - 12, 0], [give, 14], [give + 8, 14], [give + 20, 0]]),
                armR: { target: keysV(t, [[S.drive[1], { x: momK(t).x - 0.18 * H.mom, y: momK(t).y - 0.5 * H.mom }], [S.drive[1] + 26, { x: momK(t).x - 0.18 * H.mom, y: momK(t).y - 0.5 * H.mom }], [give, plateAt], [give + 18, { x: momK(t).x - 0.1 * H.mom, y: momK(t).y - 0.42 * H.mom }]], anticipate), shape: t < give ? ("fist" as const) : ("relax" as const), item: t < give ? ("plate" as const) : ("none" as const), behind: false },
              }),
              seed: 1,
            },
          ]}
        />
      </Shot>
    </>
  );
};
