import { Config } from "@remotion/cli/config";

// Three.js в headless Chromium: программный WebGL (ANGLE + SwiftShader).
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setDelayRenderTimeoutInMilliseconds(120000);

// Локальный Chromium (если задан): REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
