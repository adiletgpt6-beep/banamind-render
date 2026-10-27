import { registerRoot } from "remotion";
import { CtaScene } from "../scenes/Cta";
import { makeSceneRoot } from "./harness";

registerRoot(makeSceneRoot("cta", CtaScene));
