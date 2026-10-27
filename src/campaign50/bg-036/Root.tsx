// Собственная точка входа BG-036 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-036/index.ts BalaGoBG036 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG036, type BalaGoBG036Props } from "./BalaGoBG036";
import { loadBg36Manifest } from "./loadManifest";
import { BG36_VIDEO } from "./script";
import { buildBg36Timeline, estimateBg36Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG36_VIDEO.id}
    component={BalaGoBG036}
    width={BG36_VIDEO.width}
    height={BG36_VIDEO.height}
    fps={BG36_VIDEO.fps}
    durationInFrames={buildBg36Timeline(estimateBg36Manifest()).frames}
    defaultProps={{ manifest: estimateBg36Manifest(), requireVoice: false } satisfies BalaGoBG036Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg36Manifest(props.requireVoice);
      return {
        durationInFrames: buildBg36Timeline(manifest).frames,
        props: { ...props, manifest },
      };
    }}
  />
);
