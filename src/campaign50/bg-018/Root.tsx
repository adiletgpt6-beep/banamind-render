// Отдельный корень выпуска BG-018: собирается только эта композиция
// (общие src/Root.tsx и src/campaign50/Root.tsx не меняются).
import { Composition } from "remotion";
import { BalaGoBG018, type BalaGoBG018Props } from "./BalaGoBG018";
import { loadBg18Manifest } from "./loadManifest";
import { BG18_VIDEO } from "./script";
import { buildBg18Timeline, estimateBg18Manifest } from "./timing";
import "../../fonts";

type Props = BalaGoBG018Props & { readonly draft?: boolean };

export const Bg18Root: React.FC = () => (
  <Composition
    id={BG18_VIDEO.id}
    component={BalaGoBG018 as unknown as React.FC<Props>}
    width={BG18_VIDEO.width}
    height={BG18_VIDEO.height}
    fps={BG18_VIDEO.fps}
    durationInFrames={buildBg18Timeline(estimateBg18Manifest()).frames}
    defaultProps={{ manifest: estimateBg18Manifest(), draft: false } as Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg18Manifest(Boolean(props.draft));
      return { durationInFrames: buildBg18Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
