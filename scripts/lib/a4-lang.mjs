// Языковая версия ролика 80-1-4 для Node-скриптов: --lang=ky или A4_LANG=ky
// (по умолчанию ru — русская версия, как раньше).
import { a4Pack, isA4Lang } from "../../src/lesson80-1-4/lang.ts";

const arg = process.argv.find((a) => a.startsWith("--lang="))?.slice(7) ?? process.env.A4_LANG ?? "ru";
if (!isA4Lang(arg)) throw new Error(`Неизвестный язык «${arg}»: ru | ky`);

export const LANG = arg;
export const PACK = a4Pack(arg);
// папка озвучки версии в public/
export const VOICE_DIR = `public/${PACK.video.voiceDir}`;
// позиционные аргументы без флагов (--lang=…, --subtitles и т. п.)
export const positional = () => process.argv.slice(2).filter((a) => !a.startsWith("--"));
