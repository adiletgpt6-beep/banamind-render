// Фронтальный план стола папы (сцены 5, 7, 8) с правильным порядком
// слоёв: стена → спинки стульев → папа → ноутбук → столешница и панель
// (перекрывает ноги папы) → лист на столе → Бектур на своём стуле.
import { Actor, type PoseIn } from "../rig/Actor";
import type { Place } from "../rig/Actor";
import { C } from "../theme";
import { type Cam, Shot } from "../kit";
import { LaptopFront } from "../props/Laptop";
import { DadChairBack, DadDeskFront, GuestChairBack, GuestChairSeat, OFFICE, OfficeWall, PaperOnDesk } from "../sets/Office";
import { H, seatOf } from "./common";

export const DAD_DESK: Place = { x: OFFICE.dadSeat.x, y: OFFICE.floorY, h: H.dad };
export const BOY_CHAIR: Place = { x: OFFICE.boyChair.x, y: OFFICE.seatY, h: H.boy };
// Высота сиденья гостевого стула (GuestChairSeat: верх на seatY − 182).
export const CHAIR_SEAT = 182;
export const BOY_SEAT = CHAIR_SEAT;
export const DAD_SEAT = seatOf(H.dad);

export const OfficeFront: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly dad: { place: (t: number) => Place; face: (t: number) => number; pose: (t: number) => PoseIn; walkFrom?: number; front?: boolean };
  readonly boy: { place?: (t: number) => Place; face: (t: number) => number; pose: (t: number) => PoseIn };
  readonly laptopOpen?: number;
  readonly paperOnDesk?: boolean;
  readonly extra?: React.ReactNode; // предметы на столе поверх столешницы
  readonly evening?: number;
}> = ({ f, cam, dad, boy, laptopOpen = 1, paperOnDesk = true, extra, evening = 0 }) => {
  const dadActor = <Actor uid="of-dad" look="dadIT" f={f} place={dad.place} face={dad.face} pose={dad.pose} role="father" seed={2} walkFrom={dad.walkFrom} />;
  return (
    <Shot f={f} cam={cam} bg={C.wall}>
      <OfficeWall evening={evening} />
      <GuestChairBack x={OFFICE.dadChair.x} color={C.yellow} />
      <GuestChairBack x={OFFICE.boyChair.x} />
      <GuestChairSeat x={OFFICE.dadChair.x} color={C.yellow} />
      <GuestChairSeat x={OFFICE.boyChair.x} />
      <DadChairBack />
      {dad.front ? null : dadActor}
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} w={OFFICE.laptop.w} open={laptopOpen} />
      <DadDeskFront />
      {paperOnDesk ? <PaperOnDesk x={OFFICE.paper.x} y={OFFICE.paper.y} /> : null}
      {extra}
      {dad.front ? dadActor : null}
      <Actor uid="of-boy" look="bektur" f={f} place={boy.place ?? (() => BOY_CHAIR)} face={boy.face} pose={boy.pose} role="son" seed={4} blinkShift={37} />
    </Shot>
  );
};
