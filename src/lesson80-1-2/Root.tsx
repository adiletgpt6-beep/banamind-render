// Регистрация ролика 80-1-2 и его технических листов (папка Lesson80-1-2).
import React from "react";
import { Composition, Folder, getStaticFiles, staticFile } from "remotion";
import { GardenTest } from "./GardenTest";
import { NatureTest } from "./NatureTest";
import { PropsTest } from "./PropsTest";
import { A2_VIDEO } from "./script";
import { buildTimeline, type Manifest } from "./timeline";
import { WhatIsInsideApple, type WhatIsInsideAppleProps } from "./WhatIsInsideApple";

// Манифест озвучки: без него — черновая сборка по оценочным длительностям.
// Финальный рендер (npm run render:80-1-2) требует полную озвучку.
const loadManifest = async (): Promise<Manifest | null> => {
  const path = `${A2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return null;
  const res = await fetch(staticFile(path));
  if (!res.ok) return null;
  return (await res.json()) as Manifest;
};

export const Lesson80_1_2Compositions: React.FC = () => (
  <Folder name="Lesson80-1-2">
    <Composition
      id={A2_VIDEO.id}
      component={WhatIsInsideApple}
      defaultProps={{ manifest: null, subtitles: false } satisfies WhatIsInsideAppleProps}
      calculateMetadata={async ({ props }) => {
        const manifest = props.manifest ?? (await loadManifest());
        const tl = buildTimeline(manifest, A2_VIDEO.fps);
        return { props: { ...props, manifest }, durationInFrames: tl.frames + Math.round(0.1 * A2_VIDEO.fps) };
      }}
      durationInFrames={7800}
      fps={A2_VIDEO.fps}
      width={A2_VIDEO.width}
      height={A2_VIDEO.height}
    />
    <Composition id="L80-1-2-PropsTest" component={PropsTest} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="L80-1-2-GardenTest" component={GardenTest} durationInFrames={9} fps={30} width={1920} height={1080} />
    <Composition id="L80-1-2-NatureTest" component={NatureTest} durationInFrames={9} fps={30} width={1920} height={1080} />
  </Folder>
);
