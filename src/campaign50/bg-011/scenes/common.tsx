// Общее для сцен: рост персонажей, посадка за стол, точки на мебели,
// подписи стоп-кадров со стрелками.
import { fontFamily } from "../../../fonts";
import type { Place, WorldArm } from "../rig/Actor";
import { clamp, easeOut } from "../rig/motion";
import { C, K, seatH } from "../sets/Kitchen";

// Рост персонажей (px мира) у стены (ступни на y = 1600).
export const H = { mom: 760, dad: 790, son: 540 } as const;

export const stand = (who: keyof typeof H, x: number, dy = 0): Place => ({ x, y: K.standY + dy, h: H[who] * (1 + dy * 0.0006) });
export const seated = (who: keyof typeof H, x: number): Place => ({ x, y: K.seatY, h: H[who] });
export const seatOf = (p: Place) => seatH(p.h);

// Точка на столешнице / комоде (для кисти).
export const onTable = (x: number, dy = 0) => ({ x, y: K.table.top + 6 + dy });
export const onDresser = (x: number, dy = 0) => ({ x, y: K.dresser.top + 4 + dy });

export const hang: WorldArm = { target: null, shape: "relax" };

// Посадка: корпус вперёд (вес на стопы), таз опускается, корпус
// выпрямляется. t0 — начало движения.
export const sitDown = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 14 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
const smooth = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};

// Смех: плечи подпрыгивают, голова слегка откидывается (без звука голоса).
export const laugh = (t: number, from: number, to: number) => {
  if (t < from || t > to) return { shoulders: 0, nod: 0, bounce: 0 };
  const env = clamp((t - from) / 8) * clamp((to - t) / 12);
  const b = Math.abs(Math.sin(((t - from) / 30) * Math.PI * 4.2));
  return { shoulders: 0.55 * env * b, nod: -6 * env, bounce: env * b };
};

// Подпись стоп-кадра: плашка с текстом и изогнутая стрелка к точке кадра.
export const FreezeTag: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly to: { readonly x: number; readonly y: number };
  readonly rot?: number;
  readonly color?: string;
  readonly size?: number;
}> = ({ f, at, x, y, text, to, rot = -3, color = C.yellow, size = 50 }) => {
  const a = easeOut((f - at) / 8);
  if (a <= 0) return null;
  const draw = easeOut((f - at - 4) / 10);
  const mx = (x + to.x) / 2 + (to.y - y) * 0.25;
  const my = (y + to.y) / 2 - Math.abs(to.x - x) * 0.18;
  const ang = Math.atan2(to.y - my, to.x - mx);
  const len = Math.hypot(to.x - x, to.y - y) * 1.15;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        <path d={`M ${x} ${y} Q ${mx} ${my} ${to.x} ${to.y}`} stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <path d={`M ${x} ${y} Q ${mx} ${my} ${to.x} ${to.y}`} stroke={C.navy} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        {draw > 0.95 ? (
          <path
            d={`M ${to.x} ${to.y} L ${to.x - 30 * Math.cos(ang - 0.5)} ${to.y - 30 * Math.sin(ang - 0.5)} M ${to.x} ${to.y} L ${to.x - 30 * Math.cos(ang + 0.5)} ${to.y - 30 * Math.sin(ang + 0.5)}`}
            stroke={C.navy}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ) : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.7 + 0.3 * a})`,
          opacity: a,
          padding: "12px 26px",
          borderRadius: 18,
          backgroundColor: color,
          color: C.navy,
          fontFamily,
          fontSize: size,
          fontWeight: 900,
          whiteSpace: "nowrap",
          boxShadow: "0 10px 24px rgba(20,30,60,0.25)",
          border: "5px solid #FFFFFF",
        }}
      >
        {text}
      </div>
    </>
  );
};
