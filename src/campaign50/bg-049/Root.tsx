// Собственная точка входа BG-049 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-049/index.ts BalaGoBG049 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG049, type BalaGoBG049Props } from "./BalaGoBG049";
import { loadBg49Manifest } from "./loadManifest";
import { BG49_VIDEO } from "./script";
import { buildBg49Timeline, estimateBg49Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG49_VIDEO.id}
    component={BalaGoBG049}
    width={BG49_VIDEO.width}
    height={BG49_VIDEO.height}
    fps={BG49_VIDEO.fps}
    durationInFrames={buildBg49Timeline(estimateBg49Manifest()).frames}
    defaultProps={
      {
        manifest: estimateBg49Manifest(),
        requireVoice: false,
      } satisfies BalaGoBG049Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg49Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg49Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
