// S16 · Финальный экран BalaGo.
//
// Начинается с последнего кадра S15 (раскрытая папка сверху): разворот за
// 0,8 с вырастает в светлую бумажную карточку на кремовом фоне с мягкими
// диагоналями. Пока звучит первая фраза, на карточку въезжает белый
// хэтчбек (только символ BalaGo: без логотипов и номеров). Дальше элементы
// появляются по словам N16 (SD2_CTA_WORDS):
//   «БалаГо»     → логотип и «Балдар үчүн такси»;
//   «Бишкектеги» → плашка «Бишкек»;
//   «Үйдөн»      → маршрут «ҮЙ → МЕКТЕП → ҮЙ» (иконки, стрелки рисуются);
//   «өтүнмө»     → жёлтая кнопка «Баланы каттоо» (одно мягкое нажатие);
//   «Профилдин»  → «Шилтеме профилдин башында» со стрелкой вверх;
//   «Ватсап»     → WhatsApp и номер 0998 08 38 28 (номер дал заказчик).
// Через 0,5 с после «Ватсап» кадр собран и дальше неподвижен (≥ 6,5 с).
// Всё важное — в x 90…930, y 170…1340: ниже остаются субтитры.
import { staticFile } from "remotion";
import { useScene, usePlan, Shot, Svg, Paper, Img, FONT, roughRect, DrawArrow, settle } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { SD2_CTA_WORDS, SD2_TEXT } from "../script";
import { CarBody, CarCabin } from "../props/Car";
import { FOLDER_SPREAD, FOLDER_TOP_CAM, FolderTopScene } from "./S15Folder";
import type { Sd2SfxPlan } from "../sfx";

export const ctaPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "cta");
  const w = (k: keyof typeof SD2_CTA_WORDS) => T.word("N16", SD2_CTA_WORDS[k]);
  const link = w("link");
  const wa = w("whatsapp");
  return {
    len: T.len,
    grow0: 2,
    grow1: 26, // карточка развернулась (0,8 с)
    car0: 30,
    car1: Math.min(w("tagline") - 10, 120),
    logo: w("tagline") - 4,
    city: w("city") - 2,
    route: w("route") - 2,
    button: w("button") - 2,
    link: link - 2,
    whatsapp: wa - 2,
    assembled: wa + 15,
  };
};
type Plan = ReturnType<typeof ctaPlan>;

const CARD = { x: 70, y: 150, w: 940, h: 1200 };
const X0 = 90;
const X1 = 930;

// появление: прозрачность и мягкий подъём (без перелёта)
const pop = (f: number, at: number, dur = 10) => {
  const k = settle(f - at, dur);
  return { o: clamp((f - at) / 6), dy: (1 - k) * 18, s: 0.94 + 0.06 * k };
};

