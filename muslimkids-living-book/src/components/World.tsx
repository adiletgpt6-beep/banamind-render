import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { applyPose } from "../engines/BookCameraController";
import { computeBookState } from "../engines/LivingBookEngine";
import { cameraAt } from "../scenes";
import { Book3D } from "./Book3D";
import { PopUpEarth } from "./PopUpEarth";
import { PopUpMountains } from "./PopUpMountains";
import { PopUpTree } from "./PopUpTree";
import { PopUpUniverse } from "./PopUpUniverse";
import { PageDecoration } from "./PageDecoration";
import { Room } from "./Room";

const CameraRig = ({ t }: { t: number }) => {
  const { camera, size } = useThree();
  applyPose(camera as THREE.PerspectiveCamera, cameraAt(t), size.width / size.height);
  return null;
};

/** Вся 3D-сцена в момент t: комната, книга и pop-up миры на ней. */
export const World = ({ t }: { t: number }) => {
  const book = computeBookState(t);
  return (
    <>
      <CameraRig t={t} />
      <Room t={t} />
      <Book3D state={book}>
        <PopUpEarth t={t} book={book} />
        <PopUpMountains t={t} book={book} />
        <PopUpTree t={t} book={book} />
        <PopUpUniverse t={t} book={book} />
        <PageDecoration t={t} book={book} />
      </Book3D>
    </>
  );
};
