// Земля: дневная текстура, ночные огни на теневой стороне, блик океанов,
// мягкий терминатор и атмосферный ободок. Освещение — от направления на Солнце,
// день и ночь получаются только из вращения планеты вокруг своей оси.
export const earthVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;
varying vec3 vT;
#include <clipping_planes_pars_vertex>
void main() {
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), normal) + vec3(1e-4));
  vT = normalize(mat3(modelMatrix) * t);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPos = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  #include <clipping_planes_vertex>
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const earthFragment = /* glsl */ `
uniform sampler2D tDay;
uniform sampler2D tNight;
uniform sampler2D tSpec;
uniform sampler2D tNormal;
uniform vec3 uSun;
uniform float uNightLights;
uniform float uExposure;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;
varying vec3 vT;
#include <clipping_planes_pars_fragment>
float sq(float x) { return x * x; }
void main() {
  #include <clipping_planes_fragment>
  vec3 N0 = normalize(vN);
  vec3 T = normalize(vT - N0 * dot(vT, N0));
  vec3 B = cross(N0, T);
  vec3 nm = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
  vec3 N = normalize(N0 + (T * nm.x + B * nm.y) * 0.35);
  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vPos);
  float ndl = dot(N, L);
  float ndl0 = dot(N0, L);
  float day = smoothstep(-0.08, 0.22, ndl0);
  vec3 albedo = texture2D(tDay, vUv).rgb;
  vec3 dayCol = albedo * (0.04 + 1.25 * max(ndl, 0.0));
  float ocean = texture2D(tSpec, vUv).r;
  vec3 H = normalize(L + V);
  dayCol += vec3(1.0, 0.95, 0.85) * pow(max(dot(N0, H), 0.0), 160.0) * ocean * 0.05;
  vec3 lights = texture2D(tNight, vUv).rgb * vec3(1.0, 0.78, 0.48) * 1.5 * uNightLights;
  vec3 nightCol = albedo * 0.018 + lights;
  vec3 col = mix(nightCol, dayCol, day);
  // тёплая полоска сумерек на терминаторе
  col += vec3(0.95, 0.55, 0.35) * 0.025 * exp(-sq((ndl0 + 0.02) / 0.045));
  float fres = pow(1.0 - max(dot(N0, V), 0.0), 2.6);
  col += vec3(0.32, 0.62, 1.0) * fres * (0.08 + 0.75 * smoothstep(-0.25, 0.45, ndl0));
  gl_FragColor = vec4(col * uExposure, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const cloudsFragment = /* glsl */ `
uniform sampler2D tClouds;
uniform vec3 uSun;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;
varying vec3 vT;
#include <clipping_planes_pars_fragment>
float sq(float x) { return x * x; }
void main() {
  #include <clipping_planes_fragment>
  vec3 c = texture2D(tClouds, vUv).rgb;
  float a = smoothstep(0.05, 0.9, c.r);
  float ndl = dot(normalize(vN), normalize(uSun));
  float lit = smoothstep(-0.15, 0.35, ndl);
  vec3 col = vec3(1.0) * (0.03 + 1.05 * lit);
  gl_FragColor = vec4(col, a * uOpacity * (0.25 + 0.75 * lit));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const atmosphereFragment = /* glsl */ `
uniform vec3 uSun;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;
varying vec3 vT;
#include <clipping_planes_pars_fragment>
float sq(float x) { return x * x; }
void main() {
  #include <clipping_planes_fragment>
  vec3 V = normalize(cameraPosition - vPos);
  vec3 N = normalize(vN);
  // оболочка 1.06R: |N·V| = 0 на внешнем краю, ≈0.33 у края планеты
  float k = clamp(abs(dot(N, V)) / 0.33, 0.0, 1.0);
  float glow = pow(k, 3.0);
  float lit = smoothstep(-0.35, 0.5, dot(N, normalize(uSun)));
  vec3 col = vec3(0.32, 0.62, 1.0) * glow * (0.1 + 0.9 * lit) * 0.75;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
