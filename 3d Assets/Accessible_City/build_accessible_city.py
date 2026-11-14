"""Build the original Accessible Way city, rigs, and a self-contained looping GLB.

Blender 4.3+: blender -b --python build_accessible_city.py
Optional after --: --output DIRECTORY --render
All geometry and characters are authored procedurally; no third-party assets.
"""
import bpy
import math
import json
import random
import argparse
import sys
from pathlib import Path
from collections import defaultdict
from mathutils import Vector, Quaternion, Matrix

random.seed(21)
args_parser = argparse.ArgumentParser()
args_parser.add_argument('--output', default=str(Path(__file__).resolve().parent))
args_parser.add_argument('--render', action='store_true')
args = args_parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
OUT = Path(args.output).resolve()
OUT.mkdir(parents=True, exist_ok=True)
FPS, SECONDS = 24, 24
LAST = FPS * SECONDS
TAU = math.tau
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for dat in list(bpy.data.materials): bpy.data.materials.remove(dat)
scene = bpy.context.scene
scene.name = 'Accessible_Way_City_Loop_24s'
scene.frame_start, scene.frame_end = 0, LAST
scene.render.fps = FPS
bpy.context.preferences.filepaths.save_version = 0

def linear(v): return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4
def material(name, hexcode, roughness=.62, metallic=0):
    rgb = [linear(int(hexcode[i:i+2], 16)/255) for i in (0,2,4)]
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return m

M = {name:material(name, color, rough, metal) for name,color,rough,metal in [
 ('Ivory','F5EEE4',.72,0),('White','FFFFFF',.7,0),('Stone','E1DDD5',.85,0),
 ('Paving','E7E1D8',.9,0),('PavingAlt','D8D7D2',.9,0),('Concrete','BFCBD0',.85,0),
 ('Navy','164E8A',.48,.05),('DeepBlue','003769',.55,.03),('Blue','3981B5',.5,0),
 ('Sky','9CC9E1',.35,.08),('Glass','74ADC6',.23,.12),('GlassDark','336178',.3,.12),
 ('GlassLight','C5E3E8',.3,.1),('Road','777F90',.95,0),('RoadLine','FAFAF3',.8,0),
 ('GreenBase','739E46',.88,0),('Grass','94B95E',.92,0),('GrassLight','A5C96D',.9,0),
 ('Leaf','639C37',.85,0),('LeafLight','8BBA40',.82,0),('LeafDark','447F39',.9,0),
 ('Bark','927256',.9,0),('Wood','C19B65',.78,0),('WoodLight','D8B484',.8,0),
 ('Coral','EA9279',.6,0),('Terracotta','CE7D62',.72,0),('Mint','80B9B1',.58,0),
 ('Yellow','F0C653',.7,0),('Iron','405A67',.5,.3),('Metal','AFC3CA',.4,.5),
 ('Rubber','2D3943',.9,0),('Black','22313E',.8,0),('Lamp','FFF0BB',.4,0),
 ('Pink','EB8D9D',.7,0),('FlowerWhite','FFF3DE',.7,0),('Red','D06458',.7,0),
 ('Skin1','DBA57F',.8,0),('Skin2','A86F4E',.8,0),('Skin3','ECC8A2',.8,0),
 ('Hair','41332B',.88,0),('HairDark','26313C',.85,0),('HairGray','BAC0BC',.8,0),
 ('Trouser','446787',.85,0),('Sand','CBB18E',.85,0),('ShirtYellow','E9BD51',.8,0),
 ('ShirtBlue','5599C1',.8,0),('ShirtCoral','D97D67',.8,0),('ShirtCream','EFE2CC',.8,0),
]}
GEOM, MATERIAL_MESHES = {}, {}

def group(name, parent=None, location=(0,0,0)):
    o = bpy.data.objects.new(name, None)
    scene.collection.objects.link(o)
    o.empty_display_type = 'PLAIN_AXES'
    o.empty_display_size = .15
    o.parent, o.location = parent, location
    return o

CITY = group('ACCESSIBLE_CITY')
CITY['loop_seconds'] = SECONDS
CITY['description'] = 'Original inclusive miniature city; fixed isometric camera; animated residents and vehicles.'
TERRAIN = group('01_Ground_Roads_Sidewalks', CITY)
BUILDINGS = group('02_Buildings', CITY)
LANDSCAPE = group('03_Trees_Park_Flowers', CITY)
STREET = group('04_Accessible_Street_Furniture', CITY)
TRAFFIC = group('05_Animated_Vehicles', CITY)
RESIDENTS = group('06_Animated_Residents', CITY)

def mesh_object(name, vertices, faces, mat, parent, smooth=False, key=None):
    cache_key = (key, mat) if key else None
    if cache_key and cache_key in MATERIAL_MESHES:
        mesh = MATERIAL_MESHES[cache_key]
    else:
        mesh = bpy.data.meshes.new(name + '_Geometry')
        mesh.from_pydata(vertices, [], faces)
        mesh.materials.append(M[mat])
        mesh.update()
        for poly in mesh.polygons: poly.use_smooth = smooth
        if cache_key: MATERIAL_MESHES[cache_key] = mesh
    o = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(o)
    o.parent = parent
    return o

def cube_mesh(dims, bevel):
    key = ('box', tuple(round(x,5) for x in dims), round(bevel,5))
    if key in GEOM: return GEOM[key]
    x,y,z = [a/2 for a in dims]
    verts=[(-x,-y,-z),(-x,-y,z),(-x,y,-z),(-x,y,z),(x,-y,-z),(x,-y,z),(x,y,-z),(x,y,z)]
    faces=[(0,2,6,4),(1,5,7,3),(0,4,5,1),(2,3,7,6),(0,1,3,2),(4,6,7,5)]
    me=bpy.data.meshes.new('BoxGeometry'); me.from_pydata(verts,[],faces); me.update()
    if bevel:
        temp=bpy.data.objects.new('BevelTemplate',me);scene.collection.objects.link(temp)
        bpy.context.view_layer.objects.active=temp
        mod=temp.modifiers.new('Soft edges','BEVEL');mod.width=min(bevel,min(dims)/2.2);mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        me=temp.data.copy()
        bpy.data.objects.remove(temp,do_unlink=True)
    GEOM[key]=me
    return me

def box(name, loc, dims, mat='Ivory', parent=None, bevel=.025, rot=None):
    parent = CITY if parent is None else parent
    geo=cube_mesh(dims,bevel)
    key=(geo.name,mat)
    if key not in MATERIAL_MESHES:
        data=geo.copy();data.materials.clear();data.materials.append(M[mat]);MATERIAL_MESHES[key]=data
    o=bpy.data.objects.new(name,MATERIAL_MESHES[key]);scene.collection.objects.link(o);o.parent=parent;o.location=loc
    if rot: o.rotation_euler=rot
    return o

def uvball(name,loc,scale,mat='Leaf',parent=None,segments=12,rings=8):
    verts=[];faces=[]
    for j in range(rings+1):
        a=math.pi*j/rings
        for i in range(segments):
            b=TAU*i/segments;verts.append((math.sin(a)*math.cos(b),math.sin(a)*math.sin(b),math.cos(a)))
    for j in range(rings):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments;c=b+segments;d=a+segments
            faces.append((a,d,c,b))
    o=mesh_object(name,verts,faces,mat,parent or CITY,True,('sphere',segments,rings));o.location=loc;o.scale=scale
    return o

