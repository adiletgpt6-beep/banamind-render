// Точка входа ролика BG-012 (рендер только этой композиции):
//   npx remotion render src/campaign50/bg-012/index.ts BalaGoBG012 out/balago-bg-012.mp4
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
