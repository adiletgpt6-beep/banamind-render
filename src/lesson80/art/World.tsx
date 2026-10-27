// Весь мир 80-1-14 в одном SVG-слое. Порядок слоёв: комната → дальние дети →
// главные герои и учитель (корпус) → столик → предметы на столе → руки →
// ближние дети. Состояние кадра (позы, стаканы, лист) приходит готовым
// из src/lesson80/state.ts и зависит только от номера кадра.
import React from "react";
import { depthScale, KIDS, TEACHER, type Kid } from "../cast";
import { KidFigure, TeacherFigure, type BodyPose } from "./Body";
import { Cup, Jug, PencilCase, Stream, jugSpout, type PencilId } from "./Props";
import { LAYOUT, MainTable, RoomBack, SideTableBase, SpareCups } from "./Room";
import { SHEET, SheetContent, type SheetState } from "./Sheet";

export type CupState = { x: number; y: number; level: number; tilt: number };
export type SheetPlacement =
  // на столе: центр листа, поворот в плоскости стола (180° — к Билалу)
  | { mode: "table"; cx: number; cy: number; rot: number; lift: number }
  // на доске / в руках у доски: прямоугольник в мировых координатах
  | { mode: "upright"; x: number; y: number; w: number; tilt: number };

export type WorldState = {
  readonly frame: number;
  readonly kids: Record<string, BodyPose>;
  readonly teacher: { pose: BodyPose; standing: boolean; x: number; y: number; step: number };
  readonly cups: { yusuf: CupState; amir: CupState };
  readonly jug: { x: number; y: number; tilt: number; level: number };
  readonly stream: number; // 0…1
  readonly sheet: SheetPlacement;
  readonly sheetState: SheetState;
  readonly pencilHeld: PencilId | null;
  readonly magnets: number; // 0…2 установлено
};

// Лист на столе: плоскость стола даёт сжатие по вертикали.
export const TABLE_SQUASH = 0.42;
export const SHEET_TABLE_W = 180; // ширина листа в мире

export const sheetToWorld = (pl: SheetPlacement, sx: number, sy: number) => {
  if (pl.mode === "upright") {
    const k = pl.w / SHEET.w;
    const t = (pl.tilt * Math.PI) / 180;
    const lx = (sx - SHEET.w / 2) * k;
    const ly = (sy - SHEET.h / 2) * k;
    return { x: pl.x + pl.w / 2 + lx * Math.cos(t) - ly * Math.sin(t), y: pl.y + (SHEET.h * k) / 2 + lx * Math.sin(t) + ly * Math.cos(t) };
  }
  const k = SHEET_TABLE_W / SHEET.w;
  const r = (pl.rot * Math.PI) / 180;
  const lx = (sx - SHEET.w / 2) * k;
  const ly = (sy - SHEET.h / 2) * k;
  const px = lx * Math.cos(r) - ly * Math.sin(r);
  const py = lx * Math.sin(r) + ly * Math.cos(r);
  return { x: pl.cx + px, y: pl.cy + py * TABLE_SQUASH - pl.lift };
};

const SheetInWorld: React.FC<{ pl: SheetPlacement; st: SheetState; magnets?: number }> = ({ pl, st, magnets = 0 }) => {
  if (pl.mode === "upright") {
    const k = pl.w / SHEET.w;
    return (
      <g transform={`translate(${pl.x + pl.w / 2} ${pl.y + (SHEET.h * k) / 2}) rotate(${pl.tilt}) scale(${k}) translate(${-SHEET.w / 2} ${-SHEET.h / 2})`}>
        <rect x={4} y={5} width={SHEET.w} height={SHEET.h} fill="rgba(70,50,30,0.18)" />
        <SheetContent s={st} uid="w" />
        {/* кнопки, как у общего плаката */}
        {magnets >= 1 ? <circle cx={10} cy={12} r={7.5} fill="#D2463F" /> : null}
        {magnets >= 2 ? <circle cx={SHEET.w - 10} cy={12} r={7.5} fill="#D2463F" /> : null}
      </g>
    );
  }
  void 0;
  const k = SHEET_TABLE_W / SHEET.w;
  return (
    <g>
      <g transform={`translate(${pl.cx + 4} ${pl.cy + 3}) scale(1 ${TABLE_SQUASH}) rotate(${pl.rot}) scale(${k}) translate(${-SHEET.w / 2} ${-SHEET.h / 2})`}>
        <rect x={0} y={0} width={SHEET.w} height={SHEET.h} fill="rgba(80,50,25,0.09)" />
      </g>
      <g transform={`translate(${pl.cx} ${pl.cy - pl.lift}) scale(1 ${TABLE_SQUASH}) rotate(${pl.rot}) scale(${k}) translate(${-SHEET.w / 2} ${-SHEET.h / 2})`}>
        <SheetContent s={st} uid="t" />
      </g>
    </g>
  );
};

