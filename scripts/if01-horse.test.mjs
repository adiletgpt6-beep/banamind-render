// Tests for the horse presenter: lip-sync data integrity and deterministic
// mouth/pose evaluation. Run: node --test scripts/if01-horse.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { mouthAt } from "../src/islamic-finance-01/horse/lipsync.ts";
import { evalTrack, REST } from "../src/islamic-finance-01/horse/pose.ts";

const path = "public/audio/islamic-finance-01/lipsync.json";

test("lipsync.json: 900 envelope frames, phones inside their words, monotonic", { skip: !existsSync(path) && "no lipsync data" }, () => {
  const d = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(d.version, 1);
  assert.equal(d.env.length, 900);
  let t = 0;
  let phones = 0;
  for (const line of d.lines) {
    for (const w of line.words) {
      assert.ok(w.start >= t - 0.05, `${w.text} starts before the previous word`);
      t = w.start;
      for (const p of w.phones) {
        assert.ok(p.start >= w.start - 0.02 && p.end <= w.end + 0.02, `${w.text}/${p.p} outside its word`);
        assert.ok(p.end >= p.start);
        phones++;
      }
    }
  }
  assert.ok(phones > 200, `only ${phones} phones`);
  // mouth closed in a pause, open on a vowel, deterministic
  const pause = mouthAt(d, Math.round(12.3 * 30));
  assert.equal(pause.open, 0);
  const vowel = mouthAt(d, Math.round(10.45 * 30)); // "twenty"
  assert.ok(vowel.open > 0.15, `mouth open ${vowel.open}`);
  assert.deepEqual(mouthAt(d, 300), mouthAt(d, 300));
});

test("pose tracks interpolate and hold", () => {
  const beats = [
    { at: 10, dur: 10, pose: { headTurn: 1 } },
    { at: 30, dur: 10, pose: { headTurn: -1, smile: 1 } },
  ];
  assert.equal(evalTrack(beats, 0).headTurn, REST.headTurn);
  const mid = evalTrack(beats, 15).headTurn;
  assert.ok(mid > 0 && mid < 1);
  assert.equal(evalTrack(beats, 25).headTurn, 1);
  assert.equal(evalTrack(beats, 25).smile, REST.smile);
  assert.equal(evalTrack(beats, 60).headTurn, -1);
  assert.equal(evalTrack(beats, 60).smile, 1);
});
