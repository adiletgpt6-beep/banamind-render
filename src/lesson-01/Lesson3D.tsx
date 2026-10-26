// 3D-сцена урока: свет, комната, стол с домиком, дети и учитель, камера.
// Всё движение — от useCurrentFrame(); useFrame из R3F не используется.
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { PerspectiveCamera } from "three";
import { Kid, Teacher } from "./Character";
import { PlantBox, Table, ToyHouse } from "./Props";
import { Room } from "./Room";
import {
  BOY,
  GIRL,
  KIDS,
  blink,
  cameraAt,
  faceAngle,
  focus,
  headTurn,
  HOUSE_POINT,
  speech,
  teacherFace,
  teacherGesture,
  teacherPos,
  teacherStand,
  teacherWalk,
  type Cam,
  type KidSpec,
} from "./motion";
import type { LessonSpeaker } from "./script";

const CameraRig: React.FC<{ readonly cam: Cam }> = ({ cam }) => {
  const camera = useThree((st) => st.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
    camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);
    camera.fov = cam.fov;
    camera.near = 0.1;
    camera.far = 60;
    camera.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

const speakerOf = (k: KidSpec): LessonSpeaker | null => (k.id === GIRL.id ? "girl" : k.id === BOY.id ? "boy" : null);

const SeatedKid: React.FC<{ readonly spec: KidSpec; readonly frame: number }> = ({ spec, frame }) => {
  const who = speakerOf(spec);
  const rotY = faceAngle(spec.face);
  const target = focus(frame, who);
  const { yaw, pitch } = headTurn([spec.pos[0], 0.8, spec.pos[2]], rotY, target, 0.95);
  const idleYaw = 0.03 * Math.sin(frame * 0.021 + spec.seed);
  return (
    <Kid
      position={spec.pos}
      rotationY={rotY}
      skin={spec.skin}
      hair={spec.hair}
      shirt={spec.shirt}
      pants={spec.pants}
      girl={spec.girl}
      mouth={who ? speech(frame, who) : 0}
      blink={blink(frame, spec.seed)}
      yaw={yaw + idleYaw}
      pitch={pitch + 0.02 * Math.sin(frame * 0.017 + spec.seed * 2)}
      idle={frame * 0.09 + spec.seed}
    />
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam = cameraAt(frame, durationInFrames);

  const tPos = teacherPos(frame);
  const tStand = teacherStand(frame);
  const tRot = faceAngle(teacherFace(frame));
  const tHead: [number, number, number] = [tPos[0], 0.3 + 0.55 * tStand + 0.84, tPos[2]];
  const tTarget = tStand > 0.5 ? HOUSE_POINT : focus(frame, "teacher");
  const tTurn = headTurn(tHead, tRot, tTarget, 0.9);

  return (
    <>
      <color attach="background" args={["#efe3c9"]} />
      <fog attach="fog" args={["#efe3c9", 9, 20]} />
      <hemisphereLight args={["#dbe8ff", "#6e5a3c", 0.55]} />
      <ambientLight intensity={0.35} />
      {/* солнце из окна: тёплый направленный свет с мягкими тенями */}
      <directionalLight
        position={[3.2, 5.5, -1.5]}
        intensity={2.3}
        color="#fff0d2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      {/* холодный заполняющий свет спереди и тёплый контровой */}
      <pointLight position={[-1.5, 3, 4.5]} intensity={6} color="#dfe9ff" distance={14} decay={2} />
      <pointLight position={[1.5, 2.5, -2.5]} intensity={5} color="#ffd9a3" distance={10} decay={2} />

      <Room frame={frame} />
      <Table />
      <ToyHouse position={[0, 0.38, 0]} rotationY={-0.25} />
      <PlantBox position={[0.55, 0, 0.95]} rotationY={0.3} />

      {KIDS.map((k) => (
        <SeatedKid key={k.id} spec={k} frame={frame} />
      ))}
      <Teacher
        position={tPos}
        rotationY={tRot}
        stand={tStand}
        walk={teacherWalk(frame)}
        gesture={teacherGesture(frame)}
        mouth={speech(frame, "teacher")}
        blink={blink(frame, 41)}
        yaw={tTurn.yaw + 0.02 * Math.sin(frame * 0.019)}
        pitch={tTurn.pitch}
        idle={frame * 0.08}
      />
      <CameraRig cam={cam} />
    </>
  );
};

export const Lesson3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows dpr={1} flat gl={{ antialias: true, alpha: false }} camera={{ fov: 34, near: 0.1, far: 60, position: [0, 1, 2.3] }}>
      <Scene />
    </ThreeCanvas>
  );
};
