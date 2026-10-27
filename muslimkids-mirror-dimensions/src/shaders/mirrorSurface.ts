// GLSL поверхности зеркала/воды. Одна поверхность умеет: отражать (две
// проективные текстуры A/B с маской смешивания), изгибаться, покрываться
// волнами и художественно переходить в материал воды (Fresnel, глубина,
// мелкая рябь по normal map). Используется ReflectionMorphEngine.

export const mirrorSurfaceVertex = /* glsl */ `
uniform mat4 uTexMatA;
uniform mat4 uTexMatB;
uniform vec2 uSize;        // ширина/высота поверхности в локальных единицах
uniform float uBend;       // изгиб (цилиндрический), доля ширины
uniform float uWave;       // амплитуда кольцевой волны
uniform float uWaveRadius; // фронт волны, в долях размера
uniform vec2 uWaveCenter;  // центр волны в UV
uniform float uSwell;      // спокойная «зыбь»
uniform float uTime;

varying vec2 vUv;
varying vec4 vProjA;
varying vec4 vProjB;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vLocalNormal;

float heightAt(vec2 uv) {
  vec2 p = (uv - 0.5) * uSize;
  float x = (uv.x - 0.5) * 2.0;
  float h = uBend * uSize.x * 0.5 * (x * x - 0.33);
  vec2 d = (uv - uWaveCenter) * uSize / max(uSize.x, uSize.y);
  float r = length(d);
  float front = smoothstep(uWaveRadius + 0.02, uWaveRadius - 0.25, r);
  h += uWave * front * sin(r * 34.0 - uTime * 5.0) * exp(-r * 2.2) * uSize.x * 0.02;
  h += uSwell * uSize.x * 0.004 * (sin(p.x * 3.1 / uSize.x * 6.28 + uTime * 1.1) + 0.7 * sin(p.y * 2.3 / uSize.y * 6.28 - uTime * 0.8));
  return h;
}

float sq(float x) { return x * x; }
void main() {
  vUv = uv;
  // проекция отражения считается по исходной плоскости: стабильная выборка,
  // а искажения задаются смещением по нормали во фрагментном шейдере
  vec4 flatWorld = modelMatrix * vec4(position, 1.0);
  vProjA = uTexMatA * flatWorld;
  vProjB = uTexMatB * flatWorld;

  float e = 0.004;
  float h = heightAt(uv);
  float hx = heightAt(uv + vec2(e, 0.0)) - heightAt(uv - vec2(e, 0.0));
  float hy = heightAt(uv + vec2(0.0, e)) - heightAt(uv - vec2(0.0, e));
  vec3 n = normalize(vec3(-hx / (2.0 * e * uSize.x), -hy / (2.0 * e * uSize.y), 1.0));
  vLocalNormal = n;
  vec3 pos = position + vec3(0.0, 0.0, h);
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const mirrorSurfaceFragment = /* glsl */ `
uniform sampler2D tReflA;
uniform sampler2D tReflB;
uniform sampler2D tWaterNormal;
uniform float uBlend;        // 0 → отражение A, 1 → отражение B
uniform vec2 uBlendCenter;
uniform float uDistort;      // сила оптического искажения отражения
uniform float uWaterMix;     // 0 зеркало → 1 вода
uniform float uRipple;       // мелкая рябь воды (normal map)
uniform float uReflectivity;
uniform vec3 uMirrorTint;
uniform vec3 uWaterDeep;
uniform vec3 uWaterShallow;
uniform float uSheen;        // мягкая световая полоса по стеклу
uniform float uSheenPos;
uniform vec2 uGlint;         // точечный блик (UV)
uniform float uGlintStrength;
uniform float uEdgeFade;     // мягкий край (для воды)
uniform float uOpacity;
uniform float uTime;
uniform float uLevelDim;     // затухание (для вложенных отражений)
uniform vec2 uSize;
uniform float uRippleScale;

