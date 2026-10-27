// Звук BalaGoBG047: голоса, тихая музыка (приглушается под речью) и
// бумажные звуки, привязанные к тем же моментам, что и анимация:
// раскрытие pop-up фигурок, прыжки точки, карандаш, наклейки, касания
// телефона, отправка сообщения, машина и школьный звонок в примере.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { BG47_VIDEO } from "./script";
import { lineFramesIn, sceneOf, type Bg47Timeline } from "./timing";
import { applyBeats, CTA_CHIME, fieldsBeats, foundAtOf, HOOK, mismatchBeats, trialBeats } from "./beats";

const FPS = BG47_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OWN = (n: string) => `${BG47_VIDEO.sfxDir}/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const MUSIC_VOLUME = 0.14;
const MUSIC_UNDER_VOICE = 0.038;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

export const bg47Sfx = (tl: Bg47Timeline): Sfx[] => {
  const S = (id: Parameters<typeof sceneOf>[1]) => Math.round(sceneOf(tl, id).from * FPS);
  const out: Sfx[] = [];
  const add = (at: number, src: string, volume: number, dur?: number) => out.push({ at, src, volume, dur });
  // 1. хук
  const h = S("hook");
  add(h + 2, OWN("fwip"), 0.34);
  [8, 14, 20].forEach((x, i) => add(h + x, OWN("fwip"), 0.16 - i * 0.02));
  add(h + HOOK.peel, OWN("sticker"), 0.22);
  add(h + HOOK.jump, OWN("hop"), 0.34);
  add(h + HOOK.land, OWN("land"), 0.38);
  add(h + lineFramesIn(tl, "d1").to - 8, OWN("sparkle"), 0.14);
  // 2. поля
  const fs = S("fields");
  const fb = fieldsBeats(tl);
  add(fs + fb.flip, OWN("fwip"), 0.3);
  add(fs + fb.home, OWN("sticker"), 0.4);
  add(fs + fb.home + 2, OWN("fwip"), 0.24);
  add(fs + fb.home + 12, OWN("sparkle"), 0.13);
  add(fs + fb.school, COMMON("tap"), 0.32);
  add(fs + fb.school + 2, OWN("fwip"), 0.24);
  add(fs + fb.school + 14, OWN("sparkle"), 0.13);
  add(fs + fb.write, OWN("pencil"), 0.34, (fb.writeEnd - fb.write) / FPS);
  add(fs + fb.writeEnd, OWN("sparkle"), 0.13);
  add(fs + fb.route, COMMON("whoosh"), 0.07);
  add(fs + fb.glow, OWN("sparkle"), 0.2);
  // 3. не совпадает
  const ms = S("mismatch");
  const mb = mismatchBeats(tl);
  add(ms + 4, OWN("fwip"), 0.12);
  add(ms + mb.arrive, OWN("land"), 0.2);
  add(ms + mb.link, COMMON("tap"), 0.14);
  add(ms + mb.neq, OWN("land"), 0.24);
  add(ms + mb.leave, COMMON("whoosh"), 0.05);
  add(ms + mb.lens, COMMON("whoosh"), 0.1);
  [0, 1].forEach((i) => add(ms + foundAtOf(mb, i), OWN("sparkle"), 0.18));
  // 4. заявка
  const as = S("apply");
  const ab = applyBeats(tl);
  add(as + 4, COMMON("whoosh"), 0.08);
  add(as + 10, COMMON("paper"), 0.22);
  add(as + 8, OWN("hop"), 0.26);
  add(as + 30, OWN("land"), 0.3);
  ab.fills.forEach((at) => {
    add(as + at, COMMON("tap"), 0.28);
    add(as + at + 1, COMMON("typing"), 0.07, 0.3);
  });
  add(as + ab.submit, COMMON("tap"), 0.34);
  add(as + ab.chat, COMMON("whoosh"), 0.07);
  add(as + ab.send, COMMON("tap"), 0.34);
  add(as + ab.sent, OWN("send"), 0.36);
  add(as + ab.gps, OWN("sticker"), 0.44);
  add(as + ab.back, OWN("hop"), 0.26);
  // 5. группа и пробная поездка
  const ts = S("trial");
  const tb = trialBeats(tl);
  add(ts + 38, OWN("land"), 0.3);
  [12, 20, 28].forEach((x) => add(ts + x, OWN("hop"), 0.12));
  add(ts + tb.gather + 6, OWN("sparkle"), 0.16);
  add(ts + tb.formed, OWN("sparkle"), 0.24);
  [0, 4, 6, 10].forEach((x, i) => add(ts + tb.pop + x, OWN("fwip"), i ? 0.2 : 0.4));
  [0, 1, 2].forEach((i) => add(ts + tb.board + i * 5, OWN("hop"), 0.22));
  add(ts + tb.go, COMMON("car"), 0.2, (tb.atSchool - tb.go) / FPS + 0.3);
  add(ts + tb.atSchool + 4, COMMON("bell"), 0.13);
  add(ts + tb.back, COMMON("car"), 0.2, (tb.atHome - tb.back) / FPS + 0.3);
  add(ts + tb.meet, OWN("hop"), 0.28);
  add(ts + tb.meet + 14, OWN("land"), 0.24);
  add(ts + tb.decide, OWN("sparkle"), 0.18);
  // 6. финал
  const cs = S("cta");
  add(cs, OWN("hop"), 0.3);
  add(cs + CTA_CHIME, COMMON("chime"), 0.3);
  return out;
};

export const Bg47Audio: React.FC<{ readonly tl: Bg47Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const s = (sec: number) => Math.round(sec * FPS);
  // интервалы речи: музыка мягко уходит под голос
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
    return v * interpolate(f, [0, 0.6 * FPS, total - 2.5 * FPS, total - 2], [0.6, 1, 1, 0], clamp);
  };
  const apply = s(sceneOf(tl, "apply").from);
  const music = [
    { src: "audio/music-story-morning.mp3", from: 0, to: apply + FPS, gain: 0.9 },
    { src: "audio/music-story-warm.mp3", from: apply, to: total, gain: 1 },
  ];
  const sfx = useMemo(() => bg47Sfx(tl), [tl]);
  return (
    <>
      {music.map((m) => (
        <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={m.from} durationInFrames={m.to - m.from}>
          <Audio
            src={staticFile(m.src)}
            trimBefore={m.from}
            volume={(f) => duck(f + m.from) * m.gain * interpolate(f + m.from, [m.from, m.from + FPS, m.to - FPS, m.to], [m.from === 0 ? 1 : 0, 1, 1, m.to >= total ? 1 : 0], clamp)}
          />
        </Sequence>
      ))}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.max(14, s(x.dur)) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur ? interpolate(f, [0, 3, dur - 6, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.who})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG47_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
