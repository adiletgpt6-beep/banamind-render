// Чек «1000 сом» — главный предмет ролика. Лицевая сторона: верх
// (BalaGo, «Бир толук сапар», «1000 сом / бала») и нижняя половина,
// которая сначала сложена по линии сгиба (линейка 0–7 км «мектеп → үй»,
// «7 кмге чейин»). Оборот: продолжение линейки до 20 км (дальше бумага
// оборвана — максималдуу аралык).
// Размеры даны в единицах листа (W × H), лист масштабируется целиком.
import type React from "react";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut } from "../../two-schedules-2d/rig/motion";
import { box } from "../../two-schedules-2d/shots";
import { C } from "./palette";
import { BG31_TEXT } from "./script";
import { Dashed, HomeIcon, Marker, Paper, SchoolIcon } from "./ui";

export const R = {
  w: 740,
  crease: 520, // линия сгиба (верхняя половина 0…crease)
  h: 1060,
  // линейка лицевой стороны: 0 км (мектеп) … 7 км (үй)
  rulerX: 80,
  y0: 640,
  y7: 990,
} as const;

const T = BG31_TEXT;

// Верхняя половина чека (цена). Звёздочка у цены — сразу видно, что цена
// с условием; note (0…1) — сноска «* 7 кмге чейин, бир жакка».
export const ReceiptTop: React.FC<{ readonly glow?: number; readonly pulse?: number; readonly note?: number }> = ({ glow = 0, pulse = 0, note = 0 }) => (
  <div style={box({ left: 0, top: 0, width: R.w, height: R.crease, fontFamily, color: C.navy, textAlign: "center" })}>
    <div style={box({ left: 0, right: 0, top: 46, fontSize: 50, fontWeight: 1000, letterSpacing: 1 })}>{T.receipt.brand}</div>
    <div style={box({ left: 0, right: 0, top: 112, fontSize: 38, fontWeight: 800, color: C.muted })}>{T.receipt.kind}</div>
    <Dashed x={60} y={176} w={R.w - 120} />
    <div style={box({ left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" })}>
      <div
        style={{
          position: "relative",
          padding: "0 30px",
          borderRadius: 28,
          boxShadow: glow > 0 ? `0 0 0 ${10 * glow}px rgba(255,201,14,${0.85 * glow})` : undefined,
          transform: `scale(${1 + 0.05 * pulse})`,
        }}
      >
        <div style={{ fontSize: 134, fontWeight: 1000, lineHeight: 1.05, letterSpacing: -2, whiteSpace: "nowrap" }}>
          {T.receipt.price}
          <span style={{ color: C.yellowDeep, fontSize: 110, verticalAlign: "0.18em" }}>{T.receipt.star}</span>
        </div>
      </div>
    </div>
    <div style={box({ left: 0, right: 0, top: 356, fontSize: 58, fontWeight: 900, color: C.ink })}>{T.receipt.unit}</div>
    <div style={box({ left: 0, right: 0, top: 440, fontSize: 36, fontWeight: 900, color: C.ink, opacity: note, translate: `0 ${(1 - note) * 12}px` })}>
      <span style={{ padding: "4px 16px", borderRadius: 12, backgroundColor: C.yellowSoft }}>{T.receipt.note}</span>
    </div>
    {/* линия сгиба */}
    <div style={box({ left: 18, right: 18, top: R.crease - 2, height: 4, background: "linear-gradient(90deg, rgba(150,130,100,0.0), rgba(150,130,100,0.28) 12%, rgba(150,130,100,0.28) 88%, rgba(150,130,100,0.0))" })} />
  </div>
);

// Деление линейки (км) → y на листе.
export const kmY = (km: number) => R.y0 + ((R.y7 - R.y0) * km) / 7;

// Нижняя половина чека (лицевая): линейка 0–7 км и подписи.
// Параметры появления (0…1): ruler — линейка, arrow — стрелка «в одну
// сторону», count — счёт делений до 7, marker — маркер «7 кмге чейин»,
// bracket — скобка 0–7 км.
export const ReceiptBottom: React.FC<{
  readonly ruler?: number;
  readonly arrow?: number;
  readonly count?: number;
  readonly marker?: number;
  readonly bracket?: number;
  readonly hideText?: number; // для окна-сцены: текст уходит в сторону
}> = ({ ruler = 1, arrow = 1, count = 1, marker = 1, bracket = 1, hideText = 0 }) => {
  const shownKm = 7 * count;
  const len = R.y7 - R.y0;
  return (
    <div style={box({ left: 0, top: 0, width: R.w, height: R.h, fontFamily, color: C.navy })}>
      {/* линейка */}
      <svg width={R.w} height={R.h} style={box({ left: 0, top: 0, overflow: "visible", opacity: ruler })}>
        <rect x={R.rulerX - 22} y={R.y0 - 26} width={44} height={len + 52} rx={14} fill="#F4EEDF" stroke={C.paperEdge} strokeWidth={2} />
        {/* зона 0–7 км (скобка) */}
        <rect x={R.rulerX - 22} y={R.y0} width={44} height={len * bracket} rx={10} fill={C.yellow} opacity={0.9} />
        {Array.from({ length: 8 }).map((_, k) => {
          const y = kmY(k);
          const on = shownKm >= k - 0.001;
          return (
            <g key={k} opacity={on ? 1 : 0.25}>
              <line x1={R.rulerX - 22} x2={R.rulerX + (k === 0 || k === 7 ? 30 : 10)} y1={y} y2={y} stroke={C.navy} strokeWidth={k === 7 ? 7 : 4} strokeLinecap="round" />
              {k % 7 === 0 ? (
                <text x={R.rulerX + 42} y={y + 14} fontSize={40} fontWeight={1000} fill={C.navy} fontFamily={fontFamily}>
                  {k}
                </text>
              ) : null}
            </g>
          );
        })}
        {/* стрелка «в одну сторону»: от мектеп к үй */}
        <path
          d={`M ${R.rulerX - 46} ${R.y0 + 6} L ${R.rulerX - 46} ${R.y0 + 6 + (len - 18) * arrow}`}
          stroke={C.navy}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
        {arrow > 0.92 ? <path d={`M ${R.rulerX - 62} ${R.y7 - 28} L ${R.rulerX - 46} ${R.y7 - 8} L ${R.rulerX - 30} ${R.y7 - 28}`} stroke={C.navy} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      </svg>
      {/* концы линейки: мектеп (0) и үй (7 км) */}
      <div style={box({ left: R.rulerX - 30, top: R.y0 - 84, display: "flex", alignItems: "center", gap: 10, opacity: ruler, fontSize: 32, fontWeight: 1000 })}>
        <SchoolIcon size={46} />
        {T.unfold.school}
      </div>
      <div style={box({ left: R.rulerX + 76, top: R.y7 - 26, display: "flex", alignItems: "center", gap: 10, opacity: clamp(count * 1.4 - 0.4), fontSize: 32, fontWeight: 1000 })}>
        <HomeIcon size={46} />
        {T.unfold.home}
      </div>
      {/* правая колонка: «Мектептен үйгө чейинки аралык», «7 кмге чейин», «бир жакка» */}
      <div style={box({ left: 300, right: 36, top: R.y0 - 70, opacity: 1 - hideText, translate: `${hideText * 60}px 0` })}>
        <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.16, color: C.ink, opacity: ruler }}>{T.unfold.measure}</div>
        <div style={{ marginTop: 22, fontSize: 76, fontWeight: 1000, lineHeight: 1.08, letterSpacing: -1 }}>
          <Marker p={marker}>{T.unfold.limit}</Marker>
        </div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", fontSize: 36, fontWeight: 900, color: C.ink, opacity: arrow }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 22px", borderRadius: 999, backgroundColor: C.blueSoft }}>
            <svg width={30} height={34} viewBox="0 0 30 34">
              <path d="M 15 3 L 15 29 M 5 19 L 15 30 L 25 19" fill="none" stroke={C.navy} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {T.unfold.oneWay}
          </span>
        </div>
      </div>
    </div>
  );
};

