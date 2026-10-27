// Сцена 5 — «Шарттуу мисал» (всё время): ЕСЛИ группа сформирована — первая
// полная пробная поездка ҮЙ → МЕКТЕП → ҮЙ бесплатно; после пробы родитель
// сам выбирает «Улантуу» / «Ойлонуу»; оплата — только после решения.
// Картонный пульт стоит в стороне и не работает как сервис.
import { AbsoluteFill } from "remotion";
import { useScene, useTimeline } from "../context";
import { ExampleStory } from "../inserts/ExampleStory";
import { wordAt } from "./common";

type Span = { readonly from: number; readonly to: number };

// Ключевые моменты (секунды от начала сцены) — общие для анимации и звука.
export const exampleBeats = (n03: Span, n04: Span, freeAbs: number | null, decideAbs: number | null, start: number) => ({
  freeWord: freeAbs !== null ? freeAbs - start : n03.to - 0.8,
  decideWord: decideAbs !== null ? decideAbs - start : n04.from + 3.6,
});

export const ExampleScene: React.FC = () => {
  const { t, cue, start, dur } = useScene();
  const tl = useTimeline();
  const n03 = cue("n03");
  const n04 = cue("n04");
  const c3 = tl.cues.find((c) => c.id === "n03");
  const c4 = tl.cues.find((c) => c.id === "n04");
  const b = exampleBeats(n03, n04, c3 ? wordAt(c3, "акысыз", NaN) : null, c4 ? wordAt(c4, "чечим", NaN) : null, start);
  const freeWord = Number.isFinite(b.freeWord) ? b.freeWord : n03.to - 0.8;
  const decideWord = Number.isFinite(b.decideWord) ? b.decideWord : n04.from + 3.6;
  return (
    <AbsoluteFill>
      <ExampleStory t={t} times={{ dur, n03, n04, freeWord, decideWord }} />
    </AbsoluteFill>
  );
};
