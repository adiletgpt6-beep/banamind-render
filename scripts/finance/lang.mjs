// Общие параметры языковых версий выпуска (для скриптов сборки).
import { SCENES as SCENES_EN } from "../../src/finance/episode/script.ts";
import { SCENES_RU } from "../../src/finance/episode/script.ru.ts";

export const LANGS = {
  en: { scenes: SCENES_EN, voiceDir: "public/finance/voice", composition: "FinanceHorseEp01", out: "finance-horse-money-system", script: "script.md", subs: "subtitles.en" },
  ru: { scenes: SCENES_RU, voiceDir: "public/finance/voice-ru", composition: "FinanceHorseEp01Ru", out: "finance-horse-money-system-ru", script: "script.ru.md", subs: "subtitles.ru" },
};
export const langOf = (arg) => {
  const l = LANGS[arg ?? "en"];
  if (!l) throw new Error(`Неизвестный язык «${arg}» (en|ru)`);
  return l;
};
