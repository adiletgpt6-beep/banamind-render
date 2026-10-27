// Горное озеро: большая отражающая поверхность (тот же движок, waterMix = 1).
import { DEFAULT_MORPH, MorphState } from "../engines/ReflectionMorphEngine";
import { MirrorSurface } from "./MirrorSurface";

export const LAKE_SIZE: [number, number] = [900, 900];

export const ReflectiveLake: React.FC<{
  time: number;
  morph?: Partial<MorphState>;
  layers?: number[];
  resolution?: number;
  y?: number;
}> = ({ time, morph, layers = [0], resolution = 1280, y = 0 }) => (
  <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <MirrorSurface
      size={LAKE_SIZE}
      segments={[48, 48]}
      time={time}
      reflectA={{ layers, resolution }}
      morph={{ ...DEFAULT_MORPH, waterMix: 1, ripple: 0.55, swell: 0.0, reflectivity: 1, ...morph }}
    />
  </group>
);
