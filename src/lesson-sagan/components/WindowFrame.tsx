// «Окно доказательств» — постоянная рамка фильма: края большого окна обсерватории
// (латунная рама со скруглёнными углами) и наверху четыре слоя окна —
// наблюдение → объяснение → проверка → пересмотр. Активный слой сцены подсвечен,
// рядом — название части (масштаб окна). Это навигация по смыслу, не таймер.
import React from "react";
import { C, FONT } from "../theme";
import type { Layer, PartId } from "../types";

export const LAYERS: { id: Layer; label: string; color: string }[] = [
  { id: "observe", label: "Наблюдение", color: C.sky },
  { id: "explain", label: "Объяснение", color: C.violet },
  { id: "test", label: "Проверка", color: C.green },
  { id: "revise", label: "Пересмотр", color: C.amber },
];

export const PART_LABEL: Record<PartId, string> = {
  intro: "Точка на небе",
  measure: "Измерить недоступное",
  models: "Красивая модель и упрямые данные",
  planets: "Венера и Марс",
  travel: "Путешественники",
  light: "Свет и время",
  stars: "Жизнь звёзд",
  galaxies: "Галактики",
  life: "Жизнь и память",
  search: "Поиск собеседников",
  earth: "Кто отвечает за Землю",
  end: "Три вывода",
};

export const WindowFrame: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <mask id="win-hole">
        <rect width={1920} height={1080} fill="#fff" />
        <rect x={16} y={14} width={1888} height={1052} rx={46} fill="#000" />
      </mask>
    </defs>
    {/* стена обсерватории вокруг окна */}
    <rect width={1920} height={1080} fill="#0a0f26" mask="url(#win-hole)" />
    {/* латунная рама */}
    <rect x={16} y={14} width={1888} height={1052} rx={46} fill="none" stroke={C.brassDark} strokeWidth={8} />
    <rect x={20} y={18} width={1880} height={1044} rx={43} fill="none" stroke={C.brass} strokeWidth={2.5} opacity={0.85} />
    {[
      [70, 22],
      [1850, 22],
      [70, 1058],
      [1850, 1058],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4} fill={C.brass} />
    ))}
  </svg>
);

export const LayerStrip: React.FC<{ part: PartId; layer: Layer; opacity: number }> = ({ part, layer, opacity }) => {
  const idx = LAYERS.findIndex((l) => l.id === layer);
  return (
    <div style={{ position: "absolute", left: 46, top: 34, opacity, display: "flex", flexDirection: "column", gap: 8 }}>
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
                background: i === idx ? l.color : "rgba(18, 26, 62, 0.8)",
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
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.brass, letterSpacing: 0.4, paddingLeft: 4 }}>{PART_LABEL[part]}</div>
    </div>
  );
};
