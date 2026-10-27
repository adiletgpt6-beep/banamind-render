// LIVE-004 v2 — облегчённый монтаж четвёртого живого видео.
// Основа — оригинальная съёмка без синтетической камеры (без наездов,
// «толчков» на склейках, световых проходов и диафрагм) и настоящий голос.
// Графика — только три смысловые вставки (plan.ts) + обязательный финал:
// контакты на словах Адилета и фирменная карточка с бренд-репликой.
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import "../../fonts";
import { fontFamily } from "../../fonts";
import { Captions } from "../../live/Captions";
import { ContactDock } from "../../live/ContactDock";
import type { LivePhrase } from "../../live/sync";
import { easeInOut, ramp, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { LIVE04_BRAND_LINE, LIVE04_CONTACTS } from "../../live04/brand";
import { LIVE04, live04Timing, type BrandVoice } from "../../live04/timing";
import { LIVE04_PHRASES, LIVE04_WORDS } from "../../live04/transcript";
import { RouteInsert, StepsInsert, WeekInsert } from "./Inserts";
import { V2_CUE, V2_END_FADE, V2_SFX } from "./plan";

export type BalaGoLive04MotionV2Props = { readonly brand: BrandVoice | null };

// Субтитры бренд-реплики — как в v1 (текст сценария, тайминги синтеза).
const brandPhrase = (brand: BrandVoice | null): LivePhrase => {
  const shown = LIVE04_BRAND_LINE.text.split(/\s+/).reduce<string[]>((acc, w) => {
    if (!/[\p{L}\p{N}]/u.test(w) && acc.length) acc[acc.length - 1] += ` ${w}`;
    else acc.push(w);
    return acc;
  }, []);
  const base = LIVE04.brandAt;
  return {
    id: "brand",
    words: shown.map((text, i) => {
      const src = brand?.words[i];
      if (src) return { text, start: base + src.start, end: base + src.end };
      const step = LIVE04_BRAND_LINE.estimateSec / shown.length;
      return { text, start: base + i * step, end: base + (i + 0.8) * step };
    }),
  };
};

const Footage: React.FC = () => {
  const t = useT();
  const { fps, width, height } = useVideoConfig();
  const last = Math.floor(LIVE04.sourceDuration * fps) - 2;
  const fade = 1 - ramp(t, V2_END_FADE.at, V2_END_FADE.dur, easeInOut);
  if (fade <= 0) return null;
  const video = <OffthreadVideo src={staticFile(LIVE04.source)} muted style={{ width, height, objectFit: "cover" }} />;
  return <AbsoluteFill style={{ opacity: fade }}>{Math.round(t * fps) >= last ? <Freeze frame={last}>{video}</Freeze> : video}</AbsoluteFill>;
};

// Фирменная карточка финала: статичный портрет (последний кадр), логотип,
// название. Появляется плавным наплывом, без движения камеры.
const EndCard: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const a = ramp(t, V2_END_FADE.at, V2_END_FADE.dur, easeInOut);
  if (a <= 0) return null;
  const last = Math.floor(LIVE04.sourceDuration * fps) - 2;
  return (
    <AbsoluteFill style={{ opacity: a, background: `radial-gradient(ellipse at 70% 20%, #22448C 0%, ${C.navyDeep} 50%, ${C.navyInk} 100%)` }}>
      <div style={{ position: "absolute", left: 80, top: 240, width: 380, height: 670, borderRadius: 40, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
        <Freeze frame={last}>
<OffthreadVideo src={staticFile(LIVE04.source)} muted style={{ width: 380, height: 670, objectFit: "cover" }} />
        </Freeze>
      </div>
      <div style={{ position: "absolute", left: 500, top: 290, width: 430, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ width: 240, height: 240, borderRadius: "50%", overflow: "hidden", background: C.white, boxShadow: "0 0 0 6px rgba(255,201,14,0.95)" }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontFamily, fontWeight: 1000, fontSize: 108, lineHeight: 0.95, color: C.white }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Музыка тише под речью; звуки — только из плана (8 событий).
const Sound: React.FC<{ readonly brand: BrandVoice | null; readonly totalSec: number }> = ({ brand, totalSec }) => {
  const fps = LIVE04.fps;
  const speaking = (t: number) =>
    LIVE04_WORDS.some((w) => t >= w.start - 0.25 && t <= w.end + 0.35) ||
    (brand !== null && t >= LIVE04.brandAt + brand.speechStart - 0.25 && t <= LIVE04.brandAt + brand.speechEnd + 0.35);
  const music = (f: number) => {
    const t = f / fps;
    let acc = 0;
    let n = 0;
    for (let k = -0.25; k <= 0.25; k += 0.05) {
      acc += speaking(t + k) ? 0.07 : 0.14;
      n++;
    }
    return (acc / n) * interpolate(t, [0, 0.6, totalSec - 2.2, totalSec], [0.3, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <>
      <Audio src={staticFile(LIVE04.voice)} />
      <Audio src={staticFile("audio/live04/music.mp3")} volume={music} />
      {brand ? (
        <Sequence from={Math.round(LIVE04.brandAt * fps)} layout="none">
          <Audio src={staticFile("audio/live04/brand.mp3")} />
        </Sequence>
      ) : null}
      {V2_SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round(1.2 * fps)} layout="none">
          <Audio src={staticFile(`audio/live04/sfx-${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};

export const BalaGoLive04MotionV2: React.FC<BalaGoLive04MotionV2Props> = ({ brand }) => {
  const timing = live04Timing(brand);
  return (
    <AbsoluteFill style={{ backgroundColor: C.navyInk }}>
      <Footage />
      {/* лёгкое затемнение низа — только для читаемости субтитров */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,14,38,0) 60%, rgba(6,14,38,0.35) 100%)" }} />
      <EndCard />
      <StepsInsert />
      <WeekInsert />
      <RouteInsert />
      <ContactDock
        t={useT()}
        texts={LIVE04_CONTACTS}
        cityAt={V2_CUE.profil - 0.15}
        profileAt={V2_CUE.profil}
        orAt={V2_CUE.zhe}
        phoneAt={V2_CUE.whatsapp}
      />
      <Captions phrases={[...LIVE04_PHRASES, brandPhrase(brand)]} />
      <Sound brand={brand} totalSec={timing.totalSec} />
    </AbsoluteFill>
  );
};
