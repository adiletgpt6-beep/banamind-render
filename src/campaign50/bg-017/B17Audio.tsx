// Звук: голоса, очень тихая музыка (два слоя одной гармонии: тихое
// фортепиано в начале, тёплое с пэдом — с решения мамы), приглушение под
// речью и немного звуков рисунка: мелок по бумаге, шорох листа,
// красный карандаш, касание экрана, телефон на стол, складывание листа.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { B17_VIDEO } from "./script";

const FPS = B17_VIDEO.fps;
const DIR = B17_VIDEO.voiceDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = 0.17;
const UNDER_VOICE = 0.06;

export const B17Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  const sc = (id: string) => tl.scenes.find((x) => x.id === id)!;
  const cue = (id: string) => tl.cues.find((x) => x.id === id)!;
  const hook = sc("hook");
  const week = sc("week");
  const notice = sc("notice");
  const search = sc("search");
  const route = sc("route");
  const cta = sc("cta");
  const tapT = cue("m02").to + 0.25;
  const n01 = cue("n01");
  const n01b = cue("n01b");
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
  const level = (f: number) =>
    MUSIC *
    interpolate(f, [0, s(week.from), s(week.from + 2), s(cta.from), s(cta.from + 2)], [0.55, 0.6, 0.85, 0.85, 1.0], clamp) *
    interpolate(f, [total - s(2.5), total - 1], [1, 0], clamp);
  const xf = s(tapT);
  const warm = (f: number) => interpolate(f, [xf, xf + s(2.5)], [0, 1], clamp);
  const fx: { src: string; at: number; v: number; len?: number }[] = [
    { src: "crayon", at: hook.from + 0.2, v: 0.4, len: 2.8 },
    { src: "crayon", at: hook.from + 3.0, v: 0.25, len: 1.4 },
    { src: "page", at: week.from + 0.3, v: 0.25 },
    { src: "page", at: notice.from + 0.1, v: 0.5 },
    { src: "pencil", at: n01.from + 0.15, v: 0.32, len: 2.9 },
    { src: "pencil", at: n01b.from, v: 0.22, len: n01b.to - n01b.from },
    { src: "phone", at: search.from + 1.0, v: 0.5 },
    { src: "tap", at: tapT, v: 0.55 },
    { src: "page", at: route.from + 0.1, v: 0.2 },
    { src: "fold", at: cta.from, v: 0.5 },
  ];
  return (
    <>
      <Sequence name="Музыка: тихая" durationInFrames={total}>
        <Audio src={staticFile(`${DIR}/music-quiet.mp3`)} volume={(f) => level(f) * duck(f) * (1 - warm(f))} />
      </Sequence>
      <Sequence name="Музыка: тёплая" from={xf} durationInFrames={total - xf}>
        <Audio src={staticFile(`${DIR}/music-warm.mp3`)} trimBefore={xf} volume={(f) => level(f + xf) * duck(f + xf) * warm(f + xf)} />
      </Sequence>
      {fx.map((x, i) => (
        <Sequence key={`fx-${i}`} name={`Эффект: ${x.src}`} from={s(x.at)} durationInFrames={s(x.len ?? 0.8)}>
          <Audio src={staticFile(`${DIR}/sfx/${x.src}.mp3`)} volume={x.v} loop={Boolean(x.len)} />
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
