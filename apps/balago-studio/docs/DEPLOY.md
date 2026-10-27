# Подключение BalaGo Video Studio: Cloudflare R2 + GitHub + Vercel

Порядок: **R2 → GitHub (OAuth App и токен) → Vercel → CORS R2 → проверка**.
Все ключи вводятся только в панелях Cloudflare, GitHub и Vercel. **Не присылайте
их в чат, не коммитьте и не вставляйте в Issue.** В репозитории только имена
переменных (`.env.example`).

Примерное время: 20–30 минут. Стоимость: R2 до 10 ГБ хранения бесплатно
(150 роликов × ~60 МБ ≈ 9 ГБ; дальше ≈ $0,015 за ГБ в месяц, скачивание бесплатно).
Vercel: тариф Hobby бесплатный, но по правилам Vercel предназначен для
некоммерческого использования; для бизнеса BalaGo корректнее Pro. Решение за вами.

---

## 1. Cloudflare R2 — приватный бакет

1. https://dash.cloudflare.com → **R2 Object Storage** → **Create bucket**.
   - Имя: `balago-live-sources` (любое, запомните — это `R2_BUCKET_NAME`).
   - Location: Automatic. Storage class: Standard.
2. В бакете → **Settings**:
   - **Public access → R2.dev subdomain: Disabled**, Custom domains: **нет**.
     Бакет остаётся полностью приватным; файлы доступны только по подписи.
3. **Account ID** — на главной странице R2 справа (`R2_ACCOUNT_ID`).
4. **R2 → Manage R2 API Tokens → Create API token**:
   - Permissions: **Object Read & Write**.
   - Specify bucket: **только `balago-live-sources`**.
   - TTL: по желанию.
   - После создания скопируйте **Access Key ID** и **Secret Access Key** сразу в
     Vercel (шаг 3) — Cloudflare показывает секрет один раз.
5. (Рекомендуется) второй токен **Object Read only** на тот же бакет — для монтажа
   (раздел «Доступ монтажа к исходникам»).

## 2. GitHub

### 2.1 OAuth App — вход владельца

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

| Поле | Значение |
| --- | --- |
| Application name | `BalaGo Video Studio` |
| Homepage URL | адрес Studio, например `https://balago-studio.vercel.app` |
| Authorization callback URL | `https://balago-studio.vercel.app/api/auth/callback` |

После создания: **Client ID** → `AUTH_GITHUB_ID`, **Generate a new client secret** →
`AUTH_GITHUB_SECRET`. Studio запрашивает только публичный профиль (без доступа к
репозиториям) и пускает лишь `STUDIO_ALLOWED_GITHUB_LOGIN` + `STUDIO_ALLOWED_GITHUB_ID`.

Ваш числовой id: откройте `https://api.github.com/users/adiletzainidinov` → поле `"id"`.

### 2.2 Токен для карточек LIVE-NNN

GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate**:

- Repository access: **Only select repositories → `balago-video`**.
- Permissions → Repository: **Issues: Read and write**, **Contents: Read-only**,
  Metadata: Read-only (автоматически). Больше ничего.
- Expiration: 90 дней или 1 год (поставьте напоминание продлить).

Значение → `STUDIO_GITHUB_TOKEN`. Studio создаёт **только Issue** с меткой
`live-intake`; `task.json` не пишет, поэтому `live-videos.yml` и рендеры не запускаются.

## 3. Vercel — проект Studio

1. https://vercel.com/new → **Import Git Repository** → `adiletzainidinov/balago-video`.
2. **Root Directory: `apps/balago-studio`** (обязательно). Framework: Next.js
   (определится сам). Build/Output — по умолчанию.
