# BalaGo Video Studio — закрытая мобильная загрузка живых роликов

Отдельное Next.js-приложение (Issue #74, ТЗ — [live-videos/studio/MVP_SPEC.md](../../live-videos/studio/MVP_SPEC.md)).
Владелец с телефона загружает MP4/MOV → файл напрямую уходит в **приватный Cloudflare R2**
→ сервер проверяет сохранённый объект → создаётся **одна** карточка `LIVE-NNN` (GitHub Issue).

**Статус:** код и тесты готовы; сайт работает только после подключения R2, GitHub и
Vercel владельцем — см. **[docs/DEPLOY.md](docs/DEPLOY.md)**. Без секретов страница
показывает «Studio ещё не подключена» и список имён недостающих переменных.

## Как это устроено

```
Телефон ──(1) POST /api/uploads {имя, размер, тип}──▶ Vercel: проверка владельца,
   │                                                    размер/тип, ключ live/raw/<uuid>/source.mp4,
   │◀──────────── signed PUT URL (15 минут) ──────────── манифест live/uploads/<uuid>.json в R2
   │
   ├──(2) PUT файла с прогрессом ─────────────────────▶ Cloudflare R2 (приватный бакет)
   │
   ├──(3) POST /api/uploads/<id>/complete ───────────▶ HEAD: размер, Content-Type;
   │                                                    первые байты — сигнатура MP4/MOV
   └──(4) POST /api/uploads/<id>/submit {тема, заметка} ▶ замок R2 + поиск дубля + атомарный
                                                        захват номера → GitHub Issue LIVE-NNN
```

- **Вход:** GitHub OAuth, пускает только `STUDIO_ALLOWED_GITHUB_LOGIN` (+ числовой id).
  Сессия — подписанная HMAC cookie `__Host-…`, HttpOnly, Secure, SameSite=Lax, 8 часов.
  Токен GitHub после входа не хранится.
- **CSRF:** изменяющие запросы принимаются только с собственного Origin и только JSON.
  Лимит запросов, строгий CSP, `noindex`, запрет встраивания в iframe.
- **Видео не проходит через Vercel** и не попадает в Git. В Issue — только ключ объекта
  и безопасные метаданные; signed/download-ссылок нет.
- **Идемпотентность:** состояние каждой загрузки в R2; повторное/двойное нажатие
  возвращает ту же карточку; номера `LIVE-NNN` захватываются атомарно (`If-None-Match: *`),
  продолжая реестр (`LIVE-001…004` не трогаются).
- **Никаких рендеров:** создаётся Issue с меткой `live-intake`, а не `task.json`.
  `render.yml` игнорирует `apps/balago-studio/**`; свой workflow `studio.yml` —
  только typecheck/тесты/сборка (~1–2 мин, без секретов).

## Код

| Путь | Что |
| --- | --- |
| `src/app/page.tsx`, `studio-app.tsx` | мобильный интерфейс: 3 шага, прогресс, карточка LIVE |
| `src/app/api/**` | тонкие маршруты Next.js |
| `src/lib/handlers.ts`, `http.ts` | вход, проверки владельца/Origin/лимитов, безопасные ошибки |
| `src/lib/intake.ts` | загрузка → проверка → одна карточка |
| `src/lib/storage.ts` | R2 (S3 API, `aws4fetch`) и хранилище в памяти для тестов |
| `src/lib/github.ts` | Issue и номера LIVE; подменный GitHub для тестов |
| `src/lib/validation.ts`, `session.ts`, `config.ts` | валидация, сессия, конфигурация |
| `tests/` | 35 тестов: авторизация, TTL, метаданные, идемпотентность, отсутствие секретов, smoke |
| `scripts/fetch-source.mjs` | скачивание исходника из R2 для монтажа (по секретам) |

```bash
npm ci && npm run check   # typecheck + тесты, ключи не нужны
```
