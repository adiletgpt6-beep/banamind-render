// BalaGoLive04Motion — четвёртое живое видео: «А если встреча затянулась?»
// Оригинальная съёмка и настоящий голос Адилета + синхронная motion-графика.
// Каждый графический элемент появляется на конкретном произнесённом слове
// (src/live04/transcript.ts → src/live04/cues.ts).
import { AbsoluteFill } from "remotion";
import "./fonts";
import { Captions } from "./live/Captions";
import { LiveFootage } from "./live/LiveFootage";
import type { LivePhrase } from "./live/sync";
import { useT } from "./live/sync";
import { Grade, LightSweep } from "./live/ui";
import { LIVE04_BRAND_LINE } from "./live04/brand";
import { live04Camera } from "./live04/camera";
import { CUE, LIVE04, live04Timing, type BrandVoice } from "./live04/cues";
import { Live04Audio } from "./live04/Live04Audio";
import { Backdrop, Cta } from "./live04/scenes/Cta";
import { Hook } from "./live04/scenes/Hook";
import { Return } from "./live04/scenes/Return";
import { Route } from "./live04/scenes/Route";
import { IrisTransition, Solution } from "./live04/scenes/Solution";
import { Steps } from "./live04/scenes/Steps";
import { Week } from "./live04/scenes/Week";
import { LIVE04_PHRASES } from "./live04/transcript";

export type BalaGoLive04MotionProps = {
  readonly brand: BrandVoice | null;
};

// Субтитры бренд-реплики: слова из таймингов синтеза, текст — как в сценарии
// (BalaGo / WhatsApp латиницей). Без файла — равномерная оценка.
const brandPhrase = (brand: BrandVoice | null): LivePhrase => {
  const shown = LIVE04_BRAND_LINE.text.split(/\s+/).reduce<string[]>((acc, w) => {
    if (!/[\p{L}\p{N}]/u.test(w) && acc.length) acc[acc.length - 1] += ` ${w}`;
    else acc.push(w);
    return acc;
  }, []);
  const base = LIVE04.brandAt;
  const words = shown.map((text, i) => {
    const src = brand?.words[i];
    if (src) return { text, start: base + src.start, end: base + src.end };
    const step = LIVE04_BRAND_LINE.estimateSec / shown.length;
    return { text, start: base + i * step, end: base + (i + 0.8) * step };
  });
  return { id: "brand", words };
};

const Look: React.FC = () => {
  const t = useT();
  // тонировка слабее, когда кадр уходит в карточку
  return (
    <>
      <Grade bottom={0.42} top={0.22} />
      {[...LIVE04.cuts, CUE.balago].map((c) => (
        <LightSweep key={c} t={t} at={c - 0.05} dur={0.75} strength={0.18} />
      ))}
    </>
  );
};

export const BalaGoLive04Motion: React.FC<BalaGoLive04MotionProps> = ({ brand }) => {
  const timing = live04Timing(brand);
  return (
    <AbsoluteFill style={{ backgroundColor: "#060E26" }}>
      <Backdrop />
      <LiveFootage src={LIVE04.source} sourceDuration={LIVE04.sourceDuration} camera={live04Camera} />
      <Look />
      <Hook />
      <Steps />
      <Return />
      <Week />
      <IrisTransition />
      <Solution />
      <Route />
      <Cta />
      <Captions phrases={[...LIVE04_PHRASES, brandPhrase(brand)]} />
      <Live04Audio brand={brand} totalSec={timing.totalSec} />
    </AbsoluteFill>
  );
};
