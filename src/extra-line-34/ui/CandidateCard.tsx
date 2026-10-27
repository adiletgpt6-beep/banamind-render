// Карточка кандидата (сцена 4): круглый портрет (риг cand1/cand2 по пояс),
// метка «1-талапкер», плюс — ✓ в мягком зелёном круге, минус — нейтральное
// серое тире. Доброжелательно и спокойно: хорошие люди, которые просто не
// совпали со всеми требованиями сразу. Без рейтингов, крестов и красного.
//
// Макет 900 × 356 px, масштабируется до w.
import { Actor } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { clamp, easeOut } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS, SHADOW } from "../theme";

export const CAND_W = 900;
export const CAND_H = 356;
export const candidateHeight = (w: number) => (CAND_H * w) / CAND_W;

const PAD = 44;
const AV = 176; // диаметр портрета
const COL_X = PAD + AV + 40;
const COL_W = CAND_W - COL_X - PAD;
const ICON = 52;
const SIZE = 46;
const LH = 55;

const LOOK = ["cand1", "cand2"] as const;
const AV_BG = [C.sky, "#ECE6F1"] as const;

// Портрет по грудь: персонаж рига в круге. Голова ≈ половина диаметра.
const Portrait: React.FC<{
  readonly which: 0 | 1;
  readonly d: number;
  readonly f: number;
}> = ({ which, d, f }) => {
  const b = LOOKS[LOOK[which]].build;
  const k = (d * 0.5) / (2 * b.headRy); // голова ≈ половина диаметра
  const place = () => ({ x: d * 0.5, y: d * 0.43 - b.headY * k, h: 1000 * k });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: AV_BG[which],
      }}
    >
      <div
        style={{
          position: "absolute",
          left: d * 0.12,
          top: d * 0.1,
          width: d * 0.76,
          height: d * 0.76,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)",
        }}
      />
      <Actor uid={`cand-${which}`} look={LOOK[which]} f={f} place={place} face={() => (which === 0 ? 0.12 : -0.08)} pose={() => ({ expr: "softSmile" })} seed={which === 0 ? 5 : 9} />
    </div>
  );
};

const Check: React.FC = () => (
  <svg width={ICON} height={ICON} viewBox="0 0 52 52" style={{ flex: "none", marginTop: (LH - ICON) / 2 }}>
    <circle cx={26} cy={26} r={26} fill={C.checkSoft} />
    <path d="M 15.5 27 L 22.5 34 L 36.5 19" fill="none" stroke={C.check} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Dash: React.FC = () => (
  <svg width={ICON} height={ICON} viewBox="0 0 52 52" style={{ flex: "none", marginTop: (LH - ICON) / 2 }}>
    <circle cx={26} cy={26} r={26} fill="#EDF0F4" />
    <path d="M 16.5 26 L 35.5 26" stroke={C.dash} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

const Row: React.FC<{
  readonly k: number;
  readonly icon: React.ReactNode;
  readonly color: string;
  readonly children: React.ReactNode;
}> = ({ k, icon, color, children }) => (
  <div
    style={{
      display: "flex",
      gap: 20,
      alignItems: "flex-start",
      opacity: easeOut(k),
      transform: `translateY(${(1 - easeOut(k)) * 14}px)`,
    }}
  >
    {icon}
    <div
      style={{
        width: COL_W - ICON - 20,
        fontSize: SIZE,
        fontWeight: 700,
        lineHeight: `${LH}px`,
        color,
      }}
    >
      {children}
    </div>
  </div>
);

export type CandidateCardProps = {
  readonly which: 0 | 1;
  readonly w?: number; // ширина, px (макет — 900)
  readonly x?: number;
  readonly y?: number;
  readonly reveal?: number; // 0…1: карточка входит, затем плюс, затем минус
  readonly focus?: number; // 0…1: мягкая жёлтая обводка (мама смотрит на эту карточку)
  readonly f?: number; // кадр для портрета (дыхание/моргание); по умолчанию — неподвижно
  readonly style?: React.CSSProperties;
};

export const CandidateCard: React.FC<CandidateCardProps> = ({ which, w = CAND_W, x = 0, y = 0, reveal = 1, focus = 0, f = 0, style }) => {
  const s = w / CAND_W;
  const t = EL_TEXT.candidates[which];
  const k0 = easeOut(clamp(reveal / 0.45));
  const kPlus = clamp((reveal - 0.35) / 0.3);
  const kMinus = clamp((reveal - 0.65) / 0.35);
  const fo = easeOut(clamp(focus));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: CAND_H * s,
        ...style,
        opacity: clamp(reveal / 0.27) * Number(style?.opacity ?? 1),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CAND_W,
          height: CAND_H,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${(1 - k0) * 50}px) scale(${1 + 0.012 * fo})`,
            backgroundColor: C.card,
            borderRadius: RADIUS.card,
            boxShadow: `0 0 0 ${6 * fo}px rgba(255,212,71,${0.85 * fo}), ${fo > 0 ? SHADOW.lift : SHADOW.card}`,
            fontFamily: F.text,
            color: C.ink,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: PAD,
              top: (CAND_H - AV) / 2,
              width: AV,
              height: AV,
            }}
          >
            <Portrait which={which} d={AV} f={f} />
          </div>
          <div
            style={{
              position: "absolute",
              left: COL_X,
              top: PAD,
              width: COL_W,
              height: CAND_H - 2 * PAD,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                height: 50,
                lineHeight: "50px",
                padding: "0 22px",
                borderRadius: RADIUS.chip,
                backgroundColor: "#E9EEF4",
                color: C.inkSoft,
                fontSize: 32,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {t.label}
            </div>
            <Row k={kPlus} icon={<Check />} color={C.ink}>
              {t.plus}
            </Row>
            <Row k={kMinus} icon={<Dash />} color={C.inkSoft}>
              {t.minus}
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};
