// Сцена 14 (108–120 с): заявка, календарь, финал. Родители вместе у
// ноутбука; страница BalaGo «Алдын ала арыз» (нейтральная иллюстрация,
// без URL и выдуманных функций): маршрут «Мектеп → Үй» → «Арыз жөнөтүлдү».
// Перед сном отец открывает календарь: блок «Мектепке баруу» растёт с 11
// до 61 минуты — учитывает весь круг. Последние ≈ 5 с — спокойная
// читаемая финальная карточка: BalaGo, «Балдар үчүн такси», «Мектеп → Үй»,
// «Алдын ала арыз калтырыңыз», кнопка «Алдын ала арыз», «Толук маалымат —
// профилдеги шилтемеде».
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS } from "../../config";
import { fontFamily } from "../../fonts";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { EM2_TEXT } from "../script";
import { C } from "../theme";
import { Calendar, Panel } from "../graphics/Hud";
import { ChairBack, HOME, HomeBack, LaptopSide, TableFront, WarmLamp } from "../sets/Home";
import { PanelShot } from "../shots";
import { onTable, seated, seatOf } from "./common";
import { STAGE, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FINAL = { page: 40, fills: [52, 64, 76] as const, tap: 90, sent: 96, cal: 124, grow: [134, 166] as const, card: 214 };

const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile(ASSETS.logo)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover" }} />;

// Страница предварительной заявки (экран ноутбука, крупно).
const RequestPage: React.FC<{ f: number }> = ({ f }) => {
  const p = EM2_TEXT.page;
  const press = interpolate(f, [FINAL.tap - 3, FINAL.tap, FINAL.tap + 6], [1, 0.95, 1], CL);
  const sent = easeOut((f - FINAL.sent) / 10);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA", fontFamily, color: "#14285A" })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 120, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, padding: "0 36px", boxShadow: "0 4px 14px rgba(20,30,60,0.08)" })}>
        <Logo size={84} />
        <div>
          <div style={{ fontSize: 46, fontWeight: 900 }}>{p.brand}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#5A6B8C" }}>{p.tagline}</div>
        </div>
      </div>
      <div style={box({ left: 40, top: 150, fontSize: 52, fontWeight: 900 })}>{p.title}</div>
      {p.fields.map(([label, value], i) => {
        const typed = clamp((f - FINAL.fills[i]) / 10);
        return (
          <div key={label} style={box({ left: 40, right: 40, top: 240 + i * 128, display: "flex", flexDirection: "column", gap: 6 })}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
            <div style={{ height: 74, borderRadius: 16, backgroundColor: "#FFFFFF", border: `3px solid ${typed > 0 && typed < 1 ? C.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 36, fontWeight: 800 }}>{value.slice(0, Math.round(value.length * typed))}</div>
          </div>
        );
      })}
      <div style={box({ left: 40, right: 40, top: 640, padding: "22px 0", borderRadius: 999, backgroundColor: C.yellow, fontSize: 40, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - sent })}>{p.send}</div>
      <div style={box({ left: 40, right: 40, top: 620, padding: "26px", borderRadius: 24, backgroundColor: "#FFFFFF", border: "4px solid #3E8E5E", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: sent, scale: `${0.96 + 0.04 * sent}` })}>
        <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 42, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
        <div style={{ fontSize: 44, fontWeight: 900 }}>{p.sent}</div>
      </div>
    </div>
  );
};

// Финальная карточка (тёмная, спокойная, всё на месте за ≈ 0,6 с).
const FinalCard: React.FC<{ f: number }> = ({ f }) => {
  const t = EM2_TEXT.cta;
  const a = (k: number) => easeOut((f - FINAL.card - k) / 9);
  const item = (k: number): React.CSSProperties => ({ opacity: a(k), translate: `0 ${(1 - a(k)) * 18}px` });
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1240, fontFamily })}>
      <div style={box({ left: 140, top: 160, width: 800, height: 800, borderRadius: 400, background: "radial-gradient(circle, rgba(79,209,197,0.16), rgba(255,196,107,0.06) 50%, transparent 70%)" })} />
      <div style={box({ left: 70, right: 70, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, textAlign: "center" })}>
        <div style={item(0)}>
          <Logo size={230} />
        </div>
        <div style={{ ...item(2), fontSize: 120, fontWeight: 900, color: C.yellow, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(4), fontSize: 58, fontWeight: 800, color: C.text }}>{t.tagline}</div>
        <div style={{ ...item(6), padding: "12px 36px", borderRadius: 999, border: `3px solid ${C.yellow}`, fontSize: 50, fontWeight: 900, color: C.text }}>{t.route}</div>
        <div style={{ ...item(8), fontSize: 50, fontWeight: 800, color: C.text, marginTop: 6 }}>{t.call}</div>
        <div style={{ ...item(10), padding: "26px 74px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 58, fontWeight: 900, color: "#14285A", boxShadow: "0 16px 40px rgba(255,211,61,0.3)" }}>{t.button}</div>
        <div style={{ ...item(12), fontSize: 38, fontWeight: 700, color: C.dim }}>{t.link}</div>
      </div>
    </div>
  );
};

export const FinalScene: React.FC = () => {
  const { f } = useScene("final");
  const dad = seated("dad", HOME.seat.dad);
  const mom = seated("mom", HOME.seat.mom);
  const grow = easeInOut(clamp((f - FINAL.grow[0]) / (FINAL.grow[1] - FINAL.grow[0])));
  const schoolMin = 11 + 50 * grow;
  const pose = (p: typeof dad, side: 1 | -1) => () => ({
    expr: "softSmile" as const,
    sit: 1,
    seat: seatOf(p),
    lean: 6,
    armL: { target: onTable(p.x - 0.12 * p.h, -4), shape: "relax" as const, elbow: "down" as const },
    armR: { target: onTable(p.x + 0.12 * p.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: 0.4,
    lookX: side * 0.3,
  });
  const fadeCard = easeOut((f - FINAL.card) / 10);
  return (
    <>
      <PanelShot f={f} from={0} to={FINAL.page} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={{ x: 1110, y: 1060, zoom: 1.5 + f * 0.002 }} bg="#2B2233">
        <HomeBack minutes={20 * 60 + 40} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={mom.x} evening={1} />
        <ChairBack x={dad.x} evening={1} />
        <Actor uid="f14-mom" look="mom" f={f} place={() => mom} face={() => 0.35} pose={pose(mom, 1)} role="mother" seed={1} />
        <Actor uid="f14-dad" look="dad" f={f} place={() => dad} face={() => -0.35} pose={pose(dad, -1)} role="father" seed={2} />
        <TableFront evening={1} />
        <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      </PanelShot>
      {f >= FINAL.page && f < FINAL.cal ? (
        <div style={box({ left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, borderRadius: 28, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #1B2433, #080C13)" })}>
          <div style={box({ left: 40, top: 120, width: 860, height: 820, borderRadius: 26, backgroundColor: "#2A2F3A", padding: 20, boxSizing: "border-box" })}>
            <div style={box({ left: 20, top: 20, right: 20, bottom: 20, borderRadius: 12, overflow: "hidden" })}>
              <RequestPage f={f} />
            </div>
          </div>
          <div style={box({ left: 10, top: 940, width: 920, height: 50, borderRadius: "0 0 26px 26px", backgroundColor: "#3A4152" })} />
        </div>
      ) : null}
      {f >= FINAL.cal && f < FINAL.card + 10 ? (
        <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} opacity={1 - fadeCard}>
          <Calendar w={STAGE.w} h={STAGE.h} mode="dad" schoolMin={schoolMin} appear={1} highlight={grow > 0 && grow < 1 ? 1 : 0.4} />
        </Panel>
      ) : null}
      {f >= FINAL.card ? <FinalCard f={f} /> : null}
    </>
  );
};
