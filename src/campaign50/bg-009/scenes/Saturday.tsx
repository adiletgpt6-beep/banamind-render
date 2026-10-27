// Сцена 8 (связующий поступок): суббота дома. Календарь недели переезжает
// на стену; мама и папа смотрят на него. Мама показывает на строку школы,
// поворачивается к папе: «Ар күнү ким алып барарын чечпей, каттамды алдын
// ала караштыралы.» — на «алдын ала» строку обводит маркер. Папа кивает.
// Мама берёт телефон со стола, открывает ссылку из профиля BalaGo и
// заполняет заявку: үй, мектеп, сабак убактысы → «Өтүнмө жөнөтүү» →
// «Өтүнмө жөнөтүлдү». Затем пять оторванных кусков линии на календаре
// выпрямляются и соединяются, появляется BalaGo — диктор: «BalaGo —
// Бишкектеги балдар үчүн такси.» (Поездка не показывается: только заявка.)
import { Img, staticFile } from "remotion";
import { ArrowText, CheckIcon, easeInOut, easeOut, NAVY, NAVY_SOFT, popScale, prog, WA_GREEN, YELLOW, YELLOW_SOFT } from "../art";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, keys, keysV, type Vec } from "../rig/motion";
import { cueFrames, FPS, local, mouthAt, type SceneProps } from "../kit";
import { BG9_TEXT } from "../script";
import { DeskFront, FLOOR_Y } from "./sets";
import { WeekBoard } from "./WeekBoard";

const H = 700;
const seat = 0.27 * H;
const TOP = FLOOR_Y - 0.4 * H;

// Ключевые моменты субботы (кадры сцены).
export const satKeys = (tl: SceneProps["tl"]) => {
  const m01 = cueFrames(tl, "m01");
  const n08 = cueFrames(tl, "n08");
  const b = m01.to;
  const s = (sec: number) => Math.round(sec * FPS);
  return {
    m01,
    n08,
    lookUp: 22,
    point: 30,
    nod: b - 8,
    reach: b + s(0.15),
    pick: b + s(0.5),
    raise: b + s(0.85),
    phoneIn: b + s(0.9),
    fill: [b + s(1.35), b + s(1.75), b + s(2.15)],
    tap: b + s(2.65),
    sent: b + s(2.85),
    phoneOut: n08.from - s(0.35),
  };
};

const T = BG9_TEXT.app;

// Экран телефона: страница заявки BalaGo (по ссылке из профиля).
const PhoneUi: React.FC<{ readonly f: number; readonly k: ReturnType<typeof satKeys> }> = ({ f, k }) => {
  const typed = (txt: string, at: number) => txt.slice(0, Math.max(0, Math.min(txt.length, Math.floor((f - at) * 1.6))));
  const sent = popScale(prog(f, k.sent, 8));
  const press = f >= k.tap && f < k.tap + 8 ? 0.95 : 1;
  const field = (label: string, value: string, at: number) => (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: NAVY_SOFT }}>{label}</div>
      <div style={{ marginTop: 6, height: 60, borderRadius: 16, border: `3px solid ${f >= at && f < at + 14 ? YELLOW : "#DCE3EE"}`, backgroundColor: "#F7F9FC", display: "flex", alignItems: "center", padding: "0 16px", fontSize: 28, fontWeight: 900, color: NAVY }}>
        {typed(value, at)}
        {f >= at && f < at + 14 && Math.floor(f / 6) % 2 === 0 ? <span style={{ color: NAVY_SOFT }}>|</span> : null}
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", padding: "26px 30px", boxSizing: "border-box", fontFamily: "Nunito" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "6px 18px", borderRadius: 20, backgroundColor: "#EEF2F8", fontSize: 22, fontWeight: 900, color: NAVY_SOFT }}>Профилдеги шилтеме</div>
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 70, height: 70, borderRadius: 35 }} />
        <div>
          <div style={{ fontSize: 44, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{T.brand}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: NAVY_SOFT }}>{T.city} • Балдар үчүн такси</div>
        </div>
      </div>
      <div style={{ marginTop: 22, fontSize: 36, fontWeight: 1000, color: NAVY }}>{T.title}</div>
      <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", padding: "6px 16px", borderRadius: 16, backgroundColor: YELLOW_SOFT, fontSize: 26, fontWeight: 1000, color: NAVY }}>
        <ArrowText text={T.route} size={26} />
      </div>
      {field(T.home, T.homeVal, k.fill[0])}
      {field(T.school, T.schoolVal, k.fill[1])}
      {field(T.time, T.timeVal, k.fill[2])}
      <div style={{ marginTop: 24, height: 76, borderRadius: 38, backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 1000, color: NAVY, transform: `scale(${press})` }}>{T.send}</div>
      {/* касание */}
      {f >= k.tap - 2 && f < k.tap + 12 ? (
        <div style={{ position: "absolute", left: 230 - 30, top: 838 - 30, width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(20,40,75,0.25)", transform: `scale(${0.6 + (f - k.tap + 2) * 0.08})`, opacity: 1 - (f - k.tap + 2) / 14 }} />
      ) : null}
      {sent > 0 ? (
        <div style={{ position: "absolute", left: 30, right: 30, top: 300, padding: "30px 24px", borderRadius: 30, backgroundColor: "#FFFFFF", boxShadow: "0 18px 40px rgba(20,40,75,0.25)", border: `4px solid ${WA_GREEN}`, textAlign: "center", transform: `scale(${sent})` }}>
          <div style={{ width: 90, height: 90, margin: "0 auto", borderRadius: 45, backgroundColor: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckIcon size={60} color="#FFFFFF" />
          </div>
          <div style={{ marginTop: 14, fontSize: 36, fontWeight: 1000, color: NAVY }}>{T.sent}</div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, color: NAVY_SOFT, lineHeight: 1.2 }}>Ылайыктуу топ изделет</div>
        </div>
      ) : null}
    </div>
  );
};

