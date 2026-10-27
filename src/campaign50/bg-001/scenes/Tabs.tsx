// Сцена 2 (6–14,5 с): вкладки переключаются по словам диктора — «Жыйын,
// отчет, кардарлар… Анан дагы мектепке жеткирүү…». Каждый щелчок реально
// меняет содержимое экрана. Затем мама: быстро печатает, откидывается,
// трёт висок и смотрит на часы на стене.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { type PoseIn } from "../rig/Actor";
import { anticipate, keys, keysV } from "../rig/motion";
import { TabsScreen } from "../screens";
import { bg1Beats } from "../beats";
import { box, camMove, Shot } from "../shots";
import { keyAt, restOnDesk, seatOf } from "./common";
import { MOM, OfficeWorld } from "./OfficeWorld";

export const TabsScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { pages, tabsCut: cut } = bg1Beats(cues);
  const stop = cut + 34; // перестаёт печатать, выдыхает и смотрит на часы
  const pose = (t: number): PoseIn => {
    const typing = t < stop;
    return {
      expr: t < stop ? "thinking" : "tired",
      sit: 1,
      seat: seatOf(MOM),
      lean: keys(t, [[cut, 8], [stop, 8], [stop + 18, 0]]),
      exhale: keys(t, [[stop, 0], [stop + 14, 0.9], [stop + 40, 0.3]]),
      lookY: keys(t, [[cut, 0.35], [stop, 0.35], [stop + 16, -0.35]]),
      headTilt: keys(t, [[stop + 10, 0], [stop + 24, -4]]),
      armL: {
        target: typing ? keyAt(0, t, true) : keysV(t, [[stop, keyAt(0, stop, false)], [stop + 16, restOnDesk(MOM, -1).target!]], anticipate),
        shape: "relax",
        elbow: "down",
        behind: false,
      },
      armR: { target: keyAt(3, t, typing), shape: "relax", elbow: "down", behind: false },
    };
  };
  // взгляд: в экран → на часы на стене (вправо-вверх)
  const face = (t: number) => keys(t, [[cut, 0.5], [stop + 6, 0.5], [stop + 20, 0.8]]);
  return (
    <>
      <Shot f={f} from={0} to={cut} cam={{ x: 540, y: 960, zoom: 1 }}>
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
          <TabsScreen f={f} pages={pages} />
        </div>
      </Shot>
      <Shot f={f} from={cut} to={300} cam={camMove(f, cut, cut + 120, { x: 520, y: 1060, zoom: 1.75 }, { x: 540, y: 1040, zoom: 1.6 })}>
        <OfficeWorld f={f} uid="t2-mom" minutes={16 * 60 + 39 + f / 300} face={face} pose={pose} speaking={false} />
      </Shot>
    </>
  );
};
