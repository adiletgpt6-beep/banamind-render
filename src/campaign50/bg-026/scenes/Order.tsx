// Сцена 5: снова офис сбоку. Отец (уже спокойный, с лёгкой улыбкой) кладёт
// телефон на стол и возвращается к работе за ноутбуком. Сверху — честная
// вставка: всё это работает только по порядку «ылайыктуу топ → толук сыноо
// (биринчиси акысыз) → улантуу — сиздин чечим», и только после этого —
// WhatsApp-группа. Бейдж «Шарттуу мисал» остаётся: история отца — пример.
import { interpolate, useCurrentFrame } from "remotion";
import { Actor, atBody, type Place } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { appear, easeInOut } from "../anim";
import { useScene, useWordStarting } from "../context";
import { C } from "../palette";
import { abs, font } from "../parts";
import { BG26_TEXT } from "../script";
import { ADULT_H, deskTop, DeskLamp, FLOOR, LaptopFront, OfficeChair, OfficeDesk, OfficeRoom, PhoneOnDesk, seatHeight, World } from "../sets";

const DAD: Place = { x: 430, y: FLOOR, h: ADULT_H };
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const orderBeats = () => ({ down: 30, onDesk: 52, pull: 56, typing: 76 });

export const OrderScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const b = orderBeats();
  const w1 = useWordStarting("n05", "топ");
  const w2 = useWordStarting("n05", "толук");
  const w3 = useWordStarting("n05", "улантсаңыз");
  const w4 = useWordStarting("n05", "түшүнүктүү");
  const t = BG26_TEXT.order;

  const pull = easeInOut(f / Math.max(1, frames - 1));
  const cam = { x: 480 - 6 * pull, y: 438 + 6 * pull, zoom: 1.74 - 0.06 * pull };

  const hold = atBody(DAD, 120, -440);
  const deskPhone = { x: DAD.x - 60, y: deskTop() - 8 };
  // ноутбук подвигается к отцу, кисти — на клавиатуре за крышкой
  const lapX = interpolate(f, [b.pull, b.typing], [DAD.x + 520, DAD.x + 150], { ...CL, easing: easeInOut });
  const key = (k: number, side: number) => ({ x: DAD.x + 120 + side * 55 + Math.sin(f * 1.7 + k) * 6, y: deskTop() - 10 - Math.abs(Math.sin(f * 1.3 + k * 2)) * 6 });
  const typing = f >= b.typing;
  const dadPose = () => ({
    expr: f < b.onDesk ? ("softSmile" as const) : ("calm" as const),
    sit: 1,
    seat: seatHeight(),
    lean: typing ? 8 : 4,
    lookY: keys(f, [
      [0, 0.4],
      [b.onDesk, 0.45],
      [b.typing, 0.38],
    ]),
    armR: {
      target: typing ? key(1, 1) : keysV(f, [[0, hold], [b.down, hold], [b.onDesk, deskPhone], [b.pull, deskPhone], [b.typing, key(1, 1)]], anticipate),
      shape: typing ? ("relax" as const) : ("phone" as const),
      item: f < b.onDesk ? ("phone" as const) : ("none" as const),
      glow: f < b.onDesk ? 1 : 0,
      flat: interpolate(f, [b.down, b.onDesk], [0, 1], CL),
      itemTilt: -20,
      elbow: typing ? ("down" as const) : ("hang" as const),
      behind: false,
    },
    armL: { target: typing ? key(3, -1) : keysV(f, [[b.pull, { x: DAD.x - 40, y: deskTop() - 6 }], [b.typing, key(3, -1)]]), shape: "relax" as const, elbow: "down" as const, behind: false },
    nod: keys(f, [
      [b.onDesk, 0],
      [b.onDesk + 8, 3],
      [b.onDesk + 18, 0],
    ]),
  });
  const face = () => keys(f, [
    [0, 0.05],
    [b.onDesk, 0.15],
    [b.typing, 0.3],
  ]);

  const row = (i: number) => appear(f, [w1, w2, w3][i] - 2, 10);
  const note = appear(f, w4 - 6, 12);

  return (
    <>
      <World cam={cam}>
        <OfficeRoom light={0.8 + 0.2 * pull} />
        <OfficeChair x={DAD.x} />
        <Actor uid="o-dad" look="dad" f={f} place={() => DAD} face={face} pose={dadPose} role="father" seed={3} layer="body" />
        <OfficeDesk x={DAD.x + 90} />
        <DeskLamp x={DAD.x + 560} />
        {f >= b.onDesk ? <PhoneOnDesk x={deskPhone.x} glow={interpolate(f, [b.onDesk, b.onDesk + 30], [1, 0], CL)} /> : null}
        <Actor uid="o-dad" look="dad" f={f} place={() => DAD} face={face} pose={dadPose} role="father" seed={3} layer="arms" />
        <LaptopFront x={lapX} w={290} hk={0.5} />
      </World>
      {/* экран телефона в руке: последнее сообщение водителя */}
      <div style={abs({ left: 56, top: 1040, opacity: interpolate(f, [4, 12, b.onDesk - 8, b.onDesk], [0, 1, 1, 0], CL) })}>
        <div style={{ padding: "14px 22px", borderRadius: 22, background: "#FFFFFF", boxShadow: "0 12px 28px rgba(20,40,90,0.22)", borderLeft: `8px solid ${C.green}` }}>
          <div style={font(22, 900, "#C2571A")}>{BG26_TEXT.chat.driver}</div>
          <div style={font(36, 900, "#1E2A3A")}>{t.phoneNote}</div>
          <div style={font(20, 700, "#8A94A6")}>08:20</div>
        </div>
      </div>
      {/* честная вставка: порядок */}
      <div
        style={abs({
          left: 56,
          right: 150,
          top: 340,
          padding: "26px 30px 24px",
          borderRadius: 34,
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
          opacity: appear(f, 6, 12),
          transform: `translateY(${(1 - appear(f, 6, 12)) * -24}px)`,
        })}
      >
        <div style={{ ...font(40, 1000, C.navy), textAlign: "center" }}>{t.title}</div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {t.steps.map((s, i) => (
            <div
              key={s.k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "12px 16px",
                borderRadius: 20,
                background: i === 1 ? C.yellowSoft : "#F4F7FB",
                opacity: 0.35 + 0.65 * row(i),
                transform: `translateX(${(1 - row(i)) * -40}px)`,
              }}
            >
              <div style={{ width: 58, height: 58, borderRadius: 29, background: i === 2 ? C.green : C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...font(32, 1000, "#FFFFFF") }}>{s.k}</div>
              <div>
                <div style={font(36, 900, C.navy)}>{s.t}</div>
                <div style={font(32, 800, "#44557A")}>{s.s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, textAlign: "center", opacity: note, ...font(32, 900, C.chatHead) }}>{t.note}</div>
      </div>
    </>
  );
};
