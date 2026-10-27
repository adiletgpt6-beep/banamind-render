// Звук ролика: три голоса (оюн диктору, апа, диктор), мягкие 8-битные
// эффекты игры и бытовые звуки 2D-сцен (из функций *Sfx каждой сцены),
// шелест «загрузки уровня» на стыках и тихая игровая мелодия, которая
// приглушается под речью, в финале звучит тише и плавно уходит к концу.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { Sequence, staticFile } from "remotion";
import { cardsSfx } from "./scenes/Cards";
import { ctaSfx } from "./scenes/Cta";
import { decisionSfx } from "./scenes/Decision";
import { groupSfx } from "./scenes/Group";
import { hookSfx } from "./scenes/Hook";
import { trialSfx } from "./scenes/Trial";
import { BG44_VIDEO, type Bg44SceneId } from "./script";
import { sceneSfxCtx, type SceneSfxFn, type SfxName } from "./sound";
import { sceneOf, type Bg44Timeline } from "./timing";
import { TRANSITION_FRAMES } from "./Transition";

const FPS = BG44_VIDEO.fps;
const DIR = BG44_VIDEO.audioDir;
const s = (sec: number) => Math.round(sec * FPS);

const SCENE_SFX: Record<Bg44SceneId, SceneSfxFn> = {
  hook: hookSfx,
  cards: cardsSfx,
  group: groupSfx,
  trial: trialSfx,
  decision: decisionSfx,
  cta: ctaSfx,
};

type Abs = { readonly at: number; readonly name: SfxName; readonly volume: number };

// Громкость мелодии: тихо; под речью ещё тише; в финале — плавно в ноль.
const MUSIC = { base: 0.32, duck: 0.13 } as const;

export const Bg44Audio: React.FC<{ readonly tl: Bg44Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const out: Abs[] = [];
    for (const sc of tl.scenes) {
      const list = SCENE_SFX[sc.id](sceneSfxCtx(tl, sc.id, FPS));
      for (const x of list) if (x.at >= 0 && x.at < sc.frames) out.push({ ...x, at: sc.from + x.at });
    }
    const half = Math.floor(TRANSITION_FRAMES / 2);
    for (const sc of tl.scenes.slice(1)) out.push({ at: sc.from - half, name: "pixels", volume: 0.18 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);
  const ctaFrom = sceneOf(tl, "cta").from;
  const speaking = useMemo(() => tl.cues.map((c) => [s(c.from) - 6, s(c.to) + 6] as const), [tl]);
  // в финале мелодия тише и плавно уходит к последнему кадру (без «мёртвой» тишины)
  const musicVolume = (f: number) => {
    const talk = speaking.some(([a, b]) => f >= a && f <= b);
    const v = talk ? MUSIC.duck : f >= ctaFrom ? MUSIC.base * 0.55 : MUSIC.base;
    const fadeIn = Math.min(1, f / 10);
    const fadeOut = Math.max(0, Math.min(1, (total - 4 - f) / (2 * FPS)));
    return v * fadeIn * fadeOut;
  };
  return (
    <>
      <Sequence name="Мелодия игры" durationInFrames={total}>
        <Audio src={staticFile(`${DIR}/music/game-loop.mp3`)} loop volume={musicVolume} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.name}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/sfx/${x.name}.mp3`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG44_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
