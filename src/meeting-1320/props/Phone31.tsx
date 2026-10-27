// Телефон отца крупно (сцена 9): поиск → страница BalaGo → форма
// предварительной заявки → «Алдын ала өтүнмө жөнөтүлдү». Иллюстративный
// интерфейс, не копия сайта: адресной строки и ссылок нет; в форме вместо
// личных данных — серые штрихи, в поле «Убакыт» — 13:20.
// Экран — HTML (переносы строк, шрифты с ү/ө/ң, логотип через <Img>).
import { Img, staticFile } from "remotion";
import { box } from "../kit";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";

export const PH = { w: 400, h: 820, bezel: 16, r: 58 } as const;
export const PH_SW = PH.w - 2 * PH.bezel;
export const PH_SH = PH.h - 2 * PH.bezel;

// Телефон: центр (x, y), масштаб k, наклон angle (°). Содержимое экрана —
// в координатах экрана PH_SW × PH_SH.
export const Phone: React.FC<{ readonly x: number; readonly y: number; readonly k?: number; readonly angle?: number; readonly children?: React.ReactNode; readonly dim?: number }> = ({ x, y, k = 1, angle = 0, children, dim = 0 }) => (
  <div
    style={box({
      left: x - PH.w / 2,
      top: y - PH.h / 2,
      width: PH.w,
      height: PH.h,
      transform: `rotate(${angle}deg) scale(${k})`,
      transformOrigin: "50% 50%",
      borderRadius: PH.r,
      background: "#1C2230",
      boxShadow: "0 34px 60px rgba(20,30,50,0.32), inset 0 0 0 3px #3A4254",
    })}
  >
    <div style={box({ left: PH.bezel, top: PH.bezel, width: PH_SW, height: PH_SH, borderRadius: PH.r - 14, overflow: "hidden", background: "#F5F7FA" })}>
      {children}
      {dim > 0 ? <div style={box({ left: 0, top: 0, width: PH_SW, height: PH_SH, background: `rgba(10,16,30,${0.5 * dim})` })} /> : null}
    </div>
    <div style={box({ left: PH.w / 2 - 46, top: PH.bezel + 12, width: 92, height: 24, borderRadius: 12, background: "#1C2230" })} />
  </div>
);

const navy = C.navy;
const grey = "#8A94A6";

const StatusBar: React.FC = () => (
  <svg width={PH_SW} height={56} style={box({ left: 0, top: 0 })}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={PH_SW - 112 + i * 9} y={30 - i * 4} width={6} height={8 + i * 4} rx={1.5} fill={navy} />
    ))}
    <rect x={PH_SW - 66} y={20} width={36} height={18} rx={5} fill="none" stroke={navy} strokeWidth={2.5} />
    <rect x={PH_SW - 63} y={23} width={24} height={12} rx={3} fill={navy} />
    <rect x={PH_SW - 28} y={25} width={3} height={8} rx={1} fill={navy} />
  </svg>
);

const Logo: React.FC<{ readonly size: number; readonly style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("assets/logo.png")} style={{ width: size, height: size, borderRadius: size / 2, ...style }} />
);

// Касание экрана: расходящийся круг.
const Tap: React.FC<{ readonly x: number; readonly y: number; readonly t: number }> = ({ x, y, t }) =>
  t > 0 && t < 1 ? <div style={box({ left: x - 20 - 30 * t, top: y - 20 - 30 * t, width: 40 + 60 * t, height: 40 + 60 * t, borderRadius: "50%", background: `rgba(23,42,70,${0.18 * (1 - t)})` })} /> : null;

// Экранная клавиатура (без букв на клавишах — только ряды).
export const KB_TOP = PH_SH - 300;
const Keyboard: React.FC = () => (
  <div style={box({ left: 0, top: KB_TOP, width: PH_SW, height: 300, background: "#D9DEE6" })}>
    {[10, 9, 7].map((n, r) => (
      <div key={r}>
        {Array.from({ length: n }).map((_, i) => {
          const kw = (PH_SW - 16) / 10 - 6;
          const x0 = (PH_SW - n * (kw + 6)) / 2;
          return <div key={i} style={box({ left: x0 + i * (kw + 6), top: 18 + r * 62, width: kw, height: 50, borderRadius: 8, background: "#FFFFFF", boxShadow: "0 2px 0 #A9B1BE" })} />;
        })}
      </div>
    ))}
    <div style={box({ left: 90, top: 204, width: PH_SW - 180, height: 50, borderRadius: 8, background: "#FFFFFF", boxShadow: "0 2px 0 #A9B1BE" })} />
  </div>
);

