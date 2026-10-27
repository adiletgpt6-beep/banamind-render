import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { ColorDotField } from "../components/ColorDotField";
import { Typography } from "../components/Typography";
import { BACKGROUNDS, CAMERA, DOT_POOL, KEYFRAMES, TEXTS } from "../timeline";

export const MuslimKidsYasinColorUniverse015: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#081126" }}>
    <ColorDotField id="main" pool={DOT_POOL} keyframes={KEYFRAMES} backgrounds={BACKGROUNDS} camera={CAMERA} />
    <Typography items={TEXTS} />
    <Audio src={staticFile("audio/narration.wav")} />
    <Audio src={staticFile("audio/sfx.wav")} />
  </AbsoluteFill>
);
