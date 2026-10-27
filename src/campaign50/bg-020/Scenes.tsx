// Шесть сцен BG-020. Кадры внутри сцены считаются от её начала; моменты
// реплик — по фактической озвучке (lineF), поэтому движение героев
// совпадает с речью при любой длине реплик.
import { useCurrentFrame } from "remotion";
import { anticipate, keys, keysV } from "../../two-schedules-2d/rig/motion";
import { camMove, Shot, type Cam } from "../../two-schedules-2d/shots";
import type { PoseIn } from "../../two-schedules-2d/rig/Actor";
import { lineF, sceneFrames, useTimeline } from "./context";
import { BookInsert, CalendarInsert, NotebookInsert, PhoneInsert, PlaceTag, StepsInsert } from "./Inserts";
import { ROOM } from "./sets/Room";
import { Cuts, DAD, MOM, onTable, rest, seatOf, SON, World, type Cast, type Props } from "./World";
import { CtaCard } from "./Cta";

// Планы камеры (точка мира в центре кадра и масштаб).
const CAM = {
  wide: { x: 1000, y: 1110, zoom: 1.05 },
  family: { x: 1000, y: 1120, zoom: 1.38 },
  son: { x: 730, y: 1150, zoom: 1.95 },
  book: { x: 760, y: 1200, zoom: 2.6 },
  mom: { x: 990, y: 1130, zoom: 2.05 },
  dad: { x: 1270, y: 1110, zoom: 2.0 },
  parents: { x: 1150, y: 1120, zoom: 1.7 },
} satisfies Record<string, Cam>;

const drift = (c: Cam, dz = 0.05, dx = 0): Cam => ({ x: c.x + dx, y: c.y, zoom: c.zoom + dz });

// ---------- Базовые позы ----------
const sonReading = (t: number, extra: PoseIn = {}): PoseIn => ({
  expr: "calm",
  sit: 1,
  seat: seatOf(SON) + 30,
  packOff: true,
  lean: 6,
  lookY: 0.65,
  armL: { target: onTable(ROOM.book.x - 55 + Math.sin(t / 40) * 3, -4), shape: "open", elbow: "down", behind: false },
  armR: { target: onTable(ROOM.book.x + 45, -4), shape: "relax", elbow: "down", behind: false },
  ...extra,
});

const momBase = (extra: PoseIn = {}): PoseIn => ({
  expr: "calm",
  sit: 1,
  seat: seatOf(MOM),
  armL: rest(MOM, -1),
  armR: rest(MOM, 1),
  ...extra,
});

const dadBase = (extra: PoseIn = {}): PoseIn => ({
  expr: "calm",
  sit: 1,
  seat: seatOf(DAD),
  armL: rest(DAD, -1),
  armR: rest(DAD, 1),
  ...extra,
});

// ---------- 1. Хук: тишина, шелест страницы ----------
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, dur } = sceneFrames(tl, "hook");
  const s01 = lineF(tl, "s01", "hook");
  const cast: Cast = {
    son: {
      face: (t) => keys(t, [[0, 0.1], [s01.from - 14, 0.1], [s01.from + 2, 0.55]]),
      pose: (t) =>
        sonReading(t, {
          expr: t < s01.from - 10 ? "calm" : "softSmile",
          lookY: keys(t, [[0, 0.65], [s01.from - 16, 0.65], [s01.from, -0.05]]),
          lean: keys(t, [[0, 6], [s01.from - 16, 6], [s01.from, 0]]),
          headTilt: keys(t, [[s01.from, 0], [s01.from + 14, 5]]),
        }),
    },
    mom: {
      face: (t) => keys(t, [[0, 0.15], [s01.to - 6, 0.15], [s01.to + 8, -0.55]]),
      pose: (t) =>
        momBase({
          expr: t < s01.to ? "calm" : "softSmile",
          lookY: keys(t, [[0, 0.6], [s01.to - 4, 0.6], [s01.to + 8, 0]]),
          armR: { target: onTable(ROOM.notebook.x + 30 + Math.sin(t / 7) * 5, -6), shape: "pinch", item: "pencil", itemColor: "#F2C230", elbow: "down", behind: false },
          armL: { target: onTable(ROOM.notebook.x - 50, -4), shape: "open", elbow: "down", behind: false },
        }),
    },
    dad: {
      face: (t) => keys(t, [[0, -0.15], [s01.to, -0.15], [s01.to + 14, -0.6]]),
      pose: (t) =>
        dadBase({
          lookY: keys(t, [[0, 0.55], [s01.to + 2, 0.55], [s01.to + 14, 0]]),
          armL: { target: onTable(ROOM.planner.x - 40, -4), shape: "open", elbow: "down", behind: false },
        }),
    },
  };
  const props: Props = { planner: 1 };
  const w = (uid: string) => () => <World f={f} abs={f + from} cast={cast} props={props} uid={uid} />;
  const c1 = Math.min(68, s01.from - 8);
  return (
    <>
      <Cuts
        f={f}
        cuts={[
          { from: 0, node: () => <BookInsert f={f} flipAt={20} zoom={1.12 + f * 0.0008} /> },
          {
            from: c1,
            fade: 10,
            node: () => (
              <Shot f={f} from={c1} to={dur + 12} cam={camMove(f, c1, dur, CAM.family, drift(CAM.family, 0.06, -20))}>
                {w("h")()}
              </Shot>
            ),
          },
        ]}
      />
      <PlaceTag f={f} from={8} to={dur - 14} />
    </>
  );
};

