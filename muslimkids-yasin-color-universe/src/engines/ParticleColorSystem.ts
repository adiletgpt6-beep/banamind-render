// Библиотека палитр и градиентов. Цвет точки = градиент + параметр u (0..1).
// Сдвиг u во времени даёт мягкий перелив (shimmer) без мерцания: треугольная
// развёртка (0→1→0) убирает «шов» при зацикливании.

export const PALETTE = {
  cyan: "#00E5FF",
  pink: "#FF2D9A",
  yellow: "#FFD600",
  green: "#39F77D",
  orange: "#FF8A00",
  purple: "#A855F7",
  blue: "#238BFF",
  coral: "#FF586B",
  turquoise: "#00E5C3",
  lime: "#BBFF33",
  // производные оттенки той же насыщенности
  gold: "#FFB800",
  lilac: "#C77DFF",
  magenta: "#E040FB",
  emerald: "#00D17A",
  brown: "#D2691E",
  amber: "#FFA62B",
  sky: "#5CC8FF",
} as const;
const P = PALETTE;

export const GRADIENTS: Record<string, string[]> = {
  rainbow: [P.cyan, P.blue, P.purple, P.pink, P.coral, P.orange, P.yellow, P.lime, P.green, P.turquoise],
  question: [P.pink, P.purple, P.blue, P.cyan, P.turquoise, P.green, P.yellow],
  questionNight: [P.cyan, P.blue, P.pink, P.yellow],
  seeds: [P.turquoise, P.pink, P.yellow, P.green, P.purple],
  // светлый фон: без жёлтого/лаймового (низкий контраст на белом)
  num36: [P.pink, P.coral, P.orange, P.magenta, P.purple],
  num83: [P.turquoise, P.cyan, P.blue, P.purple, P.magenta, P.pink],
  gridRainbow: [P.pink, P.coral, P.orange, P.gold, P.green, P.turquoise, P.cyan, P.blue, P.purple, P.magenta],
  bookLight: [P.blue, P.purple, P.pink, P.coral],
  bookDark: [P.purple, P.blue, P.cyan, P.turquoise, P.green, P.gold],
  heart: [P.pink, P.coral, P.magenta, P.purple],
  steps: [P.orange, P.coral, P.pink, P.purple],
  ground: [P.brown, P.orange, P.amber, P.gold, P.coral],
  groundGreen: [P.emerald, P.green, P.lime, P.turquoise],
  rain: [P.cyan, P.sky, P.blue, P.turquoise],
  leaves: [P.lime, P.green, P.emerald, P.turquoise, P.cyan],
  trunk: [P.brown, P.orange, P.amber],
  grain: [P.gold, P.yellow, P.amber, P.orange],
  dates: [P.orange, P.coral, P.amber],
  grapes: [P.purple, P.magenta, P.pink, P.lilac, P.coral],
  sun: [P.yellow, P.gold, P.orange, P.coral, P.yellow],
  sunset: [P.yellow, P.pink, P.purple, P.blue],
  moon: [P.cyan, P.sky, P.purple, P.lilac, P.pink],
  stars: [P.blue, P.cyan, P.purple, P.pink, P.lilac],
  earth: [P.blue, P.cyan, P.turquoise, P.sky],
  land: [P.green, P.lime, P.emerald, P.turquoise],
  orbitCore: [P.cyan, P.blue, P.sky, P.turquoise],
  ring1: [P.cyan, P.purple],
  ring2: [P.pink, P.purple, P.blue],
  ring3: [P.yellow, P.orange, P.pink],
  hand: [P.orange, P.amber, P.coral],
  check: [P.turquoise, P.blue, P.cyan],
  ribbonA: [P.cyan, P.blue, P.purple, P.pink],
  ribbonB: [P.yellow, P.orange, P.coral, P.pink],
  ribbonC: [P.green, P.turquoise, P.cyan, P.blue],
  printA: [P.pink, P.magenta],
  printB: [P.orange, P.coral],
  printC: [P.purple, P.blue],
  printD: [P.turquoise, P.blue],
  printE: [P.coral, P.pink],
  printF: [P.blue, P.purple],
};

const hexToRgb = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const LUT_SIZE = 256;
export const GRADIENT_NAMES = Object.keys(GRADIENTS);
const LUTS: Float32Array[] = GRADIENT_NAMES.map((name) => {
  const stops = GRADIENTS[name].map(hexToRgb);
  const lut = new Float32Array(LUT_SIZE * 3);
  for (let i = 0; i < LUT_SIZE; i++) {
    const p = (i / (LUT_SIZE - 1)) * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(p));
    const f = stops.length === 1 ? 0 : p - k;
    const a = stops[k];
    const b = stops[Math.min(stops.length - 1, k + 1)];
    // смешивание в линейном пространстве — переходы между точками без «грязи»
    for (let c = 0; c < 3; c++) {
      const la = Math.pow(a[c] / 255, 2.2);
      const lb = Math.pow(b[c] / 255, 2.2);
      lut[i * 3 + c] = Math.pow(la + (lb - la) * f, 1 / 2.2) * 255;
    }
  }
  return lut;
});

export const gradIndex = (name: string) => {
  const i = GRADIENT_NAMES.indexOf(name);
  if (i < 0) throw new Error(`Unknown gradient ${name}`);
  return i;
};

/** Цвет градиента g в точке u (с треугольной развёрткой), запись в out[o..o+2]. */
export const sampleGradient = (g: number, u: number, out: Float32Array, o: number) => {
  let v = u - Math.floor(u / 2) * 2;
  if (v > 1) v = 2 - v;
  const idx = Math.round(v * (LUT_SIZE - 1)) * 3;
  const lut = LUTS[g];
  out[o] = lut[idx];
  out[o + 1] = lut[idx + 1];
  out[o + 2] = lut[idx + 2];
};
