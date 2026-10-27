// Звук BG-042: голоса по фактической шкале, тихая музыка проекта и несколько
// мотивированных эффектов.
// Музыка — два слоя одной длины, темпа и гармонии (scripts/generate-music.mjs):
// «pulse» (тиканье, лёгкая суета) под шуточные новости и «warm» (тёплый
// фирменный слой) с момента правил BalaGo до финала; слои идут синхронно и
// плавно сменяют друг друга, под речью музыка приглушается.
// Эффекты: заставка новостей и «выключение телевизора» синтезированы для
// этого ролика (scripts/campaign50/bg-042/sfx.mjs), остальные — общие
// файлы проекта (public/audio/sfx-*.mp3).
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { beats } from "./beats";
import { BG42_VIDEO } from "./script";
import { clamp, FPS, sec } from "./theme";
import type { Timeline } from "./timeline";

const PULSE = "audio/music-story-pulse.mp3";
const WARM = "audio/music-story-warm.mp3";
const MUSIC = 0.13;
const UNDER_VOICE = 0.045;

type Fx = { readonly at: number; readonly src: string; readonly volume: number; readonly len?: number };

export const sfxPlan = (tl: Timeline): Fx[] => {
  const b = beats(tl);
  const own = (n: string) => `${BG42_VIDEO.sfxDir}/${n}.mp3`;
  const fx: Fx[] = [
    // заставка срочной новости на первом кадре
    { at: 0, src: own("news-sting"), volume: 0.42, len: 2.6 },
    { at: b.hook.diveStart + 0.05, src: "audio/sfx-whoosh.mp3", volume: 0.22 },
    // шторки телевыпуска
    { at: b.hook.to - 0.35, src: own("stinger"), volume: 0.3 },
    { at: b.search.to - 0.35, src: own("stinger"), volume: 0.3 },
    // мама закрывает окно новостей, печатает, открывает сайт
    { at: b.search.closeNews, src: "audio/sfx-tap.mp3", volume: 0.35 },
    { at: b.search.typeStart, src: "audio/sfx-typing.mp3", volume: 0.2, len: b.search.typeEnd - b.search.typeStart + 0.1 },
    { at: b.search.openSite, src: "audio/sfx-tap.mp3", volume: 0.35 },
    // значки правил на видеостене
    { at: b.rules.address + 0.1, src: "audio/sfx-pop.mp3", volume: 0.2 },
    { at: b.rules.school + 0.1, src: "audio/sfx-pop.mp3", volume: 0.2 },
    { at: b.rules.time + 0.1, src: "audio/sfx-pop.mp3", volume: 0.2 },
    { at: b.rules.match + 0.2, src: "audio/sfx-pop.mp3", volume: 0.16 },
    // «если группа сложится»: переворот стены, отметка «акысыз»
    { at: b.trial.wall, src: "audio/sfx-whoosh.mp3", volume: 0.16 },
    { at: b.trial.free + 0.15, src: "audio/sfx-pop.mp3", volume: 0.2 },
    // отъезд из студии и выключение «телевизора» в кружке
    { at: b.trial.pullStart, src: "audio/sfx-whoosh.mp3", volume: 0.18 },
    { at: b.trial.tap, src: "audio/sfx-tap.mp3", volume: 0.3 },
    { at: b.trial.off, src: own("tv-off"), volume: 0.32 },
    // фирменный финал
    { at: b.cta.from + 0.1, src: "audio/sfx-chime.mp3", volume: 0.14 },
  ];
  return fx;
};

export const Bg42Audio: React.FC<{ readonly tl: Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const b = useMemo(() => beats(tl), [tl]);
  const fx = useMemo(() => sfxPlan(tl), [tl]);
  const spans = tl.cues.map((c) => [sec(c.from), sec(c.to)] as const);
  const duck = (f: number) => {
    let v = 1;
    for (const [a, z] of spans) v = Math.min(v, interpolate(f, [a - 10, a, z, z + 14], [1, UNDER_VOICE / MUSIC, UNDER_VOICE / MUSIC, 1], clamp));
    return v;
  };
  const fade = (f: number) => interpolate(f, [0, 8, total - 50, total - 2], [0.4, 1, 1, 0], clamp);
  // смена слоя: pulse → warm на входе в студийную графику правил
  const xA = sec(b.rules.from - 0.5);
  const xB = sec(b.rules.from + 2.5);
  const pulse = (f: number) => MUSIC * duck(f) * fade(f) * interpolate(f, [xA, xB], [1, 0], clamp);
  const warm = (f: number) => MUSIC * duck(f) * fade(f) * interpolate(f, [xA, xB], [0, 1], clamp);
  return (
    <>
      <Audio src={staticFile(PULSE)} volume={pulse} />
      <Audio src={staticFile(WARM)} volume={warm} />
      {tl.cues
        .filter((c) => c.file)
        .map((c) => (
          <Sequence key={c.id} from={Math.round(c.audioFrom * FPS)} name={`voice ${c.id}`}>
            <Audio src={staticFile(`${BG42_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ))}
      {fx.map((s, i) => (
        <Sequence key={i} from={Math.max(0, sec(s.at))} durationInFrames={sec(s.len ?? 2)} name={`sfx ${s.src.split("/").pop()}`}>
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};
