import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";
import { fontFamily } from "../fonts";
import { MapView, INK, SCREEN_H, SCREEN_W } from "./props";
import { MS_TEXT } from "./script";

const T = MS_TEXT.app;
const GREY = "#5B6B82";

// Нейтральное приложение такси (вымышленное: серо-синий интерфейс без
// логотипов и фирменных цветов реальных сервисов).
export type AppState =
  | "order"
  | "searching"
  | "found"
  | "calling"
  | "cancelled"
  | "eta";

export const TaxiApp: React.FC<{
  readonly state: AppState;
  readonly car?: { x: number; y: number; angle?: number };
  readonly zoom?: number;
  readonly pressed?: number; // 0…1 — нажатие кнопки
  readonly spinner?: number; // кадр для анимации
  readonly ring?: number; // 0…1 — пульс при звонке
  readonly jam?: boolean;
}> = ({ state, car, zoom = 1, pressed = 0, spinner = 0, ring = 0, jam }) => {
  const mapH = 700;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F4F6F9", fontFamily }}>
      {/* шапка */}
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, height: 130, backgroundColor: "#FFFFFF", display: "flex", alignItems: "flex-end", padding: "0 36px 18px", boxSizing: "border-box", fontSize: 44, fontWeight: 900, color: GREY }}>
        <svg width={50} height={50} viewBox="0 0 50 50" style={{ marginRight: 14 }}>
          <rect x={4} y={14} width={42} height={24} rx={8} fill={GREY} />
          <circle cx={14} cy={40} r={6} fill={INK} />
          <circle cx={36} cy={40} r={6} fill={INK} />
        </svg>
        {T.title}
      </div>
      {/* карта */}
      <div style={{ position: "absolute", left: 0, top: 130, width: SCREEN_W, height: mapH }}>
        <MapView
          width={SCREEN_W}
          height={mapH}
          home={{ x: 290, y: 420 }}
          car={state === "order" || state === "searching" || state === "cancelled" ? undefined : car}
          zoom={zoom}
          jam={jam}
        />
        {state === "calling" ? (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(30,42,68,0.55)" }} />
        ) : null}
      </div>
      {/* нижняя панель */}
      <div style={{ position: "absolute", left: 0, top: 130 + mapH - 40, width: SCREEN_W, height: SCREEN_H - 130 - mapH + 40, borderRadius: "40px 40px 0 0", backgroundColor: "#FFFFFF", boxShadow: "0 -10px 30px rgba(20,40,90,0.10)", padding: "34px 36px", boxSizing: "border-box" }}>
        {/* маршрут */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 800, color: INK }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: INK }} />
          {T.from}
          <span style={{ color: "#9AA6B6" }}>→</span>
          <span style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: COLORS.yellow }} />
          {T.to}
        </div>
        <div style={{ marginTop: 30 }}>
          {state === "order" ? (
            <BigButton label={T.order} pressed={pressed} />
          ) : state === "searching" ? (
            <Status text={T.searching} spinner={spinner} />
          ) : state === "found" || state === "eta" ? (
            <div>
              <Status text={state === "eta" ? T.arriving : T.found} done />
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22 }}>
                <Avatar />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 200, height: 22, borderRadius: 11, backgroundColor: "#DCE3EC" }} />
                  <div style={{ width: 130, height: 18, borderRadius: 9, backgroundColor: "#E9EEF3", marginTop: 12 }} />
                </div>
                {state === "eta" ? (
                  <div style={{ padding: "12px 22px", borderRadius: 999, backgroundColor: INK, color: "#FFFFFF", fontSize: 40, fontWeight: 900 }}>{T.eta}</div>
                ) : (
                  <CallButton />
                )}
              </div>
            </div>
          ) : state === "calling" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: -14 * ring, borderRadius: 999, border: `6px solid rgba(91,107,130,${1 - ring})` }} />
                <Avatar />
              </div>
              <div style={{ fontSize: 44, fontWeight: 900 }}>{T.calling}</div>
            </div>
          ) : (
            <BigButton label={T.cancel} pressed={pressed} ghost />
          )}
        </div>
        {state === "found" || state === "calling" ? (
          <div style={{ marginTop: 26 }}>
            <BigButton label={T.cancel} pressed={state === "calling" ? 0 : pressed} ghost small />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BigButton: React.FC<{
  label: string;
  pressed: number;
  ghost?: boolean;
  small?: boolean;
}> = ({ label, pressed, ghost, small }) => (
  <div
    style={{
      height: small ? 84 : 110,
      borderRadius: 28,
      backgroundColor: ghost ? "#FFFFFF" : GREY,
      border: ghost ? `5px solid ${GREY}` : undefined,
      color: ghost ? GREY : "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: small ? 38 : 48,
      fontWeight: 900,
      scale: `${1 - 0.05 * pressed}`,
      filter: pressed > 0 ? `brightness(${1 - 0.15 * pressed})` : undefined,
      boxSizing: "border-box",
    }}
  >
    {label}
  </div>
);

const Status: React.FC<{ text: string; spinner?: number; done?: boolean }> = ({
  text,
  spinner = 0,
  done,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 900, color: INK, whiteSpace: "nowrap" }}>
    {done ? (
      <svg width={48} height={48} viewBox="0 0 48 48">
        <circle cx={24} cy={24} r={22} fill={GREY} />
        <path d="M 13 25 L 21 33 L 35 16" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg width={48} height={48} viewBox="0 0 48 48" style={{ rotate: `${spinner * 9}deg` }}>
        <circle cx={24} cy={24} r={18} stroke="#DCE3EC" strokeWidth={7} fill="none" />
        <path d="M 24 6 A 18 18 0 0 1 42 24" stroke={GREY} strokeWidth={7} fill="none" strokeLinecap="round" />
      </svg>
    )}
    {text}
  </div>
);

const Avatar: React.FC = () => (
  <svg width={96} height={96} viewBox="0 0 96 96">
    <circle cx={48} cy={48} r={46} fill="#DCE3EC" />
    <circle cx={48} cy={38} r={18} fill="#9AA6B6" />
    <path d="M 16 82 Q 48 50 80 82" fill="#9AA6B6" />
  </svg>
);

const CallButton: React.FC = () => (
  <svg width={96} height={96} viewBox="0 0 96 96">
    <circle cx={48} cy={48} r={46} fill={GREY} />
    <path d="M 34 28 Q 28 30 28 38 Q 32 58 58 68 Q 66 68 68 62 L 60 54 L 52 58 Q 42 52 38 44 L 42 36 Z" fill="#FFFFFF" />
  </svg>
);

// ---------- Лента соцсети с рекламой BalaGo ----------
export const Feed: React.FC<{
  readonly scroll: number; // сдвиг ленты, px
  readonly adY: number; // положение рекламы в ленте (px от верха ленты)
  readonly pressed?: number;
}> = ({ scroll, adY, pressed = 0 }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#F4F6F9", fontFamily, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: -scroll, width: SCREEN_W }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 24, top: 120 + i * 560, width: SCREEN_W - 48, height: 520, borderRadius: 30, backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 22 }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: ["#F2C6B6", "#CFE3F5", "#D5EBD0", "#F7E3B0", "#E3D5F2", "#F2C6B6"][i] }} />
            <div style={{ width: 160, height: 20, borderRadius: 10, backgroundColor: "#DCE3EC" }} />
          </div>
          <div style={{ margin: "0 22px", height: 330, borderRadius: 20, backgroundColor: ["#E9EEF3", "#F3E9DF", "#E6F0E4", "#EEF0F5", "#F5EBDD", "#E9EEF3"][i] }} />
          <div style={{ margin: "22px", width: 300, height: 18, borderRadius: 9, backgroundColor: "#E9EEF3" }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 24, top: adY, width: SCREEN_W - 48 }}>
        <BalaGoAd pressed={pressed} />
      </div>
    </div>
  </div>
);

