// Композиция BG-008 для собственной точки входа src/campaign50/bg-008/index.ts
// (не меняет src/Root.tsx, src/campaign50/Root.tsx и прежние ролики):
//   npx remotion studio src/campaign50/bg-008/index.ts
import { Composition } from "remotion";
import { BalaGoBG008, type BalaGoBG008Props } from "./BalaGoBG008";
import { loadBg8Manifest } from "./loadManifest";
import { BG8_FRAMES, BG8_VIDEO } from "./script";
import { estimateBg8Manifest } from "./timing";

export const BG008Composition: React.FC = () => (
  <Composition
    id={BG8_VIDEO.id}
    component={BalaGoBG008}
    defaultProps={{ manifest: estimateBg8Manifest() } satisfies BalaGoBG008Props}
    calculateMetadata={async ({ props }) => ({
      props: { ...props, manifest: process.env.REMOTION_BG008_ESTIMATE ? props.manifest : await loadBg8Manifest() },
    })}
    durationInFrames={BG8_FRAMES}
    fps={BG8_VIDEO.fps}
    width={BG8_VIDEO.width}
    height={BG8_VIDEO.height}
  />
);

export const BG008Root: React.FC = () => <BG008Composition />;
