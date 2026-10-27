// Сцена 08. Баары эсепте, жол калды (VO17–VO20, диктор).
// 1. VO17 — приложение показывает актуальную неделю: пять дней, время и кто
//    забирает (изменения недели подсвечиваются по очереди); акцент
//    «Күн тартиби так». Всё верно, без ошибок.
// 2. VO18 — сплит-звонок: папа и мама в своих офисах с телефонами у уха,
//    спокойно договариваются и кивают.
// 3. VO19 — мотив недописанной работы: на мониторе папы отчёт с мигающим
//    курсором, приходит напоминание «Мектептен алып келүү · 13:20». Папа
//    встаёт, берёт телефон и идёт к двери (часы — около 13:00); акцент
//    «Жолго убакыт керек»; коротко — серебристая машина на улице.
// 4. VO20 — вечер дома: папа и мама работают за столом при лампе; та же
//    строка отчёта продолжается поздно вечером.
import { useCurrentFrame } from "remotion";
import { useLine, useSceneLength } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { PHT_TEXT, PHT_TIME, PHT_WEEK } from "../script";
import { LaptopFront, LIVING, PhoneOnTable } from "../sets/Living";
import { DeskFront, MonitorBackSimple, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN, TS2 } from "../sound";
import { abs, Accent, appear, AppIcon, C, font, Notification, Paper } from "../ui/kit";
import { ReportDoc, ScheduleApp } from "../ui/screens";
import { onTable, placeAt, seated, seatOf, standUp } from "./common";
import { dadSeat, EVE, EveningRoom, momSeat } from "./evening";
import { Street } from "./S04Monday";

const T = PHT_TEXT;
const SPLIT = 960;
const EVENING_TIME = "21:40"; // та же строка отчёта — поздно вечером

type L = { from: number; to: number; word: (i: number) => number };
export const loadBeats = (vo17: L, vo18: L, vo19: L, vo20: L) => {
  const office = vo19.word(4) - 4; // «үчүн» — папа встаёт
  return {
    changes: vo17.word(2) - 2, // «өзгөрүүлөрдү» — изменения подсвечиваются
    exact: vo17.word(3) - 4, // «так» — акцент
    talk: vo18.from - 6, // сплит-звонок
    report: vo19.from - 8, // отчёт на мониторе
    remind: vo19.word(1) - 2, // «баланы» — напоминание
    office,
    stand: office + 2,
    phone: office + 12, // берёт телефон
    walk: office + 22,
    door: office + 44, // дверь открывается
    out: office + 58, // вышел
    road: office + 60, // улица
    accent: vo19.word(6) - 4, // «баары бир чыгыш керек» — акцент
    evening: vo20.from - 2, // вечер дома
    insert: vo20.word(4) - 4, // «кечке» — строка отчёта
  };
};
type Beats = ReturnType<typeof loadBeats>;

// --- 1. неделя в приложении ---
const WEEK_ROWS = [
  { time: PHT_TIME.pickup, who: T.app.mom, changed: false },
  { time: PHT_TIME.pickup, who: T.app.mom, changed: true }, // Шш: было Ата
  { time: PHT_TIME.wednesdayPickup, who: T.app.dad, changed: true }, // Шр: 14:10
  { time: PHT_TIME.pickup, who: T.app.dad, changed: true }, // Бш: было Апа
  { time: PHT_TIME.pickup, who: T.app.mom, changed: false },
];
const Week: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  let n = 0;
  return (
    <Paper>
      <div style={abs({ left: 90, top: 390, width: 900, borderRadius: 40, backgroundColor: C.white, boxShadow: C.shadow, overflow: "hidden", opacity: appear(f, 2, 8), transform: `translateY(${(1 - appear(f, 2, 10)) * 30}px)` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "30px 44px 0", fontFamily: font, fontWeight: 900, fontSize: 42, color: C.navy }}>
          <AppIcon size={64} />
          {T.app.title}
        </div>
        <div style={{ marginLeft: 50 }}>
        <ScheduleApp
          w={800}
          day={-1}
          header={false}
          rows={WEEK_ROWS.map((r, i) => {
            const at = r.changed ? B.changes + 7 * n++ : 0;
            return {
              time: r.time,
              title: PHT_WEEK[i].label,
              who: r.who,
              k: appear(f, 6 + i * 4, 8),
              hi: r.changed ? keys(f, [[at, 0], [at + 5, 1], [B.exact + 14, 1], [B.exact + 24, 0]]) : 0,
            };
          })}
        />
        </div>
      </div>
      <Accent text={T.accents.exact} k={appear(f, B.exact, 9)} top={250} />
    </Paper>
  );
};

