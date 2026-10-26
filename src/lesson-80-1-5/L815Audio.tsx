// Звук ролика: голоса по шкале, тихий фон комнаты, бумага и вода в
// моменты действий (sound.ts). Музыки нет.
import { Audio } from "@remotion/media";
import { useContext, useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { TimelineContext } from "./context";
import { L815_VIDEO } from "./script";
import { l815Sound } from "./sound";

const FPS = L815_VIDEO.fps;
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const L815Audio: React.FC = () => {
  const tl = useContext(TimelineContext);
  const sfx = useMemo(() => l815Sound(tl), [tl]);
  const total = tl.durationInFrames;
  const roomLoops = Math.ceil(total / (10 * FPS));
  return (
    <>
      {/* фон комнаты: петля 10 с, очень тихо, плавный вход и выход */}
      {Array.from({ length: roomLoops }, (_, i) => {
        const from = i * 10 * FPS;
        const dur = Math.min(10 * FPS, total - from);
        return dur > 0 ? (
          <Sequence key={`room-${i}`} name="Фон комнаты" from={from} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile("audio/lesson-80-1-5/sfx/room-tone.mp3")} volume={(f) => 0.5 * interpolate(f + from, [0, FPS, total - 2 * FPS, total - 1], [0, 1, 1, 0], clampOpt)} />
          </Sequence>
        ) : null;
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        const fade = x.fade ? Math.round(x.fade * FPS) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clampOpt) : 1)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={c.audioFromFrame} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${L815_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
