import {build} from 'esbuild';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createCanvas} from '@napi-rs/canvas';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Image,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {state,render,jsx} from './runtime.mjs';
const root=process.cwd(),out=path.resolve(process.env.CPU_OUT||'out/cpu');
await mkdir(out,{recursive:true});await mkdir(out+'/textures',{recursive:true});
await mkdir(out+'/geometry',{recursive:true});
GlobalFonts.registerFromPath(path.resolve('public/fonts/Nunito-Variable.ttf'),'Nunito');
globalThis.document={createElement:t=>t==='canvas'?createCanvas(8,8):{},fonts:{load:()=>Promise.resolve([])}};
globalThis.Image=class extends Image {set src(v){super.src=path.resolve(root,'public',v);}get src(){return super.src;}};
const shim=path.resolve('scripts/cpu/runtime.mjs');
await build({entryPoints:['scripts/cpu/entry.tsx'],outfile:'scripts/cpu/bundle.mjs',bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external',plugins:[{name:'cpu-scene-hooks',setup(b){b.onResolve({filter:/^(react(\/jsx(-dev)?-runtime)?|remotion|@react-three\/fiber|@remotion\/(three|fonts))$/},()=>({path:shim,external:true}));}}]});
const {scenes,HH_SHOTS,placeLines}=await import('./bundle.mjs?'+Date.now());
const city=await loadImage(path.resolve('public/assets/half-hour/bishkek-panorama-v2.png'));
const cityCanvas=createCanvas(city.width,city.height);cityCanvas.getContext('2d').drawImage(city,0,0);
state.gltf.set('assets/half-hour/bishkek-panorama-v2.png',new THREE.CanvasTexture(cityCanvas));
state.lines=placeLines(JSON.parse(await readFile('public/audio/half-hour/manifest.json','utf8')));
const loader=new GLTFLoader();
loader.register(()=>({name:'skip-hidden-source-textures',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
for(const who of ['mom','son','boss','colleague','teacher','husband','girl','parent']){
 const bytes=await readFile('public/models/'+who+'.glb');
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');state.gltf.set('models/'+who+'.glb',gltf);
}
const geometries={},materials={},textures={},texVersions=new Map(),geometryIds=new Map();
const geometry=async g=>{
 if(geometryIds.has(g.uuid))return geometryIds.get(g.uuid);
 const hash=createHash('sha256');
 const attrs={position:g.attributes.position,normal:g.attributes.normal,uv:g.attributes.uv,color:g.attributes.color,index:g.index,skinIndex:g.attributes.skinIndex,skinWeight:g.attributes.skinWeight};
 for(const [key,a] of Object.entries(attrs)){hash.update(key);if(a)hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 const gid=hash.digest('hex');geometryIds.set(g.uuid,gid);
 if(!geometries[gid]){
  const data={groups:g.groups};
  for(const [key,a] of Object.entries(attrs)){
   if(!a){data[key]=null;continue;}
   const file='geometry/'+gid+'.'+key;
   await writeFile(out+'/'+file,Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
   data[key]={file,dtype:a.array.constructor.name,itemSize:a.itemSize};
  }
  geometries[gid]=data;
 }
 return gid;
};
const material = async m => {
 const id=m.uuid+(m.map ? '-texture-'+m.map.version : '');
 let image=null;
 if(m.map?.image?.toBuffer){
  image=m.map.uuid+'-'+m.map.version+'.png';
  if(!texVersions.has(image)){await writeFile(out+'/textures/'+image,m.map.image.toBuffer('image/png'));texVersions.set(image,1);}
 }
 materials[id]={color:m.color?.toArray()||[1,1,1],roughness:m.roughness??0.8,metalness:m.metalness??0,emissive:m.emissive?.toArray()||[0,0,0],emissiveIntensity:m.emissiveIntensity??0,opacity:m.opacity??1,transparent:m.transparent??false,side:m.side,map:image,basic:!!m.isMeshBasicMaterial,vertexColors:m.vertexColors??false};
 return id;
};
const capture=async time=>{
 const shot=HH_SHOTS.find(s=>time>=s.from&&time<s.to);if(!shot||shot.id==='cta')return null;
 state.frame=(time-shot.from)*30;state.scene=new THREE.Scene();state.camera=new THREE.PerspectiveCamera(38,9/16,0.03,400);
 await render(jsx(scenes[shot.id],{}),state.scene);
 state.scene.updateMatrixWorld(true);state.camera.updateMatrixWorld(true);state.camera.updateProjectionMatrix();
 const meshes=[],lights=[];
 const nodes=[];state.scene.traverseVisible(o=>nodes.push(o));
 for(const o of nodes){
  if(o.isMesh){
   const g=o.geometry; const gid=await geometry(g);
   const mat=Array.isArray(o.material)?o.material:[o.material];
   const mi=[];for(const m of mat)mi.push(await material(m));
   let skin=null;
   if(o.isSkinnedMesh){o.skeleton.update();skin={bones:Array.from(o.skeleton.boneMatrices),bind:o.bindMatrix.elements,inverse:o.bindMatrixInverse.elements};}
   meshes.push({id:o.uuid,geometry:gid,materials:mi,matrix:o.matrixWorld.elements,skin});
  }else if(o.isLight)lights.push({type:o.type,color:o.color.toArray(),intensity:o.intensity,position:o.getWorldPosition(new THREE.Vector3()).toArray(),target:o.target?.getWorldPosition(new THREE.Vector3()).toArray()||[0,0,0]});
 }
 const characters=[];
 for(const [key,hook] of state.hooks){
  const rig=hook.value;
  if(!rig?.bones?.head || !state.scene.getObjectById(rig.root.id))continue;
  const face=rig.bones.head.children.find(o=>o.isGroup && !o.isBone);
  if(!face)continue;
  const head=face.getWorldPosition(new THREE.Vector3());
  const forward=new THREE.Vector3(0,0,1).applyQuaternion(face.getWorldQuaternion(new THREE.Quaternion()));
  const cameraDirection=state.camera.position.clone().sub(head).normalize();
  characters.push({key,head:head.toArray(),forward:forward.toArray(),frontDot:forward.dot(cameraDirection),root:rig.root.position.toArray()});
 }
 return {time,shot:shot.id,camera:{matrix:state.camera.matrixWorld.elements,fov:state.camera.fov,near:state.camera.near,far:state.camera.far},characters,background:state.scene.background?.toArray()||[0.7,0.8,0.9],meshes,lights};
};
const times=(process.env.CPU_TIMES||'8,34,74,102').split(',').map(Number);
if(process.env.CPU_RANGE){const [from,to]=process.env.CPU_RANGE.split(',').map(Number);times.length=0;for(let i=from;i<=to;i++)times.push(i/30);}
for(const time of times){const frame=await capture(time);if(frame){await writeFile(out+'/frame-'+time.toFixed(3)+'.json',JSON.stringify(frame));console.log('Captured',time,frame.meshes.length,'meshes');}}
await writeFile(out+'/assets.json',JSON.stringify({geometries,materials,textures}));
console.log('Assets exported',Object.keys(geometries).length);