def cylinder(name,a,b,r,mat='Metal',parent=None,sides=10,r2=None):
    a,b=Vector(a),Vector(b);length=(b-a).length;r2=r if r2 is None else r2
    verts=[]
    for z,rad in [(-length/2,r),(length/2,r2)]:
        for i in range(sides): verts.append((rad*math.cos(TAU*i/sides),rad*math.sin(TAU*i/sides),z))
    faces=[tuple(range(sides-1,-1,-1)),tuple(range(sides,2*sides))]
    faces += [(i,(i+1)%sides,(i+1)%sides+sides,i+sides) for i in range(sides)]
    o=mesh_object(name,verts,faces,mat,parent or CITY,True,('cylinder',round(length,5),r,r2,sides))
    o.location=(a+b)/2;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return o

def torus(name,loc,major,minor,mat,parent=None,axis='X',segments=24,tube=6):
    verts=[];faces=[]
    for i in range(segments):
        a=TAU*i/segments
        for j in range(tube):
            b=TAU*j/tube;verts.append(((major+minor*math.cos(b))*math.cos(a),(major+minor*math.cos(b))*math.sin(a),minor*math.sin(b)))
    for i in range(segments):
        for j in range(tube): faces.append((i*tube+j,((i+1)%segments)*tube+j,((i+1)%segments)*tube+(j+1)%tube,i*tube+(j+1)%tube))
    o=mesh_object(name,verts,faces,mat,parent or CITY,True,('torus',major,minor,segments,tube));o.location=loc
    if axis=='X':o.rotation_euler.y=math.pi/2
    if axis=='Y':o.rotation_euler.x=math.pi/2
    return o

def rounded_points(w,h,r,n=12,cx=0,cy=0):
    pts=[]
    for x,y,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(n+1):
            a=math.radians(start+90*i/n);pts.append((cx+x+r*math.cos(a),cy+y+r*math.sin(a)))
    return pts

def slab(name,w,h,r,z,depth,mat,parent=TERRAIN,cx=0,cy=0):
    p=rounded_points(w,h,r,cx=cx,cy=cy);n=len(p)
    verts=[(x,y,z-depth) for x,y in p]+[(x,y,z) for x,y in p]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh_object(name,verts,faces,mat,parent)

def ring(name,outer,inner,z,mat,parent=TERRAIN,cy=-.5,depth=.02):
    a=rounded_points(*outer);b=rounded_points(*inner);n=len(a)
    verts=[(x,y+cy,z) for x,y in a]+[(x,y+cy,z) for x,y in b]
    faces=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh_object(name,verts,faces,mat,parent)

def path(w,h,r,cx=0,cy=0):
    points=rounded_points(w,h,r,20,cx,cy)
    lengths=[0]
    for a,b in zip(points,points[1:]+points[:1]): lengths.append(lengths[-1]+math.dist(a,b))
    return {'points':points,'lengths':lengths,'length':lengths[-1]}

def on_path(p,phase):
    d=(phase%1)*p['length'];lengths=p['lengths'];pts=p['points']
    import bisect
    i=min(len(pts)-1,bisect.bisect_right(lengths,d)-1);a,b=pts[i],pts[(i+1)%len(pts)]
    fac=(d-lengths[i])/max(1e-6,lengths[i+1]-lengths[i]);x=a[0]+(b[0]-a[0])*fac;y=a[1]+(b[1]-a[1])*fac
    yaw=math.atan2(-(b[0]-a[0]),b[1]-a[1])
    return x,y,yaw

PROP_AUDIT={'kept':[],'removed':[]}

def rounded_rect_distance(x,y,w,h,r):
    qx=abs(x)-(w/2-r)
    qy=abs(y+.5)-(h/2-r)
    return math.hypot(max(qx,0),max(qy,0))+min(max(qx,qy),0)-r

def road_overlap(x,y,radius=0,clearance=.12):
    margin=radius+clearance
    outer=rounded_rect_distance(x,y,23.0,17.0,3.5)
    inner=rounded_rect_distance(x,y,18.6,12.6,1.3)
    return outer<=margin and inner>=-margin

def allow_prop(kind,x,y,width=None,depth=None,radius=None):
    record={'kind':kind,'x':x,'y':y,'clearance':.12}
    if radius is not None:
        record['radius']=radius
        blocked=road_overlap(x,y,radius)
    else:
        record.update(width=width,depth=depth)
        blocked=any(road_overlap(x+dx*width/2,y+dy*depth/2) for dx in [-1,0,1] for dy in [-1,0,1])
    PROP_AUDIT['removed' if blocked else 'kept'].append(record)
    return not blocked

def tree(x,y,height=2.8,scale=1):
    if not allow_prop('tree',x,y,radius=.10*scale):return
    z=.49;h=height
    cylinder('Tree trunk',(x,y,z),(x,y,z+h*.64),.10*scale,'Bark',LANDSCAPE,sides=9,r2=.065*scale)
    for dx,dy,dz,rad in [(0,0,.73,.64),(-.48,.05,.69,.49),(.43,.03,.70,.5),(-.05,-.38,.70,.5),(.05,.38,.72,.48),(-.24,.0,.91,.46),(.27,.0,.88,.46)]:
        uvball('Rounded canopy',(x+dx*scale,y+dy*scale,z+h*dz),(rad*scale,rad*.90*scale,rad*.88*scale),random.choice(['Leaf','LeafLight','Leaf','LeafDark']),LANDSCAPE)

def shrub(x,y,scale=.35,z=.55):
    if not allow_prop('shrub',x,y,width=3.2*scale,depth=2*scale):return
    for dx,dy,dz in [(0,0,0),(-.20,.03,-.03),(.19,.06,-.03)]:
        uvball('Shrub',(x+dx*scale/.35,y+dy*scale/.35,z+scale*.6+dz),(scale,scale*.8,scale*.78),random.choice(['Leaf','LeafLight','LeafDark']),LANDSCAPE,10,6)

def flowers(x,y,w=.8,h=.36):
    if not allow_prop('flower_bed',x,y,width=w+.30,depth=h+.30):return
    box('Flower bed',(x,y,.56),(w,h,.18),'Stone',LANDSCAPE,.08)
    for i in range(max(3,int(w/.16))):
        xx=x-w*.4+i*w*.8/max(1,int(w/.16)-1)
        uvball('Flower foliage',(xx,y,.73),(.15,.15,.12),'Leaf',LANDSCAPE,8,5)
        for _ in range(2):uvball('Flower blossom',(xx+random.uniform(-.09,.09),y+random.uniform(-.09,.09),.85+random.uniform(-.03,.03)),(.065,.065,.055),random.choice(['Coral','Pink','FlowerWhite','Yellow']),LANDSCAPE,8,5)

def rail(a,b,z=.0,parent=STREET,height=.7):
    a,b=Vector(a),Vector(b);count=max(1,math.ceil((b-a).length/.65))
    for i in range(count+1):
        p=a.lerp(b,i/count);cylinder('Rail post',(p.x,p.y,p.z),(p.x,p.y,p.z+height),.022,'Metal',parent,8)
    cylinder('Top handrail',a+Vector((0,0,height)),b+Vector((0,0,height)),.028,'Metal',parent,8)
    cylinder('Middle rail',a+Vector((0,0,height*.47)),b+Vector((0,0,height*.47)),.016,'Metal',parent,8)

