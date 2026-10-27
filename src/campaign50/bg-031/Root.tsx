// Собственная точка входа BG-031 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-031/index.ts BalaGoBG031 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG031, type BalaGoBG031Props } from "./BalaGoBG031";
import { loadBg31Manifest } from "./loadManifest";
import { BG31_VIDEO } from "./script";
import { buildBg31Timeline, estimateBg31Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG31_VIDEO.id}
    component={BalaGoBG031}
    width={BG31_VIDEO.width}
    height={BG31_VIDEO.height}
    fps={BG31_VIDEO.fps}
    durationInFrames={buildBg31Timeline(estimateBg31Manifest()).frames}
    defaultProps={
      {
        manifest: estimateBg31Manifest(),
        requireVoice: false,
      } satisfies BalaGoBG031Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg31Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg31Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
