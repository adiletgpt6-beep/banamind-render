// Звук ролика: голоса (мама — хук, диктор — остальное), очень тихая тёплая
// музыка проекта (общий файл public/audio/music-story-warm.mp3, read-only)
// с приглушением под речью и сдержанные эффекты из общих файлов проекта:
// штамп, шелест бумаги (раскрытие, переворот, складывание), машина и
// школьный звонок в окне-сцене, отметки памятки, финальный колокольчик.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { HK } from "./scenes/Hook";
import { BY } from "./scenes/Beyond";
import { UF } from "./scenes/Unfold";
import { BG31_VIDEO } from "./script";
import { sceneOf, type Bg31Timeline } from "./timing";

const FPS = BG31_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.15;
const MUSIC_UNDER_VOICE = 0.05;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

// Момент слова (кадр ролика) по шкале.
const wordAt = (tl: Bg31Timeline, id: string, i: number) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) return 0;
  const w = c.words[Math.min(i, c.words.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS);
};

export const Bg31Audio: React.FC<{ readonly tl: Bg31Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans)
      v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.8 * FPS, total - 2.4 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const out: Sfx[] = [];
    const h = at("hook");
    out.push({ at: h + HK.stamp + 4, src: "audio/sfx-tap.mp3", volume: 0.45 });
    out.push({ at: h + sceneOf(tl, "hook").frames - 22, src: "audio/sfx-whoosh.mp3", volume: 0.14 });
    const u = at("unfold");
    out.push({ at: u + UF.open0, src: "audio/sfx-paper.mp3", volume: 0.3 });
    out.push({ at: wordAt(tl, "n02", 7), src: "audio/sfx-tick.mp3", volume: 0.12 });
    out.push({ at: wordAt(tl, "n02", 11), src: "audio/sfx-chime.mp3", volume: 0.1 });
    const tr = at("trip");
    out.push({ at: tr + 14, src: "audio/sfx-whoosh.mp3", volume: 0.16 });
    out.push({ at: wordAt(tl, "n03", 6) - 6, src: "audio/sfx-car.mp3", volume: 0.08 });
    out.push({ at: wordAt(tl, "n03", 11) - 2, src: "audio/sfx-bell.mp3", volume: 0.08 });
    out.push({ at: wordAt(tl, "n03", 13) - 10, src: "audio/sfx-car.mp3", volume: 0.08 });
    out.push({ at: tr + sceneOf(tl, "trip").frames - 30, src: "audio/sfx-whoosh.mp3", volume: 0.12 });
    const b = at("beyond");
    out.push({ at: b + BY.flip0, src: "audio/sfx-paper.mp3", volume: 0.28 });
    out.push({ at: wordAt(tl, "n04", 4), src: "audio/sfx-paper.mp3", volume: 0.18 });
    out.push({ at: wordAt(tl, "n04", 12) + 4, src: "audio/sfx-pop.mp3", volume: 0.18 });
    const m = at("memo");
    out.push({ at: m + 4, src: "audio/sfx-paper.mp3", volume: 0.26 });
    out.push({ at: wordAt(tl, "n05", 12), src: "audio/sfx-tap.mp3", volume: 0.35 });
    out.push({ at: wordAt(tl, "n05", 17), src: "audio/sfx-pop.mp3", volume: 0.2 });
    const ct = at("cta");
    out.push({ at: ct, src: "audio/sfx-whoosh.mp3", volume: 0.18 });
    out.push({ at: ct + 16, src: "audio/sfx-chime.mp3", volume: 0.2 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);
  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={(f) => duck(f)} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG31_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
