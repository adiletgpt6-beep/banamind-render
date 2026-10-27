// Мир ответа 1: мастерская-офис мамы с чертежами (день, за окном —
// Ала-Тоо и панельные дома Бишкека). Мама чертит карандашом; на телефоне
// всплывает напоминание «12:30 • Мектептен алып кетүү» — она вздыхает,
// сворачивает незаконченный чертёж в трубку, поворачивается к зрителю и
// отвечает: «Жумушумду үзбөй, баштаган ишимди бүтүрөт элем.»
// Мир — px; кадр f — от начала сцены work (может быть < 0 для портрета
// в хуке и больше длины сцены для плитки мозаики).
import { useTimeline, lineIn, wordIn } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { BG50_TEXT } from "../script";
import { box, type Cam } from "../shots";
import { WallClock } from "../sets/Apartment";
import { FLOOR, H, Plant, RoomShell, Window } from "../sets/Room";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";

// Чертёжный стол: высокий, столешница с наклоном к зрителю.
const DESK = { x: 150, w: 820, top: FLOOR - 0.5 * H.adult, depth: 120 } as const;
export const WORK_MOM = { x: 560, y: FLOOR + 30 } as const;
const SHEET = { x0: 300, x1: 790 } as const; // лист на столе (по переднему краю)
const PHONE = { x: 900, y: DESK.top - 46 } as const;

export const workKeys = (tl: ReturnType<typeof useTimeline>) => {
  const a01 = lineIn(tl, "a01", "work");
  const notif = Math.max(26, a01.from - 92);
  const roll0 = notif + 34;
  const roll1 = roll0 + 30;
  const lift = roll1 + 6;
  const turn = Math.max(lift + 14, a01.from - 16);
  const gesture = wordIn(tl, "a01", "үзбө", 0.25, "work");
  const finish = wordIn(tl, "a01", "бүтүр", 0.75, "work");
  return { a01, notif, roll0, roll1, lift, turn, gesture, finish };
};

// Камеры: полный кадр (по ключам), портрет для хука, плитка мозаики.
export const WORK_PORTRAIT: Cam = { x: 600, y: 905, s: 2.3 };
export const WORK_TILE: Cam = { x: 570, y: 1000, s: 1.6 };
export const workCam = (f: number, k: ReturnType<typeof workKeys>): Cam => {
  const a: Cam = { x: 600, y: 1010, s: 1.62 };
  const b: Cam = { x: 660, y: 1030, s: 1.52 };
  const c: Cam = { x: 575, y: 975, s: 1.78 };
  if (f < k.notif) return a;
  if (f < k.turn - 10) return { x: lerp(a.x, b.x, easeInOut((f - k.notif) / 30)), y: lerp(a.y, b.y, easeInOut((f - k.notif) / 30)), s: lerp(a.s, b.s, easeInOut((f - k.notif) / 30)) };
  const t = easeInOut((f - (k.turn - 10)) / 36);
  return { x: lerp(b.x, c.x, t), y: lerp(b.y, c.y, t), s: lerp(b.s, c.s, t) };
};

