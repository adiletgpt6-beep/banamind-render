// Звук: оригинальный голос (обработанный, npm run live:prepare) теми же
// кусками, что и видео; очень тихая музыка проекта с приглушением под
// речью; редкие деликатные эффекты только на ключевую графику.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { GESTURE, LIVE_FILES, LIVE_FRAMES, outFrame, SEGMENT_STARTS, SEGMENTS, SPEECH } from "./edit";
import { clamp } from "./motion";

// Музыка — собственный трек проекта (scripts/generate-music.mjs), без
// вокала. Под голосом ≈ −26 dB относительно речи, в конце чуть громче.
const MUSIC = "audio/music.mp3";
const MUSIC_START = 10; // конец трека (с его затуханием) совпадает с концом ролика
const MUSIC_UNDER_VOICE = 0.075;
const MUSIC_TAIL = 0.17;

type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly len?: number };

const SFX: readonly Sfx[] = [
  { src: "audio/sfx-pop.mp3", at: outFrame(SPEECH.bishkek) - 1, volume: 0.22 },
  { src: "audio/sfx-whoosh.mp3", at: outFrame(SPEECH.jany) - 4, volume: 0.16 },
  { src: "audio/sfx-pop.mp3", at: outFrame(SPEECH.kyzykpy), volume: 0.18 },
  { src: "audio/sfx-tap.mp3", at: outFrame(SPEECH.urmattuu) - 1, volume: 0.3 },
  { src: "audio/sfx-tick.mp3", at: outFrame(SPEECH.ubakyt) - 2, volume: 0.9, len: 34 },
  { src: "audio/sfx-pop.mp3", at: outFrame(SPEECH.jumush) - 2, volume: 0.16 },
  { src: "audio/sfx-pop.mp3", at: outFrame(SPEECH.jolugushuu) - 2, volume: 0.16 },
  { src: "audio/sfx-pop.mp3", at: outFrame(SPEECH.bashkaIshter) - 2, volume: 0.16 },
  { src: "audio/sfx-chime.mp3", at: outFrame(SPEECH.balaGo) - 3, volume: 0.13 },
  { src: "audio/sfx-whoosh.mp3", at: outFrame(SPEECH.bizBalanyzdy) - 3, volume: 0.09 },
  { src: "audio/sfx-whoosh.mp3", at: outFrame(SPEECH.mektepke) - 5, volume: 0.07 },
  { src: "audio/sfx-whoosh.mp3", at: outFrame(SPEECH.mekteptenAlyp) - 3, volume: 0.07 },
  { src: "audio/sfx-pop.mp3", at: outFrame(SPEECH.balaGo2) - 3, volume: 0.14 },
  // жест вверх: лёгкий взмах линии + мягкий щелчок карточки
  { src: "audio/sfx-whoosh.mp3", at: outFrame(GESTURE.upStart), volume: 0.08 },
  { src: "audio/sfx-tap.mp3", at: outFrame(GESTURE.upHold) - 1, volume: 0.32 },
  // жест вниз: стрелка + очень мягкий pop карточки WhatsApp
  { src: "audio/sfx-whoosh.mp3", at: outFrame(GESTURE.downStart) - 1, volume: 0.06 },
  { src: "audio/sfx-pop.mp3", at: outFrame(GESTURE.downStart) + 6, volume: 0.13 },
];

// мягкое завершение: звук и картинка гаснут за последние ≈ 0.5 с
export const END_FADE = 15;
const endFade = (g: number) => interpolate(g, [LIVE_FRAMES - END_FADE, LIVE_FRAMES - 1], [1, 0], clamp);

const speechEnd = outFrame(SPEECH.speechEnd);

const musicVolume = (f: number) => {
  // f — кадр внутри музыкальной дорожки
  const g = f + MUSIC_START;
  const level = interpolate(g, [speechEnd, speechEnd + 10], [MUSIC_UNDER_VOICE, MUSIC_TAIL], clamp);
  return level * interpolate(f, [0, 8], [0, 1], clamp) * endFade(g);
};

export const LiveAudio: React.FC = () => (
  <>
    {SEGMENTS.map((s, i) => {
      const len = s.to - s.from;
      return (
        <Sequence key={s.from} from={SEGMENT_STARTS[i]} durationInFrames={len} name={`Голос ${i + 1}`}>
          <Audio
            src={staticFile(LIVE_FILES.voice)}
            trimBefore={s.from}
            // микро-фейд на стыках (стыки — в паузах, щелчков нет)
            volume={(f) =>
              interpolate(f, [0, 1.5, len - 1.5, len], [0, 1, 1, 0], clamp) * endFade(SEGMENT_STARTS[i] + f)
            }
          />
        </Sequence>
      );
    })}
    <Sequence from={MUSIC_START} durationInFrames={LIVE_FRAMES - MUSIC_START} name="Музыка">
      <Audio src={staticFile(MUSIC)} volume={musicVolume} />
    </Sequence>
    {SFX.map((x) => (
      <Sequence key={`${x.src}-${x.at}`} from={x.at} durationInFrames={x.len ?? 45} name="Эффект">
        <Audio
          src={staticFile(x.src)}
          volume={(f) => x.volume * interpolate(f, [(x.len ?? 45) - 6, x.len ?? 45], [1, 0], clamp)}
        />
      </Sequence>
    ))}
  </>
);
