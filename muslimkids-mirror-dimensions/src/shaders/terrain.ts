// Ландшафт: вершинные цвета, мягкий свет солнца + небесная подсветка,
// воздушная перспектива (туман в «мировых» единицах — работает и в
// уменьшенной гостевой копии долины, отражаемой в зеркале).
export const terrainVertex = /* glsl */ `
attribute vec3 color;
varying vec3 vColor;
varying vec3 vN;
varying float vDist;
varying float vH;
varying vec3 vLocal;
uniform float uWorldScale;
#include <clipping_planes_pars_vertex>
void main() {
  vColor = color;
  vN = normalize(mat3(modelMatrix) * normal);
  vH = position.y;
  vLocal = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  #include <clipping_planes_vertex>
  vDist = length(mvPosition.xyz) / uWorldScale;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const terrainFragment = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uExposure;
varying vec3 vColor;
varying vec3 vN;
varying float vDist;
varying float vH;
varying vec3 vLocal;
#include <clipping_planes_pars_fragment>
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y);
}
void main() {
  #include <clipping_planes_fragment>
  vec3 N = normalize(vN);
  float ndl = max(dot(N, normalize(uSunDir)), 0.0);
  float wrap = max((dot(N, normalize(uSunDir)) + 0.35) / 1.35, 0.0);
  vec3 hemi = mix(uGroundColor, uSkyColor, N.y * 0.5 + 0.5);
  float ao = 0.72 + 0.28 * smoothstep(-4.0, 30.0, vH);
  // детали камня и чёткий снег на вершинах (по высоте и уклону)
  float n1 = vnoise(vLocal.xz * 0.045);
  float n2 = vnoise(vLocal.xz * 0.31 + vec2(vLocal.y * 0.2));
  vec3 base = vColor * (0.86 + 0.26 * n2);
  float snowLine = 84.0 + 26.0 * n1 - 9.0 * n2;
  float snow = smoothstep(snowLine, snowLine + 5.0, vH) * smoothstep(0.42, 0.66, N.y + 0.12 * n2);
  base = mix(base, vec3(0.92, 0.95, 0.99), snow);
  vec3 col = base * (uSunColor * (ndl * 0.85 + wrap * 0.3) + hemi * 0.5) * ao;
  float fog = 1.0 - exp(-pow(vDist * uFogDensity, 1.35));
  col = mix(col, uFogColor, clamp(fog, 0.0, 0.92));
  gl_FragColor = vec4(col * uExposure, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
