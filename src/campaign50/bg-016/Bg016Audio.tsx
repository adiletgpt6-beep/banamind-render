// Звук BG-016: голоса реплик и немногочисленные звуки (общие файлы проекта
// public/audio/sfx-*.mp3, только чтение). Музыки нет — по заданию лучше
// тишина, чем навязчивый фон.
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { cueOf, FPS, sceneSpan } from "./context";
import { BG016_VIDEO } from "./script";
import type { Timeline } from "./timeline";
import { wordTime } from "./timeline";

const s = (sec: number) => Math.round(sec * FPS);

type Sfx = { readonly src: string; readonly at: number; readonly vol: number; readonly len?: number; readonly rate?: number };

export const Bg016Audio: React.FC<{ readonly tl: Timeline }> = ({ tl }) => {
  const dream = sceneSpan(tl, "dream").from;
  const rev = sceneSpan(tl, "reverse").from;
  const tim = sceneSpan(tl, "timers").from;
  const sea = sceneSpan(tl, "search").from;
  const stp = sceneSpan(tl, "steps").from;
  const cta = sceneSpan(tl, "cta").from;
  const n04 = cueOf(tl, "n04");
  const sfx: Sfx[] = [
    // хук: будильники звенят и разом замолкают
    { src: "audio/sfx-alarm.mp3", at: dream, vol: 0.32, len: 0.66 },
    { src: "audio/sfx-chime.mp3", at: dream + 0.9, vol: 0.12 },
    // перемотка и реальное утро
    { src: "audio/sfx-whoosh.mp3", at: rev + 0.05, vol: 0.3, rate: 0.8 },
    { src: "audio/sfx-alarm.mp3", at: rev + 40 / FPS, vol: 0.14, len: 1.1 },
    { src: "audio/sfx-tick.mp3", at: rev + 2.6, vol: 0.08, len: 2.2 },
    // таймеры на стол, телефон
    { src: "audio/sfx-tap.mp3", at: tim + 34 / FPS, vol: 0.3 },
    { src: "audio/sfx-tap.mp3", at: tim + 36 / FPS, vol: 0.26 },
    // набор запроса, выбор BalaGo, наезд
    { src: "audio/sfx-typing.mp3", at: sea + 8 / FPS, vol: 0.14, len: 1.5 },
    { src: "audio/sfx-tap.mp3", at: sea + 74 / FPS, vol: 0.3 },
    { src: "audio/sfx-whoosh.mp3", at: Math.max(sea + 122 / FPS, cueOf(tl, "n03").from + 4 / FPS), vol: 0.2 },
    // карточки шагов
    ...[0, 3, 5, 12].map((w) => ({ src: "audio/sfx-pop.mp3", at: Math.max(stp + 0.1, wordTime(n04, w) - 0.12), vol: 0.14 })),
    // финал
    { src: "audio/sfx-paper.mp3", at: cta, vol: 0.22 },
    { src: "audio/sfx-chime.mp3", at: cta + 0.35, vol: 0.14 },
  ];
  return (
    <>
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`voice ${c.id}`} from={s(c.audioFrom)} layout="none">
            <Audio src={staticFile(`${BG016_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
      {sfx.map((x, i) => (
        <Sequence key={i} name={`sfx ${x.src}`} from={s(x.at)} durationInFrames={x.len ? s(x.len) : undefined} layout="none">
          <Audio src={staticFile(x.src)} volume={x.vol} playbackRate={x.rate ?? 1} />
        </Sequence>
      ))}
    </>
  );
};
