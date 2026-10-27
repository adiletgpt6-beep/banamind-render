import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import timeline from "../content/timeline.json";

// AudioSyncEngine output: narrator lines placed at the timeline's start times (the animation
// keyframes were authored against the measured durations in voice-timing.json) plus one
// pre-mixed bed of gentle sound effects (scripts/generate_sfx.py). No music.
export const Soundtrack: React.FC = () => (
  <>
    {timeline.voice.map((v) => (
      <Sequence key={v.id} from={Math.round(v.start * timeline.fps)}>
        <Audio src={staticFile(`audio/voice/${v.id}.wav`)} volume={1} />
      </Sequence>
    ))}
    <Audio src={staticFile("audio/sfx.wav")} volume={1} />
  </>
);
