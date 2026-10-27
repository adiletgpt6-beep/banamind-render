// Сцена 3: кеңсе, мама за столом печатает. На планере над столом день за
// днём заполняется одна и та же шкала обеда: тёмная стрелка «Мектеп»
// съедает обед в понедельник, вторник, среду; четверг и пятница — тот же
// контур со знаком «?». Мама отрывается от ноутбука, поднимает взгляд на
// планер — тревожные брови, вздох, мысль (облачко): «Бул жолду күн сайын
// өзүм жүрүшүм керекпи?» — и сама берёт телефон со стола (связующее
// действие). Камера наезжает на телефон → сцена поиска.
import { fontFamily } from "../../../fonts";
import { easeInOut, easeOut, Figure, keys, lerp, LOOKS, Mountains, NAVY, NAVY_SOFT, prog, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";
import type { Bg3Cue } from "../timing";

const DESK_Y = 1500;
const MOM = { x: 400, s: 1.25 };
const FEET = DESK_Y + 262 * MOM.s;
// точка телефона на столе (мировые px кадра)
const PHONE = { x: MOM.x + 262 * MOM.s, y: DESK_Y - 16 };

const Row: React.FC<{ readonly t: number; readonly at: number; readonly label: string; readonly ghost?: boolean }> = ({ t, at, label, ghost }) => {
  const a = easeOut(prog(t, at, 0.35));
  const eat = easeInOut(prog(t, at + 0.2, 0.7));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: a * (ghost ? 0.55 : 1), transform: `translateX(${(1 - a) * -40}px)`, height: 92 }}>
      <div style={{ width: 250, fontSize: 38, fontWeight: 1000, color: NAVY, textAlign: "right" }}>{label}</div>
      <div
        style={{
          position: "relative",
          width: 560,
          height: 62,
          borderRadius: 31,
          backgroundColor: ghost ? "#FFFFFF" : YELLOW,
          border: ghost ? `4px dashed ${NAVY_SOFT}` : undefined,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {ghost ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 1000, color: NAVY_SOFT }}>?</div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 62,
              width: 560 * 0.95 * eat,
              backgroundColor: NAVY,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 1000,
              gap: 10,
              whiteSpace: "nowrap",
              overflow: "hidden",
              clipPath: "polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%)",
            }}
          >
            {BG3_TEXT.schoolRoad}
          </div>
        )}
      </div>
    </div>
  );
};

