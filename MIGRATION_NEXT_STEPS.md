# Текущая остановка

Перенос снимков остановлен на 189 из 223 веток: рабочая среда недоступна, проверка оставшихся ASR-метаданных не завершена. Сначала выполнить безопасную подготовку и проверки из [MIGRATION_BLOCKERS.md](MIGRATION_BLOCKERS.md). Не использовать команды ниже для обхода автоматического отказа.

# Недоступная часть переноса: точные действия

Эти команды не выполнялись при переносе снимков. Они предназначены для доверенного компьютера владельца с установленными Git, GitHub CLI, Gitleaks и git-filter-repo. Приватная исходная история может содержать книги, секреты и медиа, которые нельзя публиковать. Публичный репозиторий уже содержит отдельные снимки и новые отчёты; `git push --mirror` в него применять нельзя.

## Получить полную историю приватно

Войти через браузер в старый аккаунт, без передачи токенов в чат:

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth switch --hostname github.com --user adiletzainidinov
gh auth setup-git --hostname github.com
umask 077
git clone --mirror https://github.com/adiletzainidinov/balago-video.git source-private.git
git --git-dir=source-private.git fsck --full
git --git-dir=source-private.git for-each-ref --format='%(refname) %(objectname)' refs/heads refs/tags > source-private-refs.txt
git --git-dir=source-private.git rev-list --objects --all > source-private-objects.txt
gitleaks git source-private.git --log-opts="--all" --redact --report-format=json --report-path=source-private-secrets.json
```

Эта последовательность только читает исходный GitHub-репозиторий. Не добавлять исходному remote команды push. Полную неочищенную копию хранить приватно.

## Проверить все версии файлов

Проверить каждый переносимый объект и все версии, а не только последние ветки. Автоматический поиск ключей не определяет, является ли файл полной книгой, клиентскими данными или непроверенным медиа. Использовать список `source-private-objects.txt`; конкретный объект можно прочитать через `git --git-dir=source-private.git cat-file blob SHA`.

Составить локальный `private-paths.txt` с полным списком исключаемых путей во всех исторических вариантах имён. Включить закрытые книги и их части, клиентские данные, секреты, приватные архивы, непроверенные медиа и ранее заблокированные бинарные объекты. Список текущих исключений в `.migration/CONTINUATION_EXCLUSIONS.json` — отправная точка, а не аудит всей истории. Подписанные ссылки и секреты в сообщениях коммитов также требуют отдельной проверки.

Очистку выполнять в отдельной локальной копии, сохраняя исходную приватную копию:

```bash
git clone --mirror --no-local source-private.git source-reviewed.git
git -C source-reviewed.git filter-repo --invert-paths --paths-from-file ../private-paths.txt --path-rename .github/workflows/:.github/workflows-disabled/
gitleaks git source-reviewed.git --log-opts="--all" --redact --report-format=json --report-path=source-reviewed-secrets.json
git --git-dir=source-reviewed.git fsck --full
```

После фильтрации заново проверить полное содержимое истории, сообщения, файлы, отсутствие активных workflow и допустимость каждого бинарного объекта. Если секрет попал в содержимое разрешённого файла или сообщение коммита, удаления путей недостаточно: нужна дополнительная очистка и повторный аудит. Блокировки не обходить кодировкой, промежуточной публикацией или загрузкой того же файла по другому адресу.

Фильтрация меняет SHA и подписи затронутых коммитов. Это будет очищенная история с сохранёнными допустимыми метаданными, а не побайтовое оригинальное зеркало. Если вся исходная история полностью пригодна для публикации без фильтрации, её исходные SHA можно сохранить; такой пригодности в этой сессии не установлено.

## Сохранить существующие ветки цели

Только после завершённого полного аудита подключить новый аккаунт. Публиковать очищенную историю в отдельном пространстве имён внутри существующего `banamind-render`, сохраняя текущие `main`, производственную ветку и снимки:

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth switch --hostname github.com --user adiletgpt6-beep
gh auth setup-git --hostname github.com
git -C source-reviewed.git remote add reviewed-target https://github.com/adiletgpt6-beep/banamind-render.git
git -C source-reviewed.git ls-remote reviewed-target 'refs/heads/history-reviewed-2026-10-27/*'
git -C source-reviewed.git push --dry-run reviewed-target 'refs/heads/*:refs/heads/history-reviewed-2026-10-27/*'
```

Если пространство имён уже занято, сначала проверить его содержимое и выбрать свободное, ничего не перезаписывая. После успешного полного аудита и проверки dry-run команда публикации:

```bash
git -C source-reviewed.git push reviewed-target 'refs/heads/*:refs/heads/history-reviewed-2026-10-27/*'
```

Не применять `--force` или `--mirror` к цели. Теги публиковать только после такой же проверки их объектов, сообщений и конфликтов имён. Существующие снимки не объявлять оригинальной историей.

## Релизы, приватные файлы и настройки

- Метаданные тегов, релизов, PR/issues и комментариев уже сохранены в `.migration/archive/`. Нативные объекты GitHub этой сессией не создавались.
- Для конкретного разрешённого вложения на доверенном компьютере: `gh release download TAG --repo adiletzainidinov/balago-video --dir private-release-assets/TAG`. Файлы оставить приватными до проверки. Всего не скопировано 856 вложений (~31,2 ГБ).
- LFS при необходимости получить приватно: `git --git-dir=source-private.git lfs fetch --all`. Проверить лицензии и закрытые данные до возможной публикации.
- Секреты восстанавливать из доверенного хранилища непосредственно в настройках целевого GitHub-репозитория. Их значения не добавлять в Git, отчёты или чат. Настройки и Actions artifacts автоматически не перенесены.
- Подготовка к производству — отдельная задача: приватные книги/аудио/видео должны оставаться закрытыми; workflow сохранять неактивными до отдельного задания. Рендер и платные функции при миграции не запускались.

Синтаксис проверен по первичным источникам: [Gitleaks](https://github.com/gitleaks/gitleaks#readme) и [git-filter-repo](https://github.com/newren/git-filter-repo/blob/main/Documentation/git-filter-repo.txt).
