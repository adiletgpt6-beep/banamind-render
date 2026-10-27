// Отдельная точка входа BG-013 (не меняет src/Root.tsx, src/campaign50/*
// общие файлы и другие ролики):
//   npx remotion studio src/campaign50/bg-013/index.ts
//   npx remotion bundle src/campaign50/bg-013/index.ts --out-dir=build/bg-013
import { registerRoot } from "remotion";
import { BG013Root } from "./Root";

registerRoot(BG013Root);
