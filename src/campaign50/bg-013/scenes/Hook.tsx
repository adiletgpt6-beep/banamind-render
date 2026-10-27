// Сцена 1 (хук, 0–3 с): мир глазами ребёнка. Камера на высоте детских глаз
// упирается в огромные часы школьного коридора; минутная стрелка тянется,
// как резинка, циферблат чуть «плывёт». Перед камерой проходят ноги
// взрослого — он намного выше кадра. Сын (закадрово): «Эмнеге шейшемби
// ушунча узун сезилет?» Камера отъезжает: мальчик стоит рядом с учительницей
// и смотрит вверх на часы. Звенит звонок — его волны совпадают с волнами
// уведомления маминого телефона в следующей сцене.
import { BellIcon, easeInOut, NAVY, prog, YELLOW, YELLOW_SOFT } from "../art";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, cruise, keys } from "../rig/motion";
import { cueFrames, local, mouthAt, type SceneProps } from "../kit";
import { BG13_TEXT } from "../script";
import { box, Cam, CHILD_H, StretchClock } from "./sets";

const GROUND = 1880;
const CLOCK = { x: 540, y: 520, r: 250 };

export const hookKeys = (tl: SceneProps["tl"]) => {
  const s01 = cueFrames(tl, "s01");
  const { len } = local(tl, "hook", tl.scenes[0].from);
  return { s01, len, legs: [14, 74] as const, reveal: [64, 120] as const, bell: len - 34 };
};

