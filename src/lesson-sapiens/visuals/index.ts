// Реестр анимированных схем фильма: kind из сценария → компонент.
import type React from "react";
import * as agrarian from "./agrarian";
import * as cognitive from "./cognitive";
import * as end from "./end";
import * as future from "./future";
import * as intro from "./intro";
import type { VisualProps } from "./kit";
import * as order from "./order";
import * as science from "./science";
import * as unity from "./unity";

// компонент «FooBar» регистрируется как kind «fooBar»
const all = { ...intro, ...cognitive, ...agrarian, ...order, ...unity, ...science, ...future, ...end } as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {};
for (const [name, comp] of Object.entries(all)) {
  if (typeof comp === "function" && /^[A-Z]/.test(name)) VISUALS[name.charAt(0).toLowerCase() + name.slice(1)] = comp as React.FC<VisualProps>;
}
