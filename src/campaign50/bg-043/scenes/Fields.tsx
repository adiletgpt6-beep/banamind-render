// Сцена 4 (≈00:33–00:47): «Так маалымат → топ издөө». Светлый бумажный
// фон в точку. Белая карточка-вкладка BalaGo «Каттам үчүн маалымат» с тремя
// полями «Үй / Мектеп / Убакыт». Оба будильника выпрыгивают из-за карточки
// и встают на её верхний край — над полями — и работают живыми стрелками:
// на «дарек» «Жумуш сааты» поднимает палец и опускает руку и минутную
// стрелку на поле «Үй» (поле подсвечивается, «Так дарек» вписывается,
// выскакивает галочка); на «мектеп» «Мектеп сааты» подпрыгивает и
// показывает на поле «Мектеп»; на «сабактын убактысы» — поле «Убакыт»,
// часы прокручивают стрелки к своему времени (08:00 и 13:00) и кивают.
// На «Адегенде ылайыктуу топ изделет» из-под карточки выезжает бумажная
// полоска-«чек»: точки-дети сходятся в группу, песочные часы «Күтүү мүмкүн».
// Гэг на «баштала турган күн»: «Мектеп сааты» азартно начинает обратный
// отсчёт «3», «2» в пузыре; на «кепилденбейт» штампуется тёмно-синяя плашка
// «Баштала турган күн кепилденбейт», «Жумуш сааты» кладёт ладонь ему на
// плечо, пузырь лопается ДО конца отсчёта (старт не наступает). «Мектеп
// сааты» смущённо пожимает плечами, оба кивают и дают «пять».
// Все биты — от фактических слов реплики n02 (wordFrame).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeIn, easeInOut, easeOut, hopArc, keys, keysV, pop, shake, squashPulse } from "../anim";
import { timeToDeg, type ClockArm } from "../chars/Clock";
import { ClockActor, exprKeys } from "../chars/ClockActor";
import { useScene, useTimeline } from "../context";
import { Caption, Gear, Logo, Sparks } from "../parts";
import { C, CLOCK_COLORS } from "../palette";
import { BG43_TEXT } from "../script";
import type { SceneSfx } from "../sfxCues";
import { Shot } from "../shots";
import { cueFrames, wordFrame, type Bg43Timeline } from "../timing";

const T = BG43_TEXT.fields;
// экранный текст: цифры азартного обратного отсчёта «Мектеп сааты» в пузыре.
// Отсчёт обрывается на «2» — до старта дело не доходит.
const COUNTDOWN = ["3", "2"] as const;
// экранный текст: знак вопроса на значке календаря в плашке «кепилденбейт»
const CAL_MARK = "?";

// ---------- Раскладка (мир = кадр 1080×1920 при zoom 1) ----------
const CARD = { x: 90, y: 646, w: 840, h: 322 } as const;
const HEAD = 86;
const TILE = { y: CARD.y + 98, w: 252, h: 206, xs: [110, 384, 658] } as const;
// полоска выезжает из-под нижнего края карточки (её верх прячется под ним)
const STRIP = { x: 150, w: 720, h: 206, top: CARD.y + CARD.h - 24 } as const;
const PLATE = { cx: 497, cy: 1226, w: 790, h: 88 } as const;
const BUBBLE = { cx: 748, cy: 482, w: 172, h: 160 } as const;
// будильники стоят на верхнем крае карточки, над полями «Үй» и «Мектеп»
const GROUND = CARD.y;
const SIZE = 78;
const K = SIZE / 100;
const HOME = { work: 236, school: 510 } as const;
const WORK_NEAR = 314;

const W8 = timeToDeg(8, 0);
const S13 = timeToDeg(13, 0);
type P = { readonly x: number; readonly y: number };
const REST_L: P = { x: -128, y: -72 };
const REST_R: P = { x: 128, y: -72 };
// мировая точка → локальные единицы будильника, стоящего в x на GROUND
const local = (cx: number, wx: number, wy: number): P => ({ x: (wx - cx) / K, y: (wy - GROUND) / K });
// «пять» — ладони встречаются между часами
const FIVE: P = { x: (WORK_NEAR + HOME.school) / 2, y: GROUND - 236 * K };

export const fieldsBeats = (tl: Bg43Timeline, sceneFrom: number, frames: number) => {
  const n = cueFrames(tl, "n02");
  const w = (i: number) => wordFrame(tl, "n02", i) - sceneFrom;
  const n0 = n.from - sceneFrom;
  const n1 = n.to - sceneFrom;
  // «так» — палец вверх, «дарек» — рука и стрелка вниз, на поле «Үй»
  const aim1 = Math.max(w(1) - 2, 36);
  const tile1 = Math.max(w(2), aim1 + 8);
  const tile2 = Math.max(w(3), tile1 + 16);
  const tile3 = Math.max(w(4), tile2 + 16);
  const times = Math.max(w(5), tile3 + 12);
  // «Адегенде…» — полоска; «ылайыктуу» — 2-я строка; «топ» — точки сходятся
  const strip = Math.max(w(7), times + 22);
  const line2 = Math.max(w(8) + 4, strip + 12);
  const dots = Math.max(w(9), line2 + 6);
  const wait = Math.max(w(10) + 8, dots + 12);
  // «баштала» — «3», «турган» — «2», «кепилденбейт» — плашка и ладонь на плечо
  const count3 = Math.max(w(11), wait + 4);
  const count2 = Math.max(w(12), count3 + 12);
  const kep = Math.max(w(14), count2 + 14);
  const nod = Math.max(kep + 44, n1 + 6);
  return {
    n0,
    n1,
    // выход часов из-за карточки и приземление на её край
    riseW: 6,
    riseS: 11,
    landW: 26,
    landS: 31,
    caption: 14,
    logo: Math.max(w(0), 22),
    aim1,
    tile1,
    tile2,
    tile3,
    times,
    strip,
    line2,
    dots,
    wait,
    count3,
    count2,
    kep,
    walk0: Math.max(count2 + 2, kep - 22),
    walk1: kep - 2,
    pop: kep + 4,
    shrug: kep + 14,
    nod,
    five: Math.min(frames - 36, Math.max(nod + 34, frames - 56)),
    frames,
  };
};
type Beats = ReturnType<typeof fieldsBeats>;

