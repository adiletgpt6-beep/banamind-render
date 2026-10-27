// Мир четвёртой мамы: поздний вечер дома (в окне — ночной Бишкек, огни
// панельных домов под Ала-Тоо). Мама листает в телефоне те самые три
// ответа. Дочь за столом поднимает свой рисунок «Апам экөөбүз» — мама
// опускает телефон и тепло смотрит на неё; потом взгляд — на недельный
// календарь, где каждый день одно и то же «07:30 / 13:00». Она решает:
// «Анда мен дагы мектеп каттамын алдын ала уюштуруунун жолун издеп
// көрөйүн.» — и начинает поиск в телефоне.
// Мир — px; f — кадр от начала сцены home (может быть < 0 для плитки).
import { fontFamily } from "../../../fonts";
import { lineIn, useTimeline } from "../context";
import { C } from "../palette";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, keys, keysV, lerp, lerpV, smoothstep, type Vec } from "../rig/motion";
import { BG50_TEXT } from "../script";
import { box, type Cam } from "../shots";
import { Chair, FloorLamp, FLOOR, H, RoomShell, TABLE_TOP, TableFront, Window } from "../sets/Room";

const GIRL = { x: 500, seat: 370 } as const;
export const SEEKER = { x: 1000, y: FLOOR + 24 } as const;
const CAL = { x: 290, y: 540, w: 400, h: 380 } as const;

export const homeKeys = (tl: ReturnType<typeof useTimeline>) => {
  const c01 = lineIn(tl, "c01", "home");
  const show = Math.max(26, c01.from - 104);
  const notice = show + 10;
  const cal = show + 48;
  const decide = Math.max(cal + 26, c01.from - 14);
  const type = c01.to + 4;
  return { c01, show, notice, cal, decide, type };
};

// Телефон мамы в кадре мира (для наезда камеры в конце сцены).
export const homePhone = (): Vec => ({ x: SEEKER.x - 0.06 * H.adult, y: SEEKER.y - 0.6 * H.adult });

export const HOME_TILE: Cam = { x: 930, y: 950, s: 1.9 };
export const homeCam = (f: number, k: ReturnType<typeof homeKeys>, frames: number): Cam => {
  const a: Cam = { x: 720, y: 990, s: 1.26 };
  const b: Cam = { x: 790, y: 965, s: 1.45 };
  const ph = homePhone();
  const c: Cam = { x: ph.x, y: ph.y - 10, s: 3.6 };
  const t1 = easeInOut((f - (k.decide - 16)) / 40);
  const base: Cam = { x: lerp(a.x, b.x, t1), y: lerp(a.y, b.y, t1), s: lerp(a.s, b.s, t1) };
  const t2 = easeInOut((f - (frames - 22)) / 22);
  return { x: lerp(base.x, c.x, t2), y: lerp(base.y, c.y, t2), s: lerp(base.s, c.s, t2) };
};

// Недельный календарь: каждый день те же «07:30» и «13:00».
const Calendar: React.FC<{ readonly glow: number }> = ({ glow }) => {
  const t = BG50_TEXT.home.calendar;
  const cw = (CAL.w - 40) / 5;
  return (
    <div style={box({ left: CAL.x, top: CAL.y, width: CAL.w, height: CAL.h, borderRadius: 16, backgroundColor: "#FFFFFF", boxShadow: `0 10px 24px rgba(30,30,70,0.18), 0 0 ${40 * glow}px rgba(255,201,14,${0.6 * glow})`, fontFamily, overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: CAL.w, height: 66, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 34, fontWeight: 900, textAlign: "center", lineHeight: "66px" })}>{t.title}</div>
      {t.days.map((d, i) => (
        <div key={d} style={box({ left: 20 + i * cw, top: 78, width: cw - 8, height: 290 })}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.navy, textAlign: "center" }}>{d}</div>
          {[t.am, t.pm].map((tm, j) => (
            <div key={tm} style={{ marginTop: j ? 18 : 14, padding: "10px 0", borderRadius: 10, backgroundColor: C.yellow, color: C.navy, fontSize: 21, fontWeight: 900, textAlign: "center", rotate: `${((i * 7 + j * 3) % 5) - 2}deg` }}>
              {tm}
            </div>
          ))}
          <div style={{ marginTop: 18, height: 6, borderRadius: 3, backgroundColor: "#E3E8F2" }} />
          <div style={{ marginTop: 10, height: 6, width: "70%", borderRadius: 3, backgroundColor: "#E3E8F2" }} />
        </div>
      ))}
    </div>
  );
};

