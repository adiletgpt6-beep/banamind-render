// Отдельная точка входа BG-015: только композиция BalaGoBG015.
//   npx remotion render src/campaign50/bg-015/index.ts BalaGoBG015 out/balago-bg-015.mp4
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
