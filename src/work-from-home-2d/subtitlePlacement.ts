// Где показывать субтитры: сверху (≈ 170 px) — когда внизу кадра важное
// действие: руки на клавиатуре, часы 17:30, тетрадь, открывающаяся книга.
// Интервалы берутся из тех же констант планов, что и сцены.
import { WFH_SCENES, WFH_VIDEO, type WfhSceneId } from "./script";
import { BOOK_SHOTS } from "./scenes/Book";
import { CLOSING_SHOTS } from "./scenes/Closing";
import { CONTEXT_SHOTS } from "./scenes/Context";
import { FOCUS_SHOTS } from "./scenes/Focus";
import { KEYS_SHOTS } from "./scenes/Keys";
import { NOTEBOOK_SHOTS } from "./scenes/Notebook";
import { WORK_SHOTS } from "./scenes/Work";

const at = (id: WfhSceneId) => Math.round(WFH_SCENES.find((s) => s.id === id)!.from * WFH_VIDEO.fps);
const end = (id: WfhSceneId) => Math.round(WFH_SCENES.find((s) => s.id === id)!.to * WFH_VIDEO.fps);
const r = (id: WfhSceneId, [a, b]: readonly [number, number]): [number, number] => [at(id) + a, at(id) + b];

export const TOP_RANGES: readonly [number, number][] = [
  r("work", WORK_SHOTS.screen),
  r("keys", KEYS_SHOTS.screen),
  r("context", CONTEXT_SHOTS.doc),
  r("context", CONTEXT_SHOTS.chat),
  [at("context") + CONTEXT_SHOTS.face[1], end("context")],
  r("focus", FOCUS_SHOTS.screen),
  r("closing", CLOSING_SHOTS.screen),
  r("closing", CLOSING_SHOTS.clock),
  r("notebook", NOTEBOOK_SHOTS.top),
  r("book", BOOK_SHOTS.clock),
  r("book", BOOK_SHOTS.open),
];

export const SUB_TOP = (f: number) => TOP_RANGES.some(([a, b]) => f >= a && f < b);
