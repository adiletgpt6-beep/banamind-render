import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Who } from "./character";
import type { Rig } from "./rig";
import { hairShell, headGeometry, headSurfaceZ, irisTexture, skullLock, sphereCap, stripeTexture, sweptLock, type HairStyle } from "./sculpt";

// A coherent, soft 3D character design. Keep the existing articulated rig,
// but replace the anatomical body shells with clean, closed fabric surfaces.
// All geometry is made in the bind pose; animation remains frame deterministic.
const palette: Record<Who, { skin: string; top: string; trousers: string; hair: string }> = {
  mom: { skin: "#F2C6A5", top: "#65AAA0", trousers: "#3B4867", hair: "#493128" },
  son: { skin: "#F6C9A6", top: "#E0963C", trousers: "#2E4268", hair: "#47301F" },
  husband: { skin: "#EDBF9C", top: "#D8AE72", trousers: "#435573", hair: "#4A3128" },
  colleague: { skin: "#F3CBB1", top: "#A39FBF", trousers: "#535978", hair: "#52382D" },
  teacher: { skin: "#EFC3A2", top: "#D28A81", trousers: "#525A71", hair: "#463129" },
  boss: { skin: "#EDC3A5", top: "#839DB7", trousers: "#3C526E", hair: "#6A5C54" },
  girl: { skin: "#F5C9AB", top: "#EFBFB8", trousers: "#4B597A", hair: "#4A3128" },
  parent: { skin: "#EDC19F", top: "#8CA68C", trousers: "#505A72", hair: "#4A342A" },
};

