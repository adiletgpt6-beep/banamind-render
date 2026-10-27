// Сцены 3–5: три физических конверта на столе (вид сверху). Каждый
// открывается (клапан, лист выезжает и разворачивается в карточку).
//   3. «Топ»: подбор по дареку, мектебу и убакыту; подходящие дети
//      собираются в группу (3 места + свободное), неподходящие — в сторону.
//      Штамп «Азыр төлөм жок», календарь «Эртең?» без даты старта.
//   4. «Сыноо»: условный полный день ҮЙ → МЕКТЕП → ҮЙ (утром и после
//      уроков), ребёнок пристёгнут; «Биринчи сыноо акысыз».
//   5. «Чечим»: «Улантам» / «Улантпайм»; только после выбора «Улантам» —
//      цепочка Чечим → Топтом → Төлөм и банковская карта.
import { fontFamily } from "../../../fonts";
import { BellIcon, CarSide, CheckIcon, CrossIcon, easeInOut, easeOut, GREEN, House, NAVY, NAVY_SOFT, popScale, prog, School, SunIcon, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg37Beats } from "../beats";
import { BankCard, EnvelopeTop } from "../props";
import { BG37_TEXT } from "../script";
import { DeskBg, KidToken, SampleTag, Sheet, Stamp, StepTitle } from "./Desk";

const SHEET_TOP = 430;
const SHEET_H = 960;

// Конверт: открывается в центре, затем уменьшается в угол (бейдж шага).
const EnvelopeIntro: React.FC<{ readonly t: number; readonly at: number; readonly label: string; readonly num: string }> = ({ t, at, label, num }) => {
  const open = easeInOut(prog(t, at + 0.15, 0.45));
  const sheet = easeOut(prog(t, at + 0.45, 0.4));
  const move = easeInOut(prog(t, at + 0.85, 0.55));
  const x = 540 + (165 - 540) * move;
  const y = 860 + (345 - 860) * move;
  const w = 640 + (210 - 640) * move;
  const enter = easeOut(prog(t, at - 0.25, 0.35));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}>
      <EnvelopeTop x={x} y={y} w={w} label={label} num={num} open={open} sheet={sheet * (1 - move)} />
    </div>
  );
};

const Criteria: React.FC<{ readonly t: number; readonly at: number; readonly label: string; readonly icon: React.ReactNode; readonly ok: number }> = ({ t, at, label, icon, ok }) => {
  const u = prog(t, at, 0.35);
  return (
    <div
      style={{
        width: 268,
        height: 196,
        borderRadius: 26,
        backgroundColor: ok > 0.5 ? "#EAF7EE" : "#F3F6FB",
        border: `5px solid ${ok > 0.5 ? GREEN : "#DCE3EE"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transform: `scale(${popScale(u)})`,
        opacity: Math.min(1, u * 3),
        position: "relative",
      }}
    >
      {icon}
      <div style={{ fontSize: 44, fontWeight: 1000, color: NAVY }}>{label}</div>
      {ok > 0 ? (
        <div style={{ position: "absolute", right: -12, top: -14, width: 56, height: 56, borderRadius: 28, backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${popScale(ok)})` }}>
          <CheckIcon size={36} color="#FFFFFF" />
        </div>
      ) : null}
    </div>
  );
};

const PinIcon = () => (
  <svg width={66} height={66} viewBox="0 0 24 24">
    <path d="M 12 22 Q 4.5 13.5 4.5 9.5 Q 4.5 2.5 12 2.5 Q 19.5 2.5 19.5 9.5 Q 19.5 13.5 12 22 Z" fill="#E86F5A" stroke={NAVY} strokeWidth={1.4} />
    <circle cx={12} cy={9.5} r={3} fill="#FFFFFF" stroke={NAVY} strokeWidth={1.2} />
  </svg>
);
const ClockIcon = () => (
  <svg width={66} height={66} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={9.5} fill="#FFFFFF" stroke={NAVY} strokeWidth={1.8} />
    <path d="M 12 6.5 L 12 12 L 15.8 14" stroke={NAVY} strokeWidth={1.9} strokeLinecap="round" fill="none" />
  </svg>
);
const SchoolIcon = () => (
  <svg width={80} height={66} viewBox="-70 -128 140 132">
    <School />
  </svg>
);

// ---------- 3. «Топ» ----------
const KIDS = [
  { c: "#7FB7E8", hair: "#2A201D", ok: true },
  { c: "#F2A65A", hair: "#3B2B24", ok: false },
  { c: "#9DD49A", hair: "#221B19", ok: true },
  { c: "#C9A7EB", hair: "#2A1F1C", ok: false },
  { c: "#F7D46B", hair: "#3A2C26", ok: true },
  { c: "#F59AA8", hair: "#2A201D", ok: false },
];

