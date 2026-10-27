// Звук ролика: голоса (диктор и мама), тихая тёплая музыкальная подложка
// (приглушается под речью) и немного сдержанных эффектов: «росчерк»
// линии, письмо ручкой, щелчок мыши, набор текста, нажатие «отправить»,
// мягкий колокольчик пробы. Без громких и навязчивых звуков.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { Sequence, staticFile } from "remotion";
import { formTimes, searchTimes, trialTimes } from "./layout";
import { BG49_VIDEO } from "./script";
import { sceneOf, type Bg49Timeline } from "./timing";

const FPS = BG49_VIDEO.fps;
const DIR = BG49_VIDEO.audioDir;
const s = (sec: number) => Math.round(sec * FPS);

type Sfx = {
  readonly at: number;
  readonly src: string;
  readonly volume: number;
};

export const Bg49Audio: React.FC<{ readonly tl: Bg49Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const out: Sfx[] = [];
    const h = at("hook");
    out.push({ at: h + 4, src: "sfx/draw.mp3", volume: 0.32 });
    out.push({ at: h + s(1.5), src: "sfx/pop.mp3", volume: 0.3 });
    const n = at("notebook");
    out.push({ at: n + s(1.9), src: "sfx/pen.mp3", volume: 0.26 });
    const m01 = tl.cues.find((c) => c.id === "m01")!;
    out.push({
      at: Math.min(
        s(m01.to) + s(0.6),
        n + sceneOf(tl, "notebook").frames - s(2.0),
      ),
      src: "sfx/draw.mp3",
      volume: 0.22,
    });
    const sr = at("search");
    const st = searchTimes(tl);
    out.push({ at: sr + st.typeFrom, src: "sfx/typing.mp3", volume: 0.22 });
    out.push({ at: sr + st.click, src: "sfx/click.mp3", volume: 0.4 });
    out.push({ at: sr + st.press, src: "sfx/click.mp3", volume: 0.4 });
    const fo = at("form");
    const ft = formTimes(tl);
    [0, 1, 2].forEach((i) =>
      out.push({
        at: fo + ft.fill0 + ft.fillStep * i + ft.fillStep - 4,
        src: "sfx/tick.mp3",
        volume: 0.22,
      }),
    );
    out.push({ at: fo + ft.tap, src: "sfx/send.mp3", volume: 0.32 });
    out.push({ at: fo + ft.searchIn + 20, src: "sfx/draw.mp3", volume: 0.18 });
    const t = at("trial");
    const tt = trialTimes(tl);
    out.push({ at: t + tt.beam, src: "sfx/shimmer.mp3", volume: 0.24 });
    out.push({ at: t + tt.badge, src: "sfx/chime.mp3", volume: 0.18 });
    const c = at("cta");
    out.push({ at: c + 6, src: "sfx/draw.mp3", volume: 0.22 });
    out.push({ at: c + s(0.9), src: "sfx/chime.mp3", volume: 0.16 });
    for (const sc of tl.scenes.slice(1))
      if (sc.id !== "trial" && sc.id !== "cta")
        out.push({ at: sc.from - 10, src: "sfx/whoosh.mp3", volume: 0.1 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);

  // Музыка приглушается под речью (плавно, за ≈ 0,3 с) и затухает в конце.
  const speech = useMemo(
    () => tl.cues.map((c) => [s(c.from) - 8, s(c.to) + 8] as const),
    [tl],
  );
  const musicVolume = (f: number) => {
    let near = Infinity;
    for (const [a, b] of speech) {
      if (f >= a && f <= b) {
        near = 0;
        break;
      }
      near = Math.min(near, f < a ? a - f : f - b);
    }
    const duck = Math.min(1, near / 10);
    const base = 0.05 + 0.07 * duck;
    const fadeIn = Math.min(1, f / 20);
    const fadeOut = Math.min(1, (total - f) / 45);
    return base * fadeIn * Math.max(0, fadeOut);
  };

  return (
    <>
      <Sequence name="Музыка" durationInFrames={total}>
        <Audio src={staticFile(`${DIR}/music.mp3`)} volume={musicVolume} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence
          key={`sfx-${i}`}
          name={`Эффект: ${x.src}`}
          from={x.at}
          premountFor={FPS}
        >
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence
            key={c.id}
            name={`Голос: ${c.id}`}
            from={s(c.audioFrom)}
            durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
            premountFor={FPS}
          >
            <Audio
              src={staticFile(`${BG49_VIDEO.voiceDir}/${c.file}`)}
              volume={1}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
