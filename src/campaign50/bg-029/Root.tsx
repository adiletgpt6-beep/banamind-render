// Собственная точка входа BG-029 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-029/index.ts BalaGoBG029 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG029, type BalaGoBG029Props } from "./BalaGoBG029";
import { loadBg29Manifest } from "./loadManifest";
import { BG29_VIDEO } from "./script";
import { buildBg29Timeline, estimateBg29Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG29_VIDEO.id}
    component={BalaGoBG029}
    width={BG29_VIDEO.width}
    height={BG29_VIDEO.height}
    fps={BG29_VIDEO.fps}
    durationInFrames={buildBg29Timeline(estimateBg29Manifest()).frames}
    defaultProps={{ manifest: estimateBg29Manifest(), requireVoice: false } satisfies BalaGoBG029Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg29Manifest(props.requireVoice);
      return { durationInFrames: buildBg29Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
