// BalaGoBG009 — BG-009 «Пять рабочих дней» (BalaGo-50, выпуск №10).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Пять дверей недели, на каждой одна школьная метка 07:40 (хук)
//   2–6. Пять дней — пять цветов: дверь распахивается, герой занят своей
//        задачей, метка «07:40 • Мектеп / Ким жеткирет?» каждый раз
//        возвращается; сверху — сквозная линия недели из оторванных кусков
//   7. Календарь недели: школа повторяется каждый день
//   8. Суббота: мама предлагает заранее организовать маршрут и отправляет
//      заявку BalaGo; куски линии соединяются в одну
//   9. ҮЙ → МЕКТЕП → ҮЙ и честные условия
//  10. Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeInOut, prog } from "./art";
import { Bg9Audio } from "./Bg9Audio";
import { dayOf, DAY_IDS } from "./kit";
import { Cta } from "./scenes/Cta";
import { Friday, Monday, Thursday, Tuesday, Wednesday } from "./scenes/Days";
import { DoorWipe } from "./scenes/Door";
import { Hook } from "./scenes/Hook";
import { How } from "./scenes/How";
import { Repeat } from "./scenes/Repeat";
import { Saturday } from "./scenes/Saturday";
import { Subtitles } from "./scenes/Subtitles";
import { WeekBoard } from "./scenes/WeekBoard";
import { BG9_VIDEO } from "./script";
import { buildBg9Timeline, sceneOf, type Bg9Manifest } from "./timing";

export type BalaGoBG009Props = { readonly manifest: Bg9Manifest };

const DAY_SCENES = { mon: Monday, tue: Tuesday, wed: Wednesday, thu: Thursday, fri: Friday } as const;

export const BalaGoBG009: React.FC<BalaGoBG009Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg9Timeline(manifest), [manifest]);
  const t = frame / BG9_VIDEO.fps;
  const hook = sceneOf(tl, "hook");
  const rep = sceneOf(tl, "repeat");
  const sat = sceneOf(tl, "sat");
  const how = sceneOf(tl, "how");
  const cta = sceneOf(tl, "cta");
  const p = { t, tl };
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      {t < hook.to ? <Hook {...p} /> : null}
      {DAY_IDS.map((id) => {
        const s = sceneOf(tl, id);
        const Day = DAY_SCENES[id];
        // день виден до конца въезда следующей двери (или до календаря)
        return t >= s.from && t < s.to + 0.5 ? <Day key={id} {...p} /> : null;
      })}
      {t >= rep.from && t < sat.from + 0.7 ? <Repeat {...p} /> : null}
      {/* двери дней: въезжают справа поверх прошлого дня и распахиваются */}
      {DAY_IDS.map((id, i) => {
        const s = sceneOf(tl, id);
        if (t < s.from - 0.45 || t > s.from + 0.75) return null;
        const d = dayOf(id);
        const slideIn = i === 0 ? 1 : easeInOut(prog(t, s.from - 0.4, 0.4));
        const open = easeInOut(prog(t, s.from + 0.1, 0.6));
        return <DoorWipe key={`door-${id}`} color={d.color} name={d.name} slideIn={slideIn} open={open} />;
      })}
      {t >= sceneOf(tl, "mon").from && t < sat.from ? <WeekBoard {...p} /> : null}
      {t >= sat.from && t < how.from + 0.1 ? <Saturday {...p} /> : null}
      {t >= how.from - 0.5 && t < cta.from + 0.2 ? <How {...p} /> : null}
      {t >= cta.from - 0.65 ? <Cta {...p} /> : null}
      <Subtitles t={t} cues={tl.cues} />
      <Bg9Audio tl={tl} />
    </AbsoluteFill>
  );
};
