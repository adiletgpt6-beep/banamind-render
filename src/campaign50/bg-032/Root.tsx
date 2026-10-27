import { Composition } from "remotion";
import { BalaGoBG032, type BalaGoBG032Props } from "./BalaGoBG032";
import { loadBg32Manifest } from "./loadManifest";
import { BG32_VIDEO } from "./script";
import { buildBg32Timeline, estimateBg32Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg32Timeline).
// REMOTION_BG032_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG032Root: React.FC = () => (
  <Composition
    id={BG32_VIDEO.id}
    component={BalaGoBG032}
    defaultProps={{ manifest: estimateBg32Manifest() } satisfies BalaGoBG032Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG032_ESTIMATE ? props.manifest : await loadBg32Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg32Timeline(manifest).frames };
    }}
    durationInFrames={buildBg32Timeline(estimateBg32Manifest()).frames}
    fps={BG32_VIDEO.fps}
    width={BG32_VIDEO.width}
    height={BG32_VIDEO.height}
  />
);
