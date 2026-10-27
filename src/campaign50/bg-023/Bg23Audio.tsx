import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Bg23Timeline } from "./script";
import { BG23_VIDEO } from "./script";
import { clamp, sec } from "./theme";

// Голос диктора, очень тихая тёплая музыка (общий файл проекта, приглушается
// под речью) и несколько негромких звуков: щелчки пазлов и ремней.
const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.14;
const MUSIC_UNDER_VOICE = 0.05;

export const Bg23Audio: React.FC<{ readonly tl: Bg23Timeline; readonly sfx: readonly { at: number; src: string; volume: number }[] }> = ({ tl, sfx }) => {
  const total = tl.durationInFrames;
  const spans = tl.cues.map((c) => [sec(c.from), sec(c.to)] as const);
  const music = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 15], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 20, total - 60, total - 2], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      <Audio src={staticFile(MUSIC)} volume={music} />
      {tl.cues
        .filter((c) => c.file)
        .map((c) => (
          <Sequence key={c.id} from={Math.round(c.at * BG23_VIDEO.fps)} name={`voice ${c.id}`}>
            <Audio src={staticFile(`${BG23_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ))}
      {sfx.map((s, i) => (
        <Sequence key={i} from={sec(s.at)} durationInFrames={sec(2)} name="sfx">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};
