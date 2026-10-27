import { registerRoot } from "remotion";
import { DecisionScene } from "../scenes/Decision";
import { makeSceneRoot } from "./harness";

registerRoot(makeSceneRoot("decision", DecisionScene));
