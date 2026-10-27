// Реестр анимированных схем фильма: kind из сценария → компонент.
import type React from "react";
import * as andrei from "./andrei";
import * as captivity from "./captivity";
import * as epilogue from "./epilogue";
import * as generals from "./generals";
import * as intro from "./intro";
import type { VisualProps } from "./kit";
import * as natasha from "./natasha";
import * as pierre from "./pierre";
import * as society from "./society";
import * as war from "./war";

// компонент «FooBar» регистрируется как kind «fooBar»
const all = { ...intro, ...society, ...andrei, ...pierre, ...natasha, ...war, ...captivity, ...generals, ...epilogue } as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUALS: Record<string, React.FC<VisualProps<any>>> = {};
for (const [name, comp] of Object.entries(all)) {
  if (typeof comp === "function" && /^[A-Z]/.test(name)) VISUALS[name.charAt(0).toLowerCase() + name.slice(1)] = comp as React.FC<VisualProps>;
}
