// Сцена 5 (≈44–57 с). «Сыноодон кийин гана улантууну жана топтомду
// тандайсыз. Жалпы баа үй менен мектептин аралыгына жараша эсептелет.»
// Вид сверху: мама раскрывает сложенную пополам карточку «Арыз»; поля
// «Үйдүн дареги», «Мектеп», «Убакыт» заполняются (условный пример).
// На словах «Сыноодон… улантууну… топтомду» вверху по очереди ложатся
// штампы «Сыноо → Чечим → Топтом». Затем на стол выезжает ложный единый
// ценник «Баарына бир баа?» (без сумм); жёлтая бумажная линейка одним
// движением въезжает слева и останавливает его — ценник перечёркнут и
// уходит. На линейке — ҮЙ и МЕКТЕП, между ними «Аралык • км»; метка
// школы сдвигается: расстояние разное — значит, и цена разная.
// «Баасы аралыкка жараша». Никаких сумм и фиксированной цены.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import type { SfxPlan } from "../Bg36Audio";
import { Desk } from "../art/Desk";
import { TopHand, mixPose } from "../art/Hand";
import { clamp, easeIn, easeInOut, easeOut, lerp } from "../art/motion";
import { ArrowGlyph, Check, ExampleTag, Headline } from "../art/ui";
import { World, camKeys } from "../art/World";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { type ScenePlanArgs, useSceneArgs, wordF } from "./common";

const A = BG36_TEXT.apply;
const FORM = { x: 120, y: 440, w: 840, h: 420 }; // карточка «Арыз» (раскрытая)
const HALF = FORM.h / 2;
const RULER = { x: 96, y: 1170, w: 560, h: 96 }; // справа остаётся место ценнику (x ≤ 930)
// Ценник едет на уровне линейки; stop — где его острый край встречает торец линейки.
const TAG = {
  w: 262,
  h: 150,
  y: RULER.y + RULER.h / 2 - 75,
  stop: RULER.x + RULER.w + 2,
};

export const applyPlan = (a: ScenePlanArgs) => {
  const w = (i: number) => wordF(a, "n05", i);
  const open0 = 4;
  const open1 = 26;
  const rows = [0, 1, 2].map((k) => open1 - 2 + k * 10);
  // штампы ложатся на свои слова (оверлей над формой, строки не ждут)
  const s0 = Math.max(open1 + 4, w(0) + 2);
  const s1 = Math.max(s0 + 8, w(3) + 2);
  const stamps = [s0, s1, Math.max(s1 + 8, w(5) + 2)];
  const tagIn = Math.max(stamps[2] + 8, w(7) - 4);
  const ruler0 = Math.max(tagIn + 14, w(8));
  // линейка едет ruler0 → rulerEnd (easeOut); торец доходит до ценника
  // (TAG.stop) примерно на 7-м кадре — момент удара
  const rulerEnd = ruler0 + 23;
  const hit = ruler0 + 7;
  const pins = Math.max(hit + 8, w(9));
  const school = Math.max(pins + 6, w(11));
  const span = Math.max(school + 6, w(12));
  const price = Math.max(span + 6, w(13));
  return {
    open0,
    open1,
    rows,
    stamps,
    tagIn,
    ruler0,
    rulerEnd,
    hit,
    pins,
    school,
    span,
    price,
    frames: a.sc.frames,
  };
};

export const SFX_APPLY: SfxPlan = (a) => {
  const p = applyPlan(a);
  return [
    { at: p.open0, src: "audio/sfx-paper.mp3", volume: 0.3 },
    ...p.stamps.map((s, i) => ({
      at: s,
      src: "audio/sfx-tap.mp3",
      volume: 0.42 + 0.04 * i,
    })),
    { at: p.tagIn, src: "audio/sfx-whoosh.mp3", volume: 0.14 },
    { at: p.hit - 1, src: "audio/sfx-pop.mp3", volume: 0.3 },
    { at: p.price, src: "audio/sfx-chime.mp3", volume: 0.15 },
  ];
};

// Строка формы: подпись, значение (появляется «как написанное»), галочка.
const Row: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly t: number;
}> = ({ label, value, t }) => {
  const shown = Math.round(value.length * clamp(t * 1.25));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 92,
        borderTop: "2px solid #E4E8F0",
        padding: "0 26px",
        gap: 18,
      }}
    >
      <div
        style={{ width: 280, fontSize: 32, fontWeight: 800, color: C.muted }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 40,
          fontWeight: 900,
          color: C.navy,
          whiteSpace: "nowrap",
          borderBottom: `3px dotted ${C.muted}`,
          paddingBottom: 2,
        }}
      >
        {value.slice(0, shown)}
        {t > 0 && t < 0.8 ? (
          <span style={{ color: C.yellowDeep }}>|</span>
        ) : null}
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: t >= 0.8 ? C.green : "#E4E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {t >= 0.8 ? <Check size={32} draw={clamp((t - 0.8) * 5)} /> : null}
      </div>
    </div>
  );
};

