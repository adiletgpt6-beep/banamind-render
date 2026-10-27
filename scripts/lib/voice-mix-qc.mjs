// Проверка фактического присутствия известных реплик в готовом звуке.
// Общая громкость MP4 не отличает музыку от голоса. Поэтому сравниваем
// исходный файл каждой реплики с соответствующим участком готового MP4.
// Это технический контроль включения, уровня и окончания файла, а не
// проверка кыргызского произношения или естественности интонации.
export const VOICE_QC_RATE = 8000;

export const voiceManifestProblems = (manifest, lines, { kind, hasFile, hashForLine }) => {
  if (!manifest || !Array.isArray(manifest.lines)) return ["нет манифеста озвучки"];
  const problems = [];
  if (manifest.version !== 1 || manifest.kind !== kind) problems.push("неизвестный формат озвучки");
  if (manifest.partial || manifest.estimated) problems.push("озвучка неполная или оценочная");
  for (const line of lines) {
    const matches = manifest.lines.filter(l => l.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1) {
      problems.push(`${line.id}: ${matches.length ? "дублируется" : "нет реплики"}`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст озвучки устарел`);
    if (!ml.file || !hasFile(ml.file)) problems.push(`${line.id}: нет аудиофайла`);
    if (hashForLine && (!hashForLine(line) || ml.hash !== hashForLine(line))) problems.push(`${line.id}: голос или настройки устарели`);
    if (![ml.durationSec, ml.speechStart, ml.speechEnd].every(Number.isFinite)
      || ml.speechStart < 0 || ml.speechEnd <= ml.speechStart
      || ml.speechEnd > ml.durationSec + 0.02) problems.push(`${line.id}: некорректная длительность речи`);
  }
  return problems;
};

const db = x => 10 * Math.log10(Math.max(x, 1e-16));

// Небольшая задержка AAC/ресемплинга допускается, но речь из соседнего
// плана или произвольная музыка за совпадение не принимаются.
export const measureVoiceWindow = (mix, source, { mixAt, start, end, rate = VOICE_QC_RATE, tolerance = 0.06 }) => {
  const first = Math.max(0, Math.round(start * rate));
  const last = Math.min(source.length, Math.round(end * rate));
  const count = last - first;
  if (count < rate * 0.08) throw new Error("слишком короткий участок для проверки речи");
  const offset = Math.round(mixAt * rate);
  const maxLag = Math.round(tolerance * rate);
  const metric = (lag, stride) => {
    let xx = 0;
    let yy = 0;
    let xy = 0;
    let n = 0;
    for (let i = first; i < last; i += stride) {
      const j = offset + i + lag;
      const x = source[i];
      const y = j >= 0 && j < mix.length ? mix[j] : 0;
      xx += x * x;
      yy += y * y;
      xy += x * y;
      n++;
    }
    const gain = xx ? xy / xx : 0;
    const voicePower = gain > 0 ? gain * gain * xx / n : 0;
    const residualPower = Math.max(1e-16, (yy - (xx ? xy * xy / xx : 0)) / n);
    return {
      correlation: xx && yy ? xy / Math.sqrt(xx * yy) : 0,
      gainDb: gain > 0 ? 20 * Math.log10(gain) : -Infinity,
      voiceDb: db(voicePower),
      snrDb: db(voicePower) - db(residualPower),
      sourceDb: db(xx / n),
      lagSec: lag / rate,
    };
  };
  let best = { correlation: -Infinity };
  let bestLag = 0;
  for (let lag = -maxLag; lag <= maxLag; lag += 4) {
    const m = metric(lag, 3);
    if (m.correlation > best.correlation) { best = m; bestLag = lag; }
  }
  const coarseLag = bestLag;
  best = { correlation: -Infinity };
  for (let lag = coarseLag - 4; lag <= coarseLag + 4; lag++) {
    const m = metric(lag, 1);
    if (m.correlation > best.correlation) { best = m; bestLag = lag; }
  }
  return { ...best, lagSamples: bestLag };
};

export const voiceWindowProblems = (m, { ending = false } = {}) => {
  const problems = [];
  if (m.sourceDb < -45) problems.push("исходный файл не содержит слышимого звука");
  if (m.correlation < 0.7 || m.gainDb < -6) problems.push("реплика отсутствует, обрезана или слишком тихая в MP4");
  if (!ending && m.voiceDb < -26) problems.push(`уровень речи слишком низкий (${m.voiceDb.toFixed(1)} дБFS)`);
  if (!ending && m.snrDb < 8) problems.push(`речь заглушена фоном или искажена (${m.snrDb.toFixed(1)} дБ)`);
  return problems;
};

export const inspectVoiceClip = (mix, source, { line, manifestLine: ml, fps, rate = VOICE_QC_RATE }) => {
  const mixAt = Math.round((line.at - ml.speechStart) * fps) / fps;
  const speech = measureVoiceWindow(mix, source, { mixAt, start: ml.speechStart, end: ml.speechEnd, rate });
  // Последние 250 мс фактического звука, а не тишина в конце MP3.
  let lastSound = Math.min(source.length, Math.round((ml.speechEnd + 0.08) * rate));
  const block = Math.round(0.02 * rate);
  const earliest = Math.round(ml.speechStart * rate);
  while (lastSound - block > earliest) {
    let power = 0;
    for (let i = lastSound - block; i < lastSound; i++) power += source[i] * source[i];
    if (db(power / block) > Math.max(-45, speech.sourceDb - 20)) break;
    lastSound -= block;
  }
  const ending = measureVoiceWindow(mix, source, {
    mixAt,
    start: Math.max(ml.speechStart, lastSound / rate - 0.25),
    end: lastSound / rate,
    rate,
  });
  return {
    id: line.id,
    speech,
    ending,
    problems: [
      ...voiceWindowProblems(speech),
      ...voiceWindowProblems(ending, { ending: true }).map(p => `окончание: ${p}`),
    ].map(p => `${line.id}: ${p}`),
  };
};
