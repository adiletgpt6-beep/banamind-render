// Отдельная точка входа BG-009 (не меняет src/Root.tsx, src/campaign50/*
// общие файлы и другие ролики):
//   npx remotion studio src/campaign50/bg-009/index.ts
//   npx remotion bundle src/campaign50/bg-009/index.ts --out-dir=build/bg-009
import { registerRoot } from "remotion";
import { BG009Root } from "./Root";

registerRoot(BG009Root);
