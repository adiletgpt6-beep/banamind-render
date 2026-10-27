// Сцена 4 (≈32–46 с): курсор раскладывается в складку заявки из трёх
// полей — Үй • Мектеп • Убакыт; мама заполняет их. Складка сворачивается
// в телефон: сайт открывает готовое сообщение в WhatsApp, и мама САМА
// нажимает «отправить» (никакой «подтверждённой сервером заявки»). Затем
// линия становится лупой: ищется группа детей с подходящими адресами и
// временем — «Анын табылышы кепилденбейт». Линия не прыгает в едущую машину.
import { useMemo } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeBack, easeInOut, easeOut } from "../anim";
import { useAbsFrame, useTimeline } from "../context";
import { FOLD, HOMES, PHONE, SCHOOL_PIN, formTimes } from "../layout";
import { buildLineTrack, lineState } from "../line/track";
import { C, STROKE } from "../palette";
import { PhoneFingers, PhoneHand } from "../parts/hands";
import {
  CheckIcon,
  Chip,
  ClockIcon,
  HouseIcon,
  KineticTitle,
  Paper,
  SchoolIcon,
} from "../parts/ui";
import { BG49_TEXT, BG49_VIDEO } from "../script";

const ICONS = [HouseIcon, SchoolIcon, ClockIcon];

