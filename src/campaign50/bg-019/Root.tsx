import { Composition, Folder } from "remotion";
import "../../fonts";
import { BalaGoBG019, type BalaGoBG019Props } from "./BalaGoBG019";
import { loadBg19Manifest } from "./loadManifest";
import { BG19_VIDEO } from "./script";
import { buildBg19Timeline, estimateBg19Manifest } from "./timing";

// Отдельная точка входа выпуска №20 (BG-019): здесь только своя
// композиция — общий src/Root.tsx и чужие ролики не затрагиваются.
export const RemotionRoot: React.FC = () => (
  <Folder name="BalaGo-50">
    <Composition
      id={BG19_VIDEO.id}
      component={BalaGoBG019}
      width={BG19_VIDEO.width}
      height={BG19_VIDEO.height}
      fps={BG19_VIDEO.fps}
      durationInFrames={buildBg19Timeline(estimateBg19Manifest()).frames}
      defaultProps={{ manifest: estimateBg19Manifest(), allowEstimate: false } satisfies BalaGoBG019Props}
      calculateMetadata={async ({ props }) => {
        const manifest = await loadBg19Manifest(props.allowEstimate);
        return { props: { ...props, manifest }, durationInFrames: buildBg19Timeline(manifest).frames };
      }}
    />
  </Folder>
);
