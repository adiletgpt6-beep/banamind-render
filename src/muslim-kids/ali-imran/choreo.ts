// Хореография частиц всего ролика: одна система из N частиц проходит через
// все сцены (точка → Луна → Солнце и Луна → Земля → космос → книга → небо →
// Земля → день/ночь → три знамения → капля → дерево → звёзды → логотип).
// Моменты морфинга привязаны к словам озвучки (Cues).
import { createContext, useContext } from "react";
import { RGB, W, type Rgb } from "../theme";
import {
  fibSphere,
  project,
  smooth,
  unit,
  type Proj,
  type View,
} from "../lib/earth";
import { clamp01, ease, hash01, lerp, range, wobble } from "../lib/math";
import {
  cloudFrom,
  pick,
  setP,
  type Formation,
  type P,
  type Segment,
} from "../lib/particles";
import {
  book,
  byAngle,
  byY,
  crescent,
  disc,
  drop,
  ring,
  starfield,
  sun,
  tree,
  type Pt,
} from "../lib/shapes";
import type { Cues } from "./timeline";

export const N = 2600;

const mixC = (a: Rgb, b: Rgb, t: number): Rgb => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const DIM_BLUE: Rgb = [30, 62, 128];

// ---------- облака ----------
const MOON = cloudFrom(byAngle(crescent(N)));
const SUN = cloudFrom(byAngle(sun(Math.round(N * 0.62))));
const MOON_S = cloudFrom(byAngle(crescent(N - Math.round(N * 0.62))));
const GLOBE = fibSphere(N);
const DENSE = fibSphere(22000);
const DENSE_LAND = Array.from({ length: DENSE.n }, (_, i) => i).filter(
  (i) => DENSE.land[i],
);
const BOOK = cloudFrom(byAngle(book(N), 0, -0.05));
const SKY_DISC = cloudFrom(byAngle(disc(Math.round(N * 0.86))));
const SKY_RING = cloudFrom(ring(N - Math.round(N * 0.86), 1.08));
const DN_DISC = cloudFrom(disc(Math.round(N * 0.82)));
const DN_TICKS: Pt[] = [];
for (let k = 0; k < 24; k++) {
  const a = (k / 24) * Math.PI * 2;
  const per = Math.ceil((N - Math.round(N * 0.82)) / 24);
  for (let j = 0; j < per; j++) {
    const r = 1.1 + (j / per) * (k % 6 === 0 ? 0.14 : 0.07);
    DN_TICKS.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
}
const DN_T = cloudFrom(DN_TICKS);
const DROP = cloudFrom(drop(N));
const TREE = (() => {
  const nWood = Math.round(N * 0.3);
  const t = tree(nWood, N - nWood);
  return {
    wood: cloudFrom(byY(t.wood)),
    leaf: cloudFrom(byAngle(t.leaf, 0, -0.6)),
    nWood,
  };
})();
const STARS = starfield(N, 3);
const LOGO_MOON = cloudFrom(byAngle(crescent(Math.round(N * 0.3))));
const SKY_DOTS = starfield(Math.round(N * 0.86), 5);

// ---------- Земля ----------
export const LIGHT = unit(-1, 0.06, 0.16);
export const TILT = -0.408; // 23,4°
const pr: Proj = { x: 0, y: 0, z: 0, lit: 0 };

export type GlobeDraw = { view: View; alpha: number; detail: number };

const shadeGlobe = (
  lat: number,
  lon: number,
  land: boolean,
  view: View,
  out: P,
  alpha: number,
  rScale: number,
) => {
  project(lat, lon, view, pr);
  const vis = smooth(-0.04, 0.14, pr.z);
  const day = smooth(-0.07, 0.09, pr.lit);
  const limb = 0.55 + 0.45 * Math.max(0, pr.z);
  const cDay = land ? RGB.white : RGB.blue;
  const cNight = land ? mixC(RGB.sky, RGB.blue, 0.45) : DIM_BLUE;
  const a =
    (land ? lerp(0.3, 1, day) : lerp(0.16, 0.85, day)) * limb * vis * alpha;
  setP(
    out,
    pr.x,
    pr.y,
    (land ? 3.1 : 2.2) * rScale,
    a,
    mixC(cNight, cDay, day),
    day * (land ? 0.6 : 0.3),
  );
};

const globeFormation =
  (
    viewAt: (f: number) => View,
    alpha: (f: number) => number = () => 1,
  ): Formation =>
  (i, f, out) => {
    const v = viewAt(f);
    shadeGlobe(
      GLOBE.lat[i],
      GLOBE.lon[i],
      GLOBE.land[i] === 1,
      v,
      out,
      alpha(f),
      Math.sqrt(v.R / 320),
    );
  };

// плотный слой материков (рисуется под частицами), даёт чёткие очертания
export const drawGlobeDetail = (
  ctx: CanvasRenderingContext2D,
  g: GlobeDraw,
) => {
  if (g.alpha * g.detail < 0.01) return;
  const rr = 1.55 * Math.sqrt(g.view.R / 320);
  for (const i of DENSE_LAND) {
    project(DENSE.lat[i], DENSE.lon[i], g.view, pr);
    if (pr.z < -0.02) continue;
    const vis = smooth(-0.02, 0.14, pr.z);
    const day = smooth(-0.07, 0.09, pr.lit);
    const a =
      lerp(0.18, 0.95, day) * (0.5 + 0.5 * pr.z) * vis * g.alpha * g.detail;
    const c = mixC(mixC(RGB.sky, RGB.blue, 0.4), RGB.white, day);
    ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
    ctx.fillRect(pr.x - rr, pr.y - rr, rr * 2, rr * 2);
  }
};

// ---------- звёздный фон (параллакс) ----------
const BG_STARS = starfield(700, 9);
export type StarsDraw = {
  alpha: number;
  zoom: number;
  drift: number;
  cy?: number;
};
export const drawStars = (
  ctx: CanvasRenderingContext2D,
  f: number,
  s: StarsDraw,
) => {
  if (s.alpha < 0.01) return;
  const cy = s.cy ?? 960;
  for (let i = 0; i < BG_STARS.length; i++) {
    const st = BG_STARS[i];
    const depth = 0.35 + 0.65 * st.z;
    const k = 1 + (s.zoom - 1) * depth;
    const x = 540 + (st.x - 0.5) * 1300 * k;
    let y = cy + (st.y - 0.5) * 2300 * k + s.drift * depth;
    y = ((((y + 200) % 2320) + 2320) % 2320) - 200;
    if (x < -10 || x > W + 10) continue;
    const tw = 0.55 + 0.45 * Math.sin(f * (0.05 + st.tw * 0.06) + st.tw * 40);
    const a = s.alpha * (0.25 + 0.75 * st.z) * tw;
    const r = 0.7 + st.z * 1.6;
    ctx.fillStyle = `rgba(${st.tw > 0.8 ? "143,197,255" : "255,255,255"},${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
};

export type Plan = {
  segments: Segment[];
  globes: (f: number) => GlobeDraw[];
  stars: (f: number) => StarsDraw;
  // сцена 5: подъём камеры (px) — для фона и земли
  rise: (f: number) => number;
  impact: number;
  earthView: (f: number) => View;
  spinAt: (f: number) => number;
  dropStart: number;
  treeAt: number;
  riseFrom: number;
};

export const buildPlan = (c: Cues): Plan => {
  const S = (id: string) => c.scene(id);
  const s1 = S("s1");
  const s2 = S("s2");
  const s3 = S("s3");
  const s4 = S("s4");
  const s5 = S("s5");
  const s6 = S("s6");
  const segs: Segment[] = [];

  // ===== СЦЕНА 1: точка → Луна → Солнце (день) и Луна (ночь) =====
  const dotOn = s1.from;
  segs.push({
    from: dotOn,
    shape: (i, f, o) => {
      const t = f - dotOn;
      if (i === 0) {
        const grow = ease.outBack(clamp01(t / 14));
        setP(
          o,
          540,
          900,
          (5.5 + Math.sin(t * 0.18) * 1.2) * grow,
          grow,
          RGB.white,
          1,
        );
      } else setP(o, 540, 900, 1.6, 0, RGB.white, 1);
    },
  });
  const moonAt = c.word("s1a", 0) - 4;
  const moonPos = (f: number) => ({
    x: 540,
    y: 900 - 10 * range(f, moonAt, moonAt + 60),
  });
  segs.push({
    from: moonAt,
    morph: {
      dur: 34,
      stagger: 0.55,
      swirl: 260,
      easing: ease.outQuint,
      order: (i) => hash01(i, 3),
    },
    shape: (i, f, o) => {
      const k = pick(MOON, i, N);
      const m = moonPos(f);
      const rot = -0.35 + (f - moonAt) * 0.0015;
      const x = MOON.x[k];
      const y = MOON.y[k];
      const tw = 0.75 + 0.25 * Math.sin(f * 0.07 + hash01(i, 8) * 30);
      setP(
        o,
        m.x + (x * Math.cos(rot) - y * Math.sin(rot)) * 260,
        m.y + (x * Math.sin(rot) + y * Math.cos(rot)) * 260,
        1.7 + hash01(i, 9) * 1.4,
        tw,
        hash01(i, 10) > 0.75 ? RGB.sky : RGB.white,
        0.7,
      );
    },
  });
  const lightAt = c.word("s1b", "светло") - 6;
  const nSun = Math.round(N * 0.62);
  const splitShape: Formation = (i, f, o) => {
    const t = f - lightAt;
    if (i < nSun) {
      const k = pick(SUN, i, nSun);
      const rot = t * 0.004;
      const pulse = 1 + 0.025 * Math.sin(t * 0.09);
      const x = SUN.x[k] * pulse;
      const y = SUN.y[k] * pulse;
      setP(
        o,
        540 + (x * Math.cos(rot) - y * Math.sin(rot)) * 215,
        500 + (x * Math.sin(rot) + y * Math.cos(rot)) * 215,
        2.5 + hash01(i, 14) * 1.1,
        1,
        RGB.blue,
        0,
      );
    } else {
      const j = i - nSun;
      const k = pick(MOON_S, j, N - nSun);
      const rot = -0.35;
      const x = MOON_S.x[k];
      const y = MOON_S.y[k];
      const tw = 0.75 + 0.25 * Math.sin(f * 0.07 + hash01(i, 8) * 30);
      setP(
        o,
        560 + (x * Math.cos(rot) - y * Math.sin(rot)) * 150,
        1410 + (x * Math.sin(rot) + y * Math.cos(rot)) * 150,
        1.6 + hash01(i, 9) * 1.2,
        tw,
        RGB.white,
        0.7,
      );
    }
  };
  segs.push({
    from: lightAt,
    morph: { dur: 30, stagger: 0.5, swirl: 200, easing: ease.inOutCubic },
    shape: splitShape,
  });

  // ===== СЦЕНА 2: Земля из частиц, вращение, свет Солнца слева =====
  // к слову «день» на освещённой стороне — Африка и Европа
  const spin0 = -2.0;
  const spinAt = (f: number) => spin0 + (f - s2.from) * 0.0115;
  const earthAt = s2.from + 2;
  // камера сцены 3: отъезд от Земли
  const pull = (f: number) => ease.inOutCubic(range(f, s3.from, s3.from + 75));
  const earthView = (f: number): View => {
    const k = pull(f);
    return {
      cx: lerp(560, 540, k),
      cy: lerp(1010, 980, k),
      R: lerp(315, 120, k),
      spin: spinAt(f),
      tilt: TILT,
      light: LIGHT,
    };
  };
  segs.push({
    from: earthAt,
    morph: { dur: 42, stagger: 0.5, swirl: 240, easing: ease.inOutQuint },
    shape: globeFormation(earthView),
  });

  // ===== СЦЕНА 3: космос → открытая книга =====
  // частицы Земли расходятся на орбиты вокруг маленькой Земли
  const orbitAt = c.word("s3a", "узнать") - 4;
  const smallEarth = globeFormation(earthView);
  const orbits: Formation = (i, f, o) => {
    // 40 % частиц остаются маленькой Землёй, остальные — на трёх орбитах
    if (i % 5 < 2) {
      smallEarth(i, f, o);
      return;
    }
    const ringId = i % 3;
    const rx = [250, 360, 470][ringId];
    const ry = rx * 0.32;
    const tiltR = [-0.25, -0.18, -0.3][ringId];
    const speed = [0.012, 0.008, 0.0055][ringId];
    const a = hash01(i, 21) * Math.PI * 2 + (f - orbitAt) * speed;
    const ex = Math.cos(a) * rx;
    const ey = Math.sin(a) * ry + (hash01(i, 22) - 0.5) * 6;
    const x = 540 + ex * Math.cos(tiltR) - ey * Math.sin(tiltR);
    const y = 980 + ex * Math.sin(tiltR) + ey * Math.cos(tiltR);
    // задняя половина орбиты — за Землёй (тусклее)
    const back = Math.sin(a) < 0 ? 0.45 : 1;
    setP(
      o,
      x,
      y,
      1.3 + hash01(i, 23) * 1.3,
      0.85 * back,
      hash01(i, 24) > 0.5 ? RGB.sky : RGB.white,
      0.6,
    );
  };
  segs.push({
    from: orbitAt,
    morph: { dur: 40, stagger: 0.6, swirl: 160, easing: ease.inOutCubic },
    shape: orbits,
  });

  const bookAt = c.word("s3a", "задуматься") - 6;
  const revealAt = c.word("s3a", "творении") - 2;
  const bookShape: Formation = (i, f, o) => {
    const k = pick(BOOK, i, N);
    const open = ease.inOutCubic(range(f, bookAt + 10, bookAt + 52));
    const bx = BOOK.x[k] * lerp(0.08, 1, open);
    const by = BOOK.y[k] + Math.abs(BOOK.x[k]) * 0.12 * (1 - open);
    const float = Math.sin((f - bookAt) * 0.05) * 6;
    // белый фон: книга синяя/чёрная; в сцене 4 фон снова чёрный — светлые цвета
    const w =
      range(f, revealAt, revealAt + 26) * (1 - range(f, s4.from, s4.from + 18));
    const col = mixC(
      hash01(i, 31) > 0.6 ? RGB.sky : RGB.white,
      i < N * 0.34 ? RGB.black : RGB.blue,
      w,
    );
    setP(
      o,
      540 + bx * 360,
      930 + by * 360 + float,
      lerp(2.0, 2.4, w) + hash01(i, 32) * 0.8,
      1,
      col,
      0.6 * (1 - w),
    );
  };
  segs.push({
    from: bookAt,
    morph: { dur: 46, stagger: 0.55, swirl: 280, easing: ease.inOutQuint },
    shape: bookShape,
  });

  // ===== СЦЕНА 4: небо → Земля → день и ночь → три знамения =====
  const skyAt = c.word("s4b", "небо") - 8;
  const skyShape =
    (cx: number, cy: number, R: number, rs: number): Formation =>
    (i, f, o) => {
      const nD = Math.round(N * 0.86);
      const rot = (f - skyAt) * 0.0025;
      if (i < nD) {
        const st = SKY_DOTS[i];
        const k = pick(SKY_DISC, i, nD);
        const x = SKY_DISC.x[k];
        const y = SKY_DISC.y[k];
        const big = st.z > 0.82;
        const tw =
          0.45 +
          0.55 * (0.5 + 0.5 * Math.sin(f * (0.06 + st.tw * 0.07) + st.tw * 50));
        setP(
          o,
          cx + (x * Math.cos(rot) - y * Math.sin(rot)) * R,
          cy + (x * Math.sin(rot) + y * Math.cos(rot)) * R,
          (big ? 2.8 : 1.0 + st.z * 1.6) * rs,
          tw,
          big ? RGB.white : st.tw > 0.7 ? RGB.sky : RGB.white,
          big ? 1 : 0.4,
        );
      } else {
        const k = pick(SKY_RING, i - nD, N - nD);
        setP(
          o,
          cx + SKY_RING.x[k] * R,
          cy + SKY_RING.y[k] * R,
          1.3 * rs,
          0.55,
          RGB.blue,
          0.3,
        );
      }
    };
  segs.push({
    from: skyAt,
    morph: { dur: 34, stagger: 0.5, swirl: 220, easing: ease.inOutCubic },
    shape: skyShape(540, 900, 330, 1),
  });

  const landAt = c.word("s4b", "земля") - 6;
  const view4 =
    (cx: number, cy: number, R: number) =>
    (f: number): View => ({
      cx,
      cy,
      R,
      spin: spinAt(f),
      tilt: TILT,
      light: LIGHT,
    });
  segs.push({
    from: landAt,
    morph: { dur: 30, stagger: 0.45, swirl: 180 },
    shape: globeFormation(view4(540, 900, 300)),
  });

  const dnAt = c.word("s4b", "смена") - 6;
  const dnShape =
    (cx: number, cy: number, R: number, rs: number, t0: number): Formation =>
    (i, f, o) => {
      const nD = Math.round(N * 0.82);
      // граница дня и ночи поворачивается: так меняются день и ночь
      const th =
        -Math.PI / 2 +
        ease.inOutSine(clamp01((f - t0) / 150)) * Math.PI +
        Math.max(0, f - t0 - 150) * 0.004;
      if (i < nD) {
        const k = pick(DN_DISC, i, nD);
        const x = DN_DISC.x[k];
        const y = DN_DISC.y[k];
        const d = x * Math.cos(th) + y * Math.sin(th);
        const day = smooth(-0.06, 0.06, d);
        setP(
          o,
          cx + x * R,
          cy + y * R,
          lerp(1.7, 2.6, day) * rs,
          lerp(0.6, 1, day),
          mixC([44, 92, 190], RGB.white, day),
          day * 0.6,
        );
      } else {
        const k = pick(DN_T, i - nD, N - nD);
        setP(
          o,
          cx + DN_T.x[k] * R,
          cy + DN_T.y[k] * R,
          1.6 * rs,
          0.8,
          RGB.sky,
          0.3,
        );
      }
    };
  segs.push({
    from: dnAt,
    morph: { dur: 30, stagger: 0.45, swirl: 160 },
    shape: dnShape(540, 900, 300, 1, dnAt + 10),
  });

  const trioAt = c.word("s4b", "знамения") - 6;
  const trioY = 860;
  const miniSky = skyShape(200, trioY, 125, 0.85);
  const miniGlobe = globeFormation(view4(540, trioY, 125));
  const miniDn = dnShape(880, trioY, 120, 0.85, dnAt + 10);
  segs.push({
    from: trioAt,
    morph: { dur: 34, stagger: 0.4, swirl: 140, easing: ease.inOutQuint },
    shape: (i, f, o) => {
      // каждая третья частица — в свою форму (равномерные подвыборки облаков)
      const g = i % 3;
      if (g === 0) miniSky(i, f, o);
      else if (g === 1) miniGlobe(i, f, o);
      else miniDn(i, f, o);
    },
  });

  // ===== СЦЕНА 5: капля → удар → росток → дерево → подъём к небу =====
  const dropForm = s5.from + 2;
  const dropStart = c.word("s5a", 0) + 14;
  const impact = dropStart + 26;
  const GROUND = 1420;
  const riseFrom = c.word("s5b", "задуматься") + 6;
  const riseDur = s6.from - riseFrom + 20;
  const rise = (f: number) =>
    ease.inOutCubic(range(f, riseFrom, riseFrom + riseDur)) * 1500;
  segs.push({
    from: dropForm,
    morph: { dur: 26, stagger: 0.4, swirl: 220, easing: ease.inOutCubic },
    shape: (i, f, o) => {
      const k = pick(DROP, i, N);
      const t = clamp01((f - dropStart) / (impact - dropStart));
      const y = lerp(330, GROUND - 70, t * t);
      const stretch = 1 + 0.25 * t * t;
      setP(
        o,
        540 + (DROP.x[k] * 62) / stretch,
        y + DROP.y[k] * 62 * stretch,
        1.6 + hash01(i, 41) * 0.8,
        1,
        hash01(i, 42) > 0.7 ? RGB.sky : RGB.blue,
        0,
      );
    },
  });
  // брызги: баллистические дуги в обе стороны, затем вода впитывается в почву
  segs.push({
    from: impact,
    shape: (i, f, o) => {
      const t = f - impact;
      const side = hash01(i, 45) > 0.5 ? 1 : -1;
      const splash = hash01(i, 43) < 0.45;
      const x0 = 540 + DROP.x[pick(DROP, i, N)] * 40;
      let x: number;
      let y: number;
      if (splash) {
        const a = Math.PI * (0.22 + 0.22 * hash01(i, 44));
        const v = 7 + hash01(i, 46) * 14;
        const g = 1.15;
        const T = (2 * v * Math.sin(a)) / g;
        const tt = Math.min(t, T);
        x = x0 + side * Math.cos(a) * v * tt;
        y = GROUND - 2 - Math.sin(a) * v * tt + 0.5 * g * tt * tt;
      } else {
        const spread =
          ease.outCubic(clamp01(t / 16)) * (60 + hash01(i, 47) * 170);
        x = x0 + side * spread;
        y = GROUND + 2 + hash01(i, 48) * 6;
      }
      const sink = ease.inOutCubic(range(f, impact + 22, impact + 70));
      setP(
        o,
        x,
        y + sink * (14 + hash01(i, 49) * 110),
        lerp(1.9, 1.3, sink),
        lerp(1, 0.4, sink),
        RGB.blue,
        0,
      );
    },
  });
  const treeAt = c.word("s5b", "остановиться") - 8;
  const TREE_S = 400;
  segs.push({
    from: treeAt,
    morph: {
      dur: 52,
      stagger: 0.7,
      swirl: 90,
      easing: ease.inOutCubic,
      order: (i) =>
        i < TREE.nWood ? (i / TREE.nWood) * 0.45 : 0.4 + hash01(i, 48) * 0.6,
    },
    shape: (i, f, o) => {
      const up = rise(f);
      if (i < TREE.nWood) {
        const k = pick(TREE.wood, i, TREE.nWood);
        const ux = TREE.wood.x[k];
        const uy = TREE.wood.y[k];
        const sway = wobble(0, f * 0.03, 4) * (1 - uy) * 0.5;
        setP(
          o,
          540 + ux * TREE_S + sway,
          GROUND + (uy - 1) * TREE_S + up,
          2.2,
          1,
          RGB.black,
          0,
        );
      } else {
        const j = i - TREE.nWood;
        const k = pick(TREE.leaf, j, N - TREE.nWood);
        const ux = TREE.leaf.x[k];
        const uy = TREE.leaf.y[k];
        const sway = wobble(i % 40, f * 0.035, 5) * (1 - uy) * 0.4;
        const c3 = hash01(i, 49);
        setP(
          o,
          540 + ux * TREE_S + sway,
          GROUND + (uy - 1) * TREE_S + up + wobble(i, f * 0.05, 1.5),
          2.0 + hash01(i, 50) * 1.6,
          0.75 + 0.25 * c3,
          c3 > 0.55 ? RGB.blue : c3 > 0.2 ? RGB.sky : RGB.black,
          0,
        );
      }
    },
  });

  // ===== СЦЕНА 6: частицы дерева поднимаются и становятся звёздами =====
  const starsShape =
    (fromF: number): Formation =>
    (i, f, o) => {
      const st = STARS[i];
      const drift = (f - fromF) * 0.22 * (0.3 + st.z);
      const x = st.x * 1120 - 20;
      let y = st.y * 2000 - 40 + drift;
      y = ((y + 60) % 2040) - 60;
      const tw =
        0.4 +
        0.6 * (0.5 + 0.5 * Math.sin(f * (0.04 + st.tw * 0.06) + st.tw * 60));
      const big = st.z > 0.9;
      setP(
        o,
        x,
        y,
        big ? 2.6 : 0.8 + st.z * 1.5,
        (big ? 1 : 0.75) * tw,
        st.tw > 0.75 ? RGB.sky : RGB.white,
        big ? 1 : 0.35,
      );
    };
  const starsAt = riseFrom + 10;
  segs.push({
    from: starsAt,
    morph: {
      dur: Math.max(40, s6.from + 30 - starsAt),
      stagger: 0.6,
      swirl: 160,
      easing: ease.inOutCubic,
      order: (i) => hash01(i, 51),
    },
    shape: starsShape(starsAt),
  });

  // ===== СЦЕНА 7: звёзды над мальчиком → логотип (месяц из звёзд) =====
  const logoAt = c.line("s7c").speechTo + 8;
  const nLogo = Math.round(N * 0.3);
  const sky7 = starsShape(starsAt);
  segs.push({
    from: logoAt,
    morph: {
      dur: 40,
      stagger: 0.5,
      swirl: 200,
      easing: ease.inOutQuint,
      order: (i) => (i % 3 === 0 ? hash01(i, 52) : 0),
    },
    shape: (i, f, o) => {
      if (i % 3 !== 0) {
        sky7(i, f, o);
        return;
      }
      const j = Math.floor(i / 3);
      const k = pick(LOGO_MOON, j, nLogo);
      const rot = -0.5;
      const x = LOGO_MOON.x[k];
      const y = LOGO_MOON.y[k];
      setP(
        o,
        540 + (x * Math.cos(rot) - y * Math.sin(rot)) * 78,
        880 + (x * Math.sin(rot) + y * Math.cos(rot)) * 78,
        1.7,
        1,
        hash01(i, 53) > 0.6 ? RGB.sky : RGB.white,
        0.8,
      );
    },
  });

  // ---------- слои ----------
  const globes = (f: number): GlobeDraw[] => {
    const out: GlobeDraw[] = [];
    // Земля сцен 2–3: детали проявляются после сборки шара
    const d23 =
      range(f, earthAt + 40, earthAt + 64) *
      (1 - range(f, orbitAt - 2, orbitAt + 24));
    if (d23 > 0) out.push({ view: earthView(f), alpha: 1, detail: d23 });
    const d3 =
      range(f, orbitAt + 20, orbitAt + 40) *
      (1 - range(f, bookAt, bookAt + 20));
    if (d3 > 0) out.push({ view: earthView(f), alpha: 1, detail: d3 * 0.9 });
    const d4 =
      range(f, landAt + 24, landAt + 40) * (1 - range(f, dnAt - 2, dnAt + 12));
    if (d4 > 0)
      out.push({ view: view4(540, 900, 300)(f), alpha: 1, detail: d4 });
    const d4m =
      range(f, trioAt + 26, trioAt + 44) *
      (1 - range(f, s5.from - 4, s5.from + 8));
    if (d4m > 0)
      out.push({
        view: view4(540, trioY, 125)(f),
        alpha: 1,
        detail: d4m * 0.8,
      });
    return out;
  };
  const stars = (f: number): StarsDraw => {
    if (f < s3.from) return { alpha: 0, zoom: 1, drift: 0 };
    if (f < s4.from) {
      const k = pull(f);
      return {
        alpha:
          range(f, s3.from + 10, s3.from + 60) *
          (1 - range(f, revealAt, revealAt + 20)),
        zoom: lerp(1.8, 1, k),
        drift: (f - s3.from) * 0.1,
      };
    }
    if (f < s5.from)
      return {
        alpha: 0.55 * range(f, s4.from + 6, s4.from + 30),
        zoom: 1,
        drift: (f - s4.from) * 0.12,
      };
    if (f < s6.from - 60) return { alpha: 0, zoom: 1, drift: 0 };
    return {
      alpha: range(f, s6.from - 60, s6.from + 10),
      zoom: 1,
      drift: (f - s6.from) * 0.18 + 200,
    };
  };
  return {
    segments: segs,
    globes,
    stars,
    rise,
    impact,
    earthView,
    spinAt,
    dropStart,
    treeAt,
    riseFrom,
  };
};

export const PlanCtx = createContext<Plan | null>(null);
export const usePlan = () => {
  const p = useContext(PlanCtx);
  if (!p) throw new Error("PlanCtx не задан");
  return p;
};