export const FormScene: React.FC = () => {
  const f = useCurrentFrame();
  const abs = useAbsFrame();
  const tl = useTimeline();
  const t = BG49_TEXT.form;
  const ft = formTimes(tl);
  const keys = useMemo(() => buildLineTrack(tl), [tl]);
  const line = lineState(keys, abs);
  // 1) складка заявки
  // панели гаснут быстро, пока линия ещё не легла поверх их текста
  const foldOut = easeInOut((f - ft.foldOut) / 7);
  const panelsK = 1 - foldOut;
  // 2) телефон
  const phoneK =
    appear(f, ft.phoneIn - 8, 14) * (1 - easeInOut((f - ft.searchIn) / 16));
  const sent = easeOut((f - ft.tap - 2) / 12);
  const press = f >= ft.tap - 3 && f <= ft.tap + 4 ? 1 : 0;
  // 3) подбор группы
  const mapK = appear(f, ft.searchIn + 6, 16);
  const magC = line ? magCenter(line.pts) : [540, 700];
  const hasMag = f > ft.searchIn + 22;
  return (
    <>
      <Paper />
      <div style={{ opacity: 1 - appear(f, ft.phoneIn - 10, 10) }}>
        <KineticTitle
          text={t.title}
          y={262}
          f={f}
          at={8}
          size={62}
          spacing={1}
        />
      </div>
      <Chip x={540} y={262} f={f} at={ft.searchIn + 6} tone="navy" size={46}>
        {t.search}
      </Chip>
      {/* складка: три панели внутри жёлтой рамки */}
      {panelsK > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            opacity: panelsK,
            transform: `translateY(${foldOut * 240}px) scale(${1 - foldOut * 0.45})`,
            transformOrigin: "540px 760px",
          }}
        >
          {t.fields.map((fl, i) => {
            const y0 = FOLD.ys[i];
            const h = FOLD.ys[i + 1] - y0;
            const open = easeOut((f - 12 - i * 4) / 14);
            const fillAt = ft.fill0 + ft.fillStep * i;
            const typed = clamp((f - fillAt) / Math.max(8, ft.fillStep - 4));
            const Icon = ICONS[i];
            return (
              <div
                key={fl.k}
                style={{
                  position: "absolute",
                  left: FOLD.x + 10,
                  top: y0 + 10,
                  width: FOLD.w - 20,
                  height: h - 20,
                  borderRadius: 18,
                  backgroundColor: i % 2 ? "#FBFCFF" : "#FFFFFF",
                  boxShadow: `inset 0 ${i % 2 ? -10 : 10}px 18px rgba(20,40,90,0.05)`,
                  transform: `scaleY(${open})`,
                  transformOrigin: i % 2 ? "50% 0%" : "50% 100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  paddingLeft: 34,
                  boxSizing: "border-box",
                  fontFamily,
                  color: C.navy,
                }}
              >
                <Icon size={84} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1 }}
                  >
                    {fl.k}
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: C.ink,
                      minHeight: 42,
                    }}
                  >
                    {fl.v.slice(0, Math.round(typed * fl.v.length))}
                    <span
                      style={{
                        opacity:
                          typed > 0 && typed < 1 && Math.floor(f / 6) % 2 === 0
                            ? 1
                            : 0,
                      }}
                    >
                      |
                    </span>
                  </div>
                </div>
                <div style={{ width: 70, marginRight: 30 }}>
                  {typed >= 1 ? (
                    <CheckIcon
                      size={58}
                      k={clamp((f - fillAt - ft.fillStep + 4) / 10)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {/* телефон: WhatsApp с готовым сообщением */}
      {phoneK > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            opacity: phoneK,
            transform: `scale(${0.92 + 0.08 * phoneK})`,
            transformOrigin: "540px 740px",
          }}
        >
          <svg
            width={1080}
            height={1920}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: appear(f, ft.phoneIn, 14),
            }}
          >
            <PhoneFingers left={PHONE.x} bottom={PHONE.y + PHONE.h} />
          </svg>
          <div
            style={{
              position: "absolute",
              left: PHONE.x + 8,
              top: PHONE.y + 8,
              width: PHONE.w - 16,
              height: PHONE.h - 16,
              borderRadius: PHONE.r - 6,
              backgroundColor: C.waBg,
              overflow: "hidden",
              fontFamily,
              boxShadow: "0 30px 60px rgba(20,40,90,0.18)",
            }}
          >
            <div
              style={{
                height: 112,
                backgroundColor: "#0B7A5E",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "26px 22px 0",
                boxSizing: "border-box",
              }}
            >
              <Img
                src={staticFile(BG49_VIDEO.logo)}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  objectFit: "cover",
                  border: "3px solid #FFFFFF",
                }}
              />
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: 30,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {t.chat}
              </div>
            </div>
            {/* отправленное сообщение */}
            <div
              style={{
                position: "absolute",
                right: 18,
                top: 150 + (1 - sent) * 560,
                width: 330,
                padding: "16px 18px 12px",
                borderRadius: "22px 22px 6px 22px",
                backgroundColor: C.waBubble,
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                opacity: sent,
                fontSize: 25,
                fontWeight: 700,
                color: "#1F2B3E",
                lineHeight: 1.3,
              }}
            >
              <div style={{ fontWeight: 900 }}>{t.message}</div>
              {t.fields.map((fl) => (
                <div key={fl.k}>
                  <b>{fl.k}:</b> {fl.v}
                </div>
              ))}
              <div
                style={{
                  textAlign: "right",
                  fontSize: 20,
                  color: "#6B7A8F",
                  marginTop: 4,
                }}
              >
                08:15 ✓
              </div>
            </div>
            {/* строка ввода с готовым текстом */}
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: 22,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 20px",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#3B4A63",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {sent < 0.5 ? t.message : ""}
              </div>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: C.waGreen,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${1 - press * 0.12})`,
                }}
              >
                <svg width={34} height={34} viewBox="0 0 34 34">
                  <path d="M 5 17 L 29 6 L 22 29 L 17 19 Z" fill="#FFFFFF" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Chip
        x={90}
        y={1196}
        f={f}
        at={ft.phoneIn + 4}
        out={ft.searchIn}
        tone="green"
        size={31}
        align="left"
      >
        <svg width={34} height={34} viewBox="0 0 34 34">
          <path d="M 5 17 L 29 6 L 22 29 L 17 19 Z" fill={C.waGreen} />
        </svg>
        {t.hint}
      </Chip>
      {/* подбор группы: дома с подходящими адресом и временем */}
      {mapK > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            opacity: mapK,
          }}
        >
          <svg
            width={1080}
            height={1920}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <rect
              x={110}
              y={360}
              width={860}
              height={660}
              rx={40}
              fill="#F3F8FD"
              stroke={C.rule}
              strokeWidth={4}
            />
            <path
              d="M 110 600 C 400 560 700 640 970 600 M 330 360 C 360 600 300 800 340 1020 M 110 860 C 420 820 700 900 970 840 M 760 360 C 720 560 800 800 760 1020"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={26}
            />
            <path
              d="M 110 600 C 400 560 700 640 970 600 M 330 360 C 360 600 300 800 340 1020 M 110 860 C 420 820 700 900 970 840 M 760 360 C 720 560 800 800 760 1020"
              fill="none"
              stroke={C.rule}
              strokeWidth={3}
              strokeDasharray="14 14"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: SCHOOL_PIN[0] - 48,
              top: SCHOOL_PIN[1] - 48,
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: "#FFFFFF",
              border: `${STROKE}px solid ${C.navy}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SchoolIcon size={70} />
          </div>
          {HOMES.map((h, i) => {
            const near =
              hasMag && Math.hypot(h.x - magC[0], h.y - magC[1]) < 150;
            const lit =
              h.fit &&
              hasMag &&
              f > ft.searchIn + 26 &&
              (near || litBefore(h, keys, abs, ft.searchIn + 22 + (abs - f)));
            const k = appear(f, ft.searchIn + 8 + i * 2, 10);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: h.x - 40,
                  top: h.y - 40,
                  width: 80,
                  height: 80,
                  borderRadius: 26,
                  backgroundColor: lit ? C.yellow : "#FFFFFF",
                  border: `${STROKE}px solid ${lit ? C.navy : C.soft}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: k * (h.fit ? 1 : 0.75),
                  transform: `scale(${(0.7 + 0.3 * k) * (lit ? 1.08 : 1)})`,
                  boxShadow: lit ? `0 0 0 8px rgba(255,201,14,0.25)` : "none",
                }}
              >
                <HouseIcon size={56} fill={lit ? "#FFFFFF" : "#F1F4F9"} />
              </div>
            );
          })}
          {/* места в будущей группе: пока вопрос */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1046,
              display: "flex",
              justifyContent: "center",
              gap: 22,
            }}
          >
            {[0, 1, 2, 3].map((i) => {
              const pulse = 0.5 + 0.5 * Math.sin((f - i * 6) / 7);
              return (
                <div
                  key={i}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    border: `4px dashed ${C.soft}`,
                    backgroundColor: `rgba(255,244,194,${0.25 + 0.35 * pulse})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily,
                    fontSize: 46,
                    fontWeight: 900,
                    color: C.muted,
                    opacity: appear(f, ft.searchIn + 20 + i * 3, 10),
                  }}
                >
                  ?
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <Chip x={540} y={1168} f={f} at={ft.searchIn + 34} tone="white" size={34}>
        {t.window}
      </Chip>
      <Chip x={540} y={1250} f={f} at={ft.noGuarantee} tone="coral" size={36}>
        <span
          style={{
            display: "inline-block",
            transform: `scale(${0.9 + 0.1 * easeBack(clamp((f - ft.noGuarantee) / 12))})`,
          }}
        >
          {t.noGuarantee}
        </span>
      </Chip>
    </>
  );
};

