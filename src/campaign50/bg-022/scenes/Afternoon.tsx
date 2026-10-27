// Сцена 3 (≈19–33 с): 2-бөлүк — сабактан кийин МЕКТЕП → ҮЙ.
//   A. Шкала дня: часы идут 08:00 → 13:00, у школы проходят «Сабактар»
//      (четыре урока-книжки), звенит звонок.
//   B. Карта: та же машина едет от МЕКТЕП обратно к ҮЙ — жёлтая линия
//      продолжается и замыкается в одну петлю (вспышка-подсветка).
//   C. Улица у дома: дверь машины открывается, девочка выходит и идёт к
//      маме — передача только родителю или согласованному взрослому.
import { useCurrentFrame } from "remotion";
import { Actor, type Place } from "../../../two-schedules-2d/rig/Actor";
import {
  anticipate,
  clamp,
  easeInOut,
  keys,
  keysV,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { camMove, Shot } from "../../../two-schedules-2d/shots";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { BG22_TEXT } from "../script";
import {
  COURT,
  CourtFront,
  Courtyard,
  Cut,
  ExampleTag,
  PartBadge,
  SchoolIcon,
  WhiteCar,
  rise,
} from "../ui";
import { depthK, KID_H, MapDrive, MOM_H, walk } from "./Morning";

export const AF = {
  map: 96,
  drive0: 108,
  drive1: 248,
  street: 278,
  door0: 288,
  out: 300,
  meet: 360,
} as const;

// Шкала дня: часы и уроки.
const Day: React.FC<{ readonly f: number }> = ({ f }) => {
  const u = easeInOut((f - 6) / 70);
  const minutes = lerp(8 * 60, 13 * 60, u);
  const hh = Math.floor(minutes / 60);
  const mm = Math.floor(minutes % 60);
  const label = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  const ring =
    f > 78 ? Math.sin((f - 78) * 1.6) * 6 * (1 - clamp((f - 78) / 18)) : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        fontFamily,
        color: C.navy,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -200,
          top: 360,
          width: 760,
          height: 760,
          borderRadius: 380,
          backgroundColor: C.yellowSoft,
        }}
      />
      {/* школа */}
      <div
        style={{
          position: "absolute",
          left: 540 - 130,
          top: 380,
          ...rise(f, 0),
        }}
      >
        <SchoolIcon size={260} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 650,
          textAlign: "center",
          fontSize: 46,
          fontWeight: 900,
          ...rise(f, 4),
        }}
      >
        {BG22_TEXT.school}
      </div>
      {/* часы */}
      <svg
        width={300}
        height={300}
        viewBox="-150 -150 300 300"
        style={{
          position: "absolute",
          left: 390,
          top: 730,
          transform: `rotate(${ring}deg)`,
        }}
      >
        <circle r={130} fill="#FFFFFF" stroke={C.navy} strokeWidth={12} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x={-4}
            y={-118}
            width={8}
            height={20}
            rx={3}
            fill={C.navy}
            transform={`rotate(${i * 30})`}
          />
        ))}
        <rect
          x={-6}
          y={-70}
          width={12}
          height={78}
          rx={6}
          fill={C.navy}
          transform={`rotate(${(minutes / 60) * 30})`}
        />
        <rect
          x={-4}
          y={-102}
          width={8}
          height={110}
          rx={4}
          fill={C.yellowDeep}
          transform={`rotate(${(minutes % 60) * 6})`}
        />
        <circle r={12} fill={C.navy} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1040,
          textAlign: "center",
          fontSize: 72,
          fontWeight: 1000,
        }}
      >
        {label}
      </div>
      {/* уроки */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 1140,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {[0, 1, 2, 3].map((i) => {
          const on = clamp((f - 14 - i * 14) / 8);
          return (
            <div
              key={i}
              style={{
                width: 120,
                height: 64,
                borderRadius: 14,
                backgroundColor: on > 0.5 ? C.yellow : "#E8ECF3",
                border: `4px solid ${on > 0.5 ? C.yellowDeep : "#D3DAE6"}`,
                transform: `scale(${0.9 + 0.1 * on})`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1220,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 800,
          color: C.muted,
          ...rise(f, 10),
        }}
      >
        {BG22_TEXT.lessons}
      </div>
    </div>
  );
};

// Улица: девочка выходит из машины и идёт к маме (кадры плана, от 0).
const AF_MOM = (): Place => ({ x: 230, y: 1622, h: MOM_H * depthK(1622) });
const AF_KID = (t: number): Place =>
  t < 30
    ? walk(
        t,
        12,
        30,
        { x: COURT.doorX, y: 1446 },
        { x: COURT.doorX - 30, y: 1540 },
        KID_H,
        0.4,
      )
    : walk(
        t,
        30,
        80,
        { x: COURT.doorX - 30, y: 1540 },
        { x: 380, y: 1590 },
        KID_H,
        0.25,
      );

const Arrive: React.FC<{ readonly f: number }> = ({ f }) => {
  const door = keys(f, [
    [AF.door0 - AF.street, 0],
    [AF.out - AF.street, 1],
    [AF.out - AF.street + 40, 1],
    [AF.out - AF.street + 54, 0],
  ]);
  const meet = AF.meet - AF.street;
  const kidPose = (t: number) => {
    const p = AF_KID(t);
    const m = AF_MOM();
    return {
      expr: "smile" as const,
      strapTug: 0.6,
      armL: {
        target: keysV(
          t,
          [
            [0, { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h }],
            [
              meet - 14,
              { x: AF_KID(meet - 14).x - 0.12 * p.h, y: p.y - 0.42 * p.h },
            ],
            [meet, { x: m.x + 0.2 * m.h, y: m.y - 0.5 * m.h }],
          ],
          anticipate,
        ),
        shape: t >= meet ? ("fist" as const) : ("relax" as const),
        elbow: "down" as const,
      },
      armR: {
        target: { x: p.x + 0.14 * p.h, y: p.y - 0.42 * p.h },
        shape: "relax" as const,
      },
    };
  };
  const momPose = (t: number) => {
    const m = AF_MOM();
    return {
      expr: "smile" as const,
      bagOnShoulder: 1,
      crouch: keys(t, [
        [meet - 24, 0],
        [meet - 6, 0.12],
      ]),
      lean: keys(t, [
        [meet - 24, 0],
        [meet - 6, 10],
      ]),
      armR: {
        target: keysV(
          t,
          [
            [0, { x: m.x + 0.12 * m.h, y: m.y - 0.45 * m.h }],
            [meet - 20, { x: m.x + 0.12 * m.h, y: m.y - 0.45 * m.h }],
            [meet, { x: m.x + 0.2 * m.h, y: m.y - 0.5 * m.h }],
          ],
          anticipate,
        ),
        shape: t >= meet - 10 ? ("open" as const) : ("relax" as const),
        elbow: "down" as const,
      },
      armL: {
        target: { x: m.x - 0.12 * m.h, y: m.y - 0.45 * m.h },
        shape: "relax" as const,
      },
      lookY: keys(t, [
        [meet - 30, 0],
        [meet - 8, 0.4],
      ]),
    };
  };
  const kidFace = (t: number) =>
    keys(t, [
      [0, -0.2],
      [26, -0.6],
    ]);
  const kidVisible = f >= AF.out - AF.street - 6;
  return (
    <Shot
      f={f}
      from={0}
      to={10000}
      cam={camMove(
        f,
        0,
        130,
        { x: 540, y: 1230, zoom: 1.06 },
        { x: 480, y: 1240, zoom: 1.1 },
      )}
    >
      <Courtyard />
      <WhiteCar
        x={COURT.carX}
        y={COURT.carY}
        s={COURT.carS}
        door={door}
        kid={!kidVisible}
      >
        <div
          style={{
            position: "absolute",
            left: -COURT.carX,
            top: -COURT.carY,
            opacity: clamp((f - (AF.out - AF.street - 6)) / 8),
          }}
        >
          {kidVisible && f < 12 + (AF.out - AF.street) ? (
            <Actor
              uid="af-kid"
              look="kidA"
              f={f}
              place={AF_KID}
              face={kidFace}
              pose={kidPose}
              seed={3}
            />
          ) : null}
        </div>
      </WhiteCar>
      {f >= 12 + (AF.out - AF.street) ? (
        <Actor
          uid="af-kid"
          look="kidA"
          f={f}
          place={AF_KID}
          face={kidFace}
          pose={kidPose}
          seed={3}
        />
      ) : null}
      <Actor
        uid="af-mom"
        look="mom"
        f={f}
        place={AF_MOM}
        face={() => 0.45}
        pose={momPose}
        seed={1}
      />
      <CourtFront />
    </Shot>
  );
};

export const AfternoonScene: React.FC = () => {
  const f = useCurrentFrame();
  const closeLoop =
    clamp((f - AF.drive1) / 10) * (1 - clamp((f - AF.drive1 - 18) / 14));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      <Cut f={f} from={0} to={AF.map}>
        <Day f={f} />
      </Cut>
      <Cut f={f} from={AF.map} to={AF.street} fade={10}>
        <MapDrive
          f={f - AF.map}
          which="pm"
          d0={AF.drive0 - AF.map}
          d1={AF.drive1 - AF.map}
          time={BG22_TEXT.times.pm}
        />
        {/* петля замкнулась: мягкая подсветка */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.yellow,
            opacity: 0.12 * closeLoop,
          }}
        />
      </Cut>
      <Cut f={f} from={AF.street} to={100000} fade={10}>
        <Arrive f={f - AF.street} />
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 150,
            top: 450,
            display: "flex",
            justifyContent: "center",
            fontFamily,
            ...rise(f, AF.meet - 6),
          }}
        >
          <div
            style={{
              padding: "14px 28px",
              borderRadius: 26,
              backgroundColor: "rgba(255,255,255,0.95)",
              border: `4px solid ${C.yellow}`,
              color: C.navy,
              fontSize: 38,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            {BG22_TEXT.handover}
          </div>
        </div>
      </Cut>
      {f >= AF.map ? <ExampleTag f={f} at={AF.map + 4} /> : null}
      <PartBadge f={f} at={6} part={BG22_TEXT.part2} />
    </div>
  );
};
