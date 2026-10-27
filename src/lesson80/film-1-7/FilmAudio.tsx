// Звук фильма 80-1-7: голоса в моменты реплик, непрерывный тихий тон
// комнаты, короткие звуки реквизита по событиям (бумага, подставка глобуса,
// один щелчок выключателя, ткань занавески, тихий ход глобуса только во
// время поворотов, карандаш только пока линия появляется). Музыки нет.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "../core/video";
import type { Choreo } from "./choreo";
import { FILM } from "./script";
import { cueById, type L80Timeline } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s2f = (s: number) => Math.round(s * FPS);
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);
const COMMON = (n: string) => staticFile(`audio/sfx-${n}.mp3`);

type Hit = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number; readonly name: string };

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo }> = ({ tl, ch }) => {
  const total = tl.durationInFrames;
  const ev = ch.events;
  const L = (id: number) => s2f(cueById(tl, id).from);
  const hits: Hit[] = [
    { at: L(1) - 2, src: COMMON("paper"), volume: 0.16, name: "бумага: рисунки" },
    { at: L(1) + Math.round((s2f(cueById(tl, 1).to) - L(1)) * 0.5), src: COMMON("paper"), volume: 0.12, name: "бумага: второй лист" },
    { at: ev.globeContact - 2, src: SFX("globe-set"), volume: 0.5, name: "подставка на столе" },
    { at: ev.lampOn, src: SFX("lamp-click"), volume: 0.55, name: "щелчок лампы" },
    { at: ev.curtainClose.from, src: SFX("curtain"), volume: 0.4, name: "занавеска прикрыта" },
    { at: ev.curtainOpen.from, src: SFX("curtain"), volume: 0.4, name: "занавеска открыта" },
    { at: ev.sheetTaken - 6, src: COMMON("paper"), volume: 0.18, name: "бумага: чистый лист" },
  ];
  // ход глобуса: цикл 1,3 с на время каждого поворота с плавным входом и выходом
  const turns = tl.spins.flatMap((sp) => {
    const a = s2f(sp.from);
    const b = s2f(sp.to);
    const loop = s2f(1.3);
    const out: { from: number; len: number; a: number; b: number }[] = [];
    for (let f = a; f < b; f += loop) out.push({ from: f, len: Math.min(loop, b - f), a, b });
    return out;
  });
  const pencil = ev.drawSpans.flatMap((sp) => {
    const loop = s2f(1.9);
    const out: { from: number; len: number; a: number; b: number }[] = [];
    for (let f = sp.from; f < sp.to; f += loop) out.push({ from: f, len: Math.min(loop, sp.to - f), a: sp.from, b: sp.to });
    return out;
  });
  const roomLoop = s2f(29.5);
  const rooms: number[] = [];
  for (let f = 0; f < total; f += roomLoop) rooms.push(f);
  return (
    <>
      {rooms.map((f) => (
        <Sequence key={`room-${f}`} name="Тон комнаты" from={f} durationInFrames={Math.min(roomLoop, total - f)}>
          <Audio src={SFX("room")} volume={(t) => 0.55 * interpolate(t + f, [0, 20, total - 30, total - 2], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}
      {hits.map((h, i) =>
        h.at >= 0 && h.at < total ? (
          <Sequence key={`hit-${i}`} name={`Эффект: ${h.name}`} from={h.at} durationInFrames={h.dur ? s2f(h.dur) : undefined} premountFor={FPS}>
            <Audio src={h.src} volume={h.volume} />
          </Sequence>
        ) : null,
      )}
      {turns.map((t) => (
        <Sequence key={`turn-${t.from}`} name="Ход глобуса" from={t.from} durationInFrames={t.len} premountFor={FPS}>
          <Audio src={SFX("globe-turn")} volume={(f) => 0.5 * interpolate(f + t.from, [t.a, t.a + 12, t.b - 14, t.b], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}
      {pencil.map((t) => (
        <Sequence key={`pencil-${t.from}`} name="Карандаш" from={t.from} durationInFrames={t.len} premountFor={FPS}>
          <Audio src={SFX("pencil")} volume={(f) => 0.6 * interpolate(f + t.from, [t.a, t.a + 6, t.b - 8, t.b], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={`v-${c.id}`} name={`Реплика ${c.id} (${c.role})`} from={s2f(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={0.84} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
