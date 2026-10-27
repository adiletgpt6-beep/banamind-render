// Небо долины, река, космический фон, облачная завеса и фон увеличенной модели.
import { LOGDEPTH_FRAG_PARS, LOGDEPTH_VERT_PARS, NOISE, OUTPUT_FRAG, SRGB } from "./common";

export const dirVertex = /* glsl */ `
${LOGDEPTH_VERT_PARS}
varying vec3 vDir;
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vDir = normalize(w.xyz - cameraPosition);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;

export const skyFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
${NOISE}
uniform vec3 uSun;
varying vec3 vDir;
varying vec3 vW;
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 zenith = HEX(78.0, 154.0, 214.0);
  vec3 mid = HEX(122.0, 197.0, 234.0);
  vec3 horizon = HEX(214.0, 236.0, 244.0);
  vec3 col = mix(horizon, mid, smoothstep(0.0, 0.25, h));
  col = mix(col, zenith, smoothstep(0.25, 0.9, h));
  float sd = max(dot(d, normalize(uSun)), 0.0);
  col += HEX(255.0, 236.0, 196.0) * (pow(sd, 8.0) * 0.35 + pow(sd, 300.0) * 2.0);
  col = mix(col, HEX(206.0, 226.0, 236.0), smoothstep(0.02, -0.1, h));
  // Лёгкие перистые облака.
  vec2 cp = d.xz / max(h + 0.12, 0.05) * 1.6;
  float c = smoothstep(0.55, 0.85, fbm(cp + vec2(3.0, 1.0))) * smoothstep(0.03, 0.2, h);
  col = mix(col, vec3(1.0), c * 0.55);
  gl_FragColor = vec4(col, 1.0);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

export const waterVertex = /* glsl */ `
${LOGDEPTH_VERT_PARS}
varying vec2 vUv;
varying vec3 vW;
void main(){
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
  #include <fog_vertex>
}`;

export const waterFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
${NOISE}
uniform vec3 uSun;
uniform float uTime;
varying vec2 vUv;
varying vec3 vW;
void main(){
  vec3 V = normalize(cameraPosition - vW);
  vec2 flow = vec2(vUv.x * 3.0 - uTime * 0.35, vUv.y * 2.0);
  float n = fbm(flow * 2.0) * 0.6 + fbm(flow * 7.0 + 3.0) * 0.4;
  vec3 N = normalize(vec3((n - 0.5) * 0.35, 1.0, (fbm(flow * 3.0 + 9.0) - 0.5) * 0.35));
  float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
  vec3 deep = HEX(30.0, 110.0, 150.0);
  vec3 shallow = HEX(82.0, 208.0, 204.0);
  float edge = 1.0 - abs(vUv.y * 2.0 - 1.0);
  vec3 col = mix(shallow, deep, smoothstep(0.2, 0.9, edge));
  col = mix(col, HEX(200.0, 230.0, 244.0), fres * 0.7);
  float glint = pow(max(dot(reflect(-normalize(uSun), N), V), 0.0), 220.0);
  col += vec3(1.0, 0.95, 0.85) * glint * 2.2;
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_FRAG}
}`;

