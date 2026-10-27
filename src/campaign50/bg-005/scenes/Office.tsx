// Сцена 3 (первая часть): мама в офисе. За окном — Ала-Тоо и невысокий
// город. На ноутбуке — карта с красным крюком. Над столом — два пути:
// «Азыр: күн сайын» (длинный крюк) и «Өзүнчө, алдын ала» (короткий круг
// ҮЙ → МЕКТЕП → ҮЙ со знаком вопроса). Мама сравнивает их взглядом,
// задаёт себе вопрос (губы по громкости фактической речи) и берёт телефон —
// это начало связующего действия (поиск в телефоне — Phone.tsx).
import { fontFamily } from "../../../fonts";
import {
  easeInOut,
  easeOut,
  Mountains,
  NAVY,
  NAVY_SOFT,
  popScale,
  prog,
  YELLOW,
} from "../art";
import type { Bg05Beats } from "../beats";
import { BG05_TEXT, BG05_VIDEO } from "../script";
import type { Bg05Cue } from "../timing";

const T = BG05_TEXT.compare;
const RED = "#E8603C";
const SKIN = "#EDBE98";
const SKIN_D = "#C98E6A";
const HAIR = "#3A2822";
const BLAZER = "#2E6E8E";
const BLAZER_D = "#245A75";

// мягкое моргание: короткие закрытия в заданные моменты + редкие случайные
const blinkAt = (t: number, extra: readonly number[]) => {
  const base = [0.9, 3.6, 6.1, 8.9, 11.4];
  let v = 0;
  for (const b of [...base, ...extra]) {
    const d = Math.abs((t % 13) - b);
    if (d < 0.09) v = Math.max(v, 1 - d / 0.09);
  }
  return v;
};

// открытие рта по огибающей речи (0…1), сглажено по соседним кадрам
const mouthAt = (cue: Bg05Cue | undefined, t: number) => {
  if (!cue || t < cue.from - 0.1 || t > cue.to + 0.2) return 0;
  const env = cue.env;
  if (!env?.length) {
    // без файла — условное движение на словах
    const w = cue.words.find((x) => t >= x.start && t <= x.end);
    return w ? 0.35 + 0.3 * Math.abs(Math.sin((t - w.start) * 14)) : 0;
  }
  const f = (t - cue.audioFrom) * BG05_VIDEO.fps;
  const at = (k: number) =>
    env[Math.max(0, Math.min(env.length - 1, Math.round(f + k)))] ?? 0;
  const v = at(-1) * 0.25 + at(0) * 0.5 + at(1) * 0.25;
  return Math.max(0, Math.min(1, (v - 0.12) / 0.7));
};

