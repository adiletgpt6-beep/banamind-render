// Звук ролика: голоса, спокойная музыка проекта (три слоя одной гармонии
// и темпа: лёгкий пульс — утренняя суета, тише — вопрос сына и решение,
// тепло — маршрут и финал), приглушение музыки под речью, сдержанные
// эффекты: будильник, «стоп-моушн» щелчки шнурков, уведомления,
// нажатия, закрытие ноутбука, шаги мамы и папы, взмах, колокольчик.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { cruise, lerp } from "./rig/motion";
import { HK } from "./scenes/Hook";
import { DECIDE_TAP } from "./scenes/Decide";
import { LACE } from "./scenes/Laces";
import { MATCH } from "./scenes/Match";
import { FLOOR, H, SPOT } from "./scenes/common";
import { BG14_TEXT, BG14_VIDEO } from "./script";
import { STOP_STEP } from "./sneakers";
import { sceneOf, type Bg14Timeline } from "./timing";

const FPS = BG14_VIDEO.fps;
const DIR = BG14_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.22;
const MUSIC_UNDER_VOICE = 0.07;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg14Audio: React.FC<{ readonly tl: Bg14Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
  const music = [
    { src: `${DIR}/music-pulse.mp3`, from: 0, to: at("match") + 10, gain: 0.85 },
    { src: `${DIR}/music-low.mp3`, from: at("match") - 10, to: at("laces") + 10, gain: 1 },
    { src: `${DIR}/music-warm.mp3`, from: at("laces") - 10, to: total, gain: 1 },
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
    return v * interpolate(f, [0, 0.6 * FPS, total - 2.2 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    const cue = (id: string) => tl.cues.find((c) => c.id === id)!;
    // 1. будильник, щелчки шнурков (стоп-моушн), «готово!»
    const h = at("hook");
    out.push({ at: h, src: "sfx/alarm.mp3", volume: 0.22 });
    out.push({ at: h + 24, src: "sfx/alarm.mp3", volume: 0.16 });
    for (let k = HK.tie0; k < HK.tie1; k += STOP_STEP * 3) out.push({ at: h + k, src: "sfx/tap.mp3", volume: 0.16 });
    out.push({ at: h + HK.hop, src: "sfx/pop.mp3", volume: 0.4 });
    out.push({ at: h + HK.sticker, src: "sfx/whoosh.mp3", volume: 0.14 });
    // 2. папа печатает на ноутбуке
    const p = at("plan");
    out.push({ at: p + 4, src: "sfx/typing.mp3", volume: 0.12 });
    out.push({ at: s(cue("f01").to) + 12, src: "sfx/typing.mp3", volume: 0.1 });
    // 3. уведомления вокруг кроссовок
    const m = at("match");
    BG14_TEXT.reminders.forEach((_, i) => out.push({ at: m + MATCH.cardFrom + i * MATCH.cardEvery, src: "sfx/notify.mp3", volume: 0.12 }));
    // 4. мама нажимает «Алдын ала пландоо», ноутбук закрывается, шаги
    const d = at("decide");
    out.push({ at: d + 2, src: "sfx/vibrate.mp3", volume: 0.12 });
    out.push({ at: d + DECIDE_TAP, src: "sfx/tap.mp3", volume: 0.4 });
    out.push({ at: d + DECIDE_TAP + 4, src: "sfx/chime.mp3", volume: 0.12 });
    const m02 = cue("m02");
    const a = Math.max(DECIDE_TAP + 22, s(m02.from) - d - 6);
    const b = s(m02.to) - d + 8;
    const c = b + 34;
    out.push({ at: d + b + 18, src: "sfx/tap.mp3", volume: 0.35 });
    const dadPlace = (t: number) => ({ x: lerp(SPOT.dad, SPOT.dadNear, cruise((t - c) / 50)), y: FLOOR + 20, h: H.dad });
    contactFrames(trackOf(dadPlace, c - 2, sceneOf(tl, "decide").frames, LOOKS.dad.build.stride))
      .filter((q) => q >= c && q <= c + 52)
      .forEach((q, i) => out.push({ at: d + q, src: `sfx/step-soft-${i % 4}.mp3`, volume: 0.3 }));
    const momPlace = (t: number) => ({ x: lerp(SPOT.mom, SPOT.momNear, cruise((t - (a - 44)) / 38)), y: FLOOR + 10, h: H.mom });
    contactFrames(trackOf(momPlace, a - 46, sceneOf(tl, "decide").frames, LOOKS.mom.build.stride))
      .filter((q) => q >= a - 44 && q <= a - 4)
      .forEach((q, i) => out.push({ at: d + q, src: `sfx/step-soft-${(i + 2) % 4}.mp3`, volume: 0.22 }));
    // 5. шнурки → маршрут
    const l = at("laces");
    out.push({ at: l + LACE.pull0, src: "sfx/whoosh.mp3", volume: 0.25 });
    out.push({ at: l + LACE.pull1 + 30, src: "sfx/chime.mp3", volume: 0.16 });
    // 6. финал
    const ct = at("cta");
    out.push({ at: ct, src: "sfx/whoosh.mp3", volume: 0.25 });
    out.push({ at: ct + 16, src: "sfx/chime.mp3", volume: 0.25 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
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
            <Audio src={staticFile(`${BG14_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
