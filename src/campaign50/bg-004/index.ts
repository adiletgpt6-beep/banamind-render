// Отдельная точка входа BG-004 (не меняет src/Root.tsx и не затрагивает
// прежние ролики, BG-001, BG-032 и другие эпизоды партии):
//   npx remotion studio src/campaign50/bg-004/index.ts
import { registerRoot } from "remotion";
import { BG004Root } from "./Root";

registerRoot(BG004Root);
