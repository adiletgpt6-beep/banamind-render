// Сцена 5 (≈46–60 с): лупа выпрямляется в вертикальный луч света, луч
// раскрывает УСЛОВНЫЙ фрагмент дня («Шарттуу мисал» видно всё время):
// утро в Бишкеке, горы Ала-Тоо, школа; линия обводит горизонт и объём
// школы. Белая машина подъезжает, ребёнок пристёгнут, водитель держит руль.
// Если группа сформирована — первая полная проба ҮЙ → МЕКТЕП → ҮЙ
// бесплатна; затем решение «Сыноо → Чечим» — за родителем.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, blink, clamp, easeInOut, easeOut, span } from "../anim";
import { useTimeline } from "../context";
import { HORIZON, LAND_DY, ROAD, SCHOOL, trialTimes } from "../layout";
import { C, STROKE } from "../palette";
import { Car } from "../parts/Car";
import { Mom } from "../parts/Mom";
import { CheckIcon, Chip, Paper } from "../parts/ui";
import { BG49_TEXT } from "../script";

const st = {
  stroke: C.navy,
  strokeWidth: STROKE,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const Landscape: React.FC<{ readonly f: number }> = ({ f }) => {
  const drift = f * 0.15;
  const S = SCHOOL;
  const mid = (S.left + S.right) / 2;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <g transform={`translate(0 ${LAND_DY})`}>
        <defs>
          <linearGradient id="bg49-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8EAFB" />
            <stop offset="55%" stopColor="#EEF6FD" />
            <stop offset="100%" stopColor="#FFF6DC" />
          </linearGradient>
        </defs>
        <rect
          y={-LAND_DY}
          width={1080}
          height={HORIZON + 200 + LAND_DY}
          fill="url(#bg49-sky)"
        />
        <circle cx={880} cy={600} r={56} fill="#FFE9A3" opacity={0.8} />
        {/* дальние горы Ала-Тоо со снежными вершинами */}
        <g transform={`translate(${-drift * 0.3} 0)`}>
          <path
            d="M -40 800 L 60 640 L 140 690 L 250 560 L 330 640 L 420 540 L 520 650 L 600 600 L 700 690 L 820 580 L 930 660 L 1120 600 L 1120 860 L -40 860 Z"
            fill={C.mountainFar}
          />
          <path
            d="M 250 560 L 222 596 L 246 590 L 262 604 L 282 584 Z M 420 540 L 394 574 L 416 568 L 432 582 L 450 566 Z M 820 580 L 796 610 L 818 606 L 834 618 L 850 604 Z"
            fill="#FFFFFF"
          />
        </g>
        {/* ближние горы: по их хребту пройдёт жёлтая линия */}
        <path
          d="M -20 790 L 34 772 L 104 700 L 150 718 L 238 606 L 300 652 L 372 566 L 440 640 L 492 660 L 600 740 L 1100 760 L 1100 880 L -20 880 Z"
          fill={C.mountain}
        />
        <path
          d="M 238 606 L 214 636 L 236 630 L 252 646 L 270 624 Z M 372 566 L 346 598 L 368 592 L 384 608 L 402 590 Z M 104 700 L 92 716 L 108 712 L 118 720 Z"
          fill="#FFFFFF"
        />
        {/* город: низкие дома */}
        <g transform={`translate(${-drift * 0.6} 0)`} opacity={0.9}>
          {[
            [-10, 790, 90, 70],
            [80, 770, 70, 90],
            [150, 800, 110, 60],
            [270, 780, 80, 80],
            [350, 805, 120, 55],
            [470, 785, 70, 75],
          ].map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={6}
              fill={i % 2 ? "#E6EEF8" : "#F2F6FB"}
              stroke={C.soft}
              strokeWidth={2.5}
            />
          ))}
        </g>
        <rect x={-20} y={850} width={1120} height={160} fill="#E8F2E2" />
        {/* школа с объёмом: боковая стена, фасад, крыша */}
        <path
          d={`M ${S.left - S.side} ${S.eave + 26} L ${S.left} ${S.eave} L ${S.left} ${S.ground} L ${S.left - S.side} ${S.ground - 16} Z`}
          fill="#F1E3BE"
          {...st}
        />
        <path
          d={`M ${S.left} ${S.eave} L ${S.right} ${S.eave} L ${S.right} ${S.ground} L ${S.left} ${S.ground} Z`}
          fill="#FFF7E3"
          {...st}
        />
        <path
          d={`M ${S.left - 10} ${S.eave + 4} L ${mid} ${S.peak} L ${S.right + 10} ${S.eave + 4} Z`}
          fill="#F7D774"
          {...st}
        />
        <circle cx={mid} cy={S.eave - 40} r={20} fill="#FFFFFF" {...st} />
        <path
          d={`M ${mid} ${S.eave - 52} L ${mid} ${S.eave - 40} L ${mid + 9} ${S.eave - 36}`}
          fill="none"
          stroke={C.navy}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {[0, 1, 2, 3].map((c) =>
          [0, 1].map((r) => (
            <rect
              key={`${c}-${r}`}
              x={S.left + 28 + c * 82}
              y={S.eave + 34 + r * 92}
              width={52}
              height={58}
              rx={8}
              fill="#CFE3F7"
              stroke={C.navy}
              strokeWidth={3}
            />
          )),
        )}
        <rect
          x={mid - 34}
          y={S.ground - 84}
          width={68}
          height={84}
          rx={8}
          fill="#FFFFFF"
          {...st}
        />
        <text
          x={mid}
          y={S.ground - 100}
          textAnchor="middle"
          fontFamily={fontFamily}
          fontSize={30}
          fontWeight={900}
          fill={C.navy}
        >
          {BG49_TEXT.trial.school}
        </text>
        {/* деревья */}
        {[
          [540, 960],
          [990, 950],
          [60, 980],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 6} y={y - 20} width={12} height={40} fill="#B08A63" />
            <circle
              cx={x}
              cy={y - 50}
              r={42}
              fill="#9ED3A1"
              {...st}
              strokeWidth={3}
            />
          </g>
        ))}
        {/* дорога */}
        <rect
          x={-20}
          y={ROAD.top}
          width={1120}
          height={ROAD.bottom - ROAD.top}
          fill="#D6DCE6"
        />
        <path
          d={`M -20 ${ROAD.top} L 1100 ${ROAD.top} M -20 ${ROAD.bottom} L 1100 ${ROAD.bottom}`}
          stroke={C.soft}
          strokeWidth={4}
        />
        <path
          d={`M -20 ${(ROAD.top + ROAD.bottom) / 2} L 1100 ${(ROAD.top + ROAD.bottom) / 2}`}
          stroke="#FFFFFF"
          strokeWidth={8}
          strokeDasharray="44 36"
        />
        <rect
          x={-20}
          y={ROAD.bottom}
          width={1120}
          height={800}
          fill="#EEF1E4"
        />
        <rect x={-20} y={ROAD.bottom} width={1120} height={26} fill="#E2E6EE" />
        {/* тротуар и трава под дорогой */}
        {[80, 260, 470, 690, 900].map((x, i) => (
          <g
            key={x}
            transform={`translate(${x} ${ROAD.bottom + 120 + (i % 2) * 40})`}
          >
            <path d="M -14 0 Q -8 -24 0 -30 Q 6 -22 14 0 Z" fill="#B9DDB3" />
            <path d="M -26 0 Q -18 -16 -10 -18 Q -8 -8 -4 0 Z" fill="#CBE6C4" />
          </g>
        ))}
      </g>
    </svg>
  );
};

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const t = BG49_TEXT.trial;
  const tt = trialTimes(tl);
  // луч раскрывает окно от центра
  const open = easeInOut((f - tt.reveal) / (tt.revealed - tt.reveal + 6));
  const half = open * 560;
  // машина подъезжает и останавливается у школы
  const drive = easeOut((f - tt.revealed) / 80);
  const carX = -360 + drive * 670;
  const rot = ((carX + 360) / (2 * Math.PI * 40 * 1.22)) * 360;
  const settle =
    f > tt.revealed + 80
      ? Math.sin((f - tt.revealed - 80) / 3) *
        2 *
        Math.max(0, 1 - (f - tt.revealed - 80) / 18)
      : Math.sin(f / 2.2) * 1.2 * (1 - drive);
  // плашки условия уходят вверх быстро, карточка решения появляется чуть позже —
  // без наложения текста на текст
  const leave = appear(f, tt.decision, 8);
  const decision = appear(f, tt.decision + 10, 12);
  const choice = appear(f, tt.choice, 14);
  return (
    <>
      <Paper />
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${540 - half}px 0 ${540 - half}px)`,
        }}
      >
        <Landscape f={f} />
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Car
            x={carX}
            y={ROAD.top + LAND_DY + 118}
            s={1.22}
            rot={rot}
            bounce={settle}
          />
        </svg>
      </div>
      {/* столб мягкого света вокруг луча, пока он не раскрыл сцену */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 430,
          width: 220,
          background:
            "linear-gradient(90deg, rgba(255,226,122,0) 0%, rgba(255,226,122,0.55) 50%, rgba(255,226,122,0) 100%)",
          opacity: span(f, tt.beam - 5, tt.revealed, 10),
        }}
      />
      {/* мягкий свет по краям раскрывающегося окна */}
      {open > 0 && open < 1 ? (
        <>
          {[-1, 1].map((sd) => (
            <div
              key={sd}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 540 + sd * half - 70,
                width: 140,
                background:
                  "radial-gradient(ellipse at center, rgba(255,226,122,0.75) 0%, rgba(255,226,122,0) 70%)",
                opacity: 1 - open,
              }}
            />
          ))}
        </>
      ) : null}
      <Chip
        x={84}
        y={262}
        f={f}
        at={tt.beam}
        tone="yellow"
        size={36}
        align="left"
      >
        {t.example} • {t.city}
      </Chip>
      {/* условие и бесплатная полная проба */}
      <div
        style={{
          opacity: 1 - leave,
          transform: `translateY(${-leave * 30}px)`,
        }}
      >
        <Chip x={540} y={352} f={f} at={tt.condition} tone="white" size={38}>
          {t.condition}
        </Chip>
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 150,
            top: 440,
            padding: "20px 26px",
            borderRadius: 30,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontFamily,
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.15,
            textAlign: "center",
            opacity: appear(f, tt.badge, 12),
            transform: `translateY(${(1 - appear(f, tt.badge, 14)) * 20}px)`,
            boxShadow: "0 16px 34px rgba(20,40,90,0.22)",
          }}
        >
          {t.badge.split(" — ")[0]} —{" "}
          <span style={{ color: C.yellow }}>{t.badge.split(" — ")[1]}</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 150,
            top: 586,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 10,
            fontFamily,
            opacity: appear(f, tt.route, 12),
          }}
        >
          {t.route.map((r, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              {i ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 900,
                      color: C.navy,
                      lineHeight: 1,
                    }}
                  >
                    →
                  </div>
                  <div
                    style={{
                      fontSize: 27,
                      fontWeight: 800,
                      color: C.navy,
                      whiteSpace: "nowrap",
                      backgroundColor: "rgba(255,255,255,0.85)",
                      borderRadius: 10,
                      padding: "2px 8px",
                    }}
                  >
                    {i === 1 ? t.am : t.pm}
                  </div>
                </div>
              ) : null}
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  backgroundColor: C.yellow,
                  border: `3px solid ${C.navy}`,
                  fontSize: 32,
                  fontWeight: 900,
                  color: C.navy,
                  opacity: appear(f, tt.route + i * 6, 10),
                }}
              >
                {r}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* решение после пробы — за родителем */}
      {decision > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 150,
            top: 352,
            opacity: decision,
            transform: `translateY(${(1 - decision) * 24}px)`,
            fontFamily,
            color: C.navy,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 24px",
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
                border: `3px solid ${C.rule}`,
                fontSize: 40,
                fontWeight: 900,
              }}
            >
              <CheckIcon size={42} k={clamp((f - tt.decision - 6) / 10)} />
              {t.flow[0]}
            </div>
            <div style={{ fontSize: 48, fontWeight: 900 }}>→</div>
            <div
              style={{
                padding: "10px 28px",
                borderRadius: 999,
                backgroundColor: C.yellow,
                border: `3px solid ${C.navy}`,
                fontSize: 40,
                fontWeight: 900,
              }}
            >
              {t.flow[1]}
            </div>
          </div>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "14px 22px",
              borderRadius: 30,
              backgroundColor: "#FFFFFF",
              border: `3px solid ${C.rule}`,
              boxShadow: "0 14px 30px rgba(20,40,90,0.14)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 60,
                overflow: "hidden",
                backgroundColor: C.yellowSoft,
                border: `3px solid ${C.navy}`,
                flexShrink: 0,
              }}
            >
              <Mom
                uid="trial"
                x={60}
                y={64}
                s={0.36}
                look={[0.2, -0.1]}
                brow={0.5 - 0.4 * choice}
                smile={0.1 + 0.7 * choice}
                eyes={blink(f, 30)}
              />
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}>
              {t.decision}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
