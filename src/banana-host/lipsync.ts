// Рот банана по фактической речи. Если у реплики есть тайминги букв
// (ElevenLabs), форма рта берётся по буквам: гласные открывают, м/б/п
// закрывают, о/у округляют. Иначе — по громкости озвучки в каждом кадре.
// Значения сглаживаются по соседним кадрам, чтобы рот не дрожал.
// Реплика на тайм-лайне фильма (секунды от начала ролика). Любой фильм серии
// передаёт свои реплики в этом виде; лишние поля не мешают.
export type SpeechLine = {
  from: number; // начало аудиофайла реплики
  speechFrom: number;
  speechTo: number;
  words: { text: string; start: number; end: number }[];
  chars: { c: string; start: number; end: number }[]; // тайминги букв (ElevenLabs), если есть
  env: number[]; // громкость по кадрам 30 fps, если нет букв
};

const OPEN: Record<string, number> = {
  а: 0.95, о: 0.8, э: 0.65, е: 0.6, ё: 0.75, я: 0.85, ы: 0.45, и: 0.45, у: 0.5, ю: 0.5,
  л: 0.35, р: 0.3, н: 0.25, т: 0.28, д: 0.3, с: 0.2, з: 0.2, ш: 0.25, щ: 0.25, ж: 0.25, ч: 0.25, ц: 0.2,
  к: 0.3, г: 0.3, х: 0.35, й: 0.3, в: 0.12, ф: 0.12, м: 0, б: 0, п: 0, ь: 0.2, ъ: 0.2,
};
const ROUND: Record<string, number> = { о: 0.9, у: 1, ю: 0.9, ё: 0.8, ш: 0.4, щ: 0.4, ж: 0.4 };

const findLine = (lines: SpeechLine[], t: number) => {
  // бинарный поиск по началу файла
  let lo = 0;
  let hi = lines.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lines[mid].from <= t) lo = mid;
    else hi = mid - 1;
  }
  return lines[lo];
};

const sample = (lines: SpeechLine[], t: number) => {
  const ln = findLine(lines, t);
  if (!ln || t < ln.speechFrom - 0.04 || t > ln.speechTo + 0.04) return { open: 0, round: 0, talk: 0 };
  if (ln.chars.length) {
    for (const c of ln.chars) {
      if (t >= c.start && t < c.end) return { open: OPEN[c.c] ?? 0.3, round: ROUND[c.c] ?? 0, talk: 1 };
    }
    return { open: 0, round: 0, talk: 0.6 };
  }
  if (ln.env.length) {
    const k = Math.floor((t - ln.from) * 30);
    const v = ln.env[k] ?? 0;
    return { open: Math.min(1, v * 1.25), round: (k % 7) / 10, talk: v > 0.08 ? 1 : 0.5 };
  }
  // черновик без озвучки: ритм по словам
  for (const w of ln.words) {
    if (t >= w.start && t < w.end) {
      const ph = (t - w.start) / Math.max(0.08, w.end - w.start);
      return { open: 0.25 + 0.55 * Math.sin(ph * Math.PI * Math.max(1, Math.round(w.text.length / 3))) ** 2, round: 0.2, talk: 1 };
    }
  }
  return { open: 0, round: 0, talk: 0.6 };
};

export const mouthAt = (lines: SpeechLine[], frame: number, fps: number) => {
  const t = frame / fps;
  const pts = [-1, -0.5, 0, 0.5].map((d) => sample(lines, t + d / fps));
  const open = pts.reduce((a, p) => a + p.open, 0) / pts.length;
  const round = pts.reduce((a, p) => a + p.round, 0) / pts.length;
  let talk = 0;
  for (let k = -6; k <= 6; k += 2) talk += sample(lines, t + k / fps).talk;
  return { open: Math.min(1, open * 1.3), round, speaking: talk / 7 };
};
