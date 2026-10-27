// Сцена 6 (финал): шестерёнки замерли и стали круглым жёлтым фирменным
// акцентом (на него садится жёлтый круг перехода Iris), на нём — логотип
// BalaGo. Из-за круга выглядывают оба будильника. Ниже — неподвижный
// финальный экран: «BalaGo», «Бишкек • Балдар үчүн такси», «Балаңызды
// алдын ала каттаңыз», «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу
// жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Оба способа связи, город и
// номер видны одновременно с BG43_CONTACTS_IN до последнего кадра (≥ 5 с),
// после последнего слова экран держится ≥ 3 с.
// На словах «профилдеги шилтемеге» «Жумуш сааты» показывает вверх (на шапку
// профиля), на «экрандагы номерге» «Мектеп сааты» показывает вниз, на
// номер; на «жолго чыгалы!» оба машут и тихо звенят.
// Безопасная зона Reels: текст между y = 250 и 1500, справа ≥ 150 px.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeOut, keys, pop, squashPulse } from "../anim";
import { gearPath, timeToDeg, type ClockArm } from "../chars/Clock";
import { ClockActor, exprKeys } from "../chars/ClockActor";
import { useScene, useTimeline } from "../context";
import { Logo } from "../parts";
import { C } from "../palette";
import { BG43_CONTACTS_IN, BG43_TEXT, BG43_VIDEO } from "../script";
import type { SceneSfx } from "../sfxCues";
import { cueFrames, wordFrame, type Bg43Timeline } from "../timing";

const T = BG43_TEXT.cta;
const DISC = { x: 540, y: 600, r: 230 } as const;
const W8 = timeToDeg(8, 0);
const S13 = timeToDeg(13, 0);
const CLOCK = { size: 62, y: 846, work: 232, school: 848 } as const;

export const ctaBeats = (
  tl: Bg43Timeline,
  sceneFrom: number,
  frames: number,
) => {
  const n4 = cueFrames(tl, "n04");
  const n6 = cueFrames(tl, "n06");
  return {
    logo: 6,
    contacts: Math.round(BG43_CONTACTS_IN * BG43_VIDEO.fps),
    city: wordFrame(tl, "n04", 2) - sceneFrom, // «Бишкектеги»
    profile: wordFrame(tl, "n05", 5) - sceneFrom, // «профилдеги»
    number: wordFrame(tl, "n05", 9) - sceneFrom, // «экрандагы»
    n4: n4.from - sceneFrom,
    n6: n6.from - sceneFrom,
    end: n6.to - sceneFrom,
    frames,
  };
};

