import { Composition } from "remotion";
import { BalaGoBG013, type BalaGoBG013Props } from "./BalaGoBG013";
import { loadBg13Manifest } from "./loadManifest";
import { BG13_VIDEO } from "./script";
import { buildBg13Timeline, estimateBg13Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg13Timeline).
// REMOTION_BG013_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG013Root: React.FC = () => (
  <Composition
    id={BG13_VIDEO.id}
    component={BalaGoBG013}
    defaultProps={{ manifest: estimateBg13Manifest() } satisfies BalaGoBG013Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG013_ESTIMATE ? props.manifest : await loadBg13Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg13Timeline(manifest).frames };
    }}
    durationInFrames={buildBg13Timeline(estimateBg13Manifest()).frames}
    fps={BG13_VIDEO.fps}
    width={BG13_VIDEO.width}
    height={BG13_VIDEO.height}
  />
);
