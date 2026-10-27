// Звук фильма 80-1-13: голоса в моменты реплик; непрерывный очень тихий тон
// комнаты; короткие тихие звуки только от видимых действий: деталь ложится в
// коробку (три разных варианта по очереди), крышка закрыта, коробка поднята
// и поставлена на полку, книжки подняты, поставлены на полку и сдвинуты,
// карточка на полочке доски, шорох одежды (присед, посадка). Шаги по ковру
// в носках не озвучиваются (громкие шаги не нужны). Музыки нет.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "../core/video";
import type { Choreo } from "./choreo";
import { FILM, lineById } from "./script";
import type { L80Timeline } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);

// Громкость голосов: все реплики выровнены к одному уровню речи.
export const VOICE_GAIN = 0.84;

type Hit = { readonly at: number; readonly src: string; readonly volume: number; readonly name: string };

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo }> = ({ tl, ch }) => {
  const total = tl.durationInFrames;
  const ev = ch.events;
  const hits: Hit[] = [
    ...ev.pieceIn.map((at, i) => ({ at, src: SFX(`piece-box-${(i % 3) + 1}`), volume: 0.42 + (i % 2) * 0.06, name: `деталь в коробке ${i + 1}` })),
    { at: ev.boxClose, src: SFX("box-close"), volume: 0.5, name: "крышка закрыта" },
    { at: ev.boxLift, src: SFX("box-lift"), volume: 0.45, name: "коробка поднята" },
    { at: ev.boxSet, src: SFX("box-set"), volume: 0.5, name: "коробка на полке" },
    ...ev.bookLift.map((at, i) => ({ at, src: SFX("book-lift"), volume: 0.5, name: `книжка поднята ${i + 1}` })),
    ...ev.bookSet.map((at, i) => ({ at, src: SFX("book-set"), volume: 0.5, name: `книжка на полке ${i + 1}` })),
    ...ev.bookSlide.map((at, i) => ({ at, src: SFX("book-slide"), volume: 0.45, name: `книжки сдвинуты ${i + 1}` })),
    ...ev.cardSet.map((at, i) => ({ at, src: SFX("card-set"), volume: 0.35, name: `карточка на полочке ${i + 1}` })),
    ...ev.cloth.map((at, i) => ({ at, src: SFX("cloth"), volume: 0.35, name: `одежда ${i + 1}` })),
  ];
  const roomVol = (f: number) => 0.5 * interpolate(f, [0, 20, total - 30, total - 2], [0, 1, 1, 0], clamp);
  const roomLoop = Math.round(29.4 * FPS);
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
          <Sequence key={`v-${c.id}`} name={`Реплика ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={VOICE_GAIN} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

export { lineById };
