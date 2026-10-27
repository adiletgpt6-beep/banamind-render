// Звук ролика: голоса (шесть разных), спокойная музыка проекта — четыре
// слоя одной гармонии и темпа (лёгкий — хук и ответы, тише и теплее —
// общий путь и решение мамы, с движением — сайт и условия, тепло — финал),
// приглушение музыки под речью и сдержанные эффекты: появление портретов,
// перелистывание ленты, вибрация и напоминание, шорох сворачиваемого
// чертежа, шаги папы, поделка на столе, ввод на сайте, карточки шагов,
// колокольчик финала.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { wordIn } from "./context";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { BG50_CONTACTS_IN, BG50_VIDEO } from "./script";
import { sceneOf, type Bg50Timeline } from "./timing";
import { eveningDad, eveningKeys } from "./worlds/Evening";
import { homeKeys } from "./worlds/Home";
import { studioKeys } from "./worlds/Studio";
import { workKeys } from "./worlds/Work";

const FPS = BG50_VIDEO.fps;
const DIR = BG50_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.32;
const MUSIC_UNDER_VOICE = 0.07;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg50Audio: React.FC<{ readonly tl: Bg50Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
  const music = [
    { src: `${DIR}/music-morning.mp3`, from: 0, to: at("mosaic") + 12, gain: 0.95 },
    { src: `${DIR}/music-low.mp3`, from: at("mosaic") - 12, to: at("search") + 12, gain: 1.05 },
    { src: `${DIR}/music-pulse.mp3`, from: at("search") - 12, to: at("cta") + 12, gain: 0.85 },
    { src: `${DIR}/music-warm.mp3`, from: at("cta") - 12, to: total, gain: 0.7 },
  ];
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
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.5 * FPS, total - 2.4 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    // 1. хук: появляются три портрета
    const h = at("hook");
    [8, 17, 26].forEach((d) => out.push({ at: h + d, src: "sfx/pop.mp3", volume: 0.22 }));
    // 2. ответ 1: раскрытие плитки, напоминание, чертёж сворачивается, штрих
    const w = at("work");
    const wk = workKeys(tl);
    out.push({ at: w, src: "sfx/whoosh.mp3", volume: 0.18 });
    out.push({ at: w + wk.notif, src: "sfx/vibrate.mp3", volume: 0.13 });
    out.push({ at: w + wk.notif + 10, src: "sfx/notify.mp3", volume: 0.12 });
    out.push({ at: w + wk.roll0 + 2, src: "sfx/paper.mp3", volume: 0.32 });
    out.push({ at: w + wk.roll0 + 16, src: "sfx/paper.mp3", volume: 0.22 });
    out.push({ at: w + wk.a01.to + 14, src: "sfx/whoosh.mp3", volume: 0.14 });
    out.push({ at: w + wk.a01.to + 22, src: "sfx/pop.mp3", volume: 0.24 });
    // 3. ответ 2: лента, шаги папы, поделка на столе
    const e = at("evening");
    const ek = eveningKeys(tl);
    out.push({ at: e, src: "sfx/whoosh.mp3", volume: 0.18 });
    const dad = eveningDad(ek);
    contactFrames(trackOf(dad, ek.enter0 - 2, sceneOf(tl, "evening").frames, LOOKS.dad.build.stride))
      .filter((q) => q >= ek.enter0 && q <= ek.pull1 + 4)
      .forEach((q, i) => out.push({ at: e + q, src: `sfx/step-soft-${i % 4}.mp3`, volume: 0.26 }));
    out.push({ at: e + ek.place + 6, src: "sfx/tap.mp3", volume: 0.32 });
    // 4. ответ 3: лента, образец войлока ложится на стол
    const st = at("studio");
    const sk = studioKeys(tl);
    out.push({ at: st, src: "sfx/whoosh.mp3", volume: 0.18 });
    out.push({ at: st + sk.put - 2, src: "sfx/paper.mp3", volume: 0.18 });
    // 5. мозаика: плитки, петля пути
    const m = at("mosaic");
    out.push({ at: m + 2, src: "sfx/whoosh.mp3", volume: 0.14 });
    [6, 11, 21].forEach((d) => out.push({ at: m + d, src: "sfx/pop.mp3", volume: 0.16 }));
    out.push({ at: m + wordIn(tl, "n02", "күн", 0.45, "mosaic") + 24, src: "sfx/chime.mp3", volume: 0.14 });
    // 6. четвёртая мама: рисунок, ввод в телефоне
    const ho = at("home");
    const hk = homeKeys(tl);
    out.push({ at: ho, src: "sfx/whoosh.mp3", volume: 0.14 });
    out.push({ at: ho + hk.show, src: "sfx/paper.mp3", volume: 0.24 });
    out.push({ at: ho + hk.type + 2, src: "sfx/tap.mp3", volume: 0.22 });
    out.push({ at: ho + hk.type + 9, src: "sfx/tap.mp3", volume: 0.18 });
    // 7. сайт: ввод полей, карточки шагов
    const se = at("search");
    out.push({ at: se + 10, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: se + 12, src: "sfx/typing.mp3", volume: 0.12 });
    for (const [word, fb] of [["алгач", 0.12], ["түзүл", 0.42], ["андан", 0.8]] as const) out.push({ at: se + wordIn(tl, "n03", word, fb, "search"), src: "sfx/pop.mp3", volume: 0.2 });
    // 8. финал
    const ct = at("cta");
    out.push({ at: ct, src: "sfx/whoosh.mp3", volume: 0.22 });
    out.push({ at: ct + 20, src: "sfx/chime.mp3", volume: 0.24 });
    out.push({ at: ct + s(BG50_CONTACTS_IN), src: "sfx/pop.mp3", volume: 0.16 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl]);
  return (
    <>
      {music.map((mu) => {
        const a = Math.max(0, mu.from);
        const b = Math.min(total, mu.to);
        return (
          <Sequence key={mu.src} name={`Музыка: ${mu.src.split("/").pop()}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(mu.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * mu.gain * interpolate(f + a, [a, a + 24, b - 24, b], [a === 0 ? 1 : 0, 1, 1, b >= total ? 1 : 0], clamp)}
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
            <Audio src={staticFile(`${BG50_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