// мини-карта пути на карточке сравнения
const MiniRoute: React.FC<{
  readonly kind: "now" | "plan";
  readonly u: number;
}> = ({ kind, u }) => {
  const pts =
    kind === "now"
      ? "40,40 40,120 150,120 150,40 260,40"
      : "70,110 70,50 200,50 200,110 70,110";
  const L = kind === "now" ? 80 + 110 + 80 + 110 : 60 + 130 + 60 + 130;
  return (
    <svg width={300} height={160} viewBox="0 0 300 160">
      <rect x={0} y={0} width={300} height={160} rx={18} fill="#F3F6FB" />
      {[60, 110].map((y) => (
        <path
          key={y}
          d={`M 0 ${y} L 300 ${y}`}
          stroke="#E1E7F0"
          strokeWidth={8}
        />
      ))}
      {[100, 200].map((x) => (
        <path
          key={x}
          d={`M ${x} 0 L ${x} 160`}
          stroke="#E1E7F0"
          strokeWidth={8}
        />
      ))}
      <polyline
        points={pts}
        fill="none"
        stroke={kind === "now" ? RED : YELLOW}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${L} ${L}`}
        strokeDashoffset={L * (1 - u)}
      />
      {kind === "now" ? (
        <>
          <rect x={248} y={28} width={24} height={24} rx={4} fill={NAVY} />
          <circle
            cx={40}
            cy={120}
            r={11}
            fill="#5B8DEF"
            stroke={NAVY}
            strokeWidth={3}
          />
          <circle
            cx={150}
            cy={40}
            r={11}
            fill="#E86F5A"
            stroke={NAVY}
            strokeWidth={3}
          />
        </>
      ) : (
        <>
          <circle
            cx={70}
            cy={110}
            r={12}
            fill="#E86F5A"
            stroke={NAVY}
            strokeWidth={3}
          />
          <circle
            cx={200}
            cy={50}
            r={12}
            fill="#5B8DEF"
            stroke={NAVY}
            strokeWidth={3}
          />
        </>
      )}
    </svg>
  );
};

const Card: React.FC<{
  readonly kind: "now" | "plan";
  readonly u: number;
  readonly draw: number;
  readonly focus: number;
  readonly q: number;
}> = ({ kind, u, draw, focus, q }) => {
  const now = kind === "now";
  return (
    <div
      style={{
        width: 420,
        padding: "20px 20px 22px",
        boxSizing: "border-box",
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
        border: `5px solid ${now ? "#F6C3B3" : focus > 0.5 ? YELLOW : "#E1E7F0"}`,
        boxShadow: `0 ${12 + 10 * focus}px ${28 + 14 * focus}px rgba(20,40,75,${0.16 + 0.1 * focus})`,
        opacity: u * (now ? 1 - 0.35 * focus : 1),
        transform: `translateY(${(1 - u) * 40}px) scale(${(0.9 + 0.1 * popScale(u)) * (1 + 0.06 * focus)})`,
        fontFamily,
        position: "relative",
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 1000, color: now ? RED : NAVY }}>
        {now ? T.now : T.plan}
      </div>
      <div style={{ marginTop: 10 }}>
        <MiniRoute kind={kind} u={draw} />
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 22,
          fontWeight: 900,
          color: NAVY_SOFT,
          whiteSpace: "nowrap",
          letterSpacing: -0.3,
        }}
      >
        {now ? T.nowRoute : T.planRoute}
      </div>
      {!now && q > 0 ? (
        <div
          style={{
            position: "absolute",
            right: -18,
            top: -22,
            width: 74,
            height: 74,
            borderRadius: 37,
            backgroundColor: YELLOW,
            border: `5px solid #FFFFFF`,
            boxShadow: "0 6px 14px rgba(20,40,75,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 1000,
            color: NAVY,
            transform: `scale(${popScale(q)})`,
          }}
        >
          ?
        </div>
      ) : null}
    </div>
  );
};

