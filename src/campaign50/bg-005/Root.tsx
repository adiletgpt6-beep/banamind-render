import { Composition } from "remotion";
import { BalaGoBG005, type BalaGoBG005Props } from "./BalaGoBG005";
import { loadBg05Manifest } from "./loadManifest";
import { BG05_VIDEO } from "./script";
import { buildBg05Timeline, estimateBg05Manifest } from "./timing";

// Длительность — по фактической озвучке (buildBg05Timeline).
// REMOTION_BG005_ESTIMATE=1 — черновой предпросмотр без голоса.
export const BG005Root: React.FC = () => (
  <Composition
    id={BG05_VIDEO.id}
    component={BalaGoBG005}
    defaultProps={
      { manifest: estimateBg05Manifest() } satisfies BalaGoBG005Props
    }
    calculateMetadata={async ({ props }) => {
      const manifest = process.env.REMOTION_BG005_ESTIMATE
        ? props.manifest
        : await loadBg05Manifest();
      return {
        props: { ...props, manifest },
        durationInFrames: buildBg05Timeline(manifest).frames,
      };
    }}
    durationInFrames={buildBg05Timeline(estimateBg05Manifest()).frames}
    fps={BG05_VIDEO.fps}
    width={BG05_VIDEO.width}
    height={BG05_VIDEO.height}
  />
);