export const BalaGoAd: React.FC<{ pressed?: number }> = ({ pressed = 0 }) => {
  const A = MS_TEXT.ad;
  return (
    <div style={{ borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 14px 40px rgba(20,40,90,0.16)", overflow: "hidden", border: `6px solid ${COLORS.yellow}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, overflow: "hidden", backgroundColor: "#FFFFFF", border: "3px solid #E9EEF3" }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 900 }}>BalaGo</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#7A879A" }}>{A.sponsored}</div>
        </div>
      </div>
      <div style={{ margin: "0 24px", padding: "30px 26px", borderRadius: 24, backgroundColor: COLORS.yellowSoft }}>
        <div style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.1 }}>{A.tagline}</div>
        <div style={{ marginTop: 16, fontSize: 42, fontWeight: 900, color: COLORS.navySoft }}>{A.route}</div>
        <div style={{ marginTop: 16, display: "inline-block", padding: "10px 20px", borderRadius: 999, backgroundColor: INK, color: "#FFFFFF", fontSize: 32, fontWeight: 800 }}>{A.status}</div>
      </div>
      <div style={{ margin: 24, height: 96, borderRadius: 26, backgroundColor: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 44, fontWeight: 900, scale: `${1 - 0.05 * pressed}` }}>
        <svg width={44} height={44} viewBox="0 0 96 96">
          <path d="M 34 28 Q 28 30 28 38 Q 32 58 58 68 Q 66 68 68 62 L 60 54 L 52 58 Q 42 52 38 44 L 42 36 Z" fill={INK} transform="translate(-6 -2) scale(1.15)" />
        </svg>
        {A.button}
      </div>
    </div>
  );
};