// ---------------------------------------------------------------- поиск
// typed 0…1 — набран запрос; results 0…1 — появились результаты;
// pick 0…1 — касание первой карточки (BalaGo).
export const SEARCH_CARD = { x: 18, y: 214, w: PH_SW - 36, h: 158 } as const;
export const SearchScreen: React.FC<{ readonly typed: number; readonly results: number; readonly pick?: number; readonly f: number }> = ({ typed, results, pick = 0, f }) => {
  const q = M13_TEXT.search.query;
  const n = Math.round(q.length * clamp(typed));
  const shown = q.slice(0, n);
  const caret = typed < 1 || Math.floor(f / 12) % 2 === 0;
  const card = (i: number) => {
    const u = easeInOut(clamp(results * 3 - i));
    return { opacity: u, transform: `translateY(${(1 - u) * 24}px)` };
  };
  const pressed = pick > 0 && pick < 0.6;
  return (
    <div style={box({ left: 0, top: 0, width: PH_SW, height: PH_SH, background: "#F5F7FA", fontFamily: F.text })}>
      <StatusBar />
      <div style={box({ left: 18, top: 70, width: PH_SW - 36, minHeight: 104, borderRadius: 28, background: "#FFFFFF", border: `3px solid ${typed > 0 ? C.yellow : "#DDE3EC"}`, boxSizing: "border-box", padding: "16px 20px 16px 64px", fontSize: 27, fontWeight: 600, lineHeight: 1.22, color: navy })}>
        <svg width={34} height={34} style={box({ left: 18, top: 18 })}>
          <circle cx={14} cy={14} r={10} fill="none" stroke={grey} strokeWidth={3.5} />
          <line x1={22} y1={22} x2={31} y2={31} stroke={grey} strokeWidth={4} strokeLinecap="round" />
        </svg>
        {n === 0 ? <span style={{ color: grey }}>{M13_TEXT.search.hint}</span> : shown}
        {caret ? <span style={{ display: "inline-block", width: 3, height: 30, marginLeft: 2, background: navy, verticalAlign: "-5px" }} /> : null}
      </div>
      {/* 1-я карточка — BalaGo */}
      <div
        style={box({
          left: SEARCH_CARD.x,
          top: SEARCH_CARD.y,
          width: SEARCH_CARD.w,
          height: SEARCH_CARD.h,
          borderRadius: 24,
          background: "#FFFFFF",
          boxShadow: pick > 0 ? `0 0 0 4px ${C.yellow}` : "0 6px 16px rgba(23,42,70,0.08)",
          ...card(0),
          transform: `${card(0).transform} scale(${pressed ? 0.97 : 1})`,
        })}
      >
        <Logo size={92} style={box({ left: 18, top: 33 })} />
        <div style={box({ left: 128, top: 26, fontFamily: F.display, fontWeight: 900, fontSize: 34, color: navy })}>{M13_TEXT.page.brand}</div>
        <div style={box({ left: 128, top: 72, fontSize: 21, fontWeight: 600, color: navy })}>{M13_TEXT.page.tagline}</div>
        <div style={box({ left: 128, top: 104, fontSize: 19, fontWeight: 500, color: grey })}>{M13_TEXT.page.city}</div>
      </div>
      {/* остальные результаты — без названий (серые строки) */}
      {[1, 2].map((i) => (
        <div key={i} style={box({ left: 18, top: SEARCH_CARD.y + SEARCH_CARD.h + 18 + (i - 1) * 132, width: SEARCH_CARD.w, height: 114, borderRadius: 24, background: "#FFFFFF", ...card(i) })}>
          <div style={box({ left: 20, top: 22, width: 70, height: 70, borderRadius: 16, background: "#E6EAF0" })} />
          <div style={box({ left: 108, top: 30, width: 150, height: 16, borderRadius: 8, background: "#D5DBE4" })} />
          <div style={box({ left: 108, top: 60, width: 190, height: 12, borderRadius: 6, background: "#E6EAF0" })} />
        </div>
      ))}
      <Tap x={SEARCH_CARD.x + SEARCH_CARD.w * 0.5} y={SEARCH_CARD.y + SEARCH_CARD.h * 0.5} t={pick * 1.6} />
      {/* клавиатура — пока набирается запрос */}
      {typed > 0 && results <= 0 ? <Keyboard /> : null}
    </div>
  );
};

