// Точка входа ролика BG-048 (рендер только этой композиции):
//   npx remotion render src/campaign50/bg-048/index.ts BalaGoBG048 out/balago-bg-048.mp4 --props='{"requireVoice":true}'
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
