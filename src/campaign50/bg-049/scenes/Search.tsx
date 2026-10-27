// Сцена 3 (≈19–32 с): обводка сжимается в петлю-курсор. Мама сама ищет
// ответ: набирает запрос, ведёт мышь — курсор (жёлтая линия) подводит к
// найденной странице BalaGo. Она читает условия: алдын ала уюштурулган
// мектеп каттамы, полная поездка ҮЙ → МЕКТЕП → ҮЙ, группа 3–4 ребёнка,
// проба только после формирования группы. Никакого рекламного блока
// посреди проблемы — только то, что мама нашла сама.
import { useMemo } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, blink, breathe, clamp, easeOut, lerp } from "../anim";
import { useAbsFrame, useTimeline } from "../context";
import { BROWSER, FIELD, RESULT, searchTimes } from "../layout";
import { buildLineTrack, lineState } from "../line/track";
import { C, STROKE } from "../palette";
import { MouseHand } from "../parts/hands";
import { Mom } from "../parts/Mom";
import {
  Chip,
  ClockIcon,
  HouseIcon,
  Paper,
  SchoolIcon,
  SearchGlyph,
  WhatsAppIcon,
} from "../parts/ui";
import { BG49_TEXT, BG49_VIDEO } from "../script";

const GrayResult: React.FC<{
  readonly y: number;
  readonly title: string;
  readonly k: number;
}> = ({ y, title, k }) => (
  <div
    style={{
      position: "absolute",
      left: RESULT.x - BROWSER.x + 10,
      top: y,
      width: RESULT.w - 20,
      opacity: k,
      transform: `translateY(${(1 - k) * 16}px)`,
      fontFamily,
    }}
  >
    <div style={{ fontSize: 32, fontWeight: 800, color: "#5A6B93" }}>
      {title}
    </div>
    <div
      style={{
        marginTop: 10,
        width: "86%",
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E4E9F2",
      }}
    />
    <div
      style={{
        marginTop: 8,
        width: "62%",
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E4E9F2",
      }}
    />
  </div>
);

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const abs = useAbsFrame();
  const tl = useTimeline();
  const t = BG49_TEXT.search;
  const st = searchTimes(tl);
  const keys = useMemo(() => buildLineTrack(tl), [tl]);
  const cur = lineState(keys, abs);
  const tip = cur ? cur.pts[0] : ([520, 1110] as const);
  // рука на мыши повторяет движение курсора (в уменьшенном масштабе)
  const hand = {
    x: 700 + (tip[0] - 520) * 0.16,
    y: 1236 + (tip[1] - 1110) * 0.12,
  };
  const typed = clamp(
    (f - st.typeFrom) / Math.max(1, st.typeTo - st.typeFrom - 6),
  );
  const q = t.query.slice(0, Math.round(typed * t.query.length));
  const resK = (i: number) => appear(f, st.typeTo + 2 + i * 4, 10);
  const open = easeOut((f - st.open) / 14);
  const hover = appear(f, st.click - 14, 6);
  const ring = clamp((f - st.click) / 16);
  const ring2 = clamp((f - st.press) / 16);
  const scroll = easeOut((f - st.scroll) / 18);
  const pressed = f >= st.press && f < st.press + 6;
  const btnGlow = appear(f, st.press - 18, 8);
  const titleK = appear(f, st.title, 12);
  const mark = clamp((f - st.title - 4) / 40);
  const reading = f > st.title;
  const pageIn = (i: number, at: number) => ({
    opacity: appear(f, at + i * 5, 10),
    transform: `translateX(${(1 - appear(f, at + i * 5, 12)) * 40}px)`,
  });
  return (
    <>
      <Paper />
      <Chip x={540} y={262} f={f} at={12} tone="navy" size={42}>
        {t.caption}
      </Chip>
      {/* окно браузера */}
      <div
        style={{
          position: "absolute",
          left: BROWSER.x,
          top: BROWSER.y,
          width: BROWSER.w,
          height: BROWSER.h,
          borderRadius: 34,
          backgroundColor: "#FFFFFF",
          border: `${STROKE}px solid ${C.navy}`,
          boxShadow: "0 24px 50px rgba(20,40,90,0.14)",
          overflow: "hidden",
          opacity: appear(f, 0, 12),
          transform: `translateY(${(1 - appear(f, 0, 16)) * 40}px)`,
        }}
      >
        <div
          style={{
            height: 76,
            backgroundColor: C.sky,
            display: "flex",
            alignItems: "center",
            gap: 14,
            paddingLeft: 30,
            borderBottom: `3px solid ${C.rule}`,
          }}
        >
          {["#F28B82", C.yellow, "#8BD3A8"].map((c) => (
            <div
              key={c}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: c,
                border: `2.5px solid ${C.navy}`,
              }}
            />
          ))}
        </div>
        {/* поисковая строка */}
        <div
          style={{
            position: "absolute",
            left: FIELD.x - BROWSER.x,
            top: FIELD.y - BROWSER.y,
            width: FIELD.w - 80,
            height: FIELD.h,
            borderRadius: FIELD.h / 2,
            border: `3.5px solid ${f >= st.typeFrom - 6 && open < 1 ? C.yellowDeep : C.rule}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingLeft: 26,
            boxSizing: "border-box",
            fontFamily,
            fontSize: 38,
            fontWeight: 800,
            color: C.navy,
            opacity: 1 - open,
          }}
        >
          <SearchGlyph size={38} />
          <span>
            {q}
            <span
              style={{
                opacity:
                  f >= st.typeFrom - 6 &&
                  f < st.click &&
                  Math.floor(f / 8) % 2 === 0
                    ? 1
                    : 0,
                color: C.navy,
              }}
            >
              |
            </span>
          </span>
        </div>
        {/* результаты поиска */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - open,
            transform: `translateX(${-open * 60}px)`,
          }}
        >
          <GrayResult y={560 - BROWSER.y} title={t.results[0]} k={resK(0)} />
          <div
            style={{
              position: "absolute",
              left: RESULT.x - BROWSER.x - 14,
              top: RESULT.y - BROWSER.y,
              width: RESULT.w - 32,
              height: RESULT.h,
              borderRadius: 24,
              backgroundColor:
                hover > 0 ? `rgba(255,244,194,${0.9 * hover})` : "transparent",
              border: `3px solid rgba(242,181,0,${hover})`,
              display: "flex",
              alignItems: "center",
              gap: 22,
              paddingLeft: 20,
              boxSizing: "border-box",
              opacity: resK(1),
              transform: `translateY(${(1 - resK(1)) * 16}px)`,
              fontFamily,
            }}
          >
            <Img
              src={staticFile(BG49_VIDEO.logo)}
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                objectFit: "cover",
                border: `3px solid ${C.navy}`,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: C.navy,
                  lineHeight: 1.15,
                }}
              >
                {t.brand}
              </div>
              <div
                style={{
                  fontSize: 29,
                  fontWeight: 700,
                  color: C.muted,
                  marginTop: 4,
                }}
              >
                {t.snippet}
              </div>
            </div>
          </div>
          <GrayResult y={850 - BROWSER.y} title={t.results[1]} k={resK(2)} />
        </div>
        {/* открытая страница BalaGo (прокручивается под верхней панелью) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 80,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 8 - scroll * 112,
              opacity: open,
              transform: `translateX(${(1 - open) * 80}px)`,
              fontFamily,
              color: C.navy,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Img
                src={staticFile(BG49_VIDEO.logo)}
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  objectFit: "cover",
                  border: `3px solid ${C.navy}`,
                }}
              />
              <div>
                <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
                  BalaGo
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.muted }}>
                  {t.tagline}
                </div>
              </div>
            </div>
            <div
              style={{
                position: "relative",
                marginTop: 20,
                opacity: titleK,
                transform: `translateY(${(1 - titleK) * 14}px)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -8,
                  top: 10,
                  height: 104,
                  width: `${mark * 100}%`,
                  backgroundColor: C.yellowSoft,
                  borderRadius: 14,
                }}
              />
              <div
                style={{
                  position: "relative",
                  fontSize: 48,
                  fontWeight: 900,
                  lineHeight: 1.12,
                }}
              >
                {t.page.title}
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {t.page.rows.map((r, i) => (
                <div
                  key={r.k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "9px 18px",
                    borderRadius: 22,
                    backgroundColor: "#F6F8FC",
                    border: `3px solid ${C.rule}`,
                    ...pageIn(i, st.rows),
                  }}
                >
                  {i === 0 ? (
                    <HouseIcon size={60} />
                  ) : i === 1 ? (
                    <SchoolIcon size={60} />
                  ) : (
                    <ClockIcon size={60} />
                  )}
                  <div>
                    <div
                      style={{ fontSize: 27, fontWeight: 800, color: C.muted }}
                    >
                      {r.k}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900 }}>{r.v}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* кнопка на сайте: открывает готовое сообщение в WhatsApp */}
            <div
              style={{
                marginTop: 22,
                height: 86,
                borderRadius: 43,
                backgroundColor: pressed ? C.yellowDeep : C.yellow,
                border: `${STROKE}px solid ${C.navy}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                fontSize: 40,
                fontWeight: 900,
                transform: `scale(${pressed ? 0.97 : 1})`,
                boxShadow: `0 0 0 ${10 * btnGlow}px rgba(255,201,14,${0.35 * btnGlow})`,
              }}
            >
              <WhatsAppIcon size={50} />
              {t.button}
            </div>
          </div>
        </div>
      </div>
      {/* щелчок по найденной странице */}
      {ring2 > 0 && ring2 < 1 ? (
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <circle
            cx={tip[0]}
            cy={tip[1]}
            r={14 + ring2 * 54}
            fill="none"
            stroke={C.yellow}
            strokeWidth={8 * (1 - ring2)}
            opacity={1 - ring2}
          />
        </svg>
      ) : null}
      {ring > 0 && ring < 1 ? (
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <circle
            cx={tip[0]}
            cy={tip[1]}
            r={14 + ring * 54}
            fill="none"
            stroke={C.yellow}
            strokeWidth={8 * (1 - ring)}
            opacity={1 - ring}
          />
        </svg>
      ) : null}
      <Mom
        uid="search"
        x={300}
        y={1252}
        s={0.74}
        tilt={-4 + breathe(f, 120, 0.8)}
        look={[
          reading
            ? 0.35 + 0.45 * Math.sin(f / 11)
            : lerp(0.2, 0.6, clamp(f / 40)),
          -0.85,
        ]}
        brow={0.45}
        smile={0.12 + 0.5 * appear(f, st.rows + 10, 18)}
        eyes={blink(f, 70)}
        lean={breathe(f, 140, 2)}
      />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <MouseHand
          x={hand.x}
          y={hand.y}
          s={0.85}
          click={
            (f >= st.click && f < st.click + 5) ||
            (f >= st.press && f < st.press + 5)
              ? 1
              : 0
          }
        />
      </svg>
    </>
  );
};
