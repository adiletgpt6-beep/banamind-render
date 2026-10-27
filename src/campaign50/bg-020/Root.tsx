import "../../fonts";
import { Composition } from "remotion";
import { BalaGoBG020, type BalaGoBG020Props } from "./BalaGoBG020";
import { loadBg020Manifest } from "./manifest";
import { BG020_VIDEO } from "./script";
import { buildBg020Timeline } from "./timeline";

// Отдельный корень выпуска №21 (BG-020): собирается и рендерится только
// эта композиция — общие src/Root.tsx и src/campaign50/* не затрагиваются.
export const Bg020Root: React.FC = () => (
  <Composition
    id={BG020_VIDEO.id}
    component={BalaGoBG020}
    width={BG020_VIDEO.width}
    height={BG020_VIDEO.height}
    fps={BG020_VIDEO.fps}
    durationInFrames={BG020_VIDEO.fps * 75}
    defaultProps={{ manifest: null, allowEstimate: false } satisfies BalaGoBG020Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg020Manifest(props.allowEstimate);
      const tl = buildBg020Timeline(manifest);
      return { durationInFrames: tl.durationInFrames, props: { ...props, manifest } };
    }}
  />
);
