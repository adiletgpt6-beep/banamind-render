// Вечерний стол семьи — общий для сцен 1, 4, 5, 6, 7, 8, 9.
// Мама и папа сидят рядом (мама слева, папа справа), сын стоит у свободного
// правого торца стола, за ним комод с машинкой. Лампа над центром стола,
// окно в стене за ним. Стороны людей и вещей не меняются между планами.
//
// Слои: стена, лампа, комод (машинка на нём), спинки стульев → тела
// родителей → столешница → предметы на столе (телефон, блокнот, машинка) →
// руки родителей → сын (стоит перед столом и комодом) → свет лампы → тон.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import { Shot, Svg, type Cam } from "../kit";
import { C, TINT } from "../theme";
import { Cabinet, ChairBacks, DiningTable, FLAT, FlatBack, Lamp, LampGlow, TABLE_SURFACE, Tone } from "../sets/Flat";
import { NotebookFlat } from "../props/Notebook30";
import { ToyCarArt } from "../props/ToyCar";
import { PHONE } from "../props/Phone30";
import { H, seatOf } from "./common";

export const PHONE_CASE = PHONE.caseColor;
export const BOY_STAND: Place = { x: FLAT.boyStand, y: FLAT.floorY + 24, h: H.boy };
export const MOM_SEAT: Place = { x: FLAT.seats.mom, y: FLAT.floorY - 30, h: H.mom };
export const DAD_SEAT: Place = { x: FLAT.seats.dad, y: FLAT.floorY - 30, h: H.dad };
export const SURF_Y = FLAT.table.top - 6; // линия опоры предметов на столешнице
export const CAR_LEN = 74;
export const CAR_ON_TABLE = { x: 868, y: SURF_Y + 10 };
export const PHONE_ON_TABLE = { x: FLAT.phoneOnTable.x, y: TABLE_SURFACE.y1 - 10 };
// Запястье мамы, когда телефон в её руке лежит плашмя ровно на месте
// PHONE_ON_TABLE (сверено по кадрам: тот же размер и место — без скачка).
export const PHONE_HAND_AT_TABLE = { x: PHONE_ON_TABLE.x + 26, y: PHONE_ON_TABLE.y - 30 };

// Базовые позы за столом.
export const seated = (p: Place): PoseIn => ({
  sit: 1,
  seat: seatOf(p.h) + 30,
  expr: "calm",
  armL: { target: { x: p.x - 70, y: FLAT.table.top + 4 }, shape: "relax", elbow: "down", behind: false },
  armR: { target: { x: p.x + 70, y: FLAT.table.top + 4 }, shape: "relax", elbow: "down", behind: false },
});

// Мама держит телефон перед собой (экраном к себе — зрителю виден чехол).
export const momPhoneHand = (dx = 40, dy = -150) => ({
  target: { x: MOM_SEAT.x + dx, y: FLAT.table.top + dy },
  shape: "phone" as const,
  item: "phone" as const,
  itemColor: PHONE_CASE,
  glow: -1,
  flat: 0,
  itemTilt: -8,
  elbow: "down" as const,
  behind: false,
});

export type PropsState = {
  readonly phone: "hand" | "table"; // в руке у мамы (рисует риг) или лежит экраном вниз
  readonly car: "cabinet" | "hand" | "table";
  readonly notebookRows: number;
};

// Телефон лежит на столе экраном вниз (виден светлый чехол).
const PhoneFlat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M ${x - 46} ${y} L ${x + 46} ${y} L ${x + 41} ${y - 20} L ${x - 41} ${y - 20} Z`} fill={PHONE_CASE} stroke={PHONE.caseShade} strokeWidth={2.5} strokeLinejoin="round" />
    <rect x={x - 32} y={y - 16} width={15} height={9} rx={3} fill="rgba(0,0,0,0.2)" />
  </g>
);

export type Cast = {
  readonly momPose: (t: number) => PoseIn;
  readonly momFace: (t: number) => number;
  readonly dadPose: (t: number) => PoseIn;
  readonly dadFace: (t: number) => number;
  readonly boyPlace?: (t: number) => Place;
  readonly boyPose: (t: number) => PoseIn;
  readonly boyFace: (t: number) => number;
  readonly boyLook?: LookId;
  readonly boyWalkFrom?: number;
  readonly boyBlinks?: readonly number[];
  readonly hideBoy?: boolean;
};

export const DiningRoom: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly cast: Cast;
  readonly props: PropsState;
  readonly warm?: number;
  readonly fg?: React.ReactNode; // передний план (размытый край предмета)
}> = ({ f, cam, cast, props, warm = 1, fg }) => {
  const boyPlace = cast.boyPlace ?? (() => BOY_STAND);
  const mom = (layer: "body" | "arms") => <Actor uid="r-mom" look="km2MomHome" f={f} place={() => MOM_SEAT} face={cast.momFace} pose={cast.momPose} role="mother" seed={5} layer={layer} />;
  const dad = (layer: "body" | "arms") => <Actor uid="r-dad" look="km2Dad" f={f} place={() => DAD_SEAT} face={cast.dadFace} pose={cast.dadPose} role="father" seed={2} blinkShift={31} layer={layer} />;
  return (
    <Shot f={f} cam={cam} bg={C.wallHome}>
      <FlatBack warm={warm} />
      <Lamp warm={warm} />
      <Cabinet />
      {props.car === "cabinet" ? (
        <Svg>
          <ToyCarArt x={FLAT.carOnCabinet.x} y={FLAT.carOnCabinet.y} len={CAR_LEN} dir={-1} />
        </Svg>
      ) : null}
      <ChairBacks />
      {mom("body")}
      {dad("body")}
      <DiningTable />
      <NotebookFlat x={FLAT.notebook.x} y={TABLE_SURFACE.y1 - 12} rows={props.notebookRows} />
      <Svg>
        {props.phone === "table" ? <PhoneFlat x={PHONE_ON_TABLE.x} y={PHONE_ON_TABLE.y} /> : null}
        {props.car === "table" ? <ToyCarArt x={CAR_ON_TABLE.x} y={CAR_ON_TABLE.y} len={CAR_LEN} dir={-1} /> : null}
      </Svg>
      {mom("arms")}
      {dad("arms")}
      {cast.hideBoy ? null : (
        <Actor uid="r-boy" look={cast.boyLook ?? "km2Boy"} f={f} place={boyPlace} face={cast.boyFace} pose={cast.boyPose} role="boy" seed={9} blinkShift={17} walkFrom={cast.boyWalkFrom} blinks={cast.boyBlinks} />
      )}
      <LampGlow warm={warm} />
      {fg}
      <Tone color={warm ? TINT.warm : TINT.cool} />
    </Shot>
  );
};
