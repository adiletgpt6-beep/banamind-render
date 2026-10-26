// Сцена 4: монтаж-воспоминание на доске. Изометрический городок (дом,
// школа, офис, автосервис), графитовая машина папы ездит по маршрутам
// фраз сына, светящаяся линия пути растёт синхронно со словами.
//   a) «Эртең менен мени мектепке жеткиресиң» — дом → школа, ребёнок на
//      заднем сиденье выходит у школы;
//   b) «Анан жумушка кетесиң» — школа → офис (машина заезжает в гараж);
//   c) «Сабак бүткөндө кайра келип, мени алып кетесиң» — машина
//      возвращается и уже стоит у школы, мальчик выходит из дверей и
//      садится назад; школа → дом, пунктир «дом → работа»;
//   d) «Апамдын машинасы оңдоодо болгондо, аны да жеткиресиң» — мама у
//      машины папы, её машина на подъёмнике в сервисе («ОҢДООДО»), мама
//      садится вперёд, машина уезжает.
import { C, Chip, GlowPath, RouteChips, fontFamily } from "../kit";
import { clamp, cruise, easeInOut, easeOut, lerp } from "../rig/motion";
import { DD_TEXT } from "../script";
import type { WhyBeats } from "./Why";
import {
  BW,
  BH,
  CAR,
  GRAPHITE,
  SAND,
  IsoBox,
  IsoCar,
  IsoPerson,
  IsoTree,
  boxShadow,
  carShadow,
  faceU,
  faceV,
  flat,
  makeProj,
  mkPath,
  pathAt,
  pathScreen,
  ptsD,
  treeShadow,
  type IsoCam,
  type IsoPath,
  type Proj,
  type Rider,
  type UV,
} from "./WhyIso";

const T = DD_TEXT.why;

// ---------- Городок (мир: u, v, z) ----------
const RING = 400; // кольцевая дорога: углы N(0,0), E(400,0), S(400,400), W(0,400)
const ROAD = 46;
const HOUSE = { u: -150, v: 170, du: 106, dv: 100, h: 52, roof: 34 } as const; // дверь на грани +u, v = 220
const SCHOOL = { u: 30, v: -156, du: 140, dv: 110, h: 84 } as const; // двери на грани +v, u = 100
const OFFICE = { u: 262, v: -134, du: 90, dv: 88, h: 196 } as const; // въезд в гараж на грани +v, u = 307
const SERVICE = { u: 52, v: 280, du: 98, dv: 52, h: 46 } as const; // автосервис, площадка до v = 376
const DOOR = { home: { u: -44, v: 220 }, school: { u: 100, v: -48 } } as const;
const MOM_CAR = { pos: { u: 101, v: 356 }, heading: Math.PI, lift: 8 } as const;

const TREES: readonly (readonly [number, number, number])[] = [
  [-60, 90, 0.9],
  [-210, 300, 1],
  [-130, 330, 0.8],
  [-60, -60, 0.85],
  [200, -180, 0.9],
  [395, -150, 1],
  [170, 150, 1.05],
  [250, 110, 0.9],
  [290, 240, 1.1],
  [210, 260, 0.85],
  [160, 220, 0.8],
  [470, 140, 1],
  [460, 300, 0.9],
  [-90, 470, 1],
];

// Маршруты (центр машины); повороты закруглены.
const P_A = mkPath([{ u: -8, v: 220 }, { u: 0, v: 190 }, { u: 0, v: 0 }, { u: 110, v: 0 }, { u: 150, v: -8 }], 32);
const P_B = mkPath([{ u: 150, v: -8 }, { u: 190, v: 0 }, { u: 307, v: 0 }, { u: 307, v: -72 }], 24);
const P_C1 = mkPath([{ u: 307, v: -72 }, { u: 307, v: 0 }, { u: 92, v: 0 }, { u: 52, v: -8 }], 24);
const P_C2 = mkPath([{ u: 52, v: -8 }, { u: 0, v: 0 }, { u: 0, v: 190 }, { u: -8, v: 220 }], 30);
const P_D = mkPath([{ u: -8, v: 220 }, { u: 0, v: 250 }, { u: 0, v: RING }, { u: RING, v: RING }], 36);
// пунктир «потом — снова на работу»: дом → W → S → E → офис
const P_BACK = mkPath([{ u: 0, v: 220 }, { u: 0, v: RING }, { u: RING, v: RING }, { u: RING, v: 0 }, { u: 307, v: 0 }, { u: 307, v: -46 }], 36);
// линия пути b) — до въезда в гараж
const P_B_LINE = mkPath([{ u: 150, v: -8 }, { u: 190, v: 0 }, { u: 307, v: 0 }, { u: 307, v: -46 }], 24);

