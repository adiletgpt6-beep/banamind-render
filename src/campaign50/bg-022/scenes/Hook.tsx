// Сцена 1 (0–≈6 с): крупно «1 САПАР = ?». Две карточки-варианта:
// «Бир тарап?» (одна стрелка) и «Барып-келүү?» (две) — зритель мысленно
// выбирает. Затем надпись «1 САПАР» делится на две жёлтые стрелки
// (ҮЙ → МЕКТЕП и МЕКТЕП → ҮЙ), стрелки изгибаются навстречу и собираются
// в одно кольцо вокруг «1 САПАР» — заход в следующую сцену. Внизу
// подъезжает белая легковая машина.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { C } from "../palette";
import { BG22_TEXT } from "../script";
import { Txt, WhiteCar, rise } from "../ui";

export const HK = { split: 104, ring0: 140, ring1: 172 } as const;

const CX = 540;
const CY = 860;
const RAD = 330;

// Стрелка: кубическая кривая; m — 0 прямая, 1 полукруг кольца.
const arrow = (top: boolean, m: number) => {
  const sy = top ? CY - 150 : CY + 150;
  const ry = top ? CY - RAD * 1.33 : CY + RAD * 1.33;
  const [x0, x1] = top ? [CX - RAD, CX + RAD] : [CX + RAD, CX - RAD];
  const y = lerp(sy, CY, m);
  const c1 = { x: lerp(x0 + (x1 - x0) * 0.3, x0, m), y: lerp(sy, ry, m) };
  const c2 = { x: lerp(x0 + (x1 - x0) * 0.7, x1, m), y: lerp(sy, ry, m) };
  const d = `M ${x0} ${y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x1} ${y}`;
  // наконечник по направлению c2 → конец
  const ang = Math.atan2(y - c2.y, x1 - c2.x);
  const L = 46;
  const head = `M ${x1 - L * Math.cos(ang - 0.5)} ${y - L * Math.sin(ang - 0.5)} L ${x1} ${y} L ${x1 - L * Math.cos(ang + 0.5)} ${y - L * Math.sin(ang + 0.5)}`;
  return { d, head };
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG22_TEXT.hook;
  const pop = easeOut(f / 12);
  // выбор: подсветка качается между вариантами, затем карточки уходят
  const choose = Math.sin(clamp((f - 52) / 50) * Math.PI * 2);
  const cards = clamp((f - 26) / 12) * (1 - clamp((f - HK.split + 8) / 10));
  // «1 САПАР» → две стрелки → кольцо
  const split = easeInOut((f - HK.split) / 18);
  const ring = easeInOut((f - HK.ring0) / (HK.ring1 - HK.ring0));
  const draw = clamp((f - HK.split) / 14);
  const title = 1 - split + ring;
  const top = arrow(true, ring);
  const bot = arrow(false, ring);
  const carIn = easeOut((f - 6) / 40);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        fontFamily,
        color: C.navy,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -260,
          top: -200,
          width: 820,
          height: 820,
          borderRadius: 410,
          backgroundColor: C.yellowSoft,
          transform: `scale(${0.9 + 0.1 * pop})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -240,
          bottom: 120,
          width: 620,
          height: 620,
          borderRadius: 310,
          backgroundColor: C.sky,
        }}
      />
      {/* стрелки */}
      {draw > 0 ? (
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          {[top, bot].map((a, i) => (
            <g
              key={i}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={draw}
            >
              <path d={a.d} stroke="#FFFFFF" strokeWidth={44} />
              <path
                d={a.d}
                stroke={C.yellow}
                strokeWidth={30}
                strokeDasharray={`${1400 * draw} 1400`}
              />
              <path
                d={a.head}
                stroke={C.yellowDeep}
                strokeWidth={22}
                opacity={clamp((f - HK.split - 8) / 6)}
              />
            </g>
          ))}
        </svg>
      ) : null}
      {/* подписи стрелок — пока стрелки прямые */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY - 238,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 900,
          opacity: split * (1 - ring),
        }}
      >
        <Txt>ҮЙ → МЕКТЕП</Txt>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY + 182,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 900,
          opacity: split * (1 - ring),
        }}
      >
        <Txt>МЕКТЕП → ҮЙ</Txt>
      </div>
      {/* «1 САПАР = ?» */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY - 110,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 26,
          opacity: pop * clamp(title),
          transform: `scale(${(0.7 + 0.3 * pop) * (1 - 0.25 * split * (1 - ring)) * (1 - 0.38 * ring)}) scaleX(${1 - 0.5 * split * (1 - ring)})`,
        }}
      >
        <div
          style={{
            fontSize: 190,
            fontWeight: 1000,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {t.title}
        </div>
        {split < 0.5 ? (
          <div
            style={{
              fontSize: 120,
              fontWeight: 1000,
              lineHeight: 1,
              color: C.yellowDeep,
              ...rise(f, 10, 10),
            }}
          >
            {t.question}
          </div>
        ) : null}
      </div>
      {/* варианты ответа */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1100,
          display: "flex",
          gap: 30,
          justifyContent: "center",
          opacity: cards,
        }}
      >
        {[
          { label: t.one, two: false, hi: choose < 0 ? -choose : 0 },
          { label: t.two, two: true, hi: choose > 0 ? choose : 0 },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              width: 440,
              padding: "26px 10px 24px",
              borderRadius: 32,
              backgroundColor: "#FFFFFF",
              border: `5px solid ${c.hi > 0.3 ? C.yellow : "#DCE3EE"}`,
              boxShadow: `0 ${12 + 10 * c.hi}px ${28 + 12 * c.hi}px rgba(20,40,90,${0.1 + 0.08 * c.hi})`,
              transform: `translateY(${-14 * c.hi}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <svg width={200} height={90} viewBox="0 0 200 90">
              <g
                fill="none"
                stroke={C.navy}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {c.two ? (
                  <>
                    <path d="M 20 28 L 176 28 M 152 10 L 178 28 L 152 46" />
                    <path
                      d="M 180 66 L 24 66 M 48 48 L 22 66 L 48 84"
                      stroke={C.yellowDeep}
                    />
                  </>
                ) : (
                  <path d="M 20 46 L 176 46 M 150 24 L 178 46 L 150 68" />
                )}
              </g>
            </svg>
            <div style={{ fontSize: 46, fontWeight: 900 }}>{c.label}</div>
          </div>
        ))}
      </div>
      {/* белая машина подъезжает */}
      <div style={{ opacity: 1 - clamp((f - HK.ring1) / 14) }}>
        <WhiteCar
          x={lerp(-300, 540, carIn)}
          y={1660}
          s={0.62}
          wheel={carIn * 540}
        />
      </div>
    </div>
  );
};
