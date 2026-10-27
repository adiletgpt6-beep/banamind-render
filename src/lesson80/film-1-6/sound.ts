// Звуковые события фильма (кадры фильма): очень тихий тон комнаты на всю
// длину, отдалённые птицы и шелест листвы на планах дерева, шорох травинки
// при укладке, шорох бумаги при сгибе. Моменты берутся из плана птицы и
// шкалы реплик — те же данные, что у анимации.
import type { Timeline } from "../core/timing";
import { FPS } from "../core/video";
import type { SfxEvent } from "./FilmAudio";
import { planOf } from "./birdPlan";
import { FILM } from "./script";

const A = (n: string) => `${FILM.voiceDir}/sfx/${n}.mp3`;

export const filmSfx = (tl: Timeline): SfxEvent[] => {
  const s = (sec: number) => Math.round(sec * FPS);
  const out: SfxEvent[] = [];
  // тон комнаты и далёкая улица — на всю длину, очень тихо
  for (let t = 0; t < tl.durationSec; t += 30) out.push({ at: s(t), src: A("room"), volume: 0.1, dur: Math.min(31, tl.durationSec - t), fade: 0.8 });
  // далёкие птицы — редкие фразы (не та птица: у неё клюв занят)
  for (let t = 3; t < tl.durationSec - 4; t += 23) out.push({ at: s(t), src: A("birds-far"), volume: 0.12, dur: 10, fade: 1.2 });
  for (const seg of planOf(tl)) {
    if (seg.state === "place") out.push({ at: s(seg.at + seg.dur * 0.55), src: A("rustle"), volume: 0.22 });
    if (seg.state === "adjust") out.push({ at: s(seg.at + seg.dur * 0.3), src: A("rustle"), volume: 0.14 });
    if (seg.state === "takeOff") out.push({ at: s(seg.at + 0.15), src: A("wings"), volume: 0.16 });
    if (seg.state === "pick") out.push({ at: s(seg.at + seg.dur * 0.68), src: A("rustle"), volume: 0.12 });
  }
  // бумага: Юсуф делает следующий сгиб в финале
  const last = tl.cues[tl.cues.length - 1];
  out.push({ at: s(last.to + 1.3), src: "audio/sfx-paper.mp3", volume: 0.16 });
  return out;
};