export const GroupScene: React.FC<{ readonly t: number; readonly b: Bg37Beats }> = ({ t, b }) => {
  const g = b.group;
  const T = BG37_TEXT.group;
  const sheetU = prog(t, g.open + 0.85, 0.55);
  const m = easeInOut(prog(t, g.match + 0.2, 0.9));
  const okCrit = prog(t, g.match, 0.4);
  // позиции детей: россыпь → группа (слева) / в сторону (справа, бледнее)
  let okI = 0;
  let noI = 0;
  const kids = KIDS.map((k, i) => {
    const sx = 120 + (i % 3) * 270 + (i > 2 ? 120 : 0);
    const sy = 300 + (i > 2 ? 150 : 0);
    let tx: number;
    let ty: number;
    if (k.ok) {
      tx = 76 + okI * 128;
      ty = 330;
      okI++;
    } else {
      tx = 640 + (noI % 2) * 130 - (noI > 1 ? 65 : 0);
      ty = 300 + (noI > 1 ? 130 : 0);
      noI++;
    }
    const appear = prog(t, g.cards[0] + 0.1 + i * 0.12, 0.3);
    return { ...k, x: sx + (tx - sx) * m, y: sy + (ty - sy) * m, appear };
  });
  const groupFrame = easeOut(prog(t, g.team, 0.45));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily }}>
      <DeskBg t={t} drift={prog(t, g.from, g.to - g.from)} />
      <Sheet u={sheetU} top={SHEET_TOP} height={SHEET_H}>
        {/* три критерия подбора */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, display: "flex", justifyContent: "space-between" }}>
          <Criteria t={t} at={g.cards[0]} label={T.cards[0]} icon={<PinIcon />} ok={okCrit} />
          <Criteria t={t} at={g.cards[1]} label={T.cards[1]} icon={<SchoolIcon />} ok={okCrit} />
          <Criteria t={t} at={g.cards[2]} label={T.cards[2]} icon={<ClockIcon />} ok={okCrit} />
        </div>
        {/* группа: 3 ребёнка + свободное место */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 300,
            width: 540,
            height: 170,
            borderRadius: 30,
            border: `6px solid ${GREEN}`,
            backgroundColor: "#EAF7EE",
            opacity: groupFrame,
            transform: `scale(${0.9 + 0.1 * groupFrame})`,
          }}
        >
          <div style={{ position: "absolute", left: 30 + 3 * 128 + 6, top: 34, width: 96, height: 96, borderRadius: 48, border: "5px dashed #A9D8B4", boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: 20, top: -36, padding: "4px 18px", borderRadius: 16, backgroundColor: GREEN, color: "#FFFFFF", fontSize: 32, fontWeight: 1000 }}>{T.match}</div>
        </div>
        <div style={{ position: "absolute", left: 620, top: 270, width: 290, textAlign: "center", fontSize: 30, fontWeight: 900, color: "#8A94A8", opacity: m }}>{T.noMatch}</div>
        {kids.map((k, i) => (
          <div key={i} style={{ position: "absolute", left: k.x, top: k.y + (i === 0 ? 0 : 0), transform: `scale(${popScale(k.appear)})`, opacity: Math.min(1, k.appear * 3) }}>
            <KidToken color={k.c} hair={k.hair} size={k.ok ? 110 : 100} dim={k.ok ? 0 : m} />
          </div>
        ))}
        {/* «Азыр төлөм жок» и «Эртең?» */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 560, height: 340, borderRadius: 28, backgroundColor: "#F7F9FC" }} />
        <div style={{ position: "absolute", left: 80, top: 600, display: "flex", alignItems: "center", gap: 18, opacity: prog(t, g.apply, 0.3) }}>
          <div style={{ padding: "12px 22px", borderRadius: 18, backgroundColor: "#FFFFFF", border: "4px solid #DCE3EE", fontSize: 40, fontWeight: 1000, color: NAVY }}>{BG37_TEXT.hook.envApply}</div>
          <svg width={60} height={30} viewBox="0 0 22 12">
            <path d="M 2 6 L 20 6 M 15 1.5 L 20 6 L 15 10.5" fill="none" stroke={NAVY_SOFT} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <Stamp t={t} at={g.noPay} text={T.noPay} color="#1F8A4C" rot={-5} size={58} style={{ left: 70, top: 700 }} />
        {/* календарь без даты старта */}
        <div style={{ position: "absolute", left: 640, top: 600, width: 230, height: 250, borderRadius: 24, backgroundColor: "#FFFFFF", border: "5px solid #DCE3EE", overflow: "hidden", opacity: prog(t, g.tomorrow - 0.1, 0.3), transform: `scale(${popScale(prog(t, g.tomorrow - 0.1, 0.35))})` }}>
          <div style={{ height: 66, backgroundColor: "#E86F5A" }} />
          <div style={{ textAlign: "center", fontSize: 50, fontWeight: 1000, color: NAVY, marginTop: 38 }}>{T.tomorrow}</div>
          <div style={{ position: "absolute", left: 20, right: 20, top: 150, height: 8, borderRadius: 4, backgroundColor: "#E8463A", transform: `scaleX(${easeOut(prog(t, g.tomorrow + 0.45, 0.35))}) rotate(-8deg)`, transformOrigin: "0 50%" }} />
        </div>
      </Sheet>
      <EnvelopeIntro t={t} at={g.open} label={BG37_TEXT.rules.envelopes[0]} num="1" />
      <StepTitle t={t} at={g.open + 0.9} text={T.step} />
    </div>
  );
};

