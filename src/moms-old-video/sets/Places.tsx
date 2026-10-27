// Остальные места фильма №33:
//   • прихожая утром (мама берёт рабочую сумку);
//   • офис: переговорная с большим экраном, окно на Бишкек и горы;
//   • улица у школы (без названия и адреса): тротуар, тополя, машина семьи;
//   • сцена на старой записи 2014 года (синие кулисы, тёплый прожектор);
//   • студия из воспоминания (дерево, станок) и небольшая студия пробного
//     занятия (зеркальная стена).
// Мир — px; у каждого места своя линия пола (FLOOR).
import { fontFamily } from "../../fonts";
import { Mountains, Shyrdak } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Sky, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { MOV_TEXT } from "../script";
import { box, Depth } from "../shots";

// ---------- прихожая ----------
export const HALLWAY = { floorY: 1500, door: { x: 160, y: 560, w: 300, h: 940 }, hook: { x: 640, y: 820 }, mirror: { x: 900, y: 600 } } as const;

export const Hallway: React.FC<{ readonly bagOnHook: boolean }> = ({ bagOnHook }) => {
  const d = HALLWAY.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      <div style={box({ left: -300, top: 0, width: 2600, height: HALLWAY.floorY, backgroundColor: "#F2E6D4" })} />
      <div style={box({ left: -300, top: 1150, width: 2600, height: HALLWAY.floorY - 1150, backgroundColor: "#E7D6BE" })} />
      <div style={box({ left: -300, top: HALLWAY.floorY, width: 2600, height: 1100, backgroundColor: "#B88E68" })} />
      <div style={box({ left: -300, top: HALLWAY.floorY - 20, width: 2600, height: 22, backgroundColor: "#FBF5EC" })} />
      {/* утренний свет из окна справа */}
      <div style={box({ left: -300, top: 0, width: 2600, height: 2600, background: "linear-gradient(100deg, transparent 40%, rgba(255,240,205,0.35) 75%, rgba(255,240,205,0.1))" })} />
      {/* входная дверь */}
      <div style={box({ left: d.x - 20, top: d.y - 20, width: d.w + 40, height: d.h + 20, backgroundColor: "#FBF5EC" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#7E5E48" })}>
        <div style={box({ left: 30, top: 70, width: d.w - 60, height: 330, borderRadius: 10, border: "6px solid rgba(0,0,0,0.12)", boxSizing: "border-box" })} />
        <div style={box({ left: 30, top: 460, width: d.w - 60, height: 400, borderRadius: 10, border: "6px solid rgba(0,0,0,0.12)", boxSizing: "border-box" })} />
        <div style={box({ right: 24, top: 480, width: 48, height: 14, borderRadius: 7, backgroundColor: "#D9C27A" })} />
      </div>
      {/* вешалка и сумка */}
      <div style={box({ left: HALLWAY.hook.x - 140, top: HALLWAY.hook.y - 20, width: 300, height: 16, borderRadius: 8, backgroundColor: "#8C6A4E" })} />
      {[-90, 0, 90].map((dx) => (
        <div key={dx} style={box({ left: HALLWAY.hook.x + dx - 6, top: HALLWAY.hook.y - 12, width: 12, height: 30, borderRadius: 6, backgroundColor: "#5E4636" })} />
      ))}
      <div style={box({ left: HALLWAY.hook.x + 40, top: HALLWAY.hook.y + 10, width: 100, height: 320, borderRadius: "40px 40px 14px 14px", backgroundColor: "#5A6E96" })} />
      {bagOnHook ? <WorkBagHanging x={HALLWAY.hook.x - 60} y={HALLWAY.hook.y} /> : null}
      {/* зеркало и тумба */}
      <div style={box({ left: HALLWAY.mirror.x, top: HALLWAY.mirror.y, width: 220, height: 380, borderRadius: 110, backgroundColor: "#DCE8F2", border: "12px solid #B89A6E", boxSizing: "border-box" })}>
        <div style={box({ left: 40, top: 40, width: 40, height: 260, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.5)", rotate: "12deg" })} />
      </div>
      <div style={box({ left: HALLWAY.mirror.x - 40, top: 1240, width: 300, height: 260, borderRadius: 10, backgroundColor: "#A47D5B" })} />
      <div style={box({ left: HALLWAY.mirror.x - 20, top: 1290, width: 260, height: 8, backgroundColor: "rgba(0,0,0,0.12)" })} />
      <Shyrdak x={420} y={1560} w={520} h={170} />
    </div>
  );
};

export const WorkBagHanging: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={170 * s} height={230 * s} viewBox="0 0 170 230" style={box({ left: x - 85 * s, top: y - 6 * s })}>
    <path d="M 40 100 Q 85 -10 130 100" stroke="#5E3F31" strokeWidth={8} fill="none" />
    <rect x={10} y={92} width={150} height={128} rx={20} fill="#8A5A44" />
    <rect x={10} y={92} width={150} height={28} rx={12} fill="#7A4E3B" />
    <rect x={74} y={112} width={22} height={14} rx={4} fill="#D9C27A" />
  </svg>
);

// ---------- офис ----------
export const OFFICE = { floorY: 1520, screen: { x: 560, y: 520, w: 820, h: 470 }, window: { x: 1480, y: 360, w: 760, h: 780 }, desk: { x: 300, top: 1250, w: 700 } } as const;

export const OfficeBack: React.FC<{ readonly f: number; readonly screen?: React.ReactNode; readonly late?: boolean }> = ({ f, screen, late }) => {
  const s = OFFICE.screen;
  const w = OFFICE.window;
  return (
    <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
      <div style={box({ left: -300, top: 0, width: 3200, height: OFFICE.floorY, backgroundColor: "#EEF1F5" })} />
      <div style={box({ left: -300, top: OFFICE.floorY, width: 3200, height: 1100, backgroundColor: "#B9C2CF" })} />
      <div style={box({ left: -300, top: OFFICE.floorY, width: 3200, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(40,50,70,0.06) 0 3px, transparent 3px 160px)" })} />
      <div style={box({ left: -300, top: OFFICE.floorY - 18, width: 3200, height: 20, backgroundColor: "#DDE2EA" })} />
      {/* окно на город: панельные дома, деревья, горы */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 8, overflow: "hidden", border: "14px solid #DCE2EA", boxSizing: "border-box", background: late ? "linear-gradient(180deg, #9FB8D6, #F3D9B8)" : "linear-gradient(180deg, #BFDDF3, #EAF1F6)" })}>
        <div style={box({ left: -w.x, top: -w.y })}>
          <Depth depth={0.3}>
            <Mountains x={w.x - 100} y={w.y + 120} w={w.w + 200} h={220} />
          </Depth>
          <PanelHouse x={w.x - 80} y={w.y + 760} w={330} floors={4} color="#E6D3C0" seed={2} />
          <PanelHouse x={w.x + 300} y={w.y + 700} w={300} floors={3} color="#D9CDBF" seed={5} />
          <PanelHouse x={w.x + 560} y={w.y + 780} w={330} floors={4} color="#E2D6C6" seed={9} />
          <Tree x={w.x + 260} y={w.y + 790} s={0.9} kind="poplar" />
          <Tree x={w.x + 600} y={w.y + 800} s={0.8} />
        </div>
        {[1, 2].map((i) => (
          <div key={i} style={box({ left: (w.w / 3) * i - 6, top: 0, width: 12, height: w.h, backgroundColor: "#DCE2EA" })} />
        ))}
      </div>
      {/* большой экран переговорной */}
      <div style={box({ left: s.x - 16, top: s.y - 16, width: s.w + 32, height: s.h + 32, borderRadius: 18, backgroundColor: "#1E2338" })} />
      <div style={box({ left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 8, overflow: "hidden", backgroundColor: "#FFFFFF" })}>{screen ?? <OfficeScreen f={f} />}</div>
      <div style={box({ left: s.x + s.w / 2 - 80, top: s.y + s.h + 16, width: 160, height: 60, backgroundColor: "#C9CFD9" })} />
      {/* растение в кадке */}
      <div style={box({ left: 180, top: 1180, width: 120, height: 340, borderRadius: "60px 60px 10px 10px", backgroundColor: "#6E9E5C" })} />
      <div style={box({ left: 170, top: 1400, width: 140, height: 120, borderRadius: "10px 10px 26px 26px", backgroundColor: "#E7DCCB" })} />
    </div>
  );
};

// Экран переговорной: план проекта — три колонки с карточками, неделя.
export const OfficeScreen: React.FC<{ f: number }> = ({ f }) => {
  const t = MOV_TEXT.office;
  const cards = [
    [0.9, 0.7, 0.5],
    [0.8, 0.6],
    [0.7],
  ];
  return (
    <div style={box({ inset: 0, fontFamily, color: "#14285A", backgroundColor: "#F7F9FC" })}>
      <div style={box({ left: 30, top: 20, fontSize: 40, fontWeight: 900 })}>{t.screenTitle}</div>
      <div style={box({ right: 30, top: 28, padding: "4px 18px", borderRadius: 16, backgroundColor: "#FFC90E", fontSize: 26, fontWeight: 900 })}>{t.progress}</div>
      {t.columns.map((c, i) => (
        <div key={c} style={box({ left: 30 + i * 262, top: 96, width: 238, height: 350, borderRadius: 16, backgroundColor: "#E9EEF6" })}>
          <div style={box({ left: 16, top: 12, fontSize: 26, fontWeight: 800 })}>{c}</div>
          {cards[i].map((w, k) => (
            <div key={k} style={box({ left: 14, top: 62 + k * 92, width: 210, height: 78, borderRadius: 12, backgroundColor: "#FFFFFF", boxShadow: "0 3px 8px rgba(20,40,90,0.08)" })}>
              <div style={box({ left: 14, top: 16, width: 150 * w, height: 12, borderRadius: 6, backgroundColor: "#9AA6BC" })} />
              <div style={box({ left: 14, top: 40, width: 90 * w, height: 12, borderRadius: 6, backgroundColor: "#C9D2E0" })} />
              <div style={box({ right: 12, top: 14, width: 22, height: 22, borderRadius: 11, backgroundColor: ["#3E8E5E", "#2F62A8", "#E2A23B"][i] })} />
            </div>
          ))}
        </div>
      ))}
      {/* указка-курсор у карточки, о которой говорит мама */}
      <div style={box({ left: 330 + Math.sin(f / 18) * 6, top: 200, width: 18, height: 18, borderRadius: 9, backgroundColor: "#FFC90E", boxShadow: "0 0 0 6px rgba(255,201,14,0.35)" })} />
    </div>
  );
};

// Рабочий стол (офис): столешница поверх сидящих/стоящих за ним.
export const OfficeDesk: React.FC = () => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
      <div style={box({ left: d.x, top: d.top, width: d.w, height: 30, borderRadius: 8, backgroundColor: "#F4F5F7" })} />
      <div style={box({ left: d.x + 20, top: d.top + 30, width: d.w - 40, height: 50, backgroundColor: "#D8DCE3" })} />
      <div style={box({ left: d.x + 40, top: d.top + 80, width: 24, height: OFFICE.floorY - d.top - 80 + 30, backgroundColor: "#AEB5C1" })} />
      <div style={box({ left: d.x + d.w - 64, top: d.top + 80, width: 24, height: OFFICE.floorY - d.top - 80 + 30, backgroundColor: "#AEB5C1" })} />
    </div>
  );
};

// ---------- улица у школы ----------
export const STREET = { groundY: 1500, curbY: 1640, roadY: 1660 } as const;

export const SchoolStreet: React.FC<{ readonly pan?: number }> = () => (
  <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
    <Sky w={2600} h={1500} />
    <Depth depth={0.25}>
      <Mountains x={-300} y={420} w={3200} h={360} />
    </Depth>
    {/* школьное здание без названия: светлый фасад, ограда, двор */}
    <div style={box({ left: 120, top: 620, width: 1500, height: 880, backgroundColor: "#F1E3C8" })} />
    <div style={box({ left: 100, top: 590, width: 1540, height: 40, backgroundColor: "#C9644F" })} />
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3, 4, 5].map((c) => (
        <div key={`${r}${c}`} style={box({ left: 170 + c * 240, top: 690 + r * 240, width: 150, height: 160, borderRadius: 8, backgroundColor: "#AFC9E0", border: "8px solid #FFFFFF", boxSizing: "border-box" })} />
      )),
    )}
    <PanelHouse x={1700} y={1500} w={700} floors={5} color="#E6D6C4" seed={11} />
    <div style={box({ left: -300, top: STREET.groundY - 40, width: 3200, height: 60, backgroundColor: "#D8D1C5" })} />
    {/* ограда школы */}
    <div style={box({ left: 80, top: 1340, width: 1600, height: 8, backgroundColor: "#3E5577" })} />
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} style={box({ left: 90 + i * 54, top: 1340, width: 8, height: 140, backgroundColor: "#3E5577" })} />
    ))}
    <Tree x={-20} y={1490} s={1.25} kind="poplar" />
    <Tree x={1640} y={1490} s={1.2} kind="poplar" />
    <Tree x={900} y={1490} s={1.0} />
    {/* тротуар, арык, бордюр, дорога */}
    <div style={box({ left: -300, top: STREET.groundY, width: 3200, height: STREET.curbY - STREET.groundY, backgroundColor: "#CFC8BC" })} />
    <div style={box({ left: -300, top: STREET.curbY - 30, width: 3200, height: 16, backgroundColor: "#8FA7B8" })} />
    <div style={box({ left: -300, top: STREET.curbY, width: 3200, height: 22, backgroundColor: "#E6E1D8" })} />
    <div style={box({ left: -300, top: STREET.roadY, width: 3200, height: 1000, backgroundColor: "#6E737C" })} />
    <div style={box({ left: -300, top: STREET.roadY + 300, width: 3200, height: 14, backgroundImage: "repeating-linear-gradient(90deg, #F2F2F2 0 120px, transparent 120px 220px)" })} />
  </div>
);

