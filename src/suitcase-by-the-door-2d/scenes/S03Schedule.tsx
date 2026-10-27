// S03 · Одно расписание внутри другого.
//
// 3A — «Ал бул долбоорго бир нече ай даярданган.» Мама одна за
//      кухонным столом днём (лампа погашена): перед ней раскрытая папка
//      выступления, стопка черновиков со стикерами; она дописывает лист
//      ручкой — видно, что готовилась долго.
// 3B — «Бирок…» Вид сверху на тот же стол «как над плечом»: кисть мамы
//      кладёт школьное расписание поверх папки (папка частично видна под
//      ним). На словах «сапарга барарын ырастардан» три столбца поездки
//      (Шш, Шр, Бш) по очереди получают мягкое жёлтое выделение.
// 3C — короткий крупный план: мама переводит взгляд с приглашения на
//      школьную строку.
// 3D — графический акцент на том же столе: три карточки дней поездки
//      сверху, от каждой к школьной отметке своего дня по очереди
//      прорисовывается тонкая линия (без лабиринта); спокойный просвет.
import { useScene, usePlan, Shot, Svg, camMove, DrawArrow } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeOut, keys, keysV, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { KitchenBack, KitchenChair, KitchenTable, KitchenTableTop, Cup } from "../sets/Kitchen";
import { FolderTop } from "../props/Folder";
import { ScheduleSheet } from "../props/Calendar";
import { CloseHand, SKIN } from "../props/CloseHand";
import { InviteSheet, TripDayCard, INVITE_RATIO } from "../props/Invite";
import { exprKeys, restArm, SEAT_MOM, TWO, PENSIVE } from "./S05Dinner";
import type { Sd2SfxPlan } from "../sfx";

export const schedulePlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "schedule");
  const birok = T.word("N03", "бирок");
  return {
    len: T.len,
    top: birok - 6, // 3B
    place: T.word("N03", "сапарга") - 2, // расписание легло на папку
    hi: [T.word("N03", "сапарга"), T.word("N03", "барарын"), T.word("N03", "ырастардан")],
    face: T.word("N03", "мурда") - 4, // 3C
    lines: T.word("N03", "уулунун") - 4, // 3D
    lineAt: [T.word("N03", "уулунун") + 6, T.word("N03", "мектептеги") + 2, T.word("N03", "жадыбалын")],
  };
};
type Plan = ReturnType<typeof schedulePlan>;