type Leg = { readonly path: IsoPath; readonly t0: number; readonly t1: number; readonly acc?: number };

const legsOf = (b: WhyBeats): readonly Leg[] => [
  { path: P_A, t0: b.a.meni - 3, t1: b.a.jet + 9 },
  { path: P_B, t0: b.b.from - 1, t1: b.b.ket + 16 },
  { path: P_C1, t0: b.c.from + 2, t1: b.c.kel + 4 },
  { path: P_C2, t0: b.c.ket + 1, t1: b.c.to + 15 },
  // уезжает с мамой: разгон без остановки (сцена кончается в движении)
  { path: P_D, t0: b.d.jet, t1: b.d.jet + 72 },
];

// Положение машины в кадре t: на маршруте текущего отрезка или в конце
// предыдущего; s — пройденный путь (для вращения колёс).
const carAt = (t: number, legs: readonly Leg[]) => {
  let done = 0;
  for (let i = 0; i < legs.length; i++) {
    const L = legs[i];
    if (t < L.t0) {
      const prev = i === 0 ? { path: L.path, d: 0 } : { path: legs[i - 1].path, d: legs[i - 1].path.len };
      const st = pathAt(prev.path, prev.d);
      return { ...st, s: done, leg: i - 0.5, d: 0 };
    }
    const x = (t - L.t0) / (L.t1 - L.t0);
    const d = L.path.len * cruise(x, 0.3);
    if (t <= L.t1) {
      const st = pathAt(L.path, d);
      return { ...st, s: done + d, leg: i, d };
    }
    done += L.path.len;
  }
  const last = legs[legs.length - 1];
  return { ...pathAt(last.path, last.path.len), s: done, leg: legs.length, d: 0 };
};

// Камера доски: ключевые планы и плавные переходы между ними.
type CamKey = readonly [number, IsoCam];
const camAt = (t: number, ks: readonly CamKey[]): IsoCam => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, c1] = ks[i];
    const [t0, c0] = ks[i - 1];
    if (t <= t1) {
      const e = easeInOut((t - t0) / Math.max(1, t1 - t0));
      // масштаб — в логарифме (равномерное ощущение наезда)
      const z = Math.exp(lerp(Math.log(c0.zoom), Math.log(c1.zoom), e));
      return { x: lerp(c0.x, c1.x, e), y: lerp(c0.y, c1.y, e), zoom: z };
    }
  }
  return ks[ks.length - 1][1];
};

// Ходьба фигурки по ломаной за [t0, t1]: точка, направление по экрану, фаза.
const walk = (t: number, t0: number, t1: number, pts: readonly UV[], stride = 13) => {
  const path = mkPath(pts, 10);
  const x = clamp((t - t0) / Math.max(1, t1 - t0));
  const d = path.len * cruise(x, 0.25);
  const st = pathAt(path, d);
  const hu = Math.cos(st.heading);
  const hv = Math.sin(st.heading);
  const moving = t > t0 && t < t1 ? 1 : 0;
  return { at: st.pos, dir: hu - hv, phase: d / stride, amt: moving * Math.min(1, x * 6, (1 - x) * 6) };
};

// Человек перед машиной (ближе к зрителю), если ближайшая точка корпуса дальше.
const inFront = (p: UV, car: { pos: UV; heading: number }) => {
  const hu = Math.cos(car.heading);
  const hv = Math.sin(car.heading);
  const du = p.u - car.pos.u;
  const dv = p.v - car.pos.v;
  const f = clamp(du * hu + dv * hv, -CAR.l / 2, CAR.l / 2);
  const r = clamp(du * hv - dv * hu, -CAR.w / 2, CAR.w / 2);
  const cu = car.pos.u + f * hu + r * hv;
  const cv = car.pos.v + f * hv - r * hu;
  return p.u + p.v > cu + cv;
};

const grow = (t: number, at: number, dur = 10) => easeOut((t - at) / dur);