const HouseIcon: React.FC<{ x: number; y: number; s: number; ink: number }> = ({ x, y, s, ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 26 L -34 -6 L 0 -34 L 34 -6 L 34 26 Z" fill="#F1D9B5" stroke={C.ink} strokeWidth={ink / s} strokeLinejoin="round" />
    <rect x={-9} y={4} width={18} height={22} fill={C.wood} stroke={C.ink} strokeWidth={(ink * 0.7) / s} />
    <path d="M -40 -2 L 0 -40 L 40 -2" fill="none" stroke={C.ink} strokeWidth={(ink * 1.2) / s} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const SchoolIcon: React.FC<{ x: number; y: number; s: number; ink: number }> = ({ x, y, s, ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 28 L -46 -10 L 0 -32 L 46 -10 L 46 28 Z" fill={C.brick} stroke={C.ink} strokeWidth={ink / s} strokeLinejoin="round" />
    <rect x={-10} y={6} width={20} height={22} fill="#7FA0C0" stroke={C.ink} strokeWidth={(ink * 0.7) / s} />
    {[-30, 18].map((dx) => (
      <rect key={dx} x={dx} y={-6} width={12} height={12} fill={C.glass} stroke={C.ink} strokeWidth={(ink * 0.6) / s} />
    ))}
    <path d="M 0 -32 L 0 -52 L 18 -46 L 0 -40" fill={C.yellow} stroke={C.ink} strokeWidth={(ink * 0.7) / s} strokeLinejoin="round" />
  </g>
);

// Простая иконка чата с трубкой (канал WhatsApp; подпись рядом).
const ChatIcon: React.FC<{ x: number; y: number; r: number; ink: number }> = ({ x, y, r, ink }) => (
  <g>
    <path d={`M ${x - r * 0.62} ${y + r * 0.78} L ${x - r * 0.86} ${y + r * 1.02} L ${x - r * 0.3} ${y + r * 0.92} Z`} fill="#2FB45A" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
    <circle cx={x} cy={y} r={r} fill="#2FB45A" stroke={C.ink} strokeWidth={ink} />
    <path
      d={`M ${x - r * 0.38} ${y - r * 0.42} q ${-r * 0.08} ${r * 0.5} ${r * 0.36} ${r * 0.8} q ${r * 0.3} ${r * 0.24} ${r * 0.62} ${r * 0.1} l ${-r * 0.16} ${-r * 0.22} q ${-r * 0.16} ${r * 0.06} ${-r * 0.3} ${-r * 0.06} q ${-r * 0.22} ${-r * 0.16} ${-r * 0.3} ${-r * 0.4} q ${r * 0.08} ${-r * 0.1} ${r * 0.04} ${-r * 0.26} Z`}
      fill="#FFFFFF"
    />
  </g>
);

const Card: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = 3.6;
  const text = (x: number, y: number, s: string, size: number, color: string = C.ink, anchor: "middle" | "start" = "middle") => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
      {s}
    </text>
  );
  // логотип и подпись
  const lg = pop(f, p.logo, 12);
  const tg = pop(f, p.logo + 8);
  const ct = pop(f, p.city);
  // маршрут: три узла и стрелки
  const ry = 700;
  const nodes = [
    { x: 236, label: "ҮЙ", icon: "home" as const },
    { x: 540, label: "МЕКТЕП", icon: "school" as const },
    { x: 844, label: "ҮЙ", icon: "home" as const },
  ];
  const btn = pop(f, p.button);
  const press = f >= p.button + 12 ? Math.sin(clamp((f - p.button - 12) / 10) * Math.PI) : 0;
  const lk = pop(f, p.link);
  const wa = pop(f, p.whatsapp);
  // машина въезжает слева и мягко останавливается
  const carK = easeOut((f - p.car0) / (p.car1 - p.car0));
  const carX = lerp(-360, 540, carK);
  const wheel = carK * 1400;
  const carY = 952;
  const BY = 1022; // центр кнопки
  return (
    <>
      {/* логотип BalaGo (файл бренда) */}
      <Img
        src={staticFile("assets/logo.png")}
        style={{ position: "absolute", left: 397, top: 170 + lg.dy, width: 286, height: 284, opacity: lg.o, transform: `scale(${lg.s})`, transformOrigin: "50% 50%" }}
      />
      <Svg>
      <g opacity={tg.o} transform={`translate(0 ${tg.dy})`}>{text(540, 526, SD2_TEXT.cta.tagline, 60)}</g>
      {/* Бишкек: плашка с меткой */}
      <g opacity={ct.o} transform={`translate(0 ${ct.dy})`}>
        <path d={roughRect(406, 554, 268, 66, 33, 811, 1)} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink} />
        <path d="M 450 568 C 437 568 430 577 430 588 C 430 601 450 614 450 614 C 450 614 470 601 470 588 C 470 577 463 568 450 568 Z" fill="#E25B4B" stroke={C.ink} strokeWidth={ink * 0.7} />
        <circle cx={450} cy={588} r={6.5} fill="#FFFFFF" />
        {text(572, 602, SD2_TEXT.cta.city, 44)}
      </g>
      {/* маршрут ҮЙ → МЕКТЕП → ҮЙ */}
      {nodes.map((n, i) => {
        const a = pop(f, p.route + i * 8);
        return (
          <g key={i} opacity={a.o} transform={`translate(0 ${a.dy})`}>
            {n.icon === "home" ? <HouseIcon x={n.x} y={ry} s={1.05} ink={ink} /> : <SchoolIcon x={n.x} y={ry} s={1.05} ink={ink} />}
            {text(n.x, ry + 88, n.label, 46)}
          </g>
        );
      })}
      {[0, 1].map((i) => {
        // стрелки между подписями (ширина «ҮЙ» ≈ 56, «МЕКТЕП» ≈ 186 px)
        const xa = nodes[i].x + (i === 0 ? 46 : 110);
        const xb = nodes[i + 1].x - (i === 0 ? 110 : 46);
        return (
          <g key={i}>
            <DrawArrow pts={[[xa, ry + 72], [xb, ry + 72]]} t={f - p.route - 6 - i * 8} dur={10} color={C.ink} width={ink * 1.3} />
          </g>
        );
      })}
      {/* дорога под машиной прорисовывается вслед за ней (маршрут планируется) */}
      <path d={`M 130 ${carY + 6} L ${Math.max(130, Math.min(950, carX + 220))} ${carY + 6}`} stroke={C.line} strokeWidth={ink * 1.6} strokeDasharray={`${ink * 5} ${ink * 4}`} strokeLinecap="round" opacity={clamp((f - p.car0) / 6)} />
      {/* белая машина — символ BalaGo, без логотипа и номеров */}
      <g>
        <CarCabin x={carX} y={carY} len={400} dir={1} ink={ink} />
        <CarBody x={carX} y={carY} len={400} dir={1} ink={ink} wheel={wheel} color="#F8F7F2" shade="#D8DDE3" />
      </g>
      {/* кнопка «Баланы каттоо» */}
      <g opacity={btn.o} transform={`translate(540 ${BY + btn.dy}) scale(${btn.s * (1 - press * 0.04)}) translate(-540 ${-BY})`}>
        <rect x={282} y={BY - 38} width={516} height={90} rx={45} fill={C.yellowDeep} />
        <path d={roughRect(276, BY - 46, 528, 90, 45, 813, 1)} fill={C.yellow} stroke={C.ink} strokeWidth={ink * 1.1} />
        {text(540, BY + 16, SD2_TEXT.cta.button, 50)}
      </g>
      {/* «Шилтеме профилдин башында» со стрелкой вверх */}
      <g opacity={lk.o} transform={`translate(0 ${lk.dy})`}>
        <path d="M 158 1150 L 158 1104 M 141 1121 L 158 1102 L 175 1121" fill="none" stroke={C.lanyard} strokeWidth={ink * 1.6} strokeLinecap="round" strokeLinejoin="round" />
        {text(562, 1142, SD2_TEXT.cta.link, 44, C.lanyard)}
      </g>
      {/* WhatsApp и номер (последний элемент) */}
      <g opacity={wa.o} transform={`translate(0 ${wa.dy})`}>
        <path d={roughRect(104, 1180, 812, 96, 48, 817, 1)} fill="#E6F5EA" stroke={C.ink} strokeWidth={ink} />
        <ChatIcon x={166} y={1226} r={30} ink={ink} />
        {text(214, 1245, `${SD2_TEXT.cta.whatsapp}: ${SD2_TEXT.cta.phone}`, 50, C.ink, "start")}
      </g>
      {/* метки на полях, как у референса */}
      <path d={`M ${X0 + 4} 196 l 16 0 M ${X0 + 12} 188 l 0 16 M ${X1 - 20} 196 l 16 0 M ${X1 - 12} 188 l 0 16`} stroke="rgba(36,50,74,0.3)" strokeWidth={2} />
      </Svg>
    </>
  );
};

