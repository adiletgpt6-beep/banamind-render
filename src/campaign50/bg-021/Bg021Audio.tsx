// Звук BalaGoBG021: голос диктора, очень тихая общая музыка проекта
// (приглушается под речью) и несколько мягких эффектов в ключевых точках.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { BG021_VIDEO } from "./script";
import { cueOf, sceneOf, type Bg021Timeline } from "./timing";

const FPS = BG021_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const f = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.12;
const MUSIC_UNDER_VOICE = 0.045;

export const Bg021Audio: React.FC<{ readonly tl: Bg021Timeline }> = ({ tl }) => {
  const total = tl.totalFrames;
  const spans = tl.cues.map((c) => [f(c.from), f(c.to)] as const);
  const music = (fr: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(fr, [a - 10, a, b, b + 15], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(fr, [0, FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const word = (id: string, i: number) => cueOf(tl, id).words[Math.min(i, cueOf(tl, id).words.length - 1)].start;
  // мягкие эффекты: появление точки, нажатие кнопок, финальный аккорд
  const sfx: { src: string; at: number; volume: number }[] = [
    { src: "audio/sfx-pop.mp3", at: 38 / FPS + sceneOf(tl, "hook").from, volume: 0.22 },
    { src: "audio/sfx-tap.mp3", at: word("l2-oneoff", 6), volume: 0.35 },
    { src: "audio/sfx-tap.mp3", at: word("l3-form", 8) - 2 / FPS, volume: 0.35 },
    { src: "audio/sfx-pop.mp3", at: word("l4-group", 0), volume: 0.18 },
    { src: "audio/sfx-chime.mp3", at: word("l5-trial", 4), volume: 0.16 },
    { src: "audio/sfx-whoosh.mp3", at: sceneOf(tl, "cta").from, volume: 0.14 },
  ];
  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={music} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={i} name={`Эффект: ${x.src.split("/").pop()}`} from={f(x.at)} durationInFrames={f(2.5)} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={f(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG021_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
