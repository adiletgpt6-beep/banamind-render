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
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
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
  const { f, word } = useScene("route");
  const at = [word("n04", 3), word("n04", 6), word("n04", 8)];
  const momPose = (tt: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(MOM),
    armL: { target: onTable(MOM.x - 0.12 * MOM.h, -4), shape: "relax" as const, elbow: "down" as const },
    // показывает на экран ноутбука
    armR: { target: keysV(tt, [[30, onTable(MOM.x + 0.12 * MOM.h, -4)], [46, { x: HOME.laptop.x - 60, y: HOME.table.top - 70 }], [120, { x: HOME.laptop.x - 60, y: HOME.table.top - 70 }], [140, onTable(MOM.x + 0.12 * MOM.h, -4)]], anticipate), shape: tt > 40 && tt < 128 ? ("point" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    lookY: 0.45,
    lookX: keys(tt, [[0, 0.2], [130, 0.2], [146, 0.5]]),
  });
  const dadPose = (tt: number) => ({
    expr: tt < 120 ? ("thinking" as const) : ("calm" as const),
    sit: 1,
    seat: seatOf(DAD),
    armL: { target: onTable(DAD.x - 0.12 * DAD.h, -4), shape: "relax" as const, elbow: "down" as const },
    armR: { target: onTable(DAD.x + 0.13 * DAD.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: 0.45,
    nod: keys(tt, [[150, 0], [158, 3], [168, 0]]),
  });
  return (
    <PanelArea>
      <div style={box({ left: 24, right: 24, top: 22, height: 132, display: "flex", alignItems: "center", gap: 8, fontFamily })}>
        {FU2_TEXT.chain.map((s, i) => {
          const a = easeOut((f - at[i]) / 8);
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, opacity: a, translate: `0 ${(1 - a) * 12}px` }}>
              {i > 0 ? <div style={{ fontSize: 40, fontWeight: 900, color: C.blue }}>→</div> : null}
              <div style={{ flex: 1, height: 112, borderRadius: 20, border: `2px solid ${i === 2 ? C.blue : C.lineSoft}`, backgroundColor: "rgba(5,11,23,0.55)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 10px", fontSize: 29, fontWeight: 900, color: C.text, lineHeight: 1.15 }}>{s}</div>
            </div>
          );
        })}
      </div>
      <Stage cam={{ x: 1120, y: 1060, zoom: 1.08 + f * 0.0004 }} inset={{ x: 24, y: 172, w: 892, h: 564 }} bg="#2B2233">
        <HomeBack minutes={19 * 60 + 40 + f / 300} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={MOM.x} evening={1} />
        <ChairBack x={DAD.x} evening={1} />
        <Actor uid="r9-mom" look="mom" f={f} place={() => MOM} face={() => 0.4} pose={momPose} seed={1} />
        <Actor uid="r9-dad" look="dad" f={f} place={() => DAD} face={() => -0.4} pose={dadPose} role="father" seed={2} />
        <TableFront evening={1} />
        <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
        <Piala x={HOME.piala.x - 120} y={HOME.piala.y} />
      </Stage>
    </PanelArea>
  );
};

// ---------- 10. Предварительная заявка ----------
export const REQ = { fills: [18, 32, 46] as const, tap: 66, sent: 72 };

