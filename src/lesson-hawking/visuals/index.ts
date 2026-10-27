// Реестр анимированных схем фильма: kind из сценария → компонент.
import type React from "react";
import * as arrows from "./arrows";
import * as end from "./end";
import * as expand from "./expand";
import * as holes from "./holes";
import * as intro from "./intro";
import type { VisualProps } from "./kit";
import * as light from "./light";
import * as models from "./models";
import * as quantum from "./quantum";
import * as unity from "./unity";

// компонент «FooBar» регистрируется как kind «fooBar»
const all = { ...intro, ...models, ...light, ...expand, ...quantum, ...holes, ...arrows, ...unity, ...end } as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {};
for (const [name, comp] of Object.entries(all)) {
  if (typeof comp === "function" && /^[A-Z]/.test(name)) VISUALS[name.charAt(0).toLowerCase() + name.slice(1)] = comp as React.FC<VisualProps>;
}
