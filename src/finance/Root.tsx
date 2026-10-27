// Композиции финансового канала: выпуск 1 на английском (FinanceHorseEp01) и
// русском (FinanceHorseEp01Ru) — 1920×1080, 30 fps. Длительность — по озвучке
// (manifest); без озвучки собираются только черновые кадры (…Draft),
// финальный рендер без голоса запрещён.
import React from "react";
import { Composition, getStaticFiles, staticFile } from "remotion";
import "../fonts";
import { PoseSheet } from "./dev/PoseSheet";
import { Episode, scenesOf, voiceDirOf, type EpisodeProps } from "./Episode";
import type { Lang } from "./i18n";
import { buildTimeline, FPS, type VoiceManifest } from "./timeline";

const loadManifest = async (lang: Lang): Promise<VoiceManifest> => {
  const path = `${voiceDirOf(lang)}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(`Озвучка (${lang}) не создана — рендер без голоса запрещён.`);
  const res = await fetch(staticFile(path));
  if (!res.ok) throw new Error(`Озвучка (${lang}) не загружена: HTTP ${res.status}`);
  const m = (await res.json()) as VoiceManifest & { partial?: boolean };
  if (m.partial) throw new Error(`Озвучка (${lang}) неполная.`);
  const missing = scenesOf(lang)
    .flatMap((s) => s.lines)
    .filter((l) => !m.lines.some((v) => v.id === l.id));
  if (missing.length) throw new Error(`Нет озвучки реплик (${lang}): ${missing.map((l) => l.id).join(", ")}`);
  return m;
};

const Final: React.FC<{ id: string; lang: Lang }> = ({ id, lang }) => (
  <Composition
    id={id}
    component={Episode}
    fps={FPS}
    width={1920}
    height={1080}
    durationInFrames={300}
    defaultProps={{ manifest: null, lang } as EpisodeProps}
    calculateMetadata={async () => {
      const manifest = await loadManifest(lang);
      return { props: { manifest, lang }, durationInFrames: Math.ceil(buildTimeline(scenesOf(lang), manifest).duration * FPS) };
    }}
  />
);

const Draft: React.FC<{ id: string; lang: Lang }> = ({ id, lang }) => (
  <Composition
    id={id}
    component={Episode}
    fps={FPS}
    width={1920}
    height={1080}
    durationInFrames={Math.ceil(buildTimeline(scenesOf(lang), null).duration * FPS)}
    defaultProps={{ manifest: null, lang } as EpisodeProps}
  />
);

export const FinanceRoot: React.FC = () => (
  <>
    <Final id="FinanceHorseEp01" lang="en" />
    <Final id="FinanceHorseEp01Ru" lang="ru" />
    <Draft id="FinanceHorseEp01Draft" lang="en" />
    <Draft id="FinanceHorseEp01RuDraft" lang="ru" />
    <Composition id="FinanceHorsePoses" component={PoseSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);
