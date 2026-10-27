// Сцена 2 (≈6–19 с): 1-бөлүк — эртең менен ҮЙ → МЕКТЕП.
// Условный пример после формирования маршрута (плашка сверху).
//   A. Улица у дома: мама за руку подводит дочь к белой машине у бордюра,
//      задняя дверь открывается, девочка садится, мама машет.
//   B. Крупно в салоне: девочка на заднем сиденье пристёгивает ремень —
//      щелчок, «Кур тагылды».
//   C. Карта Бишкека: белая машина едет от ҮЙ к МЕКТЕП и сама рисует
//      ярко-жёлтую линию; у школы — галочка.
import { useCurrentFrame } from "remotion";
import { Actor, type Place } from "../../../two-schedules-2d/rig/Actor";
import {
  anticipate,
  clamp,
  cruise,
  easeInOut,
  easeOut,
  keys,
  keysV,
  lerp,
  type Vec,
} from "../../../two-schedules-2d/rig/motion";
import { RearSeatBack } from "../../../two-schedules-2d/sets/CarViews";
import { camMove, Shot } from "../../../two-schedules-2d/shots";
import { fontFamily } from "../../../fonts";
import { BishkekMap, carOn, CityTag, MapCar, Pin, RouteLine } from "../map";
import { C } from "../palette";
import { BG22_TEXT } from "../script";
import {
  Check,
  COURT,
  CourtFront,
  Courtyard,
  Cut,
  ExampleTag,
  PartBadge,
  WhiteCar,
  rise,
} from "../ui";

export const MO = {
  belt: 140,
  beltClick: 196,
  map: 232,
  drive0: 244,
  drive1: 376,
} as const;
// Рост на глубине машины (у бордюра); ближе к камере (больше y) — крупнее.
export const MOM_H = 340;
export const KID_H = 250;
export const depthK = (y: number) => 1 + (y - COURT.carY) * 0.0025;

export const walk = (
  t: number,
  t0: number,
  t1: number,
  a: Vec,
  b: Vec,
  h: number,
  acc = 0.25,
): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  const y = lerp(a.y, b.y, u);
  return { x: lerp(a.x, b.x, u), y, h: h * depthK(y) };
};

// Траектории (кадры сцены): мама и дочь идут слева к машине.
export const MO_MOM = (t: number): Place =>
  walk(t, 0, 86, { x: -150, y: 1622 }, { x: 400, y: 1622 }, MOM_H);
export const MO_KID = (t: number): Place =>
  t < 92
    ? walk(t, 0, 86, { x: -50, y: 1584 }, { x: 500, y: 1584 }, KID_H)
    : walk(
        t,
        92,
        116,
        { x: 500, y: 1584 },
        { x: COURT.doorX, y: 1446 },
        KID_H,
        0.35,
      );

const DOOR = (t: number) =>
  keys(t, [
    [80, 0],
    [96, 1],
    [122, 1],
    [134, 0],
  ]);

