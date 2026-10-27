// Звук ролика: голоса (мама в кадре, закадровый диктор) и сдержанные
// эффекты сцен — касания экрана, отправка, шелест и сгибы бумаги, тихие
// отметки. Музыки нет: по сценарию лучше тишина, чем навязчивый фон.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { Sequence, staticFile } from "remotion";
import { SCENES } from "./scenes";
import { BG25_VIDEO } from "./script";
import { SFX } from "./sfx";
import type { Bg25Timeline } from "./timing";

const FPS = BG25_VIDEO.fps;
const DIR = BG25_VIDEO.audioDir;
const s = (sec: number) => Math.round(sec * FPS);

export const Bg25Audio: React.FC<{ readonly tl: Bg25Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const out = tl.scenes.flatMap((sc) => SCENES[sc.id].sfx(tl).map((x) => ({ ...x, at: sc.from + x.at })));
    for (const sc of tl.scenes.slice(1)) out.push({ at: sc.from - 8, src: SFX.rustle, volume: 0.1 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6).sort((a, b) => a.at - b.at);
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
            <Audio src={staticFile(`${BG25_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
