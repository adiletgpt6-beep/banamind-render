import { Composition, getStaticFiles, staticFile } from "remotion";
import { BalaGoBG015, type BalaGoBG015Props } from "./BalaGoBG015";
import { BG15_VIDEO } from "./script";
import { buildTimeline, estimateManifest, requireManifest, type Manifest } from "./timeline";

// Озвучка: public/audio/campaign50/bg-015/manifest.json. Без неё ролик
// собирается только как превью (inputProps {"preview": true}) — с оценочными
// таймингами и без голоса; финальный рендер без голосов запрещён.
const loadManifest = async (preview: boolean): Promise<Manifest> => {
  const path = `${BG15_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const has = files.length === 0 || files.some((f) => f.name === path);
  if (has) {
    const res = await fetch(staticFile(path));
    if (res.ok) {
      const raw = await res.json();
      if (preview && (raw?.partial || raw?.estimated)) return estimateManifest();
      return requireManifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    }
  }
  if (preview) return estimateManifest();
  throw new Error("Озвучка BalaGoBG015 не создана. Рендер без голосов запрещён (для превью: --props='{\"preview\":true}').");
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id={BG15_VIDEO.id}
    component={BalaGoBG015}
    width={BG15_VIDEO.width}
    height={BG15_VIDEO.height}
    fps={BG15_VIDEO.fps}
    durationInFrames={buildTimeline(estimateManifest()).frames}
    defaultProps={{ manifest: estimateManifest() } satisfies BalaGoBG015Props}
    calculateMetadata={async ({ props }) => {
      const preview = Boolean((props as { preview?: boolean }).preview);
      const manifest = await loadManifest(preview);
      return { durationInFrames: buildTimeline(manifest).frames, props: { manifest } };
    }}
  />
);
