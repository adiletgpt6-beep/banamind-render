// Звук: голоса реплик, очень тихая тёплая музыка (приглушается под речью),
// редкие негромкие звуки чата.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { sfxOf } from "./beats";
import { FPS, useTimeline } from "./context";
import { BG18_VIDEO } from "./script";
import { clamp } from "./ui";

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.11;
const MUSIC_UNDER_VOICE = 0.04;

export const Bg18Audio: React.FC = () => {
  const tl = useTimeline();
  const s = (sec: number) => Math.round(sec * FPS);
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const music = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, FPS, tl.frames - 2.5 * FPS, tl.frames - 2], [0, 1, 1, 0], clamp);
  };
  const sceneFrom = (id: string) => s(tl.scenes.find((x) => x.id === id)!.from);
  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={tl.frames}>
        <Audio src={staticFile(MUSIC)} volume={music} />
      </Sequence>
      {sfxOf(tl).map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={sceneFrom(x.scene) + x.at} durationInFrames={x.dur ? s(x.dur) : undefined} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG18_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
