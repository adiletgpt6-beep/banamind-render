import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const part = process.env.HH_PART ?? "audio";
const audioOnly = part === "audio";
const inputProps = { audioOnly, visualOnly: !audioOnly, renderScale: 1 };
const serveUrl = await bundle({ entryPoint: "src/index.ts", enableCaching: true });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
mkdirSync("out", { recursive: true });
try {
  const composition = await selectComposition({ serveUrl, id: "BalaGoHalfHour", inputProps, puppeteerInstance: browser });
  const shared = { serveUrl, composition, inputProps, puppeteerInstance: browser, chromiumOptions: { gl: "swangle" } };
  let reported = -1;
  const onProgress = ({ progress }) => {
    const p = Math.floor(progress * 20) * 5;
    if (p !== reported) { reported = p; console.log(`${part}: ${p}%`); }
  };
  if (audioOnly) {
    const code = await build({ entryPoints: ["src/half-hour/timeline.ts"], bundle: true, platform: "node", format: "esm", write: false });
    const { placeLines } = await import("data:text/javascript;base64," + Buffer.from(code.outputFiles[0].text).toString("base64"));
    const lines = placeLines(composition.props.manifest);
    writeFileSync("out/audio-timing.json", JSON.stringify(lines, null, 2));
    // One continuous master avoids AAC padding at the video chunk boundaries.
    await renderMedia({ ...shared, codec: "wav", concurrency: 2, outputLocation: "out/half-hour-master.wav", onProgress });
  } else {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n >= 8) throw new Error("HH_PART must be audio or 0–7");
    await renderMedia({ ...shared, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", crf: 22,
      imageFormat: "jpeg", jpegQuality: 92, concurrency: 1, muted: true,
      frameRange: [n * 450, (n + 1) * 450 - 1], outputLocation: `out/part-${n}.mp4`, onProgress,
    });
  }
  writeFileSync(`out/${audioOnly ? "audio" : `part-${part}`}.provenance.json`, JSON.stringify({
    commit: process.env.GITHUB_SHA ?? "local", part,
    composition: composition.id, width: composition.width, height: composition.height,
    fps: composition.fps, durationInFrames: composition.durationInFrames,
    frameRange: audioOnly ? [0, 3599] : [Number(part) * 450, (Number(part) + 1) * 450 - 1],
    inputProps, createdAt: new Date().toISOString(),
  }, null, 2));
} catch (error) {
  console.error(`Final render ${part} failed:`, error);
  throw error;
} finally { await browser.close({ silent: true }).catch(error => console.warn("Browser cleanup:", error.message)); }