export const WhyCity: React.FC<{ t: number; b: WhyBeats }> = ({ t, b }) => {
  const legs = legsOf(b);
  const cam = camAt(t, [
    [b.a.jet - 6, { x: -44, y: -12, zoom: 1.4 }],
    [b.a.jet + 12, { x: 160, y: -48, zoom: 2.0 }],
    [b.b.from - 6, { x: 160, y: -48, zoom: 2.0 }],
    [b.b.from + 12, { x: 0, y: 122, zoom: 1.0 }],
    [b.c.from - 10, { x: 0, y: 122, zoom: 1.0 }],
    [b.c.from + 8, { x: 150, y: -22, zoom: 2.3 }],
    [b.c.ket, { x: 150, y: -22, zoom: 2.3 }],
    [b.c.ket + 16, { x: -80, y: -8, zoom: 1.45 }],
    [b.c.to + 8, { x: -80, y: -8, zoom: 1.45 }],
    [b.d.from + 10, { x: -236, y: 104, zoom: 2.3 }],
    [b.d.jet, { x: -236, y: 104, zoom: 2.3 }],
    [b.end + 4, { x: -120, y: 236, zoom: 1.75 }],
  ]);
  const P = makeProj(cam);
  const car = carAt(t, legs);
  const roll = car.s / (Math.PI * 2 * 6.2);

  // ---------- появления ----------
  const gHouse = grow(t, 2);
  const gSchool = grow(t, 9);
  const gOffice = grow(t, b.b.from - 2);
  const gService = grow(t, b.d.from + 2);
  const carIn = easeOut((t - 6) / 8);
  // машина въезжает в гараж офиса (b) и выезжает из него (c)
  const garageFade =
    car.leg === 1 || car.leg === 1.5 ? clamp((car.pos.v + 60) / 26) : car.leg === 2 ? clamp((car.pos.v + 60) / 26) : 1;
  const carO = carIn * garageFade;

  // ---------- мальчик ----------
  const aStop = legs[0].t1;
  const homeStop = legs[3].t1;
  const boyRider =
    t < aStop + 2
      ? 1
      : t < b.c.ket - 4
        ? clamp(1 - (t - (aStop + 2)) / 4) + clamp((t - (b.c.ket - 6)) / 4)
        : t < homeStop + 2
          ? clamp((t - (b.c.ket - 6)) / 4)
          : clamp(1 - (t - (homeStop + 2)) / 4);
  type Fig = { at: UV; dir: number; phase: number; amt: number; o: number };
  let boy: Fig | null = null;
  if (t >= aStop + 1 && t <= aStop + 26) {
    const w = walk(t, aStop + 3, aStop + 20, [{ u: 136, v: -31 }, { u: 112, v: -42 }, { u: DOOR.school.u, v: DOOR.school.v }]);
    boy = { ...w, o: clamp((t - (aStop + 1)) / 4) * clamp(1 - (t - (aStop + 20)) / 5) };
  } else if (t >= b.c.meni - 8 && t <= b.c.ket + 1) {
    const w = walk(t, b.c.meni - 4, b.c.ket - 5, [{ u: DOOR.school.u, v: DOOR.school.v }, { u: 96, v: -38 }, { u: 86, v: -31 }]);
    boy = { ...w, o: clamp((t - (b.c.meni - 8)) / 4) * clamp(1 - (t - (b.c.ket - 5)) / 5) };
  } else if (t >= homeStop + 1 && t <= homeStop + 24) {
    const w = walk(t, homeStop + 3, homeStop + 17, [{ u: -32, v: 206 }, { u: -40, v: 214 }, { u: DOOR.home.u, v: DOOR.home.v }]);
    boy = { ...w, o: clamp((t - (homeStop + 1)) / 4) * clamp(1 - (t - (homeStop + 17)) / 5) };
  }

  // ---------- мама ----------
  const momOut = homeStop + 20;
  let mom: Fig | null = null;
  if (t >= momOut && t <= b.d.any + 9) {
    const w = walk(t, momOut + 4, b.d.bol + 4, [{ u: DOOR.home.u, v: DOOR.home.v + 2 }, { u: -36, v: 170 }, { u: 26, v: 168 }, { u: 28, v: 226 }], 15);
    const inCar = clamp((t - b.d.any) / 8);
    const at = { u: lerp(w.at.u, 14, easeInOut(inCar)), v: w.at.v };
    mom = { ...w, at, o: clamp((t - momOut) / 5) * (1 - inCar) };
  }
  const momRider = clamp((t - (b.d.any + 4)) / 6);

  // двери: школа открыта, когда мальчик проходит; дом — мальчик и мама
  const schoolDoor = Math.max(win(t, aStop + 14, aStop + 26), win(t, b.c.meni - 10, b.c.meni + 2));
  const homeDoor = Math.max(win(t, homeStop + 10, homeStop + 22), win(t, momOut - 4, momOut + 10));

  const riders: Rider[] = [
    { f: 7, r: -8, kind: "dad", o: 1 },
    { f: -17, r: 3, kind: "boy", o: boyRider },
    { f: 7, r: 8, kind: "mom", o: momRider },
  ];

  // ---------- линии маршрута ----------
  const morningO = 1 - 0.78 * easeInOut((t - (b.c.from - 8)) / 10);
  const pA = easeInOut((t - b.a.meni) / Math.max(6, b.a.jet + 4 - b.a.meni));
  const pB = easeInOut((t - b.b.from) / Math.max(6, b.b.ket + 8 - b.b.from));
  const legD = (i: number) => (car.leg === i ? car.d : car.leg > i ? legs[i].path.len : 0);
  const pBack = easeInOut((t - (b.c.to + 2)) / 22);
  const route = (path: IsoPath, s1: number, o = 1, dashed = false) => {
    const sp = pathScreen(P, path, 0, s1);
    if (!sp.d) return null;
    return (
      <g opacity={o}>
        <GlowPath d={sp.d} len={sp.len} progress={1} dashed={dashed} />
      </g>
    );
  };

  // ---------- объекты по глубине ----------
  type Item = { depth: number; el: React.ReactNode };
  const items: Item[] = [];
  const houseEl = gHouse > 0 ? <House key="house" P={P} g={gHouse} door={homeDoor} /> : null;
  items.push({ depth: HOUSE.u + HOUSE.du / 2 + HOUSE.v + HOUSE.dv / 2, el: houseEl });
  items.push({ depth: SCHOOL.u + SCHOOL.du / 2 + SCHOOL.v + SCHOOL.dv / 2, el: gSchool > 0 ? <School key="school" P={P} g={gSchool} door={schoolDoor} /> : null });
  items.push({ depth: OFFICE.u + OFFICE.du / 2 + OFFICE.v + OFFICE.dv / 2, el: gOffice > 0 ? <Office key="office" P={P} g={gOffice} /> : null });
  items.push({ depth: SERVICE.u + SERVICE.du / 2 + SERVICE.v + SERVICE.dv / 2, el: gService > 0 ? <Service key="service" P={P} g={gService} /> : null });
  if (gService > 0) {
    items.push({
      depth: MOM_CAR.pos.u + MOM_CAR.pos.v,
      el: (
        <g key="momcar" opacity={gService}>
          <Lift P={P} />
          <IsoCar P={P} pos={MOM_CAR.pos} heading={MOM_CAR.heading} paint={SAND} z={MOM_CAR.lift * gService} />
        </g>
      ),
    });
  }
  TREES.forEach(([u, v, s], i) => {
    const g = grow(t, 3 + i * 1.5, 8);
    items.push({ depth: u + v, el: <IsoTree key={`tree${i}`} P={P} at={{ u, v }} s={s} g={g} /> });
  });
  const carDepth = car.pos.u + car.pos.v;
  items.push({
    depth: carDepth,
    el: carO > 0.01 ? (
      <g key="car" opacity={carO}>
        <IsoCar P={P} pos={car.pos} heading={car.heading} paint={GRAPHITE} riders={riders} roll={roll} />
      </g>
    ) : null,
  });
  const person = (f: Fig | null, kind: "boy" | "mom") => {
    if (!f) return;
    const front = inFront(f.at, car);
    items.push({
      depth: front ? carDepth + 0.5 : carDepth - 0.5,
      el: <IsoPerson key={kind} P={P} at={f.at} kind={kind} dir={f.dir} phase={f.phase} amt={f.amt} o={f.o} />,
    });
  };
  person(boy, "boy");
  person(mom, "mom");
  items.sort((x, y) => x.depth - y.depth);

  // ---------- подписи (экранные, постоянного размера) ----------
  const fadeEdge = (x: number, y: number) => clamp((x - 70) / 50) * clamp((930 - x) / 50) * clamp((y - 120) / 40) * clamp((790 - y) / 40);
  const roofHome = P.p(HOUSE.u + HOUSE.du / 2, HOUSE.v + HOUSE.dv / 2, (HOUSE.h + HOUSE.roof) * gHouse);
  const roofSchool = P.p(SCHOOL.u + SCHOOL.du * 0.5, SCHOOL.v + SCHOOL.dv * 0.55, (SCHOOL.h + 5) * gSchool);
  const topOffice = P.p(OFFICE.u + OFFICE.du / 2, OFFICE.v + OFFICE.dv / 2, OFFICE.h * gOffice);
  const momCarTop = P.p(MOM_CAR.pos.u, MOM_CAR.pos.v, 40);

  const shadowBlur = 3 + 2 * cam.zoom;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: BW, height: BH }}>
      <svg width={BW} height={BH} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <filter id="why-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={shadowBlur} />
          </filter>
          <linearGradient id="why-ground" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#173A4E" />
            <stop offset="1" stopColor="#10283A" />
          </linearGradient>
        </defs>
        {/* земля квартала и парк внутри кольца */}
        <path d={flat(P, -300, -300, RING + 300, RING + 300)} fill="url(#why-ground)" opacity={0.55} />
        <path d={flat(P, ROAD / 2 + 8, ROAD / 2 + 8, RING - ROAD / 2 - 8, RING - ROAD / 2 - 8)} fill="#17463F" opacity={0.85} />
        {/* дорожки: площадка сервиса, въезд к гаражу офиса */}
        <path d={flat(P, SERVICE.u - 6, SERVICE.v + SERVICE.dv, SERVICE.u + SERVICE.du + 6, RING - ROAD / 2)} fill="#2A4A63" opacity={gService} />
        <path d={flat(P, 290, -50, 324, -ROAD / 2)} fill="#24435B" opacity={gOffice} />
        {/* кольцевая дорога: тротуар, полотно, светлая кромка */}
        <Ring P={P} />
        {/* маршруты */}
        <g opacity={morningO}>
          {route(P_A, pA * P_A.len)}
          {route(P_B_LINE, pB * P_B_LINE.len)}
        </g>
        {route(P_C1, legD(2))}
        {route(P_C2, legD(3))}
        {pBack > 0 ? route(P_BACK, pBack * P_BACK.len, 0.9 * (1 - 0.6 * clamp((t - b.d.jet) / 10)), true) : null}
        {route(P_D, legD(4))}
        {/* мягкие тени */}
        <g filter="url(#why-soft)" fill="rgba(3,8,18,0.55)">
          {gHouse > 0 ? <path d={boxShadow(P, HOUSE.u, HOUSE.v, HOUSE.du, HOUSE.dv, (HOUSE.h + HOUSE.roof * 0.6) * gHouse)} /> : null}
          {gSchool > 0 ? <path d={boxShadow(P, SCHOOL.u, SCHOOL.v, SCHOOL.du, SCHOOL.dv, SCHOOL.h * gSchool)} /> : null}
          {gOffice > 0 ? <path d={boxShadow(P, OFFICE.u, OFFICE.v, OFFICE.du, OFFICE.dv, OFFICE.h * 0.55 * gOffice)} /> : null}
          {gService > 0 ? <path d={boxShadow(P, SERVICE.u, SERVICE.v, SERVICE.du, SERVICE.dv, SERVICE.h * gService)} opacity={gService} /> : null}
          {gService > 0 ? <path d={carShadow(P, MOM_CAR.pos, MOM_CAR.heading, MOM_CAR.lift)} opacity={gService} /> : null}
          {carO > 0.01 ? <path d={carShadow(P, car.pos, car.heading)} opacity={carO} /> : null}
          {TREES.map(([u, v, s], i) => {
            const g = grow(t, 3 + i * 1.5, 8);
            const sh = treeShadow(P, { u, v }, s);
            return g > 0 ? <ellipse key={i} {...sh} opacity={g} /> : null;
          })}
        </g>
        {items.map((it) => it.el)}
        {/* подсветка машины мамы на «машинасы» */}
        {gService > 0 ? <MomCarGlow P={P} t={t} at={b.d.mash} /> : null}
      </svg>
      {/* подписи зданий */}
      {gHouse > 0.5 ? (
        <Label x={roofHome.x} y={roofHome.y - 34} o={fadeEdge(roofHome.x, roofHome.y - 34) * easeOut((t - 8) / 8)}>
          {T.home}
        </Label>
      ) : null}
      {gSchool > 0.3 ? <SchoolSign x={roofSchool.x} y={roofSchool.y} t={t} at={b.a.mek - 2} o={fadeEdge(roofSchool.x, roofSchool.y - 40)} zoom={cam.zoom} /> : null}
      {gOffice > 0.5 ? (
        <div style={{ opacity: fadeEdge(topOffice.x, topOffice.y - 40) }}>
          <Chip x={topOffice.x} y={topOffice.y - 44} t={t} at={b.b.jum} size={40}>
            {T.work}
          </Chip>
        </div>
      ) : null}
      {gService > 0.5 ? <RepairMark x={momCarTop.x} y={momCarTop.y} t={t} at={b.d.ond} zoom={cam.zoom} /> : null}
      {/* время дня */}
      <Chip x={BW / 2} y={64} t={t} at={b.a.from - 4} out={b.c.from - 6} size={42} accent={C.yellow}>
        <Sun />
        <span>{T.morning}</span>
      </Chip>
      <Chip x={BW / 2} y={64} t={t} at={b.c.from} out={b.d.from + 6} size={42} accent={C.yellow}>
        <Bell />
        <span>{T.afterSchool}</span>
      </Chip>
      {/* маршрут дня словами */}
      <RouteChips t={t} at={b.a.from} step={(b.b.jum - b.a.from) / 2} items={T.routeA} y={832} size={40} out={b.c.from - 8} />
      {t >= b.c.from ? <RouteChips t={t} at={b.c.from + 6} step={(b.c.to + 30 - (b.c.from + 6)) / 3} items={T.routeB} y={832} size={38} /> : null}
    </div>
  );
};