const RequestPage: React.FC<{ f: number }> = ({ f }) => {
  const p = FU2_TEXT.page;
  const press = interpolate(f, [REQ.tap - 3, REQ.tap, REQ.tap + 6], [1, 0.95, 1], CL);
  const sent = easeOut((f - REQ.sent) / 10);
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
      <div style={box({ left: 40, right: 40, top: 556, padding: "20px 0", borderRadius: 999, backgroundColor: C.yellow, fontSize: 40, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - sent })}>{p.send}</div>
      <div style={box({ left: 40, right: 40, top: 540, padding: "22px", borderRadius: 24, backgroundColor: "#FFFFFF", border: "4px solid #3E8E5E", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: sent, scale: `${0.96 + 0.04 * sent}` })}>
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
      <div style={box({ left: 24, top: 20, width: 892, height: 700, borderRadius: 26, backgroundColor: "#2A2F3A", padding: 18, boxSizing: "border-box", opacity: a, scale: `${0.97 + 0.03 * a}` })}>
        <div style={box({ left: 18, top: 18, right: 18, bottom: 18, borderRadius: 12, overflow: "hidden" })}>
          <RequestPage f={f} />
        </div>
      </div>
      <div style={box({ left: 10, top: 716, width: 920, height: 28, borderRadius: "0 0 22px 22px", backgroundColor: "#3A4152", opacity: a })} />
    </PanelArea>
  );
};

// ---------- 11. Следующий понедельник ----------
const D_MOM = seated("mom", 640);
const D_BOY = seated("boy", 1000);
const D_DAD = seated("dad", 1250);
const D_PHONE = { x: 1335, y: HOME.table.top + 20 };
const D_PHONE_AWAY = { x: 1425, y: HOME.table.top + 20 };

