// Собственная точка входа BG-044 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-044/index.ts BalaGoBG044 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG044, type BalaGoBG044Props } from "./BalaGoBG044";
import { loadBg44Manifest } from "./loadManifest";
import { BG44_VIDEO } from "./script";
import { buildBg44Timeline, estimateBg44Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG44_VIDEO.id}
    component={BalaGoBG044}
    width={BG44_VIDEO.width}
    height={BG44_VIDEO.height}
    fps={BG44_VIDEO.fps}
    durationInFrames={buildBg44Timeline(estimateBg44Manifest()).frames}
    defaultProps={{ manifest: estimateBg44Manifest(), requireVoice: false } satisfies BalaGoBG044Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg44Manifest(props.requireVoice);
      return { durationInFrames: buildBg44Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
