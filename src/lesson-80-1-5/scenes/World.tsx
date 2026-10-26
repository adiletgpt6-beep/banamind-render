// Мир сцены: комната, 22 фоновых ученика, учитель и три главных героя у
// столика, предметы на столе — в правильном порядке слоёв: тело за
// столешницей, предметы на столе, руки поверх (при подъёме лодочки —
// лодочка между ладонями и пальцами), передняя кромка стола.
import { useContext } from "react";
import { SceneContext, TimelineContext } from "../context";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, slowNoise, type Vec } from "../rig/motion";
import { L815_PROPS } from "../script";
import { Basin, Boat, BoatForm, Sheet, Stack, Towel } from "../set/Paper";
import { ROOM, RoomBack, TableFront, TableTop } from "../set/Room";
import { BACKGROUND, CAST, lookIdOf, pupilPlace, speakerAt, turnTo, type CastFns, type Main } from "./common";

export type BoatDryState = { readonly x: number; readonly y: number; readonly lift?: number; readonly rot?: number; readonly creases?: boolean; readonly s?: number; readonly inHands?: boolean };
export type SheetState = { readonly x: number; readonly y: number; readonly lift?: number; readonly rot?: number; readonly inHands?: boolean; readonly fold?: number; readonly pressed?: boolean };
export type FormState = { readonly x: number; readonly y: number; readonly fold: number; readonly open: number; readonly hull: number; readonly lift?: number; readonly inHands?: boolean };

export type PropsState = {
  // плавающая лодочка (в ёмкости): смещение от центра воды и покачивание
  readonly floating?: { readonly dx: number; readonly dy: number; readonly rot: number; readonly visible: boolean };
  readonly ripple?: number; // 0…1 — рябь от касания (затухает к 1)
  readonly rippleAt?: Vec;
  readonly boatDry?: BoatDryState | null;
  readonly sheetDemo?: SheetState | null;
  readonly sheetFinal?: SheetState | null;
  readonly form?: FormState | null; // заготовка в сцене 1
  readonly stackCount?: number;
};

// Плавающая лодочка после сцены 1: лёгкий дрейф и покачивание внутри
// ёмкости (абсолютный кадр ролика — непрерывно между сценами).
export const floatingAt = (absFrame: number) => ({
  dx: 14 + Math.sin(absFrame / 61) * 9,
  dy: Math.sin(absFrame / 29) * 1.5,
  rot: Math.sin(absFrame / 37) * 2,
  visible: true,
});

export type WorldProps = {
  readonly f: number;
  readonly cast: Partial<Record<Main | "teacher", CastFns>>;
  readonly props: PropsState;
  readonly board?: React.ReactNode;
  // точка внимания группы (мир); по умолчанию — говорящий или столик
  readonly focus?: (t: number) => Vec;
  readonly groupMood?: (t: number, seed: number) => PoseIn["expr"];
  readonly hideBackground?: boolean;
};

const ROLE_OF: Record<Main | "teacher", "yusuf" | "amir" | "bilal" | "teacher"> = { yusuf: "yusuf", amir: "amir", bilal: "bilal", teacher: "teacher" };
const SEED: Record<Main | "teacher", number> = { yusuf: 11, amir: 12, bilal: 13, teacher: 7 };

