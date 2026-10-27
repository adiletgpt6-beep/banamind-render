// Общие миры сцен: класс (сын, учительница, одноклассница) и офис (мама).
// Позы задаются функциями от кадра сцены; персонажи и предметы стоят
// на одних и тех же местах во всех планах (ничего не «прыгает»).
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, keys, keysV, type Vec } from "../../../two-schedules-2d/rig/motion";
import { seatH } from "../../../two-schedules-2d/sets/Home";
import { CLASS, ClassDeskFront, ClassroomBack, HandBell, OFFICE, OfficeBack, OfficeChairBack, OfficeDeskFront, PackOnDesk } from "../sets";

export const SON: Place = CLASS.son;
export const TEACHER: Place = CLASS.teacher;
export const KID: Place = CLASS.kid;
export const MOM: Place = { x: OFFICE.mom.x, y: OFFICE.seatY, h: OFFICE.mom.h };
const constPlace = (p: Place) => () => p;
export const SON_AT = constPlace(SON);
export const TEACHER_AT = constPlace(TEACHER);
export const KID_AT = constPlace(KID);
export const MOM_AT = constPlace(MOM);

export const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });

// ---------- Класс ----------
export type ClassState = {
  readonly f: number;
  // колокольчик в руке учительницы: поднят (bellUp 0…1) и качание (°)
  readonly bellUp: (t: number) => number;
  readonly swing: number;
  // сын: что делает
  readonly son: (t: number) => PoseIn;
  readonly sonFace: (t: number) => number;
  readonly teacher?: (t: number) => PoseIn;
  readonly teacherFace?: (t: number) => number;
  readonly packOpen: number;
  readonly packFill: number;
  // колокольчик в правой руке (опущен), блокнот убран: левая рука свободна
  readonly bellRight?: boolean;
  // рюкзак собран и надет (сын готов идти домой)
  readonly packWorn?: boolean;
};

// Рука учительницы с колокольчиком: поднята над партой или опущена.
export const BELL_UP: Vec = { x: 735, y: 905 };
export const BELL_DOWN: Vec = at(TEACHER, -0.13, -0.45);
export const BELL_RIGHT: Vec = at(TEACHER, 0.14, -0.45);
export const bellHand = (u: number): Vec => ({ x: BELL_DOWN.x + (BELL_UP.x - BELL_DOWN.x) * u, y: BELL_DOWN.y + (BELL_UP.y - BELL_DOWN.y) * u });

export const Classroom: React.FC<ClassState & { readonly uid: string }> = (s) => {
  const { f } = s;
  const hand = s.bellRight ? BELL_RIGHT : bellHand(s.bellUp(f));
  const teacherPose = (t: number): PoseIn => {
    const extra = s.teacher?.(t) ?? {};
    return {
      expr: "softSmile",
      armL: { target: bellHand(s.bellUp(t)), shape: "fist", elbow: "out", behind: false },
      armR: s.bellRight ? { target: BELL_RIGHT, shape: "fist", elbow: "down" } : { target: at(TEACHER, 0.1, -0.5), shape: "fist", item: "notebook", elbow: "down" },
      ...extra,
    };
  };
  const kidPose = (t: number): PoseIn => ({
    expr: "softSmile",
    strapTug: keys(t, [[0, 0.2], [40, 1], [80, 0.4], [120, 1], [170, 0.3]]),
    armL: { target: at(KID, -0.14, -0.62), shape: "fist", elbow: "down" },
    armR: { target: at(KID, 0.13, -0.62), shape: "fist", elbow: "down" },
  });
  return (
    <>
      <ClassroomBack />
      <Actor uid={`${s.uid}-kid`} look="kidA" f={f} place={KID_AT} face={() => 0.3} pose={kidPose} seed={7} />
      <Actor uid={`${s.uid}-son`} look="son" f={f} place={SON_AT} face={s.sonFace} pose={(t) => ({ packOff: !s.packWorn, ...s.son(t) })} role="son" seed={4} />
      <ClassDeskFront />
      {s.packWorn ? null : <PackOnDesk open={s.packOpen} fill={s.packFill} />}
      <Actor uid={`${s.uid}-teacher`} look="teacher" f={f} place={TEACHER_AT} face={s.teacherFace ?? (() => -0.35)} pose={teacherPose} seed={5} />
      <HandBell x={hand.x} y={hand.y - 6} swing={s.swing} s={0.8} />
    </>
  );
};

