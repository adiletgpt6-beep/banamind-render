// Звук фильма 80-1-10: голоса в моменты реплик, непрерывный тихий тон
// комнаты, тихие звуки действий строго по видимому контакту — шорох листа,
// карточки при передаче, карандаш и маркер только пока кончик касается
// бумаги в крупных планах рисования и письма, сгиб бумаги при исправлении
// лодочки, полоски крепления, лист у доски. Музыки нет (MUSIC = false).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "../core/video";
import type { BoatPlan } from "./boatPlan";
import { boatTip, captionTip, drawingTip } from "./drawingPaths";
import type { Plan } from "./plan";
import { titleTip } from "./posterText";
import { FILM } from "./script";
import type { L80Timeline } from "./timeline";

export const MUSIC = false;
// Общий уровень микса: ориентир задания — около −18 LUFS (интегральная), true
// peak не выше −1 дБTP. Голоса и звуки масштабируются вместе, баланс не меняется.
const MIX = 0.83;

const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s2f = (s: number) => Math.round(s * FPS);
const SFX = (n: string) => staticFile(`${FILM.voiceDir}/sfx/${n}.mp3`);

type Hit = { readonly at: number; readonly name: string; readonly volume: number; readonly label: string };
type Span = { readonly from: number; readonly to: number };

// Отрезки, когда кончик касается бумаги (down) — по функции кончика.
const downSpans = (from: number, to: number, isDown: (f: number) => boolean): Span[] => {
  const out: Span[] = [];
  let open: number | null = null;
  for (let f = from; f <= to; f++) {
    const d = f < to && isDown(f);
    if (d && open === null) open = f;
    if (!d && open !== null) {
      if (f - open >= 3) out.push({ from: open, to: f });
      open = null;
    }
  }
  return out;
};

