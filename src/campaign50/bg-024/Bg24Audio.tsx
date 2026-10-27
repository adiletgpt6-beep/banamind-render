// Звук ролика: голос диктора и немного сдержанных эффектов (нажатие
// кнопки, мягкие щелчки деталей пазла, тихий «отказ» несовпавшей детали,
// колокольчик совпадения, шелест переходов). Музыки нет — по сценарию
// лучше тишина, чем навязчивый фон.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { Sequence, staticFile } from "remotion";
import { HOOK } from "./scenes/Hook";
import { PUZZLE } from "./scenes/Puzzle";
import { BG24_VIDEO } from "./script";
import { sceneOf, type Bg24Timeline } from "./timing";

const FPS = BG24_VIDEO.fps;
const DIR = BG24_VIDEO.audioDir;
const s = (sec: number) => Math.round(sec * FPS);

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg24Audio: React.FC<{ readonly tl: Bg24Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const out: Sfx[] = [];
    const h = at("hook");
    out.push({ at: h + HOOK.tap, src: "sfx/tap.mp3", volume: 0.45 });
    out.push({ at: h + HOOK.burst, src: "sfx/pop.mp3", volume: 0.3 });
    const p = at("puzzle");
    out.push({ at: p + 10, src: "sfx/snap.mp3", volume: 0.3 });
    out.push({ at: p + PUZZLE.wrongHover + 4, src: "sfx/deny.mp3", volume: 0.22 });
    out.push({ at: p + PUZZLE.rightSnap, src: "sfx/snap.mp3", volume: 0.4 });
    out.push({ at: p + PUZZLE.rightSnap + 6, src: "sfx/chime.mp3", volume: 0.16 });
    const m = at("match");
    [8, 20, 32].forEach((k) => out.push({ at: m + k, src: "sfx/tick.mp3", volume: 0.22 }));
    const ct = at("cta");
    out.push({ at: ct + 16, src: "sfx/snap.mp3", volume: 0.3 });
    out.push({ at: ct + 20, src: "sfx/chime.mp3", volume: 0.2 });
    for (const sc of tl.scenes.slice(1)) out.push({ at: sc.from - 8, src: "sfx/whoosh.mp3", volume: 0.12 });
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
            <Audio src={staticFile(`${BG24_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
