// Кухня бишкекской квартиры (общая декорация «Эки график», read-only) и
// мама за столом с чеком в руках. Персонаж — готовый 2D-риг проекта
// (src/two-schedules-2d/rig): моргание, взгляд, мимика, губы по реальной
// озвучке реплики мамы.
import { useMemo } from "react";
import { CuesContext, SceneContext as Ts2SceneContext } from "../../two-schedules-2d/context";
import { Actor, type PoseIn, type WorldArm } from "../../two-schedules-2d/rig/Actor";
import { seatOf, seated } from "../../two-schedules-2d/scenes/common";
import { ChairBack, HOME, HomeBack, Piala, TableFront, Teapot } from "../../two-schedules-2d/sets/Home";
import { Shot, type Cam } from "../../two-schedules-2d/shots";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { useScene, useTimeline } from "./context";

export const MOM_X = 760;
export const MOM = seated("mom", MOM_X);
// Чек в руках мамы (мир): центр по x, верхний край (ниже подбородка — лицо
// не закрыто) и ширина. Камера среднего плана — KITCHEN_CAM.
export const HELD = { x: MOM_X, top: 1100, w: 170, handY: 1190 } as const;
export const KITCHEN_CAM = { x: MOM_X, y: 1135, zoom: 2.25 } as const;

// Губы мамы: риг читает реплики из контекста «Эки график» — передаём ему
// реплики этого ролика (роль mother) на шкале BG-031.
export const MomLips: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const tl = useTimeline();
  const { from } = useScene();
  const cues = useMemo<Ts2Cue[]>(
    () =>
      tl.cues
        .filter((c) => c.role === "mother")
        .map((c) => ({
          id: c.id,
          role: "mother" as const,
          file: c.file,
          audioFrom: c.audioFrom,
          durationSec: c.durationSec,
          from: c.from,
          to: c.to,
          words: c.words,
          chars: c.chars,
          env: c.env,
        })),
    [tl],
  );
  return (
    <CuesContext.Provider value={cues}>
      <Ts2SceneContext.Provider value={from}>{children}</Ts2SceneContext.Provider>
    </CuesContext.Provider>
  );
};

// Руки держат лист за нижние боковые края на высоте y (точки в мире);
// лист рисуется поверх предплечий — видны кисти по краям.
export const holdArms = (cx: number, y: number, w: number): { armL: WorldArm; armR: WorldArm } => ({
  armL: { target: { x: cx - w / 2 - 4, y }, shape: "pinch", elbow: "down", behind: false },
  armR: { target: { x: cx + w / 2 + 4, y }, shape: "pinch", elbow: "down", behind: false },
});

export const KitchenShot: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly cam: Cam;
  readonly minutes?: number;
  readonly pose: (t: number) => PoseIn;
  readonly face?: (t: number) => number;
  readonly held?: React.ReactNode; // чек и другие предметы в руках (мир)
  readonly overlay?: React.ReactNode;
}> = ({ f, from, to, cam, minutes = 7 * 60 + 40, pose, face, held, overlay }) => {
  const full = (t: number): PoseIn => ({ sit: 1, seat: seatOf(MOM), ...pose(t) });
  const faceFn = face ?? (() => 0.05);
  return (
    <Shot f={f} from={from} to={to} cam={cam} overlay={overlay}>
      <MomLips>
        <HomeBack minutes={minutes} f={f} />
        <ChairBack x={MOM.x} />
        <Actor uid="bg31-mom" look="mom" f={f} place={() => MOM} face={faceFn} pose={full} role="mother" seed={3} layer="body" />
        <TableFront />
        <Piala x={MOM_X - 300} y={HOME.table.top + 14} />
        <Teapot x={MOM_X + 330} y={HOME.table.top + 14} s={0.85} />
        <Actor uid="bg31-mom" look="mom" f={f} place={() => MOM} face={faceFn} pose={full} role="mother" seed={3} layer="arms" />
        {held}
      </MomLips>
    </Shot>
  );
};