// Рисунок дочери: мама и дочка за руку, солнце, сердечко и подпись.
const KidDrawing: React.FC<{ readonly x: number; readonly y: number; readonly up: number }> = ({ x, y, up }) => {
  const w = lerp(230, 270, up);
  const h = lerp(40, 210, up);
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 8, backgroundColor: "#FFFFFF", border: "3px solid #E2D9C8", boxSizing: "border-box", overflow: "hidden", boxShadow: up > 0.5 ? "0 12px 26px rgba(30,30,60,0.2)" : undefined })}>
      <svg width={w} height={h} viewBox="0 0 300 230" preserveAspectRatio="none" style={box({ left: 0, top: 0 })}>
        <circle cx={256} cy={42} r={22} fill={C.yellow} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={256 + 30 * Math.cos(i)} y1={42 + 30 * Math.sin(i)} x2={256 + 42 * Math.cos(i)} y2={42 + 42 * Math.sin(i)} stroke={C.yellow} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* мама */}
        <circle cx={96} cy={70} r={18} fill="none" stroke="#2F5D9E" strokeWidth={5} />
        <path d="M 96 88 L 96 140 M 96 104 L 128 120 M 96 104 L 70 122 M 96 140 L 80 172 M 96 140 L 112 172" stroke="#2F5D9E" strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M 78 64 Q 96 40 114 64" stroke="#3A2A24" strokeWidth={7} fill="none" />
        {/* дочка */}
        <circle cx={160} cy={100} r={14} fill="none" stroke="#D1607A" strokeWidth={5} />
        <path d="M 160 114 L 160 150 M 160 124 L 130 120 M 160 124 L 182 136 M 160 150 L 148 176 M 160 150 L 172 176" stroke="#D1607A" strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M 196 92 c -8 -12 -26 -2 -16 12 l 16 14 l 16 -14 c 10 -14 -8 -24 -16 -12 z" fill="#E86A86" />
        <path d="M 30 190 Q 150 176 270 192" stroke="#7FB36A" strokeWidth={6} fill="none" strokeLinecap="round" />
      </svg>
      {up > 0.6 ? (
        <div style={box({ left: 0, right: 0, bottom: 6, textAlign: "center", fontFamily, fontSize: 30, fontWeight: 800, color: "#2F5D9E", rotate: "-2deg", opacity: clamp((up - 0.6) / 0.3) })}>{BG50_TEXT.home.drawing}</div>
      ) : null}
    </div>
  );
};

