// Сценарий фильма BanaMind BM-039: Платон, «Государство» (перевод А. Н. Егунова).
// Режиссёрская концепция: «Суд над справедливостью: город как мысленный эксперимент».
// Сцены по частям — в scenes/*.ts; у каждой сцены опора на исходные строки TXT (SOURCE_MAP).
import { B1 } from "./scenes/b1.ts";
import { B23 } from "./scenes/b23.ts";
import { B4 } from "./scenes/b4.ts";
import { B5 } from "./scenes/b5.ts";
import { B67 } from "./scenes/b67.ts";
import { B89 } from "./scenes/b89.ts";
import { B10 } from "./scenes/b10.ts";
import { END } from "./scenes/end.ts";
import { INTRO } from "./scenes/intro.ts";
import type { Scene } from "./types";

// голос банана — тот же, что во всех фильмах BanaMind (src/banana-host/README.md)
export const VOICE = {
  name: "Eric (ElevenLabs, multilingual v2) — один голос банана на весь фильм",
  voiceId: "cjVigY5qzO86Huf0OWal",
  modelId: "eleven_multilingual_v2",
  seed: 23,
  settings: { stability: 0.5, similarity_boost: 0.8, style: 0.22, use_speaker_boost: true, speed: 0.9 },
  expressive: { stability: 0.36, style: 0.45 },
};

// ударения в именах и редких словах — только для синтеза речи (в титрах текст без знаков)
export const STRESS: Record<string, string> = {
  Кефал: "Кефа́л",
  Кефалу: "Кефа́лу",
  Кефала: "Кефа́ла",
  Фрасимаха: "Фрасима́ха",
  Главкона: "Глав кона",
  Симонида: "Симони́да",
  Полемарх: "Полема́рх",
  Фрасимах: "Фрасима́х",
  Главкон: "Глав кон",
  Адимант: "Адима́нт",
  Симонид: "Симони́д",
  Пирей: "Пире́й",
  Аристона: "Аристо́на",
  Гига: "Ги́га",
  Гесиода: "Гесио́да",
  Гомера: "Гоме́ра",
  Гомер: "Гоме́р",
  Эр: "Эр",
  полис: "по́лис",
  тимократия: "тимокра́тия",
  софист: "софи́ст",
  Аполлон: "Аполло́н",
  Платон: "Плато́н",
  Платона: "Плато́на",
  Платону: "Плато́ну",
  Сократ: "Сокра́т",
  Сократа: "Сокра́та",
  Сократу: "Сокра́ту",
  тиран: "тира́н",
  Одиссей: "Одиссе́й",
  стражи: "стра́жи",
  стражей: "стра́жей",
  стражам: "стра́жам",
  мудрость: "му́дрость",
  договор: "догово́р",
  BanaMind: "БанаМа́йнд",
};

export const FILM = {
  id: "BM-039",
  slug: "plato-republic-egunov",
  title: "Государство — Платон: суд над справедливостью",
  book: "Платон, «Государство», перевод А. Н. Егунова",
};

export const SCENES: Scene[] = [...INTRO, ...B1, ...B23, ...B4, ...B5, ...B67, ...B89, ...B10, ...END];