// Сын у парты: руки на столешнице (по умолчанию).
export const sonRest = (): PoseIn => ({
  expr: "softSmile",
  armL: { target: at(SON, -0.2, -0.47), shape: "relax", elbow: "down" },
  armR: { target: at(SON, 0.2, -0.47), shape: "relax", elbow: "down" },
});

// Сборка рюкзака: тетрадь → в рюкзак, пенал → в рюкзак, клапан закрыт.
// t0 — начало действия (кадр сцены).
export const packing = (t0: number) => {
  const desk1 = at(SON, -0.16, -0.48);
  const desk2 = at(SON, -0.02, -0.48);
  const top = { x: CLASS.pack.x - 30, y: CLASS.pack.y - 190 };
  const pose = (t: number): PoseIn => {
    const r = t - t0;
    const holding = (r > 8 && r < 34) || (r > 44 && r < 70);
    return {
      expr: "softSmile",
      lookY: 0.45,
      lean: keys(r, [[0, 0], [8, 6], [90, 6], [104, 0]]),
      armR: {
        target: keysV(r, [[0, at(SON, 0.2, -0.47)], [8, desk1], [30, top], [40, desk2], [66, top], [80, { x: CLASS.pack.x - 10, y: CLASS.pack.y - 160 }], [98, { x: CLASS.pack.x - 10, y: CLASS.pack.y - 110 }], [112, at(SON, 0.2, -0.47)]], anticipate),
        shape: holding ? "pinch" : r >= 78 && r < 100 ? "pinch" : "relax",
        item: r > 8 && r < 34 ? "notebook" : r > 44 && r < 70 ? "pencilcase" : "none",
        elbow: "down",
        behind: false,
      },
      armL: { target: at(SON, -0.2, -0.47), shape: "relax", elbow: "down" },
    };
  };
  const fill = (t: number) => keys(t - t0, [[30, 0], [34, 0.4], [66, 0.4], [70, 1]]);
  const open = (t: number) => keys(t - t0, [[0, 1], [80, 1], [98, 0]]);
  return { pose, fill, open };
};

// ---------- Офис ----------
export type OfficeState = {
  readonly f: number;
  readonly mom: (t: number) => PoseIn;
  readonly face: (t: number) => number;
  readonly phoneOnDesk: boolean;
  readonly phoneGlow?: number;
  readonly phoneShake?: number;
};

export const MOM_EAR: Vec = at(MOM, 0.1, -0.66);
export const MOM_LOOK: Vec = at(MOM, 0.15, -0.5);
export const onDesk = (x: number, dy = 0): Vec => ({ x, y: OFFICE.desk.top + 6 + dy });
export const momSeat = seatH(MOM.h);
export const typing = (k: number, t: number): Vec => onDesk(OFFICE.laptop.x - 56 + k * 22 + Math.sin(t * 1.7 + k) * 3, -4 - Math.abs(Math.sin(t * 1.3 + k * 2)) * 5);

export const Office: React.FC<OfficeState & { readonly uid: string }> = (s) => (
  <>
    <OfficeBack />
    <OfficeChairBack x={MOM.x} />
    <Actor uid={`${s.uid}-mom`} look="mom" f={s.f} place={MOM_AT} face={s.face} pose={(t) => ({ sit: 1, seat: momSeat, ...s.mom(t) })} role="mother" seed={1} layer="body" />
    <OfficeDeskFront phone={s.phoneOnDesk} phoneGlow={s.phoneGlow} phoneShake={s.phoneShake} />
    <Actor uid={`${s.uid}-mom`} look="mom" f={s.f} place={MOM_AT} face={s.face} pose={(t) => ({ sit: 1, seat: momSeat, ...s.mom(t) })} role="mother" seed={1} layer="arms" />
  </>
);

// Мама держит телефон у уха (рабочий разговор / сын).
export const phoneAtEar = (): NonNullable<PoseIn["armR"]> => ({ target: MOM_EAR, shape: "phone", item: "phone", glow: 1, itemTilt: -18, elbow: "down", behind: false, flat: 0 });
export const handOnDesk = (side: -1 | 1): NonNullable<PoseIn["armL"]> => ({ target: onDesk(MOM.x + side * 0.12 * MOM.h, -4), shape: "relax", elbow: "down" });
