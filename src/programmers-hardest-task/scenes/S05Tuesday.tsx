// Сцена 05. Шейшемби (VO12 диктор, VO13 папа, VO14 мама).
// 1. Календарь папы: встреча «Жолугушуу» спокойно переезжает 11:00 → 13:00
//    и встаёт рядом с жёлтой записью «13:20 Мектептен алып келүү · Ата».
// 2. Папа в офисе выделяет эту запись в семейном приложении (палец) и
//    звонит маме.
// 3. Сплит-звонок: сверху папа, снизу мама (телефоны у уха). VO13 — папа.
//    Затем сверху — календарь мамы: её встреча в 13:00 рядом с 13:20; на
//    «алмаштырсам» стрелка переносит встречу на 15:00. VO14 — мама спокойно.
// 4. «Азыр тактап көрөйүн» — сверху переписка с коллегой: запрос → «Макул».
// 5. Оба телефона рядом: строка 13:20 меняет исполнителя Ата → Апа,
//    «Өзгөртүү сакталды». Приложение синхронизируется без ошибок.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { PHT_TEXT, PHT_TIME } from "../script";
import { LaptopFront } from "../sets/Living";
import { DeskFront, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN } from "../sound";
import { abs, appear, C, DayLabel, Finger, font, Paper, Phone, StatusBar, Toast } from "../ui/kit";
import { ChatCard, ScheduleApp, WorkCalendar } from "../ui/screens";
import { onTable, seated, seatOf, SKIN } from "./common";

const T = PHT_TEXT;
const SPLIT = 960;

type L = { from: number; to: number; word: (i: number) => number };
export const tuesdayBeats = (vo12: L, vo13: L, vo14: L, len: number) => ({
  move: vo12.word(4) - 4, // «башка убакытка жылды» — встреча переезжает
  app: vo12.to + 4, // палец выделяет запись
  call: vo13.from - 12, // сплит-звонок
  momCal: vo13.to + 8, // сверху календарь мамы
  swap: vo14.word(2) + 4, // «убакытты алмаштырсам» — стрелка на 15:00
  chat: vo14.word(5) - 4, // «Азыр тактап көрөйүн» — переписка
  sent: vo14.word(5) + 6,
  reply: vo14.to + 6,
  phones: vo14.to + 22, // оба телефона
  saved: Math.min(len - 18, vo14.to + 34),
});

