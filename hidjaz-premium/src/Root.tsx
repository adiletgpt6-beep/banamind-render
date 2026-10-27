import { Composition } from "remotion";
import { DURATION_S, FPS, HEIGHT, WIDTH } from "./content";
import { HidjazAd } from "./HidjazAd";

export const Root: React.FC = () => (
  <Composition id="HidjazPremiumAd" component={HidjazAd} durationInFrames={DURATION_S * FPS} fps={FPS} width={WIDTH} height={HEIGHT} />
);