export const DinnerScene: React.FC = () => {
  const { f, from, to } = useScene("dinner");
  const f06 = from("f06");
  const s05 = from("s05");
  const reach = s05 + 4;
  const slid = reach + 22;
  const lean = slid + 6;
  const dadPose = (tt: number) => ({
    expr: tt < f06 - 4 ? ("calm" as const) : tt < to("s05") ? ("softSmile" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(D_DAD),
    lean: keys(tt, [[lean, 0], [lean + 22, 11]]),
    turnBody: keys(tt, [[f06 - 10, 0.6], [f06, 0.9]]),
    armL: { target: keysV(tt, [[0, onTable(D_DAD.x - 0.13 * D_DAD.h, -4)], [lean + 4, onTable(D_DAD.x - 0.13 * D_DAD.h, -4)], [lean + 24, onTable(D_DAD.x - 0.2 * D_DAD.h, -4)]]), shape: "relax" as const, elbow: "down" as const, behind: false },
    // правая рука: к телефону → отодвигает его в сторону экраном вниз
    armR: { target: keysV(tt, [[0, onTable(D_DAD.x + 0.13 * D_DAD.h, -4)], [reach - 8, onTable(D_DAD.x + 0.13 * D_DAD.h, -4)], [reach, { x: D_PHONE.x - 6, y: D_PHONE.y - 10 }], [slid, { x: D_PHONE_AWAY.x - 6, y: D_PHONE_AWAY.y - 10 }], [slid + 16, onTable(D_DAD.x + 0.1 * D_DAD.h, -4)]], anticipate), shape: tt > reach - 4 && tt < slid + 4 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    // взгляд: на сына; на телефон — только коротким движением руки, глаза остаются на сыне
    lookY: keys(tt, [[0, 0.45], [f06 - 14, 0.45], [f06 - 4, 0.2]]),
    lookX: keys(tt, [[f06 - 14, 0], [f06 - 2, -0.45]]),
    nod: keys(tt, [[to("s05") + 4, 0], [to("s05") + 12, 3], [to("s05") + 22, 0]]),
  });
  const dadFace = (tt: number) => keys(tt, [[0, 0], [f06 - 14, 0], [f06 - 2, -0.9]]);
  const boyPose = (tt: number) => ({
    expr: tt < s05 - 6 ? ("calm" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(D_BOY),
    armL: { target: onTable(D_BOY.x - 0.14 * D_BOY.h, -4), shape: "relax" as const, elbow: "down" as const },
    // после ответа — начинает рассказывать руками
    armR: { target: keysV(tt, [[0, onTable(D_BOY.x + 0.14 * D_BOY.h, -4)], [to("s05") + 4, onTable(D_BOY.x + 0.14 * D_BOY.h, -4)], [to("s05") + 18, { x: D_BOY.x + 0.24 * D_BOY.h, y: D_BOY.y - 0.62 * D_BOY.h }], [to("s05") + 60, { x: D_BOY.x + 0.22 * D_BOY.h, y: D_BOY.y - 0.66 * D_BOY.h }]], anticipate), shape: tt > to("s05") + 8 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    lookY: keys(tt, [[0, 0.45], [f06 + 4, 0.45], [f06 + 14, 0]]),
  });
  const boyFace = (tt: number) => keys(tt, [[0, 0.1], [f06 + 4, 0.1], [f06 + 14, 0.55]]);
  const momPose = () => ({
    expr: "softSmile" as const,
    sit: 1,
    seat: seatOf(D_MOM),
    armL: { target: onTable(D_MOM.x - 0.12 * D_MOM.h, -4), shape: "relax" as const, elbow: "down" as const },
    armR: { target: onTable(D_MOM.x + 0.12 * D_MOM.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: 0.2,
  });
  const cam = { x: keys(f, [[0, 1010], [f06, 1080], [lean + 30, 1130]]), y: keys(f, [[0, 1090], [lean + 30, 1070]]), zoom: keys(f, [[0, 0.98], [f06, 1.12], [lean + 30, 1.32]]) };
  const awayU = clamp((f - reach) / (slid - reach));
  return (
    <PanelArea>
      <Stage cam={cam} bg="#2B2233">
        <HomeBack minutes={19 * 60 + 5 + f / 300} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={D_MOM.x} evening={1} />
        <ChairBack x={D_BOY.x} evening={1} />
        <ChairBack x={D_DAD.x} evening={1} />
        <Actor uid="d11-mom" look="mom" f={f} place={() => D_MOM} face={() => 0.45} pose={momPose} seed={1} />
        <Actor uid="d11-boy" look="boyHome" f={f} place={() => D_BOY} face={boyFace} pose={boyPose} role="son" seed={4} />
        <Actor uid="d11-dad" look="dad" f={f} place={() => D_DAD} face={dadFace} pose={dadPose} role="father" seed={2} />
        <TableFront evening={1} />
        <Teapot x={820} y={HOME.table.top + 18} s={0.8} />
        <PlateOnTable x={D_MOM.x} y={HOME.table.top + 22} eaten={0.3} />
        <PlateOnTable x={D_BOY.x} y={HOME.table.top + 22} eaten={0.4} />
        <PlateOnTable x={D_DAD.x - 20} y={HOME.table.top + 22} eaten={0.4} />
        <PhoneOnDesk x={D_PHONE.x + (D_PHONE_AWAY.x - D_PHONE.x) * awayU} y={D_PHONE.y} caseColor={WORK_PHONE} faceDown={f > reach + 10} rot={-4 * awayU} />
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
  return (
    <div style={box({ inset: 0, fontFamily, background: `radial-gradient(circle at 50% 38%, rgba(255,196,107,0.16), transparent 55%), ${C.bg}` })}>
      <div style={box({ left: 70, right: 70, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, textAlign: "center" })}>
        <div style={item(0)}>
          <Logo size={230} />
        </div>
        <div style={{ ...item(1), fontSize: 128, fontWeight: 900, color: C.yellow, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(2), fontSize: 60, fontWeight: 800, color: C.text }}>{t.tagline}</div>
        <div style={{ ...item(3), marginTop: 18, padding: "28px 56px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 60, fontWeight: 900, color: "#14285A", boxShadow: "0 16px 40px rgba(255,211,61,0.28)" }}>{t.call}</div>
        <div style={{ ...item(4), fontSize: 46, fontWeight: 800, color: C.blue }}>{t.link}</div>
        <div style={{ ...item(5), marginTop: 26, padding: "26px 40px", borderRadius: 28, border: `3px solid ${C.line}`, backgroundColor: "rgba(16,34,57,0.85)", fontSize: 64, fontWeight: 900, color: C.text, whiteSpace: "nowrap", letterSpacing: 1 }}>{t.whatsapp}</div>
      </div>
    </div>
  );
};
