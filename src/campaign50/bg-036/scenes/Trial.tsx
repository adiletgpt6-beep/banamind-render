// Сцена 4 (≈32–44 с). «Биринчи акысыз толук сыноо сапары бул беш бонус
// сапардын ичинде эмес. Адегенде ылайыктуу топ табылышы керек.»
// Начало — ровно конец сцены bonus (разделённая лента, заголовок
// «40 төлөйсүз → 45 аласыз»). Вся лента-«45» отъезжает влево вверх и
// обводится пунктиром с меткой «45». Рука мамы кладёт РЯДОМ отдельную
// белую карточку «Биринчи толук сыноо сапары • Акысыз» — вне рамки 45.
// Карточку подносят к бонусному столбику: «≠» и «5 бонустун ичинде эмес»,
// она возвращается на своё место. На «Адегенде…» под карточкой появляется
// «Төлөм», и мама сдвигает карточку так, что её край закрывает платёж
// («Азырынча төлөм жок»). Ниже — условный пример подбора группы: места с
// ремнями заполняются детьми (3–4 бала, поиск до 2 недель), и только
// после этого на карточке пробы загорается галочка.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import type { SfxPlan } from "../Bg36Audio";
import { TopHand } from "../art/Hand";
import { clamp, easeInOut, easeOut, lerp, spring } from "../art/motion";
import { SeparatedTape } from "../art/Separated";
import { Desk } from "../art/Desk";
import { TripStamp } from "../art/Tape";
import { ArrowGlyph, Check, ExampleTag, Headline, Pill, Txt } from "../art/ui";
import { World, camKeys } from "../art/World";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { type ScenePlanArgs, useSceneArgs, wordF } from "./common";

const T = BG36_TEXT.trial;

// Разделённая лента в конце сцены bonus: рамка x 110…850, y 558…1150.
const SEP_BOX = { x: 110, y: 558, w: 740, h: 592 };
const GROUP = { s: 0.6, x: 84, y: 476 }; // куда уезжает «45» (левый верх, масштаб)
const FRAME = {
  x: GROUP.x - 20,
  y: GROUP.y - 30, // над подписями столбцов — место для метки «45»
  w: SEP_BOX.w * GROUP.s + 40,
  h: SEP_BOX.h * GROUP.s + 52,
};
const CARD = { x: 610, y: 474, w: 376, h: 300 }; // зазор с рамкой «45» — место для «≠»
const CARD_DOWN = 64; // насколько карточка сдвигается вниз, накрывая платёж
const PAY = { x: 663, y: 806, w: 270, h: 84 }; // нижняя половина «Төлөм» выглядывает из-под карточки
const PANEL = { x: 84, y: 958, w: 846, h: 270 };

export const trialPlan = (a: ScenePlanArgs) => {
  const w = (i: number) => wordF(a, "n04", i);
  const enter0 = Math.max(18, w(0) - 10);
  const enter1 = enter0 + 22;
  const free = Math.max(enter1 - 4, w(1));
  const toBonus0 = Math.max(enter1 + 6, w(5) - 2);
  const neq = Math.max(toBonus0 + 10, w(7));
  const back0 = Math.max(neq + 14, w(10) + 2);
  const group0 = Math.max(back0 + 8, w(11));
  const cover0 = group0 + 4;
  const cover1 = cover0 + 18;
  const seats = Math.max(group0 + 8, w(12));
  const kids = [0, 1, 2].map((k) => Math.max(seats + 10, w(13)) + k * 8);
  const ok = Math.max(kids[2] + 12, w(15) + 4);
  return { enter0, enter1, free, toBonus0, neq, back0, group0, cover0, cover1, seats, kids, ok, frames: a.sc.frames };
};

export const SFX_TRIAL: SfxPlan = (a) => {
  const p = trialPlan(a);
  return [
    { at: 4, src: "audio/sfx-whoosh.mp3", volume: 0.14 },
    { at: p.enter0, src: "audio/sfx-paper.mp3", volume: 0.3 },
    { at: p.free, src: "audio/sfx-pop.mp3", volume: 0.22 },
    { at: p.neq, src: "audio/sfx-tap.mp3", volume: 0.4 },
    { at: p.cover0 + 4, src: "audio/sfx-paper.mp3", volume: 0.22 },
    ...p.kids.map((k) => ({ at: k, src: "audio/sfx-pop.mp3", volume: 0.16 })),
    { at: p.ok, src: "audio/sfx-chime.mp3", volume: 0.16 },
  ];
};

