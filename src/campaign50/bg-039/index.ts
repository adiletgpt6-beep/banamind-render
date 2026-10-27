// Отдельная точка входа выпуска №39 (BG-039): только своя композиция —
// общий src/Root.tsx и прежние ролики не затрагиваются.
//   npx remotion studio src/campaign50/bg-039/index.ts
//   npx remotion render src/campaign50/bg-039/index.ts BalaGoBG039 out/balago-bg-039.mp4
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
