// Director — the single place that turns "time" into story state for every scene.
import { DESTINATION } from "./geo";
import { journeyDepth, CX, CY } from "../engines/InfiniteCameraEngine";
import { projectLonLat, EarthParams } from "../engines/EarthRenderer";
import { clamp, lerp, monotoneSpline, smootherstep } from "../engines/math";

export const LAT_C = 20;
export const LON_STOP = 82;
const EARTH_R = 330;

/** Earth spins west→east: the longitude under the viewer decreases with time. Stops for the dive. */
export const lonCenter = (t: number) => {
  if (t < 10.5) return LON_STOP + 62 * Math.pow(1 - t / 10.5, 2);
  if (t < 41.8) return LON_STOP;
  const u = t - 41.8; // gentle restart: accelerates to 0.9°/s over 2 s
  return LON_STOP - (u < 2 ? (0.9 * u * u) / 4 : 0.9 + 0.9 * (u - 2));
};

const framingY = monotoneSpline([[0, 0], [46.8, 0], [49.2, 470], [54.3, 500], [56.3, 2350], [60, 2380]]);
const framingS = monotoneSpline([[0, 1], [46.8, 1], [49.2, 1.12], [54.3, 1.14], [56.3, 7.6], [60, 7.7]]);

export const earthParams = (t: number, J = journeyDepth(t)): EarthParams => {
  const lonC = lonCenter(t);
  const R = EARTH_R * Math.pow(2, J) * framingS(t);
  const a = projectLonLat(DESTINATION.lon, DESTINATION.lat, lonC, LAT_C);
  const w = smootherstep(0.3, 4.2, J);
  return {
    R,
    gx: CX - a.x * R * w,
    gy: CY + a.y * R * w + framingY(t),
    lonC,
    latC: LAT_C,
    cloudLon: -t * 0.6,
    reveal: clamp((t - 2.5) / 1.6),
    J,
  };
};

export { lerp };
