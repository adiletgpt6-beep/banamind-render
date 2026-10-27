// Собственная точка входа BG-043 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-043/index.ts BalaGoBG043 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG043, type BalaGoBG043Props } from "./BalaGoBG043";
import { loadBg43Manifest } from "./loadManifest";
import { BG43_VIDEO } from "./script";
import { buildBg43Timeline, estimateBg43Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG43_VIDEO.id}
    component={BalaGoBG043}
    width={BG43_VIDEO.width}
    height={BG43_VIDEO.height}
    fps={BG43_VIDEO.fps}
    durationInFrames={buildBg43Timeline(estimateBg43Manifest()).frames}
    defaultProps={{ manifest: estimateBg43Manifest(), requireVoice: false } satisfies BalaGoBG043Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg43Manifest(props.requireVoice);
      return { durationInFrames: buildBg43Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
