// Вступление: одна точка на небе, путь к собственной планете, книга и честные
// метки голосов, четыре слоя «Окна доказательств».
import React from "react";
import { CLAIMS } from "../components/ClaimBadge";
import { LAYERS } from "../components/WindowFrame";
import { C } from "../theme";
import type { Claim } from "../types";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { BookSketch, Earth, MiniWindow, Note, Stage, StarField, Twinkle } from "./space";

// ── i01: одна точка на ночном небе и то, что люди о ней узнали ──
export const DotOnSky: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const facts = [
    { text: "расстояние", x: 330, y: 230, color: C.sky },
    { text: "состав", x: 950, y: 260, color: C.amber },
    { text: "движение", x: 300, y: 640, color: C.green },
    { text: "возраст", x: 960, y: 620, color: C.violet },
  ];
  const q = pop(t, at(c, 2) + 0.2);
  return (
    <Stage host={c.p.host}>
      <StarField x={40} y={140} w={1200} h={720} n={50} seed={11} o={0.55} r={1.9} />
      <g transform={`translate(640 440) scale(${1 + ramp(t, 0.1, 1.4) * 0.6})`}>
        <circle r={60} fill="#fff" opacity={0.08} />
        <Twinkle x={0} y={0} s={1.3} />
      </g>
      {facts.map((f, i) => {
        const k = pop(t, at(c, 1) + 0.25 + i * 0.35);
        if (k <= 0) return null;
        return (
          <g key={f.text} opacity={clamp01(k)}>
            <line x1={640} y1={440} x2={f.x} y2={f.y} stroke={f.color} strokeWidth={3} strokeDasharray="8 8" opacity={0.6} />
            <g transform={`translate(${f.x} ${f.y}) scale(${k})`}>
              <Tag x={0} y={0} text={f.text} color={f.color} size={38} />
            </g>
          </g>
        );
      })}
      {q > 0 && (
        <g transform={`translate(640 820) scale(${q})`}>
          <Txt x={0} y={0} size={110} color={C.yellow}>
            ?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── i02: окно отъезжает — в конце пути наша планета ──
export const PointToEarth: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const z = ramp(t, at(c, 0) + 0.5, 3);
  return (
    <Stage host={c.p.host}>
      <StarField x={40} y={130} w={1200} h={720} n={55} seed={23} o={0.6} r={1.9} />
      <g opacity={1 - z}>
        <Twinkle x={640} y={430} s={1.2} />
      </g>
      {z > 0 && (
        <g transform={`translate(640 450) scale(${0.25 + z * 0.75})`} opacity={clamp01(z * 1.6)}>
          <Earth x={0} y={0} r={190} spin={t * 0.03} />
        </g>
      )}
      <Pop t={t} at={at(c, 0) + 2.4} x={640} y={760}>
        <Tag x={0} y={0} text="наша собственная планета" color={C.sky} size={40} />
      </Pop>
    </Stage>
  );
};

// ── i03: книга, эпоха, голоса ──
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const voices = [
    { name: "Карл Саган", sub: "текст книги, 1980", color: C.skyDeep },
    { name: "Переводчик и редактор", sub: "примечания издания 2024", color: C.blue },
    { name: "BanaMind", sub: "наше окно и выводы", color: C.yellowDeep },
  ];
  const own = ramp(t, at(c, 2), 0.6);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={250} y={470}>
        <BookSketch x={0} y={0} s={0.95} rot={Math.sin(t * 0.6) * 2} />
      </Pop>
      <Pop t={t} at={at(c, 0) + 1.2} x={250} y={790}>
        <Note x={0} y={0} text="рисунок фильма, не обложка издания" />
      </Pop>
      {voices.map((v, i) => {
        const k = pop(t, at(c, 1) + 0.2 + i * 0.6);
        if (k <= 0) return null;
        return (
          <g key={v.name} transform={`translate(830 ${230 + i * 150}) scale(${k})`}>
            <Panel x={-330} y={-58} w={660} h={116} r={26} />
            <circle cx={-270} cy={0} r={30} fill={v.color} />
            <Txt x={-220} y={-6} size={36} anchor="start">
              {v.name}
            </Txt>
            <Txt x={-220} y={36} size={28} anchor="start" color={C.dim}>
              {v.sub}
            </Txt>
          </g>
        );
      })}
      {own > 0 && (
        <g opacity={own}>
          <Tag x={830} y={720} text="не аудиокнига · свой маршрут" color={C.yellow} size={38} />
        </g>
      )}
    </Stage>
  );
};

// ── i04: четыре слоя окна доказательств ──
export const WindowLayers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const active = Math.min(3, Math.floor(clamp01((t - at(c, 1)) / Math.max(1, at(c, 2) - at(c, 1) + 2)) * 4));
  const icons = ["глаз", "схема", "опыт", "поправка"];
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={330} y={430}>
        <MiniWindow x={0} y={0} s={1.25} active={t > at(c, 1) ? active : -1}>
          <StarField x={-200} y={-240} w={400} h={400} n={30} seed={5} r={2.2} />
          <Twinkle x={0} y={-40} s={0.9} />
        </MiniWindow>
      </Pop>
      {LAYERS.map((l, i) => {
        const k = pop(t, at(c, 1) + i * 0.7);
        if (k <= 0) return null;
        return (
          <g key={l.id} transform={`translate(${900} ${200 + i * 140}) scale(${k})`}>
            <Panel x={-260} y={-52} w={520} h={104} r={24} stroke={l.color} />
            <circle cx={-205} cy={0} r={26} fill={l.color} />
            <Txt x={-205} y={11} size={30} color={C.night}>
              {String(i + 1)}
            </Txt>
            <Txt x={-160} y={-4} size={38} anchor="start" color={l.color}>
              {l.label}
            </Txt>
            <Txt x={-160} y={34} size={26} anchor="start" color={C.dim}>
              {icons[i]}
            </Txt>
            {i < 3 && <Arrow x1={-240} y1={58} x2={-240} y2={84} k={1} w={5} color={C.faint} />}
          </g>
        );
      })}
      <Note x={640} y={830} text="окно и обсерватория — образ фильма, не сцена из книги" o={ramp(t, at(c, 2), 0.6)} />
    </Stage>
  );
};

// ── i05: метки голосов в углу кадра ──
export const Legend: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const list: Claim[] = ["book", "note", "model", "hypo", "update", "lab"];
  return (
    <Stage host={c.p.host}>
      <Txt x={640} y={190} size={46} color={C.yellow}>
        Кто говорит и насколько это надёжно
      </Txt>
      {list.map((k, i) => {
        const kk = pop(t, 0.4 + i * 0.45);
        if (kk <= 0) return null;
        const cl = CLAIMS[k];
        const x = i % 2 === 0 ? 340 : 940;
        const y = 310 + Math.floor(i / 2) * 150;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${kk})`}>
            <rect x={-280} y={-46} width={560} height={92} rx={46} fill="rgba(14,20,48,0.9)" stroke={cl.color} strokeWidth={3} />
            <circle cx={-232} cy={0} r={30} fill={cl.color} />
            <Txt x={-188} y={11} size={30} anchor="start">
              {cl.label}
            </Txt>
          </g>
        );
      })}
    </Stage>
  );
};
