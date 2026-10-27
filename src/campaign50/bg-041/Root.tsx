import { Composition } from "remotion";
import { BalaGoBG041, type BalaGoBG041Props } from "./BalaGoBG041";
import { loadBg41Manifest } from "./loadManifest";
import { BG41_VIDEO } from "./script";
import { buildBg41Timeline, estimateBg41Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg41Timeline).
// REMOTION_BG041_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG041Root: React.FC = () => (
  <Composition
    id={BG41_VIDEO.id}
    component={BalaGoBG041}
    defaultProps={{ manifest: estimateBg41Manifest() } satisfies BalaGoBG041Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG041_ESTIMATE ? props.manifest : await loadBg41Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg41Timeline(manifest).frames };
    }}
    durationInFrames={buildBg41Timeline(estimateBg41Manifest()).frames}
    fps={BG41_VIDEO.fps}
    width={BG41_VIDEO.width}
    height={BG41_VIDEO.height}
  />
);
