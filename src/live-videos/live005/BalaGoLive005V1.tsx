// LIVE-005 v1 — «Ночная журнальная типографика» (площадь Ала-Тоо ночью).
// Направление: типографика + кинематографичный (live/STYLE.md). Свой стиль, не
// повторяет LIVE-004: субтитры Montserrat «из-под маски» с линией-прогрессом,
// своя зона на каждый план; графика тонкими жёлтыми линиями строго по словам
// и жестам (plan.ts); цветокоррекция по реальному цвету лица (grade.ts);
// плавные наезды к лицу, мягкий «вход из размытия» на склейках внутри записи
// и наезд с размытием на переходе проблема → решение.
// Голос — оригинальный. CTA автора не дублируется: шапка Instagram и номер
// WhatsApp появляются только на его жестах. Бишкек — деликатной надписью.
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import "../../fonts";
import { useT } from "../../live/sync";
import { cameraAt } from "./camera";
import { LIVE005_CAPTIONS } from "./captions";
import { EditorialCaptions } from "./EditorialCaptions";
import "./fonts";
import { Footage } from "./Footage";
import { BrandLine, ClockMark, DilemmaColumns, InstagramCard, ReasonsList, RouteTrack, WhatsAppBubble } from "./Graphics";
import { SFX } from "./plan";
import { CUTS, LIVE005, LIVE005_END } from "./timing";
import { LIVE005_WORDS } from "./transcript";

const Sound: React.FC = () => {
  const fps = LIVE005.fps;
  const speaking = (t: number) => LIVE005_WORDS.some((w) => t >= w.start - 0.25 && t <= w.end + 0.35);
  const music = (f: number) => {
    const t = f / fps;
    let acc = 0;
    let n = 0;
    for (let k = -0.25; k <= 0.25; k += 0.05) {
      acc += speaking(t + k) ? 0.11 : 0.26;
      n++;
    }
    return (acc / n) * interpolate(t, [0, 0.4, LIVE005_END - 1.2, LIVE005_END], [0.5, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <>
      <Audio src={staticFile(LIVE005.voice)} />
      <Audio src={staticFile(LIVE005.music)} volume={music} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round(1.4 * fps)} layout="none">
          <Audio src={staticFile(`audio/live/live005/sfx-${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};

export const BalaGoLive005V1: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f" }}>
      <Footage t={t} cam={cameraAt(t)} />
      <ClockMark t={t} />
      <DilemmaColumns t={t} words={LIVE005_WORDS} />
      <ReasonsList t={t} words={LIVE005_WORDS} />
      <BrandLine t={t} words={LIVE005_WORDS} />
      <RouteTrack t={t} />
      <InstagramCard t={t} />
      <WhatsAppBubble t={t} />
      <EditorialCaptions t={t} words={LIVE005_WORDS} groups={LIVE005_CAPTIONS} cuts={CUTS} />
      <Sound />
    </AbsoluteFill>
  );
};
