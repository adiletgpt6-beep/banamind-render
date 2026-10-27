// Сцена 1. Неожиданный вопрос (фрагмент из середины истории).
// A. Крупный план клиента в видеозвонке: он смотрит чуть внимательнее,
//    замечает что-то неожиданное и спрашивает C01 (та же запись звучит в
//    сцене 9).
// B. Ответный план — кадр веб-камеры мамы: она на мгновение замирает
//    (≈ 0,5 с), у левого края — край поднятого листа с «Б» и карандашом;
//    дочка не показана. Позы — те же, что в сцене 9 в этот момент.
import { AbsoluteFill } from "remotion";
import { clamp, easeOut } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box, useScene, usePlan } from "../kit";
import { ClientFeed, FEED, MomFeed } from "../props/Call";
import { callPlan, clientFaceAt, momFaceAt } from "./callPlan";

// Мир FEED (960 × 540) крупно в вертикальном кадре: точка (cx, cy) мира —
// в точке (px, py) кадра, масштаб s.
export const FeedCrop: React.FC<{ readonly s: number; readonly cx: number; readonly cy: number; readonly px?: number; readonly py?: number; readonly children: React.ReactNode }> = ({ s, cx, cy, px = 540, py = 960, children }) => (
  <div style={box({ left: px - cx * s, top: py - cy * s, width: FEED.w, height: FEED.h, transform: `scale(${s})`, transformOrigin: "0 0" })}>{children}</div>
);

// Подпись участника звонка в кадре.
export const CallName: React.FC<{ readonly text: string; readonly x?: number; readonly y?: number; readonly o?: number }> = ({ text, x = 90, y = 1480, o = 1 }) => (
  <div style={box({ left: x, top: y, padding: "8px 22px 10px", backgroundColor: "rgba(24,38,56,0.78)", color: C.white, fontFamily: F.text, fontWeight: 800, fontSize: 40, borderRadius: 12, opacity: o })}>{text}</div>
);

export const HookScene: React.FC = () => {
  const { f, start, cue, rel } = useScene("hook");
  const c = usePlan(callPlan);
  const c01 = cue("C01a");
  const cut = rel(c01.to) + 4;
  if (f < cut) {
    // медленный наезд: внимание клиента
    const s = 2.0 + 0.16 * easeOut(clamp(f / cut));
    return (
      <AbsoluteFill style={{ backgroundColor: "#1E232D" }}>
        <FeedCrop s={s} cx={470} cy={270} py={900}>
          <ClientFeed f={f} uid="h1" face={(t) => clientFaceAt(c, start + t, true)} />
        </FeedCrop>
        <CallName text={T3B_TEXT.call.client} y={1470} />
      </AbsoluteFill>
    );
  }
  // кадр мамы: та же поза, что в сцене 9 сразу после вопроса
  const toJoke = (t: number) => c.j.c01[1] + (start + t - (start + cut));
  return (
    <AbsoluteFill style={{ backgroundColor: "#1E232D" }}>
      <FeedCrop s={1.95} cx={470} cy={270} py={900}>
        <MomFeed f={f} uid="h1" lift={1} face={(t) => momFaceAt(c, toJoke(t))} />
      </FeedCrop>
      <CallName text={T3B_TEXT.call.you} y={1470} />
    </AbsoluteFill>
  );
};
