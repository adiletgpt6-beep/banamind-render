// Композиция Lesson01WhoBuiltTheHouse: «Урок 1. Аллах — наш Создатель.
// Анимация 1: Кто построил домик?» — 1920×1080, 30 к/с.
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { blinkAt, lookAt, speakingMouth } from "./anim";
import { buildDirection, CARRY_DUR, camAt, type Direction, prevShot, type Shot, shotAt, smoothWorldState } from "./direction";
import { type OverlayTimes, Overlays } from "./Overlays";
import { clamp } from "./rig/geom";
import { AMIR, BILAL, TEACHER, YUSUF, type Look } from "./rig/looks";
import { FACE0, type Pose } from "./rig/pose";
import { stand } from "./rig/presets";
import { L1_VIDEO } from "./script";
import { ExteriorSet } from "./sets/Exterior";
import { HomeSet } from "./sets/Home";
import { Plate } from "./sets/Plates";
import { buildTimeline, type Manifest, type Timeline } from "./timeline";
import { World } from "./World";

export type Lesson01Props = { manifest: Manifest | null; subtitles: boolean };

// ---------- Снаружи у окна ----------
const EXT: { role: "teacher" | "bilal" | "amir" | "yusuf"; look: Look; x: number; y: number; s: number; yaw: number }[] = [
  { role: "teacher", look: TEACHER, x: 960, y: 1175, s: 1.0, yaw: 0.05 },
  { role: "bilal", look: BILAL, x: 715, y: 1100, s: 1.0, yaw: 0.28 },
  { role: "amir", look: AMIR, x: 1205, y: 1050, s: 1.0, yaw: -0.3 },
  { role: "yusuf", look: YUSUF, x: 1010, y: 1055, s: 1.0, yaw: -0.12 },
];

const exteriorChars = (T: Timeline, t: number) => {
  const spk = Object.values(T.seg).find((s) => t >= s.start - 0.2 && t <= s.end + 0.3 && s.role !== "kids");
  return EXT.map((c) => {
    let pose: Pose = stand(c.look, c.yaw);
    const mouth = speakingMouth(
      Object.values(T.seg).filter((s) => s.role === c.role),
      t,
    );
    // смотрят наружу, на дерево; на говорящего — коротко переводят взгляд
    let gaze = { x: -0.35 + c.yaw * 0.3, y: 0.15 };
    let yaw = c.yaw * 0.6 - 0.15;
    if (spk && spk.role !== c.role) {
      const other = EXT.find((e) => e.role === spk.role)!;
      const la = lookAt(other.x - c.x, (other.y - other.look.body.height * other.s) - (c.y - c.look.body.height * c.s));
      gaze = la.gaze;
      yaw = la.yaw * 0.7;
    }
    if (c.role === "teacher" && spk?.role === "teacher") {
      // небольшой открытый жест к окну
      pose = { ...pose, armL: { a1: 0, a2: 0, target: { x: 60, y: -470 }, bend: 1, hand: "palmUp", handRot: 0, handAbs: 105, front: true } };
    }
    pose = { ...pose, headYaw: yaw, headPitch: 0.05 };
    return {
      uid: `ext-${c.role}`,
      look: c.look,
      pose,
      face: { ...FACE0, smile: 0.45, gaze, blink: blinkAt(`ext-${c.role}`, t), mouthOpen: mouth.open, mouthWide: mouth.wide, mouthRound: mouth.round },
      x: c.x,
      y: c.y,
      scale: c.s,
    };
  });
};

const smoothExterior = (T: Timeline, t: number) => {
  const dts = [0, 0.08, 0.16, 0.24, 0.32];
  const w = [0.3, 0.25, 0.2, 0.15, 0.1];
  const all = dts.map((dt) => exteriorChars(T, Math.max(0, t - dt)));
  return all[0].map((c, i) => ({
    ...c,
    pose: { ...c.pose, headYaw: all.reduce((a, s, k) => a + s[i].pose.headYaw * w[k], 0) },
    face: { ...c.face, gaze: { x: all.reduce((a, s, k) => a + s[i].face.gaze.x * w[k], 0), y: all.reduce((a, s, k) => a + s[i].face.gaze.y * w[k], 0) } },
  }));
};

