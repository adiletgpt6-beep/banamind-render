// Точка входа Remotion только для выпуска №20 (BG-019):
//   npx remotion render src/campaign50/bg-019/index.ts BalaGoBG019 out/balago-bg-019.mp4
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
