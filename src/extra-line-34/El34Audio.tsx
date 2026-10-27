// Звук №34: голоса по шкале фактической речи, тихая подложка и комнатная
// атмосфера (приглушаются под репликами), тёплое разрешение под финалом и
// мягкие звуки действий. Что, где и как громко — sound.ts.
// Отдельные дорожки для замеров громкости: --props='{"el34Stem":"bed"}'
// (voice | bed | room | sfx); без параметра звучит всё.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { getInputProps, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { EL_VIDEO } from "./script";
import { BED, BED_END, bedEndCue, bedVolume, ROOM, sfxCues } from "./sound";

const FPS = EL_VIDEO.fps;
// мягкие края отрезка файла (набор на ноутбуке), кадры
const CUT_IN = 2;
const CUT_OUT = 4;

export const El34Audio: React.FC = () => {
  const tl = useTimeline();
  const stem = getInputProps().el34Stem;
  const on = (k: "voice" | "bed" | "room" | "sfx") => !stem || stem === k;
  const snd = useMemo(() => ({ sfx: sfxCues(tl), bed: bedVolume(tl, BED), room: bedVolume(tl, ROOM), end: bedEndCue(tl) }), [tl]);
  return (
    <>
      {on("voice")
        ? tl.cues.map((c) =>
            c.file ? (
              <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
                <Audio src={staticFile(`${EL_VIDEO.voiceDir}/${c.file}`)} />
              </Sequence>
            ) : null,
          )
        : null}
      {on("bed") ? (
        <>
          <Sequence name="Подложка" durationInFrames={tl.frames}>
            <Audio src={staticFile(BED.file)} volume={snd.bed} loop loopVolumeCurveBehavior="extend" />
          </Sequence>
          <Sequence name="Подложка: финал" from={snd.end.frame} durationInFrames={snd.end.dur} premountFor={FPS}>
            <Audio src={staticFile(BED_END.file)} volume={snd.end.volume} />
          </Sequence>
        </>
      ) : null}
      {on("room") ? (
        <Sequence name="Атмосфера комнаты" durationInFrames={tl.frames}>
          <Audio src={staticFile(ROOM.file)} volume={snd.room} loop loopVolumeCurveBehavior="extend" />
        </Sequence>
      ) : null}
      {on("sfx")
        ? snd.sfx.map((x) => {
            const dur = x.dur;
            return (
              <Sequence key={`${x.id}-${x.frame}`} name={`Эффект: ${x.id}`} from={x.frame} durationInFrames={dur ?? 2 * FPS} premountFor={FPS}>
                <Audio src={staticFile(x.file)} trimBefore={x.trim} volume={dur ? (f) => x.volume * Math.min(1, (f + 1) / CUT_IN, (dur - f) / CUT_OUT) : x.volume} />
              </Sequence>
            );
          })
        : null}
    </>
  );
};
