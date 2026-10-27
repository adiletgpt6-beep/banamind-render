import { getStaticFiles, staticFile } from "remotion";
import { MS_VIDEO } from "./script";
import { estimateStoryManifest, type StoryManifest } from "./storyTimeline";

// manifest.json озвучки седьмого ролика (scripts/generate-story-voice.mjs).
// Нет озвучки — тайминги оцениваются по тексту (ролик без голоса).
export const loadStoryManifest = async (): Promise<StoryManifest> => {
  const path = `${MS_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) {
    return estimateStoryManifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateStoryManifest();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const data = (await res.json()) as StoryManifest;
  if (data.version !== 1 || data.kind !== "story") {
    throw new Error("Неизвестный формат manifest.json озвучки истории.");
  }
  return data;
};
