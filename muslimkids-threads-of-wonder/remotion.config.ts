import { Config } from "@remotion/cli/config";

// WebGL в headless Chromium без GPU: SwiftShader через ANGLE.
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setBrowserExecutable(process.env.BROWSER_EXECUTABLE ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
