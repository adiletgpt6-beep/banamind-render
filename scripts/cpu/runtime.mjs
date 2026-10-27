import * as THREE from 'three';
export const state = {frame:0, fps:30, scene:null, camera:null, gltf:new Map(), lines:[], hooks:new Map(), path:'', cursor:0};
const instances=new Map(), managed=new WeakMap();
export const Fragment = Symbol('Fragment');
export const Suspense = p => p.children;
export const useLayoutEffect = () => {};
export const useEffect = () => {};
export const useState = initial => [typeof initial==='function'?initial():initial,()=>{}];
export const jsx = (type,props,key) => ({type,props:props||{},key});
export const jsxs=jsx, jsxDEV=jsx;
export const createContext = value => ({value});
export const useContext = () => state.lines;
export const useMemo = (fn,deps) => {
 const key=state.path+':'+state.cursor++;
 const old=state.hooks.get(key);
 if(old && deps && old.deps && deps.length===old.deps.length && deps.every((v,i)=>Object.is(v,old.deps[i]))) return old.value;
 const value=fn(); state.hooks.set(key,{value,deps});return value;
};
export const useRef = value => useMemo(()=>({current:value}),[]);
export const useLoader = (_loader,url) => state.gltf.get(url);
export const useThree = () => ({scene:state.scene,camera:state.camera});
export const useCurrentFrame = () => state.frame;
export const useDelayRender = () => ({delayRender:()=>0,continueRender:()=>{}});
export const useRemotionEnvironment = () => ({isRendering:false});
export const useVideoConfig = () => ({fps:30,width:1080,height:1920,durationInFrames:3600});
export const staticFile = path => path;
export const loadFont = () => Promise.resolve();
export const interpolate = (v,x,y) => {
 let k=x.findIndex(a=>a>v); if(k===0)return y[0];if(k<0)return y.at(-1);k--;
 return y[k]+(y[k+1]-y[k])*(v-x[k])/(x[k+1]-x[k]);
};
export const AbsoluteFill = p => p.children;
export const ThreeCanvas = p => p.children;
export const Img = () => null;
const classes = {group:THREE.Group,mesh:THREE.Mesh,hemisphereLight:THREE.HemisphereLight,directionalLight:THREE.DirectionalLight,pointLight:THREE.PointLight,ambientLight:THREE.AmbientLight,spotLight:THREE.SpotLight};
export const render = async (node,parent,path='root') => {
 if(node==null || typeof node==='boolean')return;
 if(Array.isArray(node)){for(let i=0;i<node.length;i++)await render(node[i],parent,path+'/'+i);return;}
 if(typeof node!=='object')return;
 const {type,props}=node;
 if(type===Fragment){await render(props.children,parent,path+'/f');return;}
 if(typeof type==='function'){
  if(type.name==='SoftEnvironment')return;
  if(type.name==='Stage') {
   state.scene.background=new THREE.Color(props.bg||'#dceafa');
   await render(props.children,parent,path+'/Stage');return;
  }
  state.path=path+':'+type.name;state.cursor=0;
  let result;
  for(;;){try{result=type(props);break;}catch(e){if(e?.then){await e;state.cursor=0;}else throw e;}}
  await render(result,parent,path+'/'+type.name);return;
 }
 if(typeof type!=='string')return;
 if(type==='div'){await render(props.children,parent,path+'/div');return;}
 let obj;
 if(type==='primitive')obj=props.object;
 else {
  const name=type[0].toUpperCase()+type.slice(1);
  const C=classes[type]||THREE[name];
  if(!C)throw Error('Unknown scene node '+type);
  const key=path+':'+type, signature=JSON.stringify(props.args||[]);
  const cached=instances.get(key);
  obj=cached?.signature===signature?cached.obj:new C(...(props.args||[]));
  instances.set(key,{obj,signature});
 }
 if(obj.isObject3D){for(const c of managed.get(obj)||[])obj.remove(c);managed.set(obj,[]);}
 if(obj.isMaterial||obj.isBufferGeometry||obj.isTexture){
  const attach=props.attach||(obj.isMaterial?'material':obj.isBufferGeometry?'geometry':'environment');
  parent[attach]=obj;
 }else if(obj.isObject3D){parent.add(obj);const list=managed.get(parent)||[];list.push(obj);managed.set(parent,list);}
 for(const [k,v] of Object.entries(props)){
  if(v===undefined||['children','object','args','key','attach','ref','onCreated'].includes(k)||k.startsWith('shadow-'))continue;
  if(k==='matrix'){obj.matrix.copy(v);obj.matrixAutoUpdate=false;continue;}
  const a=obj[k];
  if(a?.isColor){if(v?.isColor)a.copy(v);else a.set(v);}
  else if(a?.isVector3||a?.isEuler){if(Array.isArray(v))a.set(...v);else if(typeof v==='number')a.setScalar(v);else a.copy(v);}
  else if(a?.isQuaternion){if(Array.isArray(v))a.set(...v);else a.copy(v);}
  else obj[k]=v;
 }
 await render(props.children,obj,path+'/children');
};
