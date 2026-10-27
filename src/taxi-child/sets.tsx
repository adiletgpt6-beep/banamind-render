// Декорации ролика BalaGo «Сабак бүттү» (2D, светлые и аккуратные): класс с часами,
// офис с рабочей встречей, улица «үй — мектеп» для схемы поездки, салон с
// тремя детьми на заднем ряду (ремни пристёгнуты), подъезд дома.
// Общие элементы города — из ролика №12 (two-schedules-2d/sets).
import { fontFamily } from "../fonts";
import { Mountains, WallClock } from "../two-schedules-2d/sets/Apartment";
import { PanelHouse, Sky, Tree } from "../two-schedules-2d/sets/Outdoor";
import { box } from "../two-schedules-2d/shots";
import { C } from "./ui";

// ---------- Класс ----------
// Стена, доска, окно, часы (minutes — время на часах). Пол — y 1000.
export const Classroom: React.FC<{ readonly minutes: number }> = ({
  minutes,
}) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1000 })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1080,
        height: 1000,
        backgroundColor: "#EAF1F6",
      })}
    />
    <div
      style={box({
        left: 0,
        top: 610,
        width: 1080,
        height: 390,
        backgroundColor: "#DCE6EE",
      })}
    />
    <div
      style={box({
        left: 0,
        top: 600,
        width: 1080,
        height: 14,
        backgroundColor: "#C9D6E2",
      })}
    />
    {/* доска */}
    <div
      style={box({
        left: 30,
        top: 250,
        width: 420,
        height: 300,
        borderRadius: 12,
        backgroundColor: "#2F5A4A",
        border: "14px solid #B48A62",
        boxSizing: "border-box",
      })}
    />
    <div
      style={box({
        left: 90,
        top: 300,
        width: 220,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.6)",
      })}
    />
    <div
      style={box({
        left: 90,
        top: 340,
        width: 260,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.45)",
      })}
    />
    <div
      style={box({
        left: 90,
        top: 380,
        width: 180,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.45)",
      })}
    />
    {/* окно */}
    <div
      style={box({
        left: 660,
        top: 260,
        width: 370,
        height: 300,
        borderRadius: 10,
        background: "linear-gradient(180deg, #CFE6F7, #F2F7FB)",
        border: "14px solid #FFFFFF",
        boxSizing: "border-box",
        overflow: "hidden",
      })}
    >
      <div
        style={box({
          left: 30,
          top: 150,
          width: 140,
          height: 200,
          borderRadius: "70px 70px 0 0",
          backgroundColor: "#9CC07E",
        })}
      />
      <div
        style={box({
          left: 200,
          top: 120,
          width: 120,
          height: 220,
          backgroundColor: "#E9D6C4",
        })}
      />
    </div>
    <div
      style={box({
        left: 840,
        top: 260,
        width: 10,
        height: 300,
        backgroundColor: "#FFFFFF",
      })}
    />
    {/* часы между доской и окном */}
    <div
      style={box({
        left: 545 - 86,
        top: 340 - 86,
        width: 172,
        height: 172,
        borderRadius: 86,
        backgroundColor: C.yellow,
      })}
    />
    <WallClock x={545} y={340} r={74} minutes={minutes} />
  </div>
);

// Парта (передний план класса): столешница и передняя панель.
export const Desk: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
}> = ({ x, y, w }) => (
  <div style={box({ left: x, top: y, width: w, height: 300 })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: w,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#C79B6D",
      })}
    />
    <div
      style={box({
        left: 16,
        top: 26,
        width: w - 32,
        height: 260,
        backgroundColor: "#B88A5D",
      })}
    />
    <div
      style={box({
        left: 16,
        top: 26,
        width: w - 32,
        height: 12,
        backgroundColor: "rgba(0,0,0,0.08)",
      })}
    />
  </div>
);

