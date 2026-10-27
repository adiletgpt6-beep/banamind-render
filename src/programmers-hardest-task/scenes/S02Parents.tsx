// Сцена 02. Кто эти родители (VO03, диктор — рты закрыты).
// 1. «Атасы — программист.» — сплит: сверху крупно редактор кода (строки
//    печатаются) и плашка «Программист»; снизу папа в офисе печатает между
//    двумя мониторами.
// 2. «Апасы — долбоор жетекчиси.» — сплит: сверху доска проекта (стикер
//    переезжает) и плашка «Долбоор жетекчиси»; снизу мама у доски со
//    стикерами показывает рукой, коллега кивает.
// 3. «Экөө тең жумуш күнүн алдын ала пландашат.» — два календаря рядом:
//    у папы и у мамы рабочие встречи и жёлтые семейные записи.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
import { PHT_TEXT, PHT_TIME } from "../script";
import { LaptopFront } from "../sets/Living";
import { DeskFront, MonitorBackSimple, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { OWN } from "../sound";
import { abs, appear, C, font, Paper } from "../ui/kit";
import { CodeCard, ProjectBoard } from "../ui/screens";
import { onTable, placeAt, seated, seatOf } from "./common";

const T = PHT_TEXT;
const SPLIT = 900;

export const parentsBeats = (vo03: { from: number; word: (i: number) => number }) => ({
  mom: vo03.word(2) - 4, // «Апасы …»
  both: vo03.word(5) - 4, // «Экөө тең …»
});

// Плашка роли поверх карточки.
const RoleChip: React.FC<{ readonly text: string; readonly k: number }> = ({ text, k }) => (
  <div style={abs({ left: 0, right: 0, top: 206, display: "flex", justifyContent: "center", opacity: clamp(k * 1.4), transform: `translateY(${(1 - k) * -20}px)` })}>
    <div style={{ padding: "14px 40px", borderRadius: 40, backgroundColor: C.yellow, color: C.navy, fontFamily: font, fontWeight: 900, fontSize: 54, boxShadow: C.shadowSm }}>{text}</div>
  </div>
);

// Календарь родителя одного дня: время и запись; семейные записи — жёлтые.
const DayCard: React.FC<{ readonly x: number; readonly who: string; readonly items: readonly (readonly [string, string, boolean])[]; readonly f: number; readonly from: number }> = ({ x, who, items, f, from }) => (
  <div style={abs({ left: x, top: 300, width: 460, padding: "30px 26px", boxSizing: "border-box", borderRadius: 36, backgroundColor: C.white, boxShadow: C.shadow, fontFamily: font, color: C.navy, opacity: appear(f, from, 8), transform: `translateY(${(1 - appear(f, from, 10)) * 40}px)` })}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ padding: "6px 22px", borderRadius: 30, backgroundColor: who === T.app.dad ? C.navy : "#DCE3EC", color: who === T.app.dad ? C.white : C.navy, fontSize: 44, fontWeight: 900 }}>{who}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: C.grey }}>{T.work.calendar}</div>
    </div>
    {items.map(([time, title, family], i) => {
      const k = appear(f, from + 10 + i * 8, 8);
      return (
        <div key={i} style={{ marginTop: 22, padding: "18px 20px", borderRadius: 22, backgroundColor: family ? C.yellowSoft : "#EEF1F5", borderLeft: `12px solid ${family ? C.yellow : C.navy}`, opacity: k, transform: `translateX(${(1 - k) * 30}px)` }}>
          <div style={{ fontSize: 58, fontWeight: 900 }}>{time}</div>
          <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginTop: 2 }}>{title}</div>
        </div>
      );
    })}
  </div>
);

