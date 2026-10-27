// Таймлайн 80-1-14 строится по фактической длительности озвучки.
// Каждая сцена — последовательность элементов: реплики (их реальная длина),
// действия (именованные метки и паузы на действие), три защищённые
// интерактивные паузы ровно по 150 кадров и финальная выдержка.
// «Гибкие» промежутки (flex) растягиваются до плановой длины сцены;
// защищённые интервалы не меняются никогда. Без React — для тестов и Node.
import { L80_LINES, L80_PAUSE_FRAMES, L80_PAUSES, L80_SCENES, L80_VIDEO, type L80SceneId } from "./script";

export type MouthFrame = readonly [open: number, round: number, wide: number];

export type L80ManifestLine = {
  readonly id: string;
  readonly role: string;
  readonly text: string;
  readonly file: string | null;
  readonly duration: number; // длина файла, с
  readonly speechStart: number; // начало речи в файле, с
  readonly speechEnd: number;
  readonly words: readonly { text: string; start: number; end: number }[];
  readonly mouth: readonly MouthFrame[]; // по кадрам файла (30 к/с)
};

export type L80Manifest = { readonly version: number; readonly estimated?: boolean; readonly lines: readonly L80ManifestLine[] };

type Item =
  | { kind: "gap"; frames: number; flex?: number; mark?: string }
  | { kind: "mark"; name: string }
  | { kind: "line"; id: string }
  | { kind: "pause"; name: string };

const g = (frames: number, flex = 0, mark?: string): Item => ({ kind: "gap", frames, flex, mark });
const m = (name: string): Item => ({ kind: "mark", name });
const L = (id: string): Item => ({ kind: "line", id });
const P = (name: string): Item => ({ kind: "pause", name });

// Плановые длительности сцен (кадры) из задания: 25/25/30/30/25/30/30/25 с;
// финал короче (23 с): после крепления листа нет пустой паузы перед 41.
export const SCENE_TARGET: Record<L80SceneId, number> = { s1: 750, s2: 750, s3: 900, s4: 900, s5: 750, s6: 900, s7: 900, s8: 690 };

export const FINAL_HOLD = 140; // 4,67 с общего плана после последнего слова

const PLAN: Record<L80SceneId, Item[]> = {
  s1: [
    m("s1.wide"), g(150, 1.2), m("s1.reach"), g(18), m("s1.lift"), g(22), m("s1.sip"), g(66), m("s1.lower"), g(20), m("s1.set"), g(14), m("s1.exhale"), g(18),
    L("01"), g(12), L("02"), g(18, 0.5), m("s1.look"), L("03"), g(16, 0.4), L("04"), g(30, 1),
  ],
  s2: [
    m("s2.paper"), g(54, 0.4), m("s2.paperDown"), g(16, 0.4), L("05"), g(12), L("06"), g(10), m("s2.pencil"), g(8), L("07"), g(14, 0.3), L("08"),
    P("p1"), L("09"), m("d1"), g(42), L("10"), m("d2"), g(52), L("11"), m("d3"), g(76), m("s2.end"), g(20, 1.2),
  ],
  s3: [
    m("s3.look3"), g(36, 0.5), m("s3.window"), g(44, 0.5), L("12"), m("d4"), g(62), L("13"), m("d5"), g(48), L("14"), m("d6"), g(56), L("15"), m("d7"), g(78),
    m("s3.count"), g(76), L("16"), g(12), L("17"), m("s3.stop"), g(16, 0.5), L("18"), g(30, 1),
  ],
  s4: [
    m("s4.empty"), g(48, 0.6), m("s4.up"), g(18, 0.3), L("19"), g(16, 0.3), L("20"), P("p2"), m("s4.answer"), L("21"), g(20, 0.6), L("22"), g(20, 0.6), L("23"), g(12), L("24"), g(40, 1),
  ],
  s5: [
    g(14, 0.3), m("s5.point"), L("25"), m("s5.jug"), g(58), m("s5.jugSet"), g(6), L("26"), g(16, 0.5), m("s5.care"), L("27"), g(16, 0.5), L("28"), m("s5.nod"), g(44, 1),
  ],
  s6: [
    g(10, 0.3), m("s6.amirCup"), g(44), m("s6.amirSet"), g(10, 0.3), L("29"), g(10), L("30"), g(8), L("31"), P("p3"), L("32"), g(6), L("33"),
    m("s6.reach"), g(22), m("s6.grasp"), g(6), m("s6.carry"), g(30), m("s6.tgrasp"), g(8), m("s6.release"), g(8), m("s6.tset"), g(22), m("s6.jugLift"), g(26),
    m("s6.pour"), g(64), m("s6.jugBack"), g(26), m("s6.place"), g(30), m("s6.amirReach"), g(18), m("s6.amirLift"), g(20), m("s6.amirSip"), g(42), m("s6.amirLower"), g(22),
    m("s6.end"), g(20, 1),
  ],
  s7: [
    m("s7.turn"), g(64, 0.4), m("s7.touch"), g(30), L("34"), g(10), m("s7.untouch"), L("35"), g(12), L("36"), g(14), L("37"), m("s7.view"), g(90, 1),
  ],
  s8: [
    m("s8.take"), g(34), m("s8.write"), g(112), m("s8.board"), g(30), L("38"), g(10), L("39"), g(10), L("40"), m("s8.pinned"), g(22, 1), L("41"), m("s8.final"), g(FINAL_HOLD),
  ],
};

