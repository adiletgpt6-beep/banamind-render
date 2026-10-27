import { Composition } from "remotion";
import { InfiniteWonder } from "./compositions/InfiniteWonder";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./engines/InfiniteWonderDirector";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuslimKidsInfiniteWonder013"
    component={InfiniteWonder}
    durationInFrames={DURATION_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ withAudio: true }}
  />
);
