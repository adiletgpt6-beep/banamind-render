// Сцена 6 (≈ 45–56 с): четвёртая плитка раскрывается на весь кадр.
// Мама листает ответы, дочь показывает рисунок «Апам экөөбүз», мама
// смотрит на неё, потом на недельный календарь со школьными временами и
// решает сама найти способ организовать маршрут заранее. В конце камера
// наезжает на её телефон — переход к сайту BalaGo.
import { useCurrentFrame } from "remotion";
import { InScene, useScene, useTimeline } from "../context";
import { clamp, easeInOut } from "../rig/motion";
import { fitCam, FULL, lerpRect, View, type Cam } from "../shots";
import { ExampleChip } from "../ui";
import { homeCam, homeKeys, HomeWorld, HOME_TILE } from "../worlds/Home";
import { MosaicStill, SLOTS } from "./Mosaic";

const T = 22;

export const HomeScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { frames } = useScene();
  const k = homeKeys(tl);
  const p = easeInOut(f / T);
  const target = homeCam(f, k, frames);
  const cam: Cam = { x: HOME_TILE.x + (target.x - HOME_TILE.x) * p, y: HOME_TILE.y + (target.y - HOME_TILE.y) * p, s: HOME_TILE.s + (target.s - HOME_TILE.s) * p };
  const rect = lerpRect(SLOTS[3], FULL, p);
  return (
    <>
      {p < 1 ? <MosaicStill fade={1 - clamp(f / 16)} f={f} /> : null}
      <View rect={rect} cam={fitCam(cam, rect)} bg="#2A2F55" shadow={p < 1}>
        <InScene id="home">
          <HomeWorld f={f} />
        </InScene>
      </View>
      <ExampleChip />
    </>
  );
};
