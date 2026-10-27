// «Масштаб выбора» — постоянная рамка фильма: край большой карты (тонкая
// золотая окантовка со скруглёнными углами) и наверху три слоя карты —
// личный выбор → переживание войны → историческая перспектива. Активный слой
// сцены подсвечен, под ним — название части. Это навигация по смыслу, не таймер.
import React from "react";
import { C, FONT } from "../theme";
import type { Layer, PartId } from "../types";

export const LAYERS: { id: Layer; label: string; color: string }[] = [
  { id: "person", label: "Личный выбор", color: C.gold },
  { id: "war", label: "Переживание войны", color: C.steel },
  { id: "history", label: "Историческая перспектива", color: C.cyan },
];

export const PART_LABEL: Record<PartId, string> = {
  intro: "Масштаб выбора",
  society: "Свет 1805 года: слава и деньги",
  andrei: "Князь Андрей и небо Аустерлица",
  pierre: "Пьер: наследство без смысла",
  natasha: "Наташа: выбор и готовность",
  family: "Семьи, долги и долг",
  borodino: "Бородино: план и поле",
  moscow: "Москва: цена решения",
  captivity: "Пьер в плену",
  generals: "Кутузов и Наполеон",
  recovery: "Потери и возвращение к жизни",
  epilogue: "Эпилог: кто движет историей",
  end: "Три вывода",
};

export const MapFrame: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <mask id="map-hole">
        <rect width={1920} height={1080} fill="#fff" />
        <rect x={14} y={12} width={1892} height={1056} rx={40} fill="#000" />
      </mask>
    </defs>
    <rect width={1920} height={1080} fill="#0a1022" mask="url(#map-hole)" />
    <rect x={14} y={12} width={1892} height={1056} rx={40} fill="none" stroke="#7d6230" strokeWidth={6} />
    <rect x={18} y={16} width={1884} height={1048} rx={37} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.8} />
    {/* «роза ветров» в углах — знак карты */}
    {[
      [64, 1018],
      [1856, 1018],
    ].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`} opacity={0.55}>
        <path d="M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z" fill={C.gold} />
      </g>
    ))}
  </svg>
);

export const LayerStrip: React.FC<{ part: PartId; layer: Layer; opacity: number }> = ({ part, layer, opacity }) => {
  const idx = LAYERS.findIndex((l) => l.id === layer);
  return (
    <div style={{ position: "absolute", left: 46, top: 32, opacity, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {LAYERS.map((l, i) => (
          <React.Fragment key={l.id}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 20,
                padding: "5px 13px",
                borderRadius: 16,
                color: i === idx ? C.night : C.dim,
                background: i === idx ? l.color : "rgba(16, 24, 54, 0.82)",
                border: i === idx ? "none" : `1px solid ${l.color}55`,
              }}
            >
              {l.label}
            </div>
            {i < LAYERS.length - 1 && (
              <svg width={14} height={14} viewBox="0 0 14 14">
                <path d="M 3 2 L 10 7 L 3 12" fill="none" stroke={C.faint} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.gold, letterSpacing: 0.4, paddingLeft: 4 }}>{PART_LABEL[part]}</div>
    </div>
  );
};
