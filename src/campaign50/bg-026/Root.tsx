// Собственная точка входа BG-026 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-026/index.ts BalaGoBG026 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG026, type BalaGoBG026Props } from "./BalaGoBG026";
import { loadBg26Manifest } from "./loadManifest";
import { BG26_VIDEO } from "./script";
import { buildBg26Timeline, estimateBg26Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG26_VIDEO.id}
    component={BalaGoBG026}
    width={BG26_VIDEO.width}
    height={BG26_VIDEO.height}
    fps={BG26_VIDEO.fps}
    durationInFrames={buildBg26Timeline(estimateBg26Manifest()).frames}
    defaultProps={{ manifest: estimateBg26Manifest(), requireVoice: false } satisfies BalaGoBG026Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg26Manifest(props.requireVoice);
      return { durationInFrames: buildBg26Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