// ---------------------------------------------------------- страница BalaGo
// scroll 0…1 — прокрутка к кнопке; press 0…1 — касание кнопки.
export const PAGE_CTA = { x: 24, y: 650, w: PH_SW - 48, h: 76 } as const;
export const BalagoPage: React.FC<{ readonly scroll?: number; readonly press?: number }> = ({ scroll = 0, press = 0 }) => {
  const P = M13_TEXT.page;
  const dy = -40 * easeInOut(clamp(scroll));
  const pressed = press > 0 && press < 0.6;
  return (
    <div style={box({ left: 0, top: 0, width: PH_SW, height: PH_SH, background: "#FFFFFF", fontFamily: F.text, color: navy })}>
      <div style={box({ left: 0, top: dy, width: PH_SW, height: PH_SH })}>
        <div style={box({ left: 0, top: 0, width: PH_SW, height: 300, background: C.yellow, borderRadius: "0 0 40px 40px" })} />
        <StatusBar />
        <Logo size={150} style={box({ left: PH_SW / 2 - 75, top: 62, boxShadow: "0 0 0 6px #FFFFFF" })} />
        <div style={box({ left: 0, top: 226, width: PH_SW, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 44 })}>{P.brand}</div>
        <div style={box({ left: 0, top: 318, width: PH_SW, textAlign: "center", fontSize: 25, fontWeight: 800 })}>{P.tagline}</div>
        <div style={box({ left: PH_SW / 2 - 70, top: 362, width: 140, height: 40, borderRadius: 20, background: "#EEF2F7", textAlign: "center", lineHeight: "40px", fontSize: 20, fontWeight: 700 })}>{P.city}</div>
        <div style={box({ left: 24, top: 422, width: PH_SW - 48, height: 64, borderRadius: 18, background: "#FFF6D6", border: `2px solid ${C.yellow}`, boxSizing: "border-box", textAlign: "center", lineHeight: "60px", fontSize: 22, fontWeight: 800, letterSpacing: 0.5 })}>{P.route}</div>
        {P.points.map((p, i) => (
          <div key={p} style={box({ left: 24, top: 504 + i * 62, width: PH_SW - 48, fontSize: 19, fontWeight: 600, lineHeight: 1.25, paddingLeft: 46, boxSizing: "border-box" })}>
            <svg width={34} height={34} style={box({ left: 0, top: -4 })}>
              <circle cx={17} cy={17} r={15} fill={C.yellow} />
              <path d="M 9 17 L 15 23 L 25 11" stroke={navy} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {p}
          </div>
        ))}
      </div>
      <div style={box({ left: PAGE_CTA.x, top: PAGE_CTA.y, width: PAGE_CTA.w, height: PAGE_CTA.h, borderRadius: 38, background: navy, color: "#FFFFFF", textAlign: "center", lineHeight: `${PAGE_CTA.h}px`, fontSize: 25, fontWeight: 800, transform: `scale(${pressed ? 0.96 : 1})` })}>{P.cta}</div>
      <Tap x={PAGE_CTA.x + PAGE_CTA.w / 2} y={PAGE_CTA.y + PAGE_CTA.h / 2} t={press * 1.6} />
    </div>
  );
};

