// Звук фильма: голоса (файл на реплику) и очень тихая естественная среда
// без музыки: тон комнаты, отдалённые птицы и шелест листвы на крупных
// планах дерева, шорох бумаги и травинки в моменты действий.
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile } from "remotion";
import type { Timeline } from "../core/timing";
import { FPS } from "../core/video";
import { FILM } from "./script";

export type SfxEvent = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FilmAudio: React.FC<{ readonly tl: Timeline; readonly sfx: readonly SfxEvent[]; readonly hasVoice: boolean }> = ({ tl, sfx, hasVoice }) => (
  <>
    {sfx.map((x, i) => {
      const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
      const fade = x.fade ? Math.round(x.fade * FPS) : 0;
      return (
        <Sequence key={`sfx-${i}`} name={`Фон: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
        </Sequence>
      );
    })}
    {hasVoice
      ? tl.cues.map((c) =>
          c.file ? (
            <Sequence key={c.id} name={`Голос №${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
              <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={1} />
            </Sequence>
          ) : null,
        )
      : null}
  </>
);
