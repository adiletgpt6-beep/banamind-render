// Звук фильма 80-1-8: голоса в моменты реплик, непрерывный тихий тон
// комнаты, короткие звуки реквизита по событиям (бумага: лодочка, рисунок,
// отдельный лист, карточка; книга на подставке; карандаш только пока он
// касается бумаги). Музыки нет.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "../core/video";
import type { Choreo } from "./choreo";
import { FILM } from "./script";
import type { L80Timeline } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s2f = (s: number) => Math.round(s * FPS);
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);
const COMMON = (n: string) => staticFile(`audio/sfx-${n}.mp3`);

type Hit = { readonly at: number; readonly src: string; readonly volume: number; readonly name: string };

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo }> = ({ tl, ch }) => {
  const total = tl.durationInFrames;
  const ev = ch.events;
  const hits: Hit[] = [
    { at: ev.boatMove.from - 2, src: COMMON("paper"), volume: 0.1, name: "бумага: лодочка" },
    { at: ev.sheetLaid - 10, src: COMMON("paper"), volume: 0.14, name: "бумага: рисунок" },
    { at: ev.looseTaken - 4, src: COMMON("paper"), volume: 0.14, name: "бумага: лист взят" },
    { at: ev.loosePlaced - 8, src: COMMON("paper"), volume: 0.12, name: "бумага: лист рядом с лодочкой" },
    { at: ev.bookLifted - 4, src: SFX("page"), volume: 0.4, name: "книга: взята" },
    { at: ev.bookSet - 3, src: SFX("book-set"), volume: 0.5, name: "книга на подставке" },
    { at: ev.cardTaken - 4, src: COMMON("paper"), volume: 0.12, name: "бумага: карточка" },
    { at: ev.cardPlaced - 6, src: COMMON("paper"), volume: 0.1, name: "бумага: карточка перед Амиром" },
    { at: ev.cardInFolder - 10, src: COMMON("paper"), volume: 0.12, name: "бумага: карточка в папку" },
  ];
  const pencil = ev.writeSpans.flatMap((sp) => {
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
          <Sequence key={`hit-${i}`} name={`Эффект: ${h.name}`} from={h.at} premountFor={FPS}>
            <Audio src={h.src} volume={h.volume} />
          </Sequence>
        ) : null,
      )}
      {pencil.map((t) => {
        // короткие штрихи (одно слово): края не длиннее половины отрезка
        const edge = Math.max(1, Math.min(5, Math.floor((t.b - t.a) / 2) - 1));
        return (
          <Sequence key={`pencil-${t.from}`} name="Карандаш" from={t.from} durationInFrames={t.len} premountFor={FPS}>
            <Audio src={SFX("pencil")} volume={(f) => 0.55 * interpolate(f + t.from, [t.a, t.a + edge, t.b - edge, t.b], [0, 1, 1, 0], clamp)} />
          </Sequence>
        );
      })}
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
