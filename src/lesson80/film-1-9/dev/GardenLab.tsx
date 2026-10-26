// Служебная композиция Lesson80-1-9-GardenLab: вставка «Сад» — кадры 0–89
// общий план яблони ("tree"), 90–299 садовник срывает яблоко ("worker").
import { useCurrentFrame } from "remotion";
import { GardenShot } from "../garden";

export const GardenLab: React.FC = () => {
  const frame = useCurrentFrame();
  return frame < 90 ? <GardenShot f={frame} variant="tree" /> : <GardenShot f={frame - 90} variant="worker" />;
};