// Центр лупы: середина двух противоположных точек окружности (ручка
// занимает первые ≈ 19 % линии).
const magCenter = (pts: readonly (readonly [number, number])[]) => [
  (pts[110][0] + pts[256][0]) / 2,
  (pts[110][1] + pts[256][1]) / 2,
];

// Дом остаётся подсвеченным, если лупа уже проходила рядом (детерминированно:
// проверяем положения лупы на прошлых кадрах с шагом 3).
const litBefore = (
  h: { readonly x: number; readonly y: number },
  keys: ReturnType<typeof buildLineTrack>,
  abs: number,
  start: number,
) => {
  for (let fr = start; fr < abs; fr += 3) {
    const st = lineState(keys, fr);
    if (!st) continue;
    const c = magCenter(st.pts);
    if (Math.hypot(h.x - c[0], h.y - c[1]) < 150) return true;
  }
  return false;
};

// Передний план (над жёлтой линией-корпусом): рука мамы держит телефон и
// сама нажимает «отправить».
export const FormFront: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const ft = formTimes(tl);
  const phoneK =
    appear(f, ft.phoneIn - 8, 14) * (1 - easeInOut((f - ft.searchIn) / 16));
  if (phoneK < 0.01) return null;
  const thumbIn = appear(f, ft.phoneIn, 14);
  const press = f >= ft.tap - 3 && f <= ft.tap + 4 ? 1 : 0;
  const send = { x: PHONE.x + PHONE.w - 58, y: PHONE.y + PHONE.h - 66 };
  // палец подходит к кнопке снизу и нажимает её
  const reach = easeInOut((f - (ft.tap - 16)) / 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        opacity: phoneK,
        transform: `scale(${0.92 + 0.08 * phoneK})`,
        transformOrigin: "540px 740px",
      }}
    >
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: thumbIn,
          transform: `translate(${(1 - thumbIn) * 160}px, ${(1 - thumbIn) * 200}px)`,
        }}
      >
        <PhoneHand
          right={PHONE.x + PHONE.w}
          bottom={PHONE.y + PHONE.h}
          tx={send.x - 6 + (1 - reach) * 10}
          ty={send.y + 2 + (1 - reach) * 46}
          press={press}
        />
      </svg>
    </div>
  );
};
