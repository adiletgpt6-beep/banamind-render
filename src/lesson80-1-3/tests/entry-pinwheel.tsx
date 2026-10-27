// Отдельный вход для технического листа вертушки (без всего проекта).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PinwheelTest } from "./PinwheelTest";

const PinwheelRoot: React.FC = () => <Composition id="L80-1-3-PinwheelTest" component={PinwheelTest} durationInFrames={120} fps={30} width={1920} height={1080} />;

registerRoot(PinwheelRoot);
