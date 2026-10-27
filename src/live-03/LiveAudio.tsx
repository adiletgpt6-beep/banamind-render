// Звук BalaGoLive03: оригинальный голос Адилета (обработан в
// live03-prepare, без TTS и без смены высоты) теми же кусками, что и
// видео, с J-cut там, где речь начинается у самой склейки; спокойная
// музыка проекта (собственные синтезированные слои scripts/generate-music.mjs,
// без вокала) с приглушением под речью; тихие короткие эффекты на
// движения графики. Итоговая громкость (≈ −15 LUFS, ≤ −1 dBTP)
// выставляется мастерингом после рендера (scripts/live03-master.mjs).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { F, GESTURE, LIVE3_FILES, LIVE3_FRAMES, LIVE_END, SEGMENT_STARTS, SEGMENTS, SPEECH } from "./edit";
import { clamp } from "./motion";

// Фразы (секунды исходника) — для приглушения музыки под голосом.
const LINES: readonly (readonly [number, number])[] = [
  [0.3, 4.03],
  [6.29, 8.81],
  [9.3, 10.63],
  [11.02, 13.03],
  [14.41, 15.69],
  [16.95, 18.61],
  [20.29, 22.48],
  [23.17, 28.04],
  [29.35, 31.67],
  [32.63, 37.0],
  [37.83, 40.4],
  [41.05, 43.91],
  [44.27, 45.38],
];
const SPEECH_FRAMES = LINES.map(([a, b]) => [F(a), F(b)] as const);

// 1 — идёт речь, 0 — пауза; плавные края (атака 4 кадра, отпускание 10)
const speechAmount = (g: number) => {
  let m = 0;
  for (const [a, b] of SPEECH_FRAMES) {
    m = Math.max(m, interpolate(g, [a - 4, a, b, b + 10], [0, 1, 1, 0], clamp));
  }
  return m;
};

// Слои музыки ≈ −19 LUFS, голос ≈ −12 LUFS: под речью музыка ≈ на 20 dB
// тише голоса, в паузах и на концовке — заметнее.
const UNDER_VOICE = 0.2;
const IN_PAUSE = 0.34;
const END_LEVEL = 0.5;
const END_FADE = 24;

const T_BRAND = F(SPEECH.balaGo);

const musicLevel = (g: number) => {
  const base = interpolate(speechAmount(g), [0, 1], [IN_PAUSE, UNDER_VOICE]);
  const tail = interpolate(g, [LIVE_END - 10, LIVE_END + 4], [0, 1], clamp);
  const fadeIn = interpolate(g, [0, 12], [0.4, 1], clamp);
  const fadeOut = interpolate(g, [LIVE3_FRAMES - END_FADE, LIVE3_FRAMES - 1], [1, 0], clamp);
  return (base + (END_LEVEL - base) * tail) * fadeIn * fadeOut;
};

// Слои одной мелодии: пэд — весь ролик; лёгкий ритм — проблемная часть
// (уходит с появлением BalaGo); тёплое раскрытие — с BalaGo до конца.
const pad = (g: number) => musicLevel(g);
const rhythm = (g: number) => musicLevel(g) * 0.75 * interpolate(g, [T_BRAND - 20, T_BRAND + 10], [1, 0], clamp);
const warm = (g: number) => musicLevel(g) * interpolate(g, [T_BRAND - 6, T_BRAND + 24], [0, 0.9], clamp);

type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly len?: number };

