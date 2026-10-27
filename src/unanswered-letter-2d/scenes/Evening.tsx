// Сцены 6–8 (вечер третьего дня, дома).
// 6. «Жолдошунун суроосу»: муж входит, замечает открытый черновик и садится
//    рядом; спрашивает мягко, с участием: «Сен дагы эле жооп бере
//    элексиңби? Сени эмне токтотуп жатат?» Айжан слушает и открывает
//    календарь (карточка сменяется, без второго слоя).
// 7. «Себеби көрүнөт»: «Бул кызматты каалайм. Бирок кызды мектептен алып
//    келүүнү кантип уюштурарыбызды азырынча билбейм. Сенин да ошол убакта
//    жолугушууларың бар.» По одному: её 14:00–15:00 → «14:30 · Сабак
//    бүтөт» → его 14:00–15:30 → жёлтый акцент пересечения.
// 8. «Вариант издешет»: варианты по очереди и крупно — переставить все
//    встречи («Мүмкүн эмес») и ежедневная дорога бабушки через город
//    («Күн сайын?», «Оңой эмес»); затем родители смотрят друг на друга.
import { fontFamily } from "../../fonts";
import { CAL_COL, calY, CalendarCard } from "../graphics/Calendar";
import { LetterScreen, Pointer } from "../graphics/Letter";
import { MOMENTS } from "../layout";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, TableFront, WarmLamp } from "../sets/Home";
import { C } from "../theme";
import { onTable, seated, seatOf, sitDown } from "./common";
import { box, PanelArea, Stage, usePanel, useScene } from "./kit";

export const EVE_MOM = seated("mom", HOME.seat.mom);
export const EVE_DAD_SEAT = seated("dad", HOME.seat.dad);
const LAPTOP = HOME.laptop;

// Айжан за столом с ноутбуком (общая поза вечера).
export const momAtLaptop = (tt: number, extra: Partial<PoseIn> = {}): PoseIn => ({
  expr: "thinking",
  sit: 1,
  seat: seatOf(EVE_MOM),
  armL: { target: onTable(EVE_MOM.x - 0.02 * EVE_MOM.h, -4), shape: "relax", elbow: "hang", behind: false },
  armR: { target: onTable(LAPTOP.x - 70, -6), shape: "relax", elbow: "hang", behind: false },
  lookY: 0.35,
  ...extra,
});

