// Дверь дня недели. Все размеры пропорциональны ширине w (высота 16:9 к
// ширине — как кадр), поэтому маленькая дверь из хука при увеличении в 6 раз
// точно совпадает с полноэкранной дверью перехода между днями.
import { NAVY, SchoolIcon, YELLOW } from "../art";

export const DOOR_RATIO = 16 / 9;

export const Door: React.FC<{
  readonly w: number;
  readonly color: string;
  readonly name: string;
  readonly glow?: number; // свечение школьной метки 0…1
  readonly shade?: number; // затемнение при повороте 0…1
}> = ({ w, color, name, glow = 0, shade = 0 }) => {
  const h = w * DOOR_RATIO;
  const u = w / 100; // единица
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 4 * u, backgroundColor: color, overflow: "hidden", boxShadow: `inset 0 0 0 ${2.2 * u}px rgba(255,255,255,0.55)` }}>
      {/* филёнки */}
      <div style={{ position: "absolute", left: 12 * u, top: 26 * u, width: 76 * u, height: 54 * u, borderRadius: 3 * u, border: `${1.6 * u}px solid rgba(255,255,255,0.32)` }} />
      <div style={{ position: "absolute", left: 12 * u, top: 92 * u, width: 76 * u, height: 70 * u, borderRadius: 3 * u, border: `${1.6 * u}px solid rgba(255,255,255,0.32)` }} />
      {/* табличка с днём */}
      <div
        style={{
          position: "absolute",
          left: 10 * u,
          right: 10 * u,
          top: 8 * u,
          height: 13 * u,
          borderRadius: 6.5 * u,
          backgroundColor: "#FFFFFF",
          color: NAVY,
          fontSize: 8.6 * u,
          fontWeight: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
      {/* школьная метка: та же в каждом дне */}
      <div
        style={{
          position: "absolute",
          left: 50 * u - 19 * u,
          top: 36 * u,
          width: 38 * u,
          height: 38 * u,
          borderRadius: 19 * u,
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: glow ? `0 0 0 ${4 * u * glow}px rgba(255,201,40,${0.9 * glow})` : undefined,
        }}
      >
        <SchoolIcon size={26 * u} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 77 * u, textAlign: "center", fontSize: 9 * u, fontWeight: 1000, color: "#FFFFFF" }}>07:40</div>
      {/* ручка */}
      <div style={{ position: "absolute", left: 82 * u, top: 100 * u, width: 7 * u, height: 7 * u, borderRadius: 3.5 * u, backgroundColor: YELLOW, boxShadow: `0 ${0.6 * u}px 0 rgba(0,0,0,0.25)` }} />
      {shade > 0 ? <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(10,20,40,${0.45 * shade})` }} /> : null}
    </div>
  );
};

// Полноэкранная дверь дня: въезжает справа (slideIn 0…1) и распахивается
// (open 0…1) поворотом вокруг левого края.
export const DoorWipe: React.FC<{ readonly color: string; readonly name: string; readonly slideIn: number; readonly open: number }> = ({ color, name, slideIn, open }) => {
  if (open >= 1 || slideIn <= 0) return null;
  const angle = -open * 100;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2400, perspectiveOrigin: "0px 960px", pointerEvents: "none" }}>
      {/* тень проёма */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(10,20,40,${0.18 * (1 - open) * Math.min(1, open * 6)})` }} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${(1 - slideIn) * 1100}px) rotateY(${angle}deg)`, transformOrigin: "0px 960px" }}>
        <Door w={1080} color={color} name={name} shade={open} />
      </div>
    </div>
  );
};
