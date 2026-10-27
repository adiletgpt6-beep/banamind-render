// Отдельная точка входа BG-037 (не меняет src/Root.tsx и не затрагивает
// прежние ролики и BG-001):
//   npx remotion studio src/campaign50/bg-037/index.ts
import { registerRoot } from "remotion";
import { BG037Root } from "./Root";

registerRoot(BG037Root);
