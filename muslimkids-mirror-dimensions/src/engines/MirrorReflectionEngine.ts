// MirrorReflectionEngine: настоящее планарное отражение.
//
// Для каждого зеркала строится «отражённая камера»: позиция и ориентация
// основной камеры зеркалятся относительно плоскости зеркала, сцена
// рендерится в WebGLRenderTarget, а поверхность зеркала читает текстуру
// проективно (textureMatrix). Поэтому отражение честно реагирует на любое
// движение камеры и поворот зеркала. Всё, что за плоскостью зеркала,
// отсекается плоскостью отсечения (renderer.clippingPlanes).
//
// Слои (THREE.Layers) позволяют зеркалу отражать «гостевой мир» — объекты,
// которые основная камера не видит напрямую (приём кинематографического
// композитинга: так Земля видна только в отражении, а зеркало-озеро заранее
// отражает горную долину).
import * as THREE from "three";

export const LAYER = {
  main: 0,
  valleyGuest: 2,
  earthGuest: 3,
  treeGuest: 4,
  skyGuest: 5,
} as const;

export type ReflectOptions = {
  layers: number[];
  clipBias?: number;
  /** объекты, скрываемые на время отражённого прохода (само зеркало и рама) */
  hide?: THREE.Object3D[];
  clearColor?: THREE.ColorRepresentation;
  clearAlpha?: number;
};

const _normal = new THREE.Vector3();
const _mirrorPos = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _rot = new THREE.Matrix4();
const _look = new THREE.Vector3(0, 0, -1);
const _target = new THREE.Vector3();
const _view = new THREE.Vector3();
const _clearColor = new THREE.Color();

export const BIAS = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);

export class PlanarReflection {
  readonly rt: THREE.WebGLRenderTarget;
  readonly camera = new THREE.PerspectiveCamera();
  readonly textureMatrix = new THREE.Matrix4();
  readonly clipPlane = new THREE.Plane();
  visible = false;

  constructor(width: number, height: number) {
    this.rt = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      samples: 0,
      depthBuffer: true,
    });
    this.rt.texture.generateMipmaps = false;
    this.rt.texture.minFilter = THREE.LinearFilter;
    this.rt.texture.magFilter = THREE.LinearFilter;
  }

  /**
   * Строит отражённую камеру для плоскости surface (локальная нормаль +Z).
   * Возвращает false, если основная камера находится позади зеркала.
   */
  setupCamera(surface: THREE.Object3D, view: THREE.Camera, clipBias = 0.002): boolean {
    surface.updateMatrixWorld();
    _mirrorPos.setFromMatrixPosition(surface.matrixWorld);
    _camPos.setFromMatrixPosition(view.matrixWorld);
    _rot.extractRotation(surface.matrixWorld);
    _normal.set(0, 0, 1).applyMatrix4(_rot).normalize();

    _view.subVectors(_mirrorPos, _camPos);
    if (_view.dot(_normal) > 0) return false;
    _view.reflect(_normal).negate().add(_mirrorPos);

    _rot.extractRotation(view.matrixWorld);
    _look.set(0, 0, -1).applyMatrix4(_rot).add(_camPos);
    _target.subVectors(_mirrorPos, _look).reflect(_normal).negate().add(_mirrorPos);

    const vc = this.camera;
    const src = view as THREE.PerspectiveCamera;
    vc.position.copy(_view);
    vc.up.set(0, 1, 0).applyMatrix4(_rot).reflect(_normal);
    vc.lookAt(_target);
    vc.near = src.near;
    vc.far = src.far;
    vc.updateMatrixWorld();
    vc.projectionMatrix.copy(src.projectionMatrix);

    this.textureMatrix.copy(BIAS).multiply(vc.projectionMatrix).multiply(vc.matrixWorldInverse);

    // плоскость зеркала: всё, что за ним, отсекается при отражённом проходе
    // (renderer.clippingPlanes — без искажения дальней плоскости, как у oblique-проекции)
    this.clipPlane.setFromNormalAndCoplanarPoint(_normal, _mirrorPos);
    this.clipPlane.constant += clipBias;
    return true;
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, surface: THREE.Object3D, view: THREE.Camera, o: ReflectOptions) {
    this.visible = this.setupCamera(surface, view, o.clipBias);
    const prevTarget = renderer.getRenderTarget();
    const prevAuto = renderer.autoClear;
    renderer.getClearColor(_clearColor);
    const prevAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(this.rt);
    renderer.setClearColor(o.clearColor ?? 0x000000, o.clearAlpha ?? 1);
    renderer.autoClear = true;
    if (this.visible) {
      this.camera.layers.disableAll();
      for (const l of o.layers) this.camera.layers.enable(l);
      const hidden = (o.hide ?? []).map((h) => [h, h.visible] as const);
      for (const [h] of hidden) h.visible = false;
      const prevClip = renderer.clippingPlanes;
      renderer.clippingPlanes = [this.clipPlane];
      renderer.render(scene, this.camera);
      renderer.clippingPlanes = prevClip;
      for (const [h, v] of hidden) h.visible = v;
    } else {
      renderer.clear();
    }
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(_clearColor, prevAlpha);
    renderer.autoClear = prevAuto;
  }

  dispose() {
    this.rt.dispose();
  }
}

/** Рекурсивно переносит объект и всех потомков (включая источники света) на слой. */
export const setLayer = (obj: THREE.Object3D, layer: number) => {
  obj.traverse((o) => o.layers.set(layer));
};