// Подъём из-за карточки: вверх с замедлением, вниз с ускорением (мир, px).
const rise = (f: number, at: number) => {
  const up = 13;
  const down = 7;
  if (f <= at) return 260;
  if (f <= at + up) return 260 - 306 * easeOut((f - at) / up);
  if (f <= at + up + down) return -46 + 46 * easeIn((f - at - up) / down);
  return 0;
};

const blend = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// ---------- Значки полей ----------
const FieldIcon: React.FC<{ readonly i: number }> = ({ i }) => (
  <svg width={64} height={64} viewBox="0 0 64 64">
    {i === 0 ? (
      <>
        {/* үй */}
        <path d="M 12 30 L 32 13 L 52 30" fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 18 28 L 18 50 L 46 50 L 46 28" fill={C.navy} />
        <rect x={28} y={36} width={9} height={14} rx={2} fill={C.yellow} />
        <rect x={40} y={15} width={6} height={10} fill={C.navy} />
      </>
    ) : i === 1 ? (
      <>
        {/* мектеп: фронтон, колонны, флажок */}
        <path d="M 32 9 L 32 19" stroke={C.navy} strokeWidth={3} />
        <path d="M 32 9 L 42 12 L 32 15 Z" fill={C.yellow} stroke={C.navy} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 10 28 L 32 18 L 54 28 Z" fill={C.navy} />
        <rect x={13} y={28} width={38} height={22} fill={C.navy} />
        <rect x={18} y={33} width={7} height={8} rx={1.5} fill="#FFFFFF" />
        <rect x={39} y={33} width={7} height={8} rx={1.5} fill="#FFFFFF" />
        <rect x={28} y={36} width={8} height={14} rx={2} fill={C.yellow} />
        <rect x={9} y={50} width={46} height={5} rx={2} fill={C.navy} />
      </>
    ) : (
      <>
        {/* убакыт */}
        <circle cx={32} cy={33} r={20} fill="#FFFFFF" stroke={C.navy} strokeWidth={6} />
        <path d="M 32 33 L 32 21 M 32 33 L 41 38" stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
        <circle cx={32} cy={33} r={3.5} fill={C.yellow} stroke={C.navy} strokeWidth={2} />
        <rect x={27} y={6} width={10} height={6} rx={2} fill={C.navy} />
      </>
    )}
  </svg>
);

const Check: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 50 50">
    <circle cx={25} cy={25} r={22} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
    <path d="M 14 26 L 22 34 L 37 17" fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- Поле формы ----------
const Tile: React.FC<{ readonly i: number; readonly f: number; readonly inAt: number; readonly at: number }> = ({ i, f, inAt, at }) => {
  const fld = T.fields[i];
  const e = pop(f, inAt, 14);
  const o = appear(f, inAt, 8);
  const hl = appear(f, at - 3, 8);
  const pulse = squashPulse(f, at, 14, 1);
  const chk = pop(f, at + 3, 14);
  // значение «вписывается» слева направо
  const fill = easeInOut((f - at + 2) / 14);
  return (
    <div
      style={{
        position: "absolute",
        left: TILE.xs[i] - CARD.x,
        top: TILE.y - CARD.y,
        width: TILE.w,
        height: TILE.h,
        opacity: o,
        transform: `translateY(${(1 - e) * 34}px) scale(${(0.92 + 0.08 * e) * (1 + 0.05 * pulse)})`,
        borderRadius: 24,
        backgroundColor: "#F5F8FD",
        border: `3px solid ${C.line}`,
        boxSizing: "border-box",
        boxShadow: `0 0 0 ${11 * hl}px rgba(255,201,14,${0.2 * hl})`,
      }}
    >
      {/* подсветка: тёплый фон и жёлтая рамка */}
      <div style={{ position: "absolute", inset: -3, borderRadius: 24, backgroundColor: "#FFF9E2", border: `5px solid ${C.yellow}`, opacity: hl }} />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          width: 66,
          height: 66,
          borderRadius: 33,
          backgroundColor: hl > 0.5 ? "#FFFFFF" : C.yellowSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${shake(f, at, 20, 12)}deg) scale(${1 + 0.12 * pulse})`,
        }}
      >
        <FieldIcon i={i} />
      </div>
      <div style={{ position: "absolute", left: 88, top: 18, fontFamily, fontSize: 36, fontWeight: 900, color: C.navy, lineHeight: 1.2, whiteSpace: "nowrap" }}>{fld.k}</div>
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          top: 90,
          height: 98,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          border: `2.5px solid ${hl > 0.5 ? C.yellowDeep : C.line}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* пустое поле до подсказки — серые строки */}
        <div style={{ position: "absolute", left: 18, top: 28, width: 150, height: 12, borderRadius: 6, backgroundColor: C.line, opacity: 1 - fill }} />
        <div style={{ position: "absolute", left: 18, top: 52, width: 96, height: 12, borderRadius: 6, backgroundColor: C.line, opacity: 1 - fill }} />
        <div
          style={{
            fontFamily,
            fontSize: 30,
            fontWeight: 800,
            color: C.navy,
            lineHeight: 1.12,
            textAlign: "center",
            padding: "0 8px",
            clipPath: `inset(-10px ${(1 - fill) * 100}% -10px 0)`,
          }}
        >
          {fld.v}
        </div>
      </div>
      {chk > 0 ? (
        <div style={{ position: "absolute", right: -16, top: -16, transform: `scale(${chk}) rotate(${(1 - chk) * -40}deg)` }}>
          <Check size={52} />
        </div>
      ) : null}
    </div>
  );
};

