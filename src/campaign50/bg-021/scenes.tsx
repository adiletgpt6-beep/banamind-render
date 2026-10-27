// Сцены BalaGoBG021. Кадр внутри сцены отсчитывается от её начала;
// ключевые движения привязаны к фактическим словам диктора.
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSETS } from "../../config";
import { BG021_WHATSAPP } from "./script";
import { cueOf, sceneOf, type Bg021Timeline } from "./timing";
import {
  C,
  Car,
  Card,
  Chip,
  clamp,
  Cursor,
  DAYS,
  DayPill,
  DriverAvatar,
  ease,
  FONT,
  HomeGlyph,
  LinkGlyph,
  Pin,
  SeatedChild,
  usePop,
  WhatsAppGlyph,
} from "./parts";

type SceneProps = { readonly tl: Bg021Timeline };

const pointAt = (path: string, l: number) => getPointAtLength(path, l) ?? { x: 0, y: 0 };

// Кадр (от начала сцены), на котором начинается слово `i` реплики `id`.
const useWordFrame = (tl: Bg021Timeline, sceneId: Parameters<typeof sceneOf>[1]) => {
  const { fps } = useVideoConfig();
  const from = sceneOf(tl, sceneId).from;
  return (id: string, i: number, edge: "start" | "end" = "start") => {
    const words = cueOf(tl, id).words;
    const w = words[Math.max(0, Math.min(words.length - 1, i))];
    return Math.round(((edge === "start" ? w.start : w.end) - from) * fps);
  };
};

const Title: React.FC<{ readonly y: number; readonly children: React.ReactNode; readonly at: number; readonly size?: number }> = ({ y, children, at, size = 64 }) => {
  const p = usePop(at);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.08,
        color: C.ink,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};

