// S07 · Папа перестраивает встречи.
//
// 7A — «Алар календарларын ачып…»: двухплан за тем же столом — у папы
//      открытый ноутбук с календарём, у мамы школьное расписание; оба
//      смотрят в календари, мама показывает пальцем на дни поездки.
// 7B — «Атасы бир жумушчу талкууну…»: папа сам звонит коллеге — телефон
//      у уха, короткие кивки (рот закрыт: говорит рассказчик). Мама
//      смотрит на него.
// 7C — вставка на кремовой бумаге с диагоналями (как карточки референса):
//      папин календарь. Карточка «12:30 · Иш талкуусу» приподнимается,
//      переносится к колонке «Кесиптеш» и ложится там; затем «13:00 ·
//      Жолугушуу» приподнимается и сдвигается к раннему слоту «10:00»
//      (время на карточке меняется); три карточки школьных поездок
//      (Шш/Шр/Бш · «Мектеп») по очереди получают метку папы «Атасы».
//      Сначала виден папа, который договаривается, — потом меняются
//      карточки: календарь не «волшебный».
// 7D — двухплан: мама с облегчением выдыхает и мягко улыбается папе,
//      папа отвечает улыбкой. Мама ничего не подтверждает нажатием.
import { useScene, usePlan, Shot, Svg, Paper, camKeys, camMove } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { Cup, KitchenBack, KitchenChair, KitchenTable, Laptop, PhoneFlat, SheetOnTable, Teapot } from "../sets/Kitchen";
import { CARD, DadCalendar, MeetCard, slotAt, TripCard } from "../props/Cards";
import { SD2_TEXT } from "../script";
import { exprKeys, restArm, SEAT_DAD, SEAT_MOM, TWO, WARM } from "./S05Dinner";
import type { Sd2SfxPlan } from "../sfx";

const D = SD2_TEXT.dad;
const WEEK = SD2_TEXT.school.week;

export const meetingsPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "meetings");
  const atasy = T.word("N06", "атасы");
  const kesip = T.word("N06", "кесиптешине");
  const dagy = T.word("N06", "дагы");
  const erte = T.word("N06", "эртерээк");
  const komand = T.word("N06", "командировка");
  return {
    len: T.len,
    point: T.word("N06", "чогуу"), // мама показывает на дни
    call: atasy - 4, // план звонка
    phoneUp: atasy + 6, // телефон у уха
    board: kesip - 14, // вставка календаря
    lift1: kesip,
    land1: T.wordEnd("N06", "макулдашты") - 6,
    lift2: erte - 8,
    land2: Math.min(komand - 8, erte + 34),
    dagy,
    tags: [T.word("N06", "уулун"), T.word("N06", "мектептен"), T.word("N06", "өзү")],
    komand,
    relief: Math.min(T.to("N06") - 2, T.len - 44), // двухплан облегчения
    end: T.to("N06"),
  };
};
type Plan = ReturnType<typeof meetingsPlan>;

const SHEET_AT: Vec = { x: 860, y: 1190 };
const LAPTOP_X = 420;