// ---------- Карточка-вкладка BalaGo ----------
const FormCard: React.FC<{ readonly f: number; readonly b: Beats }> = ({ f, b }) => {
  const e = pop(f, 2, 18);
  const o = appear(f, 1, 8);
  const done = [b.tile1, b.tile2, b.tile3].map((t) => appear(f, t, 8));
  const logoK = 1 + 0.16 * squashPulse(f, b.logo, 14, 1);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        opacity: o,
        transform: `translateY(${(1 - e) * 90}px) scale(${0.95 + 0.05 * e})`,
        transformOrigin: "50% 0%",
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 20px 44px rgba(20,40,90,0.15)",
      }}
    >
      {/* шапка: логотип, заголовок, прогресс заполнения */}
      <div style={{ position: "absolute", left: 0, top: HEAD - 2, width: CARD.w, height: 2, backgroundColor: "#EEF2F8" }} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${shake(f, b.logo, 18, 9)}deg)`, transformOrigin: "50px 44px" }}>
        <Logo x={50} y={44} r={28} scale={logoK} />
      </div>
      <div style={{ position: "absolute", left: 94, top: 20, fontFamily, fontSize: 36, fontWeight: 900, color: C.navy, lineHeight: 1.2, whiteSpace: "nowrap" }}>{T.card}</div>
      <div style={{ position: "absolute", right: 30, top: 38, display: "flex", gap: 7 }}>
        {done.map((d, i) => (
          <div key={i} style={{ width: 34, height: 13, borderRadius: 7, backgroundColor: C.line, overflow: "hidden" }}>
            <div style={{ width: `${d * 100}%`, height: 13, backgroundColor: C.yellow }} />
          </div>
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <Tile key={i} i={i} f={f} inAt={8 + i * 5} at={[b.tile1, b.tile2, b.tile3][i]} />
      ))}
    </div>
  );
};

// ---------- Полоска-«чек» с честными условиями ----------
// Точки-дети: бродят «в поиске», на «топ» сходятся в круг; 4-я — пунктиром
// (группа 3–4 ребёнка).
const GroupDots: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  const c = easeInOut((f - at) / 16);
  const cols = [C.yellow, "#7FB2E5", C.coral, "#FFFFFF"];
  const start = [
    [-26, -16],
    [27, -14],
    [24, 18],
    [-28, 16],
  ];
  const ring = 14;
  return (
    <svg width={72} height={64} viewBox="-36 -32 72 64" style={{ overflow: "visible" }}>
      <circle r={27} fill="none" stroke={C.yellowDeep} strokeWidth={3} strokeDasharray="6 5" opacity={c} transform={`rotate(${f * 1.5})`} />
      {cols.map((col, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const wx = start[i][0] + Math.sin(f / 7 + i * 1.7) * 4 * (1 - c);
        const wy = start[i][1] + Math.cos(f / 6 + i * 2.1) * 4 * (1 - c);
        const x = wx + (Math.cos(a) * ring - wx) * c;
        const y = wy + (Math.sin(a) * ring - wy) * c;
        return <circle key={i} cx={x} cy={y} r={8.5} fill={col} stroke={C.navy} strokeWidth={3} strokeDasharray={i === 3 ? "4 3" : undefined} />;
      })}
    </svg>
  );
};

// Песочные часы: песок медленно пересыпается, лёгкое покачивание.
const Hourglass: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  const s = clamp((f - at) / 220);
  const top = 1 - s * 0.7;
  return (
    <svg width={44} height={58} viewBox="-22 -29 44 58" style={{ overflow: "visible", transform: `rotate(${Math.sin(f / 18) * 5}deg)` }}>
      <rect x={-18} y={-28} width={36} height={6} rx={3} fill={C.navy} />
      <rect x={-18} y={22} width={36} height={6} rx={3} fill={C.navy} />
      {/* песок сверху (убывает) и снизу (растёт) */}
      <path d={`M ${-11 * top} ${-3 - 15 * top} L ${11 * top} ${-3 - 15 * top} L 0 -2 Z`} fill={C.yellow} />
      <path d={`M -12 20 L 12 20 L ${4 + 8 * s} ${20 - 6 - 8 * s} L ${-4 - 8 * s} ${20 - 6 - 8 * s} Z`} fill={C.yellow} />
      <path d="M 0 -2 L 0 18" stroke={C.yellowDeep} strokeWidth={2} strokeDasharray="3 3" strokeDashoffset={-f * 0.8} />
      <path d="M -14 -22 Q -14 -6 -2 0 Q -14 6 -14 22 M 14 -22 Q 14 -6 2 0 Q 14 6 14 22" fill="none" stroke={C.navy} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  );
};

const Strip: React.FC<{ readonly f: number; readonly b: Beats }> = ({ f, b }) => {
  const s = pop(f, b.strip, 20);
  if (s <= 0) return null;
  const top = STRIP.top - (STRIP.h - 4) * (1 - s);
  const lineIn = (at: number) => appear(f, at, 10);
  const l1 = lineIn(b.strip + 6);
  const l2 = lineIn(b.line2);
  const l3 = lineIn(b.wait);
  const teeth = 24;
  const tw = STRIP.w / teeth;
  // нижний край — «зубчики» отрывного чека (справа налево)
  const zig = Array.from({ length: teeth }, (_, k) => {
    const i = teeth - 1 - k;
    return `L ${(i + 0.5) * tw} ${STRIP.h + 10} L ${i * tw} ${STRIP.h}`;
  }).join(" ");
  return (
    <div style={{ position: "absolute", left: STRIP.x, top, width: STRIP.w, height: STRIP.h + 12 }}>
      <svg width={STRIP.w} height={STRIP.h + 12} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 10px 14px rgba(20,40,90,0.13))" }}>
        <path d={`M 0 0 L ${STRIP.w} 0 L ${STRIP.w} ${STRIP.h} ${zig} Z`} fill="#FFFFFF" />
        <rect x={0} y={0} width={8} height={STRIP.h} fill={C.yellow} />
      </svg>
      {/* 1: топ изделет */}
      <div style={{ position: "absolute", left: 30, top: 34, opacity: l1, transform: `translateX(${(1 - l1) * -24}px)` }}>
        <GroupDots f={f} at={b.dots} />
      </div>
      <div style={{ position: "absolute", left: 112, top: 40, opacity: l1, transform: `translateX(${(1 - l1) * -24}px)`, fontFamily, fontSize: 32, fontWeight: 900, color: C.navy, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        {T.strip[0]}
      </div>
      {/* 2: 3–4 бала, шайкеш дарек жана убакыт */}
      <div style={{ position: "absolute", left: 112, top: 92, opacity: l2, transform: `translateX(${(1 - l2) * -24}px)`, fontFamily, fontSize: 28, fontWeight: 800, color: C.ink, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        {T.strip[1]}
      </div>
      {/* 3: күтүү мүмкүн */}
      <div style={{ position: "absolute", left: 44, top: 136, opacity: l3, transform: `scale(${0.6 + 0.4 * pop(f, b.wait, 14)})` }}>
        <Hourglass f={f} at={b.wait} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 140,
          opacity: l3,
          transform: `translateX(${(1 - l3) * -24}px)`,
          padding: "4px 18px 6px",
          borderRadius: 14,
          backgroundColor: C.yellowSoft,
          fontFamily,
          fontSize: 32,
          fontWeight: 900,
          color: C.navy,
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {T.strip[2]}
      </div>
    </div>
  );
};

// ---------- Плашка «Баштала турган күн кепилденбейт» (штамп) ----------
const Calendar: React.FC = () => (
  <svg width={50} height={50} viewBox="0 0 50 50">
    <rect x={4} y={8} width={42} height={38} rx={7} fill="#FFFFFF" />
    <rect x={4} y={8} width={42} height={12} rx={6} fill={C.yellow} />
    <rect x={4} y={15} width={42} height={5} fill={C.yellow} />
    <rect x={13} y={3} width={5} height={11} rx={2.5} fill="#FFFFFF" stroke={C.navy} strokeWidth={1.5} />
    <rect x={32} y={3} width={5} height={11} rx={2.5} fill="#FFFFFF" stroke={C.navy} strokeWidth={1.5} />
    <text x={25} y={42} textAnchor="middle" fontFamily={fontFamily} fontSize={22} fontWeight={900} fill={C.navy}>
      {CAL_MARK}
    </text>
  </svg>
);

const Plate: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  if (f < at - 4) return null;
  // штамп: падает из увеличения, удар, мягкий отскок
  const fall = easeIn((f - at + 4) / 6);
  const k = 1.55 - 0.55 * fall - 0.035 * squashPulse(f, at + 2, 10, 1);
  const o = clamp((f - at + 4) / 3);
  const rot = -5 + 3 * fall;
  const hit = clamp((f - at - 2) / 12);
  const x0 = PLATE.cx - PLATE.w / 2;
  const x1 = PLATE.cx + PLATE.w / 2;
  return (
    <>
      {hit > 0 && hit < 1 ? (
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - hit }}>
          {[-1, 0, 1].map((d) =>
            ([-1, 1] as const).map((s) => {
              const ax = (s < 0 ? x0 - 8 : x1 + 8) + s * hit * 14;
              const ay = PLATE.cy + d * 26;
              return <path key={`${d}${s}`} d={`M ${ax} ${ay} L ${ax + s * 22} ${ay + d * 12}`} stroke={C.navy} strokeWidth={5} strokeLinecap="round" />;
            }),
          )}
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x0,
          top: PLATE.cy - PLATE.h / 2,
          width: PLATE.w,
          height: PLATE.h,
          opacity: o,
          transform: `rotate(${rot}deg) scale(${k})`,
          borderRadius: 24,
          backgroundColor: C.navy,
          border: `4px solid ${C.yellow}`,
          boxSizing: "border-box",
          boxShadow: `0 ${6 + 14 * (1 - fall)}px ${18 + 16 * (1 - fall)}px rgba(20,40,90,${0.18 + 0.1 * (1 - fall)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <Calendar />
        <div style={{ fontFamily, fontSize: 35, fontWeight: 900, color: "#FFFFFF", whiteSpace: "nowrap", lineHeight: 1.1 }}>{T.noStart}</div>
      </div>
    </>
  );
};

