// Детский стол у окна в офисе (тот же стол во всех планах — не путать со
// столом папы): большое окно с синими рамами, город за стеклом, маленький
// стол со светлой столешницей, стул Бектура, рюкзак у ножки стула.
import { box } from "../kit";
import { C } from "../theme";

export const KID = {
  window: { x: 140, y: 330, w: 800, h: 700 },
  deskTop: 1250,
  desk: { x0: 300, x1: 900 },
  boy: { x: 610, y: 1530 },
  pack: { x: 420, y: 1540 },
} as const;

export const WindowWall: React.FC = () => {
  const w = KID.window;
  return (
    <div style={box({ left: -300, top: -300 })}>
      <div style={box({ left: 0, top: 0, width: 1700, height: 1830, backgroundColor: C.wall })} />
      <div style={box({ left: w.x + 300, top: w.y + 300, width: w.w, height: w.h, backgroundColor: "#CFE3F2", overflow: "hidden" })}>
        {/* город за окном: простые плоские дома и горы */}
        <div style={box({ left: -40, top: 360, width: 900, height: 200, backgroundColor: "#AFC6DB", clipPath: "polygon(0 100%, 18% 20%, 34% 70%, 52% 0, 70% 60%, 86% 25%, 100% 100%)" })} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={box({ left: 30 + i * 200, top: 460 - (i % 2) * 90, width: 150, height: 400, backgroundColor: ["#E9DCC7", "#F3E9D7", "#E2D2BA", "#EFE3CF"][i] })} />
        ))}
      </div>
      <div style={box({ left: w.x + 300, top: w.y + 300, width: w.w, height: w.h, border: `22px solid ${C.blue}`, boxSizing: "border-box" })} />
      <div style={box({ left: w.x + 300 + w.w / 2 - 11, top: w.y + 300, width: 22, height: w.h, backgroundColor: C.blue })} />
      <div style={box({ left: w.x + 260, top: w.y + 300 + w.h - 6, width: w.w + 80, height: 30, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: 0, top: 1830, width: 1700, height: 900, backgroundColor: C.floor })} />
    </div>
  );
};

// Стул Бектура: спинка за ним.
export const KidChairBack: React.FC = () => <div style={box({ left: KID.boy.x - 100, top: 1090, width: 200, height: 260, backgroundColor: C.orange, borderRadius: "30px 30px 8px 8px" })} />;

// Стол: столешница и передняя панель (перекрывает ноги).
export const KidDeskFront: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: KID.desk.x0, top: KID.deskTop, width: KID.desk.x1 - KID.desk.x0, height: 34, backgroundColor: "#FFFDF6", borderTop: "4px solid #DCD5C6" })} />
    <div style={box({ left: KID.desk.x0 + 30, top: KID.deskTop + 34, width: 16, height: 300, backgroundColor: C.ink })} />
    <div style={box({ left: KID.desk.x1 - 46, top: KID.deskTop + 34, width: 16, height: 300, backgroundColor: C.ink })} />
    <div style={box({ left: KID.desk.x0 + 46, top: KID.deskTop + 34, width: KID.desk.x1 - KID.desk.x0 - 92, height: 180, backgroundColor: C.yellow })} />
  </div>
);

// Рюкзак у стула; из кармана выглядывает уголок фотографии (белая рамка).
export const PackOnFloor: React.FC<{ readonly photoPeek?: number }> = ({ photoPeek = 1 }) => (
  <div style={box({ left: KID.pack.x - 160, top: KID.pack.y - 230 })}>
    <div style={box({ left: 34, top: 40 - 40 * photoPeek, width: 70, height: 60, backgroundColor: "#FFFFFF", border: "3px solid #D9D3C6", transform: "rotate(-8deg)" })} />
    <div style={box({ left: 0, top: 30, width: 200, height: 230, backgroundColor: "#3550D8", borderRadius: "60px 60px 24px 24px" })} />
    <div style={box({ left: 30, top: 130, width: 140, height: 90, backgroundColor: "#2A40B8", borderRadius: 20 })} />
  </div>
);
