// Сцены вступления: приветствие, книга, аят, три фразы, четыре дороги, заставки частей.
import React from "react";
import { C, FONT } from "../theme";
import type { HostSpot } from "../types";
import { Book, Fly, Flower, OL, Person, Tree } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// центр области схемы в зависимости от места банана
export const zoneX = (host: unknown) => {
  const h = host as HostSpot;
  return h === "left" ? 1170 : h === "right" ? 760 : h === "corner" ? 1080 : 960;
};

export const Hello: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const title = pop(t, 0.2);
  const items = [
    { k: at(c, 2.15), x: 330, y: 760, el: <Flower x={0} y={0} color={C.coral} s={1.3} t={t} /> },
    { k: at(c, 2.35), x: 520, y: 470, el: <Fly x={0} y={0} s={1.1} t={t} /> },
    { k: at(c, 2.55), x: 1600, y: 800, el: <Tree x={0} y={0} s={1.05} t={t} fruits={6} /> },
    { k: at(c, 2.8), x: 1380, y: 800, el: <Person x={0} y={0} s={1.3} color={C.sky} t={t} arms={0.4} /> },
  ];
  const q = pop(t, at(c, 4.3));
  return (
    <g>
      <g transform={`translate(960 ${150 + (1 - title) * -80}) scale(${0.6 + 0.4 * title})`} opacity={clamp01(title * 2)}>
        <Txt x={0} y={0} size={86} weight={900} color={C.ink}>
          Откуда всё это?
        </Txt>
        <Txt x={0} y={64} size={36} weight={700} color={C.inkSoft}>
          урок по книге «Трактат о природе»
        </Txt>
      </g>
      {items.map((it, i) => (
        <Pop key={i} t={t} at={it.k} x={it.x} y={it.y + wob(t, i, 6)}>
          {it.el}
        </Pop>
      ))}
      {q > 0 && (
        <g transform={`translate(1450 330) scale(${q}) rotate(${wob(t, 2, 3)})`}>
          <circle r={70} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={30} size={100} weight={900}>
            ?
          </Txt>
        </g>
      )}
    </g>
  );
};

