// Печать панели 4/6 «Чечим сиздики» (координаты панели RIB.w × RIB.h).
// Вверху — вопрос родителя «Улантамбы?», под ним два равноправных
// бумажных язычка-выбора «Улантам» и «Азырынча улантпайм» (второй никогда
// не перечёркивается — решение свободное), ниже — схема «Топтом → Төлөм»
// без цен: сначала выбор пакета, потом оплата.
// Итог (t = DONE): выбран «Улантам», схема показана целиком.
import { Icon } from "../art";
import { box, settle } from "../kit";
import { clamp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";

const T = BG25_TEXT.step4;

export type P4State = {
  readonly question: number; // 0…1 вопрос напечатан
  readonly tabs: number; // 0…1 язычки появились
  readonly hoverYes: number; // 0…1 палец над «Улантам» (лёгкая подсветка)
  readonly hoverNo: number; // 0…1 палец над «Азырынча улантпайм»
  readonly press: number; // 0…1 язычок вдавлен в момент касания
  readonly yes: number; // 0…1 «Улантам» выбран (жёлтый, галочка)
  readonly pack: number; // кадры с появления «Топтом» (<0 — нет)
  readonly arrow: number; // 0…1 стрелка нарисована
  readonly pay: number; // кадры с появления «Төлөм» (<0 — нет)
};

export const P4_FINAL: P4State = { question: 1, tabs: 1, hoverYes: 0, hoverNo: 0, press: 0, yes: 1, pack: 99, arrow: 1, pay: 99 };

// Геометрия (для пальца в сцене).
export const P4_TAB = { y: 96, h: 176, yes: { x: 46, w: 344 }, no: { x: 430, w: 344 } } as const;
export const P4_FLOW = { y: 352, h: 200, pack: { x: 92, w: 236 }, pay: { x: 492, w: 236 } } as const;
export const p4YesCenter = () => ({ x: P4_TAB.yes.x + P4_TAB.yes.w / 2, y: P4_TAB.y + P4_TAB.h / 2 });
export const p4NoCenter = () => ({ x: P4_TAB.no.x + P4_TAB.no.w / 2, y: P4_TAB.y + P4_TAB.h / 2 });

const Tab: React.FC<{
  readonly x: number;
  readonly w: number;
  readonly label: string;
  readonly on: number;
  readonly hover: number;
  readonly press: number;
  readonly show: number;
}> = ({ x, w, label, on, hover, press, show }) => {
  if (show <= 0) return null;
  const k = settle(show * 14, 14);
  return (
    <div
      style={box({
        left: x,
        top: P4_TAB.y + 4 * press,
        width: w,
        height: P4_TAB.h,
        borderRadius: 30,
        backgroundColor: on > 0.5 ? C.yellow : C.white,
        border: `5px solid ${on > 0.5 ? C.yellowDeep : hover > 0.05 ? C.navy : C.line}`,
        boxShadow: `0 ${10 - 7 * press}px ${20 - 10 * press}px rgba(20,40,90,${0.14 + 0.08 * hover})`,
        opacity: clamp(show * 1.6),
        transform: `scale(${(0.88 + 0.12 * k) * (1 + 0.025 * hover)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "0 18px",
        boxSizing: "border-box",
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: label.length > 10 ? 38 : 48,
        lineHeight: 1.08,
        textAlign: "center",
        color: C.navy,
      })}
    >
      {/* кружок выбора: у обоих вариантов одинаковый пустой, галочка — только у выбранного */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          flexShrink: 0,
          backgroundColor: on > 0.5 ? C.white : "transparent",
          border: `5px solid ${on > 0.5 ? C.white : C.muted}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${0.9 + 0.1 * on})`,
        }}
      >
        {on > 0.5 ? <Icon kind="check" s={40} color={C.green} w={6} /> : null}
      </div>
      <span>{label}</span>
    </div>
  );
};

const FlowCard: React.FC<{ readonly x: number; readonly w: number; readonly t: number; readonly kind: "pack" | "pay"; readonly label: string }> = ({ x, w, t, kind, label }) => {
  if (t < 0) return null;
  const k = settle(t, 14);
  return (
    <div
      style={box({
        left: x,
        top: P4_FLOW.y,
        width: w,
        height: P4_FLOW.h,
        borderRadius: 30,
        backgroundColor: C.white,
        border: `4px solid ${C.navy}`,
        boxShadow: "0 12px 24px rgba(20,40,90,0.14)",
        opacity: clamp(k * 1.5),
        transform: `translateY(${(1 - k) * 26}px) scale(${0.9 + 0.1 * k})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: 44,
        color: C.navy,
      })}
    >
      <div style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: kind === "pack" ? C.yellowSoft : C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon kind={kind} s={62} color={C.navy} w={4.5} />
      </div>
      {label}
    </div>
  );
};

export const P4Board: React.FC<{ readonly s: P4State }> = ({ s }) => {
  const ax0 = P4_FLOW.pack.x + P4_FLOW.pack.w + 16;
  const ax1 = P4_FLOW.pay.x - 16;
  const ay = P4_FLOW.y + P4_FLOW.h / 2;
  const ax = ax0 + (ax1 - ax0) * clamp(s.arrow);
  return (
    <>
      {/* вопрос родителя */}
      <div
        style={box({
          left: 46,
          top: 24,
          fontFamily: F.text,
          fontWeight: 900,
          fontSize: 44,
          color: C.inkSoft,
          opacity: clamp(s.question * 1.4),
          transform: `translateY(${(1 - clamp(s.question)) * 10}px)`,
        })}
      >
        {T.question}
      </div>
      <Tab x={P4_TAB.yes.x} w={P4_TAB.yes.w} label={T.yes} on={s.yes} hover={s.hoverYes} press={s.press} show={s.tabs} />
      <Tab x={P4_TAB.no.x} w={P4_TAB.no.w} label={T.no} on={0} hover={s.hoverNo} press={0} show={clamp(s.tabs * 1.2 - 0.2)} />
      <FlowCard x={P4_FLOW.pack.x} w={P4_FLOW.pack.w} t={s.pack} kind="pack" label={T.pack} />
      {s.arrow > 0 ? (
        <svg width={820} height={620} style={box({ left: 0, top: 0, overflow: "visible" })}>
          <line x1={ax0} y1={ay} x2={ax} y2={ay} stroke={C.navy} strokeWidth={9} strokeLinecap="round" />
          {s.arrow > 0.85 ? <path d={`M ${ax1 - 26} ${ay - 22} L ${ax1} ${ay} L ${ax1 - 26} ${ay + 22}`} fill="none" stroke={C.navy} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
      ) : null}
      <FlowCard x={P4_FLOW.pay.x} w={P4_FLOW.pay.w} t={s.pay} kind="pay" label={T.pay} />
    </>
  );
};

export const P4Art: React.FC<{ readonly t: number }> = () => <P4Board s={P4_FINAL} />;
