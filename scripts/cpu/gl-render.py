"""Local 3D raster renderer, including soft shadows and articulated skinning.

Mesa llvmpipe runs the OpenGL shaders on the CPU. No cloud service is called.
Geometry, poses, mouth shapes, textures and cameras come from the story code.
"""
import os,json,math,sys,time,subprocess
from pathlib import Path
import numpy as np,moderngl
from PIL import Image

root=Path(os.environ.get('CPU_OUT','out/cpu')).resolve()
assets=json.loads((root/'assets.json').read_text())
types={'Float32Array':'<f4','Uint16Array':'<u2','Uint32Array':'<u4'}
for g in assets['geometries'].values():
 for k,a in list(g.items()):
  if isinstance(a,dict) and 'file' in a:g[k]=np.fromfile(root/a['file'],dtype=types[a['dtype']])

def mat(a):return np.asarray(a,dtype=np.float32).reshape(4,4,order='F')
def write_matrix(u,m):u.write(np.asarray(m,dtype=np.float32).T.tobytes())
def normalize(v):return v/np.maximum(np.linalg.norm(v,axis=-1,keepdims=True),1e-8)
def look(eye,target):
 z=normalize(np.asarray(eye)-target);x=normalize(np.cross([0,1,0],z));y=np.cross(z,x)
 m=np.eye(4,dtype=np.float32);m[:3,:3]=np.array([x,y,z]);m[:3,3]=-m[:3,:3]@eye;return m
def ortho(size,near,far):
 return np.array([[1/size,0,0,0],[0,1/size,0,0],[0,0,-2/(far-near),-(far+near)/(far-near)],[0,0,0,1]],dtype=np.float32)
def perspective(fov,aspect,near,far):
 f=1/math.tan(math.radians(fov)/2)
 return np.array([[f/aspect,0,0,0],[0,f,0,0],[0,0,(far+near)/(near-far),2*far*near/(near-far)],[0,0,-1,0]],dtype=np.float32)
def geometry_data(g,skin=None):
 v=np.asarray(g['position']).reshape(-1,3);n=np.asarray(g['normal']).reshape(-1,3)
 if skin:
  j=np.asarray(g['skinIndex']).reshape(-1,4);w=np.asarray(g['skinWeight']).reshape(-1,4)
  b=mat(skin['bind']);bi=mat(skin['inverse']);bones=np.asarray(skin['bones'],dtype=np.float32).reshape(-1,4,4).transpose(0,2,1)
  h=np.column_stack((v,np.ones(len(v),dtype=np.float32)))@b.T
  nn=n@b[:3,:3].T;vv=np.zeros_like(h);nr=np.zeros_like(n)
  for k in range(4):
   vv+=np.einsum('nij,nj->ni',bones[j[:,k]],h)*w[:,k,None]
   nr+=np.einsum('nij,nj->ni',bones[j[:,k],:3,:3],nn)*w[:,k,None]
  v=(vv@bi.T)[:,:3];n=normalize(nr@bi[:3,:3].T)
 uv=np.asarray(g['uv']).reshape(-1,2) if g['uv'] is not None else np.zeros((len(v),2),dtype=np.float32)
 col=np.asarray(g['color']).reshape(-1,3) if g['color'] is not None else np.ones((len(v),3),dtype=np.float32)
 return np.column_stack((v,n,uv,col)).astype('f4')