const LinkIcon: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 46 46" style={{ flex: "none" }}>
    <circle cx={23} cy={23} r={22} fill={C.yellow} />
    <path
      d="M 23 33 L 23 13 M 15 20 L 23 12 L 31 20"
      fill="none"
      stroke={C.navy}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WaIcon: React.FC = () => (
  <svg width={48} height={48} viewBox="0 0 48 48" style={{ flex: "none" }}>
    <circle cx={24} cy={24} r={23} fill="#25B35A" />
    <path
      d="M 13 36 L 15.5 29 A 12 12 0 1 1 20 33.5 Z"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={3.2}
      strokeLinejoin="round"
    />
    <path
      d="M 19.5 18.5 Q 19 23 23 27 Q 27 30.5 30.5 29.5 L 30 27 L 27 26 L 25.5 27.2 Q 22 25.5 21 22 L 22 20.5 L 21.2 17.6 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, frames } = useScene();
  const b = ctaBeats(tl, from, frames);

  // зубцы «замерших шестерёнок» по краю круга: докручиваются и стоят
  const rimRot = 70 * easeOut(clamp(f / 34));
  const rimOn = appear(f, 0, 8);
  const logoK = pop(f, b.logo, 16);
  const item = (at: number): React.CSSProperties => ({
    opacity: appear(f, at, 10),
    transform: `translateY(${(1 - appear(f, at, 10)) * 24}px)`,
  });
  const contactsOn = appear(f, b.contacts - 8, 8);

  // часы выглядывают из-за круга
  const peekW = easeOut(clamp((f - 10) / 14));
  const peekS = easeOut(clamp((f - 14) / 14));
  const wave = clamp((f - b.n6 + 4) / 8) * (1 - clamp((f - b.end - 30) / 10));
  const pointUp = keys(f, [
    [b.profile - 6, 0],
    [b.profile + 4, 1],
    [b.profile + 46, 1],
    [b.profile + 56, 0],
  ]);
  const pointDown = keys(f, [
    [b.number - 6, 0],
    [b.number + 4, 1],
    [b.number + 50, 1],
    [b.number + 60, 0],
  ]);
  const waveArm = (side: -1 | 1, ph: number): ClockArm => ({
    x: side * 150,
    y: -232 + Math.sin(f * 0.55 + ph) * 18,
    shape: "wave",
  });
  const wExpr = exprKeys(f, [
    [0, "happy"],
    [b.profile, "proud"],
    [b.profile + 50, "happy"],
  ]);
  const sExpr = exprKeys(f, [
    [0, "happy"],
    [b.number, "excited"],
    [b.number + 54, "happy"],
  ]);

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
          left: -240,
          top: -260,
          width: 760,
          height: 760,
          borderRadius: 380,
          backgroundColor: C.yellowSoft,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -220,
          top: 1240,
          width: 640,
          height: 640,
          borderRadius: 320,
          backgroundColor: C.sky,
        }}
      />
      {/* часы — за кругом, выглядывают по бокам */}
      <ClockActor
        kind="work"
        seed={3}
        x={CLOCK.work + (1 - peekW) * 120}
        y={CLOCK.y}
        size={CLOCK.size}
        hourDeg={W8.hourDeg}
        minDeg={W8.minDeg}
        expr={wExpr}
        face={0.35 * (1 - pointUp)}
        lookX={0.5 * (1 - pointUp)}
        lookY={-0.8 * pointUp}
        tilt={-8 * (1 - peekW) + Math.sin(f / 19) * 1.5}
        squash={squashPulse(f, 24, 10, 0.6) + squashPulse(f, b.n6, 10, -0.5)}
        ring={0.35 * wave * clamp((b.n6 + 22 - f) / 10)}
        armL={
          wave > 0.05
            ? waveArm(-1, 0)
            : pointUp > 0.05
              ? {
                  x: -96 - 30 * pointUp,
                  y: -150 - 128 * pointUp,
                  shape: "point",
                }
              : null
        }
        armR={wave > 0.05 ? { x: 128, y: -72, shape: "relax" } : null}
        shadow={false}
      />
      <ClockActor
        kind="school"
        seed={7}
        x={CLOCK.school - (1 - peekS) * 120}
        y={CLOCK.y}
        size={CLOCK.size}
        hourDeg={S13.hourDeg}
        minDeg={S13.minDeg}
        expr={sExpr}
        face={-0.35 * (1 - pointDown)}
        lookX={-0.5 * (1 - pointDown) - 0.3 * pointDown}
        lookY={0.9 * pointDown}
        tilt={8 * (1 - peekS) - Math.sin(f / 17 + 1) * 1.5}
        squash={
          squashPulse(f, 28, 10, 0.6) + squashPulse(f, b.n6 + 2, 10, -0.5)
        }
        ring={0.35 * wave * clamp((b.n6 + 24 - f) / 10)}
        armR={wave > 0.05 ? waveArm(1, 1.3) : null}
        armL={
          pointDown > 0.05
            ? {
                x: -120 - 20 * pointDown,
                y: -60 + 50 * pointDown,
                shape: "point",
              }
            : null
        }
        shadow={false}
      />
      {/* жёлтый круг: зубцы по краю докручиваются и замирают */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <g
          transform={`translate(${DISC.x} ${DISC.y}) rotate(${rimRot})`}
          opacity={rimOn}
        >
          <path
            d={gearPath(18, 38, 43)}
            transform={`scale(${(DISC.r + 22) / 43})`}
            fill={C.yellowDeep}
            opacity={0.55}
          />
        </g>
        <circle cx={DISC.x} cy={DISC.y} r={DISC.r} fill={C.yellow} />
        <circle
          cx={DISC.x}
          cy={DISC.y}
          r={DISC.r - 18}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={6}
          opacity={0.5}
        />
      </svg>
      <Logo
        x={DISC.x}
        y={DISC.y}
        r={186}
        opacity={clamp(logoK * 2)}
        scale={0.55 + 0.45 * logoK}
      />
      {/* тексты финала: неподвижны после появления */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 150,
          top: 872,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{ ...item(10), fontSize: 92, fontWeight: 900, lineHeight: 1 }}
        >
          {T.brand}
        </div>
        <div
          style={{
            ...item(14),
            padding: "10px 30px 12px",
            borderRadius: 999,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontSize: 44,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {T.city}
        </div>
        <div
          style={{
            ...item(18),
            fontSize: 38,
            fontWeight: 800,
            color: "#3A4F80",
          }}
        >
          {T.early}
        </div>
        {/* оба способа связи и полный номер — вместе, до последнего кадра */}
        <div
          style={{
            opacity: contactsOn,
            marginTop: 4,
            width: "100%",
            padding: "22px 18px 20px",
            borderRadius: 32,
            border: "4px solid #DCE3EE",
            backgroundColor: "#F8FAFD",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            <LinkIcon />
            {T.link}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#3A4F80",
              lineHeight: 1.15,
            }}
          >
            {T.or}
          </div>
          <div
            style={{
              marginTop: 8,
              width: "100%",
              padding: "12px 0 14px",
              borderRadius: 24,
              backgroundColor: "#E8F6EC",
              border: "3px solid #BFE3CB",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 44,
                fontWeight: 900,
                color: "#1F7A45",
              }}
            >
              <WaIcon />
              {T.whatsappLabel}
            </div>
            <div
              style={{
                fontSize: 98,
                fontWeight: 900,
                letterSpacing: 1,
                lineHeight: 1.05,
                color: C.navy,
                whiteSpace: "nowrap",
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

export const ctaSfx: SceneSfx = (tl, from, frames) => {
  const b = ctaBeats(tl, from, frames);
  return [
    { at: from + 2, src: "gear", volume: 0.12 },
    { at: from + b.logo + 4, src: "pop", volume: 0.24 },
    { at: from + b.contacts - 6, src: "chime", volume: 0.16 },
    { at: from + b.profile + 2, src: "tick", volume: 0.14 },
    { at: from + b.number + 2, src: "tick", volume: 0.14 },
    { at: from + b.n6 + 2, src: "ringShort", volume: 0.12 },
  ];
};
