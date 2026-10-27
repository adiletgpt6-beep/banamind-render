// Сцена 5: тот же лист — рисунок часов мягко превращается в карту
// Бишкека (горы Ала-Тоо, улицы). Маршрут BalaGo: утром ҮЙ → МЕКТЕП,
// после уроков МЕКТЕП → ҮЙ — один полный день. Внизу порядок: заявка →
// подбор подходящей группы (3–4 ребёнка, до 2 недель) → первая полная
// пробная поездка бесплатно. Группа ещё ищется — поездка не показана.
// Диктор: «BalaGo Бишкекте балдарды үйдөн мектепке, сабактан кийин кайра
// үйгө жеткирүү үчүн каттам уюштурат. Адегенде ылайыктуу топ түзүлөт.»
import { ArrowText, CarSide, easeInOut, easeOut, House, Mountains, NAVY, NAVY_SOFT, Pin, popScale, Poplar, prog, School, SunIcon, YELLOW, YELLOW_SOFT } from "../art";
import { cueFrames, local, wordFrame, type SceneProps } from "../kit";
import { BG13_TEXT } from "../script";
import { ClockDrawing, TableTop } from "./Drawing";
import { box, PAPER } from "./sets";

const M = BG13_TEXT.map;

// Маршрут на листе: дом слева внизу, школа справа вверху.
const HOME = { x: 230, y: 860 };
const SCHOOL = { x: 690, y: 440 };
const MORNING = `M ${HOME.x + 40} ${HOME.y - 40} C 380 700, 520 640, ${SCHOOL.x - 60} ${SCHOOL.y + 40}`;
const AFTER = `M ${SCHOOL.x + 10} ${SCHOOL.y + 70} C 640 760, 470 860, ${HOME.x + 80} ${HOME.y + 10}`;

export const mapKeys = (tl: SceneProps["tl"]) => {
  const n02 = cueFrames(tl, "n02");
  return {
    n02,
    morph: [0, 26] as const,
    morning: wordFrame(tl, "n02", "үйдөн", 0.25),
    after: wordFrame(tl, "n02", "сабактан", 0.45),
    step1: wordFrame(tl, "n02", "каттам", 0.7),
    step2: wordFrame(tl, "n02", "адегенде", 0.78),
    step3: n02.to + 6,
  };
};

