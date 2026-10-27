// Сцена 03. Воскресная демонстрация (VO04–VO07).
// Общий план: семья за столом, папа разворачивает ноутбук к маме и сыну
// (к камере — внешняя сторона крышки). На VO05 — сплит: сверху крупно экран
// приложения (папин палец показывает утреннюю поездку, затем поездку после
// уроков), снизу семья: папа объясняет, мама внимательно смотрит, сын
// переводит взгляд с папы на экран. VO06 — два телефона на столе получают
// одно и то же спокойное напоминание (один звук). VO07 — папа доволен.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { PHT_TEXT, PHT_TIME } from "../script";
import { ChairBack, LaptopFront, LIVING, LivingBack, Monitor, Mug, PhoneOnTable, TableFront } from "../sets/Living";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN } from "../sound";
import { abs, appear, C, Card, DayLabel, Finger, Notification, Paper } from "../ui/kit";
import { ScheduleApp, Window } from "../ui/screens";
import { onTable, seated, seatOf, SKIN } from "./common";

const T = PHT_TEXT;
const L = LIVING;
// строки приложения в сплите (px кадра): центр строки «утро» и «после уроков»
const ROW1_Y = 460;
const ROW2_Y = 660;

// Кадры действий (кадры сцены), привязанные к репликам.
const beats = (vo05: { from: number; to: number }, vo06: { from: number; to: number }, vo07: { from: number; to: number }) => ({
  turn: [14, 56] as const, // папа разворачивает ноутбук
  split: vo05.from - 6, // сплит: экран + семья
  ping: vo06.from + 8, // уведомление на оба телефона
  phones: vo06.from - 4, // крупно телефоны
  back: vo07.from - 8, // семья, папа доволен
});