ctx=moderngl.create_standalone_context(backend='egl');ctx.enable(moderngl.DEPTH_TEST)
W=int(os.environ.get('CPU_WIDTH','540'));H=round(W*16/9)
vertex='''#version 330
in vec3 p;in vec3 n;in vec2 uv;in vec3 vc;
uniform mat4 model,viewproj,shadowvp;uniform mat3 normalmat;
out vec3 N,P,C;out vec2 U;out vec4 S;
void main(){vec4 w=model*vec4(p,1);P=w.xyz;N=normalize(normalmat*n);C=vc;U=uv;S=shadowvp*w;gl_Position=viewproj*w;}
'''
fragment='''#version 330
in vec3 N,P,C;in vec2 U;in vec4 S;out vec4 frag;
uniform vec3 color,lightdir,lightcolor,eye,emissive;
uniform float roughness,metalness,alpha,emission,basic;
uniform int usemap,usecolor;uniform sampler2D picture;uniform sampler2DShadow shadow;
vec3 linear(vec3 c){return pow(c,vec3(2.2));}
vec3 aces(vec3 c){return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0,1);}
void main(){
 vec3 base=color*(usecolor==1?C:vec3(1));
 if(usemap==1)base*=linear(texture(picture,U).rgb);
 if(basic>.5){frag=vec4(pow(clamp(base,0,1),vec3(1./2.2)),alpha);return;}
 vec3 nn=normalize(N);if(!gl_FrontFacing)nn=-nn;
 float diff=max(dot(nn,lightdir),0);
 vec3 sc=S.xyz/S.w*.5+.5;float sh=1;
 if(all(greaterThan(sc,vec3(0)))&&all(lessThan(sc,vec3(1)))){
  sh=0;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)sh+=texture(shadow,vec3(sc.xy+vec2(x,y)*1.35/2048.,sc.z-.0012));sh/=9.;
 }
 vec3 view=normalize(eye-P),halfv=normalize(lightdir+view);
 float spec=pow(max(dot(nn,halfv),0),mix(12,180,pow(1-roughness,2)))*(.13+metalness*.30)*(1-roughness*.65);
 float hemi=mix(.34,.63,nn.y*.5+.5);
 vec3 ambient=mix(vec3(.83,.76,.65),vec3(.83,.90,1),nn.y*.5+.5)*hemi;
 vec3 outc=base*(ambient+lightcolor*diff*sh*.85)+lightcolor*spec*sh+emissive*emission;
 frag=vec4(pow(aces(outc*1.06),vec3(1./2.2)),alpha);
}
'''
program=ctx.program(vertex_shader=vertex,fragment_shader=fragment)
depth=ctx.program(vertex_shader='''#version 330
in vec3 p;uniform mat4 model,shadowvp;void main(){gl_Position=shadowvp*model*vec4(p,1);}
''',fragment_shader='''#version 330
void main(){}
''')
target=ctx.texture((W,H),4);resolved=ctx.framebuffer([target])
samples=min(4,ctx.max_samples)
colorbuf=ctx.renderbuffer((W,H),4,samples=samples);zbuf=ctx.depth_renderbuffer((W,H),samples=samples);fbo=ctx.framebuffer([colorbuf],zbuf)
shadowtex=ctx.depth_texture((2048,2048));shadowtex.filter=(moderngl.LINEAR,moderngl.LINEAR);shadowtex.repeat_x=False;shadowtex.repeat_y=False;shadowtex.compare_func='<='
shadowfbo=ctx.framebuffer(depth_attachment=shadowtex)
shadowtex.use(1);program['shadow'].value=1;program['picture'].value=0
blank=ctx.texture((1,1),4,b'\xff\xff\xff\xff');textures={}
buffers={};vaos={}
def mesh(o):
 key=o['id'] if o['skin'] else o['geometry'];g=assets['geometries'][o['geometry']]
 if key not in buffers:
  vbo=ctx.buffer(geometry_data(g,o['skin']).tobytes())
  ibo=ctx.buffer(np.asarray(g['index'],dtype='u4').tobytes()) if g['index'] is not None else None
  buffers[key]=(vbo,ibo)
  vaos[key]=(ctx.vertex_array(program,[(vbo,'3f 3f 2f 3f','p','n','uv','vc')],ibo),ctx.vertex_array(depth,[(vbo,'3f 32x','p')],ibo))
 elif o['skin']:buffers[key][0].write(geometry_data(g,o['skin']).tobytes())
 return vaos[key]
def texture(name):
 if not name:return blank
 if name not in textures:
  img=Image.open(root/'textures'/name).convert('RGBA').transpose(Image.Transpose.FLIP_TOP_BOTTOM)
  t=ctx.texture(img.size,4,img.tobytes());t.filter=(moderngl.LINEAR,moderngl.LINEAR);t.repeat_x=False;t.repeat_y=False;textures[name]=t
 return textures[name]
