// Небесный купол MIRRORVERSE: космос, день с облаками, вечер, ночь со звёздами
// и Луной — одним шейдером, чтобы звёзды и горизонт совпадали между мирами.
export const skyVertex = /* glsl */ `
#include <clipping_planes_pars_vertex>
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  #include <clipping_planes_vertex>
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const skyFragment = /* glsl */ `
uniform float uSpace;   // 1 — открытый космос (без горизонта)
uniform float uDay;
uniform float uDusk;
uniform float uNight;
uniform float uClouds;
uniform float uStars;
uniform float uMoon;
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform float uTime;
uniform vec3 cNavy;
uniform vec3 cSapphire;
uniform vec3 cViolet;
uniform vec3 cGold;
uniform vec3 cTurq;
varying vec3 vDir;
#include <clipping_planes_pars_fragment>

float h31(vec3 p) { p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
float vnoise3(vec3 p) {
  vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), u.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), u.x), u.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), u.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), u.x), u.y), u.z);
}

float stars(vec3 d, float scale) {
  vec3 p = d * scale;
  vec3 c = floor(p);
  float s = 0.0;
  for (int i = 0; i < 2; i++) {
    vec3 cc = c + float(i) * 0.5;
    float r = h31(cc);
    if (r > 0.86) {
      vec3 sp = cc + 0.5 + (vec3(h31(cc + 1.3), h31(cc + 2.7), h31(cc + 4.1)) - 0.5) * 0.7;
      float dist = length(p - sp);
      float b = (r - 0.86) / 0.14;
      s += smoothstep(0.075 + b * 0.05, 0.0, dist) * (0.35 + 1.4 * b * b);
    }
  }
  return s;
}

void main() {
  #include <clipping_planes_fragment>
  vec3 d = normalize(vDir);
  float y = d.y;
  // космос / ночь
  float neb = vnoise3(d * 3.0) * 0.6 + vnoise3(d * 7.0) * 0.4;
  vec3 space = mix(cNavy * 0.8, cViolet * 0.75, smoothstep(0.35, 0.85, neb) * 0.55);
  space += cSapphire * 0.35 * pow(max(dot(d, normalize(vec3(0.6, 0.35, -0.7))), 0.0), 3.0);
  vec3 night = mix(cSapphire * 0.3 + cViolet * 0.12, cNavy * 0.7, smoothstep(-0.08, 0.5, y));
  night += cViolet * 0.25 * smoothstep(0.4, 0.9, neb) * smoothstep(0.0, 0.5, y);
  // день
  vec3 zen = vec3(0.13, 0.37, 0.72);
  vec3 hor = vec3(0.70, 0.84, 0.94);
  vec3 day = mix(hor, zen, pow(smoothstep(-0.02, 0.75, y), 0.7));
  float sd = max(dot(d, normalize(uSunDir)), 0.0);
  day += vec3(1.0, 0.93, 0.8) * (pow(sd, 18.0) * 0.35 + pow(sd, 600.0) * 3.0);
  // вечер
  vec3 dusk = mix(cGold * 1.05 + vec3(0.2, 0.05, 0.05), cViolet * 0.9, smoothstep(-0.02, 0.45, y));
  dusk = mix(dusk, cNavy, smoothstep(0.45, 1.0, y));
  dusk += cGold * 0.6 * pow(sd, 6.0);

  vec3 col = space * uSpace + night * uNight + day * uDay + dusk * uDusk;
  float wsum = uSpace + uNight + uDay + uDusk;
  col /= max(wsum, 0.0001);

  // облака (проекция на «потолок» неба)
  if (uClouds > 0.0 && y > -0.02) {
    vec2 cp = d.xz / (y + 0.12) * 1.6 + vec2(uTime * 0.012, uTime * 0.004);
    float n = fbm(cp * 1.3);
    float cov = smoothstep(0.5, 0.78, n) * smoothstep(0.06, 0.3, y);
    float shade = 0.75 + 0.35 * fbm(cp * 2.6 + 3.0);
    vec3 cc = mix(vec3(0.82, 0.86, 0.92), vec3(1.0, 0.99, 0.96), shade - 0.6) * (uDay + uDusk * 0.8 + uNight * 0.12);
    cc = mix(cc, cGold * 1.1, uDusk * 0.45);
    col = mix(col, cc, cov * uClouds * 0.85);
  }
  // звёзды (только на тёмном небе)
  float starVis = uStars * smoothstep(-0.05, 0.12, y + uSpace);
  col += starVis * (stars(d, 160.0) + 0.7 * stars(d.zxy, 260.0)) * vec3(0.92, 0.95, 1.0);
  // Луна
  if (uMoon > 0.0) {
    float md = dot(d, normalize(uMoonDir));
    float disc = smoothstep(0.99972, 0.99981, md);
    float craters = 0.86 + 0.14 * vnoise3(d * 900.0);
    col = mix(col, vec3(1.0, 0.98, 0.92) * 1.6 * craters, disc * uMoon);
    col += vec3(0.6, 0.7, 0.9) * (pow(max(md, 0.0), 2500.0) * 0.35 + pow(max(md, 0.0), 80.0) * 0.08) * uMoon;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
