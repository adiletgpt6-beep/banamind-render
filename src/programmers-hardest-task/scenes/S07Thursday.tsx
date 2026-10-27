// Сцена 07. Бейшемби (VO16, диктор). Сплит:
//   • сверху — рабочий календарь мамы, плотный день; на «шашылыш» в 13:00
//     появляется «Шашылыш жолугушуу» — рядом с жёлтой записью 13:20
//     «Мектептен алып келүү · Апа» (два дела в одно время);
//   • снизу — мама в переговорной: печатает, телефон на столе вздрагивает,
//     она берёт его, читает, спокойно выдыхает и смотрит в ноутбук.
// Без паники и красных экранов: просто ещё одно изменение недели.
import { useCurrentFrame } from "remotion";
import { useLine, useSceneLength } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, keys, keysV } from "../rig/motion";
import { PHT_TEXT } from "../script";
import { LaptopFront, PhoneOnTable } from "../sets/Living";
import { DeskFront, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON } from "../sound";
import { abs, appear, C, DayLabel, Paper } from "../ui/kit";
import { WorkCalendar } from "../ui/screens";
import { onTable, seated, seatOf } from "./common";

const T = PHT_TEXT;
const SPLIT = 960;

type L = { from: number; to: number; word: (i: number) => number };
export const thursdayBeats = (vo16: L) => ({
  buzz: vo16.word(1) - 8, // телефон на столе вздрагивает
  pick: vo16.word(1) + 2, // мама берёт телефон
  urgent: vo16.word(2) - 3, // «шашылыш» — событие в календаре
  lower: vo16.word(4) + 2, // «чыкты» — опускает телефон, смотрит в ноутбук
});

export const ThursdayScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo16 = useLine("vo16");
  const len = useSceneLength();
  const B = thursdayBeats(vo16);

  const mom = seated("mom", OFFICE.seat);
  const phoneAt = { x: OFFICE.laptop.x + 190, y: OFFICE.desk.top + 22 };
  const held = f >= B.pick + 6 && f < B.lower + 14;
  const typing = (t: number, side: -1 | 1) => (t < B.buzz + 4 || t > B.lower + 22 ? Math.max(0, Math.sin((t + (side > 0 ? 2.5 : 0)) * 0.95)) * 5 : 0);
  const momPose = (t: number) => ({
    expr: t < B.urgent + 6 ? ("calm" as const) : t < B.lower + 4 ? ("neutral" as const) : ("calm" as const),
    sit: 1,
    seat: seatOf(mom),
    lean: keys(t, [[0, 4], [B.pick, 4], [B.pick + 12, 7], [B.lower + 10, 4]]),
    armL: { target: onTable(OFFICE.laptop.x - 40, -10 - typing(t, -1)), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: {
      target: keysV(
        t,
        [
          [B.pick - 2, onTable(OFFICE.laptop.x + 40, -10)],
          [B.pick + 6, onTable(phoneAt.x, -6)],
          [B.pick + 18, { x: mom.x + 92, y: 1150 }],
          [B.lower + 4, { x: mom.x + 92, y: 1150 }],
          [B.lower + 14, onTable(phoneAt.x, -6)],
          [B.lower + 22, onTable(OFFICE.laptop.x + 40, -10 - typing(t, 1))],
        ],
        anticipate,
      ),
      shape: held ? ("phone" as const) : ("relax" as const),
      item: held ? ("phone" as const) : undefined,
      glow: 1,
      flat: 0,
      itemTilt: -8,
      elbow: t > B.pick + 2 && t < B.lower + 18 ? ("down" as const) : ("hang" as const),
      behind: false,
    },
    // взгляд: в ноутбук → на телефон на столе → в телефон в руке → в ноутбук
    lookY: keys(t, [[0, 0.45], [B.buzz, 0.45], [B.buzz + 6, 0.7], [B.pick + 16, 0.55], [B.lower, 0.55], [B.lower + 10, 0.42]]),
    lookX: keys(t, [[B.buzz, 0], [B.buzz + 6, 0.35], [B.pick + 16, 0.2], [B.lower, 0.2], [B.lower + 10, 0]]),
    exhale: keys(t, [[B.lower - 4, 0], [B.lower + 4, 1], [B.lower + 18, 0]]),
    nod: keys(t, [[B.lower + 6, 0], [B.lower + 12, 3], [B.lower + 22, 0]]),
  });
  const buzz = f >= B.buzz && f < B.pick + 6 ? Math.sin(f * 2.4) * 3 * clamp((B.pick + 6 - f) / 6) : 0;
  const glow = f >= B.buzz && !held ? 1 - clamp((f - B.lower - 30) / 20) : 0;
  const office = (
    <>
      <OfficeBack who="mom" minutes={12 * 60 + 10 + f / 300} />
      <OfficeChair x={OFFICE.seat} />
      <Actor uid="t7-mom" look="mom" f={f} place={() => mom} face={() => 0.05} pose={momPose} seed={1} layer="body" />
      <DeskFront />
      <Actor uid="t7-mom" look="mom" f={f} place={() => mom} face={() => 0.05} pose={momPose} seed={1} layer="arms" />
      {!held ? <PhoneOnTable x={phoneAt.x} y={phoneAt.y} glow={glow} shake={buzz} /> : null}
      <LaptopFront x={OFFICE.laptop.x - 40} y={OFFICE.laptop.y} open={1} />
    </>
  );

  const uk = appear(f, B.urgent, 8);
  const pulse = uk > 0 ? Math.sin(Math.PI * clamp((f - B.urgent) / 24)) : 0;
  return (
    <>
      <div style={abs({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden" })}>
        <Paper>
          <div style={abs({ left: 90, top: 348, transform: `scale(${0.97 + 0.03 * appear(f, 0, 14)})`, transformOrigin: "50% 0%" })}>
            <WorkCalendar
              w={900}
              h={590}
              startHour={12}
              endHour={15}
              nowHour={12 + 10 / 60 + f / 300 / 60}
              title={`${T.app.mom} · ${T.work.calendar}`}
              events={[
                { from: 12, to: 12.75, title: T.work.report },
                { from: 13, to: 14, title: T.urgent, half: "L", k: uk, hi: pulse, color: "#E4E9F0" },
                { from: 13 + 1 / 3, to: 14, title: T.app.fromSchool, icon: "family", color: C.yellowSoft, half: "R" },
                { from: 14.25, to: 15, title: `${T.app.meeting} · ${T.work.colleague}` },
              ]}
            />
          </div>
        </Paper>
      </div>
      <Shot f={f} from={0} to={len + 1} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, 0, len, { x: 1090, y: 1230, zoom: 1.58 }, { x: 1085, y: 1226, zoom: 1.66 })} bg="#F2EFEA">
        {office}
      </Shot>
      <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
      <DayLabel text="БЕЙШЕМБИ" f={f} from={2} hold={len} />
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = thursdayBeats(ctx.line("vo16"));
  return [
    { at: B.buzz, src: COMMON("vibrate"), volume: 0.14, dur: 0.6, fade: 0.1 },
    { at: B.urgent, src: COMMON("pop"), volume: 0.1 },
  ];
};