export const designCharacter = (rig: Rig, who: Who) => {
  const { root, bones } = rig;
  const colors = palette[who];
  const child = who === "son" || who === "girl";
  const female = ["mom", "teacher", "colleague", "girl"].includes(who);
  root.updateMatrixWorld(true);
  const positions = new Map(Object.entries(bones).map(([n, b]) => [n, root.worldToLocal(b.getWorldPosition(new THREE.Vector3()))]));
  const p = (n: string) => positions.get(n)!.clone();
  const s = rig.proportions.scale;
  const hip = p("upperleg01L").y;
  const shoulder = p("upperarm01L").y;
  const headY = p("head").y;
  const original = [...rig.meshes];
  for (const m of original) m.visible = false;
  // The bind matrices belong to this cloned skeleton, never the loader cache.
  const source = original.find((m) => (m as THREE.SkinnedMesh).isSkinnedMesh) as THREE.SkinnedMesh;
  const skeleton = source.skeleton;
  const ids = new Map(skeleton.bones.map((b, i) => [b, i]));
  const id = (n: string) => ids.get(bones[n])!;
  const material = (color: string, roughness = 0.86) => new THREE.MeshStandardMaterial({ color, roughness });
  const skin = new THREE.MeshPhysicalMaterial({ color: colors.skin, roughness: 0.64, sheen: 0.18, sheenColor: "#FFC0A1", sheenRoughness: 0.75 });
  const son = who === "son";
  // The boy wears the reference's mustard T-shirt with cream stripes.
  const cloth = new THREE.MeshPhysicalMaterial(son
    ? { color: "#FFFFFF", map: stripeTexture("#E0963C", "#F7E0B6"), roughness: 0.88, sheen: 0.3, sheenColor: "#F3D9AE", sheenRoughness: 0.85 }
    : { color: colors.top, roughness: 0.86, sheen: 0.32, sheenColor: "#DDD6C9", sheenRoughness: 0.85 });
  const stripePeriod = 0.062 * rig.proportions.scale;
  const pants = new THREE.MeshPhysicalMaterial({ color: colors.trousers, roughness: 0.9, sheen: 0.22, sheenColor: "#8797B9", sheenRoughness: 0.9 });
  // A soft sheen lets the sculpted strands read instead of merging into a cap.
  const hair = new THREE.MeshPhysicalMaterial({ color: colors.hair, roughness: son ? 0.62 : 0.84, clearcoat: 0, specularIntensity: son ? 0.55 : 0.3, sheen: son ? 0.4 : 0, sheenColor: "#9B7358", sheenRoughness: 0.5 });
  const shoeMat = material(son ? "#9A5B36" : child ? "#B77851" : "#6D5344", 0.67);
  const cuffMat = material("#50699A", 0.9), toeMat = material("#F2E6D0", 0.7);
  const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const weights = (g: THREE.BufferGeometry, fn: (v: THREE.Vector3) => [number, number, number]) => {
    const pos = g.getAttribute("position");
    const joints: number[] = [], values: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const [a, b, blend] = fn(new THREE.Vector3().fromBufferAttribute(pos, i));
      joints.push(a, b, 0, 0); values.push(1 - blend, blend, 0, 0);
    }
    g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(joints, 4));
    g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(values, 4));
    return g;
  };
  const collect = (g: THREE.BufferGeometry, mat: THREE.Material) => {
    if (g.index) g = g.toNonIndexed();
    g.deleteAttribute("uv");
    if (son && mat === cloth) {
      // Stripes run around the body and sleeves: v is the length along the
      // limb axis (or the height on the torso), u is unused.
      const pos = g.getAttribute("position"), uv: number[] = [];
      const axis = g.userData.axis as { a: THREE.Vector3; dir: THREE.Vector3 } | undefined;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const along = axis ? v.clone().sub(axis.a).dot(axis.dir) : v.y;
        uv.push(0.5, along / stripePeriod);
      }
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    }
    const list = groups.get(mat) ?? []; list.push(g); groups.set(mat, list);
  };
  const spine = ["spine05", "spine04", "spine03", "spine02", "spine01", "neck01"];
  const spineWeight = (v: THREE.Vector3): [number, number, number] => {
    const j = spine.findIndex((n) => p(n).y > v.y);
    if (j <= 0) return [id(spine[j < 0 ? spine.length - 1 : 0]), id(spine[j < 0 ? spine.length - 1 : 0]), 0];
    const a = spine[j - 1], b = spine[j];
    return [id(a), id(b), THREE.MathUtils.clamp((v.y - p(a).y) / (p(b).y - p(a).y), 0, 1)];
  };
  // Elliptical rings form an actual blouse, with a continuous neckline and hem.
  const body = (levels: number[][], mat: THREE.Material) => {
    const positions: number[] = [], index: number[] = [];
    const segments = 48;
    const profile = new THREE.CatmullRomCurve3(levels.map(([y, rx, rz]) => new THREE.Vector3(rx, y, rz)), false, "centripetal");
    const rings = profile.getPoints(32).map(v => [v.y, v.x, v.z]);
    for (const [y, rx, rz] of rings) for (let k = 0; k < segments; k++) {
      const a = k * Math.PI * 2 / segments;
      positions.push(Math.cos(a) * rx * s, y, Math.sin(a) * rz * s);
    }
    for (let j = 0; j < rings.length - 1; j++) for (let k = 0; k < segments; k++) {
      const a = j * segments + k, b = j * segments + (k + 1) % segments;
      index.push(a, a + segments, b, b, a + segments, b + segments);
    }
    // Bottom cap, hidden inside the trousers; the neck meets a solid skin neck.
    for (let k = 1; k < segments - 1; k++) index.push(0, k + 1, k);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); g.setIndex(index); g.computeVertexNormals();
    collect(weights(g, spineWeight), mat);
  };
  const widths = son ? 0.96 : child ? 0.88 : 1;
  body([
    // A tucked hem stays inside the waistband when the thighs fold to sit.
    [hip - 0.018 * s, 0.148 * widths, 0.108],
    [hip + 0.025 * s, 0.150 * widths, 0.113],
    [hip + 0.08 * s, 0.162 * widths, 0.118],
    [hip + 0.14 * s, 0.162 * widths, 0.118],
    [shoulder - 0.14 * s, 0.186 * widths, 0.126],
    [shoulder - 0.045 * s, 0.193 * widths, 0.113],
    [shoulder + 0.03 * s, 0.143 * widths, 0.085],
    [shoulder + 0.06 * s, 0.064, 0.062],
  ], cloth);
  body([[hip - 0.14 * s, 0.147 * widths, 0.106], [hip - 0.065 * s, 0.166 * widths, 0.119], [hip + 0.05 * s, 0.158 * widths, 0.117]], pants);

  const ellipsoid = (center: THREE.Vector3, size: [number, number, number], mat: THREE.Material, bone: string, widthSegments = 24) => {
    const g = new THREE.SphereGeometry(1, widthSegments, Math.round(widthSegments * 0.65)); g.scale(...size); g.translate(...center.toArray());
    collect(weights(g, () => [id(bone), id(bone), 0]), mat);
  };
  const tube = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, mat: THREE.Material, boneA: string, boneB: string, blendEnd = 1) => {
    const len = a.distanceTo(b);
    const g = new THREE.CylinderGeometry(rb, ra, len, 32, 16, false);
    const axis = b.clone().sub(a).normalize();
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis));
    g.translate(...a.clone().add(b).multiplyScalar(0.5).toArray());
    g.userData.axis = { a, dir: axis };
    collect(weights(g, (v) => {
      const along = THREE.MathUtils.clamp(v.clone().sub(a).dot(axis) / len, 0, 1);
      // Keep the limb straight away from its joint, then smoothly transfer all
      // influence at the endpoint so the elbow/knee silhouette remains closed.
      const blend = THREE.MathUtils.smoothstep(along, 0.68, 1) * blendEnd;
      return [id(boneA), id(boneB), blend];
    }), mat);
  };
  for (const side of ["L", "R"] as const) {
    const arm = p(`upperarm01${side}`), elbow = p(`lowerarm01${side}`), wrist = p(`wrist${side}`);
    const upper = `upperarm01${side}`, lower = `lowerarm01${side}`;
    const cuff = elbow.clone().lerp(wrist, 0.9);
    if (son) {
      // Short T-shirt sleeve with a slight flare, bare arm below it.
      const hem = arm.clone().lerp(elbow, 0.58);
      tube(arm, hem, 0.074 * s, 0.069 * s, cloth, upper, upper, 0);
      ellipsoid(arm, [0.074 * s, 0.068 * s, 0.074 * s], cloth, upper);
      tube(arm.clone().lerp(elbow, 0.45), elbow, 0.058 * s, 0.052 * s, skin, upper, lower, 1);
      ellipsoid(elbow, [0.053 * s, 0.053 * s, 0.053 * s], skin, lower);
      tube(elbow, wrist, 0.052 * s, 0.040 * s, skin, lower, `wrist${side}`, 0.12);
    } else {
      tube(arm, elbow, 0.073 * s, 0.056 * s, cloth, upper, lower, 1);
      tube(elbow, cuff, 0.060 * s, 0.044 * s, cloth, lower, `wrist${side}`, 0.12);
      ellipsoid(arm, [0.073 * s, 0.067 * s, 0.073 * s], cloth, upper);
      ellipsoid(elbow, [0.060 * s, 0.060 * s, 0.060 * s], cloth, lower);
      tube(cuff, wrist, 0.038 * s, 0.032 * s, skin, lower, `wrist${side}`);
    }
    const leg = p(`upperleg01${side}`), knee = p(`lowerleg01${side}`), ankle = p(`foot${side}`);
    tube(leg, knee, 0.10 * s, 0.073 * s, pants, `upperleg01${side}`, `lowerleg01${side}`, 1);
    tube(knee, ankle, 0.073 * s, 0.063 * s, pants, `lowerleg01${side}`, `foot${side}`, 0.06);
    ellipsoid(knee, [0.072 * s, 0.073 * s, 0.072 * s], pants, `lowerleg01${side}`);
    ellipsoid(ankle.clone().add(new THREE.Vector3(0, -0.039 * s, 0.068 * s)), [0.078 * s, 0.056 * s, 0.143 * s], shoeMat, `foot${side}`);
    if (son) {
      // Rolled jeans cuffs and a cream toe cap, as in the reference.
      const cuffGeo = new THREE.CylinderGeometry(0.075 * s, 0.077 * s, 0.05 * s, 32, 1, true);
      cuffGeo.translate(ankle.x, ankle.y + 0.07 * s, ankle.z);
      collect(weights(cuffGeo, () => [id(`lowerleg01${side}`), id(`lowerleg01${side}`), 0]), cuffMat);
      const rim = new THREE.TorusGeometry(0.076 * s, 0.006 * s, 8, 32); rim.rotateX(Math.PI / 2);
      for (const dy of [0.045, 0.095]) {
        const r = rim.clone(); r.translate(ankle.x, ankle.y + dy * s, ankle.z);
        collect(weights(r, () => [id(`lowerleg01${side}`), id(`lowerleg01${side}`), 0]), cuffMat);
      }
      ellipsoid(ankle.clone().add(new THREE.Vector3(0, -0.045 * s, 0.155 * s)), [0.070 * s, 0.045 * s, 0.062 * s], toeMat, `foot${side}`);
    }
    // Rounded palms and fingers follow the wrist/finger rig without anatomical
    // creases or the long, splayed claw silhouette of the original mesh.
    const finger = rig.hand[side].finger.clone().applyQuaternion(bones[`wrist${side}`].getWorldQuaternion(new THREE.Quaternion()));
    const hk = son ? 1.18 : 1; // the boy's hands match his chunkier arms
    const palmGeo = new THREE.SphereGeometry(1, 20, 14); palmGeo.scale(0.040 * s * hk, 0.058 * s * hk, 0.024 * s * hk);
    palmGeo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), finger));
    palmGeo.translate(...wrist.clone().add(finger.clone().multiplyScalar(0.041 * s)).toArray());
    collect(weights(palmGeo, () => [id(`wrist${side}`), id(`wrist${side}`), 0]), skin);
    for (let f = 1; f <= 5; f++) {
      for (let k = f === 1 ? 2 : 1; k <= 3; k++) {
        const n = `finger${f}-${k}${side}`, start = p(n);
        const end = k < 3 ? p(`finger${f}-${k + 1}${side}`) : start.clone().add(finger.clone().multiplyScalar(0.015 * s));
        tube(start, end, (f === 1 ? 0.014 : 0.011) * s * hk, 0.010 * s * hk, skin, n, k < 3 ? `finger${f}-${k + 1}${side}` : n, 1);
        ellipsoid(end, [0.0105 * s * hk, 0.0105 * s * hk, 0.0105 * s * hk], skin, k < 3 ? `finger${f}-${k + 1}${side}` : n, 16);
      }
    }
  }
  // The wider, shorter face follows the supplied illustration: soft cheeks,
  // expressive almond-round eyes, short nose and genuinely swept hair locks.
  const neckA = new THREE.Vector3(0, shoulder + 0.025 * s, 0);
  const neckB = new THREE.Vector3(0, headY - 0.08 * s, 0.012 * s);
  tube(neckA, neckB, 0.065 * s, 0.058 * s, skin, "neck01", "head", 0.35);
  const headCenter = new THREE.Vector3(0, headY + 0.038 * s, 0.022 * s);
  const hs = s * (child ? 1.58 : 1.10);
  const headSkin = skin.clone(); headSkin.vertexColors = true;
  const headGeo = headGeometry(child); headGeo.scale(hs, hs, hs); headGeo.translate(...headCenter.toArray());
  collect(weights(headGeo, () => [id("head"), id("head"), 0]), headSkin);
  // The ears sit behind the cheeks. There are no floating blush spheres.
  const innerEar = material("#E5A891", 0.85);
  // Ears stay hidden under hair that covers them (bob, the mother's hair).
  const earsCovered = who === "mom" || who === "teacher" || who === "girl";
  for (const sx of earsCovered ? [] : [-1, 1]) {
    const earX = child ? 0.186 : 0.158;
    ellipsoid(headCenter.clone().add(new THREE.Vector3(sx * earX * hs, -0.018 * hs, -0.010 * hs)), [0.033 * hs, 0.044 * hs, 0.025 * hs], skin, "head", 32);
    ellipsoid(headCenter.clone().add(new THREE.Vector3(sx * (earX + 0.010) * hs, -0.018 * hs, 0.008 * hs)), [0.012 * hs, 0.024 * hs, 0.006 * hs], innerEar, "head", 24);
  }
  const noseY = child ? -0.022 : -0.018;
  ellipsoid(headCenter.clone().add(new THREE.Vector3(0, noseY * hs, (headSurfaceZ(child, 0, noseY) - 0.009) * hs)),
    child ? [0.026 * hs, 0.029 * hs, 0.032 * hs] : [0.021 * hs, 0.027 * hs, 0.028 * hs], skin, "head", 36);
  // Each adult has a distinct, closed hairstyle; the boy keeps a fuller swept
  // crown like the reference. Shapes are continuous shells plus a few broad
  // locks, so the silhouette stays smooth in profile and in motion.
  const hairStyles: Record<Who, HairStyle> = {
    mom: { front: (ux) => 0.60 + 0.16 * ux, side: -0.30, back: -0.45, volume: 0.06 },
    teacher: { front: (ux) => 0.62 - 0.12 * ux, side: -0.92, back: -0.95, volume: 0.06, bob: true },
    colleague: { front: () => 0.58, side: 0.02, back: -0.35, volume: 0.05 },
    girl: { front: () => 0.58, side: -0.6, back: -0.7, volume: 0.05, bob: true },
    son: { front: () => 0.74, side: 0.12, back: -0.36, volume: 0.16 },
    husband: { front: (ux) => 0.60 + 0.06 * Math.abs(ux), side: 0.10, back: -0.40, volume: 0.05 },
    boss: { front: (ux) => 0.74 + 0.12 * Math.abs(ux), side: 0.12, back: -0.36, volume: 0.02 },
    parent: { front: () => 0.60, side: 0.08, back: -0.40, volume: 0.04 },
  };
  const shell = hairShell(child, hairStyles[who]);
  shell.scale(hs, hs, hs); shell.translate(...headCenter.toArray());
  collect(weights(shell, () => [id("head"), id("head"), 0]), hair);
  const hairLock = (points: number[][], width: number, thickness: number) => {
    const geo = sweptLock(points, width, thickness);
    geo.scale(hs, hs, hs); geo.translate(...headCenter.toArray());
    collect(weights(geo, () => [id("head"), id("head"), 0]), hair);
  };
  const lockAt = (from: [number, number], to: [number, number], o: Parameters<typeof skullLock>[3]) => {
    const geo = skullLock(child, from, to, o);
    geo.scale(hs, hs, hs); geo.translate(...headCenter.toArray());
    collect(weights(geo, () => [id("head"), id("head"), 0]), hair);
  };
  if (who === "son") {
    // Chunky sculpted strands swirl from the crown: a fringe sweeping to the
    // boy's left down to the brows, full sides over the temples, a tidy nape
    // and one small cowlick, like the reference.
    // Fringe: strands run from the crown forward and down, swept slightly to
    // his left (+x), with separated pointed tips ending above the brows.
    for (const [phi, theta, w, tip] of [
      [0.90, -0.78, 0.048, 0.07], [0.96, -0.50, 0.054, 0.09], [0.92, -0.22, 0.058, 0.11],
      [0.88, 0.06, 0.058, 0.13], [0.94, 0.34, 0.056, 0.10], [1.00, 0.62, 0.050, 0.07], [1.06, 0.90, 0.046, 0.05],
    ] as const) lockAt([0.10, theta - 0.55], [phi, theta], { width: w, thickness: 0.030, lift: 0.16, tipLift: tip });
    // Sides: from the top down over the temples, ending above the ears.
    for (const [phi, theta] of [[1.32, 1.15], [1.32, -1.15], [1.40, 1.55], [1.40, -1.55], [1.52, 1.95], [1.52, -1.95]] as const)
      lockAt([0.45, theta * 0.85], [phi, theta + (theta > 0 ? 0.12 : -0.12)], { width: 0.056, thickness: 0.028, lift: 0.14, tipLift: 0.05 });
    // Back: downward strands to a tidy nape.
    for (const theta of [2.35, -2.35, 2.75, -2.75, Math.PI])
      lockAt([0.40, theta], [1.72, theta * 0.98], { width: 0.062, thickness: 0.030, lift: 0.14, tipLift: 0.03 });
    // Crown: a few strands standing up and back for the reference's volume.
    for (const [theta, tip] of [[0.4, 0.26], [-0.5, 0.22], [1.6, 0.2], [-1.7, 0.18], [2.6, 0.16]] as const)
      lockAt([0.62, theta], [0.16, theta + Math.PI * 0.55], { width: 0.05, thickness: 0.034, lift: 0.2, tipLift: tip });
    lockAt([0.30, Math.PI * 0.95], [0.10, Math.PI * 0.5], { width: 0.026, thickness: 0.018, lift: 0.18, tipLift: 0.22 });
  } else if (who === "mom") {
    // Side part on her left, a fringe swept to her right, every other strand
    // drawn back over the crown and sides into a neat low bun.
    for (const theta of [-0.9, -0.45, 0.0, 0.45, 0.9, 1.3])
      lockAt([0.42, 0.55], [0.9 + Math.abs(theta) * 0.2, theta - 0.55], { width: 0.05, thickness: 0.022, lift: 0.07, tipLift: 0.04 });
    for (const theta of [-1.9, -1.4, -0.9, 0.9, 1.4, 1.9, 2.4, -2.4])
      lockAt([0.55, theta * 0.45], [1.62, Math.PI - Math.sign(theta) * 0.35], { width: 0.055, thickness: 0.022, lift: 0.08, bend: theta * 0.08 });
    ellipsoid(headCenter.clone().add(new THREE.Vector3(0, -0.035 * hs, -0.168 * hs)), [0.075 * hs, 0.068 * hs, 0.062 * hs], hair, "head", 40);
  } else if (who === "teacher") {
    // A soft bob: strands fall from a side part to the jaw line all round.
    for (const theta of [-2.7, -2.2, -1.75, -1.35, 1.35, 1.75, 2.2, 2.7, Math.PI])
      lockAt([0.3, -0.35], [2.02, theta], { width: 0.06, thickness: 0.026, lift: 0.08, bend: theta * 0.05 });
    // Fringe swept to the side, framing the face without crossing the eyes.
    for (const theta of [0.15, 0.5, 0.85])
      lockAt([0.3, -0.35], [0.95 + theta * 0.3, theta + 0.45], { width: 0.05, thickness: 0.02, lift: 0.06 });
  } else if (who === "colleague") {
    // High ponytail: strands gathered from the hairline to the crown tie.
    for (const theta of [-1.6, -1.0, -0.4, 0.2, 0.8, 1.4, 2.1, -2.1])
      lockAt([1.0 + Math.abs(theta) * 0.12, theta], [0.62, Math.PI], { width: 0.05, thickness: 0.02, lift: 0.05 });
    ellipsoid(headCenter.clone().add(new THREE.Vector3(0, 0.120 * hs, -0.150 * hs)), [0.050 * hs, 0.046 * hs, 0.048 * hs], hair, "head", 32);
    hairLock([[0,0.125,-0.165],[0,0.090,-0.215],[0,-0.010,-0.225],[0,-0.120,-0.195],[0,-0.190,-0.170]], 0.050, 0.040);
  } else {
    // Short, combed men's hair: flat strands from a side part, swept back
    // and over; the boss's hair is shorter and neater than the husband's.
    const boss = who === "boss";
    const line = boss ? 0.72 : 0.84; // the boss has a higher, receding hairline
    for (const theta of [-0.8, -0.4, 0.0, 0.4, 0.8])
      lockAt([line + Math.abs(theta) * (boss ? 0.12 : 0.05), theta], [0.2, theta * 0.4 + Math.PI * 0.85], { width: boss ? 0.05 : 0.058, thickness: boss ? 0.013 : 0.022, lift: boss ? 0.035 : 0.08, bend: 0.12 });
    for (const theta of [1.3, -1.3, 1.9, -1.9, 2.6, -2.6])
      lockAt([0.35, theta * 0.6], [1.35, theta], { width: 0.05, thickness: 0.014, lift: 0.04 });
  }
  // Rounded sneakers, ivory soles and small laces give a finished silhouette.
  const soleMat = material("#EEE2CD", 0.74), laceMat = material("#F8EDDC", 0.85);
  for (const side of ["L", "R"]) {
    const ankle = p(`foot${side}`);
    ellipsoid(ankle.clone().add(new THREE.Vector3(0, -0.075 * s, 0.076 * s)), [0.082 * s, 0.022 * s, 0.147 * s], soleMat, `foot${side}`);
    for (let j = 0; j < 3; j++) {
      const lace = new THREE.CylinderGeometry(0.0028 * s, 0.0028 * s, 0.09 * s, 12);
      lace.rotateZ(Math.PI / 2); lace.translate(ankle.x, ankle.y + 0.007 * s, ankle.z + (0.082 + j * 0.022) * s);
      collect(weights(lace, () => [id(`foot${side}`), id(`foot${side}`), 0]), laceMat);
    }
  }
  // Small flat collar leaves lie over the shirt, never float around the neck.
  const collarMat = material(son ? "#C97F2C" : colors.top, 0.86);
  if (son) {
    // A ribbed crew neckline instead of collar leaves.
    const ring = new THREE.TorusGeometry(0.071 * s, 0.011 * s, 10, 40); ring.rotateX(Math.PI / 2);
    ring.scale(1, 1, 0.92); ring.translate(0, shoulder + 0.052 * s, 0.006 * s);
    collect(weights(ring, spineWeight), collarMat);
  }
  for (const side of son ? [] : [-1, 1]) {
    const c = new THREE.Shape(); c.moveTo(side * 0.009, 0); c.lineTo(side * 0.073, 0.008); c.lineTo(side * 0.040, -0.070); c.closePath();
    const cg = new THREE.ExtrudeGeometry(c, { depth: 0.003, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.002, bevelSegments: 3, steps: 1 });
    cg.scale(s, s, s); cg.translate(0, shoulder + 0.054 * s, 0.072 * s);
    collect(weights(cg, spineWeight), collarMat);
  }
  for (const [mat, geometries] of groups) {
    const merged = mergeGeometries(geometries, false);
    if (!merged) throw new Error(`Incompatible design geometry for ${who}`);
    const mesh = new THREE.SkinnedMesh(merged, mat);
    mesh.bind(skeleton, source.bindMatrix); mesh.frustumCulled = false;
    mesh.castShadow = true; mesh.receiveShadow = false;
    root.add(mesh);
  }
  // Eye layers, eyelids and lips ride the head bone in their bind orientation.
  const face = new THREE.Group(); face.position.copy(headCenter);
  root.add(face); bones.head.attach(face);
  const add = (g: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], scale: [number, number, number] = [1, 1, 1]) => {
    const m = new THREE.Mesh(g, mat); m.position.set(...pos).multiplyScalar(hs); m.scale.set(...scale).multiplyScalar(hs);
    m.frustumCulled = false; face.add(m); return m;
  };
  const sphere = new THREE.SphereGeometry(1, 40, 28);
  // Eyes are real eyeballs seated in the skull: the skin hides most of each
  // sphere, so profiles never show protruding discs. Soft lids rest just over
  // the top of the iris for a calm look, blink by closing, and carry the lash
  // line. The iris is a cap on the eyeball and turns with the gaze.
  const white = new THREE.MeshPhysicalMaterial({ color: "#F8F2EA", roughness: 0.42, clearcoat: 0.18, clearcoatRoughness: 0.4 });
  const irisMat = new THREE.MeshPhysicalMaterial({ map: irisTexture(son), roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3 });
  const lidMat = new THREE.MeshPhysicalMaterial({ color: colors.skin, roughness: 0.64, sheen: 0.18, sheenColor: "#FFC0A1", sheenRoughness: 0.75 });
  const lashMat = material(female || child ? "#3A2620" : "#5E4034", 0.7);
  const glintMat = new THREE.MeshBasicMaterial({ color: "#FFFDF6" });
  const eyeGroups: THREE.Group[] = [], irises: THREE.Group[] = [], brows: THREE.Mesh[] = [];
  const upperLids: THREE.Group[] = [], lowerLids: THREE.Group[] = [];
  const eyeX = child ? 0.071 : 0.060, eyeY = child ? 0.030 : 0.028;
  const R = child ? 0.047 : 0.039; // eyeball radius
  const bulge = child ? 0.0165 : 0.0135; // how far the eyeball rises above the skin
  const stretchY = child ? 1.10 : 1.04;
  const irisAngle = son ? 0.68 : child ? 0.56 : 0.52;
  const lidRest = Math.PI / 2 - (child ? irisAngle + 0.16 : irisAngle + 0.13);
  const lowerRest = Math.PI / 2 + (child ? 0.74 : 0.70);
  const lidClosed = Math.PI / 2 + (child ? 0.55 : 0.50);
  const eyeZ = headSurfaceZ(child, eyeX, eyeY) - R + bulge;
  // Thick, arched dark brows on the boy, as in the reference.
  const browGeo = sweptLock([[-0.035,0,0],[-0.019,0.012,0],[0.001,0.016,0],[0.026,0.007,0],[0.034,0.001,0]], son ? 0.010 : 0.006, son ? 0.006 : female ? 0.0035 : 0.0045);
  const lidSegment = (from: number, to: number) => new THREE.SphereGeometry(R * 1.03, 40, 12, 0, Math.PI * 2, from, to - from);
  const lash = (edge: number, tube: number) => {
    // Only the front arc: seen in profile it ends inside the lid, not as a bar.
    const g = new THREE.TorusGeometry(R * 1.03 * Math.sin(edge), tube, 6, 32, Math.PI * 0.62);
    g.rotateZ(Math.PI * 0.19); g.rotateX(Math.PI / 2); g.translate(0, R * 1.03 * Math.cos(edge), 0); return g;
  };
  for (const sx of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(sx * eyeX * hs, eyeY * hs, eyeZ * hs);
    eg.scale.set(hs, hs * stretchY, hs); face.add(eg); eyeGroups.push(eg);
    eg.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), white));
    const iris = new THREE.Group(); eg.add(iris); irises.push(iris);
    iris.add(new THREE.Mesh(sphereCap(R * 1.004, irisAngle), irisMat));
    // Highlights stay with the light (on the eyeball), small and soft.
    for (const [ax, ay, r] of [[-0.30, 0.30, son ? 0.0085 : child ? 0.0058 : 0.0046], [0.24, -0.28, son ? 0.0032 : 0.0019]]) {
      const dir = new THREE.Vector3(Math.sin(ax), Math.sin(ay), 1).normalize().multiplyScalar(R * 1.012);
      const gl = new THREE.Mesh(sphere, glintMat); gl.position.copy(dir); gl.scale.set(r, r, r * 0.35);
      gl.lookAt(dir.clone().multiplyScalar(2)); eg.add(gl);
    }
    const upper = new THREE.Group(); eg.add(upper); upperLids.push(upper);
    upper.add(new THREE.Mesh(lidSegment(0, lidRest), lidMat));
    upper.add(new THREE.Mesh(lash(lidRest, son ? 0.0028 : female ? 0.0021 : child ? 0.0017 : 0.0013), lashMat));
    if (female) for (const k of [0.78, 0.9]) {
      const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.0012, 0.008, 4, 8), lashMat);
      const ang = sx * k * Math.PI / 2;
      l.position.set(Math.sin(ang) * R * 1.03 * Math.sin(lidRest), R * 1.03 * Math.cos(lidRest), Math.cos(ang) * R * 1.03 * Math.sin(lidRest));
      l.rotation.z = -sx * 0.9; upper.add(l);
    }
    const lower = new THREE.Group(); eg.add(lower); lowerLids.push(lower);
    lower.add(new THREE.Mesh(lidSegment(lowerRest, Math.PI), lidMat));
    const browY = eyeY + (child ? 0.076 : 0.066);
    const brow = add(browGeo,hair,[sx * eyeX,browY,headSurfaceZ(child, eyeX, browY) + 0.006]); brow.rotation.z = sx * -0.09;
    brow.userData.y = brow.position.y; brows.push(brow);
  }
  if (who === "boss") {
    // Thin rectangular-rounded glasses set the boss apart from the husband.
    const frame = new THREE.MeshStandardMaterial({ color: "#2E2A2A", roughness: 0.4, metalness: 0.3 });
    const gz = eyeZ + R + 0.014;
    const glasses = new THREE.Group(); glasses.scale.setScalar(hs); face.add(glasses);
    for (const sx of [-1, 1]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.0032, 8, 40), frame);
      rim.scale.set(1.15, 0.82, 1); rim.position.set(sx * eyeX, eyeY, gz); glasses.add(rim);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0026, 0.0026, 0.13, 8), frame);
      arm.rotation.x = Math.PI / 2; arm.position.set(sx * (eyeX + 0.045), eyeY + 0.008, gz - 0.065); glasses.add(arm);
    }
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, eyeX * 2 - 0.083, 8), frame);
    bridge.rotation.z = Math.PI / 2; bridge.position.set(0, eyeY + 0.01, gz + 0.004); glasses.add(bridge);
  }
  const lips = material(female ? "#AD6A5D" : "#9B6251",0.62);
  const mouthLine = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.038,0.008,-0.004),new THREE.Vector3(-0.021,-0.004,0.002),new THREE.Vector3(0,-0.008,0.003),
    new THREE.Vector3(0.021,-0.004,0.002),new THREE.Vector3(0.038,0.008,-0.004),
  ]),28,0.0028,8,false),lips,[0,-0.075,0.137]);
  const mouth = add(sphere,material("#59352E",0.85),[0,-0.075,0.139],[0.033,0.014,0.006]);
  const teeth = add(sphere,white,[0,-0.068,0.144],[0.024,0.004,0.002]);
  const lowerLip = add(sphere,lips,[0,-0.084,0.143],[0.021,0.003,0.002]);
  rig.expression = (values) => {
    const opening = Math.max(0,(values.jawOpen ?? 0) * 3.2 + (values.wide ?? 0) * 0.28) * (1 - (values.press ?? 0));
    const smile = values.smile ?? 0, frown = values.frown ?? 0;
    mouth.visible = opening > 0.045; teeth.visible = opening > 0.13; mouthLine.visible = opening <= 0.045;
    mouth.scale.y = hs * (0.003 + opening * 0.023); mouth.scale.x = hs * (0.032 - (values.pucker ?? 0) * 0.045 + (values.wide ?? 0) * 0.033);
    teeth.position.y = hs * (-0.075 + 0.002 + opening * 0.012); lowerLip.position.y = hs * (-0.081 - opening * 0.020);
    lowerLip.visible = opening > 0.045;
    mouthLine.scale.y = hs * (0.30 + smile * 0.95 - frown * 0.30);
    for (let i = 0; i < 2; i++) {
      const blink = values[i === 0 ? "blink_R" : "blink_L"] ?? 0;
      const wide = values[i === 0 ? "eyeWide_R" : "eyeWide_L"] ?? 0;
      const squint = values[i === 0 ? "squint_R" : "squint_L"] ?? 0;
      // Lids rotate about the eyeball centre: down to blink, a little up when wide.
      const rest = -Math.min(0.14, wide * 0.5) + squint * 0.10;
      upperLids[i].rotation.x = rest + blink * (lidClosed - lidRest - rest);
      lowerLids[i].rotation.x = -(squint * 0.12 + blink * 0.10);
      irises[i].rotation.y = THREE.MathUtils.clamp(rig.gaze.x, -1, 1) * 0.36;
      irises[i].rotation.x = -THREE.MathUtils.clamp(rig.gaze.y, -1, 1) * 0.24;
      const worry = values[i === 0 ? "browInnerUp_R" : "browInnerUp_L"] ?? 0;
      brows[i].rotation.z = (i === 0 ? 1 : -1) * (worry * 0.6 + 0.09 - frown * 0.35);
      brows[i].position.y = brows[i].userData.y + (worry * 0.026 - frown * 0.010) * hs;
    }
  };
};
