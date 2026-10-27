// MUSLIM KIDS — эксперимент 005 «Когда краски оживают» (The Invisible Painter).
// Холст рисуется InvisiblePainterEngine; надписи — отдельным неподвижным слоем;
// звук — одна сведённая дорожка (голос + деликатные шумы, без музыки).
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { PaintingCanvas } from "./components/PaintingCanvas";
import { Typography } from "./components/Typography";

export const MuslimKidsInvisiblePainter005: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#F7F2E8" }}>
    <PaintingCanvas />
    <Typography />
    <Audio src={staticFile("audio/soundtrack.wav")} />
  </AbsoluteFill>
);
