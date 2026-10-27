# BM-025 · QA финального фильма

Финальный прогон: CI run [39829786318](https://github.com/adiletzainidinov/balago-video/actions/runs/39829786318) (workflow_dispatch mode=full) на коммите `4d1f54c`, все задания success (voice → voice-qa → 8×render → assemble). Pre-release `book-how-to-win-friends-carnegie` (приватный репозиторий).

## Файл
| Проверка | Результат |
|---|---|
| final-youtube.mp4 | 539 396 347 байт, sha256 `d988af002862fe17610d5fbd5a4c596a61d5f7060f31dacba093be91b34555af` — скачан через API, хэш совпал с digest релиза |
| Видео | 1920×1080, H.264 High yuv420p bt709, 30/1 fps |
| Звук | AAC LC 48 кГц, −17 LUFS (verify), пик −0,3 dB, звук есть до последних секунд |
| Длительность | 1799,97 с = **30:00** (окно TASK 29:30–30:30) |
| Чёрные кадры | нет (blackdetect в verify) |
| Превью | final-youtube-preview-960x540.mp4, 960×540, 30 fps, 30:00, 78,4 МБ |
| SRT | final-youtube.srt, 616 блоков, по таймкодам слов озвучки; c02b «Спор вы, может быть, и выиграли.» на месте |
| Кадры | 36 кадров по всему фильму (`qa-full/frames`) просмотрены: без перекрытий титров и банана, без таймеров/прогресс-баров, без рекламы BalaGo |

## Озвучка (`qa-voice/voice-asr.md`)
Тот же голос банана (ElevenLabs Eric, eleven_multilingual_v2). faster-whisper small: 199 реплик, среднее совпадение **0,975**; ниже 0,85 — 3 (t04a, r03a, g03a), по тексту распознавания — ошибки распознавателя («Карнеге», «стаблиция»), а не пропуски слов. Рекомендуется послушать эти три места при приёмке.

## Ограничения
- Проверка распознаванием OpenAI недоступна: `insufficient_quota` у ключа; использован faster-whisper в CI.
- Остаток квоты ElevenLabs не читается (ключ без `user_read`).
- Коммерческие права на перевод не подтверждены; PR не мержится, на YouTube не публикуется.

## Ссылки (нужен вход в GitHub с доступом к репозиторию)
- Посмотреть: https://github.com/adiletzainidinov/balago-video/releases/download/book-how-to-win-friends-carnegie/final-youtube-preview-960x540.mp4
- Скачать оригинал 1920×1080: https://github.com/adiletzainidinov/balago-video/releases/download/book-how-to-win-friends-carnegie/final-youtube.mp4
- SRT: https://github.com/adiletzainidinov/balago-video/releases/download/book-how-to-win-friends-carnegie/final-youtube.srt
- Страница для выбора названия и обложки (приватная): https://claude.ai/artifact/SvJPat5kuzLKNZhVkWdJYu
