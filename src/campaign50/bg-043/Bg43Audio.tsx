// Звук ролика: голоса героев и диктора; лёгкая «часовая» музыка проекта
// (синтезирована локально, scripts/campaign50/bg-043/music.mjs) с
// приглушением под речью; сдержанные эффекты реальных действий: тиканье,
// звонки будильников, спор шестерёнок, шаги-«топотки» часов, ручка,
// перелистывание, клавиатура, щелчок, шелест переходов, колокольчик.
import { Audio } from "@remotion/media";
import { getStaticFiles, interpolate, Sequence, staticFile } from "remotion";
import { useMemo } from "react";
import { BG43_VIDEO } from "./script";
import { SFX_CUES } from "./sfxCues";
import type { Bg43Timeline } from "./timing";

const FPS = BG43_VIDEO.fps;
const DIR = BG43_VIDEO.audioDir;
const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.28;
const MUSIC_UNDER_VOICE = 0.09;

const has = (path: string) => {
  const files = getStaticFiles();
  return files.length === 0 || files.some((x) => x.name === path);
};

export const Bg43Audio: React.FC<{ readonly tl: Bg43Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const spans = useMemo(() => {
    const out: [number, number][] = [];
    for (const c of tl.cues.filter((x) => x.file)) {
      const a = s(c.from);
      const b = s(c.to);
      const last = out[out.length - 1];
      if (last && a - last[1] < s(1.2)) last[1] = b;
      else out.push([a, b]);
    }
    return out;
  }, [tl]);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clampX));
    return v * interpolate(f, [0, 0.4 * FPS, total - 2.4 * FPS, total - 2], [0, 1, 1, 0], clampX);
  };
  const sfx = useMemo(() => SFX_CUES(tl).filter((x) => x.at >= 0 && x.at < total - 4), [tl, total]);
  const music = `${DIR}/music.mp3`;
  return (
    <>
      {has(music) ? (
        <Sequence name="Музыка" durationInFrames={total}>
          <Audio src={staticFile(music)} volume={(f) => duck(f)} />
        </Sequence>
      ) : null}
      {sfx.map((x, i) =>
        has(`${DIR}/sfx/${x.src}.mp3`) ? (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
            <Audio src={staticFile(`${DIR}/sfx/${x.src}.mp3`)} volume={x.volume} />
          </Sequence>
        ) : null,
      )}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG43_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
