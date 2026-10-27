// Собственная точка входа BG-022 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-022/index.ts BalaGoBG022 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG022, type BalaGoBG022Props } from "./BalaGoBG022";
import { loadBg22Manifest } from "./loadManifest";
import { BG22_VIDEO } from "./script";
import { buildBg22Timeline, estimateBg22Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG22_VIDEO.id}
    component={BalaGoBG022}
    width={BG22_VIDEO.width}
    height={BG22_VIDEO.height}
    fps={BG22_VIDEO.fps}
    durationInFrames={buildBg22Timeline(estimateBg22Manifest()).frames}
    defaultProps={
      {
        manifest: estimateBg22Manifest(),
        requireVoice: false,
      } satisfies BalaGoBG022Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg22Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg22Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
