// Связующее действие (конец сцены 3) и заявка (начало сцены 4) — крупный
// план телефона мамы:
//   • поиск: «Баланы мектепке жеткирүү, Бишкек» → в результатах BalaGo,
//     палец нажимает на него;
//   • условная заявка BalaGo (пометка «Мисал»): үй, мектеп, убакыт
//     заполняются на словах диктора, «Жөнөтүү» → телефон уходит, карта
//     перестраивается в круг ҮЙ → МЕКТЕП → ҮЙ (MapScene).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  CheckIcon,
  easeInOut,
  easeOut,
  NAVY,
  NAVY_SOFT,
  prog,
  WA_GREEN,
  YELLOW,
  YELLOW_SOFT,
} from "../art";
import type { Bg05Beats } from "../beats";
import { BG05_TEXT } from "../script";

const T = BG05_TEXT;

const Hand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly press: number;
  readonly opacity: number;
}> = ({ x, y, press, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      pointerEvents: "none",
    }}
  >
    {press > 0 && press < 1 ? (
      <div
        style={{
          position: "absolute",
          left: -40,
          top: -40,
          width: 80,
          height: 80,
          borderRadius: 40,
          border: `6px solid ${YELLOW}`,
          opacity: 1 - press,
          transform: `scale(${0.5 + press * 1.2})`,
        }}
      />
    ) : null}
    <svg
      width={170}
      height={230}
      viewBox="0 0 100 135"
      style={{
        position: "absolute",
        left: -34,
        top: -2 + Math.sin(Math.min(1, press) * Math.PI) * 10,
      }}
    >
      <path
        d="M 14 6 Q 14 0 20 0 Q 26 0 26 6 L 26 54 L 34 52 Q 42 50 44 58 L 58 56 Q 66 56 67 64 L 76 64 Q 86 65 86 76 L 86 108 Q 86 128 62 134 L 36 134 Q 18 126 12 108 L 0 80 Q -3 70 6 67 Q 12 65 16 74 L 16 6 Z"
        fill="#EDBE98"
        stroke="#9A6A4E"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M 26 48 L 28 66 M 44 56 L 45 72 M 67 64 L 67 78"
        stroke="#C98E6A"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M 40 134 L 40 135 Q 60 130 80 135" fill="#2E6E8E" />
    </svg>
  </div>
);

const Logo: React.FC<{ readonly size: number }> = ({ size }) => (
  <Img
    src={staticFile("assets/logo.png")}
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      boxShadow: "0 4px 10px rgba(20,40,90,0.18)",
    }}
  />
);

