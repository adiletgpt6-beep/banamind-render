// План 4 (14,30–18,20 с): «Муну бир жолу кылсаңыз, анча билинбейт. Бирок
// мектеп — жумасына беш күн».
//   • «бир жолу» — одна спокойная карточка дня (ИШ ⏸ → ЖОЛ → МЕКТЕП);
//   • «Бирок» — кадр отъезжает в 2.5D-карточку, внизу неделя: карточка дня
//     улетает в понедельник, и на «мектеп… жумасына» дни заполняются
//     такими же цепочками — повторение превращается в нагрузку;
//   • «беш күн» — крупное «5 КҮН». Перед склейкой неделя «схлопывается»
//     в точку — из неё на следующем плане рождается BalaGo.
import { fontFamily } from "../../fonts";
import { BriefcaseIcon, PauseIcon, RoadIcon, SchoolIcon } from "../../live/icons";
import { KineticTitle } from "../../live/KineticTitle";
import { easeInOut, easeOut, mix, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { Chip, Glow } from "../../live/ui";
import { CUE, LIVE04 } from "../cues";

const DAYS = ["ДШ", "ШШ", "ШР", "БШ", "ЖМ"];
const BOARD = { left: 70, top: 1130, width: 940, height: 230 } as const;
const colX = (i: number) => BOARD.left + (BOARD.width / 5) * (i + 0.5);

// Мини-цепочка дня: работа (на паузе) → дорога → школа.
const DayChain: React.FC<{ readonly scale?: number; readonly pulse?: number }> = ({ scale = 1, pulse = 0 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * scale }}>
    <div style={{ position: "relative" }}>
      <BriefcaseIcon size={48 * scale} />
      <div style={{ position: "absolute", right: -14 * scale, top: -10 * scale, transform: `scale(${1 + pulse * 0.25})` }}>
        <PauseIcon size={26 * scale} />
      </div>
    </div>
    <RoadIcon size={40 * scale} />
    <SchoolIcon size={48 * scale} />
  </div>
);

const columnAt = (i: number) => [CUE.birok, CUE.mektep, CUE.zhumasyna, CUE.zhumasyna + 0.22, CUE.zhumasyna + 0.44][i];

export const Week: React.FC = () => {
  const t = useT();
  const [from, to] = [LIVE04.cuts[2], LIVE04.cuts[3]];
  if (t < from - 0.05 || t > to + 0.05) return null;
  const collapse = ramp(t, to - 0.3, 0.3, easeInOut);
  const board = ramp(t, CUE.birok, 0.35, easeOut);

  // Одна карточка дня: в центре нижней полосы → в понедельник доски.
  const dayIn = springy(t, CUE.munu, 0.55);
  const move = ramp(t, CUE.birok, 0.45, easeInOut);
  const cardX = mix(540, colX(0), move);
  const cardY = mix(1235, BOARD.top + BOARD.height / 2 + 12, move);
  const cardS = mix(1.25, 0.82, move);
  const calm = ramp(t, CUE.bilinbeyt, 0.3);

  const five = springy(t, CUE.besh, 0.5);
  const pulse = (k: number) => (t > CUE.besh ? 0.5 + 0.5 * Math.sin((t - CUE.besh) * 14 + k) : 0);

  return (
    <>
      <KineticTitle
        y={880}
        size={96}
        out={CUE.birok - 0.1}
        lines={[
          [
            { text: "бир", at: CUE.bir },
            { text: "жолу", at: CUE.zholu, accent: "yellow" },
          ],
          [
            { text: "анча", at: CUE.ancha },
            { text: "билинбейт", at: CUE.bilinbeyt },
          ],
        ]}
      />

      {/* доска недели (под отъехавшим кадром) */}
      <div style={{ position: "absolute", ...BOARD, opacity: board * (1 - collapse), transform: `scale(${1 - collapse * 0.6})`, transformOrigin: "50% -200px" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 36,
            background: "linear-gradient(160deg, rgba(20,40,90,0.92), rgba(8,18,46,0.95))",
            border: "2px solid rgba(255,255,255,0.14)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            transform: `translateY(${(1 - board) * 80}px)`,
          }}
        />
        {DAYS.map((d, i) => {
          const a = ramp(t, columnAt(i), 0.2);
          const k = springy(t, columnAt(i), 0.45);
          const x = (BOARD.width / 5) * (i + 0.5);
          return (
            <div key={d} style={{ position: "absolute", left: x - 90, top: 0, width: 180, height: BOARD.height, transform: `translateY(${(1 - board) * 80}px)` }}>
              <div style={{ position: "absolute", top: 16, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 32, color: a > 0 ? C.yellow : "rgba(255,255,255,0.35)" }}>{d}</div>
              {i > 0 && a > 0 ? (
                <div style={{ position: "absolute", left: 0, right: 0, top: 52, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${0.5 + 0.5 * k}) rotate(${(i % 2 ? 1 : -1) * 3 * pulse(i)}deg)` }}>
                  <DayChain scale={0.82} pulse={pulse(i)} />
                </div>
              ) : null}
              {i < 4 ? <div style={{ position: "absolute", right: 0, top: 60, bottom: 20, width: 2, background: "rgba(255,255,255,0.1)" }} /> : null}
            </div>
          );
        })}
      </div>

      {/* карточка «одного дня» */}
      {dayIn > 0 && collapse < 1 ? (
        <div
          style={{
            position: "absolute",
            left: cardX - 120,
            top: cardY - 150,
            width: 240,
            height: 300,
            transform: `scale(${cardS * (0.5 + 0.5 * dayIn) * (1 - collapse * 0.6)})`,
            opacity: Math.min(1, dayIn * 2) * (1 - collapse),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 34,
              background: move > 0.5 ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.95)",
              boxShadow: move > 0.5 ? "none" : `0 24px 60px rgba(6,14,38,0.4), 0 0 0 ${6 * calm}px rgba(43,211,139,${0.6 * calm * (1 - move)})`,
            }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, top: move > 0.5 ? 30 : 22, display: "flex", justifyContent: "center" }}>
            <DayChain scale={1} pulse={pulse(0)} />
          </div>
          {move < 0.5 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: -64, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 40, color: C.white, textShadow: "0 4px 16px rgba(0,0,0,0.6)", opacity: 1 - move * 2 }}>
              1 КҮН
            </div>
          ) : null}
        </div>
      ) : null}

      {/* подписи вокруг отъехавшего кадра */}
      <div style={{ position: "absolute", left: 70, top: 560, opacity: 1 - collapse }}>
        <Chip t={t} at={CUE.mektep} icon={<SchoolIcon size={50} />} text="Мектеп" tone="yellow" size={40} from="right" />
      </div>
      <div style={{ position: "absolute", right: 150, top: 380, opacity: 1 - collapse }}>
        <Chip t={t} at={CUE.zhumasyna} text="жумасына" tone="dark" size={40} from="left" />
      </div>
      {five > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 720,
            top: 640,
            width: 250,
            height: 250,
            transform: `scale(${five * (1 - collapse * 0.7)}) rotate(${(1 - five) * -30}deg)`,
            opacity: 1 - collapse,
          }}
        >
          <Glow size={420} opacity={0.6} style={{ left: -85, top: -85 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: C.yellow,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              color: C.navyInk,
              boxShadow: "0 24px 60px rgba(255,201,14,0.5)",
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: 130, lineHeight: 0.9 }}>5</div>
            <div style={{ fontWeight: 900, fontSize: 46, opacity: ramp(t, CUE.kun, 0.2) }}>КҮН</div>
          </div>
        </div>
      ) : null}
    </>
  );
};
