import { Composition, Folder } from "remotion";
import "../../fonts";
import { BalaGoBG040, type BalaGoBG040Props } from "./BalaGoBG040";
import { loadBg40Manifest } from "./loadManifest";
import { BG40_VIDEO } from "./script";
import { buildBg40Timeline, estimateBg40Manifest } from "./timing";

// Отдельная точка входа выпуска №40 (BG-040): здесь только своя
// композиция — общий src/Root.tsx и чужие ролики не затрагиваются.
export const RemotionRoot: React.FC = () => (
  <Folder name="BalaGo-50">
    <Composition
      id={BG40_VIDEO.id}
      component={BalaGoBG040}
      width={BG40_VIDEO.width}
      height={BG40_VIDEO.height}
      fps={BG40_VIDEO.fps}
      durationInFrames={buildBg40Timeline(estimateBg40Manifest()).frames}
      defaultProps={{ manifest: estimateBg40Manifest(), allowEstimate: false } satisfies BalaGoBG040Props}
      calculateMetadata={async ({ props }) => {
        const manifest = await loadBg40Manifest(props.allowEstimate);
        return { props: { ...props, manifest }, durationInFrames: buildBg40Timeline(manifest).frames };
      }}
    />
  </Folder>
);