export const MapScene: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt } = local(tl, "map", t);
  const k = mapKeys(tl);
  const morph = easeInOut(prog(f, k.morph[0], k.morph[1] - k.morph[0]));
  const map = easeOut(prog(f, 10, 20));
  const morning = easeInOut(prog(f, k.morning, 26));
  const after = easeInOut(prog(f, k.after, 26));
  const steps = [k.step1, k.step2, k.step3].map((s) => easeOut(prog(f, s, 10)));
  const active = f >= k.step3 ? 2 : f >= k.step2 ? 1 : f >= k.step1 ? 0 : -1;
  // лист уменьшается и поднимается, освобождая место условиям
  const sheet = easeInOut(prog(f, k.step1 - 10, 18));
  const s = 1 - 0.3 * sheet;
  const ty = -150 * sheet;
  const L = 900;
  return (
    <div style={box({ inset: 0, overflow: "hidden", fontFamily: "Nunito" })}>
      <div style={box({ inset: 0, transform: `translateY(${ty}px) scale(${s})`, transformOrigin: "50% 30%" })}>
        <TableTop>
          {/* часы растворяются, остаются сын-«иконки» дома и школы → карта */}
          <ClockDrawing f={f + 300} a1={1 - morph} a2={1 - morph} loop={1 - morph} icons={1 - morph} clockFade={1 - morph} />
          <svg width={PAPER.w} height={PAPER.h} viewBox={`0 0 ${PAPER.w} ${PAPER.h}`} style={box({ left: 0, top: 0, opacity: map })}>
            <rect x={0} y={0} width={PAPER.w} height={PAPER.h} fill="#F4F8F1" />
            <Mountains width={PAPER.w} y={30} />
            {/* улицы Бишкека — прямая сетка */}
            {[300, 480, 660, 840, 1000].map((y) => (
              <path key={`h${y}`} d={`M 0 ${y} L ${PAPER.w} ${y - 30}`} stroke="#DDE4EC" strokeWidth={20} />
            ))}
            {[140, 360, 580, 800].map((x) => (
              <path key={`v${x}`} d={`M ${x} 230 L ${x + 30} ${PAPER.h}`} stroke="#DDE4EC" strokeWidth={20} />
            ))}
            {[
              [90, 420],
              [520, 330],
              [820, 760],
              [430, 1000],
              [120, 650],
            ].map(([x, y], i) => (
              <Poplar key={i} x={x} y={y} s={1.6} />
            ))}
            <text x={40} y={280} fontSize={54} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
              {M.city}
            </text>
            {/* утро: ҮЙ → МЕКТЕП */}
            <path d={MORNING} fill="none" stroke={YELLOW} strokeWidth={22} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - morning)} />
            {/* после уроков: МЕКТЕП → ҮЙ */}
            <path d={AFTER} fill="none" stroke={NAVY} strokeWidth={14} strokeLinecap="round" strokeDasharray="1 26" opacity={after > 0 ? 1 : 0} />
            <path d={AFTER} fill="none" stroke="#F4F8F1" strokeWidth={18} strokeDasharray={L} strokeDashoffset={-L * after} />
            <g transform={`translate(${HOME.x} ${HOME.y}) scale(1.6)`}>
              <House glow={morning} />
            </g>
            <g transform={`translate(${SCHOOL.x} ${SCHOOL.y}) scale(1.4)`}>
              <School glow={morning} />
            </g>
            <Pin x={HOME.x} y={HOME.y + 80} label={M.home} />
            <Pin x={SCHOOL.x} y={SCHOOL.y - 180} label={M.school} />
            {morning > 0 ? (
              <g opacity={morning} transform="translate(300 600)">
                <rect x={-20} y={-36} width={290} height={56} rx={28} fill="#FFFFFF" stroke={YELLOW} strokeWidth={5} />
                <text x={125} y={2} textAnchor="middle" fontSize={32} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
                  {M.morning}
                </text>
              </g>
            ) : null}
            {after > 0 ? (
              <g opacity={after} transform="translate(560 900)">
                <rect x={-20} y={-36} width={300} height={56} rx={28} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
                <text x={130} y={2} textAnchor="middle" fontSize={32} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
                  {M.afternoon}
                </text>
              </g>
            ) : null}
          </svg>
          {/* остаток рисунка: часы сжались в маленькое солнце-время в углу */}
          <div style={box({ left: 760, top: 980, opacity: map })}>
            <SunIcon size={90} />
          </div>
        </TableTop>
      </div>
      {/* заголовок: маршрут и белая машина BalaGo (иллюстрация бренда) */}
      <div style={box({ left: 0, right: 0, top: 180, display: "flex", justifyContent: "center", opacity: easeOut(prog(f, 14, 12)) })}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 36px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 52, fontWeight: 1000, color: NAVY, boxShadow: "0 10px 24px rgba(20,40,75,0.18)" }}>
          <ArrowText text={M.route} size={52} />
        </div>
      </div>
      <div style={box({ left: 740, top: 1050 - 150 * sheet, opacity: map * (1 - sheet) })}>
        <CarSide width={250} wheelTurn={0} bounce={Math.sin(lt * 4) * 1.5} />
      </div>
      {/* условия: три шага */}
      <div style={box({ left: 60, right: 60, top: 1030, display: "flex", flexDirection: "column", gap: 16 })}>
        {M.steps.map((st, i) => {
          const u = steps[i];
          const on = active === i;
          return (
            <div
              key={st.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "14px 24px",
                borderRadius: 30,
                backgroundColor: on ? "#FFFFFF" : "rgba(255,255,255,0.92)",
                boxShadow: on ? `0 0 0 6px ${YELLOW}, 0 14px 30px rgba(20,40,75,0.22)` : "0 8px 18px rgba(20,40,75,0.14)",
                opacity: u,
                transform: `translateX(${(1 - u) * 60}px) scale(${0.96 + 0.04 * popScale(u)})`,
              }}
            >
              <div style={{ width: 76, height: 76, flexShrink: 0, borderRadius: 38, backgroundColor: on ? YELLOW : YELLOW_SOFT, color: NAVY, fontSize: 44, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>{st.n}</div>
              <div>
                <div style={{ fontSize: 44, fontWeight: 1000, color: NAVY, lineHeight: 1.08 }}>{st.title}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: NAVY_SOFT, lineHeight: 1.15 }}>{st.note}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={box({ right: 40, top: 1830, fontSize: 24, fontWeight: 800, color: NAVY_SOFT, opacity: 0.8 })}>{BG13_TEXT.note}</div>
    </div>
  );
};
