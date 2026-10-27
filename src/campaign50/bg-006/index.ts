// Точка входа ролика BG-006 (рендер только этой композиции):
//   npx remotion render src/campaign50/bg-006/index.ts BalaGoBG006 out/balago-bg-006.mp4
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
