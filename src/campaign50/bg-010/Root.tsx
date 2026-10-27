// Собственная точка входа BG-010 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-010/index.ts BalaGoBG010 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG010, type BalaGoBG010Props } from "./BalaGoBG010";
import { loadBg10Manifest } from "./loadManifest";
import { BG10_VIDEO } from "./script";
import { buildBg10Timeline, estimateBg10Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG10_VIDEO.id}
    component={BalaGoBG010}
    width={BG10_VIDEO.width}
    height={BG10_VIDEO.height}
    fps={BG10_VIDEO.fps}
    durationInFrames={buildBg10Timeline(estimateBg10Manifest()).frames}
    defaultProps={{ manifest: estimateBg10Manifest(), requireVoice: false } satisfies BalaGoBG010Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg10Manifest(props.requireVoice);
      return { durationInFrames: buildBg10Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
