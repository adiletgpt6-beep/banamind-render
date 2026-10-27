// Отдельный корень выпуска №22 (BG-021): только композиция BalaGoBG021.
// Общие src/Root.tsx и src/campaign50/* не меняются; рендер — через
// точку входа src/campaign50/bg-021/index.ts.
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG021, type BalaGoBG021Props } from "./BalaGoBG021";
import { loadBg021Manifest } from "./loadManifest";
import { BG021_VIDEO } from "./script";
import { buildBg021Timeline } from "./timing";

export const Bg021Root: React.FC = () => (
  <Composition
    id={BG021_VIDEO.id}
    component={BalaGoBG021}
    width={BG021_VIDEO.width}
    height={BG021_VIDEO.height}
    fps={BG021_VIDEO.fps}
    durationInFrames={70 * BG021_VIDEO.fps}
    defaultProps={{ timeline: null, strictVoice: false } satisfies BalaGoBG021Props}
    calculateMetadata={async ({ props }) => {
      const timeline = buildBg021Timeline(await loadBg021Manifest());
      if (props.strictVoice && !timeline.voiced) {
        throw new Error("Озвучка BG-021 неполная или устарела — финальный рендер без голоса запрещён.");
      }
      return { durationInFrames: timeline.totalFrames, props: { ...props, timeline } };
    }}
  />
);
