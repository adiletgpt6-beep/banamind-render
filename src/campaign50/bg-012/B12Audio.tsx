// Звук: голоса, тихая музыка (два слоя одной гармонии: тихое фортепиано
// в начале, тёплое с пэдом — с момента решения), приглушение под речью,
// сдержанные звуки быта: тиканье часов в тишине хука, альбом на столе,
// щелчок блокировки, касание экрана, ткань при объятии.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { B12_VIDEO } from "./script";

const FPS = B12_VIDEO.fps;
const DIR = B12_VIDEO.voiceDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = 0.2;
const UNDER_VOICE = 0.07;

export const B12Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  const sc = (id: string) => tl.scenes.find((x) => x.id === id)!;
  const turn = sc("turn");
  const drawing = sc("drawing");
  const story = sc("story");
  const m02 = tl.cues.find((c) => c.id === "m02")!;
  // интервалы речи; близкие реплики объединяются
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.4)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = 1;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [1, UNDER_VOICE / MUSIC, UNDER_VOICE / MUSIC, 1], clamp));
    return v;
  };
  // общий уровень: тихий хук (почти только часы), музыка входит со сцены
  // «Рисунок», к финалу — чуть громче; в последние 2,5 с — затухание
  const level = (f: number) =>
    MUSIC *
    interpolate(f, [0, s(drawing.from), s(drawing.from + 2.5), s(story.from), s(story.from + 2)], [0.35, 0.45, 0.85, 0.85, 1.0], clamp) *
    interpolate(f, [total - s(2.5), total - 1], [1, 0], clamp);
  const xf = s(turn.from);
  const warm = (f: number) => interpolate(f, [xf, xf + s(2.5)], [0, 1], clamp);
  const ticks: number[] = [];
  for (let k = 0.5; k < sc("plans").to; k += 1) ticks.push(s(k));
  const insertFrom = m02.to + 0.9;
  const fx: { src: string; at: number; v: number }[] = [
    { src: "album", at: drawing.from + 0.95, v: 0.55 },
    { src: "lock", at: turn.from + 0.45, v: 0.5 },
    { src: "cloth", at: turn.from + 0.9, v: 0.35 },
    { src: "album", at: turn.from + 1.0, v: 0.3 },
    { src: "cloth", at: turn.from + 2.4, v: 0.45 },
    { src: "tap", at: insertFrom + 1.0, v: 0.55 },
    { src: "cloth", at: story.from + 0.3, v: 0.25 },
  ];
  return (
    <>
      <Sequence name="Музыка: тихая" durationInFrames={total}>
        <Audio src={staticFile(`${DIR}/music-quiet.mp3`)} volume={(f) => level(f) * duck(f) * (1 - warm(f))} />
      </Sequence>
      <Sequence name="Музыка: тёплая" from={xf} durationInFrames={total - xf}>
        <Audio src={staticFile(`${DIR}/music-warm.mp3`)} trimBefore={xf} volume={(f) => level(f + xf) * duck(f + xf) * warm(f + xf)} />
      </Sequence>
      {ticks.map((at, i) => (
        <Sequence key={`tick-${i}`} name="Часы" from={at} durationInFrames={6}>
          <Audio src={staticFile(`${DIR}/sfx/tick.mp3`)} volume={0.22 * (spans.some(([a, b]) => at >= a && at <= b) ? 0.6 : 1)} />
        </Sequence>
      ))}
      {fx.map((x, i) => (
        <Sequence key={`fx-${i}`} name={`Эффект: ${x.src}`} from={s(x.at)} durationInFrames={s(0.8)}>
          <Audio src={staticFile(`${DIR}/sfx/${x.src}.mp3`)} volume={x.v} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${DIR}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
