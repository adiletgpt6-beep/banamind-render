// Отладочная обвязка: отдельная композиция для ОДНОЙ сцены (или листа
// деталей), чтобы проверять кадры сцены независимо от остальных файлов.
// Не участвует в финальном рендере (src/campaign50/bg-044/index.ts).
//   dev/<id>.tsx:  registerRoot(makeSceneRoot("hook", HookScene));
//   node scripts/campaign50/bg-044/dev-stills.mjs --entry src/campaign50/bg-044/dev/hook.tsx --comp Bg44Dev-hook --every 0.5
// В кадре — сцена с настоящей шкалой (по озвучке, если она уже есть в
// public/audio/campaign50/bg-044/voice; иначе оценка по тексту) и окно
// субтитров, как в готовом ролике.
import { useMemo } from "react";
import { Composition, Sequence } from "remotion";
import "../../../fonts";
import { SceneContext, TimelineContext } from "../context";
import { loadBg44Manifest } from "../loadManifest";
import type { Bg44SceneId } from "../script";
import { BG44_VIDEO } from "../script";
import { Subtitles } from "../Subtitles";
import { buildBg44Timeline, estimateBg44Manifest, type Bg44Manifest } from "../timing";

type DevProps = { readonly manifest: Bg44Manifest };

export const makeSceneRoot = (id: Bg44SceneId, Scene: React.FC) => {
  const framesOf = (m: Bg44Manifest) => buildBg44Timeline(m).scenes.find((s) => s.id === id)!.frames;
  const Comp: React.FC<DevProps> = ({ manifest }) => {
    const tl = useMemo(() => buildBg44Timeline(manifest), [manifest]);
    const sc = tl.scenes.find((s) => s.id === id)!;
    return (
      <TimelineContext.Provider value={tl}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", overflow: "hidden" }}>
          <SceneContext.Provider value={{ from: sc.from, frames: sc.frames }}>
            <Scene />
          </SceneContext.Provider>
          <Sequence from={-sc.from} layout="none">
            <Subtitles />
          </Sequence>
        </div>
      </TimelineContext.Provider>
    );
  };
  const Root: React.FC = () => (
    <Composition
      id={`Bg44Dev-${id}`}
      component={Comp}
      width={BG44_VIDEO.width}
      height={BG44_VIDEO.height}
      fps={BG44_VIDEO.fps}
      durationInFrames={framesOf(estimateBg44Manifest())}
      defaultProps={{ manifest: estimateBg44Manifest() } satisfies DevProps}
      calculateMetadata={async () => {
        const manifest = await loadBg44Manifest(false);
        return { durationInFrames: framesOf(manifest), props: { manifest } };
      }}
    />
  );
  return Root;
};

// Лист деталей (спрайты, персонажи, машина…): durationInFrames кадров.
export const makeSheetRoot = (name: string, Sheet: React.FC, durationInFrames = 90) => {
  const Root: React.FC = () => (
    <Composition id={`Bg44Sheet-${name}`} component={Sheet} width={BG44_VIDEO.width} height={BG44_VIDEO.height} fps={BG44_VIDEO.fps} durationInFrames={durationInFrames} />
  );
  return Root;
};
