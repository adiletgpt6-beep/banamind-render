import { Composition } from "remotion";
import { MuslimKidsGeometryWonders004 } from "./compositions/MuslimKidsGeometryWonders004";
import { DURATION, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuslimKidsGeometryWonders004"
    component={MuslimKidsGeometryWonders004}
    durationInFrames={DURATION * FPS}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
