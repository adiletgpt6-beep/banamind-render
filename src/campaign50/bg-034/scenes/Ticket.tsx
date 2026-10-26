// Сцена 2 (≈5 – 18 с): один билет = один толук сапар.
// Билет из хука вырастает на весь кадр, клапан конверта открывается.
// Лицо билета: «Эртең менен • ҮЙ → МЕКТЕП» — маленькая белая машина едет
// от дома к школе. На слове «анан» билет переворачивается: оборот
// «Сабактан кийин • МЕКТЕП → ҮЙ», машина едет обратно. На «толук сапар»
// компостер пробивает билет насквозь (одно отверстие — один сапар, а не
// две половинки), появляется «1 билет = 1 толук сапар» и «ҮЙ → МЕКТЕП → ҮЙ».
// Вся сцена — условный пример: метка «Шарттуу мисал: топ түзүлгөндөн кийин».
// В конце билет уменьшается и уходит вниз — к вееру из десяти (сцена 3).
import { useCurrentFrame } from "remotion";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../../fonts";
import { useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG34_TEXT } from "../script";
import {
  BagIcon,
  ExampleTag,
  HomeIcon,
  Paper,
  Pill,
  Punch,
  PunchHole,
  SchoolIcon,
  STUB,
  SunIcon,
  TICKET_RATIO,
  TicketBody,
  Txt,
  rise,
} from "../ui";

const W = 820;
const H = W * TICKET_RATIO;
const CX = 498; // центр билета (сдвинут влево от правой зоны кнопок Reels)
const CY = 790;
// отверстие компостера (в координатах лица билета)
// отверстие компостера — на линии перфорации, хорошо заметное
const HOLE = { x: STUB * W, y: 0.5 * H, r: 30 };

// Маленькая белая легковая машина (вид сбоку), нос вправо.
const MiniCar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly dir: 1 | -1;
  readonly wheel: number;
}> = ({ x, y, dir, wheel }) => (
  <svg
    width={120}
    height={60}
    viewBox="-60 -50 120 60"
    style={{
      position: "absolute",
      left: x - 60,
      top: y - 50,
      overflow: "visible",
      transform: `scaleX(${dir})`,
    }}
  >
    <ellipse cx={0} cy={6} rx={50} ry={5} fill="rgba(20,25,40,0.18)" />
    <path
      d="M -52 -8 Q -54 -22 -42 -24 L -28 -26 Q -18 -42 2 -43 L 18 -42 Q 32 -40 40 -26 L 50 -24 Q 56 -22 55 -10 L 54 -2 L -52 -2 Z"
      fill={C.car}
      stroke="#9AA4B2"
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <path d="M -24 -26 Q -16 -38 -2 -39 L 6 -39 L 6 -26 Z" fill="#A9C8E2" />
    <path d="M 10 -26 L 10 -39 L 18 -38 Q 30 -36 36 -26 Z" fill="#A9C8E2" />
    {[-32, 32].map((wx) => (
      <g key={wx} transform={`translate(${wx} -2) rotate(${wheel})`}>
        <circle r={10} fill="#23262E" />
        <circle r={5} fill="#C9CED6" />
        <rect x={-1} y={-5} width={2} height={10} fill="#8C929C" />
      </g>
    ))}
  </svg>
);

// Итоговое лицо билета после компостера: оба этапа одного дня вместе —
// утром ҮЙ → МЕКТЕП, после уроков МЕКТЕП → ҮЙ — и крупно ҮЙ → МЕКТЕП → ҮЙ.
// (Не возвращаемся к «утреннему» лицу: билет не должен читаться как один конец.)
const FullFace: React.FC = () => {
  const row = (back: boolean, top: number) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      {back ? <BagIcon size={50} /> : <SunIcon size={50} />}
      {back ? <SchoolIcon size={70} /> : <HomeIcon size={70} />}
      <div
        style={{
          width: 150,
          height: 10,
          borderRadius: 5,
          backgroundColor: C.yellow,
        }}
      />
      {back ? <HomeIcon size={70} /> : <SchoolIcon size={70} />}
    </div>
  );
  return (
    <>
      {row(false, 62)}
      {row(true, 160)}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 284,
          textAlign: "center",
          fontFamily,
          fontSize: 50,
          fontWeight: 1000,
          color: C.navy,
          whiteSpace: "nowrap",
        }}
      >
        <Txt>{BG34_TEXT.ticket.route}</Txt>
      </div>
    </>
  );
};

