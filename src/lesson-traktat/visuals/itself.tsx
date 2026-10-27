// Дорога вторая «Само получилось»: атомы-работники, дворец с куполами, книга и печать.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { Book, Bubble, Heart, OL } from "./draw";
import { zoneX } from "./intro";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const BODY_PTS = (() => {
  // точки силуэта человечка (голова + тело + руки + ноги)
  const pts: [number, number][] = [];
  for (let i = 0; i < 14; i++) pts.push([Math.cos((i / 14) * Math.PI * 2) * 60, -250 + Math.sin((i / 14) * Math.PI * 2) * 60]);
  for (let y = -170; y <= 0; y += 34) for (let x = -60; x <= 60; x += 40) pts.push([x, y]);
  for (let k = 1; k <= 4; k++) {
    pts.push([-60 - k * 30, -150 + k * 22], [60 + k * 30, -150 + k * 22]);
    pts.push([-36, k * 40], [36, k * 40]);
  }
  return pts;
})();

const Atom: React.FC<{ x: number; y: number; r?: number; color?: string; face?: boolean; t?: number; hat?: boolean; crown?: boolean }> = ({ x, y, r = 14, color = C.sky, face, t = 0, hat, crown }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={color} stroke={OL} strokeWidth={r > 20 ? 4 : 2} />
    {face && (
      <>
        <circle cx={-r * 0.32} cy={-r * 0.1} r={r * 0.16} fill={OL} />
        <circle cx={r * 0.32} cy={-r * 0.1} r={r * 0.16} fill={OL} />
        <path d={`M ${-r * 0.3} ${r * 0.3} Q 0 ${r * 0.55} ${r * 0.3} ${r * 0.3}`} stroke={OL} strokeWidth={Math.max(2, r * 0.08)} fill="none" />
      </>
    )}
    {hat && <path d={`M ${-r * 0.9} ${-r * 0.6} Q 0 ${-r * 1.6} ${r * 0.9} ${-r * 0.6} Z`} fill={C.yellowDeep} stroke={OL} strokeWidth={2} transform={`rotate(${wob(t, x, 4)})`} />}
    {crown && <path d={`M ${-r * 0.7} ${-r * 0.8} L ${-r * 0.7} ${-r * 1.4} L ${-r * 0.35} ${-r * 1.05} L 0 ${-r * 1.5} L ${r * 0.35} ${-r * 1.05} L ${r * 0.7} ${-r * 1.4} L ${r * 0.7} ${-r * 0.8} Z`} fill={C.yellow} stroke={OL} strokeWidth={3} />}
  </g>
);

