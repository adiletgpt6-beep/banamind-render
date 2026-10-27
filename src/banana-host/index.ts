// Постоянный персонаж серии: банан-ведущий. Модель, позы, выражения, рот по речи и
// моргание не зависят от конкретного фильма; где и как банан стоит в кадре, решает фильм
// (см. src/lesson-traktat/components/Host.tsx). Подробнее — README.md рядом.
export { Banana, type BananaProps } from "./Banana";
export { blinkAt } from "./blink";
export { mouthAt, type SpeechLine } from "./lipsync";
export { MOODS, POSES, mixFace, mixPose, type Face, type MoodName, type Pose, type PoseName } from "./rig";