// Тетрадь на парте: close 0…1 — обложка закрывается справа налево.
export const Notebook: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly close: number;
}> = ({ x, y, close }) => {
  const w = 110;
  return (
    <div style={box({ left: x - w, top: y - 18, width: w * 2, height: 22 })}>
      <div
        style={box({
          left: 0,
          top: 0,
          width: w,
          height: 18,
          borderRadius: 4,
          backgroundColor: close > 0.98 ? "#3E7CC0" : "#FFFFFF",
          border: "3px solid #9DB6CF",
          boxSizing: "border-box",
        })}
      />
      {close < 0.98 ? (
        <div
          style={box({
            left: w,
            top: -Math.sin(Math.PI * close) * 34,
            width: w,
            height: 18,
            borderRadius: 4,
            backgroundColor: close > 0.5 ? "#3E7CC0" : "#FFFFFF",
            border: "3px solid #9DB6CF",
            boxSizing: "border-box",
            transformOrigin: "0% 50%",
            scale: `${Math.cos(Math.PI * close)} 1`,
          })}
        />
      ) : null}
    </div>
  );
};

// ---------- Офис ----------
// Переговорная: стена, окно с городом, монитор с рабочим документом.
export const Office: React.FC<{
  readonly doc: string;
  readonly scroll?: number;
}> = ({ doc, scroll = 0 }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1100 })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1080,
        height: 1100,
        backgroundColor: "#EEF1F5",
      })}
    />
    <div
      style={box({
        left: 30,
        top: 120,
        width: 420,
        height: 470,
        borderRadius: 12,
        overflow: "hidden",
        border: "14px solid #FFFFFF",
        boxSizing: "border-box",
      })}
    >
      <Sky w={420} h={470} />
      <Mountains x={-60} y={130} w={600} h={160} />
      <div
        style={box({
          left: 20,
          top: 230,
          width: 110,
          height: 240,
          backgroundColor: "#D7DEE7",
        })}
      />
      <div
        style={box({
          left: 150,
          top: 270,
          width: 90,
          height: 200,
          backgroundColor: "#E6D6C4",
        })}
      />
      <div
        style={box({
          left: 260,
          top: 210,
          width: 120,
          height: 260,
          backgroundColor: "#CBD5E1",
        })}
      />
    </div>
    <div
      style={box({
        left: 230,
        top: 120,
        width: 10,
        height: 470,
        backgroundColor: "#FFFFFF",
      })}
    />
    {/* монитор с рабочим документом */}
    <div
      style={box({
        left: 520,
        top: 150,
        width: 520,
        height: 330,
        borderRadius: 16,
        backgroundColor: "#1E2235",
      })}
    >
      <div
        style={box({
          left: 14,
          top: 14,
          right: 14,
          bottom: 14,
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          fontFamily,
        })}
      >
        <div
          style={box({
            left: 0,
            right: 0,
            top: 0,
            height: 36,
            backgroundColor: "#E7ECF4",
          })}
        />
        <div
          style={box({
            left: 24,
            top: 52,
            fontSize: 30,
            fontWeight: 900,
            color: C.ink,
          })}
        >
          {doc}
        </div>
        <div
          style={box({
            left: 24,
            top: 110 - scroll,
            width: 230,
            height: 150,
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
          })}
        >
          {[60, 95, 75, 130, 110].map((h, i) => (
            <div
              key={i}
              style={{
                width: 30,
                height: h,
                borderRadius: 6,
                backgroundColor: i === 3 ? C.yellow : "#9DB6CF",
              }}
            />
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={box({
              left: 290,
              top: 120 + i * 34 - scroll,
              width: [170, 140, 180, 120][i],
              height: 12,
              borderRadius: 6,
              backgroundColor: "#D5DDE8",
            })}
          />
        ))}
      </div>
    </div>
    <div
      style={box({
        left: 760,
        top: 480,
        width: 40,
        height: 60,
        backgroundColor: "#2B3042",
      })}
    />
    <div
      style={box({
        left: 960,
        top: 640,
        width: 90,
        height: 120,
        borderRadius: "10px 10px 20px 20px",
        backgroundColor: "#D9C8B4",
      })}
    />
    <div
      style={box({
        left: 930,
        top: 520,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "#7FAF63",
      })}
    />
    <div
      style={box({
        left: 0,
        top: 820,
        width: 1080,
        height: 280,
        backgroundColor: "#D8DEE6",
      })}
    />
  </div>
);