varying vec2 vUv;
varying vec4 vProjA;
varying vec4 vProjB;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vLocalNormal;

float sq(float x) { return x * x; }
void main() {
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vWorldNormal);

  // рябь воды: две прокрутки normal map в разных масштабах
  vec2 wuv = vUv * uSize * uRippleScale / 6.0;
  vec3 n1 = texture2D(tWaterNormal, wuv * 0.9 + vec2(uTime * 0.012, uTime * 0.008)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(tWaterNormal, wuv * 2.3 - vec2(uTime * 0.009, -uTime * 0.014)).xyz * 2.0 - 1.0;
  vec2 ripple = (n1.xy + n2.xy * 0.6) * uRipple * uWaterMix;

  vec2 offs = vLocalNormal.xy * uDistort + ripple * 0.035;
  vec2 ua = vProjA.xy / vProjA.w + offs;
  vec2 ub = vProjB.xy / vProjB.w + offs;
  vec3 ra = texture2D(tReflA, ua).rgb;
  vec3 rb = texture2D(tReflB, ub).rgb;

  // смешивание отражений расходящимся мягким кругом
  float d = length((vUv - uBlendCenter) * uSize / max(uSize.x, uSize.y));
  float front = uBlend * 1.35;
  float m = smoothstep(front, front - 0.22, d);
  m = uBlend >= 0.999 ? 1.0 : (uBlend <= 0.001 ? 0.0 : m);
  float ring = exp(-sq((d - front + 0.11) / 0.05)) * step(0.001, uBlend) * step(uBlend, 0.999);
  vec3 refl = mix(ra, rb, m) + ring * 0.06 * vec3(0.75, 0.9, 1.0);

  // зеркало: серебряная амальгама, лёгкая холодная тонировка
  float fresM = pow(1.0 - max(dot(N, V), 0.0), 4.0);
  vec3 mirror = refl * uMirrorTint * uReflectivity * (0.94 + 0.06 * fresM);
  // мягкая световая полоса
  vec2 c = vUv - 0.5;
  float band = exp(-sq((dot(c, normalize(vec2(0.8, 0.6))) - uSheenPos) / 0.07));
  mirror += uSheen * band * vec3(0.78, 0.86, 0.92) * 0.25;
  // точечный блик: ядро + тонкие лучи
  vec2 g = (vUv - uGlint) * uSize / max(uSize.x, uSize.y);
  float core = exp(-dot(g, g) / 0.00005);
  float streak = exp(-abs(g.y) / 0.0035) * exp(-abs(g.x) / 0.12) + exp(-abs(g.x) / 0.0035) * exp(-abs(g.y) / 0.08) * 0.6;
  mirror += uGlintStrength * (core * 1.6 + streak * 0.25) * vec3(1.0, 0.95, 0.86);
  // фаска по краю зеркала: тонкая светлая кромка
  vec2 ed = min(vUv, 1.0 - vUv) * uSize;
  float edge = min(ed.x, ed.y);
  float bevel = smoothstep(0.0, 0.012, edge) * (1.0 - smoothstep(0.012, 0.03, edge));
  mirror += bevel * 0.12 * vec3(0.85, 0.92, 1.0) * (1.0 - uWaterMix);

  // вода: Френель, глубина, отражение дрожит вместе с рябью
  float fresW = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 deep = mix(uWaterDeep, uWaterShallow, 0.35 + 0.3 * (n1.y * 0.5 + 0.5));
  vec3 water = mix(deep, refl * 0.96, clamp(0.45 + fresW * 0.9, 0.0, 0.97));

  vec3 col = mix(mirror, water, uWaterMix) * uLevelDim;
  float a = uOpacity;
  if (uEdgeFade > 0.0) {
    vec2 ef = min(vUv, 1.0 - vUv);
    a *= smoothstep(0.0, uEdgeFade, min(ef.x, ef.y));
  }
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