// ---------- Пузырь обратного отсчёта (обрывается на «2») ----------
const CountBubble: React.FC<{ readonly f: number; readonly b: Beats }> = ({ f, b }) => {
  const inK = pop(f, b.count3 - 3, 12);
  const outT = clamp((f - b.pop) / 7);
  if (inK <= 0 || outT >= 1) return null;
  const k = inK * (1 + 0.12 * Math.sin(outT * Math.PI)) * (1 - easeIn(outT));
  const d3 = pop(f, b.count3, 10) * (1 - easeIn((f - b.count2 + 3) / 4));
  const d2 = pop(f, b.count2, 10);
  const wob = Math.sin(f / 2.2) * 2.5;
  const { cx, cy, w, h } = BUBBLE;
  const tail = `M ${cx - w / 2 + 14} ${cy + 14} L ${cx - w / 2 - 42} ${cy + 46} L ${cx - w / 2 + 22} ${cy + 46} Z`;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${cx}px, ${cy}px) scale(${k}) rotate(${wob}deg) translate(${-cx}px, ${-cy}px)` }}>
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={tail} fill="#FFFFFF" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={40} fill="#FFFFFF" stroke={C.navy} strokeWidth={5} />
        <path d={`M ${cx - w / 2 + 16} ${cy + 18} L ${cx - w / 2 + 16} ${cy + 43}`} stroke="#FFFFFF" strokeWidth={9} />
        {/* «тик-так» риски по краю */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + f * 0.05;
          return <circle key={i} cx={cx + Math.cos(a) * 58} cy={cy + Math.sin(a) * 54} r={4} fill={C.yellow} opacity={0.8} />;
        })}
      </svg>
      {[d3, d2].map((d, i) =>
        d > 0 ? (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - 60,
              top: cy - 70,
              width: 120,
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontSize: 112,
              fontWeight: 1000,
              color: C.navy,
              lineHeight: 1,
              transform: `scale(${d})`,
              opacity: clamp(d * 1.5),
            }}
          >
            {COUNTDOWN[i]}
          </div>
        ) : null,
      )}
    </div>
  );
};

// ---------- Фон: бумага в точку, мягкие пятна, тихие шестерёнки ----------
const Paper: React.FC<{ readonly f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: -300, top: -300, width: 1680, height: 2520, backgroundColor: C.paper, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(20,40,90,0.11) 2.3px, transparent 2.8px)",
        backgroundSize: "40px 40px",
        backgroundPosition: "12px 12px",
      }}
    />
    {(
      [
        [1210, 640, 300, C.yellowSoft, 0],
        [400, 1560, 340, C.sky, 1.7],
        [1300, 1420, 190, "#E3EEFA", 3.1],
        [330, 760, 170, "#FFF6D6", 4.4],
      ] as const
    ).map(([x, y, r, col, ph], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - r + Math.sin(f / 70 + ph) * 18,
          top: y - r + Math.cos(f / 80 + ph) * 14,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: col,
          opacity: 0.85,
        }}
      />
    ))}
    <div style={{ position: "absolute", left: 0, top: 0, opacity: 0.16 }}>
      <Gear x={300 + 1000} y={300 + 1170} r={70} rot={f * 0.6} fill={CLOCK_COLORS.school.gear} />
      <Gear x={300 + 1078} y={300 + 1080} r={44} rot={-f * 0.95 + 8} fill={CLOCK_COLORS.work.gear} />
      <Gear x={300 + 6} y={300 + 470} r={60} rot={-f * 0.5} fill={CLOCK_COLORS.work.gear} />
    </div>
  </div>
);

export const FieldsScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, frames } = useScene();
  const b = fieldsBeats(tl, from, frames);
  // камера: очень медленный наезд — кадр «дышит», надписи на месте
  const cam = { x: 540, y: 960 - 8 * easeInOut(f / frames), zoom: 1 + 0.022 * easeInOut(f / frames) };

  // ================= Жумуш сааты =================
  const walkT = clamp((f - b.walk0) / Math.max(1, b.walk1 - b.walk0));
  const wx = HOME.work + (WORK_NEAR - HOME.work) * easeInOut(walkT);
  const walking = f > b.walk0 && f < b.walk1 ? 1 : 0;
  const wMin = keys(f, [
    [b.aim1 - 4, 0],
    [b.aim1 + 2, -28], // замах
    [b.tile1 - 3, -28],
    [b.tile1 + 3, 180], // минутная стрелка — вниз, на поле «Үй»
    [b.tile2 + 4, 180],
    [b.tile2 + 14, 360],
    [b.tile3 - 2, 360],
    [b.tile3 + 6, 462], // в сторону поля «Убакыт»
    [b.times - 2, 462],
    [b.times + 16, 720], // своё время: 08:00
  ]);
  const wExpr = exprKeys(f, [
    [0, "curious"],
    [b.landW - 2, "proud"],
    [b.logo, "happy"],
    [b.aim1 - 4, "curious"],
    [b.tile1, "proud"],
    [b.tile2, "soft"],
    [b.tile3, "curious"],
    [b.times + 6, "happy"],
    [b.strip, "curious"],
    [b.dots + 4, "soft"],
    [b.count3 + 2, "surprised"],
    [b.count2, "worried"],
    [b.kep - 2, "soft"],
    [b.nod - 4, "happy"],
    [b.five - 6, "excited"],
    [b.five + 18, "happy"],
  ]);
  const wFace = keys(f, [
    [0, 0.2],
    [b.aim1 - 4, 0.2],
    [b.aim1 + 2, 0],
    [b.tile2 - 2, 0],
    [b.tile2 + 6, 0.55],
    [b.times - 2, 0.6],
    [b.times + 6, 0],
    [b.count3, 0],
    [b.count3 + 6, 0.6],
    [b.nod - 4, 0.6],
    [b.nod + 4, 0],
    [b.five - 12, 0],
    [b.five - 6, 0.5],
    [b.five + 16, 0.5],
    [b.five + 26, 0.1],
  ]);
  const wLookX = keys(f, [
    [0, 0.3],
    [b.logo - 2, 0.3],
    [b.logo + 4, -0.75],
    [b.aim1 - 6, -0.75],
    [b.aim1, 0],
    [b.tile2 - 2, 0],
    [b.tile2 + 4, 0.9],
    [b.times - 2, 1],
    [b.times + 4, 0],
    [b.count3, 0],
    [b.count3 + 4, 0.9],
    [b.nod - 4, 0.9],
    [b.nod + 4, 0],
    [b.five - 10, 0],
    [b.five - 4, 0.8],
    [b.five + 18, 0.8],
    [b.five + 26, 0],
  ]);
  const wLookY = keys(f, [
    [0, -0.3],
    [b.logo - 2, 0],
    [b.logo + 4, 0.75],
    [b.aim1 - 6, 0.75],
    [b.aim1, -0.6], // на поднятый палец
    [b.tile1 - 3, -0.6],
    [b.tile1 + 2, 0.95], // вниз, на поле
    [b.tile2 - 2, 0.95],
    [b.tile2 + 4, 0.4],
    [b.times - 2, 0.6],
    [b.times + 4, 0],
    [b.strip - 2, 0],
    [b.strip + 6, 1], // на полоску
    [b.count3, 1],
    [b.count3 + 4, -0.25],
    [b.kep, -0.1],
    [b.nod - 2, 0],
    [b.nod + 4, 0.5],
    [b.nod + 12, 0],
    [b.nod + 18, 0.5],
    [b.nod + 26, 0],
  ]);
  // руки
  let wArmL: ClockArm = null;
  let wArmR: ClockArm = null;
  if (f >= b.aim1 - 6 && f < b.tile2 + 12) {
    // палец вверх («так»), затем рука вниз — на поле «Үй» («дарек»)
    const p = keysV(f, [
      [b.aim1 - 6, REST_R],
      [b.aim1 + 2, { x: 146, y: -236 }],
      [b.tile1 - 4, { x: 146, y: -236 }],
      [b.tile1 + 2, { x: 138, y: -24 }],
      [b.tile2 + 2, { x: 138, y: -24 }],
      [b.tile2 + 12, REST_R],
    ]);
    const wag = f < b.tile1 - 4 ? Math.sin(f * 0.9) * 5 : 0;
    wArmR = { x: p.x + wag, y: p.y, shape: f < b.tile2 + 8 ? "point" : "relax" };
  }
  // поле «Убакыт»: открытая ладонь в его сторону
  const w3 = keys(f, [
    [b.tile3 - 4, 0],
    [b.tile3 + 4, 1],
    [b.times + 2, 1],
    [b.times + 12, 0],
  ]);
  if (w3 > 0.01) wArmR = { ...blend(REST_R, { x: 158, y: -128 }, w3), shape: "open" };
  if (walking) {
    const ph = (f - b.walk0) / 5;
    wArmL = { x: -128 + Math.sin(ph) * 12, y: -74, shape: "relax" };
    wArmR = { x: 128 - Math.sin(ph) * 12, y: -74, shape: "relax" };
  }
  // ладонь на плечо «Мектеп сааты» — на «кепилденбейт»
  const onShoulder = keys(f, [
    [b.kep - 4, 0],
    [b.kep + 3, 1],
    [b.nod - 6, 1],
    [b.nod + 4, 0],
  ]);
  // «пять»
  const fiveW = keys(f, [
    [b.five - 9, 0],
    [b.five, 1],
    [b.five + 8, 1],
    [b.five + 18, 0],
  ]);

  // ================= Мектеп сааты =================
  const counting = f > b.count3 - 4 && f < b.kep ? 1 : 0;
  let sMin = keys(f, [
    [b.tile2 - 11, 0],
    [b.tile2 - 1, 180], // минутная стрелка — вниз, на поле «Мектеп»
    [b.tile3 - 4, 180],
    [b.tile3 + 4, 132], // к полю «Убакыт»
    [b.times - 2, 132],
    [b.times + 16, 360], // своё время: 13:00
  ]);
  // обратный отсчёт: стрелка всё быстрее крутится назад; на «кепилденбейт»
  // тормозит и возвращается к 12 (13:00) — отсчёт не доходит до старта
  const c0 = b.count3 - 2;
  if (f > c0 && f <= b.kep) sMin = 360 - 600 * Math.pow((f - c0) / (b.kep - c0), 1.35);
  else if (f > b.kep) sMin = -240 - 120 * easeOut((f - b.kep) / 14);
  const sExpr = exprKeys(f, [
    [0, "excited"],
    [b.landS - 2, "happy"],
    [b.logo + 2, "excited"],
    [b.tile1, "curious"],
    [b.tile2 - 10, "excited"],
    [b.tile3 + 2, "curious"],
    [b.times + 6, "happy"],
    [b.strip, "curious"],
    [b.dots, "excited"],
    [b.wait + 4, "curious"],
    [b.count3 - 4, "excited"],
    [b.kep, "surprised"],
    [b.kep + 10, "sheepish"],
    [b.nod - 4, "soft"],
    [b.nod + 16, "happy"],
    [b.five - 6, "excited"],
    [b.five + 18, "happy"],
  ]);
  const sFace = keys(f, [
    [0, -0.2],
    [b.tile1 - 4, -0.2],
    [b.tile1 + 2, -0.55],
    [b.tile2 - 12, -0.55],
    [b.tile2 - 5, 0],
    [b.tile3 - 4, 0],
    [b.tile3 + 2, 0.5],
    [b.times - 2, 0.5],
    [b.times + 6, 0],
    [b.count3 - 6, 0],
    [b.count3, 0.4],
    [b.kep, 0.4],
    [b.kep + 5, -0.55],
    [b.shrug - 2, -0.55],
    [b.shrug + 6, 0],
    [b.five - 12, 0],
    [b.five - 6, -0.5],
    [b.five + 16, -0.5],
    [b.five + 26, -0.1],
  ]);
  const sLookX = keys(f, [
    [0, -0.3],
    [b.logo - 2, -0.3],
    [b.logo + 4, -0.85],
    [b.tile1 - 4, -0.85],
    [b.tile1 + 2, -0.85],
    [b.tile2 - 10, -0.85],
    [b.tile2 - 4, 0],
    [b.tile3 - 2, 0],
    [b.tile3 + 4, 0.85],
    [b.times + 4, 0],
    [b.count3 - 4, 0],
    [b.count3 + 2, 0.9], // на свой пузырь
    [b.kep, 0.9],
    [b.kep + 4, -0.9], // на соседа
    [b.shrug + 2, -0.9],
    [b.shrug + 8, 0],
    [b.five - 10, 0],
    [b.five - 4, -0.8],
    [b.five + 18, -0.8],
    [b.five + 26, 0],
  ]);
  const sLookY = keys(f, [
    [0, -0.3],
    [b.logo - 2, 0],
    [b.logo + 4, 0.6],
    [b.tile1 - 4, 0.6],
    [b.tile1 + 2, 0.8],
    [b.tile2 - 10, 0.8],
    [b.tile2 - 4, 0.95],
    [b.tile3 - 2, 0.95],
    [b.tile3 + 4, 0.7],
    [b.times + 4, 0],
    [b.strip - 2, 0],
    [b.strip + 6, 1],
    [b.count3 - 4, 1],
    [b.count3 + 2, -0.4],
    [b.kep, -0.4],
    [b.kep + 4, -0.2],
    [b.shrug + 8, 0],
    [b.nod, 0],
    [b.nod + 6, 0.5],
    [b.nod + 14, 0],
    [b.nod + 20, 0.5],
    [b.nod + 28, 0],
  ]);
  let sArmL: ClockArm = null;
  let sArmR: ClockArm = null;
  if (f >= b.tile2 - 14 && f < b.tile3 + 2) {
    // прыжок с поднятым пальцем — и рука вниз, на поле «Мектеп»
    const p = keysV(f, [
      [b.tile2 - 14, REST_L],
      [b.tile2 - 7, { x: -146, y: -240 }],
      [b.tile2 - 2, { x: -146, y: -236 }],
      [b.tile2 + 3, { x: -138, y: -24 }],
      [b.tile3 - 6, { x: -138, y: -24 }],
      [b.tile3 + 2, REST_L],
    ]);
    sArmL = { x: p.x, y: p.y, shape: f < b.tile3 - 2 ? "point" : "relax" };
  }
  const s3 = keys(f, [
    [b.tile3 - 6, 0],
    [b.tile3 + 1, 1],
    [b.times - 2, 1],
    [b.times + 8, 0],
  ]);
  if (s3 > 0.01) sArmR = { ...blend(REST_R, { x: 196, y: -70 }, s3), shape: "point" };
  if (counting) {
    // азартный отсчёт: палец вверх, вторая рука — кулачок
    const bob = squashPulse(f, b.count3, 8, 1) + squashPulse(f, b.count2, 8, 1);
    const up = clamp((f - b.count3 + 4) / 5);
    sArmR = { ...blend(REST_R, { x: 150, y: -262 - bob * 14 }, up), shape: "point" };
    sArmL = { ...blend(REST_L, { x: -150, y: -150 + Math.sin(f / 2) * 6 }, up), shape: "fist" };
  }
  const shrugK = keys(f, [
    [b.shrug - 4, 0],
    [b.shrug + 4, 1],
    [b.shrug + 18, 1],
    [b.shrug + 28, 0],
  ]);
  if (shrugK > 0.01) {
    sArmL = { ...blend(REST_L, { x: -170, y: -188 }, shrugK), shape: "open" };
    sArmR = { ...blend(REST_R, { x: 170, y: -188 }, shrugK), shape: "open" };
  }
  if (fiveW > 0.01) {
    const t = local(HOME.school, FIVE.x + 4, FIVE.y);
    sArmL = { ...blend(REST_L, t, fiveW), shape: "open" };
  }

  const sHop = hopArc(f, b.tile2 - 12, 12, 30) + hopArc(f, b.count3 - 8, 9, 20) + hopArc(f, b.five - 7, 9, 14);
  const sLift = sHop + 12 * shrugK;
  const sTilt =
    Math.sin(f / 29 + 1) * 1.3 +
    keys(f, [
      [b.tile2 - 3, 0],
      [b.tile2 + 3, -5],
      [b.tile3 - 6, -5],
      [b.tile3 + 2, 5],
      [b.times - 2, 5],
      [b.times + 6, 0],
    ]) +
    (counting ? Math.sin(f / 3) * 3 : 0) +
    keys(f, [
      [b.kep, 0],
      [b.kep + 4, -6],
      [b.shrug - 2, -6],
      [b.shrug + 6, 0],
    ]) +
    shake(f, b.shrug, 26, 5);
  const sSq =
    squashPulse(f, b.landS, 10, 0.8) +
    squashPulse(f, b.tile2 - 15, 5, 0.6) +
    squashPulse(f, b.tile2, 9, 0.7) +
    squashPulse(f, b.times + 16, 10, 0.5) +
    squashPulse(f, b.count3 + 1, 8, 0.6) +
    squashPulse(f, b.count2, 8, 0.4) +
    squashPulse(f, b.kep, 10, -0.55) +
    squashPulse(f, b.shrug, 12, -0.4) +
    squashPulse(f, b.nod, 10, 0.5) +
    squashPulse(f, b.nod + 14, 10, 0.45) +
    squashPulse(f, b.five + 2, 9, 0.5);
  const sRing = counting ? 0.1 + 0.12 * clamp((f - b.count3) / Math.max(1, b.kep - b.count3)) : 0;

  // ---- руки «Жумуш сааты» (зависят от положения соседа) ----
  if (onShoulder > 0.01) {
    const t = local(wx, HOME.school - 64 * K, GROUND - (208 + sLift) * K);
    wArmR = { ...blend(REST_R, t, onShoulder), shape: "open" };
  }
  if (fiveW > 0.01) {
    const t = local(wx, FIVE.x - 4, FIVE.y);
    wArmR = { ...blend(REST_R, t, fiveW), shape: "open" };
  }
  const wTilt =
    Math.sin(f / 31) * 1.2 +
    keys(f, [
      [b.aim1 - 4, 0],
      [b.aim1 + 2, -4],
      [b.tile1 - 3, -4],
      [b.tile1 + 3, 5],
      [b.tile2 + 2, 5],
      [b.tile2 + 10, 0],
    ]) +
    walking * Math.sin((f - b.walk0) / 2.5) * 3 +
    keys(f, [
      [b.kep - 2, 0],
      [b.kep + 4, 6],
      [b.nod - 6, 6],
      [b.nod + 4, 0],
    ]);
  const wSq =
    squashPulse(f, b.landW, 10, 0.8) +
    squashPulse(f, b.tile1 + 1, 8, 0.35) +
    squashPulse(f, b.times + 16, 10, 0.5) +
    squashPulse(f, b.count3 + 2, 8, -0.4) +
    squashPulse(f, b.nod, 10, 0.5) +
    squashPulse(f, b.nod + 14, 10, 0.45) +
    squashPulse(f, b.five + 2, 9, 0.5);
  const wLift = hopArc(f, b.five - 7, 9, 14);
  const gearOut = keys(f, [
    [b.times - 4, 0],
    [b.times + 4, 0.7],
    [b.times + 18, 0.7],
    [b.times + 28, 0],
  ]);

  const capOn = b.caption;
  return (
    <>
      <Shot cam={cam} bg={C.paper}>
        <Paper f={f} />
        {/* полоска и часы — за карточкой: выезжают и выпрыгивают из-за неё */}
        <Strip f={f} b={b} />
        <ClockActor
          kind="school"
          seed={7}
          x={HOME.school}
          y={GROUND + rise(f, b.riseS)}
          size={SIZE}
          hourDeg={S13.hourDeg}
          minDeg={sMin}
          expr={sExpr}
          face={sFace}
          lookX={sLookX}
          lookY={sLookY}
          tilt={sTilt}
          squash={sSq}
          lift={sLift}
          ring={sRing}
          step={f / 4}
          stepAmt={f > b.dots && f < b.dots + 24 ? 0.55 : 0}
          armL={sArmL}
          armR={sArmR}
          gear={gearOut}
        />
        <ClockActor
          kind="work"
          seed={3}
          x={wx}
          y={GROUND + rise(f, b.riseW)}
          size={SIZE}
          hourDeg={W8.hourDeg}
          minDeg={wMin}
          expr={wExpr}
          face={wFace}
          lookX={wLookX}
          lookY={wLookY}
          tilt={wTilt}
          squash={wSq}
          lift={wLift}
          step={(f - b.walk0) / 5}
          stepAmt={walking}
          armL={wArmL}
          armR={wArmR}
          gear={gearOut}
        />
        <FormCard f={f} b={b} />
        <Plate f={f} at={b.kep} />
        <CountBubble f={f} b={b} />
        <Sparks x={BUBBLE.cx} y={BUBBLE.cy} f={f} at={b.pop + 2} n={7} spread={110} />
        <Sparks x={FIVE.x} y={FIVE.y} f={f} at={b.five} n={6} spread={70} />
      </Shot>
      <Caption f={f} at={capOn} text={T.caption} />
    </>
  );
};

export const fieldsSfx: SceneSfx = (tl, from, frames) => {
  const b = fieldsBeats(tl, from, frames);
  const out: ReturnType<SceneSfx> = [];
  const add = (at: number, src: ReturnType<SceneSfx>[number]["src"], volume: number) => {
    if (at >= 0 && at < frames) out.push({ at: from + at, src, volume });
  };
  add(b.landW, "step", 0.2);
  add(b.landS, "step", 0.2);
  add(b.tile2 - 12, "boing", 0.12);
  // галочки полей
  add(b.tile1 + 3, "pop", 0.2);
  add(b.tile2 + 3, "pop", 0.2);
  add(b.tile3 + 3, "pop", 0.2);
  add(b.times + 2, "gear", 0.12);
  // полоска-«чек»
  add(b.strip, "slide", 0.24);
  add(b.dots + 12, "pop", 0.1);
  // отсчёт «3», «2» (обрывается)
  add(b.count3, "tick", 0.3);
  add(b.count2, "tick", 0.3);
  for (let k = b.walk0 + 3; k < b.walk1; k += 5) add(k, "step", 0.12);
  add(b.kep, "stamp", 0.32);
  add(b.pop + 1, "pop", 0.14);
  add(b.shrug, "boing", 0.2);
  add(b.five, "chime", 0.22);
  return out;
};