export const World: React.FC<WorldProps> = ({ f, cast, props, board, focus, groupMood, hideBackground }) => {
  const tl = useContext(TimelineContext);
  const sceneStart = useContext(SceneContext);
  const basin = ROOM.props.basin;
  const defaultFocus = (t: number): Vec => {
    const sp = speakerAt(tl, sceneStart, t);
    if (sp && sp !== "kids") return { x: CAST[sp].x, y: CAST[sp].y - CAST[sp].h * 0.4 };
    return { x: ROOM.props.work.x, y: ROOM.props.work.y };
  };
  const focusFn = focus ?? defaultFocus;

  // ---------- фоновые ученики ----------
  const background = hideBackground
    ? null
    : BACKGROUND.map((p) => {
        const place = pupilPlace(p);
        const face = (t: number) => {
          const fx = focusFn(t);
          const base = turnTo(place, fx) * 0.75;
          return clamp(base + slowNoise(t, p.seed, 110) * 0.18, -0.85, 0.85);
        };
        const pose = (t: number): PoseIn => ({
          expr: groupMood ? groupMood(t, p.seed) : (["calm", "listening", "softSmile"] as const)[p.seed % 3],
          lookY: 0.15 + slowNoise(t, p.seed + 3, 140) * 0.12,
          headTilt: slowNoise(t, p.seed + 5, 170) * 3,
          lean: 2 + slowNoise(t, p.seed + 9, 200) * 2,
          sway: slowNoise(t, p.seed + 7, 160) * 4,
          armL: { target: null, shape: "rest" },
          armR: { target: null, shape: "rest" },
        });
        return <Actor key={p.id} uid={`bg-${p.id}`} look={p.id} f={f} place={place} face={face} pose={pose} seed={p.seed} role="kids" />;
      });

  // ---------- главные герои ----------
  const main = (who: Main | "teacher", layer: "body" | "arms" | "armsBack" | "armsFront") => {
    const c = cast[who] ?? {};
    return (
      <Actor
        key={`${who}-${layer}`}
        uid={`m-${who}`}
        look={lookIdOf(who)}
        f={f}
        place={CAST[who]}
        face={c.face ?? ((t) => turnTo(CAST[who], focusFn(t)) * 0.8)}
        pose={c.pose}
        role={who === "teacher" ? "teacher" : [ROLE_OF[who], "kids"]}
        seed={SEED[who]}
        blinks={c.blinks}
        layer={layer}
      />
    );
  };
  // порядок по глубине: дальние (меньше y) раньше
  const order = (["bilal", "amir", "yusuf", "teacher"] as const).slice().sort((a, b) => CAST[a].y - CAST[b].y);

  // ---------- предметы на столе ----------
  const fl = props.floating;
  const holdDry = props.boatDry?.inHands;
  const holdForm = props.form?.inHands;
  const holdSheet = props.sheetFinal?.inHands || props.sheetDemo?.inHands;
  const between = holdDry || holdForm || holdSheet;
  // заготовка: после расправления борта рисуется как готовая лодочка
  const formEl = (fm: FormState) =>
    fm.hull >= 1 ? <Boat x={fm.x} y={fm.y} lift={fm.lift} s={0.78} /> : <BoatForm x={fm.x} y={fm.y} fold={fm.fold} open={fm.open} hull={fm.hull} lift={fm.lift} s={0.78} />;
  const tableProps = (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <Stack x={ROOM.props.stack.x} y={ROOM.props.stack.y} n={props.stackCount ?? 6} />
      <Towel x={ROOM.props.towel.x} y={ROOM.props.towel.y} />
      {props.sheetDemo && !props.sheetDemo.inHands ? <Sheet x={props.sheetDemo.x} y={props.sheetDemo.y} lift={props.sheetDemo.lift} rot={props.sheetDemo.rot} /> : null}
      {props.sheetFinal && !props.sheetFinal.inHands ? <Sheet x={props.sheetFinal.x} y={props.sheetFinal.y} lift={props.sheetFinal.lift} rot={props.sheetFinal.rot} fold={props.sheetFinal.fold} pressed={props.sheetFinal.pressed} /> : null}
      {props.boatDry && !props.boatDry.inHands ? <Boat x={props.boatDry.x} y={props.boatDry.y} lift={props.boatDry.lift} rot={props.boatDry.rot} s={props.boatDry.s ?? 0.78} creases={props.boatDry.creases} /> : null}
      {props.form && !props.form.inHands ? formEl(props.form) : null}
      <Basin x={basin.x} y={basin.y} uid={`w-${L815_PROPS.basin}`} f={f + sceneStart} ripple={props.ripple} rippleAt={props.rippleAt}>
        {fl?.visible ? <Boat x={fl.dx} y={fl.dy - 4} rot={fl.rot} s={0.7} shadow={false} /> : null}
      </Basin>
    </svg>
  );
  const inHands = between ? (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {props.boatDry?.inHands ? <Boat x={props.boatDry.x} y={props.boatDry.y} lift={props.boatDry.lift} rot={props.boatDry.rot} s={props.boatDry.s ?? 0.78} creases={props.boatDry.creases} /> : null}
      {props.form?.inHands ? formEl(props.form) : null}
      {props.sheetFinal?.inHands ? <Sheet x={props.sheetFinal.x} y={props.sheetFinal.y} lift={props.sheetFinal.lift} rot={props.sheetFinal.rot} fold={props.sheetFinal.fold} pressed={props.sheetFinal.pressed} /> : null}
      {props.sheetDemo?.inHands ? <Sheet x={props.sheetDemo.x} y={props.sheetDemo.y} lift={props.sheetDemo.lift} rot={props.sheetDemo.rot} /> : null}
    </svg>
  ) : null;

  return (
    <>
      <RoomBack f={f + sceneStart} board={board} />
      {background}
      {order.map((who) => main(who, "body"))}
      <TableTop />
      {tableProps}
      {between ? (
        <>
          {order.map((who) => main(who, "armsBack"))}
          {inHands}
          {order.map((who) => main(who, "armsFront"))}
        </>
      ) : (
        order.map((who) => main(who, "arms"))
      )}
      <TableFront />
    </>
  );
};