def draw(o,vao,prog):
 g=assets['geometries'][o['geometry']];write_matrix(prog['model'],mat(o['matrix']))
 groups=(g['groups'] if len(o['materials'])>1 else []) or [{'start':0,'count':len(g['index']) if g['index'] is not None else len(g['position'])//3,'materialIndex':0}]
 for group in groups:
  d=assets['materials'][o['materials'][group.get('materialIndex',0)]]
  if prog is program:
   prog['color'].value=d['color'];prog['roughness'].value=d['roughness'];prog['metalness'].value=d['metalness'];prog['alpha'].value=d['opacity'];prog['basic'].value=float(d['basic']);prog['emissive'].value=d['emissive'];prog['emission'].value=d['emissiveIntensity'];prog['usemap'].value=int(bool(d['map']));prog['usecolor'].value=int(d['vertexColors']);texture(d['map']).use(0)
  elif d['basic'] or d['opacity']<.75:continue
  vao.render(vertices=group['count'],first=group['start'])
def render(frame):
 cam=mat(frame['camera']['matrix']);vp=perspective(frame['camera']['fov'],W/H,frame['camera']['near'],frame['camera']['far'])@np.linalg.inv(cam)
 sun=next((l for l in frame['lights'] if l['type']=='DirectionalLight'),{'position':[6,9,9],'target':[0,0,0],'color':[1,1,.9]})
 ld=normalize(np.asarray(sun['position'])-sun['target'])
 center=np.array([0,1,3]);size=9 if frame['shot'] in ('school','pickup','road') else 5
 svp=ortho(size,.1,45)@look(center+ld*20,center)
 write_matrix(program['viewproj'],vp);write_matrix(program['shadowvp'],svp);write_matrix(depth['shadowvp'],svp)
 program['eye'].value=tuple(cam[:3,3]);program['lightdir'].value=tuple(ld);program['lightcolor'].value=sun['color']
 nodes=[]
 for o in frame['meshes']:nodes.append((o,mesh(o)))
 shadowfbo.use();shadowfbo.clear(depth=1);ctx.viewport=(0,0,2048,2048)
 for o,vao in nodes:draw(o,vao[1],depth)
 fbo.use();fbo.clear(*frame['background'],1,depth=1);ctx.viewport=(0,0,W,H)
 ctx.enable(moderngl.BLEND);ctx.blend_func=moderngl.SRC_ALPHA,moderngl.ONE_MINUS_SRC_ALPHA
 for o,vao in nodes:
  nm=np.linalg.inv(mat(o['matrix'])[:3,:3]).T;program['normalmat'].write(nm.astype('f4').T.tobytes());draw(o,vao[0],program)
 ctx.finish()
 ctx.copy_framebuffer(resolved,fbo)
 return Image.frombytes('RGBA',(W,H),resolved.read(components=4)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)

if os.environ.get('CPU_RANGE'):
 first,last=map(int,os.environ['CPU_RANGE'].split(','))
 assert 0<=first<=last<3420, 'The CPU review path omits the final CTA.'
 output=Path(os.environ.get('CPU_VIDEO',str(root/'motion.mp4')))
 encoder=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{W}x{H}',
  '-r','30','-i','-','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
 try:
  for index in range(first,last+1):
   frame=json.loads((root/f'frame-{index/30:.3f}.json').read_text())
   img=render(frame);encoder.stdin.write(img.tobytes())
   if (index-first)%30==0:print('MOTION_FRAME',index,flush=True)
 finally:
  encoder.stdin.close()
 if encoder.wait()!=0:raise RuntimeError('FFmpeg motion encoding failed')
 print('MOTION_READY',output,flush=True)
else:
 times=(os.environ.get('CPU_TIMES','8,34,74,102')).split(',')
 for t in times:
  frame=json.loads((root/('frame-'+format(float(t),'.3f')+'.json')).read_text());start=time.monotonic()
  img=render(frame);img.save(root/('gl-'+format(float(t),'.3f')+'.png'))
  print('RASTER_RENDERED',t,round(time.monotonic()-start,2),flush=True)
