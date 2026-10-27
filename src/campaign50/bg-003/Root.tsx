import { Composition } from "remotion";
import { BalaGoBG003, type BalaGoBG003Props } from "./BalaGoBG003";
import { loadBg3Manifest } from "./loadManifest";
import { BG3_VIDEO } from "./script";
import { buildBg3Timeline, estimateBg3Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg3Timeline).
// REMOTION_BG003_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG003Root: React.FC = () => (
  <Composition
    id={BG3_VIDEO.id}
    component={BalaGoBG003}
    defaultProps={{ manifest: estimateBg3Manifest() } satisfies BalaGoBG003Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG003_ESTIMATE ? props.manifest : await loadBg3Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg3Timeline(manifest).frames };
    }}
    durationInFrames={buildBg3Timeline(estimateBg3Manifest()).frames}
    fps={BG3_VIDEO.fps}
    width={BG3_VIDEO.width}
    height={BG3_VIDEO.height}
  />
);