// --------------------------------------------------------------- форма
// fill 0…4 — сколько полей заполнено (дробное — текущее поле
// заполняется); press 0…1 — касание «Өтүнмө калтыруу»; sent 0…1 —
// появляется подтверждение отправки предварительной заявки (без водителя,
// времени поездки и подтверждения поездки).
export const FORM_FIELD = (i: number) => ({ x: 22, y: 150 + i * 116, w: PH_SW - 44, h: 62 });
export const FORM_SEND = { x: 22, y: 640, w: PH_SW - 44, h: 76 } as const;
export const FormScreen: React.FC<{ readonly fill: number; readonly press?: number; readonly sent?: number }> = ({ fill, press = 0, sent = 0 }) => {
  const T = M13_TEXT.form;
  const pressed = press > 0 && press < 0.6;
  const su = easeInOut(clamp(sent));
  const lens = [0.62, 0.78, 0.5];
  return (
    <div style={box({ left: 0, top: 0, width: PH_SW, height: PH_SH, background: "#F5F7FA", fontFamily: F.text, color: navy })}>
      <StatusBar />
      <svg width={30} height={30} style={box({ left: 22, top: 74 })}>
        <path d="M 20 4 L 8 15 L 20 26" stroke={navy} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={box({ left: 62, top: 68, fontSize: 28, fontWeight: 800 })}>{T.title}</div>
      {T.fields.map((label, i) => {
        const r = FORM_FIELD(i);
        const u = clamp(fill - i);
        const focus = fill > i && fill < i + 1;
        return (
          <div key={label}>
            <div style={box({ left: r.x + 4, top: r.y - 34, fontSize: 19, fontWeight: 700, color: "#4A5870" })}>{label}</div>
            <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 16, background: "#FFFFFF", border: `3px solid ${focus ? C.yellow : "#DDE3EC"}`, boxSizing: "border-box" })}>
              {i < 3 ? (
                <div style={box({ left: 18, top: 22, width: Math.max(0, (r.w - 40) * lens[i] * u), height: 14, borderRadius: 7, background: "#C9D1DC" })} />
              ) : (
                <div style={box({ left: 18, top: 10, fontSize: 28, fontWeight: 800, letterSpacing: 1 })}>{M13_TEXT.clock.slice(0, Math.round(5 * u))}</div>
              )}
            </div>
          </div>
        );
      })}
      <div style={box({ left: FORM_SEND.x, top: FORM_SEND.y, width: FORM_SEND.w, height: FORM_SEND.h, borderRadius: 38, background: C.yellow, textAlign: "center", lineHeight: `${FORM_SEND.h}px`, fontSize: 25, fontWeight: 800, transform: `scale(${pressed ? 0.96 : 1})` })}>{T.send}</div>
      <Tap x={FORM_SEND.x + FORM_SEND.w / 2} y={FORM_SEND.y + FORM_SEND.h / 2} t={press * 1.6} />
      {su > 0 ? (
        <>
          <div style={box({ left: 0, top: 0, width: PH_SW, height: PH_SH, background: `rgba(23,42,70,${0.35 * su})` })} />
          <div style={box({ left: 0, top: lerp(PH_SH, PH_SH - 360, su), width: PH_SW, height: 380, borderRadius: "36px 36px 0 0", background: "#FFFFFF", textAlign: "center" })}>
            <svg width={96} height={96} style={box({ left: PH_SW / 2 - 48, top: 44 })}>
              <circle cx={48} cy={48} r={44} fill="#3E9C5A" />
              <path d="M 28 49 L 42 63 L 68 34" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - clamp(sent * 1.6 - 0.5))} />
            </svg>
            <div style={box({ left: 28, top: 164, width: PH_SW - 56, fontSize: 28, fontWeight: 800, lineHeight: 1.25 })}>{T.sent}</div>
          </div>
        </>
      ) : null}
    </div>
  );
};

// Хват телефона одной рукой (вид спереди): ладонь и запястье за нижней
// частью телефона, большой палец на левой грани, три пальца — на правой.
// layer "back" — до <Phone>, "front" — после. Координаты как у <Phone>.
export const PhoneHold: React.FC<{ readonly x: number; readonly y: number; readonly k?: number; readonly angle?: number; readonly layer: "back" | "front"; readonly skin: string; readonly shade: string; readonly sleeve: string; readonly cuff?: string }> = ({ x, y, k = 1, angle = 0, layer, skin, shade, sleeve, cuff }) => {
  const hw = PH.w / 2;
  const hh = PH.h / 2;
  const sw = 3 / k;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${k})`}>
        {layer === "back" ? (
          <g>
            {/* предплечье и запястье снизу */}
            <path d={`M ${-hw * 0.5} ${hh + 700} L ${-hw * 0.42} ${hh * 0.62} L ${hw * 0.52} ${hh * 0.6} L ${hw * 0.66} ${hh + 700} Z`} fill={sleeve} stroke={shade} strokeWidth={sw} />
            {cuff ? <path d={`M ${-hw * 0.47} ${hh + 120} L ${hw * 0.6} ${hh + 120}`} stroke={cuff} strokeWidth={34} /> : null}
            {/* ладонь за телефоном */}
            <ellipse cx={hw * 0.05} cy={hh * 0.66} rx={hw * 1.02} ry={hh * 0.36} fill={skin} stroke={shade} strokeWidth={sw} />
          </g>
        ) : (
          <g>
            {/* большой палец — по левой грани */}
            <rect x={-hw - 30} y={hh * 0.12} width={58} height={170} rx={29} fill={skin} stroke={shade} strokeWidth={sw} transform={`rotate(8 ${-hw} ${hh * 0.12})`} />
            {/* пальцы — по правой грани */}
            {[0, 1, 2].map((i) => (
              <rect key={i} x={hw - 34} y={hh * 0.08 + i * 74} width={74} height={62} rx={30} fill={skin} stroke={shade} strokeWidth={sw} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};

// Точка экрана (sx, sy) в координатах кадра для <Phone x y k angle>.
export const phonePt = (x: number, y: number, k: number, angle: number, sx: number, sy: number) => {
  const lx = (sx + PH.bezel - PH.w / 2) * k;
  const ly = (sy + PH.bezel - PH.h / 2) * k;
  const a = (angle * Math.PI) / 180;
  return { x: x + lx * Math.cos(a) - ly * Math.sin(a), y: y + lx * Math.sin(a) + ly * Math.cos(a) };
};