// Машина семьи сбоку (серо-голубая, без брендинга). rearOpen — задняя
// дверь открыта (0…1). dir 1 — смотрит вправо.
export const FamilyCar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rearOpen?: number; readonly wheel?: number; readonly inside?: React.ReactNode }> = ({ x, y, s = 1, rearOpen = 0, wheel = 0, inside }) => (
  <div style={box({ left: x - 420 * s, top: y - 330 * s, width: 840 * s, height: 340 * s })}>
    <svg width={840 * s} height={340 * s} viewBox="0 0 840 340" style={box({ left: 0, top: 0, overflow: "visible" })}>
      <path d="M 40 250 L 40 190 Q 44 160 90 150 L 210 140 L 300 70 Q 320 56 350 56 L 560 56 Q 600 56 630 80 L 720 150 L 790 162 Q 820 170 822 200 L 822 250 Z" fill="#8FA3BF" />
      <path d="M 320 80 L 440 80 L 440 146 L 245 146 Z" fill="#C8DCEB" />
      <path d="M 456 80 L 590 80 Q 610 82 625 96 L 690 146 L 456 146 Z" fill="#C8DCEB" />
      <rect x={440} y={76} width={16} height={74} fill="#8FA3BF" />
      <path d="M 40 210 L 822 210" stroke="#7A8EAA" strokeWidth={4} />
      <rect x={760} y={176} width={50} height={20} rx={8} fill="#F4E3A3" />
      <rect x={40} y={180} width={34} height={20} rx={6} fill="#D9534F" />
    </svg>
    {inside ? <div style={box({ left: 245 * s, top: 76 * s, width: 445 * s, height: 74 * s, overflow: "hidden" })}>{inside}</div> : null}
    {/* задняя дверь (открывается к зрителю — створка видна в перспективе) */}
    {rearOpen > 0.01 ? (
      <div style={box({ left: 250 * s, top: 60 * s, width: 200 * s, height: 190 * s, transformOrigin: "0% 50%", transform: `perspective(${900 * s}px) rotateY(${-70 * rearOpen}deg)`, backgroundColor: "#7E93B0", borderRadius: 14 * s })}>
        <div style={box({ left: 16 * s, top: 14 * s, width: 160 * s, height: 64 * s, borderRadius: 10 * s, backgroundColor: "#B9CEDF" })} />
      </div>
    ) : null}
    {[180, 660].map((cx) => (
      <svg key={cx} width={150 * s} height={150 * s} viewBox="-75 -75 150 150" style={box({ left: (cx - 75) * s, top: 190 * s })}>
        <circle r={66} fill="#2A2D34" />
        <circle r={34} fill="#C9CED6" />
        <g transform={`rotate(${wheel})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <rect key={a} x={-4} y={-30} width={8} height={26} rx={3} fill="#8E949E" transform={`rotate(${a})`} />
          ))}
        </g>
      </svg>
    ))}
  </div>
);

// ---------- сцена (старая запись) ----------
export const STAGE = { floorY: 1500 } as const;

export const Stage: React.FC<{ readonly f: number; readonly spotX: number }> = ({ f, spotX }) => (
  <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
    <div style={box({ left: -400, top: 0, width: 3400, height: STAGE.floorY, background: "linear-gradient(180deg, #16204A, #22306A)" })} />
    {/* кулисы */}
    {[-1, 1].map((side) => (
      <div key={side} style={box({ left: side < 0 ? -300 : 1500, top: -100, width: 600, height: STAGE.floorY + 100, backgroundImage: "repeating-linear-gradient(90deg, #1E3A7A 0 60px, #173068 60px 120px)", borderRadius: side < 0 ? "0 0 120px 0" : "0 0 0 120px" })} />
    ))}
    <div style={box({ left: -300, top: -60, width: 2400, height: 200, backgroundImage: "repeating-linear-gradient(90deg, #1E3A7A 0 60px, #173068 60px 120px)", borderRadius: "0 0 80px 80px" })} />
    {/* пол сцены */}
    <div style={box({ left: -400, top: STAGE.floorY, width: 3400, height: 1200, backgroundColor: "#7A4F35" })} />
    <div style={box({ left: -400, top: STAGE.floorY, width: 3400, height: 1200, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 140px)" })} />
    {/* луч прожектора */}
    <div style={box({ left: -400, top: 0, width: 3400, height: 2600, background: `radial-gradient(ellipse 520px 900px at ${spotX}px 1250px, rgba(255,226,160,0.55), transparent 70%)` })} />
    {/* световое пятно лежит на полу (ниже линии пола) */}
    <div style={box({ left: spotX - 380, top: STAGE.floorY + 6, width: 760, height: 150, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 40%, rgba(255,226,160,0.45), rgba(255,226,160,0) 70%)" })} />
    {/* силуэты зрителей на переднем плане (запись из зала) */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={box({ left: 60 + i * 190 + Math.sin(i * 2.1 + f * 0.02) * 2, top: 1900 + (i % 2) * 30, width: 150, height: 220, borderRadius: "75px 75px 20px 20px", backgroundColor: "#0D1330" })} />
    ))}
  </div>
);

// ---------- студия из воспоминания ----------
export const STUDIO = { floorY: 1500 } as const;

export const OldStudio: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
    <div style={box({ left: -400, top: 0, width: 3400, height: STUDIO.floorY, backgroundColor: "#F2DEC8" })} />
    <div style={box({ left: 200, top: 300, width: 1400, height: 820, background: "linear-gradient(180deg, #D8E6EE, #EFE3D2)", border: "18px solid #FFF8EE", boxSizing: "border-box", borderRadius: 8 })} />
    {[1, 2, 3].map((i) => (
      <div key={i} style={box({ left: 200 + i * 350, top: 300, width: 14, height: 820, backgroundColor: "#FFF8EE" })} />
    ))}
    {/* станок */}
    <div style={box({ left: -300, top: 1180, width: 3000, height: 18, borderRadius: 9, backgroundColor: "#B88A5C" })} />
    {[100, 700, 1300, 1900].map((x) => (
      <div key={x} style={box({ left: x, top: 1180, width: 14, height: 120, backgroundColor: "#9B7350" })} />
    ))}
    <div style={box({ left: -400, top: STUDIO.floorY, width: 3400, height: 1200, backgroundColor: "#C79A6A" })} />
    <div style={box({ left: -400, top: STUDIO.floorY, width: 3400, height: 1200, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,30,0.12) 0 3px, transparent 3px 120px)" })} />
    <div style={box({ left: -400, top: 0, width: 3400, height: 2600, background: "radial-gradient(circle at 900px 700px, rgba(255,240,210,0.45), transparent 1100px)" })} />
  </div>
);

// ---------- студия пробного занятия: зеркальная стена ----------
// Зеркало: x 160…1940, y 300…1440. В нём — отражения танцующих (рисуются
// сценой внутри MirrorPane, зеркально по x относительно оси зеркала).
export const MIRROR = { x: 160, y: 330, w: 1780, h: 1110 } as const;

export const NewStudioBack: React.FC<{ readonly reflection?: React.ReactNode }> = ({ reflection }) => (
  <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
    <div style={box({ left: -400, top: 0, width: 3400, height: STUDIO.floorY, backgroundColor: "#E9EEF5" })} />
    <div style={box({ left: MIRROR.x - 16, top: MIRROR.y - 16, width: MIRROR.w + 32, height: MIRROR.h + 32, borderRadius: 10, backgroundColor: "#C9D2DE" })} />
    <div style={box({ left: MIRROR.x, top: MIRROR.y, width: MIRROR.w, height: MIRROR.h, overflow: "hidden", background: "linear-gradient(180deg, #DDE7F0, #CBD8E4)" })}>
      {/* отражённая комната: дальняя стена с окном и полом */}
      <div style={box({ left: 0, top: MIRROR.h - 280, width: MIRROR.w, height: 280, backgroundColor: "#C4A57F", opacity: 0.85 })} />
      <div style={box({ left: 1100, top: 120, width: 420, height: 520, borderRadius: 8, backgroundColor: "#F3F7FB", opacity: 0.8 })} />
      {reflection ? <div style={box({ left: -MIRROR.x, top: -MIRROR.y })}>{reflection}</div> : null}
      {/* блики стекла */}
      <div style={box({ left: 200, top: -100, width: 120, height: 1500, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)", rotate: "14deg" })} />
      <div style={box({ left: 1200, top: -100, width: 80, height: 1500, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", rotate: "14deg" })} />
      <div style={box({ inset: 0, backgroundColor: "rgba(200,215,230,0.18)" })} />
    </div>
    {/* станок перед зеркалом */}
    <div style={box({ left: -300, top: 1200, width: 3000, height: 16, borderRadius: 8, backgroundColor: "#D9C2A0" })} />
    <div style={box({ left: -400, top: STUDIO.floorY, width: 3400, height: 1200, backgroundColor: "#D1B48D" })} />
    <div style={box({ left: -400, top: STUDIO.floorY, width: 3400, height: 1200, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,30,0.1) 0 3px, transparent 3px 120px)" })} />
    <div style={box({ left: -400, top: STUDIO.floorY - 16, width: 3400, height: 18, backgroundColor: "#F7F9FC" })} />
  </div>
);
