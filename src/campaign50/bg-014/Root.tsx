// Собственная точка входа BG-014 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-014/index.ts BalaGoBG014 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG014, type BalaGoBG014Props } from "./BalaGoBG014";
import { loadBg14Manifest } from "./loadManifest";
import { BG14_VIDEO } from "./script";
import { buildBg14Timeline, estimateBg14Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG14_VIDEO.id}
    component={BalaGoBG014}
    width={BG14_VIDEO.width}
    height={BG14_VIDEO.height}
    fps={BG14_VIDEO.fps}
    durationInFrames={buildBg14Timeline(estimateBg14Manifest()).frames}
    defaultProps={{ manifest: estimateBg14Manifest(), requireVoice: false } satisfies BalaGoBG014Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg14Manifest(props.requireVoice);
      return { durationInFrames: buildBg14Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
