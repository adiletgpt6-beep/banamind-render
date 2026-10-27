// Собственная точка входа BG-035 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-035/index.ts BalaGoBG035 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG035, type BalaGoBG035Props } from "./BalaGoBG035";
import { loadBg35Manifest } from "./loadManifest";
import { BG35_VIDEO } from "./script";
import { buildBg35Timeline, estimateBg35Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG35_VIDEO.id}
    component={BalaGoBG035}
    width={BG35_VIDEO.width}
    height={BG35_VIDEO.height}
    fps={BG35_VIDEO.fps}
    durationInFrames={buildBg35Timeline(estimateBg35Manifest()).frames}
    defaultProps={
      {
        manifest: estimateBg35Manifest(),
        requireVoice: false,
      } satisfies BalaGoBG035Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg35Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg35Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