def ramp(parent,x,y,width=1,length=1.8,rise=.32,base=.53,rotation=0):
    g=group('Accessible ramp',parent,(x,y,base));g.rotation_euler.z=rotation
    w,l=width/2,length/2
    verts=[(-w,-l,0),(w,-l,0),(-w,l,0),(w,l,0),(-w,-l,.03),(w,-l,.03),(-w,l,rise),(w,l,rise)]
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]
    mesh_object('Sloping ramp deck',verts,faces,'Concrete',g)
    rail((-w,-l,.03),(-w,l,rise),parent=g,height=.62)
    rail((w,-l,.03),(w,l,rise),parent=g,height=.62)
    return g

def window(parent,x,z,w,h,d,side=False,glass='Glass'):
    if side:
        box('Window frame',(d+.02,x,z),(.09,w+.12,h+.12),'White',parent,.015)
        box('Window glazing',(d+.075,x,z),(.035,w,h),glass,parent,.008)
        box('Window mullion',(d+.105,x,z),(.035,.035,h),'Navy',parent,.008)
    else:
        box('Window frame',(x,-d-.02,z),(w+.12,.09,h+.12),'White',parent,.015)
        box('Window glazing',(x,-d-.075,z),(w,.035,h),glass,parent,.008)
        box('Window mullion',(x,-d-.105,z),(.035,.035,h),'Navy',parent,.008)

def apartment(name,x,y,w,d,h,color='Ivory',balconies=False):
    g=group(name,BUILDINGS,(x,y,.52))
    box('Building body',(0,0,h/2),(w,d,h),color,g,.07)
    box('Foundation',(0,0,.10),(w+.13,d+.13,.2),'Concrete',g,.04)
    box('Roof slab',(0,0,h+.05),(w+.16,d+.16,.16),'White',g,.04)
    box('Roof inset',(0,0,h+.16),(w-.22,d-.22,.10),'Blue',g,.025)
    for xx,yy,ww,dd in [(0,-d/2,w+.14,.13),(0,d/2,w+.14,.13),(-w/2,0,.13,d),(w/2,0,.13,d)]:
        box('Roof parapet',(xx,yy,h+.29),(ww,dd,.36),'Navy',g,.025)
    floors=max(2,round(h/1.32));floorh=h/floors
    for j in range(floors):
        zz=.65+j*floorh
        for i in range(2 if w<3.4 else 3):
            count=2 if w<3.4 else 3;xx=(i-(count-1)/2)*w/(count+.4)
            window(g,xx,zz,w/(count+.85),.83,d/2,glass='GlassLight' if (j+i)%3==0 else 'Glass')
        for yy in [-d*.27,d*.24]:window(g,yy,zz,.65,.82,w/2,True)
        if balconies and j>0:
            box('Balcony slab',(0,-d/2-.27,zz-.52),(w*.82,.72,.12),'White',g,.04)
            box('Balcony front',(0,-d/2-.59,zz-.24),(w*.82,.075,.48),'Blue' if j%2 else 'Coral',g,.02)
            for px in [-w*.22,w*.22]:
                box('Balcony planter',(px,-d/2-.59,zz+.01),(.48,.26,.18),'WoodLight',g,.025)
                for dx in [-.13,0,.13]:uvball('Balcony greenery',(px+dx,-d/2-.60,zz+.18),(.14,.14,.15),'LeafLight',g,8,5)
    return g

def office():
    g=apartment('03_Civic_Office',-.1,3.35,4.1,3.35,6.5,'Ivory')
    for xx in [-1.87,1.87]:box('Blue facade pilaster',(xx,-1.74,3.6),(.25,.18,6.1),'Navy',g,.025)
    for zz in [1.9,3.25,4.6]:box('Facade band',(0,-1.76,zz),(3.8,.18,.17),'White',g,.025)
    box('Entry canopy',(0,-2.09,1.74),(2.05,1.0,.18),'Navy',g,.04)
    for xx in [-.84,.84]:box('Entry column',(xx,-2.38,.93),(.14,.14,1.65),'Concrete',g,.025)
    box('Entry platform',(0,-1.94,.20),(2.18,.85,.4),'Concrete',g,.04)
    window(g,0,.86,1.26,1.48,1.72,glass='GlassDark')
    for i in range(3):box('Entry stair',(0,-2.48-.17*i,.13-.045*i),(1.0,.34,.12),'Stone',g,.015)
    ramp(g,1.38,-2.08,.82,2.05,.36,base=0,rotation=-math.pi/2)
    return g

def clinic():
    g=group('04_Community_Clinic',BUILDINGS,(6.22,3.15,.52))
    box('Clinic main wing',(0,0,1.55),(4.35,3.25,3.1),'Ivory',g,.06)
    box('Clinic raised entrance',(-.85,-.12,1.95),(1.85,3.22,3.9),'White',g,.04)
    for xx,yy,ww,dd,zz in [(1.15,0,2.25,3.4,3.12),(-.85,0,2.0,3.4,3.95)]:
        box('Clinic blue roof',(xx,yy,zz),(ww,dd,.18),'Navy',g,.035)
        box('Clinic roof inset',(xx,yy,zz+.11),(ww-.24,dd-.24,.08),'Blue',g,.015)
    for x in [-1.28,-.38,.78,1.65]:window(g,x,1.40,.62,1.35,1.65)
    for yy in [-.85,.25,1.05]:window(g,yy,1.5,.60,1.25,2.20,True)
    box('Medical cross vertical',(-.85,-1.76,3.02),(.24,.13,.88),'Blue',g,.045)
    box('Medical cross horizontal',(-.85,-1.77,3.02),(.85,.13,.25),'Blue',g,.045)
    box('Entry canopy',(-.78,-2.0,2.25),(1.88,1.0,.16),'Navy',g,.045)
    box('Clinic entry landing',(-.78,-1.97,.18),(1.88,.94,.36),'Concrete',g,.035)
    ramp(g,.50,-2.0,.82,2.25,.33,base=0,rotation=-math.pi/2)
    for i in range(3):box('Clinic entry stairs',(-1.05,-2.57-.15*i,.15-.045*i),(1.05,.3,.11),'Stone',g,.015)
    return g

def shop(name,x,y,w=1.85,d=2.55,awning='Mint'):
    g=group(name,BUILDINGS,(x,y,.52));h=2.35
    box('Shop body',(0,0,h/2),(w,d,h),'Ivory',g,.045)
    box('Shop parapet',(0,0,h+.10),(w+.13,d+.13,.2),'White',g,.035)
    box('Flat roof inset',(0,0,h+.20),(w-.18,d-.18,.08),'Stone',g,.02)
    window(g,0,1.02,w-.25,1.78,d/2,glass='GlassDark')
    box('Timber storefront mullion',(0,-d/2-.13,1.0),(.07,.06,1.86),'Wood',g,.015)
    # Simple visible shop displays in front of the glazing.
    for sx in [-.43,.38]:
        box('Display shelf',(sx,-d/2-.15,.65),(.52,.18,.06),'WoodLight',g,.01)
        for i in range(3):cylinder('Display goods',(sx-.15+i*.15,-d/2-.2,.69),(sx-.15+i*.15,-d/2-.2,.91),.045,random.choice(['Coral','Yellow','Mint']),g,8)
    n=7
    for i in range(n):
        xx=-w/2+(i+.5)*w/n
        color=awning if i%2==0 or awning!='Navy' else 'White'
        box('Awning panel',(xx,-d/2-.41,1.94),(w/n+.006,.89,.055),color,g,.012,(math.radians(18),0,0))
        box('Awning valance',(xx,-d/2-.84,1.79),(w/n+.008,.075,.18),color,g,.035)
    for xx in [-w/2+.04,w/2-.04]:cylinder('Awning support',(xx,-d/2-.77,.04),(xx,-d/2-.77,1.82),.028,'Wood',g,8)
    return g

