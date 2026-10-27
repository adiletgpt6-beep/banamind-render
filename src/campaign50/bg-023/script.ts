// BalaGo-50, выпуск №24 / BG-023 «Эмне үчүн 3–4 бала?» (композиция BalaGoBG023).
//
// Игровой картографический пазл: четыре домика-пазла пытаются сойтись в один
// маршрут; соединяются только совпадающие по адресу, школе и времени. Затем
// условный салон: число детей = число реальных мест с ремнями этой машины.
// Сценарий: campaigns/balago-50/episodes/24-BG-023.md.
//
// Явный источник речи: BG23_LINES. Файл без зависимостей от Remotion —
// его читают Node-скрипты озвучки и тесты.

export const BG23_VIDEO = {
  id: "BalaGoBG023",
  output: "balago-bg-023-ep24",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-023",
} as const;

export type Bg23SceneId = "hook" | "map" | "group" | "seats" | "trial" | "cta";

// Сцены идут подряд; длительность = max(минимум, речь + хвост).
// Минимумы — по раскадровке сценария (визуальные действия успевают).
export const BG23_SCENES: readonly { readonly id: Bg23SceneId; readonly title: string; readonly minSec: number; readonly lead: number }[] = [
  { id: "hook", title: "1. Пазл-суроо", minSec: 6, lead: 0.5 },
  { id: "map", title: "2. Картадагы үйлөр", minSec: 11.5, lead: 0.6 },
  { id: "group", title: "3. Пазл бириктирилет", minSec: 10.5, lead: 0.6 },
  { id: "seats", title: "4. Коопсуз орундар", minSec: 12, lead: 0.6 },
  { id: "trial", title: "5. Толук сыноо сапары", minSec: 11, lead: 0.6 },
  { id: "cta", title: "6. Финал", minSec: 0, lead: 0.8 },
];

export type Bg23Line = {
  readonly id: string;
  readonly scene: Bg23SceneId;
  readonly role: "narrator";
  /** Текст сценария (титры). */
  readonly text: string;
  /** Как читает синтез: латиница и цифры словами, чтобы не было ошибок произношения. */
  readonly spoken: string;
  readonly seed: number;
};

// Реплики сценария дословно (раскадровка 24-BG-023.md). В CTA сценарная реплика
// разделена на три файла по предложениям — для пауз и точного финала.
export const BG23_LINES: readonly Bg23Line[] = [
  {
    id: "l1-hook",
    scene: "hook",
    role: "narrator",
    text: "BalaGo'до эмне үчүн үч-төрт баладан турган топ каралат?",
    spoken: "БалаГодо эмне үчүн үч-төрт баладан турган топ каралат?",
    seed: 2301,
  },
  {
    id: "l2-map",
    scene: "map",
    role: "narrator",
    text: "Баары бир жакка жана бир убакта эле бара бербейт. Үйдүн, мектептин дареги менен убактысы туура келиши керек.",
    spoken: "Баары бир жакка жана бир убакта эле бара бербейт. Үйдүн, мектептин дареги менен убактысы туура келиши керек.",
    seed: 2302,
  },
  {
    id: "l3-group",
    scene: "group",
    role: "narrator",
    text: "Ошондуктан ылайыктуу каттам үчүн чакан топ алдын ала түзүлөт.",
    spoken: "Ошондуктан ылайыктуу каттам үчүн чакан топ алдын ала түзүлөт.",
    seed: 2303,
  },
  {
    id: "l4-seats",
    scene: "seats",
    role: "narrator",
    text: "Балдардын саны унаадагы коопсуз орундарга жана иш жүзүндөгү шарттарга жараша аныкталат.",
    spoken: "Балдардын саны унаадагы коопсуз орундарга жана иш жүзүндөгү шарттарга жараша аныкталат.",
    seed: 2304,
  },
  {
    id: "l5-trial",
    scene: "trial",
    role: "narrator",
    text: "Топ даяр болгондон кийин биринчи толук сыноо сапары акысыз болот. Улантууну ата-эне өзү чечет.",
    spoken: "Топ даяр болгондон кийин биринчи толук сыноо сапары акысыз болот. Улантууну ата-эне өзү чечет.",
    seed: 2305,
  },
  {
    id: "c1-city",
    scene: "cta",
    role: "narrator",
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    seed: 2306,
  },
  {
    id: "c2-contacts",
    scene: "cta",
    role: "narrator",
    text: "Профилдеги шилтемеге өтүп, балаңызды каттаңыз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Профилдеги шилтемеге өтүп, балаңызды каттаңыз же вотсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    seed: 2307,
  },
  {
    id: "c3-go",
    scene: "cta",
    role: "narrator",
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    seed: 2308,
  },
];

