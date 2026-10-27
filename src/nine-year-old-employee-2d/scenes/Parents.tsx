// Сцена 2. Два рабочих дня родителей.
// A. Небольшой IT-офис: общий стол, мониторы, двое сотрудников. Папа стоит
//    у стола коллеги и показывает на монитор, коллега кивает. Подпись
//    «IT-компания». Белая плоскость стола — та же форма, в которую сжался
//    лист заявления (Transitions).
// B. На «Апасы»: цветные прямоугольники сменяют план — кабинет мамы.
//    Мама в медицинской форме смотрит на расписание приёма после обеда.
//    Подпись «Тиш доктуру». Без процедур крупным планом.
import { AbsoluteFill } from "remotion";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Shot, Tag, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";

export const DESK_PLANE = { x: 80, y: 1050, w: 920, h: 36 } as const;
const FLOOR = 1380;

export const parentsPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "parents");
  const swap = T.word("N02", "Апасы") - 6;
  return {
    itTag: T.word("N02", "компанияны"),
    point: T.word("N02", "чакан"),
    swap,
    docTag: T.word("N02", "доктуру"),
    sched: T.word("N02", "Түштөн"),
    len: T.len,
  };
};

const Monitor: React.FC<{ x: number }> = ({ x }) => (
  <div style={box({ left: x - 70, top: DESK_PLANE.y - 150, width: 140, height: 150 })}>
    <div style={box({ left: 0, top: 0, width: 140, height: 100, backgroundColor: "#3A3F4A", borderRadius: 10 })} />
    <div style={box({ left: 58, top: 100, width: 24, height: 40, backgroundColor: "#2B2F38" })} />
    <div style={box({ left: 40, top: 136, width: 60, height: 14, backgroundColor: "#2B2F38", borderRadius: 6 })} />
  </div>
);

const COL_W = { x: 300, y: FLOOR, h: 690 };
const COL_M = { x: 820, y: FLOOR, h: 700 };
const DAD = { x: 600, y: FLOOR, h: 720 };
const MOM = { x: 420, y: 1420, h: 800 };

const Office: React.FC<{ f: number; p: ReturnType<typeof parentsPlan> }> = ({ f, p }) => {
  const pt = p.point;
  return (
    <Shot f={f} cam={{ x: 560, y: 1010, zoom: 1.5 }} bg={C.wall}>
      {/* окно-лента с синими рамами (без надписей) */}
      <div style={box({ left: 90, top: 300, width: 900, height: 330, backgroundColor: C.glass, border: `12px solid ${C.blue}`, boxSizing: "border-box" })} />
      {[1, 2].map((i) => (
        <div key={i} style={box({ left: 90 + i * 300, top: 300, width: 12, height: 330, backgroundColor: C.blue })} />
      ))}
      <div style={box({ left: -100, top: FLOOR, width: 1300, height: 700, backgroundColor: C.floor })} />
      <Actor
        uid="p2-colw"
        look="colleagueW"
        f={f}
        place={() => COL_W}
        face={() => 0.15}
        pose={(tt) => ({ sit: 1, seat: 0.27 * COL_W.h, expr: "calm", armL: { target: { x: 255, y: 1040 }, elbow: "down" }, armR: { target: { x: 350, y: 1040 + (Math.sin(tt * 1.1) > 0.3 ? -4 : 0) }, elbow: "down" }, lookY: 0.3 })}
        seed={8}
      />
      <Actor
        uid="p2-colm"
        look="colleagueM"
        f={f}
        place={() => COL_M}
        face={(tt) => keys(tt, [[pt, 0.1], [pt + 10, -0.45]])}
        pose={(tt) => ({ sit: 1, seat: 0.27 * COL_M.h, expr: tt > pt + 14 ? "smile" : "calm", nod: keys(tt, [[pt + 26, 0], [pt + 32, 4], [pt + 40, 0]]), armL: { target: { x: 770, y: 1040 }, elbow: "down" }, armR: { target: { x: 870, y: 1040 }, elbow: "down" } })}
        seed={9}
      />
      <Actor
        uid="p2-dad"
        look="dadIT"
        f={f}
        place={() => DAD}
        face={() => 0.55}
        pose={(tt) => ({
          expr: tt > pt + 10 ? "smile" : "calm",
          lean: keys(tt, [[pt, 0], [pt + 12, 6]]),
          lookY: 0.25,
          armR: { target: { x: lerp(650, 700, easeInOut(clamp((tt - pt) / 12))), y: lerp(1080, 940, easeInOut(clamp((tt - pt) / 12))) }, shape: tt > pt + 6 ? "point" : "relax", elbow: "down", behind: false },
          armL: { target: { x: 560, y: 1060 }, shape: "relax", elbow: "down" },
        })}
        seed={2}
      />
      <Monitor x={430} />
      <Monitor x={700} />
      {/* общий стол: белая столешница (та самая плоскость) и синяя панель */}
      <div style={box({ left: DESK_PLANE.x, top: DESK_PLANE.y, width: DESK_PLANE.w, height: DESK_PLANE.h, backgroundColor: "#FFFDF6" })} />
      <div style={box({ left: DESK_PLANE.x + 20, top: DESK_PLANE.y + DESK_PLANE.h, width: DESK_PLANE.w - 40, height: FLOOR - DESK_PLANE.y - DESK_PLANE.h, backgroundColor: C.blue })} />
      <div style={box({ left: DESK_PLANE.x + 20, top: DESK_PLANE.y + DESK_PLANE.h, width: DESK_PLANE.w - 40, height: 26, backgroundColor: "#1C2DC4" })} />
    </Shot>
  );
};

