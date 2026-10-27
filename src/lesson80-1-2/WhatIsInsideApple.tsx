// Композиция Lesson80-1-2-WhatIsInsideApple: lesson-80, ролик 80-1-2.
// «Урок 1. Аллах — наш Создатель. Анимация 2: Что спрятано в яблоке?»
// 1920×1080, 30 к/с. Планы: комната (та же, что в первом фильме), сад,
// крупный план листа, ветки двух яблонь (пчела) и та же ветка во времени.
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, lerp } from "../lesson01/rig/geom";
import { buildDirection, camAt, type Direction, prevShot, type Shot, shotAt, smoothRoomState } from "./direction";
import { type OverlayTimes, Overlays } from "./overlays";
import { A2_LINES, A2_VIDEO } from "./script";
import { GardenView, type GardenState } from "./sets/garden";
import { CutInsert } from "./sets/cutInsert";
import { BEE_T, beeAt, type BloomFx, BloomView, LeafPlate } from "./sets/nature";
import type { Season } from "./sets/tree";
import { buildTimeline, type Manifest, type Timeline } from "./timeline";
import { RoomWorld } from "./world";

export type WhatIsInsideAppleProps = { manifest: Manifest | null; subtitles: boolean };

const SUMMER_TREE = { season: "summer" as const, fruit: 1, fruitCount: 8 };

// ---------- Состояния природных вставок ----------
// Рост из семечка (сцена 2): семечко в почве → росток → молодое растение →
// несколько сезонов, дерево растёт → взрослое дерево с первыми яблоками.
const growthState = (T: Timeline, D: Direction, t: number): { s: GardenState; cam: { cx: number; cy: number; w: number }; next?: GardenState; mix?: number } => {
  const g0 = D.gIns;
  const g1 = T.hold.growth.end;
  const u = clamp((t - g0) / (g1 - g0));
  const base: GardenState = { t, season: "summer", treeA: { season: "summer" }, treeB: null };
  const cam = (() => {
    const keys: [number, number, number, number][] = [
      [0, 1600, 1408, 460],
      [0.1, 1600, 1390, 520],
      [0.22, 1600, 1330, 640],
      [0.34, 1600, 1150, 1150],
      [0.5, 1600, 1000, 1700],
      [0.86, 1600, 860, 2500],
      [1, 1620, 850, 2600],
    ];
    let i = 0;
    while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const k = easeInOut((u - a[0]) / (b[0] - a[0]));
    return { cx: lerp(a[1], b[1], k), cy: lerp(a[2], b[2], k), w: lerp(a[3], b[3], k) };
  })();
  if (u < 0.1) return { s: { ...base, growth: { stage: "seed", crack: clamp((u - 0.05) / 0.05) }, cut: 0.4, roots: 0, wet: clamp(u / 0.06) * 0.7, rain: clamp(u / 0.03) * (1 - clamp((u - 0.07) / 0.03)) * 0.5 }, cam };
  if (u < 0.22) return { s: { ...base, growth: { stage: "sprout", g: (u - 0.1) / 0.12 }, cut: 0.45, roots: 0, wet: 0.6 }, cam };
  if (u < 0.34) return { s: { ...base, growth: { stage: "young", g: (u - 0.22) / 0.12 }, cut: 0.45 * (1 - clamp((u - 0.22) / 0.06)), roots: 0 }, cam };
  if (u < 0.86) {
    // восемь сезонов: осень → зима → весна → лето ×2; дерево растёт
    const order: Season[] = ["autumn", "winter", "spring", "summer", "autumn", "winter", "spring", "summer"];
    const v = (u - 0.34) / 0.52;
    const idx = Math.min(order.length - 1, Math.floor(v * order.length));
    const local = v * order.length - idx;
    // размер растёт непрерывно (одинаков в обоих слоях наплыва — без двоения)
    const size = lerp(0.24, 0.92, easeInOut(v));
    const st = (i: number): GardenState => {
      const season = order[i];
      return {
        ...base,
        season,
        growth: { stage: "tree", s: size },
        treeA: { season, leaf: season === "winter" ? 0 : season === "autumn" ? 0.6 : 1, bloom: season === "spring" ? 1 : 0 },
        snow: season === "winter" ? 1 : 0,
      };
    };
    const cur = st(idx);
    if (local > 0.72 && idx < order.length - 1) return { s: cur, cam, next: st(idx + 1), mix: easeInOut((local - 0.72) / 0.28) };
    return { s: cur, cam };
  }
  return { s: { ...base, growth: { stage: "tree", s: lerp(0.92, 1, clamp((u - 0.86) / 0.1)) }, treeA: { season: "summer", fruit: clamp((u - 0.88) / 0.08) * 0.9 + 0.1, fruitCount: 5 } }, cam };
};

