// Сцена 11 «balago» (N07). «Алар мектептен үйгө туруктуу алып келе турган
// кызмат издешти.» — родители у ноутбука (на экране — две карточки задач),
// мама ищет. «BalaGo тууралуу маалыматты окуп, маршрутту сүйлөшүү үчүн алдын
// ала өтүнмө калтырышты.» — экран ноутбука раскрывается во весь кадр:
// страница BalaGo (Бишкек, ҮЙ → МЕКТЕП → ҮЙ, «Баланы каттоо»), затем панель
// запроса семьи МЕКТЕП → ҮЙ, «Маршрутту талкуулоо», нажатие «Алдын ала
// өтүнмө» и спокойное «Өтүнмө калтырылды» (только предварительное обращение:
// без подтверждения, оплаты, цены и водителя). «Үйдө уулун бала багуучу
// тосуп алмак.» — камера входит в схему маршрута: в светлом окне дома —
// няня и малышка.
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { Backdrop, box, camMove, Shot, type Cam, useScene } from "../kit";
import { LAPTOP_DESIGN, laptopScreenQuad, ScreenIn, type Pt, type Quad } from "../props/Laptop";
import { RouteScheme, routeSchemeHeight } from "../ui/RouteScheme";
import { SITE, SITE_BUTTONS, SiteScreen } from "../ui/SiteScreen";
import { LIVING } from "../sets/Living";
import { RADIUS, SAFE, SHADOW } from "../theme";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { MOM_DESK, toScreen, typingPose } from "./AdDesk";
import { CAM_SCREEN, DAD_TABLE, LaptopSplit } from "./Split";
import { Room } from "./Room";

const L = LIVING;
// Страница во весь кадр: масштаб 0,94, верх — на SAFE.top, по центру.
const FULL = { s: 0.94, top: SAFE.top, left: (SAFE.left + SAFE.right) / 2 - (SITE.w * 0.94) / 2 } as const;
// Колонка страницы на экране ноутбука (LAPTOP_DESIGN, по высоте экрана).
const COL_S = LAPTOP_DESIGN.h / SITE.h;
const COL_X = (LAPTOP_DESIGN.w - SITE.w * COL_S) / 2;
// Схема запроса семьи внутри страницы (px макета SiteScreen).
const SITE_SCHEME = { x: 80, y: 626, w: 720 } as const;
// Схема крупно (экранные px).
const SCHEME = { x: 70, w: 940 } as const;
const SCHEME_H = routeSchemeHeight("family", SCHEME.w);
const SCHEME_Y = 960 - SCHEME_H / 2 - 40;
// Светлое окно с няней и малышкой (единицы viewBox схемы «family»).
const LIT_WINDOW = { x: 868, y: 334 } as const;

export const balagoPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "balago");
  const type0 = T.from("N07") + 2;
  const type1 = T.word("N07", "кызмат");
  const push0 = T.wordEnd("N07", "издешти") - 30;
  const site0 = push0 + 18; // на экране — страница BalaGo
  const push1 = push0 + 28;
  const into1 = push1 + 16; // экран → во весь кадр
  const request0 = T.word("N07", "маршрутту") - 2;
  const request1 = request0 + 30;
  const cursor0 = request1 - 6;
  const cursor1 = T.word("N07", "өтүнмө") - 4;
  const press0 = T.word("N07", "өтүнмө");
  const sent0 = T.word("N07", "калтырышты");
  const zoom0 = T.word("N07", "Үйдө") + 4; // в схему маршрута
  const zoom1 = zoom0 + 24;
  const win0 = Math.max(T.word("N07", "бала"), zoom1); // к светлому окну
  return { type0, type1, push0, site0, push1, into1, request0, request1, cursor0, cursor1, press0, sent0, zoom0, zoom1, win0, len: T.len };
};

