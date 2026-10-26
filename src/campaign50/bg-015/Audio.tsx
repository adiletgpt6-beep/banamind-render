// Звук BG-015: голоса, очень тихая тёплая музыка (приглушается под речью)
// и немного бытовых звуков в моменты действия: ноутбук, страница
// календаря, набор текста, клик, машина, птицы во дворе «возможного после».
// Музыка и звуки — общие файлы проекта (только чтение).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline, sceneOf } from "./context";
import { BG15_VIDEO } from "./script";
import { dayCuts } from "./scenes/Day";
import { THINK } from "./scenes/Think";
import { searchBeats } from "./scenes/Search";
import { wordTime } from "./timeline";

const FPS = BG15_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);
const MUSIC_VOLUME = 0.2;
const MUSIC_UNDER_VOICE = 0.06;

type Sfx = { at: number; src: string; volume: number; dur?: number };

export const Bg15Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  const sc = (id: Parameters<typeof sceneOf>[1]) => s(sceneOf(tl, id).from);
  const sceneLen = (id: Parameters<typeof sceneOf>[1]) => s(sceneOf(tl, id).to) - sc(id);
  const cue = (id: string) => tl.cues.find((c) => c.id === id)!;

  const spans: [number, number][] = [];
  for (const c of tl.cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  // вечер (хук, день, раздумья) — спокойно; поиск и финал — тепло
  const warmFrom = sc("search");
  const music = [
    { src: "audio/music-story-low.mp3", from: 0, to: warmFrom + FPS, gain: 0.85 },
    { src: "audio/music-story-warm.mp3", from: warmFrom - FPS, to: total, gain: 0.95 },
  ];

  const day = sc("day");
  const cuts = dayCuts(sceneLen("day"));
  const think = sc("think");
  const search = sc("search");
  const n02 = cue("n02");
  const beats = searchBeats(s(n02.from) - search, s(wordTime(n02, "үйдөн", 0.6)) - search);
  const steps = sc("steps");
  const after = s(wordTime(cue("n03"), "андан", 0.7)) - 8;
  const sfx: Sfx[] = [
    { at: day + cuts[1] + 4, src: "audio/sfx-bell.mp3", volume: 0.12 },
    { at: day + cuts[2], src: "audio/sfx-car.mp3", volume: 0.16, dur: cuts[3] - cuts[2] },
    { at: day + cuts[3] + 4, src: "audio/two-schedules-2d/sfx/laptop-open.mp3", volume: 0.35 },
    { at: think + THINK.flip, src: "audio/sfx-paper.mp3", volume: 0.4 },
    { at: search + beats.typeFrom, src: "audio/sfx-typing.mp3", volume: 0.22, dur: beats.typeTo - beats.typeFrom },
    { at: search + beats.clickAt - 2, src: "audio/sfx-tap.mp3", volume: 0.5 },
    { at: after + 6, src: "audio/two-schedules-2d/sfx/birds.mp3", volume: 0.1, dur: steps + sceneLen("steps") - after + 10 },
  ];
  return (
    <>
      {music.map((m) => (
        <Sequence key={m.src} name={`Музыка: ${m.src}`} from={m.from} durationInFrames={Math.max(1, Math.min(total, m.to) - m.from)}>
          <Audio
            src={staticFile(m.src)}
            trimBefore={m.from}
            volume={(f) => duck(f + m.from) * m.gain * interpolate(f + m.from, [m.from, m.from + FPS, m.to - FPS, m.to], [m.from === 0 ? 1 : 0, 1, 1, m.to >= total ? 1 : 0], clamp)}
          />
        </Sequence>
      ))}
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={x.dur} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={(f) => x.volume * (x.dur ? interpolate(f, [0, 8, x.dur - 8, x.dur], [0, 1, 1, 0], clamp) : 1)} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG15_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