// ---------- 2. Привычка: логистика следующей недели ----------
export const HabitScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, dur } = sceneFrames(tl, "habit");
  const n01 = lineF(tl, "n01", "habit");
  const pull = 40; // мама берёт блокнот
  const nbFrom = 62;
  const calFrom = Math.max(nbFrom + 110, n01.wordAt("кийинки", 0.45) - 6);
  const cast: Cast = {
    son: {
      face: (t) => keys(t, [[0, 0.5], [30, 0.5], [50, 0.15]]),
      pose: (t) => sonReading(t, { expr: t < 40 ? "softSmile" : "calm", lookY: keys(t, [[0, -0.05], [34, -0.05], [52, 0.65]]) }),
    },
    mom: {
      face: (t) => keys(t, [[0, -0.55], [pull - 6, -0.55], [pull + 8, 0.1]]),
      pose: (t) =>
        momBase({
          expr: t < pull ? "smile" : "calm",
          nod: keys(t, [[6, 0], [14, 5], [26, 0]]),
          lookY: keys(t, [[0, 0], [pull, 0], [pull + 12, 0.6]]),
          armR: { target: keysV(t, [[0, onTable(ROOM.notebook.x + 30, -6)], [pull, onTable(ROOM.notebook.x + 30, -6)], [pull + 16, onTable(MOM.x - 20, -10)]], anticipate), shape: "pinch", item: "pencil", itemColor: "#F2C230", elbow: "down", behind: false },
          armL: { target: keysV(t, [[pull, onTable(ROOM.notebook.x - 50, -4)], [pull + 16, onTable(MOM.x - 110, -4)]]), shape: "open", elbow: "down", behind: false },
        }),
    },
    dad: {
      face: (t) => keys(t, [[0, -0.6], [pull + 20, -0.6], [pull + 36, -0.1]]),
      pose: (t) =>
        dadBase({
          expr: t < pull + 20 ? "smile" : "thinking",
          lookY: keys(t, [[0, 0], [pull + 20, 0], [pull + 34, 0.6]]),
          armL: { target: keysV(t, [[pull + 20, onTable(DAD.x - 120, -4)], [pull + 38, onTable(ROOM.planner.x - 40, -4)]]), shape: "open", elbow: "down", behind: false },
          armR: { target: onTable(DAD.x + 75, -4), shape: "relax", elbow: "down", behind: false },
        }),
    },
  };
  const props: Props = { notebookX: ROOM.notebook.x + 50, planner: keys(f, [[pull + 30, 0.2], [pull + 50, 1]]) };
  return (
    <Cuts
      f={f}
      cuts={[
        {
          from: 0,
          node: () => (
            <Shot f={f} from={0} to={nbFrom + 12} cam={camMove(f, 0, nbFrom, CAM.parents, drift(CAM.parents, 0.05))}>
              <World f={f} abs={f + from} cast={cast} props={props} uid="hb" />
            </Shot>
          ),
        },
        { from: nbFrom, fade: 10, node: () => <NotebookInsert f={f} pageAt={nbFrom + 14} writeFrom={nbFrom + 36} writeDur={64} /> },
        { from: calFrom, fade: 10, node: () => <CalendarInsert f={f} /> },
        {
          from: dur - 26,
          fade: 10,
          node: () => (
            <Shot f={f} from={dur - 26} to={dur + 12} cam={camMove(f, dur - 26, dur, CAM.family, drift(CAM.family, 0.03))}>
              <World f={f} abs={f + from} cast={cast} props={props} uid="hb2" />
            </Shot>
          ),
        },
      ]}
    />
  );
};

