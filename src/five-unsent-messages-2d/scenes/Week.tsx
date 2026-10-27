// Сцена 5. Пять дней: дни сменяются, каждый день — тот же короткий путь
// «Мектеп → Үй». Дома мальчик сохраняет небольшую голосовую заметку:
// микрофон → запись → стоп → карточка в папке «Атама». Файлы появляются по
// очереди: Дүйшөмбү → … → Жума, счётчик 1 → 5 — число СОХРАНЁННЫХ записей.
// Содержание не раскрывается, звук записей здесь не звучит.
import { fontFamily } from "../../fonts";
import { Actor } from "../rig/Actor";
import { clamp, cruise, easeOut, keysV, lerp } from "../rig/motion";
import { FU2_RECORDS, FU2_TEXT, FU2_VIDEO } from "../script";
import { C } from "../theme";
import { idleView, MemoHeader, MemoRow } from "../graphics/Memo";
import { WEEK_DAY_FROM, WEEK_SAVE } from "../layout";
import { BOY_BOOST, DeskFront, KidChair, ROOM, RoomBack } from "../sets/Room";
import { seated, seatOf } from "./common";
import { BOY_PHONE } from "./Gate";
import { PanelArea, Stage, useScene } from "./kit";

const FPS = FU2_VIDEO.fps;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const REC = 0.85; // длительность «записи» в монтаже, с (время сжато)
const BOY = seated("boy", ROOM.boy);

export const WeekScene: React.FC = () => {
  const { f } = useScene("week");
  const t = f / FPS;
  const saved = WEEK_SAVE.filter((s) => t >= s).length;
  const day = Math.max(0, WEEK_DAY_FROM.filter((x) => t >= x).length - 1);
  const recIdx = WEEK_SAVE.findIndex((s) => t >= s - REC && t < s);
  const recording = recIdx >= 0;
  const recU = recording ? clamp((t - (WEEK_SAVE[recIdx] - REC)) / REC) : 0;
  const last = WEEK_SAVE[Math.max(0, saved - 1)];
  const pop = saved > 0 ? 1 - easeOut((t - last) / 0.4) : 0;
  // мальчик подносит телефон ближе на время записи
  const near = (tt: number) => {
    const s = tt / FPS;
    const i = WEEK_SAVE.findIndex((x) => s >= x - REC - 0.25 && s < x + 0.2);
    return i < 0 ? 0 : clamp(Math.min((s - (WEEK_SAVE[i] - REC - 0.25)) / 0.25, (WEEK_SAVE[i] + 0.2 - s) / 0.2));
  };
  const boyPose = (tt: number) => {
    const n = near(tt);
    return {
      expr: "calm" as const,
      sit: 1,
      seat: seatOf(BOY) + BOY_BOOST,
      armR: { target: keysV(n, [[0, { x: BOY.x + 0.06 * BOY.h, y: BOY.y - 0.62 * BOY.h }], [1, { x: BOY.x + 0.02 * BOY.h, y: BOY.y - 0.74 * BOY.h }]]), shape: "phone" as const, item: "phone" as const, itemColor: BOY_PHONE, glow: 1, elbow: "down" as const, behind: false },
      armL: { target: { x: BOY.x - 0.1 * BOY.h, y: BOY.y - 0.6 * BOY.h }, shape: "relax" as const, elbow: "down" as const, behind: false },
      lookY: lerp(0.6, 0.35, n),
      lookX: 0.15,
    };
  };
  const pathU = cruise(clamp((t - WEEK_DAY_FROM[day] - 0.05) / 0.8), 0.3);
  return (
    <PanelArea>
      {/* дни недели и тот же короткий путь */}
      <div style={box({ left: 24, right: 24, top: 22, display: "flex", gap: 10, fontFamily })}>
        {FU2_RECORDS.map((r, i) => {
          const cur = i === day;
          const past = i < day;
          return (
            <div key={r.id} style={{ flex: 1, height: 108, borderRadius: 18, border: `2px solid ${cur ? C.blue : C.lineSoft}`, backgroundColor: cur ? "rgba(169,208,236,0.14)" : "rgba(5,11,23,0.45)", padding: "10px 10px 0", boxSizing: "border-box", opacity: past ? 0.6 : 1 }}>
              <div style={{ fontSize: 25, fontWeight: 900, color: cur ? C.text : C.dim, textAlign: "center", whiteSpace: "nowrap" }}>{r.day}</div>
              <svg width={150} height={44} viewBox="0 0 150 44" style={{ display: "block", margin: "6px auto 0" }}>
                <line x1={18} y1={22} x2={132} y2={22} stroke={C.line} strokeWidth={4} strokeLinecap="round" />
                {past || cur ? <line x1={18} y1={22} x2={lerp(18, 132, past ? 1 : pathU)} y2={22} stroke={C.blue} strokeWidth={4} strokeLinecap="round" /> : null}
                <circle cx={18} cy={22} r={7} fill={C.blue} />
                <circle cx={132} cy={22} r={7} fill={past || (cur && pathU > 0.98) ? C.blue : C.panel} stroke={C.blue} strokeWidth={3} />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={box({ left: 24, top: 138, fontFamily, fontSize: 26, fontWeight: 800, color: C.dim })}>
        {FU2_TEXT.school} → {FU2_TEXT.home}
      </div>
      {/* дома: запись голосовой заметки */}
      <Stage cam={{ x: 640, y: 1180, zoom: 1.2 }} inset={{ x: 24, y: 186, w: 400, h: 550 }}>
        <RoomBack evening={1} />
        <KidChair x={BOY.x} />
        <Actor uid="w5-boy" look="boyHome" f={f} place={() => BOY} face={() => 0.15} pose={boyPose} role="son" seed={4} layer="body" />
        <DeskFront evening={1} lampOn={1} />
        <Actor uid="w5-boy" look="boyHome" f={f} place={() => BOY} face={() => 0.15} pose={boyPose} role="son" seed={4} layer="arms" />
      </Stage>
      {/* индикатор записи (без звука: содержание не раскрывается) */}
      <div style={box({ left: 44, top: 650, display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.88)", border: `2px solid ${recording ? C.yellow : C.lineSoft}`, fontFamily, fontSize: 26, fontWeight: 800, color: recording ? C.yellow : C.dim })}>
        <svg width={44} height={44} viewBox="0 0 44 44">
          <circle cx={22} cy={22} r={10 + (recording ? 8 * Math.abs(Math.sin(recU * Math.PI * 3)) : 0)} fill="none" stroke={C.yellow} strokeWidth={3} opacity={recording ? 0.7 : 0} />
          <circle cx={22} cy={22} r={9} fill={recording ? C.yellow : C.line} />
        </svg>
        {recording ? FU2_TEXT.recording : FU2_TEXT.folder}
      </div>
      {/* папка «Атама»: файлы появляются по очереди */}
      <div style={box({ left: 444, top: 186, width: 472 })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <MemoHeader w={360} size={0.82} />
          <div style={{ fontFamily, fontSize: 64, fontWeight: 900, color: C.yellow, scale: `${1 + 0.15 * pop}`, minWidth: 60, textAlign: "right" }}>{saved}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {FU2_RECORDS.map((r, i) => {
            const a = easeOut((t - WEEK_SAVE[i]) / 0.3);
            return (
              <div key={r.id} style={{ opacity: a, translate: `${(1 - a) * -60}px 0`, scale: `${0.94 + 0.06 * a}` }}>
                <MemoRow id={r.id} w={472} view={idleView} f={f} compact />
              </div>
            );
          })}
        </div>
      </div>
    </PanelArea>
  );
};