export const Week: React.FC<{ readonly t: number; readonly b: Bg3Beats; readonly m01: Bg3Cue }> = ({ t, b, m01 }) => {
  const w = b.week;
  const fadeIn = prog(t, w.from - 0.3, 0.3);
  // наезд на телефон в конце сцены
  const z = easeInOut(prog(t, w.zoom, 0.7));
  const scale = lerp(1, 2.6, z);
  // мимика и взгляд
  const up = easeInOut(prog(t, w.lookUp, 0.45));
  const typing = t < w.lookUp;
  const pick = easeInOut(prog(t, w.phone, 0.55)); // рука к телефону
  const raise = easeInOut(prog(t, w.phone + 0.55, 0.5)); // телефон к лицу
  const sigh = Math.max(0, 1 - Math.abs(t - (m01.to + 0.1)) / 0.25);
  const jitter = typing ? Math.sin(t * 19) * 5 : 0;
  const armR = pick > 0 ? { a: lerp(lerp(48, 62, pick), 60, raise), e: lerp(lerp(38, 22, pick), 110, raise) } : { a: 48, e: 38 + jitter };
  const armL = { a: keys(t, [[w.lookUp, 44], [w.lookUp + 0.4, 30]]), e: (typing ? 36 - jitter : 30) };
  const lookX = pick > 0.3 ? 0.9 : lerp(0.7, -0.2, up);
  const lookY = pick > 0.3 ? lerp(0.6, 0.2, raise) : lerp(0.7, -1, up);
  const worry = lerp(0.1, 1, easeOut(prog(t, w.lookUp + 0.2, 0.5)));
  const bubble = easeOut(prog(t, w.think, 0.35)) * (1 - easeOut(prog(t, m01.to + 0.7, 0.35)));
  // слова мысли подсвечиваются по фактической речи
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeIn, overflow: "hidden", fontFamily }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: `${PHONE.x + 40}px ${PHONE.y - 260}px` }}>
        {/* стена, окно с видом на горы */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#EEF3FA" }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <rect x={720} y={1010} width={300} height={360} rx={18} fill="#CFE4FA" stroke="#C3CFDF" strokeWidth={10} />
          <g clipPath="url(#bg3-win)">
            <Mountains w={300} y={1300} x={790} />
          </g>
          <defs>
            <clipPath id="bg3-win">
              <rect x={725} y={1015} width={290} height={350} rx={14} />
            </clipPath>
          </defs>
          <rect x={865} y={1010} width={10} height={360} fill="#C3CFDF" />
        </svg>
        {/* планер недели */}
        <div style={{ position: "absolute", left: 60, top: 230, width: 960, padding: "28px 30px", boxSizing: "border-box", borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 14px 40px rgba(20,40,75,0.14)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: YELLOW }} />
            <div style={{ fontSize: 40, fontWeight: 1000, color: NAVY }}>
              {BG3_TEXT.lunch} • {BG3_TEXT.from}–{BG3_TEXT.to}
            </div>
          </div>
          {BG3_TEXT.days.slice(0, 3).map((d, i) => (
            <Row key={d} t={t} at={w.rows[i]} label={d} />
          ))}
          {BG3_TEXT.days.slice(3).map((d, i) => (
            <Row key={d} t={t} at={w.more + i * 0.25} label={d} ghost />
          ))}
          <div
            style={{
              marginTop: 10,
              alignSelf: "center",
              textAlign: "center",
              fontSize: 42,
              fontWeight: 1000,
              color: NAVY,
              opacity: easeOut(prog(t, w.more + 0.6, 0.4)),
            }}
          >
            <span style={{ padding: "6px 22px", borderRadius: 20, backgroundColor: YELLOW_SOFT }}>{BG3_TEXT.everyDay}</span>
          </div>
        </div>
        {/* мама за столом */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${MOM.x} ${FEET}) scale(${MOM.s})`}>
            <Figure
              look={LOOKS.mom}
              t={t}
              blinkSeed={2}
              legs={false}
              armL={armL}
              armR={armR}
              lookX={lookX}
              lookY={lookY}
              worry={worry}
              mouth={up > 0.5 && pick < 0.5 ? "worry" : "neutral"}
              headTilt={lerp(4, -6, up) * (1 - raise) + raise * 6}
              lean={lerp(3, -2, up)}
              eyesClosed={sigh}
              phone={pick > 0.55}
            />
          </g>
          {/* стол, ноутбук, телефон */}
          <rect x={0} y={DESK_Y} width={1080} height={420} fill="#D9B98F" />
          <rect x={0} y={DESK_Y} width={1080} height={18} fill="#C7A276" />
          <g transform={`translate(${MOM.x + 70} ${DESK_Y})`}>
            <path d="M 0 0 L 230 0 L 250 -14 L -20 -14 Z" fill="#8792A6" />
            <path d="M 14 -14 L 30 -170 L 250 -170 L 236 -14 Z" fill="#AEB8C9" stroke="#8792A6" strokeWidth={4} />
            <circle cx={132} cy={-92} r={14} fill="#FFFFFF" opacity={0.7} />
          </g>
          {pick < 0.55 ? (
            <g transform={`translate(${PHONE.x} ${PHONE.y})`}>
              <rect x={-40} y={-10} width={80} height={22} rx={8} fill="#1F2A3F" />
            </g>
          ) : null}
        </svg>
        {/* облачко мысли */}
        {bubble > 0 ? (
          <div style={{ position: "absolute", left: 520, top: 990, width: 500, opacity: bubble, transform: `scale(${0.85 + 0.15 * bubble})`, transformOrigin: "0% 100%" }}>
            <div style={{ padding: "22px 28px", borderRadius: 40, backgroundColor: "#FFFFFF", boxShadow: "0 10px 30px rgba(20,40,75,0.18)", fontSize: 40, fontWeight: 900, color: NAVY, lineHeight: 1.22, fontStyle: "italic" }}>
              {m01.words.map((wd, i) => (
                <span key={i} style={{ opacity: t >= wd.start - 0.05 ? 1 : 0.35 }}>
                  {wd.text}
                  {i < m01.words.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
            <div style={{ position: "absolute", left: 30, bottom: -34, width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF" }} />
            <div style={{ position: "absolute", left: 8, bottom: -62, width: 18, height: 18, borderRadius: 9, backgroundColor: "#FFFFFF" }} />
          </div>
        ) : null}
      </div>
      {/* переход в экран телефона */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", opacity: easeInOut(prog(t, w.zoom + 0.35, 0.35)) }} />
    </div>
  );
};
