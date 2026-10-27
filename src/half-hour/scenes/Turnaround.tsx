import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { HHRenderScaleContext } from "../context";
import { Character, useCharacter, type Who } from "../three/character";
import { face } from "../three/face";
import { armsDown, place } from "../three/poses";
import { lookAt } from "../three/rig";
import { CameraRig, Stage } from "../three/stage";

// Model review sheet (not part of the film): one character turns once on a
// neutral floor so the face, hair, clothes and shoes can be checked from the
// front, three-quarter, profile and back, at body and face distance.
export type HHTurnaroundProps = { who: Who; close: boolean; renderScale: number };

const Turn: React.FC<{ who: Who; close: boolean }> = ({ who, close }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const rig = useCharacter(who);
  const yaw = (Math.min(frame, 120) / 120) * Math.PI * 2;
  place(rig, 0, 0, yaw);
  armsDown(rig, t, { bend: 0.08 });
  const head = rig.bones.head.getWorldPosition(new THREE.Vector3());
  lookAt(rig, new THREE.Vector3(0, head.y, 3), 0.25);
  face(rig, t, [], { smile: 0.35 }, 2);
  const h = head.y;
  const cam = close
    ? { pos: new THREE.Vector3(0, h + 0.05, 2.1), target: new THREE.Vector3(0, h + 0.02, 0), fov: 26 }
    : { pos: new THREE.Vector3(0, h * 0.62, 3.6), target: new THREE.Vector3(0, h * 0.55, 0), fov: 34 };
  return (
    <>
      <hemisphereLight args={["#F4F6FF", "#C9BFB3", 1.2]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color="#E9E2D8" roughness={0.9} />
      </mesh>
      <Character rig={rig} />
      <CameraRig cam={cam} />
    </>
  );
};

export const HalfHourTurnaround: React.FC<HHTurnaroundProps> = ({ who, close, renderScale }) => (
  <HHRenderScaleContext.Provider value={renderScale}>
    <Stage bg="#F1ECE4">
      <Turn who={who} close={close} />
    </Stage>
  </HHRenderScaleContext.Provider>
);
