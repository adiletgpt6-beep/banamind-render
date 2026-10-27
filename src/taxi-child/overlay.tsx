// Субтитры диктора и звук ролика BalaGo «Сабак бүттү».
//
// Субтитры (кыргызча, обязательны): по одной фразе, крупно, в центральной
// части кадра над нижней зоной интерфейса площадки; фраза сменяется по
// фактическим таймингам слов озвучки.
//
// Звук: голос диктора; спокойная инструментальная музыка с мягким
// пульсом — заметно тише речи и приглушается под ней, на последней фразе
// не усиливается; короткие эффекты в моменты действий (звонок,
// уведомления, ремень, машина, нажатие).
import { Audio } from "@remotion/media";
import { useContext } from "react";
import { interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { easeOut } from "../two-schedules-2d/rig/motion";
import { TimelineContext } from "./context";
import { TC_FRAMES, TC_VIDEO, tcLineById, type TcSceneId } from "./script";
import {
  sceneBeats,
  subtitleChunks,
  type TcCue,
  type TcTimeline,
} from "./timing";

const FPS = TC_VIDEO.fps;
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const Subtitles: React.FC = () => {
  const { cues } = useContext(TimelineContext);
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.1 && t <= c.to + 0.35);
  if (!cue) return null;
  const line = tcLineById(cue.id);
  const parts = subtitleChunks(line.text);
  // какая фраза звучит: по словам озвучки
  let idx = 0;
  let wi = 0;
  const startOf = parts.map((p) => {
    const s = wi;
    wi += p.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
    return s;
  });
  const total = wi;
  const wt = (i: number) =>
    cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / total;
  for (let k = 1; k < parts.length; k++)
    if (t >= wt(startOf[k]) - 0.08) idx = k;
  const a =
    easeOut((t - (cue.from - 0.1)) / 0.15) *
    (1 - easeOut((t - (cue.to + 0.2)) / 0.15));
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 400,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "12px 28px",
          borderRadius: 24,
          backgroundColor: "rgba(16,24,48,0.80)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.22)",
        }}
      >
        {parts[idx]}
      </div>
    </div>
  );
};

// ---------- Звук ----------
const MUSIC: readonly { src: string; gain: number }[] = [
  { src: "audio/music-founder-warm.mp3", gain: 0.9 },
  { src: "audio/music-founder-rhythm.mp3", gain: 0.55 },
];
const MUSIC_VOLUME = 0.22;
const MUSIC_UNDER_VOICE = 0.07;

type Sfx = {
  readonly at: number;
  readonly src: string;
  readonly volume: number;
};
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const OWN = (n: string) => `audio/two-schedules-2d/sfx/${n}.mp3`;

// Эффекты в моменты действий (кадры ролика) — по тем же ключевым моментам,
// что и анимация сцен (sceneBeats).
export const tcSfx = (tl: TcTimeline): Sfx[] => {
  const S = (id: TcSceneId) => tl.scenes.find((s) => s.id === id)!;
  const B = (id: TcSceneId) => sceneBeats(S(id));
  const at = (id: TcSceneId, f: number) => S(id).from + f;
  const hook = B("hook");
  const svc = B("service");
  const grp = B("group");
  const wa = B("whatsapp");
  const ho = B("handoff");
  const pr = B("price");
  const tr = B("trial");
  const cta = B("cta");
  return [
    { at: at("hook", hook.bell), src: COMMON("bell"), volume: 0.16 },
    { at: at("hook", hook.bell + 1), src: COMMON("notify"), volume: 0.2 },
    { at: at("hook", hook.line), src: COMMON("whoosh"), volume: 0.12 },
    { at: at("service", svc.fwd0), src: COMMON("car"), volume: 0.12 },
    { at: at("service", svc.back0), src: COMMON("bell"), volume: 0.08 },
    { at: at("group", 4), src: COMMON("pop"), volume: 0.16 },
    { at: at("group", 10), src: COMMON("pop"), volume: 0.16 },
    { at: at("group", 16), src: COMMON("pop"), volume: 0.16 },
    { at: at("group", grp.inside + 8), src: OWN("belt"), volume: 0.22 },
    { at: at("group", grp.flip), src: COMMON("whoosh"), volume: 0.1 },
    { at: at("whatsapp", wa.m1), src: COMMON("notify"), volume: 0.18 },
    { at: at("whatsapp", wa.m2), src: COMMON("notify"), volume: 0.18 },
    { at: at("whatsapp", wa.loc), src: COMMON("notify"), volume: 0.18 },
    { at: at("whatsapp", wa.map - 4), src: COMMON("tap"), volume: 0.25 },
    { at: at("handoff", 0), src: COMMON("bell"), volume: 0.1 },
    { at: at("handoff", 6), src: COMMON("car"), volume: 0.12 },
    { at: at("handoff", ho.door), src: OWN("car-door"), volume: 0.22 },
    { at: at("handoff", ho.toast), src: COMMON("notify"), volume: 0.2 },
    { at: at("handoff", ho.enter + 30), src: OWN("door-close"), volume: 0.14 },
    { at: at("price", pr.price), src: COMMON("chime"), volume: 0.14 },
    { at: at("trial", tr.kids), src: COMMON("pop"), volume: 0.16 },
    { at: at("trial", tr.kids + 7), src: COMMON("pop"), volume: 0.16 },
    { at: at("trial", tr.kids + 14), src: COMMON("pop"), volume: 0.16 },
    { at: at("trial", tr.card), src: COMMON("paper"), volume: 0.18 },
    { at: at("trial", tr.stamp), src: COMMON("tap"), volume: 0.22 },
    { at: at("cta", cta.link), src: COMMON("tap"), volume: 0.2 },
    { at: at("cta", cta.wa), src: COMMON("pop"), volume: 0.16 },
  ].filter((x) => x.at >= 0 && x.at < TC_FRAMES - 10);
};

export const TcAudio: React.FC<{ readonly tl: TcTimeline }> = ({ tl }) => {
  const s = (sec: number) => Math.round(sec * FPS);
  const voiced = tl.cues.filter((c): c is TcCue & { file: string } =>
    Boolean(c.file),
  );
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const c of voiced) {
      const a = s(c.from);
      const b = s(c.to);
      v = Math.min(
        v,
        interpolate(
          f,
          [a - 10, a, b, b + 14],
          [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME],
          CL,
        ),
      );
    }
    return (
      v *
      interpolate(
        f,
        [0, 0.5 * FPS, TC_FRAMES - 1.5 * FPS, TC_FRAMES - 1],
        [0, 1, 1, 0],
        CL,
      )
    );
  };
  return (
    <>
      {MUSIC.map((m) => (
        <Sequence
          key={m.src}
          name={`Музыка: ${m.src}`}
          durationInFrames={TC_FRAMES}
        >
          <Audio src={staticFile(m.src)} volume={(f) => duck(f) * m.gain} />
        </Sequence>
      ))}
      {tcSfx(tl).map((x, i) => (
        <Sequence
          key={`sfx-${i}`}
          name={`Эффект: ${x.src.split("/").pop()}`}
          from={x.at}
          premountFor={FPS}
        >
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {voiced.map((c) => (
        <Sequence
          key={c.id}
          name={`Голос: ${c.id}`}
          from={s(c.audioFrom)}
          durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
          premountFor={FPS}
        >
          <Audio
            src={staticFile(`${TC_VIDEO.voiceDir}/${c.file}`)}
            volume={1}
          />
        </Sequence>
      ))}
    </>
  );
};