export const Saturday: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "sat", t);
  const k = satKeys(tl);
  const room = easeOut(prog(lt, 0, 0.6));
  const wall = easeInOut(prog(lt, 0, 0.85));
  const mom: Place = { x: 330, y: FLOOR_Y, h: H };
  const dad: Place = { x: 760, y: FLOOR_Y, h: H };
  const phoneTable: Vec = { x: 470, y: TOP + 4 };
  const phoneLook: Vec = { x: mom.x + 0.1 * H, y: FLOOR_Y - 0.62 * H };
  const calendar: Vec = { x: 470, y: 760 };
  const inPhone = easeInOut(prog(f, k.phoneIn, 12)) * (1 - easeInOut(prog(f, k.phoneOut, 12)));
  const speaking = f >= k.m01.from - 4 && f <= k.m01.to + 4;
  const holding = f >= k.pick;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* комната */}
      <div style={{ position: "absolute", inset: 0, opacity: room }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#FBF3E6" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1200, height: 720, backgroundColor: "#EADBC4" }} />
        <div style={{ position: "absolute", left: 30, top: 300, padding: "6px 22px", borderRadius: 30, backgroundColor: "#FFFFFF", fontSize: 34, fontWeight: 1000, color: NAVY_SOFT, opacity: 1 - prog(lt, 1.5, 0.5) }}>{BG9_TEXT.sat.day}</div>
        {/* подложка календаря на стене */}
        <div style={{ position: "absolute", left: 86, top: 432, width: 908, height: 462, borderRadius: 30, backgroundColor: "#F2E6D2" }} />
        {[230, 850].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, top: 418, width: 34, height: 34, borderRadius: 17, backgroundColor: "#C9644F" }} />
        ))}
        {/* лампа и растение */}
        <div style={{ position: "absolute", left: 960, top: 980, width: 80, height: 220, borderRadius: "40px 40px 8px 8px", backgroundColor: "#7CC48B" }} />
      </div>
      <WeekBoard t={t} tl={tl} wall={wall} />
      <div style={{ position: "absolute", inset: 0, opacity: room }}>
        <Actor
          uid="sat-dad"
          look="dad"
          f={f}
          sceneLen={len}
          seed={14}
          place={() => dad}
          face={(t2) => keys(t2, [[k.lookUp, -0.1], [k.lookUp + 8, -0.25], [k.m01.from, -0.25], [k.m01.from + 8, -0.6], [k.raise + 6, -0.6], [k.raise + 16, -0.35]])}
          pose={(t2) => ({
            expr: t2 < k.m01.from ? ("thinking" as const) : t2 < k.nod ? ("calm" as const) : ("softSmile" as const),
            sit: 1,
            seat,
            lookY: keys(t2, [[k.lookUp, 0], [k.lookUp + 8, -0.6], [k.m01.from, -0.6], [k.m01.from + 8, 0], [k.raise + 6, 0], [k.raise + 14, 0.35], [k.phoneOut, 0.35], [k.phoneOut + 10, -0.5]]),
            nod: keys(t2, [[k.nod, 0], [k.nod + 6, 8], [k.nod + 12, 1], [k.nod + 18, 7], [k.nod + 26, 0]]),
            armR: { target: { x: dad.x + 0.14 * H, y: TOP + 4 }, shape: "relax" as const, elbow: "down" as const, behind: false },
            armL: {
              target: keysV(t2, [[k.lookUp + 4, { x: dad.x - 0.12 * H, y: TOP + 4 }], [k.lookUp + 16, { x: dad.x - 0.03 * H, y: FLOOR_Y - 0.66 * H }], [k.m01.from + 4, { x: dad.x - 0.03 * H, y: FLOOR_Y - 0.66 * H }], [k.m01.from + 16, { x: dad.x - 0.14 * H, y: TOP + 4 }]], anticipate),
              shape: "relax" as const,
              elbow: "down" as const,
              behind: false,
            },
          })}
        />
        <Actor
          uid="sat-mom"
          look="mom"
          f={f}
          sceneLen={len}
          seed={15}
          mouth={mouthAt(tl, "mother", "sat", f)}
          place={() => mom}
          face={(t2) => keys(t2, [[k.lookUp, 0.1], [k.lookUp + 8, 0.3], [k.m01.from - 2, 0.3], [k.m01.from + 8, 0.65], [k.m01.to, 0.65], [k.reach, 0.35], [k.phoneOut, 0.2], [k.phoneOut + 10, 0.3]])}
          pose={(t2) => ({
            expr: t2 < k.m01.from ? ("thinking" as const) : t2 < k.sent ? ("calm" as const) : ("softSmile" as const),
            sit: 1,
            seat,
            lookY: keys(t2, [[k.lookUp, 0], [k.lookUp + 8, -0.65], [k.m01.from - 2, -0.65], [k.m01.from + 8, -0.05], [k.reach, -0.05], [k.reach + 6, 0.6], [k.raise, 0.5], [k.phoneOut, 0.5], [k.phoneOut + 10, -0.55]]),
            nod: speaking ? Math.sin((t2 - k.m01.from) / 5) * 2.5 : 0,
            headTilt: speaking ? 4 : 0,
            lean: keys(t2, [[k.reach - 2, 0], [k.pick - 4, 8], [k.raise, 2]]),
            armR: {
              target: keysV(
                t2,
                [
                  [k.point - 6, { x: mom.x + 0.16 * H, y: TOP + 4 }],
                  [k.point + 8, calendar],
                  [k.m01.from + 2, calendar],
                  // жест «давай заранее»: открытая ладонь к папе
                  [k.m01.from + 14, { x: mom.x + 0.3 * H, y: FLOOR_Y - 0.55 * H }],
                  [k.m01.to - 8, { x: mom.x + 0.3 * H + 10, y: FLOOR_Y - 0.53 * H }],
                  [k.reach, { x: mom.x + 0.2 * H, y: TOP }],
                  [k.pick, phoneTable],
                  [k.raise + 10, phoneLook],
                  [k.phoneOut + 6, phoneLook],
                  [k.phoneOut + 20, { x: mom.x + 0.12 * H, y: FLOOR_Y - 0.5 * H }],
                ],
                anticipate,
              ),
              shape: holding ? ("phone" as const) : t2 >= k.point && t2 < k.m01.from + 4 ? ("point" as const) : t2 >= k.m01.from + 4 && t2 < k.reach ? ("open" as const) : ("relax" as const),
              item: holding ? ("phone" as const) : ("none" as const),
              flat: holding ? 1 - prog(t2, k.pick, 14) : 1,
              glow: t2 >= k.raise ? 1 : 0,
              itemTilt: 0,
              elbow: "down" as const,
              behind: false,
            },
            armL: { target: { x: mom.x - 0.12 * H, y: TOP + 4 }, shape: "relax" as const, elbow: "down" as const, behind: false },
          })}
        />
        <DeskFront x={120} w={840} top={TOP} color="#FFFFFF" edge="#E3CDB0" />
        {/* телефон лежит на столе до того, как мама его берёт */}
        {f < k.pick ? (
          <div style={{ position: "absolute", left: phoneTable.x - 44, top: phoneTable.y - 12, width: 88, height: 20, borderRadius: 7, backgroundColor: "#1E2235", transform: "skewX(-25deg)" }} />
        ) : null}
        {/* блокнот на столе */}
        <div style={{ position: "absolute", left: 640, top: TOP - 8, width: 140, height: 16, borderRadius: 4, backgroundColor: "#FFFFFF", border: "3px solid #D9CBB5", transform: "skewX(-20deg)" }} />
      </div>
      {/* телефон крупно */}
      {inPhone > 0 ? (
        <div style={{ position: "absolute", left: 540 - 270, top: 300 + (1 - inPhone) * 900, width: 540, height: 1080, borderRadius: 60, backgroundColor: "#1E2235", padding: 18, boxSizing: "border-box", boxShadow: "0 30px 60px rgba(20,40,75,0.35)", opacity: Math.min(1, inPhone * 1.5) }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 44, overflow: "hidden" }}>
            <PhoneUi f={f} k={k} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
