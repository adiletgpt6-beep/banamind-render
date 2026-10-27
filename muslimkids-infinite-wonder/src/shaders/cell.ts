// Материалы научной модели: полупрозрачные клеточные стенки с френелем
// и хлоропласты с гранами (стопками тилакоидов).
import { LOGDEPTH_FRAG_PARS, LOGDEPTH_VERT_PARS, NOISE, OUTPUT_FRAG, SRGB } from "./common";

export const glassVertex = /* glsl */ `
${LOGDEPTH_VERT_PARS}
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
void main(){
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    n = mat3(instanceMatrix) * n;
  #endif
  vL = position;
  vec4 w = modelMatrix * p;
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;

export const glassFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
uniform vec3 uColor;
uniform vec3 uRim;
uniform float uOpacity;
uniform float uRimPower;
uniform vec3 uKey;
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  if (!gl_FrontFacing) N = -N;
  float fv = 1.0 - abs(dot(N, V));
  float rim = pow(fv, uRimPower);
  float lam = 0.55 + 0.45 * max(dot(N, normalize(uKey)), 0.0);
  float spec = pow(max(dot(reflect(-normalize(uKey), N), V), 0.0), 40.0);
  vec3 col = uColor * lam + uRim * rim * 1.2 + vec3(1.0) * spec * 0.35;
  float a = uOpacity * (0.35 + 0.65 * rim) + spec * 0.3 * uOpacity;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  ${OUTPUT_FRAG}
}`;

export const chloroFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
${NOISE}
uniform vec3 uKey;
uniform float uOpacity;
uniform float uGrana;
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float lam = 0.45 + 0.65 * max(dot(N, normalize(uKey)), 0.0);
  vec3 base = mix(HEX(46.0, 143.0, 87.0), HEX(110.0, 196.0, 108.0), 0.5 + 0.5 * vL.y);
  // Граны: тёмные «стопки монет» по длине хлоропласта.
  vec2 q = vec2(vL.x * 4.0, vL.z * 2.2);
  vec2 c = fract(q) - 0.5;
  float stacks = (1.0 - smoothstep(0.18, 0.3, length(c * vec2(1.0, 1.6)))) * step(abs(vL.y), 0.85);
  float lines = 0.5 + 0.5 * sin(vL.y * 40.0);
  base = mix(base, HEX(24.0, 92.0, 56.0), stacks * (0.55 + 0.25 * lines) * uGrana);
  float rim = pow(1.0 - abs(dot(N, V)), 2.0);
  vec3 col = base * lam + HEX(160.0, 230.0, 140.0) * rim * 0.35;
  gl_FragColor = vec4(col, uOpacity);
  ${OUTPUT_FRAG}
}`;
