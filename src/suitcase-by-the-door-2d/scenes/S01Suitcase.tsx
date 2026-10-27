// S01 · Чемодан, который пока не едет.
//
// 1A — сразу крупно, вид сверху на прихожий стол: открытый чемодан, рука
//      мамы опускает охристую папку внутрь (≈1,3 с), папка ложится, кисть
//      ослабляет хват. Рядом на столе — школьное расписание сына; на нём
//      появляется обводящий круг (мама его заметила), рука задерживается.
//      Кисть снова берёт папку и поднимает её — монтажная склейка на
//      движении.
// 1B — средний план спереди: мама за столом поднимает папку из чемодана,
//      переносит вправо и кладёт на стол (рука → чемодан → рука → стол).
//      Сын стоит в дверном проёме слева и следит за папкой. C01 — вопрос
//      сына; пауза 0,4 с; мама поворачивается к нему и улыбается — M01.
//      В конце камера мягко подъезжает к папке на столе: прямоугольник
//      папки переходит в приглашение S02.
import { useScene, usePlan, Shot, Svg, Ring, camKeys, camMove, useInk } from "../kit";
import { INK_PX } from "../theme";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { SuitcaseFront, SuitcaseTop } from "../props/Suitcase";
import { FolderFlat, FolderTop } from "../props/Folder";
import { ScheduleSheet } from "../props/Calendar";
import { CloseHand, SKIN } from "../props/CloseHand";
import { HOME, HomeBack, HomeTable, TableTop } from "../sets/Home";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

// Кадры действий (кадры сцены) — общие для анимации и звука.
export const suitcasePlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "suitcase");
  const kayra = T.word("N01", "кайра");
  const cut = kayra - 4; // склейка 1A → 1B на подъёме папки
  const lift0 = cut - 12; // кисть снова берёт папку
  return {
    len: T.len,
    down: 40, // папка легла в чемодан
    relax: 50,
    notice: 64, // круг на расписании
    lift0,
    cut,
    // 1B: подъём → перенос → на стол
    up: cut + 14,
    over: cut + 34,
    place: Math.max(cut + 50, T.wordEnd("N01", "столго")),
    release: Math.max(cut + 58, T.wordEnd("N01", "столго") + 8),
    c01: T.from("C01"),
    c01end: T.to("C01"),
    m01: T.from("M01"),
    m01end: T.to("M01"),
  };
};

// ---------- 1A: вид сверху ----------
// Общий ракурс предметного плана сверху (S01 и S08 — визуальная рифма).
export const TOP_CAM = { x: 524, y: 876, zoom: 1.14 } as const; // чемодан целиком, с полями слева
export const SC = { x: 150, hinge: 560, w: 560, h: 360 } as const; // чемодан (крышка стоит у дальнего края)
export const SHEET = { x: 600, y: 946, w: 330, h: 226 } as const; // расписание (ближе к камере, справа)
export const IN: Vec = { x: 420, y: 742 }; // папка в чемодане (FolderTop w 300, h 220, rot −4)
const ABOVE: Vec = { x: 500, y: 636 }; // папка в руке над чемоданом

