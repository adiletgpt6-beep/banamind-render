// Отдельная точка входа BG-003 (не меняет src/Root.tsx, src/campaign50/Root.tsx
// и src/campaign50/index.ts — параллельные эпизоды не конфликтуют):
//   npx remotion studio src/campaign50/bg-003/index.ts
//   npx remotion bundle src/campaign50/bg-003/index.ts --out-dir=build/bg-003
import { registerRoot } from "remotion";
import { BG003Root } from "./Root";

registerRoot(BG003Root);