const win = (t: number, a: number, z: number) => Math.min(easeOut((t - a) / 4), 1 - easeInOut((t - z) / 5));

// ---------- Дорога ----------
const Ring: React.FC<{ P: Proj }> = ({ P }) => {
  const corners = [
    P.p(0, 0),
    P.p(RING, 0),
    P.p(RING, RING),
    P.p(0, RING),
  ];
  const d = ptsD(corners, true);
  const k = 0.866 * P.zoom;
  return (
    <g fill="none" strokeLinejoin="round">
      <path d={d} stroke="#2E5874" strokeWidth={(ROAD + 18) * k} />
      <path d={d} stroke="rgba(115,220,232,0.35)" strokeWidth={(ROAD + 4) * k} />
      <path d={d} stroke="#1A3247" strokeWidth={ROAD * k} />
    </g>
  );
};

// ---------- Здания ----------
const House: React.FC<{ P: Proj; g: number; door: number }> = ({ P, g, door }) => {
  const { u, v, du, dv } = HOUSE;
  const h = HOUSE.h * g;
  const r = HOUSE.roof * g;
  const ridgeU = u + du / 2;
  const wall = { top: "#F5E7CF", left: "#F1DFC0", right: "#D3BC97", edge: "rgba(30,40,60,0.25)" };
  // фронтон на грани +v (треугольник) и скаты крыши (конёк вдоль v)
  const gable = ptsD([P.p(u, v + dv, h), P.p(u + du, v + dv, h), P.p(ridgeU, v + dv, h + r)], true);
  const slopeR = ptsD([P.p(ridgeU, v - 4, h + r), P.p(ridgeU, v + dv + 4, h + r), P.p(u + du + 6, v + dv + 4, h - 4), P.p(u + du + 6, v - 4, h - 4)], true);
  const slopeL = ptsD([P.p(ridgeU, v - 4, h + r), P.p(ridgeU, v + dv + 4, h + r), P.p(u - 6, v + dv + 4, h - 4), P.p(u - 6, v - 4, h - 4)], true);
  return (
    <g opacity={Math.min(1, g * 3)}>
      <IsoBox P={P} u={u} v={v} du={du} dv={dv} h={h} c={wall} />
      <path d={gable} fill="#F1DFC0" stroke="rgba(30,40,60,0.25)" strokeWidth={1.2} />
      {/* окна на фронтоне и на фасаде */}
      {g > 0.6 ? (
        <g>
          <path d={faceV(P, v + dv + 0.5, u + 22, u + 44, h * 0.42, h * 0.78)} fill="#BFE3EE" stroke="#FFFFFF" strokeWidth={1.5} />
          <path d={faceV(P, v + dv + 0.5, u + 62, u + 84, h * 0.42, h * 0.78)} fill="#BFE3EE" stroke="#FFFFFF" strokeWidth={1.5} />
          <path d={faceU(P, u + du + 0.5, v + 14, v + 34, h * 0.4, h * 0.78)} fill="#A9D3E2" stroke="#F4EBDD" strokeWidth={1.5} />
          <path d={faceU(P, u + du + 0.5, v + 70, v + 88, h * 0.4, h * 0.78)} fill="#A9D3E2" stroke="#F4EBDD" strokeWidth={1.5} />
          {/* дверь к дороге */}
          <path d={faceU(P, u + du + 0.6, DOOR.home.v - 10, DOOR.home.v + 10, 0, 34)} fill="#8A5A3C" />
          <path d={faceU(P, u + du + 0.8, DOOR.home.v - 10, DOOR.home.v - 10 + 20 * (1 - 0.8 * door), 0, 34)} fill="#A86F4A" opacity={1} />
          {door > 0 ? <path d={faceU(P, u + du + 0.7, DOOR.home.v - 10 + 20 * (1 - 0.8 * door), DOOR.home.v + 10, 0, 34)} fill="#3A2A24" /> : null}
        </g>
      ) : null}
      <path d={slopeL} fill="#E58E62" stroke="rgba(60,30,20,0.3)" strokeWidth={1.2} />
      <path d={slopeR} fill="#B9674A" stroke="rgba(60,30,20,0.3)" strokeWidth={1.2} />
    </g>
  );
};

