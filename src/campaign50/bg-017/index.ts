// Точка входа ролика BG-017 (рендер только этой композиции):
//   npx remotion render src/campaign50/bg-017/index.ts BalaGoBG017 out/balago-bg-017.mp4
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