export const FilmAudio: React.FC<{ readonly tl: L80Timeline; readonly pl: Plan; readonly bp: BoatPlan }> = ({ tl, pl, bp }) => {
  const total = tl.durationInFrames;
  const M = pl.M;
  const ev = bp.events;
  const hits: Hit[] = [
    { at: pl.spread.from, name: "sheet", volume: 0.5, label: "лист раскладывают" },
    { at: pl.smooth.from, name: "sheet", volume: 0.32, label: "лист расправляют" },
    ...(["yusuf", "amir", "bilal"] as const).map((id) => ({ at: pl.dealTo[id].land - 6, name: "card", volume: 0.42, label: `карточка — ${id}` })),
    { at: pl.layOf.yusuf.put - 5, name: "card", volume: 0.4, label: "яблоко на лист" },
    { at: pl.layOf.amir.put - 5, name: "card", volume: 0.4, label: "дерево на лист" },
    { at: pl.layOf.bilal.put - 5, name: "card", volume: 0.4, label: "Земля на лист" },
    { at: pl.birdPass.take - 4, name: "card", volume: 0.36, label: "птица — Билалу" },
    { at: pl.birdPass.put - 5, name: "card", volume: 0.4, label: "птица на лист" },
    { at: pl.textOneEv.take, name: "card", volume: 0.38, label: "текстовая карточка 1 взята" },
    { at: pl.textOneEv.put - 4, name: "card", volume: 0.4, label: "«Аллах Един» на лист" },
    { at: pl.textOneEv.tape1 - 4, name: "tape", volume: 0.5, label: "полоска" },
    { at: pl.textOneEv.tape2 - 4, name: "tape", volume: 0.5, label: "полоска" },
    { at: pl.textTwoEv.take, name: "card", volume: 0.38, label: "текстовая карточка 2 взята" },
    { at: pl.textTwoEv.put - 4, name: "card", volume: 0.4, label: "«У Аллаха нет начала» на лист" },
    { at: pl.textTwoEv.tape1 - 4, name: "tape", volume: 0.5, label: "полоска" },
    { at: pl.textTwoEv.tape2 - 4, name: "tape", volume: 0.5, label: "полоска" },
    { at: ev.amirTake5 - 3, name: "card", volume: 0.28, label: "лодочку взяли" },
    { at: ev.moveToTree.to - 3, name: "card", volume: 0.26, label: "лодочку поставили" },
    { at: ev.openStart, name: "card", volume: 0.24, label: "уголок разогнулся" },
    { at: ev.setDown - 2, name: "card", volume: 0.26, label: "лодочку поставили" },
    { at: ev.foldBack, name: "fold", volume: 0.6, label: "сгиб возвращают" },
    { at: ev.pressFrom, name: "fold", volume: 0.32, label: "сгиб прижимают" },
    { at: pl.earthHand.give - 3, name: "card", volume: 0.38, label: "Земля — учителю" },
    { at: pl.stackToTeacher.take - 3, name: "card", volume: 0.4, label: "стопка — учителю" },
    { at: pl.posterLift.grip, name: "sheet", volume: 0.42, label: "лист подняли" },
    { at: pl.hangEv.press - 3, name: "board", volume: 0.6, label: "лист у доски" },
    ...(["top1", "top2", "bottom1", "bottom2"] as const).map((k) => ({ at: pl.hangEv[k] - 3, name: "tape", volume: 0.5, label: "полоска на доске" })),
  ];
  // передача стопок по рядам — тихо; стопки — Билалу
  for (const row of [0, 1, 2]) {
    for (let i = 1; i < pl.rows[row].length; i++) hits.push({ at: pl.stackArrive(row, i) - 3, name: "card", volume: 0.14, label: `стопка ряда ${row}` });
    hits.push({ at: pl.bilalWalk.collect[row] - 3, name: "card", volume: 0.26, label: "стопка — Билалу" });
  }
  // закрепление карточек (кроме сжатого монтажом времени)
  for (const at of pl.fixTimes.values()) {
    if (at >= pl.lapse.from && at < pl.lapse.at) continue;
    hits.push({ at: at - 3, name: "card", volume: 0.3, label: "карточка на лист" });
    hits.push({ at: at + Math.round(pl.FIX_LEN * 0.45), name: "tape", volume: 0.42, label: "полоска" });
  }

  // карандаш: крупные планы рисования; маркер: заголовок; подпись и лодочка
  const kind = { yusuf: "apple", amir: "tree", bilal: "earth" } as const;
  const pencil: Span[] = [];
  const drawSpan = (id: "yusuf" | "amir" | "bilal", m: { from: number; to: number }) => pencil.push(...downSpans(m.from, m.to, (f) => drawingTip(kind[id], pl.mainProgress[id](f)).down && pl.mainProgress[id](f) < 1));
  drawSpan("yusuf", M("рисует Юсуф"));
  drawSpan("amir", M("рисует Амир"));
  drawSpan("bilal", M("рисует Билал"));
  drawSpan("yusuf", M("рисунки готовы"));
  const bpn = pl.boatPencil;
  pencil.push(...downSpans(bpn.yStart, bpn.aEnd, (f) => (f < bpn.yEnd || f >= bpn.aStart) && boatTip(pl.boatProgress(f)).down));
  pencil.push(...downSpans(bpn.capStart, bpn.capEnd, (f) => captionTip(pl.captionProgress(f)).down));
  const marker = downSpans(pl.write.start, pl.write.end, (f) => titleTip(pl.titleProgress(f)).down);

  const loops = (spans: Span[], name: string, vol: number) =>
    spans.flatMap((sp) => {
      const loop = s2f(1.8);
      const out: { from: number; len: number; a: number; b: number; name: string; vol: number }[] = [];
      for (let f = sp.from; f < sp.to; f += loop) out.push({ from: f, len: Math.min(loop, sp.to - f), a: sp.from, b: sp.to, name, vol });
      return out;
    });
  const strokes = [...loops(pencil, "pencil", 0.5), ...loops(marker, "marker", 0.55)];
  const roomLoop = s2f(29.4);
  const rooms: number[] = [];
  for (let f = 0; f < total; f += roomLoop) rooms.push(f);
  return (
    <>
      {rooms.map((f) => (
        <Sequence key={`room-${f}`} name="Тон комнаты" from={f} durationInFrames={Math.min(roomLoop, total - f)}>
          <Audio src={SFX("room")} volume={(t) => MIX * 0.55 * interpolate(t + f, [0, 20, total - 30, total - 2], [0, 1, 1, 0], clampX)} />
        </Sequence>
      ))}
      {hits.map((h, i) =>
        h.at >= 0 && h.at < total ? (
          <Sequence key={`hit-${i}`} name={`Звук: ${h.label}`} from={h.at} premountFor={FPS}>
            <Audio src={SFX(h.name)} volume={MIX * h.volume} />
          </Sequence>
        ) : null,
      )}
      {strokes.map((t) => {
        const edge = Math.max(1, Math.min(4, Math.floor((t.b - t.a) / 2) - 1));
        return (
          <Sequence key={`${t.name}-${t.from}`} name={t.name === "pencil" ? "Карандаш" : "Маркер"} from={t.from} durationInFrames={t.len} premountFor={FPS}>
            <Audio src={SFX(t.name)} volume={(f) => MIX * t.vol * interpolate(f + t.from, [t.a, t.a + edge, t.b - edge, t.b], [0, 1, 1, 0], clampX)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={`v-${c.id}`} name={`Реплика ${c.id} (${c.role})`} from={s2f(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${FILM.voiceDir}/${c.file}`)} volume={MIX * 0.84} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
