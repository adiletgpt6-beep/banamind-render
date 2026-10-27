// Рабочий лист «Site» (№34): экран BalaGo, схема маршрута и финал.
//   0–60    SiteScreen: страница проявляется (во весь кадр);
//   60–120  панель запроса семьи въезжает;
//   120–180 курсор к «Алдын ала өтүнмө», нажатие;
//   180–200 «Өтүнмө калтырылды»;
//   236–248 RouteScheme «family» крупно (кадр 240);
//   250–300 CtaScreen по очереди (290 — финал).
import { useCurrentFrame } from "remotion";
import { Backdrop, box } from "../kit";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { C, RADIUS, SAFE, SHADOW } from "../theme";
import { CtaScreen } from "../ui/CtaScreen";
import { RouteScheme, routeSchemeHeight } from "../ui/RouteScheme";
import { SITE, SITE_BUTTONS, SiteScreen } from "../ui/SiteScreen";
import { DevSheet } from "./DevSheet";

// Страница во весь кадр: масштаб 0.94, верх на SAFE.top, по центру
// безопасной зоны.
const FULL = { s: 0.94, top: SAFE.top } as const;
const FULL_LEFT = (SAFE.left + SAFE.right) / 2 - (SITE.w * FULL.s) / 2;

const Site: React.FC<{ readonly f: number }> = ({ f }) => {
  const stage = clamp((f + 22) / 58);
  const request = clamp((f - 60) / 50);
  const b = SITE_BUTTONS.request;
  const from = { x: 700, y: 760 };
  const to = { x: b.cx + 250, y: b.cy + 12 };
  const m = easeInOut((f - 124) / 26);
  const cursor = {
    x: lerp(from.x, to.x, m),
    y: lerp(from.y, to.y, m),
    visible: clamp((f - 118) / 6) * (1 - clamp((f - 200) / 10)),
    click: clamp((f - 151) / 14),
  };
  const press = clamp((f - 150) / 14);
  const sent = clamp((f - 168) / 22);
  return (
    <div style={box({ inset: 0 })}>
      <Backdrop />
      <div
        style={box({
          left: FULL_LEFT,
          top: FULL.top,
          width: SITE.w,
          height: SITE.h,
          transform: `scale(${FULL.s})`,
          transformOrigin: "0 0",
          borderRadius: RADIUS.card,
          overflow: "hidden",
          boxShadow: SHADOW.lift,
        })}
      >
        <SiteScreen stage={stage} request={request} press={press} sent={sent} cursor={f >= 118 ? cursor : undefined} />
      </div>
    </div>
  );
};

const Scheme: React.FC = () => {
  const w = 900;
  const h = routeSchemeHeight("family", w);
  return (
    <div style={box({ inset: 0 })}>
      <Backdrop />
      <div style={box({ left: (SAFE.left + SAFE.right) / 2 - w / 2, top: 960 - h / 2, width: w, height: h, borderRadius: 36, boxShadow: SHADOW.card })}>
        <RouteScheme mode="family" w={w} reveal={1} />
      </div>
      <div style={box({ left: (SAFE.left + SAFE.right) / 2 - w / 2, top: 960 + h / 2 + 50, width: w })}>
        <RouteScheme mode="full" w={w} reveal={1} />
      </div>
    </div>
  );
};

export const SheetSite: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <DevSheet bg={C.bg}>
      {f < 236 ? <Site f={f} /> : f < 250 ? <Scheme /> : <CtaScreen brand={clamp((f - 250) / 14)} route={clamp((f - 260) / 16)} cta={clamp((f - 272) / 16)} />}
    </DevSheet>
  );
};
