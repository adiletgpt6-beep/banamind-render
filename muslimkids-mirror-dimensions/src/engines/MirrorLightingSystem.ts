// MirrorLightingSystem: палитра MIRRORVERSE, студийное окружение для
// металлических рам (PMREM из сцены с мягкими «софтбоксами») и световые схемы
// key / fill / rim. Без неона и вспышек: мягкие градиенты и контролируемые блики.
import * as THREE from "three";

export const PALETTE = {
  navy: "#071322",
  sapphire: "#174A85",
  silver: "#C8DCE8",
  turquoise: "#57C8D8",
  gold: "#E7BC71",
  milk: "#F7F7F2",
  green: "#439C78",
  violet: "#25335C",
  deepWater: "#0B2A3F",
} as const;

/**
 * Окружение для отражений в металле: тёмно-синяя комната с несколькими
 * прямоугольными источниками (холодный сверху, тёплый сбоку, бирюзовый контур).
 */
export const createStudioEnvironment = (renderer: THREE.WebGLRenderer, warmth = 1) => {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { a: { value: new THREE.Color(PALETTE.navy) }, b: { value: new THREE.Color(PALETTE.violet) } },
      vertexShader: "varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ",
      fragmentShader:
        "uniform vec3 a; uniform vec3 b; varying vec3 p; void main(){ float h = normalize(p).y*0.5+0.5; gl_FragColor = vec4(mix(a*0.6, b*1.2, h), 1.0);} ",
    }),
  );
  scene.add(room);
  const panel = (w: number, h: number, color: THREE.ColorRepresentation, k: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(8, 2, PALETTE.silver, 2.4, [0, 8, 2]); // верхний софтбокс
  panel(2.5, 6, PALETTE.gold, 1.6 * warmth, [-8, 1, 3]); // тёплый ключ
  panel(1.2, 6, PALETTE.turquoise, 1.3, [7, 0.5, -5]); // контровой
  panel(5, 1.2, PALETTE.milk, 0.8, [3, -2, 8]); // заполняющий
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  return env;
};

export type LightRig = {
  key: { color: string; intensity: number; pos: [number, number, number] };
  fill: { color: string; intensity: number; pos: [number, number, number] };
  rim: { color: string; intensity: number; pos: [number, number, number] };
  ambient: { color: string; intensity: number };
};

export const RIGS: Record<string, LightRig> = {
  space: {
    key: { color: "#FFF1DC", intensity: 2.6, pos: [6, 4, 7] },
    fill: { color: PALETTE.silver, intensity: 0.5, pos: [-6, 1, 5] },
    rim: { color: PALETTE.turquoise, intensity: 1.4, pos: [-3, 3, -6] },
    ambient: { color: PALETTE.violet, intensity: 0.6 },
  },
  valleyDay: {
    key: { color: "#FFF4E2", intensity: 3.0, pos: [-60, 80, -120] },
    fill: { color: "#BFD8F0", intensity: 0.9, pos: [60, 40, 80] },
    rim: { color: PALETTE.gold, intensity: 0.4, pos: [0, 20, 150] },
    ambient: { color: "#9FC0DD", intensity: 0.7 },
  },
  night: {
    key: { color: "#BFD3F2", intensity: 0.9, pos: [-40, 60, -100] },
    fill: { color: PALETTE.violet, intensity: 0.6, pos: [40, 20, 60] },
    rim: { color: PALETTE.turquoise, intensity: 0.5, pos: [0, 10, 100] },
    ambient: { color: "#2B3D66", intensity: 0.55 },
  },
};
