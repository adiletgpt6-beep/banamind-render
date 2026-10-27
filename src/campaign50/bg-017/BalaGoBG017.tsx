// BalaGo-50 №18 / BG-017 «Рисунок нашей недели» — живой детский рисунок,
// камера над альбомом. Шкала построена по фактической озвучке.
import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { B17Audio } from "./B17Audio";
import { TimelineContext } from "./context";
import { Film } from "./Film";
import "./fonts";
import { Subtitles } from "./Subtitles";
import { buildB17Timeline, type B17Manifest } from "./timing";

export type BalaGoBG017Props = {
  // Заполняется в calculateMetadata из public/audio/campaign50/bg-017/manifest.json.
  readonly manifest: B17Manifest;
};

export const BalaGoBG017: React.FC<BalaGoBG017Props> = ({ manifest }) => {
  const tl = useMemo(() => buildB17Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#C89A6A" }}>
        <Film />
        <Subtitles />
        <B17Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
