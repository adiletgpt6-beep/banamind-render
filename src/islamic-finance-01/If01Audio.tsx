// Sound: narration (one track, placed at 0), light music ducked under speech,
// and restrained effects that support the explanation.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { type If01Manifest, speechSpans, wordStart } from "./manifest";
import { FPS, sec } from "./motion";
import { IF01_FRAMES, IF01_VIDEO } from "./script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MUSIC = 0.2;
const MUSIC_UNDER_VOICE = 0.075;

export type SfxCue = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number };

// Effects are timed from the storyboard and, where it matters, from the
// spoken word (price flip on "twenty-two", ticks on "installments").
export const sfxCues = (m: If01Manifest): SfxCue[] => {
  const w = (id: string, word: string, fb: number) => sec(wordStart(m, id, word, fb));
  const pop = (at: number, volume = 0.5): SfxCue => ({ src: "audio/sfx-pop.mp3", at, volume });
  const tap = (at: number, volume = 0.9): SfxCue => ({ src: "audio/sfx-tap.mp3", at, volume });
  const whoosh = (at: number, volume = 0.3): SfxCue => ({ src: "audio/sfx-whoosh.mp3", at, volume });
  const deal = sec(13);
  const payStart = Math.max(deal + 318, w("l5", "paid", 19.57) - 4);
  return [
    pop(2, 0.45), // headline
    pop(34, 0.4), // % badge
    tap(46, 0.8), // red line
    whoosh(88), // bank → card
    pop(104, 0.4), // RIBA
    tap(w("l2", "prohibited", 5.35), 0.9),
    whoosh(195),
    pop(199, 0.4), // THEN HOW
    whoosh(268, 0.35), // car drives in
    pop(sec(9) + 40, 0.45), // price tag
    pop(deal + 150, 0.4), // FINANCIER BUYS
    tap(deal + 196, 0.9), // car reaches financier
    pop(w("l5", "agreed", 17.57), 0.45), // AGREED SALE PRICE
    tap(deal + 285, 0.9), // car reaches buyer
    ...[0, 1, 2, 3].map((i) => tap(payStart + i * 18 + 16, 0.8)), // installments
    { src: "audio/sfx-chime.mp3", at: payStart + 3 * 18 + 20, volume: 0.35 }, // completed
    whoosh(660, 0.35), // navy wipe
    pop(668, 0.4), // MURABAHA
    whoosh(733, 0.3),
    pop(740, 0.35),
    pop(w("l7", "different", 25.87), 0.45),
    whoosh(824, 0.3),
    pop(828, 0.4), // MONEY, EXPLAINED
    pop(sec(27.5) + 16, 0.45), // FOLLOW
  ];
};

export const If01Audio: React.FC<{ readonly manifest: If01Manifest }> = ({ manifest }) => {
  const spans = speechSpans(manifest).map(([a, b]) => [sec(a), sec(b)] as const);
  const music = (f: number) => {
    let v = MUSIC;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC], clamp));
    return v * interpolate(f, [0, 0.6 * FPS, IF01_FRAMES - 1.6 * FPS, IF01_FRAMES - 2], [0.6, 1, 1, 0], clamp);
  };
  return (
    <>
      <Audio src={staticFile("audio/music-finance-light.mp3")} volume={music} />
      {manifest.file ? (
        <Sequence name="Narration" durationInFrames={IF01_FRAMES}>
          <Audio src={staticFile(`${IF01_VIDEO.voiceDir}/${manifest.file}`)} volume={1} />
        </Sequence>
      ) : null}
      {sfxCues(manifest).map((x, i) => (
        <Sequence key={i} name={`SFX ${x.src.split("/").pop()}`} from={Math.max(0, Math.min(IF01_FRAMES - 10, x.at))} durationInFrames={x.dur ? sec(x.dur) : undefined} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
    </>
  );
};