// ---------- 6. Вопрос мужа ----------
// Муж входит, замечает открытый черновик и садится рядом. Спрашивает мягко,
// с участием: «Сен дагы эле жооп бере элексиңби?» — садясь, взгляд на
// экран, затем на неё; «Сени эмне токтотуп жатат?» — наклоняется к ней,
// одна открытая ладонь на столе в её сторону. Айжан слушает (поворачивается
// к нему), выдыхает и открывает календарь.
export const HusbandScene: React.FC = () => {
  const { f, from, to, at, word } = useScene("husband");
  const r = usePanel();
  const h01 = from("h01");
  const q2 = word("h01", 6); // «Сени эмне…»
  const swap = at(MOMENTS.toCalendar);
  const click = swap - 22;
  const DAD_X = HOME.seat.dad + 40;
  const sitAt = 40;
  // муж входит справа (из кухни) и садится на соседний стул
  const dadPlace = (tt: number): Place => ({ x: keys(tt, [[0, 1640], [sitAt - 2, DAD_X + 10]], (x) => cruise(x, 0.3)), y: HOME.seatY, h: EVE_DAD_SEAT.h });
  const dadPose = (tt: number): PoseIn => {
    const sd = sitDown(tt, sitAt, 30);
    const seatedNow = tt > sitAt + 20;
    return {
      expr: tt < h01 - 4 ? "calm" : tt < to("h01") + 10 ? "apologetic" : "calm",
      sit: sd.sit,
      seat: seatOf(EVE_DAD_SEAT),
      lean: sd.lean + keys(tt, [[q2 - 6, 0], [q2 + 8, 8], [to("h01") + 30, 8], [to("h01") + 50, 4]]),
      armL: seatedNow
        ? { target: keysV(tt, [[sitAt + 20, onTable(DAD_X - 0.03 * EVE_DAD_SEAT.h, -4)], [q2 - 4, onTable(DAD_X - 0.03 * EVE_DAD_SEAT.h, -4)], [q2 + 8, onTable(DAD_X - 0.13 * EVE_DAD_SEAT.h, -10)], [to("h01") + 16, onTable(DAD_X - 0.13 * EVE_DAD_SEAT.h, -10)], [to("h01") + 34, onTable(DAD_X - 0.04 * EVE_DAD_SEAT.h, -4)]], anticipate), shape: tt > q2 && tt < to("h01") + 20 ? "open" : "relax", elbow: "hang", behind: false }
        : { target: null, shape: "relax" },
      armR: seatedNow ? { target: onTable(DAD_X + 0.06 * EVE_DAD_SEAT.h, -4), shape: "relax", elbow: "hang", behind: false } : { target: null, shape: "relax" },
      // сначала смотрит на экран ноутбука, затем на неё
      lookY: keys(tt, [[30, 0], [40, 0.35], [h01 + 10, 0.35], [h01 + 22, 0.05]]),
      nod: keys(tt, [[to("h01") - 6, 0], [to("h01") + 2, 3], [to("h01") + 12, 0]]),
      headTilt: keys(tt, [[q2 - 4, 0], [q2 + 10, -4], [to("h01") + 30, -4], [to("h01") + 50, 0]]),
    };
  };
  const dadFace = (tt: number) => (tt < sitAt ? -0.8 : keys(tt, [[sitAt, -0.6], [h01 + 10, -0.6], [h01 + 22, -0.75]]));
  const momFace = (tt: number) => keys(tt, [[0, 0.35], [h01 + 4, 0.35], [h01 + 14, 0.75], [to("h01") + 26, 0.75], [to("h01") + 40, 0.4]]);
  const momPose = (tt: number): PoseIn =>
    momAtLaptop(tt, {
      expr: tt < h01 + 10 ? "thinking" : tt < to("h01") + 26 ? "apologetic" : "thinking",
      lookY: keys(tt, [[h01 + 4, 0.35], [h01 + 14, -0.15], [to("h01") + 26, -0.15], [to("h01") + 40, 0.35]]),
      armR: { target: keysV(tt, [[click - 10, onTable(LAPTOP.x - 70, -6)], [click, onTable(LAPTOP.x - 40, -14)], [click + 6, onTable(LAPTOP.x - 40, -10)], [click + 16, onTable(LAPTOP.x - 70, -6)]], anticipate), shape: tt > click - 4 && tt < click + 8 ? "point" : "relax", elbow: "hang", behind: false },
      exhale: keys(tt, [[to("h01") + 14, 0], [to("h01") + 24, 0.6], [to("h01") + 40, 0]]),
    });
  // экран ноутбука крупно — пока муж замечает черновик
  const insetA = easeOut((f - 16) / 8) * (1 - easeOut((f - h01 + 4) / 8));
  return (
    <PanelArea>
      <Stage cam={{ x: keys(f, [[0, 1150], [sitAt + 20, 1120]]), y: 1060, zoom: keys(f, [[0, 1.12], [h01 + 10, 1.3]], easeInOut) }} bg="#2B2233">
        <HomeBack minutes={20 * 60 + 15 + f / 300} evening={1} f={f} />
        <WarmLamp />
        <ChairBack x={EVE_MOM.x} evening={1} />
        <ChairBack x={DAD_X} evening={1} />
        <Actor uid="h6-dad" look="dad" f={f} place={dadPlace} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={0} layer={f > sitAt + 20 ? "body" : undefined} />
        <Actor uid="h6-mom" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="body" />
        <TableFront evening={1} />
        <LaptopSide x={LAPTOP.x} y={LAPTOP.y} open={1} />
        <Piala x={HOME.piala.x - 40} y={HOME.piala.y} />
        <Actor uid="h6-mom-a" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} role="mother" seed={11} layer="arms" />
        {f > sitAt + 20 ? <Actor uid="h6-dad-a" look="dad" f={f} place={dadPlace} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={0} layer="arms" /> : null}
      </Stage>
      {/* экран ноутбука крупно: тот же черновик и курсор */}
      <div style={box({ left: 26, top: 26, width: r.w * 0.46, height: r.h * 0.46, borderRadius: 24, overflow: "hidden", border: `5px solid #7FB8F0`, boxShadow: "0 18px 40px rgba(0,0,0,0.4)", opacity: insetA, scale: `${0.92 + 0.08 * insetA}`, transformOrigin: "0 0" })}>
        <div style={box({ left: 0, top: 0, width: r.w, height: r.h, scale: "0.46", transformOrigin: "0 0" })}>
          <LetterScreen w={r.w} h={r.h} v={{ f, draft: 1 }} />
        </div>
      </div>
    </PanelArea>
  );
};

