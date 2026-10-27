import { Config } from "@remotion/cli/config";

// В облачной среде — предустановленный headless Chromium (без скачивания).
const local = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
import { existsSync } from "node:fs";
if (existsSync(local)) Config.setBrowserExecutable(local);
Config.setChromiumOpenGlRenderer("angle");
