// LIVE-004 v3 — спокойный монтаж четвёртого живого видео по правилам
// live/STYLE.md: оригинальная съёмка и голос, три смысловые вставки,
// спокойные субтитры, естественный финал. Призыв (ссылка в профиле и
// WhatsApp) Адилет произносит сам — он остаётся только в его речи и в
// субтитрах: без повторной озвучки, карточек и финальной заставки.
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import "../../fonts";
import { Captions } from "../../live/Captions";
import { LIVE_COLORS as C } from "../../live/theme";
import { LIVE04 } from "../../live04/timing";
import { LIVE04_PHRASES, LIVE04_WORDS } from "../../live04/transcript";
import { RouteInsert, StepsInsert, WeekInsert } from "./Inserts";
import { V3_END_SEC, V3_SFX } from "./plan-v3";

export const LIVE004_V3_FRAMES = Math.round(V3_END_SEC * LIVE04.fps);

const Sound: React.FC = () => {
  const fps = LIVE04.fps;
  const speaking = (t: number) => LIVE04_WORDS.some((w) => t >= w.start - 0.25 && t <= w.end + 0.35);
  const music = (f: number) => {
    const t = f / fps;
    let acc = 0;
    let n = 0;
    for (let k = -0.25; k <= 0.25; k += 0.05) {
      acc += speaking(t + k) ? 0.065 : 0.13;
      n++;
    }
    // мягко входит и уходит вместе с концом записи
    return (acc / n) * interpolate(t, [0, 0.6, V3_END_SEC - 1.6, V3_END_SEC], [0.3, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <>
      <Audio src={staticFile(LIVE04.voice)} />
      <Audio src={staticFile("audio/live04/music.mp3")} volume={music} />
      {V3_SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round(1.2 * fps)} layout="none">
          <Audio src={staticFile(`audio/live04/sfx-${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};

export const BalaGoLive04MotionV3: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navyInk }}>
      <OffthreadVideo src={staticFile(LIVE04.source)} muted style={{ width, height, objectFit: "cover" }} />
      {/* лёгкое затемнение низа — только для читаемости субтитров */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,14,38,0) 62%, rgba(6,14,38,0.3) 100%)" }} />
      <StepsInsert />
      <WeekInsert />
      <RouteInsert keepCity />
      <Captions phrases={LIVE04_PHRASES} mode="calm" />
      <Sound />
    </AbsoluteFill>
  );
};
