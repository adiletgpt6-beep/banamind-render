// BM-017 «И тогда никого не осталось» — сцены фильма BanaMind.
// Полный текст озвучки — books/and-then-there-were-none-christie/SCRIPT_DRAFT.md.
// Сейчас здесь только ПИЛОТ (≈ 45–55 с, блок 3: ужин → голос → «обвинение ≠ доказательство»,
// проверенные главы 2–3, part-01). Полный фильм переносится сюда после утверждения брифа
// и решения владельца по правам (SOURCE_RIGHTS_AUDIT.md).
// Голос — тот же банан BanaMind (VOICE из src/lesson-traktat/script.ts).
import type { MoodName, PoseName } from "../../../banana-host";
import type { Line, Scene } from "../../../lesson-traktat/types";

export { VOICE } from "../../../lesson-traktat/script.ts";

export const FILM = {
  slug: "and-then-there-were-none-christie",
  title: "И тогда никого не осталось — разбор BanaMind",
  book: "Агата Кристи, «И тогда никого не осталось» (пер. В. Селиной)",
};

export const VOICE_DIR = "public/books/and-then-there-were-none-christie/voice";

const L = (id: string, text: string, pose?: PoseName, mood?: MoodName, extra: Partial<Line> = {}): Line => ({ id, text, pose, mood, ...extra });

export const PILOT_SCENES: Scene[] = [
  {
    id: "p1",
    title: "Ужин и десять фигурок",
    part: "intro",
    host: "right",
    visual: { kind: "dinner" },
    src: ["part-01:571-637", "part-01:771-795"],
    srcNote: "Дом, отсутствующий хозяин, фигурки на столе, считалка в рамке (текст не цитируется).",
    lines: [
      L("p1a", "Вечер. Дом прекрасен: современный, светлый, вкусный ужин. Хозяин, как сообщают, задерживается.", "present", "calm"),
      L("p1b", "На столе — десять фарфоровых фигурок. А в каждой комнате висит в рамке старая детская считалка: про десять фигурок, которые исчезают одна за другой.", "point", "wonder"),
    ],
  },
  {
    id: "p2",
    title: "Голос с пластинки",
    part: "intro",
    host: "peek",
    visual: { kind: "voice" },
    src: ["part-01:849-939"],
    srcNote: "Граммофонная запись обвиняет всех десятерых; имена жертв на экран не выводятся.",
    lines: [
      L("p2a", "И вдруг в тишине звучит голос. Это граммофонная пластинка. Голос по очереди называет каждого из десяти — и обвиняет в чужой смерти.", "shock", "shock"),
    ],
  },
  {
    id: "p3",
    title: "Обвинение ≠ доказательство",
    part: "intro",
    host: "left",
    visual: { kind: "scales" },
    src: ["анализ BanaMind"],
    srcNote: "Вывод №1 фильма: уверенный голос — не доказательство.",
    lines: [
      L("p3a", "А теперь остановимся. Что именно произошло?", "think", "think"),
      L("p3b", "Прозвучало обвинение. Не суд. Не доказательство. Не приговор.", "count", "serious"),
      L("p3c", "Громкость и уверенность голоса легко принять за доказательство. Но знать детали и иметь право судить — это совсем разные вещи.", "open", "serious"),
    ],
  },
];

export const SCENES = PILOT_SCENES;
