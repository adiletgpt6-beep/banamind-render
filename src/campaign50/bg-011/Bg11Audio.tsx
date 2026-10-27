// Звук ролика: голоса, своя музыка (три слоя одной гармонии и темпа:
// игривая маримба — утренняя суматоха, тихий пэд — записки и вечерний
// план, тепло — BalaGo и финал), приглушение музыки под речью и
// сдержанные эффекты: звон ключей, «фото»-щелчок стоп-кадров, въезд окон
// split-screen, замок портфеля, бумага, шаги, касания экрана, колокольчик.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { CTA_MORPH } from "./scenes/Cta";
import { F_DAD, F_MOM, F_SON, FOUND } from "./scenes/Found";
import { P_DAD, PHONE, PLAN } from "./scenes/Plan";
import { SPLIT_IN } from "./scenes/Split";
import { BG11_VIDEO, type Bg11SceneId } from "./script";
import { sceneOf, type Bg11Timeline } from "./timing";

const FPS = BG11_VIDEO.fps;
const DIR = BG11_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.2;
const MUSIC_UNDER_VOICE = 0.06;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg11Audio: React.FC<{ readonly tl: Bg11Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Bg11SceneId) => sceneOf(tl, id).from;
  const len = (id: Bg11SceneId) => sceneOf(tl, id).frames;
  // кадр реплики внутри её сцены
  const line = (id: string) => {
    const c = tl.cues.find((x) => x.id === id)!;
    const base = at(c.scene);
    return { from: s(c.from) - base, to: s(c.to) - base, words: c.words.map((w) => ({ text: w.text, at: s(w.start) - base })) };
  };
  const word = (id: string, w: string) => line(id).words.find((x) => x.text.toLowerCase().startsWith(w.toLowerCase()))?.at ?? line(id).from;

  // те же моменты, что в сценах
  const hookFreeze = Math.min(len("hook") - 30, line("n01").to + 2);
  const splitFreeze = Math.min(len("split") - 24, line("m01").to + 24);
  const n02 = line("n02");
  const grab = Math.max(FOUND.grab, n02.from + 16);
  const notice = Math.max(grab + 14, word("n02", "Бирок") - 14);
  const closeAt = Math.max(notice + 34, word("n02", "күн") - 6);
  const m02 = line("m02");
  const bFrom = Math.min(m02.from + 70, m02.to - 30);
  const cFrom = m02.to + 14;

  const music = [
    { src: `${DIR}/music-play.mp3`, from: 0, to: at("found") + closeAt + 10, gain: 1 },
    { src: `${DIR}/music-think.mp3`, from: at("found") + closeAt - 10, to: at("route") + 10, gain: 0.6 },
    { src: `${DIR}/music-warm.mp3`, from: at("route") - 10, to: total, gain: 1 },
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
    const add = (base: number, f: number, src: string, volume: number) => out.push({ at: base + f, src, volume });
    // 1. хук
    const h = at("hook");
    add(h, 3, "sfx/keys.mp3", 0.22);
    add(h, hookFreeze, "sfx/shutter.mp3", 0.5);
    for (const f of [22, 64, 132]) add(h, f, "sfx/paper.mp3", 0.16);
    // 2. split-screen
    const sp = at("split");
    for (const k of [SPLIT_IN.top, SPLIT_IN.left, SPLIT_IN.right]) add(sp, k, "sfx/whoosh.mp3", 0.16);
    add(sp, 18, "sfx/latch.mp3", 0.35);
    for (const f of [22, 44, 62, 72, 108]) add(sp, f, "sfx/paper.mp3", 0.16);
    add(sp, splitFreeze, "sfx/shutter.mp3", 0.5);
    add(sp, splitFreeze + 6, "sfx/pop.mp3", 0.3);
    // 3. ключи нашлись
    const fd = at("found");
    add(fd, FOUND.point + 4, "sfx/keys.mp3", 0.2);
    add(fd, grab, "sfx/magnet.mp3", 0.3);
    add(fd, grab + 2, "sfx/keys-take.mp3", 0.4);
    for (let i = 0; i < 3; i++) add(fd, notice + 14 + i * 8, "sfx/pop.mp3", 0.14);
    add(fd, closeAt, "sfx/whoosh.mp3", 0.16);
    const steps = (place: typeof F_SON, from: number, to: number, stride: number, child: boolean, base: number, vol: number) => {
      const tr = trackOf(place, from, len("found"), stride);
      contactFrames(tr)
        .filter((f) => f >= from && f <= to + 4)
        .forEach((f, i) => add(base, f, `sfx/step-${child ? "child-" : ""}${i % 4}.mp3`, vol));
    };
    steps(F_SON, FOUND.walk, FOUND.arrive, LOOKS.son.build.stride, true, fd, 0.3);
    steps(F_MOM, 14, 78, LOOKS.mom.build.stride, false, fd, 0.22);
    steps(F_DAD, FOUND.dadWalk, FOUND.dadAt, LOOKS.dad.build.stride, false, fd, 0.25);
    // 4. вечерний план
    const pl = at("plan");
    {
      const tr = trackOf(P_DAD, 0, len("plan"), LOOKS.dad.build.stride);
      contactFrames(tr)
        .filter((f) => f >= PLAN.walk && f <= PLAN.sit)
        .forEach((f, i) => add(pl, f, `sfx/step-${i % 4}.mp3`, 0.22));
    }
    add(pl, PLAN.put, "sfx/paper.mp3", 0.3);
    add(pl, bFrom, "sfx/whoosh.mp3", 0.14);
    add(pl, bFrom + 12, "sfx/paper.mp3", 0.3);
    add(pl, cFrom, "sfx/whoosh.mp3", 0.14);
    for (let k = PHONE.typeFrom; k < PHONE.resultsAt - 6; k += 3) add(pl, cFrom + k, "sfx/tap.mp3", 0.1);
    add(pl, cFrom + PHONE.tapAt, "sfx/tap.mp3", 0.4);
    // 5. маршрут
    const rt = at("route");
    add(rt, 0, "sfx/whoosh.mp3", 0.2);
    add(rt, 14, "sfx/pop.mp3", 0.2);
    add(rt, 50, "sfx/pop.mp3", 0.2);
    add(rt, Math.max(word("n03", "биринчи") - 4, 60), "sfx/chime.mp3", 0.2);
    // 6. финал
    const ct = at("cta");
    add(ct, CTA_MORPH.glow, "sfx/magnet.mp3", 0.25);
    add(ct, CTA_MORPH.from, "sfx/whoosh.mp3", 0.22);
    add(ct, CTA_MORPH.to, "sfx/chime.mp3", 0.24);
    return out.filter((x) => x.at >= 0 && x.at < total - 4);
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
            <Audio src={staticFile(`${BG11_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
