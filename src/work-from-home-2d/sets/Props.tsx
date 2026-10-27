// Предметы, которые переходят из плана в план: школьная тетрадь (голубая
// обложка, разворот в линейку с надписью «Менин үй-бүлөм») и книга
// (красная твёрдая обложка «Жомоктор»). Тетрадь и книга различаются цветом,
// размером и формой; на дальних планах рисуются этими компонентами.
import { fontFamily } from "../../fonts";
import { WFH_TEXT } from "../script";
import { box } from "../shots";

export const NOTEBOOK = { cover: "#7FB3E0", w: 190 } as const;
export const BOOK = { cover: "#C2533F", w: 150, h: 200 } as const;

// Тетрадь на столе (средний план, вид чуть сверху): open — разворот.
export const NotebookOnTable: React.FC<{ x: number; y: number; open?: boolean; rot?: number }> = ({ x, y, open = true, rot = 0 }) => (
  <div style={box({ left: x - NOTEBOOK.w / 2, top: y - 26, width: NOTEBOOK.w, height: 40, rotate: `${rot}deg`, transform: "perspective(400px) rotateX(55deg)", transformOrigin: "50% 100%" })}>
    {open ? (
      <>
        <div style={box({ left: 0, top: 0, width: NOTEBOOK.w / 2 - 2, height: 40, backgroundColor: "#FFFFFF", borderRadius: "4px 0 0 4px", boxShadow: "0 3px 6px rgba(40,40,60,0.2)" })} />
        <div style={box({ left: NOTEBOOK.w / 2 + 2, top: 0, width: NOTEBOOK.w / 2 - 2, height: 40, backgroundColor: "#FFFFFF", borderRadius: "0 4px 4px 0", boxShadow: "0 3px 6px rgba(40,40,60,0.2)" })} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: 10, top: 8 + i * 10, width: NOTEBOOK.w - 20, height: 2, backgroundColor: "#9DB7D6" })} />
        ))}
      </>
    ) : (
      <div style={box({ inset: 0, backgroundColor: NOTEBOOK.cover, borderRadius: 4 })} />
    )}
  </div>
);

// Тетрадь крупно (вид сверху): разворот, заголовок и три строки.
// lineHighlight — палец сына указывает на строку (индекс).
export const NotebookTop: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.68;
  const n = WFH_TEXT.notebook;
  const hand = { fontFamily, fontStyle: "italic" as const, color: "#24408A" };
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, rotate: `${rot}deg` })}>
      <div style={box({ left: -14, top: -12, width: w + 28, height: h + 24, borderRadius: 14, backgroundColor: NOTEBOOK.cover })} />
      {[0, 1].map((p) => (
        <div key={p} style={box({ left: p * (w / 2 + 3), top: 0, width: w / 2 - 3, height: h, backgroundColor: "#FFFFFF", borderRadius: p ? "0 8px 8px 0" : "8px 0 0 8px", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 58px, #BFD3EA 58px 61px)", boxShadow: "0 6px 14px rgba(40,40,60,0.18)" })} />
      ))}
      <div style={box({ left: w / 2 - 3, top: 0, width: 6, height: h, backgroundColor: "#D7DEE8" })} />
      {/* надпись на левой странице */}
      <div style={box({ left: 22, top: 20, width: w / 2 - 44, ...hand, fontSize: w * 0.036, fontWeight: 800, lineHeight: "61px", whiteSpace: "nowrap" })}>
        <div style={{ textAlign: "center", fontSize: w * 0.044 }}>{n.title}</div>
        {n.lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {/* правая страница — рисунок семьи карандашом */}
      <svg width={w / 2 - 40} height={h - 60} viewBox="0 0 200 200" style={box({ left: w / 2 + 20, top: 30 })}>
        {[40, 100, 160].map((cx, i) => (
          <g key={cx} stroke="#24408A" strokeWidth={4} fill="none">
            <circle cx={cx} cy={i === 2 ? 95 : 70} r={i === 2 ? 16 : 20} />
            <path d={`M ${cx} ${i === 2 ? 111 : 90} L ${cx} ${i === 2 ? 150 : 145} M ${cx - 22} ${i === 2 ? 125 : 110} L ${cx + 22} ${i === 2 ? 125 : 110} M ${cx} ${i === 2 ? 150 : 145} L ${cx - 15} ${i === 2 ? 180 : 185} M ${cx} ${i === 2 ? 150 : 145} L ${cx + 15} ${i === 2 ? 180 : 185}`} />
          </g>
        ))}
        <path d="M 20 30 Q 40 5 60 30" stroke="#FFC20E" strokeWidth={5} fill="none" />
      </svg>
    </div>
  );
};

// Книга в руках/на коленях (средний план, вид спереди): закрыта — обложка;
// open 0…1 — обложка поворачивается вокруг корешка (левый край), видны страницы.
export const BookFront: React.FC<{ x: number; y: number; open?: number; s?: number; rot?: number }> = ({ x, y, open = 0, s = 1, rot = 0 }) => {
  const w = BOOK.w * s;
  const h = BOOK.h * s;
  const cw = w * Math.cos(Math.PI * open); // проекция обложки
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, rotate: `${rot}deg` })}>
      {/* страницы справа от корешка */}
      <div style={box({ left: 0, top: 4 * s, width: w - 4 * s, height: h - 8 * s, backgroundColor: "#FBF7EE", borderRadius: 3 * s, boxShadow: "inset -4px 0 0 #E7DFCF" })} />
      {open > 0.5 ? (
        <>
          {/* левая страница (обложка изнутри ушла влево) */}
          <div style={box({ left: cw, top: 4 * s, width: -cw, height: h - 8 * s, backgroundColor: "#FBF7EE", borderRadius: 3 * s })} />
          <div style={box({ left: cw - 6 * s, top: 0, width: 8 * s, height: h, backgroundColor: BOOK.cover, borderRadius: 3 * s })} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={box({ left: 10 * s, top: (24 + i * 30) * s, width: w - 30 * s, height: 5 * s, borderRadius: 3, backgroundColor: "#C9C0AE" })} />
          ))}
        </>
      ) : (
        <div style={box({ left: 0, top: 0, width: Math.max(2, cw), height: h, backgroundColor: BOOK.cover, borderRadius: 5 * s, boxShadow: "inset 8px 0 0 rgba(0,0,0,0.15)" })}>
          <div style={box({ left: 16 * s, top: 30 * s, width: Math.max(0, cw - 32 * s), height: 40 * s, borderRadius: 4, backgroundColor: "#FFD43B", opacity: cw > 40 ? 1 : 0 })} />
        </div>
      )}
    </div>
  );
};