// --- 2. звонок: офис папы / офис мамы ---
const CallOffice: React.FC<{ readonly who: "dad" | "mom"; readonly f: number; readonly B: Beats; readonly vo18: L }> = ({ who, f, B, vo18 }) => {
  const p = seated(who, OFFICE.seat);
  const ear = { x: p.x + 0.1 * p.h, y: p.y - 0.66 * p.h };
  const t0 = B.talk;
  const nodAt = who === "dad" ? vo18.word(3) : vo18.word(4) + 4;
  const pose = (t: number): PoseIn => ({
    expr: t < t0 + 20 ? "calm" : "softSmile",
    sit: 1,
    seat: seatOf(p),
    lean: 3,
    armR: { target: ear, shape: "phone", item: "phone", glow: 1, itemTilt: -18, flat: 0, elbow: "down", behind: false },
    armL: { target: onTable(p.x - 0.12 * p.h, -6), shape: "relax", elbow: "hang", behind: false },
    lookY: who === "dad" ? 0.15 : keys(t, [[t0, 0.1], [t0 + 30, 0.35], [t0 + 50, 0.1]]),
    lookX: who === "dad" ? keys(t, [[t0, 0], [t0 + 24, -0.3]]) : 0,
    nod: keys(t, [[nodAt, 0], [nodAt + 6, 4], [nodAt + 14, 0], [nodAt + 24, 3], [nodAt + 32, 0]]),
  });
  const face = () => (who === "dad" ? 0.2 : -0.15);
  const uid = `l8-call-${who}`;
  return (
    <>
      <OfficeBack who={who} minutes={(who === "dad" ? 12 * 60 + 5 : 12 * 60 + 6) + f / 300} />
      <OfficeChair x={OFFICE.seat} />
      <Actor uid={uid} look={who} f={f} place={() => p} face={face} pose={pose} seed={who === "dad" ? 2 : 1} layer="body" />
      <DeskFront />
      <LaptopFront x={OFFICE.laptop.x - 40} y={OFFICE.laptop.y} open={1} />
      <Actor uid={uid} look={who} f={f} place={() => p} face={face} pose={pose} seed={who === "dad" ? 2 : 1} layer="arms" />
    </>
  );
};

// --- 3а. отчёт на мониторе папы + напоминание ---
const ReportInsert: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => (
  <Paper tone="#EEF0F4">
    <div style={abs({ left: 90, top: 660, transform: `scale(${1 + 0.03 * clamp((f - B.report) / 50)})`, transformOrigin: "50% 30%" })}>
      <ReportDoc w={900} f={f} typed={0} />
    </div>
    <div style={abs({ left: 110, top: 280 })}>
      <Notification w={860} scale={1.3} title={T.app.fromSchool} body={`${PHT_TIME.pickup} · ${T.app.today} · ${T.app.dad}`} time="12:50" k={appear(f, B.remind, 9)} />
    </div>
  </Paper>
);

