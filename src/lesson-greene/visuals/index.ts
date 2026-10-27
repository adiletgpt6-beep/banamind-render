// Реестр анимированных схем фильма: kind из сценария → компонент.
// Схемы разложены по частям фильма (intro.tsx — вступление и итоги).
import type React from "react";
import type { VisualProps } from "./kit";
import { INTRO_VISUALS } from "./intro";
import { POWER_VISUALS } from "./power";
import { WORDS_VISUALS } from "./words";
import { PEOPLE_VISUALS } from "./people";
import { STRATEGY_VISUALS } from "./strategy";
import { FLEX_VISUALS } from "./flex";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = { ...INTRO_VISUALS, ...POWER_VISUALS, ...WORDS_VISUALS, ...PEOPLE_VISUALS, ...STRATEGY_VISUALS, ...FLEX_VISUALS };