// Подарок-проба (белая коробка, жёлтая лента).
const TrialIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40" style={{ display: "block" }}>
    <rect x={-15} y={-6} width={30} height={20} rx={3} fill="#FFFFFF" stroke={C.green} strokeWidth={2.5} />
    <rect x={-17} y={-12} width={34} height={8} rx={2} fill="#FFFFFF" stroke={C.green} strokeWidth={2.5} />
    <rect x={-3} y={-12} width={6} height={26} fill={C.yellow} />
    <path d="M 0 -12 Q -10 -22 -12 -14 Q -12 -10 0 -12 Q 10 -22 12 -14 Q 12 -10 0 -12" fill={C.yellow} stroke={C.yellowDeep} strokeWidth={1.5} />
  </svg>
);

// Место в машине: спинка с подголовником; ребёнок пристёгнут ремнём.
const Seat: React.FC<{ readonly kid: number; readonly maybe?: boolean; readonly coat: string }> = ({ kid, maybe, coat }) => (
  <svg width={106} height={113} viewBox="-62 -70 124 132" style={{ display: "block", overflow: "visible" }}>
    <rect x={-44} y={-30} width={88} height={88} rx={20} fill={maybe ? "transparent" : "#E7ECF4"} stroke={C.navy} strokeWidth={4} strokeDasharray={maybe ? "10 8" : undefined} opacity={maybe ? 0.55 : 1} />
    <rect x={-24} y={-62} width={48} height={30} rx={12} fill={maybe ? "transparent" : "#E7ECF4"} stroke={C.navy} strokeWidth={4} strokeDasharray={maybe ? "8 7" : undefined} opacity={maybe ? 0.55 : 1} />
    {maybe ? (
      <text x={0} y={22} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={44} fill={C.muted}>
        ?
      </text>
    ) : null}
    {kid > 0 ? (
      <g transform={`translate(0 ${(1 - kid) * 30}) scale(${0.7 + 0.3 * kid})`} opacity={clamp(kid * 2)}>
        <path d="M -32 58 Q -32 6 0 6 Q 32 6 32 58 Z" fill={coat} />
        <circle cx={0} cy={-18} r={22} fill={C.skin} />
        <path d="M -22 -20 Q -22 -44 0 -44 Q 22 -44 22 -20 Q 12 -34 -22 -20 Z" fill="#2E2422" />
        <circle cx={-7} cy={-17} r={2.6} fill="#2E2422" />
        <circle cx={7} cy={-17} r={2.6} fill="#2E2422" />
        <path d="M -6 -7 Q 0 -3 6 -7" stroke="#9A4A3A" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {/* ремень через плечо */}
        <path d="M 22 10 L -18 58" stroke="#1E2235" strokeWidth={9} strokeLinecap="round" />
        <rect x={-8} y={36} width={14} height={9} rx={2} fill="#9AA3B2" transform="rotate(-50 -1 40)" />
      </g>
    ) : null}
  </svg>
);

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const p = trialPlan(useSceneArgs("trial"));
  // «45» уезжает в левый верхний угол и уменьшается
  const shrink = easeInOut((f - 2) / 24);
  const gs = lerp(1, GROUP.s, shrink);
  const gx = lerp(0, GROUP.x - SEP_BOX.x * GROUP.s, shrink);
  const gy = lerp(0, GROUP.y - SEP_BOX.y * GROUP.s, shrink);
  const frameIn = easeOut((f - 18) / 14);
  // карточка: въезжает справа вместе с рукой, подносится к бонусам, возвращается, сдвигается вниз
  const enter = easeOut((f - p.enter0) / (p.enter1 - p.enter0));
  const toBonus = easeInOut((f - p.toBonus0) / 14) * (1 - easeInOut((f - p.back0) / 14));
  const cover = easeInOut((f - p.cover0) / (p.cover1 - p.cover0));
  // карточку подносят к бонусам, но она не заходит в рамку «45»
  const cardX = CARD.x + (1 - enter) * 560 - toBonus * 22;
  const cardY = CARD.y + cover * CARD_DOWN;
  const cardRot = (1 - enter) * 8 - toBonus * 3;
  const lift = Math.max(1 - enter, toBonus * 0.6, Math.sin(Math.PI * clamp((f - p.cover0) / (p.cover1 - p.cover0))) * 0.4);
  const freeIn = spring((f - p.free) / 14);
  const neqIn = spring((f - p.neq) / 12);
  const payIn = easeOut((f - (p.group0 - 6)) / 10);
  const laterIn = easeOut((f - p.cover1 + 2) / 10);
  const panelIn = easeOut((f - p.seats + 6) / 12);
  const okIn = spring((f - p.ok) / 14);
  // рука: держит правый край карточки (рука справа), пока карточку двигают
  const handOn =
    clamp((f - p.enter0 + 4) / 6) * (1 - clamp((f - p.enter1 - 6) / 10)) +
    clamp((f - p.toBonus0 + 6) / 6) * (1 - clamp((f - p.back0 - 16) / 10)) +
    clamp((f - p.cover0 + 6) / 6) * (1 - clamp((f - p.cover1 - 6) / 10));
  const handVis = clamp(handOn);
  // рука приходит и уходит вправо за край кадра (без растворения)
  const handX = cardX + CARD.w - 10 + (1 - handVis) * 420;
  const handY = cardY + CARD.h * 0.45;
  const cam = camKeys(f, [
    [0, { x: 540, y: 955, zoom: 1 }],
    [p.frames, { x: 540, y: 935, zoom: 1.025 }],
  ]);
  const headSwap = p.group0;
  return (
    <>
      <World cam={cam}>
        <Desk />
        {/* лента-«45» */}
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${gx}px, ${gy}px) scale(${gs})` }}>
          <SeparatedTape labels={1} divider={1} glow={0.6} />
        </div>
        {/* рамка «45»: всё, что входит в пакет */}
        <div
          style={{
            position: "absolute",
            left: FRAME.x,
            top: FRAME.y,
            width: FRAME.w,
            height: FRAME.h,
            borderRadius: 26,
            border: `4px dashed ${C.navy}`,
            opacity: 0.55 * frameIn,
          }}
        />
        <div style={{ position: "absolute", left: FRAME.x + 16, top: FRAME.y - 26, opacity: frameIn, transform: `scale(${0.8 + 0.2 * frameIn})` }}>
          <Pill tone="navy" size={34}>
            45
          </Pill>
        </div>
        {/* платёж: появляется под карточкой и закрывается её краем */}
        {payIn > 0 ? (
          <div
            style={{
              position: "absolute",
              left: PAY.x,
              top: PAY.y,
              width: PAY.w,
              height: PAY.h,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              border: `3px solid ${C.muted}`,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 9,
              boxSizing: "border-box",
              gap: 14,
              fontFamily,
              fontSize: 32,
              fontWeight: 900,
              color: C.ink,
              opacity: payIn,
              boxShadow: "0 6px 14px rgba(40,48,70,0.12)",
            }}
          >
            <svg width={40} height={30} viewBox="0 0 46 34">
              <rect x={2} y={2} width={42} height={30} rx={6} fill="#E7ECF4" stroke={C.ink} strokeWidth={3} />
              <rect x={2} y={9} width={42} height={6} fill={C.ink} />
              <rect x={8} y={21} width={14} height={5} rx={2} fill={C.ink} />
            </svg>
            {T.payment}
          </div>
        ) : null}
        {/* карточка первой бесплатной пробы — отдельно от 45 */}
        {enter > 0 ? (
          <div
            style={{
              position: "absolute",
              left: cardX,
              top: cardY,
              width: CARD.w,
              height: CARD.h,
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              border: `4px solid ${C.green}`,
              boxShadow: `0 ${10 + 26 * lift}px ${22 + 26 * lift}px rgba(40,48,70,${0.18 + 0.08 * lift})`,
              transform: `rotate(${cardRot}deg) scale(${1 + 0.03 * lift})`,
              fontFamily,
              color: C.navy,
              boxSizing: "border-box",
              padding: "22px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <TrialIcon size={70} />
              <div style={{ transform: `scale(${freeIn})`, transformOrigin: "100% 50%" }}>
                <Pill tone="green" size={34}>
                  {T.free}
                </Pill>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 40, fontWeight: 1000, lineHeight: 1.12 }}>{T.card}</div>
            <div style={{ position: "absolute", right: 22, bottom: 18 }}>
              <TripStamp size={64} rot={-8} ink={C.green} />
            </div>
            {/* галочка: проба возможна после того, как группа собрана */}
            {okIn > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: -24,
                  top: -24,
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: C.green,
                  transform: `scale(${okIn})`,
                  boxShadow: "0 6px 16px rgba(30,110,60,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={42} draw={clamp((f - p.ok) / 10)} />
              </div>
            ) : null}
          </div>
        ) : null}
        {/* «≠» и «5 бонустун ичинде эмес» — поверх карточки */}
        {neqIn > 0 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: (FRAME.x + FRAME.w + CARD.x - 22) / 2,
                top: CARD.y + 110,
                width: 56,
                height: 56,
                marginLeft: -28,
                borderRadius: 28,
                backgroundColor: C.red,
                color: "#FFFFFF",
                fontFamily,
                fontSize: 44,
                fontWeight: 1000,
                lineHeight: "52px",
                textAlign: "center",
                transform: `scale(${neqIn})`,
                boxShadow: "0 8px 18px rgba(150,40,40,0.3)",
              }}
            >
              ≠
            </div>
            <div style={{ position: "absolute", left: FRAME.x, width: FRAME.w, top: FRAME.y + FRAME.h + 14, display: "flex", justifyContent: "center", opacity: clamp(neqIn) }}>
              <Pill tone="white" size={30} style={{ border: `3px solid ${C.red}`, color: C.red }}>
                {T.notInBonus}
              </Pill>
            </div>
          </>
        ) : null}
        {laterIn > 0 ? (
          <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: PAY.y + PAY.h + 10, display: "flex", justifyContent: "center", opacity: laterIn }}>
            <Pill tone="white" size={30}>
              {T.later}
            </Pill>
          </div>
        ) : null}
        {/* условный пример подбора группы: места с ремнями */}
        {panelIn > 0 ? (
          <div
            style={{
              position: "absolute",
              left: PANEL.x,
              top: PANEL.y + (1 - panelIn) * 30,
              width: PANEL.w,
              height: PANEL.h,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.97)",
              border: `3px solid ${C.yellow}`,
              boxShadow: "0 12px 28px rgba(20,40,90,0.14)",
              opacity: panelIn,
              fontFamily,
              color: C.navy,
            }}
          >
            <div style={{ position: "absolute", left: 26, top: 26, display: "flex", alignItems: "center", gap: 12 }}>
              {[0, 1, 2, 3].map((k) => {
                const seatIn = easeOut((f - p.seats - k * 3) / 10);
                const kid = k < 3 ? easeOut((f - p.kids[k]) / 10) : 0;
                return (
                  <div key={k} style={{ opacity: seatIn, transform: `translateY(${(1 - seatIn) * 14}px)` }}>
                    <Seat kid={kid} maybe={k === 3} coat={["#E85D75", "#4E7BC7", "#2E8B57"][k % 3]} />
                  </div>
                );
              })}
              <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 34, fontWeight: 900, opacity: clamp((f - p.kids[2] - 4) / 10) }}>
                <ArrowGlyph color={C.green} />
                <TrialIcon size={56} />
              </div>
            </div>
            <div style={{ position: "absolute", left: 28, bottom: 20, fontSize: 30, fontWeight: 800, color: C.ink, opacity: clamp((f - p.seats - 6) / 10) }}>
              {T.groupNote}
            </div>
            <div style={{ position: "absolute", right: 16, top: 16, transform: "scale(0.8)", transformOrigin: "100% 0%" }}>
              <ExampleTag text={BG36_TEXT.example} size={28} />
            </div>
          </div>
        ) : null}
        {handVis > 0.01 ? <TopHand x={handX} y={handY} pose="pinch" angle={-96} lift={0.25 + 0.3 * lift} s={1.0} /> : null}
      </World>
      {/* заголовок предыдущей сцены уходит, затем «өзүнчө», затем «Алгач ылайыктуу топ» */}
      <Headline f={f} at={-30} out={0} top={290}>
        <Txt>{BG36_TEXT.bonus.equation}</Txt>
      </Headline>
      <Headline f={f} at={p.enter1 - 4} out={headSwap} top={290} size={60}>
        {T.separate}
      </Headline>
      <Headline f={f} at={headSwap + 10} top={290} size={60}>
        {T.groupFirst}
      </Headline>
    </>
  );
};
