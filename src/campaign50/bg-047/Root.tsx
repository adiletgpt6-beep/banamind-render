import { Composition, Folder } from "remotion";
import "../../fonts";
import { BalaGoBG047, type BalaGoBG047Props } from "./BalaGoBG047";
import { loadBg47Manifest } from "./loadManifest";
import { BG47_VIDEO } from "./script";
import { buildBg47Timeline, estimateBg47Manifest } from "./timing";

// Отдельная точка входа выпуска №47 (BG-047): здесь только своя
// композиция — общий src/Root.tsx и чужие ролики не затрагиваются.
export const RemotionRoot: React.FC = () => (
  <Folder name="BalaGo-50">
    <Composition
      id={BG47_VIDEO.id}
      component={BalaGoBG047}
      width={BG47_VIDEO.width}
      height={BG47_VIDEO.height}
      fps={BG47_VIDEO.fps}
      durationInFrames={buildBg47Timeline(estimateBg47Manifest()).frames}
      defaultProps={{ manifest: estimateBg47Manifest(), allowEstimate: false } satisfies BalaGoBG047Props}
      calculateMetadata={async ({ props }) => {
        const manifest = await loadBg47Manifest(props.allowEstimate);
        return { props: { ...props, manifest }, durationInFrames: buildBg47Timeline(manifest).frames };
      }}
    />
  </Folder>
);