// ---------- двухплан за столом ----------
const TwoShot: React.FC<{ f: number; p: Plan; len: number }> = ({ f, p, len }) => {
  const calling = f >= p.call && f < p.board;
  const relief = f >= p.relief;
  // мама показывает на дни поездки, потом смотрит на папу
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_MOM,
    expr: relief ? exprKeys(t, [[p.relief, EXPR.calm], [p.relief + 14, WARM], [p.relief + 30, EXPR.softSmile]]) : EXPR.calm,
    lookY: relief ? keys(t, [[p.relief, 0.1], [p.relief + 10, 0.05]]) : calling ? 0.08 : keys(t, [[0, 0.5], [p.point + 24, 0.5], [p.point + 36, 0.42]]),
    nod: relief ? 1 : calling ? 0 : 5,
    exhale: relief ? clamp((t - p.relief - 4) / 12) * (1 - clamp((t - p.relief - 30) / 20)) : 0,
    armL: restArm(TWO.mom, SEAT_MOM, -1),
    armR:
      !calling && !relief
        ? {
            target: keysV(t, [
              [0, restArm(TWO.mom, SEAT_MOM, 1).target],
              [p.point - 6, restArm(TWO.mom, SEAT_MOM, 1).target],
              [p.point + 8, { x: SHEET_AT.x - 8, y: SHEET_AT.y - 12 }],
              [p.call - 10, { x: SHEET_AT.x - 10, y: SHEET_AT.y - 12 }],
            ]),
            shape: t > p.point ? "point" : "relax",
            elbow: t > p.point - 4 ? "down" : "hang",
            behind: false,
          }
        : restArm(TWO.mom, SEAT_MOM, 1),
  });
  const momFace = (t: number) => (relief ? -0.55 : calling ? -0.5 : keys(t, [[0, -0.18], [p.point, -0.1], [p.call - 6, -0.12]]));
  // папа: смотрит в ноутбук → звонит коллеге (телефон у уха, кивки) → улыбка
  const ear = (t: number): Vec => keysV(t, [[p.call, { x: TWO.dad.x - 20, y: 1150 }], [p.phoneUp, { x: TWO.dad.x - 52, y: 1012 }]]);
  const dadPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_DAD,
    expr: relief ? exprKeys(t, [[p.relief, EXPR.calm], [p.relief + 20, EXPR.softSmile]]) : calling ? EXPR.calm : EXPR.thinking,
    lookY: relief ? 0.05 : calling ? 0.25 : 0.5,
    nod: calling ? keys(t, [[p.phoneUp + 10, 0], [p.phoneUp + 16, 5], [p.phoneUp + 24, 0], [p.phoneUp + 40, 0], [p.phoneUp + 46, 5], [p.phoneUp + 54, 0]]) : relief ? 1 : 6,
    headTilt: calling ? -6 : 0,
    armL: calling
      ? { target: ear(t), shape: "phone", item: "phone", itemTilt: 8, glow: 0.6, elbow: "hang", behind: false }
      : restArm(TWO.dad, SEAT_DAD, -1, 4),
    armR: calling ? restArm(TWO.dad, SEAT_DAD, 1, 4) : relief ? restArm(TWO.dad, SEAT_DAD, 1, 4) : { target: { x: LAPTOP_X + 70, y: 1176 }, shape: "relax", elbow: "down" },
  });
  const dadFace = (t: number) => (relief ? keys(t, [[p.relief, 0.3], [p.relief + 12, 0.5]]) : calling ? 0.3 : 0.12);
  const cam = relief
    ? camMove(f, p.relief, len, { x: 630, y: 1000, zoom: 1.84 }, { x: 640, y: 996, zoom: 1.92 })
    : calling
      ? camMove(f, p.call, p.board, { x: 520, y: 980, zoom: 2.1 }, { x: 516, y: 978, zoom: 2.16 })
      : camKeys(f, [
          [0, { x: 640, y: 1010, zoom: 1.6 }],
          [p.call, { x: 636, y: 1006, zoom: 1.7 }],
        ]);
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid="s07-dad" look="dadHome" f={f} place={() => TWO.dad} face={dadFace} pose={dadPose} seed={2} blinkShift={11} layer={layer} />
      <Actor uid="s07-mom" look="momHome" f={f} place={() => TWO.mom} face={momFace} pose={momPose} seed={1} layer={layer} />
    </>
  );
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam} tint={C.warmLight}>
      <KitchenBack ink={ink} uid="s07-k" />
      <Svg>
        <KitchenChair x={TWO.dad.x} ink={ink} />
        <KitchenChair x={TWO.mom.x} ink={ink} />
      </Svg>
      {actors("body")}
      <KitchenTable ink={ink} uid="s07-kt" />
      <Svg>
        <Teapot cx={640} y={1158} s={52} ink={ink * 0.8} />
        <Cup cx={690} y={1214} w={34} ink={ink * 0.7} />
        <Laptop cx={LAPTOP_X} y={1210} w={150} open={1} ink={ink * 0.8} />
        <SheetOnTable cx={SHEET_AT.x} cy={SHEET_AT.y} w={110} rot={8} ink={ink * 0.5} hi={[0, 1, 1, 1, 0]} />
        {calling ? null : <PhoneFlat cx={300} y={1214} w={32} ink={ink * 0.8} />}
      </Svg>
      {actors("arms")}
    </Shot>
  );
};

