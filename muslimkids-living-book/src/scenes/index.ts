import { createCameraController } from "../engines/BookCameraController";
import { SCENE01_CAMERA } from "./Scene01Opening";
import { SCENE02_CAMERA } from "./Scene02Earth";
import { SCENE03_CAMERA } from "./Scene03Mountains";
import { SCENE04_CAMERA } from "./Scene04Tree";
import { SCENE05_CAMERA } from "./Scene05Universe";
import { SCENE06_CAMERA } from "./Scene06QuranMessage";
import { SCENE07_CAMERA } from "./Scene07Ending";

// Сцены собираются в один непрерывный проход камеры по книге.
export const cameraAt = createCameraController([
  ...SCENE01_CAMERA,
  ...SCENE02_CAMERA,
  ...SCENE03_CAMERA,
  ...SCENE04_CAMERA,
  ...SCENE05_CAMERA,
  ...SCENE06_CAMERA,
  ...SCENE07_CAMERA,
]);
