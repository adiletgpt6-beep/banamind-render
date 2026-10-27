import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { SAMPLE_RATE, decodeMono, ffmpeg, writeWav } from "./lib/audio.mjs";

test("FFmpeg supports the voice processing codecs and filters", () => {
  assert.equal(
    spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status,
    0,
    "Install system FFmpeg before processing voice audio.",
  );
  const dir = mkdtempSync(join(tmpdir(), "balago-codecs-"));
  try {
    const wav = join(dir, "voice.wav");
    const mp3 = join(dir, "voice.mp3");
    const samples = Float32Array.from(
      { length: Math.round(SAMPLE_RATE * 0.6) },
      (_, i) => Math.sin((2 * Math.PI * 440 * i) / SAMPLE_RATE) * 0.1,
    );
    writeWav(wav, [samples]);
    ffmpeg([
      "-i",
      wav,
      "-af",
      "atempo=1.2,loudnorm=I=-16:TP=-1.5:LRA=7",
      "-ar",
      String(SAMPLE_RATE),
      "-ac",
      "1",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "192k",
      mp3,
    ]);
    const decoded = decodeMono(mp3);
    const seconds = decoded.length / SAMPLE_RATE;
    assert.ok(
      seconds > 0.45 && seconds < 0.55,
      `Unexpected duration: ${seconds}`,
    );
    let peak = 0;
    for (const sample of decoded) {
      assert.ok(Number.isFinite(sample));
      peak = Math.max(peak, Math.abs(sample));
    }
    assert.ok(peak > 0.01 && peak < 1, `Unexpected peak: ${peak}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
