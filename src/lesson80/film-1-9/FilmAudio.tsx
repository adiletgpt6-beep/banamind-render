// Звук фильма 80-1-9: голоса в моменты реплик, непрерывный тихий тон
// комнаты, тихие бытовые звуки строго по действиям: тарелка бережно
// касается столика, мягкое шуршание салфеток (тише — у дальних учеников),
// поднос ставят на столик, кусочек яблока берут с тарелки; во вставке сада —
// едва заметный ветер в листве. Музыки, звуков «правильного ответа» и
// аплодисментов нет; в зрительских паузах — только тон комнаты.
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "../core/video";
import type { Choreo } from "./choreo";
import { GARDEN_TIMING } from "./garden";
import { FILM } from "./script";
import type { ShotSpec } from "./shots";
import type { L80Timeline } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s2f = (s: number) => Math.round(s * FPS);
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);

type Hit = { readonly at: number; readonly src: string; readonly volume: number; readonly name: string };

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo; readonly shots: readonly ShotSpec[] }> = ({ tl, ch, shots }) => {
  const total = tl.durationInFrames;
  const ev = ch.events;
  const hits: Hit[] = [
    { at: ev.plateContact - 1, src: SFX("plate"), volume: 0.55, name: "тарелка на столике" },
    { at: ev.trayOnTable - 1, src: SFX("tray"), volume: 0.45, name: "поднос на столике" },
    { at: ev.sliceTake - 2, src: SFX("slice"), volume: 0.6, name: "кусочек яблока взят" },
  ];
  // салфетки: снята со стопки и (для главных) положена; дальние — тише
  for (const e of ch.log.events) {
    const main = e.recipient === "amir" || e.recipient === "yusuf" || e.recipient === "bilal";
    hits.push({ at: e.take - 2, src: SFX("napkin"), volume: main ? 0.38 : 0.12, name: `салфетка ${e.napkin}: взята` });
    if (main) hits.push({ at: e.settle - 6, src: SFX("napkin"), volume: 0.22, name: `салфетка ${e.napkin}: положена` });
  }
  // сад: ветер в листве только во время вставки; яблоко снято и положено в корзину
  const garden = shots.filter((s) => s.kind === "garden");
  const worker = garden.find((s) => s.garden === "worker");
  if (worker) {
    const w0 = worker.gardenFrom ?? worker.from;
    hits.push({ at: w0 + GARDEN_TIMING.detach - 1, src: SFX("slice"), volume: 0.45, name: "сад: яблоко снято с ветки" });
    hits.push({ at: w0 + GARDEN_TIMING.place - 1, src: SFX("tray"), volume: 0.16, name: "сад: яблоко в корзине" });
  }
  const gFrom = garden.length ? garden[0].from : -1;
  const gTo = garden.length ? garden[garden.length - 1].to : -1;
  const roomLoop = s2f(29.5);
  const rooms: number[] = [];
  for (let f = 0; f < total; f += roomLoop) rooms.push(f);
  return (
    <>
      {rooms.map((f) => (
        <Sequence key={`room-${f}`} name="Тон комнаты" from={f} durationInFrames={Math.min(roomLoop, total - f)}>
          <Audio
            src={SFX("room")}
            volume={(t) => {
              const a = t + f;
              const g = gFrom >= 0 ? 1 - 0.7 * interpolate(a, [gFrom - 6, gFrom + 6, gTo - 6, gTo + 6], [0, 1, 1, 0], clamp) : 1;
              return 0.55 * g * interpolate(a, [0, 20, total - 30, total - 2], [0, 1, 1, 0], clamp);
            }}
          />
        </Sequence>
      ))}
      {gFrom >= 0 ? (
        <Sequence name="Сад: ветер в листве" from={gFrom - 6} durationInFrames={gTo - gFrom + 12}>
          <Audio src={SFX("garden")} volume={(t) => 0.5 * interpolate(t, [0, 12, gTo - gFrom, gTo - gFrom + 12], [0, 1, 1, 0], clamp)} />
        </Sequence>
      ) : null}
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
            <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={0.84} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
