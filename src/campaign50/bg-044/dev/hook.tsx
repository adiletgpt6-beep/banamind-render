import { registerRoot } from "remotion";
import { HookScene } from "../scenes/Hook";
import { makeSceneRoot } from "./harness";

registerRoot(makeSceneRoot("hook", HookScene));
