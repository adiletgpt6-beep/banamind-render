// BalaGoBG032 — BG-032 «7, 12 или 20 километров?» (BalaGo-50, пилот 2).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Вопрос + три жёлтых маршрута 7 / 12 / 20 км от МЕКТЕП
//   2–4. Один непрерывный план карты: база расчёта (школа ↔ дом в одну
//        сторону), машина BalaGo үй → мектеп → үй, ценники 1000/1200/1500
//   5. Одна цена = ҮЙ → МЕКТЕП → ҮЙ (утром и после уроков)
//   6. Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { bg32Beats } from "./beats";
import { Bg32Audio } from "./Bg32Audio";
import { Cta } from "./scenes/Cta";
import { FullTrip } from "./scenes/FullTrip";
import { MapStory } from "./scenes/MapStory";
import { PriceCard } from "./scenes/PriceCard";
import { Subtitles } from "./scenes/Subtitles";
import { BG32_VIDEO } from "./script";
import { buildBg32Timeline, type Bg32Manifest } from "./timing";

export type BalaGoBG032Props = { readonly manifest: Bg32Manifest };

export const BalaGoBG032: React.FC<BalaGoBG032Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg32Timeline(manifest), [manifest]);
  const b = useMemo(() => bg32Beats(tl), [tl]);
  const t = frame / BG32_VIDEO.fps;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      {t < b.t3.to + 0.05 ? (
        <>
          <MapStory t={t} b={b} />
          <PriceCard t={t} b={b} />
        </>
      ) : null}
      {t >= b.full.from - 0.35 && t < b.cta.from + 0.3 ? <FullTrip t={t} b={b} /> : null}
      {t >= b.cta.from - 0.45 ? <Cta t={t} b={b} /> : null}
      <Subtitles t={t} cues={tl.cues} />
      <Bg32Audio tl={tl} b={b} />
    </AbsoluteFill>
  );
};