const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export const BalagoScene: React.FC = () => {
  const { f, tl } = useScene("balago");
  const P = balagoPlan(tl);
  const stage = clamp((f - P.site0) / 64);
  const request = clamp((f - P.request0) / (P.request1 - P.request0));
  const press = clamp((f - P.press0) / 14);
  const sent = clamp((f - P.sent0) / 22);
  const b = SITE_BUTTONS.request;
  const cm = easeInOut(clamp((f - P.cursor0) / (P.cursor1 - P.cursor0)));
  const cursor = {
    x: lerp(700, b.cx + 250, cm),
    y: lerp(820, b.cy + 12, cm),
    visible: clamp((f - P.cursor0 + 6) / 6) * (1 - clamp((f - P.sent0 - 16) / 10)),
    click: clamp((f - P.press0) / 14),
  };
  const site = (chrome = true) => <SiteScreen stage={stage} request={request} press={press} sent={sent} cursor={f >= P.cursor0 - 6 ? cursor : undefined} chrome={chrome} />;
  const dadPose = (t: number): PoseIn => ({
    expr: "calm",
    lean: 8,
    lookY: 0.34,
    nod: keys(t, [[P.type1 - 30, 0], [P.type1 - 22, 4], [P.type1 - 12, 0]]),
    armL: { target: { x: DAD_TABLE.x + 40, y: L.table.top - 12 }, shape: "relax", elbow: "down" },
    armR: { target: { x: DAD_TABLE.x + 120, y: L.table.top - 14 }, shape: "relax", elbow: "down", behind: false },
  });
  const momPose = (t: number): PoseIn => typingPose(t, t > P.type0 && t < P.type1 ? 1 : 0, { expr: "calm", lookY: 0.32 });
  const dad = <Actor uid="s11-dad" look="dad" f={f} place={() => DAD_TABLE} face={() => 0.72} pose={dadPose} seed={2} />;
  const mom = (layer: "body" | "arms") => <Actor uid="s11-mom" look="mom" f={f} place={() => MOM_DESK} face={() => -0.74} pose={momPose} seed={1} layer={layer} />;
  const screen = f < P.site0 ? <LaptopSplit /> : <LaptopSite>{site(false)}</LaptopSite>;
  const camA: Cam = f < P.push0 ? camMove(f, 0, P.push0, { x: 990, y: 1062, zoom: 1.5 }, { x: 970, y: 1075, zoom: 1.62 }) : camMove(f, P.push0, P.push1, { x: 970, y: 1075, zoom: 1.62 }, { ...CAM_SCREEN, x: 897, y: 1128, zoom: 3.2 });
  const room = (scr: React.ReactNode, cam: Cam) => (
    <Shot f={f} cam={cam}>
      <Room laptop={{ screen: scr }} seated={dad} momBody={mom("body")} momArms={mom("arms")} />
    </Shot>
  );
  // колонка страницы на экране ноутбука → прямоугольник во весь кадр
  const into = easeInOut(clamp((f - P.push1) / (P.into1 - P.push1)));
  const lq = laptopScreenQuad(L.laptop.x, L.laptop.y);
  const u0 = COL_X / LAPTOP_DESIGN.w;
  const u1 = 1 - u0;
  const colWorld = [lerpPt(lq[0], lq[1], u0), lerpPt(lq[0], lq[1], u1), lerpPt(lq[3], lq[2], u1), lerpPt(lq[3], lq[2], u0)] as const;
  const camEnd: Cam = { ...CAM_SCREEN, x: 897, y: 1128, zoom: 3.2 };
  const colQ = colWorld.map((p) => toScreen(p, camEnd));
  const full = [
    { x: FULL.left, y: FULL.top },
    { x: FULL.left + SITE.w * FULL.s, y: FULL.top },
    { x: FULL.left + SITE.w * FULL.s, y: FULL.top + SITE.h * FULL.s },
    { x: FULL.left, y: FULL.top + SITE.h * FULL.s },
  ];
  const q = colQ.map((p, i) => lerpPt(p, full[i], into)) as unknown as Quad;
  // вход в схему: страница масштабируется так, что схема запроса ложится
  // в крупную схему; затем — сама схема (чётко) и приближение к окну
  const z = easeInOut(clamp((f - P.zoom0) / (P.zoom1 - P.zoom0)));
  const zs = SCHEME.w / SITE_SCHEME.w;
  const pageS = lerp(FULL.s, zs, z);
  const pageX = lerp(FULL.left, SCHEME.x - SITE_SCHEME.x * zs, z);
  const pageY = lerp(FULL.top, SCHEME_Y - SITE_SCHEME.y * zs, z);
  const schemeIn = clamp((f - P.zoom1 + 4) / 8);
  const win = easeInOut(clamp((f - P.win0) / 40));
  const wk = 1 + 1.5 * win;
  const wx = SCHEME.x + (LIT_WINDOW.x / 1000) * SCHEME.w;
  const wy = SCHEME_Y + (LIT_WINDOW.y / 1000) * SCHEME.w;
  // окно выходит к центру кадра
  const wtx = (560 - wx) * win;
  const wty = (900 - wy) * win;
  return (
    <>
      {/* родители ищут: мама печатает, папа смотрит в экран */}
      {f < P.push1 ? room(screen, camA) : null}
      {/* экран раскрывается в страницу во весь кадр (комната размывается) */}
      {f >= P.push1 && f < P.zoom1 + 4 ? (
        <>
          <div style={box({ inset: 0, filter: `blur(${7 * into}px)` })}>{room(<LaptopSite />, camMove(f, P.push1, P.into1, camEnd, { ...camEnd, zoom: 3.3 }))}</div>
          <div style={box({ inset: 0, backgroundColor: `rgba(247,245,239,${0.32 * into + 0.5 * z})` })} />
          {f < P.into1 ? (
            <ScreenIn quad={q} w={SITE.w} h={SITE.h}>
              {site()}
            </ScreenIn>
          ) : (
            <div
              style={box({
                left: pageX,
                top: pageY,
                width: SITE.w,
                height: SITE.h,
                transform: `scale(${pageS})`,
                transformOrigin: "0 0",
                borderRadius: RADIUS.card,
                overflow: "hidden",
                boxShadow: SHADOW.lift,
              })}
            >
              {site()}
            </div>
          )}
        </>
      ) : null}
      {/* схема маршрута крупно: дом, в светлом окне — няня и малышка */}
      {f >= P.zoom1 - 4 ? (
        <div style={box({ inset: 0, opacity: schemeIn })}>
          <Backdrop />
          <div style={box({ inset: 0, transformOrigin: `${wx}px ${wy}px`, transform: `translate(${wtx}px, ${wty}px) scale(${wk})` })}>
            <div style={box({ left: SCHEME.x, top: SCHEME_Y, width: SCHEME.w, height: SCHEME_H, borderRadius: 36, boxShadow: SHADOW.card })}>
              <RouteScheme mode="family" w={SCHEME.w} reveal={1} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

// Экран ноутбука: страница по высоте экрана, по бокам — фон браузера.
const LaptopSite: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: LAPTOP_DESIGN.w, height: LAPTOP_DESIGN.h, backgroundColor: "#ECE7DC" }}>
    {children ? (
      <div style={{ position: "absolute", left: COL_X, top: 0, width: SITE.w, height: SITE.h, transform: `scale(${COL_S})`, transformOrigin: "0 0" }}>{children}</div>
    ) : null}
  </div>
);

// Экран ноутбука после заявки (сц. 12): та же страница, заявка оставлена.
export const LaptopSiteSent: React.FC = () => (
  <LaptopSite>
    <SiteScreen stage={1} request={1} press={1} sent={1} chrome={false} />
  </LaptopSite>
);
