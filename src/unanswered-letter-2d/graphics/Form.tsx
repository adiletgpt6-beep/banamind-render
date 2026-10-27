// Нейтральная 2D-иллюстрация страницы предварительной заявки BalaGo
// (сервис готовится к запуску: в шапке — «Алдын ала каттоо жүрүп жатат»).
// Перед страницей — поиск решения (SearchPage). На странице BalaGo —
// Бишкек и оба направления услуги («Үй → Мектеп», «Мектеп → Үй»). В заявке
// поля «Үй дареги», «Мектеп», «Сабактын убактысы» заполняются по очереди
// (личные данные скрыты точками), семья выбирает свой маршрут
// «Мектеп → Үй» среди трёх вариантов → кнопка становится активной → нажатие →
// «Алдын ала арыз кабыл алынды» и пояснение, что маршрут и время уточнят
// позже (поездка не подтверждена). Без цен, водителей и оплаты.
import { Logo } from "../../components/Logo";
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { C } from "../theme";
import { Icon, type IconId } from "./Icons";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const FIELD_ICON: readonly IconId[] = ["home", "school", "clock"];

export type FormView = {
  readonly fills: readonly [number, number, number]; // 0…1 заполнение полей
  readonly route: number; // 0…1 появление выбора маршрута
  readonly choose: number; // 0…1 выбран маршрут семьи
  readonly ready: number; // 0…1 кнопка становится активной
  readonly hover: number;
  readonly press: number;
  readonly sent: number;
};

// Координаты для указателя (px страницы, ширина w = 892).
const FIELD_Y = (i: number) => 184 + i * 118;
export const FORM_GEOM = { fieldY: (i: number) => FIELD_Y(i) + 82, buttonY: 680, buttonX: 446, chipY: 622, chipX: (i: number) => 32 + [140, 430, 700][i] } as const;

