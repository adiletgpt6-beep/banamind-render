// Звук ролика: голоса диктора и мамы, тихая тёплая музыка (под голосом
// приглушается) и немного сдержанных эффектов: карточки на стол, касания
// экрана, «отправить», мягкие щелчки окон, проезд машины, шелест на
// стыках сцен. Никаких шагов и случайных шумов.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { Sequence, interpolate, staticFile } from "remotion";
import { CTA_IN } from "./scenes/Cta";
import { SITE } from "./scenes/Site";
import { TABLE } from "./scenes/Table";
import { WINDOWS } from "./scenes/Windows";
import { BG30_VIDEO } from "./script";
import { sceneOf, type Bg30Timeline } from "./timing";

const FPS = BG30_VIDEO.fps;
const DIR = BG30_VIDEO.audioDir;
const s = (sec: number) => Math.round(sec * FPS);

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

const MUSIC = { base: 0.2, underVoice: 0.07 } as const;

export const Bg30Audio: React.FC<{ readonly tl: Bg30Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const out: Sfx[] = [];
    const h = at("hook");
    out.push({ at: h + 2, src: "sfx/whoosh.mp3", volume: 0.16 });
    out.push({ at: h + 128, src: "sfx/whoosh.mp3", volume: 0.14 });
    const t = at("table");
    for (const k of [TABLE.card1, TABLE.card2, TABLE.card3]) out.push({ at: t + k - 2, src: "sfx/paper.mp3", volume: 0.32 });
    for (const k of [TABLE.rot1, TABLE.rot2, TABLE.rot3]) out.push({ at: t + k, src: "sfx/slide.mp3", volume: 0.2 });
    out.push({ at: t + TABLE.link + 6, src: "sfx/chime.mp3", volume: 0.14 });
    out.push({ at: t + TABLE.phone + 18, src: "sfx/slide.mp3", volume: 0.16 });
    const si = at("site");
    out.push({ at: si + SITE.swipe, src: "sfx/slide.mp3", volume: 0.12 });
    for (const k of [SITE.tap0, SITE.tap1, SITE.tap2, SITE.tap3, SITE.consent, SITE.button]) out.push({ at: si + k, src: "sfx/tap.mp3", volume: 0.3 });
    for (const [a, b] of [SITE.type0, SITE.type1, SITE.type2, SITE.type3]) for (let k = a + 2; k < b; k += 7) out.push({ at: si + k, src: "sfx/tick.mp3", volume: 0.07 });
    out.push({ at: si + SITE.chat, src: "sfx/whoosh.mp3", volume: 0.12 });
    out.push({ at: si + SITE.send, src: "sfx/send.mp3", volume: 0.32 });
    const w = at("windows");
    for (let i = 0; i < 4; i++) out.push({ at: w + WINDOWS.open + i * 6, src: "sfx/pop.mp3", volume: 0.16 });
    for (let i = 0; i < 3; i++) out.push({ at: w + WINDOWS.lens + i * 22, src: "sfx/tick.mp3", volume: 0.14 });
    out.push({ at: w + WINDOWS.join + 36, src: "sfx/chime.mp3", volume: 0.14 });
    const fu = at("future");
    out.push({ at: fu + 14, src: "sfx/car.mp3", volume: 0.22 });
    out.push({ at: fu + 200, src: "sfx/car.mp3", volume: 0.2 });
    const ct = at("cta");
    out.push({ at: ct + CTA_IN - 8, src: "sfx/chime.mp3", volume: 0.16 });
    for (const sc of tl.scenes.slice(1)) out.push({ at: sc.from - 10, src: "sfx/whoosh.mp3", volume: 0.07 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);
  // музыка тише под речью; к концу ролика мягко уходит
  const speech = useMemo(() => tl.cues.map((c) => [s(c.from), s(c.to)] as const), [tl]);
  const musicVolume = (f: number) => {
    let duck = 0;
    for (const [a, b] of speech) {
      const d = f < a ? (a - f) / 9 : f > b ? (f - b) / 12 : 0;
      duck = Math.max(duck, 1 - Math.min(1, d));
    }
    const v = MUSIC.base + (MUSIC.underVoice - MUSIC.base) * duck;
    const fadeIn = interpolate(f, [0, 20], [0.4, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 75, total - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return v * fadeIn * fadeOut;
  };
  return (
    <>
      <Sequence name="Музыка" durationInFrames={total}>
        <Audio src={staticFile(`${DIR}/music.mp3`)} volume={musicVolume} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG30_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
