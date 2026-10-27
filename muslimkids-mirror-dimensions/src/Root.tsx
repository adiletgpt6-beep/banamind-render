import { Composition } from "remotion";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./engines/MirrorDimensionsEngine";
import { MuslimKidsMirrorDimensions010 } from "./MuslimKidsMirrorDimensions010";
import "./fonts.css";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuslimKidsMirrorDimensions010"
    component={MuslimKidsMirrorDimensions010}
    durationInFrames={DURATION_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
