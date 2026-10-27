// План 3 (8,93–14,30 с): «Андан кийин кайра жумушка же өзүңүздүн ишиңизге
// кайтып, кайра ошол эле темпке кириш керек».
//   • «кайра жумушка» — разворот МЕКТЕП ⟲ ЖУМУШ, на «жумушка» накопившиеся
//     рабочие уведомления выскакивают одно за другим;
//   • «темпке … кириш керек» — шкала темпа: упала, пока вас не было,
//     и снова поднимается на «кириш керек».
import { fontFamily } from "../../fonts";
import { BriefcaseIcon, CalendarIcon, MailIcon, PhoneIcon, SchoolIcon } from "../../live/icons";
import { KineticTitle } from "../../live/KineticTitle";
import { easeInOut, easeOut, mix, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { Chip, GlassPanel } from "../../live/ui";
import { CUE, LIVE04 } from "../cues";

const BAND_TOP = 1050;

// Разворот: школа → дугообразная стрелка → работа.
const UTurn: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => {
  const draw = ramp(t, CUE.kayra1, CUE.zhumushka - CUE.kayra1 + 0.15, easeInOut);
  const school = springy(t, CUE.andan, 0.5);
  const work = springy(t, CUE.zhumushka, 0.5);
  const e = ramp(t, out, 0.3);
  if (t < CUE.andan - 0.05 || e >= 1) return null;
  const path = "M 210 150 C 210 20, 520 20, 520 150";
  return (
    <div style={{ position: "absolute", left: 40, top: BAND_TOP, width: 660, height: 300, opacity: 1 - e }}>
      <svg width={660} height={300} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={path} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={10} strokeDasharray="3 18" strokeLinecap="round" />
        <path d={path} fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        {draw > 0.96 ? <path d="M 500 120 L 520 156 L 545 124" fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      <div style={{ position: "absolute", left: 210 - 85, top: 150 - 20, width: 170, height: 170, borderRadius: 44, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + 0.6 * school})`, opacity: Math.min(1, school * 2), boxShadow: "0 20px 50px rgba(6,14,38,0.4)" }}>
        <SchoolIcon size={104} />
      </div>
      <div style={{ position: "absolute", left: 520 - 85, top: 150 - 20, width: 170, height: 170, borderRadius: 44, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + 0.6 * work})`, opacity: Math.min(1, work * 2), boxShadow: "0 20px 60px rgba(255,201,14,0.45)" }}>
        <BriefcaseIcon size={104} accent={C.white} />
      </div>
    </div>
  );
};

