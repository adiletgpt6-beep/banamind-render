// Собственная точка входа BG-033 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-033/index.ts BalaGoBG033 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG033, type BalaGoBG033Props } from "./BalaGoBG033";
import { loadBg33Manifest } from "./loadManifest";
import { BG33_VIDEO } from "./script";
import { buildBg33Timeline, estimateBg33Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG33_VIDEO.id}
    component={BalaGoBG033}
    width={BG33_VIDEO.width}
    height={BG33_VIDEO.height}
    fps={BG33_VIDEO.fps}
    durationInFrames={buildBg33Timeline(estimateBg33Manifest()).frames}
    defaultProps={
      {
        manifest: estimateBg33Manifest(),
        requireVoice: false,
      } satisfies BalaGoBG033Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg33Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg33Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