export const TuesdayScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo12 = useLine("vo12");
  const vo13 = useLine("vo13");
  const vo14 = useLine("vo14");
  const len = 382;
  const B = tuesdayBeats(vo12, vo13, vo14, len);

  // --- календарь папы: встреча 11:00 → 13:00 ---
  const mv = easeInOut((f - B.move) / 22);
  const meetFrom = lerp(11, 13, mv);
  const dadCal = (
    <Paper>
      <div style={abs({ left: 90, top: 380 })}>
        <WorkCalendar
          w={900}
          h={1000}
          startHour={10}
          endHour={15}
          title={`${T.app.dad} · ${T.work.calendar}`}
          events={[
            { from: meetFrom, to: meetFrom + 1, title: T.app.meeting, hi: mv > 0.95 ? 1 : 0, half: "L" },
            { from: 13 + 1 / 3, to: 14, title: T.app.fromSchool, icon: "family", color: C.yellowSoft, hi: mv > 0.95 ? 1 : 0, half: "R" },
          ]}
        />
      </div>
    </Paper>
  );

  // --- приложение: палец выделяет запись 13:20 ---
  const appInsert = (
    <Paper>
      <Phone x={150} y={300} w={780}>
        <StatusBar time="10:42" w={718} />
        <ScheduleApp
          w={718}
          day={1}
          dayLabel={`${T.app.today} · ШЕЙШЕМБИ`}
          rows={[
            { time: PHT_TIME.morning, title: T.app.toSchool, who: T.app.dad, done: 1 },
            { time: PHT_TIME.pickup, title: T.app.fromSchool, who: T.app.dad, hi: clamp((f - B.app - 10) / 6) },
          ]}
        />
      </Phone>
      <Finger x={keys(f, [[B.app, 900], [B.app + 10, 640]], anticipate)} y={keys(f, [[B.app, 1600], [B.app + 10, 1010]], anticipate)} {...SKIN.dad} angle={-14} press={f > B.app + 10 && f < B.app + 16 ? 1 : 0} />
    </Paper>
  );

  // --- офисы: папа и мама с телефонами у уха ---
  const dad = seated("dad", OFFICE.seat);
  const mom = seated("mom", OFFICE.seat);
  const dadEar = { x: dad.x + 0.1 * dad.h, y: dad.y - 0.66 * dad.h };
  const momEar = { x: mom.x + 0.1 * mom.h, y: mom.y - 0.66 * mom.h };
  const dadPose = (t: number) => ({
    expr: t < vo13.to ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(dad),
    lean: 3,
    armR: { target: keysV(t, [[B.call - 10, onTable(dad.x + 90, -8)], [B.call + 4, dadEar]], anticipate), shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: keys(t, [[B.call - 6, 0], [B.call + 4, -18]]), flat: 0, elbow: "down" as const, behind: false },
    armL: { target: onTable(dad.x - 0.12 * dad.h, -6), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: 0.1,
    nod: keys(t, [[vo14.to - 6, 0], [vo14.to + 2, 4], [vo14.to + 14, 0]]),
  });
  const momPose = (t: number) => ({
    expr: t < vo14.from ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(mom),
    lean: 3,
    armR: { target: momEar, shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: -18, flat: 0, elbow: "down" as const, behind: false },
    armL: { target: onTable(mom.x - 0.1 * mom.h, -6), shape: "relax" as const, elbow: "hang" as const, behind: false },
    // слушает, смотрит в свой календарь (вниз, на экран), отвечает
    lookY: keys(t, [[vo13.to, 0.05], [vo13.to + 8, 0.45], [vo14.from + 10, 0.45], [vo14.from + 20, 0.05]]),
    nod: keys(t, [[vo14.word(4) - 4, 0], [vo14.word(4) + 4, 4], [vo14.word(4) + 14, 0]]),
  });
  const office = (who: "dad" | "mom") => (
    <>
      <OfficeBack who={who} minutes={(who === "dad" ? 10 * 60 + 44 : 10 * 60 + 45) + f / 300} />
      <OfficeChair x={OFFICE.seat} />
      {who === "dad" ? (
        <Actor uid="t5-dad" look="dad" f={f} place={() => dad} face={() => 0.15} pose={dadPose} role="father" seed={2} layer="body" />
      ) : (
        <Actor uid="t5-mom" look="mom" f={f} place={() => mom} face={() => -0.15} pose={momPose} role="mother" seed={1} layer="body" />
      )}
      <DeskFront />
      <LaptopFront x={OFFICE.laptop.x - 40} y={OFFICE.laptop.y} open={1} />
      {who === "dad" ? (
        <Actor uid="t5-dad" look="dad" f={f} place={() => dad} face={() => 0.15} pose={dadPose} role="father" seed={2} layer="arms" />
      ) : (
        <Actor uid="t5-mom" look="mom" f={f} place={() => mom} face={() => -0.15} pose={momPose} role="mother" seed={1} layer="arms" />
      )}
    </>
  );

  // --- верх сплита после вопроса: календарь мамы, затем переписка ---
  const sw = easeInOut((f - B.swap) / 20);
  const momTop = (
    <Paper>
      {f < B.chat ? (
        <div style={abs({ left: 90, top: 230, opacity: appear(f, B.momCal, 6) })}>
          <WorkCalendar
            w={900}
            h={700}
            startHour={12}
            endHour={16}
            title={`${T.app.mom} · ${T.work.calendar}`}
            events={[
              { from: lerp(13, 15, sw), to: lerp(14, 16, sw), title: `${T.app.meeting} · ${T.work.colleague}`, hi: sw > 0.02 && sw < 0.98 ? 1 : 0, half: "L" },
              { from: 13 + 1 / 3, to: 14, title: T.app.fromSchool, icon: "family", color: C.yellowSoft, half: "R" },
            ]}
          />
        </div>
      ) : (
        <div style={abs({ left: 110, top: 300 })}>
          <ChatCard w={860} sentK={clamp((f - B.sent) / 8)} replyK={clamp((f - B.reply) / 8)} typed={clamp((f - B.chat) / 10)} />
        </div>
      )}
    </Paper>
  );

  // --- оба телефона: Ата → Апа, сохранено ---
  const whoK = clamp((f - B.phones - 8) / 14);
  const phones = (
    <Paper>
      {[T.app.dad, T.app.mom].map((who, i) => (
        <div key={who} style={abs({ left: 90, top: 330 + i * 400, width: 900, borderRadius: 36, backgroundColor: C.white, boxShadow: C.shadow, overflow: "hidden", opacity: appear(f, B.phones + i * 4, 6) })}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 40px 0", fontFamily: font, fontWeight: 900, fontSize: 40, color: C.navy }}>
            <svg width={30} height={48} viewBox="0 0 20 32">
              <rect x={1} y={1} width={18} height={30} rx={4} fill="none" stroke={C.navy} strokeWidth={2.5} />
              <circle cx={10} cy={26} r={1.8} fill={C.navy} />
            </svg>
            {who}
          </div>
          <ScheduleApp w={900} day={-1} header={false} rows={[{ time: PHT_TIME.pickup, title: T.app.fromSchool, who: T.app.dad, whoNext: T.app.mom, whoK, hi: whoK > 0 && whoK < 1 ? 1 : 0 }]} />
        </div>
      ))}
      <div style={abs({ left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center" })}>
        <Toast text={T.app.saved} k={clamp((f - B.saved) / 8)} size={48} />
      </div>
    </Paper>
  );

  return (
    <>
      {f < B.app ? dadCal : null}
      {f >= B.app && f < B.call ? appInsert : null}
      {f >= B.call && f < B.phones ? (
        <>
          {f < B.momCal ? (
            <Shot f={f} from={B.call} to={B.momCal} view={{ top: 0, height: SPLIT }} cam={camMove(f, B.call, B.momCal, { x: 1080, y: 1140, zoom: 1.6 }, { x: 1080, y: 1135, zoom: 1.66 })} bg="#EDF0F3">
              {office("dad")}
            </Shot>
          ) : (
            <div style={abs({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden" })}>{momTop}</div>
          )}
          <Shot f={f} from={B.call} to={B.phones} view={{ top: SPLIT, height: 1920 - SPLIT }} cam={camMove(f, B.call, B.phones, { x: 1080, y: 1235, zoom: 1.6 }, { x: 1080, y: 1228, zoom: 1.68 })} bg="#F2EFEA">
            {office("mom")}
          </Shot>
          <div style={abs({ left: 0, top: SPLIT - 3, width: 1080, height: 6, backgroundColor: C.white })} />
        </>
      ) : null}
      {f >= B.phones ? <div style={abs({ inset: 0, opacity: appear(f, B.phones, 5) })}>{phones}</div> : null}
      <DayLabel text="ШЕЙШЕМБИ" f={f} from={2} hold={Math.min(64, B.move - 8)} />
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = tuesdayBeats(ctx.line("vo12"), ctx.line("vo13"), ctx.line("vo14"), ctx.len);
  return [
    { at: B.app + 10, src: COMMON("tap"), volume: 0.2 },
    { at: B.call - 4, src: OWN("key"), volume: 0.1 },
    { at: B.sent, src: COMMON("tap"), volume: 0.16 },
    { at: B.reply, src: COMMON("pop"), volume: 0.12 },
    { at: B.saved, src: COMMON("notify"), volume: 0.22 },
  ];
};