// Рабочие уведомления, накопившиеся, пока вы были в пути.
const Notifications: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => {
  const items = [
    { icon: <CalendarIcon size={46} />, text: "Жыйын", sub: "башталды", at: CUE.zhumushka + 0.05 },
    { icon: <MailIcon size={46} />, text: "4 жаңы кат", sub: "жооп күтөт", at: CUE.zhumushka + 0.32 },
    { icon: <PhoneIcon size={42} />, text: "Кайра чалуу", sub: "2 жолу", at: CUE.zhumushka + 0.58 },
  ];
  return (
    <div style={{ position: "absolute", left: 640, top: BAND_TOP - 10, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
      {items.map((it, i) => {
        const wob = t > it.at ? Math.sin((t - it.at) * 9) * 3 * (1 - ramp(t, it.at + 0.6, 0.4)) : 0;
        return (
          <div key={i} style={{ transform: `translateX(${wob}px)` }}>
            <Chip t={t} at={it.at} out={out + i * 0.05} icon={it.icon} text={it.text} sub={it.sub} size={34} from="left" />
          </div>
        );
      })}
    </div>
  );
};

// Шкала темпа (полукруглый индикатор).
const TempoGauge: React.FC<{ readonly t: number; readonly at: number; readonly out: number }> = ({ t, at, out }) => {
  // 100% → провал до 25% сразу при появлении → снова 100% на «кириш керек»
  const drop = ramp(t, at + 0.15, 0.5, easeOut);
  const rise = ramp(t, CUE.kirish, CUE.kerek1End - CUE.kirish + 0.2, easeInOut);
  const v = mix(mix(1, 0.25, drop), 1, rise);
  const ang = -90 + v * 180;
  const col = v < 0.5 ? C.red : v < 0.85 ? C.yellowDeep : C.yellow;
  const R = 190;
  const arc = (from: number, to: number) => {
    const p = (deg: number) => {
      const r = ((deg - 90) * Math.PI) / 180;
      return `${Math.cos(r) * R} ${Math.sin(r) * R}`;
    };
    return `M ${p(from)} A ${R} ${R} 0 0 1 ${p(to)}`;
  };
  return (
    <GlassPanel t={t} at={at} out={out} left={190} top={BAND_TOP + 10} width={700} height={300}>
      <svg width={700} height={300} viewBox="-350 -205 700 300" style={{ position: "absolute", inset: 0 }}>
        <path d={arc(-90, 90)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={34} strokeLinecap="round" />
        <path d={arc(-90, -90 + 180 * v)} fill="none" stroke={col} strokeWidth={34} strokeLinecap="round" />
        {Array.from({ length: 11 }, (_, i) => {
          const r = ((-90 + i * 18 - 90) * Math.PI) / 180;
          return <line key={i} x1={Math.cos(r) * (R - 40)} y1={Math.sin(r) * (R - 40)} x2={Math.cos(r) * (R - 54)} y2={Math.sin(r) * (R - 54)} stroke="rgba(255,255,255,0.45)" strokeWidth={4} strokeLinecap="round" />;
        })}
        <line x1={0} y1={0} x2={0} y2={-(R - 62)} stroke={C.white} strokeWidth={9} strokeLinecap="round" transform={`rotate(${ang})`} />
        <circle r={18} fill={C.white} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily, fontWeight: 900, color: C.white, fontSize: 44, letterSpacing: 2 }}>
        ТЕМП <span style={{ color: col, fontVariantNumeric: "tabular-nums" }}>{Math.round(v * 100)}%</span>
      </div>
    </GlassPanel>
  );
};

export const Return: React.FC = () => {
  const t = useT();
  const [from, to] = [LIVE04.cuts[1], LIVE04.cuts[2]];
  if (t < from - 0.05 || t > to + 0.3) return null;
  const notifOut = CUE.kayra2 - 0.35;
  return (
    <>
      <KineticTitle
        y={870}
        size={96}
        out={CUE.zhe1 - 0.05}
        lines={[
          [
            { text: "Андан кийин", at: CUE.andan },
          ],
          [
            { text: "кайра", at: CUE.kayra1 },
            { text: "жумушка", at: CUE.zhumushka, accent: "yellow" },
          ],
        ]}
      />
      <KineticTitle
        y={870}
        size={88}
        out={CUE.kayra2 - 0.25}
        lines={[[{ text: "же өзүңүздүн", at: CUE.zhe1 }], [{ text: "ишиңизге", at: CUE.ishinizge, accent: "navy" }]]}
      />
      <KineticTitle
        y={870}
        size={92}
        out={to - 0.3}
        lines={[
          [
            { text: "кайра", at: CUE.kayra2 },
            { text: "ошол эле", at: CUE.oshol },
          ],
          [{ text: "темпке", at: CUE.tempke, accent: "yellow" }],
        ]}
      />
      <UTurn t={t} out={notifOut} />
      <Notifications t={t} out={notifOut} />
      <TempoGauge t={t} at={CUE.kayra2} out={to - 0.2} />
      {/* лёгкое «ускорение» кадра на подъёме темпа */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${160 * ramp(t, CUE.kirish, 0.3) * (1 - ramp(t, to - 0.3, 0.3))}px rgba(255,201,14,0.35)`,
        }}
      />
    </>
  );
};
