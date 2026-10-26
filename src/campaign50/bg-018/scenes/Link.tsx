// Сцена 4: решение героини. Мама сама набирает в семейном чате сообщение
// и отправляет ссылку-описание «как работает мектепке каттам» (без бренда
// и без выдуманных уведомлений). Карточка ссылки перелетает в телефон
// папы (match cut). Папа: «Көрөлү, бул кызмат кандай иштейт экен.» —
// и открывает её касанием: страница вырастает из его телефона, на ней
// полный маршрут ҮЙ → МЕКТЕП → ҮЙ. Только после этого появляется BalaGo.
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Actor, atBody, type Place } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { beatsOf } from "../beats";
import { useLine, useSceneFrames, useTimeline } from "../context";
import { RouteLine, RouteMap } from "../route";
import { ADULT_H, deskTop, FLOOR, MomBack, OfficeBack, OfficeChair, OfficeDesk, Panel, seatHeight, WoodChair } from "../sets";
import { abs, Avatar, Bubble, C, clamp, font, LinkIcon, pop, SoftBackdrop } from "../ui";
import { ChatHeader } from "./Hook";

const MOM: Place = { x: 540, y: FLOOR, h: ADULT_H };
const DAD: Place = { x: 540, y: FLOOR, h: ADULT_H };
const MSG = "Мына муну карап көрүңүзчү";

