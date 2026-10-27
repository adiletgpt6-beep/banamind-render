"""Render the real Half Hour 3D scene with Blender Cycles on the CPU.

Consumes the geometry, articulation and camera exported from the scene code.
No voice generation, browser, cloud render service or paid API is used.
"""
import os,json,math,time,sys
from pathlib import Path
import bpy,numpy as np
from mathutils import Matrix,Vector

root=Path(os.environ.get('CPU_OUT','out/cpu')).resolve()
assets=json.loads((root/'assets.json').read_text())
types={'Float32Array':'<f4','Uint16Array':'<u2','Uint32Array':'<u4'}
for g in assets['geometries'].values():
 for key,a in list(g.items()):
  if isinstance(a,dict) and 'file' in a:g[key]=np.fromfile(root/a['file'],dtype=types[a['dtype']])
def matrix(a):return Matrix(np.asarray(a,dtype=float).reshape(4,4,order='F').tolist())

def deform(g,skin):
 v=np.asarray(g['position'],dtype=np.float32).reshape(-1,3)
 if not skin:return v
 j=np.asarray(g['skinIndex'],dtype=np.int32).reshape(-1,4)
 w=np.asarray(g['skinWeight'],dtype=np.float32).reshape(-1,4)
 bind=np.asarray(skin['bind'],dtype=np.float32).reshape(4,4,order='F')
 inv=np.asarray(skin['inverse'],dtype=np.float32).reshape(4,4,order='F')
 bones=np.asarray(skin['bones'],dtype=np.float32).reshape(-1,4,4).transpose(0,2,1)
 h=np.column_stack((v,np.ones(len(v),dtype=np.float32)))@bind.T
 result=np.zeros_like(h)
 for k in range(4):result+=np.einsum('nij,nj->ni',bones[j[:,k]],h)*w[:,k,None]
 return (result@inv.T)[:,:3]

def material(key):
 d=assets['materials'][key];m=bpy.data.materials.new(key);m.use_nodes=True
 n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
 out=n.new('ShaderNodeOutputMaterial')
 shader=n.new('ShaderNodeBsdfPrincipled');l.new(shader.outputs['BSDF'],out.inputs['Surface'])
 shader.inputs['Base Color'].default_value=(*d['color'],1)
 shader.inputs['Roughness'].default_value=d['roughness']
 shader.inputs['Metallic'].default_value=d['metalness']
 shader.inputs['Alpha'].default_value=d['opacity']
 shader.inputs['Specular IOR Level'].default_value=.3
 if d['vertexColors']:
  c=n.new('ShaderNodeVertexColor');c.layer_name='Color'
  mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[1].default_value=(*d['color'],1)
  l.new(c.outputs['Color'],mix.inputs[2]);l.new(mix.outputs['Color'],shader.inputs['Base Color'])
 if d['map']:
  tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(root/'textures'/d['map']),check_existing=True)
  l.new(tex.outputs['Color'],shader.inputs['Base Color'])
  if d['basic']:l.new(tex.outputs['Color'],shader.inputs['Emission Color'])
 if d['basic']:
  shader.inputs['Emission Strength'].default_value=1
  if not d['map']:shader.inputs['Emission Color'].default_value=(*d['color'],1)
  shader.inputs['Base Color'].default_value=(0,0,0,1)
 else:
  shader.inputs['Emission Color'].default_value=(*d['emissive'],1)
  shader.inputs['Emission Strength'].default_value=d['emissiveIntensity']
 return m