export const BookScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const b = pop(t, 0.2);
  // сокращённая версия: автор и собрание (реплика 0), причина написания (реплика 1)
  const city = pop(t, at(c, 1));
  const worry = ramp(t, at(c, 1.4), 0.8);
  const arabic = 0;
  const turkish = 0;
  return (
    <g>
      <g transform={`translate(${x - 280} ${470}) scale(${b}) rotate(${wob(t, 0, 2)})`}>
        <Book x={0} y={0} s={1.25} color="#2f8f6a" title={"Трактат\nо природе"} />
      </g>
      <Pop t={t} at={at(c, 0.5)} x={x - 280} y={720}>
        <Tag x={0} y={0} text="Бадиуззаман Саид Нурси" size={30} color={C.white} />
      </Pop>
      <Pop t={t} at={at(c, 1.2)} x={x - 280} y={800}>
        <Tag x={0} y={0} text="собрание «Рисале-и Нур»" size={28} color={C.yellow} />
      </Pop>
      {city > 0 && (
        <g transform={`translate(${x + 230} 430) scale(${city})`}>
          <Panel x={-230} y={-210} w={460} h={400} fill="#fffaf0" />
          <Txt x={0} y={-150} size={38}>
            Анкара
          </Txt>
          {[-140, -60, 20, 100].map((hx, i) => (
            <g key={i} transform={`translate(${hx} ${60})`}>
              <rect x={-30} y={-90 - (i % 2) * 30} width={60} height={90 + (i % 2) * 30} fill={["#ffd9a8", "#cfe8ff", "#ffe3e3", "#e0f7e9"][i]} stroke={OL} strokeWidth={4} />
              <rect x={-14} y={-60 - (i % 2) * 30} width={12} height={14} fill={C.skyDeep} />
              <rect x={4} y={-60 - (i % 2) * 30} width={12} height={14} fill={C.skyDeep} />
            </g>
          ))}
          <g opacity={worry}>
            <path d={`M -170 ${-60} Q -60 ${-100 - wob(t, 1, 10)} 60 -70 T 170 -80`} stroke="#8b8fa3" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="4 22" />
            <Txt x={0} y={150} size={30} color={C.red}>
              «всё сделала природа»?
            </Txt>
          </g>
        </g>
      )}
      {arabic > 0 && (
        <g transform={`translate(${x + 120} 760) scale(${arabic})`}>
          <rect x={-90} y={-60} width={180} height={110} rx={14} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={0} y={-12} size={26}>
            {"брошюра\nна арабском"}
          </Txt>
        </g>
      )}
      {arabic > 0 && <Arrow x1={x + 220} y1={760} x2={x + 330} y2={760} k={ramp(t, at(c, 6), 0.5)} color={C.green} />}
      {turkish > 0 && (
        <g transform={`translate(${x + 440} 760) scale(${turkish})`}>
          <rect x={-90} y={-60} width={180} height={110} rx={14} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={-12} size={26}>
            {"понятнее\nна турецком"}
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Ayah: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const k = ramp(t, at(c, 0.6), 1.2);
  const text = "«Неужели вы сомневаетесь\nв Аллахе, Творце\nнебес и земли?»";
  return (
    <g>
      <g opacity={k} transform={`translate(${x} ${470}) scale(${0.92 + 0.08 * k})`}>
        <rect x={-500} y={-270} width={1000} height={540} rx={50} fill="#fffdf6" stroke="#e8c96a" strokeWidth={10} />
        <rect x={-470} y={-240} width={940} height={480} rx={36} fill="none" stroke="#f3dc95" strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" />
        {[-1, 1].map((d) =>
          [-1, 1].map((e) => (
            <g key={`${d}${e}`} transform={`translate(${d * 440} ${e * 210}) rotate(${t * 8})`}>
              <path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill="#e8c96a" />
            </g>
          )),
        )}
        <Txt x={0} y={-90} size={58} weight={800} color={C.ink}>
          {text}
        </Txt>
        <Txt x={0} y={190} size={30} weight={700} color={C.inkSoft}>
          Коран, сура 14, аят 10 (смысловой перевод)
        </Txt>
      </g>
      <Pop t={t} at={at(c, 3.3)} x={x} y={860}>
        <Tag x={0} y={0} text="Творец есть, и Он — Единственный" size={34} color={C.yellow} />
      </Pop>
    </g>
  );
};

export const ThreePhrases: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const items = [
    { b: 2, text: "«Создали причины»", color: "#cfe8ff" },
    { b: 3, text: "«Получилось само»", color: "#d8f5e1" },
    { b: 4, text: "«Так потребовала природа»", color: "#e8deff" },
  ];
  const nine = pop(t, at(c, 6));
  return (
    <g>
      <Pop t={t} at={0.3} x={x} y={170}>
        <Txt x={0} y={0} size={56} weight={900}>
          Три привычные фразы
        </Txt>
      </Pop>
      {items.map((it, i) => {
        const k = pop(t, at(c, it.b));
        if (k <= 0) return null;
        const y = 320 + i * 170;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k}) rotate(${wob(t, i, 1.2)})`}>
            <path d="M -380 -60 Q -380 -80 -360 -80 L 360 -80 Q 380 -80 380 -60 L 380 40 Q 380 60 360 60 L -300 60 L -340 100 L -330 60 L -360 60 Q -380 60 -380 40 Z" fill={it.color} stroke={OL} strokeWidth={5} />
            <circle cx={-310} cy={-10} r={40} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={-310} y={6} size={46} weight={900}>
              {String(i + 1)}
            </Txt>
            <Txt x={50} y={6} size={it.text.length > 20 ? 40 : 46} anchor="middle">
              {it.text}
            </Txt>
          </g>
        );
      })}
      {nine > 0 && (
        <g transform={`translate(${x} 840) scale(${nine})`}>
          <Tag x={0} y={0} text="3 фразы × 3 нелепости = 9" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

const ROADS = [
  { label: "Причины?", color: "#9cc9f5" },
  { label: "Само собой?", color: "#9fe0b5" },
  { label: "Природа?", color: "#c7b5f7" },
  { label: "Творец", color: C.yellow },
];

// перекрёсток четырёх дорог; blocked — сколько дорог уже закрыто (0…3)
export const Crossroads: React.FC<{ t: number; cx: number; show: number[]; blocked: number[]; open: number }> = ({ t, cx, show, blocked, open }) => (
  <g>
    <ellipse cx={cx} cy={820} rx={140} ry={40} fill="#e9d9b8" stroke={OL} strokeWidth={4} />
    {ROADS.map((r, i) => {
      const ang = -150 + i * 40;
      const rad = (ang * Math.PI) / 180;
      const ex = cx + Math.cos(rad) * 560;
      const ey = 790 + Math.sin(rad) * 560;
      const k = show[i];
      if (k <= 0) return null;
      const sx = cx + Math.cos(rad) * 560 * k;
      const sy = 790 + Math.sin(rad) * 560 * k;
      const glow = i === 3 ? open : 0;
      return (
        <g key={i}>
          <line x1={cx} y1={800} x2={sx} y2={sy} stroke="#e9d9b8" strokeWidth={70} strokeLinecap="round" />
          <line x1={cx} y1={800} x2={sx} y2={sy} stroke={glow ? C.yellow : "#fff"} strokeWidth={8} strokeDasharray="30 26" opacity={0.9} />
          {k > 0.95 && (
            <g transform={`translate(${ex} ${ey - 10}) rotate(${wob(t, i, 2)})`}>
              <rect x={-6} y={-10} width={12} height={90} fill="#8a5a2b" />
              <rect x={-130} y={-80} width={260} height={74} rx={18} fill={r.color} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-30} size={36}>
                {r.label}
              </Txt>
              {i < 3 && <Cross x={0} y={-42} s={90} k={blocked[i]} />}
              {i === 3 && glow > 0 && <Check x={150} y={-46} s={50} k={glow} />}
            </g>
          )}
        </g>
      );
    })}
  </g>
);

export const FourRoads: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const show = [1, 2, 3, 4].map((b) => ramp(t, at(c, b), 0.7));
  const blocked = [0, 0, 0];
  const q = ramp(t, at(c, 8), 0.4);
  return (
    <g>
      <Crossroads t={t} cx={x} show={show} blocked={blocked} open={ramp(t, at(c, 6), 0.8)} />
      <Pop t={t} at={at(c, 0.3)} x={x} y={300}>
        <g>
          <circle r={56} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={0} y={22} size={64} weight={900}>
            ?
          </Txt>
        </g>
      </Pop>
      <g opacity={q}>
        <Tag x={x} y={170} text="Всего дорог: 4" size={44} color={C.white} />
      </g>
    </g>
  );
};

export const Chapter: React.FC<VisualProps<{ n?: number; label?: string; host?: unknown }>> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const k = pop(t, 0.15);
  const n = Number(c.p.n ?? 1);
  return (
    <g>
      <g transform={`translate(${x} 420) scale(${k})`}>
        <circle r={150} fill={C.yellow} stroke={OL} strokeWidth={8} />
        <Txt x={0} y={-30} size={40} weight={800}>
          дорога
        </Txt>
        <Txt x={0} y={70} size={130} weight={900}>
          {String(n)}
        </Txt>
      </g>
      <Pop t={t} at={0.5} x={x} y={700}>
        <Txt x={0} y={0} size={72} weight={900}>
          {String(c.p.label ?? "")}
        </Txt>
      </Pop>
      <Pop t={t} at={at(c, 2)} x={x} y={800}>
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${(i - 1) * 120} 0)`}>
              <circle r={42} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={40}>
                {"!".repeat(i + 1)}
              </Txt>
            </g>
          ))}
        </g>
      </Pop>
      <text x={x} y={880} fontFamily={FONT} fontSize={30} fontWeight={700} fill={C.inkSoft} textAnchor="middle" opacity={ramp(t, at(c, 2), 0.6)}>
        три нелепости
      </text>
    </g>
  );
};