export const Atoms: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const body = ramp(t, 0.2, 1.2);
  const workers = ramp(t, at(c, 5), 0.8);
  const dots = ramp(t, at(c, 6), 0.8);
  const big = pop(t, at(c, 7));
  const shrinkBody = ramp(t, at(c, 7) - 0.2, 0.6);
  const bx = x - 260 * (1 - shrinkBody * 0.3);
  return (
    <g>
      <g transform={`translate(${bx} ${720}) scale(${1.25 - shrinkBody * 0.45})`} opacity={body}>
        {BODY_PTS.map(([px, py], i) => {
          return (
            <Atom
              key={i}
              x={px + wob(t, i, 2.5)}
              y={py + wob(t * 1.3, i + 7, 2.5)}
              r={13 * (dots > 0 ? 1 - dots * 0.55 : 1) * (workers > 0 ? 1 + workers * 0.25 : 1)}
              color={i % 3 === 0 ? C.coral : i % 3 === 1 ? C.sky : C.green}
              face={workers > 0.5 && dots < 0.5}
              hat={workers > 0.5 && dots < 0.5}
              t={t}
            />
          );
        })}
        {dots > 0 && dots < 1 && (
          <g transform={`translate(${interpolate(dots, [0, 1], [-80, 80])} ${-260 + dots * 280}) rotate(25)`}>
            <rect x={-10} y={-120} width={20} height={110} rx={6} fill="#4a5874" stroke={OL} strokeWidth={3} />
            <path d="M -10 -10 L 0 16 L 10 -10 Z" fill="#c9a227" stroke={OL} strokeWidth={3} />
          </g>
        )}
      </g>
      {/* связь с миром через еду */}
      <g opacity={1 - ramp(t, at(c, 7) - 0.3, 0.3)}>
      <Pop t={t} at={at(c, 2)} x={x + 320} y={330}>
        <g>
          <circle r={50} fill={C.red} stroke={OL} strokeWidth={4} />
          <path d="M 0 -50 Q 10 -76 30 -80" stroke="#6b4a1e" strokeWidth={6} fill="none" />
          <ellipse cx={-90} cy={60} rx={60} ry={34} fill="#e8b36a" stroke={OL} strokeWidth={4} />
          <Txt x={-30} y={150} size={32}>
            еда
          </Txt>
        </g>
      </Pop>
      <Arrow x1={x + 230} y1={420} x2={bx + 90} y2={520} k={ramp(t, at(c, 2.4), 0.8) * (1 - shrinkBody)} color={C.green} bend={0.2} />
      <Pop t={t} at={at(c, 5.3)} x={x + 270} y={720}>
        <Tag x={0} y={0} text="работники Творца" size={36} color={C.yellow} />
      </Pop>
      </g>
      {/* у атома — свой глаз и ум ста гениев? */}
      {big > 0 && (
        <g transform={`translate(${x + 180} 600) scale(${big})`}>
          <Atom x={0} y={0} r={90} color={C.sky} face />
          <g transform="translate(0 -150)">
            <ellipse rx={80} ry={50} fill="#fff" stroke={OL} strokeWidth={5} />
            <circle r={30} fill="#2b6cb0" />
            <circle r={15} fill={OL} />
            <circle cx={8} cy={-8} r={6} fill="#fff" />
          </g>
          {ramp(t, at(c, 8), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 8), 0.5)}>
              <Bubble x={110} y={-330} w={300} h={130} tail={[70, -120]} />
              <Txt x={260} y={-280} size={32}>
                {"ум ста\nгениев?"}
              </Txt>
            </g>
          )}
          {ramp(t, at(c, 9), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 9), 0.5)}>
              {["прошлое", "родные", "еда", "весь мир"].map((w, i) => (
                <Tag key={w} x={-250 + (i % 2) * 500} y={-40 + Math.floor(i / 2) * 150} text={w} size={30} color={C.white} />
              ))}
            </g>
          )}
          <Cross x={0} y={0} s={200} k={ramp(t, at(c, 10.2), 0.6)} />
        </g>
      )}
    </g>
  );
};