// Стол переговорной (передний план): столешница — y = top.
export const MeetingTable: React.FC<{ readonly top: number }> = ({ top }) => (
  <div style={box({ left: -40, top, width: 1160, height: 700 })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1160,
        height: 34,
        borderRadius: 10,
        backgroundColor: "#F3EEE7",
      })}
    />
    <div
      style={box({
        left: 0,
        top: 30,
        width: 1160,
        height: 700,
        background: "linear-gradient(180deg, #CDBFAE, #BCAD9B)",
      })}
    />
  </div>
);

// Ноутбук на столе (крышка к камере), стоит на столешнице y.
export const LaptopBack: React.FC<{
  readonly x: number;
  readonly y: number;
}> = ({ x, y }) => (
  <>
    <div
      style={box({
        left: x - 120,
        top: y - 150,
        width: 240,
        height: 150,
        borderRadius: "12px 12px 4px 4px",
        backgroundColor: "#C9CFD9",
        border: "5px solid #AEB6C3",
        boxSizing: "border-box",
      })}
    />
    <div
      style={box({
        left: x - 16,
        top: y - 90,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.65)",
      })}
    />
    <div
      style={box({
        left: x - 140,
        top: y - 6,
        width: 280,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#AEB6C3",
      })}
    />
  </>
);

// ---------- Улица «үй — мектеп» (схема поездки) ----------
// Слева дом, справа школа, между ними дорога (y = road).
export const RouteStreet: React.FC<{
  readonly road: number;
  readonly offset?: number;
}> = ({ road, offset = 0 }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: road + 860 })}>
    <div
      style={box({
        left: 0,
        top: road - 560,
        width: 1080,
        height: 560,
        background: "linear-gradient(180deg, #E4F0FA, #F7FAFD)",
      })}
    />
    <Mountains x={-200} y={road - 500} w={1500} h={200} />
    <PanelHouse
      x={10}
      y={road - 40}
      w={300}
      floors={3}
      color="#EADFCF"
      seed={2}
      door={150}
    />
    <Tree x={350} y={road - 40} s={0.7} kind="poplar" />
    {/* школа */}
    <div
      style={box({
        left: 720,
        top: road - 360,
        width: 340,
        height: 320,
        backgroundColor: "#F1E3C8",
      })}
    />
    <div
      style={box({
        left: 705,
        top: road - 380,
        width: 370,
        height: 30,
        backgroundColor: "#C9644F",
      })}
    />
    {[0, 1].map((r) =>
      [0, 1, 2].map((c) => (
        <div
          key={`${r}${c}`}
          style={box({
            left: 745 + c * 105,
            top: road - 330 + r * 100,
            width: 70,
            height: 70,
            borderRadius: 6,
            backgroundColor: "#AFC9E0",
            border: "5px solid #FFFFFF",
            boxSizing: "border-box",
          })}
        />
      )),
    )}
    <div
      style={box({
        left: 820,
        top: road - 128,
        width: 140,
        height: 88,
        backgroundColor: "#4A5470",
      })}
    />
    <div
      style={box({
        left: 790,
        top: road - 178,
        width: 200,
        height: 44,
        borderRadius: 10,
        backgroundColor: C.ink,
        color: "#FFFFFF",
        fontFamily,
        fontSize: 28,
        fontWeight: 900,
        textAlign: "center",
        lineHeight: "44px",
      })}
    >
      Мектеп
    </div>
    <Tree x={680} y={road - 40} s={0.65} />
    <div
      style={box({
        left: 0,
        top: road - 44,
        width: 1080,
        height: 46,
        backgroundColor: "#DAD3C7",
      })}
    />
    <div
      style={box({
        left: 0,
        top: road,
        width: 1080,
        height: 230,
        backgroundColor: "#6E737E",
      })}
    />
    <div
      style={box({
        left: 0,
        top: road + 230,
        width: 1080,
        height: 22,
        backgroundColor: "#EFECE6",
      })}
    />
    <div
      style={box({
        left: 0,
        top: road + 252,
        width: 1080,
        height: 600,
        backgroundColor: "#A9C98A",
      })}
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={box({
          left: ((((i * 260 - offset) % 1300) + 1300) % 1300) - 130,
          top: road + 100,
          width: 130,
          height: 12,
          backgroundColor: "#E9E6DF",
        })}
      />
    ))}
  </div>
);

