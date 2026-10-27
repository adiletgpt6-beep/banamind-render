// Собственная точка входа BG-045 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-045/index.ts BalaGoBG045 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG045, type BalaGoBG045Props } from "./BalaGoBG045";
import { loadBg45Manifest } from "./loadManifest";
import { BG45_VIDEO } from "./script";
import { buildBg45Timeline, estimateBg45Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG45_VIDEO.id}
    component={BalaGoBG045}
    width={BG45_VIDEO.width}
    height={BG45_VIDEO.height}
    fps={BG45_VIDEO.fps}
    durationInFrames={buildBg45Timeline(estimateBg45Manifest()).frames}
    defaultProps={{ manifest: estimateBg45Manifest(), requireVoice: false } satisfies BalaGoBG045Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg45Manifest(props.requireVoice);
      return { durationInFrames: buildBg45Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