def house(name,x,y,w=2.7,d=2.45,roof='Navy',height=2.35):
    g=group(name,BUILDINGS,(x,y,.52));h=height
    box('House walls',(0,0,h/2),(w,d,h),'Ivory',g,.045)
    ridge=h+1.12;ww=w/2+.18;dd=d/2+.18
    verts=[(-ww,-dd,h-.05),(ww,-dd,h-.05),(0,-dd,ridge),(-ww,dd,h-.05),(ww,dd,h-.05),(0,dd,ridge)]
    mesh_object('Gabled roof',verts,[(0,2,5,3),(1,4,5,2),(0,1,2),(3,5,4)],roof,g)
    # Repeating roof seams make the roofs read as modeled tiles at Hero size.
    for i in range(1,7):
        yy=-dd+2*dd*i/7
        cylinder('Roof seam left',(-ww,yy,h-.025),(0,yy,ridge+.025),.015,'Blue' if roof=='Navy' else 'Coral',g,6)
        cylinder('Roof seam right',(0,yy,ridge+.025),(ww,yy,h-.025),.015,'Blue' if roof=='Navy' else 'Coral',g,6)
    for k in [.28,.58,.85]:
        zz=h+(ridge-h)*k
        for sign in [-1,1]:cylinder('Roof tile course',(sign*ww*(1-k),-dd,zz),(sign*ww*(1-k),dd,zz),.012,'Blue' if roof=='Navy' else 'Coral',g,6)
    window(g,-.65,1.25,.66,.86,d/2)
    box('Front door',(.55,-d/2-.05,.79),(.68,.09,1.58),'Wood',g,.035)
    uvball('Door handle',(.78,-d/2-.12,.78),(.025,.025,.025),'Metal',g,8,5)
    for yy in [-.58,.60]:window(g,yy,1.28,.64,.87,w/2,True)
    box('Door canopy',(.55,-d/2-.36,1.84),(.98,.76,.10),roof,g,.04)
    box('Entry landing',(.55,-d/2-.30,.10),(1.03,.62,.2),'Concrete',g,.025)
    return g

def bench(x,y,angle=0):
    g=group('Park bench',STREET,(x,y,.53));g.rotation_euler.z=angle
    for yy in [-.18,-.06,.06,.18]:box('Seat slat',(0,yy,.40),(1.45,.10,.075),'Wood',g,.018)
    for zz in [.66,.84]:box('Back slat',(0,.27,zz),(1.45,.075,.13),'Wood',g,.02)
    for xx in [-.56,.56]:
        cylinder('Bench leg',(xx,-.16,0),(xx,-.16,.43),.032,'Iron',g,8)
        cylinder('Bench back support',(xx,.20,0),(xx,.27,.91),.032,'Iron',g,8)
        cylinder('Bench armrest',(xx,-.18,.59),(xx,.26,.59),.03,'Iron',g,8)
    return g

def lamp(x,y):
    if not allow_prop('street_lamp',x,y,radius=.20):return
    g=group('Street lamp',STREET,(x,y,.53))
    cylinder('Lamp foot',(0,0,0),(0,0,.12),.16,'Iron',g,12)
    cylinder('Lamp pole',(0,0,.10),(0,0,1.95),.045,'Iron',g,10,r2=.033)
    uvball('Warm lamp globe',(0,0,2.05),(.16,.16,.22),'Lamp',g,12,8)
    cylinder('Lamp cap',(0,0,2.23),(0,0,2.29),.19,'Navy',g,12,r2=.04)

def tactile(x,y,w=1.3,h=.42,angle=0):
    g=group('Tactile crossing pad',TERRAIN,(x,y,.535));g.rotation_euler.z=angle
    box('Yellow tactile base',(0,0,0),(w,h,.025),'Yellow',g,.015)
    for i in range(max(2,int(w/.13))):
        for j in range(3):
            xx=-w/2+.08+i*.13;yy=-h/2+.07+j*.13
            cylinder('Tactile dot',(xx,yy,.01),(xx,yy,.025),.024,'Yellow',g,6)

def make_ground():
    slab('Rounded green city foundation',25.1,19.8,3.8,.30,.42,'GreenBase',cy=-.5)
    ring('Outer sidewalk',(24.7,19.25,3.92),(23.0,17.0,3.5),.51,'Paving')
    slab('Asphalt road',23.0,17.0,3.5,.405,.05,'Road',cy=-.5)
    slab('Central island sidewalk',18.6,12.6,1.30,.53,.13,'Paving',cy=-.5)
    ring('Outside curb',(23.12,17.12,3.56),(22.99,16.99,3.495),.54,'White')
    ring('Inside curb',(18.68,12.68,1.34),(18.53,12.53,1.265),.56,'White')
    center=path(20.8,14.8,2.4,cy=-.5)
    for i in range(65):
        xx,yy,a=on_path(center,i/65)
        box('Road lane dash',(xx,yy,.415),(.075,.42,.015),'RoadLine',TERRAIN,.008,(0,0,a))
    for x in [-6.2,6.4]:
        for i in range(6):box('Zebra crossing stripe',(x-.64+i*.255,-7.9,.425),(.14,2.02,.018),'White',TERRAIN,.008)
        tactile(x,-6.42);tactile(x,-9.48)
    for y in [-.1,2.2]:
        for side in [-1,1]:
            for i in range(6):box('Side zebra stripe',(side*10.4,y-.64+i*.255,.425),(2.02,.14,.018),'White',TERRAIN,.008)
            tactile(side*8.82,y,angle=math.pi/2);tactile(side*11.89,y,angle=math.pi/2)
    # Paving joints and the continuous front tactile guide.
    for x in [i*.75 for i in range(-11,12)]:
        box('Front sidewalk joint',(x,-9.64,.518),(.013,.70,.009),'PavingAlt',TERRAIN,0)
    for x in [-4.8+i*.56 for i in range(20)]:
        for dy in [-.055,0,.055]:box('Tactile guide rib',(x,-9.48+dy,.55),(.48,.018,.025),'Yellow',TERRAIN,.005)
    # Park with an unobstructed perimeter path.
    slab('Park paved plaza',6.8,4.9,1.1,.555,.035,'Stone',LANDSCAPE,cx=.15,cy=-3.0)
    slab('Park lawn',4.8,3.12,.95,.60,.065,'Grass',LANDSCAPE,cx=.15,cy=-2.95)
    for x in [-2.0,2.0]:slab('Bench paving pad',1.8,.95,.15,.615,.04,'Paving',LANDSCAPE,cx=x,cy=-3.0)

