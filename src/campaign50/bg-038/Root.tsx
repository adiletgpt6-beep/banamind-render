import { Composition, Folder } from "remotion";
import "../../fonts";
import { BalaGoBG038, type BalaGoBG038Props } from "./BalaGoBG038";
import { loadBg38Manifest } from "./loadManifest";
import { BG38_VIDEO } from "./script";
import { buildBg38Timeline, estimateBg38Manifest } from "./timing";

// Отдельная точка входа выпуска №38 (BG-038): здесь только своя
// композиция — общий src/Root.tsx и чужие ролики не затрагиваются.
export const RemotionRoot: React.FC = () => (
  <Folder name="BalaGo-50">
    <Composition
      id={BG38_VIDEO.id}
      component={BalaGoBG038}
      width={BG38_VIDEO.width}
      height={BG38_VIDEO.height}
      fps={BG38_VIDEO.fps}
      durationInFrames={buildBg38Timeline(estimateBg38Manifest()).frames}
      defaultProps={{ manifest: estimateBg38Manifest(), allowEstimate: false } satisfies BalaGoBG038Props}
      calculateMetadata={async ({ props }) => {
        const manifest = await loadBg38Manifest(props.allowEstimate);
        return { props: { ...props, manifest }, durationInFrames: buildBg38Timeline(manifest).frames };
      }}
    />
  </Folder>
);
