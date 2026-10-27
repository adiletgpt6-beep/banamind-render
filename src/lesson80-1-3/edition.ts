// Языковые версии ролика 80-1-3 «А если я не вижу?»: русская (исходная) и
// кыргызская. Сцены, роли, порядок реплик, паузы для зрителя, действия и
// планы у версий общие; различаются тексты реплик и надписей, озвучка,
// слова-якоря для синхронизации картинки с речью и имена файлов.
// Файл без зависимостей от Remotion: его читают и Node-скрипты.
import { A3_LINES, A3_ROLE_NAMES, A3_TEXT, A3_VIDEO, type A3Line, type A3Role } from "./script.ts";
import { KY_ANCHORS, KY_LINES, KY_PAD, KY_ROLE_NAMES, KY_TEXT } from "./script-ky.ts";

export type A3Lang = "ru" | "ky";

// Слова реплик, к которым привязаны моменты картинки (без знаков, регистр
// не важен; берётся первое вхождение слова в реплике).
export type A3Anchors = {
  readonly a13pinwheel: string; // 013: начало воспоминания о вертушке
  readonly a13skin: string; // 013: начало воспоминания о щеке
  readonly a23apple: string; // 023: вставка с яблоней
  readonly a24plants: string; // 024: вид за окном
  readonly a28second: string; // 028: второе предложение — общий план
  readonly a30need: string; // 030: «нужно разбираться» — жест учителя
};

export type A3Edition = {
  readonly lang: A3Lang;
  readonly id: string; // композиция Remotion
  readonly output: string; // имя MP4 в out/
  readonly voiceDir: string; // озвучка (относительно public/)
  readonly voices: string; // голоса ролей и выбор дублей
  readonly lines: readonly A3Line[];
  readonly text: { readonly title: string; readonly final: readonly string[] };
  readonly roleNames: Record<A3Role, string>;
  readonly anchors: A3Anchors;
  readonly pad: string; // страховочное слово синтеза (вырезается)
  readonly srt: string;
};

export const A3_EDITIONS: Record<A3Lang, A3Edition> = {
  ru: {
    lang: "ru",
    id: A3_VIDEO.id,
    output: A3_VIDEO.output,
    voiceDir: A3_VIDEO.voiceDir,
    voices: "src/lesson80-1-3/voices.json",
    lines: A3_LINES,
    text: A3_TEXT,
    roleNames: A3_ROLE_NAMES,
    anchors: { a13pinwheel: "вертушка", a13skin: "кожа", a23apple: "яблонях", a24plants: "растениях", a28second: "А", a30need: "Нужно" },
    pad: "Хорошо.",
    srt: "docs/lesson80-1-3/lesson-80-1-3-what-if-i-cant-see.ru.srt",
  },
  ky: {
    lang: "ky",
    id: `${A3_VIDEO.id}-ky`,
    output: "lesson-80-1-3-what-if-i-cant-see-ky-16x9",
    voiceDir: "audio/lesson80-1-3-ky",
    voices: "src/lesson80-1-3/voices-ky.json",
    lines: KY_LINES,
    text: KY_TEXT,
    roleNames: KY_ROLE_NAMES,
    anchors: KY_ANCHORS,
    pad: KY_PAD,
    srt: "docs/lesson80-1-3/lesson-80-1-3-what-if-i-cant-see.ky.srt",
  },
};

export const a3Edition = (lang?: string | null): A3Edition => A3_EDITIONS[lang === "ky" ? "ky" : "ru"];

// Язык для Node-скриптов: флаг --lang=ky (или --lang ky) либо переменная
// A3_LANG; без них — ru. Неизвестное значение — ошибка (чтобы опечатка не
// запустила русскую сборку и не перезаписала русские файлы).
export const a3LangFromArgs = (argv: readonly string[], env: Record<string, string | undefined>): A3Lang => {
  const i = argv.findIndex((a) => a === "--lang" || a.startsWith("--lang="));
  const raw = i < 0 ? env.A3_LANG : argv[i].startsWith("--lang=") ? argv[i].slice(7) : argv[i + 1];
  if (raw === undefined || raw === "") return "ru";
  const v = raw.trim().toLowerCase();
  if (v === "ru" || v === "ky") return v;
  throw new Error(`Неизвестная языковая версия «${raw}» (есть: ru, ky)`);
};

// Аргументы скрипта без флага языка (для скриптов с позиционным путём).
export const a3PlainArgs = (argv: readonly string[]): string[] => {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--lang") i++;
    else if (!argv[i].startsWith("--")) out.push(argv[i]);
  }
  return out;
};
