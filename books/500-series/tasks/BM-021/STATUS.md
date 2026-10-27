# BM-021 — STATUS / checkpoint

**ID:** BM-021
**Книга:** Роберт Чалдини — «Психология влияния» (редакция с 7 принципами, включая «Единство»).
**Рабочая ветка:** `feature/banamind-bm-021-influence-cialdini`
**PR:** https://github.com/adiletzainidinov/balago-video/pull/145
**TASK:** `books/500-series/tasks/BM-021/TASK.md`
**Источник:** `books/500-series/sources/BM-021/`
**Результаты:** `books/psychology-of-influence-cialdini/`

## CURRENT_STAGE: QA_REVIEW — фильм 30:00, SRT, 5 обложек, 5 названий и метаданные готовы; ждут владельца (Claude Code, 2026-10-22)

PR #145 не мержится, на YouTube ничего не публикуется. Права на коммерческую адаптацию перевода и публикацию **не подтверждены** — публичный релиз заблокирован (EDITORIAL_RIGHTS_AUDIT.md).

### Видео (приватный pre-release `book-psychology-of-influence-cialdini`, нужен вход в GitHub)
- **Скачать в хорошем качестве:** https://github.com/adiletzainidinov/balago-video/releases/download/book-psychology-of-influence-cialdini/final-youtube.mp4 — 1920×1080, H.264 High yuv420p, 30 fps, AAC 48 кГц, **1799,96 с (30:00)**, −17 LUFS, без чёрных кадров, 565 706 113 байт, sha256 `e3c85e487c1e5ff46ba6ea2019e83b6b52ab35519581ff4c3c67a3b76baa8eeb`.
- **Посмотреть (превью 960×540):** https://github.com/adiletzainidinov/balago-video/releases/download/book-psychology-of-influence-cialdini/final-youtube-preview-960x540.mp4
- **SRT:** https://github.com/adiletzainidinov/balago-video/releases/download/book-psychology-of-influence-cialdini/final-youtube.srt (копия `books/psychology-of-influence-cialdini/video/final-youtube.srt`).
- **Пилот 39,4 с:** https://github.com/adiletzainidinov/balago-video/releases/download/book-psychology-of-influence-cialdini/pilot.mp4 (проверен до полного рендера: формат, звук −17 LUFS, титры, кадры).
- Прогоны: пилот 39787415020; финал 39805703002.

### Обложки и метаданные (тот же релиз + `books/psychology-of-influence-cialdini/`)
- thumbnail-01…05.jpg (1280×720, JPEG sRGB, 118–236 КБ), `thumbnail-contact-sheet.jpg`, `readability-320x180.jpg`; Hunspell ✓, попарное различие ✓ (мин. 43,8 при пороге 25). Рекомендация №1 «ПОЧЕМУ ВЫ СКАЗАЛИ «ДА»?».
- Просмотр/скачивание каждого оригинала: `https://github.com/adiletzainidinov/balago-video/releases/download/book-psychology-of-influence-cialdini/thumbnail-0N.jpg` (N = 1…5), лист: `https://github.com/adiletzainidinov/balago-video/releases/download/book-psychology-of-influence-cialdini/thumbnail-contact-sheet.jpg`.
- Галерея `books/500-series/tools/thumbnail-gallery.mjs --dir books/psychology-of-influence-cialdini/thumbnails` проверена по HTTP локально: 5/5 «Просмотреть» (200, image/jpeg) и 5/5 «Скачать» (`Content-Disposition: attachment`, байт-в-байт оригинал 1280×720) + лист. **Ограничение:** облачная сессия Claude Code не даёт приватного проброса порта, поэтому localhost-ссылка владельцу недоступна — постоянные ссылки выше (релиз, вход в GitHub).
- 5 названий + фаворит: `metadata/YOUTUBE_TITLES.md`; описание, теги, 14 глав с реальными таймкодами: `metadata/youtube.md` / `youtube.json` (орфография ✓).
  1. **МОЙ ФАВОРИТ:** «Почему вы говорите «ДА», даже когда не хотите? Психология влияния Чалдини» — обложка №1.
  2. «7 принципов влияния Роберта Чалдини: как вернуть контроль над решениями» — №2 «7 СИГНАЛОВ».
  3. «Почему мы верим толпе, экспертам и скидкам? Разбор книги Чалдини» — №3/№4.
  4. «Психология влияния: как распознать давление до того, как согласитесь» — №5.
  5. «Как работает наше «да»: семь ловушек выбора и честная защита от них».

