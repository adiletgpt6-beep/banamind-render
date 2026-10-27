// Сцены 6–8 (вечер третьего дня, дома).
// 6. «Жолдошунун суроосу»: муж замечает открытый черновик на ноутбуке и
//    спокойно, с интересом спрашивает: «Сен дагы эле жооп бере элексиңби?
//    Сени эмне токтотуп жатат?» Айжан смотрит на него и открывает календарь
//    предлагаемой роли: письмо уходит вторым слоем, календарь — вперёд.
// 7. «Себеби көрүнөт»: «Бул кызматты каалайм. Бирок кызды мектептен алып
//    келүүнү кантип уюштурарыбызды азырынча билбейм. Сенин да ошол убакта
//    жолугушууларың бар.» Подсветка: её 14:00–15:00 → его 14:00–15:30 →
//    «Мектеп — 14:30» (жёлтый акцент пересечения).
// 8. «Вариант издешет»: родители вместе смотрят два варианта —
//    переставить все встречи (блоки сдвигаются и возвращаются на занятые
//    места) и ежедневная дорога бабушки через город (карта, «Күн сайын?»).
import { fontFamily } from "../../fonts";
import { CalendarCard } from "../graphics/Calendar";
import { LetterScreen, Pointer } from "../graphics/Letter";
import { MOMENTS } from "../layout";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, TableFront, WarmLamp } from "../sets/Home";
import { C } from "../theme";
import { onTable, seated, seatOf } from "./common";
import { box, PanelArea, Stage, usePanel, useScene } from "./kit";

export const EVE_MOM = seated("mom", HOME.seat.mom);
export const EVE_DAD_SEAT = seated("dad", HOME.seat.dad);
const LAPTOP = HOME.laptop;

// Айжан за столом с ноутбуком (общая поза вечера).
export const momAtLaptop = (tt: number, extra: Partial<PoseIn> = {}): PoseIn => ({
  expr: "thinking",
  sit: 1,
  seat: seatOf(EVE_MOM),
  armL: { target: onTable(EVE_MOM.x + 0.05 * EVE_MOM.h, -4), shape: "relax", elbow: "down", behind: false },
  armR: { target: onTable(LAPTOP.x - 70, -6), shape: "relax", elbow: "down", behind: false },
  lookY: 0.35,
  ...extra,
});

// ---------- 6. Вопрос мужа ----------
export const HusbandScene: React.FC = () => {
  const { f, from, to, at } = useScene("husband");
  const r = usePanel();
  const h01 = from("h01");
  const swap = at(MOMENTS.toCalendar);
  const click = swap - 22;
  // муж входит справа (из кухни), останавливается за стулом
  const dadPlace = (tt: number): Place => {
    const u = cruise((tt - 0) / 40, 0.25);
    return { x: lerp(1620, 1330, u), y: HOME.seatY + 20, h: 800 };
  };
  const dadPose = (tt: number): PoseIn => ({
    expr: tt < h01 - 4 ? "calm" : tt < to("h01") + 6 ? "softSmile" : "calm",
    armL: { target: tt > 44 ? { x: 1238, y: HOME.seatY - 600 } : null, shape: "relax", elbow: "down" },
    lean: keys(tt, [[40, 0], [52, 6]]),
    lookY: keys(tt, [[36, 0], [46, 0.35], [h01 + 8, 0.35], [h01 + 20, 0.15]]),
    nod: keys(tt, [[to("h01") - 6, 0], [to("h01") + 2, 3], [to("h01") + 12, 0]]),
  });
  const dadFace = (tt: number) => (tt < 40 ? -0.8 : -0.55);
  const momFace = (tt: number) => keys(tt, [[0, 0.35], [h01 + 4, 0.35], [h01 + 14, 0.75], [to("h01") + 26, 0.75], [to("h01") + 40, 0.4]]);
  const momPose = (tt: number): PoseIn =>
    momAtLaptop(tt, {
      expr: tt < h01 + 10 ? "thinking" : tt < to("h01") + 26 ? "calm" : "thinking",
      lookY: keys(tt, [[h01 + 4, 0.35], [h01 + 14, -0.15], [to("h01") + 26, -0.15], [to("h01") + 40, 0.35]]),
      armR: { target: keysV(tt, [[click - 10, onTable(LAPTOP.x - 70, -6)], [click, onTable(LAPTOP.x - 40, -14)], [click + 6, onTable(LAPTOP.x - 40, -10)], [click + 16, onTable(LAPTOP.x - 70, -6)]], anticipate), shape: tt > click - 4 && tt < click + 8 ? "point" : "relax", elbow: "down", behind: false },
      exhale: keys(tt, [[to("h01") + 14, 0], [to("h01") + 24, 0.6], [to("h01") + 40, 0]]),
    });
  // экран крупно — пока муж замечает черновик; во время вопроса видны оба
  const insetA = easeOut((f - 14) / 10) * (1 - easeOut((f - h01 + 6) / 8));
  return (
    <PanelArea>
      <Stage cam={{ x: keys(f, [[0, 1180], [h01, 1150]]), y: 1100, zoom: keys(f, [[0, 0.95], [h01 + 30, 1.05]], easeInOut) }} bg="#2B2233">
        <HomeBack minutes={20 * 60 + 15 + f / 300} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={EVE_MOM.x} evening={1} />
        <ChairBack x={HOME.seat.dad} evening={1} />
        <Actor uid="h6-dad" look="dad" f={f} place={dadPlace} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={0} />
        <Actor uid="h6-mom" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="body" />
        <TableFront evening={1} />
        <LaptopSide x={LAPTOP.x} y={LAPTOP.y} open={1} />
        <Piala x={HOME.piala.x - 40} y={HOME.piala.y} />
        <Actor uid="h6-mom-a" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="arms" />
      </Stage>
      {/* экран ноутбука крупно: тот же черновик и курсор */}
      <div style={box({ left: 26, top: 26, width: r.w * 0.5, height: r.h * 0.5, borderRadius: 24, overflow: "hidden", border: `4px solid #7FB8F0`, boxShadow: "0 18px 40px rgba(0,0,0,0.4)", opacity: insetA, scale: `${0.92 + 0.08 * insetA}`, transformOrigin: "0 0" })}>
        <div style={box({ left: 0, top: 0, width: r.w, height: r.h, scale: "0.5", transformOrigin: "0 0" })}>
          <LetterScreen w={r.w} h={r.h} v={{ f, draft: 1 }} />
        </div>
      </div>
    </PanelArea>
  );
};

