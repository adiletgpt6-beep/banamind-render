// Главная композиция: MuslimKidsInfiniteWonder013 (60 с, 1080×1920, 30 fps).
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { NoToneMapping } from "three";
import { directorState } from "../engines/InfiniteWonderDirector";
import { WorldStage } from "../scenes/Worlds";
import { SceneOverlays } from "../scenes/Overlays";
import { loadFont } from "../components/Typography";
import { PALETTE } from "../engines/LightingSystem";
import { usePreloadTextures } from "../materials";

loadFont();

export const InfiniteWonder: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const st = directorState(frame);
  const ready = usePreloadTextures();
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.night }}>
      {ready ? (
      <ThreeCanvas
        width={width}
        height={height}
        flat
        gl={{ antialias: true, logarithmicDepthBuffer: true, preserveDrawingBuffer: true }}
        camera={{ fov: 35, near: 0.01, far: 1000, position: [0, 0, 10] }}
        onCreated={({ gl }) => {
          gl.toneMapping = NoToneMapping;
        }}
      >
        <WorldStage st={st} aspect={width / height} />
      </ThreeCanvas>
      ) : null}
      <AbsoluteFill>
        <SceneOverlays st={st} />
      </AbsoluteFill>
      {withAudio ? <Audio src={staticFile("audio/master.wav")} /> : null}
    </AbsoluteFill>
  );
};
