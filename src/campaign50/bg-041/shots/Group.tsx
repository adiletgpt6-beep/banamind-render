// Сцена 4 «group»: «Алгач топ изделет» + «Кепилдик жок».
// Снятая (прямая) анимация shot(e): на карте Бишкека три заявки семей
// (Үй / Мектеп / Убакыт) по одной съезжаются в общее поле группы, места
// заполняются, календарь поиска идёт 1 → 12 день, маршруты рисуются
// жёлтыми линиями к школе, поле становится «Ылайыктуу топ: 3–4 бала» ✓.
// В ролике эта анимация идёт НАЗАД (◀◀ ×3): маршруты стираются, группа
// распадается на три карточки, они разъезжаются к своим домам, календарь
// возвращается к 1-му дню и плёнка стоит на пустом поле «Топ изделет…».
// В паузе: подпись главы, факты «3–4 бала» и «до 2 недель», лупа ищет
// (без «найденного» состояния), затем честная печать «Кепилдик жок».
// Склейки: кадр 0 — карта крупно на жёлтой линии маршрута (из карточки
// пробы); конец — камера въезжает в пустое белое поле «Топ изделет…»
// (→ белый экран телефона в «start»).
import { clamp01, easeInOut, easeOut, mix, prog } from "../art";
import { cueFrames, local, tapeAt, wordFrame, type SceneProps, type TapeSeg } from "../kit";
import { BG41_TEXT } from "../script";
import { ChapterLabel, CHAPTER_POS, type HudState } from "../tape";
import type { Bg41Timeline } from "../timing";
import {
  AVE_Y,
  Calendar,
  CARD_H,
  CARD_W,
  CityChip,
  Cloud,
  FAMILIES,
  FamilyCard,
  GuaranteeStamp,
  HomePin,
  Magnifier,
  MapBase,
  MapMountains,
  pinHead,
  Routes,
  SchoolPin,
  SearchFact,
  seatCenter,
  SLOT,
  SlotCard,
} from "./group-parts";

const G = BG41_TEXT.group;

// Длина снятой анимации (кадров) и скорость перемотки.
const SHOT = 165;
const SPEED = 3;
const ZOOM_OUT = 18; // кадр 0 → вся карта
const Z0 = 6; // начальное увеличение (склейка с картой карточки пробы)
const FOCUS = { x: 770, y: AVE_Y + 9 }; // точка на жёлтой линии маршрута
const Z_END = 20; // въезд в пустое поле до белого кадра
// пустой белый угол поля (над подсказкой, правее заголовка)
const DIVE = { x: SLOT.x + 640, y: SLOT.y + 62 };
const FINAL = 30; // длительность въезда, кадров
const DRIFT_Z = 0.02; // наезд в паузе
const DRIFT_Y = 990;

export const groupKeys = (tl: Bg41Timeline) => {
  const n04 = cueFrames(tl, "n04");
  const n05 = cueFrames(tl, "n05");
  const rewLen = Math.ceil(SHOT / SPEED);
  const rewEnd = Math.max(ZOOM_OUT + 3 + rewLen, n04.from - 2);
  const rewStart = rewEnd - rewLen;
  const segs: TapeSeg[] = [
    { at: 0, mode: "pause", from: SHOT },
    { at: rewStart, mode: "rew", from: SHOT, speed: SPEED },
  ];
  return {
    n04,
    n05,
    rewStart,
    rewEnd,
    segs,
    label: n04.from - 4,
    need: wordFrame(tl, "n04", "ылайыктуу", 0.3) - 2,
    search: wordFrame(tl, "n04", "түзүлүшү", 0.6) - 2,
    stamp: wordFrame(tl, "n05", "кепилдик", 0.7) - 6,
  };
};

export const groupHud = (tl: Bg41Timeline, f: number): HudState | null => {
  if (f < 0) return null;
  const k = groupKeys(tl);
  const { shot, mode, speed } = tapeAt(k.segs, f, SHOT);
  const pos = CHAPTER_POS.group + (CHAPTER_POS.decision - CHAPTER_POS.group) * (shot / SHOT);
  return { mode, speed, pos };
};