export const Hook: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, len } = local(tl, "hook", t);
  const k = hookKeys(tl);
  const z = keys(f, [[0, 1.75], [k.reveal[0], 1.62], [k.reveal[1], 1.0]], easeInOut);
  const cy = keys(f, [[0, CLOCK.y + 30], [k.reveal[0], CLOCK.y + 50], [k.reveal[1], 960]], easeInOut);
  // время «тянется»: стрелка почти стоит, но вытягивается
  const minutes = 12 * 60 + 57 + f * 0.012;
  const stretch = 0.35 + 0.35 * Math.sin(f / 16) + 0.3 * prog(f, 0, 90);
  const wobble = Math.sin(f / 11);
  const ring = f >= k.bell ? f - k.bell : -1;
  const son: Place = { x: 770, y: GROUND, h: CHILD_H * 1.22 };
  const teacher: Place = { x: 290, y: GROUND, h: 1500 };
  // ноги проходящего взрослого (головы не видно — он выше кадра)
  const walker = (t2: number): Place => ({ x: -420 + 1900 * cruise((t2 - k.legs[0]) / (k.legs[1] - k.legs[0]), 0.1), y: GROUND + 520, h: 3400 });
  return (
    <div style={box({ inset: 0, backgroundColor: "#EEF4FC", overflow: "hidden" })}>
      <Cam cx={540} cy={cy} z={z}>
        {/* стена коридора, высокие двери, пол «в ребро» */}
        <div style={box({ left: -400, right: -400, top: -400, height: 2300, background: "linear-gradient(180deg, #E6EEF9 0%, #F4F7FC 70%)" })} />
        <div style={box({ left: -400, right: -400, top: 1360, height: 40, backgroundColor: "#D3DDEB" })} />
        <div style={box({ left: -400, right: -400, top: 1400, height: 900, backgroundColor: "#E2E7EF" })} />
        {[-10, 960].map((x) => (
          <div key={x} style={box({ left: x, top: 230, width: 210, height: 1170, borderRadius: "12px 12px 0 0", backgroundColor: "#C9A27A", boxShadow: "inset 0 0 0 14px #FFFFFF" })}>
            <div style={box({ left: x < 0 ? 160 : 24, top: 640, width: 22, height: 70, borderRadius: 10, backgroundColor: "#8C6A4B" })} />
          </div>
        ))}
        {/* доска с детскими рисунками */}
        <div style={box({ left: 260, top: 860, width: 560, height: 300, borderRadius: 16, backgroundColor: "#FFFFFF", boxShadow: "0 0 0 8px #C9D6E8" })}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={box({ left: 30 + i * 176, top: 34, width: 150, height: 120, borderRadius: 8, backgroundColor: [YELLOW_SOFT, "#E3F1E6", "#FDE6E2"][i], transform: `rotate(${[-4, 3, -2][i]}deg)` })} />
          ))}
          <div style={box({ left: 30, top: 186, width: 500, height: 18, borderRadius: 9, backgroundColor: "#E6ECF5" })} />
          <div style={box({ left: 30, top: 222, width: 360, height: 18, borderRadius: 9, backgroundColor: "#E6ECF5" })} />
        </div>
        {/* отрывной календарь: «Шейшемби» */}
        <div style={box({ left: 650, top: 140, width: 200, height: 120, borderRadius: 12, backgroundColor: "#FFFFFF", boxShadow: "0 6px 14px rgba(20,40,75,0.14)", overflow: "hidden" })}>
          <div style={box({ left: 0, right: 0, top: 0, height: 34, backgroundColor: "#E8463A" })} />
          <div style={box({ left: 0, right: 0, top: 44, textAlign: "center", fontSize: 30, fontWeight: 1000, color: NAVY })}>{BG13_TEXT.hook.day}</div>
        </div>
        <StretchClock x={CLOCK.x} y={CLOCK.y} r={CLOCK.r} minutes={minutes} stretch={stretch} wobble={wobble} />
        {/* школьный звонок */}
        <div
          style={box({
            left: 150,
            top: 120,
            width: 120,
            height: 120,
            transform: `rotate(${ring >= 0 ? Math.sin(ring * 1.6) * 14 * Math.max(0, 1 - ring / 30) : 0}deg)`,
          })}
        >
          <BellIcon size={120} />
        </div>
        {ring >= 0
          ? [0, 8, 16].map((d) => {
              const u = Math.max(0, (ring - d) / 26);
              return u > 0 && u < 1 ? (
                <div key={d} style={box({ left: 210 - 60 - 260 * u, top: 180 - 60 - 260 * u, width: 120 + 520 * u, height: 120 + 520 * u, borderRadius: "50%", border: `8px solid ${YELLOW}`, opacity: 1 - u })} />
              ) : null;
            })
          : null}
        <Actor
          uid="hook-teacher"
          look="colleague"
          f={f}
          sceneLen={len}
          seed={31}
          place={() => teacher}
          face={(t2) => keys(t2, [[0, 0.5], [k.bell, 0.5], [k.bell + 10, 0.2]])}
          pose={(t2) => ({
            expr: "softSmile" as const,
            lookY: 0.35,
            armL: { target: { x: teacher.x - 80, y: GROUND - 0.5 * teacher.h }, shape: "relax" as const, elbow: "out" as const, item: "notebook" as const },
            armR: { target: { x: teacher.x + 150, y: GROUND - 0.42 * teacher.h + keys(t2, [[k.bell, 0], [k.bell + 8, -30]]) }, shape: "relax" as const, elbow: "down" as const },
          })}
        />
        <Actor
          uid="hook-son"
          look="son"
          f={f}
          sceneLen={len}
          seed={32}
          mouth={mouthAt(tl, "son", "hook", f)}
          place={() => son}
          face={(t2) => keys(t2, [[0, -0.25], [k.bell, -0.25], [k.bell + 10, 0.35]])}
          pose={(t2) => ({
            expr: t2 < k.bell ? ("thinking" as const) : ("surprised" as const),
            lookY: keys(t2, [[0, -0.95], [k.bell, -0.95], [k.bell + 10, -0.2]]),
            headTilt: keys(t2, [[0, -6], [k.bell, -6], [k.bell + 10, 0]]),
            strapTug: 1,
            armL: { target: { x: son.x - 70, y: GROUND - 0.66 * son.h }, shape: "fist" as const, elbow: "hang" as const },
            armR: { target: { x: son.x + 72, y: GROUND - 0.66 * son.h + keys(t2, [[k.bell, 0], [k.bell + 8, 6]], anticipate) }, shape: "fist" as const, elbow: "hang" as const },
          })}
        />
        <Actor
          uid="hook-walker"
          look="client"
          f={f}
          sceneLen={len}
          seed={33}
          walkFrom={0}
          place={walker}
          face={() => 1}
          pose={() => ({ expr: "neutral" as const, armR: { target: null, shape: "relax" as const, item: "handbag" as const } })}
        />
      </Cam>
      {/* лёгкая виньетка «детского» взгляда снизу */}
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0) 60%, rgba(20,40,75,0.10) 100%)" })} />
    </div>
  );
};