def create_architecture():
    apartment('01_Residential_Apartments',-7.12,3.2,2.85,3.45,5.25,'Ivory',True)
    apartment('02_Blue_Residential_Block',-4.05,3.56,2.62,3.12,5.88,'Blue',True)
    office();clinic()
    shop('05_Neighborhood_Shop',-7.85,-1.15,1.9,2.5,'Mint')
    shop('06_Bakery',-5.88,-1.15,1.9,2.5,'Coral')
    shop('07_Flower_Shop',-3.91,-1.15,1.9,2.5,'Mint')
    house('08_Terracotta_House',5.03,-1.65,2.65,2.45,'Terracotta',2.14)
    home=house('09_Blue_Roof_House',7.04,-4.45,2.65,2.45,'Navy',2.20)
    ramp(home,-.60,-1.66,.75,1.5,.18,base=0,rotation=-math.pi/2)
    cafe=house('10_Corner_Cafe',-7.30,-4.78,2.9,2.05,'Navy',2.05)
    # Side terrace has room for a table, seats and a compact umbrella.
    cylinder('Cafe table leg',(-4.65,-4.70,.55),(-4.65,-4.70,1.15),.055,'Iron',STREET,10)
    cylinder('Cafe table top',(-4.65,-4.70,1.13),(-4.65,-4.70,1.22),.36,'Wood',STREET,20)
    for x,y in [(-4.1,-4.7),(-5.05,-5.13)]:
        cylinder('Cafe stool foot',(x,y,.55),(x,y,1.0),.045,'Iron',STREET,8)
        cylinder('Cafe stool',(x,y,.99),(x,y,1.07),.19,'Wood',STREET,12)
    cylinder('Umbrella mast',(-4.65,-4.70,.55),(-4.65,-4.70,2.32),.027,'Wood',STREET,8)
    verts=[(-4.65,-4.7,2.56)]+[(-4.65+.83*math.cos(TAU*i/12),-4.7+.83*math.sin(TAU*i/12),2.25) for i in range(12)]
    mesh_object('Coral cafe umbrella',verts,[(0,i+1,(i+1)%12+1) for i in range(12)],'Coral',STREET)
    # A visible accessible ramp on the cafe side.
    ramp(cafe,1.75,0,.75,1.55,.18,base=0,rotation=0)

def create_landscape():
    for x,y,h,s in [(-8.7,5.1,3.1,1),(-5.5,5.0,3.3,1.1),(2.4,4.9,3.5,1.05),(8.55,4.9,2.8,.85),
                    (-8.65,.85,2.3,.75),(-2.65,1.0,2.8,.9),(3.17,.7,2.55,.85),(8.58,.70,2.4,.8),
                    (.05,-2.3,3.4,1.15),(-1.6,-2.15,2.3,.7),(2.45,-4.18,2.25,.73),
                    (-10.5,6.70,2.6,.83),(10.6,6.6,2.7,.85),(-11.65,3.75,2.25,.7),
                    (-11.75,-3.8,2.3,.7),(11.72,-3.5,2.35,.72)]:tree(x,y,h,s)
    for x,y in [(-8.2,-6.06),(-8.7,-5.8),(-5.55,-5.95),(4.15,-2.95),(4.1,-.55),(8.5,-5.4),
                (5.4,-5.9),(8.6,1.3),(2.9,1.1),(-2.9,4.9),(-8.8,1.8),(-2.7,-4.45),(-2.7,-1.6),
                (-9.9,-8.1),(9.8,-8.45),(-2.9,-9.96),(5.0,-9.93),(7.4,-9.2),(-8.5,7.2)]:shrub(x,y,.30)
    for x,y,w in [(-1.35,-4.3,1.25),(.30,-4.5,1.25),(2.1,-1.6,.8),(-2.1,-1.6,.8),
                  (4.0,1.0,.9),(8.5,1.25,.8),(-2.65,1.1,.9),(-8.8,-5.4,.8),
                  (-4.8,-9.95,1.3),(3.7,-9.97,1.3),(7.5,-9.6,1.0)]:flowers(x,y,w)
    bench(1.95,-3.0);bench(-1.90,-3.0)
    for x,y in [(-8.85,-3.5),(-3.45,-3.45),(3.65,-5.72),(8.65,-.8),(-10.9,4.9),(10.93,4.9),(-8.55,-9.1),(7.95,-9.3)]:lamp(x,y)
    # House fence, planters and a waste bin complete the streetscape.
    for x in [5.72+i*.23 for i in range(12)]:box('House picket',(x,-5.98,.95),(.12,.09,.83),'WoodLight',STREET,.025)
    for z in [.80,1.18]:box('Fence horizontal rail',(6.98,-6.0,z),(2.75,.07,.08),'Wood',STREET,.015)
    box('Park waste bin',(-3.22,-5.25,.84),(.32,.32,.57),'Navy',STREET,.065)
    box('Bin lid',(-3.22,-5.25,1.15),(.38,.38,.07),'Iron',STREET,.035)

def tire(parent,name,x,y,z,r=.18,w=.105):
    g=group(name,parent,(x,y,z))
    torus('Rubber tire',(0,0,0),r*.78,r*.22,'Rubber',g,segments=20)
    cylinder('Wheel alloy',(-w/2,0,0),(w/2,0,0),r*.60,'Metal',g,12)
    for sign in [-1,1]:
        for i in range(5):
            a=TAU*i/5;cylinder('Alloy spoke',(sign*w*.55,0,0),(sign*w*.55,r*.52*math.cos(a),r*.52*math.sin(a)),.013,'White',g,6)
    return g

VEHICLES=[]
def car(name,color,phase,kind='car'):
    root=group(name,TRAFFIC);body=group('Bodywork',root);wheels=[]
    if kind=='bus':
        box('Bus body',(0,0,.80),(1.04,2.86,1.10),'White',body,.14)
        box('Bus blue lower stripe',(0,0,.38),(1.06,2.9,.22),'Navy',body,.055)
        box('Bus roof',(0,0,1.38),(1.04,2.75,.11),'White',body,.06)
        for side in [-1,1]:
            for i in range(5):box('Passenger window',(side*.526,-1.01+i*.46,1.00),(.028,.39,.48),'GlassDark',body,.025)
        box('Bus front windshield',(0,1.434,1.00),(.89,.035,.65),'GlassDark',body,.05)
        box('Windshield divider',(0,1.462,1.00),(.035,.02,.65),'Iron',body,.006)
        box('Bus entry door',(-.539,.91,.79),(.035,.54,.87),'Glass',body,.02)
        for x in [-.36,.36]:box('Bus headlamp',(x,1.46,.51),(.17,.035,.12),'Lamp',body,.025)
        for x in [-.55,.55]:
            for y in [-.91,.91]:wheels.append(tire(root,'Bus_Wheel',x,y,.22,.21,.13))
        box('Roof vent',(0,-.38,1.49),(.62,.67,.12),'Concrete',body,.035)
        rad=.21
    else:
        box('Car body',(0,0,.44),(.93,1.93,.39),color,body,.15)
        box('Car cabin',(0,-.10,.76),(.78,1.02,.48),color,body,.14)
        box('Front windshield',(0,.43,.79),(.64,.035,.31),'GlassDark',body,.045,(math.radians(-12),0,0))
        box('Rear windshield',(0,-.61,.79),(.64,.035,.29),'GlassDark',body,.04,(math.radians(12),0,0))
        for side in [-1,1]:
            box('Side glazing',(side*.398,-.1,.81),(.025,.81,.27),'Glass',body,.035)
            box('Door window divider',(side*.417,-.12,.81),(.018,.035,.29),color,body,.005)
            box('Side mirror',(side*.50,.31,.72),(.15,.14,.075),color,body,.035)
            box('Door handle',(side*.472,-.15,.59),(.02,.17,.03),'Metal',body,.008)
        for x in [-.28,.28]:
            box('Headlamp',(x,.973,.47),(.22,.03,.12),'Lamp',body,.03)
            box('Tail lamp',(x,-.973,.48),(.18,.025,.12),'Red',body,.025)
        box('Front grille',(0,.984,.34),(.38,.02,.09),'Iron',body,.02)
        for x in [-.48,.48]:
            for y in [-.60,.60]:wheels.append(tire(root,'Car_Wheel',x,y,.22,.19,.12))
        rad=.19
    VEHICLES.append((root,wheels,phase,rad))
    return root

