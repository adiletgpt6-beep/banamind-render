// Собственная точка входа BG-011 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-011/index.ts BalaGoBG011 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG011, type BalaGoBG011Props } from "./BalaGoBG011";
import { loadBg11Manifest } from "./loadManifest";
import { BG11_VIDEO } from "./script";
import { buildBg11Timeline, estimateBg11Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG11_VIDEO.id}
    component={BalaGoBG011}
    width={BG11_VIDEO.width}
    height={BG11_VIDEO.height}
    fps={BG11_VIDEO.fps}
    durationInFrames={buildBg11Timeline(estimateBg11Manifest()).frames}
    defaultProps={{ manifest: estimateBg11Manifest(), requireVoice: false } satisfies BalaGoBG011Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg11Manifest(props.requireVoice);
      return { durationInFrames: buildBg11Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