// Спокойный доброжелательный женский голос проекта (кыргызский, ElevenLabs
// Voice Design; проверен в 2D-роликах №10–12, CER 2,1 %). Новые голоса не создаются.
export const BG23_NARRATOR = { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" } as const;

// Финальный экран (AGENTS.md / CLAUDE.md).
export const BG23_CTA = {
  city: "Бишкек • Балдар үчүн такси",
  link: "Профилдеги шилтемеге өтүңүз",
  or: "же WhatsApp аркылуу жазыңыз",
  phone: "WhatsApp: 0998 08 38 28",
  go: "BalaGo менен жолго чыгалы!",
} as const;

export const BG23_CTA_HOLD_AFTER_VOICE = 3.5; // ≥ 3 с после последнего слова
export const BG23_CTA_FADE_IN = 0.7; // контакты полностью видны через 0,7 с после начала сцены

// ---------- Шкала времени по фактическим файлам озвучки ----------

export type Bg23Word = { readonly text: string; readonly start: number; readonly end: number };
export type Bg23ManifestLine = {
  readonly id: string;
  readonly file: string;
  readonly hash?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words: readonly Bg23Word[];
};
export type Bg23Manifest = { readonly version: number; readonly video: string; readonly lines: readonly Bg23ManifestLine[] };

export type Bg23Cue = {
  readonly id: string;
  readonly scene: Bg23SceneId;
  readonly text: string;
  /** Начало файла, с. */
  readonly at: number;
  /** Речь, с (абсолютно). */
  readonly from: number;
  readonly to: number;
  readonly file: string | null;
  /** Слова, абсолютное время. */
  readonly words: readonly Bg23Word[];
};

export type Bg23Timeline = {
  readonly scenes: readonly { readonly id: Bg23SceneId; readonly title: string; readonly from: number; readonly to: number }[];
  readonly cues: readonly Bg23Cue[];
  readonly durationSec: number;
  readonly durationInFrames: number;
  readonly lastWordEnd: number;
  readonly contactsFrom: number;
  readonly estimated: boolean;
};

// Оценка для локальных кадров без озвучки (финальный рендер её не допускает).
const estimateLine = (l: Bg23Line): Bg23ManifestLine => {
  const words = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const speech = l.spoken.length * 0.068;
  const per = speech / Math.max(1, words.length);
  return {
    id: l.id,
    file: "",
    durationSec: speech + 0.3,
    speechStart: 0.15,
    speechEnd: 0.15 + speech,
    words: words.map((w, i) => ({ text: w, start: 0.15 + i * per, end: 0.15 + (i + 0.85) * per })),
  };
};

const r3 = (x: number) => Math.round(x * 1000) / 1000;

export const buildBg23Timeline = (manifest: Bg23Manifest | null): Bg23Timeline => {
  const byId = new Map((manifest?.lines ?? []).map((l) => [l.id, l]));
  const fps = BG23_VIDEO.fps;
  const scenes: { id: Bg23SceneId; title: string; from: number; to: number }[] = [];
  const cues: Bg23Cue[] = [];
  let t = 0;
  let lastWordEnd = 0;
  for (const sc of BG23_SCENES) {
    const from = t;
    let cursor = from + sc.lead;
    let speechEnd = from;
    const lines = BG23_LINES.filter((l) => l.scene === sc.id);
    for (const l of lines) {
      const m = byId.get(l.id) ?? estimateLine(l);
      // tts-реплики выровнены: речь начинается в cursor
      const at = cursor - m.speechStart;
      const cue: Bg23Cue = {
        id: l.id,
        scene: sc.id,
        text: l.text,
        at: r3(at),
        from: r3(at + m.speechStart),
        to: r3(at + m.speechEnd),
        file: byId.has(l.id) ? m.file : null,
        // титры показывают текст сценария; слова синтеза («нөл тогуз…»)
        // сопоставляются только по времени
        words: m.words.map((w) => ({ text: w.text, start: r3(at + w.start), end: r3(at + w.end) })),
      };
      cues.push(cue);
      speechEnd = cue.to;
      cursor = cue.to + (sc.id === "cta" ? 0.4 : 0.5);
    }
    lastWordEnd = Math.max(lastWordEnd, speechEnd);
    const to = sc.id === "cta" ? speechEnd + BG23_CTA_HOLD_AFTER_VOICE : Math.max(from + sc.minSec, speechEnd + 1.1);
    // границы сцен — по целым кадрам
    const toF = Math.ceil(to * fps) / fps;
    scenes.push({ id: sc.id, title: sc.title, from: r3(from), to: r3(toF) });
    t = toF;
  }
  const cta = scenes[scenes.length - 1];
  return {
    scenes,
    cues,
    durationSec: r3(t),
    durationInFrames: Math.round(t * fps),
    lastWordEnd: r3(lastWordEnd),
    contactsFrom: r3(cta.from + BG23_CTA_FADE_IN),
    estimated: BG23_LINES.some((l) => !byId.has(l.id)),
  };
};

// ---------- Титры: короткие фразы сценария ----------
// [текст фрагмента, сколько слов синтеза он покрывает]. Номер в c2 читается
// словами (11 слов), а в титрах написан цифрами.
export const BG23_SUBS: Record<string, readonly (readonly [string, number])[]> = {
  "l1-hook": [["BalaGo'до эмне үчүн", 3], ["үч-төрт баладан турган", 3], ["топ каралат?", 2]],
  "l2-map": [
    ["Баары бир жакка", 3],
    ["жана бир убакта эле", 4],
    ["бара бербейт.", 2],
    ["Үйдүн, мектептин дареги", 3],
    ["менен убактысы", 2],
    ["туура келиши керек.", 3],
  ],
  "l3-group": [["Ошондуктан ылайыктуу", 2], ["каттам үчүн чакан топ", 4], ["алдын ала түзүлөт.", 3]],
  "l4-seats": [["Балдардын саны", 2], ["унаадагы коопсуз орундарга", 3], ["жана иш жүзүндөгү шарттарга", 4], ["жараша аныкталат.", 2]],
  "l5-trial": [["Топ даяр болгондон кийин", 4], ["биринчи толук сыноо сапары", 4], ["акысыз болот.", 2], ["Улантууну ата-эне өзү чечет.", 4]],
  "c1-city": [["BalaGo — Бишкектеги", 2], ["балдар үчүн такси.", 3]],
  "c2-contacts": [["Профилдеги шилтемеге өтүп,", 3], ["балаңызды каттаңыз", 2], ["же WhatsApp аркылуу", 3], ["0998 08 38 28", 11], ["номерине жазыңыз.", 2]],
  "c3-go": [["BalaGo менен жолго чыгалы!", 4]],
};

/** Слова синтеза — так же, как их считает scripts/lib/ts2d-tts.mjs. */
export const spokenWords = (s: string): string[] => s.split(/\s+/).filter((x) => [...x].some((ch) => /[\p{L}\p{N}]/u.test(ch)));

export type Bg23Sub = { readonly text: string; readonly from: number; readonly to: number; readonly scene: Bg23SceneId };

export const buildBg23Subs = (tl: Bg23Timeline): Bg23Sub[] => {
  const out: Bg23Sub[] = [];
  for (const c of tl.cues) {
    const chunks = BG23_SUBS[c.id];
    const line = BG23_LINES.find((l) => l.id === c.id)!;
    const n = spokenWords(line.spoken).length;
    const exact = c.words.length === n;
    const total = chunks.reduce((a, [t]) => a + t.length, 0);
    let wi = 0;
    let acc = 0;
    chunks.forEach(([text, k], i) => {
      let from: number;
      let to: number;
      if (exact) {
        from = c.words[wi].start;
        to = c.words[wi + k - 1].end;
      } else {
        from = c.from + ((c.to - c.from) * acc) / total;
        to = c.from + ((c.to - c.from) * (acc + text.length)) / total;
      }
      wi += k;
      acc += text.length;
      // держим фрагмент до начала следующего (без мигания в паузах)
      out.push({ text, from: i === 0 ? Math.min(from, c.from) - 0.05 : from - 0.05, to, scene: c.scene });
    });
  }
  for (let i = 0; i < out.length - 1; i++) {
    const gap = out[i + 1].from - out[i].to;
    out[i] = { ...out[i], to: gap < 0.9 ? out[i + 1].from : out[i].to + 0.35 };
  }
  out[out.length - 1] = { ...out[out.length - 1], to: out[out.length - 1].to + 0.6 };
  return out;
};
