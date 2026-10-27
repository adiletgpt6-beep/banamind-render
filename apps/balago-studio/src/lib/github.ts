import type { StudioConfig } from "./config";

// Серверная интеграция с GitHub. Токен живёт только в секретах хостинга.
// Studio создаёт Issue (а не task.json), поэтому live-videos.yml не запускается.

export const INTAKE_LABEL = "live-intake";
export const UPLOAD_MARKER_PREFIX = "studio-upload-id:";

export interface IntakeIssue {
  number: number;
  title: string;
  body: string;
  url: string;
}

export interface IssueTracker {
  /** Все карточки Studio (открытые и закрытые), для поиска дубликатов и номеров. */
  listIntakeIssues(): Promise<IntakeIssue[]>;
  /** Самый большой номер LIVE-NNN, уже занятый в репозитории (реестр и папки заданий). */
  maxRepoLiveNumber(): Promise<number>;
  createIssue(input: { title: string; body: string; labels: string[] }): Promise<IntakeIssue>;
}

export function uploadMarker(uploadId: string): string {
  return `<!-- ${UPLOAD_MARKER_PREFIX} ${uploadId} -->`;
}

/** Номера из строк таблицы реестра («| LIVE-004 | …»), без шапки «LIVE-001 … LIVE-150». */
export function parseRegistryNumbers(markdown: string): number[] {
  return [...markdown.matchAll(/^\|\s*LIVE-(\d{3,4})\s*\|/gm)].map((m) => Number(m[1]));
}

export class GitHubError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GitHubError";
  }
}

export class GitHubIssueTracker implements IssueTracker {
  private readonly api = "https://api.github.com";

  constructor(
    private readonly config: StudioConfig["github"],
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    return this.fetchImpl(`${this.api}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "balago-video-studio",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  }

  private repoPath(): string {
    return `/repos/${encodeURIComponent(this.config.owner)}/${encodeURIComponent(this.config.repo)}`;
  }

  async listIntakeIssues(): Promise<IntakeIssue[]> {
    const result: IntakeIssue[] = [];
    for (let page = 1; page <= 10; page++) {
      const res = await this.request(
        `${this.repoPath()}/issues?labels=${INTAKE_LABEL}&state=all&per_page=100&page=${page}`,
      );
      if (!res.ok) throw new GitHubError("Не удалось прочитать карточки GitHub", res.status);
      const items = (await res.json()) as {
        number: number;
        title: string;
        body: string | null;
        html_url: string;
        pull_request?: unknown;
      }[];
      for (const item of items) {
        if (item.pull_request) continue;
        result.push({ number: item.number, title: item.title, body: item.body ?? "", url: item.html_url });
      }
      if (items.length < 100) break;
    }
    return result;
  }

  async maxRepoLiveNumber(): Promise<number> {
    const numbers: number[] = [0];
    const tasks = await this.request(`${this.repoPath()}/contents/live-videos/tasks`);
    if (tasks.ok) {
      const entries = (await tasks.json()) as { name: string }[];
      for (const entry of entries) {
        const match = /^LIVE-(\d{3,4})$/.exec(entry.name);
        if (match) numbers.push(Number(match[1]));
      }
    }
    const registry = await this.request(`${this.repoPath()}/contents/live-videos/REGISTRY.md`, {
      headers: { Accept: "application/vnd.github.raw+json" },
    });
    if (registry.ok) numbers.push(...parseRegistryNumbers(await registry.text()));
    return Math.max(...numbers);
  }

  private async ensureLabel(): Promise<void> {
    const res = await this.request(`${this.repoPath()}/labels/${INTAKE_LABEL}`);
    if (res.ok) return;
    if (res.status !== 404) throw new GitHubError("Не удалось проверить метку", res.status);
    const created = await this.request(`${this.repoPath()}/labels`, {
      method: "POST",
      body: JSON.stringify({
        name: INTAKE_LABEL,
        color: "FFC90E",
        description: "Живой ролик загружен через BalaGo Video Studio",
      }),
    });
    // 422 — метку уже создал параллельный запрос.
    if (!created.ok && created.status !== 422) {
      throw new GitHubError("Не удалось создать метку", created.status);
    }
  }

  async createIssue(input: { title: string; body: string; labels: string[] }): Promise<IntakeIssue> {
    await this.ensureLabel();
    const res = await this.request(`${this.repoPath()}/issues`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new GitHubError("Не удалось создать карточку GitHub", res.status);
    const issue = (await res.json()) as { number: number; title: string; body: string | null; html_url: string };
    return { number: issue.number, title: issue.title, body: issue.body ?? "", url: issue.html_url };
  }
}

/** Подменный GitHub для тестов: считает созданные карточки. */
export class MemoryIssueTracker implements IssueTracker {
  readonly issues: IntakeIssue[] = [];
  createCalls = 0;

  constructor(private readonly repoMax: number = 4) {}

  async listIntakeIssues(): Promise<IntakeIssue[]> {
    return [...this.issues];
  }

  async maxRepoLiveNumber(): Promise<number> {
    return this.repoMax;
  }

  async createIssue(input: { title: string; body: string; labels: string[] }): Promise<IntakeIssue> {
    this.createCalls++;
    const number = 100 + this.issues.length;
    const issue = { number, title: input.title, body: input.body, url: `https://github.test/issues/${number}` };
    this.issues.push(issue);
    return issue;
  }
}
