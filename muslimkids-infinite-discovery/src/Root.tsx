import React from "react";
import { Composition } from "remotion";
import { InfiniteDiscovery001 } from "./compositions/InfiniteDiscovery001";

export const Root: React.FC = () => (
  <Composition id="InfiniteDiscovery001" component={InfiniteDiscovery001} durationInFrames={1800} fps={30} width={1080} height={1920} />
);
