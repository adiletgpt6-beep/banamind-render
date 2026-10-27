// Мама за рабочим столом в офисе: общий мир для сцен 2, 3 и 5.
// Порядок слоёв: стена → кресло → тело → стол и предметы → руки.
import { Actor, type PoseIn } from "../rig/Actor";
import { PhoneFlat } from "../sets/Apartment";
import { DeskFront, Folders, LaptopSide, Mug, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { seated } from "./common";

export const MOM = seated(OFFICE.seat.mom);

export const OfficeWorld: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly minutes: number;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  readonly phoneGlow?: number;
  readonly screenTint?: string;
  readonly speaking?: boolean;
}> = ({ f, uid, minutes, face, pose, phoneGlow = 0, screenTint, speaking }) => (
  <>
    <OfficeBack minutes={minutes} />
    <OfficeChair x={MOM.x} />
    <Actor uid={uid} look="mom" f={f} place={() => MOM} face={face} pose={pose} role={speaking === false ? undefined : "mother"} seed={1} layer="body" />
    <DeskFront />
    <Folders x={OFFICE.folders.x} y={OFFICE.folders.y} />
    <LaptopSide x={OFFICE.laptop.x} y={OFFICE.laptop.y} tint={screenTint} />
    <Mug x={OFFICE.mug.x} y={OFFICE.mug.y} />
    <PhoneFlat x={OFFICE.phone.x} y={OFFICE.phone.y - 6} glow={phoneGlow} scale={1.15} />
    <Actor uid={uid} look="mom" f={f} place={() => MOM} face={face} pose={pose} role={speaking === false ? undefined : "mother"} seed={1} layer="arms" />
  </>
);
