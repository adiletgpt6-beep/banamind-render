// Реклама @hidjaz.premium, 60 с, 1080×1920, 30 fps.
// Сцены идут встык с мягкими переходами; начало каждой сцены совпадает
// с SCENES (переход «съедает» хвост предыдущей сцены), поэтому реплики
// озвучки, привязанные к секундам сцен, не сдвигаются.
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Grain } from "./components/Backdrop";
import { Subtitles } from "./components/Subtitles";
import { CONTENT, FPS, SCENES } from "./content";
import { sans } from "./fonts";
import { Cta } from "./scenes/Cta";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Need } from "./scenes/Need";
import { Showcase } from "./scenes/Showcase";
import { CUES, speechAt } from "./voice";
import "./fonts";

const T = 16; // кадров на переход
const s = (sec: number) => Math.round(sec * FPS);
const ORDER = [
  { id: "hook", C: Hook },
  { id: "need", C: Need },
  { id: "features", C: Features },
  { id: "showcase", C: Showcase },
  { id: "cta", C: Cta },
] as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENT: TransitionPresentation<any>[] = [
  fade(),
  slide({ direction: "from-right" }),
  wipe({ direction: "from-bottom-left" }),
  fade(),
];

const MUSIC = 0.26;
const MUSIC_UNDER_VOICE = 0.08;

const TechBadge: React.FC = () =>
  CONTENT.confirmed ? null : (
    <div style={{ position: "absolute", top: 40, left: 40, padding: "10px 20px", borderRadius: 12, background: "rgba(200,30,30,0.85)", color: "#fff", fontFamily: sans, fontWeight: 800, fontSize: 26 }}>
      ТЕХНИЧЕСКИЙ ПРОГОН · не реклама
    </div>
  );

const Sound: React.FC = () => {
  return (
    <>
      <Audio
        src={staticFile("audio/music.mp3")}
        volume={(fr) => {
          const t = fr / FPS;
          const base = speechAt(t) ? MUSIC_UNDER_VOICE : MUSIC;
          const fadeOut = Math.min(1, Math.max(0, (60 - t) / 1.5));
          return base * Math.min(1, fr / 15) * fadeOut;
        }}
      />
      {[SCENES.need.from, SCENES.features.from, SCENES.showcase.from, SCENES.cta.from].map((t) => (
        <Sequence key={`w${t}`} from={s(t) - 10} durationInFrames={30} layout="none">
          <Audio src={staticFile("audio/sfx-whoosh.mp3")} volume={0.22} />
        </Sequence>
      ))}
      {[0.55, SCENES.cta.from + 1.0].map((t) => (
        <Sequence key={`s${t}`} from={s(t)} durationInFrames={50} layout="none">
          <Audio src={staticFile("audio/sfx-shimmer.mp3")} volume={0.2} />
        </Sequence>
      ))}
      {CUES.filter((c) => c.voice).map((c) => (
        <Sequence key={c.line.id} from={s(c.from)} durationInFrames={s(c.voice!.duration) + 2} layout="none">
          <Audio src={staticFile(`audio/voice/${c.voice!.file}`)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};

export const HidjazAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CONTENT.brand.palette.bg }}>
    <TransitionSeries>
      {ORDER.flatMap(({ id, C }, i) => {
        const dur = s(SCENES[id].dur) + (i < ORDER.length - 1 ? T : 0);
        const seq = (
          <TransitionSeries.Sequence key={id} durationInFrames={dur}>
            <C />
          </TransitionSeries.Sequence>
        );
        return i < ORDER.length - 1
          ? [seq, <TransitionSeries.Transition key={`${id}-t`} presentation={PRESENT[i]} timing={linearTiming({ durationInFrames: T })} />]
          : [seq];
      })}
    </TransitionSeries>
    <Grain opacity={0.035} />
    <Subtitles />
    <TechBadge />
    <Sound />
  </AbsoluteFill>
);
