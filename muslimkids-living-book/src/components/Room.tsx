import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { lightingAt } from "../engines/LightingController";
import { roomTexture, woodTexture } from "../materials/textures";

/** Окружение для мягких отражений (золото обложки, объём бумаги). */
const Environment = ({ intensity }: { intensity: number }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
  }, [env, scene]);
  scene.environmentIntensity = intensity;
  return null;
};

/** Тёплая комната: деревянный стол, размытая стена, свет. */
export const Room = ({ t }: { t: number }) => {
  const L = lightingAt(t);
  const wood = woodTexture();
  const room = roomTexture();
  const key = useMemo(() => {
    const l = new THREE.DirectionalLight();
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const cam = l.shadow.camera as THREE.OrthographicCamera;
    cam.left = -2.4;
    cam.right = 2.4;
    cam.top = 2.4;
    cam.bottom = -2.4;
    cam.near = 0.5;
    cam.far = 16;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.012;
    l.shadow.radius = 6;
    return l;
  }, []);
  key.intensity = L.key;
  key.color.set(L.keyColor);
  return (
    <>
      <Environment intensity={L.env} />
      <hemisphereLight args={[L.hemiSky, L.hemiGround, L.ambient]} />
      <primitive object={key} position={[-2.6, 6.2, 3.2]} />
      <primitive object={key.target} position={[0, 0, 0]} />
      <directionalLight color={L.fillColor} intensity={L.fill} position={[3.5, 2.5, 1.5]} />
      {/* стол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={wood} roughness={0.55} metalness={0} envMapIntensity={0.5} />
      </mesh>
      {/* размытая стена комнаты за столом */}
      <mesh position={[0, 2.6, -6.5]}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial map={room} toneMapped={false} color="#e8dccb" />
      </mesh>
    </>
  );
};