// Угол нижней половины вокруг сгиба: fold 1 — половина сложена назад (за
// цену, не видна), 0 — раскрыта вниз. Видна, когда «выходит» из-за верха.
export const flapAngle = (fold: number) => -180 * easeInOut(fold);

// Чек целиком (лицевая сторона). Используется и крупным планом, и в руках
// у мамы (масштабом).
export const ReceiptFront: React.FC<{
  readonly fold?: number;
  readonly top?: React.ComponentProps<typeof ReceiptTop>;
  readonly bottom?: React.ComponentProps<typeof ReceiptBottom>;
  readonly window?: React.ReactNode; // «окно» внутри нижней половины
  readonly shadow?: number;
}> = ({ fold = 0, top, bottom, window, shadow = 1 }) => {
  const a = flapAngle(fold);
  const visible = a > -88;
  const k = clamp((a + 88) / 88); // 0 — ребром, 1 — плоско
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: R.w, height: R.h }}>
      {/* нижняя половина на петле сгиба */}
      {visible ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: R.crease,
            width: R.w,
            height: R.h - R.crease,
            transformOrigin: "50% 0",
            transform: `perspective(2600px) rotateX(${a}deg)`,
          }}
        >
          <Paper w={R.w} h={R.h - R.crease} top={false} shadow={shadow * k}>
            <div style={box({ left: 0, top: -R.crease, width: R.w, height: R.h })}>
              <ReceiptBottom {...bottom} />
            </div>
            {window}
            {/* тень сгиба при раскрытии */}
            <div style={box({ left: 0, right: 0, top: 0, height: R.h - R.crease, background: `linear-gradient(180deg, rgba(90,70,40,${0.3 * (1 - k)}), rgba(90,70,40,0) 70%)` })} />
          </Paper>
        </div>
      ) : null}
      {/* верх — всегда виден */}
      <Paper w={R.w} h={R.crease + 1} bottom={false} shadow={shadow}>
        <ReceiptTop {...top} />
      </Paper>
    </div>
  );
};

