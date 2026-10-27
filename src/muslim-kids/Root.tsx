import React from "react";
import { Composition, staticFile } from "remotion";
import { AliImran, type AliImranProps } from "./ali-imran/Video";
import { VIDEO } from "./ali-imran/script";
import { buildTimeline, type VoiceManifest } from "./ali-imran/timeline";
import { FPS, H, W } from "./theme";

// Muslim Kids — отдельная точка входа Remotion (src/muslim-kids/index.ts):
// ролики BalaGo и их Root не затрагиваются.
export const MuslimKidsRoot: React.FC = () => (
  <Composition
    id={VIDEO.composition}
    component={AliImran}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={60 * FPS}
    defaultProps={{ timeline: null, voice: true } as AliImranProps}
    calculateMetadata={async ({ props }) => {
      let manifest: VoiceManifest | null = null;
      try {
        const res = await fetch(staticFile(`${VIDEO.voiceDir}/manifest.json`));
        if (res.ok) manifest = (await res.json()) as VoiceManifest;
      } catch {
        manifest = null;
      }
      const timeline = buildTimeline(manifest);
      return {
        durationInFrames: timeline.total,
        props: { ...props, timeline },
      };
    }}
  />
);
