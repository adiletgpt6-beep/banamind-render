// Сцена 06. Шаршемби (VO15, диктор). Короткий графический бит.
// 1. Сообщение школы крупно: «Сабактын убактысы өзгөрдү», 13:20 → 14:10
//    (стрелка на слове «өзгөрдү»).
// 2. Под ним — строка семейного приложения: время спокойно меняется
//    13:20 → 14:10 (исполнитель тот же — Ата), «Убакыт жаңыртылды».
// Приложение работает правильно: изменение просто отражено в расписании.
import { useCurrentFrame } from "remotion";
import { useLine, useSceneLength } from "../context";
import { clamp } from "../rig/motion";
import { PHT_TEXT, PHT_TIME } from "../script";
import type { SceneSound } from "../sound";
import { COMMON } from "../sound";
import { abs, appear, AppIcon, C, DayLabel, font, Paper, Toast } from "../ui/kit";
import { ScheduleApp, SchoolMessage } from "../ui/screens";

const T = PHT_TEXT;

type L = { from: number; to: number; word: (i: number) => number };
export const wednesdayBeats = (vo15: L, len: number) => ({
  message: Math.min(8, vo15.word(1) - 6), // сообщение школы — сразу с подписью дня
  arrow: vo15.word(4) - 6, // «өзгөрдү» — 13:20 → 14:10
  app: vo15.word(4) + 2, // строка приложения
  swap: vo15.word(4) + 10,
  saved: Math.min(len - 16, vo15.to + 6),
});

export const WednesdayScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo15 = useLine("vo15");
  const len = useSceneLength();
  const B = wednesdayBeats(vo15, len);
  const timeK = clamp((f - B.swap) / 14);
  return (
    <Paper>
      <div style={abs({ left: 90, top: 350 })}>
        <SchoolMessage w={900} k={appear(f, B.message, 10)} from={PHT_TIME.pickup} to={PHT_TIME.wednesdayPickup} arrowK={clamp((f - B.arrow) / 10)} />
      </div>
      <div style={abs({ left: 90, top: 965, width: 900, borderRadius: 36, backgroundColor: C.white, boxShadow: C.shadow, overflow: "hidden", opacity: appear(f, B.app, 7), transform: `translateY(${(1 - appear(f, B.app, 9)) * 30}px)` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 40px 0", fontFamily: font, fontWeight: 900, fontSize: 38, color: C.navy }}>
          <AppIcon size={52} />
          {T.app.title}
        </div>
        <ScheduleApp
          w={900}
          day={-1}
          header={false}
          rows={[{ time: PHT_TIME.pickup, timeNext: PHT_TIME.wednesdayPickup, timeK, title: T.app.fromSchool, who: T.app.dad, hi: timeK > 0 && timeK < 1 ? 1 : 0 }]}
        />
      </div>
      <div style={abs({ left: 0, right: 0, top: 1326, display: "flex", justifyContent: "center" })}>
        <Toast text={T.app.updated} k={clamp((f - B.saved) / 8)} size={46} />
      </div>
      <DayLabel text="ШАРШЕМБИ" f={f} from={2} hold={len} />
    </Paper>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = wednesdayBeats(ctx.line("vo15"), ctx.len);
  return [
    { at: B.message, src: COMMON("notify"), volume: 0.18 },
    { at: B.swap, src: COMMON("tap"), volume: 0.14 },
    { at: B.saved, src: COMMON("pop"), volume: 0.1 },
  ];
};