// ---------- Оборот чека: линейка 0–20 км ----------
export const B = {
  w: 740,
  h: 900, // полная длина (до 20 км)
  rulerX: 92,
  y0: 70,
  y20: 820,
} as const;
export const backKmY = (km: number) => B.y0 + ((B.y20 - B.y0) * km) / 20;

// unroll — доля «размотанной» бумаги после 7 км (0…1); over — надпись
// «башка тариф»; max — оборванный край и «Максималдуу аралык — 20 км»;
// pin — метка «үй», которая ищет место на линейке (км или null).
export const ReceiptBack: React.FC<{
  readonly unroll: number;
  readonly over: number;
  readonly max: number;
  readonly pinKm?: number | null;
  readonly pinDrop?: number;
  readonly pinPulse?: number; // 0…1 — мягкое кольцо вокруг метки
}> = ({ unroll, over, max, pinKm = null, pinDrop = 0, pinPulse = 0 }) => {
  const y7 = backKmY(7);
  const endY = y7 + (B.h - y7) * easeOut(unroll);
  const zoneEnd = y7 + (backKmY(20) - y7) * clamp(unroll * 1.08);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: B.w, height: B.h, fontFamily, color: C.navy }}>
      <Paper w={B.w} h={Math.max(y7 + 40, endY)} color={C.paperBack} bottom={unroll > 0.97} tooth={18}>
        {/* «рулон»: край бумаги при размотке */}
        {unroll < 0.97 ? <div style={box({ left: -6, right: -6, top: endY - 18, height: 36, borderRadius: 18, background: "linear-gradient(180deg, #EFE7D6, #D9CDB5)", boxShadow: "0 8px 14px rgba(60,45,20,0.25)" })} /> : null}
      </Paper>
      <svg width={B.w} height={B.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <rect x={B.rulerX - 22} y={B.y0 - 22} width={44} height={zoneEnd - B.y0 + 30} rx={14} fill="#F4EEDF" stroke={C.paperEdge} strokeWidth={2} />
        <rect x={B.rulerX - 22} y={B.y0} width={44} height={y7 - B.y0} rx={10} fill={C.yellow} />
        {unroll > 0 ? (
          <rect x={B.rulerX - 22} y={y7} width={44} height={Math.max(0, zoneEnd - y7)} rx={10} fill={C.blueZone} />
        ) : null}
        {Array.from({ length: 21 }).map((_, k) => {
          const y = backKmY(k);
          if (y > zoneEnd + 2) return null;
          const major = k === 0 || k === 7 || k === 20;
          return (
            <g key={k}>
              <line x1={B.rulerX - 22} x2={B.rulerX + (major ? 30 : 8)} y1={y} y2={y} stroke={C.navy} strokeWidth={major ? 6 : 3} strokeLinecap="round" />
              {major ? (
                <text x={B.rulerX + 40} y={y + 13} fontSize={38} fontWeight={1000} fill={C.navy} fontFamily={fontFamily}>
                  {k}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {/* подписи зон */}
      <div style={box({ left: 220, right: 40, top: backKmY(3.5) - 40, fontSize: 52, fontWeight: 1000 })}>
        <Marker p={1}>{BG31_TEXT.beyond.base}</Marker>
      </div>
      <div style={box({ left: 220, right: 40, top: backKmY(12) - 70, fontSize: 52, fontWeight: 1000, lineHeight: 1.12, opacity: over, translate: `${(1 - over) * 40}px 0` })}>
        <span style={{ padding: "4px 14px", borderRadius: 14, backgroundColor: C.blueSoft, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{BG31_TEXT.beyond.over}</span>
      </div>
      {/* конец бумаги: 20 км */}
      <div style={box({ left: B.rulerX + 96, right: 20, top: backKmY(20) - 22, fontSize: 30, fontWeight: 1000, whiteSpace: "nowrap", opacity: max, display: "flex", alignItems: "center", gap: 12 })}>
        <svg width={36} height={36} viewBox="0 0 40 40" style={{ flex: "none" }}>
          <circle cx={20} cy={20} r={17} fill="none" stroke={C.navy} strokeWidth={4} />
          <path d="M 12 12 L 28 28" stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
        </svg>
        {BG31_TEXT.beyond.max}
      </div>
      {/* метка «үй», которая ищет своё место — точный адрес */}
      {pinKm !== null ? (
        <div style={box({ left: B.rulerX - 32, top: backKmY(pinKm) - 62, display: "flex", alignItems: "center" })}>
          {pinPulse > 0 ? (
            <div style={box({ left: 32 - 30, top: 62 - 30, width: 60, height: 60, borderRadius: 30, border: `5px solid rgba(255,201,14,${0.85 * (1 - pinPulse)})`, transform: `scale(${0.7 + 0.9 * pinPulse})` })} />
          ) : null}
          <svg width={64} height={64} viewBox="0 0 40 40" style={{ transform: `translateY(${-14 * (1 - easeOut(pinDrop))}px)` }}>
            <path d="M 20 37 C 20 37 7 24 7 15 A 13 13 0 0 1 33 15 C 33 24 20 37 20 37 Z" fill={C.navy} />
            <circle cx={20} cy={15} r={5.5} fill={C.yellow} />
          </svg>
        </div>
      ) : null}
    </div>
  );
};
