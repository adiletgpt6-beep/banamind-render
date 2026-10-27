// Холст: бумага, тень поднимающейся Земли, ночная лессировка-космос
// и финальная акварельная картина (небо, горы, лес, река, дерево).
import { LOGDEPTH_FRAG_PARS, LOGDEPTH_VERT_PARS, NOISE, OUTPUT_FRAG, SRGB, WATERCOLOR } from "./common";

export const paperVertex = /* glsl */ `
${LOGDEPTH_VERT_PARS}
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
}`;

export const paperFragment = /* glsl */ `
${LOGDEPTH_FRAG_PARS}
${NOISE}
${SRGB}
${WATERCOLOR}
uniform vec3 uSunXY;      // проекция солнечного направления для тени
uniform float uLift;
uniform float uSpaceWash;
uniform float uPaperFade;
uniform float uSky;
uniform float uFar;
uniform float uNear;
uniform float uTree;
uniform float uMeadow;
uniform float uFinalWet;
varying vec3 vW;

// Мягкая маска мазка с «рваным» органичным краем.
float wash(float sdf, vec2 w, float soft, float rough){
  float n = fbm(w * 1.7 + 4.0) - 0.5;
  float n2 = fbm(w * 6.0 - 2.0) - 0.5;
  return 1.0 - smoothstep(-soft, soft, sdf + rough * (n * 0.8 + n2 * 0.35));
}
// Раскрытие мазка во времени: краска «расползается» от затравки.
float grow(float m, vec2 w, float k){
  float n = fbm(w * 0.9 + 11.0);
  return m * smoothstep(n * 0.55, n * 0.55 + 0.45, k);
}
float ridgeLine(float x, float seed, float amp, float base){
  float r = 1.0 - abs(fbm(vec2(x * 0.75 + seed, seed)) * 2.0 - 1.0);
  r = pow(r, 1.6);
  return base + amp * (r * 1.0 + 0.22 * fbm(vec2(x * 3.1, seed * 3.0)));
}

void main(){
  vec2 w = vW.xy;
  vec3 col = paperColor(w);

  // --- Финальная картина (под Землёй) ---
  if (uSky + uFar + uNear + uTree + uMeadow > 0.001) {
    float rE = length(w);
    // Небо: голубая лессировка сверху, тёплое золото у горизонта.
    float skyM = grow(wash(-2.4 - w.y, w, 0.4, 0.8) * wash(abs(w.x) - 2.6, w, 0.3, 0.6) * wash(w.y - 3.25, w, 0.3, 0.7), w, uSky);
    vec3 skyPig = mix(HEX(244.0, 214.0, 150.0), HEX(150.0, 206.0, 238.0), smoothstep(-1.4, 2.4, w.y));
    float halo = smoothstep(1.7, 1.0, rE);
    col = glaze(col, skyPig, granulate(edgeDark(skyM), w) * (0.42 - 0.15 * halo));
    // Дальние горы: сапфир, вершины оставлены белой бумагой (снег).
    float yF = ridgeLine(w.x, 1.3, 1.25, -2.0);
    float farM = grow(wash(w.y - yF, w, 0.02, 0.035) * wash(-2.9 - w.y, w, 0.2, 0.5) * wash(abs(w.x) - 2.65, w, 0.2, 0.5), w, uFar);
    float snow = smoothstep(yF - 0.24, yF - 0.08, w.y) * smoothstep(0.62, 0.8, fbm(vec2(w.x * 3.0, 2.0)) + (w.y - yF + 0.5) * 0.6);
    col = glaze(col, mix(HEX(84.0, 128.0, 186.0), HEX(27.0, 80.0, 139.0), smoothstep(yF, yF - 0.8, w.y)), granulate(edgeDark(farM), w * 1.2) * (0.8 - 0.65 * snow));
    // Ближние горы: бирюза и изумруд.
    float yN = ridgeLine(w.x + 3.7, 4.1, 0.75, -2.6);
    float nearM = grow(wash(w.y - yN, w, 0.02, 0.035) * wash(-3.2 - w.y, w, 0.2, 0.5) * wash(abs(w.x) - 2.65, w, 0.2, 0.5), w, uNear);
    col = glaze(col, mix(HEX(82.0, 208.0, 204.0), HEX(58.0, 166.0, 124.0), smoothstep(yN, yN - 0.5, w.y)), granulate(edgeDark(nearM), w) * 0.55);
    // Лесная кромка: ряд елей.
    float cx = floor(w.x * 7.0);
    float fx = fract(w.x * 7.0) - 0.5;
    float hT = 0.16 + 0.1 * hash12(vec2(cx, 3.0));
    float baseY = -2.98 + 0.05 * sin(w.x * 1.7);
    float tri = (w.y - baseY) / hT;
    float firM = step(0.0, tri) * step(tri, 1.0) * step(abs(fx), 0.36 * (1.0 - tri));
    firM = grow(wash(-firM + 0.5, w * 4.0, 0.25, 0.4) * wash(abs(w.x) - 2.55, w, 0.2, 0.5), w, uNear);
    col = glaze(col, HEX(45.0, 110.0, 84.0), granulate(firM, w * 2.0) * 0.78);
    // Луг и река.
    float meadowM = grow(wash(w.y + 3.0, w, 0.05, 0.12) * wash(-3.55 - w.y, w, 0.12, 0.45) * wash(abs(w.x) - 2.6, w, 0.2, 0.5), w, uMeadow);
    col = glaze(col, mix(HEX(170.0, 196.0, 104.0), HEX(58.0, 166.0, 124.0), fbm(w * 2.2)), granulate(edgeDark(meadowM), w) * 0.55);
    float riverX = 0.35 * sin(w.y * 2.2 + 1.0) + 0.25 * (w.y + 3.0);
    float riverW = 0.05 + 0.1 * smoothstep(-3.0, -3.6, w.y);
    float riverM = grow(wash(abs(w.x - riverX) - riverW, w * 2.0, 0.02, 0.05) * step(w.y, -2.95) * meadowM, w, uMeadow);
    col = glaze(col, HEX(122.0, 197.0, 234.0), riverM * 0.75);
    // Дерево: ствол-мазок и крона из нескольких «капель».
    vec2 tp = w - vec2(-1.35, -2.0);
    float trunk = wash(abs(tp.x + 0.03 * sin(tp.y * 6.0)) - 0.045 * (1.0 - tp.y * 0.25), w * 3.0, 0.012, 0.02) * step(-1.2, tp.y) * step(tp.y, 0.55);
    col = glaze(col, HEX(147.0, 112.0, 79.0), grow(trunk, w, uTree) * 0.85);
    float crown = 0.0;
    crown = max(crown, wash(length(tp - vec2(0.0, 0.62)) - 0.42, w * 1.5, 0.03, 0.1));
    crown = max(crown, wash(length(tp - vec2(-0.33, 0.42)) - 0.3, w * 1.5, 0.03, 0.1));
    crown = max(crown, wash(length(tp - vec2(0.33, 0.45)) - 0.32, w * 1.5, 0.03, 0.1));
    crown = max(crown, wash(length(tp - vec2(0.08, 0.95)) - 0.28, w * 1.5, 0.03, 0.1));
    crown = grow(crown, w, uTree);
    vec3 crownPig = mix(HEX(58.0, 166.0, 124.0), HEX(40.0, 120.0, 80.0), smoothstep(0.9, 0.2, tp.y + 0.2 * (tp.x + 0.3)));
    col = glaze(col, crownPig, granulate(edgeDark(crown), w * 1.4) * 0.8);
    col = glaze(col, HEX(239.0, 196.0, 117.0), crown * smoothstep(0.55, 0.85, fbm(w * 4.0)) * 0.25);
    // Свежие мазки ещё блестят.
    col += vec3(0.03, 0.035, 0.04) * uFinalWet * (crown + meadowM + nearM) * fbm(w * 9.0);
  }

  // --- Тень Земли, поднявшейся над холстом ---
  vec2 sc = -uSunXY.xy * uLift;
  float sh = 1.0 - smoothstep(0.55, 1.3, length(w - sc));
  col *= 1.0 - sh * 0.3 * smoothstep(0.0, 0.6, uLift) * (1.0 - uSpaceWash);

  // --- Ночная лессировка: холст становится космосом ---
  if (uSpaceWash > 0.001) {
    float R = mix(0.95, 16.0, pow(uSpaceWash, 1.15));
    float rr = length(w) + 0.9 * (fbm(w * 0.6 + 2.0) - 0.5) * min(R, 3.0) + 0.25 * (fbm(w * 3.0) - 0.5);
    float m = 1.0 - smoothstep(R - 0.25, R + 0.25, rr);
    m = max(m, smoothstep(0.92, 1.0, uSpaceWash));
    vec3 nightPig = mix(HEX(8.0, 21.0, 38.0), HEX(27.0, 80.0, 139.0), 0.25 * smoothstep(0.45, 0.85, fbm(w * 0.5 + 9.0)));
    col = glaze(col, nightPig, min(1.0, edgeDark(m)));
    // Звёзды — брызги белой гуаши.
    vec2 g = w * 7.0;
    vec2 cell = floor(g);
    vec2 o = hash33(vec3(cell, 7.0)).xy;
    float star = step(0.9, hash12(cell + 3.1)) * (1.0 - smoothstep(0.02, 0.06, length(fract(g) - o) * (1.0 + 2.0 * hash12(cell))));
    col = mix(col, HEX(247.0, 243.0, 233.0) * 0.9, star * m * 0.85);
  }
  gl_FragColor = vec4(col, 1.0 - uPaperFade);
  ${OUTPUT_FRAG}
}`;