// Карточка ссылки (до открытия — без бренда).
export const LinkCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width: 560 * scale, borderRadius: 24 * scale, background: C.white, border: `${3 * scale}px solid rgba(22,52,107,0.12)`, overflow: "hidden" }}>
    <div style={{ height: 150 * scale, background: "linear-gradient(135deg, #EAF2FB, #FFF1C2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * scale, ...font(40 * scale, 1000, C.navy) }}>
      <span>ҮЙ</span>
      <span style={{ color: "#E0A800" }}>→</span>
      <span>МЕКТЕП</span>
      <span style={{ color: "#E0A800" }}>→</span>
      <span>ҮЙ</span>
    </div>
    <div style={{ padding: `${16 * scale}px ${22 * scale}px`, display: "flex", gap: 14 * scale, alignItems: "center" }}>
      <LinkIcon size={40 * scale} />
      <div>
        <div style={font(30 * scale, 900, C.ink)}>Мектепке каттам кантип иштейт?</div>
        <div style={font(22 * scale, 700, C.grey)}>маршрут жана шарттар</div>
      </div>
    </div>
  </div>
);

export const LinkScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { len } = useSceneFrames("link");
  const b = beatsOf(tl).link;
  const f02 = useLine("f02");
  const n03 = useLine("n03");

  const typed = Math.round(interpolate(f, [b.typeFrom, b.send - 4], [0, MSG.length], clamp));
  const sentP = pop(f, b.send);
  const flyU = interpolate(f, [b.fly, b.arrive], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const dadShot = f >= b.fly + 10;

  // мама печатает большими пальцами
  const momThumb = (t: number) => (t < b.send ? Math.sin(t * 1.9) * 6 : 0);
  const momPose = (t: number) => ({
    expr: t < b.send ? ("thinking" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatHeight(),
    lookY: 0.55,
    armL: { target: { x: atBody(MOM, -30, -540).x, y: atBody(MOM, -30, -540).y + momThumb(t) }, shape: "phone" as const, item: "phone" as const, glow: 1, flat: 0.35, itemTilt: 10, elbow: "hang" as const, behind: false },
    armR: { target: { x: atBody(MOM, 30, -540).x, y: atBody(MOM, 30, -540).y - momThumb(t) }, shape: "point" as const, elbow: "hang" as const, behind: false },
  });

  // папа держит телефон, читает, отвечает, касается ссылки
  const dadHold = atBody(DAD, 40, -560);
  const tapPt = atBody(DAD, 20, -580);
  const dadPose = (t: number) => ({
    expr: t < f02.from ? ("thinking" as const) : t < b.tap ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatHeight(),
    lean: 4,
    lookY: 0.5,
    nod: keys(t, [[f02.from, 0], [f02.from + 8, 3], [f02.from + 18, 0]]),
    armR: { target: dadHold, shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: -6, elbow: "hang" as const, behind: false },
    armL: {
      target: keysV(t, [[0, { x: DAD.x - 150, y: deskTop() - 4 }], [b.tap - 12, { x: DAD.x - 150, y: deskTop() - 4 }], [b.tap, tapPt], [b.tap + 10, tapPt], [b.tap + 24, { x: DAD.x - 150, y: deskTop() - 4 }]], anticipate),
      shape: t > b.tap - 14 && t < b.tap + 14 ? ("point" as const) : ("relax" as const),
      elbow: "down" as const,
      behind: false,
    },
  });

  // страница вырастает из телефона папы
  const openU = interpolate(f, [b.tap + 2, b.open], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const brandP = pop(f, b.brand - 4, 13);
  const routeU = interpolate(f, [b.open, len - 6], [0, 1], clamp);

  return (
    <>
      <SoftBackdrop f={f} />
      {/* семейный чат: сообщение мамы и ссылка */}
      <div style={abs({ left: 50, right: 50, top: 70, height: 900, borderRadius: 40, background: C.white, boxShadow: "0 14px 40px rgba(22,52,107,0.14)", overflow: "hidden" })}>
        <div style={abs({ left: 20, right: 20, top: 20 })}>
          <ChatHeader scale={0.85} />
        </div>
        <div style={abs({ left: 30, right: 30, top: 170, opacity: 0.55 })}>
          <Bubble who="dad" side="left" text="Бир аздан кийин тактайын." time="08:12" scale={0.95} />
        </div>
        {f >= b.send ? (
          <div style={abs({ right: 30, top: 340, opacity: Math.min(1, sentP * 1.4), transform: `scale(${0.85 + 0.15 * sentP})`, transformOrigin: "100% 0" })}>
            <Bubble who="mom" side="right" text={MSG} time="08:14" scale={1}>
              <div style={{ marginTop: 12, opacity: 1 - flyU * 0.6 }}>
                <LinkCard scale={0.95} />
              </div>
            </Bubble>
          </div>
        ) : null}
        {/* строка ввода */}
        <div style={abs({ left: 24, right: 24, bottom: 24, height: 96, borderRadius: 48, background: "#F1F4F9", display: "flex", alignItems: "center", padding: "0 30px", gap: 16 })}>
          <LinkIcon size={36} color={C.grey} />
          <div style={font(34, 700, f < b.send ? C.ink : C.grey)}>
            {f < b.send ? MSG.slice(0, typed) : "Билдирүү…"}
            {f < b.send && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: C.navy }}>|</span> : null}
          </div>
        </div>
      </div>
      {/* нижнее окно: мама печатает → папа в офисе */}
      <Panel top={1000} height={520} left={50} width={980} radius={36} cam={{ x: 540, y: 520, zoom: 1.15 }} style={{ boxShadow: "0 12px 30px rgba(22,52,107,0.16)" }}>
        {dadShot ? (
          <>
            <OfficeBack f={f} />
            <OfficeChair x={DAD.x} />
            <Actor uid="c4-dad" look="dad" f={f} place={() => DAD} face={() => 0.05} pose={dadPose} role="father" seed={2} layer="body" />
            <OfficeDesk x={DAD.x} />
            <Actor uid="c4-dad" look="dad" f={f} place={() => DAD} face={() => 0.05} pose={dadPose} role="father" seed={2} layer="arms" />
          </>
        ) : (
          <>
            <MomBack f={f} />
            <WoodChair x={MOM.x} />
            <Actor uid="c4-mom" look="mom" f={f} place={() => MOM} face={() => 0} pose={momPose} role="mother" seed={1} />
          </>
        )}
      </Panel>
      <div style={abs({ left: 78, top: 1024, padding: "8px 20px", borderRadius: 30, background: "rgba(255,255,255,0.92)", ...font(28, 900, dadShot ? C.dadInk : C.momInk) })}>{dadShot ? "Ата · жумушта" : "Апа"}</div>
      {/* карточка летит в телефон папы */}
      {f >= b.fly && f < b.tap + 4 ? (
        <div
          style={abs({
            left: interpolate(flyU, [0, 1], [400, 600]),
            top: interpolate(flyU, [0, 1], [560, 1270]),
            transform: `scale(${interpolate(flyU, [0, 1], [0.95, 0.42])}) rotate(${interpolate(flyU, [0, 0.5, 1], [0, -6, 0])}deg)`,
            transformOrigin: "0 0",
            boxShadow: "0 16px 40px rgba(22,52,107,0.25)",
            borderRadius: 24,
          })}
        >
          <LinkCard />
        </div>
      ) : null}
      {/* открытая страница */}
      {openU > 0 ? (
        <div
          style={abs({
            inset: 0,
            background: C.white,
            clipPath: `circle(${interpolate(openU, [0, 1], [3, 160])}% at 62% 72%)`,
          })}
        >
          <SoftBackdrop f={f} tint="#FFFFFF" />
          <div style={abs({ left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 })}>
            <div style={{ height: 330, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {f >= b.brand - 4 ? (
                <Img src={staticFile("assets/logo.png")} style={{ width: 330, height: 330, transform: `scale(${brandP})`, opacity: Math.min(1, brandP * 1.4) }} />
              ) : (
                <div style={{ width: 220, height: 220, borderRadius: 220, background: "#EAF2FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LinkIcon size={110} />
                </div>
              )}
            </div>
            <div style={{ ...font(54, 1000, C.navy), textAlign: "center", padding: "0 60px" }}>
              {f >= b.brand ? "Бишкектеги балдар үчүн алдын ала уюштурулган каттам" : "Мектепке каттам кантип иштейт?"}
            </div>
            <div style={{ height: 10 }} />
            <RouteMap progress={routeU} scale={1.02} />
            <div style={{ height: 6 }} />
            <RouteLine size={60} />
          </div>
          {/* кто открыл: папа (маленький значок) */}
          <div style={abs({ left: 60, top: 60, display: "flex", alignItems: "center", gap: 14, opacity: interpolate(f, [n03.from + 20, n03.from + 34], [1, 0], clamp) })}>
            <Avatar who="dad" size={56} />
            <div style={font(28, 800, C.dadInk)}>Ата шилтемени ачты</div>
          </div>
        </div>
      ) : null}
    </>
  );
};
