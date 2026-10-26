// Общие функции системы заданий живых видео (live-videos/tasks/LIVE-NNN).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const TASKS = "live-videos/tasks";
export const ID_RE = /^LIVE-(\d{3})$/;

export const listTasks = () =>
  existsSync(TASKS)
    ? readdirSync(TASKS)
        .filter((d) => ID_RE.test(d))
        .sort()
        .map((d) => ({ dir: join(TASKS, d), ...JSON.parse(readFileSync(join(TASKS, d, "task.json"), "utf8")) }))
    : [];

// Версия к рендеру: явно заданная или последняя не-legacy.
export const activeVersion = (task, wanted) => {
  const vs = task.versions.filter((v) => !v.legacy);
  const v = wanted ? vs.find((x) => x.version === wanted) : vs[vs.length - 1];
  if (!v) throw new Error(`${task.id}: нет версии для рендера${wanted ? ` ${wanted}` : ""}`);
  return v;
};

// Лимит смысловых вставок по длительности живой части (live-videos/RULES.md, п. 3).
export const insertLimit = (sec) => (sec <= 30 ? 2 : sec <= 45 ? 3 : 4);
export const SFX_LIMIT_PER_45S = 8;