const BgKidCup: React.FC<{ k: Kid; s: number }> = ({ k, s }) => {
  // личный стакан фонового мальчика — на ковре сбоку, со своей отметкой
  const side = k.turn > 0 ? 1 : -1;
  const level = 0.35 + ((parseInt(k.id.slice(1), 10) * 37) % 50) / 100;
  return <Cup x={k.x + side * 92 * s} y={k.y + 6} level={level} mark={k.cupMark} uid={`bg-${k.id}`} scale={s * 0.9} />;
};

const KidAt: React.FC<{ k: Kid; pose: BodyPose; layer: "body" | "arms" | "all" }> = ({ k, pose, layer }) => {
  const s = k.behindTable ? 1 : depthScale(k.y);
  return (
    <g transform={`translate(${k.x} ${k.y}) scale(${s})`}>
      <KidFigure k={k} pose={pose} layer={layer} />
    </g>
  );
};

export const World: React.FC<{ st: WorldState }> = ({ st }) => {
  const bg = KIDS.filter((k) => !k.behindTable);
  const back = bg.filter((k) => k.y < 1300);
  const front = bg.filter((k) => k.y >= 1300);
  const main = KIDS.filter((k) => k.behindTable);
  const T = st.teacher;
  const teacherScale = T.standing ? depthScale(T.y) : 1;
  const jugOnSide = st.jug.y < 1100;
  const spout = jugSpout(st.jug.x, st.jug.y, st.jug.tilt);
  const amirCup = st.cups.amir;
  const sheetOnTable = st.sheet.mode === "table";
  return (
    <g>
      <RoomBack frame={st.frame} />
      {/* дальние ряды */}
      {back
        .slice()
        .sort((a, b) => a.y - b.y)
        .map((k) => (
          <g key={k.id}>
            <KidAt k={k} pose={st.kids[k.id]} layer="all" />
            <BgKidCup k={k} s={depthScale(k.y)} />
          </g>
        ))}
      {/* учитель у доски (стоя) — позади столика с водой */}
      {T.standing ? (
        <g transform={`translate(${T.x} ${T.y}) scale(${teacherScale})`}>
          <TeacherFigure look={TEACHER} pose={T.pose} standing layer="all" step={T.step} />
        </g>
      ) : null}
      {!sheetOnTable ? <SheetInWorld pl={st.sheet} st={st.sheetState} magnets={st.magnets} /> : null}
      <SideTableBase />
      <SpareCups />
      {/* второй, полный кувшин остаётся на столике с водой */}
      <Jug x={LAYOUT.sideTable.x + 50} y={LAYOUT.sideTable.y - 6} level={0.85} uid="spare" />
      {jugOnSide ? <Jug x={st.jug.x} y={st.jug.y} tilt={st.jug.tilt} level={st.jug.level} uid="main" /> : null}
      {/* главные герои за столиком */}
      {main.map((k) => (
        <KidAt key={k.id} k={k} pose={st.kids[k.id]} layer="body" />
      ))}
      {!T.standing ? (
        <g transform={`translate(${T.x} ${T.y})`}>
          <TeacherFigure look={TEACHER} pose={T.pose} standing={false} layer="body" />
        </g>
      ) : null}
      <MainTable />
      <PencilCase x={1680} y={1192} held={st.pencilHeld} sx={0.9} sy={0.42} />
      {sheetOnTable ? <SheetInWorld pl={st.sheet} st={st.sheetState} /> : null}
      <Cup x={st.cups.yusuf.x} y={st.cups.yusuf.y} level={st.cups.yusuf.level} tilt={st.cups.yusuf.tilt} mark="#F2B705" uid="yusuf" shadow={st.cups.yusuf.y > 1180 && st.cups.yusuf.tilt === 0} />
      <Cup x={amirCup.x} y={amirCup.y} level={amirCup.level} tilt={amirCup.tilt} mark="#3E78C9" uid="amir" shadow={amirCup.y > 1180 && amirCup.tilt === 0} />
      {!jugOnSide ? <Jug x={st.jug.x} y={st.jug.y} tilt={st.jug.tilt} level={st.jug.level} uid="main" shadow={st.jug.tilt === 0} /> : null}
      <Stream x1={spout.x} y1={spout.y} x2={amirCup.x} y2={amirCup.y - 8 - 30 * amirCup.level} amount={st.stream} frame={st.frame} />
      {main.map((k) => (
        <KidAt key={k.id} k={k} pose={st.kids[k.id]} layer="arms" />
      ))}
      {!T.standing ? (
        <g transform={`translate(${T.x} ${T.y})`}>
          <TeacherFigure look={TEACHER} pose={T.pose} standing={false} layer="arms" />
        </g>
      ) : null}
      {front
        .slice()
        .sort((a, b) => a.y - b.y)
        .map((k) => (
          <g key={k.id}>
            <KidAt k={k} pose={st.kids[k.id]} layer="all" />
            <BgKidCup k={k} s={depthScale(k.y)} />
          </g>
        ))}
    </g>
  );
};
