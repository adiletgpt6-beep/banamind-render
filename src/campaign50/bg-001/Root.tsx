// Отдельная точка входа кампании BalaGo-50 (не меняет src/Root.tsx и
// не затрагивает прежние ролики): npx remotion studio src/campaign50/index.ts
import { Composition } from "remotion";
import { BalaGoBG001, type BalaGoBG001Props } from "./BalaGoBG001";
import { loadBg1Manifest } from "./loadManifest";
import { BG1_FRAMES, BG1_VIDEO } from "./script";
import { estimateBg1Manifest } from "./timing";

export const BG001Composition: React.FC = () => (
  <Composition
    id={BG1_VIDEO.id}
    component={BalaGoBG001}
    defaultProps={{ manifest: estimateBg1Manifest() } satisfies BalaGoBG001Props}
    calculateMetadata={async ({ props }) => ({
      props: { ...props, manifest: process.env.REMOTION_BG001_ESTIMATE ? props.manifest : await loadBg1Manifest() },
    })}
    durationInFrames={BG1_FRAMES}
    fps={BG1_VIDEO.fps}
    width={BG1_VIDEO.width}
    height={BG1_VIDEO.height}
  />
);
