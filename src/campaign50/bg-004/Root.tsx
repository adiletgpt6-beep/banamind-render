import { Composition } from "remotion";
import { BalaGoBG004, type BalaGoBG004Props } from "./BalaGoBG004";
import { loadBg04Manifest } from "./loadManifest";
import { BG04_VIDEO } from "./script";
import { buildBg04Timeline, estimateBg04Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg04Timeline).
// REMOTION_BG004_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG004Root: React.FC = () => (
  <Composition
    id={BG04_VIDEO.id}
    component={BalaGoBG004}
    defaultProps={{ manifest: estimateBg04Manifest() } satisfies BalaGoBG004Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG004_ESTIMATE ? props.manifest : await loadBg04Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg04Timeline(manifest).frames };
    }}
    durationInFrames={buildBg04Timeline(estimateBg04Manifest()).frames}
    fps={BG04_VIDEO.fps}
    width={BG04_VIDEO.width}
    height={BG04_VIDEO.height}
  />
);