3. **Environment Variables** (Production) — по списку `.env.example`:

   | Переменная | Значение |
   | --- | --- |
   | `STUDIO_PUBLIC_URL` | `https://<проект>.vercel.app` (без `/` в конце) |
   | `STUDIO_ALLOWED_GITHUB_LOGIN` | `adiletzainidinov` |
   | `STUDIO_ALLOWED_GITHUB_ID` | ваш числовой id |
   | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | из шага 2.1 |
   | `AUTH_SECRET` | случайная строка ≥ 32 символов (`openssl rand -base64 48` или генератор паролей) |
   | `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | из шага 1 |
   | `STUDIO_GITHUB_TOKEN` | из шага 2.2 |
   | `STUDIO_GITHUB_REPO` | `adiletzainidinov/balago-video` |

   Отметьте секреты как **Sensitive**. Для Preview-окружения переменные не
   добавляйте — тогда превью-сборки PR не получат доступа к R2/GitHub и покажут
   экран «Studio ещё не подключена».
4. **Deploy**. Если адрес получился другим — исправьте `STUDIO_PUBLIC_URL`,
   Homepage/Callback URL в OAuth App и CORS (шаг 4), затем **Redeploy**.
5. `vercel.json` содержит `ignoreCommand`: Vercel пересобирает Studio только
   когда меняется `apps/balago-studio/` — коммиты 2D и LIVE сборку не запускают.
6. (По желанию) **Settings → Deployment Protection** можно оставить включённым для
   Preview; Production защищён входом владельца.

## 4. CORS для прямой загрузки с телефона

Cloudflare → R2 → `balago-live-sources` → **Settings → CORS Policy → Edit** и вставьте
содержимое [`r2-cors.json`](r2-cors.json), заменив origin на ваш точный адрес Studio:

```json
[
  {
    "AllowedOrigins": ["https://balago-studio.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Только `PUT` и только ваш домен: чтение и листинг бакета из браузера запрещены.

(Рекомендуется) **Object lifecycle rules**: удалить объекты с префиксом `live/locks/`
через 1 день.

## 5. Проверка после деплоя (5 минут)

1. Откройте адрес Studio на Android в Chrome → «Войти через GitHub» → войдите.
2. Выберите MP4 (~60 МБ) → «Загрузить» → прогресс до 100 % → «Видео загружено и проверено».
3. Тема/заметка (по желанию) → «Отправить в работу» → карточка `LIVE-005`, статус
   «Получено», ссылка на Issue.
4. Нажмите «Отправить в работу» ещё раз до сброса / обновите страницу — номер тот же,
   второй Issue не появился.
5. В GitHub → Actions: новые запуски `render.yml` и `live-videos.yml` не появились.
6. Откройте в браузере (без подписи)
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com/balago-live-sources/live/raw/...` —
   должен быть отказ доступа.
7. Выйдите и войдите другим аккаунтом GitHub — доступ запрещён.

Если что-то не работает — экран «Studio ещё не подключена» перечисляет **имена**
недостающих переменных; ошибки загрузки чаще всего из-за CORS (шаг 4).

## Доступ монтажа к исходникам

Карточка содержит только ключ объекта (`live/raw/<uuid>/source.mp4`), без ссылок.
Чтобы Claude Code / GitHub Actions могли скачать исходник:

- **GitHub → Settings → Secrets and variables → Actions → New repository secret**:
  `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` —
  лучше read-only токен из шага 1.5.
- Для облачной среды Claude Code те же значения добавляются в настройках среды
  (Environment → Secrets/variables), не в чат.
- Скачать: `node apps/balago-studio/scripts/fetch-source.mjs live/raw/<uuid>/source.mp4 <куда>`
  (из `apps/balago-studio` после `npm ci`, либо с установленным `aws4fetch`).

Пока эти секреты не добавлены, монтаж по новой карточке не сможет получить файл —
это ожидаемо для первого этапа.

## Локальный запуск (для разработчика)

```bash
cd apps/balago-studio
npm ci
npm test            # тесты с подменными R2/GitHub, без ключей
npm run typecheck
cp .env.example .env.local   # заполнить своими значениями, файл не коммитится
npm run dev                  # http://localhost:3000
```

Для локального входа нужна отдельная OAuth App с callback
`http://localhost:3000/api/auth/callback` и CORS-origin `http://localhost:3000`.
