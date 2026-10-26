// Урок 1 «Үйдү ким курду?» («Кто построил дом?») — 3D-версия (Three.js).
//
// Исходник — 2D-ролик 1280×720, 20,17 с: домик на низком столе, дети на
// ковре, девочка в жёлтом задаёт вопрос, мальчик в голубом отвечает,
// учитель садится к столу и объясняет; в конце — общий план класса.
// Звуковая дорожка исходника сохранена без изменений
// (public/audio/lesson-01/soundtrack.m4a), картинка собрана заново в 3D и
// подогнана под те же моменты речи.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты.

export const LESSON_VIDEO = {
  id: "Lesson01WhoBuiltHouse3D",
  output: "lesson-01-who-built-the-house-3d",
  width: 1920,
  height: 1080,
  fps: 30,
  durationSec: 20.167,
  soundtrack: "audio/lesson-01/soundtrack.m4a",
} as const;

export const LESSON_FRAMES = Math.round(LESSON_VIDEO.durationSec * LESSON_VIDEO.fps); // 605

export const LESSON_TEXT = {
  chapter: "1-сабак",
  title: "Үйдү ким курду?",
} as const;

// Кто говорит (секунды дорожки). Определено по паузам в звуке и по губам
// персонажей исходного ролика; сами слова движок не использует.
export type LessonSpeaker = "girl" | "boy" | "teacher";

export const LESSON_SPEECH: readonly { readonly who: LessonSpeaker; readonly from: number; readonly to: number }[] = [
  { who: "girl", from: 8.3, to: 10.85 },
  { who: "boy", from: 12.2, to: 14.05 },
  { who: "teacher", from: 15.65, to: 19.15 },
  { who: "teacher", from: 19.8, to: 20.167 },
];

// Монтажный план (секунды): кадр, с какого момента, описание.
export const LESSON_SHOTS: readonly { readonly id: string; readonly from: number; readonly title: string }[] = [
  { id: "house", from: 0, title: "Домик на столе: медленный облёт, титр" },
  { id: "girl", from: 6.3, title: "Девочка задаёт вопрос" },
  { id: "boy", from: 11.4, title: "Панорама на мальчика, он отвечает" },
  { id: "teacher-in", from: 14.1, title: "Общий план: учитель садится к столу" },
  { id: "teacher", from: 15.6, title: "Учитель объясняет у домика" },
  { id: "class", from: 19.6, title: "Общий план класса" },
];
