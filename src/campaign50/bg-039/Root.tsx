import { Composition, Folder } from "remotion";
import "../../fonts";
import { BalaGoBG039, type BalaGoBG039Props } from "./BalaGoBG039";
import { loadBg39Manifest } from "./loadManifest";
import { BG39_VIDEO } from "./script";
import { buildBg39Timeline, estimateBg39Manifest } from "./timing";

// Отдельная точка входа выпуска №39 (BG-039): здесь только своя
// композиция — общий src/Root.tsx и чужие ролики не затрагиваются.
// Длительность — по фактической озвучке (manifest.json).
export const RemotionRoot: React.FC = () => (
  <Folder name="BalaGo-50">
    <Composition
      id={BG39_VIDEO.id}
      component={BalaGoBG039}
      width={BG39_VIDEO.width}
      height={BG39_VIDEO.height}
      fps={BG39_VIDEO.fps}
      durationInFrames={buildBg39Timeline(estimateBg39Manifest()).frames}
      defaultProps={{ manifest: estimateBg39Manifest(), allowEstimate: false } satisfies BalaGoBG039Props}
      calculateMetadata={async ({ props }) => {
        const manifest = await loadBg39Manifest(props.allowEstimate);
        return { props: { ...props, manifest }, durationInFrames: buildBg39Timeline(manifest).frames };
      }}
    />
  </Folder>
);
