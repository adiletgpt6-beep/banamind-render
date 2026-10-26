import { describe, expect, it } from "vitest";
import { GitHubIssueTracker, parseRegistryNumbers } from "@/lib/github";

const CONFIG = { token: "github_pat_secret", owner: "adiletzainidinov", repo: "balago-video" };

function router(routes: Record<string, () => Response>) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const key = `${init?.method ?? "GET"} ${url.replace("https://api.github.com", "")}`;
    const match = Object.entries(routes).find(([pattern]) => key.startsWith(pattern));
    return match ? match[1]() : new Response("{}", { status: 404 });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

describe("GitHub-интеграция", () => {
  it("номер берётся из папок заданий и реестра — LIVE-001…004 не перенумеровываются", async () => {
    const { fetchImpl } = router({
      "GET /repos/adiletzainidinov/balago-video/contents/live-videos/tasks": () =>
        Response.json([{ name: "LIVE-004" }]),
      "GET /repos/adiletzainidinov/balago-video/contents/live-videos/REGISTRY.md": () =>
        new Response("# Реестр (LIVE-001 … LIVE-150)\n| Задание |\n| LIVE-001 | a |\n| LIVE-002 | b |\n| LIVE-004 | c |\n"),
    });
    const tracker = new GitHubIssueTracker(CONFIG, fetchImpl);
    // Шапка «LIVE-001 … LIVE-150» — это план серии, а не занятый номер.
    expect(await tracker.maxRepoLiveNumber()).toBe(4);
    expect(parseRegistryNumbers(await (await fetch("data:text/plain,| LIVE-007 | x |")).text())).toEqual([7]);
  });

  it("создаёт метку при необходимости и Issue без task.json", async () => {
    const { calls, fetchImpl } = router({
      "GET /repos/adiletzainidinov/balago-video/labels/live-intake": () => new Response("{}", { status: 404 }),
      "POST /repos/adiletzainidinov/balago-video/labels": () => Response.json({}, { status: 201 }),
      "POST /repos/adiletzainidinov/balago-video/issues": () =>
        Response.json({ number: 80, title: "LIVE-005 — тест", body: "b", html_url: "https://github.com/x/80" }, { status: 201 }),
    });
    const tracker = new GitHubIssueTracker(CONFIG, fetchImpl);
    const issue = await tracker.createIssue({ title: "LIVE-005 — тест", body: "b", labels: ["live-intake"] });
    expect(issue).toEqual({ number: 80, title: "LIVE-005 — тест", body: "b", url: "https://github.com/x/80" });
    expect(calls.map((c) => c.url).some((u) => u.includes("/contents/") && u.includes("task.json"))).toBe(false);
    expect(calls.every((c) => (c.init?.headers as Record<string, string>).Authorization === "Bearer github_pat_secret")).toBe(true);
  });
});
