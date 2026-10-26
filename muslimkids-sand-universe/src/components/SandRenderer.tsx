// SandRenderer — draws the whole sand universe with GPU instancing:
// 10 InstancedMeshes (5 grain shapes × macro/mid LOD) + one high-detail hero
// grain. Instance matrices/colours/glow come straight from the engine's
// typed arrays; a frame is rendered synchronously for Remotion.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {createGrainGeometry} from '../engines/SandGrainGenerator';
import type {SandUniverseEngine} from '../engines/SandUniverseEngine';
import {createSandMaterial, SAND_MATERIALS} from '../materials/sandMaterial';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js';

type Rig = {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	key: THREE.DirectionalLight;
	rim: THREE.DirectionalLight;
	hemi: THREE.HemisphereLight;
	ambient: THREE.AmbientLight;
	meshes: THREE.InstancedMesh[];
	hero: THREE.Mesh;
	composer: EffectComposer;
	bg: {canvas: HTMLCanvasElement; tex: THREE.CanvasTexture; key: string};
};

// Deep-blue background gradient drawn into a small texture (opaque frame for FXAA).
const paintBackground = (bg: Rig['bg'], top: string, mid: string, bottom: string) => {
	const key = top + mid + bottom;
	if (bg.key === key) return;
	bg.key = key;
	const c = bg.canvas.getContext('2d')!;
	const {width: w, height: h} = bg.canvas;
	const g = c.createRadialGradient(w / 2, h * 0.18, 0, w / 2, h * 0.18, h * 0.95);
	g.addColorStop(0, top);
	g.addColorStop(0.55, mid);
	g.addColorStop(1, bottom);
	c.fillStyle = g;
	c.fillRect(0, 0, w, h);
	bg.tex.needsUpdate = true;
};

const buildRig = (canvas: HTMLCanvasElement, engine: SandUniverseEngine, width: number, height: number): Rig => {
	const renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
	renderer.setPixelRatio(1);
	renderer.setSize(width, height, false);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	const scene = new THREE.Scene();
	const bgCanvas = document.createElement('canvas');
	bgCanvas.width = 270;
	bgCanvas.height = 480;
	const bgTex = new THREE.CanvasTexture(bgCanvas);
	bgTex.colorSpace = THREE.SRGBColorSpace;
	scene.background = bgTex;
	scene.fog = new THREE.Fog(0x081525, 30, 90);
	const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 400);
	const key = new THREE.DirectionalLight(0xffffff, 3);
	const rim = new THREE.DirectionalLight(0xffffff, 1);
	const hemi = new THREE.HemisphereLight(0x405070, 0x181210, 0.4);
	const ambient = new THREE.AmbientLight(0xffffff, 0.05);
	scene.add(key, key.target, rim, rim.target, hemi, ambient);
	const mats = {macro: createSandMaterial(SAND_MATERIALS.macro), mid: createSandMaterial(SAND_MATERIALS.mid)};
	const meshes = engine.meshes.map((b) => {
		const geo = createGrainGeometry(b.type, b.lod);
		geo.setAttribute('aGlow', new THREE.InstancedBufferAttribute(b.glow, 1).setUsage(THREE.DynamicDrawUsage));
		const mesh = new THREE.InstancedMesh(geo, mats[b.lod], b.count);
		mesh.instanceMatrix = new THREE.InstancedBufferAttribute(b.matrices, 16).setUsage(THREE.DynamicDrawUsage);
		mesh.instanceColor = new THREE.InstancedBufferAttribute(b.colors, 3).setUsage(THREE.DynamicDrawUsage);
		mesh.frustumCulled = false;
		scene.add(mesh);
		return mesh;
	});
	const hero = new THREE.Mesh(createGrainGeometry(0, 'hero'), createSandMaterial(SAND_MATERIALS.hero));
	hero.matrixAutoUpdate = false;
	hero.frustumCulled = false;
	scene.add(hero);
	// MSAA is very slow on software GL; FXAA after tone mapping smooths grain edges cheaply.
	const composer = new EffectComposer(renderer);
	composer.setPixelRatio(1);
	composer.setSize(width, height);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new OutputPass());
	const fxaa = new ShaderPass(FXAAShader);
	fxaa.uniforms.resolution.value.set(1 / width, 1 / height);
	composer.addPass(fxaa);
	return {renderer, scene, camera, key, rim, hemi, ambient, meshes, hero, composer, bg: {canvas: bgCanvas, tex: bgTex, key: ''}};
};

export const SandRenderer: React.FC<{engine: SandUniverseEngine; time: number; width: number; height: number}> = ({engine, time, width, height}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rigRef = useRef<Rig | null>(null);
	const style = useMemo<React.CSSProperties>(() => ({position: 'absolute', inset: 0, width: '100%', height: '100%'}), []);

	useLayoutEffect(() => {
		if (!canvasRef.current) return;
		if (!rigRef.current) rigRef.current = buildRig(canvasRef.current, engine, width, height);
		const rig = rigRef.current;
		const out = engine.update(time);
		const {camera, light} = out;
		rig.camera.fov = camera.fov;
		rig.camera.position.set(...camera.pos);
		rig.camera.lookAt(...camera.target);
		rig.camera.updateProjectionMatrix();
		const tgt = new THREE.Vector3(...camera.target);
		rig.key.position.copy(tgt).add(new THREE.Vector3(...light.keyDir).normalize().multiplyScalar(20));
		rig.key.target.position.copy(tgt);
		rig.key.color.setRGB(...light.keyColor);
		rig.key.intensity = light.key;
		rig.rim.position.copy(tgt).add(new THREE.Vector3(...light.rimDir).normalize().multiplyScalar(20));
		rig.rim.target.position.copy(tgt);
		rig.rim.color.setRGB(...light.rimColor);
		rig.rim.intensity = light.rim;
		rig.hemi.color.setRGB(...light.hemiSky);
		rig.hemi.groundColor.setRGB(...light.hemiGround);
		rig.hemi.intensity = light.hemi;
		rig.ambient.intensity = light.ambient;
		const fog = rig.scene.fog as THREE.Fog;
		fog.near = light.fogNear;
		fog.far = light.fogFar;
		fog.color.set(light.bgMid);
		for (const m of rig.meshes) {
			m.instanceMatrix.needsUpdate = true;
			if (m.instanceColor) m.instanceColor.needsUpdate = true;
			(m.geometry.getAttribute('aGlow') as THREE.InstancedBufferAttribute).needsUpdate = true;
		}
		rig.hero.visible = out.hero.visible;
		rig.hero.matrix.fromArray(out.hero.matrix);
		rig.hero.matrixWorldNeedsUpdate = true;
		(rig.hero.material as THREE.MeshStandardMaterial).color.setRGB(...out.hero.color);
		paintBackground(rig.bg, light.bgTop, light.bgMid, light.bgBottom);
		rig.composer.render();
	}, [engine, time, width, height]);

	return <canvas ref={canvasRef} width={width} height={height} style={style} />;
};
