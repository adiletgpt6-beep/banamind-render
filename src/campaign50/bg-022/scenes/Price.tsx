// Сцена 5 (≈43–57 с): как считается цена. МЕКТЕП и ҮЙ на одной линии;
// жёлтая рулетка отмеряет ОДНУ сторону — «Бир тараптуу аралык» (км без
// чисел); «Тариф ушул аралыкка жараша», «1 бала • 1 толук сапар».
// Примеров цен нет. Затем отдельная процедура: Арыз → Топ түзүлөт
// (3–4 бала, издөө 2 жумага чейин) → Биринчи толук сыноо сапары —
// «Акысыз», только «Каттам уюшулгандан кийин».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  clamp,
  easeInOut,
  easeOut,
} from "../../../two-schedules-2d/rig/motion";
import { useLine } from "../context";
import { C } from "../palette";
import { BG22_TEXT } from "../script";
import { Check, HomeIcon, SchoolIcon, Txt, rise } from "../ui";

const A = { x: 210, y: 700 };
const B = { x: 870, y: 700 };

export const PriceScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG22_TEXT.price;
  const n06 = useLine("n06");
  const swap = n06.from - 16; // смена блоков: измерение → шаги
  const out = easeInOut((f - swap) / 14);
  const tape = easeInOut((f - 22) / 50);
  const tapeW = (B.x - A.x - 160) * tape;
  const steps = [swap + 12, swap + 24, n06.from + 22];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        fontFamily,
        color: C.navy,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -220,
          top: 260,
          width: 700,
          height: 700,
          borderRadius: 350,
          backgroundColor: C.sky,
        }}
      />
      {/* блок 1: измерение одной стороны */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - out,
          transform: `translateY(${-60 * out}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 150,
            top: 290,
            fontSize: 62,
            fontWeight: 1000,
            lineHeight: 1.1,
            ...rise(f, 0),
          }}
        >
          {t.title}
        </div>
        {[
          {
            p: A,
            icon: <SchoolIcon size={96} />,
            label: BG22_TEXT.school,
            at: 6,
          },
          { p: B, icon: <HomeIcon size={92} />, label: BG22_TEXT.home, at: 12 },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              position: "absolute",
              left: k.p.x - 80,
              top: k.p.y - 80,
              width: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              ...rise(f, k.at),
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "#FFFFFF",
                border: `8px solid ${C.navy}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 26px rgba(20,40,90,0.2)",
              }}
            >
              {k.icon}
            </div>
            <div
              style={{
                padding: "4px 18px",
                borderRadius: 999,
                backgroundColor: C.navy,
                color: "#FFFFFF",
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              {k.label}
            </div>
          </div>
        ))}
        {/* рулетка: жёлтая лента от школы к дому, деления */}
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          {tapeW > 1 ? (
            <rect
              x={A.x + 80}
              y={A.y - 22}
              width={tapeW}
              height={44}
              rx={10}
              fill={C.yellow}
              stroke={C.yellowDeep}
              strokeWidth={4}
            />
          ) : null}
          {Array.from({ length: 19 }).map((_, i) => {
            const tx = A.x + 96 + i * 26;
            return tx < A.x + 80 + tapeW - 8 ? (
              <rect
                key={i}
                x={tx}
                y={A.y - 22}
                width={4}
                height={i % 5 === 0 ? 26 : 14}
                fill={C.navy}
                opacity={0.7}
              />
            ) : null;
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 838,
            display: "flex",
            justifyContent: "center",
            ...rise(f, 60),
          }}
        >
          <div
            style={{
              padding: "12px 30px",
              borderRadius: 999,
              backgroundColor: "#FFFFFF",
              border: `4px solid ${C.yellow}`,
              fontSize: 44,
              fontWeight: 900,
            }}
          >
            {t.measure}: <Txt>{t.pair}</Txt> • … {t.km}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 980,
            padding: "26px 30px",
            borderRadius: 32,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            textAlign: "center",
            fontSize: 50,
            fontWeight: 1000,
            lineHeight: 1.15,
            ...rise(f, 96),
          }}
        >
          {t.rule}
          <div
            style={{
              marginTop: 12,
              fontSize: 38,
              fontWeight: 800,
              color: C.yellow,
            }}
          >
            {t.perChild}
          </div>
        </div>
      </div>
      {/* блок 2: отдельная процедура — после формирования группы */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 150,
          top: 330,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {t.steps.map((s, i) => {
          const a = easeOut((f - steps[i]) / 12);
          const last = i === t.steps.length - 1;
          return (
            <div
              key={s.title}
              style={{
                opacity: a,
                transform: `translateY(${(1 - a) * 30}px)`,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "24px 26px",
                borderRadius: 30,
                backgroundColor: last ? C.yellowSoft : "#FFFFFF",
                border: `5px solid ${last ? C.yellow : "#DCE3EE"}`,
                boxShadow: "0 12px 26px rgba(20,40,90,0.1)",
              }}
            >
              <div
                style={{
                  flex: "0 0 auto",
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: C.navy,
                  color: "#FFFFFF",
                  fontSize: 44,
                  fontWeight: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontSize: last ? 44 : 46,
                    fontWeight: 1000,
                    lineHeight: 1.1,
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: C.muted }}>
                  {s.note}
                </div>
                {"badge" in s ? (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 24px 8px 12px",
                      borderRadius: 999,
                      backgroundColor: C.green,
                      color: "#FFFFFF",
                      fontSize: 40,
                      fontWeight: 1000,
                      transform: `scale(${0.8 + 0.2 * easeOut((f - steps[i] - 10) / 8)})`,
                      opacity: clamp((f - steps[i] - 8) / 6),
                    }}
                  >
                    <Check size={34} />
                    {s.badge}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