export const HomeWorld: React.FC<{ readonly f: number }> = ({ f }) => {
  const tl = useTimeline();
  const k = homeKeys(tl);
  // ---------- мама ----------
  const mom = (): Place => ({ x: SEEKER.x, y: SEEKER.y, h: H.adult });
  const P = mom();
  const phoneUp: Vec = homePhone();
  const phoneLow: Vec = { x: P.x - 0.02 * H.adult, y: P.y - 0.44 * H.adult };
  const momPose = (t: number): PoseIn => {
    const speaking = t >= k.c01.from - 4 && t <= k.c01.to + 6;
    const scroll = t < k.notice ? Math.sin(t / 5) * 2 : 0;
    const armR: PoseIn["armR"] = {
      target: keysV(t, [[k.notice, phoneUp], [k.notice + 12, phoneLow], [k.decide - 6, phoneLow], [k.decide + 8, phoneUp]], anticipate),
      shape: "phone",
      item: "phone",
      elbow: "hang",
      glow: 1,
      itemTilt: -6,
      shake: scroll,
      behind: false,
    };
    const armL: PoseIn["armL"] =
      t < k.type
        ? { target: keysV(t, [[k.notice, { x: phoneUp.x - 40, y: phoneUp.y + 30 }], [k.notice + 10, { x: P.x - 0.15 * H.adult, y: P.y - 0.45 * H.adult }], [k.c01.from, { x: P.x - 0.15 * H.adult, y: P.y - 0.45 * H.adult }], [k.c01.from + 14, { x: P.x - 0.2 * H.adult, y: P.y - 0.55 * H.adult }], [k.c01.to - 6, { x: P.x - 0.2 * H.adult, y: P.y - 0.55 * H.adult }], [k.c01.to + 2, { x: phoneUp.x - 34, y: phoneUp.y + 28 }]], anticipate), shape: t > k.c01.from + 6 && t < k.c01.to ? "open" : "relax", elbow: "down", behind: false }
        : { target: { x: phoneUp.x - 30 + 4 * Math.sin(t / 2.5), y: phoneUp.y + 18 }, shape: "point", elbow: "down", behind: false };
    return {
      armR,
      armL,
      expr: t < k.notice ? "thinking" : t < k.cal ? { browIn: 6, browOut: 2, lid: 0.12, smile: 0.5 } : t < k.decide ? { browIn: 4, browOut: -1, lid: 0.15, smile: 0.1 } : speaking ? "calm" : "softSmile",
      lookY: t < k.notice ? 0.55 : t < k.cal ? 0.25 : t < k.decide ? -0.2 : speaking ? 0 : 0.5,
      nod: t < k.notice ? 6 : t < k.cal ? keys(t, [[k.notice + 10, 0], [k.notice + 24, 4], [k.notice + 34, 0]]) : speaking ? 2 * Math.sin((t - k.c01.from) / 11) : t > k.c01.to ? 7 : 0,
      headTilt: t >= k.notice && t < k.cal ? 7 : 0,
      exhale: keys(t, [[k.cal + 4, 0], [k.cal + 16, 0.8], [k.decide, 0]]),
    };
  };
  const momFace = (t: number) => keys(t, [[k.notice, 0.05], [k.notice + 10, -0.6], [k.cal, -0.6], [k.cal + 10, -0.92], [k.decide - 6, -0.9], [k.decide + 6, -0.12], [k.c01.to, -0.1], [k.type, 0.05]]);
  // ---------- дочь ----------
  const girl = (): Place => ({ x: GIRL.x, y: FLOOR + 6, h: H.child });
  const up = clamp((f - k.show) / 12) * (1 - clamp((f - (k.decide + 10)) / 14));
  const sheetAt: Vec = { x: lerp(GIRL.x + 70, GIRL.x + 215, up), y: lerp(TABLE_TOP - 20, TABLE_TOP - 205, up) };
  const girlPose = (t: number): PoseIn => {
    const u = clamp((t - k.show) / 12) * (1 - clamp((t - (k.decide + 10)) / 14));
    const pencil = (tt: number): Vec => ({ x: GIRL.x + 40 + 30 * Math.sin(tt / 7), y: TABLE_TOP - 24 + 6 * Math.sin(tt / 4.5) });
    const sheet = { x: lerp(GIRL.x + 70, GIRL.x + 215, u), y: lerp(TABLE_TOP - 20, TABLE_TOP - 205, u) };
    return {
      sit: 1,
      seat: GIRL.seat,
      // рисунок держит одной рукой сбоку от лица — лицо открыто
      // рука плавно переходит от карандаша к краю листа (без скачка)
      armR: {
        target: lerpV(pencil(t), { x: sheet.x - lerp(10, 105, u), y: sheet.y + lerp(10, 70, u) }, smoothstep(u / 0.3)),
        shape: "pinch",
        item: u < 0.15 ? "pencil" : "none",
        itemColor: "#D1607A",
        elbow: "down",
        behind: false,
      },
      armL: { target: { x: GIRL.x - 80, y: TABLE_TOP - 20 }, shape: "open", elbow: "down", behind: false },
      expr: u > 0.3 ? "smile" : "calm",
      lookY: u > 0.3 ? -0.15 : 0.6,
      nod: u > 0.3 ? 0 : 8,
      headTilt: u > 0.3 ? -6 : 0,
    };
  };
  const girlFace = (t: number) => keys(t, [[k.show - 4, 0.05], [k.show + 8, 0.55], [k.decide + 10, 0.55], [k.decide + 24, 0.1]]);
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <RoomShell wall="linear-gradient(180deg, #EEE6EE 0%, #E6DAE2 70%, #DCCED6 100%)" floor="linear-gradient(180deg, #BFA585 0%, #AE936F 100%)" stripe="#F1D58A" dim={0.08} />
      <Window x={790} y={400} w={420} h={540} light="night" curtain="#E8D3A0" />
      <Calendar glow={keys(f, [[k.cal, 0], [k.cal + 8, 1], [k.decide, 1], [k.decide + 12, 0]])} />
      <FloorLamp x={1330} />
      {/* жёлтый школьный рюкзак у стены */}
      <svg width={180} height={220} viewBox="0 0 180 220" style={box({ left: 1150, top: FLOOR - 214 })}>
        <rect x={20} y={20} width={140} height={190} rx={42} fill={C.yellow} />
        <rect x={40} y={110} width={100} height={70} rx={20} fill={C.yellowDeep} />
        <path d="M 60 24 Q 90 -6 120 24" stroke={C.navy} strokeWidth={10} fill="none" />
      </svg>
      <Chair x={GIRL.x} color="#A98463" />
      <Actor uid="h-girl" look="daughter" f={f} place={girl} face={girlFace} pose={girlPose} seed={41} />
      <Actor uid="h-mom" look="momSeeker" f={f} place={mom} face={momFace} pose={momPose} role="momSeeker" seed={42} />
      <TableFront x={260} w={640} color="#DCC3A0" edge="#C5A77E" />
      <KidDrawing x={sheetAt.x} y={sheetAt.y} up={up} />
      {/* тёплый свет лампы */}
      <div style={box({ left: P.x - 1200, top: 200, width: 2000, height: 1700, background: "radial-gradient(ellipse at 75% 30%, rgba(255,214,150,0.14), transparent 60%)" })} />
    </div>
  );
};