// ---------- 3. «Каждую неделю — снова» ----------
export const RealizeScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, dur } = sceneFrames(tl, "realize");
  const f01 = lineF(tl, "f01", "realize");
  const m01 = lineF(tl, "m01", "realize");
  const slide = { a: 10, b: 40 }; // сын пододвигает книгу к блокноту мамы
  const calFrom = 52;
  const dadFrom = f01.from - 8;
  const momFrom = m01.from - 10;
  const phoneAt = m01.to - 14; // мама сама берёт телефон — решение
  const bookX = keys(f, [[slide.a, ROOM.book.x], [slide.b, ROOM.book.x + 70]]);
  const cast: Cast = {
    son: {
      face: (t) => keys(t, [[0, 0.2], [slide.b, 0.2], [slide.b + 10, 0.5], [f01.from, 0.5], [f01.from + 20, 0.2]]),
      pose: (t) =>
        sonReading(t, {
          expr: t < slide.b + 40 ? "softSmile" : "calm",
          lean: keys(t, [[slide.a, 4], [slide.a + 14, 16], [slide.b, 16], [slide.b + 14, 4]]),
          lookY: keys(t, [[0, 0.5], [slide.b, 0.5], [slide.b + 10, 0], [f01.from + 10, 0], [f01.from + 26, 0.65]]),
          armR: { target: keysV(t, [[slide.a, onTable(ROOM.book.x + 60, -4)], [slide.b, onTable(ROOM.book.x + 130, -4)], [slide.b + 16, onTable(ROOM.book.x + 60, -4)]]), shape: "open", elbow: "down", behind: false },
          armL: { target: keysV(t, [[slide.a, onTable(ROOM.book.x - 70, -4)], [slide.b, onTable(ROOM.book.x, -4)], [slide.b + 16, onTable(ROOM.book.x - 40, -4)]]), shape: "open", elbow: "down", behind: false },
        }),
    },
    mom: {
      face: (t) => keys(t, [[0, 0.1], [slide.b - 6, 0.1], [slide.b + 6, -0.5], [f01.from - 4, -0.5], [f01.from + 8, 0.55], [m01.from - 6, 0.55], [m01.from + 6, 0.25]]),
      pose: (t) =>
        momBase({
          expr: t < f01.from ? "softSmile" : t < m01.from ? "thinking" : "softSmile",
          lookY: keys(t, [[0, 0.5], [slide.b - 6, 0.5], [slide.b + 4, 0.15], [m01.from, 0.15], [phoneAt, 0.15], [phoneAt + 14, 0.55]]),
          nod: keys(t, [[f01.to - 8, 0], [f01.to, 5], [f01.to + 12, 0]]),
          headTilt: keys(t, [[m01.from, 0], [m01.from + 16, -5]]),
          armR: rest(MOM, 1),
          armL: {
            target: keysV(t, [[0, onTable(MOM.x - 110, -4)], [phoneAt, onTable(MOM.x - 110, -4)], [phoneAt + 14, onTable(ROOM.phone.x, -8)], [phoneAt + 30, { x: MOM.x + 30, y: ROOM.table.top - 110 }]], anticipate),
            shape: t < phoneAt + 14 ? "open" : "phone",
            item: t < phoneAt + 14 ? "none" : "phone",
            glow: 1,
            itemTilt: -10,
            elbow: "down",
            behind: false,
          },
        }),
    },
    dad: {
      face: (t) => keys(t, [[0, -0.1], [slide.b - 6, -0.1], [slide.b + 8, -0.55], [f01.from - 8, -0.55], [f01.from + 4, -0.4], [m01.from, -0.5]]),
      pose: (t) =>
        dadBase({
          expr: t < f01.from - 10 ? "softSmile" : t < m01.to ? "thinking" : "softSmile",
          exhale: keys(t, [[f01.from - 10, 0], [f01.from, 0.5], [f01.to, 0.3]]),
          lookY: keys(t, [[0, 0.6], [slide.b - 4, 0.6], [slide.b + 8, 0.1]]),
          nod: keys(t, [[m01.to - 6, 0], [m01.to + 4, 5], [m01.to + 16, 0]]),
          armR: { target: keysV(t, [[0, onTable(DAD.x + 75, -4)], [f01.from + 8, onTable(DAD.x + 75, -4)], [f01.from + 26, { x: DAD.x + 110, y: ROOM.table.top - 70 }], [f01.to, { x: DAD.x + 110, y: ROOM.table.top - 70 }], [f01.to + 16, onTable(DAD.x + 75, -4)]]), shape: t > f01.from + 20 && t < f01.to ? "open" : "relax", elbow: "down", behind: false },
          armL: { target: onTable(ROOM.planner.x - 40, -4), shape: "open", elbow: "down", behind: false },
        }),
    },
  };
  const props: Props = { bookX, planner: 1, notebookX: ROOM.notebook.x + 50, phoneOnTable: f < phoneAt + 14, phoneGlow: f > phoneAt - 6 ? 1 : 0 };
  const w = (uid: string) => <World f={f} abs={f + from} cast={cast} props={props} uid={uid} />;
  return (
    <Cuts
      f={f}
      cuts={[
        { from: 0, node: () => <Shot f={f} from={0} to={calFrom + 12} cam={camMove(f, 0, calFrom, CAM.family, drift(CAM.family, 0.04, -30))}>{w("r1")}</Shot> },
        { from: calFrom, fade: 8, node: () => <CalendarInsert f={f} turnAt={calFrom + 14} markFrom={calFrom + 40} /> },
        { from: dadFrom, fade: 8, node: () => <Shot f={f} from={dadFrom} to={momFrom + 12} cam={camMove(f, dadFrom, momFrom, CAM.dad, drift(CAM.dad, 0.06))}>{w("r2")}</Shot> },
        { from: momFrom, fade: 8, node: () => <Shot f={f} from={momFrom} to={dur + 12} cam={camMove(f, momFrom, dur, CAM.mom, drift(CAM.mom, -0.25, 20))}>{w("r3")}</Shot> },
      ]}
    />
  );
};