const rootsState = (T: Timeline, D: Direction, t: number): GardenState => {
  const S = T.seg;
  const H = T.hold;
  const n = D.n;
  const reveal0 = S[n(12)].start + 1.0;
  const cut = easeInOut(clamp((t - reveal0) / 1.6));
  const roots = clamp((t - reveal0 - 0.5) / 1.8);
  const rain0 = D.wordAt(14, "впитывают", 0.45);
  const rainOff = S[n(16)].start + 0.2;
  const rain = clamp((t - rain0) / 1.0) * (1 - clamp((t - rainOff) / 1.0));
  const wet = clamp((t - rain0 - 0.8) / 3.0);
  const soilWater = clamp((t - rain0 - 1.4) / 1.5);
  const arrows = clamp((t - D.wordAt(14, "Вода", 0.75) + 0.2) / 0.8) * (1 - clamp((t - (H.rain.end + 0.4)) / 0.8));
  const watering = clamp((t - D.wordAt(16, "люди", 0.35)) / 2.2) * (1 - clamp((t - (H.watering.end - 0.5)) / 0.5));
  return { t, season: "summer", treeA: SUMMER_TREE, treeB: { season: "summer" }, cut, roots, rain, wet, soilWater, arrows, arrowT: t, watering };
};

const springState = (t: number): GardenState => ({ t, season: "spring", treeA: { season: "spring", bloom: 1 }, treeB: { season: "spring", bloom: 1 } });

const bloomFx = (T: Timeline, D: Direction, t: number, tag: string): { fx: BloomFx; next?: BloomFx; mix?: number } => {
  if (tag === "bee") {
    const u = t - D.bee0;
    const bee = u > -0.2 && u < BEE_T.end ? beeAt(u) : null;
    const pollenA = 1 - 0.45 * clamp((u - BEE_T.arriveA) / (BEE_T.leaveA - BEE_T.arriveA));
    const pollenB = clamp((u - BEE_T.arriveB - 0.3) / 1.3);
    return { fx: { t, bee, stage: 0, pollenA, pollenB } };
  }
  if (tag === "fruit") {
    // время идёт: лепестки опали → (время) → завязи → (время) → крупнее → (время) → спелые
    const v = t - D.f0;
    const steps: [number, number][] = [
      [0, 0],
      [0.8, 0],
      [2.2, 1],
      [2.6, 1],
    ];
    if (v < 2.6) {
      let st = 0;
      for (let i = 0; i < steps.length - 1; i++) if (v >= steps[i][0]) st = lerp(steps[i][1], steps[i + 1][1], easeInOut(clamp((v - steps[i][0]) / (steps[i + 1][0] - steps[i][0]))));
      return { fx: { t, stage: st, pollenA: 0.55, pollenB: 1 } };
    }
    // дальше — ступени времени с мягким наплывом
    const stages = [1, 2.1, 3.0, 4.0];
    const at = [2.6, 4.4, 6.2, 7.9];
    let i = 0;
    while (i < at.length - 1 && v >= at[i + 1]) i++;
    const local = v - at[i];
    if (i < stages.length - 1 && local > 1.1) return { fx: { t, stage: stages[i], pollenA: 0.55 }, next: { t, stage: stages[i + 1], pollenA: 0.55 }, mix: easeInOut((local - 1.1) / 0.5) };
    return { fx: { t, stage: stages[i], pollenA: 0.55 } };
  }
  // «ripe» и «orchard»: та же ветка, спелые яблоки среди листьев
  return { fx: { t, stage: 4, showB: tag !== "orchard" } };
};

const leafFx = (T: Timeline, D: Direction, t: number) => {
  const k = (at: number, d = 0.7) => clamp((t - at) / d);
  return {
    t,
    light: k(D.wordAt(17, "солнечный", 0.55) - 0.1, 1.0),
    water: k(D.wordAt(18, "воду", 0.3) - 0.1),
    air: k(D.wordAt(18, "воздуха", 0.62) - 0.1),
    food: k(D.wordAt(18, "питание", 0.8) - 0.1, 1.0),
  };
};

