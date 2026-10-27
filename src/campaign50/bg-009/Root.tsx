import { Composition } from "remotion";
import { BalaGoBG009, type BalaGoBG009Props } from "./BalaGoBG009";
import { loadBg9Manifest } from "./loadManifest";
import { BG9_VIDEO } from "./script";
import { buildBg9Timeline, estimateBg9Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg9Timeline).
// REMOTION_BG009_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG009Root: React.FC = () => (
  <Composition
    id={BG9_VIDEO.id}
    component={BalaGoBG009}
    defaultProps={{ manifest: estimateBg9Manifest() } satisfies BalaGoBG009Props}
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG009_ESTIMATE ? props.manifest : await loadBg9Manifest();
      return { props: { ...props, manifest }, durationInFrames: buildBg9Timeline(manifest).frames };
    }}
    durationInFrames={buildBg9Timeline(estimateBg9Manifest()).frames}
    fps={BG9_VIDEO.fps}
    width={BG9_VIDEO.width}
    height={BG9_VIDEO.height}
  />
);