// Мама: бюст за столом. look — взгляд по горизонтали (−1…1), raise — рука с телефоном.
const Mom: React.FC<{
  readonly t: number;
  readonly look: number;
  readonly lookUp: number;
  readonly mouth: number;
  readonly blink: number;
  readonly worry: number;
  readonly tilt: number;
  readonly raise: number;
}> = ({ t, look, lookUp, mouth, blink, worry, tilt, raise }) => {
  const breath = Math.sin(t * 1.7) * 3;
  const eyeX = look * 9;
  const eyeY = -lookUp * 6;
  const lid = Math.max(blink, 0.08);
  // кисть с телефоном: на столе → перед грудью
  const hx = 640 - 90 * raise;
  const hy = 1290 - 200 * raise;
  const ex = 640;
  const ey = 1250;
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {/* волосы сзади */}
      <g transform={`rotate(${tilt} 420 960)`}>
        <path
          d="M 290 790 Q 280 640 420 630 Q 560 640 552 790 L 560 960 Q 500 990 420 985 Q 340 990 282 960 Z"
          fill={HAIR}
        />
      </g>
      {/* корпус */}
      <g transform={`translate(0 ${breath * 0.4})`}>
        <path
          d="M 230 1060 Q 250 1000 340 990 L 500 990 Q 590 1000 612 1060 L 660 1420 L 180 1420 Z"
          fill={BLAZER}
        />
        <path d="M 372 992 L 420 1110 L 468 992 Z" fill="#FFFFFF" />
        <path d="M 340 992 L 420 1150 L 372 992 Z" fill={BLAZER_D} />
        <path d="M 500 992 L 420 1150 L 468 992 Z" fill={BLAZER_D} />
        <path
          d="M 390 920 L 450 920 L 456 1000 Q 420 1022 384 1000 Z"
          fill={SKIN}
        />
        <path
          d="M 392 960 Q 420 975 448 960"
          fill="none"
          stroke={SKIN_D}
          strokeWidth={3}
          opacity={0.5}
        />
      </g>
      {/* голова */}
      <g transform={`rotate(${tilt} 420 960) translate(0 ${breath * 0.25})`}>
        <ellipse cx={300} cy={830} rx={16} ry={26} fill={SKIN} />
        <ellipse cx={540} cy={830} rx={16} ry={26} fill={SKIN} />
        <circle cx={300} cy={862} r={5} fill={YELLOW} />
        <circle cx={540} cy={862} r={5} fill={YELLOW} />
        <path
          d="M 304 790 Q 300 660 420 655 Q 540 660 536 790 L 534 860 Q 526 960 420 968 Q 314 960 306 860 Z"
          fill={SKIN}
        />
        {/* чёлка */}
        <path
          d="M 296 800 Q 290 640 420 632 Q 552 640 546 800 Q 520 712 450 700 Q 420 738 360 724 Q 318 742 296 800 Z"
          fill={HAIR}
        />
        {/* брови */}
        <path
          d={`M 350 ${762 - worry * 4} Q 376 ${748 - worry * 10} 402 ${758 - worry * 12}`}
          fill="none"
          stroke={HAIR}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path
          d={`M 438 ${758 - worry * 12} Q 464 ${748 - worry * 10} 490 ${762 - worry * 4}`}
          fill="none"
          stroke={HAIR}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* глаза */}
        {[376, 464].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={800} rx={22} ry={16} fill="#FFFFFF" />
            <circle cx={cx + eyeX} cy={801 + eyeY} r={11} fill="#3B2A22" />
            <circle cx={cx + eyeX + 3} cy={797 + eyeY} r={3.5} fill="#FFFFFF" />
            {/* веко */}
            <rect
              x={cx - 24}
              y={782}
              width={48}
              height={lid * 34}
              fill={SKIN}
            />
            <path
              d={`M ${cx - 23} ${784 + lid * 32} Q ${cx} ${778 + lid * 30} ${cx + 23} ${784 + lid * 32}`}
              fill="none"
              stroke="#5A3C30"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* нос */}
        <path
          d="M 422 812 Q 414 852 408 860 Q 420 868 434 860"
          fill="none"
          stroke={SKIN_D}
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* щёки */}
        <ellipse
          cx={350}
          cy={862}
          rx={22}
          ry={12}
          fill="#F2A08A"
          opacity={0.35}
        />
        <ellipse
          cx={490}
          cy={862}
          rx={22}
          ry={12}
          fill="#F2A08A"
          opacity={0.35}
        />
        {/* рот */}
        {mouth > 0.04 ? (
          <g>
            <ellipse
              cx={420}
              cy={902}
              rx={22 - mouth * 4}
              ry={4 + mouth * 15}
              fill="#7A3B33"
            />
            <ellipse
              cx={420}
              cy={896 + mouth * 10}
              rx={11}
              ry={3 + mouth * 3}
              fill="#D9706A"
              opacity={mouth > 0.3 ? 0.9 : 0}
            />
          </g>
        ) : (
          <path
            d={`M 398 ${900} Q 420 ${906 - worry * 6} 442 ${900}`}
            fill="none"
            stroke="#9A4A40"
            strokeWidth={5}
            strokeLinecap="round"
          />
        )}
      </g>
      {/* рука с телефоном */}
      <path
        d={`M ${ex} ${ey} Q ${(ex + hx) / 2 + 40} ${(ey + hy) / 2 + 30} ${hx} ${hy}`}
        fill="none"
        stroke={BLAZER}
        strokeWidth={70}
        strokeLinecap="round"
      />
      <g transform={`translate(${hx} ${hy}) rotate(${-14 + 10 * raise})`}>
        <rect x={-42} y={-86} width={84} height={150} rx={14} fill={NAVY} />
        <rect
          x={-35}
          y={-76}
          width={70}
          height={124}
          rx={8}
          fill={raise > 0.6 ? "#FFFFFF" : "#3D5A8A"}
        />
        <ellipse cx={0} cy={36} rx={44} ry={30} fill={SKIN} />
        <ellipse cx={-30} cy={10} rx={14} ry={24} fill={SKIN} />
      </g>
    </svg>
  );
};

