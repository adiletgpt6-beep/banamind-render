// LayersOfRealityEngine — renders the shared 3D world for one camera track.
// All models, poses, lights and the camera are pure functions of time.
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Earth3D } from "../components/Earth3D";
import { GrowingTree } from "../components/GrowingTree";
import { Leaf3D } from "../components/Leaf3D";
import { MountainLandscape } from "../components/MountainLandscape";
import { PlantCell } from "../components/PlantCell";
import { Stars } from "../components/Stars";
import { EARTH, LEAF, MOUNTAIN, TREE } from "../compositions/layout";
import { TRACKS, TrackId, visibility } from "../compositions/shots";
import type { CameraPose } from "./LayerCameraController";
import { blendPreset, LayerLighting, LightPreset } from "./LayerLightingSystem";
import { smoothstep } from "../utils/math";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const P = {
  earth: { key: 3.0, fill: 0.2, rim: 0.6, hemi: 0.3, focus: EARTH.position.clone().add(V(-0.2, 0.6, 0.3)), radius: 3.3 },
  mountains: { key: 2.7, fill: 0.55, rim: 0.65, hemi: 0.62, focus: MOUNTAIN.position.clone().add(V(0.4, 0.3, 0.3)), radius: 2.9 },
  tree: { key: 2.6, fill: 0.6, rim: 0.7, hemi: 0.65, focus: TREE.position.clone().add(V(0, 0.6, 0)), radius: 1.6 },
  leaf: { key: 2.5, fill: 0.62, rim: 0.85, hemi: 0.62, focus: LEAF.position.clone().add(V(0.3, 0.4, 0.3)), radius: 2.4 },
  grand: { key: 2.8, fill: 0.42, rim: 0.7, hemi: 0.45, focus: V(0.1, 0.0, -0.5), radius: 5.6 },
} satisfies Record<string, LightPreset>;

export const lightsAt = (track: TrackId, t: number): LightPreset => {
  if (track === "earth") return P.earth;
  if (track === "mountains") return blendPreset(P.mountains, P.tree, smoothstep(23.8, 25.4, t));
  return blendPreset(P.leaf, P.grand, smoothstep(35.2, 37.4, t));
};

const CameraRig: React.FC<{ pose: CameraPose }> = ({ pose }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.copy(pose.position);
  camera.fov = pose.fov;
  camera.near = 0.05;
  camera.far = 200;
  camera.lookAt(pose.target);
  camera.updateProjectionMatrix();
  return null;
};

export const WorldCanvas: React.FC<{ track: TrackId }> = ({ track }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const vis = visibility(track, t);
  const pose = TRACKS[track].at(t);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows="soft"
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMappingExposure: 1.05 }}
      camera={{ fov: 30, near: 0.05, far: 200, position: [0, 0, 10] }}
    >
      <CameraRig pose={pose} />
      <LayerLighting p={lightsAt(track, t)} />
      <Stars />
      {vis.earth && <Earth3D t={t} showGuides={track === "earth"} />}
      {vis.mountain && <MountainLandscape t={t} />}
      {vis.tree && <GrowingTree t={t} />}
      {vis.leaf && <Leaf3D t={t} />}
      {vis.cells && <PlantCell t={t} />}
    </ThreeCanvas>
  );
};
