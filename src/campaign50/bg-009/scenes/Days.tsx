// Сцены 2–6: пять рабочих дней, пять цветовых ритмов. Каждый день
// открывается своей дверью (DoorWipe), сверху — сквозная доска недели
// (WeekBoard): в начале дня над героем всплывает одна и та же метка
// «07:40 • Мектеп / Ким жеткирет?». Герой каждый раз замечает её и
// смотрит на часы — и возвращается к своей задаче:
//   Дүйшөмбү — папа ведёт планёрку у доски;
//   Шейшемби — мама сидит над отчётом;
//   Шаршемби — папа на встрече с клиентом (рукопожатие, телефон на столе);
//   Бейшемби — мама ходит с телефоном у уха, срочная задача;
//   Жума — папа у ноутбука, на стене часы и срок «бүгүн».
import { anticipate, keys, keysV, type Vec } from "../rig/motion";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { easeOut, NAVY, NAVY_SOFT, popScale, prog } from "../art";
import { dayOf, FPS, local, type SceneProps } from "../kit";
import type { Bg9DayId } from "../script";
import { CityWindow, DeskFront, FLOOR_Y, Room, Sticky, WallClock } from "./sets";

// ---------- общие ключи дня (кадры сцены) ----------
// чип всплывает на 22-м кадре, улетает к 69-му (см. WeekBoard.boardBeats)
const NOTICE = 26; // герой замечает метку
const WATCH = 36; // смотрит на часы
const BACK = 62; // возвращается к задаче

const H = { mom: 780, dad: 800, client: 790, colleague: 760 } as const;
const seatOf = (h: number) => 0.27 * h;
const deskTop = (h: number) => FLOOR_Y - 0.4 * h;

// Точка кисти относительно точки персонажа (доли роста).
const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });

// Поднять левую руку и посмотреть на часы (u — 0…1).
const watchArm = (p: Place, f: number, seated: boolean) => {
  const rest = seated ? at(p, -0.13, -0.38) : at(p, -0.12, -0.42);
  const look = seated ? at(p, -0.03, -0.58) : at(p, -0.03, -0.62);
  return {
    target: keysV(f, [[WATCH - 4, rest], [WATCH + 8, look], [BACK - 6, look], [BACK + 8, rest]], anticipate),
    shape: "fist" as const,
    elbow: "down" as const,
    behind: false,
  };
};
const watchLook = (f: number) => keys(f, [[WATCH + 2, 0], [WATCH + 9, 0.7], [BACK - 6, 0.7], [BACK + 2, 0]]);
const noticeExpr = (f: number, base: PoseIn["expr"]) => (f >= NOTICE && f < BACK + 6 ? ("worried" as const) : base);

