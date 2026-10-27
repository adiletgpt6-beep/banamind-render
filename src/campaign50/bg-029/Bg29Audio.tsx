// Звук ролика: голос диктора и немного сдержанных эффектов — предметы
// мягко ложатся на стол, щелчок пряжки, отметки «готово», шелест
// переходов. Музыки нет: спокойный голос важнее фона.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { Sequence, staticFile } from "remotion";
import { BELT } from "./scenes/Belt";
import { HOOK } from "./scenes/Hook";
import { PICKUP } from "./scenes/Pickup";
import { WATER } from "./scenes/Water";
import { BG29_VIDEO } from "./script";
import { sceneOf, type Bg29Timeline } from "./timing";

const FPS = BG29_VIDEO.fps;
const DIR = BG29_VIDEO.audioDir;
const s = (sec: number) => Math.round(sec * FPS);

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg29Audio: React.FC<{ readonly tl: Bg29Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const cueFrom = (id: string) => Math.round((tl.cues.find((c) => c.id === id)?.from ?? 0) * FPS);
    const out: Sfx[] = [];
    const h = at("hook");
    HOOK.place.forEach((p) => out.push({ at: h + p, src: "sfx/tap.mp3", volume: 0.4 }));
    const b = at("belt");
    out.push({ at: b + BELT.click, src: "sfx/snap.mp3", volume: 0.5 });
    out.push({ at: cueFrom("n03") + 30, src: "sfx/chime.mp3", volume: 0.14 });
    const w = at("water");
    out.push({ at: w + WATER.stand, src: "sfx/tap.mp3", volume: 0.35 });
    const p = at("pickup");
    out.push({ at: p + PICKUP.flip, src: "sfx/pop.mp3", volume: 0.22 });
    const ct = at("cta");
    out.push({ at: ct + 20, src: "sfx/chime.mp3", volume: 0.18 });
    for (const sc of tl.scenes.slice(1)) out.push({ at: sc.from - 10, src: "sfx/whoosh.mp3", volume: 0.1 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);
  return (
    <>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG29_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
