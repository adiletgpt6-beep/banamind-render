// Звук фильма 80-1-11: голоса в моменты реплик; непрерывный очень тихий тон
// комнаты; бытовые звуки строго по событиям хореографии: дверь, сумка на
// ковёр, мягкие шаги в носках (по моментам постановки стопы из рига),
// шорох одежды при посадке и подъёме, страницы у читающих учеников, книга
// учителя, налив воды из кувшина в чашку, тонкая струя на землю (только пока
// чашка наклонена и вода льётся), чашка на столике, бумага, карандаш (только
// пока он касается карточки). Музыки, сигналов и «магических» звуков нет.
// Эффекты существенно тише речи (уровни ниже; проверка — в QA).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { contactFrames, trackOf } from "../rig/gait";
import { FPS } from "../core/video";
import type { Choreo } from "./choreo";
import { CAST } from "./cast";
import { FILM } from "./script";
import type { L80Timeline } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s2f = (s: number) => Math.round(s * FPS);
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);
const COMMON = (n: string) => staticFile(`audio/sfx-${n}.mp3`);

// Громкость голоса и эффектов (линейная): голос 0,84; бытовые звуки — на
// 18–25 дБ тише речи (по пиковой мгновенной громкости, проверка — в QA);
// SFX_GAIN поднимает очень тихие исходные файлы эффектов до этого уровня.
export const VOICE_VOLUME = 0.84;
export const ROOM_VOLUME = 0.5;
export const SFX_GAIN = 2.8;

type Hit = { readonly at: number; readonly src: string; readonly volume: number; readonly name: string };

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo }> = ({ tl, ch }) => {
  const total = tl.durationInFrames;
  const ev = ch.events;
  const steps = useMemo(() => {
    const out: { at: number; who: string; vol: number }[] = [];
    const walkers = [
      { who: "amir", ctl: ch.amir, stride: CAST.find((p) => p.id === "amir")!.look.build.stride, vol: 0.16 },
      { who: "yusuf", ctl: ch.yusuf, stride: CAST.find((p) => p.id === "yusuf")!.look.build.stride, vol: 0.11 },
      { who: "bilal", ctl: ch.bilal, stride: CAST.find((p) => p.id === "bilal")!.look.build.stride, vol: 0.16 },
      { who: "teacher", ctl: ch.teacher, stride: 240, vol: 0.2 },
    ];
    for (const w of walkers) {
      const track = trackOf(w.ctl.place, 0, total, w.stride);
      for (const at of contactFrames(track)) if (at > 0 && at < total - 2) out.push({ at, who: w.who, vol: w.vol });
    }
    return out;
  }, [ch, total]);
  const hits: Hit[] = [
    { at: ev.doorOpen - 2, src: SFX("door-open"), volume: 0.5, name: "дверь открывается" },
    { at: ev.doorClosed - 3, src: SFX("door-close"), volume: 0.42, name: "дверь закрывается" },
    { at: ev.bagDown - 2, src: SFX("bag-down"), volume: 0.5, name: "сумка на ковёр" },
    { at: ev.bookDown - 22, src: SFX("page"), volume: 0.28, name: "учитель закрывает книгу" },
    { at: ev.bookDown - 4, src: SFX("book-down"), volume: 0.36, name: "книга на столе" },
    { at: ev.pourCup.from - 2, src: SFX("pour-cup"), volume: 0.44, name: "вода в чашку" },
    { at: ev.cupTaken - 2, src: SFX("cup-set"), volume: 0.14, name: "чашка снята с подноса" },
    { at: ev.cupDown - 2, src: SFX("cup-set"), volume: 0.4, name: "чашка на столике" },
    { at: ev.cardTaken - 4, src: COMMON("paper"), volume: 0.1, name: "бумага: карточка" },
    { at: ev.cardPlaced - 6, src: COMMON("paper"), volume: 0.1, name: "бумага: карточка у горшка" },
    ...ev.sits.map((s) => ({ at: s.at + 2, src: SFX("cloth"), volume: s.who === "teacher" ? 0.32 : 0.24, name: `одежда: ${s.who} ${s.up ? "встаёт" : "садится"}` })),
    // шелест слышен лишь у каждой третьей страницы — фон остаётся почти тихим
    ...ev.pageFlips.filter((_, i) => i % 3 === 0).map((p) => ({ at: p.at + 3, src: SFX("page"), volume: 0.06, name: `страница: ${p.id}` })),
    ...steps.map((s) => ({ at: s.at - 1, src: SFX("step"), volume: s.vol, name: `шаг: ${s.who}` })),
  ];
  const pencil = ev.writeSpans.flatMap((sp) => {
    const loop = s2f(1.85);
    const out: { from: number; len: number; a: number; b: number }[] = [];
    for (let f = sp.from; f < sp.to; f += loop) out.push({ from: f, len: Math.min(loop, sp.to - f), a: sp.from, b: sp.to });
    return out;
  });
  const trickleLoop = s2f(3.8);
  const water = (() => {
    const out: { from: number; len: number }[] = [];
    for (let f = ev.waterOn.from; f < ev.waterOn.to + 6; f += trickleLoop) out.push({ from: f, len: Math.min(trickleLoop, ev.waterOn.to + 6 - f) });
    return out;
  })();
  const roomLoop = s2f(29.4);
  const rooms: number[] = [];
  for (let f = 0; f < total; f += roomLoop) rooms.push(f);
  return (
    <>
      {rooms.map((f) => (
        <Sequence key={`room-${f}`} name="Тон комнаты" from={f} durationInFrames={Math.min(roomLoop, total - f)}>
          <Audio src={SFX("room")} volume={(t) => ROOM_VOLUME * interpolate(t + f, [0, 20, total - 40, total - 2], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}
      {hits.map((h, i) =>
        h.at >= 0 && h.at < total ? (
          <Sequence key={`hit-${i}`} name={`Эффект: ${h.name}`} from={h.at} premountFor={FPS}>
            <Audio src={h.src} volume={h.volume * SFX_GAIN} />
          </Sequence>
        ) : null,
      )}
      {water.map((w) => (
        <Sequence key={`water-${w.from}`} name="Струя на землю" from={w.from} durationInFrames={w.len} premountFor={FPS}>
          <Audio src={SFX("trickle")} volume={(f) => 0.42 * SFX_GAIN * 1.4 * interpolate(f + w.from, [ev.waterOn.from, ev.waterOn.from + 6, ev.waterOn.to - 4, ev.waterOn.to + 4], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}
      {pencil.map((t) => {
        const edge = Math.max(1, Math.min(5, Math.floor((t.b - t.a) / 2) - 1));
        return (
          <Sequence key={`pencil-${t.from}`} name="Карандаш" from={t.from} durationInFrames={t.len} premountFor={FPS}>
            <Audio src={SFX("pencil")} volume={(f) => 0.4 * SFX_GAIN * 0.7 * interpolate(f + t.from, [t.a, t.a + edge, t.b - edge, t.b], [0, 1, 1, 0], clamp)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={`v-${c.id}`} name={`Реплика ${c.id} (${c.role})`} from={s2f(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={VOICE_VOLUME} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
