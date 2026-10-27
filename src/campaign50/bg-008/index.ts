// Собственная точка входа BG-008: бандл содержит только композицию
// BalaGoBG008. Общие src/Root.tsx и src/campaign50/{index,Root}.ts(x) не
// меняются (параллельная работа над эпизодами кампании без конфликтов).
//   npx remotion studio src/campaign50/bg-008/index.ts
//   npx remotion bundle src/campaign50/bg-008/index.ts --out-dir=build/bg-008
import { registerRoot } from "remotion";
import { BG008Root } from "./Root";

registerRoot(BG008Root);
