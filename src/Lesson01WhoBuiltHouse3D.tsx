import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { Lesson3D } from "./lesson-01/Lesson3D";
import { Overlay } from "./lesson-01/Overlay";
import { LESSON_VIDEO } from "./lesson-01/script";

// Урок 1 «Үйдү ким курду?» в 3D (1920×1080, 20,17 с): картинка собрана
// заново на Three.js, звуковая дорожка исходного ролика — без изменений.
export const Lesson01WhoBuiltHouse3D: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#efe3c9" }}>
    <Lesson3D />
    <Overlay />
    <Audio src={staticFile(LESSON_VIDEO.soundtrack)} />
  </AbsoluteFill>
);
