// Экраны телефона (сцена «Өзү издейт, өзү жөнөтөт»): поиск, сайт BalaGo с
// формой арыза, WhatsApp с подготовленным сообщением. Сервер ничего не
// подтверждает: сайт только открывает чат с готовым текстом, отправляет
// мама сама (две серые галочки — сообщение ушло, без ответа оператора).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { box } from "../context";
import { BG40_TEXT } from "../script";
import { C } from "./theme";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const INK = "#16233A";
const BRAND = "#1A63D6"; // основная кнопка сайта
const typed = (s: string, p: number) => [...s].slice(0, Math.round(clamp01(p) * [...s].length)).join("");

export const StatusBar: React.FC<{ readonly time: string; readonly dark?: boolean }> = ({ time, dark }) => (
  <div style={box({ left: 40, right: 40, top: 20, height: 40, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily, fontSize: 26, fontWeight: 800, color: dark ? "#FFFFFF" : INK })}>
    <span>{time}</span>
    <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {[10, 14, 18, 22].map((h) => (
        <span key={h} style={{ width: 6, height: h, borderRadius: 2, backgroundColor: dark ? "#FFFFFF" : INK }} />
      ))}
      <span style={{ width: 40, height: 20, borderRadius: 5, border: `3px solid ${dark ? "#FFFFFF" : INK}`, marginLeft: 8, boxSizing: "border-box", padding: 2 }}>
        <span style={{ display: "block", width: "70%", height: "100%", borderRadius: 2, backgroundColor: dark ? "#FFFFFF" : INK }} />
      </span>
    </span>
  </div>
);

const Caret: React.FC<{ readonly f: number; readonly on?: boolean }> = ({ f, on = true }) => (
  <span style={{ display: "inline-block", width: 3, height: "1em", marginLeft: 3, verticalAlign: "-0.12em", backgroundColor: on && Math.floor(f / 8) % 2 === 0 ? BRAND : "transparent" }} />
);

