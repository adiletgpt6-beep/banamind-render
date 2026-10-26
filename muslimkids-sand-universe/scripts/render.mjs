// Render helper (bundles once, reuses one headless browser).
//   node scripts/render.mjs stills <composition> <out-dir> <sec,sec,...>
//   node scripts/render.mjs video  <composition> <out.mp4> [startFrame-endFrame] [concurrency]
// Uses the pre-installed Chromium headless shell with software WebGL (swangle).
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const BROWSER = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const [mode, compId, out, arg, conc] = process.argv.slice(2);
const chromiumOptions = {gl: 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browser = await openBrowser('chrome', {browserExecutable: BROWSER, chromiumOptions});
const comp = await selectComposition({serveUrl, id: compId, puppeteerInstance: browser, timeoutInMilliseconds: 900000, chromiumOptions});

if (mode === 'stills') {
	fs.mkdirSync(out, {recursive: true});
	for (const s of arg.split(',')) {
		const frame = Math.min(comp.durationInFrames - 1, Math.round(Number(s) * comp.fps));
		const file = path.join(out, `${compId}_${String(s).replace('.', '_')}s.png`);
		const t0 = Date.now();
		await renderStill({composition: comp, serveUrl, output: file, frame, puppeteerInstance: browser, timeoutInMilliseconds: 900000, chromiumOptions});
		console.log(file, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
	}
} else {
	const frameRange = arg ? arg.split('-').map(Number) : undefined;
	const t0 = Date.now();
	let last = 0;
	await renderMedia({
		composition: comp,
		serveUrl,
		codec: 'h264',
		outputLocation: out,
		frameRange,
		concurrency: Number(conc ?? 2),
		puppeteerInstance: browser,
		chromiumOptions,
		timeoutInMilliseconds: 900000,
		imageFormat: 'jpeg',
		jpegQuality: 95,
		pixelFormat: 'yuv420p',
		crf: 16,
		x264Preset: 'slow',
		audioCodec: 'aac',
		audioBitrate: '192k',
		colorSpace: 'bt709',
		onProgress: ({renderedFrames, progress}) => {
			if (Date.now() - last > 30000) {
				last = Date.now();
				const el = (Date.now() - t0) / 1000;
				console.log(`frames ${renderedFrames} (${(progress * 100).toFixed(1)}%) ${el.toFixed(0)}s, ${(el / Math.max(1, renderedFrames)).toFixed(2)} s/frame`);
			}
		},
	});
	console.log('done', out, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close({silent: true});