export const Domes: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const palace = pop(t, 0.2);
  const arch = ramp(t, at(c, 2), 2.2);
  const organs = ramp(t, at(c, 3), 0.7);
  const atomsShow = ramp(t, at(c, 5), 0.6);
  const n = 11;
  return (
    <g>
      {/* дворец с куполами */}
      <g transform={`translate(${x} 380) scale(${palace})`} opacity={1 - atomsShow}>
        <rect x={-460} y={-40} width={920} height={200} fill="#fff1d6" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, i) => {
          const dx = -400 + i * 100;
          const h = 70 + (i % 3) * 25;
          const lift = Math.sin(t * 1.5 + i) * 2;
          return (
            <g key={i}>
              <path d={`M ${dx - 42} -40 Q ${dx - 42} ${-40 - h} ${dx} ${-40 - h - 20 + lift} Q ${dx + 42} ${-40 - h} ${dx + 42} -40 Z`} fill={i % 2 ? C.coral : C.yellow} stroke={OL} strokeWidth={4} />
              <rect x={dx - 14} y={20} width={28} height={50} rx={14} fill={C.skyDeep} opacity={0.7} />
            </g>
          );
        })}
        <Txt x={0} y={220} size={36}>
          дворец с тысячей куполов
        </Txt>
      </g>
      {/* арка из камней без подпорок */}
      <g transform={`translate(${x} 860)`} opacity={1 - atomsShow}>
        {Array.from({ length: n }).map((_, i) => {
          const a = Math.PI - (i / (n - 1)) * Math.PI;
          const k = clamp01(arch * n - i);
          if (k <= 0) return null;
          const rx = Math.cos(a) * 200;
          const ry = -Math.sin(a) * 200;
          return (
            <g key={i} transform={`translate(${rx} ${ry - (1 - k) * 120}) rotate(${(-a * 180) / Math.PI + 90})`} opacity={k}>
              <rect x={-24} y={-30} width={48} height={60} rx={8} fill={i % 2 ? "#d8c3a5" : "#c9b08c"} stroke={OL} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* органы-купола */}
      {organs > 0 && atomsShow < 1 && (
        <g opacity={organs * (1 - atomsShow)}>
          {[
            { dx: -330, label: "глаз" },
            { dx: 330, label: "язык" },
          ].map((o, i) => (
            <g key={i} transform={`translate(${x + o.dx} 760)`}>
              <path d="M -90 60 Q -90 -90 0 -100 Q 90 -90 90 60 Z" fill="#fff" stroke={OL} strokeWidth={5} />
              {i === 0 ? (
                <g transform="translate(0 0)">
                  <ellipse rx={50} ry={32} fill="#fff" stroke={OL} strokeWidth={4} />
                  <circle r={20} fill="#2b6cb0" />
                  <circle r={9} fill={OL} />
                </g>
              ) : (
                <path d="M -36 -10 Q -36 50 0 50 Q 36 50 36 -10 Z" fill="#ff8fa3" stroke={OL} strokeWidth={4} />
              )}
              <Txt x={0} y={110} size={34}>
                {o.label}
              </Txt>
            </g>
          ))}
        </g>
      )}
      <Pop t={t} at={at(c, 4)} x={x} y={150}>
        <g>
          <Heart x={-200} y={10} s={1.4} />
          <Tag x={40} y={0} text="а ещё душа и сердце" size={34} color={C.white} />
        </g>
      </Pop>
      {/* атом-командир и атом-подчинённый одновременно */}
      {atomsShow > 0 && (
        <g opacity={atomsShow} transform={`translate(${x} 520)`}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <Atom key={i} x={Math.cos(a) * 260} y={Math.sin(a) * 200} r={34} color={i % 2 ? C.green : C.coral} face t={t} />;
          })}
          <Atom x={0} y={0} r={70} color={C.sky} face crown={ramp(t, at(c, 5), 0.5) > 0.5} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const out = ramp(t, at(c, 5.3), 0.8);
            const inn = ramp(t, at(c, 6), 0.8);
            return (
              <g key={i}>
                <Arrow x1={Math.cos(a) * 80} y1={Math.sin(a) * 80} x2={Math.cos(a) * 210} y2={Math.sin(a) * 160} k={out} color={C.red} w={6} />
                <Arrow x1={Math.cos(a + 0.25) * 225} y1={Math.sin(a + 0.25) * 170} x2={Math.cos(a + 0.25) * 90} y2={Math.sin(a + 0.25) * 80} k={inn} color={C.skyDeep} w={6} />
              </g>
            );
          })}
          <Pop t={t} at={at(c, 5.4)} x={-330} y={-280}>
            <Tag x={0} y={0} text="командует всеми" size={30} color="#ffd6d6" />
          </Pop>
          <Pop t={t} at={at(c, 6.2)} x={330} y={-280}>
            <Tag x={0} y={0} text="и слушается всех?!" size={30} color="#d6ecff" />
          </Pop>
          <Pop t={t} at={at(c, 7)} x={0} y={300}>
            <g>
              <Tag x={0} y={0} text="так не бывает → один Создатель" size={36} color={C.yellow} />
              <Check x={330} y={-6} s={40} k={ramp(t, at(c, 7.3), 0.5)} />
            </g>
          </Pop>
        </g>
      )}
    </g>
  );
};

const LETTERS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";

