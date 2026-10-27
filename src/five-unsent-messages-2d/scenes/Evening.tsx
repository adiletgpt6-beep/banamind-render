// Сцены 9–12.
// 9.  Субботний вечер: родители за столом обсуждают поездки; рядом
//     короткая причинная цепочка: рабочий день прерывается поездкой →
//     часть задач остаётся → вечером снова открыт ноутбук. Без чисел.
// 10. Страница BalaGo (нейтральная иллюстрация формы, без URL и выдуманных
//     функций): «Мектеп → Үй» → «Алдын ала арыз» → «Арыз жөнөтүлдү».
//     Заявка ≠ подтверждённая поездка.
// 11. «Кийинки дүйшөмбү», ужин. Отец сам спрашивает: «Бүгүн жаңы жазуу
//     болобу?» — «Бүгүн дароо эле айтып бере алам.» Отец отодвигает
//     телефон экраном вниз, придвигается и смотрит на сына.
// 12. Контактная карточка — ровно последние 150 кадров.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS } from "../../config";
import { fontFamily } from "../../fonts";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { FU2_TEXT } from "../script";
import { C } from "../theme";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, PlateOnTable, TableFront, Teapot, WarmLamp } from "../sets/Home";
import { PhoneOnDesk } from "../sets/Room";
import { onTable, seated, seatOf } from "./common";
import { WORK_PHONE } from "./Gate";
import { PanelArea, Stage, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile(ASSETS.logo)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover" }} />;

// ---------- 9. Маршрут ----------
const MOM = seated("mom", HOME.seat.mom);
const DAD = seated("dad", HOME.seat.dad);

export const RouteScene: React.FC = () => {
  const { f, word, to } = useScene("route");
  // по одной карточке: причина → следствие → решение родителей
  const at = [word("n04", 0) - 2, word("n04", 6) - 2, to("n04") + 8];
  const momPose = (tt: number) => ({
    expr: tt < at[2] ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(MOM),
    armL: { target: onTable(MOM.x - 0.12 * MOM.h, -4), shape: "relax" as const, elbow: "down" as const },
    // показывает на экран ноутбука (расписание)
    armR: { target: keysV(tt, [[at[1] - 10, onTable(MOM.x + 0.12 * MOM.h, -4)], [at[1] + 6, { x: HOME.laptop.x - 60, y: HOME.table.top - 70 }], [at[2] - 6, { x: HOME.laptop.x - 60, y: HOME.table.top - 70 }], [at[2] + 12, onTable(MOM.x + 0.12 * MOM.h, -4)]], anticipate), shape: tt > at[1] && tt < at[2] ? ("point" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    lookY: keys(tt, [[0, 0.45], [at[2], 0.45], [at[2] + 8, 0.1]]),
    lookX: keys(tt, [[0, 0.2], [at[2], 0.2], [at[2] + 8, 0.5]]),
  });
  // отец: устало трёт шею (рабочие звонки, поездки) → смотрит на экран →
  // поворачивается к маме и кивает: «давай заранее»
  const dadPose = (tt: number) => ({
    expr: tt < at[1] ? ("tired" as const) : tt < at[2] ? ("thinking" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(DAD),
    exhale: keys(tt, [[at[0], 0], [at[0] + 14, 0.6], [at[1], 0.2]]),
    armL: { target: onTable(DAD.x - 0.12 * DAD.h, -4), shape: "relax" as const, elbow: "down" as const },
    armR: { target: keysV(tt, [[at[0], onTable(DAD.x + 0.13 * DAD.h, -4)], [at[0] + 12, { x: DAD.x + 0.06 * DAD.h, y: DAD.y - 0.78 * DAD.h }], [at[1] - 6, { x: DAD.x + 0.06 * DAD.h, y: DAD.y - 0.78 * DAD.h }], [at[1] + 8, onTable(DAD.x + 0.13 * DAD.h, -4)]], anticipate), shape: "relax" as const, elbow: "down" as const, behind: false },
    lookY: keys(tt, [[0, 0.5], [at[0] + 10, 0.2], [at[1] - 4, 0.2], [at[1] + 4, 0.45], [at[2], 0.45], [at[2] + 8, 0.1]]),
    lookX: keys(tt, [[at[2], 0], [at[2] + 8, -0.4]]),
    nod: keys(tt, [[at[2] + 12, 0], [at[2] + 20, 4], [at[2] + 30, 0]]),
  });
  return (
    <PanelArea>
      <Stage cam={{ x: 1120, y: 1090, zoom: 1.1 + f * 0.0004 }} bg="#2B2233">
        <HomeBack minutes={19 * 60 + 40 + f / 300} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={MOM.x} evening={1} />
        <ChairBack x={DAD.x} evening={1} />
        <Actor uid="r9-mom" look="mom" f={f} place={() => MOM} face={() => 0.4} pose={momPose} seed={1} />
        <Actor uid="r9-dad" look="dad" f={f} place={() => DAD} face={(tt) => keys(tt, [[at[2], -0.3], [at[2] + 10, -0.7]])} pose={dadPose} role="father" seed={2} />
        <TableFront evening={1} />
        <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
        <Piala x={HOME.piala.x - 120} y={HOME.piala.y} />
      </Stage>
      {/* по одной карточке за раз — внизу, не закрывая лица */}
      {FU2_TEXT.chain.map((s, i) => {
        const a = easeOut((f - at[i]) / 8) * (i < 2 ? 1 - easeOut((f - (at[i + 1] - 6)) / 6) : 1);
        return a > 0.01 ? (
          <div key={s} style={box({ left: 40, right: 40, bottom: 40, height: 150, borderRadius: 28, border: `3px solid ${i === 2 ? C.yellow : C.blue}`, backgroundColor: "rgba(5,11,23,0.92)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 30px", fontFamily, fontSize: 50, fontWeight: 900, color: C.text, lineHeight: 1.15, opacity: a, translate: `0 ${(1 - a) * 16}px` })}>{s}</div>
        ) : null;
      })}
    </PanelArea>
  );
};

// ---------- 10. Предварительная заявка ----------
export const REQ = { fills: [18, 32, 46] as const, tap: 64, sent: 76 };

const RequestPage: React.FC<{ f: number }> = ({ f }) => {
  const p = FU2_TEXT.page;
  const press = interpolate(f, [REQ.tap - 3, REQ.tap, REQ.tap + 6], [1, 0.95, 1], CL);
  // сначала уходит кнопка с прежним текстом, затем — подтверждение (без
  // двойной надписи)
  const btnOut = easeOut((f - (REQ.tap + 4)) / 6);
  const sent = easeOut((f - REQ.sent) / 10);
  const finger = easeOut((f - (REQ.tap - 14)) / 8) * (1 - easeOut((f - (REQ.tap + 8)) / 6));
  const ripple = clamp((f - REQ.tap) / 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA", fontFamily, color: "#14285A" })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 120, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, padding: "0 36px", boxShadow: "0 4px 14px rgba(20,30,60,0.08)" })}>
        <Logo size={84} />
        <div>
          <div style={{ fontSize: 46, fontWeight: 900 }}>{p.brand}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#5A6B8C" }}>{p.tagline}</div>
        </div>
      </div>
      <div style={box({ left: 40, top: 138, fontSize: 50, fontWeight: 900 })}>{p.title}</div>
      {p.fields.map(([label, value], i) => {
        const typed = clamp((f - REQ.fills[i]) / 10);
        return (
          <div key={label} style={box({ left: 40, right: 40, top: 214 + i * 112, display: "flex", flexDirection: "column", gap: 6 })}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
            <div style={{ height: 66, borderRadius: 16, backgroundColor: "#FFFFFF", border: `3px solid ${typed > 0 && typed < 1 ? C.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 36, fontWeight: 800 }}>{value.slice(0, Math.round(value.length * typed))}</div>
          </div>
        );
      })}
      <div style={box({ left: 40, right: 40, top: 556, padding: "20px 0", borderRadius: 999, backgroundColor: C.yellow, fontSize: 40, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - btnOut })}>{p.send}</div>
      {/* касание кнопки: палец и круг */}
      {f >= REQ.tap && ripple < 1 ? <div style={box({ left: 428 - 60 * (1 + ripple), top: 600 - 60 * (1 + ripple), width: 120 * (1 + ripple), height: 120 * (1 + ripple), borderRadius: 999, border: "6px solid rgba(20,40,90,0.35)", opacity: 1 - ripple })} /> : null}
      <svg width={90} height={120} viewBox="0 0 90 120" style={box({ left: 404, top: 596 + (1 - finger) * 60, opacity: finger })}>
        <path d="M 30 10 Q 30 0 40 0 Q 50 0 50 10 L 50 50 L 70 54 Q 84 58 82 74 L 76 110 L 30 110 L 14 70 Q 10 60 20 58 L 30 64 Z" fill="#F2C9A5" stroke="#14285A" strokeWidth={4} />
      </svg>
      <div style={box({ left: 40, right: 40, top: 540, padding: "22px", borderRadius: 24, backgroundColor: "#FFFFFF", border: "4px solid #3E8E5E", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: sent, scale: `${0.96 + 0.04 * sent}`, visibility: sent > 0 ? "visible" : "hidden" })}>
        <div style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
        <div style={{ fontSize: 44, fontWeight: 900 }}>{p.sent}</div>
      </div>
    </div>
  );
};

export const RequestScene: React.FC = () => {
  const { f } = useScene("request");
  const a = easeOut((f + 3) / 8);
  return (
    <PanelArea>
      <div style={box({ left: 24, top: 150, width: 892, height: 700, borderRadius: 26, backgroundColor: "#2A2F3A", padding: 18, boxSizing: "border-box", opacity: a, scale: `${0.97 + 0.03 * a}` })}>
        <div style={box({ left: 18, top: 18, right: 18, bottom: 18, borderRadius: 12, overflow: "hidden" })}>
          <RequestPage f={f} />
        </div>
      </div>
      <div style={box({ left: 10, top: 846, width: 920, height: 28, borderRadius: "0 0 22px 22px", backgroundColor: "#3A4152", opacity: a })} />
    </PanelArea>
  );
};

// ---------- 11. Следующий понедельник ----------
// Причина перемены видна: на столе загорается рабочий телефон — отец
// смотрит на него, осознанно переворачивает экраном вниз и отодвигает
// (телефон движется только вместе с кистью и останавливается после
// отпускания), затем поворачивается к сыну и сам спрашивает. Сын отвечает
// и начинает рассказывать, отец слушает и кивает. Это обычный семейный
// вечер — без машины и поездок BalaGo.
const D_MOM = seated("mom", 640);
const D_BOY = seated("boy", 1000);
const D_DAD = seated("dad", 1250);
// телефон и после сдвига остаётся на столешнице (край стола — x ≈ 1430)
const D_PHONE = { x: 1320, y: HOME.table.top + 20 };
const D_PHONE_AWAY = { x: 1392, y: HOME.table.top + 20 };
// Кисть лежит на телефоне: запястье чуть выше и левее его центра.
const GRIP = { x: -4, y: -26 };
const DN = { light: 6, glance: 12, reach: 22, touch: 32, flip: [34, 44] as const, slide: [46, 64] as const, release: 72 };

export const DinnerScene: React.FC = () => {
  const { f, from, to } = useScene("dinner");
  const f06 = from("f06");
  const s05 = from("s05");
  const endS05 = to("s05");
  const slideU = (tt: number) => easeInOut(clamp((tt - DN.slide[0]) / (DN.slide[1] - DN.slide[0])));
  const phoneAt = (tt: number) => ({ x: D_PHONE.x + (D_PHONE_AWAY.x - D_PHONE.x) * slideU(tt), y: D_PHONE.y });
  const rest = onTable(D_DAD.x + 0.13 * D_DAD.h, -4);
  const handR = (tt: number) => {
    if (tt < DN.touch) return keysV(tt, [[DN.reach, rest], [DN.touch, { x: D_PHONE.x + GRIP.x, y: D_PHONE.y + GRIP.y }]], anticipate);
    if (tt <= DN.slide[1]) {
      const p = phoneAt(tt);
      // переворот: кисть приподнимается над телефоном
      const lift = Math.sin(Math.PI * clamp((tt - DN.flip[0]) / (DN.flip[1] - DN.flip[0]))) * 22;
      return { x: p.x + GRIP.x, y: p.y + GRIP.y - lift };
    }
    return keysV(tt, [[DN.slide[1] + 2, { x: D_PHONE_AWAY.x + GRIP.x, y: D_PHONE_AWAY.y + GRIP.y }], [DN.release, onTable(D_DAD.x + 0.1 * D_DAD.h, -4)]], anticipate);
  };
  const lean = endS05 + 4;
  const dadPose = (tt: number) => ({
    expr: tt < DN.flip[1] ? ("thinking" as const) : tt < endS05 ? ("softSmile" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(D_DAD),
    lean: keys(tt, [[lean, 0], [lean + 22, 10]]),
    turnBody: keys(tt, [[DN.release - 4, 0.6], [DN.release + 8, 0.9]]),
    armL: { target: keysV(tt, [[lean + 4, onTable(D_DAD.x - 0.13 * D_DAD.h, -4)], [lean + 24, onTable(D_DAD.x - 0.2 * D_DAD.h, -4)]]), shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: handR(tt), shape: tt > DN.touch - 4 && tt < DN.slide[1] + 4 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    // взгляд: на сына → загорелся экран: глаза на телефон → решил, отложил
    // → снова на сына (спрашивает и слушает)
    lookY: keys(tt, [[DN.glance - 2, 0.3], [DN.glance + 4, 0.75], [DN.slide[1], 0.75], [DN.release, 0.2]]),
    lookX: keys(tt, [[DN.glance - 2, -0.2], [DN.glance + 4, 0.5], [DN.slide[1], 0.5], [DN.release, -0.45]]),
    headTilt: keys(tt, [[s05, 0], [s05 + 14, 4]]),
    nod: keys(tt, [[endS05 + 4, 0], [endS05 + 12, 4], [endS05 + 22, 0], [endS05 + 40, 0], [endS05 + 48, 3], [endS05 + 58, 0]]),
  });
  const dadFace = (tt: number) => keys(tt, [[0, -0.3], [DN.glance, -0.3], [DN.glance + 8, 0.3], [DN.slide[1], 0.3], [DN.release + 6, -0.9]]);
  const boyPose = (tt: number) => ({
    expr: tt < f06 ? ("calm" as const) : tt < s05 - 4 ? ("surprised" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(D_BOY),
    armL: { target: keysV(tt, [[endS05 + 30, onTable(D_BOY.x - 0.14 * D_BOY.h, -4)], [endS05 + 44, { x: D_BOY.x - 0.2 * D_BOY.h, y: D_BOY.y - 0.6 * D_BOY.h }]], anticipate), shape: tt > endS05 + 36 ? ("open" as const) : ("relax" as const), elbow: "down" as const },
    // после ответа — начинает рассказывать руками
    armR: { target: keysV(tt, [[0, onTable(D_BOY.x + 0.14 * D_BOY.h, -4)], [endS05 + 4, onTable(D_BOY.x + 0.14 * D_BOY.h, -4)], [endS05 + 18, { x: D_BOY.x + 0.24 * D_BOY.h, y: D_BOY.y - 0.62 * D_BOY.h }], [endS05 + 60, { x: D_BOY.x + 0.22 * D_BOY.h, y: D_BOY.y - 0.66 * D_BOY.h }]], anticipate), shape: tt > endS05 + 8 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    // ест и смотрит в тарелку → вопрос отца: удивлённо поднимает глаза
    lookY: keys(tt, [[0, 0.5], [f06 + 4, 0.5], [f06 + 12, 0]]),
    lookX: keys(tt, [[f06 + 4, 0], [f06 + 12, 0.2]]),
  });
  const boyFace = (tt: number) => keys(tt, [[0, 0.1], [f06 + 4, 0.1], [f06 + 14, 0.55]]);
  const momPose = (tt: number) => ({
    expr: "softSmile" as const,
    sit: 1,
    seat: seatOf(D_MOM),
    armL: { target: onTable(D_MOM.x - 0.12 * D_MOM.h, -4), shape: "relax" as const, elbow: "down" as const },
    armR: { target: onTable(D_MOM.x + 0.12 * D_MOM.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: 0.2,
    lookX: keys(tt, [[s05 - 6, 0], [s05 + 4, 0.4]]),
  });
  const cam = { x: keys(f, [[0, 1010], [DN.release, 1100], [lean + 30, 1120]]), y: keys(f, [[0, 1090], [lean + 30, 1070]]), zoom: keys(f, [[0, 0.98], [DN.release, 1.16], [lean + 30, 1.3]]) };
  const p = phoneAt(f);
  const faceDown = f >= (DN.flip[0] + DN.flip[1]) / 2;
  const glow = f >= DN.light && !faceDown ? 1 : 0;
  return (
    <PanelArea>
      <Stage cam={cam} bg="#2B2233">
        <HomeBack minutes={19 * 60 + 5 + f / 300} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={D_MOM.x} evening={1} />
        <ChairBack x={D_BOY.x} evening={1} />
        <ChairBack x={D_DAD.x} evening={1} />
        <Actor uid="d11-mom" look="mom" f={f} place={() => D_MOM} face={() => 0.45} pose={momPose} seed={1} />
        <Actor uid="d11-boy" look="boyHome" f={f} place={() => D_BOY} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} />
        <Actor uid="d11-dad" look="dad" f={f} place={() => D_DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
        <TableFront evening={1} />
        <Teapot x={820} y={HOME.table.top + 18} s={0.8} />
        <PlateOnTable x={D_MOM.x} y={HOME.table.top + 22} eaten={0.3} />
        <PlateOnTable x={D_BOY.x} y={HOME.table.top + 22} eaten={0.4} />
        <PlateOnTable x={D_DAD.x - 20} y={HOME.table.top + 22} eaten={0.4} />
        <PhoneOnDesk x={p.x} y={p.y} caseColor={WORK_PHONE} faceDown={faceDown} screen={glow} />
        {/* руки отца — поверх стола и телефона */}
        <Actor uid="d11-dad" look="dad" f={f} place={() => D_DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      </Stage>
    </PanelArea>
  );
};

// ---------- 12. Контактная карточка ----------
export const ContactScene: React.FC = () => {
  const { f } = useScene("contact");
  const t = FU2_TEXT.cta;
  const a = (k: number) => easeOut((f - k) / 7);
  const item = (k: number): React.CSSProperties => ({ opacity: a(k), translate: `0 ${(1 - a(k)) * 14}px` });
  const [label, number] = t.whatsapp.split(": ");
  return (
    <div style={box({ inset: 0, fontFamily, background: `radial-gradient(circle at 50% 38%, rgba(255,196,107,0.16), transparent 55%), ${C.bg}` })}>
      <div style={box({ left: 60, right: 60, top: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" })}>
        <div style={item(0)}>
          <Logo size={220} />
        </div>
        <div style={{ ...item(1), fontSize: 128, fontWeight: 900, color: C.yellow, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(2), fontSize: 60, fontWeight: 800, color: C.text }}>{t.tagline}</div>
        <div style={{ ...item(3), marginTop: 22, padding: "30px 50px", borderRadius: 48, backgroundColor: C.yellow, fontSize: 64, fontWeight: 900, color: "#14285A", lineHeight: 1.12, boxShadow: "0 16px 40px rgba(255,211,61,0.28)" }}>{t.call}</div>
        <div style={{ ...item(4), fontSize: 48, fontWeight: 800, color: C.blue }}>{t.link}</div>
        <div style={{ ...item(5), marginTop: 24, width: 900, padding: "26px 0 30px", borderRadius: 36, border: `4px solid ${C.yellow}`, backgroundColor: "rgba(16,34,57,0.9)" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: C.blue }}>{label}</div>
          <div style={{ fontSize: 104, fontWeight: 900, color: C.text, whiteSpace: "nowrap", letterSpacing: 2, lineHeight: 1.1 }}>{number}</div>
        </div>
      </div>
    </div>
  );
};
