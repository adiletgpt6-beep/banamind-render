// Весь офис с мамой: фон, кресло, мама за столом (тело за столешницей,
// руки поверх), ноутбук, телефон, напоминание. Один и тот же мир рисуется
// в левой и (отражённым) в правой половине — с разными движениями мамы.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { BG45_TEXT } from "../script";
import { Chair, Desk, DeskPhone, Laptop, OFFICE, OfficeBack, ReminderPop } from "../sets/Office";
import { MOM_SEAT } from "./common";

export type OfficeState = {
  readonly f: number; // кадр сцены (для анимации)
  readonly minutes: number; // время на часах (мин от полуночи)
  readonly uid: string;
  readonly pose: (t: number) => PoseIn;
  readonly face?: (t: number) => number;
  readonly place?: (t: number) => Place;
  readonly walkFrom?: number;
  readonly speaking?: boolean; // губы по речи мамы
  readonly lid?: number; // 1 — открыт, 0 — закрыт
  readonly screen?: React.ReactNode;
  readonly laptopGlow?: number;
  readonly buzz?: number;
  readonly phoneOnDesk?: boolean;
  readonly reminder?: number;
  readonly chairSpin?: number;
  readonly bag?: number;
  readonly seed?: number;
  readonly blinks?: readonly number[];
  readonly hideMom?: boolean;
};

export const OfficeWorld: React.FC<OfficeState> = (s) => {
  const place = s.place ?? MOM_SEAT;
  const common = {
    look: "mom" as const,
    f: s.f,
    place,
    face: s.face ?? (() => 0.55),
    pose: s.pose,
    role: s.speaking ? ("mother" as const) : undefined,
    seed: s.seed ?? 6,
    blinks: s.blinks,
    walkFrom: s.walkFrom,
  };
  return (
    <>
      <OfficeBack minutes={s.minutes} f={s.f} day={BG45_TEXT.mirror.day} />
      <Chair spin={s.chairSpin ?? 0} bag={s.bag ?? 0} />
      {s.hideMom ? null : <Actor uid={`${s.uid}-b`} layer="body" {...common} />}
      <Desk>
        <Laptop x={OFFICE.laptop.x} y={OFFICE.laptop.y} f={s.f} open={s.lid ?? 1} title={BG45_TEXT.office.call} glow={s.laptopGlow} screen={s.screen} />
        <DeskPhone x={OFFICE.phone.x} y={OFFICE.phone.y} f={s.f} buzz={s.buzz ?? 0} hidden={s.phoneOnDesk === false} />
      </Desk>
      {s.hideMom ? null : <Actor uid={`${s.uid}-a`} layer="arms" {...common} />}
      <ReminderPop x={OFFICE.phone.x + 95} y={OFFICE.phone.y + 260} a={s.reminder ?? 0} time={BG45_TEXT.office.reminderTime} text={BG45_TEXT.office.reminder} />
    </>
  );
};
