// Ключевые моменты действий в сценах (кадры сцены) — одни и те же для
// анимации и звуков. Зависят от фактических таймингов реплик.
import type { Bg18SceneId } from "./script";
import type { Bg18Timeline } from "./timing";

const FPS = 30;

export const lineIn = (tl: Bg18Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id)!;
  const s = tl.scenes.find((x) => x.id === c.scene)!;
  return { from: Math.round((c.from - s.from) * FPS), to: Math.round((c.to - s.from) * FPS) };
};

export const beatsOf = (tl: Bg18Timeline) => {
  const m01 = lineIn(tl, "m01");
  const f01 = lineIn(tl, "f01");
  const f02 = lineIn(tl, "f02");
  const n03 = lineIn(tl, "n03");
  return {
    hook: { pops: [6, 24, 42], sweep: 52 },
    chat: {
      momSend: m01.from - 8, // голосовое мамы появляется в чате
      dadSeen: m01.to + 4, // папа смотрит в телефон
      dadSend: f01.from - 8,
    },
    scroll: { start: 8, stop: 64 },
    link: {
      typeFrom: 4,
      send: 40, // мама отправляет ссылку
      fly: 46, // карточка перелетает к папе (match cut)
      arrive: 78,
      tap: f02.to + 2, // папа открывает ссылку
      open: f02.to + 20,
      brand: n03.from, // бренд — только после открытия
    },
    cta: { fold: 0 },
  } as const;
};

export type Sfx = { readonly scene: Bg18SceneId; readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

// Негромкие звуки чата: только при появлении сообщений и касаниях.
export const sfxOf = (tl: Bg18Timeline): Sfx[] => {
  const b = beatsOf(tl);
  const out: Sfx[] = [];
  b.hook.pops.forEach((at) => out.push({ scene: "hook", at, src: "audio/sfx-pop.mp3", volume: 0.32 }));
  out.push({ scene: "chat", at: b.chat.momSend, src: "audio/sfx-pop.mp3", volume: 0.3 });
  out.push({ scene: "chat", at: b.chat.dadSend, src: "audio/sfx-pop.mp3", volume: 0.3 });
  out.push({ scene: "scroll", at: b.scroll.start, src: "audio/sfx-whoosh.mp3", volume: 0.16 });
  out.push({ scene: "scroll", at: b.scroll.stop, src: "audio/sfx-tap.mp3", volume: 0.35 });
  out.push({ scene: "link", at: b.link.typeFrom, src: "audio/sfx-typing.mp3", volume: 0.16, dur: (b.link.send - b.link.typeFrom) / FPS });
  out.push({ scene: "link", at: b.link.send, src: "audio/sfx-pop.mp3", volume: 0.3 });
  out.push({ scene: "link", at: b.link.fly, src: "audio/sfx-whoosh.mp3", volume: 0.14 });
  out.push({ scene: "link", at: b.link.tap, src: "audio/sfx-tap.mp3", volume: 0.35 });
  out.push({ scene: "cta", at: 2, src: "audio/sfx-whoosh.mp3", volume: 0.14 });
  out.push({ scene: "cta", at: 26, src: "audio/sfx-chime.mp3", volume: 0.12 });
  return out;
};
