// Звук ролика: голоса (диктор и мама), тихая тёплая музыка проекта
// (общий файл public/audio/music-story-warm.mp3, только чтение) с
// приглушением под речью и несколько сдержанных эффектов из общих файлов
// проекта, привязанных к фактическим словам озвучки: щелчки на первом,
// десятом и двадцатом жетоне (не 20 щелчков подряд), колокольчик на «эки»
// (+2), мягкий взмах на перевороте бонусного жетона, колокольчик финала.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { BG35_VIDEO, BG35_WORDS } from "./script";
import { fillTokenLands } from "./scenes/Fill";
import { sceneOf, type Bg35Timeline } from "./timing";

const FPS = BG35_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
// Музыка тихая, но слышна в паузах между фразами (иначе на телефоне паузы
// звучат как обрыв звука); под речью приглушается на ≈ 24 LU ниже голоса.
const MUSIC_VOLUME = 0.27;
const MUSIC_UNDER_VOICE = 0.075;

type Sfx = {
  readonly at: number;
  readonly src: string;
  readonly volume: number;
};

export const Bg35Audio: React.FC<{ readonly tl: Bg35Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const spans: [number, number][] = [];
  for (const c of tl.cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans)
      v = Math.min(
        v,
        interpolate(
          f,
          [a - 12, a, b, b + 18],
          [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME],
          clamp,
        ),
      );
    return (
      v *
      interpolate(
        f,
        [0, 0.8 * FPS, total - 2.4 * FPS, total - 2],
        [0, 1, 1, 0],
        clamp,
      )
    );
  };
  const sfx = useMemo(() => {
    const word = (id: string, i: number) => {
      const c = tl.cues.find((x) => x.id === id);
      if (!c) return -1;
      const w = c.words[Math.min(i, c.words.length - 1)];
      return s(w ? w.start : c.from);
    };
    const out: Sfx[] = [];
    const h = sceneOf(tl, "hook").from;
    out.push({ at: h + 4, src: "audio/sfx-pop.mp3", volume: 0.28 });
    const a = sceneOf(tl, "ask").from;
    out.push({ at: a + 2, src: "audio/sfx-whoosh.mp3", volume: 0.16 });
    // жетоны: 1-я, 10-я и 20-я посадки в гнёзда — те же кадры, что в сцене fill
    const n02 = tl.cues.find((x) => x.id === "n02");
    if (n02) {
      const lands = fillTokenLands(word("n02", BG35_WORDS.n02.firstTwenty), s(n02.to));
      out.push({ at: lands[0], src: "audio/sfx-tap.mp3", volume: 0.3 });
      out.push({ at: lands[9], src: "audio/sfx-tap.mp3", volume: 0.3 });
      out.push({ at: lands[19], src: "audio/sfx-tap.mp3", volume: 0.34 });
    }
    out.push({ at: word("n03", BG35_WORDS.n03.two), src: "audio/sfx-chime.mp3", volume: 0.2 });
    out.push({ at: word("n04", BG35_WORDS.n04.after) - 4, src: "audio/sfx-whoosh.mp3", volume: 0.18 });
    out.push({ at: word("n05", BG35_WORDS.n05.trial), src: "audio/sfx-pop.mp3", volume: 0.22 });
    const ct = sceneOf(tl, "cta").from;
    out.push({ at: ct + 2, src: "audio/sfx-whoosh.mp3", volume: 0.18 });
    out.push({ at: ct + 24, src: "audio/sfx-chime.mp3", volume: 0.22 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);
  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={(f) => duck(f)} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence
          key={`sfx-${i}`}
          name={`Эффект: ${x.src}`}
          from={x.at}
          premountFor={FPS}
        >
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence
            key={c.id}
            name={`Голос: ${c.id} (${c.role})`}
            from={s(c.audioFrom)}
            durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
            premountFor={FPS}
          >
            <Audio
              src={staticFile(`${BG35_VIDEO.voiceDir}/${c.file}`)}
              // мягкое затухание в последние 2 кадра файла (после речи)
              volume={(f) =>
                interpolate(
                  f,
                  [Math.round(c.durationSec * FPS) - 2, Math.round(c.durationSec * FPS)],
                  [1, 0],
                  clamp,
                )
              }
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
