// Собственная точка входа BG-025 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-025/index.ts BalaGoBG025 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG025, type BalaGoBG025Props } from "./BalaGoBG025";
import { loadBg25Manifest } from "./loadManifest";
import { BG25_VIDEO } from "./script";
import { buildBg25Timeline, estimateBg25Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG25_VIDEO.id}
    component={BalaGoBG025}
    width={BG25_VIDEO.width}
    height={BG25_VIDEO.height}
    fps={BG25_VIDEO.fps}
    durationInFrames={buildBg25Timeline(estimateBg25Manifest()).frames}
    defaultProps={{ manifest: estimateBg25Manifest(), requireVoice: false } satisfies BalaGoBG025Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg25Manifest(props.requireVoice);
      return { durationInFrames: buildBg25Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