// ---------- Снятая анимация (вперёд) ----------
const shotState = (e: number) => {
  const day = 1 + Math.floor(11 * clamp01((e - 6) / 104) + 1e-6);
  const fly = FAMILIES.map((_, i) => clamp01((e - (24 + 22 * i)) / 30));
  const seats = fly.map((u) => clamp01((u - 0.72) / 0.28));
  const linked = fly.map((u) => easeOut(clamp01((u - 0.85) / 0.15)));
  const formed = easeInOut(prog(e, 102, 14));
  const routes = FAMILIES.map((_, i) => easeInOut(prog(e, 110 + 7 * i, 26)));
  const check = prog(e, 122, 14);
  const school = easeOut(prog(e, 134, 10));
  return { day, fly, seats, linked, formed, routes, check, school };
};

// Камера: зум вокруг неподвижной точки (без «плавания» центра).
const zoomAbout = (za: number, ca: { x: number; y: number }, zb: number, cb: { x: number; y: number }, u: number) => {
  const z = Math.exp(mix(Math.log(za), Math.log(zb), u));
  const P = { x: (cb.x * zb - ca.x * za) / (zb - za), y: (cb.y * zb - ca.y * za) / (zb - za) };
  return { z, cx: P.x - ((P.x - ca.x) * za) / z, cy: P.y - ((P.y - ca.y) * za) / z };
};