// ---------- 4. «Сыноо» ----------
// Ребёнок в машине пристёгнут (вставка-иллюминатор).
const BeltedKid: React.FC<{ readonly t: number; readonly size: number }> = ({ t, size }) => {
  const pass = (t * 220) % 600;
  return (
    <svg width={size} height={size} viewBox="0 0 300 300">
      <defs>
        <clipPath id="bg37-kid-clip">
          <circle cx={150} cy={150} r={144} />
        </clipPath>
      </defs>
      <g clipPath="url(#bg37-kid-clip)">
        <rect x={0} y={0} width={300} height={300} fill="#5C6472" />
        {/* боковое окно: улица проплывает */}
        <rect x={20} y={20} width={260} height={120} rx={26} fill="#CFE6F7" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={((i * 200 - pass) % 600) + 300 - 300} y={70} width={70} height={70} rx={6} fill="#E6D3C0" />
        ))}
        <rect x={20} y={20} width={260} height={120} rx={26} fill="none" stroke="#3E4553" strokeWidth={10} />
        {/* спинка сиденья */}
        <rect x={70} y={110} width={160} height={210} rx={40} fill="#3E4553" />
        {/* ребёнок */}
        <path d="M 92 300 L 96 220 Q 100 190 150 188 Q 200 190 204 220 L 208 300 Z" fill="#2F4A7A" />
        <path d="M 136 192 L 150 226 L 164 192 Z" fill="#FFFFFF" />
        <circle cx={150} cy={148} r={42} fill="#E8B48D" />
        <path d="M 108 142 Q 110 100 150 102 Q 190 100 192 142 Q 176 120 150 124 Q 124 120 108 142 Z" fill="#221B19" />
        <circle cx={136} cy={150} r={4.5} fill="#2A201D" />
        <circle cx={164} cy={150} r={4.5} fill="#2A201D" />
        <path d="M 138 166 Q 150 175 162 166" stroke="#9C4E44" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* ремень безопасности: от плеча через грудь к замку */}
        <path d="M 196 196 L 112 296" stroke="#2A2E36" strokeWidth={22} strokeLinecap="round" />
        <path d="M 196 196 L 112 296" stroke="#4A505C" strokeWidth={10} strokeLinecap="round" />
        <rect x={98} y={278} width={34} height={22} rx={5} fill="#C9CED6" />
      </g>
      <circle cx={150} cy={150} r={144} fill="none" stroke="#FFFFFF" strokeWidth={10} />
      <circle cx={150} cy={150} r={149} fill="none" stroke={YELLOW} strokeWidth={6} />
    </svg>
  );
};