const Street: React.FC<{ readonly f: number }> = ({ f }) => {
  const hold = (t: number): Vec => {
    const m = MO_MOM(t);
    const k = MO_KID(t);
    return {
      x: (m.x + 0.16 * m.h + k.x - 0.14 * k.h) / 2,
      y: m.y - 0.47 * m.h,
    };
  };
  const release = 90;
  const kidPose = (t: number) => {
    const p = MO_KID(t);
    return {
      expr: "smile" as const,
      armL:
        t < release
          ? { target: hold(t), shape: "fist" as const, elbow: "down" as const }
          : {
              target: keysV(
                t,
                [
                  [release, hold(release)],
                  [release + 12, { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h }],
                ],
                easeInOut,
              ),
              shape: "relax" as const,
            },
      armR: {
        target: { x: p.x + 0.14 * p.h, y: p.y - 0.42 * p.h },
        shape: "relax" as const,
      },
      strapTug: 0.6,
    };
  };
  const momPose = (t: number) => {
    const p = MO_MOM(t);
    const wave = t > 108 && t < 150;
    return {
      expr: "smile" as const,
      bagOnShoulder: 1,
      armR:
        t < release
          ? { target: hold(t), shape: "fist" as const, elbow: "down" as const }
          : {
              target: keysV(
                t,
                [
                  [release, hold(release)],
                  [104, { x: p.x + 0.12 * p.h, y: p.y - 0.45 * p.h }],
                  [112, { x: p.x + 0.24 * p.h, y: p.y - 0.9 * p.h }],
                  [146, { x: p.x + 0.24 * p.h, y: p.y - 0.9 * p.h }],
                ],
                anticipate,
              ),
              shape: wave ? ("wave" as const) : ("relax" as const),
              wrist: wave ? Math.sin(t / 4.5) * 14 : 0,
            },
      armL: {
        target: { x: p.x - 0.12 * p.h, y: p.y - 0.45 * p.h },
        shape: "relax" as const,
      },
      lookY: keys(t, [
        [0, 0.2],
        [60, 0.2],
        [86, 0],
      ]),
    };
  };
  const kidFace = (t: number) =>
    keys(t, [
      [0, 0.6],
      [70, 0.6],
      [80, -0.5],
      [92, 0.4],
    ]);
  const momFace = (t: number) =>
    keys(t, [
      [0, 0.6],
      [86, 0.5],
      [100, 0.3],
    ]);
  const kidIn = f >= 124;
  const kidOpacity = 1 - clamp((f - 112) / 10);
  return (
    <Shot
      f={f}
      from={0}
      to={10000}
      cam={camMove(
        f,
        0,
        MO.belt,
        { x: 520, y: 1236, zoom: 1.0 },
        { x: 540, y: 1230, zoom: 1.06 },
      )}
    >
      <Courtyard />
      <WhiteCar
        x={COURT.carX}
        y={COURT.carY}
        s={COURT.carS}
        door={DOOR(f)}
        kid={kidIn}
      >
        {/* девочка садится: между салоном и дверью */}
        <div
          style={{
            position: "absolute",
            left: -COURT.carX,
            top: -COURT.carY,
            opacity: kidOpacity,
          }}
        >
          {f < 124 ? (
            <Actor
              uid="mo-kid"
              look="kidA"
              f={f}
              place={MO_KID}
              face={kidFace}
              pose={kidPose}
              seed={3}
            />
          ) : null}
        </div>
      </WhiteCar>
      <Actor
        uid="mo-mom"
        look="mom"
        f={f}
        place={MO_MOM}
        face={momFace}
        pose={momPose}
        seed={1}
      />
      <CourtFront />
    </Shot>
  );
};

