import { registerRoot } from "remotion";
import { GroupScene } from "../scenes/Group";
import { makeSceneRoot } from "./harness";

registerRoot(makeSceneRoot("group", GroupScene));
