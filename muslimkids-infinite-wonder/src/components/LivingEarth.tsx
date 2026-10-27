// Земля: акварельный диск ↔ объёмная вращающаяся планета (один меш),
// облачная оболочка и атмосфера.
import { useMemo } from "react";
import { AdditiveBlending, BackSide, Quaternion, Vector3 } from "three";
import { shader, useTex } from "../materials";
import { atmosphereFragment, cloudsFragment, earthFragment, earthVertex, shellVertex } from "../shaders/earth";
import { SPACE_SUN } from "../engines/LightingSystem";
import { earthQuaternion } from "../engines/InfiniteJourneyEngine";
import { smoothstep } from "../engines/CameraTransitionEngine";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

export const LivingEarth: React.FC<{ st: DirectorState }> = ({ st }) => {
  const day = useTex("textures/earth_day.jpg");
  const data = useTex("textures/earth_data.png");
  const clouds = useTex("textures/earth_clouds.jpg");
  const paper = useTex("textures/paper.jpg");

  const mats = useMemo(() => {
    const flat = { uFlat: { value: 1 }, uCenter: { value: new Vector3() } };
    const earth = shader({
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
      uniforms: {
        ...flat,
        uDay: { value: day },
        uData: { value: data },
        uPaper: { value: paper },
        uSun: { value: SPACE_SUN.clone() },
        uPaint: { value: 1 },
        uReveal: { value: 0 },
        uLandReveal: { value: 0 },
        uWet: { value: 0 },
        uDetail: { value: 0 },
      },
    });
    const cloud = shader({
      vertexShader: shellVertex,
      fragmentShader: cloudsFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uFlat: earth.uniforms.uFlat,
        uCenter: earth.uniforms.uCenter,
        uClouds: { value: clouds },
        uSun: { value: SPACE_SUN.clone() },
        uOpacity: { value: 0 },
        uDetail: { value: 0 },
      },
    });
    const atmo = shader({
      vertexShader: shellVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: BackSide,
      uniforms: {
        uFlat: earth.uniforms.uFlat,
        uCenter: earth.uniforms.uCenter,
        uSun: { value: SPACE_SUN.clone() },
        uOpacity: { value: 0 },
      },
    });
    return { earth, cloud, atmo };
  }, [day, data, clouds, paper]);

  const p = st.paint;
  const u = mats.earth.uniforms;
  u.uFlat.value = p.flat;
  u.uCenter.value.set(0, 0, st.earth.lift);
  u.uPaint.value = p.paint;
  u.uReveal.value = p.reveal;
  u.uLandReveal.value = p.landReveal;
  u.uWet.value = p.wet;
  // Детали поверхности включаются только при подлёте.
  const detail = smoothstep(3.55, 4.4, st.s);
  u.uDetail.value = detail;
  const live = 1 - p.paint;
  mats.cloud.uniforms.uOpacity.value = smoothstep(0.35, 1, live) * 0.92;
  mats.cloud.uniforms.uDetail.value = detail;
  mats.atmo.uniforms.uOpacity.value = smoothstep(0.3, 1, live);

  const q = earthQuaternion(st.earth.spin);
  // Облака дрейфуют чуть быстрее поверхности — живая атмосфера.
  const cq = q.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), st.t * 0.012));
  return (
    <group position={[0, 0, st.earth.lift]}>
      <mesh material={mats.earth} quaternion={q}>
        <sphereGeometry args={[1, 256, 160]} />
      </mesh>
      {live > 0.01 ? (
        <>
          <mesh material={mats.cloud} quaternion={cq} renderOrder={2}>
            <sphereGeometry args={[1.012, 160, 100]} />
          </mesh>
          <mesh material={mats.atmo} renderOrder={3}>
            <sphereGeometry args={[1.06, 96, 64]} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};
