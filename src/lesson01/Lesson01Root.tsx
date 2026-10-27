import React from "react";
import { Composition, Folder, getStaticFiles, staticFile } from "remotion";
import { Lesson01, type Lesson01Props } from "./Lesson01";
import { HeadTest, RigTest } from "./RigTest";
import { L1_VIDEO } from "./script";
import { buildTimeline, type Manifest } from "./timeline";
import { WorldTest } from "./WorldTest";

// Манифест озвучки: без него — черновая сборка по оценочным длительностям
// (без голосов). Финальный рендер (npm run render:lesson01) требует полную
// озвучку: проверка в scripts/lesson01-render.mjs.
const loadManifest = async (): Promise<Manifest | null> => {
  const path = `${L1_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return null;
  const res = await fetch(staticFile(path));
  if (!res.ok) return null;
  return (await res.json()) as Manifest;
};

export const Lesson01Compositions: React.FC = () => (
  <Folder name="Lesson01">
    <Composition
      id={L1_VIDEO.id}
      component={Lesson01}
      defaultProps={{ manifest: null, subtitles: false } satisfies Lesson01Props}
      calculateMetadata={async ({ props }) => {
        const manifest = props.manifest ?? (await loadManifest());
        const tl = buildTimeline(manifest, L1_VIDEO.fps);
        return { props: { ...props, manifest }, durationInFrames: tl.frames + Math.round(0.1 * L1_VIDEO.fps) };
      }}
      durationInFrames={8400}
      fps={L1_VIDEO.fps}
      width={L1_VIDEO.width}
      height={L1_VIDEO.height}
    />
    <Composition id="Lesson01HeadTest" component={HeadTest} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="Lesson01WorldTest" component={WorldTest} durationInFrames={60} fps={30} width={1920} height={1080} defaultProps={{ vb: "0 0 3840 2160" }} />
    <Composition id="Lesson01RigTest" component={RigTest} durationInFrames={120} fps={30} width={1920} height={1080} />
  </Folder>
);