// Лист чертежа на столе: часть линий пунктиром — схема не закончена.
// rolled 0…1 — лист сворачивается справа налево в трубку.
const Sheet: React.FC<{ readonly rolled: number; readonly drawn: number }> = ({ rolled, drawn }) => {
  const right = lerp(SHEET.x1, SHEET.x0 + 30, easeInOut(rolled));
  const top = DESK.top - DESK.depth + 18;
  const bot = DESK.top - 8;
  const skew = 26; // перспектива: дальний край уже
  const w = right - SHEET.x0;
  if (rolled >= 0.995) return null;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <defs>
        <clipPath id="work-sheet">
          <path d={`M ${SHEET.x0 + skew} ${top} L ${right - skew * 0.4} ${top} L ${right} ${bot} L ${SHEET.x0} ${bot} Z`} />
        </clipPath>
      </defs>
      <path d={`M ${SHEET.x0 + skew} ${top} L ${right - skew * 0.4} ${top} L ${right} ${bot} L ${SHEET.x0} ${bot} Z`} fill={C.blueprint} />
      <g clipPath="url(#work-sheet)" stroke={C.blueprintLine} fill="none" strokeLinecap="round">
        {/* здание: фасад, окна, крыша — правая часть ещё не начерчена */}
        <path d={`M ${SHEET.x0 + 70} ${bot - 14} L ${SHEET.x0 + 70} ${top + 26} L ${SHEET.x0 + 250} ${top + 14} L ${SHEET.x0 + 250} ${bot - 14}`} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={SHEET.x0 + 95 + i * 52} y={top + 40} width={30} height={22} strokeWidth={3} />
        ))}
        <path d={`M ${SHEET.x0 + 250} ${top + 14} L ${SHEET.x0 + 250 + 190 * drawn} ${top + 26 - 8 * drawn}`} strokeWidth={4} />
        <path d={`M ${SHEET.x0 + 260} ${bot - 14} L ${SHEET.x0 + 450} ${bot - 14}`} strokeWidth={3} strokeDasharray="10 9" opacity={0.75} />
        <path d={`M ${SHEET.x0 + 440} ${top + 22} L ${SHEET.x0 + 440} ${bot - 14}`} strokeWidth={3} strokeDasharray="10 9" opacity={0.75} />
        <path d={`M ${SHEET.x0 + 20} ${bot - 30} L ${SHEET.x0 + w - 20} ${bot - 30}`} strokeWidth={2} opacity={0.4} />
      </g>
      {/* трубка на правом краю сворачиваемого листа */}
      {rolled > 0.01 ? (
        <g>
          <rect x={right - 16} y={top - 6} width={32} height={bot - top + 14} rx={14} fill="#EAF2FF" stroke="#9DB8E0" strokeWidth={2} />
          <rect x={right - 10} y={top - 2} width={8} height={bot - top + 6} rx={4} fill="#FFFFFF" opacity={0.8} />
        </g>
      ) : null}
    </svg>
  );
};

// Телефон на столе: вибрирует, экран светится при напоминании.
const PhoneFlat: React.FC<{ readonly glow: number; readonly shake: number }> = ({ glow, shake }) => (
  <div style={box({ left: PHONE.x - 62 + shake, top: PHONE.y - 14, width: 124, height: 46, borderRadius: 12, backgroundColor: "#1E2235", transform: "perspective(400px) rotateX(55deg)", boxShadow: glow > 0.2 ? "0 0 40px rgba(140,190,255,0.8)" : undefined })}>
    <div style={box({ left: 6, top: 5, right: 6, bottom: 5, borderRadius: 8, backgroundColor: glow > 0.2 ? "#CFE4FF" : "#2C3B5C" })} />
  </div>
);

// Всплывающее напоминание над телефоном.
const Reminder: React.FC<{ readonly a: number }> = ({ a }) =>
  a <= 0.01 ? null : (
    <div
      style={box({
        // правый край ≤ x 930 кадра при движении камеры (зона кнопок Reels)
        left: PHONE.x - 420,
        top: PHONE.y - 168,
        width: 380,
        boxSizing: "border-box",
        padding: "16px 20px",
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        border: "3px solid #DCE3EE",
        boxShadow: "0 16px 34px rgba(20,40,90,0.2)",
        fontFamily,
        fontSize: 30,
        fontWeight: 900,
        color: C.navy,
        opacity: a,
        transform: `translateY(${(1 - a) * 24}px) scale(${0.85 + 0.15 * a})`,
        transformOrigin: "80% 100%",
      })}
    >
      ⏰ {BG50_TEXT.work.reminder}
    </div>
  );

