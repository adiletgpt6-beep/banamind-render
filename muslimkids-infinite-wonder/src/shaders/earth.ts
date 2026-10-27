// Земля: один шейдер на три состояния — капля краски на бумаге,
// акварельный диск, освещённая объёмная планета.
import { LOGDEPTH_FRAG_PARS, LOGDEPTH_VERT_PARS, NOISE, OUTPUT_FRAG, SRGB, WATERCOLOR } from "./common";

/** Сплющивание сферы на холст (ортографически вдоль мировой оси z). */
export const FLATTEN = /* glsl */ `
uniform float uFlat;
uniform vec3 uCenter;
vec3 flattenToCanvas(vec3 w){
  float front = w.z - uCenter.z;
  vec3 onPaper = vec3(w.x, w.y, 0.004 + 0.0008 * front);
  return mix(w, onPaper, uFlat);
}`;

export const earthVertex = /* glsl */ `
${LOGDEPTH_VERT_PARS}
${FLATTEN}
varying vec3 vDir;
varying vec3 vN;
varying vec3 vW;
varying vec2 vDisc;
void main(){
  vDir = normalize(position);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vDisc = (w.xy - uCenter.xy) / length(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0));
  vec3 p = flattenToCanvas(w.xyz);
  vW = p;
  vec4 mvPosition = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;

export const earthFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${NOISE}
${SRGB}
${WATERCOLOR}
uniform sampler2D uDay;
uniform sampler2D uData;
uniform vec3 uSun;
uniform float uPaint;
uniform float uFlat;
uniform float uReveal;
uniform float uLandReveal;
uniform float uWet;
uniform float uDetail;
varying vec3 vDir;
varying vec3 vN;
varying vec3 vW;
varying vec2 vDisc;

vec2 dirUV(vec3 d){
  return vec2(atan(-d.z, d.x) / (2.0 * PI) + 0.5, asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5);
}

void main(){
  vec3 d = normalize(vDir);
  vec2 uv = dirUV(d);
  vec2 gx = dFdx(uv); vec2 gy = dFdy(uv);
  if (abs(gx.x) > 0.5) gx.x -= sign(gx.x);
  if (abs(gy.x) > 0.5) gy.x -= sign(gy.x);
  vec3 day = textureGrad(uDay, uv, gx, gy).rgb;
  vec4 data = textureGrad(uData, uv, gx, gy);
  float land = data.r; float relief = data.g; float near = data.b;
  float ice = smoothstep(0.55, 0.8, min(min(day.r, day.g), day.b)) * land;

  // Детализация вблизи: мелкий рельеф и разнообразие цвета.
  float det = fbm3(d * 260.0);
  float det2 = fbm3(d * 1400.0);
  day *= mix(1.0, 0.88 + 0.24 * det * (0.85 + 0.3 * det2), uDetail * land);

  // Рельеф: возмущение нормали по экранным производным высоты.
  vec3 Ng = normalize(vN);
  float h = relief * 0.4 + uDetail * land * (det * 0.08 + det2 * 0.015);
  vec3 dpx = dFdx(vW); vec3 dpy = dFdy(vW);
  float dhx = dFdx(h); float dhy = dFdy(h);
  vec3 r1 = cross(dpy, Ng); vec3 r2 = cross(Ng, dpx);
  float fd = dot(dpx, r1);
  vec3 grad = sign(fd) * (dhx * r1 + dhy * r2);
  vec3 N = normalize(abs(fd) * Ng - grad * 0.22 * (1.0 - 0.75 * uDetail));
  if (abs(fd) < 1e-12) N = Ng;

  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vW);
  float lam = max(dot(N, L), 0.0);
  float dayMask = smoothstep(-0.14, 0.24, dot(Ng, L));

  // --- Освещённая планета ---
  vec3 lit = day * (vec3(1.0, 0.95, 0.88) * lam * 1.25 + HEX(20.0, 34.0, 58.0) * 0.55);
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 60.0) * (1.0 - land) * dayMask;
  lit += vec3(1.0, 0.88, 0.7) * spec * 0.75;
  vec3 night = HEX(8.0, 21.0, 38.0) * 0.55 + day * 0.035;
  lit = mix(night, lit, dayMask);
  float fres = pow(1.0 - max(dot(Ng, V), 0.0), 3.0);
  lit += HEX(122.0, 197.0, 234.0) * fres * (0.18 + 0.7 * dayMask);

  // --- Акварель ---
  vec2 p = vDisc;
  float r = length(p);
  // Бумага под пигментом: на холсте — по мировым координатам (совпадает
  // с листом бумаги), на объёмной сфере — по поверхности.
  vec2 wPaper = mix(uv * vec2(9.0, 4.5), vW.xy, uFlat);
  vec3 paper = paperColor(wPaper);
  float n1 = fbm(p * 2.6 + 3.1);
  float n2 = fbm(p * 7.0 - 1.3);
  float rr = r + 0.24 * (n1 - 0.5) + 0.06 * (n2 - 0.5);
  float oceanM = 1.0 - smoothstep(uReveal - 0.04, uReveal + 0.04, rr);
  float k = dot(p, normalize(vec2(0.72, 0.69))) * 0.5 + 0.5 + 0.3 * (fbm(p * 3.3 + 7.0) - 0.5);
  float landM = smoothstep(k - 0.07, k + 0.07, uLandReveal * 1.3 - 0.15) * smoothstep(0.2, 0.6, oceanM);

  vec3 oceanPig = mix(HEX(18.0, 70.0, 140.0), HEX(82.0, 176.0, 226.0), clamp(near * 0.85 + 0.35 * (n1 - 0.45), 0.0, 1.0));
  float coast = 1.0 - smoothstep(0.0, 0.28, abs(land - 0.5));
  float rim = smoothstep(0.86, 1.0, r) * uFlat;
  float dOcean = min(1.0, granulate(edgeDark(oceanM), wPaper) * 1.35) * (1.0 - land * 0.9) * (0.85 + 0.3 * rim);
  vec3 wc = glaze(paper, oceanPig, dOcean);
  vec3 landPig = mix(clamp(day * 1.25, 0.0, 1.0), HEX(58.0, 166.0, 124.0), 0.28);
  float dLand = granulate(edgeDark(landM), wPaper * 1.3) * land * (1.0 - ice * 0.92) * (0.85 + 0.45 * coast);
  wc = glaze(wc, landPig, dLand);
  // Влажный блеск свежей краски.
  wc += vec3(0.05, 0.06, 0.07) * uWet * oceanM * (1.0 - oceanM) * 4.0;
  // Пока картина поднимается, у акварели появляется объём.
  wc *= mix(1.0, 0.5 + 0.65 * smoothstep(-0.3, 0.9, dot(Ng, L)), (1.0 - uFlat) * 0.7);

  vec3 col = mix(lit, wc, uPaint);
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_FRAG}
}`;