// Экран звонка (BalaGo или водитель).
export const CallScreen: React.FC<{
  readonly name: string;
  readonly status: string;
  readonly brand?: boolean;
  readonly ring?: number;
}> = ({ name, status, brand, ring = 0 }) => (
  <div style={{ position: "absolute", inset: 0, background: brand ? `linear-gradient(${INK}, #2A3F78)` : "linear-gradient(#3A4664, #5B6B82)", fontFamily, color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ marginTop: 220, position: "relative", width: 260, height: 260 }}>
      <div style={{ position: "absolute", inset: -30 * ring, borderRadius: 999, border: `8px solid rgba(255,201,14,${(1 - ring) * 0.8})` }} />
      <div style={{ width: 260, height: 260, borderRadius: 130, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
        {brand ? (
          <Img src={staticFile(ASSETS.logo)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : null}
      </div>
    </div>
    <div style={{ marginTop: 50, fontSize: 70, fontWeight: 900 }}>{name}</div>
    <div style={{ marginTop: 16, fontSize: 44, fontWeight: 700, opacity: 0.85 }}>{status}</div>
  </div>
);

// Карточка предварительной записи (без «водитель назначен» и гарантий).
export const FormCard: React.FC<{ readonly fill: number; readonly note: number }> = ({ fill, note }) => {
  const F = MS_TEXT.form;
  const row = (label: string, value: string, k: number) => {
    const t = Math.max(0, Math.min(1, fill * 2 - k));
    const shown = value.slice(0, Math.round(value.length * t));
    return (
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#7A879A" }}>{label}</div>
        <div style={{ marginTop: 8, height: 78, borderRadius: 20, border: `4px solid ${t > 0 ? COLORS.yellow : "#DCE3EC"}`, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 42, fontWeight: 900, color: INK }}>
          {shown}
        </div>
      </div>
    );
  };
  return (
    <div style={{ width: 760, padding: "34px 40px 40px", borderRadius: 40, backgroundColor: "#FFFFFF", boxShadow: "0 24px 60px rgba(20,40,90,0.22)", fontFamily, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, overflow: "hidden", border: "3px solid #E9EEF3" }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: 50, fontWeight: 900, color: INK }}>{F.title}</div>
      </div>
      {row(F.route, F.routeValue, 0)}
      {row(F.time, F.timeValue, 1)}
      <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, fontSize: 38, fontWeight: 900, color: COLORS.navySoft, opacity: note }}>
        <svg width={44} height={44} viewBox="0 0 48 48">
          <circle cx={24} cy={24} r={22} fill={COLORS.yellow} />
          <path d="M 14 24 L 21 31 L 34 17" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {F.note}
      </div>
    </div>
  );
};
