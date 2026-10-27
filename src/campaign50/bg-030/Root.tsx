// Собственная точка входа BG-024 (не зависит от src/Root.tsx и общего
// индекса кампании): npx remotion render src/campaign50/bg-030/index.ts BalaGoBG030 …
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG030, type BalaGoBG030Props } from "./BalaGoBG030";
import { loadBg30Manifest } from "./loadManifest";
import { BG30_VIDEO } from "./script";
import { buildBg30Timeline, estimateBg30Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG30_VIDEO.id}
    component={BalaGoBG030}
    width={BG30_VIDEO.width}
    height={BG30_VIDEO.height}
    fps={BG30_VIDEO.fps}
    durationInFrames={buildBg30Timeline(estimateBg30Manifest()).frames}
    defaultProps={{ manifest: estimateBg30Manifest(), requireVoice: false } satisfies BalaGoBG030Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg30Manifest(props.requireVoice);
      return { durationInFrames: buildBg30Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
