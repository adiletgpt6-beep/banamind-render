// Собственный Root ролика BG-017: только композиция BalaGoBG017. Общие
// src/Root.tsx и src/campaign50/* не меняются (параллельная работа чатов).
// Точка входа — src/campaign50/bg-017/index.ts.
import { Composition } from "remotion";
import { BalaGoBG017, type BalaGoBG017Props } from "./BalaGoBG017";
import { loadB17Manifest } from "./loadManifest";
import { B17_VIDEO } from "./script";
import { buildB17Timeline, estimateB17Manifest } from "./timing";

// REMOTION_BG017_PREVIEW=1 (черновые кадры без озвучки) — оценочные тайминги.
const PREVIEW = typeof process !== "undefined" && process.env.REMOTION_BG017_PREVIEW === "1";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={B17_VIDEO.id}
    component={BalaGoBG017}
    width={B17_VIDEO.width}
    height={B17_VIDEO.height}
    fps={B17_VIDEO.fps}
    durationInFrames={buildB17Timeline(estimateB17Manifest()).frames}
    defaultProps={{ manifest: estimateB17Manifest() } satisfies BalaGoBG017Props}
    calculateMetadata={async () => {
      const manifest = PREVIEW ? estimateB17Manifest() : await loadB17Manifest();
      return { durationInFrames: buildB17Timeline(manifest).frames, props: { manifest } };
    }}
  />
);
