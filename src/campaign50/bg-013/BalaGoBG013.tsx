// BalaGoBG013 — BG-013 «Самый длинный вторник» (BalaGo-50, выпуск №14).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
//   1. Хук: огромные часы школы глазами ребёнка, стрелка тянется
//   2. Мамин вторник: офис → школа (вовремя) → дом → снова работа
//   3. Вечер: звонок коллеги, ноутбук, усталость; сын приносит рисунок
//   4. Рисунок: две стрелки дороги → мама ищет организованную поездку
//   5. Рисунок становится картой Бишкека: ҮЙ → МЕКТЕП → ҮЙ и условия
//   6. Солнце на часах → финал: Бишкек, ссылка в профиле и WhatsApp
// Монтаж: между крупными сценами — «шторка-стрелка часов» (сектор,
// заметаемый по кругу, как минутная стрелка); рисунок → карта — морфинг
// на том же листе; часы с солнцем раскрываются кругом в финал.
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeInOut, NAVY, prog, YELLOW } from "./art";
import { Bg13Audio } from "./Bg13Audio";
import { Cta } from "./scenes/Cta";
import { Drawing } from "./scenes/Drawing";
import { Evening } from "./scenes/Evening";
import { Hook } from "./scenes/Hook";
import { MapScene } from "./scenes/MapScene";
import { Pickup } from "./scenes/Pickup";
import { Subtitles } from "./scenes/Subtitles";
import type { SceneProps } from "./kit";
import type { Bg13SceneId } from "./script";
import { buildBg13Timeline, type Bg13Manifest } from "./timing";
import { BG13_VIDEO } from "./script";

export type BalaGoBG013Props = { readonly manifest: Bg13Manifest };

const SCENES: Record<Bg13SceneId, React.FC<SceneProps>> = {
  hook: Hook,
  pickup: Pickup,
  evening: Evening,
  drawing: Drawing,
  map: MapScene,
  cta: Cta,
};

// Как сцена уходит: "clock" — сектор заметается стрелкой часов поверх
// следующей сцены; "fade" — растворение (рисунок → карта на том же листе).
const OUT: Partial<Record<Bg13SceneId, { readonly kind: "clock" | "fade"; readonly dur: number }>> = {
  hook: { kind: "clock", dur: 0.6 },
  pickup: { kind: "clock", dur: 0.55 },
  evening: { kind: "clock", dur: 0.55 },
  drawing: { kind: "fade", dur: 0.45 },
  map: { kind: "clock", dur: 0.55 },
};

// Уходящая сцена поверх новой: открытый сектор растёт по часовой стрелке
// от «12 часов», по краю сектора — жёлтая стрелка.
const ClockWipe: React.FC<{ readonly u: number; readonly children: React.ReactNode }> = ({ u, children }) => {
  const deg = 360 * easeInOut(u);
  const mask = `conic-gradient(from 0deg at 50% 46%, transparent 0deg ${deg}deg, #000 ${deg}deg 360deg)`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask }}>{children}</div>
      {u > 0 && u < 1 ? (
        <div style={{ position: "absolute", left: 540 - 9, top: 0.46 * 1920 - 1500, width: 18, height: 1500, transformOrigin: "50% 100%", transform: `rotate(${deg}deg)` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 9, backgroundColor: YELLOW, boxShadow: `0 0 0 4px ${NAVY}` }} />
        </div>
      ) : null}
      {u > 0 && u < 1 ? <div style={{ position: "absolute", left: 540 - 30, top: 0.46 * 1920 - 30, width: 60, height: 60, borderRadius: 30, backgroundColor: YELLOW, boxShadow: `0 0 0 6px ${NAVY}` }} /> : null}
    </>
  );
};

export const BalaGoBG013: React.FC<BalaGoBG013Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg13Timeline(manifest), [manifest]);
  const t = frame / BG13_VIDEO.fps;
  const p = { t, tl };
  // позднее сцены рисуются раньше (ниже), уходящая сцена — поверх
  const order = [...tl.scenes].reverse();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      {order.map((s) => {
        const out = OUT[s.id];
        const end = s.to + (out?.dur ?? 0);
        if (t < s.from || t >= end) return null;
        const Scene = SCENES[s.id];
        if (t < s.to || !out) return <Scene key={s.id} {...p} />;
        const u = prog(t, s.to, out.dur);
        // уходящая сцена «замирает» на последнем кадре
        const frozen = { t: s.to - 1 / BG13_VIDEO.fps, tl };
        return out.kind === "fade" ? (
          <div key={s.id} style={{ position: "absolute", inset: 0, opacity: 1 - easeInOut(u) }}>
            <Scene {...frozen} />
          </div>
        ) : (
          <ClockWipe key={s.id} u={u}>
            <Scene {...frozen} />
          </ClockWipe>
        );
      })}
      <Subtitles t={t} cues={tl.cues} />
      <Bg13Audio tl={tl} />
    </AbsoluteFill>
  );
};