// ---------- 7. Причина становится видна ----------
// Одно пересечение за раз, по словам реплики: «кызматты» — её встреча;
// «мектептен» — линия «14:30 · Сабак бүтөт» пересекает её встречу;
// «Сенин да ошол убакта…» — появляется и выделяется встреча мужа (её
// встреча приглушена); после фразы — жёлтый акцент пересечения обеих.
export const CalendarScene: React.FC = () => {
  const { f, word, to } = useScene("calendar");
  const momAt = word("m03", 1); // «кызматты»
  const schoolAt = word("m03", 5); // «мектептен»
  const dadAt = word("m03", 12); // «Сенин»
  const accentAt = to("m03") + 8;
  const dadFocus = easeOut((f - dadAt) / 8) * (1 - easeOut((f - accentAt) / 10));
  const v = {
    f,
    momHL: easeOut((f - momAt) / 8) * (1 - easeOut((f - schoolAt - 20) / 10)),
    momDim: dadFocus,
    dadShow: easeOut((f - dadAt + 2) / 10),
    dadHL: dadFocus,
    schoolShow: easeOut((f - schoolAt) / 10),
    schoolHL: easeOut((f - accentAt) / 10) + 0.6 * easeOut((f - schoolAt - 10) / 10) * (1 - easeOut((f - dadAt) / 8)),
  };
  // указатель: её встреча → линия уроков → его встреча → пересечение
  const mid = (i: 0 | 1) => CAL_COL[i].x + CAL_COL[i].w / 2;
  const p = keysV(f, [
    [0, { x: 720, y: 960 }],
    [momAt - 6, { x: 720, y: 960 }],
    [momAt + 8, { x: mid(0) + 60, y: calY(14) + 40 }],
    [schoolAt - 2, { x: mid(0) + 60, y: calY(14) + 40 }],
    [schoolAt + 10, { x: CAL_COL[0].x + 40, y: calY(14.5) + 30 }],
    [dadAt - 4, { x: CAL_COL[0].x + 40, y: calY(14.5) + 30 }],
    [dadAt + 10, { x: mid(1) + 80, y: calY(15.1) }],
    [accentAt - 4, { x: mid(1) + 80, y: calY(15.1) }],
    [accentAt + 10, { x: CAL_COL[1].x + CAL_COL[1].w - 26, y: calY(14.5) + 14 }],
  ]);
  return (
    <PanelArea>
      <CalendarCard v={v} />
      <Pointer x={p.x} y={p.y} opacity={easeOut((f - 6) / 8)} />
    </PanelArea>
  );
};

