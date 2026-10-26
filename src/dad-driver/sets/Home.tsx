// Квартира семьи (Бишкек): общая комната. Слева — окно во двор (тополя,
// панельные дома, вдали — снежные вершины Ала-Тоо), посередине — стол со
// скатертью и стулья, справа — полка с небольшим макетом папы и дверь в
// коридор. Свет — из окна слева сверху: тени ложатся вправо-вниз.
// Мир — px; одинаковые координаты во всех домашних сценах (предметы не
// «прыгают» между планами).
import { box } from "../shots";
import { C } from "../kit";
import { Conveyor } from "../props/Conveyor";

export const HOME = {
  ceilingY: 80,
  floorY: 1500, // низ стены
  seatY: 1560, // ступни сидящих за столом
  window: { x: 150, y: 430, w: 500, h: 640 },
  shelf: { x: 1150, y: 560, w: 300, h: 900 },
  // макет стоит на средней полке (центр основания)
  modelOnShelf: { x: 1196, y: 942 },
  door: { x: 1520, y: 520, w: 270, h: 980 },
  table: { left: 250, right: 1250, top: 1230, front: 1262, clothBottom: 1500 },
  // места за столом (x центра сидящего)
  seat: { mom: 450, son: 720, dad: 990 },
  lampX: 720,
} as const;

// Высота сиденья (px от пола) для роста h. Стол ≈ 75 см (≈ 340 px при
// росте папы 790 px = 175 см), стул ≈ 45 см; ребёнку — подушка, чтобы над
// столешницей были видны плечи и руки, как в жизни.
export const seatH = (h: number) => (h < 600 ? 0.56 : 0.32) * h;

// Вечер: 0 — день, 1 — тёплый вечерний свет.
type Light = { readonly evening?: number };

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

// Горы Ала-Тоо: снежные вершины на дальнем плане.
export const Mountains: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly evening?: number }> = ({ x, y, w, h, evening = 0 }) => (
  <svg width={w} height={h} viewBox="0 0 600 200" preserveAspectRatio="none" style={box({ left: x, top: y })}>
    <path d="M 0 200 L 0 120 L 70 70 L 120 100 L 190 30 L 250 90 L 320 40 L 390 110 L 450 60 L 530 105 L 600 80 L 600 200 Z" fill={mix("#AEBFD6", "#4A4F78", evening)} />
    <path d="M 160 58 L 190 30 L 222 62 L 205 58 L 190 70 L 176 56 Z M 292 62 L 320 40 L 350 70 L 334 66 L 320 76 L 306 64 Z M 430 76 L 450 60 L 470 80 L 458 78 L 449 86 Z" fill={mix("#F8FBFF", "#C9C3DA", evening)} />
    <path d="M 0 200 L 0 150 L 90 120 L 170 145 L 260 118 L 360 150 L 460 125 L 600 150 L 600 200 Z" fill={mix("#9FB3C8", "#3D4268", evening)} opacity={0.85} />
  </svg>
);

// Пятиэтажка за окном (панели, окна, балконы).
const PanelHouse: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly color: string; readonly evening: number; readonly seed: number }> = ({ x, y, w, h, color, evening, seed }) => (
  <div style={box({ left: x, top: y, width: w, height: h, backgroundColor: color })}>
    {Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        const lit = evening > 0.5 && (r * 7 + c * 3 + seed) % 3 === 0;
        return (
          <div
            key={`${r}-${c}`}
            style={box({
              left: 18 + c * ((w - 30) / 4),
              top: 22 + r * 74,
              width: (w - 30) / 4 - 22,
              height: 40,
              borderRadius: 3,
              backgroundColor: lit ? "#F6D48A" : mix("#8FA8C2", "#2C3256", evening),
            })}
          />
        );
      }),
    )}
  </div>
);

const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly evening: number }> = ({ x, y, s, evening }) => (
  <svg width={120 * s} height={360 * s} viewBox="0 0 120 360" style={box({ left: x - 60 * s, top: y - 360 * s })}>
    <rect x={55} y={250} width={10} height={110} fill={mix("#7A5A44", "#3B2E3A", evening)} />
    <ellipse cx={60} cy={150} rx={42} ry={140} fill={mix("#6FA35E", "#2F4B4A", evening)} />
    <ellipse cx={48} cy={130} rx={18} ry={100} fill={mix("#88B873", "#3A5856", evening)} opacity={0.7} />
  </svg>
);

