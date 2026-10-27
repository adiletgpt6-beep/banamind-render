// Мамин телефон (сцены 9 и 12). PhoneFrame — современный телефон (тёмная
// рамка, скругления, лёгкий блик) с любым содержимым экрана; экран
// рассчитан на 390 × 844 css px и масштабируется в рамку ширины w.
// Содержимое экрана: PhoneAdList — список требований объявления с
// янтарным пунктом о вождении (сц. 9), PhoneCalendar — день «Эртең» с
// событием «сыноо күнү» (сц. 12, тот же стиль, что CalendarCard).
import { clamp, easeOut } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS } from "../theme";
import { mix } from "../ui/AdCard";
import { CalendarEvent, CalendarGlyph, HourLines } from "../ui/CalendarCard";

export const SCREEN_W = 390;
export const SCREEN_H = 844;
const BEZEL = 14;
const BODY_W = SCREEN_W + 2 * BEZEL; // 418
const BODY_H = SCREEN_H + 2 * BEZEL; // 872
const BODY_R = 66;
const SCREEN_R = BODY_R - BEZEL;

// Высота рамки ширины w; масштаб экрана (css px экрана → px кадра).
export const phoneHeight = (w: number) => (BODY_H * w) / BODY_W;
export const phoneScale = (w: number) => w / BODY_W;
// Точка экрана (css px) → px от левого верхнего угла рамки (без наклона).
export const phoneScreenPoint = (w: number, sx: number, sy: number) => ({
  x: (BEZEL + sx) * phoneScale(w),
  y: (BEZEL + sy) * phoneScale(w),
});

// Значки строки состояния (без времени и надписей).
const StatusIcons: React.FC = () => (
  <svg width={70} height={20} viewBox="0 0 70 20" style={{ position: "absolute", right: 26, top: 22 }}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 6} y={14 - i * 3.6} width={4} height={4 + i * 3.6} rx={1.2} fill={C.ink} />
    ))}
    <rect x={34} y={3} width={28} height={14} rx={4} fill="none" stroke={C.ink} strokeWidth={1.6} opacity={0.55} />
    <rect x={36.5} y={5.5} width={19} height={9} rx={2.2} fill={C.ink} />
    <rect x={63.5} y={7.5} width={2.2} height={5} rx={1} fill={C.ink} opacity={0.55} />
  </svg>
);

export type PhoneFrameProps = {
  readonly w: number; // ширина рамки, px
  readonly screen: React.ReactNode; // содержимое экрана в координатах 390 × 844
  readonly tilt?: number; // поворот, градусы (вокруг центра)
  readonly x?: number;
  readonly y?: number;
  readonly style?: React.CSSProperties;
};

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ w, screen, tilt = 0, x = 0, y = 0, style }) => {
  const s = phoneScale(w);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: BODY_H * s,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BODY_W,
          height: BODY_H,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
        }}
      >
        {/* боковые кнопки */}
        <div
          style={{
            position: "absolute",
            left: -4,
            top: 178,
            width: 6,
            height: 58,
            borderRadius: 3,
            backgroundColor: "#262E3D",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -4,
            top: 250,
            width: 6,
            height: 58,
            borderRadius: 3,
            backgroundColor: "#262E3D",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -4,
            top: 214,
            width: 6,
            height: 96,
            borderRadius: 3,
            backgroundColor: "#262E3D",
          }}
        />
        {/* корпус */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: BODY_R,
            background: "linear-gradient(160deg, #343E52 0%, #1A202C 45%, #11151D 100%)",
            boxShadow: "0 40px 80px rgba(23,38,61,0.22), 0 12px 26px rgba(23,38,61,0.14), inset 0 0 0 2px rgba(255,255,255,0.10)",
          }}
        />
        {/* экран */}
        <div
          style={{
            position: "absolute",
            left: BEZEL,
            top: BEZEL,
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: SCREEN_R,
            overflow: "hidden",
            backgroundColor: C.bg,
          }}
        >
          {screen}
          <StatusIcons />
          <div
            style={{
              position: "absolute",
              left: (SCREEN_W - 112) / 2,
              top: 12,
              width: 112,
              height: 32,
              borderRadius: 999,
              backgroundColor: "#0B0E13",
            }}
          />
          {/* лёгкий блик стекла */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(122deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 31%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: (SCREEN_W - 130) / 2,
              bottom: 9,
              width: 130,
              height: 5,
              borderRadius: 999,
              backgroundColor: "rgba(23,38,61,0.35)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ---------- Экран: список требований (сц. 9) ----------
const Dot: React.FC<{ readonly amber: number; readonly lh: number }> = ({ amber, lh }) => (
  <div
    style={{
      position: "relative",
      flex: "none",
      width: 16,
      height: 16,
      marginTop: (lh - 16) / 2,
      borderRadius: 999,
      backgroundColor: mix("#EAEFF5", "#FAD9A1", amber),
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 4.5,
        top: 4.5,
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: mix(C.greyBlue, C.amberLine, amber),
      }}
    />
  </div>
);

const LIST_LH = 31;
// Переносы строк списка заданы явно (ширина текста ≤ 294 css px при 24 px):
// число слов первой строки для каждого пункта.
const cut = (s: string, n: number) => {
  const w = s.split(" ");
  return w.length > n ? [w.slice(0, n).join(" "), w.slice(n).join(" ")] : [s];
};
const ITEM_CUT = [2, 2, 2] as const;
const EXTRA_CUT = [9, 9, 2] as const;

const ListItem: React.FC<{
  readonly lines: readonly string[];
  readonly amber?: number;
}> = ({ lines, amber = 0 }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <Dot amber={amber} lh={LIST_LH} />
    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: `${LIST_LH}px`, color: C.ink, whiteSpace: "nowrap" }}>
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  </div>
);

