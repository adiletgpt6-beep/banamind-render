// BalaGoBG037 — BG-037 «Качан төлөйм?» (BalaGo-50, выпуск №37).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Кухня: мама с картой — «катталганда эле төлөшүм керекпи?» + вставка
//      сверху: «Арыз» и «Төлөм», рука с картой замирает над «ТӨЛӨМ».
//   2. Папа раскладывает «Топ», «Сыноо», «Чечим», читает условия; мама
//      убирает карту. Камера — в конверт «Топ».
//   3–5. Три конверта сверху: подбор группы (азыр төлөм жок) → первая
//      полная проба акысыз (шарттуу мисал) → решение → топтом → төлөм.
//      Конец 5 — снова кухня, родители спокойно кивают.
//   6. Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28.
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeInOut, prog } from "./art";
import { bg37Beats } from "./beats";
import { Bg37Audio } from "./Bg37Audio";
import { CuesContext, SceneContext } from "./context";
import { Cta } from "./scenes/Cta";
import { DecideScene, GroupScene, TrialScene } from "./scenes/Envelopes";
import { HookInsert } from "./scenes/HookInsert";
import { Kitchen } from "./scenes/Kitchen";
import { Subtitles } from "./scenes/Subtitles";
import { HookTitle, RulesNote } from "./scenes/Titles";
import { BG37_VIDEO } from "./script";
import { buildBg37Timeline, type Bg37Manifest } from "./timing";

export type BalaGoBG037Props = { readonly manifest: Bg37Manifest };

const Layer: React.FC<{ readonly opacity?: number; readonly x?: number; readonly children: React.ReactNode }> = ({ opacity = 1, x = 0, children }) => (
  <div style={{ position: "absolute", inset: 0, opacity, transform: x ? `translateX(${x}px)` : undefined, overflow: "hidden" }}>{children}</div>
);

export const BalaGoBG037: React.FC<BalaGoBG037Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg37Timeline(manifest), [manifest]);
  const b = useMemo(() => bg37Beats(tl), [tl]);
  const t = frame / BG37_VIDEO.fps;
  const scene = useMemo(() => ({ from: 0, len: Math.round(b.decide.to * BG37_VIDEO.fps) + 1 }), [b]);
  // смена «конвертных» сцен: новый лист въезжает справа
  const slide = (from: number) => (1 - easeInOut(prog(t, from - 0.4, 0.4))) * 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      <CuesContext.Provider value={tl.cues}>
        <SceneContext.Provider value={scene}>
          {t < b.rules.to + 0.05 ? <Kitchen b={b} part="intro" /> : null}
          {t >= b.hook.insert && t < b.hook.to ? <HookInsert t={t} b={b} /> : null}
          {t < b.hook.to + 0.2 ? <HookTitle t={t} b={b} /> : null}
          {t >= b.rules.from && t < b.rules.to ? <RulesNote t={t} b={b} /> : null}
          {t >= b.group.from - 0.35 && t < b.trial.from + 0.05 ? (
            <Layer opacity={prog(t, b.group.from - 0.35, 0.35)}>
              <GroupScene t={t} b={b} />
            </Layer>
          ) : null}
          {t >= b.trial.from - 0.4 && t < b.decide.from + 0.05 ? (
            <Layer x={slide(b.trial.from)}>
              <TrialScene t={t} b={b} />
            </Layer>
          ) : null}
          {t >= b.decide.from - 0.4 && t < b.decide.kitchen + 0.4 ? (
            <Layer x={slide(b.decide.from)}>
              <DecideScene t={t} b={b} />
            </Layer>
          ) : null}
          {t >= b.decide.kitchen && t < b.cta.from + 0.5 ? (
            <Layer opacity={prog(t, b.decide.kitchen, 0.35)}>
              <Kitchen b={b} part="outro" />
            </Layer>
          ) : null}
          {t >= b.cta.from - 0.8 ? <Cta t={t} b={b} /> : null}
          <Subtitles t={t} cues={tl.cues} />
          <Bg37Audio tl={tl} b={b} />
        </SceneContext.Provider>
      </CuesContext.Provider>
    </AbsoluteFill>
  );
};
