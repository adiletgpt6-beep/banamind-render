// Звук ролика: голос диктора, очень тихая тёплая музыка проекта (общий
// файл public/audio/music-story-warm.mp3, read-only) с приглушением под
// речью и сдержанные эффекты из общих файлов проекта: шорох бумаги
// билетов, переворот плитки и билета, мягкий звук машины, щелчок
// компостера, десять тихих ударов штампа, колокольчик на итогах и финале.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { BG34_VIDEO } from "./script";
import type { Bg34SceneId } from "./script";
import { sceneOf, type Bg34Timeline } from "./timing";

const FPS = BG34_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.16;
const MUSIC_UNDER_VOICE = 0.055;

type Sfx = {
  readonly at: number;
  readonly src: string;
  readonly volume: number;
};

export const Bg34Audio: React.FC<{ readonly tl: Bg34Timeline }> = ({ tl }) => {
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
    const at = (id: Bg34SceneId) => sceneOf(tl, id).from;
    // начало слова i реплики id (кадр ролика)
    const word = (id: string, i: number) => {
      const c = tl.cues.find((x) => x.id === id);
      if (!c) return 0;
      const w = c.words[Math.min(i, c.words.length - 1)];
      return s(w ? w.start : c.from);
    };
    const out: Sfx[] = [];
    // 1. хук: билеты разлетаются, плитка «10» переворачивается в «?»
    const h = at("hook");
    [4, 12, 22].forEach((k) =>
      out.push({ at: h + k, src: "audio/sfx-paper.mp3", volume: 0.16 }),
    );
    out.push({ at: h + 6, src: "audio/sfx-pop.mp3", volume: 0.22 });
    const flip = h + Math.min(Math.max(34, word("n01", 4) - h - 6), 60);
    out.push({ at: flip, src: "audio/sfx-whoosh.mp3", volume: 0.18 });
    // 2. билет: клапан, машина туда, переворот, машина обратно, компостер
    const t = at("ticket");
    out.push({ at: t + 12, src: "audio/sfx-paper.mp3", volume: 0.2 });
    out.push({ at: word("n02", 6), src: "audio/sfx-car.mp3", volume: 0.07 });
    out.push({
      at: word("n02", 9) - 2,
      src: "audio/sfx-whoosh.mp3",
      volume: 0.16,
    });
    out.push({
      at: word("n02", 10) + 6,
      src: "audio/sfx-car.mp3",
      volume: 0.07,
    });
    out.push({
      at: word("n02", 15) - 2,
      src: "audio/sfx-tap.mp3",
      volume: 0.5,
    });
    out.push({
      at: word("n02", 16) + 6,
      src: "audio/sfx-chime.mp3",
      volume: 0.12,
    });
    // 3. десять ударов штампа (тот же ритм, что в Ten.tsx), бонус, лента
    const w3 = word("n03", 3);
    const interval = Math.min(9, Math.max(5, (word("n03", 10) - w3) / 10));
    for (let i = 0; i < 10; i++)
      out.push({
        at: Math.round(w3 + 4 + i * interval),
        src: "audio/sfx-tap.mp3",
        volume: 0.26,
      });
    out.push({
      at: word("n03", 11) - 4,
      src: "audio/sfx-chime.mp3",
      volume: 0.14,
    });
    out.push({ at: word("n04", 2) - 2, src: "audio/sfx-pop.mp3", volume: 0.2 });
    out.push({ at: word("n05", 0), src: "audio/sfx-whoosh.mp3", volume: 0.12 });
    out.push({ at: word("n05", 4), src: "audio/sfx-paper.mp3", volume: 0.2 });
    // 4. метки на карте, лента, проверка адреса
    out.push({
      at: word("n06", 6) - 3,
      src: "audio/sfx-pop.mp3",
      volume: 0.22,
    });
    out.push({
      at: word("n06", 7) - 3,
      src: "audio/sfx-pop.mp3",
      volume: 0.22,
    });
    out.push({ at: word("n06", 8), src: "audio/sfx-whoosh.mp3", volume: 0.1 });
    out.push({ at: word("n07", 3), src: "audio/sfx-chime.mp3", volume: 0.12 });
    // 5. шаги, плашка поднимается после решения
    const o = at("order");
    out.push({ at: o + 12, src: "audio/sfx-tap.mp3", volume: 0.2 });
    [
      word("n08", 0),
      word("n08", 2),
      word("n09", 0),
      word("n09", 4),
      word("n09", 6),
    ].forEach((x) =>
      out.push({ at: x - 3, src: "audio/sfx-pop.mp3", volume: 0.16 }),
    );
    out.push({ at: word("n09", 3), src: "audio/sfx-whoosh.mp3", volume: 0.14 });
    // 6. финал
    const ct = at("cta");
    out.push({ at: ct, src: "audio/sfx-whoosh.mp3", volume: 0.18 });
    out.push({ at: ct + 18, src: "audio/sfx-chime.mp3", volume: 0.2 });
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
              src={staticFile(`${BG34_VIDEO.voiceDir}/${c.file}`)}
              volume={1}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