export const PhoneAdList: React.FC<{ readonly highlight?: number }> = ({ highlight = 1 }) => {
  const hl = easeOut(clamp(highlight));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: F.text,
        color: C.ink,
        backgroundColor: C.bg,
      }}
    >
      {/* шапка приложения */}
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 70,
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <svg width={28} height={28} viewBox="0 0 28 28">
          <path d="M 17 6 L 9 14 L 17 22" fill="none" stroke={C.inkSoft} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div
          style={{
            height: 32,
            lineHeight: "32px",
            padding: "0 14px",
            borderRadius: RADIUS.chip,
            backgroundColor: "#E9EEF4",
            color: C.inkSoft,
            fontSize: 17,
            fontWeight: 800,
          }}
        >
          {EL_TEXT.ad.tag}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.inkMute }}>{EL_TEXT.ad.version}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 124,
          fontSize: 33,
          fontWeight: 900,
          letterSpacing: -0.4,
          whiteSpace: "nowrap",
        }}
      >
        {EL_TEXT.ad.title}
      </div>
      {/* карточка списка */}
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 186,
          width: SCREEN_W - 28,
          boxSizing: "border-box",
          padding: "22px 20px 24px",
          borderRadius: 22,
          backgroundColor: C.card,
          boxShadow: "0 10px 24px rgba(23,38,61,0.08), 0 2px 6px rgba(23,38,61,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {EL_TEXT.ad.items.map((t, i) => (
          <ListItem key={t} lines={cut(t, ITEM_CUT[i])} />
        ))}
        <div
          style={{
            position: "relative",
            marginTop: 6,
            marginLeft: -10,
            marginRight: -6,
            padding: "12px 6px 12px 10px",
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: C.amberSoft,
              opacity: hl,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              backgroundColor: C.amberLine,
              transform: `scaleY(${hl})`,
              transformOrigin: "50% 0",
            }}
          />
          {EL_TEXT.ad.extra.map((t, i) => (
            <div key={t} style={{ position: "relative" }}>
              <ListItem lines={cut(t, EXTRA_CUT[i])} amber={hl} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Экран: календарь (сц. 12) ----------
export const PhoneCalendar: React.FC<{ readonly add?: number }> = ({ add = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      fontFamily: F.text,
      color: C.ink,
      backgroundColor: C.card,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 74,
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <CalendarGlyph size={40} color={C.inkMute} />
      <div
        style={{
          fontSize: 50,
          fontWeight: 900,
          letterSpacing: -0.6,
          lineHeight: "64px",
        }}
      >
        {EL_TEXT.calendar.when}
      </div>
    </div>
    <HourLines x={24} y={206} w={SCREEN_W - 48} step={90} n={7} dot={8} />
    <div
      style={{
        position: "absolute",
        left: 24 + 24,
        top: 206 + 90 + 10,
        width: SCREEN_W - 48 - 24,
        height: 180 - 20,
      }}
    >
      <CalendarEvent add={add} w={SCREEN_W - 48 - 24} h={180 - 20} size={32} radius={16} bar={8} />
    </div>
  </div>
);
