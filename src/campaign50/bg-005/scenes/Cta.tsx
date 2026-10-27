// Сцена 6, финальный экран. Нить круга группы на карте выпрямляется в
// жёлтую линию ҮЙ → МЕКТЕП → ҮЙ под логотипом BalaGo. Затем одновременно:
// «Бишкек • Балдар үчүн такси», «Профилдеги шилтемеге өтүңүз»,
// «же WhatsApp аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28».
// Всё появляется за ≈ 0,8 с после начала сцены и стоит неподвижно до конца
// ролика — в безопасной зоне (выше нижнего интерфейса Reels/Shorts, левее кнопок).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  ArrowText,
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
import { pointAt, project, ROUTE_GROUP } from "../map";
import { BG05_TEXT } from "../script";
import { mapCamAt } from "./MapScene";

const T = BG05_TEXT.cta;
const N = 48;
const LINE_Y = 688;
const LINE_X = [250, 830] as const;

export const Cta: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const from = b.cta.from;
  // 1) нить: точки круга группы (как на карте в момент начала финала) → прямая
  const k = easeInOut(prog(t, from - 0.7, 1.1));
  const cam = mapCamAt(b, from - 0.7);
  const pts = Array.from({ length: N }, (_, i) => {
    const u = i / (N - 1);
    const p = project(cam, pointAt(ROUTE_GROUP, u));
    const q = { x: LINE_X[0] + (LINE_X[1] - LINE_X[0]) * u, y: LINE_Y };
    return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k };
  });
  // 2) белый фон раскрывается кругом из центра линии
  const r = easeInOut(prog(t, from - 0.2, 0.8)) * 2300;
  const a = (n: number) => {
    const u = easeOut(prog(t, from + 0.15 + n * 0.06, 0.4));
    return {
      opacity: Math.min(1, u * 1.4),
      transform: `translateY(${(1 - u) * 22}px)`,
    };
  };
  const drift = Math.sin(t * 0.8) * 10;
  const dots = easeOut(prog(t, from + 0.3, 0.4));
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `circle(${r}px at 540px ${LINE_Y}px)`,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -220 + drift,
            top: -260,
            width: 640,
            height: 640,
            borderRadius: 320,
            backgroundColor: YELLOW_SOFT,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -260 - drift,
            bottom: -200,
            width: 620,
            height: 620,
            borderRadius: 310,
            backgroundColor: "#EAF1FB",
          }}
        />
      </div>
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={NAVY}
          strokeWidth={26}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={YELLOW}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {dots > 0
          ? [LINE_X[0], 540, LINE_X[1]].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={LINE_Y}
                r={18 * dots}
                fill={i === 1 ? "#5B8DEF" : "#E86F5A"}
                stroke={NAVY}
                strokeWidth={5}
              />
            ))
          : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 66,
          right: 126,
          top: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...a(0),
            display: "flex",
            alignItems: "center",
            gap: 22,
            height: 170,
          }}
        >
          <Img
            src={staticFile("assets/logo.png")}
            style={{
              width: 170,
              height: 170,
              borderRadius: 85,
              boxShadow: "0 12px 30px rgba(20,40,90,0.18)",
            }}
          />
          <div
            style={{
              fontSize: 112,
              fontWeight: 1000,
              color: NAVY,
              lineHeight: 1,
            }}
          >
            {T.brand}
          </div>
        </div>
        <div
          style={{
            ...a(1),
            marginTop: 26,
            padding: "16px 34px",
            borderRadius: 50,
            backgroundColor: YELLOW,
            fontSize: 50,
            fontWeight: 1000,
            color: NAVY,
            whiteSpace: "nowrap",
          }}
        >
          {T.city}
        </div>
        <div
          style={{
            ...a(2),
            marginTop: 20,
            fontSize: 40,
            fontWeight: 1000,
            color: NAVY_SOFT,
            letterSpacing: 2,
            display: "flex",
            alignItems: "center",
            height: 50,
          }}
        >
          <ArrowText text={T.route} size={40} />
        </div>
        {/* место под выпрямленную нить маршрута */}
        <div style={{ height: 56 }} />
        {/* 1: ссылка в профиле */}
        <div
          style={{
            ...a(4),
            width: "100%",
            padding: "26px 26px",
            boxSizing: "border-box",
            borderRadius: 32,
            backgroundColor: "#F3F6FB",
            border: "4px solid #DCE3EE",
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              flexShrink: 0,
              borderRadius: 42,
              backgroundColor: NAVY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width={50}
              height={50}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.6}
              strokeLinecap="round"
            >
              <path d="M 10 14 L 14 10" />
              <path d="M 8.5 11.5 L 6.5 13.5 Q 4 16 6.5 18.5 Q 9 21 11.5 18.5 L 13.5 16.5" />
              <path d="M 15.5 12.5 L 17.5 10.5 Q 20 8 17.5 5.5 Q 15 3 12.5 5.5 L 10.5 7.5" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 1000,
              color: NAVY,
              textAlign: "left",
              lineHeight: 1.12,
            }}
          >
            {T.link}
          </div>
        </div>
        <div
          style={{
            ...a(5),
            marginTop: 24,
            fontSize: 48,
            fontWeight: 900,
            color: "#33415E",
          }}
        >
          {T.or}
        </div>
        {/* 2: WhatsApp — полный номер крупно */}
        <div
          style={{
            ...a(6),
            marginTop: 22,
            width: "100%",
            padding: "26px 22px",
            boxSizing: "border-box",
            borderRadius: 36,
            backgroundColor: "#E7F7EC",
            border: `5px solid ${WA_GREEN}`,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              flexShrink: 0,
              borderRadius: 48,
              backgroundColor: WA_GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={58} height={58} viewBox="0 0 24 24">
              <path
                d="M 12 3 Q 20.5 3 20.5 11.5 Q 20.5 20 12 20 Q 9.6 20 7.7 19 L 3.8 20.2 L 5 16.5 Q 3.5 14.3 3.5 11.5 Q 3.5 3 12 3 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 9 8 L 10.6 8 L 11.2 10.4 L 10.2 11.2 Q 11 13 12.9 13.9 L 13.7 12.9 L 16 13.5 L 16 15 Q 16 16.2 14.7 16.2 Q 8.2 15.6 7.8 9.3 Q 7.8 8 9 8 Z"
                fill={WA_GREEN}
              />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 50,
                fontWeight: 1000,
                color: "#1E7A44",
                lineHeight: 1,
              }}
            >
              {T.whatsappLabel}
            </div>
            <div
              style={{
                fontSize: 92,
                fontWeight: 1000,
                color: NAVY,
                lineHeight: 1.08,
                whiteSpace: "nowrap",
                letterSpacing: 1,
              }}
            >
              {T.whatsappNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
