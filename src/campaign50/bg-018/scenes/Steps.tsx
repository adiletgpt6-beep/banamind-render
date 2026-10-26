// Сцена 5: как это работает — три шага появляются точно на словах диктора.
// 1) подбор подходящей группы (3–4 ребёнка, первоначальный поиск до двух
// недель — без обещания старта завтра); 2) первая полная пробная поездка
// ҮЙ → МЕКТЕП → ҮЙ бесплатно — после формирования группы (дети пристёгнуты
// в белой машине); 3) информация родителям в WhatsApp-группе: водитель
// пишет сам (пример сообщения, не автоматическое уведомление).
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { abs, C, clamp, font, pop, SoftBackdrop, WaIcon } from "../ui";

// Белая машина сбоку: в окне трое детей, у каждого ремень через плечо.
const BeltedCar: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f / 5) * 1.5;
  return (
    <svg width={330} height={170} viewBox="-170 -150 340 175">
      <ellipse cx={0} cy={18} rx={150} ry={9} fill="rgba(20,25,40,0.18)" />
      <g transform={`translate(0 ${bob})`}>
        <path d="M -155 -10 Q -158 -52 -128 -58 L -86 -64 Q -60 -112 -6 -114 L 50 -112 Q 92 -108 116 -66 L 146 -60 Q 162 -54 160 -20 L 158 4 L -152 4 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -74 -66 Q -50 -102 -6 -103 L 48 -101 Q 82 -98 102 -66 Z" fill="#CFE2F2" stroke={C.navy} strokeWidth={4} />
        {/* дети на заднем ряду */}
        {[-38, 4, 46].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={-76} r={13} fill={["#E8B894", "#D9A27E", "#EDC4A2"][i]} />
            <path d={`M ${x - 14} -80 Q ${x} -96 ${x + 14} -80 Z`} fill={["#2E2422", "#3B2B24", "#221B19"][i]} />
            <path d={`M ${x - 15} -66 L ${x + 15} -66 L ${x + 15} -62 L ${x - 15} -62 Z`} fill={["#5C86D6", "#E07A5F", "#5BB98B"][i]} />
            {/* ремень безопасности */}
            <path d={`M ${x - 13} -64 L ${x + 9} -66`} stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        <path d="M -66 -66 L 102 -66" stroke={C.navy} strokeWidth={4} />
        {[-100, 104].map((wx) => (
          <g key={wx} transform={`translate(${wx} 4) rotate(${f * 9})`}>
            <circle r={24} fill="#23262E" />
            <circle r={11} fill="#B8BEC8" />
            <rect x={-2} y={-11} width={4} height={22} fill="#8C929C" />
          </g>
        ))}
      </g>
    </svg>
  );
};

const Step: React.FC<{ n: number; p: number; title: string; sub: string; children?: React.ReactNode; active: number }> = ({ n, p, title, sub, children, active }) => (
  <div
    style={{
      opacity: Math.min(1, p * 1.4),
      transform: `translateX(${(1 - p) * 120}px)`,
      display: "flex",
      gap: 26,
      alignItems: "center",
      padding: "36px 32px",
      borderRadius: 34,
      background: C.white,
      boxShadow: `0 12px 30px rgba(22,52,107,${0.08 + 0.08 * active})`,
      outline: `5px solid rgba(255,199,44,${active})`,
    }}
  >
    <div style={{ width: 84, height: 84, borderRadius: 84, background: C.yellow, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...font(48, 1000, C.navy) }}>{n}</div>
    <div style={{ flex: 1 }}>
      <div style={font(50, 1000, C.navy)}>{title}</div>
      <div style={{ ...font(34, 700, C.grey), marginTop: 8 }}>{sub}</div>
    </div>
    {children}
  </div>
);

export const StepsScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = useLine("n04a");
  const b = useLine("n04b");
  const c = useLine("n04c");
  const pa = pop(f, a.from - 4, 15);
  const pb = pop(f, b.from - 4, 15);
  const pc = pop(f, c.from - 4, 15);
  const act = (from: number, next: number) => interpolate(f, [from, from + 8, next - 4, next + 4], [0, 1, 1, 0], clamp);
  const msgP = pop(f, c.from + 30, 14);
  return (
    <>
      <SoftBackdrop f={f} tint="#FFFFFF" />
      <div style={abs({ left: 60, right: 60, top: 130, display: "flex", alignItems: "center", gap: 24 })}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 150, height: 150 }} />
        <div>
          <div style={font(52, 1000, C.navy)}>Кантип иштейт?</div>
          <div style={font(34, 800, "#B98400")}>Бишкек · ҮЙ → МЕКТЕП → ҮЙ</div>
        </div>
      </div>
      <div style={abs({ left: 50, right: 50, top: 360, display: "flex", flexDirection: "column", gap: 46 })}>
        <Step n={1} p={pa} active={act(a.from, b.from)} title="Ылайыктуу топ түзүлөт" sub="3–4 бала · алгачкы издөө 2 жумага чейин" />
        <Step n={2} p={pb} active={act(b.from, c.from)} title="Биринчи толук сыноо сапары — акысыз" sub="ҮЙ → МЕКТЕП → ҮЙ · топ түзүлгөндөн кийин">
          <div style={{ flex: "none", marginRight: -10 }}>
            <BeltedCar f={f} />
          </div>
        </Step>
        <Step n={3} p={pc} active={act(c.from, c.to + 40)} title="Маалымат WhatsApp тобунда" sub="Ата-энелер тобу · айдоочу өзү жазат">
          <WaIcon size={92} />
        </Step>
        {/* пример сообщения водителя */}
        <div style={{ display: "flex", justifyContent: "flex-end", opacity: Math.min(1, msgP * 1.4), transform: `scale(${0.85 + 0.15 * msgP})`, transformOrigin: "100% 0" }}>
          <div style={{ maxWidth: 760, padding: "18px 26px", borderRadius: 28, borderTopRightRadius: 8, background: "#E7F8EC", boxShadow: "0 8px 20px rgba(22,52,107,0.1)" }}>
            <div style={font(26, 900, C.green)}>Айдоочу · мисал</div>
            <div style={font(40, 700, C.ink)}>Балдар машинада, жолго чыктык.</div>
          </div>
        </div>
      </div>
    </>
  );
};
