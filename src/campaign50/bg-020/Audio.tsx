// Звук: голоса; почти тишина в начале — только шелест страницы; очень
// тихая тёплая музыка проекта (приглушается под репликами); несколько
// мягких бытовых звуков (страницы, касание экрана, закрытие книги).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline, sceneFrames } from "./context";
import { BG020_VIDEO } from "./script";

const FPS = BG020_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.12;
const MUSIC_UNDER_VOICE = 0.04;

export const Bg020Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.durationInFrames;
  const spans: [number, number][] = [];
  for (const c of tl.cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  // музыка входит после хука (тишина первых секунд) и уходит в конце
  const musicFrom = sceneFrames(tl, "habit").from - s(1);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [musicFrom, musicFrom + 2 * FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const hook = sceneFrames(tl, "hook").from;
  const habit = sceneFrames(tl, "habit").from;
  const realize = sceneFrames(tl, "realize").from;
  const open = sceneFrames(tl, "open").from;
  const cta = sceneFrames(tl, "cta").from;
  const n03 = tl.cues.find((c) => c.id === "n03")!;
  const sfx: { src: string; at: number; volume: number }[] = [
    { src: "audio/sfx-paper.mp3", at: hook + 18, volume: 0.55 }, // страница книги
    { src: "audio/sfx-paper.mp3", at: habit + 74, volume: 0.35 }, // лист блокнота
    { src: "audio/sfx-paper.mp3", at: realize + 64, volume: 0.35 }, // страница календаря
    { src: "audio/sfx-tap.mp3", at: open + 30, volume: 0.25 },
    { src: "audio/sfx-tap.mp3", at: s(n03.to) + 4, volume: 0.3 }, // «Сактоо»
    { src: "audio/sfx-paper.mp3", at: cta + 4, volume: 0.4 }, // книга закрывается
  ];
  return (
    <>
      <Sequence name="Музыка (очень тихо)" from={musicFrom} durationInFrames={total - musicFrom}>
        <Audio src={staticFile(MUSIC)} loop volume={(f) => duck(f + musicFrom)} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={s(1.5)} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG020_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
