// Сцена 7 «Кечки убакыт бош эмес» (8 с).
// Вставка: телефон в руках мамы — расписание студии, две разборчивые строки
// «Кечки топ» и «Сыноо сабагы»; папа показывает пальцем на 19:00. Телефон
// уменьшается и уходит вниз-влево, рядом появляется ноутбук с незаконченной
// работой; из телефона вырастает полоса «Кечки топ», из ноутбука — «Бүтпөгөн
// иш», обе ложатся на один и тот же вечерний отрезок шкалы — пересечение
// видно сразу. Последний кадр (полосы) переходит в схему маршрута сцены 8.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { CuesContext } from "../context";
import { clamp, easeInOut, keysV, lerp } from "../rig/motion";
import { COLORS } from "../../config";
import { HoldingHands, INK, Phone, ScheduleScreen, TC, TimeConflict } from "../screens";
import { MOV_TEXT } from "../script";
import { box } from "../shots";
import type { MovCue } from "../timing";
import { wordFrame } from "./common";
import { InsertBack, phoneGeom, phoneH, PointingHand } from "./EveningParts";

export const SCH_INS = { x: 540, y: 900, w: 520 } as const;
export const PHONE_MINI = { x: 290, y: 1262, w: 150 } as const;
export const LAPTOP_MINI = { x: 770, y: 1250, w: 380 } as const;
const SKIN = { mom: "#E6B590", momShade: "#D29B74", sleeve: "#C47A62", dad: "#DCAA84", dadShade: "#C5906B", dadSleeve: "#5E7396" };
// шкала TimeConflict: x начала отрезка 19:00 и середины полос
const X19 = TC.x0 + TC.w / 3;
const BAR1 = { y: 620 };
const BAR2 = { y: 830 };

// Маленький телефон с расписанием (конец сцены 7, начало сцены 8).
export const PhoneMini: React.FC<{ readonly f: number }> = ({ f }) => (
  <Phone x={PHONE_MINI.x} y={PHONE_MINI.y} w={PHONE_MINI.w}>
    <ScheduleScreen f={f} at={-400} glowTime={1} />
  </Phone>
);

export const EveningBack: React.FC = () => (
  <InsertBack
    wall="#4A4F78"
    low="#3A3E62"
    blobs={[
      { x: 160, y: 380, r: 260, c: "#E7B76A", o: 0.32 },
      { x: 980, y: 1500, r: 420, c: "#5B4C7C", o: 0.6 },
      { x: 860, y: 260, r: 160, c: "#9FB4D8", o: 0.25 },
    ]}
  />
);

// Ноутбук спереди (экран к зрителю): отчёт, прогресс 3 / 5.
export const LaptopMini: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly a?: number }> = ({ x, y, w, a = 1 }) => {
  const t = MOV_TEXT.laptop;
  const h = w * 0.63;
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, translate: `0 ${(1 - a) * 40}px`, fontFamily, color: INK })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, borderRadius: w * 0.045, backgroundColor: INK, boxShadow: "0 18px 40px rgba(10,14,30,0.35)" })} />
      <div style={box({ left: w * 0.035, top: w * 0.035, width: w * 0.93, height: h - w * 0.07, borderRadius: w * 0.02, backgroundColor: "#F7F9FC", overflow: "hidden" })}>
        <div style={box({ left: w * 0.05, top: w * 0.05, fontSize: w * 0.072, fontWeight: 900, whiteSpace: "nowrap" })}>{t.title}</div>
        <div style={box({ left: w * 0.05, top: w * 0.16, fontSize: w * 0.052, fontWeight: 800, color: "#5A6B8C", whiteSpace: "nowrap" })}>{t.task}</div>
        <div style={box({ left: w * 0.05, top: w * 0.29, width: w * 0.6, height: w * 0.035, borderRadius: w * 0.02, backgroundColor: "#E1E7F0" })} />
        <div style={box({ left: w * 0.05, top: w * 0.29, width: w * 0.36, height: w * 0.035, borderRadius: w * 0.02, backgroundColor: "#2F62A8" })} />
        <div style={box({ left: w * 0.7, top: w * 0.255, padding: `${w * 0.008}px ${w * 0.03}px`, borderRadius: w * 0.03, backgroundColor: COLORS.yellow, fontSize: w * 0.05, fontWeight: 900 })}>{t.progress}</div>
        {[0, 1].map((i) => (
          <div key={i} style={box({ left: w * 0.05, top: w * (0.38 + i * 0.08), width: w * (0.7 - i * 0.2), height: w * 0.03, borderRadius: w * 0.015, backgroundColor: "#C9D2E0" })} />
        ))}
      </div>
      <div style={box({ left: -w * 0.08, top: h, width: w * 1.16, height: w * 0.045, borderRadius: `0 0 ${w * 0.04}px ${w * 0.04}px`, backgroundColor: "#C9D2E0" })} />
      <div style={box({ left: w * 0.42, top: h, width: w * 0.16, height: w * 0.018, borderRadius: w * 0.01, backgroundColor: "#AEB8C9" })} />
    </div>
  );
};

