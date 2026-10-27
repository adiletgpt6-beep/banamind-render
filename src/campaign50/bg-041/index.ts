// Отдельная точка входа BG-041 (не меняет src/Root.tsx, src/campaign50/*
// общие файлы и другие ролики):
//   npx remotion studio src/campaign50/bg-041/index.ts
//   npx remotion bundle src/campaign50/bg-041/index.ts --out-dir=build/bg-041
import { registerRoot } from "remotion";
import { BG041Root } from "./Root";

registerRoot(BG041Root);
