// Собственный Root ролика BG-012: только композиция BalaGoBG012. Общие
// src/Root.tsx и src/campaign50/* не меняются (параллельная работа чатов).
// Точка входа — src/campaign50/bg-012/index.ts.
import { Composition } from "remotion";
import { BalaGoBG012, type BalaGoBG012Props } from "./BalaGoBG012";
import { loadB12Manifest } from "./loadManifest";
import { B12_VIDEO } from "./script";
import { buildB12Timeline, estimateB12Manifest } from "./timing";

// REMOTION_BG012_PREVIEW=1 (черновые кадры без озвучки) — оценочные тайминги.
const PREVIEW = typeof process !== "undefined" && process.env.REMOTION_BG012_PREVIEW === "1";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={B12_VIDEO.id}
    component={BalaGoBG012}
    width={B12_VIDEO.width}
    height={B12_VIDEO.height}
    fps={B12_VIDEO.fps}
    durationInFrames={buildB12Timeline(estimateB12Manifest()).frames}
    defaultProps={{ manifest: estimateB12Manifest() } satisfies BalaGoBG012Props}
    calculateMetadata={async () => {
      const manifest = PREVIEW ? estimateB12Manifest() : await loadB12Manifest();
      return { durationInFrames: buildB12Timeline(manifest).frames, props: { manifest } };
    }}
  />
);