// Линия от предмета к полосе (рисуется постепенно).
export const LinkLine: React.FC<{ readonly from: { x: number; y: number }; readonly to: { x: number; y: number }; readonly p: number; readonly color: string; readonly a?: number }> = ({ from, to, p, color, a = 1 }) =>
  p > 0 ? (
    <svg width={1080} height={1920} style={box({ left: 0, top: 0, opacity: a })}>
      <line x1={from.x} y1={from.y} x2={lerp(from.x, to.x, p)} y2={lerp(from.y, to.y, p)} stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 16" />
      <circle cx={from.x} cy={from.y} r={10} fill={color} />
      {p >= 1 ? <circle cx={to.x} cy={to.y} r={10} fill={color} /> : null}
    </svg>
  ) : null;

// Итоговая доска сцены 7 (её же показывает начало сцены 8).
export type ClashTimes = { readonly card: number; readonly bar1: number; readonly bar2: number; readonly clash: number; readonly laptop: number };
export const ClashBoard: React.FC<{ readonly f: number; readonly at: ClashTimes; readonly morph?: number; readonly phone?: React.ReactNode }> = ({ f, at, morph = 0, phone }) => {
  const minis = 1 - morph;
  const lap = easeInOut((f - at.laptop) / 12);
  const pPhone = clamp((f - (at.bar1 - 8)) / 10);
  const pLap = clamp((f - (at.bar2 - 10)) / 10);
  const phoneTop = { x: PHONE_MINI.x, y: PHONE_MINI.y - phoneH(PHONE_MINI.w) / 2 - 8 };
  const lapTop = { x: LAPTOP_MINI.x, y: LAPTOP_MINI.y - (LAPTOP_MINI.w * 0.63) / 2 - 8 };
  return (
    <>
      <TimeConflict f={f} at={at.card} bar1At={at.bar1} bar2At={at.bar2} clashAt={at.clash} morph={morph} />
      <LinkLine from={phoneTop} to={{ x: X19 + 10, y: BAR1.y }} p={pPhone} color={COLORS.navy} a={minis} />
      <LinkLine from={lapTop} to={{ x: LAPTOP_MINI.x, y: BAR2.y }} p={pLap} color="#8E9AB2" a={minis} />
      <div style={box({ inset: 0, opacity: minis })}>
        {phone}
        <LaptopMini x={LAPTOP_MINI.x} y={LAPTOP_MINI.y} w={LAPTOP_MINI.w} a={lap} />
      </div>
    </>
  );
};

// Моменты сцены по словам диктора (их же берёт звук).
export const scheduleBeats = (cues: readonly MovCue[]) => {
  const at: ClashTimes = {
    card: wordFrame(cues, "n06", 4) + 8, // «Бирок»
    bar1: wordFrame(cues, "n06", 5) + 10, // «дал ошол убакта»
    laptop: wordFrame(cues, "n06", 8), // «апасы»
    bar2: wordFrame(cues, "n06", 9), // «күндүз бүтпөй калган ишин»
    clash: wordFrame(cues, "n06", 12) - 4,
  };
  return { at, glowAt: wordFrame(cues, "n06", 2) }; // 19:00 подсвечивается на «бар экен»
};

export const ScheduleScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { at, glowAt } = scheduleBeats(cues);
  const shrink = [at.card - 8, at.card + 12] as const;

  // телефон: вставка → маленький телефон внизу слева
  const u = easeInOut((f - shrink[0]) / (shrink[1] - shrink[0]));
  const w = Math.exp(lerp(Math.log(SCH_INS.w), Math.log(PHONE_MINI.w), u));
  const k = w / SCH_INS.w;
  const cx = lerp(SCH_INS.x, PHONE_MINI.x, u);
  const cy = lerp(SCH_INS.y, PHONE_MINI.y, u);
  const push = lerp(1 + 0.05 * clamp(f / shrink[0]), 1, u);
  // палец папы: показывает на 19:00 и убирается
  const G = phoneGeom(SCH_INS.x, SCH_INS.y, SCH_INS.w);
  const chip = G.at(436, 420);
  const tip = keysV(f, [
    [glowAt - 12, { x: 1060, y: 1500 }],
    [glowAt - 2, { x: chip.x + 30, y: chip.y + 60 }],
    [glowAt + 2, chip],
    [glowAt + 22, chip],
    [glowAt + 28, { x: 1100, y: 1560 }],
  ]);
  const phone = (
    <div style={box({ inset: 0, transformOrigin: `${SCH_INS.x}px ${SCH_INS.y}px`, transform: `translate(${cx - SCH_INS.x}px, ${cy - SCH_INS.y}px) scale(${k * push})` })}>
      <div style={box({ inset: 0, opacity: 1 - clamp(u * 2.2) })}>
        <HoldingHands x={SCH_INS.x} y={SCH_INS.y} w={SCH_INS.w} skin={SKIN.mom} shade={SKIN.momShade} sleeve={SKIN.sleeve} />
      </div>
      <Phone x={SCH_INS.x} y={SCH_INS.y} w={SCH_INS.w}>
        <ScheduleScreen f={f} at={-30} glowTime={clamp((f - glowAt) / 10)} />
      </Phone>
      {f > glowAt - 12 && f < glowAt + 28 ? <PointingHand x={tip.x} y={tip.y} ang={30} s={0.9} skin={SKIN.dad} shade={SKIN.dadShade} sleeve={SKIN.dadSleeve} /> : null}
    </div>
  );
  return (
    <div style={box({ inset: 0, backgroundColor: "#3A3E62" })}>
      <EveningBack />
      {f >= at.card ? <ClashBoard f={f} at={at} phone={phone} /> : phone}
    </div>
  );
};