export const Office: React.FC<{
  readonly t: number;
  readonly b: Bg05Beats;
  readonly cue?: Bg05Cue;
}> = ({ t, b, cue }) => {
  const c = b.compare;
  const inU = easeOut(prog(t, c.from - 0.3, 0.6));
  const cardsU = [
    easeOut(prog(t, c.cards, 0.5)),
    easeOut(prog(t, c.cards + 0.35, 0.5)),
  ];
  const drawNow = easeInOut(prog(t, c.cards + 0.3, 0.9));
  const drawPlan = easeInOut(prog(t, c.cards + 0.7, 0.9));
  // взгляд: ноутбук → карточка «Азыр» → карточка «Өзүнчө» → телефон
  const look =
    t < c.cards + 0.6
      ? 0.8
      : t < c.speak + 0.2
        ? -0.6
        : t < c.speakTo - 0.6
          ? 0.6
          : t < c.raise
            ? 0
            : 0.5;
  const lookUp = t < c.cards + 0.6 ? -0.3 : t < c.raise ? 1 : -0.6;
  const focusPlan = easeInOut(prog(t, c.speakTo - 1.2, 0.6));
  const q = easeOut(prog(t, c.speak + 0.6, 0.4));
  const raise = easeInOut(prog(t, c.raise, 0.5));
  const worry =
    t < c.speakTo
      ? Math.min(1, prog(t, c.cards + 0.5, 0.8)) * (1 - 0.6 * focusPlan)
      : 0.2;
  const tilt =
    Math.sin(t * 0.6) * 1.2 +
    (t > c.speak && t < c.speakTo ? -3 * easeInOut(prog(t, c.speak, 0.6)) : 0);
  const mouth = mouthAt(cue, t);
  const blink = blinkAt(t - c.from, [
    c.speakTo - c.from + 0.2,
    c.raise - c.from - 0.1,
  ]);
  // пузырь реплики мамы (ролик понятен без звука)
  const bubbleU = cue
    ? easeOut(prog(t, cue.from - 0.25, 0.3)) *
      (1 - easeInOut(prog(t, c.phone - 0.15, 0.25)))
    : 0;
  const zoom = 1 + 0.04 * prog(t, c.from, c.phone - c.from);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#EEF2F8",
        opacity: inU,
        fontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "50% 60%",
        }}
      >
        {/* окно с видом на горы */}
        <svg
          width={1080}
          height={1920}
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <rect x={0} y={0} width={1080} height={1920} fill="#EEF2F8" />
          <rect
            x={70}
            y={120}
            width={940}
            height={760}
            rx={20}
            fill="#FFFFFF"
          />
          <defs>
            <linearGradient id="bg05sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#BFD9F5" />
              <stop offset="1" stopColor="#EAF2FB" />
            </linearGradient>
          </defs>
          <rect
            x={90}
            y={140}
            width={900}
            height={720}
            rx={12}
            fill="url(#bg05sky)"
          />
          <svg x={90} y={140} width={900} height={720} viewBox="0 0 900 720">
            <Mountains
              width={900}
              y={300}
              shift={-40 + Math.sin(t * 0.2) * 6}
            />
            {/* невысокий город */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <rect
                key={i}
                x={i * 104 - 10}
                y={520 - (i % 3) * 50 - (i === 4 ? 70 : 0)}
                width={92}
                height={260}
                fill={i % 2 ? "#D7E1EE" : "#CBD7E7"}
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
              [0, 1, 2].map((r) => (
                <rect
                  key={`${i}-${r}`}
                  x={i * 104 + 10}
                  y={548 - (i % 3) * 50 - (i === 4 ? 70 : 0) + r * 44}
                  width={20}
                  height={22}
                  fill="#F2F6FB"
                />
              )),
            )}
            {[60, 300, 640, 820].map((x) => (
              <ellipse key={x} cx={x} cy={690} rx={50} ry={70} fill="#9FD0AA" />
            ))}
          </svg>
          <rect x={530} y={140} width={20} height={720} fill="#FFFFFF" />
          {/* стол */}
          <rect x={-20} y={1300} width={1120} height={700} fill="#E9DCCB" />
          <rect x={-20} y={1300} width={1120} height={22} fill="#D8C6B0" />
          {/* ноутбук: карта с красным крюком */}
          <g transform="translate(700 1060)">
            <rect
              x={-10}
              y={-10}
              width={320}
              height={232}
              rx={18}
              fill="#2B3A55"
            />
            <rect x={6} y={6} width={288} height={200} rx={8} fill="#F3F6FB" />
            {[50, 110, 170].map((y) => (
              <path
                key={y}
                d={`M 6 ${y} L 294 ${y}`}
                stroke="#E1E7F0"
                strokeWidth={8}
              />
            ))}
            {[80, 170, 250].map((x) => (
              <path
                key={x}
                d={`M ${x} 6 L ${x} 206`}
                stroke="#E1E7F0"
                strokeWidth={8}
              />
            ))}
            <polyline
              points="250,50 250,110 170,110 170,170 80,170 80,110 250,110"
              fill="none"
              stroke={RED}
              strokeWidth={9}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M -40 222 L 340 222 L 360 246 L -60 246 Z"
              fill="#3A4B68"
            />
          </g>
          {/* папка с документами */}
          <rect
            x={90}
            y={1330}
            width={230}
            height={40}
            rx={8}
            fill="#5B8DEF"
            opacity={0.7}
            transform="rotate(-4 200 1350)"
          />
        </svg>
        <Mom
          t={t}
          look={look}
          lookUp={lookUp}
          mouth={mouth}
          blink={blink}
          worry={worry}
          tilt={tilt}
          raise={raise}
        />
        {/* карточки двух путей */}
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 190,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Card
            kind="now"
            u={cardsU[0]}
            draw={drawNow}
            focus={focusPlan}
            q={0}
          />
          <Card
            kind="plan"
            u={cardsU[1]}
            draw={drawPlan}
            focus={focusPlan}
            q={q}
          />
        </div>
      </div>
      {bubbleU > 0 && cue ? (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 1440,
            opacity: bubbleU,
            transform: `translateY(${(1 - bubbleU) * 20}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 300,
              top: -34,
              width: 0,
              height: 0,
              borderLeft: "26px solid transparent",
              borderRight: "26px solid transparent",
              borderBottom: "36px solid #FFFFFF",
            }}
          />
          <div
            style={{
              padding: "22px 30px",
              borderRadius: 34,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 10px 26px rgba(20,40,75,0.2)",
              fontSize: 46,
              fontWeight: 900,
              color: NAVY,
              lineHeight: 1.22,
              textAlign: "center",
            }}
          >
            {cue.words.map((w, i) => {
              const on = t >= w.start - 0.05;
              return (
                <span key={i} style={{ opacity: on ? 1 : 0.45 }}>
                  {w.text}
                  {i < cue.words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