const layer = (z: number, cx: number, cy: number): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: 1080,
  height: 1920,
  transformOrigin: "0 0",
  transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})`,
});

export const Group: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, len } = local(tl, "group", t);
  const k = groupKeys(tl);
  const { shot } = tapeAt(k.segs, f, SHOT);
  const s = shotState(shot);

  // покой после перемотки (лупа, волны у домов, мигающие точки)
  const finalAt = len - FINAL - 2;
  const w = Math.max(0, f - k.rewEnd);
  const idle = easeInOut(prog(f, k.rewEnd, 12));
  const zoomIn = easeInOut(prog(f, finalAt, FINAL));
  // содержимое поля гаснет, когда камера уже внутри него
  const content = 1 - easeInOut(prog(zoomIn, 0.2, 0.3));
  // всё, кроме самого поля, растворяется в начале въезда (без гигантского текста)
  const away = 1 - easeInOut(prog(zoomIn, 0, 0.28));

  // камера
  const drift = easeInOut(prog(f, k.rewEnd, finalAt - k.rewEnd));
  // лёгкий наезд вокруг точки (540, DRIFT_Y): верх и низ почти не сдвигаются
  const zIdle = 1 + DRIFT_Z * drift;
  const idleCam = { z: zIdle, x: 540, y: DRIFT_Y + (960 - DRIFT_Y) / zIdle };
  let cam: { z: number; cx: number; cy: number };
  if (f < ZOOM_OUT) {
    cam = zoomAbout(Z0, FOCUS, 1, { x: 540, y: 960 }, easeInOut(f / ZOOM_OUT));
  } else if (f < finalAt) {
    cam = { z: idleCam.z, cx: idleCam.x, cy: idleCam.y };
  } else {
    const a = { z: 1 + DRIFT_Z, x: 540, y: DRIFT_Y + (960 - DRIFT_Y) / (1 + DRIFT_Z) };
    cam = zoomAbout(a.z, { x: a.x, y: a.y }, Z_END, DIVE, zoomIn);
  }
  // склейка: в кадре 0 видна только карта; интерфейс и облака проявляются при отъезде
  const uiIn = easeInOut(prog(f, 2, 11));
  const cloudIn = easeInOut(prog(f, 1, 9));
  // параллакс: карта «дальше» (зумится слабее), облака «ближе»
  const zMap = Math.pow(cam.z, 0.86);
  const zCloud = Math.pow(cam.z, 1.12);

  // облака: в перемотке плывут назад вместе с плёнкой
  const cloudT = shot * 0.7 + w * 0.45;

  // лупа ищет по карте (не находит — без «найденного» состояния)
  const mg = { x: 640 + 190 * Math.sin(w / 34), y: 1030 + 34 * Math.sin(w / 21 + 0.8) };

  const label = prog(f, k.label, 16);
  const labelOut = prog(f, finalAt, 8);
  const need = easeOut(prog(f, k.need, 12));
  const search = easeOut(prog(f, k.search, 12));
  const bracket = easeInOut(prog(f, k.search - 4, 16));
  const stamp = prog(f, k.stamp, 9);
  const note = easeOut(prog(f, k.stamp + 10, 12));
  const pulse = idle * (1 - zoomIn);
  const calPulse = pulse * (0.5 + 0.5 * Math.sin(w / 7));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
      {/* --- карта (дальний план) --- */}
      <div style={layer(zMap, cam.cx, cam.cy)}>
        <MapBase />
        <MapMountains y={1430} />
        <Routes draw={s.routes} />
        <SchoolPin glow={s.school} />
        {FAMILIES.map((fam, i) => (
          <HomePin key={fam.name} fam={fam} linked={s.linked[i]} pulse={pulse * (1 - s.fly[i])} ring={((w + 15 * i) % 48) / 48} />
        ))}
        <Magnifier x={mg.x} y={mg.y} o={idle * (1 - zoomIn) * (1 - stamp)} tilt={8 * Math.sin(w / 26)} />
      </div>
      {/* --- облака (ближний план над картой) --- */}
      <div style={{ ...layer(zCloud, cam.cx, cam.cy), opacity: cloudIn }}>
        <Cloud x={610 + cloudT * 0.9} y={1005} s={0.9} o={0.55} />
        <Cloud x={-60 + cloudT * 0.6} y={760} s={0.75} o={0.5} />
      </div>
      {/* --- интерфейс поиска (передний план) --- */}
      <div style={{ ...layer(cam.z, cam.cx, cam.cy), opacity: uiIn }}>
        <div style={{ position: "absolute", inset: 0, opacity: away }}>
          <Calendar day={s.day} pulse={calPulse} bracket={bracket} />
          <SearchFact u={search} />
          <CityChip x={34} y={690} />
          {/* привязки карточек к домам */}
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {FAMILIES.map((fam, i) => {
              const p = cardPos(i, s.fly[i]);
              const head = pinHead(fam.pin.x, fam.pin.y, fam.ours ? 34 : 30);
              const fromX = Math.max(p.x - p.sc * (CARD_W / 2 - 40), Math.min(p.x + p.sc * (CARD_W / 2 - 40), head.x));
              const o = 1 - clamp01(s.fly[i] * 1.6);
              if (o <= 0) return null;
              return <path key={i} d={`M ${fromX} ${p.y + (p.sc * CARD_H) / 2} L ${head.x} ${head.y - (fam.ours ? 34 : 30)}`} stroke={NAVY_LINE} strokeWidth={4} strokeDasharray="8 8" strokeLinecap="round" opacity={o * 0.8} />;
            })}
          </svg>
        </div>
        <SlotCard
          formed={s.formed}
          seats={[...s.seats, 0]}
          check={s.check}
          need={need * (1 - s.formed)}
          content={content}
          spin={w * 0.8}
          dots={idle > 0 ? (w % 42) / 42 : 1}
        />
        <div style={{ position: "absolute", inset: 0, opacity: away }}>
          {/* карточки семей: у своих домов ↔ летят в поле группы */}
          {FAMILIES.map((fam, i) => {
            const u = s.fly[i];
            const p = cardPos(i, u);
            const o = 1 - clamp01((u - 0.74) / 0.22);
            if (o <= 0) return null;
            return (
              <div
                key={fam.name}
                style={{
                  position: "absolute",
                  left: p.x - CARD_W / 2,
                  top: p.y - CARD_H / 2,
                  transform: `scale(${p.sc}) rotate(${p.rot}deg)`,
                  opacity: o,
                }}
              >
                <FamilyCard fam={fam} hi={pulse * 0} />
              </div>
            );
          })}
          <GuaranteeStamp x={708} y={1072} u={stamp} note={note} noteDx={-40} />
        </div>
      </div>
      <ChapterLabel text={G.label} u={label} out={labelOut} />
    </div>
  );
};

const NAVY_LINE = "#4A5D80";

// Положение карточки семьи i на пути «дом → место в группе» (u 0…1).
const cardPos = (i: number, u: number) => {
  const fam = FAMILIES[i];
  const a = { x: fam.card.x + CARD_W / 2, y: fam.card.y + CARD_H / 2 };
  const b = seatCenter(i);
  const e = easeInOut(u);
  const c = { x: a.x + (b.x - a.x) * 0.15, y: mix(a.y, b.y, 0.85) };
  const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x;
  const y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y;
  const sc = mix(1, 0.3, e);
  const rot = Math.sin(e * Math.PI) * (i === 0 ? -7 : i === 1 ? 5 : 9);
  return { x, y, sc, rot };
};
