import { Composition } from "remotion";
import { BalaGoBG037, type BalaGoBG037Props } from "./BalaGoBG037";
import { loadBg37Manifest } from "./loadManifest";
import { BG37_VIDEO } from "./script";
import { buildBg37Timeline, estimateBg37Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg37Timeline).
// REMOTION_BG037_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG037Root: React.FC = () => (
  <Composition
    id={BG37_VIDEO.id}
    component={BalaGoBG037}
    defaultProps={{ manifest: estimateBg37Manifest() } satisfies BalaGoBG037Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG037_ESTIMATE ? props.manifest : await loadBg37Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg37Timeline(manifest).frames };
    }}
    durationInFrames={buildBg37Timeline(estimateBg37Manifest()).frames}
    fps={BG37_VIDEO.fps}
    width={BG37_VIDEO.width}
    height={BG37_VIDEO.height}
  />
);