const School: React.FC<{ P: Proj; g: number; door: number }> = ({ P, g, door }) => {
  const { u, v, du, dv } = SCHOOL;
  const h = SCHOOL.h * g;
  const c = { top: "#F7E3A6", left: "#F3CF72", right: "#D2A84E", edge: "rgba(30,40,60,0.25)" };
  const fv = v + dv + 0.5;
  const fu = u + du + 0.5;
  return (
    <g opacity={Math.min(1, g * 3)}>
      <IsoBox P={P} u={u} v={v} du={du} dv={dv} h={h} c={c} />
      {/* парапет */}
      <IsoBox P={P} u={u - 2} v={v - 2} du={du + 4} dv={dv + 4} z={h} h={5 * g} c={{ top: "#FFFFFF", left: "#F2EEE6", right: "#D9D2C4" }} />
      {g > 0.6 ? (
        <g>
          {[0, 1].map((row) =>
            [14, 34, 104, 124].map((x) => (
              <path key={`f${row}-${x}`} d={faceV(P, fv, u + x - 7, u + x + 7, 14 + row * 34, 34 + row * 34)} fill="#A9DDEA" stroke="#FFFFFF" strokeWidth={1.4} />
            )),
          )}
          {[0, 1].map((row) =>
            [20, 46, 72, 96].map((y) => (
              <path key={`s${row}-${y}`} d={faceU(P, fu, v + y - 8, v + y + 8, 14 + row * 34, 34 + row * 34)} fill="#8CC6D6" stroke="#F4E9CC" strokeWidth={1.4} />
            )),
          )}
          {/* часы над входом */}
          <path d={faceV(P, fv, DOOR.school.u - 9, DOOR.school.u + 9, 52, 70)} fill="#FFFFFF" stroke="#3F6FA6" strokeWidth={1.6} />
          {/* двойные двери; открываются, когда выходит мальчик */}
          <path d={faceV(P, fv, DOOR.school.u - 18, DOOR.school.u + 18, 0, 40)} fill="#2E5874" />
          <path d={faceV(P, fv + 0.2, DOOR.school.u - 18, DOOR.school.u - 18 + 17 * (1 - 0.85 * door), 1, 39)} fill="#5C88BC" />
          <path d={faceV(P, fv + 0.2, DOOR.school.u + 18 - 17 * (1 - 0.85 * door), DOOR.school.u + 18, 1, 39)} fill="#5C88BC" />
          {/* ступени */}
          <path d={flat(P, DOOR.school.u - 24, v + dv, DOOR.school.u + 24, v + dv + 8, 2)} fill="#E8E2D6" />
        </g>
      ) : null}
    </g>
  );
};

