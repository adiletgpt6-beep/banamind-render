// Собственная точка входа BG-024 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-024/index.ts BalaGoBG024 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG024, type BalaGoBG024Props } from "./BalaGoBG024";
import { loadBg24Manifest } from "./loadManifest";
import { BG24_VIDEO } from "./script";
import { buildBg24Timeline, estimateBg24Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG24_VIDEO.id}
    component={BalaGoBG024}
    width={BG24_VIDEO.width}
    height={BG24_VIDEO.height}
    fps={BG24_VIDEO.fps}
    durationInFrames={buildBg24Timeline(estimateBg24Manifest()).frames}
    defaultProps={{ manifest: estimateBg24Manifest(), requireVoice: false } satisfies BalaGoBG024Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg24Manifest(props.requireVoice);
      return { durationInFrames: buildBg24Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