export type L80Timeline = {
  readonly total: number;
  readonly scenes: readonly { id: L80SceneId; from: number; to: number }[];
  readonly lines: Record<string, { from: number; to: number; speechFrom: number; speechTo: number; line: L80ManifestLine }>;
  readonly marks: Record<string, number>;
  readonly pauses: readonly { name: string; from: number; to: number; after: string }[];
};

const lineFrames = (l: L80ManifestLine) => Math.ceil(l.duration * L80_VIDEO.fps);

export const buildTimeline = (manifest: L80Manifest): L80Timeline => {
  const byId = new Map(manifest.lines.map((l) => [l.id, l]));
  const marks: Record<string, number> = {};
  const lines: L80Timeline["lines"] = {};
  const pauses: { name: string; from: number; to: number; after: string }[] = [];
  const scenes: { id: L80SceneId; from: number; to: number }[] = [];
  let t = 0;
  let lastLine = "";
  for (const sc of L80_SCENES) {
    const items = PLAN[sc.id];
    let natural = 0;
    let flexSum = 0;
    for (const it of items) {
      if (it.kind === "gap") {
        natural += it.frames;
        flexSum += it.flex ?? 0;
      } else if (it.kind === "line") {
        const l = byId.get(it.id);
        if (!l) throw new Error(`нет озвучки реплики ${it.id}`);
        natural += lineFrames(l);
      } else if (it.kind === "pause") natural += L80_PAUSE_FRAMES;
    }
    // гибкие промежутки: растяжение до плановой длины, сжатие — не больше 35 %
    const extra = SCENE_TARGET[sc.id] - natural;
    const from = t;
    for (const it of items) {
      if (it.kind === "mark") marks[it.name] = t;
      else if (it.kind === "gap") {
        if (it.mark) marks[it.mark] = t;
        let f = it.frames;
        if (it.flex && flexSum > 0) {
          const d = (extra * it.flex) / flexSum;
          f = Math.max(Math.round(it.frames * 0.65), Math.round(it.frames + d));
        }
        t += f;
      } else if (it.kind === "line") {
        const l = byId.get(it.id)!;
        const n = lineFrames(l);
        lines[it.id] = {
          from: t,
          to: t + n,
          speechFrom: t + Math.round(l.speechStart * L80_VIDEO.fps),
          speechTo: t + Math.round(l.speechEnd * L80_VIDEO.fps),
          line: l,
        };
        marks[`${it.id}.start`] = lines[it.id].speechFrom;
        marks[`${it.id}.end`] = lines[it.id].speechTo;
        t += n;
        lastLine = it.id;
      } else if (it.kind === "pause") {
        // пауза начинается после полного окончания аудиофайла вопроса
        marks[`${it.name}.start`] = t;
        pauses.push({ name: it.name, from: t, to: t + L80_PAUSE_FRAMES, after: lastLine });
        t += L80_PAUSE_FRAMES;
        marks[`${it.name}.end`] = t;
      }
    }
    scenes.push({ id: sc.id, from, to: t });
    marks[`${sc.id}.from`] = from;
    marks[`${sc.id}.to`] = t;
  }
  for (const p of L80_PAUSES) {
    const found = pauses.find((x) => x.after === p.after);
    if (!found) throw new Error(`пауза после ${p.after} не найдена`);
  }
  return { total: t, scenes, lines, marks, pauses };
};

// Оценочная озвучка (до получения настоящих файлов): ~13 букв в секунду.
export const estimateManifest = (): L80Manifest => ({
  version: 1,
  estimated: true,
  lines: L80_LINES.map((l) => {
    const dur = 0.5 + l.text.replace(/[^\p{L}]/gu, "").length / 13;
    return { id: l.id, role: l.role, text: l.text, file: null, duration: dur + 0.25, speechStart: 0.1, speechEnd: dur + 0.1, words: [], mouth: [] };
  }),
});