// ---------- 8. Они ищут вариант ----------
// Сверху — родители за ноутбуком. Варианты по очереди, крупно: сначала
// «1. Баарын жылдыруу» — встречи сдвигаются и возвращаются на занятые
// места, вывод «Мүмкүн эмес»; затем «2. Чоң апасы күн сайын» — длинный путь
// через город, «Күн сайын?», вывод «Оңой эмес». После объяснения — общий
// план: родители смотрят друг на друга, пауза перед сценой с дочкой.
const OptionCard: React.FC<{ title: string; n: number; a: number; result: string; ra: number; children: React.ReactNode }> = ({ title, n, a, result, ra, children }) => (
  <div style={box({ left: 24, right: 24, top: 336, bottom: 24, borderRadius: 34, backgroundColor: "#FFFFFF", border: `5px solid #9B7BE6`, overflow: "hidden", fontFamily, opacity: a, translate: `0 ${(1 - a) * 40}px` })}>
    <div style={box({ left: 28, top: 22, right: 28, display: "flex", alignItems: "center", gap: 16, fontSize: 46, fontWeight: 900, color: C.ink })}>
      <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#B79CF2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, flex: "none" }}>{n}</div>
      <span style={{ lineHeight: 1.05 }}>{title}</span>
    </div>
    <div style={box({ left: 0, right: 0, top: 110, bottom: 0 })}>{children}</div>
    {/* вывод */}
    <div style={box({ left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: ra, scale: `${0.9 + 0.1 * ra}` })}>
      <div style={{ padding: "16px 40px", borderRadius: 999, backgroundColor: "#FDE8E4", border: "4px solid #E0705C", fontSize: 50, fontWeight: 900, color: "#A8402F", display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={40} height={40} viewBox="0 0 40 40">
          <path d="M 8 8 L 32 32 M 32 8 L 8 32" stroke="#E0705C" strokeWidth={7} strokeLinecap="round" />
        </svg>
        {result}
      </div>
    </div>
  </div>
);

// Карта длинного пути бабушки через город (условная, без адресов).
const GrandmaMap: React.FC<{ draw: number; q: number }> = ({ draw, q }) => {
  const d = "M 90 470 C 90 330 240 370 270 270 C 300 170 150 150 210 80 C 270 20 430 50 460 140 C 490 230 370 290 430 360 C 480 420 560 390 560 470";
  return (
    <svg width={892} height={600} viewBox="-150 -20 920 620">
      {/* кварталы */}
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={-120 + (i % 6) * 140} y={0 + Math.floor(i / 6) * 135} width={112} height={108} rx={14} fill="#EEF2F7" />
      ))}
      <path d={d} stroke="#D9E0EA" strokeWidth={20} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#9B7BE6" strokeWidth={11} fill="none" strokeLinecap="round" strokeDasharray="20 16" opacity={draw > 0 ? 1 : 0} style={{ clipPath: `inset(0 ${100 - 100 * draw}% 0 0)` }} />
      {/* дом бабушки и школа */}
      <circle cx={90} cy={470} r={42} fill="#FFC46B" />
      <g transform="translate(66 446)">
        <path d="M 7 23 L 24 9 L 41 23 M 12 20 L 12 40 L 36 40 L 36 20" stroke="#172433" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx={560} cy={470} r={42} fill="#8FD3A6" />
      <g transform="translate(536 446)">
        <path d="M 6 20 L 24 9 L 42 20 M 10 20 L 10 39 L 38 39 L 38 20" stroke="#172433" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* «Күн сайын?» */}
      <g opacity={q} transform={`translate(330 ${250 - 12 * q})`}>
        <rect x={-150} y={-46} width={300} height={86} rx={43} fill="#172433" />
        <text x={0} y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={44} fill="#FFFFFF">
          {UL2_TEXT.everyDay}
        </text>
      </g>
    </svg>
  );
};

