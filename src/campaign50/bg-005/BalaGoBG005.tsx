// BalaGoBG005 — BG-005 «Эки район» / «Два района» (BalaGo-50, выпуск №06).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Карта Бишкека: палец соединяет «Жумуш» и «Мектеп» (хук)
//   2. Крюк машины мамы: жумуш → мектеп → үй → жумуш; день рвётся надвое
//   3. Мама сравнивает два пути, спрашивает себя и ищет решение в телефоне
//   4. Условная заявка BalaGo → карта перестраивается в круг ҮЙ → МЕКТЕП → ҮЙ
//   5. Соседние дома сходятся в небольшую группу; затем пробная поездка
//   6. Нить маршрута выпрямляется в логотип; Бишкек, ссылка в профиле и WhatsApp
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeInOut, prog } from "./art";
import { bg05Beats } from "./beats";
import { Bg05Audio } from "./Bg05Audio";
import { Cta } from "./scenes/Cta";
import { MapScene } from "./scenes/MapScene";
import { Office } from "./scenes/Office";
import { Phone } from "./scenes/Phone";
import { Subtitles } from "./scenes/Subtitles";
import { BG05_VIDEO } from "./script";
import { buildBg05Timeline, cueOf, type Bg05Manifest } from "./timing";

export type BalaGoBG005Props = { readonly manifest: Bg05Manifest };

export const BalaGoBG005: React.FC<BalaGoBG005Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg05Timeline(manifest), [manifest]);
  const b = useMemo(() => bg05Beats(tl), [tl]);
  const t = frame / BG05_VIDEO.fps;
  const c = b.compare;
  // офис: шторка-переход с карты и обратно (закрывается телефоном)
  const officeOn = t >= c.from - 0.35 && t < c.phone + 0.5;
  const wipe = easeInOut(prog(t, c.from - 0.35, 0.6));
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      {t < c.from + 0.3 || t >= b.apply.from ? <MapScene t={t} b={b} /> : null}
      {officeOn ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`,
          }}
        >
          <Office t={t} b={b} cue={cueOf(tl, "m01")} />
        </div>
      ) : null}
      <Phone t={t} b={b} />
      {t >= b.cta.from - 0.75 ? <Cta t={t} b={b} /> : null}
      <Subtitles t={t} cues={tl.cues} />
      <Bg05Audio tl={tl} b={b} />
    </AbsoluteFill>
  );
};
