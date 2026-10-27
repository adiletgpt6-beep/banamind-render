// Звук ролика: голос диктора, очень тихая тёплая музыка проекта (общий
// файл public/audio/music-story-warm.mp3, read-only) с приглушением под
// речью и сдержанные эффекты из общих файлов проекта: взмах на делении
// «1 САПАР», дверь/щелчок ремня, мягкий звук машины, школьный звонок,
// колокольчик на замыкании петли и на «1», финальный колокольчик.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { AF } from "./scenes/Afternoon";
import { HK } from "./scenes/Hook";
import { MG } from "./scenes/Merge";
import { MO } from "./scenes/Morning";
import { BG22_VIDEO } from "./script";
import { sceneOf, type Bg22Timeline } from "./timing";

const FPS = BG22_VIDEO.fps;
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

export const Bg22Audio: React.FC<{ readonly tl: Bg22Timeline }> = ({ tl }) => {
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
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const out: Sfx[] = [];
    const h = at("hook");
    out.push({ at: h + 2, src: "audio/sfx-pop.mp3", volume: 0.3 });
    out.push({ at: h + HK.split, src: "audio/sfx-whoosh.mp3", volume: 0.22 });
    out.push({
      at: h + HK.ring1 - 4,
      src: "audio/sfx-chime.mp3",
      volume: 0.12,
    });
    const m = at("morning");
    out.push({ at: m + 84, src: "audio/sfx-tap.mp3", volume: 0.3 });
    out.push({ at: m + 132, src: "audio/sfx-tap.mp3", volume: 0.35 });
    out.push({ at: m + MO.beltClick, src: "audio/sfx-tap.mp3", volume: 0.55 });
    out.push({ at: m + MO.drive0, src: "audio/sfx-car.mp3", volume: 0.1 });
    out.push({ at: m + MO.drive1, src: "audio/sfx-pop.mp3", volume: 0.25 });
    const a = at("afternoon");
    out.push({ at: a + 76, src: "audio/sfx-bell.mp3", volume: 0.1 });
    out.push({ at: a + AF.drive0, src: "audio/sfx-car.mp3", volume: 0.1 });
    out.push({ at: a + AF.drive1, src: "audio/sfx-chime.mp3", volume: 0.16 });
    out.push({ at: a + AF.door0, src: "audio/sfx-tap.mp3", volume: 0.3 });
    const g = at("merge");
    out.push({ at: g + MG.fold0, src: "audio/sfx-whoosh.mp3", volume: 0.2 });
    out.push({ at: g + MG.one, src: "audio/sfx-chime.mp3", volume: 0.2 });
    const p = at("price");
    out.push({ at: p + 22, src: "audio/sfx-paper.mp3", volume: 0.15 });
    const ct = at("cta");
    out.push({ at: ct, src: "audio/sfx-whoosh.mp3", volume: 0.2 });
    out.push({ at: ct + 16, src: "audio/sfx-chime.mp3", volume: 0.22 });
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
              src={staticFile(`${BG22_VIDEO.voiceDir}/${c.file}`)}
              volume={1}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