// Поиск: строка запроса печатается (typeP), затем результаты (resP).
export const SearchScreen: React.FC<{ readonly f: number; readonly typeP: number; readonly resP: number; readonly press: number }> = ({ f, typeP, resP, press }) => {
  const t = BG40_TEXT.search;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily })}>
      <StatusBar time={BG40_TEXT.search.clock[0]} />
      <div style={box({ left: 30, right: 30, top: 90, height: 92, borderRadius: 46, backgroundColor: "#F1F4F9", border: `3px solid ${typeP < 1 ? BRAND : "#E1E6EF"}`, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", boxSizing: "border-box" })}>
        <svg width={38} height={38} viewBox="0 0 24 24">
          <circle cx={10} cy={10} r={6.5} stroke={C.inkSoft} strokeWidth={2.6} fill="none" />
          <line x1={15} y1={15} x2={21} y2={21} stroke={C.inkSoft} strokeWidth={2.6} strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 34, fontWeight: 800, color: INK, whiteSpace: "nowrap" }}>
          {typed(t.query, typeP)}
          <Caret f={f} on={typeP < 1} />
        </span>
      </div>
      {resP > 0 ? (
        <div style={box({ left: 30, right: 30, top: 220, display: "flex", flexDirection: "column", gap: 22, opacity: resP, translate: `0 ${(1 - resP) * 30}px` })}>
          <div style={{ padding: "28px 26px", borderRadius: 26, backgroundColor: "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,90,0.14)", border: `3px solid ${press > 0 ? C.yellow : "#E8ECF3"}`, display: "flex", gap: 22, alignItems: "center", scale: `${1 - 0.03 * press}` }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: 104, height: 104, borderRadius: 52, objectFit: "cover", flex: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: INK }}>{t.resultTitle}</div>
              <div style={{ fontSize: 27, fontWeight: 700, color: C.inkSoft }}>{t.resultSub}</div>
            </div>
          </div>
          {t.other.map((o) => (
            <div key={o} style={{ padding: "26px 26px", borderRadius: 22, backgroundColor: "#F6F8FB", fontSize: 28, fontWeight: 700, color: "#8A94AA" }}>
              {o}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

// Сайт BalaGo: шапка, полоса «Алгач ылайыктуу топ издөө», форма арыза.
// Раскладка абсолютная (SITE_Y — центры полей для касаний пальцем).
// fills — доли набора: дарек, жер, убакыт (два поля времени подряд);
// consent — галочка согласия (мама ставит сама), press — кнопка.
export const SITE_Y = { fields: [524, 628, 732, 836], consent: 900, button: 976 } as const;
export const SiteScreen: React.FC<{ readonly f: number; readonly fills: readonly [number, number, number]; readonly consent: number; readonly press: number }> = ({ f, fills, consent, press }) => {
  const t = BG40_TEXT.search;
  // убакыт: сначала начало уроков, потом конец
  const vals = [fills[0], fills[1], clamp01(fills[2] * 2), clamp01(fills[2] * 2 - 1)];
  const active = vals.findIndex((v) => v > 0 && v < 1);
  const fieldsAll = [...t.fields, ...t.times];
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden" })}>
      <StatusBar time={t.clock[1]} />
      {/* шапка */}
      <div style={box({ left: 0, right: 0, top: 70, height: 100, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", background: "linear-gradient(180deg, #EEF6FF, #FFFFFF)" })}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 76, height: 76, borderRadius: 38, objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: INK, lineHeight: 1.05 }}>BalaGo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: BRAND }}>{t.siteBadge}</div>
        </div>
      </div>
      {/* полоса «Алгач ылайыктуу топ издөө» */}
      <div style={box({ left: 22, right: 22, top: 180, height: 66, borderRadius: 18, backgroundColor: "#FFF7B3", color: "#8F6500", fontSize: 27, fontWeight: 900, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", boxSizing: "border-box", whiteSpace: "nowrap" })}>
        <svg width={34} height={34} viewBox="0 0 24 24" style={{ flex: "none" }}>
          <circle cx={8} cy={9} r={3.4} fill="#8F6500" />
          <circle cx={16} cy={9} r={3.4} fill="#8F6500" opacity={0.7} />
          <path d="M2 20c.6-3.4 3-5 6-5s5.4 1.6 6 5zM12.5 15.6c1-.4 2.2-.6 3.5-.6 3 0 5.4 1.6 6 5h-7.6" fill="#8F6500" />
        </svg>
        {t.banner}
      </div>
      {/* карточка формы */}
      <div style={box({ left: 18, right: 18, top: 262, height: 784, borderRadius: 24, backgroundColor: "#FFFFFF", boxShadow: "0 10px 30px rgba(20,40,90,0.12)" })} />
      <div style={box({ left: 38, top: 278, fontSize: 28, fontWeight: 900, color: INK, whiteSpace: "nowrap" })}>{t.formTitle}</div>
      {t.filled.map(([l, v], i) => (
        <div key={l} style={box({ left: 38 + (i % 2) * 236, top: 326 + Math.floor(i / 2) * 64, width: 226, height: 56, padding: "5px 12px", borderRadius: 12, backgroundColor: "#F4FBF6", border: "2px solid #BFD7C6", boxSizing: "border-box" })}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.inkSoft, whiteSpace: "nowrap" }}>{l}</div>
          <div style={{ fontSize: 21, fontWeight: 900, color: INK, whiteSpace: "nowrap" }}>{v}</div>
        </div>
      ))}
      {fieldsAll.map(([label, value], i) => {
        const y = SITE_Y.fields[i];
        const p = vals[i];
        return (
          <div key={label}>
            <div style={box({ left: 40, top: y - 62, fontSize: 22, fontWeight: 800, color: C.inkSoft, whiteSpace: "nowrap" })}>{label}</div>
            <div style={box({ left: 38, right: 38, top: y - 30, height: 60, borderRadius: 14, border: `3px solid ${active === i ? BRAND : p >= 1 ? "#BFD7C6" : "#DCE2EC"}`, backgroundColor: p >= 1 ? "#F4FBF6" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", boxSizing: "border-box" })}>
              <span style={{ fontSize: 28, fontWeight: 800, color: INK, whiteSpace: "nowrap" }}>
                {typed(value, p)}
                {active === i ? <Caret f={f} /> : null}
              </span>
              {p >= 1 ? <span style={{ fontSize: 28, fontWeight: 900, color: C.green }}>✓</span> : null}
            </div>
          </div>
        );
      })}
      {/* согласие на обработку данных */}
      <div style={box({ left: 40, right: 30, top: SITE_Y.consent - 18, display: "flex", alignItems: "center", gap: 12, fontSize: 21, fontWeight: 700, color: C.inkSoft, whiteSpace: "nowrap" })}>
        <span style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: consent >= 1 ? BRAND : "#FFFFFF", border: `3px solid ${BRAND}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", flex: "none", scale: `${1 + 0.15 * Math.sin(Math.PI * clamp01(consent))}` }}>
          {consent >= 1 ? (
            <svg width={22} height={22} viewBox="0 0 24 24">
              <path d="M4 12.5l5 5L20 6.5" stroke="#FFFFFF" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </span>
        {t.consent}
      </div>
      {/* кнопка */}
      <div style={box({ left: 38, right: 38, top: SITE_Y.button - 40, height: 80, borderRadius: 40, backgroundColor: press > 0 ? "#164EA8" : BRAND, color: "#FFFFFF", fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", scale: `${1 - 0.05 * press}`, boxShadow: "0 10px 22px rgba(26,99,214,0.35)" })}>
        {t.button}
      </div>
    </div>
  );
};

// WhatsApp: чат BalaGo, подготовленный текст в поле ввода; после sent —
// сообщение в чате с двумя серыми галочками (отправлено, ответа нет).
export const WaScreen: React.FC<{ readonly f: number; readonly open: number; readonly press: number; readonly sent: number }> = ({ open, press, sent }) => {
  const t = BG40_TEXT.search;
  const msg = (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {t.message.map((l, i) => (
        <div key={i} style={{ fontSize: i === 0 ? 26 : 25, fontWeight: i === 0 ? 800 : 700, color: "#111B21", lineHeight: 1.25 }}>
          {l}
        </div>
      ))}
    </div>
  );
  return (
    <div style={box({ inset: 0, backgroundColor: C.waBg, fontFamily, overflow: "hidden", opacity: clamp01(open * 1.5) })}>
      {/* шапка чата */}
      <div style={box({ left: 0, right: 0, top: 0, height: 190, backgroundColor: "#008069" })}>
        <StatusBar time={t.clock[2]} dark />
        <div style={box({ left: 26, right: 26, top: 80, height: 92, display: "flex", alignItems: "center", gap: 18 })}>
          <div style={{ fontSize: 44, color: "#FFFFFF", fontWeight: 700 }}>‹</div>
          <Img src={staticFile("assets/logo.png")} style={{ width: 80, height: 80, borderRadius: 40, objectFit: "cover", border: "3px solid #FFFFFF" }} />
          <div style={{ fontSize: 38, fontWeight: 900, color: "#FFFFFF" }}>{t.chatName}</div>
        </div>
      </div>
      {/* фон чата */}
      <div style={box({ left: 0, right: 0, top: 190, bottom: 0, backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 2px, transparent 2px)", backgroundSize: "34px 34px" })} />
      {/* подсказка */}
      <div style={box({ left: 30, right: 30, top: 214, padding: "14px 18px", borderRadius: 18, backgroundColor: "#FFF5C4", color: "#5E4B00", fontSize: 31, fontWeight: 900, textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" })}>{t.chatHint}</div>
      {/* отправленное сообщение */}
      {sent > 0 ? (
        <div style={box({ right: 22, top: 330 + (1 - sent) * 520, width: 470, padding: "18px 20px 12px", borderRadius: "22px 6px 22px 22px", backgroundColor: "#D9FDD3", boxShadow: "0 2px 3px rgba(0,0,0,0.12)", opacity: clamp01(sent * 2) })}>
          {msg}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 6, fontSize: 20, fontWeight: 700, color: "#667781" }}>
            {t.clock[2]}
            <svg width={30} height={18} viewBox="0 0 30 18">
              <path d="M2 10l5 5L17 4M11 14l2 1L23 4" stroke="#8696A0" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : null}
      {/* поле ввода с подготовленным текстом */}
      <div style={box({ left: 16, right: 16, bottom: 26, display: "flex", alignItems: "flex-end", gap: 14 })}>
        <div style={{ flex: 1, padding: "18px 20px", borderRadius: 28, backgroundColor: "#FFFFFF", boxShadow: "0 2px 4px rgba(0,0,0,0.12)", opacity: 1 - clamp01(sent * 3) * 0.85 }}>
          {sent < 0.3 ? msg : <div style={{ fontSize: 26, color: "#8696A0", fontWeight: 700 }}>…</div>}
        </div>
        <div style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: "#00A884", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", scale: `${1 - 0.12 * press}`, boxShadow: press > 0 ? "0 0 0 14px rgba(0,168,132,0.25)" : "0 4px 8px rgba(0,0,0,0.15)" }}>
          <svg width={44} height={44} viewBox="0 0 24 24">
            <path d="M3 20l18-8L3 4l2.5 6.8L14 12l-8.5 1.2z" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Палец, который нажимает на экран (появляется у точки касания).
export const TapThumb: React.FC<{ readonly x: number; readonly y: number; readonly a: number; readonly press: number }> = ({ x, y, a, press }) =>
  a <= 0 ? null : (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity: a, pointerEvents: "none" })}>
      {press > 0 ? <circle cx={x} cy={y} r={34 + 30 * press} fill="none" stroke={C.yellow} strokeWidth={6} opacity={1 - press} /> : null}
      <g transform={`translate(${x + 8} ${y + 10 - 8 * press}) rotate(-28)`}>
        <line x1={0} y1={30} x2={0} y2={420} stroke={C.skinShade} strokeWidth={96} strokeLinecap="round" />
        <line x1={0} y1={30} x2={0} y2={420} stroke={C.skin} strokeWidth={90} strokeLinecap="round" />
        <ellipse cx={0} cy={46} rx={30} ry={34} fill="#F3CDB0" opacity={0.9} />
      </g>
    </svg>
  );

// Рука, держащая телефон снизу: ладонь и рукав — за корпусом (part
// "back", рисуется до телефона), кончики пальцев по правому краю и
// большой палец у нижнего левого угла — поверх (part "front").
// Экран не закрывается. (x, y, w) — как у PhoneFrame.
export const PhoneHand: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly part: "back" | "front" }> = ({ x, y, w, part }) => {
  const h = w * 2.05;
  if (part === "back")
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
        <line x1={x + w * 0.52} y1={y + h * 0.9} x2={x + w * 0.62} y2={y + h + 900} stroke={C.tealDark} strokeWidth={w * 0.56 + 10} strokeLinecap="round" />
        <line x1={x + w * 0.52} y1={y + h * 0.9} x2={x + w * 0.62} y2={y + h + 900} stroke={C.teal} strokeWidth={w * 0.56} strokeLinecap="round" />
        <rect x={x + w * 0.24} y={y + h * 0.98} width={w * 0.56} height={w * 0.12} rx={w * 0.05} fill="#F5EADB" transform={`rotate(4 ${x + w * 0.5} ${y + h})`} />
        <ellipse cx={x + w * 0.52} cy={y + h * 0.9} rx={w * 0.4} ry={w * 0.3} fill={C.skinShade} />
        <ellipse cx={x + w * 0.52} cy={y + h * 0.9} rx={w * 0.385} ry={w * 0.285} fill={C.skin} />
      </svg>
    );
  const tip = (cx: number, cy: number, rot: number, k: number) => (
    <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
      <rect x={cx - 26} y={cy - 22} width={52} height={44} rx={22} fill={C.skinShade} />
      <rect x={cx - 24} y={cy - 20} width={48} height={40} rx={20} fill={C.skin} />
      <ellipse cx={cx - 8} cy={cy} rx={8} ry={10} fill="#F3CDB0" opacity={0.9} />
    </g>
  );
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
      {[0.6, 0.68, 0.76, 0.84].map((k, i) => tip(x + w + 4, y + h * k, -8, i))}
      {/* большой палец у нижнего левого угла */}
      <line x1={x - 22} y1={y + h * 0.99} x2={x + 6} y2={y + h * 0.92} stroke={C.skinShade} strokeWidth={66} strokeLinecap="round" />
      <line x1={x - 22} y1={y + h * 0.99} x2={x + 6} y2={y + h * 0.92} stroke={C.skin} strokeWidth={60} strokeLinecap="round" />
      <ellipse cx={x + 8} cy={y + h * 0.915} rx={14} ry={16} fill="#F3CDB0" opacity={0.9} />
    </svg>
  );
};