def scooter(phase):
    root=group('05_Mint_Scooter',TRAFFIC);body=group('Scooter_body_and_rider',root)
    box('Scooter footboard',(0,0,.25),(.34,1.05,.13),'Mint',body,.06)
    box('Scooter front shield',(0,.39,.55),(.40,.21,.59),'Mint',body,.12,(math.radians(-8),0,0))
    box('Scooter rear shell',(0,-.28,.45),(.41,.49,.37),'Mint',body,.12)
    box('Scooter saddle',(0,-.19,.69),(.38,.53,.12),'Black',body,.06)
    cylinder('Handle stem',(0,.40,.56),(0,.31,.91),.035,'Iron',body,8)
    cylinder('Handlebar',(-.27,.31,.91),(.27,.31,.91),.025,'Iron',body,8)
    wheels=[tire(root,'Scooter_Wheel',0,y,.20,.175,.12) for y in [-.45,.47]]
    uvball('Rider torso',(0,-.16,1.00),(.19,.14,.27),'Navy',body)
    uvball('Rider face',(0,-.10,1.36),(.14,.13,.15),'Skin1',body)
    uvball('White helmet',(0,-.13,1.44),(.17,.15,.13),'White',body)
    for s in [-1,1]:
        cylinder('Rider thigh',(s*.11,-.2,.82),(s*.17,.1,.62),.085,'Trouser',body,10)
        cylinder('Rider shin',(s*.17,.1,.62),(s*.15,.15,.31),.065,'Trouser',body,10)
        uvball('Rider shoe',(s*.15,.22,.30),(.08,.15,.065),'White',body)
        cylinder('Rider upper arm',(s*.15,-.08,1.14),(s*.24,.06,.99),.055,'Navy',body,10)
        cylinder('Rider forearm',(s*.24,.06,.99),(s*.23,.30,.91),.045,'Skin1',body,10)
    VEHICLES.append((root,wheels,phase,.175))

def bind_part(obj,bone):
    vg=obj.vertex_groups.new(name=bone);vg.add(list(range(len(obj.data.vertices))),1,'REPLACE')
    return obj

def vertex_palette(obj):
    """Keep the original colors while drawing a character/wheel in one call."""
    if 'VertexPalette' not in M:
        mat=material('VertexPalette','FFFFFF',.76,0)
        shader=mat.node_tree.nodes.get('Principled BSDF')
        color=mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='CityColors'
        mat.node_tree.links.new(color.outputs['Color'],shader.inputs['Base Color'])
        M['VertexPalette']=mat
    mesh=obj.data
    attribute=mesh.color_attributes.new(name='CityColors',type='BYTE_COLOR',domain='CORNER')
    colors=[tuple(mat.diffuse_color) for mat in mesh.materials]
    for poly in mesh.polygons:
        color=colors[poly.material_index]
        for loop in poly.loop_indices:attribute.data[loop].color=color
    mesh.color_attributes.active_color=attribute
    mesh.materials.clear();mesh.materials.append(M['VertexPalette'])
    for poly in mesh.polygons:poly.material_index=0

def create_person(name,shirt='ShirtBlue',skin='Skin1',hair='HairDark',role='walk',female=False,phase=0,route=None):
    root=group(name,RESIDENTS);root.scale=(1.24,)*3
    root['role']=role
    arm_data=bpy.data.armatures.new(name+'_Skeleton')
    rig=bpy.data.objects.new(name+'_Rig',arm_data);scene.collection.objects.link(rig);rig.parent=root
    rig.show_in_front=True
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active=rig;rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    spec={
     'Pelvis':((0,0,.57),(0,0,.72),None),
     'Spine':((0,0,.72),(0,0,.94),'Pelvis'),
     'Head':((0,0,.94),(0,0,1.16),'Spine'),
    }
    for s,tag in [(-1,'L'),(1,'R')]:
        spec.update({
         'Thigh_'+tag:((s*.10,0,.58),(s*.10,0,.33),'Pelvis'),
         'Shin_'+tag:((s*.10,0,.33),(s*.10,.015,.09),'Thigh_'+tag),
         'Foot_'+tag:((s*.10,.015,.09),(s*.10,.14,.06),'Shin_'+tag),
         'UpperArm_'+tag:((s*.20,0,.86),(s*.24,.01,.65),'Spine'),
         'Forearm_'+tag:((s*.24,.01,.65),(s*.24,.045,.47),'UpperArm_'+tag),
        })
    for bone,(a,b,par) in spec.items():
        eb=arm_data.edit_bones.new(bone);eb.head=a;eb.tail=b
        if par:eb.parent=arm_data.edit_bones[par]
    bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
    parts=[]
    def part(o,b):parts.append(bind_part(o,b));return o
    part(box('Torso',(0,0,.79),(.34,.205,.32),shirt,root,.09),'Spine')
    part(box('Waist',(0,0,.59),(.27,.19,.13),'Trouser' if shirt!='ShirtYellow' else 'Sand',root,.045),'Pelvis')
    part(cylinder('Neck',(0,0,.91),(0,0,.99),.064,skin,root,10),'Head')
    part(uvball('Face',(0,.015,1.075),(.145,.135,.172),skin,root,16,10),'Head')
    part(uvball('Hair cap',(0,-.022,1.164),(.151,.136,.104),hair,root,14,8),'Head')
    part(uvball('Hair back',(0,-.088,1.09),(.145,.073,.125),hair,root,12,8),'Head')
    if female:
        part(uvball('Ponytail',(0,-.165,1.11),(.083,.09,.12),hair,root),'Head')
        part(uvball('Ponytail tip',(0,-.19,1.01),(.067,.075,.10),hair,root),'Head')
    for s in [-1,1]:
        part(uvball('Ear',(s*.143,.0,1.07),(.025,.029,.047),skin,root,8,6),'Head')
        part(uvball('Eye',(s*.055,.139,1.09),(.015,.011,.019),'Black',root,8,6),'Head')
    part(uvball('Nose',(0,.153,1.055),(.022,.027,.024),skin,root,8,6),'Head')
    part(cylinder('Smile',(-.035,.142,1.016),(.035,.142,1.016),.007,'Hair',root,6),'Head')
    pants='Sand' if shirt in ['ShirtYellow','ShirtCream'] else 'Trouser'
    for s,tag in [(-1,'L'),(1,'R')]:
        part(cylinder('Trouser thigh',(s*.10,0,.55),(s*.10,0,.32),.077,pants,root,12,r2=.067),'Thigh_'+tag)
        part(uvball('Knee',(s*.10,0,.33),(.068,.068,.067),pants,root),'Shin_'+tag)
        part(cylinder('Trouser shin',(s*.10,0,.33),(s*.10,.015,.095),.062,pants,root,12,r2=.051),'Shin_'+tag)
        part(uvball('Shoe',(s*.10,.070,.065),(.075,.132,.063),'White',root,12,8),'Foot_'+tag)
        part(cylinder('Shirt sleeve',(s*.20,0,.85),(s*.235,.008,.71),.074,shirt,root,12,r2=.06),'UpperArm_'+tag)
        part(cylinder('Upper arm',(s*.23,.005,.72),(s*.24,.01,.65),.049,skin,root,10),'UpperArm_'+tag)
        part(cylinder('Forearm',(s*.24,.01,.65),(s*.24,.045,.49),.045,skin,root,10,r2=.035),'Forearm_'+tag)
        part(uvball('Hand',(s*.24,.045,.475),(.042,.039,.051),skin,root,10,6),'Forearm_'+tag)
    if role in ['chair','seated']:
        rig.location.z=-.12 if role=='chair' else -.25
    # Join the weighted body into one skinned mesh with a true editable armature.
    bpy.ops.object.select_all(action='DESELECT')
    parts[0].data=parts[0].data.copy()
    for ob in parts:ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
    human=parts[0];human.name=name+'_Skinned_Mesh';human.parent=root
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    modifier=human.modifiers.new('Character armature','ARMATURE');modifier.object=rig
    human.parent=rig
    # The mesh and rig share the same local rest space; lower both for seated poses.
    human.location=(0,0,0)
    vertex_palette(human)
    if role=='chair':
        wheels=wheelchair(root)
    else:wheels=[]
    if role=='walker':walker(root)
    return {'root':root,'rig':rig,'role':role,'phase':phase,'route':route,'wheels':wheels}

