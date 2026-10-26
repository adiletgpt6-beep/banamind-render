// The grand reveal: four sand worlds at once — Earth, mountains, a tree on its
// dune and a starry background — each a scaled version of the hero shapes.
import * as THREE from 'three';
import {buildCosmos} from './cosmos';
import {buildEarth} from './earth';
import {buildMountains} from './mountains';
import {buildTree} from './tree';
import {allocShape, ShapePoints} from './types';

export const GROUP = {earth: 0, mountains: 1, tree: 2, stars: 3, dune: 4} as const;
export const TREE_SCALE = 0.72;

export type CompositionCounts = {earth: number; mountains: number; tree: number; stars: number};

export const buildComposition = (mask: Uint8Array, c: CompositionCounts): ShapePoints => {
	const n = c.earth + c.mountains + c.tree + c.stars;
	const out = allocShape(n);
	let k = 0;
	const append = (src: ShapePoints, scale: number, offset: [number, number, number], group: (i: number) => number) => {
		for (let i = 0; i < src.n; i++, k++) {
			out.pos[k * 3] = src.pos[i * 3] * scale + offset[0];
			out.pos[k * 3 + 1] = src.pos[i * 3 + 1] * scale + offset[1];
			out.pos[k * 3 + 2] = src.pos[i * 3 + 2] * scale + offset[2];
			out.col.set(src.col.subarray(i * 3, i * 3 + 3), k * 3);
			out.up.set(src.up.subarray(i * 3, i * 3 + 3), k * 3);
			out.paint[k] = src.paint[i];
			out.size[k] = src.size[i];
			out.glow[k] = src.glow[i];
			out.order[k] = src.order[i];
			out.group[k] = group(i);
		}
	};
	append(buildEarth(mask, {radius: 1.7, n: c.earth, seed: 303}), 1, [0, 0, 0], () => GROUP.earth);
	append(buildMountains(c.mountains, 313), 0.6, [0, 0, 1.3], () => GROUP.mountains);
	const t = buildTree(c.tree, 5).tree;
	append(t, TREE_SCALE, [0, 0, 0], (i) => (t.group[i] === 0 ? GROUP.dune : GROUP.tree));
	append(buildCosmos({n: c.stars, radius: 46, view: new THREE.Vector3(0, 0, -1), spread: 0.42, sizeScale: 1.5, seed: 321, moon: false}), 1, [0, 0, 0], () => GROUP.stars);
	return out;
};
