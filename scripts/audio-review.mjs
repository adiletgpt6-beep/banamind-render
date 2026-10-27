// CLI проверки настоящего звука ролика аудиомоделью OpenAI.
// Подробности — docs/audio-review.md. Платный вызов API делается только
// при явном запуске без --dry-run; в CI эта команда не вызывается.
//
//   npm run audio:review -- --input out/balago-two-schedules-2d.mp4 \
//     --out out/audio-review/two-schedules-2d --start 0 --duration 12
import { basename, extname, join } from "node:path";
import {
  ArgError,
  DEFAULTS,
  DEFAULT_MODEL,
  parseArgs,
  runReview,
} from "./lib/audio-review.mjs";

const HELP = `Проверка звука MP4/WAV/MP3 аудиомоделью (${DEFAULT_MODEL}).

  --input <файл>        MP4, WAV или MP3 (обязательно)
  --out <каталог>       куда сохранить отчёты (по умолчанию out/audio-review/<имя>)
  --context <json>      необязательный сценарий {"lines":[{"id","text","plan_at","placement"?}]};
                        используется ТОЛЬКО локально после ответа модели, в запрос не попадает
  --start <с>           начало диапазона (0)
  --duration <с>        длина диапазона (до конца файла)
  --dry-run             всё, кроме обращения к API (бесплатно)

Дополнительно:
  --auth <режим>        claude_proxy | key (по умолчанию AUDIO_QA_AUTH_MODE или key)
  --model <id>          аудиомодель (${DEFAULT_MODEL})
  --chunk <с>           длина фрагмента (${DEFAULTS.chunkSec})
  --overlap <с>         перекрытие фрагментов (${DEFAULTS.overlapSec})
  --max-tokens <n>      лимит ответа (${DEFAULTS.maxTokens})
  --timeout <с>         ожидание одного ответа (${DEFAULTS.timeoutSec})
  --max-attempts <n>    попыток при временных ошибках (${DEFAULTS.maxAttempts}, не больше 5)
  --cache-dir <каталог> кэш успешных ответов (по умолчанию рядом с --out)
  --no-cache            не читать и не писать кэш

Коды выхода: 0 — complete/dry_run, 2 — partial, 1 — failed, 64 — ошибка аргументов.`;

const main = async () => {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2), process.env);
  } catch (e) {
    if (e instanceof ArgError) {
      console.error(`Ошибка аргументов: ${e.message}\n\n${HELP}`);
      process.exit(64);
    }
    throw e;
  }
  if (opts.help) {
    console.log(HELP);
    return;
  }
  opts.out ??= join(
    "out",
    "audio-review",
    basename(opts.input, extname(opts.input)),
  );

  let report;
  try {
    report = await runReview(opts);
  } catch (e) {
    console.error(`Ошибка: ${e.message}`);
    process.exit(e instanceof ArgError ? 64 : 1);
  }
  const n = report.chunks.length;
  const ok = report.chunks.filter((c) => c.status === "analyzed").length;
  console.log(
    `\nСтатус: ${report.status}; фрагментов проверено ${ok}/${n}; ` +
      `аудио отправлено: ${report.audio_input_sent ? "да" : "нет"}; ответ API: ${report.api_success ? "да" : "нет"}; ` +
      `замечаний модели: ${report.model_assessment.issues.length}` +
      (report.script_comparison
        ? `; реплик сценария к ручной проверке: ${report.script_comparison.lines.filter((l) => l.needs_human_check).length}`
        : ""),
  );
  if (report.fatal_error)
    console.log(`Препятствие: ${report.fatal_error.hint}`);
  console.log(
    `Отчёты: ${join(opts.out, "audio-review.json")}, ${join(opts.out, "audio-review.md")}`,
  );
  process.exit(
    { complete: 0, dry_run: 0, partial: 2, failed: 1 }[report.status] ?? 1,
  );
};

main();