// ---------- 7. Причина становится видна ----------
export const CalendarScene: React.FC = () => {
  const { f, word, to, from } = useScene("calendar");
  const m03 = from("m03");
  const momAt = word("m03", 1); // «кызматты»
  const schoolAt = word("m03", 5); // «мектептен»
  const dadAt = word("m03", 12); // «Сенин»
  const accentAt = to("m03") + 8;
  const v = {
    f,
    momHL: easeOut((f - momAt) / 8) * (1 - 0.6 * easeOut((f - dadAt) / 10)),
    dadShow: easeOut((f - dadAt + 4) / 10),
    dadHL: easeOut((f - dadAt) / 8) * (1 - 0.5 * easeOut((f - accentAt) / 10)),
    schoolShow: easeOut((f - schoolAt) / 10),
    schoolHL: easeOut((f - accentAt) / 10),
    others: 0.35 + 0.65 * easeOut((f - m03 - 10) / 12),
  };
  // указатель: её встреча → его встреча → школьная отметка
  const p = keysV(f, [
    [0, { x: 700, y: 820 }],
    [momAt - 6, { x: 700, y: 820 }],
    [momAt + 8, { x: 330, y: 440 }],
    [dadAt - 4, { x: 330, y: 440 }],
    [dadAt + 10, { x: 720, y: 470 }],
    [accentAt - 4, { x: 720, y: 470 }],
    [accentAt + 10, { x: 560, y: 470 }],
  ]);
  return (
    <PanelArea>
      <CalendarCard v={v} />
      <Pointer x={p.x} y={p.y} opacity={easeOut((f - 6) / 8)} />
    </PanelArea>
  );
};

// ---------- 8. Они ищут вариант ----------
const OptionCard: React.FC<{ x: number; title: string; n: number; hl: number; children: React.ReactNode }> = ({ x, title, n, hl, children }) => (
  <div style={box({ left: x, top: 330, width: 430, height: 500, borderRadius: 30, backgroundColor: "#FFFFFF", border: `${3 + 2 * hl}px solid ${hl > 0.5 ? "#9B7BE6" : C.cardLine}`, boxShadow: hl > 0.05 ? `0 0 0 ${10 * hl}px rgba(155,123,230,0.18)` : "none", overflow: "hidden", fontFamily, opacity: 0.55 + 0.45 * Math.max(hl, 0.3) })}>
    <div style={box({ left: 22, top: 18, right: 22, display: "flex", alignItems: "center", gap: 12, fontSize: 32, fontWeight: 900, color: C.ink })}>
      <div style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: "#B79CF2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flex: "none" }}>{n}</div>
      <span style={{ lineHeight: 1.05 }}>{title}</span>
    </div>
    <div style={box({ left: 0, top: 100, width: 430, height: 400 })}>{children}</div>
  </div>
);

