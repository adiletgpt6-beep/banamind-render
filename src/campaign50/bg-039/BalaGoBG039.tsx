// BalaGoBG039 — выпуск №39 / BG-039 «Сапар үзгүлтүккө учурасачы?».
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. hook   — бумажный билет: утро выполнено, обратный путь — «Кызмат
//               аткарган жок», нижняя половина теряет цвет.
//   2. father — отъезд камеры: отец за столом держит этот билет, сам его
//               переворачивает; сын рядом делает уроки (он дома, со взрослым).
//   3. halves — две половины = один полный сапар; из-за одной половины
//               блекнет весь билет.
//   4. rule   — действующее правило сайта: штамп «Кызматтын себеби», учёт по
//               блоку из 10 сапаров, печать «+1 сапар акысыз» в пакет, шкала.
//   5. split  — две отдельные папки: компенсация ≠ скидка за пропуски.
//   6. cta    — билет растворяется в белом; Бишкек, ссылка в профиле,
//               WhatsApp 0998 08 38 28 до конца ролика.
// Губы персонажей — общий риг ролика №12 (CuesContext/SceneContext).
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { CuesContext, SceneContext } from "../../two-schedules-2d/context";
import { ExampleBadge } from "./art";
import { Bg39Audio } from "./Bg39Audio";
import { PreContext, TimelineContext } from "./context";
import { CtaScene } from "./scenes/Cta";
import { FatherScene } from "./scenes/Father";
import { HalvesScene } from "./scenes/Halves";
import { HookScene } from "./scenes/Hook";
import { RuleScene, ruleScaleAt } from "./scenes/Rule";
import { SplitScene } from "./scenes/Split";
import { BG39_VIDEO, type Bg39SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg39Timeline, sceneOf, type Bg39Manifest } from "./timing";

export type BalaGoBG039Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-039/manifest.json.
  readonly manifest: Bg39Manifest;
  // Черновые кадры без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg39SceneId, React.FC> = {
  hook: HookScene,
  father: FatherScene,
  halves: HalvesScene,
  rule: RuleScene,
  split: SplitScene,
  cta: CtaScene,
};

// Наплыв: сцена начинается на pre кадров раньше своего начала и плавно
// проявляется поверх предыдущей (0 — склейка встык).
const PRE: Record<Bg39SceneId, number> = { hook: 0, father: 10, halves: 10, rule: 0, split: 12, cta: 14 };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const SceneWrap: React.FC<{ readonly pre: number; readonly children: React.ReactNode }> = ({ pre, children }) => {
  const f = useCurrentFrame();
  const a = pre > 0 ? clamp01(f / pre) : 1;
  return (
    <PreContext.Provider value={pre}>
      <AbsoluteFill style={{ overflow: "hidden", opacity: a }}>{children}</AbsoluteFill>
    </PreContext.Provider>
  );
};

export const BalaGoBG039: React.FC<BalaGoBG039Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg39Timeline(manifest), [manifest]);
  const fps = BG39_VIDEO.fps;
  const frame = useCurrentFrame();
  // «Шарттуу мисал» виден всё время, пока на экране условный пример:
  // билет, отец, папки. Шкала правила — факт сайта, там плашки нет.
  const rule = sceneOf(tl, "rule");
  const split = sceneOf(tl, "split");
  const cta = sceneOf(tl, "cta");
  const scaleFrom = Math.round(rule.from * fps) + ruleScaleAt(tl);
  const splitF = Math.round(split.from * fps);
  const ctaF = Math.round(cta.from * fps);
  const badge =
    frame < scaleFrom
      ? 1 - clamp01((frame - (scaleFrom - 8)) / 8)
      : clamp01((frame - (splitF - 12)) / 10) * (1 - clamp01((frame - (ctaF - 14)) / 10));
  return (
    <TimelineContext.Provider value={tl}>
      <CuesContext.Provider value={tl.cues as never}>
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id];
            const from = Math.round(sc.from * fps);
            const pre = PRE[sc.id];
            return (
              <Sequence key={sc.id} name={sc.title} from={from - pre} durationInFrames={Math.round(sc.to * fps) - from + pre} premountFor={fps}>
                <SceneContext.Provider value={from}>
                  <SceneWrap pre={pre}>
                    <Scene />
                  </SceneWrap>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <ExampleBadge opacity={badge} />
          <Subtitles />
          <Bg39Audio tl={tl} />
        </AbsoluteFill>
      </CuesContext.Provider>
    </TimelineContext.Provider>
  );
};