// Заголовок дня: задача крупно в цвете дня.
const TaskTitle: React.FC<{ readonly id: Bg9DayId; readonly lt: number }> = ({ id, lt }) => {
  const d = dayOf(id);
  const u = easeOut(prog(lt, 0.45, 0.4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", opacity: u, transform: `translateY(${(1 - u) * 24}px)` }}>
      <div style={{ padding: "8px 30px", borderRadius: 40, backgroundColor: d.color, color: "#FFFFFF", fontSize: 50, fontWeight: 1000, whiteSpace: "nowrap", boxShadow: `0 8px 20px ${d.color}55` }}>{d.task}</div>
    </div>
  );
};

// ======================= Дүйшөмбү: планёрка =======================
export const Monday: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "mon", t);
  const d = dayOf("mon");
  const dad: Place = { x: 330, y: FLOOR_Y, h: H.dad };
  const board = { x: 590, y: 690, w: 430, h: 380 };
  const point = (k: number): Vec => ({ x: board.x + 30 + Math.sin(k) * 14, y: board.y + 180 + Math.cos(k * 1.3) * 30 });
  const pointing = f < NOTICE || f > BACK + 4;
  return (
    <Room tint={d.tint} color={d.color}>
      <WallClock x={960} y={600} r={52} h={8} m={keys(f, [[0, 0], [len, 6]])} />
      {/* доска с планом недели */}
      <div style={{ position: "absolute", left: board.x, top: board.y, width: board.w, height: board.h, borderRadius: 16, backgroundColor: "#FFFFFF", border: `8px solid ${NAVY}`, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 22, top: 14, fontSize: 34, fontWeight: 1000, color: NAVY }}>Жумалык план</div>
        <svg width={380} height={140} style={{ position: "absolute", left: 22, top: 200 }}>
          {[0, 1, 2, 3].map((i) => {
            const g = easeOut(prog(lt, 0.9 + i * 0.25, 0.5));
            const hh = [60, 95, 75, 120][i] * g;
            return <rect key={i} x={20 + i * 80} y={130 - hh} width={52} height={hh} rx={6} fill={i === 3 ? d.color : "#B9C9E8"} />;
          })}
          <path d="M 0 132 L 360 132" stroke={NAVY} strokeWidth={4} />
        </svg>
      </div>
      <Sticky x={board.x + 230} y={board.y + 70} color="#FFE07A" s={popScale(prog(lt, 0.7, 0.35))} rot={-4} />
      <Sticky x={board.x + 325} y={board.y + 80} color="#A8E0C2" s={popScale(prog(lt, 1.6, 0.35))} rot={5} />
      <Actor
        uid="mon-dad"
        look="dad"
        f={f}
        sceneLen={len}
        seed={3}
        place={() => dad}
        face={(t2) => keys(t2, [[NOTICE - 2, 0.55], [NOTICE + 6, 0.05], [BACK, 0.05], [BACK + 10, 0.55]])}
        pose={(t2) => ({
          expr: noticeExpr(t2, "calm"),
          lookY: t2 >= NOTICE && t2 < WATCH ? -0.5 : watchLook(t2),
          nod: keys(t2, [[WATCH, 0], [WATCH + 10, 6], [BACK - 4, 6], [BACK + 6, 0]]),
          armR: {
            target: pointing || t2 < NOTICE + 6 ? keysV(t2, [[0, point(0)], [NOTICE, point(t2 / 9)], [NOTICE + 10, at(dad, 0.14, -0.4)], [BACK, at(dad, 0.14, -0.4)], [BACK + 12, point(t2 / 9)]], anticipate) : at(dad, 0.14, -0.4),
            shape: pointing ? ("point" as const) : ("relax" as const),
            elbow: "out" as const,
          },
          armL: watchArm(dad, t2, false),
        })}
      />
      {/* коллеги на переднем плане (спиной) */}
      {[150, 930].map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x - 120, top: 1250 + i * 14, width: 240, height: 260 }}>
          <div style={{ position: "absolute", left: 20, top: 110, width: 200, height: 170, borderRadius: "90px 90px 20px 20px", backgroundColor: i ? "#6A8F6E" : "#3F4A63" }} />
          <div style={{ position: "absolute", left: 60, top: 0 + Math.sin(lt * 2 + i) * 3, width: 120, height: 130, borderRadius: 60, backgroundColor: i ? "#3A2C26" : "#4A4642" }} />
        </div>
      ))}
      <TaskTitle id="mon" lt={lt} />
    </Room>
  );
};