export const Printing: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const hand = ramp(t, at(c, 1), 2.4);
  const blocks = ramp(t, at(c, 2), 3.5);
  const zoom = ramp(t, at(c, 4), 0.8);
  const circles = ramp(t, at(c, 5), 1.5);
  const chain = ramp(t, at(c, 7) - 0.4, 2.5);
  const phase2 = ramp(t, at(c, 4) - 0.3, 0.4);
  const phase3 = ramp(t, at(c, 7) - 0.3, 0.4);
  return (
    <g>
      {/* книга от руки — одно перо */}
      <g opacity={1 - phase2} transform={`translate(${x - 300} 470)`}>
        <Panel x={-200} y={-260} w={400} h={500} fill="#fffdf7" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const k = clamp01(hand * 6 - i);
          return <path key={i} d={`M -150 ${-190 + i * 60} q 25 -18 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0`} stroke={C.ink} strokeWidth={5} fill="none" strokeDasharray={340} strokeDashoffset={340 * (1 - k)} />;
        })}
        <g transform={`translate(${-150 + ((hand * 6) % 1) * 300} ${-200 + Math.min(5, Math.floor(hand * 6)) * 60}) rotate(30)`} opacity={hand > 0 && hand < 1 ? 1 : 0.6}>
          <rect x={-9} y={-110} width={18} height={100} rx={5} fill={C.violet} stroke={OL} strokeWidth={3} />
          <path d="M -9 -10 L 0 14 L 9 -10 Z" fill="#c9a227" stroke={OL} strokeWidth={3} />
        </g>
        <Tag x={0} y={300} text="1 перо" size={40} color={C.yellow} />
      </g>
      {/* печать — буковка на каждую букву */}
      <g opacity={(1 - phase2) * (blocks > 0 ? 1 : 0)} transform={`translate(${x + 230} 470)`}>
        <Panel x={-250} y={-260} w={500} h={500} fill="#eef2f7" />
        {Array.from({ length: 48 }).map((_, i) => {
          const k = clamp01(blocks * 48 - i);
          if (k <= 0) return null;
          const col = i % 8;
          const row = Math.floor(i / 8);
          return (
            <g key={i} transform={`translate(${-210 + col * 60} ${-220 + row * 70}) scale(${k})`}>
              <rect x={-24} y={-26} width={48} height={52} rx={6} fill="#b8c4d6" stroke={OL} strokeWidth={3} />
              <Txt x={0} y={12} size={32} color="#334155">
                {LETTERS[(i * 7) % LETTERS.length]}
              </Txt>
            </g>
          );
        })}
        <Tag x={0} y={300} text="литера на каждую букву" size={34} color={C.white} />
      </g>
      {/* буква-страница и круги в кругах */}
      {phase2 > 0 && phase3 < 1 && (
        <g opacity={phase2 * (1 - phase3)}>
          <g transform={`translate(${x - 250} 470) scale(${0.6 + zoom * 0.4})`}>
            <circle r={220} fill="#fff" stroke={OL} strokeWidth={8} />
            <Txt x={0} y={60} size={220} weight={900} color="#cbd5e1">
              Б
            </Txt>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={-140} y={-150 + i * 26} width={280 - (i % 3) * 30} height={8} rx={4} fill={C.inkSoft} opacity={0.6} />
            ))}
            <Tag x={0} y={260} text="тысячи перьев на одну букву!" size={30} color={C.yellow} />
          </g>
          <g transform={`translate(${x + 300} 470)`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} r={40 + i * 45} fill="none" stroke={[C.coral, C.green, C.sky, C.violet, C.yellowDeep][i]} strokeWidth={12} strokeDasharray={`${clamp01(circles * 5 - i) * 6.3 * (40 + i * 45)} 2000`} transform={`rotate(${t * (i % 2 ? 12 : -12)})`} />
            ))}
            <Pop t={t} at={at(c, 6)} x={0} y={290}>
              <Tag x={0} y={0} text="узоры в узорах" size={32} color={C.white} />
            </Pop>
          </g>
        </g>
      )}
      {/* бесконечная цепочка форм */}
      {phase3 > 0 && (
        <g opacity={phase3}>
          {[0, 1, 2, 3, 4].map((i) => {
            const k = clamp01(chain * 5 - i);
            if (k <= 0) return null;
            const bx = x - 480 + i * 240;
            return (
              <g key={i}>
                <g transform={`translate(${bx} 470) scale(${k * (1 - i * 0.12)})`}>
                  <rect x={-70} y={-70} width={140} height={140} rx={16} fill={["#b8c4d6", "#a7b4c8", "#95a3ba", "#8392ac", "#71819e"][i]} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={20} size={56} color="#fff">
                    {i === 0 ? "А" : "?"}
                  </Txt>
                </g>
                {i < 4 && <Arrow x1={bx + 80} y1={470} x2={bx + 160} y2={470} k={clamp01(chain * 5 - i - 0.5)} color={C.inkSoft} w={8} />}
              </g>
            );
          })}
          <Pop t={t} at={at(c, 7.6)} x={x} y={260}>
            <Tag x={0} y={0} text="а кто сделал формы? и так без конца…" size={34} color={C.white} />
          </Pop>
          <Cross x={x} y={470} s={260} k={ramp(t, at(c, 8.2), 0.6) * (1 - ramp(t, at(c, 10) - 0.3, 0.3))} />
          <Pop t={t} at={at(c, 10)} x={x} y={720}>
            <g>
              <Book x={-200} y={0} s={0.5} color={C.green} />
              <Tag x={80} y={0} text="ответ: одно перо!" size={44} color={C.yellow} />
            </g>
          </Pop>
        </g>
      )}
    </g>
  );
};
