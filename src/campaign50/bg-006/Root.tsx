// Собственный Root ролика BG-006: только композиция BalaGoBG006. Общие
// src/Root.tsx и src/campaign50/* не меняются (параллельная работа чатов).
// Точка входа — src/campaign50/bg-006/index.ts.
import { Composition } from "remotion";
import { BalaGoBG006, type BalaGoBG006Props } from "./BalaGoBG006";
import { loadB6Manifest } from "./loadManifest";
import { B6_FRAMES, B6_VIDEO } from "./script";
import { estimateB6Manifest } from "./timing";

// BG006_PREVIEW=1 (Studio/черновые кадры без озвучки) — оценочные тайминги.
const PREVIEW = typeof process !== "undefined" && process.env.REMOTION_BG006_PREVIEW === "1";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={B6_VIDEO.id}
    component={BalaGoBG006}
    width={B6_VIDEO.width}
    height={B6_VIDEO.height}
    fps={B6_VIDEO.fps}
    durationInFrames={B6_FRAMES}
    defaultProps={{ manifest: estimateB6Manifest() } satisfies BalaGoBG006Props}
    calculateMetadata={async () => ({
      durationInFrames: B6_FRAMES,
      props: { manifest: PREVIEW ? estimateB6Manifest() : await loadB6Manifest() },
    })}
  />
);
