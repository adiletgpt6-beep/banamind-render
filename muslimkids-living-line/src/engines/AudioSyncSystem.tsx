// AudioSyncSystem — places narration and sound design on the timeline.
//
// The narration manifest (written by scripts/generate_voice.py) carries the
// real duration of every line and of every sentence inside it. Lines are
// started at the cue times of the episode, sentence windows are exposed in
// frames so visuals (titles, labels) can be synced to the actual speech.

import React from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";

export type VoiceManifest = {
  lines: { id: string; file: string; durationSec: number; text: string; sentences: number[][] }[];
};

export type VoiceClip = {
  id: string;
  file: string;
  from: number;
  frames: number;
  text: string;
  sentences: { from: number; to: number }[];
};

export const voiceTimeline = (
  manifest: VoiceManifest,
  startSec: Record<string, number>,
  fps: number,
): VoiceClip[] =>
  manifest.lines.map((l) => {
    const s = startSec[l.id];
    if (s === undefined) throw new Error(`AudioSync: no cue for voice line ${l.id}`);
    const from = Math.round(s * fps);
    return {
      id: l.id,
      file: l.file,
      from,
      frames: Math.ceil(l.durationSec * fps) + 2,
      text: l.text,
      sentences: l.sentences.map(([a, b]) => ({ from: from + Math.round(a * fps), to: from + Math.round(b * fps) })),
    };
  });

/** Overlaps or lines running past the end — reported by QA. */
export const checkVoice = (clips: VoiceClip[], duration: number): string[] => {
  const out: string[] = [];
  clips.forEach((c, i) => {
    const next = clips[i + 1];
    if (next && c.from + c.frames > next.from) out.push(`${c.id} overlaps ${next.id}`);
    if (c.from + c.frames > duration) out.push(`${c.id} runs past the end`);
  });
  return out;
};

export const NarrationTrack: React.FC<{ clips: VoiceClip[]; volume?: number }> = ({ clips, volume = 1 }) => (
  <>
    {clips.map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.frames} name={`voice ${c.id}`}>
        <Html5Audio src={staticFile(c.file)} volume={volume} />
      </Sequence>
    ))}
  </>
);

export const SoundDesignTrack: React.FC<{ file: string; volume?: number }> = ({ file, volume = 1 }) => (
  <Html5Audio src={staticFile(file)} volume={volume} name="sound design" />
);
