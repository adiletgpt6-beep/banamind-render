import { registerRoot } from "remotion";
import { CardsScene } from "../scenes/Cards";
import { makeSceneRoot } from "./harness";

registerRoot(makeSceneRoot("cards", CardsScene));
