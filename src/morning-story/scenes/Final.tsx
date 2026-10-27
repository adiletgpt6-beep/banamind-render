import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SAFE } from "../../config";
import { fontFamily } from "../../fonts";
import { Logo } from "../../components/Logo";
import { pop } from "../../components/anim";
import { WhatsAppIcon } from "../../founder-story/icons";
import { MorningIcon } from "../../morning-rush/icons";
import { ARM, Character } from "../Character";
import { Office, Skyline } from "../sets";
import { ClockFace, INK, Phone, Sedan } from "../props";
import { CallScreen, FormCard } from "../screens";
import { MS_TEXT } from "../script";
import { useLineCue, useMouth, useSceneLength, useWordCue } from "../StoryContext";
import { Chip, keys, Panel, ramp } from "../ui";
import { FEED_PHONE } from "./Office";

const T = MS_TEXT.cta;
// Логотип финала: одинаковое место в сценах 12 и 13 (без скачка).
const LOGO = { size: 220, top: SAFE.top } as const;
// Колонка текста в безопасной зоне Reels (справа шире — кнопки соцсети).
const COL = { left: SAFE.left, right: SAFE.right } as const;

// Крупный план в панели звонка.
const CallCloseUp: React.FC<{
  kind: "mom" | "rep";
  mouth: number;
  expr: "calm" | "smile" | "neutral" | "worried";
  w: number;
  h: number;
}> = ({ kind, mouth, expr, w, h }) => {
  const H = 1500;
  return (
    <div style={{ position: "absolute", left: w / 2 - 0.2 * H, top: h * 0.46 - 0.158 * H }}>
      <Character kind={kind} height={H} expr={expr} mouth={mouth} look={kind === "mom" ? 0.3 : -0.3} armL={kind === "mom" ? ARM.phoneEar : ARM.down} itemL={kind === "mom" ? "phone" : "none"} seed={kind === "mom" ? 22 : 23} />
    </div>
  );
};

// ---------- Сцена 11: BalaGo менен байланыш ----------
export const CallScene: React.FC = () => {
  const t = useCurrentFrame();
  const m11 = useLineCue("s11Call", "m11");
  const g01 = useLineCue("s11Call", "g01");
  const m12 = useLineCue("s11Call", "m12");
  const g02 = useLineCue("s11Call", "g02");
  const noteAt = useWordCue("s11Call", "g02", "байланышабыз");
  const mouthMom = useMouth("s11Call", "mother");
  const mouthRep = useMouth("s11Call", "balago");
  const { fps } = useVideoConfig();
  const shrink = ramp(t, 12, 28);
  const panels = ramp(t, 14, 32);
  const formIn = ramp(t, m12.end + 2, m12.end + 18);
  const fill = ramp(t, g02.start, g02.start + 50);
  const note = ramp(t, noteAt - 4, noteAt + 8);
  const pw = FEED_PHONE.w * (1 - shrink) + 10;
  const speakMom = (t >= m11.start - 2 && t <= m11.end + 2) || (t >= m12.start - 2 && t <= m12.end + 2);
  const speakRep = (t >= g01.start - 2 && t <= g01.end + 2) || (t >= g02.start - 2 && t <= g02.end + 2);
  const secs = Math.max(0, Math.floor((t - 34) / fps));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.yellowSoft }}>
      <div style={{ position: "absolute", inset: 0 }}>
        {/* мама (офис) */}
        <Panel x={90} y={300 - (1 - panels) * 900} w={900} h={600} bg="#E6EAF0" style={{ borderColor: speakMom ? COLORS.yellow : "#FFFFFF" }}>
          <div style={{ position: "absolute", left: 520, top: 30, width: 330, height: 260, borderRadius: 12, overflow: "hidden", border: "10px solid #FFFFFF" }}>
            <Skyline width={330} height={260} light={1} sunY={60} />
          </div>
          <CallCloseUp kind="mom" mouth={mouthMom} expr={t < g01.end ? "neutral" : "smile"} w={560} h={600} />
        </Panel>
        {/* представитель BalaGo (фирменная палитра) */}
        <Panel x={90} y={990 + (1 - panels) * 1000} w={900} h={540} bg="#FFFFFF" style={{ borderColor: speakRep ? COLORS.yellow : "#FFFFFF" }}>
          <div style={{ position: "absolute", left: 0, top: 380, width: 900, height: 160, backgroundColor: COLORS.yellowSoft }} />
          <div style={{ position: "absolute", left: 600, top: 60 }}>
            <Logo size={200} />
          </div>
          <CallCloseUp kind="rep" mouth={mouthRep} expr="smile" w={520} h={540} />
        </Panel>
        {/* звонок: таймер между панелями */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 902, display: "flex", justifyContent: "center", opacity: panels }}>
          <Chip size={44}>
            <span style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#4CC27A" }} />
            {MS_TEXT.call.balago} · 00:{String(secs).padStart(2, "0")}
          </Chip>
        </div>
        {/* предварительная запись: маршрут и время */}
        {formIn > 0 ? (
          <div style={{ position: "absolute", left: 160, top: 340 + (1 - formIn) * -800 }}>
            <FormCard fill={fill} note={note} />
          </div>
        ) : null}
      </div>
      {/* экран звонка в начале сцены → сворачивается в таймер */}
      {shrink < 1 ? (
        <Phone w={pw} style={{ left: FEED_PHONE.cx - pw / 2, top: FEED_PHONE.cy - (pw * 2.05) / 2 + (945 - FEED_PHONE.cy) * shrink, opacity: 1 - ramp(t, 20, 28) }}>
          <CallScreen name={MS_TEXT.call.balago} status={MS_TEXT.app.calling} brand ring={(t % 30) / 30} />
        </Phone>
      ) : null}
    </AbsoluteFill>
  );
};

