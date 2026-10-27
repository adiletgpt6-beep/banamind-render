// Отдельный вход для технического листа походки (80-1-3).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { GAIT_TEST_FRAMES, GaitTest, type GaitTestProps } from "./GaitTest";

const Root: React.FC = () => (
  <Composition id="L80-1-3-GaitTest" component={GaitTest} defaultProps={{ view: "wide", marks: false } satisfies GaitTestProps} durationInFrames={GAIT_TEST_FRAMES} fps={30} width={1920} height={1080} />
);

registerRoot(Root);