const SFX: readonly Sfx[] = [
  // 15:00 и часы
  { src: "audio/sfx-pop.mp3", at: F(SPEECH.saat), volume: 0.16 },
  { src: "audio/sfx-tick.mp3", at: F(SPEECH.saat) + 4, volume: 0.35, len: 22 },
  { src: "audio/sfx-tap.mp3", at: F(SPEECH.sabagy), volume: 0.22 },
  { src: "audio/sfx-whoosh.mp3", at: F(SPEECH.sizdin) + 2, volume: 0.06 },
  { src: "audio/sfx-pop.mp3", at: F(3.55), volume: 0.12 },
  // календарь
  { src: "audio/sfx-paper.mp3", at: F(SPEECH.jolugushuu), volume: 0.12 },
  { src: "audio/sfx-paper.mp3", at: F(SPEECH.jumushunuz), volume: 0.12 },
  { src: "audio/sfx-paper.mp3", at: F(SPEECH.bashka), volume: 0.12 },
  { src: "audio/sfx-tick.mp3", at: F(SPEECH.ubakyt), volume: 0.3, len: 24 },
  { src: "audio/sfx-tap.mp3", at: F(SPEECH.toktotosuz), volume: 0.26 },
  // линия времени → маршрут
  { src: "audio/sfx-whoosh.mp3", at: F(GESTURE.turn) + 2, volume: 0.07 },
  // перелистывание дней
  ...[0, 1, 2, 3].map((k) => ({ src: "audio/sfx-paper.mp3", at: F(SPEECH.kunSayin) + k * 7, volume: 0.08, len: 12 })),
  // BalaGo
  { src: "audio/sfx-chime.mp3", at: F(SPEECH.balaGo) - 3, volume: 0.1 },
  // ҮЙ → МЕКТЕП → ҮЙ
  { src: "audio/sfx-whoosh.mp3", at: F(33.5) - 2, volume: 0.07 },
  { src: "audio/sfx-pop.mp3", at: F(34.1), volume: 0.12 },
  { src: "audio/sfx-pop.mp3", at: F(SPEECH.jagyn), volume: 0.12 },
  // жест вверх: взмах световой линии + мягкий клик плашки
  { src: "audio/sfx-whoosh.mp3", at: F(GESTURE.upRaise), volume: 0.06 },
  { src: "audio/sfx-tap.mp3", at: F(GESTURE.upHold) + 1, volume: 0.28 },
  // жест вниз: след + лёгкий акцент карточки WhatsApp
  { src: "audio/sfx-whoosh.mp3", at: F(GESTURE.downStart) - 1, volume: 0.05 },
  { src: "audio/sfx-pop.mp3", at: F(GESTURE.downStart) + 5, volume: 0.12 },
  // концовка
  { src: "audio/sfx-chime.mp3", at: LIVE_END - 6, volume: 0.08 },
];

export const LiveAudio: React.FC = () => (
  <>
    {SEGMENTS.map((s, i) => {
      const lead = s.lead ?? 0;
      const len = s.to - s.from + lead;
      return (
        <Sequence key={s.from} from={SEGMENT_STARTS[i] - lead} durationInFrames={len} name={`Голос ${i + 1}`}>
          <Audio
            src={staticFile(LIVE3_FILES.voice)}
            trimBefore={s.from - lead}
            // микро-фейды на стыках (стыки — в паузах, щелчков нет)
            volume={(f) => interpolate(f, [0, 1.5, len - 1.5, len], [0, 1, 1, 0], clamp)}
          />
        </Sequence>
      );
    })}
    <Sequence durationInFrames={LIVE3_FRAMES} name="Музыка: пэд">
      <Audio src={staticFile("audio/music-founder-pad.mp3")} volume={pad} />
    </Sequence>
    <Sequence durationInFrames={LIVE3_FRAMES} name="Музыка: ритм">
      <Audio src={staticFile("audio/music-founder-rhythm.mp3")} volume={rhythm} />
    </Sequence>
    <Sequence durationInFrames={LIVE3_FRAMES} name="Музыка: тепло">
      <Audio src={staticFile("audio/music-founder-warm.mp3")} volume={warm} />
    </Sequence>
    {SFX.map((x) => (
      <Sequence key={`${x.src}-${x.at}`} from={x.at} durationInFrames={x.len ?? 40} name="Эффект">
        <Audio src={staticFile(x.src)} volume={(f) => x.volume * interpolate(f, [(x.len ?? 40) - 5, x.len ?? 40], [1, 0], clamp)} />
      </Sequence>
    ))}
  </>
);