def scene(frame):
 bpy.ops.wm.read_factory_settings(use_empty=True)
 s=bpy.context.scene
 mats={k:material(k) for k in set(k for o in frame['meshes'] for k in o['materials'])}
 for o in frame['meshes']:
  g=assets['geometries'][o['geometry']];v=deform(g,o['skin'])
  ids=np.asarray(g['index'] if g['index'] is not None else np.arange(len(v)),dtype=np.int32).reshape(-1,3)
  mesh=bpy.data.meshes.new(o['id']);mesh.from_pydata(v.tolist(),[],ids.tolist());mesh.update()
  for p in mesh.polygons:p.use_smooth=True
  if g['normal'] is not None:
   normals=np.asarray(g['normal'],dtype=np.float32).reshape(-1,3)
   if o['skin']:
    j=np.asarray(g['skinIndex'],dtype=np.int32).reshape(-1,4);w=np.asarray(g['skinWeight'],dtype=np.float32).reshape(-1,4)
    bones=np.asarray(o['skin']['bones'],dtype=np.float32).reshape(-1,4,4).transpose(0,2,1)
    mixed=np.zeros_like(normals)
    for k in range(4):mixed+=np.einsum('nij,nj->ni',bones[j[:,k],:3,:3],normals)*w[:,k,None]
    normals=mixed/np.maximum(np.linalg.norm(mixed,axis=1,keepdims=True),1e-8)
   mesh.normals_split_custom_set_from_vertices(normals.tolist())
  if g['uv'] is not None:
   uv=np.asarray(g['uv'],dtype=np.float32).reshape(-1,2);layer=mesh.uv_layers.new(name='UVMap')
   # Three's CanvasTexture origin is the top left. Export PNG as-is and invert V.
   loops=uv[ids.ravel()].copy()
   layer.data.foreach_set('uv',loops.ravel())
  if g['color'] is not None:
   col=np.asarray(g['color'],dtype=np.float32).reshape(-1,3)
   c=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER')
   c.data.foreach_set('color',np.column_stack((col[ids.ravel()],np.ones(ids.size))).ravel())
  obj=bpy.data.objects.new(o['id'],mesh);s.collection.objects.link(obj);obj.matrix_world=matrix(o['matrix'])
  for k in o['materials']:mesh.materials.append(mats[k])
  for group in g['groups']:
   for p in mesh.polygons[group['start']//3:(group['start']+group['count'])//3]:p.material_index=group.get('materialIndex',0)
 s.world=bpy.data.worlds.new('Soft studio ambience');s.world.use_nodes=True
 s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.77,.84,1,1)
 s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.38
 for i,l in enumerate(frame['lights']):
  if l['type'] in ('HemisphereLight','AmbientLight'):continue
  typ='SUN' if l['type']=='DirectionalLight' else 'AREA'
  d=bpy.data.lights.new('Light'+str(i),typ);d.color=l['color'];d.energy=l['intensity']*(1 if typ=='SUN' else 160)
  if typ=='SUN':d.angle=.18
  else:d.size=3
  obj=bpy.data.objects.new(d.name,d);s.collection.objects.link(obj);obj.location=l['position']
  obj.rotation_euler=(Vector(l['target'])-obj.location).to_track_quat('-Z','Y').to_euler()
 cd=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',cd);s.collection.objects.link(cam)
 cam.matrix_world=matrix(frame['camera']['matrix']);s.camera=cam
 cd.type='PERSP';cd.sensor_fit='VERTICAL';cd.sensor_height=24
 cd.lens=12/math.tan(math.radians(frame['camera']['fov'])/2)
 cd.clip_start=frame['camera']['near'];cd.clip_end=frame['camera']['far']
 s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=int(os.environ.get('CPU_SAMPLES','16'))
 s.cycles.use_denoising=True;s.cycles.max_bounces=5;s.cycles.diffuse_bounces=3;s.cycles.glossy_bounces=2
 s.render.threads_mode='FIXED';s.render.threads=8
 s.render.resolution_x=int(os.environ.get('CPU_WIDTH','540'));s.render.resolution_y=round(s.render.resolution_x*16/9);s.render.resolution_percentage=100
 s.render.image_settings.file_format='PNG';s.render.film_transparent=False
 s.view_settings.view_transform='AgX'
 return s

times=(os.environ.get('CPU_TIMES','8,34,74,102')).split(',')
for t in times:
 p=root/('frame-'+format(float(t),'.3f')+'.json')
 f=json.loads(p.read_text());start=time.monotonic();s=scene(f)
 s.render.filepath=str(root/('still-'+format(float(t),'.3f')+'.png'))
 bpy.ops.render.render(write_still=True)
 print('RENDERED',t,round(time.monotonic()-start,2),'seconds',flush=True)