// ---------- Салон: задний ряд ----------
// Вид из салона назад: окна, спинка заднего сиденья (сиденье — y ≈ 1260).
export const RearRow: React.FC<{ readonly pass: number }> = ({ pass }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        backgroundColor: "#3B414D",
      })}
    />
    {[30, 700].map((x, side) => (
      <div
        key={x}
        style={box({
          left: x,
          top: 380,
          width: 350,
          height: 280,
          borderRadius: "50px 50px 10px 10px",
          background: "linear-gradient(180deg, #CFE3F2, #EADFCB)",
          overflow: "hidden",
        })}
      >
        {[0, 1, 2, 3].map((i) => {
          const px =
            ((((i * 190 + (side ? 1 : -1) * pass * 6) % 760) + 760) % 760) -
            180;
          return (
            <div
              key={i}
              style={box({
                left: px,
                top: 70 + (i % 2) * 40,
                width: 120,
                height: 240,
                borderRadius: i % 2 ? 60 : 6,
                backgroundColor: ["#E3D3C1", "#7FAF63", "#DDE3E8", "#86B06A"][
                  i
                ],
              })}
            />
          );
        })}
      </div>
    ))}
    <div
      style={box({
        left: 420,
        top: 380,
        width: 240,
        height: 240,
        borderRadius: "40px 40px 10px 10px",
        background: "linear-gradient(180deg, #D6E4EE, #EEE6D8)",
      })}
    />
    <div
      style={box({
        left: 30,
        top: 640,
        width: 1020,
        height: 660,
        borderRadius: "80px 80px 26px 26px",
        backgroundColor: "#565E6C",
      })}
    />
    {[90, 400, 710].map((x) => (
      <div
        key={x}
        style={box({
          left: x,
          top: 690,
          width: 280,
          height: 580,
          borderRadius: 50,
          backgroundColor: "#5F6776",
        })}
      />
    ))}
  </div>
);

// Подушка заднего сиденья и спинки передних кресел (передний план салона).
export const RearCushion: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div
      style={box({
        left: 0,
        top: 1240,
        width: 1080,
        height: 170,
        borderRadius: 50,
        backgroundColor: "#4C5361",
      })}
    />
    <div
      style={box({
        left: 0,
        top: 1400,
        width: 1080,
        height: 520,
        backgroundColor: "#2F343E",
      })}
    />
    <div
      style={box({
        left: -60,
        top: 1540,
        width: 430,
        height: 420,
        borderRadius: "90px 90px 0 0",
        backgroundColor: "#454B58",
      })}
    />
    <div
      style={box({
        left: 710,
        top: 1540,
        width: 430,
        height: 420,
        borderRadius: "90px 90px 0 0",
        backgroundColor: "#454B58",
      })}
    />
  </div>
);