// ======================= Шейшемби: отчёт =======================
export const Tuesday: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "tue", t);
  const d = dayOf("tue");
  const mom: Place = { x: 470, y: FLOOR_Y, h: H.mom };
  const top = deskTop(H.mom);
  const typing = f < NOTICE + 4 || f > BACK + 8;
  const key = (k: number, t2: number): Vec => ({ x: 640 + k * 34 + Math.sin(t2 * 1.9 + k) * 6, y: top + 2 - Math.abs(Math.sin(t2 * 1.4 + k * 2)) * 7 });
  const pct = Math.round(keys(lt, [[0.4, 41], [len / FPS, 78]]));
  return (
    <Room tint={d.tint} color={d.color}>
      <CityWindow x={70} y={560} w={330} h={420} drift={-lt * 6} />
      {/* лист отчёта */}
      <div style={{ position: "absolute", left: 700, top: 590, width: 300, height: 330, borderRadius: 18, backgroundColor: "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,75,0.14)", transform: `rotate(3deg) translateY(${Math.sin(lt * 1.6) * 4}px)` }}>
        <div style={{ position: "absolute", left: 24, top: 18, fontSize: 38, fontWeight: 1000, color: NAVY }}>Отчет</div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 24, top: 82 + i * 34, width: (230 - (i % 2) * 70) * easeOut(prog(lt, 0.6 + i * 0.3, 0.5)), height: 12, borderRadius: 6, backgroundColor: "#CBD5E4" }} />
        ))}
        <div style={{ position: "absolute", left: 24, top: 236, width: 250, height: 26, borderRadius: 13, backgroundColor: "#E3F5EC" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 13, backgroundColor: d.color }} />
        </div>
        <div style={{ position: "absolute", left: 24, top: 270, fontSize: 32, fontWeight: 1000, color: d.color }}>{pct}%</div>
      </div>
      {/* ноутбук: крышка к маме */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M 700 ${top - 4} L 760 ${top - 168} L 900 ${top - 158} L 852 ${top - 4} Z`} fill="#AEB7C6" stroke="#8F98A8" strokeWidth={4} strokeLinejoin="round" />
        <circle cx={800} cy={top - 86} r={14} fill="rgba(255,255,255,0.5)" />
      </svg>
      <Actor
        uid="tue-mom"
        look="mom"
        f={f}
        sceneLen={len}
        seed={5}
        place={() => mom}
        face={(t2) => keys(t2, [[NOTICE - 2, 0.38], [NOTICE + 6, 0], [BACK, 0], [BACK + 10, 0.38]])}
        pose={(t2) => ({
          expr: noticeExpr(t2, "thinking"),
          sit: 1,
          seat: seatOf(H.mom),
          lean: t2 < NOTICE || t2 > BACK + 6 ? 6 : 0,
          lookY: t2 >= NOTICE && t2 < WATCH ? -0.55 : t2 < NOTICE || t2 > BACK + 4 ? 0.45 : watchLook(t2),
          nod: keys(t2, [[WATCH, 0], [WATCH + 10, 7], [BACK - 4, 7], [BACK + 6, 0]]),
          armR: { target: typing ? key(1, t2) : keysV(t2, [[NOTICE + 4, key(1, NOTICE + 4)], [NOTICE + 14, { x: 620, y: top + 4 }], [BACK + 8, { x: 620, y: top + 4 }]]), shape: "relax" as const, elbow: "down" as const, behind: false },
          armL: typing ? { target: key(-1, t2 + 7), shape: "relax" as const, elbow: "down" as const, behind: false } : watchArm(mom, t2, true),
        })}
      />
      <DeskFront x={150} w={800} top={top} color="#FFFFFF" edge="#CFE9DC" />
      {/* клавиатура ноутбука на столе */}
      <div style={{ position: "absolute", left: 610, top: top - 4, width: 250, height: 14, borderRadius: 6, backgroundColor: "#9AA3B2" }} />
      {/* стопка бумаг растёт */}
      {[0, 1, 2, 3, 4].map((i) =>
        lt > 0.3 + i * 0.5 ? <div key={i} style={{ position: "absolute", left: 220 + (i % 2) * 6, top: top - 12 - i * 11, width: 170, height: 12, borderRadius: 3, backgroundColor: i % 2 ? "#F7F7F2" : "#EDEDE6", border: "2px solid #D5D5CC" }} /> : null,
      )}
      <TaskTitle id="tue" lt={lt} />
    </Room>
  );
};

// ======================= Шаршемби: встреча с клиентом =======================
export const Wednesday: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "wed", t);
  const d = dayOf("wed");
  const dad: Place = { x: 320, y: FLOOR_Y, h: H.dad };
  const client: Place = { x: 770, y: FLOOR_Y, h: H.client };
  const top = deskTop(H.dad);
  const shake: Vec = { x: 548, y: top - 70 };
  const SH = [6, 20]; // рукопожатие
  const bob = (t2: number) => (t2 >= SH[0] + 4 && t2 <= SH[1] ? Math.sin((t2 - SH[0]) * 0.7) * 10 : 0);
  const phoneAt: Vec = { x: 430, y: top + 4 };
  const glow = f >= 22 && f < BACK ? 1 : 0;
  const buzz = f >= 22 && f < 40 ? Math.sin(f * 2.4) * 4 : 0;
  return (
    <Room tint={d.tint} color={d.color}>
      <CityWindow x={300} y={560} w={480} h={430} drift={-lt * 5} />
      <div style={{ position: "absolute", left: 70, top: 900, width: 90, height: 280, borderRadius: "45px 45px 10px 10px", backgroundColor: "#7CC48B" }} />
      <div style={{ position: "absolute", left: 80, top: 1160, width: 70, height: 60, borderRadius: 10, backgroundColor: "#C9644F" }} />
      <Actor
        uid="wed-client"
        look="client"
        f={f}
        sceneLen={len}
        seed={9}
        place={() => client}
        face={() => -0.6}
        pose={(t2) => ({
          expr: t2 < SH[1] + 4 ? ("smile" as const) : ("calm" as const),
          sit: 1,
          seat: seatOf(H.client),
          nod: t2 > SH[1] + 10 ? Math.max(0, Math.sin(t2 / 7)) * 4 : 0,
          armL: {
            target:
              t2 <= SH[1] + 6
                ? keysV(t2, [[0, at(client, -0.16, -0.4)], [SH[0], { x: shake.x + 14, y: shake.y + bob(t2) }], [SH[1], { x: shake.x + 14, y: shake.y }], [SH[1] + 6, at(client, -0.2, -0.38)]], anticipate)
                : { x: client.x - 0.24 * client.h + Math.sin(t2 / 6) * 16, y: top - 40 + Math.cos(t2 / 5) * 12 },
            shape: t2 <= SH[1] ? ("open" as const) : ("open" as const),
            elbow: "down" as const,
            behind: false,
          },
          armR: { target: at(client, 0.12, -0.38), shape: "relax" as const, elbow: "down" as const },
        })}
      />
      <Actor
        uid="wed-dad"
        look="dad"
        f={f}
        sceneLen={len}
        seed={4}
        place={() => dad}
        face={(t2) => keys(t2, [[NOTICE, 0.6], [NOTICE + 8, 0.15], [BACK, 0.15], [BACK + 10, 0.6]])}
        pose={(t2) => ({
          expr: noticeExpr(t2, t2 < SH[1] + 4 ? "smile" : "calm"),
          sit: 1,
          seat: seatOf(H.dad),
          lookY: keys(t2, [[NOTICE, 0], [NOTICE + 8, 0.75], [BACK - 4, 0.75], [BACK + 4, 0]]),
          nod: keys(t2, [[NOTICE, 0], [NOTICE + 8, 8], [BACK - 4, 8], [BACK + 6, 0]]),
          armR: {
            target: keysV(t2, [[0, at(dad, 0.16, -0.4)], [SH[0], { x: shake.x - 14, y: shake.y + bob(t2) }], [SH[1], { x: shake.x - 14, y: shake.y }], [SH[1] + 8, at(dad, 0.2, -0.38)]], anticipate),
            shape: t2 >= SH[0] - 2 && t2 <= SH[1] + 2 ? ("open" as const) : ("relax" as const),
            elbow: "down" as const,
            behind: false,
          },
          armL: { target: at(dad, -0.12, -0.38), shape: "relax" as const, elbow: "down" as const },
        })}
      />
      <DeskFront x={130} w={830} top={top} color="#FFFFFF" edge="#F6D9BF" />
      {/* блокнот и телефон на столе; телефон вибрирует и светится */}
      <div style={{ position: "absolute", left: 600, top: top - 8, width: 150, height: 16, borderRadius: 4, backgroundColor: "#F7F3EA", border: "3px solid #D9CBB5", transform: "skewX(-20deg)" }} />
      <div style={{ position: "absolute", left: phoneAt.x - 46 + buzz, top: phoneAt.y - 14, width: 92, height: 22, borderRadius: 7, backgroundColor: "#1E2235", transform: "skewX(-25deg)" }}>
        <div style={{ position: "absolute", inset: 3, borderRadius: 5, backgroundColor: glow ? "#BFE0FF" : "#2C3B5C" }} />
      </div>
      {glow ? (
        <div style={{ position: "absolute", left: phoneAt.x - 70, top: phoneAt.y - 112, padding: "8px 16px", borderRadius: 18, backgroundColor: "#FFFFFF", border: `3px solid ${d.color}`, fontSize: 28, fontWeight: 1000, color: NAVY, whiteSpace: "nowrap", transform: `scale(${popScale(prog(f, 22, 10))})`, transformOrigin: "50% 100%" }}>
          07:40 • Мектеп
        </div>
      ) : null}
      <TaskTitle id="wed" lt={lt} />
    </Room>
  );
};

// ======================= Бейшемби: срочная задача =======================
export const Thursday: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "thu", t);
  const d = dayOf("thu");
  const xs = (t2: number) => keys(t2, [[0, 380], [NOTICE - 4, 520], [BACK + 4, 520], [len, 650]]);
  const place = (t2: number): Place => ({ x: xs(t2), y: FLOOR_Y, h: H.mom });
  const badges = [
    { x: 760, y: 640, at: 0.3 },
    { x: 880, y: 820, at: 0.75 },
    { x: 140, y: 760, at: 1.4 },
  ];
  return (
    <Room tint={d.tint} color={d.color}>
      {/* экран с красной плашкой */}
      <div style={{ position: "absolute", left: 690, top: 900, width: 320, height: 210, borderRadius: 16, backgroundColor: NAVY, boxShadow: "0 10px 24px rgba(20,40,75,0.2)" }}>
        <div style={{ position: "absolute", left: 16, top: 16, right: 16, height: 50, borderRadius: 10, backgroundColor: d.color, color: "#FFFFFF", fontSize: 32, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 + 0.4 * Math.abs(Math.sin(lt * 4)) }}>
          Шашылыш!
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 22, top: 90 + i * 34, width: 200 - i * 40, height: 12, borderRadius: 6, backgroundColor: "#5C6F92" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 840, top: 1110, width: 20, height: 300, backgroundColor: "#8F98A8" }} />
      {badges.map((b, i) => {
        const u = popScale(prog(lt, b.at, 0.35));
        return u > 0 ? (
          <div key={i} style={{ position: "absolute", left: b.x - 36, top: b.y - 36, width: 72, height: 72, borderRadius: 36, backgroundColor: d.color, color: "#FFFFFF", fontSize: 50, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${u}) rotate(${Math.sin(lt * 5 + i) * 8}deg)`, boxShadow: `0 6px 16px ${d.color}66` }}>
            !
          </div>
        ) : null;
      })}
      <Actor
        uid="thu-mom"
        look="mom"
        f={f}
        sceneLen={len}
        seed={7}
        place={place}
        face={(t2) => keys(t2, [[NOTICE - 2, 0.3], [NOTICE + 6, 0], [BACK, 0], [BACK + 10, 0.3]])}
        pose={(t2) => {
          const q = place(t2);
          const ear = { x: q.x + 0.085 * q.h, y: q.y - 0.88 * q.h };
          return {
            expr: noticeExpr(t2, "thinking"),
            lookY: t2 >= NOTICE && t2 < WATCH ? -0.5 : watchLook(t2),
            nod: keys(t2, [[WATCH, 0], [WATCH + 10, 7], [BACK - 4, 7], [BACK + 6, 0]]),
            headTilt: 6,
            armR: { target: ear, shape: "phone" as const, item: "phone" as const, flat: 0, glow: 1, itemTilt: -18, elbow: "out" as const, behind: false },
            armL: { ...watchArm(q, t2, false), item: "notebook" as const, itemColor: "#F6D48A" },
          };
        }}
      />
      <TaskTitle id="thu" lt={lt} />
    </Room>
  );
};

