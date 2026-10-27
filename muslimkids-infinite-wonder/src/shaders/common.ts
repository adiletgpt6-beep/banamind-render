// Общие GLSL-фрагменты: шум, бумага, акварельная лессировка, служебные
// включения three.js (логарифмическая глубина, туман, вывод цвета).
// Вычисления — в линейном пространстве; на выходе colorspace_fragment.

export const NOISE = /* glsl */ `
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
vec3 hash33(vec3 p3){ p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yxx) * p3.zyx); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float vnoise3(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(hash13(i), hash13(i + vec3(1,0,0)), u.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), u.x), u.y);
  float b = mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), u.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), u.x), u.y);
  return mix(a, b, u.z);
}
float fbm(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s / 0.96875; }
float fbm3(vec3 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 4; i++){ s += a * vnoise3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s / 0.9375; }
`;

/** sRGB-константа → линейный цвет. */
export const SRGB = /* glsl */ `vec3 S(vec3 c){ return pow(c, vec3(2.2)); }
vec3 HEX(float r, float g, float b){ return pow(vec3(r, g, b) / 255.0, vec3(2.2)); }`;

/** Бумага и прозрачная акварельная лессировка (субтрактивное смешение). */
export const WATERCOLOR = /* glsl */ `
uniform sampler2D uPaper;
float paperGrain(vec2 w){ return texture(uPaper, w * 0.9).r; }
vec3 paperColor(vec2 w){
  float g = paperGrain(w);
  return HEX(247.0, 243.0, 233.0) * (0.9 + 0.2 * g);
}
// Пигмент поглощает свет (закон Бугера–Ламберта): каждый слой умножает
// то, что под ним, на пропускание пигмента в степени плотности слоя.
vec3 glaze(vec3 base, vec3 pigment, float density){
  return base * pow(clamp(pigment / HEX(247.0, 243.0, 233.0), vec3(1e-3), vec3(1.0)), vec3(clamp(density, 0.0, 1.0)));
}
// Тёмная кайма у края мазка: пигмент собирается на высыхающей границе.
float edgeDark(float m){ return m * (1.0 + 2.2 * m * (1.0 - m)); }
// Грануляция: пигмент оседает во впадинах бумаги.
float granulate(float density, vec2 w){ return density * (0.78 + 0.42 * (1.0 - paperGrain(w * 1.7))); }
`;

export const LOGDEPTH_VERT_PARS = /* glsl */ `#include <common>
#include <logdepthbuf_pars_vertex>
#include <fog_pars_vertex>`;
export const LOGDEPTH_FRAG_PARS = /* glsl */ `#include <common>
#include <logdepthbuf_pars_fragment>
#include <fog_pars_fragment>`;
export const OUTPUT_FRAG = /* glsl */ `#include <logdepthbuf_fragment>
#include <fog_fragment>
#include <colorspace_fragment>`;