export const WorkWorld: React.FC<{ readonly f: number }> = ({ f }) => {
  const tl = useTimeline();
  const k = workKeys(tl);
  const H0 = H.adult;
  const place = (): Place => ({ x: WORK_MOM.x, y: WORK_MOM.y, h: H0 });
  const P = place();
  const on = (dx: number, dy: number): Vec => ({ x: P.x + dx, y: P.y + dy });
  // карандаш скользит по листу
  const draw = (t: number): Vec => ({ x: 600 + 70 * Math.sin(t / 10) + 20 * Math.sin(t / 3.3), y: DESK.top - 70 + 14 * Math.sin(t / 6.1) });
  const rolled = clamp((f - k.roll0) / (k.roll1 - k.roll0));
  const rollX = lerp(SHEET.x1, SHEET.x0 + 30, easeInOut(rolled));
  const tableRoll: Vec = { x: rollX, y: DESK.top - 60 };
  const chest: Vec = on(70, -560);
  const holdRoll = f >= k.lift;
  const pose = (t: number): PoseIn => {
    const drawing = t < k.notif + 8;
    const rollT = clamp((t - k.roll0) / (k.roll1 - k.roll0));
    const rx = lerp(SHEET.x1, SHEET.x0 + 30, easeInOut(rollT));
    const speaking = t >= k.a01.from - 4 && t <= k.a01.to + 6;
    const gest = keys(t, [[k.gesture - 8, 0], [k.gesture + 6, 1], [k.finish + 10, 1], [k.a01.to + 18, 0]]);
    const armR: PoseIn["armR"] = drawing
      ? { target: draw(t), shape: "pinch", item: "pencil", itemColor: "#2F5D9E", elbow: "down", behind: false }
      : t < k.roll0
        ? { target: keysV(t, [[k.notif + 8, draw(k.notif + 8)], [k.roll0, { x: SHEET.x1 - 10, y: DESK.top - 64 }]], anticipate), shape: "open", elbow: "down", behind: false }
        : t < k.lift
          ? { target: { x: rx + 8, y: DESK.top - 66 }, shape: "open", elbow: "down", behind: false }
          : {
              target: keysV(t, [[k.lift, { x: SHEET.x0 + 40, y: DESK.top - 64 }], [k.lift + 14, chest]], anticipate),
              shape: "fist",
              item: "roll",
              itemTilt: lerp(0, -62, easeOut((t - k.lift) / 14)),
              elbow: "down",
              behind: false,
            };
    const armL: PoseIn["armL"] =
      t < k.roll1
        ? { target: { x: SHEET.x0 + 40, y: DESK.top - 60 }, shape: "open", elbow: "down", behind: false }
        : {
            target: keysV(
              t,
              [
                [k.roll1, { x: SHEET.x0 + 40, y: DESK.top - 60 }],
                [k.lift + 16, on(-150, -470)],
                [k.gesture - 8, on(-150, -470)],
                [k.gesture + 8, on(-190, -700)],
                [k.finish + 10, on(-180, -680)],
                [k.a01.to + 18, on(-150, -470)],
              ],
              anticipate,
            ),
            shape: gest > 0.4 ? "open" : "relax",
            wrist: -20 * gest,
            elbow: "down",
            behind: false,
          };
    return {
      armR,
      armL,
      expr: t < k.notif ? "thinking" : t < k.roll1 ? "tired" : speaking || t > k.a01.to ? "softSmile" : "calm",
      lookY: t < k.notif + 6 ? 0.65 : t < k.turn ? keys(t, [[k.notif + 6, 0.35], [k.roll0, 0.6], [k.lift, 0.5]]) : keys(t, [[k.turn, 0.3], [k.turn + 12, 0]]),
      nod: t < k.turn ? keys(t, [[k.notif, 9], [k.notif + 10, 4], [k.roll0, 8], [k.lift + 8, 5]]) : keys(t, [[k.turn, 4], [k.turn + 12, 0], [k.finish, 0], [k.finish + 5, 4], [k.finish + 12, 0]]),
      headTilt: speaking ? 3 * Math.sin((t - k.a01.from) / 14) : t > k.a01.to ? 4 : 0,
      lean: t < k.lift ? 6 : keys(t, [[k.lift, 6], [k.lift + 16, 0]]),
      exhale: keys(t, [[k.notif + 18, 0], [k.notif + 30, 1], [k.roll1, 0.4], [k.turn, 0]]),
      shoulders: keys(t, [[k.notif + 4, 0], [k.notif + 12, 0.6], [k.notif + 26, 0]]),
    };
  };
  // взгляд: лист → телефон → лист → к зрителю
  const face = (t: number) =>
    keys(t, [
      [k.notif + 4, 0.05],
      [k.notif + 14, 0.75],
      [k.roll0 - 4, 0.6],
      [k.roll0 + 6, -0.1],
      [k.turn, -0.05],
      [k.turn + 12, 0],
    ]);
  const glow = f >= k.notif && f < k.roll0 + 20 ? 1 : 0;
  const shake = f >= k.notif && f < k.notif + 16 ? Math.sin(f * 2.3) * 5 : 0;
  const rem = clamp((f - k.notif - 10) / 8) * (1 - clamp((f - k.roll0 - 6) / 10));
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <RoomShell wall="linear-gradient(180deg, #FFFFFF 0%, #F6F8FC 70%, #EEF2F8 100%)" floor="linear-gradient(180deg, #DCCDB6 0%, #CDB99C 100%)" stripe={C.yellowSoft} />
      <Window x={140} y={360} w={820} h={560} light="day" curtain="#FFE7A0" />
      <WallClock x={1130} y={520} r={70} minutes={12 * 60 + 24 + Math.floor(Math.max(0, f) / 900)} />
      {/* полка со свёрнутыми чертежами и папками */}
      <div style={box({ left: -260, top: 700, width: 300, height: 18, borderRadius: 6, backgroundColor: "#D7C4A6" })} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={box({ left: -240 + i * 64, top: 560 + (i % 2) * 20, width: 46, height: 140 - (i % 2) * 20, borderRadius: 8, backgroundColor: ["#3E7CC0", "#FFC90E", "#5E9A93", "#E9EEF6"][i] })} />
      ))}
      <Plant x={1180} s={1.1} />
      <Actor uid="w-mom" look="momWork" f={f} place={place} face={face} pose={pose} role="momWork" seed={11} layer="body" />
      {/* чертёжный стол: столешница с наклоном и передняя панель */}
      <div style={box({ left: DESK.x, top: DESK.top - DESK.depth, width: DESK.w, height: DESK.depth, background: "linear-gradient(180deg, #F2E6D2, #E6D3B5)", clipPath: `polygon(3% 0, 97% 0, 100% 100%, 0 100%)` })} />
      <Sheet rolled={rolled} drawn={clamp((f + 200) / 400)} />
      <PhoneFlat glow={glow} shake={shake} />
      {/* трубка, пока лежит на столе после сворачивания (до того, как мама её подняла) */}
      {rolled >= 0.995 && !holdRoll ? (
        <div style={box({ left: tableRoll.x - 20, top: DESK.top - DESK.depth + 10, width: 36, height: DESK.depth + 4, borderRadius: 16, backgroundColor: "#EAF2FF", border: "2px solid #9DB8E0", boxSizing: "border-box" })} />
      ) : null}
      {/* ящик с карандашами */}
      <div style={box({ left: 820, top: DESK.top - 70, width: 70, height: 64, borderRadius: 10, backgroundColor: C.navy })} />
      {["#FFC90E", "#3E7CC0", "#FFFFFF"].map((c, i) => (
        <div key={c} style={box({ left: 832 + i * 16, top: DESK.top - 120 + i * 8, width: 10, height: 60, borderRadius: 4, backgroundColor: c })} />
      ))}
      <Actor uid="w-mom" look="momWork" f={f} place={place} face={face} pose={pose} role="momWork" seed={11} layer="arms" />
      <div style={box({ left: DESK.x - 8, top: DESK.top - 4, width: DESK.w + 16, height: 34, borderRadius: 10, backgroundColor: "#CDB48E" })} />
      <div style={box({ left: DESK.x + 10, top: DESK.top + 30, width: DESK.w - 20, height: 110, borderRadius: "0 0 12px 12px", backgroundColor: "#E9D6B8" })} />
      <div style={box({ left: DESK.x + 40, top: DESK.top + 140, width: 30, height: FLOOR - DESK.top - 140, backgroundColor: "#CDB48E" })} />
      <div style={box({ left: DESK.x + DESK.w - 70, top: DESK.top + 140, width: 30, height: FLOOR - DESK.top - 140, backgroundColor: "#CDB48E" })} />
      <Reminder a={rem} />
    </div>
  );
};