const ShotView: React.FC<{ shot: Shot; T: Timeline; D: Direction; t: number }> = ({ shot, T, D, t }) => {
  const u = clamp((t - shot.from) / Math.max(0.01, shot.to - shot.from));
  if (shot.set === "room") {
    const c = camAt(shot, t);
    const h = (c.w * 9) / 16;
    const s = smoothRoomState(T, D, t);
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox={`${c.cx - c.w / 2} ${c.cy - h / 2} ${c.w} ${h}`}>
          <RoomWorld s={s} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (shot.set === "garden") {
    if (shot.tag === "growth") {
      const g = growthState(T, D, t);
      return (
        <AbsoluteFill>
          <GardenView s={g.s} cam={g.cam} />
          {g.next ? (
            <AbsoluteFill style={{ opacity: g.mix }}>
              <GardenView s={g.next} cam={g.cam} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      );
    }
    const s = shot.tag === "spring" ? springState(t) : shot.tag === "leaves" ? { t, season: "summer" as const, treeA: SUMMER_TREE, treeB: { season: "summer" as const } } : rootsState(T, D, t);
    return (
      <AbsoluteFill>
        <GardenView s={s} cam={camAt(shot, t)} />
      </AbsoluteFill>
    );
  }
  if (shot.set === "cut") {
    const cu = 0.15 + (0.67 * (t - D.A.cutDown0)) / (D.A.cutDown1 - D.A.cutDown0);
    return (
      <AbsoluteFill>
        <CutInsert u={clamp(cu)} t={t} />
      </AbsoluteFill>
    );
  }
  if (shot.set === "leaf") {
    return (
      <AbsoluteFill>
        <LeafPlate fx={leafFx(T, D, t)} u={u} />
      </AbsoluteFill>
    );
  }
  const b = bloomFx(T, D, t, shot.tag ?? "bee");
  const cam = camAt(shot, t);
  return (
    <AbsoluteFill>
      <BloomView fx={b.fx} cam={cam} />
      {b.next ? (
        <AbsoluteFill style={{ opacity: b.mix }}>
          <BloomView fx={b.next} cam={cam} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- Звук ----------
const SFX = "audio/lesson80-1-2/sfx";
const SFX1 = "audio/lesson01/sfx";
const A2Audio: React.FC<{ T: Timeline; D: Direction }> = ({ T, D }) => {
  const fps = T.fps;
  const f = (sec: number) => Math.round(sec * fps);
  const total = T.frames;
  const fadeVol = (dur: number, v: number, fin = 10, fout = 10) => (fr: number) => interpolate(fr, [0, fin, Math.max(fin + 1, dur - fout), dur], [0, v, v, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const span = (from: number, to: number, src: string, v: number, key: string, trim = 0, fin = 12, fout = 12) => {
    const a = f(from);
    const dur = Math.max(2, f(to) - a);
    return (
      <Sequence key={key} from={a} durationInFrames={dur}>
        <Audio src={staticFile(src)} loop trimBefore={trim} volume={fadeVol(dur, v, fin, fout)} />
      </Sequence>
    );
  };
  const one = (at: number, src: string, v: number, key: string, len = 1.2) => (
    <Sequence key={key} from={f(at)} durationInFrames={f(len)}>
      <Audio src={staticFile(src)} volume={v} />
    </Sequence>
  );
  // птицы — только на планах сада (кроме дождя), тише речи
  const outdoor = D.shots.filter((s) => s.set !== "room" && s.set !== "cut");
  const H = T.hold;
  const S = T.seg;
  const n = D.n;
  const rain0 = D.wordAt(14, "впитывают", 0.45);
  const rainOff = S[n(16)].start + 1.2;
  const bee0 = D.bee0;
  return (
    <>
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX1}/roomtone.wav`)} loop volume={(fr) => interpolate(fr, [0, 20, total - 40, total], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
      {outdoor.map((s, i) => (s.tag === "roots" && s.from > rain0 - 1 && s.from < rainOff ? null : span(s.from, s.to + 0.25, `${SFX1}/birds.wav`, 0.5, `b${i}`, f((i * 3.7) % 9))))}
      {/* дождь — только пока он идёт в кадре сада */}
      {span(rain0, S[n(15)].start - 0.1, `${SFX}/rain.wav`, 0.5, "rain1", 0, 24, 8)}
      {span(S[n(15)].end + 0.35, rainOff, `${SFX}/rain.wav`, 0.4, "rain2", f(3), 8, 24)}
      {/* полив из лейки */}
      {span(D.wordAt(16, "люди", 0.35) + 0.8, H.watering.end - 0.3, `${SFX}/pour.wav`, 0.4, "pour", 0, 12, 14)}
      {/* пчела — коротко, около видимой пчелы */}
      {span(bee0 + 0.2, Math.min(bee0 + BEE_T.arriveA + 0.1, S[n(19)].start - 0.15), `${SFX}/bee.wav`, 0.22, "bee1", 0, 12, 8)}
      {span(Math.max(bee0 + BEE_T.leaveA - 0.1, S[n(19)].end + 0.3), bee0 + BEE_T.arriveB + 0.1, `${SFX}/bee.wav`, 0.2, "bee2", f(1), 8, 8)}
      {span(bee0 + BEE_T.leaveB - 0.1, Math.min(bee0 + BEE_T.end, H.pollinate.end), `${SFX}/bee.wav`, 0.16, "bee3", f(2), 8, 14)}
      {/* касания предметов */}
      {one(D.sfx.applePlace, `${SFX}/apple-place.wav`, 0.75, "ap")}
      {one(D.sfx.knifeUp, `${SFX}/knife-pick.wav`, 0.4, "kp")}
      {D.sfx.cut.map((c, i) => one(c, `${SFX}/cut-${i + 1}.wav`, 0.55, `ct${i}`))}
      {one(D.sfx.knifeDown, `${SFX}/knife-place.wav`, 0.45, "kd")}
      {one(D.sfx.halves, `${SFX}/halves.wav`, 0.5, "hv")}
      {one(D.sfx.seedDrop, `${SFX}/seed-drop.wav`, 0.5, "sd")}
      {one(D.sfx.saucerSlide, `${SFX}/saucer-slide.wav`, 0.45, "ss", 1.4)}
      {/* голоса */}
      {Object.values(T.seg)
        .filter((s) => s.m.file)
        .map((s) => (
          <Sequence key={s.m.segId} from={f(s.fileStart)} durationInFrames={Math.ceil(s.m.durationSec * fps) + 2}>
            <Audio src={staticFile(`${A2_VIDEO.voiceDir}/${s.m.file}`)} volume={1} />
          </Sequence>
        ))}
    </>
  );
};

export const subtitleAt = (T: Timeline, t: number): string | null => {
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const next = segs[i + 1];
    const end = Math.min(s.end + 0.6, next ? next.start - 0.05 : s.end + 0.6);
    if (t >= s.start - 0.05 && t <= end) return A2_LINES.find((l) => l.id === s.line)?.text ?? null;
  }
  return null;
};

export const WhatIsInsideApple: React.FC<WhatIsInsideAppleProps> = ({ manifest, subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useMemo(() => buildTimeline(manifest, fps), [manifest, fps]);
  const D = useMemo(() => buildDirection(T), [T]);
  const t = frame / fps;
  const shot = shotAt(D, t);
  const prev = prevShot(D, shot);
  const fadeU = shot.fade ? clamp((t - shot.from) / shot.fade) : 1;
  const H = T.hold;
  const n = D.n;
  const o: OverlayTimes = {
    titleIn: H.reveal.start + 0.5,
    titleOut: T.seg[n(5)].start - 0.2,
    yearsIn: D.gIns + (H.growth.end - D.gIns) * 0.36,
    yearsOut: D.gIns + (H.growth.end - D.gIns) * 0.86,
    finalIn: [D.wordAt(43, "Замечайте", 0.55), D.wordAt(43, "размышляйте", 0.75), D.wordAt(43, "благодарите", 0.85)],
  };
  const sub = subtitles ? subtitleAt(T, t) : null;
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      {prev && fadeU < 1 ? <ShotView shot={prev} T={T} D={D} t={t} /> : null}
      <AbsoluteFill style={{ opacity: fadeU }}>
        <ShotView shot={shot} T={T} D={D} t={t} />
      </AbsoluteFill>
      <Overlays t={t} o={o} subtitle={sub} />
      <A2Audio T={T} D={D} />
    </AbsoluteFill>
  );
};
