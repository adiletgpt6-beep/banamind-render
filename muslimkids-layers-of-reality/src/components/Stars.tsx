// Static starfield (fixed seed) — depth backdrop, not a particle effect.
import React from "react";
import * as THREE from "three";
import { seeded } from "../utils/math";

let geo: THREE.BufferGeometry[] | null = null;
const build = () => {
  const rnd = seeded(5);
  return [1400, 160].map((n) => {
    const p: number[] = [], c: number[] = [];
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 38 + rnd() * 8;
      const s = Math.sqrt(1 - u * u);
      p.push(Math.cos(a) * s * r, u * r, Math.sin(a) * s * r - 6);
      const warm = rnd();
      const col = new THREE.Color().setHSL(warm > 0.7 ? 0.11 : 0.56, 0.5, 0.75 + rnd() * 0.25);
      c.push(col.r, col.g, col.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    return g;
  });
};
export const Stars: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const g = (geo ??= build());
  return (
    <group>
      <points geometry={g[0]}>
        <pointsMaterial size={2.2} sizeAttenuation={false} vertexColors transparent opacity={0.55 * opacity} depthWrite={false} />
      </points>
      <points geometry={g[1]}>
        <pointsMaterial size={4} sizeAttenuation={false} vertexColors transparent opacity={0.8 * opacity} depthWrite={false} />
      </points>
    </group>
  );
};
