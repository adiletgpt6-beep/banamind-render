// Сцена 1 (хук): офис в Бишкеке, утро. Отец за рабочим столом держит
// телефон — экран пустой, никакой карты с «волшебной» точкой. Над ним
// проявляются три вопросительных знака; крупно «БАЛАМ АЗЫР КАЙДА?», затем
// честный вопрос «Кантип кабар алам?». Камера медленно приближается.
import { interpolate, useCurrentFrame } from "remotion";
import { Actor, atBody, type Place } from "../../../two-schedules-2d/rig/Actor";
import { keys } from "../../../two-schedules-2d/rig/motion";
import { appear, easeInOut, easeOut } from "../anim";
import { useScene, useWordStarting } from "../context";
import { C } from "../palette";
import { abs, font, IconPin } from "../parts";
import { BG26_TEXT } from "../script";
import { ADULT_H, deskTop, DeskLamp, FLOOR, LaptopFront, OfficeChair, OfficeDesk, OfficeRoom, seatHeight, World } from "../sets";

const DAD: Place = { x: 430, y: FLOOR, h: ADULT_H };

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const ask = useWordStarting("f01", "кантип");
  const t = BG26_TEXT.hook;

  const push = easeInOut(f / Math.max(1, frames - 1));
  const cam = { x: 455 + 6 * push, y: 470 + 8 * push, zoom: 2.2 + 0.18 * push };

  const hold = atBody(DAD, 120, -440);
  const dadPose = () => ({
    expr: "worried" as const,
    sit: 1,
    seat: seatHeight(),
    lean: 4,
    lookY: keys(f, [
      [0, 0.5],
      [ask - 6, 0.5],
      [ask + 8, 0.25],
    ]),
    headTilt: keys(f, [
      [0, 0],
      [ask, 0],
      [ask + 10, -5],
    ]),
    armR: { target: hold, shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: -20, elbow: "hang" as const, behind: false },
    armL: { target: { x: DAD.x - 40, y: deskTop() - 6 }, shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  const face = () => keys(f, [
    [0, 0.18],
    [ask, 0.18],
    [ask + 10, 0.02],
  ]);

  const qs = [
    { x: 150, y: 660, at: 6, r: -10, s: 0.95 },
    { x: 860, y: 810, at: 14, r: 8, s: 1.05 },
    { x: 890, y: 1130, at: 22, r: -4, s: 0.9 },
  ];
  const titleIn = appear(f, -8, 9);
  const askIn = appear(f, ask - 3, 10);

  return (
    <>
      <World cam={cam}>
        <OfficeRoom light={0.05 * push} />
        <OfficeChair x={DAD.x} />
        <Actor uid="h-dad" look="dad" f={f} place={() => DAD} face={face} pose={dadPose} role="father" seed={3} layer="body" />
        <OfficeDesk x={DAD.x + 90} />
        <LaptopFront x={DAD.x + 150} w={290} hk={0.5} />
        <DeskLamp x={DAD.x + 560} />
        <Actor uid="h-dad" look="dad" f={f} place={() => DAD} face={face} pose={dadPose} role="father" seed={3} layer="arms" />
      </World>
      {/* три вопросительных знака */}
      {qs.map((q, i) => {
        const p = appear(f, q.at, 10);
        const bob = Math.sin((f + i * 20) / 14) * 8;
        return (
          <div
            key={i}
            style={abs({
              left: q.x - 60 * q.s,
              top: q.y - 60 * q.s + bob,
              width: 120 * q.s,
              height: 120 * q.s,
              borderRadius: 60 * q.s,
              background: C.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: p,
              transform: `scale(${0.4 + 0.6 * easeOut(p)}) rotate(${q.r}deg)`,
              boxShadow: "0 10px 24px rgba(255,170,0,0.35)",
              ...font(86 * q.s, 1000, C.navy),
            })}
          >
            ?
          </div>
        );
      })}
      {/* экран телефона отца крупно: блокировка, новых сообщений нет */}
      <div style={abs({ left: 56, top: 930, width: 270, height: 470, opacity: appear(f, 10, 10), transform: `translateY(${(1 - appear(f, 10, 10)) * 30}px) rotate(-3deg)` })}>
        <div style={abs({ inset: 0, borderRadius: 40, background: "#1D2233", boxShadow: "0 18px 40px rgba(20,30,60,0.3)" })} />
        <div style={abs({ left: 10, top: 10, right: 10, bottom: 10, borderRadius: 32, overflow: "hidden", background: "linear-gradient(180deg, #2B3B6A, #5C7FC7)" })}>
          <div style={abs({ left: 0, right: 0, top: 60, textAlign: "center", ...font(76, 800, "#FFFFFF") })}>{t.lockTime}</div>
          <div style={abs({ left: 18, right: 18, top: 190, padding: "16px 10px", borderRadius: 20, background: "rgba(255,255,255,0.18)", textAlign: "center", ...font(26, 900, "#FFFFFF") })}>{t.noNews}</div>
        </div>
      </div>
      {/* заголовок */}
      <div style={abs({ left: 60, right: 60, top: 256, display: "flex", flexDirection: "column", alignItems: "center", opacity: titleIn, transform: `translateY(${(1 - titleIn) * -30}px)` })}>
        <div
          style={{
            padding: "14px 34px 18px",
            borderRadius: 30,
            background: "rgba(255,255,255,0.94)",
            boxShadow: "0 14px 34px rgba(20,40,90,0.18)",
            textAlign: "center",
            ...font(96, 1000, C.navy),
            lineHeight: 1.02,
          }}
        >
          {t.title.split(" ").slice(0, 2).join(" ")}
          <br />
          <span style={{ background: C.yellow, padding: "0 18px", borderRadius: 16 }}>{t.title.split(" ").slice(2).join(" ")}</span>
        </div>
        <div
          style={{
            marginTop: 18,
            padding: "12px 30px",
            borderRadius: 999,
            background: C.navy,
            opacity: askIn,
            transform: `scale(${0.8 + 0.2 * askIn})`,
            ...font(50, 900, "#FFFFFF"),
          }}
        >
          {t.question}
        </div>
      </div>
      {/* город — деликатной подписью у окна */}
      <div
        style={abs({
          right: 170,
          top: 640,
          padding: "8px 22px 8px 14px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.92)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: interpolate(f, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          ...font(34, 900, C.navy),
        })}
      >
        <IconPin s={34} color="#D9473A" />
        {t.city}
      </div>
    </>
  );
};
