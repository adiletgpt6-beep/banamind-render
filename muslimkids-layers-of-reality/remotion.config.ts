import { Config } from "@remotion/cli/config";

// WebGL in headless Chromium without a GPU: ANGLE → SwiftShader.
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(16);
Config.setConcurrency(2);
Config.setEntryPoint("src/index.ts");
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);