// Карта длинного пути бабушки через город (условная, без адресов).
const GrandmaMap: React.FC<{ draw: number; f: number; q: number }> = ({ draw, q }) => {
  const d = "M 60 330 C 60 230 170 260 190 190 C 210 120 110 110 150 60 C 190 20 300 40 320 100 C 340 160 260 200 300 250 C 330 290 380 270 380 330";
  return (
    <svg width={430} height={400} viewBox="0 0 430 400">
      {/* кварталы */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={20 + (i % 4) * 100} y={20 + Math.floor(i / 4) * 120} width={80} height={96} rx={10} fill="#EEF2F7" />
      ))}
      <path d={d} stroke="#D9E0EA" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#9B7BE6" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="14 12" pathLength={1000} strokeDashoffset={0} opacity={draw > 0 ? 1 : 0} style={{ clipPath: `inset(0 ${100 - 100 * draw}% 0 0)` }} />
      {/* дом бабушки и школа */}
      <circle cx={60} cy={330} r={30} fill="#FFC46B" />
      <g transform="translate(40 310) scale(0.85)">
        <path d="M 7 23 L 24 9 L 41 23 M 12 20 L 12 40 L 36 40 L 36 20" stroke="#172433" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx={380} cy={330} r={30} fill="#8FD3A6" />
      <g transform="translate(360 310) scale(0.85)">
        <path d="M 6 20 L 24 9 L 42 20 M 10 20 L 10 39 L 38 39 L 38 20" stroke="#172433" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* «Күн сайын?» */}
      <g opacity={q} transform={`translate(215 ${190 - 10 * q})`}>
        <rect x={-110} y={-34} width={220} height={64} rx={32} fill="#172433" />
        <text x={0} y={10} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={32} fill="#FFFFFF">
          {UL2_TEXT.everyDay}
        </text>
      </g>
    </svg>
  );
};

export const OptionsScene: React.FC = () => {
  const { f, word, from, to } = useScene("options");
  const n03 = from("n03");
  const second = word("n03", 4); // «Чоң апасына»
  // вариант 1: блоки уходят вниз и возвращаются на занятые места
  const shift = keys(f, [[n03 + 6, 0], [n03 + 24, 1], [n03 + 44, 1], [n03 + 60, 0]], easeInOut);
  const hl1 = easeOut((f - n03) / 8) * (1 - easeOut((f - second + 4) / 8));
  const hl2 = easeOut((f - second) / 8) * (1 - 0.5 * easeOut((f - to("n03") - 30) / 10));
  const draw = clamp((f - second - 4) / 40);
  const q = easeOut((f - word("n03", 6)) / 10);
  // родители рядом за ноутбуком, головы склонены к экрану
  const dad = seated("dad", 1235);
  const momPose = (tt: number): PoseIn => momAtLaptop(tt, { expr: "thinking", lookY: 0.4, lean: 6 });
  const dadPose = (tt: number): PoseIn => ({
    expr: "thinking",
    sit: 1,
    seat: seatOf(dad),
    lean: 8,
    armL: { target: onTable(dad.x - 0.12 * dad.h, -4), shape: "relax", elbow: "down", behind: false },
    armR: { target: onTable(dad.x + 0.1 * dad.h, -4), shape: "relax", elbow: "down", behind: false },
    lookY: 0.4,
    nod: keys(tt, [[to("n03") + 10, 0], [to("n03") + 20, 3], [to("n03") + 34, 0]]),
  });
  return (
    <PanelArea>
      <Stage cam={{ x: 1120, y: 1050, zoom: 1.0 }} bg="#2B2233" inset={{ x: 20, y: 20, w: 900, h: 290 }}>
        <HomeBack minutes={20 * 60 + 25} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={EVE_MOM.x} evening={1} />
        <ChairBack x={dad.x} evening={1} />
        <Actor uid="o8-mom" look="aizhan" f={f} place={() => EVE_MOM} face={() => 0.45} pose={momPose} seed={11} />
        <Actor uid="o8-dad" look="dad" f={f} place={() => dad} face={() => -0.5} pose={dadPose} seed={2} />
        <TableFront evening={1} />
        <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      </Stage>
      <OptionCard x={20} title={UL2_TEXT.optionA} n={1} hl={hl1}>
        <div style={box({ left: 4, top: -6, width: 940, height: 860, scale: "0.448", transformOrigin: "0 0" })}>
          <CalendarCard v={{ f, momHL: 0.6 * hl1, dadShow: 1, dadHL: 0.6 * hl1, schoolShow: 1, schoolHL: 1, others: 0, shift }} />
        </div>
      </OptionCard>
      <OptionCard x={490} title={UL2_TEXT.optionB} n={2} hl={hl2}>
        <GrandmaMap draw={draw} f={f} q={q} />
      </OptionCard>
    </PanelArea>
  );
};