const Office: React.FC<{ P: Proj; g: number }> = ({ P, g }) => {
  const { u, v, du, dv } = OFFICE;
  const h = OFFICE.h * g;
  const c = { top: "#B9EAF2", left: "#7DCCDD", right: "#4F9DB3", edge: "rgba(160,240,250,0.85)" };
  const floors = Math.floor(h / 22);
  return (
    <g opacity={Math.min(1, g * 3)}>
      <IsoBox P={P} u={u} v={v} du={du} dv={dv} h={h} c={c} />
      {/* стеклянная сетка */}
      {Array.from({ length: floors }, (_, i) => (
        <g key={i} stroke="rgba(255,255,255,0.42)" strokeWidth={1.2} fill="none">
          <path d={ptsD([P.p(u, v + dv + 0.4, 30 + i * 22), P.p(u + du, v + dv + 0.4, 30 + i * 22)])} />
          <path d={ptsD([P.p(u + du + 0.4, v, 30 + i * 22), P.p(u + du + 0.4, v + dv, 30 + i * 22)])} />
        </g>
      ))}
      {[22, 45, 68].map((x) => (
        <path key={x} d={ptsD([P.p(u + x, v + dv + 0.4, 30), P.p(u + x, v + dv + 0.4, h)])} stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
      ))}
      {/* въезд в подземный гараж */}
      <path d={faceV(P, v + dv + 0.6, 290, 324, 0, Math.min(h, 24))} fill="#0C1724" stroke="rgba(160,240,250,0.7)" strokeWidth={1.4} />
    </g>
  );
};