def wheelchair(root):
    g=group('Wheelchair_Frame',root)
    box('Seat cushion',(0,-.015,.46),(.45,.40,.10),'Navy',g,.045)
    box('Backrest',(0,-.205,.67),(.45,.085,.38),'Navy',g,.04)
    for s in [-1,1]:
        cylinder('Chair side frame',(s*.235,-.20,.26),(s*.235,.24,.38),.023,'Metal',g,8)
        cylinder('Backrest upright',(s*.22,-.23,.25),(s*.22,-.23,.86),.023,'Metal',g,8)
        cylinder('Push handle',(s*.22,-.23,.84),(s*.22,-.35,.84),.026,'Black',g,8)
        cylinder('Armrest upright',(s*.25,.13,.35),(s*.25,.13,.62),.021,'Metal',g,8)
        box('Padded armrest',(s*.25,-.015,.64),(.075,.39,.055),'Black',g,.02)
        cylinder('Front caster fork',(s*.22,.25,.31),(s*.22,.34,.10),.018,'Metal',g,8)
        torus('Small front caster',(s*.22,.34,.085),.057,.018,'Rubber',g,segments=14)
        cylinder('Footrest tube',(s*.14,.22,.33),(s*.14,.43,.16),.018,'Metal',g,8)
    box('Footplate',(0,.43,.15),(.34,.19,.035),'Iron',g,.02)
    wheels=[]
    for s in [-1,1]:
        wg=group('Wheelchair_Animated_Wheel',root,(s*.285,-.055,.255))
        torus('Main wheelchair tire',(0,0,0),.226,.027,'Rubber',wg,segments=28)
        torus('Alloy wheelchair rim',(0,0,0),.197,.012,'Metal',wg,segments=24)
        torus('Wheelchair push rim',(s*.038,0,0),.180,.010,'Metal',wg,segments=24)
        cylinder('Wheelchair hub',(-.04,0,0),(.04,0,0),.040,'Iron',wg,10)
        for i in range(10):
            a=TAU*i/10;cylinder('Wheelchair spoke',(0,0,0),(0,.197*math.cos(a),.197*math.sin(a)),.0055,'Metal',wg,6)
        wheels.append(wg)
    return wheels

def walker(root):
    g=group('Mobility_Walker',root)
    for x in [-.24,.24]:
        cylinder('Walker rear leg',(x,.15,.02),(x,.23,.55),.018,'Metal',g,8)
        cylinder('Walker front leg',(x,.56,.02),(x,.48,.55),.018,'Metal',g,8)
        cylinder('Walker grip',(x,.22,.56),(x,.48,.56),.024,'Black',g,8)
        cylinder('Walker side brace',(x,.19,.25),(x,.53,.25),.013,'Metal',g,8)
        for y in [.15,.56]:uvball('Rubber walker tip',(x,y,.025),(.028,.028,.028),'Rubber',g,8,5)
    cylinder('Walker crossbar',(-.24,.48,.47),(.24,.48,.47),.018,'Metal',g,8)
    cylinder('Walker lower crossbar',(-.24,.53,.23),(.24,.53,.23),.014,'Metal',g,8)

def animate():
    road=path(21.72,15.72,2.86,cy=-.5)
    routes={
     'front':path(12.0,.46,.20,cx=.1,cy=-9.43),
     'park':path(6.0,4.22,.88,cx=.15,cy=-3.0),
     'shops':path(4.6,.40,.18,cx=-5.8,cy=-3.18),
     'right':path(.42,5.2,.18,cx=11.86,cy=-.35),
    }
    people=[
      create_person('01_Front_Wheelchair_User','ShirtBlue','Skin1','HairDark','chair',phase=.73,route=routes['front']),
      create_person('02_Park_Wheelchair_User','ShirtYellow','Skin3','Hair','chair',True,.30,routes['park']),
      create_person('03_Front_Pedestrian_Coral','ShirtCoral','Skin2','HairDark','walk',True,.45,routes['front']),
      create_person('04_Front_Pedestrian_Cream','ShirtCream','Skin3','Hair','walk',False,.13,routes['front']),
      create_person('05_Front_Pedestrian_Blue','ShirtBlue','Skin2','HairDark','walk',True,.94,routes['front']),
      create_person('06_Park_Pedestrian','ShirtCream','Skin1','Hair','walk',False,.65,routes['park']),
      create_person('07_Park_Pedestrian_Coral','ShirtCoral','Skin3','HairDark','walk',True,.95,routes['park']),
      create_person('08_Shops_Pedestrian','Mint','Skin2','HairDark','walk',False,.10,routes['shops']),
      create_person('09_Shops_Pedestrian','ShirtYellow','Skin1','Hair','walk',True,.63,routes['shops']),
      create_person('10_Resident_With_Walker','ShirtCream','Skin3','HairGray','walker',False,.25,routes['right']),
      create_person('11_Seated_Park_Resident','ShirtBlue','Skin1','HairDark','seated'),
      create_person('12_Seated_Park_Resident','ShirtCoral','Skin2','Hair','seated',True),
    ]
    for ob,x in [(people[-2],1.95),(people[-1],-1.90)]:
        ob['root'].location=(x,-3.04,.535);ob['root'].rotation_euler.z=math.pi
    car('01_Blue_City_Bus','Navy',.57,'bus')
    car('02_Blue_Compact_Car','Blue',.78)
    car('03_Coral_Compact_Car','Coral',.10)
    car('04_Cream_Compact_Car','Mint',.34)
    scooter(.88)
    print('ANIMATION: baking residents and traffic',flush=True)
    for frame in range(0,LAST+1,2):
        p=frame/LAST;scene.frame_set(frame)
        for root,wheels,offset,radius in VEHICLES:
            x,y,yaw=on_path(road,p+offset)
            root.location=(x,y,.42);root.rotation_mode='QUATERNION';root.rotation_quaternion=Quaternion((0,0,1),yaw)
            root.keyframe_insert('location',frame=frame);root.keyframe_insert('rotation_quaternion',frame=frame)
            turns=round(road['length']/(TAU*radius))
            for wheel in wheels:
                wheel.rotation_mode='QUATERNION';wheel.rotation_quaternion=Quaternion((1,0,0),-TAU*turns*p)
                wheel.keyframe_insert('rotation_quaternion',frame=frame)
        for idx,person in enumerate(people):
            root,rig,role=person['root'],person['rig'],person['role'];phase=TAU*(p*24+idx*.13)
            if person['route']:
                x,y,yaw=on_path(person['route'],p+person['phase'])
                root.location=(x,y,.54);root.rotation_mode='QUATERNION';root.rotation_quaternion=Quaternion((0,0,1),yaw)
                root.keyframe_insert('location',frame=frame);root.keyframe_insert('rotation_quaternion',frame=frame)
            for s,tag in [(-1,'L'),(1,'R')]:
                thigh=rig.pose.bones['Thigh_'+tag];shin=rig.pose.bones['Shin_'+tag]
                arm=rig.pose.bones['UpperArm_'+tag];forearm=rig.pose.bones['Forearm_'+tag]
                for bone in [thigh,shin,arm,forearm]:bone.rotation_mode='XYZ'
                if role in ['chair','seated']:
                    thigh.rotation_euler.x=1.37;shin.rotation_euler.x=-1.37
                    arm.rotation_euler.x=.34+.12*math.sin(phase/2) if role=='chair' else -.25
                    forearm.rotation_euler.x=-.65 if role=='chair' else -.70
                elif role=='walker':
                    thigh.rotation_euler.x=s*.17*math.sin(phase);shin.rotation_euler.x=-max(0,s*math.sin(phase))*.23
                    arm.rotation_euler.x=.65;forearm.rotation_euler.x=-.22
                else:
                    thigh.rotation_euler.x=s*.40*math.sin(phase);shin.rotation_euler.x=-max(0,s*math.sin(phase))*.52
                    arm.rotation_euler.x=-s*.30*math.sin(phase);forearm.rotation_euler.x=-.10
                for bone in [thigh,shin,arm,forearm]:bone.keyframe_insert('rotation_euler',frame=frame)
            head=rig.pose.bones['Head'];head.rotation_mode='XYZ';head.rotation_euler.z=.045*math.sin(TAU*p*4+idx)
            head.keyframe_insert('rotation_euler',frame=frame)
            if person['wheels']:
                turns=round(person['route']['length']/(TAU*.226*1.24))
                for wheel in person['wheels']:
                    wheel.rotation_mode='QUATERNION';wheel.rotation_quaternion=Quaternion((1,0,0),-TAU*turns*p)
                    wheel.keyframe_insert('rotation_quaternion',frame=frame)
    for ob in bpy.data.objects:
        if ob.animation_data and ob.animation_data.action:
            ob.animation_data.action.name=ob.name+'_Loop_24s'
            for fc in ob.animation_data.action.fcurves:
                for key in fc.keyframe_points:key.interpolation='LINEAR'
    return people

