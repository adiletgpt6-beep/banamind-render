// Звук ролика: голоса (диктор и мама), спокойная музыка проекта в двух
// слоях одной гармонии и темпа («зеркальный» — офис, решение, условия;
// тёплый — условный пример и финал), приглушение музыки под речью и
// сдержанные эффекты по действиям в кадре: блик зеркала, печать,
// вибрация телефона, касания, крышка ноутбука, шаги, отправка сообщения,
// штамп «кепил эмес», машина, колокольчик логотипа.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { wordFrame } from "./scenes/common";
import { DC, decideBeats } from "./scenes/Decide";
import { HK, hookDiverge } from "./beats";
import { SP, splitMomPlace } from "./scenes/Split";
import { momWalk, trialBeats } from "./scenes/Trial";
import { BG45_VIDEO } from "./script";
import { sceneOf, type Bg45Timeline } from "./timing";

const FPS = BG45_VIDEO.fps;
const DIR = BG45_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.2;
const MUSIC_UNDER_VOICE = 0.065;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg45Audio: React.FC<{ readonly tl: Bg45Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
  const music = [
    { src: `${DIR}/music-mirror.mp3`, from: 0, to: at("trial") + 12, gain: 1 },
    { src: `${DIR}/music-warm.mp3`, from: at("trial") - 12, to: total, gain: 0.9 },
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
    return v * interpolate(f, [0, 0.5 * FPS, total - 2.2 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    const cue = (id: string) => tl.cues.find((c) => c.id === id)!;
    const sc = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id);
    // 1. хук: печать, блик раскола зеркала, подписи
    const h = at("hook");
    out.push({ at: h, src: "sfx/typing.mp3", volume: 0.1 });
    out.push({ at: h + HK.line - 2, src: "sfx/shimmer.mp3", volume: 0.2 });
    out.push({ at: h + HK.labels, src: "sfx/pop.mp3", volume: 0.12 });
    const n01 = cue("n01");
    out.push({ at: h + hookDiverge((pr, fb, nth = 0) => wordFrame(n01, pr, fb, h, nth)), src: "sfx/buzz.mp3", volume: 0.24 });
    // 2. два понедельника: печать справа, вибрация, касание, крышка, шаги
    const p = at("split");
    out.push({ at: p + 2, src: "sfx/typing.mp3", volume: 0.07 });
    out.push({ at: p + SP.lid0 - 6 + 62, src: "sfx/typing.mp3", volume: 0.06 }); // правая мама снова печатает
    out.push({ at: p + 240, src: "sfx/typing.mp3", volume: 0.06 });
    out.push({ at: p + SP.tapPhone, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: p + SP.lid1 - 2, src: "sfx/lid.mp3", volume: 0.32 });
    out.push({ at: p + SP.grab, src: "sfx/tap.mp3", volume: 0.2 });
    contactFrames(trackOf(splitMomPlace, SP.walk0 - 2, sc("split").frames, LOOKS.mom.build.stride))
      .filter((q) => q >= SP.walk0 && q <= SP.walk1)
      .forEach((q, i) => out.push({ at: p + q, src: `sfx/step-${i % 4}.mp3`, volume: 0.22 }));
    // 3. решение: створка складывается, курсор закрывает календарь,
    //    телефон в руке, поиск, поля, «Арыз калтыруу», «отправить»
    const d = at("decide");
    const m01 = cue("m01");
    const dm = { from: s(m01.from) - d, to: s(m01.to) - d };
    const b = decideBeats(dm, (pr, fb, nth = 0) => wordFrame(m01, pr, fb, d, nth));
    out.push({ at: d, src: "sfx/shimmer.mp3", volume: 0.14 });
    out.push({ at: d + DC.close, src: "sfx/tap.mp3", volume: 0.28 });
    out.push({ at: d + DC.medium + 14, src: "sfx/tap.mp3", volume: 0.16 });
    out.push({ at: d + b.phoneIn, src: "sfx/whoosh.mp3", volume: 0.12 });
    out.push({ at: d + b.phoneIn + 4, src: "sfx/typing.mp3", volume: 0.08 });
    out.push({ at: d + b.searchTap, src: "sfx/tap.mp3", volume: 0.3 });
    b.fills.forEach((q) => out.push({ at: d + q, src: "sfx/pop.mp3", volume: 0.08 }));
    out.push({ at: d + b.formTap, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: d + b.sendAt, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: d + b.sendAt + 2, src: "sfx/send.mp3", volume: 0.2 });
    // 4. условия: шаги-плашки, штамп, снова зеркало
    const g = at("group");
    const n03 = cue("n03");
    out.push({ at: g + 4, src: "sfx/whoosh.mp3", volume: 0.1 });
    [10, 18, 26].forEach((q) => out.push({ at: g + q, src: "sfx/pop.mp3", volume: 0.08 }));
    out.push({ at: g + wordFrame(n03, "кепил", 0.88, g) - 2, src: "sfx/stamp.mp3", volume: 0.26 });
    out.push({ at: g + sc("group").frames - 42, src: "sfx/shimmer.mp3", volume: 0.16 });
    // 5. условный пример: группа, машина уезжает, «Улантуу», офис
    const t = at("trial");
    const n04 = cue("n04");
    const tb = trialBeats((pr, fb) => wordFrame(n04, pr, fb, t));
    out.push({ at: t + tb.formed, src: "sfx/pop.mp3", volume: 0.1 });
    out.push({ at: t + tb.formed + 2, src: "sfx/car.mp3", volume: 0.1 });
    out.push({ at: t + tb.first + 6, src: "sfx/car.mp3", volume: 0.16 });
    out.push({ at: t + tb.free, src: "sfx/pop.mp3", volume: 0.12 });
    out.push({ at: t + tb.back, src: "sfx/whoosh.mp3", volume: 0.08 });
    out.push({ at: t + tb.choose, src: "sfx/pop.mp3", volume: 0.1 });
    out.push({ at: t + tb.tap, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: t + tb.office, src: "sfx/whoosh.mp3", volume: 0.08 });
    const lb = { back: tb.back, office: tb.office };
    contactFrames(trackOf((q: number) => momWalk(q, lb), 0, sc("trial").frames, LOOKS.mom.build.stride))
      .forEach((q, i) => out.push({ at: t + q, src: `sfx/step-${(i + 1) % 4}.mp3`, volume: 0.1 }));
    // 6. финал
    const ct = at("cta");
    out.push({ at: ct, src: "sfx/shimmer.mp3", volume: 0.16 });
    out.push({ at: ct + 14, src: "sfx/chime.mp3", volume: 0.24 });
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
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + 24, b - 24, b], [a === 0 ? 1 : 0, 1, 1, b >= total ? 1 : 0], clamp)}
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
            <Audio src={staticFile(`${BG45_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