// --- 3б. папа встаёт и уходит к двери ---
const DOOR_X = OFFICE.door.x + OFFICE.door.w / 2;
const leavePlace = (t: number, B: Beats): Place => {
  const u = cruise((t - B.walk) / (B.out - B.walk), 0.25);
  return t < B.walk ? seated("dad", OFFICE.seat) : placeAt(lerp(OFFICE.seat, DOOR_X, u), lerp(OFFICE.seatY, 1528, u), 790);
};
const Leave: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  const seat = seated("dad", OFFICE.seat);
  const phoneAt = { x: OFFICE.laptop.x + 170, y: OFFICE.desk.top + 22 };
  const hasPhone = f >= B.phone + 6;
  const pose = (t: number): PoseIn => {
    const s = standUp(t, B.stand, 22);
    const p = leavePlace(t, B);
    return {
      expr: t < B.stand + 6 ? "calm" : "neutral",
      sit: s.sit,
      seat: seatOf(seat),
      lean: s.lean,
      armL:
        t < B.stand + 4
          ? { target: onTable(OFFICE.laptop.x - 40, -12), shape: "relax", elbow: "hang", behind: false }
          : { target: null, shape: "relax" },
      armR:
        t < B.walk + 2
          ? {
              target: keysV(t, [[B.stand, onTable(OFFICE.laptop.x + 44, -12)], [B.phone, onTable(phoneAt.x, -6)], [B.phone + 8, onTable(phoneAt.x, -6)], [B.walk + 2, { x: p.x + 0.17 * p.h, y: p.y - 0.42 * p.h }]], anticipate),
              shape: hasPhone ? "phone" : "relax",
              item: hasPhone ? "phone" : undefined,
              flat: 0,
              glow: 0,
              itemTilt: 10,
              elbow: "down",
              behind: false,
            }
          : { target: { x: p.x + 0.17 * p.h, y: p.y - 0.42 * p.h }, shape: "phone", item: "phone", flat: 0, glow: 0, itemTilt: 10, elbow: "down", behind: false },
      lookY: keys(t, [[B.stand, 0.45], [B.stand + 10, 0.2], [B.phone - 4, 0.55], [B.phone + 8, 0.1]]),
      lookX: keys(t, [[B.stand + 4, 0], [B.stand + 14, -0.35], [B.phone - 4, 0.25], [B.walk, 0.4]]),
    };
  };
  const face = (t: number) => keys(t, [[B.stand, 0.1], [B.stand + 12, -0.2], [B.phone, 0.3], [B.walk, 0.75], [B.door + 6, 0.8], [B.out - 6, 0.6]]);
  const fade = 1 - clamp((f - B.out + 4) / 4);
  return (
    <>
      <OfficeBack who="dad" minutes={12 * 60 + 52 + (f - B.office) / 6} doorOpen={easeInOut((f - B.door) / 12)} />
      <OfficeChair x={OFFICE.seat} />
      <Actor uid="l8-dad" look="dad" f={f} place={(t) => leavePlace(t, B)} face={face} pose={pose} seed={2} walkFrom={B.walk} opacity={fade} layer="body" />
      <DeskFront />
      <MonitorBackSimple x={830} y={OFFICE.monitorL.y} w={180} />
      <MonitorBackSimple x={1330} y={OFFICE.monitorR.y} w={180} />
      {!hasPhone ? <PhoneOnTable x={phoneAt.x} y={phoneAt.y} /> : null}
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} open={1} />
      <Actor uid="l8-dad" look="dad" f={f} place={(t) => leavePlace(t, B)} face={face} pose={pose} seed={2} walkFrom={B.walk} opacity={fade} layer="arms" />
    </>
  );
};

// --- 4. вечер дома: оба работают ---
const Evening: React.FC<{ readonly f: number }> = ({ f }) => {
  const dad = dadSeat();
  const mom = momSeat();
  const tired = mixExpr(EXPR.calm, EXPR.tired, 0.55);
  const momLap = { x: 770, y: LIVING.laptop.y };
  const dadPose = (t: number): PoseIn => {
    const tap = Math.sin(t / 2.2) * 4;
    return {
      expr: tired,
      sit: 1,
      seat: seatOf(dad),
      lean: 7,
      armL: { target: onTable(EVE.laptop.x - 42 + tap, -12), shape: "relax", elbow: "hang", behind: false },
      armR: { target: onTable(EVE.laptop.x + 44 - tap, -12), shape: "relax", elbow: "hang", behind: false },
      lookY: 0.45,
    };
  };
  const momPose = (t: number): PoseIn => {
    const tap = Math.sin(t / 2.5 + 1) * 4;
    return {
      expr: tired,
      sit: 1,
      seat: seatOf(mom),
      lean: 6,
      armL: { target: onTable(momLap.x - 40 + tap, -12), shape: "relax", elbow: "hang", behind: false },
      armR: { target: onTable(momLap.x + 40 - tap, -12), shape: "relax", elbow: "hang", behind: false },
      lookY: 0.45,
      headTilt: -3,
    };
  };
  return (
    <EveningRoom
      state={{ f, extraFront: <LaptopFront x={momLap.x} y={momLap.y} open={1} /> }}
      actors={[
        { uid: "l8-mom-e", look: "mom", place: () => mom, face: () => 0.15, pose: momPose, chair: EVE.mom, seed: 1 },
        { uid: "l8-dad-e", look: "dad", place: () => dad, face: () => -0.05, pose: dadPose, chair: EVE.dad, seed: 2, under: () => true },
      ]}
    />
  );
};

