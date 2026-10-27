import { Composition } from "remotion";
import { MuslimKidsLivingBook003 } from "./compositions/MuslimKidsLivingBook003";
import { DURATION_FRAMES, TL } from "./story/timeline";

export const RemotionRoot = () => (
  <Composition
    id="MuslimKidsLivingBook003"
    component={MuslimKidsLivingBook003}
    width={TL.width}
    height={TL.height}
    fps={TL.fps}
    durationInFrames={DURATION_FRAMES}
  />
);