// Поле билета (лицо или оборот): подпись времени, маршрут с машиной, надпись.
const Face: React.FC<{
  readonly f: number;
  readonly back: boolean;
  readonly drive: number; // 0…1 — машина в пути
  readonly show: number; // появление содержимого 0…1
}> = ({ f, back, drive, show }) => {
  const fieldW = W * (1 - STUB) - W * 0.06;
  const iconS = 104;
  const y0 = 228;
  const a = { x: 70, y: y0 };
  const b = { x: fieldW - 70, y: y0 };
  // и утром, и после уроков маршрут читается слева направо:
  // ҮЙ → МЕКТЕП на лице, МЕКТЕП → ҮЙ на обороте
  const u = easeInOut(drive);
  const carX = lerp(a.x + 96, b.x - 96, u);
  const label = back ? BG34_TEXT.ticket.afternoon : BG34_TEXT.ticket.morning;
  const route = back ? BG34_TEXT.ticket.back : BG34_TEXT.ticket.front;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily,
          fontSize: 46,
          fontWeight: 900,
          color: C.navy,
          opacity: show,
        }}
      >
        {back ? <BagIcon size={60} /> : <SunIcon size={60} />}
        {label}
      </div>
      <svg
        width={fieldW}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, opacity: show }}
      >
        <path
          d={`M ${a.x + 56} ${y0 + 20} L ${b.x - 56} ${y0 + 20}`}
          stroke={C.yellowDeep}
          strokeWidth={8}
          strokeDasharray="2 18"
          strokeLinecap="round"
        />
        {/* пройденная часть пути — сплошная жёлтая */}
        <path
          d={`M ${a.x + 56} ${y0 + 20} L ${carX} ${y0 + 20}`}
          stroke={C.yellow}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={drive > 0 ? 1 : 0}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: a.x - iconS / 2,
          top: y0 - iconS / 2 - 10,
          opacity: show,
        }}
      >
        {back ? <SchoolIcon size={iconS} /> : <HomeIcon size={iconS} />}
      </div>
      <div
        style={{
          position: "absolute",
          left: b.x - iconS / 2,
          top: y0 - iconS / 2 - 10,
          opacity: show,
        }}
      >
        {back ? <HomeIcon size={iconS} /> : <SchoolIcon size={iconS} />}
      </div>
      {drive > 0 ? (
        <MiniCar x={carX} y={y0 + 14} dir={1} wheel={f * 24} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 330,
          textAlign: "center",
          fontFamily,
          fontSize: 52,
          fontWeight: 1000,
          color: C.navy,
          opacity: show,
        }}
      >
        <Txt>{route}</Txt>
      </div>
    </>
  );
};

export const TicketScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const wDrive1 = useWordAt("n02", 6); // «эртең»
  const wFlip = useWordAt("n02", 9); // «анан»
  const wDrive2 = useWordAt("n02", 10); // «сабактан»
  const wPunch = useWordAt("n02", 15); // «толук»
  const wEnd = useWordAt("n02", 16);

  // вход: билет вырастает из маленького (как в хуке) в крупный
  const grow = easeOut(f / 16);
  const flap = easeInOut((f - 12) / 14);
  const show = easeOut((f - 20) / 10);
  const drive1 = clamp((f - wDrive1) / Math.max(20, wFlip - wDrive1 - 4));
  const flipT = easeInOut((f - wFlip + 2) / 14);
  const drive2 = clamp((f - wDrive2 - 6) / Math.max(20, wPunch - wDrive2 - 12));
  // компостер: опускается, пробивает, поднимается
  const pDown = easeInOut((f - (wPunch - 10)) / 8);
  const pUp = easeInOut((f - (wPunch + 4)) / 10);
  const press = pDown * (1 - pUp);
  const punched = f >= wPunch - 2;
  const holeT = clamp((f - (wPunch - 2)) / 22);
  // после пробивки — снова лицом (отверстие видно насквозь)
  const flipBack = easeInOut((f - (wPunch + 10)) / 14);
  const ang = 180 * flipT + 180 * flipBack;
  const labelAt = Math.min(wEnd + 4, wPunch + 16);

  // выход: билет уменьшается и уходит вниз к вееру
  const exitT = easeInOut((f - (frames - 18)) / 18);
  // начало совпадает с последним кадром хука: поднятый билет в центре кадра
  const scale = lerp(0.35, 1, grow) * lerp(1, 0.22, exitT);
  const cx = lerp(540, CX, grow);
  const cy = lerp(1010, CY, grow) + lerp(0, 260, exitT);
  const punchOn = f >= wPunch - 22 && f <= wPunch + 22;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Paper />
      <ExampleTag f={f} at={6} />
      <div
        style={{
          position: "absolute",
          left: cx - W / 2,
          top: cy - H / 2,
          width: W,
          height: H,
          perspective: 2200,
          transform: `scale(${scale})`,
          filter: "drop-shadow(0 22px 34px rgba(20,40,90,0.18))",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${ang}deg)`,
          }}
        >
          {/* лицо */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
            }}
          >
            <TicketBody w={W} flap={flap}>
              {f >= wPunch + 10 ? (
                <FullFace />
              ) : (
                <Face f={f} back={false} drive={drive1} show={show} />
              )}
            </TicketBody>
            {punched ? (
              <PunchHole x={HOLE.x} y={HOLE.y} r={HOLE.r} t={holeT} />
            ) : null}
          </div>
          {/* оборот */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <TicketBody w={W} flap={1} logo>
              <Face f={f} back drive={drive2} show={1} />
            </TicketBody>
            {punched ? (
              <PunchHole x={HOLE.x} y={HOLE.y} r={HOLE.r} t={holeT} />
            ) : null}
          </div>
        </div>
      </div>

      {/* компостер сверху к точке пробивки */}
      {punchOn ? (
        <Punch
          x={CX - W / 2 + HOLE.x}
          y={CY - H / 2 + HOLE.y}
          s={0.62}
          press={press}
        />
      ) : null}

      {/* итог: 1 билет = 1 толук сапар */}
      <div
        style={{
          position: "absolute",
          left: 60,
          width: 870,
          top: 1110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          opacity: 1 - exitT,
        }}
      >
        <div
          style={{
            ...rise(f, labelAt),
            fontFamily,
            fontSize: 64,
            fontWeight: 1000,
            color: C.navy,
            textAlign: "center",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          {BG34_TEXT.ticket.equation}
        </div>
        <div style={rise(f, labelAt + 8)}>
          <Pill tone="yellow" size={50}>
            <Txt>{BG34_TEXT.ticket.route}</Txt>
          </Pill>
        </div>
      </div>
    </div>
  );
};
