// Собственная точка входа BG-046 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-046/index.ts BalaGoBG046 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG046, type BalaGoBG046Props } from "./BalaGoBG046";
import { loadBg46Manifest } from "./loadManifest";
import { BG46_VIDEO } from "./script";
import { buildBg46Timeline, estimateBg46Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG46_VIDEO.id}
    component={BalaGoBG046}
    width={BG46_VIDEO.width}
    height={BG46_VIDEO.height}
    fps={BG46_VIDEO.fps}
    durationInFrames={buildBg46Timeline(estimateBg46Manifest()).frames}
    defaultProps={{ manifest: estimateBg46Manifest(), requireVoice: false } satisfies BalaGoBG046Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg46Manifest(props.requireVoice);
      return { durationInFrames: buildBg46Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
