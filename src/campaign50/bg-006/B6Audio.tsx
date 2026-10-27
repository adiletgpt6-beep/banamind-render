// Звук ролика: голоса, тихая музыка (приглушается под репликами и почти
// исчезает на стоп-кадрах — «звук на мгновение затихает»), сдержанные
// эффекты: вибрация и уведомление, тиканье на стоп-кадре, нажатия, набор
// текста, мягкий переход к финалу. Музыка и эффекты — общие файлы проекта
// (только чтение).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { HOOK } from "./scenes/Hook";
import { LISTEN } from "./scenes/Listen";
import { SEARCH } from "./scenes/Search";
import { TALK } from "./scenes/Talk";
import { TERMS } from "./scenes/Terms";
import { B6_FRAMES, B6_SCENES, B6_VIDEO, type B6SceneId } from "./script";
import type { B6Cue } from "./timing";

const FPS = B6_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);
const S = (id: B6SceneId) => s(B6_SCENES.find((x) => x.id === id)!.from);

const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 17, gain: 0.85 },
  { src: "audio/music-story-low.mp3", from: 16.5, to: 31.5, gain: 0.9 },
  { src: "audio/music-story-warm.mp3", from: 31, to: 73, gain: 0.95 },
];
const MUSIC_VOLUME = 0.22;
const MUSIC_UNDER_VOICE = 0.06;

// стоп-кадры (кадры ролика)
export const B6_FREEZES: readonly [number, number][] = [
  [S("hook") + HOOK.freeze, S("hook") + HOOK.end],
  [S("listen") + LISTEN.freeze, S("listen") + LISTEN.unfreeze],
];

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
const C = (n: string) => `audio/sfx-${n}.mp3`;

const sfxList = (): Sfx[] => {
  const h = S("hook");
  const l = S("listen");
  const t = S("talk");
  const se = S("search");
  const te = S("terms");
  const cta = S("cta");
  const list: Sfx[] = [
    { at: h + 2, src: C("whoosh"), volume: 0.12 },
    { at: h + HOOK.buzz, src: C("vibrate"), volume: 0.5 },
    { at: h + HOOK.buzz + 2, src: C("notify"), volume: 0.3 },
    { at: l + LISTEN.colleagues + 40, src: C("paper"), volume: 0.12 },
    { at: t + TALK.pick + 8, src: C("tap"), volume: 0.18 },
    { at: t + TALK.pov, src: C("whoosh"), volume: 0.1 },
    { at: se + SEARCH.typeFrom, src: C("typing"), volume: 0.16, dur: (SEARCH.typeTo - SEARCH.typeFrom) / FPS, fade: 0.15 },
    { at: se + SEARCH.tap, src: C("tap"), volume: 0.3 },
    { at: se + SEARCH.morph, src: C("whoosh"), volume: 0.16 },
    { at: te + TERMS.flip, src: C("whoosh"), volume: 0.12 },
    { at: te + TERMS.tap, src: C("tap"), volume: 0.3 },
    { at: te + TERMS.saved, src: C("pop"), volume: 0.22 },
    { at: cta + 2, src: C("chime"), volume: 0.2 },
  ];
  // стоп-кадр: «щелчок» и тиканье часов
  for (const [a, b] of B6_FREEZES) {
    list.push({ at: a, src: C("tap"), volume: 0.35 });
    list.push({ at: a + 6, src: C("tick"), volume: 0.4, dur: (b - a - 6) / FPS, fade: 0.2 });
  }
  return list;
};

export const B6Audio: React.FC<{ readonly cues: readonly B6Cue[] }> = ({ cues }) => {
  const spans: [number, number][] = [];
  for (const c of cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    for (const [a, b] of B6_FREEZES) v = Math.min(v, interpolate(f, [a - 2, a + 4, b - 4, b + 8], [v, 0.015, 0.015, v], clamp));
    return v * interpolate(f, [0, 0.6 * FPS, B6_FRAMES - 2.5 * FPS, B6_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(B6_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= B6_FRAMES ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfxList().map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${B6_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
