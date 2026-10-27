// Звук ролика: голоса реплик, очень тихая тёплая музыка проекта (только
// чтение общего файла audio/music-story-warm.mp3; приглушается под речью)
// и редкие негромкие эффекты: всплытие вопросов, щелчок крышки ноутбука,
// нажатия, отправка сообщения водителем, обычный звук входящего сообщения
// чата, мягкий шелест переходов, колокольчик логотипа в финале.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { lineFrames, wordFrame } from "./beats";
import { groupBeats } from "./scenes/Group";
import { planTapKey, planTapQ } from "./scenes/Plan";
import { locationBeats } from "./scenes/Location";
import { orderBeats } from "./scenes/Order";
import { BG26_SEAMLESS, BG26_VIDEO } from "./script";
import { sceneOf, type Bg26Timeline } from "./timing";

const FPS = BG26_VIDEO.fps;
const DIR = BG26_VIDEO.audioDir;
const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.1;
const MUSIC_UNDER_VOICE = 0.035;
const s = (sec: number) => Math.round(sec * FPS);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg26Audio: React.FC<{ readonly tl: Bg26Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const sfx = useMemo(() => {
    const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
    const out: Sfx[] = [];
    const h = at("hook");
    [6, 14, 22].forEach((k) => out.push({ at: h + k, src: "sfx/pop.mp3", volume: 0.22 }));
    const p = at("plan");
    out.push({ at: p + 33, src: "sfx/click.mp3", volume: 0.35 });
    const wInfo = Math.max(84, wordFrame(tl, "n02", "жолдогу"));
    const wKnow = Math.max(wInfo + 40, wordFrame(tl, "n02", "билгиңиз"));
    out.push({ at: p + planTapQ(wInfo), src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: p + planTapKey(wKnow, sceneOf(tl, "plan").frames), src: "sfx/tap.mp3", volume: 0.35 });
    const g = at("group");
    const gb = groupBeats(wordFrame(tl, "n03", "ата-энелер"), wordFrame(tl, "n03", "айдоочу"));
    out.push({ at: g + 10, src: "sfx/tick.mp3", volume: 0.2 });
    for (const send of [gb.sendA, gb.sendB]) {
      out.push({ at: g + send, src: "sfx/send.mp3", volume: 0.28 });
      out.push({ at: g + send + 6, src: "sfx/notify.mp3", volume: 0.3 });
    }
    const l = at("location");
    const n04 = lineFrames(tl, "n04");
    const lb = locationBeats(wordFrame(tl, "n04", "шилтемени"), wordFrame(tl, "n04", "жөнөтөт"), wordFrame(tl, "n04", "бул"), n04.to, sceneOf(tl, "location").frames);
    out.push({ at: l + lb.send, src: "sfx/send.mp3", volume: 0.28 });
    out.push({ at: l + lb.linkAt, src: "sfx/notify.mp3", volume: 0.3 });
    out.push({ at: l + lb.tap - 2, src: "sfx/tap.mp3", volume: 0.4 });
    out.push({ at: l + lb.arrive, src: "sfx/notify.mp3", volume: 0.3 });
    out.push({ at: l + lb.reply, src: "sfx/send.mp3", volume: 0.2 });
    const o = at("order");
    out.push({ at: o + orderBeats().onDesk, src: "sfx/tap.mp3", volume: 0.25 });
    const ct = at("cta");
    out.push({ at: ct + 10, src: "sfx/tap.mp3", volume: 0.3 });
    out.push({ at: ct + 16, src: "sfx/chime.mp3", volume: 0.2 });
    for (const sc of tl.scenes.slice(1)) if (BG26_SEAMLESS.indexOf(sc.id) < 0) out.push({ at: sc.from - 8, src: "sfx/whoosh.mp3", volume: 0.12 });
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);

  // музыка приглушается под речью
  const spans = useMemo(() => {
    const out: [number, number][] = [];
    for (const c of tl.cues) {
      const a = s(c.from);
      const b = s(c.to);
      const last = out[out.length - 1];
      if (last && a - last[1] < s(1.5)) last[1] = b;
      else out.push([a, b]);
    }
    return out;
  }, [tl]);
  const music = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], CL));
    return v * interpolate(f, [0, FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], CL);
  };

  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={music} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG26_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