// ---------- 1. Хук: две одинаковые машины, разные цели ----------
export const HookScene: React.FC<SceneProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const w = useWordFrame(tl, "hook");
  const laneA = usePop(0);
  const laneB = usePop(6);
  const drawA = ease(frame, 10, 40);
  const drawB = ease(frame, 16, 52);
  const dot = usePop(38, 9);
  const q = usePop(w("l1-hook", 6), 10);
  const pulse = 1 + 0.08 * Math.sin(frame / 5) * dot;
  return (
    <>
      <Card x={70} y={300} w={940} h={420} style={{ opacity: laneA, transform: `translateX(${(1 - laneA) * -80}px)` }}>
        <div style={{ position: "absolute", left: 44, top: 38 }}>
          <Chip tone="pale" size={44}>
            Бир жолку такси
          </Chip>
        </div>
        <svg width={940} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={210} y1={250} x2={210 + 520 * drawA} y2={250} stroke={C.ink} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" />
        </svg>
        <Car x={140} y={250} size={150} />
        <div
          style={{
            position: "absolute",
            left: 760 - 46,
            top: 250 - 46,
            width: 92,
            height: 92,
            borderRadius: "50%",
            background: C.yellow,
            transform: `scale(${dot * pulse})`,
            boxShadow: `0 0 0 ${18 * dot}px rgba(255,201,14,0.25)`,
          }}
        />
        <div style={{ position: "absolute", left: 640, width: 240, top: 318, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.muted, opacity: dot }}>
          бир сапар
        </div>
      </Card>
      <Card x={70} y={790} w={940} h={420} style={{ opacity: laneB, transform: `translateX(${(1 - laneB) * 80}px)` }}>
        <div style={{ position: "absolute", left: 44, top: 38 }}>
          <Chip tone="yellow" size={44}>
            Алдын ала уюшулган каттам
          </Chip>
        </div>
        <svg width={940} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={210} y1={250} x2={210 + 140 * drawB} y2={250} stroke={C.ink} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" />
        </svg>
        <Car x={140} y={250} size={150} />
        <div style={{ position: "absolute", left: 370, top: 250 - 55, display: "flex", gap: 14 }}>
          {DAYS.map((d, i) => (
            <DayPill key={d} label={d} on={ease(frame, 44 + i * 7, 54 + i * 7)} w={92} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 370, width: 520, top: 340, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.muted, opacity: ease(frame, 80, 95) }}>
          ар бир окуу күнү
        </div>
      </Card>
      {/* вопрос между схемами */}
      <div
        style={{
          position: "absolute",
          left: 540 - 62,
          top: 755 - 62,
          width: 124,
          height: 124,
          borderRadius: "50%",
          background: C.ink,
          color: C.yellow,
          fontFamily: FONT,
          fontWeight: 1000,
          fontSize: 86,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${q}) rotate(${(1 - q) * -40}deg)`,
          boxShadow: "0 16px 36px rgba(20,40,90,0.35)",
        }}
      >
        ?
      </div>
    </>
  );
};

// ---------- 2. Разовая поездка «сейчас» и повторяющийся путь в школу ----------
export const OneOffScene: React.FC<SceneProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const w = useWordFrame(tl, "oneoff");
  const tap = w("l2-oneoff", 6); // «чакырылат»
  const repeat = w("l2-oneoff", 11); // «күн»
  const inA = usePop(0);
  const inB = usePop(8);
  const press = interpolate(frame, [tap - 4, tap, tap + 6], [0, 1, 0], clamp);
  const drive = ease(frame, tap + 6, tap + 46);
  const done = usePop(tap + 46);
  // запись о поездке исчезает: поездка завершена, следующая — новый вызов
  const fade = interpolate(frame, [tap + 80, tap + 100], [1, 0], clamp);
  const empty = ease(frame, w("l2-oneoff", 7), w("l2-oneoff", 7) + 12);
  return (
    <>
      <Title y={262} at={0} size={44}>
        <span style={{ color: C.muted }}>Бир жолку такси —</span> учурдагы сапар үчүн
      </Title>
      <Card x={70} y={350} w={940} h={420} style={{ opacity: inA }}>
        {/* телефон с кнопкой вызова */}
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 50,
            width: 240,
            height: 320,
            borderRadius: 38,
            border: `8px solid ${C.ink}`,
            background: C.paleNavy,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <Chip tone="navy" size={34}>
            Азыр
          </Chip>
          <div
            style={{
              width: 170,
              height: 74,
              borderRadius: 24,
              background: C.yellow,
              transform: `scale(${1 - press * 0.12})`,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 30,
              color: C.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Чакыруу
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 420, opacity: fade }}>
          <svg width={940} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={360} y1={210} x2={790} y2={210} stroke={C.line} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" />
          </svg>
          <Car x={370 + 400 * drive} y={210} size={130} opacity={interpolate(frame, [tap - 2, tap + 4], [0.35, 1], clamp)} />
          <div style={{ position: "absolute", left: 800 - 40, top: 210 - 40, width: 80, height: 80, borderRadius: "50%", background: C.yellow, opacity: 0.9 }} />
          <div style={{ position: "absolute", left: 360, width: 520, top: 290, textAlign: "center", opacity: done }}>
            <Chip tone="green" size={34}>
              ✓ Сапар аяктады
            </Chip>
          </div>
        </div>
        <div style={{ position: "absolute", left: 320, width: 600, top: 186, whiteSpace: "nowrap", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.muted, opacity: interpolate(frame, [tap + 96, tap + 110], [0, 1], clamp) }}>
          кийинки сапар — жаңы чакыруу
        </div>
      </Card>
      <Card x={70} y={820} w={940} h={440} style={{ opacity: inB }}>
        <div style={{ position: "absolute", left: 44, top: 34, display: "flex", gap: 16, alignItems: "center" }}>
          <HomeGlyph size={46} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: C.ink }}>Мектепке жол</div>
        </div>
        {[0, 1].map((week) => (
          <div key={week} style={{ position: "absolute", left: 44, top: 116 + week * 140, display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ width: 150, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.muted }}>{week + 1}-жума</div>
            {DAYS.map((d, i) => {
              const k = week * 5 + i;
              const lit = interpolate(frame, [repeat + k * 3, repeat + k * 3 + 6, repeat + k * 3 + 16], [0, 1, 0.35], clamp);
              return <DayPill key={d} label={d} on={lit * empty} mark="ask" w={100} />;
            })}
          </div>
        ))}
        <div style={{ position: "absolute", right: 36, top: 40, opacity: empty }}>
          <Chip tone="pale" size={30}>
            алдын ала уюштуруу керек
          </Chip>
        </div>
      </Card>
    </>
  );
};

// ---------- 3. Заявка: үй, мектеп, убакыт → поиск группы ----------
const Field: React.FC<{ readonly label: string; readonly value: string; readonly t: number; readonly y: number }> = ({ label, value, t, y }) => {
  const shown = value.slice(0, Math.round(value.length * t));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.muted, marginBottom: 10 }}>{label}</div>
      <div
        style={{
          height: 84,
          borderRadius: 22,
          border: `4px solid ${t > 0 && t < 1 ? C.yellow : C.line}`,
          background: C.paleNavy,
          display: "flex",
          alignItems: "center",
          paddingLeft: 28,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 38,
          color: C.ink,
        }}
      >
        {shown}
        {t > 0 && t < 1 ? <span style={{ color: C.yellow }}>|</span> : null}
        {t >= 1 ? <span style={{ marginLeft: "auto", marginRight: 26, color: "#137A3C", fontWeight: 900 }}>✓</span> : null}
      </div>
    </div>
  );
};

export const FormScene: React.FC<SceneProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const w = useWordFrame(tl, "form");
  const card = usePop(0);
  const f1 = ease(frame, w("l3-form", 2), w("l3-form", 2) + 18);
  const f2 = ease(frame, w("l3-form", 3), w("l3-form", 3) + 18);
  const f3 = ease(frame, w("l3-form", 5), w("l3-form", 5) + 20);
  const click = w("l3-form", 8); // «ылайыктуу»
  const move = ease(frame, click - 24, click - 2);
  const press = interpolate(frame, [click - 2, click + 2, click + 8], [0, 1, 0], clamp);
  const sent = ease(frame, click + 4, click + 14);
  const away = ease(frame, click + 10, click + 30); // курсор уходит, не закрывая статус
  const spin = frame * 9;
  const note = usePop(w("l3-form", 12, "end") + 4);
  return (
    <>
      <Card x={110} y={280} w={860} h={1000} style={{ opacity: card, transform: `translateY(${(1 - card) * 60}px)` }}>
        <div style={{ position: "absolute", left: 60, top: 44, display: "flex", alignItems: "center", gap: 20 }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 86, height: 86, borderRadius: "50%" }} />
          <div style={{ fontFamily: FONT, fontWeight: 1000, fontSize: 48, color: C.ink }}>Каттоо</div>
        </div>
        <Field label="Үй дареги" value="Үйүңүздүн дареги" t={f1} y={170} />
        <Field label="Мектеп" value="Баланын мектеби" t={f2} y={330} />
        <Field label="Убакыт" value="Сабак башталышы жана бүтүшү" t={f3} y={490} />
        {/* кнопка → статус поиска */}
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 680,
            height: 112,
            borderRadius: 30,
            background: interpolate(sent, [0, 1], [0, 1]) > 0.5 ? C.ink : C.yellow,
            transform: `scale(${1 - press * 0.05})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 40,
            color: sent > 0.5 ? C.white : C.ink,
          }}
        >
          {sent > 0.5 ? (
            <>
              <svg width={46} height={46} viewBox="0 0 46 46" style={{ transform: `rotate(${spin}deg)` }}>
                <circle cx="23" cy="23" r="18" stroke={C.yellow} strokeWidth={6} fill="none" strokeDasharray="70 50" strokeLinecap="round" />
              </svg>
              Ылайыктуу топ изделүүдө
            </>
          ) : (
            "Топ издөөгө суроо жөнөтүү"
          )}
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 820, textAlign: "center", opacity: note, transform: `translateY(${(1 - note) * 20}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink }}>Баштапкы издөө — 2 жумага чейин</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.muted, marginTop: 8 }}>Каттам заявкадан кийин дароо башталбайт</div>
        </div>
      </Card>
      <Cursor x={interpolate(move, [0, 1], [820, 560]) + 260 * away} y={interpolate(move, [0, 1], [1220, 1000]) + 300 * away} press={press} />
    </>
  );
};

// ---------- 4. Группа: точки соединяются в один регулярный путь ----------
const MAP_W = 940;
const MAP_H = 640;
const HOMES = [
  { x: 150, y: 470, label: "Үй 1" },
  { x: 330, y: 560, label: "Үй 2" },
  { x: 480, y: 420, label: "Үй 3" },
  { x: 640, y: 520, label: "Үй 4" },
];
const SCHOOL = { x: 790, y: 290 };
const ROUTE = "M150 470 C 220 520, 270 560, 330 560 S 430 440, 480 420 S 600 520, 640 520 S 760 380, 790 290";

export const GroupScene: React.FC<SceneProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const w = useWordFrame(tl, "group");
  const map = usePop(0);
  const draw = ease(frame, w("l4-group", 3), w("l4-group", 7, "end"));
  const len = getLength(ROUTE);
  const evo = evolvePath(draw, ROUTE);
  const carT = ease(frame, w("l4-group", 7, "end") + 6, w("l4-group", 13, "end") + 10);
  const pt = pointAt(ROUTE, Math.max(0.1, carT * len - 0.1));
  const pt2 = pointAt(ROUTE, Math.min(len, carT * len + 2));
  const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
  const driver = usePop(w("l4-group", 9));
  const belts = ease(frame, w("l4-group", 2) + 4, w("l4-group", 2) + 26);
  return (
    <>
      <Card x={70} y={270} w={MAP_W} h={MAP_H} style={{ opacity: map, background: "#EEF4FB" }}>
        <svg width={MAP_W} height={MAP_H} style={{ position: "absolute", left: 0, top: 0 }}>
          {/* Ала-Тоо — силуэт гор на горизонте */}
          <path d="M0 200 L90 120 L150 160 L250 70 L340 150 L420 100 L520 170 L620 80 L720 150 L800 110 L940 190 L940 0 L0 0 Z" fill="#F7FAFE" />
          <path d="M0 200 L90 120 L150 160 L250 70 L340 150 L420 100 L520 170 L620 80 L720 150 L800 110 L940 190 L940 240 L0 240 Z" fill="#C7D5EA" />
          <path d="M230 88 L250 70 L272 92 L258 88 L248 98 Z M600 98 L620 80 L640 100 L628 96 L618 104 Z" fill="#FFFFFF" />
          {/* улицы — прямоугольная сетка */}
          {[290, 380, 470, 560].map((y) => (
            <line key={y} x1={0} y1={y} x2={MAP_W} y2={y} stroke="#FFFFFF" strokeWidth={14} />
          ))}
          {[110, 260, 410, 560, 710, 860].map((x) => (
            <line key={x} x1={x} y1={240} x2={x} y2={MAP_H} stroke="#FFFFFF" strokeWidth={14} />
          ))}
          <path d={ROUTE} stroke={C.yellow} strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
        </svg>
        {HOMES.map((h, i) => (
          <PinAt key={h.label} {...h} at={w("l4-group", 0) + i * 6} />
        ))}
        <PinAt x={SCHOOL.x} y={SCHOOL.y} label="Мектеп" at={w("l4-group", 1)} school />
        {carT > 0 ? <Car x={pt.x} y={pt.y} size={90} angle={angle} /> : null}
        <div style={{ position: "absolute", left: 30, top: 24 }}>
          <Chip tone="navy" size={28}>
            Шарттуу мисал
          </Chip>
        </div>
        <div style={{ position: "absolute", right: 30, top: 24 }}>
          <Chip tone="yellow" size={28}>
            Топ: 3–4 бала
          </Chip>
        </div>
      </Card>
      <Card x={70} y={950} w={940} h={330} style={{ opacity: driver, transform: `translateY(${(1 - driver) * 40}px)` }}>
        <div style={{ position: "absolute", left: 36, top: 36 }}>
          <DriverAvatar size={150} />
        </div>
        <div style={{ position: "absolute", left: 210, top: 44, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink, lineHeight: 1.12 }}>
          Ушул каттамдын
          <br />
          туруктуу айдоочусу
        </div>
        <div style={{ position: "absolute", left: 210, top: 160, display: "flex", gap: 10 }}>
          {DAYS.map((d, i) => (
            <DayPill key={d} label={d} on={ease(frame, w("l4-group", 11) + i * 4, w("l4-group", 11) + i * 4 + 8)} w={64} />
          ))}
        </div>
        <div style={{ position: "absolute", right: 6, top: 10, width: 290, height: 310 }}>
          <SeatedChild x={0} y={40} hue="#F29E4C" belt={belts} />
          <SeatedChild x={110} y={40} hue="#5DA9E9" belt={belts} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 212, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 22, lineHeight: 1.15, color: C.muted }}>
            ар бир бала — өз
            <br />
            ордунда, кур тагылган
          </div>
        </div>
      </Card>
    </>
  );
};

const PinAt: React.FC<{ readonly x: number; readonly y: number; readonly label: string; readonly at: number; readonly school?: boolean }> = ({ x, y, label, at, school }) => {
  const p = usePop(at, 11);
  return <Pin x={x} y={y} label={label} s={p} tone={school ? "school" : "home"} />;
};

// ---------- 5. Полная поездка, бесплатная проба, решение родителей ----------
const LOOP = "M140 250 C 140 100, 800 100, 800 250 C 800 400, 140 400, 140 250 Z";

const Step: React.FC<{ readonly n: string; readonly text: React.ReactNode; readonly at: number; readonly y: number; readonly hl?: boolean }> = ({ n, text, at, y, hl }) => {
  const p = usePop(at);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: y,
        height: 104,
        borderRadius: 30,
        background: hl ? C.yellow : C.white,
        boxShadow: "0 14px 34px rgba(20,40,90,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        paddingLeft: 26,
        opacity: p,
        transform: `translateX(${(1 - p) * 60}px)`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 36,
        color: C.ink,
      }}
    >
      <div style={{ width: 62, height: 62, borderRadius: "50%", background: hl ? C.ink : C.yellowSoft, color: hl ? C.yellow : C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>{n}</div>
      <div>{text}</div>
    </div>
  );
};

export const TrialScene: React.FC<SceneProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const w = useWordFrame(tl, "trial");
  const loop = usePop(0);
  const len = getLength(LOOP);
  const t = (frame / 150) % 1;
  const p = pointAt(LOOP, t * len);
  const p2 = pointAt(LOOP, Math.min(len, t * len + 2));
  const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
  return (
    <>
      <Card x={70} y={270} w={940} h={500} style={{ opacity: loop }}>
        <svg width={940} height={500} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={LOOP} stroke={C.yellow} strokeWidth={18} fill="none" />
          <path d="M461 127 l18 10 l-18 10" stroke={C.ink} strokeWidth={6} fill="none" />
          <path d="M479 352 l-18 10 l18 10" stroke={C.ink} strokeWidth={6} fill="none" />
        </svg>
        <Car x={p.x} y={p.y} size={84} angle={angle} />
        <div style={{ position: "absolute", left: 140 - 80, top: 250 - 40, width: 160, textAlign: "center" }}>
          <Chip tone="navy" size={38}>
            ҮЙ
          </Chip>
        </div>
        <div style={{ position: "absolute", left: 800 - 130, top: 250 - 40, width: 260, textAlign: "center" }}>
          <Chip tone="navy" size={38}>
            МЕКТЕП
          </Chip>
        </div>
        <div style={{ position: "absolute", left: 300, right: 300, top: 60, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.muted }}>эртең менен</div>
        <div style={{ position: "absolute", left: 300, right: 300, top: 410, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.muted }}>сабактан кийин</div>
        <div style={{ position: "absolute", left: 300, right: 300, top: 226, textAlign: "center", fontFamily: FONT, fontWeight: 1000, fontSize: 40, color: C.ink }}>1 толук сапар</div>
      </Card>
      <Step n="1" y={810} at={6} text={<>Топ түзүлдү</>} />
      <Step
        n="2"
        y={930}
        at={w("l5-trial", 0)}
        hl={frame >= w("l5-trial", 4)}
        text={
          <>
            Биринчи толук сыноо сапары — <span style={{ fontWeight: 1000 }}>{frame >= w("l5-trial", 4) ? "АКЫСЫЗ" : "…"}</span>
          </>
        }
      />
      <Step n="3" y={1050} at={w("l5-trial", 7)} text={<>Улантуу же улантпоо — ата-эненин чечими</>} />
      <Step n="4" y={1170} at={w("l5-trial", 12, "end") + 4} text={<>Төлөм — улантсаңыз гана</>} />
    </>
  );
};

// ---------- 6. Финал: логотип и контакты (≥5 с вместе, ≥3 с после речи) ----------
export const CtaScene: React.FC<SceneProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const w = useWordFrame(tl, "cta");
  const merge = ease(frame, 0, 16);
  const logo = usePop(10, 12);
  const card = usePop(18);
  const outro = usePop(w("l8-outro", 0));
  return (
    <>
      {/* две одинаковые машины из начала сходятся в логотип */}
      <Car x={interpolate(merge, [0, 1], [180, 540])} y={interpolate(merge, [0, 1], [520, 420])} size={120} opacity={1 - logo} />
      <Car x={interpolate(merge, [0, 1], [180, 540])} y={interpolate(merge, [0, 1], [1000, 420])} size={120} opacity={1 - logo} />
      <div style={{ position: "absolute", left: 540 - 150, top: 260, width: 300, height: 300, transform: `scale(${logo})` }}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 300, height: 300, borderRadius: "50%", boxShadow: "0 30px 70px rgba(20,40,90,0.2)" }} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 600, opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
        <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 1000, fontSize: 64, color: C.ink, lineHeight: 1.1 }}>
          Бишкек <span style={{ color: C.yellow }}>•</span> Балдар үчүн такси
        </div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 24, padding: "26px 34px", borderRadius: 34, background: C.paleNavy }}>
          <LinkGlyph size={74} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.ink }}>Профилдеги шилтемеге өтүңүз</div>
        </div>
        <div style={{ marginTop: 26, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 42, color: C.muted }}>же WhatsApp аркылуу жазыңыз</div>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "30px 24px",
            borderRadius: 38,
            background: C.yellow,
            boxShadow: "0 18px 40px rgba(255,201,14,0.35)",
          }}
        >
          <WhatsAppGlyph size={92} />
          <div style={{ fontFamily: FONT, fontWeight: 1000, color: C.ink, lineHeight: 1 }}>
            <div style={{ fontSize: 40 }}>WhatsApp:</div>
            <div style={{ fontSize: 86, letterSpacing: 1 }}>{BG021_WHATSAPP}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1330,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 1000,
          fontSize: 58,
          color: C.ink,
          opacity: outro,
          transform: `scale(${0.9 + 0.1 * outro})`,
        }}
      >
        BalaGo менен жолго чыгалы!
      </div>
    </>
  );
};