const Service: React.FC<{ P: Proj; g: number }> = ({ P, g }) => {
  const { u, v, du, dv } = SERVICE;
  const h = SERVICE.h * g;
  const c = { top: "#E3E7EC", left: "#CDD3DB", right: "#A4ADB9", edge: "rgba(30,40,60,0.25)" };
  return (
    <g opacity={Math.min(1, g * 3)}>
      <IsoBox P={P} u={u} v={v} du={du} dv={dv} h={h} c={c} />
      {g > 0.6 ? (
        <g>
          {/* ворота бокса */}
          <path d={faceV(P, v + dv + 0.5, u + 14, u + 84, 0, 34)} fill="#8C96A4" />
          {[6, 12, 18, 24, 30].map((z) => (
            <path key={z} d={ptsD([P.p(u + 14, v + dv + 0.6, z), P.p(u + 84, v + dv + 0.6, z)])} stroke="#6F7987" strokeWidth={1.2} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

// Подъёмник под машиной мамы.
const Lift: React.FC<{ P: Proj }> = ({ P }) => {
  const { u, v } = MOM_CAR.pos;
  return (
    <g>
      <path d={flat(P, u - 44, v - 22, u + 44, v + 22, 0.5)} fill="#3B556B" />
      {[-1, 1].map((k) => (
        <path key={k} d={ptsD([P.p(u + k * 30, v + 21, 0), P.p(u + k * 30, v + 21, MOM_CAR.lift + 4)])} stroke="#C9B26A" strokeWidth={3 * P.zoom} strokeLinecap="round" />
      ))}
    </g>
  );
};

const MomCarGlow: React.FC<{ P: Proj; t: number; at: number }> = ({ P, t, at }) => {
  const u = easeOut((t - at) / 10);
  if (u <= 0) return null;
  const c = P.p(MOM_CAR.pos.u, MOM_CAR.pos.v, 4);
  const pulse = 1 + 0.06 * Math.sin((t - at) / 5);
  return (
    <ellipse
      cx={c.x}
      cy={c.y}
      rx={58 * P.zoom * pulse}
      ry={32 * P.zoom * pulse}
      fill="none"
      stroke={C.cyan}
      strokeWidth={4}
      opacity={0.8 * u}
      style={{ filter: "drop-shadow(0 0 6px rgba(115,220,232,0.8))" }}
    />
  );
};

// ---------- Подписи ----------
const Label: React.FC<{ x: number; y: number; o: number; children: React.ReactNode }> = ({ x, y, o, children }) =>
  o > 0.01 ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity: o,
        padding: "6px 20px",
        borderRadius: 30,
        background: "rgba(16,24,39,0.88)",
        border: `3px solid ${C.cyan}`,
        boxShadow: "0 0 18px rgba(115,220,232,0.4)",
        fontFamily,
        fontWeight: 900,
        fontSize: 38,
        color: C.light,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  ) : null;

// Вывеска «МЕКТЕП» на крыше школы: светлая табличка на двух стойках.
const SchoolSign: React.FC<{ x: number; y: number; t: number; at: number; o: number; zoom: number }> = ({ x, y, t, at, o, zoom }) => {
  const u = easeOut((t - at) / 9);
  if (u <= 0 || o <= 0.01) return null;
  const post = 10 + 6 * zoom;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o * u, transform: `translate(-50%, -100%) scale(${0.9 + 0.1 * u})`, transformOrigin: "50% 100%" }}>
      <div
        style={{
          padding: "4px 20px 6px",
          borderRadius: 10,
          background: "#FBF8F1",
          border: "4px solid #3F6FA6",
          boxShadow: "0 6px 18px rgba(5,10,25,0.45)",
          fontFamily,
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: 1,
          color: "#1E3A6B",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {T.school}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 34px" }}>
        <div style={{ width: 5, height: post, background: "#3F6FA6" }} />
        <div style={{ width: 5, height: post, background: "#3F6FA6" }} />
      </div>
    </div>
  );
};

// Значок ключа и плашка «ОҢДООДО» над машиной мамы.
const RepairMark: React.FC<{ x: number; y: number; t: number; at: number; zoom: number }> = ({ x, y, t, at, zoom }) => {
  const u = easeOut((t - (at - 5)) / 8);
  if (u <= 0) return null;
  const by = y - 20 - 10 * zoom;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: by, transform: `translate(-50%, -100%) scale(${0.7 + 0.3 * u})`, transformOrigin: "50% 100%", opacity: u }}>
        <svg width={64} height={64} viewBox="-32 -32 64 64">
          <circle r={28} fill="rgba(16,24,39,0.92)" stroke={C.yellow} strokeWidth={3.5} />
          <g transform="rotate(-45)" fill={C.light}>
            <rect x={-4} y={-6} width={8} height={24} rx={3} />
            <path d="M -11 -14 A 11 11 0 1 0 11 -14 L 5 -14 L 5 -8 L -5 -8 L -5 -14 Z" />
          </g>
        </svg>
      </div>
      <Chip x={x} y={by - 64 - 34} t={t} at={at} size={40} accent={C.yellow}>
        {T.repair}
      </Chip>
    </>
  );
};

const Sun: React.FC = () => (
  <svg width={40} height={40} viewBox="-20 -20 40 40">
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-2} y={-19} width={4} height={7} rx={2} fill={C.yellow} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={9} fill={C.yellow} />
  </svg>
);

const Bell: React.FC = () => (
  <svg width={40} height={40} viewBox="-20 -20 40 40">
    <path d="M -12 9 C -12 -2 -10 -13 0 -13 C 10 -13 12 -2 12 9 L 15 12 L -15 12 Z" fill={C.yellow} />
    <circle cx={0} cy={15} r={3.5} fill={C.yellow} />
    <rect x={-2} y={-18} width={4} height={6} rx={2} fill={C.yellow} />
  </svg>
);
