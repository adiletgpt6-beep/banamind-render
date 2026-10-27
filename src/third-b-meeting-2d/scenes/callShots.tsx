// Планы видеозвонка (B, C, D). Все берут состояние из callPlan по
// абсолютному кадру, поэтому лист «3 Б», лица и выбранный вариант
// совпадают во всех ракурсах.
//   B — экран ноутбука через плечо мамы: слайд, плитки, её окно;
//   C — кадр веб-камеры мамы (что получает клиент), крупно;
//   D — рабочее место клиента: через его плечо монитор с тем же входящим
//       потоком; DFace — его лицо крупно (камера клиента).
import { AbsoluteFill } from "remotion";
import { box, Svg, useAbs } from "../kit";
import { lerp } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C } from "../theme";
import { CallEnded, CallScreen, ClientFeed, ClientMonitor, MomFeed, MONITOR } from "../props/Call";
import { LaptopScreenView } from "../props/Laptop";
import { CloseHand } from "../props/CloseHand";
import { type CallPlan, clientFaceAt, liftAt, momFaceAt } from "./callPlan";
import { CallName, FeedCrop } from "./Hook";
import { MOM_HAND } from "./Studio";

// B. Экран через плечо: волосы и плечо мамы на переднем плане справа.
export const ShotB: React.FC<{ readonly f: number; readonly c: CallPlan; readonly uid: string; readonly zoom?: number; readonly ended?: number; readonly press?: number; readonly cursor?: { x: number; y: number } | null; readonly tap?: number }> = ({ f, c, uid, zoom = 1, ended = -1, press = 0, cursor = null, tap = 0 }) => {
  const abs = useAbs();
  const t = abs(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#3D4350" }}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: "50% 40%" })}>
        <LaptopScreenView x={540} y={1150} w={1040}>
          {ended >= 0 ? (
            <CallEnded t={ended} />
          ) : (
            <CallScreen
              f={f}
              uid={uid}
              lift={liftAt(c, t)}
              mom={(tt) => momFaceAt(c, abs(tt))}
              client={(tt) => clientFaceAt(c, abs(tt))}
              pick={Math.max(0, Math.min(1, (t - c.pick) / 10))}
              point={t >= c.sample && t < c.m03[1] ? 1 : 0}
              hand={t >= c.sample - 10 && t < c.m03[1] + 20 ? Math.max(0, Math.min(1, (t - c.sample + 10) / 12)) : 0}
              press={press}
            />
          )}
          {cursor ? (
            <svg width={60} height={70} style={box({ left: cursor.x, top: cursor.y })}>
              <path d="M 4 4 L 4 52 L 18 40 L 28 62 L 38 58 L 28 36 L 46 36 Z" fill="#FFFFFF" stroke="#182638" strokeWidth={4} strokeLinejoin="round" />
            </svg>
          ) : null}
        </LaptopScreenView>
        <Svg>
          {tap >= 0 ? <CloseHand x={560} y={1800 + tap * 6} angle={186} size={190} {...MOM_HAND} shape="point" armLen={3} /> : null}
        </Svg>
      </div>
      {/* край плеча и волос мамы на переднем плане (слева внизу, экран не закрыт) */}
      <div style={box({ left: -220, top: 1560, width: 460, height: 600, borderRadius: "0 240px 0 0", backgroundColor: "#22334C" })} />
      <div style={box({ left: -160, top: 1380, width: 300, height: 300, borderRadius: "0 150px 150px 0", backgroundColor: "#231A17" })} />
    </AbsoluteFill>
  );
};

// C. Кадр веб-камеры мамы (крупно) — то же, что видит клиент.
export const ShotC: React.FC<{ readonly f: number; readonly c: CallPlan; readonly uid: string; readonly s?: number; readonly cx?: number }> = ({ f, c, uid, s = 1.2, cx = 440 }) => {
  const abs = useAbs();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1E232D" }}>
      <FeedCrop s={s} cx={cx} cy={270} py={900}>
        <MomFeed f={f} uid={uid} lift={liftAt(c, abs(f))} face={(tt) => momFaceAt(c, abs(tt))} />
      </FeedCrop>
      <CallName text={T3B_TEXT.call.you} y={900 + 270 * s + 20} />
    </AbsoluteFill>
  );
};

// D. Рабочее место клиента: через плечо — монитор с входящим потоком.
export const ShotD: React.FC<{ readonly f: number; readonly c: CallPlan; readonly uid: string; readonly push?: number }> = ({ f, c, uid, push = 0 }) => {
  const abs = useAbs();
  const k = lerp(0.76, 0.82, push);
  const w = MONITOR.w * k;
  return (
    <AbsoluteFill style={{ backgroundColor: "#E7D5B9" }}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #F3E7D2, #E2CDAE)" })} />
      <div style={box({ left: 0, top: 1400, width: 1080, height: 520, backgroundColor: "#B88A5E" })} />
      {/* монитор */}
      <div style={box({ left: 540 - w / 2 - 22, top: 560 - 22, width: w + 44, height: MONITOR.h * k + 44, backgroundColor: "#1A1D24", borderRadius: 18 })} />
      <div style={box({ left: 540 - w / 2, top: 560, width: w, height: MONITOR.h * k, overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: MONITOR.w, height: MONITOR.h, transform: `scale(${k})`, transformOrigin: "0 0" })}>
          <ClientMonitor f={f} uid={uid} lift={liftAt(c, abs(f))} mom={(tt) => momFaceAt(c, abs(tt))} pick={Math.max(0, Math.min(1, (abs(f) - c.pick) / 10))} />
        </div>
      </div>
      <div style={box({ left: 500, top: 560 + MONITOR.h * k + 22, width: 80, height: 180, backgroundColor: "#2A2E36" })} />
      {/* затылок и плечо клиента на переднем плане */}
      <div style={box({ left: 700, top: 1500, width: 620, height: 600, borderRadius: "300px 0 0 0", backgroundColor: "#2E3A44" })} />
      <div style={box({ left: 820, top: 1260, width: 300, height: 340, borderRadius: "50%", backgroundColor: "#4A4440" })} />
    </AbsoluteFill>
  );
};

// Лицо клиента крупно (камера клиента).
export const DFace: React.FC<{ readonly f: number; readonly c: CallPlan; readonly uid: string; readonly hook?: boolean }> = ({ f, c, uid, hook = false }) => {
  const abs = useAbs();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1E232D" }}>
      <FeedCrop s={2.1} cx={470} cy={270} py={900}>
        <ClientFeed f={f} uid={uid} face={(tt) => clientFaceAt(c, abs(tt), hook)} />
      </FeedCrop>
      <CallName text={T3B_TEXT.call.client} y={1470} />
    </AbsoluteFill>
  );
};

export const CALL_BG = C.cabin;
