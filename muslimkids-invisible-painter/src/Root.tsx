import { Composition } from "remotion";
import { MuslimKidsInvisiblePainter005 } from "./MuslimKidsInvisiblePainter005";
import T from "./timeline.json";

export const Root: React.FC = () => (
  <Composition
    id="MuslimKidsInvisiblePainter005"
    component={MuslimKidsInvisiblePainter005}
    durationInFrames={T.durationInFrames}
    fps={T.fps}
    width={T.width}
    height={T.height}
  />
);
