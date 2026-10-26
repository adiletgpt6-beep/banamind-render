// Sand material library: physically based, matte mineral surfaces.
// MeshStandardMaterial extended with
//  * object-space mineral speckle and dark inclusions (albedo variation),
//  * roughness variation (a few faint quartz glints, no plastic sheen),
//  * procedural micro-bump for close-ups (derivative-based normal perturbation),
//  * optional per-instance soft self-light (only the starry-sky grains use it).
import * as THREE from 'three';

export type SandMaterialOptions = {
	flat: boolean;
	speckle: number;
	speckleFreq: number;
	bump: number;
	bumpFreq: number;
	instancedGlow: boolean;
};

const NOISE = /* glsl */ `
varying vec3 vLocal;
float sandHash(vec3 p) {
	p = fract(p * 0.3183099 + 0.1);
	p *= 17.0;
	return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float sandNoise(vec3 x) {
	vec3 i = floor(x);
	vec3 f = fract(x);
	f = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(mix(sandHash(i), sandHash(i + vec3(1, 0, 0)), f.x), mix(sandHash(i + vec3(0, 1, 0)), sandHash(i + vec3(1, 1, 0)), f.x), f.y),
		mix(mix(sandHash(i + vec3(0, 0, 1)), sandHash(i + vec3(1, 0, 1)), f.x), mix(sandHash(i + vec3(0, 1, 1)), sandHash(i + vec3(1, 1, 1)), f.x), f.y),
		f.z);
}
`;

export const createSandMaterial = (o: SandMaterialOptions) => {
	const mat = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		roughness: 0.86,
		metalness: 0.0,
		flatShading: o.flat,
	});
	mat.onBeforeCompile = (shader) => {
		shader.uniforms.uSpeckle = {value: o.speckle};
		shader.uniforms.uSpeckleFreq = {value: o.speckleFreq};
		shader.uniforms.uBump = {value: o.bump};
		shader.uniforms.uBumpFreq = {value: o.bumpFreq};
		shader.vertexShader = shader.vertexShader
			.replace(
				'#include <common>',
				`#include <common>
varying vec3 vLocal;
${o.instancedGlow ? 'attribute float aGlow;\nvarying float vGlow;' : ''}`,
			)
			.replace(
				'#include <begin_vertex>',
				`#include <begin_vertex>
vLocal = position;
${o.instancedGlow ? 'vGlow = aGlow;' : ''}`,
			);
		shader.fragmentShader = shader.fragmentShader
			.replace(
				'#include <common>',
				`#include <common>
${NOISE}
uniform float uSpeckle;
uniform float uSpeckleFreq;
uniform float uBump;
uniform float uBumpFreq;
${o.instancedGlow ? 'varying float vGlow;' : ''}`,
			)
			.replace(
				'#include <color_fragment>',
				`#include <color_fragment>
float sp = sandNoise(vLocal * uSpeckleFreq) * 0.6 + sandNoise(vLocal * uSpeckleFreq * 2.7 + 5.0) * 0.4;
diffuseColor.rgb *= mix(1.0 - uSpeckle, 1.0 + uSpeckle, sp);
float inclusion = smoothstep(0.86, 0.94, sandNoise(vLocal * uSpeckleFreq * 1.3 + 3.1));
diffuseColor.rgb *= 1.0 - inclusion * uSpeckle * 0.9;`,
			)
			.replace(
				'#include <roughnessmap_fragment>',
				`#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + (0.5 - sp) * 0.3, 0.45, 1.0);`,
			)
			.replace(
				'#include <normal_fragment_maps>',
				`#include <normal_fragment_maps>
if (uBump > 0.0) {
	float hgt = sandNoise(vLocal * uBumpFreq) * 0.65 + sandNoise(vLocal * uBumpFreq * 2.3 + 7.0) * 0.35;
	vec3 dpdx = dFdx(-vViewPosition);
	vec3 dpdy = dFdy(-vViewPosition);
	float dhx = dFdx(hgt);
	float dhy = dFdy(hgt);
	vec3 r1 = cross(dpdy, normal);
	vec3 r2 = cross(normal, dpdx);
	float det = dot(dpdx, r1);
	vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
	normal = normalize(abs(det) * normal - grad * uBump);
}`,
			)
			.replace(
				'#include <emissivemap_fragment>',
				`#include <emissivemap_fragment>
${o.instancedGlow ? 'totalEmissiveRadiance += diffuseColor.rgb * vGlow;' : ''}`,
			);
	};
	mat.customProgramCacheKey = () => JSON.stringify(o);
	return mat;
};

export const SAND_MATERIALS = {
	hero: {flat: false, speckle: 0.1, speckleFreq: 4, bump: 0, bumpFreq: 22, instancedGlow: false},
	macro: {flat: false, speckle: 0.1, speckleFreq: 3.5, bump: 0, bumpFreq: 12, instancedGlow: true},
	mid: {flat: true, speckle: 0.12, speckleFreq: 3, bump: 0, bumpFreq: 1, instancedGlow: true},
} satisfies Record<string, SandMaterialOptions>;
