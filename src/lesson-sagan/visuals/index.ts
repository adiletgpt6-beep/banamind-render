// Реестр анимированных схем фильма: kind из сценария → компонент.
import type React from "react";
import * as earth from "./earth";
import * as intro from "./intro";
import * as journey from "./journey";
import type { VisualProps } from "./kit";
import * as measure from "./measure";
import * as models from "./models";
import * as planets from "./planets";
import * as stars from "./stars";

// компонент «FooBar» регистрируется как kind «fooBar»
const all = { ...intro, ...measure, ...models, ...planets, ...journey, ...stars, ...earth } as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {};
for (const [name, comp] of Object.entries(all)) {
  if (typeof comp === "function" && /^[A-Z]/.test(name)) VISUALS[name.charAt(0).toLowerCase() + name.slice(1)] = comp as React.FC<VisualProps>;
}
