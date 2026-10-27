// План кадров 80-1-14: камера — прямоугольник над тем же миром (общий,
// средний, крупный планы) или предметная вставка листа сверху (POV Билала
// или со стороны класса). Склейки привязаны к меткам таймлайна, поэтому
// пересчитываются вместе с озвучкой. Камера почти неподвижна; в паузах —
// без движения.
import type { L80Timeline } from "./timeline";
import type { L80Role } from "./script";
import { WORLD } from "./art/Room";

export type Cam = { cx: number; cy: number; w: number };
export type ShotKind = "world" | "pov" | "camside";
export type Shot = { from: number; name: string; kind: ShotKind; cam?: Cam; push?: number };

export const CAMS = {
  WIDE: { cx: 1600, cy: 900, w: 3200 },
  TABLE: { cx: 1470, cy: 1040, w: 1500 },
  YUSUF_CU: { cx: 1350, cy: 1098, w: 600 },
  YUSUF_DRINK: { cx: 1365, cy: 1098, w: 600 },
  AMIR_CU: { cx: 1185, cy: 1060, w: 640 },
  AMIR_DRINK: { cx: 1215, cy: 1062, w: 700 },
  BILAL_MCU: { cx: 1790, cy: 1030, w: 760 },
  TEACHER_CU: { cx: 1545, cy: 975, w: 700 },
  TEACHER_MCU: { cx: 1570, cy: 1010, w: 980 },
  TWO_YT: { cx: 1450, cy: 1030, w: 900 },
  AMIR_YUSUF: { cx: 1262, cy: 1060, w: 780 },
  HANDOVER: { cx: 1400, cy: 1050, w: 1000 },
  POUR_CU: { cx: 1565, cy: 1112, w: 470 },
  WATER: { cx: 1800, cy: 1000, w: 1350 },
  WINDOW: { cx: 470, cy: 400, w: 780 },
  BOARD: { cx: 1880, cy: 700, w: 1200 },
  BOARD_SHEET: { cx: 1885, cy: 460, w: 560 },
  TABLE_CUPS: { cx: 1330, cy: 1090, w: 900 },
  PAUSE_CLASS: { cx: 1600, cy: 960, w: 2700 },
} as const satisfies Record<string, Cam>;

type CamName = keyof typeof CAMS;

const SPEAKER_CAM: Record<L80Role, CamName> = { yusuf: "YUSUF_CU", amir: "AMIR_CU", bilal: "BILAL_MCU", teacher: "TEACHER_CU" };

export type DrawWindow = { i: number; swapFrom: number; drawFrom: number; drawTo: number };

