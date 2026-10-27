// BalaGoLive03 — третий живой рекламный Reels BalaGo. Адилет на ночной
// улице Бишкека говорит в камеру (кыргызча): когда уроки заканчиваются в
// три, рабочий день родителя тоже привязан к 15:00; затем — BalaGo и
// поездки ҮЙ → МЕКТЕП → ҮЙ. Оригинальное видео и голос; поверх —
// объясняющая анимация (часы, календарь, маршрут, логотип, CTA по жестам).
// Исходники: GitHub Release balago-live-03-assets (src/live-03/assets.json).
// Подготовка: npm run live03:prepare. Рендер: npm run render:live03.
import { AbsoluteFill } from "remotion";
import { ARoll } from "./live-03/ARoll";
import { BrandReveal } from "./live-03/BrandReveal";
import { Captions } from "./live-03/Captions";
import { ClockScene } from "./live-03/ClockScene";
import { DailyFlip } from "./live-03/DailyFlip";
import { Finale } from "./live-03/Finale";
import { HomeSchool } from "./live-03/HomeSchool";
import { LiveAudio } from "./live-03/LiveAudio";
import { WorkCalendar } from "./live-03/WorkCalendar";

export const BalaGoLive03: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <ARoll />
    <ClockScene />
    <WorkCalendar />
    <DailyFlip />
    <BrandReveal />
    <HomeSchool />
    <Captions />
    <Finale />
    <LiveAudio />
  </AbsoluteFill>
);
