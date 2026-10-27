// Сцена 1 (0–6 с), хук. Стол мамы глазами мамы: ноутбук экраном к нам,
// за ним — окно офиса с видом на Бишкек. Камера входит в экран; восемь
// рабочих окон открываются по очереди, строго после восьмого выпрыгивает
// жёлтое девятое: «Баланы ким алып кетет?» — на слове «Тогузунчусу».
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { TabCascade } from "../screens";
import { Mug, OFFICE, OfficeBack } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import { bg1Beats } from "../beats";

const PUSH_END = 26; // камера «вошла» в экран

// Ноутбук спереди: экран (landscape) — верх того же рабочего стола.
const LaptopFront: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={box({ left: 140, top: 760, width: 800, height: 600 })}>
    <div style={box({ left: 0, top: 0, width: 800, height: 520, borderRadius: 30, backgroundColor: "#2A2F3A" })} />
    <div style={box({ left: 22, top: 22, width: 756, height: 476, borderRadius: 12, overflow: "hidden", backgroundColor: "#FFFFFF" })}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.7)", transformOrigin: "0 0" })}>{children}</div>
    </div>
    <div style={box({ left: -50, top: 520, width: 900, height: 44, borderRadius: "0 0 34px 34px", backgroundColor: "#C3C9D3" })} />
  </div>
);

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { opens, ninthAt } = bg1Beats(cues);
  const screen = <TabCascade f={f} opens={opens} ninthAt={ninthAt} />;
  const inside = clamp((f - PUSH_END) / 8);
  return (
    <>
      <Shot
        f={f}
        from={0}
        to={PUSH_END}
        cam={camMove(f, 0, PUSH_END, { x: 540, y: 1040, zoom: 1 }, { x: 540, y: 1020, zoom: 2.5 })}
      >
        <OfficeBack minutes={16 * 60 + 38} />
        <div style={box({ left: -600, top: 1300, width: 2400, height: 800, backgroundColor: "#FFFFFF" })} />
        <LaptopFront>{screen}</LaptopFront>
        <Mug x={OFFICE.mug.x + 110} y={1350} />
      </Shot>
      <Shot f={f} from={PUSH_END} to={200} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<div style={box({ inset: 0, backgroundColor: "#FFFFFF", opacity: 0.7 * (1 - inside) })} />}>
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${lerp(1.08, 1, easeInOut(inside))})`, transformOrigin: "50% 40%" })}>{screen}</div>
      </Shot>
    </>
  );
};