export const OptionsScene: React.FC = () => {
  const { f, word, from, to } = useScene("options");
  const n03 = from("n03");
  const second = word("n03b", 0); // «Чоң апасына»
  const noA = word("n03", 2); // «мүмкүн эмес»
  const noB = word("n03b", 7); // «оңой эмес»
  const together = to("n03b") + 18; // общий план родителей
  // вариант 1: блоки уходят вниз и возвращаются на занятые места
  const shift = keys(f, [[n03 + 2, 0], [n03 + 16, 1], [n03 + 28, 1], [noA, 0]], easeInOut);
  const a1 = easeOut((f + 4) / 8) * (1 - easeOut((f - second + 8) / 6));
  const a2 = easeOut((f - second + 6) / 8); // перекрывает уход первой карточки — без пустого кадра
  const draw = clamp((f - second) / 36);
  const q = easeOut((f - word("n03b", 2)) / 10);
  // родители рядом за ноутбуком
  const dad = seated("dad", 1250);
  const momPose = (tt: number): PoseIn =>
    momAtLaptop(tt, {
      expr: tt < together ? "thinking" : "apologetic",
      lookY: tt < together + 4 ? 0.4 : 0.05,
      lean: 4,
      exhale: keys(tt, [[together + 10, 0], [together + 22, 0.7], [together + 44, 0]]),
    });
  const dadPose = (tt: number): PoseIn => ({
    expr: tt < together ? "thinking" : "apologetic",
    sit: 1,
    seat: seatOf(dad),
    lean: 5,
    armL: { target: onTable(dad.x - 0.04 * dad.h, -4), shape: "relax", elbow: "hang", behind: false },
    armR: { target: onTable(dad.x + 0.06 * dad.h, -4), shape: "relax", elbow: "hang", behind: false },
    lookY: tt < together + 8 ? 0.4 : 0.05,
    nod: keys(tt, [[noB + 4, 0], [noB + 12, 3], [noB + 24, 0]]),
  });
  // после вариантов: смотрят друг на друга
  const momFace = (tt: number) => keys(tt, [[together, 0.4], [together + 10, 0.8]]);
  const dadFace = (tt: number) => keys(tt, [[together + 6, -0.5], [together + 16, -0.8]]);
  const wide = f >= together;
  const parents = (
    <>
      <HomeBack minutes={20 * 60 + 25} evening={1} f={f} />
      <WarmLamp />
      <ChairBack x={EVE_MOM.x} evening={1} />
      <ChairBack x={dad.x} evening={1} />
      <Actor uid="o8-mom" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} seed={11} layer="body" />
      <Actor uid="o8-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} seed={2} layer="body" />
      <TableFront evening={1} />
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      <Actor uid="o8-mom-a" look="aizhan" f={f} place={() => EVE_MOM} face={momFace} pose={momPose} seed={11} layer="arms" />
      <Actor uid="o8-dad-a" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} seed={2} layer="arms" />
    </>
  );
  return (
    <PanelArea>
      {wide ? (
        <Stage cam={{ x: 1130, y: 1060, zoom: keys(f, [[together, 1.3], [together + 90, 1.36]]) }} bg="#2B2233">
          {parents}
        </Stage>
      ) : (
        <>
          <Stage cam={{ x: 1130, y: 1000, zoom: 1.0 }} bg="#2B2233" inset={{ x: 24, y: 20, w: 892, h: 296 }}>
            {parents}
          </Stage>
          {a1 > 0.01 ? (
            <OptionCard title={UL2_TEXT.optionA} n={1} a={a1} result={UL2_TEXT.resultA} ra={easeOut((f - noA) / 8)}>
              <div style={box({ left: 158, top: 0, width: 940, height: 900, scale: "0.62", transformOrigin: "0 0" })}>
                <CalendarCard v={{ f, momHL: 0.5, dadShow: 1, dadHL: 0.5, schoolShow: 1, schoolHL: 1, shift }} />
              </div>
            </OptionCard>
          ) : null}
          {a2 > 0.01 ? (
            <OptionCard title={UL2_TEXT.optionB} n={2} a={a2} result={UL2_TEXT.resultB} ra={easeOut((f - noB) / 8)}>
              <div style={box({ left: 0, top: 10 })}>
                <GrandmaMap draw={draw} q={q} />
              </div>
            </OptionCard>
          ) : null}
        </>
      )}
    </PanelArea>
  );
};
