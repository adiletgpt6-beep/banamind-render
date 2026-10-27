// Регистрация ролика 80-1-3 (папка Lesson80-1-3): русская версия и кыргызская
// (те же сцены и действия, своя озвучка и надписи).
import React from "react";
import { Composition, Folder, getStaticFiles, staticFile } from "remotion";
import { A3_EDITIONS, type A3Edition } from "./edition";
import { A3_VIDEO } from "./script";
import { buildTimeline, type Manifest } from "./timeline";
import { WhatIfICantSee, type WhatIfICantSeeProps } from "./WhatIfICantSee";

// Манифест озвучки: без него — черновая сборка по оценочным длительностям.
// Финальный рендер (npm run render:80-1-3) требует полную озвучку.
const loadManifest = async (ed: A3Edition): Promise<Manifest | null> => {
  const path = `${ed.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return null;
  const res = await fetch(staticFile(path));
  if (!res.ok) return null;
  return (await res.json()) as Manifest;
};

const EditionComposition: React.FC<{ ed: A3Edition }> = ({ ed }) => (
  <Composition
    id={ed.id}
    component={WhatIfICantSee}
    defaultProps={{ manifest: null, subtitles: false, lang: ed.lang } satisfies WhatIfICantSeeProps}
    calculateMetadata={async ({ props }) => {
      const manifest = props.manifest ?? (await loadManifest(ed));
      const tl = buildTimeline(manifest, A3_VIDEO.fps, ed.lines);
      return { props: { ...props, manifest, lang: ed.lang }, durationInFrames: tl.frames + Math.round(0.1 * A3_VIDEO.fps) };
    }}
    durationInFrames={7400}
    fps={A3_VIDEO.fps}
    width={A3_VIDEO.width}
    height={A3_VIDEO.height}
  />
);

export const Lesson80_1_3Compositions: React.FC = () => (
  <Folder name="Lesson80-1-3">
    <EditionComposition ed={A3_EDITIONS.ru} />
    <EditionComposition ed={A3_EDITIONS.ky} />
  </Folder>
);