export const S16Cta: React.FC = () => {
  const { f } = useScene("cta");
  const p = usePlan(ctaPlan);
  const g = easeInOut((f - p.grow0) / (p.grow1 - p.grow0));
  // разворот папки (в координатах кадра при FOLDER_TOP_CAM) → карточка
  const z = FOLDER_TOP_CAM.zoom;
  const scr = (x: number, y: number) => ({ x: 540 + (x - FOLDER_TOP_CAM.x) * z, y: 960 + (y - FOLDER_TOP_CAM.y) * z });
  const a = scr(FOLDER_SPREAD.x, FOLDER_SPREAD.y);
  const b = scr(FOLDER_SPREAD.x + FOLDER_SPREAD.w, FOLDER_SPREAD.y + FOLDER_SPREAD.h);
  const r = {
    x: lerp(a.x, CARD.x, g),
    y: lerp(a.y, CARD.y, g),
    w: lerp(b.x - a.x, CARD.w, g),
    h: lerp(b.y - a.y, CARD.h, g),
  };
  return (
    <>
      {g < 1 ? (
        <Shot f={f} cam={FOLDER_TOP_CAM}>
          <FolderTopScene ink={4 / z} t={f + 40} hands={1 - clamp(g * 2.5)} />
        </Shot>
      ) : null}
      {/* кремовый фон с диагоналями проявляется вокруг растущей карточки */}
      <div style={{ position: "absolute", inset: 0, opacity: g }}>
        <Paper x={0} y={0} w={1080} h={1920} stripes="warm" />
      </div>
      <div
        style={{
          position: "absolute",
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          backgroundColor: C.paper,
          opacity: clamp(g * 4),
          border: `${3.6}px solid ${C.ink}`,
          borderRadius: lerp(12, 34, g),
          boxShadow: `${lerp(4, 14, g)}px ${lerp(6, 18, g)}px 0 rgba(36,50,74,0.14)`,
        }}
      />
      {g >= 1 ? (
        <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="transparent">
          <Card f={f} p={p} />
        </Shot>
      ) : null}
    </>
  );
};

// Звук: лёгкий сигнал на логотипе, мягкое нажатие кнопки.
export const sfxS16Cta: Sd2SfxPlan = (tl) => {
  const p = ctaPlan(tl);
  return [
    { at: p.logo + 2, kind: "chime" },
    { at: p.button + 12, kind: "tap", volume: 0.16 },
    { at: p.whatsapp + 2, kind: "notify", volume: 0.12 },
  ];
};