// Ремень безопасности ребёнка: от плеча (sx, sy) к бедру (hx, hy), замок.
export const Belt: React.FC<{
  readonly sx: number;
  readonly sy: number;
  readonly hx: number;
  readonly hy: number;
  readonly t?: number;
}> = ({ sx, sy, hx, hy, t = 1 }) => {
  const ex = sx + (hx - sx) * t;
  const ey = sy + (hy - sy) * t;
  return (
    <svg
      width={1}
      height={1}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke="#23262E"
        strokeWidth={24}
        strokeLinecap="round"
      />
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke="#3A3F4B"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {t >= 1 ? (
        <rect
          x={hx - 18}
          y={hy - 12}
          width={36}
          height={24}
          rx={6}
          fill="#A9B0BC"
        />
      ) : null}
    </svg>
  );
};

// ---------- Подъезд дома ----------
// Дом с подъездом (центр двери — x = door), двор; земля — y = ground.
export const HomeEntrance: React.FC<{
  readonly ground: number;
  readonly door: number;
  readonly open: number;
}> = ({ ground, door, open }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <Sky w={1080} h={ground} />
    <Mountains x={-200} y={ground - 940} w={1500} h={260} />
    <PanelHouse
      x={-60}
      y={ground - 20}
      w={1200}
      floors={5}
      color="#EADFCF"
      seed={1}
    />
    <div
      style={box({
        left: door - 150,
        top: ground - 420,
        width: 300,
        height: 30,
        borderRadius: 6,
        backgroundColor: "#9A9590",
      })}
    />
    <div
      style={box({
        left: door - 110,
        top: ground - 390,
        width: 220,
        height: 370,
        backgroundColor: "#3D3631",
      })}
    />
    <div
      style={box({
        left: door - 110,
        top: ground - 390,
        width: 220 * (1 - 0.8 * open),
        height: 370,
        backgroundColor: "#6B5547",
        borderRight: "6px solid #574437",
        boxSizing: "border-box",
      })}
    />
    <div
      style={box({
        left: door - 40,
        top: ground - 452,
        width: 80,
        height: 26,
        borderRadius: 6,
        backgroundColor: "#3A6EA5",
        color: "#FFFFFF",
        fontFamily,
        fontSize: 18,
        fontWeight: 900,
        textAlign: "center",
        lineHeight: "26px",
      })}
    >
      2
    </div>
    <div
      style={box({
        left: door - 170,
        top: ground - 22,
        width: 340,
        height: 24,
        backgroundColor: "#BDB5A8",
      })}
    />
    <div
      style={box({
        left: -100,
        top: ground,
        width: 1300,
        height: 700,
        backgroundColor: "#C9C2B6",
      })}
    />
    <div
      style={box({
        left: -100,
        top: ground + 150,
        width: 1300,
        height: 600,
        backgroundColor: "#6E737E",
      })}
    />
    <div
      style={box({
        left: -100,
        top: ground + 138,
        width: 1300,
        height: 16,
        backgroundColor: "#EFECE6",
      })}
    />
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        style={box({
          left: -60 + i * 320,
          top: ground + 380,
          width: 170,
          height: 14,
          backgroundColor: "#E9E6DF",
        })}
      />
    ))}
    <div
      style={box({
        left: -100,
        top: ground + 600,
        width: 1300,
        height: 20,
        backgroundColor: "#EFECE6",
      })}
    />
    <div
      style={box({
        left: -100,
        top: ground + 620,
        width: 1300,
        height: 200,
        backgroundColor: "#A9C98A",
      })}
    />
    <Tree x={30} y={ground + 10} s={0.95} kind="poplar" />
    <div
      style={box({
        left: 880,
        top: ground - 120,
        width: 240,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#8DBA6E",
      })}
    />
  </div>
);

// Стены по краям проёма поверх входящих: вошедшие скрываются в подъезде.
export const DoorFrame: React.FC<{
  readonly ground: number;
  readonly door: number;
}> = ({ ground, door }) => (
  <>
    <div
      style={box({
        left: door - 180,
        top: ground - 390,
        width: 70,
        height: 372,
        backgroundColor: "#EADFCF",
      })}
    />
    <div
      style={box({
        left: door + 110,
        top: ground - 390,
        width: 70,
        height: 372,
        backgroundColor: "#EADFCF",
      })}
    />
  </>
);
