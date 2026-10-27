// Собственная точка входа BG-007 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-007/index.ts BalaGoBG007 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG007, type BalaGoBG007Props } from "./BalaGoBG007";
import { loadBg7Manifest } from "./loadManifest";
import { BG7_VIDEO } from "./script";
import { buildBg7Timeline, estimateBg7Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG7_VIDEO.id}
    component={BalaGoBG007}
    width={BG7_VIDEO.width}
    height={BG7_VIDEO.height}
    fps={BG7_VIDEO.fps}
    durationInFrames={buildBg7Timeline(estimateBg7Manifest()).frames}
    defaultProps={{ manifest: estimateBg7Manifest(), requireVoice: false } satisfies BalaGoBG007Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg7Manifest(props.requireVoice);
      return { durationInFrames: buildBg7Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
