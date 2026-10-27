import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduleVoiceClips } from "../src/voice-timing.ts";

const clip = (id, startFrame, durationSec) => ({
  id,
  file: `${id}.mp3`,
  startFrame,
  durationSec,
});

test("сдвигает пересекающиеся фразы с паузой и сохраняет исходные данные", () => {
  const clips = [clip("second", 20, 0.5), clip("first", 0, 1)];
  const before = structuredClone(clips);
  const result = scheduleVoiceClips(clips, 30, 750);
  assert.deepEqual(
    result.map(({ id, startFrame }) => ({ id, startFrame })),
    [
      { id: "first", startFrame: 0 },
      { id: "second", startFrame: 33 },
    ],
  );
  assert.deepEqual(clips, before);
});

test("запрещает обрезанную финальную фразу и переполнение после сдвига", () => {
  assert.throws(
    () => scheduleVoiceClips([clip("cta", 606, 6)], 30, 750),
    /cta.*786.*750.*VOICE_LINES/,
  );
  assert.throws(
    () =>
      scheduleVoiceClips(
        [clip("previous", 500, 4), clip("cta", 606, 4.3)],
        30,
        750,
      ),
    /cta.*752.*750/,
  );
  assert.equal(
    scheduleVoiceClips([clip("cta", 606, 4.8)], 30, 750)[0].startFrame,
    606,
  );
});

test("принимает отсутствие озвучки, отклоняет повреждённые тайминги", () => {
  assert.deepEqual(scheduleVoiceClips([], 30, 750), []);
  assert.throws(() => scheduleVoiceClips(undefined, 30, 750), /manifest/);
  assert.throws(
    () => scheduleVoiceClips([clip("cta", 606, NaN)], 30, 750),
    /тайминги/,
  );
  assert.throws(
    () => scheduleVoiceClips([clip("cta", -1, 1)], 30, 750),
    /тайминги/,
  );
});
