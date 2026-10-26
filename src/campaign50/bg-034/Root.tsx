// Собственная точка входа BG-034 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-034/index.ts BalaGoBG034 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG034, type BalaGoBG034Props } from "./BalaGoBG034";
import { loadBg34Manifest } from "./loadManifest";
import { BG34_VIDEO } from "./script";
import { buildBg34Timeline, estimateBg34Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG34_VIDEO.id}
    component={BalaGoBG034}
    width={BG34_VIDEO.width}
    height={BG34_VIDEO.height}
    fps={BG34_VIDEO.fps}
    durationInFrames={buildBg34Timeline(estimateBg34Manifest()).frames}
    defaultProps={
      {
        manifest: estimateBg34Manifest(),
        requireVoice: false,
      } satisfies BalaGoBG034Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg34Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg34Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
