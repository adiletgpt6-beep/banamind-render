// Состояние плаката в кадре (заголовок, текстовые карточки и детские
// карточки, лежащие на листе или закреплённые) — из плана реквизита.
// Общий источник для вида комнаты, вида сверху и доски. Без React.
import type { PosterCard, PosterView } from "./poster.tsx";
import { deskToPoster } from "./layout.ts";
import type { Plan } from "./plan.ts";

export const posterViewAt = (pl: Plan, t: number): PosterView => {
  const cards: PosterCard[] = [];
  for (const c of pl.cards(t)) {
    if (c.where !== "poster" || !c.desk) continue;
    cards.push({ id: c.id, kind: c.kind, pos: deskToPoster(c.desk), rot: c.rot, tape: c.tape, progress: c.progress, boat: c.boat, caption: c.caption });
  }
  const text = (w: "one" | "two") => {
    const s = pl.textState(w, t);
    return s.where === "poster" ? { pos: deskToPoster(s.desk), rot: 0, tape: s.tape } : null;
  };
  return { title: pl.titleProgress(t), one: text("one"), two: text("two"), cards };
};