export const ParentsScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo03 = useLine("vo03");
  const B = parentsBeats(vo03);

  // --- папа в офисе: печатает ---
  const dad = seated("dad", OFFICE.seat);
  const dadPose = (t: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(dad),
    lean: 6,
    armL: { target: onTable(OFFICE.laptop.x - 42 + Math.sin(t / 2.2) * 5, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: onTable(OFFICE.laptop.x + 44 - Math.sin(t / 1.8) * 5, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: 0.4,
    nod: keys(t, [[30, 0], [38, 3], [48, 0]]),
  });
  const dadWorld = (
    <>
      <OfficeBack who="dad" minutes={10 * 60 + 15 + f / 300} />
      <OfficeChair x={dad.x} />
      <Actor uid="p2-dad" look="dad" f={f} place={() => dad} face={() => 0.05} pose={dadPose} seed={2} layer="body" />
      <DeskFront />
      <MonitorBackSimple x={830} y={OFFICE.monitorL.y} w={180} />
      <MonitorBackSimple x={1330} y={OFFICE.monitorR.y} w={180} />
      <Actor uid="p2-dad" look="dad" f={f} place={() => dad} face={() => 0.05} pose={dadPose} seed={2} layer="arms" />
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} open={1} />
    </>
  );

  // --- мама у доски проекта, коллега рядом ---
  const mom = placeAt(1020, 1540, 760);
  const col = placeAt(1210, 1540, 770);
  const mf = (t: number) => t - B.mom;
  const momPose = (t: number) => ({
    expr: "calm" as const,
    // показывает на стикер на доске, затем поворачивается к коллеге
    armR: { target: null, shape: "relax" as const },
    armL: { target: keysV(mf(t), [[0, { x: 960, y: 1180 }], [14, { x: 860, y: 860 }], [40, { x: 820, y: 880 }], [52, { x: 930, y: 1150 }]], anticipate), shape: "point" as const, elbow: "out" as const, behind: false },
    lookY: 0,
  });
  const momFace = (t: number) => keys(mf(t), [[0, -0.6], [40, -0.6], [50, 0.5]]);
  const colPose = (t: number) => ({
    expr: "softSmile" as const,
    armL: { target: { x: col.x - 40, y: 1200 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: col.x - 10, y: 1210 }, shape: "fist" as const, item: "notebook" as const, elbow: "down" as const, behind: false },
    nod: keys(mf(t), [[22, 0], [30, 4], [40, 0], [52, 0], [60, 3], [70, 0]]),
  });
  const momWorld = (
    <>
      <OfficeBack who="mom" minutes={11 * 60 + 40 + f / 300} />
      <Actor uid="p2-col" look="colleagueB" f={f} place={() => col} face={() => -0.55} pose={colPose} seed={7} />
      <Actor uid="p2-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} seed={1} />
    </>
  );

  const typed = clamp((f - 4) / Math.max(1, B.mom - 14));
  return (
    <>
      {/* 1. папа: код сверху, сам — снизу */}
      {f < B.mom ? (
        <>
          <div style={abs({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden" })}>
            <Paper>
              <div style={abs({ left: 90, top: 316, transform: `scale(${0.96 + 0.04 * easeOut(f / 12)})`, transformOrigin: "50% 0%" })}>
                <CodeCard w={900} typed={typed} f={f} />
              </div>
              <RoleChip text={T.roles.father} k={appear(f, vo03.word(1) - 4, 8)} />
            </Paper>
          </div>
          <Shot f={f} from={0} to={B.mom} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, 0, B.mom, { x: 1080, y: 1170, zoom: 1.55 }, { x: 1080, y: 1165, zoom: 1.62 })} bg="#EDF0F3">
            {dadWorld}
          </Shot>
          <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
        </>
      ) : null}
      {/* 2. мама: доска проекта сверху, сама — снизу */}
      {f >= B.mom && f < B.both ? (
        <>
          <div style={abs({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden" })}>
            <Paper>
              <div style={abs({ left: 90, top: 300 })}>
                <ProjectBoard w={900} moved={clamp((f - B.mom - 16) / 22)} />
              </div>
              <RoleChip text={T.roles.mother} k={appear(f, vo03.word(3) - 4, 8)} />
            </Paper>
          </div>
          <Shot f={f} from={B.mom} to={B.both} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, B.mom, B.both, { x: 930, y: 1010, zoom: 1.3 }, { x: 940, y: 1005, zoom: 1.35 })} bg="#F2EFEA">
            {momWorld}
          </Shot>
          <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
        </>
      ) : null}
      {/* 3. два календаря рядом */}
      {f >= B.both ? (
        <Paper>
          <DayCard
            x={70}
            who={T.app.dad}
            f={f}
            from={B.both}
            items={[
              [PHT_TIME.morning, T.app.toSchool, true],
              ["11:00", T.app.meeting, false],
              ["16:00", T.app.meeting, false],
            ]}
          />
          <DayCard
            x={550}
            who={T.app.mom}
            f={f}
            from={B.both + 6}
            items={[
              ["10:00", T.app.meeting, false],
              [PHT_TIME.pickup, T.app.fromSchool, true],
              ["15:00", T.app.meeting, false],
            ]}
          />
        </Paper>
      ) : null}
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = parentsBeats(ctx.line("vo03"));
  return [
    { at: 2, src: OWN("keyboard"), volume: 0.1 },
    { at: B.both + 12, src: OWN("key"), volume: 0.08 },
  ];
};
