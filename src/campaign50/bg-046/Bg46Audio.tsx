// Звук ролика: голоса героев, сказочная музыка проекта (два слоя одной
// гармонии: «музыкальная шкатулка» — утро и повторяющиеся дни, теплее —
// поиск решения и финал), приглушение музыки под речью, сдержанные
// эффекты точно на действиях в кадре (beats.ts): пробуждение рюкзака,
// прыжки, шаги, листки календаря, карман и записка, телефон, машина,
// щелчок ремня, молния и колокольчик финала. Вокальных звуков нет.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { ctaBeats, futureBeats, hookBeats, morningBeats, noteBeats, repeatBeats } from "./beats";
import { BG46_VIDEO } from "./script";
import { sceneOf, type Bg46Timeline } from "./timing";

const FPS = BG46_VIDEO.fps;
const DIR = BG46_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.3;
const MUSIC_UNDER_VOICE = 0.075;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg46Audio: React.FC<{ readonly tl: Bg46Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
  const music = [
    { src: `${DIR}/music-tale.mp3`, from: 0, to: at("note") + 12, gain: 1 },
    { src: `${DIR}/music-warm.mp3`, from: at("note") - 12, to: total, gain: 1 },
  ];
  const spans: [number, number][] = [];
  for (const c of tl.cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.5 * FPS, total - 2.2 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    const add = (frame: number, src: string, volume: number) => out.push({ at: Math.round(frame), src: `sfx/${src}.mp3`, volume });
    // 1. хук: рюкзак просыпается и подпрыгивает
    const hk = hookBeats(tl);
    add(hk.wake - 2, "wake", 0.32);
    add(hk.hop, "boing", 0.28);
    add(hk.reach + 2, "whoosh", 0.12);
    // 2. утро: шаги дочери, шаги мамы, рюкзак подняли, подмигивание
    const m0 = at("morning");
    const mb = morningBeats(tl);
    for (let k = 4, i = 0; k < mb.walkIn[1]; k += 13, i++) add(m0 + k, `step-${i % 4}`, 0.16);
    for (let k = mb.momGo + 6, i = 1; k < mb.momAt; k += 15, i++) add(m0 + k, `step-${i % 4}`, 0.2);
    add(m0 + mb.grab + 2, "whoosh", 0.16);
    add(m0 + mb.wink, "wake", 0.2);
    // 3. дни недели: листки календаря, прыжок, тиканье часов
    const r0 = at("repeat");
    const rb = repeatBeats(tl);
    for (let i = 0; i < 4; i++) add(r0 + rb.dayStart(i) + rb.day - 9, "flip", 0.26);
    add(r0 + rb.dayStart(0) + 6, "boing", 0.22);
    add(r0 + rb.dayStart(2) + 4, "boing", 0.12);
    add(r0 + rb.dayStart(2) + 14, "boing", 0.12);
    for (let k = rb.dayStart(3); k < rb.dayStart(4); k += 10) add(r0 + k, "tick", 0.12);
    // 4. карман, записка, телефон, отправка, правило
    const n0 = at("note");
    const nb = noteBeats(tl);
    add(n0 + nb.pop, "pop", 0.32);
    add(n0 + nb.fly0, "paper", 0.26);
    add(n0 + nb.unfold[0], "paper", 0.2);
    add(n0 + nb.S, "whoosh", 0.12);
    add(n0 + nb.typeFrom, "type", 0.18);
    add(n0 + nb.resTap, "tap", 0.32);
    add(n0 + nb.btnTap, "tap", 0.32);
    add(n0 + nb.sendAt, "tap", 0.28);
    add(n0 + nb.sendAt + 2, "send", 0.24);
    add(n0 + nb.cardAt, "chime", 0.14);
    // 5. машина подъезжает, ремень, бесплатная проба
    const f0 = at("future");
    const fb = futureBeats(tl);
    add(f0, "car", 0.3);
    add(f0 + fb.cut1 + 8, "click", 0.3);
    add(f0 + fb.wFree, "chime", 0.12);
    add(f0 + fb.cut2, "whoosh", 0.1);
    // 6. финал: молния, подмигивание, карточка контактов
    const c0 = at("cta");
    const cb = ctaBeats(tl);
    add(c0 + cb.zip0, "zip", 0.36);
    add(c0 + cb.wink, "wake", 0.18);
    add(c0 + cb.up0, "whoosh", 0.16);
    add(c0 + cb.contactsIn - 4, "chime", 0.22);
    add(c0 + cb.n04.from + 2, "boing", 0.16);
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl]);
  return (
    <>
      {music.map((m) => {
        const a = Math.max(0, m.from);
        const b = Math.min(total, m.to);
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + 20, b - 20, b], [a === 0 ? 1 : 0, 1, 1, b >= total ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG46_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