export const LoadScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = useSceneLength();
  const vo17 = useLine("vo17");
  const vo18 = useLine("vo18");
  const vo19 = useLine("vo19");
  const vo20 = useLine("vo20");
  const B = loadBeats(vo17, vo18, vo19, vo20);
  return (
    <>
      {f < B.talk ? <Week f={f} B={B} /> : null}
      {f >= B.talk && f < B.report ? (
        <>
          <Shot f={f} from={B.talk} to={B.report} view={{ top: 0, height: SPLIT }} cam={camMove(f, B.talk, B.report, { x: 1080, y: 1140, zoom: 1.6 }, { x: 1075, y: 1136, zoom: 1.66 })} bg="#EDF0F3">
            <CallOffice who="dad" f={f} B={B} vo18={vo18} />
          </Shot>
          <Shot f={f} from={B.talk} to={B.report} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, B.talk, B.report, { x: 1080, y: 1235, zoom: 1.6 }, { x: 1085, y: 1230, zoom: 1.66 })} bg="#F2EFEA">
            <CallOffice who="mom" f={f} B={B} vo18={vo18} />
          </Shot>
          <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
        </>
      ) : null}
      {f >= B.report && f < B.office ? <ReportInsert f={f} B={B} /> : null}
      <Shot f={f} from={B.office} to={B.road} cam={camMove(f, B.office, B.road, { x: 1160, y: 1060, zoom: 1.25 }, { x: 1470, y: 990, zoom: 1.02 })} bg="#EDF0F3">
        <Leave f={f} B={B} />
      </Shot>
      <Shot f={f} from={B.road} to={B.evening} cam={{ x: 540, y: 960, zoom: 1 }}>
        <Street f={f} from={B.road - 6} driver="dad" />
      </Shot>
      <Shot f={f} from={B.evening} to={B.insert} cam={camMove(f, B.evening, B.insert, { x: 925, y: 1125, zoom: 1.55 }, { x: 920, y: 1120, zoom: 1.62 })} bg="#2A2E44">
        <Evening f={f} />
      </Shot>
      {f >= B.insert ? (
        <div style={abs({ inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #1E2540 0%, #2A2E44 70%, #3A3346 100%)" })}>
          {/* тёплый свет лампы справа */}
          <div style={abs({ right: -380, top: 220, width: 980, height: 980, borderRadius: 490, background: "radial-gradient(circle, rgba(255,196,120,0.30), rgba(255,196,120,0) 70%)" })} />
          <div style={abs({ left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", opacity: appear(f, B.insert, 8) })}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "12px 34px", borderRadius: 40, backgroundColor: "rgba(255,255,255,0.12)", color: C.white, fontFamily: font, fontWeight: 900, fontSize: 46 }}>
              <svg width={34} height={34} viewBox="0 0 20 20">
                <path d="M 13 2 A 8 8 0 1 0 18 13 A 6.5 6.5 0 1 1 13 2 Z" fill={C.yellow} />
              </svg>
              {EVENING_TIME}
            </div>
          </div>
          <div style={abs({ left: 90, top: 520, transform: `scale(${1 + 0.03 * clamp((f - B.insert) / (len - B.insert))})`, transformOrigin: "50% 40%" })}>
            <ReportDoc w={900} f={f} typed={clamp((f - B.insert - 6) / 34)} evening />
          </div>
        </div>
      ) : null}
      {f >= B.accent && f < B.road ? <Accent text={T.accents.road} k={appear(f, B.accent, 9)} top={200} /> : null}
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = loadBeats(ctx.line("vo17"), ctx.line("vo18"), ctx.line("vo19"), ctx.line("vo20"));
  return [
    { at: B.exact, src: COMMON("pop"), volume: 0.08 },
    { at: B.remind, src: COMMON("notify"), volume: 0.2 },
    { at: B.stand, src: TS2("chair"), volume: 0.14 },
    { at: B.door, src: TS2("door-open"), volume: 0.12 },
    { at: B.road, src: COMMON("car"), volume: 0.12, dur: 1.2, fade: 0.3 },
    { at: B.evening, src: OWN("keyboard"), volume: 0.08 },
    { at: B.insert + 4, src: OWN("keyboard"), volume: 0.07 },
  ];
};
