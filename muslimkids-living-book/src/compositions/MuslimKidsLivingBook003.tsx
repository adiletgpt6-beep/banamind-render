import { ThreeCanvas } from "@remotion/three";
import { useEffect, useState } from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Overlays } from "../components/Overlays";
import { World } from "../components/World";
import { lightingAt } from "../engines/LightingController";
import { loadFonts } from "../styles/fonts";

/**
 * MUSLIM KIDS — 003 «Книга удивительного мира» (технология The Living Book).
 * Всё движение — функция номера кадра Remotion (детерминированный рендер).
 */
export const MuslimKidsLivingBook003 = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    loadFonts().then(() => setFontsReady(true));
  }, []);
  return (
    <AbsoluteFill style={{ backgroundColor: "#3a281b" }}>
      {fontsReady ? (
        <ThreeCanvas
          width={width}
          height={height}
          shadows="soft"
          gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
          camera={{ fov: 34, near: 0.05, far: 60, position: [0, 4, 3] }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = lightingAt(0).exposure;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <World t={t} />
        </ThreeCanvas>
      ) : null}
      {/* мягкая виньетка — внимание к книге, без затемнения кадра */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 85% 70% at 50% 52%, rgba(0,0,0,0) 60%, rgba(30,16,6,0.32) 100%)",
          pointerEvents: "none",
        }}
      />
      {fontsReady ? <Overlays t={t} /> : null}
      <Html5Audio src={staticFile("audio/soundtrack.wav")} />
    </AbsoluteFill>
  );
};
