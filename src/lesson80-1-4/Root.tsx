// Регистрация ролика 80-1-4 и его технических листов (папка Lesson80-1-4).
import React from "react";
import { Composition, Folder, getStaticFiles, staticFile } from "remotion";
import { MotionTest } from "./MotionTest";
import { OneCreator, type OneCreatorProps } from "./OneCreator";
import { Probe, type ProbeProps } from "./Probe";
import { PropsTest } from "./PropsTest";
import { type A4Lang, a4Pack } from "./lang";
import { buildTimeline, type Manifest } from "./timeline";

// Манифест озвучки: без него — черновая сборка по оценочным длительностям.
// Финальный рендер (npm run render:80-1-4) требует полную озвучку.
const loadManifest = async (voiceDir: string): Promise<Manifest | null> => {
  const path = `${voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return null;
  const res = await fetch(staticFile(path));
  if (!res.ok) return null;
  return (await res.json()) as Manifest;
};

// Русская версия и кыргызская: одна и та же композиция, разные реплики,
// надписи и озвучка (src/lesson80-1-4/lang.ts).
const film = (lang: A4Lang) => {
  const { video } = a4Pack(lang);
  return (
    <Composition
      key={video.id}
      id={video.id}
      component={OneCreator}
      defaultProps={{ manifest: null, subtitles: false, lang } satisfies OneCreatorProps}
      calculateMetadata={async ({ props }) => {
        const manifest = props.manifest ?? (await loadManifest(video.voiceDir));
        const tl = buildTimeline(manifest, video.fps, lang);
        return { props: { ...props, manifest }, durationInFrames: tl.frames + Math.round(0.1 * video.fps) };
      }}
      durationInFrames={8400}
      fps={video.fps}
      width={video.width}
      height={video.height}
    />
  );
};

export const Lesson80_1_4Compositions: React.FC = () => (
  <Folder name="Lesson80-1-4">
    {film("ru")}
    {film("ky")}
    <Composition
      id="L80-1-4-Probe"
      component={Probe}
      defaultProps={{ manifest: null, times: [0], cam: { cx: 1600, cy: 1650, w: 1200 } } satisfies ProbeProps}
      calculateMetadata={async ({ props }) => ({ props: { ...props, manifest: props.manifest ?? (await loadManifest(a4Pack(props.lang).video.voiceDir)) }, durationInFrames: Math.max(1, props.times.length) })}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition id="L80-1-4-PropsTest" component={PropsTest} durationInFrames={8} fps={30} width={1920} height={1080} />
    <Composition id="L80-1-4-MotionTest" component={MotionTest} durationInFrames={7} fps={30} width={1920} height={1080} />
  </Folder>
);
