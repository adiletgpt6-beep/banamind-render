// AudioSyncSystem — анимация подстраивается под реальную речь.
//
// manifest.json пишет scripts/generate-voice.mjs: для каждой реплики —
// длительность и время каждого слова (по таймингам синтеза, после обрезки
// тишины). Старт реплики берётся из voice.json (его можно сдвигать без
// повторного синтеза). word("s3", "день") → абсолютная секунда ролика.
import { Audio } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import manifest from "../../public/audio/voice/manifest.json";
import voiceCfg from "../../voice.json";
import sfxCues from "../../public/audio/sfx/cues.json";

type Clip = { id: string; start: number; duration: number; words: { w: string; s: number; e: number }[] };

const starts = new Map(voiceCfg.clips.map((c) => [c.id, c.start]));
export const CLIPS: Clip[] = (manifest.clips as Clip[]).map((c) => ({ ...c, start: starts.get(c.id) ?? c.start }));

const norm = (w: string) => w.toLowerCase().replace(/ё/g, "е");

export function clip(id: string) {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return c;
}

/** Абсолютное время начала (или конца) слова в реплике; nth — какое по счёту совпадение. */
export function word(id: string, w: string, edge: "s" | "e" = "s", nth = 0): number {
  const c = clip(id);
  const hits = c.words.filter((x) => norm(x.w) === norm(w));
  const hit = hits[nth] ?? hits[0];
  if (!hit) throw new Error(`Нет слова «${w}» в ${id}`);
  return c.start + hit[edge];
}

export const clipEnd = (id: string) => clip(id).start + clip(id).duration;

type Cue = { file: string; at: number; volume: number };

/** Голос + деликатные звуки (без музыки — правило Muslim Kids). */
export const Soundtrack: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {CLIPS.map((c) => (
        <Sequence key={c.id} from={Math.round(c.start * fps)} durationInFrames={Math.ceil((c.duration + 0.3) * fps)} layout="none">
          <Audio src={staticFile(`audio/voice/${c.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {(sfxCues as Cue[]).map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.round(s.at * fps)} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.file}`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};