// Задний план комнаты: стена, окно, полка с макетом, дверь, лампа, пол.
export const HomeRoom: React.FC<
  { readonly t?: number; readonly modelOnShelf?: boolean; readonly doorOpen?: number } & Light
> = ({ t = 0, modelOnShelf = true, doorOpen = 0, evening = 0 }) => {
  const w = HOME.window;
  const sh = HOME.shelf;
  const d = HOME.door;
  const wall = mix(C.wall, "#E2C7A6", evening);
  const wallLow = mix(C.wallShade, "#D2B48F", evening);
  return (
    <div style={box({ left: 0, top: 0, width: 1900, height: 2400 })}>
      {/* стена: мягкий градиент света от окна */}
      <div
        style={box({
          left: -400,
          top: -200,
          width: 2700,
          height: HOME.floorY + 200,
          background: `linear-gradient(90deg, ${mix("#F6EDE0", "#E9CFAE", evening)} 0%, ${wall} 45%, ${mix("#E7D7C2", "#D9B994", evening)} 100%)`,
        })}
      />
      {/* панель внизу стены */}
      <div style={box({ left: -400, top: 1150, width: 2700, height: HOME.floorY - 1150, backgroundColor: wallLow })} />
      <div style={box({ left: -400, top: 1144, width: 2700, height: 12, backgroundColor: mix("#D6C1A3", "#C29F78", evening) })} />
      {/* окно во двор */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 12,
          overflow: "hidden",
          background: evening > 0.5 ? "linear-gradient(180deg, #2A3463, #5A5784 60%, #C98F70)" : "linear-gradient(180deg, #BFDDF2, #EAF2F4 70%, #F6EBDB)",
          border: "18px solid #FBF7F0",
          boxSizing: "border-box",
        })}
      >
        <Mountains x={-40} y={70} w={w.w + 60} h={190} evening={evening} />
        <PanelHouse x={-30} y={330} w={230} h={400} color={mix("#E8D8C4", "#3A3F62", evening)} evening={evening} seed={2} />
        <PanelHouse x={250} y={360} w={260} h={400} color={mix("#DCCDBB", "#353A5C", evening)} evening={evening} seed={5} />
        <Poplar x={215} y={640} s={1.05} evening={evening} />
        <Poplar x={410} y={660} s={0.8} evening={evening} />
        <div style={box({ left: w.w / 2 - 24, top: 0, width: 12, height: w.h, backgroundColor: "#FBF7F0" })} />
        <div style={box({ left: 0, top: w.h * 0.4, width: w.w, height: 12, backgroundColor: "#FBF7F0" })} />
      </div>
      {/* подоконник, цветок, занавески, карниз */}
      <div style={box({ left: w.x - 34, top: w.y + w.h - 8, width: w.w + 68, height: 28, borderRadius: 6, backgroundColor: "#FBF7F0", boxShadow: "0 8px 0 rgba(120,90,60,0.12)" })} />
      <div style={box({ left: w.x + 340, top: w.y + w.h - 72, width: 64, height: 66, borderRadius: "8px 8px 20px 20px", backgroundColor: "#C9644F" })} />
      <div style={box({ left: w.x + 326, top: w.y + w.h - 156, width: 92, height: 92, borderRadius: 46, backgroundColor: "#7FAF63" })} />
      <div style={box({ left: w.x + 350, top: w.y + w.h - 186, width: 50, height: 60, borderRadius: 25, backgroundColor: "#93C177" })} />
      <div style={box({ left: w.x - 100, top: w.y - 46, width: 116, height: w.h + 110, borderRadius: "0 0 36px 36px", backgroundColor: mix("#7FA7A0", "#5C7F7D", evening), boxShadow: "inset -14px 0 0 rgba(0,0,0,0.08)" })} />
      <div style={box({ left: w.x + w.w - 16, top: w.y - 46, width: 116, height: w.h + 110, borderRadius: "0 0 36px 36px", backgroundColor: mix("#7FA7A0", "#5C7F7D", evening), boxShadow: "inset 14px 0 0 rgba(0,0,0,0.08)" })} />
      <div style={box({ left: w.x - 120, top: w.y - 60, width: w.w + 240, height: 16, borderRadius: 8, backgroundColor: C.woodDark })} />
      {/* семейное фото над столом */}
      <div style={box({ left: 760, top: 560, width: 150, height: 120, borderRadius: 8, backgroundColor: "#FBF7F0", border: `10px solid ${C.wood}`, boxSizing: "border-box", boxShadow: "6px 8px 0 rgba(120,90,60,0.15)" })}>
        <div style={box({ left: 10, top: 10, width: 110, height: 80, borderRadius: 4, background: "linear-gradient(180deg, #CFE3EE, #E9D8BF)" })} />
        <div style={box({ left: 30, top: 34, width: 22, height: 50, borderRadius: 11, backgroundColor: "#5C88BC" })} />
        <div style={box({ left: 58, top: 46, width: 18, height: 38, borderRadius: 9, backgroundColor: "#E0A04A" })} />
        <div style={box({ left: 80, top: 36, width: 22, height: 48, borderRadius: 11, backgroundColor: "#E07A5F" })} />
      </div>
      {/* полка: книги, папки, макет на средней полке */}
      <div style={box({ left: sh.x, top: sh.y, width: sh.w, height: sh.h, borderRadius: 8, backgroundColor: mix("#C8955F", "#A97B4E", evening), boxShadow: "10px 10px 0 rgba(110,80,50,0.14)" })}>
        <div style={box({ left: 16, top: 16, width: sh.w - 32, height: sh.h - 32, backgroundColor: mix("#E7CFAE", "#C9A57D", evening) })} />
        {[220, 400, 590].map((y) => (
          <div key={y} style={box({ left: 8, top: y, width: sh.w - 16, height: 18, borderRadius: 4, backgroundColor: C.woodDark })} />
        ))}
        {/* книги */}
        {[
          [30, 120, 34, "#5C88BC"],
          [68, 130, 28, "#E07A5F"],
          [100, 110, 40, "#3F6B5E"],
          [146, 124, 30, "#E0A04A"],
          [182, 116, 26, "#8E3B46"],
        ].map(([x, h, ww, col], i) => (
          <div key={i} style={box({ left: x as number, top: 220 - (h as number), width: ww as number, height: h as number, borderRadius: 3, backgroundColor: col as string })} />
        ))}
        {/* папки с чертежами */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: 40 + i * 44, top: 590 - 150, width: 38, height: 150, borderRadius: 4, backgroundColor: i === 1 ? "#73A9C9" : "#4E7FA6" })} />
        ))}
        <div style={box({ left: 190, top: 590 - 110, width: 80, height: 110, borderRadius: 40, backgroundColor: "#7FAF63" })} />
        {/* скрученный чертёж */}
        <div style={box({ left: 30, top: 820 - 50, width: 200, height: 44, borderRadius: 22, backgroundColor: "#DCEBF3", border: "4px solid #9BC3D8", boxSizing: "border-box" })} />
      </div>
      {modelOnShelf ? (
        <div style={box({ left: HOME.modelOnShelf.x, top: HOME.modelOnShelf.y })}>
          <Conveyor mode="model" scale={0.3} t={t} />
        </div>
      ) : null}
      {/* дверь в коридор */}
      <div style={box({ left: d.x - 20, top: d.y - 20, width: d.w + 40, height: d.h + 20, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, background: mix("#B79E83", "#7D6655", evening) })} />
      <div
        style={box({
          left: d.x,
          top: d.y,
          width: d.w * (1 - 0.78 * doorOpen),
          height: d.h,
          backgroundColor: mix("#E9DCC8", "#C8B396", evening),
          boxShadow: "inset -10px 0 0 rgba(0,0,0,0.06)",
        })}
      >
        <div style={box({ left: 28, top: 60, width: d.w - 56, height: 360, borderRadius: 8, border: "6px solid rgba(0,0,0,0.07)", boxSizing: "border-box", opacity: 1 - doorOpen })} />
        <div style={box({ left: 28, top: 480, width: d.w - 56, height: 420, borderRadius: 8, border: "6px solid rgba(0,0,0,0.07)", boxSizing: "border-box", opacity: 1 - doorOpen })} />
        <div style={box({ left: 26, top: 500, width: 46, height: 14, borderRadius: 7, backgroundColor: "#C9A85E", opacity: 1 - doorOpen })} />
      </div>
      {/* пол: доски с лёгкой перспективой и ковёр */}
      <div style={box({ left: -400, top: HOME.floorY, width: 2700, height: 900, background: `linear-gradient(180deg, ${mix("#B98B5E", "#8F6744", evening)} 0%, ${mix("#C99A6B", "#9C7350", evening)} 100%)` })} />
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={box({ left: -400 + i * 200, top: HOME.floorY, width: 3, height: 900, backgroundColor: "rgba(90,60,35,0.18)", transform: `skewX(${(i - 6.5) * 4}deg)`, transformOrigin: "top" })} />
      ))}
      <div style={box({ left: 120, top: HOME.floorY + 120, width: 1260, height: 420, borderRadius: 30, backgroundColor: mix("#8E3B46", "#6E2E37", evening), opacity: 0.9 })}>
        <div style={box({ left: 24, top: 24, width: 1212, height: 372, borderRadius: 22, border: "8px solid #E0B861", boxSizing: "border-box", opacity: 0.7 })} />
      </div>
      {/* подвесная лампа над столом */}
      <div style={box({ left: HOME.lampX - 3, top: -200, width: 6, height: 520, backgroundColor: "#5A4A40" })} />
      <div style={box({ left: HOME.lampX - 120, top: 300, width: 240, height: 110, borderRadius: "120px 120px 16px 16px", backgroundColor: mix("#F3C46B", "#F7C860", evening) })} />
      {evening > 0 ? (
        <div style={box({ left: HOME.lampX - 600, top: 330, width: 1200, height: 1100, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 20%, rgba(255,210,120,0.35), rgba(255,210,120,0) 65%)", opacity: evening })} />
      ) : null}
    </div>
  );
};