const Search: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const c = b.compare;
  const typed = Math.round(
    T.compare.search.length * prog(t, c.typeFrom, c.typeTo - c.typeFrom),
  );
  const caret = t < c.typeTo + 0.2 ? Math.floor(t * 3) % 2 === 0 : false;
  const res = easeOut(prog(t, c.results, 0.45));
  const press = prog(t, c.tap, 0.45);
  const pressed =
    t >= c.tap ? 1 - 0.04 * Math.sin(Math.min(1, press) * Math.PI) : 1;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "70px 30px 30px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 24px",
          borderRadius: 40,
          backgroundColor: "#F1F4F9",
          border: `4px solid ${t > c.typeFrom - 0.2 ? "#5B8DEF" : "#E1E7F0"}`,
        }}
      >
        <svg
          width={40}
          height={40}
          viewBox="0 0 24 24"
          fill="none"
          stroke={NAVY_SOFT}
          strokeWidth={2.6}
          strokeLinecap="round"
        >
          <circle cx={10.5} cy={10.5} r={6.5} />
          <path d="M 15.5 15.5 L 21 21" />
        </svg>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: NAVY,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {T.compare.search.slice(0, typed)}
          <span style={{ opacity: caret ? 1 : 0, color: "#5B8DEF" }}>|</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 34,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div
          style={{
            opacity: res,
            transform: `translateY(${(1 - res) * 30}px) scale(${pressed})`,
            padding: "26px 24px",
            borderRadius: 28,
            backgroundColor: t >= c.tap ? YELLOW_SOFT : "#FFFFFF",
            border: `4px solid ${YELLOW}`,
            boxShadow: "0 8px 20px rgba(20,40,75,0.14)",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Logo size={96} />
          <div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 1000,
                color: NAVY,
                lineHeight: 1.15,
              }}
            >
              {T.compare.resultTitle}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 30,
                fontWeight: 800,
                color: NAVY_SOFT,
              }}
            >
              {T.compare.resultSub}
            </div>
          </div>
        </div>
        {/* прочие результаты — без текста (не выдумываем чужие сервисы) */}
        {[0, 1, 2].map((i) => {
          const u = easeOut(prog(t, c.results + 0.12 * (i + 1), 0.45));
          return (
            <div
              key={i}
              style={{
                opacity: u * 0.9,
                transform: `translateY(${(1 - u) * 30}px)`,
                padding: "26px 24px",
                borderRadius: 28,
                backgroundColor: "#F6F8FC",
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  backgroundColor: "#E4E9F1",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 24,
                    width: `${70 - i * 12}%`,
                    borderRadius: 12,
                    backgroundColor: "#E1E7F0",
                  }}
                />
                <div
                  style={{
                    marginTop: 14,
                    height: 18,
                    width: `${50 + i * 8}%`,
                    borderRadius: 9,
                    backgroundColor: "#EAEFF5",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Form: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const a = b.apply;
  const sent = easeOut(prog(t, a.send, 0.35));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "64px 34px 30px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Logo size={88} />
        <div style={{ fontSize: 52, fontWeight: 1000, color: NAVY }}>
          BalaGo
        </div>
        <div
          style={{
            marginLeft: "auto",
            padding: "6px 16px",
            borderRadius: 16,
            backgroundColor: "#EEF2F8",
            fontSize: 26,
            fontWeight: 900,
            color: NAVY_SOFT,
          }}
        >
          {T.apply.example}
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 30,
          fontWeight: 900,
          color: NAVY_SOFT,
        }}
      >
        {T.map.city} • Балдар үчүн такси
      </div>
      <div
        style={{ marginTop: 28, fontSize: 46, fontWeight: 1000, color: NAVY }}
      >
        {T.apply.title}
      </div>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {T.apply.fields.map((f, i) => {
          const at = a.fields[i];
          const u = prog(t, at - 0.15, 0.6);
          const shown = f.value.slice(0, Math.round(f.value.length * u));
          const active = t >= at - 0.3 && t < (a.fields[i + 1] ?? a.send) - 0.2;
          return (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY_SOFT }}>
                {f.label}
              </div>
              <div
                style={{
                  marginTop: 8,
                  padding: "20px 22px",
                  borderRadius: 22,
                  border: `4px solid ${active ? "#5B8DEF" : u >= 1 ? YELLOW : "#E1E7F0"}`,
                  backgroundColor: "#FFFFFF",
                  fontSize: 36,
                  fontWeight: 900,
                  color: NAVY,
                  minHeight: 46,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{shown}</span>
                {u >= 1 ? <CheckIcon size={30} color={WA_GREEN} /> : null}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 30,
          padding: "24px 0",
          borderRadius: 30,
          backgroundColor: sent > 0 ? WA_GREEN : YELLOW,
          textAlign: "center",
          fontSize: 42,
          fontWeight: 1000,
          color: sent > 0 ? "#FFFFFF" : NAVY,
          transform: `scale(${1 - 0.05 * Math.sin(Math.min(1, sent) * Math.PI)})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
        }}
      >
        {sent > 0 ? <CheckIcon size={40} color="#FFFFFF" /> : null}
        {T.apply.send}
      </div>
    </div>
  );
};

export const Phone: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const c = b.compare;
  const a = b.apply;
  // вход: телефон «вырастает» из руки мамы
  const inU = easeInOut(prog(t, c.phone - 0.15, 0.55));
  // выход: после «Жөнөтүү» телефон уменьшается вверх, открывая карту
  const outU = easeInOut(prog(t, a.mapBack - 0.1, 0.6));
  if (inU <= 0 || outU >= 1) return null;
  const s = (0.28 + 0.72 * inU) * (1 - 0.6 * outU);
  const x = 550 + (540 - 550) * inU;
  const y = 1090 + (790 - 1090) * inU - 420 * outU;
  const form = t >= c.to - 0.05;
  const swap = easeInOut(prog(t, c.to - 0.05, 0.3));
  const bgO = Math.min(1, inU * 1.4) * (1 - outU);
  // палец: нажимает на результат BalaGo, затем на «Жөнөтүү»
  const handSearch = t >= c.results + 0.3 && t < c.to - 0.05;
  const handForm = t >= a.send - 0.8 && t < a.mapBack - 0.1;
  const handU = handSearch
    ? easeOut(prog(t, c.results + 0.3, 0.4))
    : handForm
      ? easeOut(prog(t, a.send - 0.8, 0.4))
      : 0;
  const press = handSearch
    ? prog(t, c.tap, 0.45)
    : handForm
      ? prog(t, a.send, 0.45)
      : 0;
  // кончик пальца (координаты экрана телефона)
  const handPos = handSearch
    ? { x: 575, y: 345 + (1 - handU) * 320 }
    : { x: 470, y: 870 + (1 - handU) * 260 };
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgO,
          background: `radial-gradient(circle at 50% 40%, #FFFFFF 0%, ${YELLOW_SOFT} 70%, #FBE7A0 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 360,
          top: y - 640,
          width: 720,
          height: 1280,
          transform: `scale(${s})`,
          transformOrigin: "50% 50%",
          fontFamily,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 80,
            backgroundColor: NAVY,
            boxShadow: "0 30px 60px rgba(20,40,75,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 22,
            right: 22,
            bottom: 22,
            borderRadius: 62,
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 18,
              width: 150,
              height: 34,
              marginLeft: -75,
              borderRadius: 17,
              backgroundColor: NAVY,
            }}
          />
          {!form || swap < 1 ? (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
              <Search t={t} b={b} />
            </div>
          ) : null}
          {form ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: swap,
                transform: `translateX(${(1 - swap) * 60}px)`,
              }}
            >
              <Form t={t} b={b} />
            </div>
          ) : null}
          {handU > 0 ? (
            <Hand x={handPos.x} y={handPos.y} press={press} opacity={handU} />
          ) : null}
        </div>
      </div>
    </>
  );
};