// Бренд-слой: дом, школа, маршрут и белый седан BalaGo (стоит у дома).
const ROUTE = "M 230 1000 C 340 820, 700 820, 830 980";
const ROUTE_BACK = "M 830 1040 C 700 1170, 360 1170, 230 1060";

// ---------- Сцена 12: эмоционалдуу финал ----------
export const FinalScene: React.FC = () => {
  const t = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = useSceneLength("s12Final");
  const n06 = useLineCue("s12Final", "n06");
  const timeAt = useWordCue("s12Final", "n06", "убакыт");
  const roadAt = useWordCue("s12Final", "n06", "жол");
  const brandAt = useWordCue("s12Final", "n06", "BalaGo");
  const regAt = useWordCue("s12Final", "n06", "каттоо", 0);
  const wipeAt = Math.max(30, n06.start - 18);
  const wipe = ramp(t, wipeAt, wipeAt + 18);
  const push = keys(t, [[0, 1], [wipeAt, 1.12]]);
  const draw = ramp(t, roadAt - 4, roadAt + 26);
  const back = ramp(t, roadAt + 20, roadAt + 46);
  const away = ramp(t, len - 14, len);
  const logoP = pop(t, fps, brandAt - 2);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#FFFFFF" }}>
      {/* мама вечером у окна: спокойно опускает телефон */}
      {wipe < 1 ? (
        <AbsoluteFill style={{ scale: `${push}`, transformOrigin: "40% 45%" }}>
          <Office clockMinutes={18 * 60 + 10} />
          <div style={{ position: "absolute", left: 120, top: 330, width: 560, height: 520, overflow: "hidden", borderRadius: 16, border: "16px solid #FFFFFF", boxSizing: "border-box" }}>
            <Skyline width={560} height={520} light={1} evening={1} sunY={420} />
          </div>
          <AbsoluteFill style={{ backgroundColor: "rgba(255,170,90,0.12)" }} />
          <div style={{ position: "absolute", left: 560 - 0.2 * 1600, top: 900 - 0.158 * 1600 }}>
            <Character kind="mom" height={1600} expr="calm" armL={ARM.phoneLook} itemL={t < 20 ? "phone" : "none"} armR={ARM.down} headTilt={-4} seed={24} />
          </div>
        </AbsoluteFill>
      ) : null}
      {/* белый круг раскрывается в фирменный экран */}
      {wipe > 0 ? (
        <div style={{ position: "absolute", left: 540 - 1200 * wipe, top: 960 - 1200 * wipe, width: 2400 * wipe, height: 2400 * wipe, borderRadius: "50%", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 1200 * wipe - 540, top: 1200 * wipe - 960, width: 1080, height: 1920 }}>
            <div style={{ position: "absolute", inset: 0, translate: `0px ${away * 900}px` }}>
              <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
                <path d={ROUTE} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
                <path d={ROUTE_BACK} stroke={COLORS.yellow} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - back} />
              </svg>
              {[
                { x: 230, kind: "home" as const },
                { x: 830, kind: "school" as const },
              ].map((p) => (
                <div key={p.kind} style={{ position: "absolute", left: p.x - 85, top: 935, width: 170, height: 170, borderRadius: 85, backgroundColor: p.kind === "school" ? COLORS.yellow : "#FFFFFF", border: `8px solid ${INK}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MorningIcon kind={p.kind} size={96} />
                </div>
              ))}
              {/* белый седан стоит у дома (без пассажиров) */}
              <div style={{ position: "absolute", left: 90, top: 1150 }}>
                <Sedan kind="polo" width={560} />
              </div>
              {/* «Ата-энеге — убакыт» */}
              <div style={{ position: "absolute", left: 445, top: 690, opacity: ramp(t, timeAt - 4, timeAt + 8), scale: `${0.8 + 0.2 * ramp(t, timeAt - 4, timeAt + 8)}` }}>
                <ClockFace size={190} minutes={7 * 60 + 30} />
              </div>
              <div style={{ position: "absolute", left: COL.left, right: COL.right, top: 1450, display: "flex", justifyContent: "center", opacity: ramp(t, regAt - 4, regAt + 8) }}>
                <Chip size={44}>{T.status}</Chip>
              </div>
            </div>
            {/* логотип — сразу на месте финального экрана */}
            <div style={{ position: "absolute", left: COL.left, right: COL.right, top: LOGO.top, display: "flex", flexDirection: "column", alignItems: "center", opacity: ramp(t, brandAt - 4, brandAt + 4), scale: `${0.7 + 0.3 * logoP}` }}>
              <Logo size={LOGO.size} />
              <div style={{ marginTop: 14, fontFamily, fontWeight: 900, fontSize: 92, color: INK, lineHeight: 1 }}>{T.brand}</div>
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- Сцена 13: финальный экран (спокойный, номер неподвижен) ----------
export const CtaScene: React.FC = () => {
  const t = useCurrentFrame();
  // все элементы проявляются за первые 12 кадров (только прозрачность),
  // дальше экран полностью статичен
  const show = (k: number) => ramp(t, k * 2, k * 2 + 10);
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily, color: INK }}>
      <div style={{ position: "absolute", left: COL.left, right: COL.right, top: LOGO.top, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Logo size={LOGO.size} />
        <div style={{ marginTop: 14, fontWeight: 900, fontSize: 92, lineHeight: 1 }}>{T.brand}</div>
        <div style={{ marginTop: 18, fontWeight: 800, fontSize: 56, color: COLORS.navySoft, opacity: show(1) }}>{T.tagline}</div>
        <div style={{ marginTop: 22, fontWeight: 900, fontSize: 52, letterSpacing: 1, opacity: show(2) }}>
          <span style={{ backgroundImage: `linear-gradient(${COLORS.yellow}, ${COLORS.yellow})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 34%", backgroundPosition: "0 88%" }}>{T.route}</span>
        </div>
        <div style={{ marginTop: 26, opacity: show(3) }}>
          <Chip size={40}>{T.status}</Chip>
        </div>
        <div style={{ marginTop: 34, width: 700, padding: "26px 0", borderRadius: 999, backgroundColor: COLORS.yellow, fontWeight: 900, fontSize: 62, boxShadow: "0 20px 46px rgba(255,180,0,0.42)", opacity: show(4) }}>
          {T.button}
        </div>
        <div style={{ marginTop: 34, width: 830, padding: "22px 0 26px", borderRadius: 36, border: "6px solid #25D366", backgroundColor: "#FFFFFF", boxShadow: "0 18px 40px rgba(20,40,90,0.14)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, boxSizing: "border-box", opacity: show(5) }}>
          <WhatsAppIcon size={72} />
          <span style={{ fontWeight: 900, fontSize: 88, fontVariantNumeric: "tabular-nums", lineHeight: 1.05, whiteSpace: "nowrap" }}>{T.phone}</span>
        </div>
        <div style={{ marginTop: 26, fontWeight: 800, fontSize: 46, color: COLORS.navySoft, opacity: show(6) }}>{T.link}</div>
      </div>
    </AbsoluteFill>
  );
};