export const FormPage: React.FC<{ readonly w: number; readonly h: number; readonly v: FormView }> = ({ w, h, v }) => {
  const p = UL2_TEXT.page;
  const sent = easeOut(clamp(v.sent));
  const ready = clamp(v.ready);
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#F4F6FA", fontFamily, color: C.ink, overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: w, height: 104, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 18, padding: "0 28px", boxSizing: "border-box", boxShadow: "0 4px 14px rgba(20,30,60,0.08)" })}>
        <Logo size={74} style={{ boxShadow: "none" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{p.brand}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.inkSoft }}>{p.tagline}</div>
        </div>
        <div style={{ padding: "8px 18px", borderRadius: 999, backgroundColor: "#FFF6D6", border: `3px solid ${C.yellow}`, fontSize: 24, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>{p.status}</div>
      </div>
      <div style={box({ left: 32, top: 118, fontSize: 52, fontWeight: 900 })}>{p.title}</div>
      {p.fields.map(([label, value], i) => {
        const typed = clamp(v.fills[i]);
        const n = Math.round([...value].length * typed);
        return (
          <div key={label} style={box({ left: 32, right: 32, top: FIELD_Y(i) })}>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.inkSoft, marginBottom: 4 }}>{label}</div>
            <div style={{ height: 76, borderRadius: 20, backgroundColor: "#FFFFFF", border: `4px solid ${typed > 0 && typed < 1 ? C.yellow : typed >= 1 ? "#9FD1B4" : "#DCE3EE"}`, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", fontSize: 42, fontWeight: 900 }}>
              <Icon id={FIELD_ICON[i]} size={42} color={typed > 0 ? C.ink : "#B6C1D0"} stroke={4} />
              <span>{[...value].slice(0, n).join("")}</span>
              {typed >= 1 ? <Icon id="check" size={38} color={C.green} stroke={5} style={{ marginLeft: "auto" }} /> : null}
            </div>
          </div>
        );
      })}
      {/* маршрут: три варианта, семья выбирает «Мектеп → Үй» */}
      <div style={box({ left: 32, right: 32, top: 548, opacity: easeOut(v.route), translate: `0 ${(1 - easeOut(v.route)) * 12}px` })}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, fontSize: 30, fontWeight: 800, color: C.inkSoft, marginBottom: 6 }}>
          {p.routeLabel}
          <span style={{ fontSize: 26, color: "#B08A10", opacity: clamp(v.choose) }}>· {p.chosenNote}</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {p.routes.map((r, i) => {
            const on = i === p.chosen ? clamp(v.choose) : 0;
            return (
              <div key={r} style={{ flex: i === 2 ? 0.8 : 1, height: 70, borderRadius: 18, backgroundColor: on > 0.5 ? "#FFF6D6" : "#FFFFFF", border: `4px solid ${on > 0.5 ? C.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 30, fontWeight: 900, color: on > 0.5 || i !== p.chosen ? C.ink : C.ink, scale: `${1 + 0.04 * Math.sin(Math.PI * on)}`, whiteSpace: "nowrap" }}>
                {on > 0.5 ? <Icon id="check" size={30} color={C.green} stroke={5} /> : null}
                {r}
              </div>
            );
          })}
        </div>
      </div>
      {/* кнопка: неактивна → активна → нажатие; затем статус заявки */}
      <div style={box({ left: 32, right: 32, top: 684, height: 96, borderRadius: 999, backgroundColor: ready > 0.5 ? C.yellow : "#E3E8EF", color: ready > 0.5 ? C.ink : "#9AA6B6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 900, scale: `${1 - 0.05 * clamp(v.press) + 0.03 * Math.sin(Math.PI * ready)}`, opacity: 1 - sent, boxShadow: v.hover > 0.4 ? "0 10px 24px rgba(224,181,32,0.45)" : "none" })}>{p.send}</div>
      <div style={box({ left: 32, right: 32, top: 676, height: 140, borderRadius: 30, backgroundColor: "#FFFFFF", border: `5px solid ${C.green}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: sent, scale: `${0.96 + 0.04 * sent}` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon id="check" size={44} color="#FFFFFF" stroke={5} />
          </div>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{p.sent}</div>
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.inkSoft }}>{p.sentNote}</div>
      </div>
    </div>
  );
};

// Страница BalaGo (иллюстрация): шапка с логотипом, «Бишкек · Балдар
// үчүн такси», статус «Алдын ала каттоо жүрүп жатат», оба направления
// услуги (утром «Үй → Мектеп», после уроков «Мектеп → Үй») и кнопка
// «Алдын ала арыз». Без цен, дат, водителей и функций приложения.
// route — подсветка направлений, press — нажатие кнопки.
export const PAGE_BUTTON = { x: 446, y: 640 } as const;
const RouteRow: React.FC<{ when: string; from: [IconId, string]; to: [IconId, string]; hl: number }> = ({ when, from, to, hl }) => (
  <div style={{ height: 118, borderRadius: 24, backgroundColor: "#FFFFFF", border: `4px solid ${hl > 0.5 ? C.yellow : "#DCE3EE"}`, boxShadow: hl > 0.05 ? `0 0 0 ${8 * hl}px rgba(255,211,61,0.22)` : "none", display: "flex", alignItems: "center", gap: 18, padding: "0 26px" }}>
    <div style={{ width: 210, fontSize: 30, fontWeight: 800, color: C.inkSoft, lineHeight: 1.1 }}>{when}</div>
    <Icon id={from[0]} size={46} color={C.ink} stroke={4} />
    <span style={{ fontSize: 40, fontWeight: 900 }}>{from[1]}</span>
    <span style={{ fontSize: 40, fontWeight: 900, color: "#C79A12" }}>→</span>
    <Icon id={to[0]} size={46} color={C.ink} stroke={4} />
    <span style={{ fontSize: 40, fontWeight: 900 }}>{to[1]}</span>
  </div>
);
export const BalaGoPage: React.FC<{ readonly w: number; readonly h: number; readonly route: number; readonly hover: number; readonly press: number }> = ({ w, h, route, hover, press }) => {
  const p = UL2_TEXT.page;
  const sv = UL2_TEXT.service;
  const r = clamp(route);
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#F4F6FA", fontFamily, color: C.ink, overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: w, height: 104, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 18, padding: "0 28px", boxSizing: "border-box", boxShadow: "0 4px 14px rgba(20,30,60,0.08)" })}>
        <Logo size={74} style={{ boxShadow: "none" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{p.brand}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.inkSoft }}>{p.tagline}</div>
        </div>
      </div>
      <div style={box({ left: 32, right: 32, top: 128, fontSize: 50, fontWeight: 900, lineHeight: 1.1 })}>{p.city}</div>
      <div style={box({ left: 32, top: 196, padding: "8px 20px", borderRadius: 999, backgroundColor: "#FFF6D6", border: `3px solid ${C.yellow}`, fontSize: 28, fontWeight: 900 })}>{p.status}</div>
      {/* оба направления услуги */}
      <div style={box({ left: 32, right: 32, top: 268, display: "flex", flexDirection: "column", gap: 14 })}>
        <RouteRow when={sv.morning} from={["home", UL2_TEXT.home]} to={["school", UL2_TEXT.school]} hl={clamp(r * 2)} />
        <RouteRow when={sv.after} from={["school", UL2_TEXT.school]} to={["home", UL2_TEXT.home]} hl={clamp(r * 2 - 1)} />
      </div>
      {/* кнопка предварительной заявки */}
      <div style={box({ left: 32, right: 32, top: PAGE_BUTTON.y - 50, height: 100, borderRadius: 999, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 900, scale: `${1 - 0.05 * clamp(press)}`, boxShadow: hover > 0.4 ? "0 10px 24px rgba(224,181,32,0.45)" : "none" })}>{p.title}</div>
    </div>
  );
};

// Поиск решения (иллюстрация поисковой страницы без бренда поисковика):
// запрос набирается (typed 0…1), появляются результаты — нейтральные
// серые строки и BalaGo; hl — подсветка результата BalaGo, press — нажатие.
export const SEARCH_RESULT = { x: 446, y: 300 } as const;
export const SearchPage: React.FC<{ readonly w: number; readonly h: number; readonly typed: number; readonly results: number; readonly hl: number; readonly press: number }> = ({ w, h, typed, results, hl, press }) => {
  const q = UL2_TEXT.search.query;
  const n = Math.round([...q].length * clamp(typed));
  const res = (k: number) => easeOut(clamp(results * 3 - k));
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#FFFFFF", fontFamily, color: C.ink, overflow: "hidden" })}>
      <div style={box({ left: 32, right: 32, top: 40, height: 96, borderRadius: 48, border: "4px solid #DCE3EE", display: "flex", alignItems: "center", gap: 18, padding: "0 30px", fontSize: 36, fontWeight: 800 })}>
        <svg width={40} height={40} viewBox="0 0 24 24">
          <circle cx={10} cy={10} r={7} stroke={C.inkSoft} strokeWidth={2.6} fill="none" />
          <path d="M 15.5 15.5 L 21 21" stroke={C.inkSoft} strokeWidth={2.6} strokeLinecap="round" />
        </svg>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{[...q].slice(0, n).join("")}</span>
        <span style={{ width: 3, height: 40, backgroundColor: typed < 1 ? "#2F6FD6" : "transparent" }} />
      </div>
      {/* результат BalaGo — первым */}
      <div style={box({ left: 32, right: 32, top: SEARCH_RESULT.y - 70, height: 140, borderRadius: 26, backgroundColor: hl > 0.5 ? "#FFF6D6" : "#F7F9FC", border: `4px solid ${hl > 0.5 ? C.yellow : "#E6EBF2"}`, display: "flex", alignItems: "center", gap: 20, padding: "0 26px", opacity: res(0), translate: `0 ${(1 - res(0)) * 14}px`, scale: `${1 - 0.03 * clamp(press)}` })}>
        <Logo size={84} style={{ boxShadow: "none" }} />
        <div>
          <div style={{ fontSize: 40, fontWeight: 900 }}>{UL2_TEXT.page.brand}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.inkSoft }}>{UL2_TEXT.page.city}</div>
        </div>
      </div>
      {/* прочие результаты — нейтральные строки без текста */}
      {[0, 1, 2].map((k) => (
        <div key={k} style={box({ left: 32, right: 32, top: 400 + k * 130, height: 110, borderRadius: 22, backgroundColor: "#F7F9FC", border: "3px solid #EEF1F6", padding: "22px 26px", boxSizing: "border-box", opacity: res(k + 1) * 0.9 })}>
          <div style={{ width: [420, 360, 480][k], height: 22, borderRadius: 11, backgroundColor: "#CBD3DF" }} />
          <div style={{ width: [600, 520, 560][k], height: 16, borderRadius: 8, backgroundColor: "#E2E7EE", marginTop: 16 }} />
        </div>
      ))}
    </div>
  );
};