/** Облака и атмосфера — отдельные оболочки, тоже «сплющиваются» в картину. */
export const shellVertex = /* glsl */ `
${LOGDEPTH_VERT_PARS}
${FLATTEN}
varying vec3 vDir;
varying vec3 vN;
varying vec3 vW;
void main(){
  vDir = normalize(position);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vec3 p = flattenToCanvas(w.xyz);
  vW = p;
  vec4 mvPosition = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;

export const cloudsFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${NOISE}
uniform sampler2D uClouds;
uniform vec3 uSun;
uniform float uOpacity;
uniform float uDetail;
varying vec3 vDir;
varying vec3 vN;
varying vec3 vW;
void main(){
  vec3 d = normalize(vDir);
  vec2 uv = vec2(atan(-d.z, d.x) / (2.0 * PI) + 0.5, asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5);
  vec2 gx = dFdx(uv); vec2 gy = dFdy(uv);
  if (abs(gx.x) > 0.5) gx.x -= sign(gx.x);
  if (abs(gy.x) > 0.5) gy.x -= sign(gy.x);
  float c = textureGrad(uClouds, uv, gx, gy).r;
  c = mix(c, smoothstep(0.25, 0.85, c * (0.6 + 0.8 * fbm3(d * 180.0))), uDetail);
  vec3 N = normalize(vN);
  float lam = max(dot(N, normalize(uSun)), 0.0);
  float day = smoothstep(-0.12, 0.25, dot(N, normalize(uSun)));
  vec3 col = vec3(1.0) * (0.06 + 1.05 * lam) + vec3(0.02, 0.04, 0.08);
  gl_FragColor = vec4(col, c * uOpacity * (0.35 + 0.65 * day));
  ${OUTPUT_FRAG}
}`;

export const atmosphereFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${SRGB}
uniform vec3 uSun;
uniform float uOpacity;
varying vec3 vDir;
varying vec3 vN;
varying vec3 vW;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float rimv = 1.0 - abs(dot(N, V));
  float glow = pow(smoothstep(0.0, 1.0, rimv), 4.0);
  float day = smoothstep(-0.35, 0.4, dot(N, normalize(uSun)));
  vec3 col = HEX(122.0, 197.0, 234.0) * 1.3 * glow * (0.15 + 0.85 * day);
  gl_FragColor = vec4(col * uOpacity, 1.0);
  ${OUTPUT_FRAG}
}`;
