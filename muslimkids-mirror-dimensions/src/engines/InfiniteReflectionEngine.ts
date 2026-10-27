// InfiniteReflectionEngine: взаимные отражения двух зеркал — с ограниченной
// глубиной (по умолчанию 5 уровней), детерминированно в пределах одного кадра.
//
// Цепочка камер: c1 = отражение основной камеры в зеркале A, c2 = отражение c1
// в зеркале B, c3 = отражение c2 в A … Рендер идёт от самого глубокого уровня
// к ближнему: на уровне k видимое «следующее» зеркало показывает текстуру
// уровня k+1. На самом глубоком уровне зеркало гаснет до тёмного стекла —
// это и есть мягкое затухание «тоннеля». Никакой обратной связи между кадрами.
import * as THREE from "three";
import { PlanarReflection } from "./MirrorReflectionEngine";
import { allSurfaces } from "./mirrorRegistry";

export type MirrorHandle = { mesh: THREE.Mesh; material: THREE.ShaderMaterial };

export class InfiniteReflectionChain {
  readonly levels: PlanarReflection[];

  constructor(depth: number, width: number, height: number) {
    this.levels = Array.from({ length: depth }, () => new PlanarReflection(width, height));
  }

  dispose() {
    for (const l of this.levels) l.dispose();
  }

  /**
   * Строит цепочку, начиная с зеркала `first`, видимого основной камерой.
   * Возвращает текстуру и textureMatrix первого уровня — их зеркало `first`
   * показывает в основном проходе (через свой канал B).
   */
  render(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    first: MirrorHandle,
    second: MirrorHandle,
    layers: number[],
    dimPerLevel = 0.9,
  ): { texture: THREE.Texture; matrix: THREE.Matrix4 } | null {
    const n = this.levels.length;
    const mirrors = (k: number) => (k % 2 === 0 ? first : second); // зеркало-окно уровня k (0-based)
    // 1) камеры всех уровней (без рендера)
    let view: THREE.Camera = camera;
    let valid = 0;
    for (let k = 0; k < n; k++) {
      if (!this.levels[k].setupCamera(mirrors(k).mesh, view)) break;
      view = this.levels[k].camera;
      valid++;
    }
    if (valid === 0) return null;

    // 2) рендер от глубокого уровня к ближнему
    const stash = [first, second].map((m) => ({
      m,
      a: m.material.uniforms.tReflA.value,
      ma: m.material.uniforms.uTexMatA.value.clone(),
      blend: m.material.uniforms.uBlend.value,
      dim: m.material.uniforms.uLevelDim.value,
    }));
    const others = allSurfaces(scene).filter((s) => s !== first.mesh && s !== second.mesh);
    for (let k = valid - 1; k >= 0; k--) {
      const window = mirrors(k);
      const inner = mirrors(k + 1);
      const u = inner.material.uniforms;
      const deeper = k + 1 < valid ? this.levels[k + 1] : null;
      if (deeper) {
        u.tReflA.value = deeper.rt.texture;
        u.uTexMatA.value.copy(deeper.textureMatrix);
        u.uLevelDim.value = dimPerLevel;
      } else {
        u.uLevelDim.value = 0.0; // глубже — тёмное стекло
      }
      u.uBlend.value = 0;
      this.levels[k].render(renderer, scene, window.mesh, k === 0 ? camera : this.levels[k - 1].camera, {
        layers,
        hide: [window.mesh, ...others],
      });
    }
    // 3) вернуть исходные значения
    for (const s of stash) {
      const u = s.m.material.uniforms;
      u.tReflA.value = s.a;
      u.uTexMatA.value.copy(s.ma);
      u.uBlend.value = s.blend;
      u.uLevelDim.value = s.dim;
    }
    return { texture: this.levels[0].rt.texture, matrix: this.levels[0].textureMatrix };
  }
}
