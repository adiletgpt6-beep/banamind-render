// BalaGoFirstLiveReel — первый живой рекламный Reels BalaGo: Адилет идёт
// по парку в Бишкеке и говорит в камеру (кыргызча). Оригинальное видео и
// голос; поверх — jump-cuts, мягкие punch-in, короткие субтитры и
// спокойная 2D-графика, которая не закрывает лицо.
// Подготовка исходника: npm run live:prepare. Рендер: npm run render:live.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { LIVE_FRAMES } from "./first-live-reel/edit";
import { ARoll } from "./first-live-reel/ARoll";
import { Captions } from "./first-live-reel/Captions";
import { Finale } from "./first-live-reel/Finale";
import { CuriousBadge, HookTitle, ParentsTitle } from "./first-live-reel/Hook";
import { END_FADE, LiveAudio } from "./first-live-reel/LiveAudio";
import { DailyLoop, TaskList, TimeClock } from "./first-live-reel/Problem";
import { BrandReveal, RouteLoop } from "./first-live-reel/Solution";

// мягкое затемнение последних кадров (вместе со звуком)
const EndFade: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [LIVE_FRAMES - END_FADE, LIVE_FRAMES - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: o }} /> : null;
};

export const BalaGoFirstLiveReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <ARoll />
    <HookTitle />
    <CuriousBadge />
    <ParentsTitle />
    <DailyLoop />
    <TimeClock />
    <TaskList />
    <BrandReveal />
    <RouteLoop />
    <Finale />
    <Captions />
    <EndFade />
    <LiveAudio />
  </AbsoluteFill>
);