def batch_static_meshes():
    # Preserve the building/character/vehicle hierarchy while reducing draw calls.
    groups=defaultdict(list)
    for ob in list(scene.objects):
        if ob.type!='MESH' or ob.vertex_groups or ob.animation_data:continue
        if len(ob.data.materials)!=1:continue
        groups[(ob.parent,ob.data.materials[0].name)].append(ob)
    print('OPTIMIZE: material batches',len(groups),flush=True)
    for (parent,mat),objects in groups.items():
        if len(objects)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        objects[0].data=objects[0].data.copy()
        for ob in objects:ob.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join();objects[0].name=(parent.name if parent else 'City')+'__'+mat
    wheel_parents=[ob for ob in scene.objects if ob.type=='EMPTY' and '_Wheel' in ob.name]
    for parent in wheel_parents:
        objects=[ob for ob in parent.children if ob.type=='MESH' and not ob.vertex_groups]
        if len(objects)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        objects[0].data=objects[0].data.copy()
        for ob in objects:ob.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        objects[0].name=parent.name+'_PaletteMesh';vertex_palette(objects[0])
    bpy.ops.object.select_all(action='DESELECT')

def presentation():
    bpy.ops.object.camera_add(location=(25,-34,31))
    cam=bpy.context.object;cam.name='Hero_Isometric_Camera';cam.data.type='ORTHO';cam.data.ortho_scale=32.8
    target=Vector((0,-.3,1.9));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.camera=cam
    scene.render.resolution_x=1400;scene.render.resolution_y=1050;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
    scene.world.color=(.7,.7,.7)
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.80,.90,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.6
    for name,loc,power,size in [('Large_soft_key',(-8,-12,19),2200,10),('Cool_fill',(13,-1,12),1250,9),('Back_rim',(-6,12,15),1700,8)]:
        bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.name=name;l.data.energy=power;l.data.shape='DISK';l.data.size=size
        l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
    scene.view_settings.view_transform='AgX'
    scene.view_settings.look='AgX - Medium High Contrast'
    return cam

print('BUILD: ground',flush=True);make_ground()
print('BUILD: architecture',flush=True);create_architecture()
print('BUILD: landscape',flush=True);create_landscape()
print('BUILD: residents',flush=True);people=animate()
scene.frame_set(0)
batch_static_meshes()
cam=presentation()
scene['loop_duration_seconds']=SECONDS
scene['animation_note']='Frames 0 and 576 match geometrically. Play GLB clips using LoopRepeat.'
scene['source']='Original procedural modeling based on the approved Accessible Way city illustration.'
for area in bpy.context.screen.areas if bpy.context.screen else []:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA'
        area.spaces.active.shading.type='MATERIAL'

blend=OUT/'Accessible_Way_City_Master.blend'
bpy.data.orphans_purge(do_local_ids=True,do_linked_ids=True,do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=str(blend),check_existing=False,compress=True)
print('SAVED_BLEND',str(blend),flush=True)
bpy.ops.object.select_all(action='DESELECT')
def select_tree(ob):
    ob.select_set(True)
    for child in ob.children:select_tree(child)
select_tree(CITY);cam.select_set(True)
kwargs=dict(filepath=str(OUT/'Accessible_Way_City_Animated.glb'),export_format='GLB',use_selection=True,
 export_cameras=True,export_lights=False,export_extras=True,export_apply=True,export_animations=True,
 export_animation_mode='SCENE',export_anim_scene_split_object=False,export_frame_range=True,
 export_frame_step=2,export_force_sampling=True,export_optimize_animation_size=True,
 export_optimize_animation_keep_anim_armature=False,export_optimize_animation_keep_anim_object=False,
 export_skins=True,export_def_bones=True,export_morph=False)
props={p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
kwargs={k:v for k,v in kwargs.items() if k in props}
bpy.ops.export_scene.gltf(**kwargs)
meta={'name':'Accessible Way — Inclusive City','duration_seconds':SECONDS,'fps':FPS,
 'buildings':10,'residents':12,'wheelchair_users':2,'walker_users':1,'vehicles':5,
 'camera_blender':list(cam.location),'target_blender':[0,-.3,1.9],'orthographic_width':32.8,
 'original_geometry':True,'skinned_character_rigs':True,
 'road_obstacles_removed':len(PROP_AUDIT['removed']),
 'files':{'blend':blend.name,'glb':'Accessible_Way_City_Animated.glb'}}
(OUT/'city_manifest.json').write_text(json.dumps(meta,indent=2),encoding='utf8')
(OUT/'road_clearance_report.json').write_text(json.dumps(PROP_AUDIT,indent=2),encoding='utf8')
print('ROAD_CLEARANCE',json.dumps({'kept':len(PROP_AUDIT['kept']),'removed':PROP_AUDIT['removed']}),flush=True)
print('CITY_READY',json.dumps(meta),flush=True)
if args.render:
    try:
        scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
        scene.render.filepath=str(OUT/'Accessible_Way_City_Blender.png');bpy.ops.render.render(write_still=True)
    except Exception as exc:print('BLENDER_RENDER_UNAVAILABLE',str(exc),flush=True)