export const TrialScene: React.FC<{ readonly t: number; readonly b: Bg37Beats }> = ({ t, b }) => {
  const s = b.trial;
  const T = BG37_TEXT.trial;
  const sheetU = prog(t, s.open + 0.85, 0.55);
  // машина: утром үй → мектеп, после уроков мектеп → үй
  const HX = 150;
  const SX = 760;
  const go = easeInOut(prog(t, s.morning, 2.0));
  const back = easeInOut(prog(t, s.afternoon, 2.0));
  const afternoon = t >= s.afternoon - 0.15;
  const carX = afternoon ? SX - (SX - HX) * back : HX + (SX - HX) * go;
  const bounce = Math.sin(t * 22) * 1.2 * (afternoon ? (back > 0 && back < 1 ? 1 : 0) : go > 0 && go < 1 ? 1 : 0);
  const teamU = prog(t, s.team, 0.35);
  const routeU = prog(t, s.open + 1.1, 0.4);
  const kidU = easeOut(prog(t, s.morning + 0.6, 0.45));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily }}>
      <DeskBg t={t} drift={prog(t, s.from, s.to - s.from)} />
      <Sheet u={sheetU} top={SHEET_TOP} height={SHEET_H}>
        {/* группа уже собрана */}
        <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 10, padding: "10px 20px 10px 14px", borderRadius: 40, backgroundColor: "#EAF7EE", border: `4px solid ${GREEN}`, opacity: teamU, transform: `scale(${popScale(teamU)})`, transformOrigin: "0 50%" }}>
          {[0, 1, 2].map((i) => (
            <KidToken key={i} color={["#7FB7E8", "#9DD49A", "#F7D46B"][i]} hair="#2A201D" size={58} />
          ))}
          <div style={{ fontSize: 38, fontWeight: 1000, color: "#1F6B3C", marginLeft: 6 }}>{BG37_TEXT.rules.envelopes[0]}</div>
          <CheckIcon size={40} color="#1F8A4C" />
        </div>
        {/* время суток */}
        <div style={{ position: "absolute", right: 40, top: 40, display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 30, backgroundColor: afternoon ? "#FFF1E3" : YELLOW_SOFT, opacity: routeU }}>
          {afternoon ? <BellIcon size={46} /> : <SunIcon size={46} />}
          <div style={{ fontSize: 38, fontWeight: 1000, color: NAVY }}>{afternoon ? T.afternoon : T.morning}</div>
        </div>
        {/* маршрут */}
        <svg width={940} height={420} viewBox="0 0 940 420" style={{ position: "absolute", left: 0, top: 120, opacity: routeU }}>
          <rect x={60} y={300} width={820} height={40} rx={20} fill="#D9E0EA" />
          <path d={`M ${HX} 320 L ${SX + 30} 320`} stroke="#FFFFFF" strokeWidth={6} strokeDasharray="26 22" />
          <g transform={`translate(${HX - 10} 296) scale(1.9)`}>
            <House glow={afternoon ? back : 1 - go} />
          </g>
          <g transform={`translate(${SX + 40} 296) scale(1.6)`}>
            <School glow={afternoon ? 1 - back : go} />
          </g>
          <text x={HX - 10} y={385} textAnchor="middle" fontSize={34} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
            {T.home}
          </text>
          <text x={SX + 40} y={385} textAnchor="middle" fontSize={34} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
            {T.school}
          </text>
        </svg>
        <div style={{ position: "absolute", left: carX - 120, top: 120 + 196, opacity: routeU }}>
          <CarSide width={240} wheelTurn={t * 400} flip={afternoon} bounce={bounce} />
        </div>
        {/* ребёнок пристёгнут */}
        <div style={{ position: "absolute", left: 50, top: 560, transform: `scale(${0.6 + 0.4 * kidU})`, opacity: kidU, transformOrigin: "50% 50%" }}>
          <BeltedKid t={t} size={340} />
        </div>
        <Stamp t={t} at={s.free} text={T.free} color="#1F8A4C" rot={-4} size={44} style={{ left: 330, top: 680 }} />
      </Sheet>
      <EnvelopeIntro t={t} at={s.open} label={BG37_TEXT.rules.envelopes[1]} num="2" />
      <StepTitle t={t} at={s.open + 0.9} text={T.step} />
      <SampleTag text={T.sample} opacity={prog(t, s.from, 0.3)} />
    </div>
  );
};

// ---------- 5. «Чечим» ----------
const Choice: React.FC<{ readonly label: string; readonly yes: boolean; readonly u: number; readonly picked: number; readonly other: number }> = ({ label, yes, u, picked, other }) => (
  <div
    style={{
      width: 400,
      height: 260,
      borderRadius: 34,
      backgroundColor: yes ? "#EAF7EE" : "#F3F6FB",
      border: `6px solid ${picked > 0.5 ? YELLOW : yes ? GREEN : "#C9D2E0"}`,
      boxShadow: picked > 0.5 ? `0 0 0 ${10 * picked}px rgba(255,201,40,0.5)` : "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      transform: `scale(${popScale(u) * (1 + 0.05 * picked)})`,
      opacity: Math.min(1, u * 3) * (1 - 0.4 * other),
    }}
  >
    <div style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: yes ? GREEN : "#C9D2E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {yes ? <CheckIcon size={64} color="#FFFFFF" /> : <CrossIcon size={56} color="#FFFFFF" />}
    </div>
    <div style={{ fontSize: 52, fontWeight: 1000, color: NAVY }}>{label}</div>
  </div>
);

