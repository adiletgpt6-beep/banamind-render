import { mkdirSync, renameSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderFrames, renderMedia, selectComposition } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: "src/index.ts", enableCaching: true });
console.log("Review bundle ready");
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
const onBrowserLog = ({ text, type }) => {
  if (text.startsWith("3D ") || type === "error") console.log(`Browser ${type}: ${text}`);
};
try {
  const stillProps = { visualOnly: true, renderScale: 0.5 };
  const stillComposition = await selectComposition({ serveUrl, id: "BalaGoHalfHour", inputProps: stillProps, puppeteerInstance: browser });
  console.log("Still composition", { visualOnly: stillComposition.props.visualOnly, lines: stillComposition.props.manifest.lines.length });
  const visualShared = { serveUrl, composition: stillComposition, inputProps: stillProps, puppeteerInstance: browser, chromiumOptions: { gl: "swangle" }, onBrowserLog };
  mkdirSync("out/polish-frames", { recursive: true });
  const frames = process.env.HH_REVIEW_FRAMES?.split(",").map(Number) ?? [0, 2, 4, 8, 14, 20, 24, 33, 36, 43, 46, 52, 61, 67, 72, 77, 80, 85, 91, 97, 102, 106, 111, 117];
  const requested = [...new Set([0, ...frames.map(s => Math.round(s * stillComposition.fps))])].sort((a, b) => a - b);
  await renderFrames({ ...visualShared, frames: requested, scale: 0.5, concurrency: 1, muted: true,
    imageFormat: "png", outputDir: "out/polish-frames", imageSequencePattern: "frame-[frame].[ext]",
    onFrameUpdate: (count, frameIndex) => console.log(`Review frame ${frameIndex} ready (${count}/${requested.length})`),
  });
  const pad = String(requested.at(-1)).length;
  for (const frame of requested) {
    const seconds = frame / stillComposition.fps;
    renameSync(`out/polish-frames/frame-${String(frame).padStart(pad, "0")}.png`, `out/polish-frames/t${String(seconds).padStart(3, "0")}.png`);
  }
  const inputProps = { renderScale: 0.5 };
  const composition = await selectComposition({ serveUrl, id: "BalaGoHalfHour", inputProps, puppeteerInstance: browser });
  const shared = { serveUrl, composition, inputProps, puppeteerInstance: browser, chromiumOptions: { gl: "swangle" } };
  if (process.env.HH_FULL_RENDER === "true") {
    await renderMedia({ ...shared, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", crf: 23,
      imageFormat: "jpeg", jpegQuality: 92, concurrency: 1, outputLocation: "out/balago-half-hour-polished.mp4",
      onProgress: ({ progress }) => { if (Math.floor(progress * 100) % 5 === 0) console.log(`Render ${Math.round(progress * 100)}%`); },
    });
  } else if (process.env.HH_STILLS_ONLY !== "true") {
    const clips = [["opening", 0, 119], ["teacher", 2046, 2162], ["pickup", 2355, 2444], ["phone", 3105, 3194], ["walk", 912, 1019], ["seat", 2538, 2609], ["fatigue", 2730, 2849], ["transfer", 3204, 3269], ["colleague", 486, 668], ["arrival", 1950, 2045]];
    const selected = process.env.HH_REVIEW_CLIPS?.split(",").filter(Boolean);
    if (selected?.some(name => !clips.some(clip => clip[0] === name))) throw new Error("Unknown HH_REVIEW_CLIPS");
    for (const [name, a, b] of clips.filter(clip => !selected?.length || selected.includes(clip[0]))) {
      console.log(`Starting motion preview ${name}`);
      await renderMedia({ ...shared, codec: "h264", pixelFormat: "yuv420p", colorSpace: "bt709", scale: 0.5,
        imageFormat: "jpeg", concurrency: 1, frameRange: [a, b], outputLocation: `out/polish-${name}.mp4`,
        onProgress: ({ progress }) => { if (progress === 1) console.log(`${name}: pictures complete`); },
      });
      console.log(`Motion preview ${name} ready`);
    }
  }
} catch (error) {
  console.error("Review render failed:", error);
  throw error;
} finally {
  await browser.close({ silent: true }).catch(error => console.warn("Browser cleanup:", error.message));
}
