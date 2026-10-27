// BalaGoBG004 — BG-004 «Бухгалтерия времени» (BalaGo-50, выпуск №05).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Калькулятор: «1 сапар», пустая графа «Убакыт»
//   2–4. Одна таблица «Убакыт эсеби»: строки дня → дни недели («күн сайын»)
//        → курсор переносит маршрут в «Алдын ала уюштуруу» → BalaGo
//   5. ҮЙ → МЕКТЕП → ҮЙ, шаги «Арыз → Топ → Сыноо»
//   6. Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { bg04Beats } from "./beats";
import { Bg04Audio } from "./Bg04Audio";
import { Calculator } from "./scenes/Calculator";
import { Cta } from "./scenes/Cta";
import { Sheet } from "./scenes/Sheet";
import { Subtitles } from "./scenes/Subtitles";
import { Trial } from "./scenes/Trial";
import { BG04_VIDEO } from "./script";
import { buildBg04Timeline, type Bg04Manifest } from "./timing";

export type BalaGoBG004Props = { readonly manifest: Bg04Manifest };

// фон «клетчатой бумаги» таблицы, медленно плывёт
const Paper: React.FC<{ readonly t: number }> = ({ t }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#F6F8FC",
      backgroundImage: "linear-gradient(#E6EBF3 2px, transparent 2px), linear-gradient(90deg, #E6EBF3 2px, transparent 2px)",
      backgroundSize: "90px 90px",
      backgroundPosition: `${(t * 6) % 90}px ${(t * 10) % 90}px`,
    }}
  />
);

export const BalaGoBG004: React.FC<BalaGoBG004Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg04Timeline(manifest), [manifest]);
  const b = useMemo(() => bg04Beats(tl), [tl]);
  const t = frame / BG04_VIDEO.fps;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      <Paper t={t} />
      {t >= b.rows.from - 0.5 && t < b.plan.to + 0.3 ? <Sheet t={t} b={b} /> : null}
      {t < b.hook.to + 0.3 ? <Calculator t={t} b={b} /> : null}
      {t >= b.trial.from - 0.35 && t < b.cta.from + 0.3 ? <Trial t={t} b={b} /> : null}
      {t >= b.cta.from - 0.45 ? <Cta t={t} b={b} /> : null}
      <Subtitles t={t} cues={tl.cues} />
      <Bg04Audio tl={tl} b={b} />
    </AbsoluteFill>
  );
};
