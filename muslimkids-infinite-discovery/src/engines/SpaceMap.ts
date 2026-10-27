// SpaceMap — converts a point given in any reference frame of the film into screen pixels
// at time t. The living line and labels use it to stay glued to worlds while the camera moves.
import { earthParams, LAT_C } from "../content/director";
import { DESTINATION } from "../content/geo";
import { projectLonLat } from "./EarthRenderer";
import { CX, CY, journeyDepth } from "./InfiniteCameraEngine";
import { Vec2 } from "./math";
import { FLIP_J0, SECTION_MID_Y, toScreen, worldState, WorldId, WorldState } from "./NestedWorldEngine";

export type Ref = "screen" | "globe" | "dest" | "cut" | WorldId;

export type Frame = {
  t: number;
  J: number;
  ws: WorldState;
  earth: ReturnType<typeof earthParams>;
  dest: Vec2; // destination on screen
  cutY: number; // screen y of the leaf cut line during the flip
};

const cache = new Map<number, Frame>();
export const frameAt = (t: number): Frame => {
  const key = Math.round(t * 600);
  const hit = cache.get(key);
  if (hit) return hit;
  const J = journeyDepth(t);
  const ws = worldState(J);
  const earth = earthParams(t, J);
  const a = projectLonLat(DESTINATION.lon, DESTINATION.lat, earth.lonC, LAT_C);
  const pan = SECTION_MID_Y * ws.flip * ws.S.m;
  const f: Frame = { t, J, ws, earth, dest: { x: earth.gx + a.x * earth.R, y: earth.gy - a.y * earth.R }, cutY: CY - pan };
  if (cache.size > 5000) cache.clear();
  cache.set(key, f);
  return f;
};

export const flipAngle = (flip: number) => (flip * Math.PI) / 2;

export const mapPoint = (ref: Ref, p: Vec2, f: Frame): Vec2 => {
  switch (ref) {
    case "screen": return p;
    case "globe": return { x: f.earth.gx + p.x * f.earth.R, y: f.earth.gy + p.y * f.earth.R };
    case "dest": return { x: f.dest.x + p.x * f.earth.R, y: f.dest.y + p.y * f.earth.R };
    case "cut": return { x: p.x, y: f.cutY + p.y };
    case "S": {
      if (f.J <= FLIP_J0) return toScreen(f.ws.S, p);
      const v = f.ws.S, th = flipAngle(f.ws.flip);
      return { x: CX + (p.x - v.c.x) * v.m, y: f.cutY + (p.y - v.c.y) * v.m * Math.cos(th) };
    }
    case "X": {
      if (f.ws.flip < 1) {
        const th = flipAngle(f.ws.flip), m = f.ws.X.m;
        return { x: CX + p.x * m, y: f.cutY + p.y * m * Math.sin(th) };
      }
      return toScreen(f.ws.X, p);
    }
    default: return toScreen(f.ws[ref], p);
  }
};
