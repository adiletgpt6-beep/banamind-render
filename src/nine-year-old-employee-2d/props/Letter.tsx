// А. Детское заявление — один и тот же лист во всех кадрах: тёплый белый
// лист, заголовок «АРЫЗ» с неровным подчёркиванием, просьба в четыре
// строки (переносы фиксированы), подпись «Бектур, 9 жаш» с росчерком.
// LetterArt: (0, 0) — центр листа, ширина w, высота w · LETTER_RATIO.
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";

export const LETTER_RATIO = 1.38;
// Строки просьбы (как написал Бектур) — вместе дают NY2_TEXT.letter.body.
export const LETTER_LINES = ["Мага эртерээк", "кетүүгө уруксат", "беришиңизди", "суранам."] as const;

export const LetterArt: React.FC<{ readonly w: number; readonly detail?: boolean }> = ({ w, detail = true }) => {
  const h = w * LETTER_RATIO;
  const u = w / 100; // единица листа
  const rot = [-1.2, 0.8, -0.6, 1.0];
  return (
    <g>
      <rect x={-w / 2 + u * 1.2} y={-h / 2 + u * 1.6} width={w} height={h} fill="rgba(0,0,0,0.12)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#FFFDF6" stroke="#D8D0C0" strokeWidth={Math.max(1, u * 0.4)} />
      {detail ? (
        <>
          <text x={0} y={-h / 2 + u * 22} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={u * 15} fill={C.ink} letterSpacing={u * 1.2}>
            {NY2_TEXT.letter.title}
          </text>
          <path d={`M ${-u * 22} ${-h / 2 + u * 27} Q ${-u * 8} ${-h / 2 + u * 30.5} ${u * 4} ${-h / 2 + u * 27.5} T ${u * 23} ${-h / 2 + u * 28}`} stroke={C.orange} strokeWidth={u * 1.3} fill="none" strokeLinecap="round" />
          {LETTER_LINES.map((line, i) => (
            <text key={line} x={-w / 2 + u * 9} y={-h / 2 + u * (48 + i * 13.5)} fontFamily={F.text} fontWeight={800} fontSize={u * 9.2} fill="#1F2A5C" transform={`rotate(${rot[i]} ${-w / 2 + u * 9} ${-h / 2 + u * (48 + i * 13.5)})`}>
              {line}
            </text>
          ))}
          <text x={w / 2 - u * 8} y={h / 2 - u * 17} textAnchor="end" fontFamily={F.text} fontWeight={800} fontSize={u * 8.4} fill="#1F2A5C" transform={`rotate(-2 ${w / 2 - u * 8} ${h / 2 - u * 17})`}>
            {NY2_TEXT.letter.sign}
          </text>
          {/* неровная детская подпись-росчерк */}
          <path d={`M ${w / 2 - u * 46} ${h / 2 - u * 10} q ${u * 6} ${-u * 7} ${u * 10} 0 t ${u * 10} 0 t ${u * 12} ${-u * 2} q ${u * 8} ${u * 4} ${u * 14} ${-u * 3}`} stroke="#1F2A5C" strokeWidth={u * 0.9} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x={-u * 20} y={-h / 2 + u * 10} width={u * 40} height={u * 11} fill={C.ink} />
          <rect x={-u * 22} y={-h / 2 + u * 25} width={u * 44} height={u * 2} fill={C.orange} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-w / 2 + u * 9} y={-h / 2 + u * (40 + i * 13.5)} width={u * [70, 76, 58, 44][i]} height={u * 5} rx={u * 2} fill="#1F2A5C" opacity={0.75} />
          ))}
          <rect x={w / 2 - u * 52} y={h / 2 - u * 22} width={u * 44} height={u * 4.5} rx={u * 2} fill="#1F2A5C" opacity={0.75} />
        </>
      )}
    </g>
  );
};
