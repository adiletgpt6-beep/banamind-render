// Отдельная точка входа для локальной проверки компонентов фильма №35:
//   npx remotion still src/programmers-hardest-task/dev/index.ts PhtGallery out.png --frame=N
import { registerRoot } from "remotion";
import { DevRoot } from "./DevRoot";

registerRoot(DevRoot);
