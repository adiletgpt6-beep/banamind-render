import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer("swiftshader");

// Offline environments: use a locally installed Chromium headless shell
// when REMOTION_BROWSER is set (otherwise Remotion downloads its own).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
