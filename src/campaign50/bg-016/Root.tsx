// Собственный корень Remotion выпуска №17 (BG-016): только композиция
// BalaGoBG016 — общие src/Root.tsx и src/campaign50/* не меняются.
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG016, loadBg016Manifest, type BalaGoBG016Props } from "./BalaGoBG016";
import { BG016_VIDEO } from "./script";
import { buildTimeline, estimateManifest } from "./timeline";

export const Bg016Root: React.FC = () => (
  <Composition
    id={BG016_VIDEO.id}
    component={BalaGoBG016}
    defaultProps={{ manifest: estimateManifest(), allowEstimate: false } satisfies BalaGoBG016Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg016Manifest(props.allowEstimate);
      return { props: { ...props, manifest }, durationInFrames: buildTimeline(manifest).frames };
    }}
    durationInFrames={buildTimeline(estimateManifest()).frames}
    fps={BG016_VIDEO.fps}
    width={BG016_VIDEO.width}
    height={BG016_VIDEO.height}
  />
);