### Журнал Claude Code
- **Источник.** `sha256sum -c` — 19/19 OK; конкатенация = `558c8bc5…59cc1`. Книга повторно не запрашивалась.
- **Чтение.** Все 19 частей прочитаны полностью → `scripts/source-map/part-01…19.md` (≈1 660 пунктов с номерами строк).
- **Документы.** BRIEF, COVERAGE, SOURCE_MAP (98 привязок сцен к строкам), CLAIMS_AND_ETHICS_AUDIT, EDITORIAL_RIGHTS_AUDIT, SCRIPT, STORYBOARD — `books/psychology-of-influence-cialdini/scripts/`.
- **Сценарий.** 77 сцен, 195 реплик, ≈3 230 слов, 5 пауз-вопросов; все 7 принципов (включая «Единство») + глава 9; вымышленная история Анны помечена. Тесты 9/9: каждое число в репликах найдено в указанных строках книги, 21 цитата дословна, нет «шести принципов», таймеров, рекламы, «ты».
- **Озвучка.** Тот же голос банана (ElevenLabs Eric, multilingual v2), 195 реплик; ударения в именах (Чалди́ни, Ри́гана, За́ппа, То́мми) — только для синтеза. ASR faster-whisper small: среднее 0,958; две реплики переписаны и переозвучены по итогам ASR. Ограничение: «Чалдини» распознаётся моделью как «Челдине», а в s49b «сто пятьдесят девять» — неуверенно; проверить более сильной моделью не удалось (у ключа OpenAI нет кредитов, загрузка whisper-medium заблокирована сетью). Рекомендуется прослушать реплику s49b на 23:03.
- **Хронометраж.** Естественная речь 28:29; до 30:00 — мягкие паузы между сценами (≈1,2 с) и 5 пауз-вопросов; в кадре нет таймеров.
- **Визуал.** «Стеклянная модель решения + 7 цветных фильтров»; 51 вид анимированных сцен, точечная сборка — чёткие векторные точки на шестиугольной сетке без размытия; кадры всех сцен и 36 кадров финального H.264 проверены.
- **Пайплайн.** `.github/workflows/lesson-influence.yml` (на основе BM-016) + выгрузка обложек/метаданных в релиз. Общие модули banana-host/captions и другие BM не менялись; добавлены книга в `src/thumbnails/Root.tsx` и 5 слов в `books/dictionary.txt`.

### Следующий шаг
Владелец: просмотреть фильм и обложки, выбрать название/обложку, решить вопрос прав. Для правок: изменить `src/lesson-influence/script.ts` или визуалы → пуш в ветку (CI переозвучит только изменённые реплики и перерендерит).

## Уже сделано локально

- [x] Проверен ZIP CRC / UTF-8.
- [x] Найдены 9 глав (1 — средства влияния, 2 — взаимность, 3 — симпатия, 4 — социальное доказательство, 5 — авторитет, 6 — дефицит, 7 — обязательство и последовательность, 8 — единство, 9 — мгновенное влияние).
- [x] Создан `manifest.json` со строками и 19 чексуммами.
- [x] Подготовлены 19 непрерывных TXT, контрольная конкатенация совпадает с подготовленным оригиналом, 1 811 716 байт UTF-8.
- [x] Созданы README, TASK, STATUS для отдельного выпуска.
- [x] Загрузка 19 TXT и 5 документов в отдельную GitHub ветку; GitHub API независимо подтвердил 24/24 Git Blob SHA и содержимое.
- [x] PR #145 в `docs/banamind-500-production-system` — открыт, без merge. (Не в `main`: производственная ветка BM-500 пока живёт отдельно.)
- [x] Реальное чтение источника Claude, SOURCE_MAP/COVERAGE/BRIEF/SCRIPT/STORYBOARD.
- [x] Пилот, весь русский 30мин фильм, word-aligned captions + SRT, QA, 5 JPG, 5 названий и приватные рабочие ссылки.

## Следующий шаг Claude Code (после источника в GitHub)

Открыть BM-021 feature branch → прочитать MASTER_CLAUDE/PRODUCTION/WORKFLOW/SOURCE_INGESTION, TASK, STATUS, source README/manifest → `(cd books/500-series/sources/BM-021 && sha256sum -c source-checksums.sha256)` (19/19 OK) → внимательно прочитать 19 файлов → создать сценарные аудиты и материалы → пилот → QA → продолжить производство в своей ветке. Не затрагивать BM-018/019/020, не mержить, не публиковать ролик или защищённые исходники. Примечание: современные русские переводные права неизвестны — перед публичным выпуском отдельная проверка.
