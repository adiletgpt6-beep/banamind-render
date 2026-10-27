// Звук фильма 80-1-12: голоса в моменты реплик; непрерывный очень тихий тон
// комнаты (под тихой просьбой Юсуфа — ещё тише); короткие звуки только от
// видимых действий: деталь касается стола, упирается в край, скользит,
// встаёт на место; палец вдоль края; книга Билала (страница, закрыта и
// положена), книга Амира закрыта; шорох одежды при посадке учителя и сдвиге
// Амира; мягкие шаги учителя; пустая коробка поднята и поставлена.
// Музыки нет.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "../core/video";
import type { Choreo } from "./choreo";
import { FILM, lineById } from "./script";
import type { L80Timeline } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s2f = (s: number) => Math.round(s * FPS);
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);

// Громкость голосов: все реплики выровнены к одному уровню речи (−16,5 дБFS);
// тихая просьба Юсуфа звучит тише (≈ −3,5 дБ), но остаётся разборчивой.
export const VOICE_GAIN = 0.84;
export const QUIET_GAIN = 0.56;

type Hit = { readonly at: number; readonly src: string; readonly volume: number; readonly name: string };

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo }> = ({ tl, ch }) => {
  const total = tl.durationInFrames;
  const ev = ch.events;
  const hits: Hit[] = [
    ...ev.pieceTaps.map((at, i) => ({ at, src: SFX("piece-tap"), volume: 0.42, name: `деталь касается стола ${i + 1}` })),
    ...ev.bumps.map((at, i) => ({ at: at - 2, src: SFX("piece-bump"), volume: 0.45, name: `деталь упёрлась ${i + 1}` })),
    ...ev.slides.map((at, i) => ({ at, src: SFX("piece-slide"), volume: 0.5, name: `деталь скользит ${i + 1}` })),
    ...ev.fits.map((x) => ({ at: x.at, src: SFX("piece-fit"), volume: 0.55, name: `деталь встала: ${x.id}` })),
    { at: ev.fingerEdge.from, src: SFX("finger-edge"), volume: 0.8, name: "палец вдоль края" },
    { at: ev.boxLift - 2, src: SFX("box-lift"), volume: 0.45, name: "коробка поднята" },
    { at: ev.boxSet - 2, src: SFX("box-set"), volume: 0.5, name: "коробка поставлена" },
    { at: ev.bilalPage - 6, src: SFX("page"), volume: 0.32, name: "страница (Билал)" },
    { at: ev.bilalBookDown - 14, src: SFX("book-down"), volume: 0.42, name: "книга Билала на ковре" },
    { at: ev.amirBookClose - 8, src: SFX("page"), volume: 0.26, name: "книга Амира закрыта" },
    ...ev.cloth.map((at, i) => ({ at, src: SFX("cloth"), volume: 0.4, name: `одежда ${i + 1}` })),
    ...ev.steps.map((at, i) => ({ at, src: SFX("step"), volume: 0.5, name: `шаг ${i + 1}` })),
  ];
  // тон комнаты: мягче под тихой просьбой (реплика 1)
  const q = tl.cues.find((c) => lineById(c.id).quiet);
  const qa = q ? s2f(q.from) - 20 : -1;
  const qb = q ? s2f(q.to) + 20 : -1;
  const roomVol = (f: number) => 0.5 * interpolate(f, [0, 20, total - 30, total - 2], [0, 1, 1, 0], clamp) * (q ? interpolate(f, [qa - 15, qa, qb, qb + 20], [1, 0.55, 0.55, 1], clamp) : 1);
  const roomLoop = s2f(29.4);
  const rooms: number[] = [];
  for (let f = 0; f < total; f += roomLoop) rooms.push(f);
  return (
    <>
      {rooms.map((f) => (
        <Sequence key={`room-${f}`} name="Тон комнаты" from={f} durationInFrames={Math.min(roomLoop, total - f)}>
          <Audio src={SFX("room")} volume={(t) => roomVol(t + f)} />
        </Sequence>
      ))}
      {hits.map((h, i) =>
        h.at >= 0 && h.at < total ? (
          <Sequence key={`hit-${i}`} name={`Эффект: ${h.name}`} from={h.at} premountFor={FPS}>
            <Audio src={h.src} volume={h.volume} />
          </Sequence>
        ) : null,
      )}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={`v-${c.id}`} name={`Реплика ${c.id} (${c.role})`} from={s2f(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={lineById(c.id).quiet ? QUIET_GAIN : VOICE_GAIN} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
