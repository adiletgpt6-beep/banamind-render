// Tests for IslamicFinanceShort01: storyboard integrity, script text, and —
// when the narration exists — that every line fits its scene window and that
// word timings are monotonic. Run: npm run test:if01
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { IF01_FRAMES, IF01_LINES, IF01_SCENES, IF01_VIDEO } from "../src/islamic-finance-01/script.ts";
import { buildChunks } from "../src/islamic-finance-01/captions.ts";
import { estimateIf01Manifest } from "../src/islamic-finance-01/narration.ts";

test("video spec: 1080×1920, 30 fps, exactly 900 frames", () => {
  assert.equal(IF01_VIDEO.width, 1080);
  assert.equal(IF01_VIDEO.height, 1920);
  assert.equal(IF01_VIDEO.fps, 30);
  assert.equal(IF01_FRAMES, 900);
});

test("scenes are contiguous and cover 0–30 s", () => {
  assert.equal(IF01_SCENES[0].from, 0);
  assert.equal(IF01_SCENES[IF01_SCENES.length - 1].to, 30);
  for (let i = 1; i < IF01_SCENES.length; i++) assert.equal(IF01_SCENES[i].from, IF01_SCENES[i - 1].to, `scene ${IF01_SCENES[i].id}`);
});

test("voiceover script is the approved text, in order", () => {
  const text = IF01_LINES.map((l) => l.text).join(" ");
  assert.equal(
    text,
    "What if banks couldn't charge interest? In Islamic finance, riba is prohibited. So how does financing work? Let's say a car costs twenty thousand dollars. In one model, a financier buys it, then resells it to you for an agreed twenty-two thousand, paid in installments. It's called murabaha. Not free money — a different kind of contract. Follow for more finance explained.",
  );
  for (const l of IF01_LINES) {
    const scene = IF01_SCENES.find((s) => s.id === l.scene);
    assert.ok(scene, `${l.id}: scene ${l.scene}`);
    assert.ok(l.at >= scene.from && l.endBy <= scene.to, `${l.id}: window ${l.at}–${l.endBy} inside scene ${scene.from}–${scene.to}`);
  }
});

test("caption chunks are short and in order", () => {
  const chunks = buildChunks(estimateIf01Manifest());
  assert.ok(chunks.length > 10);
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    assert.ok(c.words.length <= 5, `chunk ${i} has ${c.words.length} words`);
    assert.ok(!["a", "an", "the", "of", "to", "for"].includes(c.words[c.words.length - 1].text.toLowerCase()), `chunk ${i} ends on a function word`);
    assert.ok(c.words.map((w) => w.text).join(" ").length <= 32, `chunk ${i} too long`);
    if (i) assert.ok(c.from >= chunks[i - 1].from, `chunk ${i} out of order`);
  }
});

const manifestPath = join("public", IF01_VIDEO.voiceDir, "manifest.json");
test("narration manifest: lines fit their windows, words are monotonic", { skip: !existsSync(manifestPath) && "no narration yet" }, () => {
  const m = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(m.version, 1);
  assert.equal(m.lines.length, IF01_LINES.length);
  assert.ok(existsSync(join("public", IF01_VIDEO.voiceDir, m.file)), "narration audio file exists");
  let prevEnd = 0;
  for (const [i, line] of m.lines.entries()) {
    const spec = IF01_LINES[i];
    assert.equal(line.id, spec.id);
    assert.ok(line.start >= spec.at - 0.001, `${line.id} starts at ${line.start}, planned ${spec.at}`);
    assert.ok(line.end <= spec.endBy + 0.001, `${line.id} ends at ${line.end}, must end by ${spec.endBy}`);
    assert.ok(line.start >= prevEnd, `${line.id} overlaps the previous line`);
    prevEnd = line.end;
    assert.equal(line.words.length, spec.text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length, `${line.id}: one timing per word`);
    let t = line.start - 0.001;
    for (const w of line.words) {
      assert.ok(w.start >= t - 0.06 && w.end >= w.start, `${line.id}: word "${w.text}" timing`);
      t = w.start;
    }
  }
  if (process.env.IF01_REQUIRE_PREMIUM) assert.equal(m.draft, false, "premium narration required");
});