// Крупно: девочка на заднем сиденье пристёгивает ремень.
const Belt: React.FC<{ readonly f: number }> = ({ f }) => {
  const anchor = { x: 300, y: 826 };
  const buckle = { x: 612, y: 1288 };
  const u = easeInOut((f - 10) / (MO.beltClick - MO.belt - 10));
  const tip = {
    x: lerp(anchor.x + 30, buckle.x, u),
    y: lerp(anchor.y + 60, buckle.y, u),
  };
  const kid: Place = { x: 470, y: 1560, h: 900 };
  const pose = (t: number) => ({
    expr: t < MO.beltClick - MO.belt ? ("calm" as const) : ("smile" as const),
    sit: 1,
    seat: 300,
    packOff: true,
    lookY: keys(t, [
      [0, 0.1],
      [12, 0.55],
      [MO.beltClick - MO.belt + 4, 0.55],
      [MO.beltClick - MO.belt + 16, 0],
    ]),
    nod: keys(t, [
      [0, 0],
      [12, 6],
      [MO.beltClick - MO.belt + 4, 6],
      [MO.beltClick - MO.belt + 16, 0],
    ]),
    armR: {
      target:
        t < MO.beltClick - MO.belt
          ? tip
          : keysV(t, [
              [MO.beltClick - MO.belt, buckle],
              [MO.beltClick - MO.belt + 14, { x: 560, y: 1240 }],
            ]),
      shape: "pinch" as const,
      elbow: "down" as const,
      behind: false,
    },
    armL: {
      target: { x: 400, y: 1250 },
      shape: "relax" as const,
      elbow: "down" as const,
    },
  });
  const clicked = f >= MO.beltClick - MO.belt;
  const strap = `M ${anchor.x} ${anchor.y} Q ${lerp(anchor.x, tip.x, 0.5) + 30} ${lerp(anchor.y, tip.y, 0.5) - 10} ${tip.x} ${tip.y}`;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1.32 + 0.05 * clamp(f / 90)})`,
          transformOrigin: "46% 52%",
        }}
      >
        <RearSeatBack />
        <Actor
          uid="mo-belt-kid"
          look="kidA"
          f={f}
          place={() => kid}
          face={() => 0.05}
          pose={pose}
          seed={3}
          layer="body"
        />
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d={strap}
            stroke="#1E2128"
            strokeWidth={34}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={strap}
            stroke="#3A3F4A"
            strokeWidth={24}
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x={tip.x - 16}
            y={tip.y - 22}
            width={32}
            height={40}
            rx={6}
            fill="#C9CED6"
            transform={`rotate(-30 ${tip.x} ${tip.y})`}
          />
        </svg>
        {/* подушка сиденья перед ногами и пол салона */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 1296,
            width: 920,
            height: 150,
            borderRadius: "46px 46px 30px 30px",
            backgroundColor: "#4C5361",
            boxShadow: "0 -6px 0 rgba(0,0,0,0.12) inset",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 1440,
            width: 1080,
            height: 480,
            backgroundColor: "#2F343E",
          }}
        />
        <Actor
          uid="mo-belt-kid"
          look="kidA"
          f={f}
          place={() => kid}
          face={() => 0.05}
          pose={pose}
          seed={3}
          layer="arms"
        />
      </div>
      {clicked ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 150,
            top: 1200,
            display: "flex",
            justifyContent: "center",
            fontFamily,
            ...rise(f, MO.beltClick - MO.belt + 2, 8),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 28px 12px 14px",
              borderRadius: 999,
              backgroundColor: C.green,
              color: "#FFFFFF",
              fontSize: 40,
              fontWeight: 900,
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: "rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={38} />
            </div>
            {BG22_TEXT.belt}
          </div>
        </div>
      ) : null}
    </>
  );
};

// Карта: машина едет ҮЙ → МЕКТЕП и рисует жёлтую линию.
export const MapDrive: React.FC<{
  readonly f: number;
  readonly which: "am" | "pm";
  readonly d0: number;
  readonly d1: number;
  readonly time: string;
}> = ({ f, which, d0, d1, time }) => {
  const u = cruise((f - d0) / (d1 - d0), 0.2);
  const car = carOn(which, u);
  const done = f >= d1;
  const intro = easeOut(f / 14);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${1.06 - 0.06 * intro})`,
        transformOrigin: "50% 50%",
      }}
    >
      <BishkekMap />
      <RouteLine am={which === "am" ? u : 1} pm={which === "pm" ? u : 0} />
      <Pin
        kind="home"
        pop={easeOut(f / 10)}
        check={which === "pm" && done ? easeOut((f - d1) / 8) : 0}
      />
      <Pin
        kind="school"
        pop={easeOut((f - 4) / 10)}
        check={which === "am" && done ? easeOut((f - d1) / 8) : 0}
      />
      <MapCar x={car.x} y={car.y} angle={car.angle} />
      <CityTag opacity={intro} />
      {/* время у точки старта */}
      <div
        style={{
          position: "absolute",
          left: which === "am" ? 290 : 560,
          top: which === "am" ? 1160 : 560,
          fontFamily,
          fontSize: 34,
          fontWeight: 900,
          color: C.navy,
          padding: "4px 16px",
          borderRadius: 14,
          backgroundColor: "#FFFFFF",
          border: "3px solid #DCE3EE",
          ...rise(f, 8),
        }}
      >
        {time}
      </div>
    </div>
  );
};

export const MorningScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      <Cut f={f} from={0} to={MO.belt}>
        <Street f={f} />
      </Cut>
      <Cut f={f} from={MO.belt} to={MO.map}>
        <Belt f={f - MO.belt} />
      </Cut>
      <Cut f={f} from={MO.map} to={100000} fade={10}>
        <MapDrive
          f={f - MO.map}
          which="am"
          d0={MO.drive0 - MO.map}
          d1={MO.drive1 - MO.map}
          time={BG22_TEXT.times.am}
        />
      </Cut>
      <ExampleTag f={f} at={6} />
      <PartBadge f={f} at={10} part={BG22_TEXT.part1} />
    </div>
  );
};