export const spaceFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
${NOISE}
uniform vec3 uSun;
varying vec3 vDir;
varying vec3 vW;
void main(){
  vec3 d = normalize(vDir);
  vec3 col = HEX(8.0, 21.0, 38.0);
  col += HEX(27.0, 80.0, 139.0) * 0.35 * pow(max(dot(d, normalize(uSun)), 0.0), 3.0);
  col += HEX(27.0, 80.0, 139.0) * 0.12 * smoothstep(0.45, 0.8, fbm3(d * 3.0));
  // Звёзды: точка в каждой «счастливой» ячейке сферической решётки.
  vec3 g = d * 160.0;
  vec3 cell = floor(g);
  vec3 o = hash33(cell);
  float lucky = step(0.93, hash13(cell + 7.7));
  float dist = length(fract(g) - o);
  float star = lucky * (1.0 - smoothstep(0.0, 0.07 + 0.08 * o.z, dist));
  col += HEX(247.0, 243.0, 233.0) * star * (0.6 + 0.8 * o.y);
  gl_FragColor = vec4(col, 1.0);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

/** Фон увеличенной модели: сапфировая глубина с мягкими пятнами-боке. */
export const backdropFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
${NOISE}
uniform float uOpacity;
varying vec3 vDir;
varying vec3 vW;
void main(){
  vec3 d = normalize(vDir);
  float g = 0.5 + 0.5 * d.y;
  vec3 col = mix(HEX(8.0, 21.0, 38.0), HEX(20.0, 62.0, 104.0), smoothstep(0.0, 1.0, g));
  col += HEX(82.0, 208.0, 204.0) * 0.08 * smoothstep(0.5, 0.85, fbm3(d * 2.5));
  vec3 cellv = floor(d * 9.0);
  vec3 o = hash33(cellv);
  float bok = step(0.75, hash13(cellv + 2.0)) * (1.0 - smoothstep(0.18, 0.3, length(fract(d * 9.0) - o)));
  col += mix(HEX(58.0, 166.0, 124.0), HEX(239.0, 196.0, 117.0), o.x) * bok * 0.07;
  gl_FragColor = vec4(col, uOpacity);
  #include <logdepthbuf_fragment>
  #include <colorspace_fragment>
}`;

/**
 * Облачная завеса — экранный слой (не зависит от масштаба мира).
 * Клочья облаков летят навстречу камере; на пике завеса закрывает кадр,
 * и под ней Земля незаметно сменяется горной долиной.
 */
export const veilVertex = /* glsl */ `
attribute vec2 aCorner;
attribute vec4 aSeed;
uniform float uPhase;
uniform float uAspect;
varying vec2 vC;
varying float vA;
varying vec4 vSeed;
void main(){
  vC = aCorner;
  vSeed = aSeed;
  if (aSeed.w < 0.0) {
    vA = 1.0;
    gl_Position = vec4(aCorner, 0.0, 1.0);
    return;
  }
  float z = fract(aSeed.z + uPhase);           // 0 — далеко, 1 — у камеры
  float persp = 1.0 / mix(4.0, 0.22, z);
  vec2 c = (aSeed.xy * 2.0 - 1.0) * vec2(1.0, 1.0);
  vec2 center = c * 0.55 * persp;
  float size = (0.55 + 0.4 * aSeed.w) * persp;
  vec2 p = center + aCorner * size * vec2(1.0, uAspect);
  vA = smoothstep(0.0, 0.25, z) * (1.0 - smoothstep(0.82, 1.0, z));
  gl_Position = vec4(p, 0.0, 1.0);
}`;

export const veilFragment = /* glsl */ `
${SRGB}
${NOISE}
uniform float uVeil;
uniform vec3 uTint;
varying vec2 vC;
varying float vA;
varying vec4 vSeed;
void main(){
  if (vSeed.w < 0.0) {
    float n = fbm(vC * 2.0 + 3.0);
    gl_FragColor = vec4(mix(vec3(0.93, 0.95, 0.98), uTint, 0.15) * (0.92 + 0.1 * n), smoothstep(0.55, 1.0, uVeil) * 0.96);
    #include <colorspace_fragment>
    return;
  }
  float r = length(vC);
  float n = fbm(vC * 1.6 + vSeed.xy * 17.0);
  float puff = smoothstep(1.0, 0.25, r + (n - 0.5) * 0.9);
  float shade = 0.82 + 0.25 * fbm(vC * 3.0 + vSeed.yx * 9.0) + 0.1 * vC.y;
  vec3 col = mix(vec3(0.86, 0.9, 0.96), vec3(1.0, 0.99, 0.97), clamp(shade, 0.0, 1.0));
  gl_FragColor = vec4(col, puff * vA * uVeil * 0.9);
  #include <colorspace_fragment>
}`;
