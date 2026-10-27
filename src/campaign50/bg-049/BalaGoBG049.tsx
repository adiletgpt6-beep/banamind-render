import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { appear, easeOut } from "./anim";
import { Bg49Audio } from "./Bg49Audio";
import { SceneContext, TimelineContext, useScene } from "./context";
import { YellowLine } from "./line/YellowLine";
import { C } from "./palette";
import { Paper } from "./parts/ui";
import { CtaScene } from "./scenes/Cta";
import { FormFront, FormScene } from "./scenes/Form";
import { HookScene } from "./scenes/Hook";
import { NotebookFront, NotebookScene } from "./scenes/Notebook";
import { SearchScene } from "./scenes/Search";
import { TrialScene } from "./scenes/Trial";
import type { Bg49SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildBg49Timeline, type Bg49Manifest } from "./timing";

export type BalaGoBG049Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-049/voice/manifest.json.
  readonly manifest: Bg49Manifest;
  // Финальный рендер: без полной актуальной озвучки — ошибка.
  readonly requireVoice: boolean;
};

const SCENES: Record<Bg49SceneId, React.FC> = {
  hook: HookScene,
  notebook: NotebookScene,
  search: SearchScene,
  form: FormScene,
  trial: TrialScene,
  cta: CtaScene,
};

// Передний план отдельных сцен — над жёлтой линией (руки мамы, которые
// держат предметы, не должны перечёркиваться линией).
const FRONT: Partial<Record<Bg49SceneId, React.FC>> = {
  notebook: NotebookFront,
  form: FormFront,
};

// Стык сцен: следующая сцена мягко проявляется поверх предыдущей (OV
// кадров), а жёлтая линия в это время перетекает в новую форму —
// переход мотивирован линией, без вспышек и резких скачков.
export const OV = 14;

const SceneFrame: React.FC<{
  readonly first: boolean;
  readonly children: React.ReactNode;
}> = ({ first, children }) => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  // уходящая сцена гаснет за 8 кадров, новая проявляется с 6-го кадра:
  // короткий «вдох» через чистую бумагу, связь держит только жёлтая линия
  const k = first ? 1 : appear(f, 6, OV - 6);
  const out = easeOut((f - frames) / 8);
  return (
    <AbsoluteFill
      style={{
        opacity: k * (1 - out),
        transform: `scale(${1.018 - 0.018 * k - 0.012 * out})`,
        overflow: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Передний план уходящей сцены не остаётся поверх новой: гаснет на стыке.
const FrontFrame: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const k = appear(f, 6, OV - 6) * (1 - easeOut((f - frames) / 8));
  return (
    <AbsoluteFill
      style={{
        opacity: k,
        transform: `scale(${1.018 - 0.018 * appear(f, 0, OV)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// BG-049 «Бир сары сызык»: сцены по шкале timing.ts, поверх — одна жёлтая
// линия на весь ролик, затем субтитры и звук.
export const BalaGoBG049: React.FC<BalaGoBG049Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg49Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        <Paper />
        {tl.scenes.map((sc, i) => {
          const Scene = SCENES[sc.id];
          const last = i === tl.scenes.length - 1;
          return (
            <Sequence
              key={sc.id}
              name={sc.title}
              from={sc.from}
              durationInFrames={sc.frames + (last ? 0 : OV)}
              premountFor={30}
            >
              <SceneContext.Provider
                value={{ from: sc.from, frames: sc.frames }}
              >
                <SceneFrame first={i === 0}>
                  <Scene />
                </SceneFrame>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <YellowLine />
        {tl.scenes.map((sc) => {
          const Front = FRONT[sc.id];
          if (!Front) return null;
          return (
            <Sequence
              key={`front-${sc.id}`}
              name={`${sc.title} — передний план`}
              from={sc.from}
              durationInFrames={sc.frames + OV}
              premountFor={30}
            >
              <SceneContext.Provider
                value={{ from: sc.from, frames: sc.frames }}
              >
                <FrontFrame>
                  <Front />
                </FrontFrame>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg49Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