export const DemoScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo04 = useLine("vo04");
  const vo05 = useLine("vo05");
  const vo06 = useLine("vo06");
  const vo07 = useLine("vo07");
  const B = beats(vo05, vo06, vo07);
  const dad = seated("dad", L.seat.dad);
  const mom = seated("mom", L.seat.mom);
  const son = seated("son", L.seat.son);
  // слова VO05: «эртең менен» (утро) и «сабактан кийин» (после уроков)
  const wMorning = vo05.word(3);
  const wAfter = vo05.word(6);
  const turn = (t: number) => keys(t, [[B.turn[0], 0], [B.turn[1], 0.42]], anticipate);
  const lapX = (t: number) => keys(t, [[B.turn[0], L.laptop.x], [B.turn[1], L.laptop.x + 26]], anticipate);
  const lid = (t: number) => ({ x: lapX(t), y: L.laptop.y });

  const dadPose = (t: number) => {
    const turning = t >= B.turn[0] - 8 && t <= B.turn[1] + 6;
    const lx = lapX(t);
    const pointing = t >= vo05.from + 6 && t < vo05.to - 4;
    const pointTo = t < wAfter ? 0 : 1;
    return {
      expr: t >= vo07.from - 4 ? ("smile" as const) : t >= vo05.from ? ("softSmile" as const) : ("calm" as const),
      sit: 1,
      seat: seatOf(dad),
      lean: keys(t, [[B.turn[0] - 6, 0], [B.turn[0] + 6, 8], [B.turn[1], 6], [B.turn[1] + 14, 2], [vo05.from, 2], [vo05.from + 10, 7], [vo05.to, 6], [vo05.to + 12, 1]]),
      armL: turning
        ? { target: keysV(t, [[B.turn[0] - 8, onTable(dad.x - 0.14 * dad.h, -4)], [B.turn[0], { x: lx - 72, y: L.laptop.y - 6 }], [B.turn[1], { x: lx - 64, y: L.laptop.y - 4 }]]), shape: "open" as const, elbow: "down" as const, behind: false }
        : { target: onTable(dad.x - 0.14 * dad.h, -4), shape: "relax" as const, elbow: "down" as const, behind: false },
      armR: turning
        ? { target: keysV(t, [[B.turn[0] - 8, onTable(dad.x + 0.14 * dad.h, -4)], [B.turn[0], { x: lx + 72, y: L.laptop.y - 6 }], [B.turn[1], { x: lx + 78, y: L.laptop.y - 2 }]]), shape: "open" as const, elbow: "down" as const, behind: false }
        : pointing
          ? {
              // палец над краем крышки — показывает на экран (строка 1 → строка 2)
              target: keysV(t, [[vo05.from + 6, onTable(dad.x + 0.14 * dad.h, -4)], [vo05.from + 18, { x: lx + 26, y: L.laptop.y - 108 }], [wAfter - 2, { x: lx + 26, y: L.laptop.y - 108 }], [wAfter + 8, { x: lx + 30, y: L.laptop.y - 92 }]], anticipate),
              shape: "point" as const,
              wrist: pointTo ? 10 : 0,
              elbow: "down" as const,
              behind: false,
            }
          : { target: keysV(t, [[vo05.to - 4, { x: lx + 30, y: L.laptop.y - 92 }], [vo05.to + 12, onTable(dad.x + 0.14 * dad.h, -4)]], easeInOut), shape: "relax" as const, elbow: "down" as const, behind: false },
      lookY: t < vo05.from ? keys(t, [[0, 0.45], [B.turn[1] + 10, 0.45], [B.turn[1] + 22, 0.1]]) : t < vo05.to ? 0.45 : keys(t, [[vo05.to, 0.45], [vo05.to + 12, 0.05]]),
      nod: keys(t, [[vo07.from + 6, 0], [vo07.from + 14, 4], [vo07.from + 26, 0]]),
    };
  };
  // папа: на экран; при объяснении — то на экран, то на маму/сына
  const dadFace = (t: number) =>
    keys(t, [
      [0, 0],
      [B.turn[1] + 10, 0],
      [B.turn[1] + 22, 0.45],
      [vo05.from, 0.2],
      [wAfter, 0.2],
      [wAfter + 8, -0.35],
      [vo05.to, -0.35],
      [vo06.from, 0.3],
      [vo07.from, -0.2],
      [vo07.from + 20, 0.25],
    ]);
  const momPose = (t: number) => ({
    expr: t < vo07.from ? ("calm" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(mom),
    lean: keys(t, [[B.turn[0] + 10, 0], [B.turn[1], 9], [vo06.to, 9], [vo06.to + 14, 3]]),
    armL: { target: onTable(mom.x - 0.13 * mom.h, -4), shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: keysV(t, [[0, onTable(mom.x + 0.12 * mom.h, -4)], [B.ping + 30, onTable(mom.x + 0.12 * mom.h, -4)], [B.ping + 44, onTable(L.phoneMom.x + 10, -2)]], anticipate), shape: t > B.ping + 40 ? ("phone" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    lookY: keys(t, [[0, 0.2], [B.turn[1], 0.45], [vo06.from, 0.45], [B.ping + 30, 0.6], [vo07.from, 0.6], [vo07.from + 10, 0.1]]),
    nod: keys(t, [[wMorning + 4, 0], [wMorning + 12, 3], [wMorning + 22, 0], [vo07.to - 6, 0], [vo07.to + 4, 4], [vo07.to + 16, 0]]),
  });
  const momFace = (t: number) => keys(t, [[0, 0.25], [B.turn[1], 0.35], [vo07.from, 0.35], [vo07.from + 10, 0.55]]);
  // сын: на папу → на экран (на словах «сабактан кийин» — снова на папу)
  const sonPose = (t: number) => ({
    expr: t < vo05.from ? ("calm" as const) : t < vo07.from ? ("neutral" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(son),
    lean: keys(t, [[B.turn[1] - 10, 0], [B.turn[1] + 6, 10], [vo06.to, 10], [vo06.to + 10, 2]]),
    armL: { target: onTable(son.x - 0.08 * son.h, 4), shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: onTable(son.x + 0.08 * son.h, 4), shape: "relax" as const, elbow: "down" as const },
    lookY: keys(t, [[0, 0.1], [B.turn[1], 0.5], [vo05.from + 20, 0.5], [vo05.from + 30, 0.05], [wAfter, 0.05], [wAfter + 8, 0.5], [vo05.to, 0.5], [vo05.to + 8, 0.1]]),
  });
  const sonFace = (t: number) => keys(t, [[0, -0.3], [B.turn[1], -0.45], [vo07.from, -0.45], [vo07.from + 10, -0.6]]);

  const ping = clamp((f - B.ping) / 10);
  const world = (
    <>
      <LivingBack minutes={11 * 60 + 10 + f / 300} />
      <ChairBack x={mom.x} />
      <ChairBack x={dad.x} />
      <ChairBack x={son.x} h={600} />
      <Actor uid="d3-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <Actor uid="d3-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <Actor uid="d3-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} layer="body" />
      <TableFront />
      <Monitor x={1590} y={L.monitor.y} glow={0.3} />
      <Mug x={1470} y={L.table.top + 14} />
      <PhoneOnTable x={L.phoneMom.x} y={L.phoneMom.y} glow={ping * (1 - clamp((f - B.ping - 70) / 20))} />
      <PhoneOnTable x={L.phoneDad.x + 30} y={L.phoneDad.y} glow={ping * (1 - clamp((f - B.ping - 70) / 20))} />
      <LaptopFront {...lid(f)} open={1} turn={turn(f)} />
      <Actor uid="d3-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <Actor uid="d3-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      <Actor uid="d3-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} layer="arms" />
    </>
  );

  // экран приложения (в сплите): строки подсвечиваются по словам папы
  const hi1 = clamp((f - (wMorning - 6)) / 8) * (1 - clamp((f - (wAfter - 4)) / 8));
  const hi2 = clamp((f - (wAfter - 4)) / 8);
  const fingerY = keys(f, [[B.split, 1250], [B.split + 14, ROW1_Y], [wAfter - 4, ROW1_Y], [wAfter + 6, ROW2_Y]], anticipate);
  const appCard = (
    <Paper>
      <Card style={abs({ left: 60, top: 60, width: 960, height: 800, overflow: "hidden", padding: 0 })}>
        <Window w={960} h={800} title="">
          <ScheduleApp
            w={960}
            day={-1}
            dayLabel={`${T.app.tomorrow} · ДҮЙШӨМБҮ`}
            rows={[
              { time: PHT_TIME.morning, title: T.app.toSchool, who: T.app.dad, hi: hi1 },
              { time: PHT_TIME.pickup, title: T.app.fromSchool, who: T.app.mom, hi: hi2 },
            ]}
          />
        </Window>
      </Card>
      <Finger x={745} y={fingerY} {...SKIN.dad} angle={-12} scale={0.85} press={f > B.split + 14 && f < B.split + 20 ? 1 : 0} />
    </Paper>
  );

  // два телефона на столе получают одно напоминание; крупно — что пришло
  const phonesInsert = (
    <Paper>
      <div style={abs({ left: 0, right: 0, top: 820, bottom: 0, background: "linear-gradient(180deg, #E7CDA6, #DCBC92)" })} />
      {[
        { x: 120, tilt: -6, who: T.app.mom },
        { x: 600, tilt: 5, who: T.app.dad },
      ].map((p, i) => (
        <div key={i} style={abs({ left: p.x, top: 930 + i * 30, width: 360, height: 740, borderRadius: 48, backgroundColor: "#1B2433", rotate: `${p.tilt}deg`, boxShadow: "0 30px 50px rgba(60,40,20,0.35)", padding: 12, boxSizing: "border-box" })}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 38, backgroundColor: ping > 0 ? "#2E3F63" : "#151C29", overflow: "hidden" }}>
            <div style={abs({ left: 0, right: 0, top: 60, textAlign: "center", color: "rgba(255,255,255,0.9)", fontSize: 74, fontWeight: 300, opacity: ping })}>11:12</div>
            <div style={abs({ left: 12, top: 200 })}>
              <Notification w={312} title={`${T.app.tomorrow} ${PHT_TIME.morning}`} body={T.app.toSchool} time="азыр" k={ping} />
            </div>
            <div style={abs({ left: 0, right: 0, bottom: 40, textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: 40, fontWeight: 800, opacity: ping })}>{p.who}</div>
          </div>
        </div>
      ))}
      <div style={abs({ left: 90, top: 330 })}>
        <Notification w={900} scale={1.25} title={`${T.app.tomorrow} ${PHT_TIME.morning} · ${T.app.toSchool}`} body={`${T.app.dad} жеткирет`} time="азыр" k={ping} />
      </div>
    </Paper>
  );

  const wide = { x: 1085, y: 1130, zoom: 1.28 };
  const SPLIT = 900;
  return (
    <>
      <Shot f={f} from={0} to={B.split} cam={camMove(f, 0, B.split, wide, { ...wide, zoom: 1.34, x: 1095 })}>
        {world}
      </Shot>
      {/* сплит: экран сверху, семья снизу */}
      {f >= B.split && f < B.phones ? (
        <>
          <div style={abs({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden" })}>{appCard}</div>
          <Shot f={f} from={B.split} to={B.phones} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, B.split, B.phones, { x: 1090, y: 1205, zoom: 1.5 }, { x: 1095, y: 1200, zoom: 1.56 })}>
            {world}
          </Shot>
          <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
        </>
      ) : null}
      {f >= B.phones && f < B.back ? <div style={abs({ inset: 0, opacity: appear(f, B.phones, 4) })}>{phonesInsert}</div> : null}
      <Shot f={f} from={B.back} to={9999} cam={camMove(f, B.back, B.back + 70, { x: 1090, y: 1090, zoom: 1.58 }, { x: 1090, y: 1080, zoom: 1.66 }, easeOut)}>
        {world}
      </Shot>
      <DayLabel text={T.sunday} f={f} from={2} hold={Math.max(40, vo04.to - 20)} />
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const vo05 = ctx.line("vo05");
  const vo06 = ctx.line("vo06");
  const vo07 = ctx.line("vo07");
  const B = beats(vo05, vo06, vo07);
  return [
    { at: B.turn[0] + 4, src: OWN("key"), volume: 0.12 },
    { at: B.split + 16, src: COMMON("tap"), volume: 0.18 },
    // одно спокойное напоминание на оба телефона
    { at: B.ping, src: COMMON("notify"), volume: 0.3 },
  ];
};
