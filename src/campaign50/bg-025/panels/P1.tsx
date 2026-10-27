// Печать панели 1/6 бумажной ленты (координаты панели RIB.w × RIB.h):
// «Маалымат калтырасыз». Значок листа, три печатные карточки Үй / Мектеп /
// Убакыт, строка «Үй • Мектеп • Убакыт» и внизу — серая пунктирная дорожка
// от дома к школе с бумажной машинкой на паузе: «каттам дароо
// башталбайт» показано образом, без нового текста.
// t — кадры с момента, когда панель легла плашмя (большое t — итог).
// Сцена шага 1 передаёт свои моменты появления (кадры от появления
// элемента; по умолчанию всё видно — итог для следующих сцен).
import { Icon, IconPath, type IconKind } from "../art";
import { box, settle } from "../kit";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";

export type P1Show = {
  readonly cards?: readonly [number, number, number]; // кадры от «штампа» каждой карточки
  readonly row?: number; // строка «Үй • Мектеп • Убакыт»
  readonly path?: number; // дорожка, машинка и пауза
};

// итог (как DONE в panels/index.ts; без циклического импорта)
const DONE = 9999;
const ICONS: readonly IconKind[] = ["home", "school", "clock"];
export const P1_CARD = { w: 214, h: 214, gap: 34, y: 104 } as const;
export const P1_ROW_Y = 344;
export const P1_PATH = { y: 508, x0: 150, x1: 672, car: 262, pause: 352 } as const;
const cardX = (i: number) => (820 - (3 * P1_CARD.w + 2 * P1_CARD.gap)) / 2 + i * (P1_CARD.w + P1_CARD.gap);
// Центр карточки i в координатах панели (для сцены: искра штампа).
export const p1CardCenter = (i: number) => ({ x: cardX(i) + P1_CARD.w / 2, y: P1_CARD.y + P1_CARD.h / 2 });

// Карточка-«штамп»: падает на бумагу чуть крупнее и с наклоном, мягко
// садится; тень от высокой к плоской.
const StampCard: React.FC<{ readonly i: number; readonly t: number }> = ({ i, t }) => {
  if (t < 0) return null;
  const k = settle(t, 12);
  const up = 1 - easeOut(t / 10);
  const tilt = [-5, 4, -3][i] * up;
  return (
    <div
      style={box({
        left: cardX(i),
        top: P1_CARD.y,
        width: P1_CARD.w,
        height: P1_CARD.h,
        borderRadius: 30,
        backgroundColor: C.white,
        border: `5px solid ${C.navy}`,
        boxSizing: "border-box",
        opacity: clamp(t / 4),
        transform: `scale(${lerp(1.32, 1, k)}) rotate(${tilt}deg)`,
        boxShadow: `0 ${6 + 26 * up}px ${10 + 30 * up}px rgba(20,40,90,${0.12 + 0.14 * up})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      })}
    >
      <div style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: C.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon kind={ICONS[i]} s={80} color={C.navy} w={4.6} />
      </div>
      <div style={{ fontFamily: F.text, fontWeight: 900, fontSize: 40, lineHeight: 1, color: C.navy }}>{BG25_TEXT.step1.items[i]}</div>
    </div>
  );
};

export const P1Art: React.FC<{ readonly t: number; readonly show?: P1Show }> = ({ show }) => {
  const cards = show?.cards ?? [DONE, DONE, DONE];
  const row = show?.row ?? DONE;
  const path = show?.path ?? DONE;
  const rowK = easeOut(row / 12);
  const mark = easeOut((row - 4) / 14);
  // дорожка рисуется от дома к школе, машинка трогается и сразу встаёт
  const draw = easeInOut(path / 22);
  const carX = lerp(P1_PATH.x0 + 44, P1_PATH.car, easeInOut((path - 6) / 16));
  const carBump = path > 20 && path < 32 ? Math.sin(((path - 20) / 12) * Math.PI) * -3 : 0;
  const pauseK = settle(path - 20, 12);
  const { y, x0, x1 } = P1_PATH;
  const len = x1 - x0 - 88;
  return (
    <div style={box({ inset: 0 })}>
      {/* значок листа */}
      <div style={box({ left: 30, top: 24, width: 72, height: 72, borderRadius: 36, backgroundColor: C.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <Icon kind="doc" s={48} color={C.navy} w={4.6} />
      </div>
      <div style={box({ left: 116, top: 50, width: 140, height: 8, borderRadius: 4, backgroundColor: C.paperShade })} />
      <div style={box({ left: 116, top: 66, width: 92, height: 8, borderRadius: 4, backgroundColor: C.paperShade })} />
      {/* три карточки */}
      {[0, 1, 2].map((i) => (
        <StampCard key={i} i={i} t={cards[i]} />
      ))}
      {/* строка со сведениями */}
      {row >= 0 ? (
        <div style={box({ left: 0, right: 0, top: P1_ROW_Y, display: "flex", justifyContent: "center", opacity: clamp(rowK * 1.4), transform: `translateY(${(1 - rowK) * 14}px)` })}>
          <div style={{ position: "relative", padding: "2px 18px 6px" }}>
            <div style={box({ left: 0, bottom: 2, height: 22, width: `${mark * 100}%`, borderRadius: 11, backgroundColor: C.yellow, opacity: 0.85 })} />
            <div style={{ position: "relative", fontFamily: F.text, fontWeight: 900, fontSize: 46, lineHeight: 1.1, color: C.navy, whiteSpace: "nowrap" }}>{BG25_TEXT.step1.row}</div>
          </div>
        </div>
      ) : null}
      {/* дорожка Үй → Мектеп с машинкой на паузе */}
      {path >= 0 ? (
        <svg width={820} height={620} style={box({ left: 0, top: 0, overflow: "visible" })}>
          <line x1={x0 + 44} y1={y} x2={x0 + 44 + len * draw} y2={y} stroke="#A9B4C8" strokeWidth={7} strokeDasharray="18 16" strokeLinecap="round" />
          <g transform={`translate(${x0 - 34} ${y - 40})`} opacity={clamp(path / 6)}>
            <circle cx={34} cy={36} r={40} fill={C.white} stroke={C.line} strokeWidth={4} />
            <g transform="translate(10 12)">
              <IconPath kind="home" color={C.navy} w={4.6} />
            </g>
          </g>
          <g transform={`translate(${x1 - 34} ${y - 40})`} opacity={clamp((path - 14) / 8)}>
            <circle cx={34} cy={36} r={40} fill={C.white} stroke={C.line} strokeWidth={4} />
            <g transform="translate(10 12)">
              <IconPath kind="school" color={C.inkSoft} w={4.6} />
            </g>
          </g>
          {/* бумажная машинка */}
          <g transform={`translate(${carX - 46} ${y - 58 + carBump})`} opacity={clamp((path - 4) / 6)}>
            <rect x={0} y={26} width={92} height={44} rx={14} fill={C.paperWarm} stroke={C.paperFold} strokeWidth={3} />
            <g transform="translate(4 4) scale(1.75)">
              <IconPath kind="car" color={C.navy} w={3.2} />
            </g>
          </g>
          {/* значок паузы на дорожке сразу за машинкой */}
          {pauseK > 0 ? (
            <g transform={`translate(${P1_PATH.pause} ${y}) scale(${pauseK})`} opacity={clamp(pauseK * 1.5)}>
              <circle cx={0} cy={0} r={36} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
              <g transform="translate(-21 -22) scale(0.88)">
                <IconPath kind="pause" color={C.navy} w={6.5} />
              </g>
            </g>
          ) : null}
        </svg>
      ) : null}
    </div>
  );
};
