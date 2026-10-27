import { Composition, Folder } from "remotion";
import "../../fonts";
import { BalaGoBG027, type BalaGoBG027Props } from "./BalaGoBG027";
import { loadBg27Manifest } from "./loadManifest";
import { BG27_VIDEO } from "./script";
import { buildBg27Timeline, estimateBg27Manifest } from "./timing";

// Отдельная точка входа выпуска №28 (BG-027): здесь только своя
// композиция — общий src/Root.tsx и чужие ролики не затрагиваются.
export const RemotionRoot: React.FC = () => (
  <Folder name="BalaGo-50">
    <Composition
      id={BG27_VIDEO.id}
      component={BalaGoBG027}
      width={BG27_VIDEO.width}
      height={BG27_VIDEO.height}
      fps={BG27_VIDEO.fps}
      durationInFrames={buildBg27Timeline(estimateBg27Manifest()).frames}
      defaultProps={{ manifest: estimateBg27Manifest(), allowEstimate: false } satisfies BalaGoBG027Props}
      calculateMetadata={async ({ props }) => {
        const manifest = await loadBg27Manifest(props.allowEstimate);
        return { props: { ...props, manifest }, durationInFrames: buildBg27Timeline(manifest).frames };
      }}
    />
  </Folder>
);