const PackIcon = () => (
  <svg width={110} height={90} viewBox="0 0 110 90">
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${10 + i * 12} ${10 + i * 10})`}>
        <rect x={0} y={0} width={70} height={46} rx={8} fill={i === 2 ? YELLOW : "#FFFFFF"} stroke={NAVY} strokeWidth={3} />
        <circle cx={0} cy={23} r={7} fill={i === 2 ? "#F7F9FC" : "#F7F9FC"} />
        <circle cx={70} cy={23} r={7} fill="#F7F9FC" />
      </g>
    ))}
  </svg>
);

export const DecideScene: React.FC<{ readonly t: number; readonly b: Bg37Beats }> = ({ t, b }) => {
  const d = b.decide;
  const T = BG37_TEXT.decide;
  const sheetU = prog(t, d.open + 0.85, 0.55);
  const chU = prog(t, d.choices, 0.35);
  const picked = easeOut(prog(t, d.pick, 0.3));
  const tap = prog(t, d.pick - 0.35, 0.5);
  const node = (at: number) => prog(t, at, 0.35);
  const cardU = easeOut(prog(t, d.pay, 0.5));
  const nodes: { label: string; at: number; icon: React.ReactNode }[] = [
    { label: T.chain[0], at: d.chain, icon: <CheckIcon size={70} color="#1F8A4C" /> },
    { label: T.chain[1], at: d.pack, icon: <PackIcon /> },
    { label: T.chain[2], at: d.pay, icon: <div style={{ width: 110, height: 70 }} /> },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily }}>
      <DeskBg t={t} drift={prog(t, d.from, d.to - d.from)} />
      <Sheet u={sheetU} top={SHEET_TOP} height={SHEET_H}>
        <div style={{ position: "absolute", left: 50, right: 50, top: 50, display: "flex", justifyContent: "space-between" }}>
          <Choice label={T.yes} yes u={chU} picked={picked} other={0} />
          <Choice label={T.no} yes={false} u={prog(t, d.choices + 0.15, 0.35)} picked={0} other={picked} />
        </div>
        {/* касание пальцем: выбор родителя */}
        {tap > 0 && tap < 1 ? (
          <div style={{ position: "absolute", left: 250 - 70, top: 180 - 70, width: 140, height: 140, borderRadius: 70, border: `6px solid ${YELLOW}`, transform: `scale(${0.4 + 1.2 * tap})`, opacity: 1 - tap }} />
        ) : null}
        {/* цепочка: Чечим → Топтом → Төлөм */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 400, height: 470, borderRadius: 30, backgroundColor: "#F7F9FC" }} />
        <div style={{ position: "absolute", left: 40, right: 40, top: 470, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          {nodes.map((n, i) => {
            const u = node(n.at);
            return (
              <div key={n.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 230, height: 260, borderRadius: 30, backgroundColor: "#FFFFFF", border: `5px solid ${u > 0.5 ? (i === 2 ? YELLOW : GREEN) : "#DCE3EE"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.25 + 0.75 * u, transform: `scale(${0.9 + 0.1 * popScale(u)})` }}>
                  <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.icon}</div>
                  <div style={{ fontSize: 44, fontWeight: 1000, color: NAVY }}>{n.label}</div>
                </div>
                {i < 2 ? (
                  <svg width={60} height={36} viewBox="0 0 22 12" style={{ margin: "0 4px", opacity: node(nodes[i + 1].at) }}>
                    <path d="M 2 6 L 20 6 M 15 1.5 L 20 6 L 15 10.5" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
        {/* карта — только после решения «Улантам» */}
        {cardU > 0 ? (
          <div style={{ position: "absolute", left: 40 + 24 + 2 * (230 + 68) + 50, top: 470 + 40 + (1 - cardU) * 260, transform: `rotate(${-10 + 10 * cardU}deg)`, opacity: Math.min(1, cardU * 2) }}>
            <BankCard w={130} />
          </div>
        ) : null}
      </Sheet>
      <EnvelopeIntro t={t} at={d.open} label={BG37_TEXT.rules.envelopes[2]} num="3" />
      <StepTitle t={t} at={d.open + 0.9} text={T.step} />
    </div>
  );
};