// ---------- 3A: мама пишет ----------
const PREP_SHEETS: readonly { x: number; y: number; w: number; rot: number }[] = [
  { x: 690, y: 1176, w: 120, rot: -6 },
  { x: 704, y: 1172, w: 120, rot: 4 },
  { x: 872, y: 1188, w: 104, rot: 10 },
];
const Writing: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const mom = TWO.mom;
  // ручка ходит по строке и возвращается к началу следующей
  const line = Math.floor(f / 26);
  const u = (f % 26) / 26;
  const pen: Vec = { x: 742 + u * 46 - (u > 0.86 ? (u - 0.86) * 330 : 0), y: 1170 + (line % 3) * 4 };
  const pose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_MOM,
    expr: exprKeys(t, [[0, PENSIVE], [40, EXPR.thinking], [80, EXPR.calm]]),
    lookY: 0.6,
    nod: 9,
    lean: 10,
    armL: { target: pen, shape: "fist", item: "pen", itemTilt: -10, elbow: "down", behind: false },
    armR: restArm(mom, SEAT_MOM, 1, 10),
  });
  const cam = camMove(f, 0, p.top, { x: 760, y: 1010, zoom: 1.9 }, { x: 764, y: 1018, zoom: 2.02 });
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <KitchenBack ink={ink} uid="s03-k" lampOn={0} />
      <Svg>
        <KitchenChair x={mom.x} ink={ink} />
      </Svg>
      <Actor uid="s03-mom" look="momHome" f={f} place={() => mom} face={() => -0.08} pose={pose} seed={1} layer="body" />
      <KitchenTable ink={ink} uid="s03-kt" lampOn={0} />
      <Svg>
        <Cup cx={640} y={1214} w={34} ink={ink * 0.7} />
        {/* раскрытая папка с листами и стикерами (вид спереди, плоско) */}
        <g transform={`translate(760 1186) scale(1 0.3)`}>
          <rect x={-150} y={-80} width={300} height={170} rx={10} fill={C.folderInside} stroke={C.ink} strokeWidth={ink * 2.4} />
          <rect x={-136} y={-70} width={130} height={150} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={ink * 1.8} />
          <rect x={6} y={-70} width={130} height={150} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={ink * 1.8} />
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d={`M ${-120} ${-50 + k * 26} L ${-26} ${-50 + k * 26}`} stroke={C.inkSoft} strokeWidth={ink * 2} opacity={0.6} />
          ))}
        </g>
        {PREP_SHEETS.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(1 0.3) rotate(${s.rot})`}>
            <rect x={-s.w / 2} y={-s.w * 0.7} width={s.w} height={s.w * 1.4} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={ink * 2} />
            <rect x={s.w * 0.15} y={-s.w * 0.65} width={s.w * 0.3} height={s.w * 0.3} fill={i % 2 ? C.yellowSoft : "#CFE3D8"} stroke={C.ink} strokeWidth={ink * 1.4} />
          </g>
        ))}
      </Svg>
      <Actor uid="s03-mom" look="momHome" f={f} place={() => mom} face={() => -0.08} pose={pose} seed={1} layer="arms" />
    </Shot>
  );
};

// ---------- 3B / 3D: вид сверху ----------
const FOLDER = { cx: 430, cy: 820, w: 640, h: 450 };
const SHEET = { x: 210, y: 760, w: 660, h: 470 }; // расписание поверх папки
const CARDS_Y = 400;
const Top: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  // кисть приносит лист снизу справа и кладёт поверх папки
  const arrive = easeOut(clamp((f - p.top) / Math.max(8, p.place - p.top)));
  const sheetX = SHEET.x + (1 - arrive) * 300;
  const sheetY = SHEET.y + (1 - arrive) * 560;
  const lift = 1 - arrive;
  const hi = p.hi.map((h) => clamp((f - h) / 10));
  const hand: Vec = keysV(f, [
    [p.top, { x: sheetX + SHEET.w - 70, y: sheetY + SHEET.h - 20 }],
    [p.place, { x: SHEET.x + SHEET.w - 70, y: SHEET.y + SHEET.h - 20 }],
    [p.place + 6, { x: SHEET.x + SHEET.w - 66, y: SHEET.y + SHEET.h - 18 }],
    [p.place + 22, { x: SHEET.x + SHEET.w + 260, y: SHEET.y + SHEET.h + 380 }],
  ]);
  const holding = f < p.place + 2;
  const cardsT = f - p.lines;
  // столбцы расписания: середины трёх дней поездки и уровень отметок
  const colW = (SHEET.w - SHEET.w * 0.08) / 5;
  const top = SHEET.h * 0.2;
  const gy = SHEET.y + top;
  const gh = SHEET.h - top - SHEET.h * 0.06;
  const markY = gy + gh * 0.45;
  const colX = (i: number) => SHEET.x + SHEET.w * 0.04 + colW * i + colW / 2;
  const cardX = (i: number) => 230 + i * 310;
  const cam = camMove(f, p.top, p.len, { x: 540, y: 920, zoom: 1.0 }, { x: 540, y: f >= p.lines ? 880 : 900, zoom: 1.04 });
  const ink = 4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <KitchenTableTop ink={ink} uid="s03-tt" />
      <Svg>
        {/* приглашение лежит на раскрытой папке (то же, что в S02) */}
        <FolderTop cx={FOLDER.cx} cy={FOLDER.cy} w={FOLDER.w} h={FOLDER.h} open={1} ink={ink} />
        <InviteSheet x={FOLDER.cx + 18} y={FOLDER.cy - (FOLDER.w * 0.47 * INVITE_RATIO) / 2} w={FOLDER.w * 0.47} ink={ink * 0.8} />
        {/* три карточки дней поездки сверху (3D) */}
        {cardsT >= 0
          ? [0, 1, 2].map((i) => {
              const a = clamp((cardsT - i * 4) / 10);
              return <TripDayCard key={i} cx={cardX(i)} cy={CARDS_Y - (1 - a) * 30} w={180} i={i} ink={ink * 0.8} lift={(1 - a) * 0.6} opacity={a} />;
            })
          : null}
        {/* школьное расписание поверх папки */}
        <rect x={sheetX + 10 + lift * 20} y={sheetY + 14 + lift * 26} width={SHEET.w} height={SHEET.h} rx={10} fill={C.shadow} opacity={1 - lift * 0.4} />
        <ScheduleSheet x={sheetX} y={sheetY} w={SHEET.w} h={SHEET.h} ink={ink} hi={[0, hi[0], hi[1], hi[2], 0]} />
        {/* линии: день поездки → школьная отметка этого дня */}
        {cardsT >= 0
          ? [0, 1, 2].map((i) => (
              <DrawArrow
                key={i}
                pts={[
                  [cardX(i), CARDS_Y + 112],
                  [cardX(i) + (colX(i + 1) - cardX(i)) * 0.5, (CARDS_Y + 112 + markY - 46) / 2],
                  [colX(i + 1), markY - 46],
                ]}
                t={f - p.lineAt[i]}
                dur={14}
                color={C.yellowDeep}
                width={ink * 1.2}
                seed={20 + i}
              />
            ))
          : null}
        {holding || f < p.place + 22 ? (
          <CloseHand x={hand.x + 60} y={hand.y + 70} angle={142} size={150} look={SKIN.mom} shape={holding ? "pinch" : "open"} armLen={8} ink={ink} />
        ) : null}
      </Svg>
    </Shot>
  );
};

// ---------- 3C: взгляд мамы ----------
const Face: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const mom = TWO.mom;
  const t0 = p.face;
  const pose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_MOM,
    expr: EXPR.thinking,
    lookX: keys(t, [[t0, -0.5], [t0 + 10, -0.5], [t0 + 18, 0.45]]),
    lookY: 0.62,
    nod: 7,
    lean: 6,
    armL: restArm(mom, SEAT_MOM, -1),
    armR: restArm(mom, SEAT_MOM, 1),
  });
  const cam = camMove(f, t0, p.lines, { x: mom.x, y: 930, zoom: 3.0 }, { x: mom.x, y: 934, zoom: 3.1 });
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <KitchenBack ink={ink} uid="s03-k2" lampOn={0} />
      <Svg>
        <KitchenChair x={mom.x} ink={ink} />
      </Svg>
      <Actor uid="s03-mom2" look="momHome" f={f} place={() => mom} face={() => -0.1} pose={pose} seed={1} />
    </Shot>
  );
};

export const S03Schedule: React.FC = () => {
  const { f } = useScene("schedule");
  const p = usePlan(schedulePlan);
  if (f < p.top) return <Writing f={f} p={p} />;
  if (f >= p.face && f < p.lines) return <Face f={f} p={p} />;
  return <Top f={f} p={p} />;
};

// Звук: ручка не озвучивается; лист ложится на папку.
export const sfxS03Schedule: Sd2SfxPlan = (tl) => {
  const p = schedulePlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.place - 2, kind: "paper", volume: 0.22 },
  ];
};