// Штамп-оттиск в цепочке «Сыноо → Чечим → Топтом».
const StampMark: React.FC<{
  readonly text: string;
  readonly t: number;
  readonly tone: string;
  readonly rot: number;
}> = ({ text, t, tone, rot }) => {
  if (t <= 0) return <div style={{ width: 230 }} />;
  const s = lerp(1.6, 1, easeOut(clamp(t * 1.6)));
  return (
    <div style={{ width: 230, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "10px 22px 12px",
          borderRadius: 18,
          border: `5px solid ${tone}`,
          color: tone,
          backgroundColor: "rgba(255,255,255,0.92)",
          fontFamily,
          fontSize: 44,
          fontWeight: 1000,
          transform: `rotate(${rot}deg) scale(${s})`,
          opacity: clamp(t * 3),
          boxShadow: `0 0 0 ${8 * (1 - clamp(t * 2))}px ${tone}33`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Метка на линейке (булавка с подписью).
const Pin: React.FC<{
  readonly x: number;
  readonly label: string;
  readonly color: string;
  readonly t: number;
}> = ({ x, label, color, t }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: RULER.y - 92,
      transform: `translateX(-50%) translateY(${(1 - t) * -20}px)`,
      opacity: clamp(t * 2),
    }}
  >
    <div
      style={{
        padding: "6px 16px 8px",
        borderRadius: 14,
        backgroundColor: color,
        color: "#FFFFFF",
        fontFamily,
        fontSize: 32,
        fontWeight: 1000,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
    <svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      style={{ display: "block", margin: "0 auto" }}
    >
      <path d="M 15 30 L 4 6 L 26 6 Z" fill={color} />
    </svg>
  </div>
);

export const ApplyScene: React.FC = () => {
  const f = useCurrentFrame();
  const p = applyPlan(useSceneArgs("apply"));
  // раскрытие формы: верхняя половина откидывается вверх (к камере)
  const open = easeInOut((f - p.open0) / (p.open1 - p.open0));
  const ang = -179 * (1 - open);
  // раскрытая форма рисуется без 3D (при параллельном рендере preserve-3d
  // иногда даёт пустой кадр)
  const formFlat = Math.abs(ang) < 0.01;
  const edgeY =
    FORM.y + HALF - HALF * Math.cos((Math.abs(ang) * Math.PI) / 180); // верхний край половинки
  const rowT = (k: number) => clamp((f - p.rows[k]) / 12);
  // ценник въезжает справа; линейка одним движением едет слева, упирается
  // в него торцом, ценник перечёркнут, и линейка выталкивает его за кадр
  const tagSlide = easeOut((f - p.tagIn) / 14);
  const rulerX = lerp(
    -RULER.w - 80,
    RULER.x,
    easeOut((f - p.ruler0) / (p.rulerEnd - p.ruler0)),
  );
  const rulerRight = rulerX + RULER.w;
  const away = easeIn((f - p.hit - 10) / 16);
  const tagX =
    Math.max(lerp(1140, TAG.stop, tagSlide), rulerRight + 2) + away * 520;
  const tagRot = lerp(12, -3, tagSlide) + away * 18;
  const cross = clamp((f - p.hit) / 8);
  const pinsIn = easeOut((f - p.pins) / 10);
  const schoolIn = easeOut((f - p.school) / 10);
  // метка школы «ездит» по линейке: у каждой семьи своё расстояние
  const schoolX =
    RULER.x +
    RULER.w *
      lerp(
        0.86,
        0.62 + 0.24 * (0.5 + 0.5 * Math.cos((f - p.span) / 16)),
        clamp((f - p.span) / 10),
      );
  const homeX = RULER.x + 70;
  const spanIn = clamp((f - p.span) / 10);
  // рука слева ведёт линейку, потом уходит влево за край кадра
  const handVis =
    clamp((f - p.ruler0 + 8) / 6) * (1 - clamp((f - p.hit - 14) / 10));
  // руки раскрывают форму, затем уходят вниз за кадр (без растворения)
  const formHands = 1 - easeIn((f - p.open1 - 2) / 16);
  const handsDown = (1 - formHands) * 900;
  const cam = camKeys(f, [
    [0, { x: 540, y: 935, zoom: 1.03 }],
    [p.frames, { x: 540, y: 955, zoom: 1.0 }],
  ]);
  return (
    <>
      <World cam={cam}>
        <Desk />
        {/* карточка «Арыз»: нижняя половина лежит, верхняя откидывается */}
        <div
          style={{
            position: "absolute",
            left: FORM.x,
            top: FORM.y + HALF,
            width: FORM.w,
            height: HALF,
            perspective: formFlat ? undefined : 2200,
            perspectiveOrigin: "50% 0%",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: formFlat ? undefined : "preserve-3d",
            }}
          >
            {/* нижняя половина: строки 2–3 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#FFFFFF",
                borderRadius: "0 0 26px 26px",
                boxShadow: "0 12px 26px rgba(40,48,70,0.16)",
                fontFamily,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: HALF - 2 * 92 - 22,
                }}
              >
                <Row
                  label={A.fields[1].label}
                  value={A.fields[1].value}
                  t={rowT(1)}
                />
                <Row
                  label={A.fields[2].label}
                  value={A.fields[2].value}
                  t={rowT(2)}
                />
              </div>
            </div>
            {/* верхняя половина: заголовок «Арыз» и строка 1; обложка — «Арыз» */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: -HALF,
                width: FORM.w,
                height: HALF,
                transformOrigin: "50% 100%",
                transform: formFlat ? undefined : `rotateX(${ang}deg)`,
                transformStyle: formFlat ? undefined : "preserve-3d",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "#FFFFFF",
                  borderRadius: "26px 26px 0 0",
                  backfaceVisibility: "hidden",
                  fontFamily,
                  borderBottom: "2px dashed #D5DBE6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 26px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      fontSize: 52,
                      fontWeight: 1000,
                      color: C.navy,
                    }}
                  >
                    <svg width={44} height={50} viewBox="0 0 44 50">
                      <rect
                        x={3}
                        y={3}
                        width={38}
                        height={44}
                        rx={6}
                        fill={C.yellowSoft}
                        stroke={C.navy}
                        strokeWidth={3.5}
                      />
                      <path
                        d="M 11 16 L 33 16 M 11 25 L 33 25 M 11 34 L 25 34"
                        stroke={C.navy}
                        strokeWidth={3.5}
                        strokeLinecap="round"
                      />
                    </svg>
                    {A.form}
                    <ExampleTag
                      text={BG36_TEXT.example}
                      size={26}
                      style={{ marginLeft: 10 }}
                    />
                  </div>
                </div>
                <div
                  style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
                >
                  <Row
                    label={A.fields[0].label}
                    value={A.fields[0].value}
                    t={rowT(0)}
                  />
                </div>
              </div>
              {/* обложка сложенной карточки */}
              {formFlat ? null : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: C.yellow,
                    borderRadius: "26px 26px 0 0",
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily,
                    fontSize: 72,
                    fontWeight: 1000,
                    color: C.navy,
                  }}
                >
                  {A.form}
                </div>
              )}
              {Math.abs(ang) > 2 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: `rgba(40,48,70,${Math.abs(Math.sin((ang * Math.PI) / 180)) * 0.25})`,
                    borderRadius: "26px 26px 0 0",
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
        {formHands > 0 ? (
          <>
            <TopHand
              x={FORM.x + 36}
              y={FORM.y + FORM.h - 6 + handsDown}
              pose="pinch"
              angle={18}
              side="left"
              lift={0.1}
            />
            <TopHand
              x={FORM.x + FORM.w - 90}
              y={edgeY + 8 + handsDown}
              pose={mixPose("pinch", "rest", clamp((f - p.open1) / 8))}
              angle={-10}
              lift={Math.sin(Math.PI * open) * 0.8}
            />
          </>
        ) : null}
        {/* ложный единый ценник — без сумм */}
        {f >= p.tagIn && away < 1 ? (
          <div
            style={{
              position: "absolute",
              left: tagX,
              top: TAG.y,
              width: TAG.w,
              height: TAG.h,
              transform: `rotate(${tagRot}deg)`,
              transformOrigin: "0 50%",
              opacity: 1 - away,
            }}
          >
            <svg
              width={TAG.w}
              height={TAG.h}
              viewBox={`0 0 ${TAG.w} ${TAG.h}`}
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              <path
                d={`M 40 0 L ${TAG.w} 0 L ${TAG.w} ${TAG.h} L 40 ${TAG.h} L 0 ${TAG.h / 2} Z`}
                fill="#FFF8E1"
                stroke="#B9A57A"
                strokeWidth={4}
              />
              <circle
                cx={36}
                cy={TAG.h / 2}
                r={11}
                fill={C.desk}
                stroke="#B9A57A"
                strokeWidth={3}
              />
              <path
                d={`M 26 ${TAG.h / 2} Q -30 ${TAG.h / 2 - 40} -60 ${TAG.h / 2 + 10}`}
                fill="none"
                stroke="#9A8A6A"
                strokeWidth={3}
              />
              {cross > 0 ? (
                <g transform={`translate(${TAG.w - 24} 16) scale(${cross})`}>
                  <circle r={24} fill={C.red} />
                  <path
                    d="M -9 -9 L 9 9 M 9 -9 L -9 9"
                    stroke="#FFFFFF"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                </g>
              ) : null}
            </svg>
            <div
              style={{
                position: "absolute",
                left: 50,
                right: 14,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontFamily,
                fontSize: 36,
                fontWeight: 1000,
                color: "#5A4A2A",
                lineHeight: 1.1,
                opacity: 1 - 0.45 * cross,
              }}
            >
              {A.fakeTag}
            </div>
          </div>
        ) : null}
        {/* жёлтая бумажная линейка расстояния */}
        {f >= p.ruler0 ? (
          <div
            style={{
              position: "absolute",
              left: rulerX,
              top: RULER.y,
              width: RULER.w,
              height: RULER.h,
              backgroundColor: C.yellow,
              borderRadius: 10,
              boxShadow: "0 10px 22px rgba(40,48,70,0.18)",
              border: `3px solid ${C.yellowDeep}`,
            }}
          >
            <svg
              width={RULER.w}
              height={RULER.h}
              style={{ position: "absolute", inset: 0 }}
            >
              {Array.from({ length: 41 }).map((_, i) => (
                <rect
                  key={i}
                  x={i * (RULER.w / 40) - 1.5}
                  y={0}
                  width={i % 5 === 0 ? 4 : 2.5}
                  height={i % 5 === 0 ? 30 : 16}
                  fill={C.navy}
                  opacity={0.75}
                />
              ))}
            </svg>
            <div
              style={{
                position: "absolute",
                right: 16,
                bottom: 6,
                fontFamily,
                fontSize: 28,
                fontWeight: 1000,
                color: C.navy,
              }}
            >
              {A.km}
            </div>
          </div>
        ) : null}
        {/* ҮЙ и МЕКТЕП на линейке; стрелка «Аралык» между ними */}
        {pinsIn > 0 ? (
          <>
            <Pin
              x={homeX + (rulerX - RULER.x)}
              label={BG36_TEXT.home}
              color={C.navy}
              t={pinsIn}
            />
            {schoolIn > 0 ? (
              <Pin
                x={schoolX + (rulerX - RULER.x)}
                label={BG36_TEXT.school}
                color={C.navy}
                t={schoolIn}
              />
            ) : null}
            {spanIn > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: homeX,
                  top: RULER.y + RULER.h + 8,
                  width: Math.max(0, schoolX - homeX),
                  opacity: spanIn,
                }}
              >
                <svg
                  width="100%"
                  height={26}
                  style={{ display: "block", overflow: "visible" }}
                >
                  <line
                    x1={0}
                    y1={13}
                    x2="100%"
                    y2={13}
                    stroke={C.navy}
                    strokeWidth={3.5}
                  />
                  <line
                    x1={1.5}
                    y1={2}
                    x2={1.5}
                    y2={24}
                    stroke={C.navy}
                    strokeWidth={3.5}
                  />
                  <line
                    x1="100%"
                    y1={2}
                    x2="100%"
                    y2={24}
                    stroke={C.navy}
                    strokeWidth={3.5}
                    transform="translate(-1.5 0)"
                  />
                </svg>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                    fontFamily,
                    fontSize: 32,
                    fontWeight: 900,
                    color: C.navy,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>
                    <ArrowGlyph both /> {A.ruler}
                  </span>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
        {handVis > 0.01 ? (
          <TopHand
            x={rulerX + 40 - (1 - handVis) * 420}
            y={RULER.y + RULER.h / 2}
            pose="pinch"
            angle={96}
            side="left"
            lift={0.3}
          />
        ) : null}
      </World>
      {/* штампы «Сыноо → Чечим → Топтом» вверху, затем вывод про цену */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 286,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - clamp((f - p.price + 4) / 10),
        }}
      >
        <StampMark
          text={A.chain[0]}
          t={clamp((f - p.stamps[0]) / 12)}
          tone={C.green}
          rot={-4}
        />
        <div
          style={{
            fontSize: 56,
            color: C.navy,
            opacity: clamp((f - p.stamps[1] + 4) / 8),
          }}
        >
          <ArrowGlyph />
        </div>
        <StampMark
          text={A.chain[1]}
          t={clamp((f - p.stamps[1]) / 12)}
          tone={C.navy}
          rot={3}
        />
        <div
          style={{
            fontSize: 56,
            color: C.navy,
            opacity: clamp((f - p.stamps[2] + 4) / 8),
          }}
        >
          <ArrowGlyph />
        </div>
        <StampMark
          text={A.chain[2]}
          t={clamp((f - p.stamps[2]) / 12)}
          tone={C.yellowDeep}
          rot={-3}
        />
      </div>
      <Headline f={f} at={p.price} top={290} size={62}>
        {A.price}
      </Headline>
    </>
  );
};