const TopShot: React.FC<{ f: number; p: ReturnType<typeof suitcasePlan> }> = ({ f, p }) => {
  const ink = useInk(4);
  // папка: опускается, лежит, снова поднимается
  const pos = keysV(f, [
    [0, ABOVE],
    [p.down, IN],
    [p.lift0 + 2, IN],
    [p.cut + 4, { x: 470, y: 680 }],
  ]);
  const lift = keys(f, [
    [0, 1],
    [p.down, 0],
    [p.lift0 + 2, 0],
    [p.cut + 4, 0.55],
  ]);
  const scale = 1 + lift * 0.06;
  // кисть: держит верхний край папки; после касания пальцы раскрываются
  const holding = f < p.relax || f >= p.lift0;
  const handLift = f >= p.relax && f < p.lift0 ? easeOut((f - p.relax) / 10) * (1 - easeInOut((f - (p.lift0 - 10)) / 10)) : 0;
  // кисть приходит сверху справа (мама стоит за столом правее чемодана) и
  // держит папку за правый верхний угол
  const hx = pos.x + 150 * scale + 34 + handLift * 22;
  const hy = pos.y - 110 * scale - 56 - handLift * 22;
  const shape = holding ? "pinch" : "open";
  return (
    <>
      <TableTop ink={ink} uid="s01-top" />
      <Svg>
        <g transform={`rotate(-3 ${SHEET.x + SHEET.w / 2} ${SHEET.y + SHEET.h / 2})`}>
          <ScheduleSheet x={SHEET.x} y={SHEET.y} w={SHEET.w} h={SHEET.h} ink={ink * 0.8} />
        </g>
        <SuitcaseTop x={SC.x} hinge={SC.hinge} w={SC.w} h={SC.h} lid={0} ink={ink}>
          {lift < 0.02 ? <FolderTop cx={pos.x} cy={pos.y} w={300} h={220} rot={-4} ink={ink} /> : null}
        </SuitcaseTop>
        {lift >= 0.02 ? <FolderTop cx={pos.x} cy={pos.y} w={300 * scale} h={220 * scale} rot={-4 + lift * 3} ink={ink} shadow={lift} /> : null}
        <Ring x={SHEET.x + SHEET.w / 2} y={SHEET.y + SHEET.h / 2} r={186} t={f - p.notice} dur={16} out={p.cut - p.notice - 4} />
        <CloseHand x={hx} y={hy} angle={38} size={150} look={SKIN.mom} shape={shape} armLen={9} ink={ink} />
      </Svg>
    </>
  );
};

// ---------- 1B: средний план спереди ----------
// Толщина контура для зума камеры этого плана (Shot ещё не создан).
const useInkFor = (zoom: number) => (INK_PX.main * 0.85) / zoom;
const T = HOME.table;
const SUIT_X = 372;
const SUIT_W = 300;
const FOLDER_ON_TABLE = { x: 700, y: T.top - 6, w: 124 };
const SHEET_FLAT = { x: 836, w: 92 };

