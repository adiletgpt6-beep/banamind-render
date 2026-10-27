// Облачная завеса между орбитой и долиной (экранный слой).
// Клочья летят навстречу камере синхронно с осью s: при возвращении
// они так же плавно улетают вдаль.
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color } from "three";
import { shader } from "../materials";
import { veilFragment, veilVertex } from "../shaders/nature";
import { mulberry32 } from "../utils/random";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

const PUFFS = 26;

export const CloudVeil: React.FC<{ st: DirectorState; aspect: number }> = ({ st, aspect }) => {
  const { geo, mat } = useMemo(() => {
    const rnd = mulberry32(5);
    const corner: number[] = [];
    const seed: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= PUFFS; i++) {
      // Последний квад — сплошная дымка на весь кадр в пике завесы.
      const s = i === PUFFS ? [0, 0, 0, -1] : [rnd(), rnd(), i / PUFFS, rnd()];
      for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        corner.push(cx, cy);
        seed.push(...s);
      }
      const b = i * 4;
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(corner.length / 2 * 3), 3));
    g.setAttribute("aCorner", new BufferAttribute(new Float32Array(corner), 2));
    g.setAttribute("aSeed", new BufferAttribute(new Float32Array(seed), 4));
    g.setIndex(idx);
    const m = shader({
      vertexShader: veilVertex,
      fragmentShader: veilFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPhase: { value: 0 },
        uAspect: { value: 1 },
        uVeil: { value: 0 },
        uTint: { value: new Color("#BFE3F5") },
      },
    });
    return { geo: g, mat: m };
  }, []);
  if (st.veil <= 0.001) return null;
  mat.uniforms.uPhase.value = st.s * 1.6;
  mat.uniforms.uAspect.value = aspect;
  mat.uniforms.uVeil.value = st.veil;
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={50} />;
};