export const buildShots = (tl: L80Timeline, draws: readonly DrawWindow[]): Shot[] => {
  const M = (n: string) => {
    const v = tl.marks[n];
    if (v === undefined) throw new Error(`нет метки ${n}`);
    return v;
  };
  const S: Shot[] = [];
  const w = (from: number, name: CamName, push = 0) => S.push({ from, name, kind: "world", cam: CAMS[name], push });
  const pov = (from: number) => S.push({ from, name: "POV", kind: "pov" });
  const side = (from: number) => S.push({ from, name: "CAMSIDE", kind: "camside" });
  const sp = (id: string) => tl.lines[id].from - 3;
  const roleOf = (id: string) => tl.lines[id].line.role as L80Role;

  // 1. Стакан воды
  w(0, "WIDE", 0.06);
  w(M("s1.reach") - 26, "YUSUF_DRINK");
  w(sp("02"), "TWO_YT");
  // 2. Начнём считать
  w(M("s2.from"), "TABLE");
  w(sp("05"), "YUSUF_CU");
  w(sp("06"), "AMIR_CU");
  w(M("s2.pencil") - 8, "BILAL_MCU");
  w(sp("08"), "TEACHER_CU");
  w(M("p1.start"), "TABLE");
  pov(M("p1.start") + 80);
  // 2–3: рисование и реплики чередуются: говорит — его план; рисует — лист
  const talk = ["09", "10", "11", "12", "13", "14", "15"];
  const events: { at: number; kind: "line" | "draw"; id?: string; i?: number }[] = [];
  for (const id of talk) events.push({ at: sp(id), kind: "line", id });
  for (const d of draws) events.push({ at: d.drawFrom - 4, kind: "draw", i: d.i });
  events.sort((a, b) => a.at - b.at);
  const busy = (f: number) => talk.some((id) => f >= tl.lines[id].from - 3 && f < tl.lines[id].to);
  for (const e of events) {
    if (e.kind === "line") {
      if (e.id === "12") {
        w(M("s3.look3"), "YUSUF_CU");
        w(M("s3.window"), "WINDOW");
        w(tl.lines["12"].speechFrom + 14, "YUSUF_CU");
        continue;
      }
      w(e.at, SPEAKER_CAM[roleOf(e.id!)]);
    } else {
      // лист показываем, когда никто не говорит; иначе — сразу после реплики
      let at = e.at;
      while (busy(at)) at++;
      if (at < M("s3.count")) pov(at);
    }
  }
  w(M("s2.end") + 2, "TABLE");
  // 3. Список растёт: семь рисунков целиком
  pov(M("s3.count"));
  w(sp("16"), "BILAL_MCU");
  w(sp("17"), "YUSUF_CU");
  w(sp("18"), "TABLE");
  // 4. Можно ли перечислить всё?
  pov(M("s4.empty"));
  w(M("s4.up"), "YUSUF_CU");
  w(sp("20"), "TEACHER_CU");
  w(M("p2.start"), "PAUSE_CLASS");
  w(sp("21"), "AMIR_CU");
  w(sp("22"), "TEACHER_MCU");
  w(sp("23"), "BILAL_MCU");
  w(sp("24"), "TABLE");
  // 5. Люди тоже трудились
  w(M("s5.from"), "TWO_YT");
  w(M("s5.jug"), "WATER");
  w(sp("27"), "BILAL_MCU");
  pov(M("s5.care") + 10);
  w(sp("28"), "YUSUF_CU");
  w(M("s5.nod") - 2, "TEACHER_CU");
  // 6. Благодарность в поступке
  w(M("s6.from"), "AMIR_YUSUF");
  w(sp("30"), "TEACHER_CU");
  w(M("p3.start"), "HANDOVER");
  w(sp("32"), "YUSUF_CU");
  w(sp("33"), "AMIR_CU");
  // передача — одним непрерывным средним планом от захвата до стола
  w(M("s6.reach") - 4, "HANDOVER");
  w(M("s6.jugLift") + 6, "POUR_CU");
  w(M("s6.jugBack") + 8, "HANDOVER");
  w(M("s6.amirReach") - 4, "AMIR_DRINK");
  w(M("s6.end"), "TABLE");
  // 7. Наши примеры
  w(M("s7.from"), "TABLE");
  side(M("s7.touch") - 6);
  w(sp("35"), "AMIR_CU");
  w(sp("36"), "BILAL_MCU");
  w(sp("37"), "TEACHER_MCU");
  side(M("s7.view"));
  w(M("s7.view") + 66, "TABLE");
  // 8. Обычное и ценное
  w(M("s8.take") - 2, "TABLE");
  side(M("s8.write"));
  w(M("s8.board"), "BOARD");
  w(sp("39"), "TABLE_CUPS");
  w(sp("40"), "BOARD_SHEET");
  w(tl.lines["40"].to + 30, "TABLE");
  w(sp("41"), "YUSUF_CU");
  // финальный общий план — неподвижен
  w(M("s8.final"), "WIDE");

  S.sort((a, b) => a.from - b.from);
  // слишком короткие планы (< 24 кадров) не оставляем
  const out: Shot[] = [];
  for (let i = 0; i < S.length; i++) {
    const next = S[i + 1];
    if (next && next.from - S[i].from < 24 && S[i].name !== "WIDE") continue;
    if (out.length && out[out.length - 1].name === S[i].name) continue;
    out.push(S[i]);
  }
  return out;
};

export const shotAt = (shots: readonly Shot[], f: number): { shot: Shot; start: number; end: number } => {
  let i = 0;
  while (i + 1 < shots.length && shots[i + 1].from <= f) i++;
  return { shot: shots[i], start: shots[i].from, end: shots[i + 1]?.from ?? Infinity };
};

// Камера с ограничением по краям мира; push — медленное приближение.
export const camTransform = (cam: Cam, push: number, t: number, outW: number, outH: number) => {
  const wv = cam.w * (1 - push * t);
  const hv = (wv * outH) / outW;
  const cx = Math.min(Math.max(cam.cx, wv / 2), WORLD.w - wv / 2);
  const cy = Math.min(Math.max(cam.cy, hv / 2), WORLD.h - hv / 2);
  const s = outW / wv;
  return `translate(${outW / 2} ${outH / 2}) scale(${s}) translate(${-cx} ${-cy})`;
};