const FrontShot: React.FC<{ f: number; p: ReturnType<typeof suitcasePlan>; len: number }> = ({ f, p, len }) => {
  const mom = { x: 768, y: HOME.momBehind.y, h: H.mom * 0.97 };
  const son = { x: 246, y: HOME.floor - 4, h: H.son };
  // кисть мамы (мировые координаты): в чемодане → вверх → вправо → на стол
  const handAt = (t: number): Vec =>
    keysV(t, [
      [p.cut, { x: 612, y: 1066 }],
      [p.up, { x: 630, y: 990 }],
      [p.over, { x: 730, y: 1000 }],
      [p.place, { x: FOLDER_ON_TABLE.x + 60, y: T.top - 34 }],
      [p.release + 4, { x: FOLDER_ON_TABLE.x + 64, y: T.top - 40 }],
      [p.release + 26, { x: 712, y: 1146 }],
    ]);
  const placed = f >= p.place;
  const holdingFolder = f < p.place;
  // взгляд и поворот мамы: стол → расписание → сын
  const momFace = (t: number) =>
    keys(t, [
      [p.cut, -0.15],
      [p.place, 0.15],
      [p.place + 10, 0.2],
      [p.c01 + 6, 0.2],
      [p.c01 + 22, -0.55],
      [p.m01 + 2, -0.62],
    ]);
  const momPose = (t: number) => ({
    expr: t < p.c01 + 20 ? ("calm" as const) : t < p.m01 - 4 ? ("softSmile" as const) : ("smile" as const),
    lookY: t < p.c01 + 10 ? 0.32 : 0.05,
    nod: t < p.c01 + 10 ? 4 : 0,
    lean: t < p.release + 10 ? 9 : 2,
    armL: holdingFolder
      ? { target: handAt(t), shape: "fist" as const, item: "folder" as const, itemTilt: 8, elbow: "down" as const }
      : t < p.release + 26
        ? { target: handAt(t), shape: "open" as const, elbow: "down" as const }
        : { target: { x: 712, y: T.top - 8 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: 878, y: T.top - 10 }, shape: "relax" as const, elbow: "down" as const },
  });
  // сын: держится за наличник, смотрит на папку, затем на маму
  const sonFace = (t: number) => keys(t, [[0, 0.75], [p.c01 - 6, 0.7], [p.m01, 0.62]]);
  const sonPose = (t: number) => ({
    expr: t < p.m01 + 4 ? ("neutral" as const) : ("softSmile" as const),
    lookY: t < p.c01 - 4 ? 0.35 : 0.05,
    headTilt: t > p.c01 && t < p.c01end + 10 ? 4 : 0,
    armR: { target: { x: 330, y: 1150 }, shape: "fist" as const, elbow: "down" as const },
    armL: { target: null },
  });
  // Камера: средний план (папка ложится) → ближе к сыну на его вопросе (его
  // взгляд держится и после вопроса) → ближе к маме на ответе → подъезд к
  // папке на столе (переход к приглашению S02).
  const sonShot = p.c01 - 8;
  const momShot = p.c01end + 6;
  const cam =
    f < sonShot
      ? camMove(f, p.cut, sonShot, { x: 590, y: 1010, zoom: 1.28 }, { x: 585, y: 1012, zoom: 1.32 })
      : f < momShot
        ? camMove(f, sonShot, momShot, { x: 330, y: 1070, zoom: 1.72 }, { x: 336, y: 1068, zoom: 1.78 })
        : camKeys(f, [
            [momShot, { x: 690, y: 1010, zoom: 1.72 }],
            [Math.max(momShot + 1, len - 26), { x: 694, y: 1012, zoom: 1.78 }],
            [len, { x: FOLDER_ON_TABLE.x + 64, y: T.top - 30, zoom: 2.4 }],
          ]);
  const ink = useInkFor(cam.zoom);
  return (
    <Shot f={f} cam={cam}>
      <HomeBack ink={ink} uid="s01-home" />
      <Actor uid="s01-son" look="sonHome" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={3} />
      <Actor uid="s01-mom" look="momHome" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <HomeTable ink={ink} uid="s01-table" />
      <Svg>
        <SuitcaseFront x={SUIT_X} y={T.top - 4} w={SUIT_W} mode="open" ink={ink} />
        {/* расписание лежит плашмя (жёлтая полоса — дни недели) */}
        <path d={`M ${SHEET_FLAT.x} ${T.top - 6} L ${SHEET_FLAT.x + 14} ${T.top - 34} L ${SHEET_FLAT.x + SHEET_FLAT.w + 10} ${T.top - 34} L ${SHEET_FLAT.x + SHEET_FLAT.w - 4} ${T.top - 6} Z`} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
        {placed ? <FolderFlat x={FOLDER_ON_TABLE.x} y={FOLDER_ON_TABLE.y} w={FOLDER_ON_TABLE.w} ink={ink} /> : null}
      </Svg>
      <Actor uid="s01-mom" look="momHome" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
    </Shot>
  );
};

export const S01Suitcase: React.FC = () => {
  const { f } = useScene("suitcase");
  const p = usePlan(suitcasePlan);
  if (f < p.cut) {
    const cam = { x: TOP_CAM.x, y: 870 + clamp(f / p.cut) * 6, zoom: lerp(1.1, TOP_CAM.zoom, easeInOut(f / p.cut)) };
    return (
      <Shot f={f} cam={cam}>
        <TopShot f={f} p={p} />
      </Shot>
    );
  }
  return <FrontShot f={f} p={p} len={p.len} />;
};

// Звук: папка ложится в чемодан, затем на стол.
export const sfxS01Suitcase: Sd2SfxPlan = (tl) => {
  const p = suitcasePlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.down - 2, kind: "folder-down", volume: 0.3 },
    { at: p.place - 1, kind: "folder-down", volume: 0.28 },
  ];
};
