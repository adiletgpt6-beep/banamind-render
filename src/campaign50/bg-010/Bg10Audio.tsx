// Звук ролика: голоса, спокойная музыка (три слоя одной гармонии и темпа:
// сосредоточенная работа — хук и звонок, тише — возвращение и раздумье,
// тепло — BalaGo и финал), приглушение музыки под речью и сдержанные
// эффекты: клавиши, уведомление школы, обрыв нити, сбой, вибрация
// телефона, ключи, выделение строки, переходы, колокольчик.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { BACK, LOOP } from "./scenes/Back";
import { CALL } from "./scenes/Call";
import { DEC } from "./scenes/Decide";
import { HOOK } from "./scenes/Hook";
import { ROUTE } from "./scenes/Route";
import { BG10_VIDEO } from "./script";
import { sceneOf, type Bg10Timeline } from "./timing";

const FPS = BG10_VIDEO.fps;
const DIR = BG10_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.2;
const MUSIC_UNDER_VOICE = 0.065;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg10Audio: React.FC<{ readonly tl: Bg10Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
  const cue = (id: string) => tl.cues.find((c) => c.id === id)!;
  const music = [
    { src: `${DIR}/music-focus.mp3`, from: 0, to: at("back") + 12, gain: 0.9 },
    { src: `${DIR}/music-low.mp3`, from: at("back") - 12, to: at("route") + 12, gain: 1 },
    { src: `${DIR}/music-warm.mp3`, from: at("route") - 12, to: total, gain: 1 },
  ];
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
    return v * interpolate(f, [0, 0.4 * FPS, total - 2.2 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    const key = (f: number, i: number, v = 0.16) => out.push({ at: f, src: `sfx/key-${i % 4}.mp3`, volume: v });
    // 1. хук
    const h = at("hook");
    out.push({ at: h + HOOK.toast, src: "sfx/notify.mp3", volume: 0.4 });
    out.push({ at: h + HOOK.snap, src: "sfx/snap.mp3", volume: 0.5 });
    out.push({ at: h + HOOK.snap + 1, src: "sfx/glitch.mp3", volume: 0.2 });
    // 2. звонок
    const c = at("call");
    for (let i = 0; i < 7; i++) key(c + 4 + i * 3 + (i % 3), i, 0.12);
    out.push({ at: c + CALL.buzz, src: "sfx/buzz.mp3", volume: 0.35 });
    out.push({ at: c + CALL.bubble, src: "sfx/pop.mp3", volume: 0.25 });
    const f01to = s(cue("f01").to);
    const look = f01to + 6;
    const L = look + 32;
    out.push({ at: look, src: "sfx/whoosh.mp3", volume: 0.12 });
    out.push({ at: L + 14, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: L + 36, src: "sfx/tap.mp3", volume: 0.4 });
    // 3. возвращение и петля
    const b = at("back");
    out.push({ at: b + 2, src: "sfx/whoosh.mp3", volume: 0.18 });
    out.push({ at: b + BACK.keys, src: "sfx/keys.mp3", volume: 0.35 });
    out.push({ at: b + BACK.lid + 10, src: "sfx/tap.mp3", volume: 0.25 });
    for (let i = 0; i < 8; i++) key(b + BACK.screen + 70 + i * 5, i, 0.1);
    const n02 = cue("n02");
    const w = n02.words[9];
    const wB = Math.max(s(w ? w.start : n02.from) - 4, b + BACK.screen + 40);
    for (let k = 0; k < LOOP.n; k++) {
      out.push({ at: wB + k * LOOP.len + 6, src: "sfx/notify.mp3", volume: 0.22 });
      out.push({ at: wB + k * LOOP.len + 14, src: "sfx/snap.mp3", volume: 0.3 });
    }
    // 4. решение
    const f02to = s(cue("f02").to);
    const peel = f02to + 4;
    const S = peel + 36;
    out.push({ at: peel + 12, src: "sfx/paper.mp3", volume: 0.35 });
    out.push({ at: S, src: "sfx/whoosh.mp3", volume: 0.18 });
    out.push({ at: S + DEC.fly, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: S + DEC.lift, src: "sfx/whoosh.mp3", volume: 0.15 });
    for (let i = 0; i < 12; i++) key(S + DEC.type0 + Math.round((i * (DEC.type1 - DEC.type0)) / 12), i, 0.16);
    out.push({ at: S + DEC.result, src: "sfx/pop.mp3", volume: 0.25 });
    out.push({ at: S + DEC.click, src: "sfx/tap.mp3", volume: 0.4 });
    // 5. маршрут
    const r = at("route");
    out.push({ at: r + ROUTE.screen, src: "sfx/whoosh.mp3", volume: 0.15 });
    out.push({ at: s(cue("n03").to) - 6, src: "sfx/chime.mp3", volume: 0.15 });
    out.push({ at: s(cue("n04").from) - 4, src: "sfx/pop.mp3", volume: 0.18 });
    // 6. финал
    const ct = at("cta");
    out.push({ at: ct, src: "sfx/whoosh.mp3", volume: 0.22 });
    out.push({ at: ct + 30, src: "sfx/chime.mp3", volume: 0.25 });
    return out.filter((x) => x.at >= 0 && x.at < total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl]);
  return (
    <>
      {music.map((m) => {
        const a = Math.max(0, m.from);
        const b = Math.min(total, m.to);
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + 20, b - 20, b], [a === 0 ? 1 : 0, 1, 1, b >= total ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG10_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
