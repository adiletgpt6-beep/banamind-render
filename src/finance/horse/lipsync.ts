// Рот по фактической речи: тайминги букв из ElevenLabs (alignment) →
// раскрытие и округлость рта в каждом кадре. Гласные открывают рот,
// m/b/p закрывают, o/u/w округляют. Между словами и в паузах рот закрыт.
// Значения сглаживаются по соседним кадрам, чтобы не было дрожи.
import type { TimedLine } from "../timeline";

const OPEN: Record<string, number> = {
  a: 0.95, o: 0.8, e: 0.6, i: 0.45, u: 0.5, y: 0.45,
  h: 0.35, r: 0.3, l: 0.35, w: 0.3, d: 0.3, t: 0.28, n: 0.25, s: 0.2, z: 0.2,
  c: 0.25, k: 0.3, g: 0.3, j: 0.3, q: 0.3, x: 0.25,
  f: 0.12, v: 0.12, m: 0, b: 0, p: 0,
  // русские буквы
  а: 0.95, о: 0.8, э: 0.65, е: 0.6, ё: 0.75, я: 0.85, ы: 0.45, и: 0.45, у: 0.5, ю: 0.5,
  л: 0.35, р: 0.3, н: 0.25, т: 0.28, д: 0.3, с: 0.2, з: 0.2, ш: 0.25, щ: 0.25, ж: 0.25, ч: 0.25, ц: 0.2,
  к: 0.3, г: 0.3, х: 0.35, й: 0.3, в: 0.12, ф: 0.12, м: 0, б: 0, п: 0, ь: 0.2, ъ: 0.2,
};
const ROUND: Record<string, number> = { o: 0.9, u: 1, w: 1, q: 0.6, r: 0.3, о: 0.9, у: 1, ю: 0.9, ё: 0.8, ш: 0.4, щ: 0.4, ж: 0.4 };

const sample = (lines: TimedLine[], t: number) => {
  for (const ln of lines) {
    if (t < ln.speechFrom - 0.05 || t > ln.speechTo + 0.05) continue;
    if (ln.chars.length) {
      for (const c of ln.chars) {
        if (t >= c.start && t < c.end) return { open: OPEN[c.c] ?? 0.3, round: ROUND[c.c] ?? 0, talk: 1 };
      }
      return { open: 0, round: 0, talk: 0.6 };
    }
    // черновой режим без таймингов букв: ритм по словам
    for (const w of ln.words) {
      if (t >= w.start && t < w.end) {
        const ph = (t - w.start) / Math.max(0.08, w.end - w.start);
        return { open: 0.25 + 0.55 * Math.sin(ph * Math.PI * Math.max(1, Math.round(w.text.length / 3))) ** 2, round: 0.2, talk: 1 };
      }
    }
    return { open: 0, round: 0, talk: 0.6 };
  }
  return { open: 0, round: 0, talk: 0 };
};

export const mouthAt = (lines: TimedLine[], frame: number, fps: number) => {
  const t = frame / fps;
  // усреднение по трём точкам внутри кадра и соседям — мягкая артикуляция
  const pts = [-1.5, -0.75, 0, 0.75].map((d) => sample(lines, t + d / fps / 1.5));
  const open = pts.reduce((a, p) => a + p.open, 0) / pts.length;
  const round = pts.reduce((a, p) => a + p.round, 0) / pts.length;
  // активность речи — сглаженно за ~0.5 с, для жестов
  let talk = 0;
  for (let k = -7; k <= 7; k++) talk += sample(lines, t + k / fps).talk;
  return { open: Math.min(1, open * 1.35), round, speaking: talk / 15 };
};
