import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ARM, Character, mixArm, type Expr } from "../Character";
import { School } from "../sets";
import { ClockFace } from "../props";
import { MS_TEXT } from "../script";
import { useLineCue, useMouth, useSceneLength } from "../StoryContext";
import { Caption, Feet, ramp } from "../ui";

const C = MS_TEXT.captions;
// Время на часах: в конце сцены 8 — 08:06; сцена 9 начинается с этих часов.
export const SCHOOL_END_MIN = 8 * 60 + 6;

// ---------- Сцена 8: мектепке кечигүү ----------
export const SchoolScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s08School");
  const e01 = useLineCue("s08School", "e01");
  const m08 = useLineCue("s08School", "m08");
  const d02 = useLineCue("s08School", "d02");
  const m09 = useLineCue("s08School", "m09");
  const mouthMom = useMouth("s08School", "mother");
  const mouthGirl = useMouth("s08School", "daughter");
  const mouthTeacher = useMouth("s08School", "teacher");
  const bell = ramp(t, 0, 4) - ramp(t, 60, 70);
  // мама и дочь торопливо подходят ко входу
  const walk = ramp(t, 0, 64);
  const momX = -160 + 400 * walk;
  const girlX = -40 + 420 * walk;
  // дочь заходит в школу: поднимается по ступеням к двери
  const goAt = m09.end + 6;
  const enter = ramp(t, goAt, goAt + 40);
  const girlInX = girlX + (540 - girlX) * ramp(t, goAt, goAt + 20);
  const girlFeet = 1720 - 300 * ramp(t, goAt + 14, goAt + 40);
  const girlH = 560 - 80 * ramp(t, goAt + 14, goAt + 40);
  const inside = enter >= 1;
  const doorOpen = 1 - ramp(t, goAt + 44, goAt + 60);
  // мама смотрит на часы → часы на весь кадр (переход к офису)
  const watchAt = Math.max(goAt + 56, len - 50);
  const zoom = ramp(t, len - 22, len);
  const momExpr: Expr =
    t < e01.start
      ? "worried"
      : t < m08.end + 4
        ? "embarrassed"
        : t < d02.start
          ? "neutral"
          : t < goAt + 30
            ? "smile"
            : "worried";
  const girl = (
    <Character
      kind="girl"
      height={girlH}
      expr={t >= d02.start - 4 && t < goAt ? "smile" : "calm"}
      mouth={mouthGirl}
      look={t >= d02.start - 4 && t < goAt ? -1 : 0}
      jacket="#6CB4C6"
      backpack
      legs={(walk > 0 && walk < 1) || (enter > 0 && enter < 1) ? "walk" : "stand"}
      walk={t}
      armR={t >= d02.start && t < d02.end + 10 ? mixArm(ARM.down, ARM.wave, ramp(t, d02.start, d02.start + 8)) : ARM.down}
      seed={15}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <School doorOpen={doorOpen} bell={bell} label={MS_TEXT.school}>
        {inside ? (
          <Feet x={girlInX} y={girlFeet} height={girlH}>
            {girl}
          </Feet>
        ) : null}
      </School>
      {/* учитель у входа */}
      <Feet x={830} y={1690} height={900}>
        <Character kind="teacher" height={900} expr={t >= e01.start - 6 && t < e01.end + 10 ? "neutral" : "calm"} mouth={mouthTeacher} look={-1} armL={ARM.hold} armR={ARM.down} itemL="folder" seed={16} />
      </Feet>
      {!inside ? (
        <Feet x={girlInX} y={girlFeet} height={girlH}>
          {girl}
        </Feet>
      ) : null}
      <Feet x={momX} y={1760} height={960}>
        <Character
          kind="mom"
          height={960}
          expr={momExpr}
          mouth={mouthMom}
          look={t < d02.start ? 1 : t < goAt + 30 ? 0.8 : 0}
          headTilt={t >= m08.start - 4 && t < m08.end + 10 ? 8 : 0}
          legs={walk > 0 && walk < 1 ? "walk" : "stand"}
          walk={t}
          armR={t >= m09.start - 4 && t < goAt + 20 ? mixArm(ARM.down, ARM.waveB, ramp(t, m09.start - 4, m09.start + 6)) : ARM.down}
          armL={t >= watchAt ? mixArm(ARM.down, ARM.watch, ramp(t, watchAt, watchAt + 12)) : ARM.down}
          bag
          seed={17}
        />
      </Feet>
      {/* часы на руке → на весь кадр */}
      {zoom > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 540 - (60 + 2340 * zoom) / 2 + (1 - zoom) * (momX + 30 - 540),
            top: 960 - (60 + 2340 * zoom) / 2 + (1 - zoom) * (1180 - 960),
          }}
        >
          <ClockFace size={60 + 2340 * zoom} minutes={SCHOOL_END_MIN} />
        </div>
      ) : null}
      <Caption text={C.school} frame={t} at={12} out={len - 26} />
    </AbsoluteFill>
  );
};
