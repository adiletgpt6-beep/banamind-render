import { registerRoot } from "remotion";
import { TrialScene } from "../scenes/Trial";
import { makeSceneRoot } from "./harness";

registerRoot(makeSceneRoot("trial", TrialScene));
