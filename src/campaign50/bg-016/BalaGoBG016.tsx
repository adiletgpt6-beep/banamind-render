// BalaGo-50, выпуск №17 — BG-016 «Мама сегодня не спешит» (2D).
import { useMemo } from "react";
import { AbsoluteFill, getStaticFiles, Sequence, staticFile } from "remotion";
import { Bg016Audio } from "./Bg016Audio";
import { FPS, TimelineContext } from "./context";
import { BG016_LINES, BG016_SCENES, BG016_VIDEO, type Bg016SceneId } from "./script";
import { Subtitles } from "./Subtitles";
import { buildTimeline, estimateManifest, spokenWords, type Manifest } from "./timeline";
import { CtaScene } from "./scenes/Cta";
import { DreamScene, ReverseScene } from "./scenes/Morning";
import { SearchScene } from "./scenes/Search";
import { StepsScene } from "./scenes/Steps";
import { TimersScene } from "./scenes/Timers";

export type BalaGoBG016Props = {
  readonly manifest: Manifest;
  // Предпросмотр без озвучки (оценочные тайминги). Финальный рендер — false.
  readonly allowEstimate: boolean;
};

const SCENES: Record<Bg016SceneId, React.FC> = {
  dream: DreamScene,
  reverse: ReverseScene,
  timers: TimersScene,
  search: SearchScene,
  steps: StepsScene,
  cta: CtaScene,
};

export const BalaGoBG016: React.FC<BalaGoBG016Props> = ({ manifest }) => {
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
          const from = Math.round(sc.from * FPS);
          const title = BG016_SCENES.find((x) => x.id === sc.id)!.title;
          return (
            <Sequence key={sc.id} name={title} from={from} durationInFrames={Math.round(sc.to * FPS) - from} premountFor={FPS}>
              <AbsoluteFill style={{ overflow: "hidden" }}>
                <Scene />
              </AbsoluteFill>
            </Sequence>
          );
        })}
        <Subtitles />
        <Bg016Audio tl={tl} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};

// Озвучка из public/audio/campaign50/bg-016/manifest.json. Финальный рендер
// без полной актуальной озвучки запрещён (ошибка), предпросмотр — по оценке.
export const loadBg016Manifest = async (allowEstimate: boolean): Promise<Manifest> => {
  const path = `${BG016_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const fail = (msg: string) => {
    if (allowEstimate) return estimateManifest();
    throw new Error(`BalaGoBG016: ${msg}. Рендер без голосов запрещён (предпросмотр: allowEstimate=true).`);
  };
  if (files.length > 0 && !files.some((f) => f.name === path)) return fail("озвучка не создана");
  const res = await fetch(staticFile(path));
  if (!res.ok) return fail(`нет manifest.json (HTTP ${res.status})`);
  const m = (await res.json()) as Manifest & { partial?: boolean };
  const names = new Set(files.map((f) => f.name));
  for (const line of BG016_LINES) {
    const l = m.lines.find((x) => x.id === line.id);
    if (!l?.file) return fail(`нет реплики ${line.id}`);
    if ((l as { spoken?: string }).spoken !== (line.spoken ?? line.text)) return fail(`реплика ${line.id} устарела`);
    if (names.size && !names.has(`${BG016_VIDEO.voiceDir}/${l.file}`)) return fail(`нет файла ${l.file}`);
    if (!l.words || l.words.length !== spokenWords(line).length) return fail(`тайминги слов ${line.id} не совпадают с текстом`);
  }
  if (m.partial) return fail("озвучка неполная");
  return { lines: m.lines };
};
