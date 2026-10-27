# Checkpoint — финансовый канал, выпуск 1 (Finance Horse)

Отдельный проект внутри репозитория, **не BalaGo**: правила BalaGo (Бишкек,
WhatsApp, кыргызская озвучка, 1080×1920) к нему не применяются; логотипы и
контакты BalaGo не используются.

## Правило выпуска
Соответствие шариату — приоритет над полнотой пересказа. Фильтр формулировок —
`scripts/finance/script.test.mjs`. Что исключено и почему — `episode-01/THESIS_MAP.md`,
`episode-01/REPORT.md`. Звук: без музыки и песен; голос + негромкие немелодические
эффекты (`scripts/finance/sfx.sh`).

## Входные файлы
- Исходник содержания: загруженный `1000212898.webm` (21:40, на деле 426×240, AV1/Opus).
  Аудио — `finance/source/source-ru.opus`.
- Визуальный референс `1000212899.mp4` (лошадка, 30 с): **не был загружен и в проекте
  отсутствует** → персонаж собран заново из SVG по текстовому описанию
  (`src/finance/horse/Horse.tsx`).

## Готово
1. Расшифровка: `finance/source/transcript-ru.{txt,json}` (Whisper large-v3-turbo в CI;
   OpenAI API — нет кредитов; у ключа ElevenLabs нет права speech_to_text).
   Стыки — `transcript-ru-boundaries.txt`.
2. Карта тезисов — `episode-01/THESIS_MAP.md`.
3. Сценарий (US English) — `src/finance/episode/script.ts` → `episode-01/script.md`
   (`node scripts/finance/export-script.mjs`).
4. Персонаж: SVG-части, позы (`horse/rig.ts`), моргание, рот по таймингам букв
   ElevenLabs (`horse/lipsync.ts`).
5. Сцены — `src/finance/visuals/part{A,B,C}.tsx`, ведущий — `components/Host.tsx`,
   субтитры — `captions.ts` + `components/Subtitles.tsx`.
6. CI: `.github/workflows/finance-horse.yml` (prepare → render → publish в релиз
   `finance-horse-preview`). `render.yml` BalaGo игнорирует пути finance.

## Команды
- Тесты: `node --test scripts/finance/*.test.mjs`
- Озвучка: `ELEVENLABS_API_KEY=… node scripts/finance/voice.mjs` (кэш по хэшу реплики)
- Черновые кадры без голоса: `node scripts/finance/stills.mjs --draft`
- Финальный рендер: `bash scripts/finance/render.sh out/finance-horse-money-system.mp4`
  (в закрытой сети: `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`)
- Проверка MP4: `node scripts/finance/verify.mjs out/finance-horse-money-system.mp4`
- Субтитры SRT/VTT: `node scripts/finance/captions.mjs`

7. Озвучка: 81 реплика ElevenLabs (Eric, multilingual_v2), QA Whisper — средний WER 0.22%;
   «$3,050» — явное произношение (`say` в script.ts).
8. Финальный рендер: 1920×1080, 30 fps, H.264/AAC, ≈9:05; релиз `finance-horse-preview`.

9. Русская версия: те же сцены и графика; реплики — `src/finance/episode/script.ru.ts`
   (якоря `anchors` для синхронизации графики, `say` — числа словами в нужном падеже),
   надписи — `src/finance/episode/ui.ru.ts` через `t()` (`src/finance/i18n.ts`).
   Композиция `FinanceHorseEp01Ru`, озвучка `public/finance/voice-ru`, голос Eric
   (multilingual_v2; у ключа нет права voices_read — библиотеку русских голосов
   просмотреть нельзя), релиз `finance-horse-ru-preview`.
   Рендер: `bash scripts/finance/render.sh out/finance-horse-money-system-ru.mp4 ru`.

## Следующий шаг
Правки по отзыву владельца канала (персонаж — после получения референса лошадки).
Публикация на YouTube — только вручную.