// ---------- вставка: папин календарь ----------
const TRIP = { y: 1064, w: 292, h: 282, xs: [78, 394, 710] };

const Board: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  // карточка 1: 12:30 · Иш талкуусу — от папы к коллеге (та же строка)
  const s10 = slotAt(0, 1);
  const s11 = slotAt(1, 1);
  const u1 = easeInOut((f - p.lift1 - 8) / Math.max(10, p.land1 - p.lift1 - 14));
  const lift1 = clamp((f - p.lift1) / 8) * (1 - clamp((f - p.land1 + 4) / 8));
  // карточка 2: 13:00 · Жолугушуу — на раннее время 10:00 (та же колонка)
  const s02 = slotAt(0, 2);
  const s00 = slotAt(0, 0);
  const u2 = easeInOut((f - p.lift2 - 8) / Math.max(10, p.land2 - p.lift2 - 14));
  const lift2 = clamp((f - p.lift2) / 8) * (1 - clamp((f - p.land2 + 4) / 8));
  const c1 = { x: lerp(s10.x, s11.x, u1), y: lerp(s10.y, s11.y, u1) - Math.sin(Math.PI * u1) * 24 };
  const c2 = { x: lerp(s02.x, s00.x, u2) + Math.sin(Math.PI * u2) * 26, y: lerp(s02.y, s00.y, u2) };
  // мягкий подъезд камеры к нижнему ряду, когда клеятся метки папы
  const cam = camKeys(f, [
    [p.board, { x: 540, y: 960, zoom: 1.0 }],
    [p.tags[0] - 18, { x: 540, y: 980, zoom: 1.0 }],
    [p.tags[0] + 2, { x: 540, y: 1130, zoom: 1.12 }],
  ]);
  const days = [WEEK[1], WEEK[2], WEEK[3]];
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <Paper stripes="warm" band={170} />
      <Svg>
        <DadCalendar ink={ink} uid="s07-cal" />
        {/* карточка, которая лежит выше в стопке, рисуется последней */}
        <MeetCard x={c2.x} y={c2.y} w={s02.w} h={s02.h} time={D.m2.time} time2={D.m2new} swap={clamp((f - p.lift2 - 16) / 10)} label={D.m2.label} band={CARD.meet} ink={ink} lift={lift2} rot={-1.5 * lift2} seed={213} />
        <MeetCard x={c1.x} y={c1.y} w={s10.w} h={s10.h} time={D.m1.time} label={D.m1.label} band={CARD.work} ink={ink} lift={lift1} rot={2 * lift1} seed={212} />
        {days.map((d, i) => (
          <TripCard key={d} uid={`s07-trip${i}`} x={TRIP.xs[i]} y={TRIP.y} w={TRIP.w} h={TRIP.h} day={d} ink={ink} dadT={f - p.tags[i]} seed={231 + i} />
        ))}
      </Svg>
    </Shot>
  );
};

export const S07Meetings: React.FC = () => {
  const { f, len } = useScene("meetings");
  const p = usePlan(meetingsPlan);
  if (f >= p.board && f < p.relief) return <Board f={f} p={p} />;
  return <TwoShot f={f} p={p} len={len} />;
};

// Звук: карточки ложатся на лист (тихий шорох бумаги).
export const sfxS07Meetings: Sd2SfxPlan = (tl) => {
  const p = meetingsPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.land1 - 2, kind: "paper", volume: 0.16 },
    { at: p.land2 - 2, kind: "paper", volume: 0.16 },
    ...p.tags.map((t) => ({ at: t + 6, kind: "paper" as const, volume: 0.1 })),
  ];
};

