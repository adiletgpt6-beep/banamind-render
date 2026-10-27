// Собственная точка входа BG-002 (не зависит от общего src/Root.tsx):
//   npx remotion render src/campaign50/bg-002/index.ts BG002 out/balago-bg-002.mp4
// BG002       — финальный ролик; без полной озвучки рендер падает.
// BG002-Draft — беззвучный черновик по оценочным таймингам (контрольные
//               кадры до синтеза голоса), не для публикации.
import { Composition } from "remotion";
import { Bg002, type Bg002Props } from "./Bg002";
import { loadBg2Manifest } from "./loadManifest";
import { BG2_VIDEO } from "./script";
import { bg2DurationFrames, estimateBg2Manifest } from "./timing";

export const RemotionRoot: React.FC = () => {
  const est = estimateBg2Manifest();
  return (
    <>
      <Composition
        id={BG2_VIDEO.id}
        component={Bg002}
        width={BG2_VIDEO.width}
        height={BG2_VIDEO.height}
        fps={BG2_VIDEO.fps}
        durationInFrames={bg2DurationFrames(est)}
        defaultProps={{ manifest: est } satisfies Bg002Props}
        calculateMetadata={async ({ props }) => {
          const manifest = await loadBg2Manifest();
          return { props: { ...props, manifest }, durationInFrames: bg2DurationFrames(manifest) };
        }}
      />
      <Composition
        id={`${BG2_VIDEO.id}-Draft`}
        component={Bg002}
        width={BG2_VIDEO.width}
        height={BG2_VIDEO.height}
        fps={BG2_VIDEO.fps}
        durationInFrames={bg2DurationFrames(est)}
        defaultProps={{ manifest: est, silent: true } satisfies Bg002Props}
      />
    </>
  );
};