// ---------- 4. Мама открывает BalaGo ----------
const momWithPhone = (t: number, extra: PoseIn = {}): PoseIn =>
  momBase({
    expr: "calm",
    lookY: 0.55,
    armL: { target: { x: MOM.x + 30, y: ROOM.table.top - 110 }, shape: "phone", item: "phone", glow: 1, itemTilt: -10, elbow: "down", behind: false },
    armR: { target: keysV(t, [[0, onTable(MOM.x + 100, -4)], [30, onTable(MOM.x + 100, -4)], [44, { x: MOM.x + 50, y: ROOM.table.top - 100 }]]), shape: t > 36 ? "point" : "relax", elbow: "down", behind: false },
    ...extra,
  });

export const OpenScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, dur } = sceneFrames(tl, "open");
  const n02 = lineF(tl, "n02", "open");
  const phoneFrom = 26;
  const wideFrom = Math.max(phoneFrom + 150, n02.wordAt("алдын", 0.7) - 10);
  const cast: Cast = {
    son: { face: () => 0.1, pose: (t) => sonReading(t) },
    mom: { face: (t) => keys(t, [[0, 0.3], [wideFrom + 30, 0.3], [wideFrom + 44, 0.55]]), pose: (t) => momWithPhone(t, { expr: t > wideFrom + 30 ? "softSmile" : "calm" }) },
    dad: {
      face: () => -0.45,
      pose: (t) =>
        dadBase({
          lean: keys(t, [[0, 0], [20, 10]]),
          lookY: 0.5,
          expr: t > wideFrom + 40 ? "softSmile" : "calm",
          nod: keys(t, [[wideFrom + 44, 0], [wideFrom + 54, 5], [wideFrom + 66, 0]]),
          armL: { target: onTable(ROOM.planner.x - 30, -4), shape: "relax", elbow: "down", behind: false },
        }),
    },
  };
  const props: Props = { planner: 1, bookX: ROOM.book.x + 70, notebookX: ROOM.notebook.x + 50, phoneOnTable: false };
  const w = (uid: string) => <World f={f} abs={f + from} cast={cast} props={props} uid={uid} />;
  return (
    <Cuts
      f={f}
      cuts={[
        { from: 0, node: () => <Shot f={f} from={0} to={phoneFrom + 12} cam={camMove(f, 0, phoneFrom, CAM.parents, drift(CAM.parents, 0.08, -40))}>{w("o1")}</Shot> },
        { from: phoneFrom, fade: 10, node: () => <PhoneInsert f={f} lineFrom={n02.wordAt("мектепке", 0.35)} howAt={wideFrom - 40} /> },
        { from: wideFrom, fade: 10, node: () => <Shot f={f} from={wideFrom} to={dur + 12} cam={camMove(f, wideFrom, dur, CAM.wide, drift(CAM.wide, 0.08))}>{w("o2")}</Shot> },
      ]}
    />
  );
};

