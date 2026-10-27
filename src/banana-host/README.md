# Банан — постоянный ведущий серии

Персонаж для анимационных объяснений книг (исламских, научных, исторических,
философских): умный, любознательный, харизматичный, иногда забавный, уверенно
объясняет сложное простым языком. Внешность и голос едины во всех фильмах.

## Что здесь
- `Banana.tsx` — SVG-модель (тело-банан, плодоножка, глаза с бликами, брови, рот,
  руки в белых перчатках, ботинки). Точка опоры — между ступнями (0, 0), рост ≈ 620.
- `rig.ts` — позы (`POSES`: idle, point, think, open, shrug, cheer, shock, …) и выражения
  (`MOODS`: happy, calm, wonder, think, confused, serious, joy, shock, …), плавное смешивание.
- `lipsync.ts` — рот по таймингам букв ElevenLabs или по громкости (`SpeechLine`).
- `blink.ts` — моргание.

## Как использовать в новом фильме
```tsx
import { Banana, POSES, MOODS, mouthAt, blinkAt } from "../banana-host";
const m = mouthAt(lines, frame, fps);
<Banana pose={POSES.point} face={MOODS.wonder} mouthOpen={m.open} mouthRound={m.round}
        blink={blinkAt(t)} t={t} talk={m.speaking} />
```
Размещение в кадре, смену поз по репликам и переходы делает компонент фильма
(пример — `src/lesson-traktat/components/Host.tsx`). Голос: ElevenLabs Eric,
`eleven_multilingual_v2` (см. `VOICE` в `src/lesson-traktat/script.ts`).
Визуальный стиль фона и схем каждый фильм подбирает под свою книгу.
