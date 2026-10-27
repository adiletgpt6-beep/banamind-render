// Собственный Root ролика BG-048: только композиция BalaGoBG048. Общие
// src/Root.tsx и src/campaign50/* не меняются (параллельная работа чатов).
// Точка входа — src/campaign50/bg-048/index.ts.
import { Composition } from "remotion";
import { BalaGoBG048, type BalaGoBG048Props } from "./BalaGoBG048";
import { loadB48Manifest } from "./loadManifest";
import { B48_VIDEO } from "./script";
import { buildB48Timeline, estimateB48Manifest } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={B48_VIDEO.id}
    component={BalaGoBG048}
    width={B48_VIDEO.width}
    height={B48_VIDEO.height}
    fps={B48_VIDEO.fps}
    durationInFrames={buildB48Timeline(estimateB48Manifest()).frames}
    defaultProps={{ manifest: estimateB48Manifest(), requireVoice: false } satisfies BalaGoBG048Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadB48Manifest(Boolean(props.requireVoice));
      return { durationInFrames: buildB48Timeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);
