// Отдельная точка входа BG-032 (не меняет src/Root.tsx и не затрагивает
// прежние ролики и BG-001):
//   npx remotion studio src/campaign50/bg-032/index.ts
import { registerRoot } from "remotion";
import { BG032Root } from "./Root";

registerRoot(BG032Root);
