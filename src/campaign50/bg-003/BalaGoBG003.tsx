// BalaGoBG003 — BG-003 «Куда исчезает обед?» (BalaGo-50, выпуск №04).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Хук: 12:30 → 13:30, тарелка → песочные часы → шкала обеда
//   2. Таймлапс: кеңсе → мектеп → үй → кеңсе, шкала обеда съедается
//   3. Неделя: каждый день так же → мысль мамы → она берёт телефон
//   4. Поиск «Бишкекте мектепке туруктуу каттам» → BalaGo → один маршрут
//   5. Честные шаги: группа → бесплатная полная проба → решение родителя
//   6. Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { bg3Beats } from "./beats";
import { Bg3Audio } from "./Bg3Audio";
import { Cta } from "./scenes/Cta";
import { Drive } from "./scenes/Drive";
import { Hook } from "./scenes/Hook";
import { LunchBar } from "./scenes/LunchBar";
import { Search } from "./scenes/Search";
import { Steps } from "./scenes/Steps";
import { Subtitles } from "./scenes/Subtitles";
import { Week } from "./scenes/Week";
import { BG3_VIDEO } from "./script";
import { buildBg3Timeline, cueOf, type Bg3Manifest } from "./timing";

export type BalaGoBG003Props = { readonly manifest: Bg3Manifest };

export const BalaGoBG003: React.FC<BalaGoBG003Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg3Timeline(manifest), [manifest]);
  const b = useMemo(() => bg3Beats(tl), [tl]);
  const t = frame / BG3_VIDEO.fps;
  const vis = (from: number, to: number) => t >= from && t < to;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      {vis(b.drive.from - 0.4, b.week.from + 0.1) ? <Drive t={t} b={b} /> : null}
      {vis(0, b.hook.to + 0.4) ? <Hook t={t} b={b} /> : null}
      {vis(b.hook.toBar, b.drive.to + 0.1) ? <LunchBar t={t} b={b} /> : null}
      {vis(b.week.from - 0.35, b.search.from + 0.05) ? <Week t={t} b={b} m01={cueOf(tl, "m01")} /> : null}
      {vis(b.search.from - 0.2, b.steps.from + 0.25) ? <Search t={t} b={b} /> : null}
      {vis(b.steps.from - 0.25, b.cta.from + 0.1) ? <Steps t={t} b={b} /> : null}
      {vis(b.cta.from - 0.5, Infinity) ? <Cta t={t} b={b} /> : null}
      <Subtitles t={t} cues={tl.cues} />
      <Bg3Audio tl={tl} b={b} />
    </AbsoluteFill>
  );
};
