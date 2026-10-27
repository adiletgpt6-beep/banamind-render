// Звук BG-048: голоса; музыка двумя слоями одного темпа и тональности —
// игривая «миссия» в фантазии (обрывается, когда папа снимает наушники) и
// тёплая «домашняя» с момента, когда пульт стал картоном; приглушение под
// речью; мягкие эффекты, синхронные с действием (моменты — из тех же
// функций, что и анимация сцен). Все звуки синтезированы кодом
// (scripts/campaign50/bg-048/sound.mjs).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { B48_CTA_IN, B48_VIDEO } from "./script";
import { buttonsBeats } from "./scenes/Buttons";
import { wordAt } from "./scenes/common";
import { CTA_FLIP } from "./scenes/Cta";
import { exampleBeats } from "./scenes/Example";
import { hookSlam } from "./scenes/Hook";
import { revealBeats } from "./scenes/Reveal";
import { siteBeats } from "./scenes/Site";

const FPS = B48_VIDEO.fps;
const DIR = B48_VIDEO.audioDir;
const VOICE = B48_VIDEO.voiceDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MISSION = 0.32;
const HOME = 0.27;
const UNDER = 0.075;

type Fx = { readonly src: string; readonly at: number; readonly v: number };

export const B48Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  const sc = (id: string) => tl.scenes.find((x) => x.id === id)!;
  const cueRel = (id: string) => {
    const c = tl.cues.find((x) => x.id === id)!;
    const span = sc(c.scene);
    return { from: c.from - span.from, to: c.to - span.from };
  };
  // интервалы речи; близкие реплики объединяются
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.2)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number, level: number) => {
    let v = 1;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 8, a, b, b + 14], [1, UNDER / level, UNDER / level, 1], clamp));
    return v;
  };

  const hook = sc("hook");
  const buttons = sc("buttons");
  const reveal = sc("reveal");
  const site = sc("site");
  const example = sc("example");
  const cta = sc("cta");

  // моменты эффектов
  const h = hook.from;
  const f02 = cueRel("f02");
  const opWord = wordAt(tl.cues.find((c) => c.id === "f02"), "операция", h + f02.from + 0.6);
  const slam = h + hookSlam(f02);
  const bb = buttonsBeats(cueRel("m01"));
  const b = buttons.from;
  const rb = revealBeats(cueRel("d01"), cueRel("m02"), cueRel("f03"));
  const r = reveal.from;
  const sb = siteBeats(cueRel("n01"), cueRel("n02"));
  const si = site.from;
  const n03 = cueRel("n03");
  const n04 = cueRel("n04");
  const c3 = tl.cues.find((c) => c.id === "n03");
  const c4 = tl.cues.find((c) => c.id === "n04");
  const eb = exampleBeats(n03, n04, c3 ? wordAt(c3, "акысыз", NaN) : null, c4 ? wordAt(c4, "чечим", NaN) : null, example.from);
  const decide = Number.isFinite(eb.decideWord) ? eb.decideWord : n04.from + 3.6;
  const e = example.from;
  const c = cta.from;
  const n07 = cueRel("n07");

  const fx: Fx[] = [
    { src: "whoosh", at: h + 0.02, v: 0.35 },
    { src: "beep", at: opWord, v: 0.15 },
    { src: "click", at: slam, v: 0.55 },
    { src: "beep", at: slam + 0.15, v: 0.28 },
    { src: "sparkle", at: slam + 0.05, v: 0.3 },
    { src: "click", at: b + bb.pMektep, v: 0.5 },
    { src: "boing", at: b + bb.pMektep + 0.05, v: 0.42 },
    { src: "click", at: b + bb.pPhone, v: 0.45 },
    { src: "buzz", at: b + bb.pPhone + 0.06, v: 0.4 },
    { src: "click", at: b + bb.pJumush, v: 0.5 },
    { src: "whoosh", at: b + bb.pJumush + 0.1, v: 0.22 },
    { src: "alarm", at: b + bb.clash, v: 0.3 },
    { src: "printer", at: b + bb.clash + 0.15, v: 0.35 },
    { src: "purr", at: b + bb.c0 + 0.2, v: 0.35 },
    { src: "boing", at: b + bb.catLand, v: 0.45 },
    { src: "pop", at: b + bb.catLand + 0.02, v: 0.45 },
    { src: "sparkle", at: b + bb.catLand + 0.1, v: 0.25 },
    { src: "whoosh", at: r + rb.lift, v: 0.3 },
    ...rb.folds.map((at) => ({ src: "fold", at: r + at, v: 0.45 })),
    { src: "pop", at: r + rb.pop, v: 0.4 },
    { src: "sparkle", at: r + rb.pop + 0.1, v: 0.35 },
    { src: "tap", at: r + rb.patT0, v: 0.3 },
    { src: "tap", at: r + rb.patT0 + 0.35, v: 0.28 },
    { src: "sparkle", at: r + rb.give1, v: 0.28 },
    { src: "tap", at: r + rb.grab, v: 0.25 },
    ...Array.from({ length: 10 }, (_, i) => ({ src: "type", at: si + sb.times.searchFrom + i * ((sb.times.searchTo - sb.times.searchFrom) / 10), v: 0.15 })),
    { src: "tap", at: si + sb.times.tapResult, v: 0.38 },
    { src: "whoosh", at: si + sb.times.tapResult + 0.3, v: 0.18 },
    ...Array.from({ length: 14 }, (_, i) => ({ src: "type", at: si + sb.times.fillFrom + i * ((sb.times.fillTo - sb.times.fillFrom) / 14), v: 0.16 })),
    { src: "tap", at: si + sb.times.tapButton, v: 0.4 },
    { src: "whoosh", at: si + sb.times.chatOpen, v: 0.2 },
    { src: "tap", at: si + sb.times.tapSend, v: 0.2 },
    { src: "send", at: si + sb.times.sent, v: 0.2 },
    { src: "chime", at: si + sb.memoAt, v: 0.35 },
    { src: "click", at: si + sb.press, v: 0.3 },
    { src: "pfft", at: si + sb.press + 0.05, v: 0.5 },
    { src: "click", at: si + sb.press + 0.67, v: 0.25 },
    { src: "tap", at: si + sb.stick1, v: 0.35 },
    { src: "sparkle", at: si + sb.stick1 + 0.05, v: 0.25 },
    { src: "car", at: e + n03.from + 0.3, v: 0.3 },
    // звонок «акысыз» — в паузе после реплики, не поверх слова
    { src: "chime", at: e + n03.to + 0.05, v: 0.3 },
    { src: "tap", at: e + decide, v: 0.2 },
    { src: "chime", at: e + n04.to + 0.1, v: 0.26 },
    { src: "flip", at: c + CTA_FLIP, v: 0.5 },
    { src: "sparkle", at: c + CTA_FLIP + 0.4, v: 0.35 },
    { src: "chime", at: c + B48_CTA_IN, v: 0.3 },
    { src: "sparkle", at: c + n07.from, v: 0.3 },
  ];

  // музыка «миссии»: до момента, когда папа снимает наушники
  const missionEnd = s(r + rb.lift + 0.8);
  const missionVol = (f: number) => MISSION * interpolate(f, [0, s(0.6)], [0.6, 1], clamp) * interpolate(f, [missionEnd - s(0.8), missionEnd], [1, 0], clamp) * duck(f, MISSION);
  // «домашняя» музыка: с момента, когда пульт стал картоном
  const homeFrom = s(r + 1.0);
  const homeVol = (f: number) =>
    HOME *
    interpolate(f, [homeFrom, homeFrom + s(1.6)], [0, 1], clamp) *
    interpolate(f, [s(c), s(c + 1.5)], [1, 1.15], clamp) *
    interpolate(f, [total - s(2.5), total - 1], [1, 0], clamp) *
    duck(f, HOME);

  return (
    <>
      <Sequence name="Музыка: миссия" durationInFrames={missionEnd + 2}>
        <Audio src={staticFile(`${DIR}/music-mission.mp3`)} volume={(f) => missionVol(f)} />
      </Sequence>
      <Sequence name="Музыка: дом" from={homeFrom} durationInFrames={total - homeFrom}>
        <Audio src={staticFile(`${DIR}/music-home.mp3`)} volume={(f) => homeVol(f + homeFrom)} />
      </Sequence>
      {fx
        .filter((x) => Number.isFinite(x.at) && x.at >= 0 && s(x.at) < total - 2)
        .map((x, i) => (
          <Sequence key={`fx-${i}`} name={`Эффект: ${x.src}`} from={s(x.at)} durationInFrames={Math.min(s(1.4), total - s(x.at))}>
            <Audio src={staticFile(`${DIR}/sfx/${x.src}.mp3`)} volume={x.v} />
          </Sequence>
        ))}
      {tl.cues.map((cu) =>
        cu.file ? (
          <Sequence key={cu.id} name={`Голос: ${cu.id} (${cu.role})`} from={s(cu.audioFrom)} durationInFrames={Math.ceil(cu.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${VOICE}/${cu.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
