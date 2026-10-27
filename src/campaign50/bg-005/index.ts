// Отдельная точка входа BG-005 (не меняет src/Root.tsx и не затрагивает
// прежние ролики, BG-001, BG-032 и другие эпизоды партии):
//   npx remotion studio src/campaign50/bg-005/index.ts
import { registerRoot } from "remotion";
import { BG005Root } from "./Root";

registerRoot(BG005Root);
