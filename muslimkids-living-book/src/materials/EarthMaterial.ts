import * as THREE from "three";

/**
 * Материал бумажной Земли с честной сменой дня и ночи: освещённость
 * считается от положения Солнца (полушарие, обращённое к нему, — день).
 * dayNight = 0 — обычный свет комнаты (пока Солнце не поднялось),
 * 1 — освещение только «от Солнца» с мягким терминатором.
 */
export const createEarthMaterial = (map: THREE.Texture, inner: string) =>
  new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      map: { value: map },
      sunPos: { value: new THREE.Vector3(5, 0, 0) },
      keyDir: { value: new THREE.Vector3(-0.5, 0.8, 0.5).normalize() },
      dayNight: { value: 0 },
      inner: { value: new THREE.Color(inner) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vP = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform vec3 sunPos;
      uniform vec3 keyDir;
      uniform float dayNight;
      uniform vec3 inner;
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
        float room = 0.5 + 0.75 * max(dot(n, keyDir), 0.0);
        vec3 tex = gl_FrontFacing ? texture2D(map, vUv).rgb : inner;
        vec3 L = normalize(sunPos - vP);
        float d = dot(n, L);
        float day = smoothstep(-0.06, 0.16, d);
        vec3 nightCol = tex * 0.12 + vec3(0.01, 0.025, 0.07);
        vec3 dayCol = tex * (0.62 + 0.62 * max(d, 0.0));
        vec3 col = mix(tex * room, mix(nightCol, dayCol, day), dayNight);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
