import { cookies } from "next/headers";
import { ConfigError, loadConfig, missingConfig } from "@/lib/config";
import { isOwner, sessionCookieName, verifySessionToken } from "@/lib/session";
import { StudioApp } from "./studio-app";

export const dynamic = "force-dynamic";

const LOGIN_ERRORS: Record<string, string> = {
  denied: "Этот аккаунт GitHub не имеет доступа к Studio.",
  state: "Вход прерван или устарел. Попробуйте ещё раз.",
  github: "GitHub не подтвердил вход. Попробуйте ещё раз.",
  rate_limited: "Слишком много попыток. Подождите минуту.",
};

function Brand() {
  return (
    <header className="brand">
      <img src="/logo.png" alt="BalaGo" width={88} height={88} />
      <div>
        <h1>BalaGo Video Studio</h1>
        <p>Живые ролики • Бишкек</p>
      </div>
    </header>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    return (
      <main className="shell">
        <Brand />
        <section className="card">
          <h2>Studio ещё не подключена</h2>
          <p className="muted">
            Владелец должен добавить переменные окружения в настройках хостинга (Vercel). Значения
            никогда не вводятся в чат и не сохраняются в GitHub.
          </p>
          <ul className="missing">
            {missingConfig().map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
          <p className="muted">Инструкция: apps/balago-studio/docs/DEPLOY.md</p>
        </section>
      </main>
    );
  }

  const jar = await cookies();
  const session = verifySessionToken(jar.get(sessionCookieName(config.secureCookies))?.value, config.authSecret);
  const owner = isOwner(session, config.allowedGithubLogin, config.allowedGithubId) ? session : null;

  if (!owner) {
    const { login } = await searchParams;
    const message = login ? LOGIN_ERRORS[login] : undefined;
    return (
      <main className="shell">
        <Brand />
        <section className="card login">
          <h2>Вход для владельца</h2>
          <p className="muted">Загружать видео может только владелец BalaGo. Вход — через ваш аккаунт GitHub.</p>
          {message ? <p className="alert">{message}</p> : null}
          <a className="button primary" href="/api/auth/login">
            Войти через GitHub
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <Brand />
      <StudioApp login={owner.login} maxUploadBytes={config.maxUploadBytes} />
    </main>
  );
}