// ---------- 5. Порядок оформления ----------
export const StepsScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, dur } = sceneFrames(tl, "steps");
  const n03 = lineF(tl, "n03", "steps");
  const stepAt = [Math.max(4, n03.from - 12), n03.wordAt("ылайыктуу", 0.12), n03.wordAt("биринчи", 0.36), n03.wordAt("андан", 0.7)];
  const saveAt = n03.to + 4;
  const outFrom = Math.min(dur - 22, saveAt + 24);
  const cast: Cast = {
    son: { face: () => 0.1, pose: (t) => sonReading(t) },
    mom: {
      face: (t) => keys(t, [[0, 0.3], [6, 0.55]]),
      pose: (t) =>
        momBase({
          expr: "softSmile",
          lookY: keys(t, [[outFrom, 0.5], [outFrom + 10, 0]]),
          armL: { target: keysV(t, [[outFrom, { x: MOM.x + 30, y: ROOM.table.top - 110 }], [outFrom + 16, onTable(ROOM.phone.x, -8)]]), shape: "phone", item: "phone", glow: 1, itemTilt: -10, elbow: "down", behind: false },
        }),
    },
    dad: { face: () => -0.6, pose: () => dadBase({ expr: "softSmile", lookY: 0.05, armL: { target: onTable(ROOM.planner.x - 30, -4), shape: "relax", elbow: "down", behind: false } }) },
  };
  const props: Props = { planner: 1, bookX: ROOM.book.x + 70, notebookX: ROOM.notebook.x + 50, phoneOnTable: false };
  return (
    <Cuts
      f={f}
      cuts={[
        { from: 0, node: () => <StepsInsert f={f} stepAt={stepAt} noteAt={stepAt[1] + 30} saveAt={saveAt} /> },
        { from: outFrom, fade: 10, node: () => <Shot f={f} from={outFrom} to={dur + 12} cam={camMove(f, outFrom, dur, CAM.parents, drift(CAM.parents, 0.04))}><World f={f} abs={f + from} cast={cast} props={props} uid="st" /></Shot> },
      ]}
    />
  );
};

// ---------- 6. Финал: книга закрывается → карточка контактов ----------
export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from } = sceneFrames(tl, "cta");
  const n06 = lineF(tl, "n06", "cta");
  const close = { a: 2, b: 16 };
  const cast: Cast = {
    son: {
      face: () => 0.2,
      pose: (t) =>
        sonReading(t, {
          expr: "softSmile",
          lookY: keys(t, [[close.b, 0.6], [close.b + 8, 0.1]]),
          armL: { target: keysV(t, [[close.a, onTable(ROOM.book.x, -4)], [close.b, onTable(ROOM.book.x + 120, -14)]]), shape: "open", elbow: "down", behind: false },
        }),
    },
    mom: { face: () => -0.4, pose: () => momBase({ expr: "smile" }) },
    dad: { face: () => -0.5, pose: () => dadBase({ expr: "smile" }) },
  };
  const props: Props = { planner: 1, bookX: ROOM.book.x + 70, bookOpen: keys(f, [[close.a, 1], [close.b, 0]]), notebookX: ROOM.notebook.x + 50 };
  return (
    <Cuts
      f={f}
      cuts={[
        { from: 0, node: () => <Shot f={f} from={0} to={34} cam={camMove(f, 0, 22, CAM.book, drift(CAM.book, 0.4, 70))}><World f={f} abs={f + from} cast={cast} props={props} uid="ct" /></Shot> },
        { from: 22, fade: 10, node: () => <CtaCard f={f - 22} sloganAt={n06.from - 22} /> },
      ]}
    />
  );
};
