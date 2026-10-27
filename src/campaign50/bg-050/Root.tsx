// Собственная точка входа BG-050 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-050/index.ts BalaGoBG050 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG050, type BalaGoBG050Props } from "./BalaGoBG050";
import { loadBg50Manifest } from "./loadManifest";
import { BG50_VIDEO } from "./script";
import { buildBg50Timeline, estimateBg50Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG50_VIDEO.id}
    component={BalaGoBG050}
    width={BG50_VIDEO.width}
    height={BG50_VIDEO.height}
    fps={BG50_VIDEO.fps}
    durationInFrames={buildBg50Timeline(estimateBg50Manifest()).frames}
    defaultProps={{ manifest: estimateBg50Manifest(), requireVoice: false } satisfies BalaGoBG050Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg50Manifest(props.requireVoice);
      return { durationInFrames: buildBg50Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