const Clinic: React.FC<{ f: number; p: ReturnType<typeof parentsPlan> }> = ({ f, p }) => {
  const sc = p.sched;
  const rows = ["14:00", "15:00", "16:00", "17:00"];
  return (
    <Shot f={f} cam={{ x: 600, y: 960, zoom: 1.3 }} bg="#EAF3F1">
      <div style={box({ left: -100, top: 1420, width: 1300, height: 600, backgroundColor: "#D3E0DC" })} />
      {/* стоматологическое кресло (силуэт) и лампа */}
      <div style={box({ left: -80, top: 1120, width: 330, height: 110, backgroundColor: "#FFFFFF", borderRadius: 40, transform: "rotate(-12deg)" })} />
      <div style={box({ left: 40, top: 1210, width: 64, height: 210, backgroundColor: "#B9C8C4" })} />
      <div style={box({ left: 90, top: 760, width: 220, height: 20, backgroundColor: "#B9C8C4" })} />
      <div style={box({ left: 270, top: 720, width: 110, height: 110, borderRadius: "50%", backgroundColor: "#FFF6C9", border: "8px solid #B9C8C4" })} />
      {/* расписание приёма на стене: занятые часы после обеда */}
      <div style={box({ left: 600, top: 520, width: 400, height: 560, backgroundColor: "#FFFFFF", border: `8px solid ${C.ink}` })}>
        {rows.map((r, i) => {
          const k = clamp((f - sc - i * 6) / 8);
          return (
            <div key={r} style={box({ left: 24, top: 36 + i * 128, width: 340, height: 110 })}>
              <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.ink }}>{r}</div>
              <div style={box({ left: 0, top: 56, width: 330 * (0.35 + 0.65 * k), height: 34, backgroundColor: [C.pink, C.yellow, C.pink, C.blueSoft][i] })} />
            </div>
          );
        })}
      </div>
      <Actor
        uid="p2-mom"
        look="momDoc"
        f={f}
        place={() => MOM}
        face={(tt) => keys(tt, [[0, 0.2], [sc - 10, 0.2], [sc, 0.75]])}
        pose={() => ({ expr: "calm", lookY: -0.1, armL: { target: { x: 340, y: 1090 }, elbow: "down" }, armR: { target: { x: 460, y: 1090 }, elbow: "down", shape: "relax" } })}
        seed={5}
      />
    </Shot>
  );
};

export const ParentsScene: React.FC = () => {
  const { f } = useScene("parents");
  const p = usePlan(parentsPlan);
  // смена плана: розовая и синяя плоскости проходят по кадру
  const w = f - p.swap;
  return (
    <AbsoluteFill>
      {f < p.swap + 6 ? <Office f={f} p={p} /> : <Clinic f={f} p={p} />}
      {w > -8 && w < 16 ? (
        <>
          <div style={box({ left: lerp(-1100, 1100, easeInOut(clamp((w + 8) / 22))), top: 0, width: 1100, height: 1920, backgroundColor: C.pink })} />
          <div style={box({ left: lerp(-1200, 1100, easeInOut(clamp((w + 4) / 20))), top: 0, width: 1000, height: 1920, backgroundColor: C.blue })} />
        </>
      ) : null}
      {f < p.swap ? <Tag text={NY2_TEXT.labels.it} t={f - p.itTag} x={80} y={1240} /> : null}
      {f >= p.swap + 6 ? <Tag text={NY2_TEXT.labels.dentist} t={f - p.docTag} x={80} y={1240} /> : null}
    </AbsoluteFill>
  );
};
