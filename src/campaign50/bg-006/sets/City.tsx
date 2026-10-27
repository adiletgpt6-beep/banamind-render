// Бишкек за окном переговорной: горы Ала-Тоо, панельные дома с балконами,
// тополя с побелёнными стволами; часы на стене. (Взято из 2D-роликов
// проекта и изолировано в папке BG-006, чтобы чужие правки не меняли ролик.)
import { box } from "../shots";

export const WallClock: React.FC<{ x: number; y: number; r: number; minutes: number }> = ({ x, y, r, minutes }) => {
  const h = ((minutes / 60) % 12) * 30;
  const m = (minutes % 60) * 6;
  return (
    <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={box({ left: x - r, top: y - r })}>
      <circle r={96} fill="#FFFFFF" stroke="#2E2A40" strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-80} x2={0} y2={i % 3 === 0 ? -64 : -71} stroke="#2E2A40" strokeWidth={i % 3 === 0 ? 7 : 4} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={8} x2={0} y2={-44} stroke="#2E2A40" strokeWidth={9} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={10} x2={0} y2={-68} stroke="#2E2A40" strokeWidth={6} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={7} fill="#E3A21A" />
    </svg>
  );
};

// Горы Ала-Тоо на дальнем плане (утро — светлые, вечер — тёмные).
export const Mountains: React.FC<{ x: number; y: number; w: number; h: number; evening?: number }> = ({ x, y, w, h, evening = 0 }) => {
  const far = evening > 0.5 ? "#3B4468" : "#B9C9DE";
  const near = evening > 0.5 ? "#2C3456" : "#9DB2CC";
  return (
    <svg width={w} height={h} viewBox="0 0 1000 300" preserveAspectRatio="none" style={box({ left: x, top: y })}>
      <path d="M 0 300 L 0 170 L 90 110 L 160 150 L 260 60 L 330 120 L 420 40 L 520 130 L 600 80 L 700 140 L 800 50 L 900 120 L 1000 90 L 1000 300 Z" fill={far} />
      {evening <= 0.5 ? (
        <path d="M 245 74 L 260 60 L 280 80 L 268 78 L 258 88 Z M 405 54 L 420 40 L 445 66 L 430 62 L 418 72 Z M 785 64 L 800 50 L 822 72 L 808 70 L 798 80 Z" fill="#FFFFFF" opacity={0.9} />
      ) : null}
      <path d="M 0 300 L 0 220 L 120 170 L 240 210 L 380 150 L 520 200 L 660 160 L 800 205 L 1000 170 L 1000 300 Z" fill={near} />
    </svg>
  );
};

// Панельный дом: этажи, окна, балконы (часть застеклена), кондиционеры.
export const PanelHouse: React.FC<{ x: number; y: number; w: number; floors: number; color: string; seed?: number; door?: number }> = ({ x, y, w, floors, color, seed = 1, door }) => {
  const fh = 150;
  const h = floors * fh + 40;
  const cols = Math.floor(w / 150);
  const cw = w / cols;
  const r = (i: number) => {
    const s = Math.sin(i * 91.7 + seed * 13.1) * 43758.5;
    return s - Math.floor(s);
  };
  return (
    <div style={box({ left: x, top: y - h, width: w, height: h })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: color })} />
      <div style={box({ left: 0, top: 0, width: w, height: h, backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 3px, transparent 3px ${fh}px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 3px, transparent 3px ${cw}px)` })} />
      <div style={box({ left: -10, top: -20, width: w + 20, height: 24, backgroundColor: "#8E8A86" })} />
      {Array.from({ length: floors }).map((_, fl) =>
        Array.from({ length: cols }).map((__, c) => {
          const i = fl * cols + c;
          const bx = c * cw + cw * 0.18;
          const by = 30 + fl * fh;
          const balcony = (c + fl + seed) % 3 === 0;
          const glazed = r(i) > 0.45;
          const lit = r(i + 7) > 0.8;
          if (fl === floors - 1 && door !== undefined && Math.abs(c * cw + cw / 2 - door) < cw / 2) return null;
          return (
            <div key={i}>
              <div style={box({ left: bx, top: by + 18, width: cw * 0.64, height: 78, borderRadius: 4, backgroundColor: lit ? "#F8E7B8" : "#9FB6CE", border: "5px solid #F4F1EC", boxSizing: "border-box" })} />
              {balcony ? (
                <div style={box({ left: bx - 10, top: by + 62, width: cw * 0.64 + 20, height: 64, borderRadius: 3, backgroundColor: glazed ? "rgba(214,232,243,0.92)" : "#D8CFC4", border: `4px solid ${glazed ? "#EEF3F6" : "#B9AEA2"}`, boxSizing: "border-box" })} />
              ) : null}
              {r(i + 3) > 0.84 ? <div style={box({ left: bx + cw * 0.66, top: by + 34, width: 34, height: 26, backgroundColor: "#ECEDEF", borderRadius: 3 })} /> : null}
            </div>
          );
        }),
      )}
      {door !== undefined ? (
        <>
          <div style={box({ left: door - 70, top: h - 190, width: 140, height: 190, backgroundColor: "#5A4A40" })} />
          <div style={box({ left: door - 100, top: h - 214, width: 200, height: 26, backgroundColor: "#9A9590", borderRadius: 4 })} />
          <div style={box({ left: door - 40, top: h - 250, width: 80, height: 26, borderRadius: 6, backgroundColor: "#3A6EA5", color: "#FFFFFF", fontSize: 18, fontWeight: 900, textAlign: "center", lineHeight: "26px" })}>2</div>
        </>
      ) : null}
    </div>
  );
};

// Дерево: тополь (узкий) или карагач (круглый), побелённый ствол.
export const Tree: React.FC<{ x: number; y: number; s?: number; kind?: "poplar" | "round"; tone?: number }> = ({ x, y, s = 1, kind = "round", tone = 0 }) => {
  const g1 = tone ? "#6E9E5C" : "#7FAF63";
  const g2 = tone ? "#5D8C4E" : "#6B9C55";
  return (
    <svg width={320 * s} height={620 * s} viewBox="-160 -600 320 620" style={box({ left: x - 160 * s, top: y - 600 * s, overflow: "visible" })}>
      <ellipse cx={8} cy={8} rx={70} ry={14} fill="rgba(30,40,30,0.15)" />
      <rect x={-13} y={-260} width={26} height={265} rx={10} fill="#7A5B45" />
      <rect x={-14} y={-90} width={28} height={95} rx={6} fill="#F4F2EC" />
      {kind === "poplar" ? (
        <>
          <ellipse cx={0} cy={-390} rx={72} ry={220} fill={g2} />
          <ellipse cx={-14} cy={-410} rx={52} ry={190} fill={g1} />
        </>
      ) : (
        <>
          <circle cx={-60} cy={-300} r={95} fill={g2} />
          <circle cx={60} cy={-310} r={100} fill={g2} />
          <circle cx={0} cy={-390} r={115} fill={g1} />
          <circle cx={-30} cy={-420} r={60} fill="#8DBA70" opacity={0.6} />
        </>
      )}
    </svg>
  );
};