// ======================= Жума: срок сдачи =======================
export const Friday: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "fri", t);
  const d = dayOf("fri");
  const dad: Place = { x: 400, y: FLOOR_Y, h: H.dad };
  const top = deskTop(H.dad);
  const typing = f < NOTICE + 2 || f > BACK + 8;
  const key = (k: number, t2: number): Vec => ({ x: 600 + k * 34 + Math.sin(t2 * 2.1 + k) * 6, y: top + 2 - Math.abs(Math.sin(t2 * 1.6 + k * 2)) * 7 });
  const pct = Math.round(keys(lt, [[0.4, 72], [len / FPS, 96]]));
  // часы бегут быстро: 16:00 → 17:40
  const minutes = keys(lt, [[0, 16 * 60], [len / FPS, 17 * 60 + 40]]);
  return (
    <Room tint={d.tint} color={d.color}>
      <WallClock x={170} y={650} r={72} h={Math.floor(minutes / 60)} m={minutes % 60} />
      {/* календарь: срок — сегодня */}
      <div style={{ position: "absolute", left: 640, top: 590, width: 360, height: 300, borderRadius: 20, backgroundColor: "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,75,0.14)", overflow: "hidden" }}>
        <div style={{ height: 70, backgroundColor: d.color, color: "#FFFFFF", fontSize: 38, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>Жума</div>
        <div style={{ position: "absolute", left: 24, top: 92, fontSize: 32, fontWeight: 1000, color: NAVY }}>Долбоор</div>
        <div style={{ position: "absolute", left: 24, top: 142, width: 312, height: 28, borderRadius: 14, backgroundColor: "#EFE8FA" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 14, backgroundColor: d.color }} />
        </div>
        <div style={{ position: "absolute", left: 24, top: 186, fontSize: 30, fontWeight: 900, color: NAVY_SOFT }}>{pct}%</div>
        <div style={{ position: "absolute", left: 24, top: 230, padding: "4px 16px", borderRadius: 14, backgroundColor: "#FBE5E8", border: "3px solid #D9465C", fontSize: 28, fontWeight: 1000, color: "#B3263C", transform: `scale(${1 + 0.05 * Math.sin(lt * 6)})`, transformOrigin: "0 50%" }}>
          Мөөнөт: бүгүн
        </div>
      </div>
      {/* ноутбук: крышка к папе */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M 660 ${top - 4} L 720 ${top - 170} L 860 ${top - 160} L 812 ${top - 4} Z`} fill="#AEB7C6" stroke="#8F98A8" strokeWidth={4} strokeLinejoin="round" />
        <circle cx={760} cy={top - 86} r={14} fill="rgba(255,255,255,0.5)" />
      </svg>
      <Actor
        uid="fri-dad"
        look="dad"
        f={f}
        sceneLen={len}
        seed={6}
        place={() => dad}
        face={(t2) => keys(t2, [[NOTICE - 2, 0.45], [NOTICE + 8, -0.35], [BACK, -0.2], [BACK + 10, 0.45]])}
        pose={(t2) => ({
          expr: noticeExpr(t2, "thinking"),
          sit: 1,
          seat: seatOf(H.dad),
          lean: typing ? 7 : 0,
          lookY: t2 >= NOTICE && t2 < WATCH ? -0.6 : typing ? 0.4 : watchLook(t2),
          lookX: t2 >= NOTICE && t2 < WATCH ? -0.6 : 0,
          nod: keys(t2, [[WATCH, 0], [WATCH + 10, 7], [BACK - 4, 7], [BACK + 6, 0]]),
          armR: { target: typing ? key(1, t2) : keysV(t2, [[NOTICE, key(1, NOTICE)], [NOTICE + 12, { x: 590, y: top + 4 }]]), shape: "relax" as const, elbow: "down" as const, behind: false },
          armL: typing ? { target: key(-1, t2 + 5), shape: "relax" as const, elbow: "down" as const, behind: false } : watchArm(dad, t2, true),
        })}
      />
      <DeskFront x={170} w={780} top={top} color="#FFFFFF" edge="#DCD0F2" />
      <div style={{ position: "absolute", left: 570, top: top - 4, width: 250, height: 14, borderRadius: 6, backgroundColor: "#9AA3B2" }} />
      <TaskTitle id="fri" lt={lt} />
    </Room>
  );
};