const ShotView: React.FC<{ shot: Shot; T: Timeline; D: Direction; t: number }> = ({ shot, T, D, t }) => {
  const u = clamp((t - shot.from) / Math.max(0.01, shot.to - shot.from));
  if (shot.set === "world") {
    const c = camAt(shot, t);
    const h = (c.w * 9) / 16;
    const s = smoothWorldState(T, D, t, Boolean(shot.memory));
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox={`${c.cx - c.w / 2} ${c.cy - h / 2} ${c.w} ${h}`}>
          <World s={s} />
        </svg>
        {shot.memory ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 35%, rgba(255,214,150,0.16), rgba(255,190,120,0.2))", mixBlendMode: "multiply" }} /> : null}
      </AbsoluteFill>
    );
  }
  if (shot.set === "exterior") {
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox={`${350 + 10 * u} ${200 + 6 * u} ${1220 - 20 * u} ${686 - 11 * u}`}>
          <ExteriorSet t={t} chars={smoothExterior(T, t)} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (shot.set === "home") {
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox={`${360 + 15 * u} ${330 + 8 * u} ${1260 - 30 * u} ${709 - 17 * u}`}>
          <HomeSet t={t} u={u} />
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <Plate kind={shot.plate!} t={t} u={u} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Звук ----------
const SFX = "audio/lesson01/sfx";
const L1Audio: React.FC<{ T: Timeline; D: Direction }> = ({ T, D }) => {
  const fps = T.fps;
  const f = (sec: number) => Math.round(sec * fps);
  const H = T.hold;
  const total = T.frames;
  // природа: птицы — только на планах окна и природы (не ночью)
  const birdSpans = D.shots.filter((s) => s.set === "exterior" || (s.set === "plate" && s.plate !== "night" && s.plate !== "earth"));
  const contacts: { at: number; kind: "pick" | "place" }[] = [];
  const carry = (t0: number) => contacts.push({ at: t0 + 0.8, kind: "pick" }, { at: t0 + 2.15, kind: "place" });
  D.memJobs.forEach((j) => carry(j.t0));
  carry(H.placeTree.start + 0.15);
  void CARRY_DUR;
  return (
    <>
      {/* тихая комната */}
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX}/roomtone.wav`)} loop volume={(fr) => interpolate(fr, [0, 20, total - 40, total], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
      {birdSpans.map((s, i) => {
        const from = f(s.from);
        const dur = Math.max(1, f(s.to) - from + 8);
        return (
          <Sequence key={`b${i}`} from={from} durationInFrames={dur}>
            <Audio src={staticFile(`${SFX}/birds.wav`)} trimBefore={f((i * 3.7) % 9)} volume={(fr) => interpolate(fr, [0, 10, dur - 10, dur], [0, 0.55, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          </Sequence>
        );
      })}
      {contacts.map((c, i) => (
        <Sequence key={`c${i}`} from={f(c.at)} durationInFrames={f(0.8)}>
          <Audio src={staticFile(`${SFX}/wood-${c.kind}-${(i % 2) + 1}.wav`)} volume={c.kind === "place" ? 0.8 : 0.45} />
        </Sequence>
      ))}
      {/* голоса */}
      {Object.values(T.seg)
        .filter((s) => s.m.file)
        .map((s) => (
          <Sequence key={s.m.segId} from={f(s.fileStart)} durationInFrames={Math.ceil(s.m.durationSec * fps) + 2}>
            <Audio src={staticFile(`${L1_VIDEO.voiceDir}/${s.m.file}`)} volume={1} />
          </Sequence>
        ))}
    </>
  );
};

export const Lesson01: React.FC<Lesson01Props> = ({ manifest, subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useMemo(() => buildTimeline(manifest, fps), [manifest, fps]);
  const D = useMemo(() => buildDirection(T), [T]);
  const t = frame / fps;
  const shot = shotAt(D, t);
  const prev = prevShot(D, shot);
  const fadeU = shot.fade ? clamp((t - shot.from) / shot.fade) : 1;
  const o: OverlayTimes = {
    titleIn: T.seg.L04.end + 0.35,
    titleOut: T.hold.title.end,
    morningIn: T.hold.memory.start + 0.5,
    morningOut: T.hold.memory.end - 0.3,
    finalIn: D.wordAt("L40", "Его", 0.85),
  };
  const sub = subtitles ? (Object.values(T.seg).find((s) => t >= s.start - 0.1 && t <= s.end + 0.4)?.m.text ?? null) : null;
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      {prev && fadeU < 1 ? <ShotView shot={prev} T={T} D={D} t={t} /> : null}
      <AbsoluteFill style={{ opacity: fadeU }}>
        <ShotView shot={shot} T={T} D={D} t={t} />
      </AbsoluteFill>
      <Overlays t={t} o={o} subtitle={sub} />
      <L1Audio T={T} D={D} />
    </AbsoluteFill>
  );
};