// Спинки стульев (за сидящими).
export const ChairBacks: React.FC<{ readonly xs: readonly number[]; readonly evening?: number }> = ({ xs, evening = 0 }) => (
  <>
    {xs.map((x) => (
      <div key={x} style={box({ left: x - 105, top: 960, width: 210, height: 300, borderRadius: "26px 26px 8px 8px", backgroundColor: mix(C.woodDark, "#7A5233", evening), boxShadow: "8px 0 0 rgba(0,0,0,0.08)" })}>
        <div style={box({ left: 22, top: 22, width: 166, height: 120, borderRadius: 16, backgroundColor: mix("#B07B4C", "#8E6240", evening) })} />
      </div>
    ))}
  </>
);

// Стол со скатертью (перед сидящими): столешница видна чуть сверху.
export const HomeTable: React.FC<Light> = ({ evening = 0 }) => {
  const tb = HOME.table;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {/* тень стола на полу */}
      <div style={box({ left: tb.left + 40, top: tb.clothBottom - 10, width: tb.right - tb.left + 40, height: 60, borderRadius: "50%", backgroundColor: "rgba(70,45,30,0.22)" })} />
      {/* столешница (вид сверху) */}
      <div style={box({ left: tb.left - 10, top: tb.top - 44, width: tb.right - tb.left + 20, height: 74, borderRadius: 12, backgroundColor: mix("#FBF7EF", "#F0E2CC", evening) })} />
      {/* свисающая скатерть с орнаментом по краю */}
      <div style={box({ left: tb.left - 18, top: tb.top + 20, width: tb.right - tb.left + 36, height: tb.clothBottom - tb.top - 20, borderRadius: "0 0 18px 18px", backgroundColor: mix("#F6F0E4", "#E8D6BC", evening), boxShadow: "inset 0 18px 0 rgba(0,0,0,0.05)" })}>
        <svg width={tb.right - tb.left + 36} height={60} style={box({ left: 0, top: tb.clothBottom - tb.top - 90 })}>
          {Array.from({ length: 30 }, (_, i) => (
            <path key={i} d={`M ${18 + i * 35} 30 l 12 -12 l 12 12 l -12 12 Z`} fill={i % 2 ? "#C9644F" : "#3F6FA6"} opacity={0.55} />
          ))}
        </svg>
      </div>
    </div>
  );
};
