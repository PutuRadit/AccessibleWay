"""Keep the existing house, city and hospital scenes; remove duplicated exports.

Run from any directory with Python 3. The original GLB remains untouched.
No mesh geometry, materials, rigs or keyframes are regenerated.
"""
from copy import deepcopy
import json
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / '3d Assets/AccessibleWay_3DModel.glb'
TARGET = ROOT / 'accessible-way/public/assets/models/accessible-story.glb'


def prepare():
    raw = SOURCE.read_bytes()
    json_size, _ = struct.unpack_from('<II', raw, 12)
    original = json.loads(raw[20:20 + json_size])
    binary_offset = 20 + json_size
    binary_size, _ = struct.unpack_from('<II', raw, binary_offset)
    binary = raw[binary_offset + 8:binary_offset + 8 + binary_size]
    doc = deepcopy(original)

    selected = [deepcopy(original['scenes'][i]) for i in (1, 2, 3)]
    for scene in selected:
        scene['nodes'] = [i for i in scene['nodes']
                          if 'Studio' not in original['nodes'][i].get('name', '')
                          and 'studio' not in original['nodes'][i].get('name', '')]
    kept = set()

    def visit(index):
        if index in kept:
            return
        kept.add(index)
        for child in original['nodes'][index].get('children', []):
            visit(child)

    for scene in selected:
        for index in scene['nodes']:
            visit(index)

    skins = {original['nodes'][i]['skin'] for i in kept if 'skin' in original['nodes'][i]}
    for skin in skins:
        for joint in original['skins'][skin]['joints']:
            visit(joint)
        if 'skeleton' in original['skins'][skin]:
            visit(original['skins'][skin]['skeleton'])

    def compact(key, indices):
        ids = sorted(indices)
        mapping = {old: new for new, old in enumerate(ids)}
        doc[key] = [deepcopy(original[key][i]) for i in ids]
        return mapping

    node_map = compact('nodes', kept)
    mesh_map = compact('meshes', {n['mesh'] for n in doc['nodes'] if 'mesh' in n})
    skin_map = compact('skins', skins)
    for node in doc['nodes']:
        if 'children' in node:
            node['children'] = [node_map[i] for i in node['children'] if i in node_map]
        if 'mesh' in node:
            node['mesh'] = mesh_map[node['mesh']]
        if 'skin' in node:
            node['skin'] = skin_map[node['skin']]
    for skin in doc['skins']:
        skin['joints'] = [node_map[i] for i in skin['joints']]
        if 'skeleton' in skin:
            skin['skeleton'] = node_map[skin['skeleton']]
    for scene in selected:
        scene['nodes'] = [node_map[i] for i in scene['nodes']]
    doc['scenes'] = selected
    doc['scene'] = 0

    # The source also includes three copies of the same push action per rig.
    action_ids = [23, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
                  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
    doc['animations'] = [deepcopy(original['animations'][i]) for i in action_ids]
    for animation in doc['animations']:
        for channel in animation['channels']:
            channel['target']['node'] = node_map[channel['target']['node']]

    accessors = set()
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            accessors.update(primitive['attributes'].values())
            if 'indices' in primitive:
                accessors.add(primitive['indices'])
            for target in primitive.get('targets', []):
                accessors.update(target.values())
    for skin in doc['skins']:
        if 'inverseBindMatrices' in skin:
            accessors.add(skin['inverseBindMatrices'])
    for animation in doc['animations']:
        for sampler in animation['samplers']:
            accessors.update([sampler['input'], sampler['output']])
    accessor_map = compact('accessors', accessors)
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            primitive['attributes'] = {k: accessor_map[v] for k, v in primitive['attributes'].items()}
            if 'indices' in primitive:
                primitive['indices'] = accessor_map[primitive['indices']]
            for target in primitive.get('targets', []):
                for key, index in target.items():
                    target[key] = accessor_map[index]
    for skin in doc['skins']:
        if 'inverseBindMatrices' in skin:
            skin['inverseBindMatrices'] = accessor_map[skin['inverseBindMatrices']]
    for animation in doc['animations']:
        for sampler in animation['samplers']:
            sampler['input'] = accessor_map[sampler['input']]
            sampler['output'] = accessor_map[sampler['output']]

    views = {a['bufferView'] for a in doc['accessors'] if 'bufferView' in a}
    views.update(i['bufferView'] for i in doc.get('images', []) if 'bufferView' in i)
    for accessor in doc['accessors']:
        if 'sparse' in accessor:
            views.update(accessor['sparse'][k]['bufferView'] for k in ('indices', 'values'))
    view_map = compact('bufferViews', views)
    for accessor in doc['accessors']:
        if 'bufferView' in accessor:
            accessor['bufferView'] = view_map[accessor['bufferView']]
        if 'sparse' in accessor:
            for key in ('indices', 'values'):
                accessor['sparse'][key]['bufferView'] = view_map[accessor['sparse'][key]['bufferView']]
    for image in doc.get('images', []):
        if 'bufferView' in image:
            image['bufferView'] = view_map[image['bufferView']]
    packed = bytearray()
    for view in doc['bufferViews']:
        packed.extend(b'\0' * (-len(packed) % 4))
        start = view.get('byteOffset', 0)
        payload = binary[start:start + view['byteLength']]
        view['buffer'] = 0
        view['byteOffset'] = len(packed)
        packed.extend(payload)
    doc['buffers'] = [{'byteLength': len(packed)}]
    json_bytes = json.dumps(doc, separators=(',', ':')).encode()
    json_bytes += b' ' * (-len(json_bytes) % 4)
    packed.extend(b'\0' * (-len(packed) % 4))
    size = 12 + 8 + len(json_bytes) + 8 + len(packed)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_bytes(struct.pack('<III', 0x46546C67, 2, size)
                       + struct.pack('<II', len(json_bytes), 0x4E4F534A) + json_bytes
                       + struct.pack('<II', len(packed), 0x004E4942) + packed)
    print(json.dumps({'source_bytes': len(raw), 'output_bytes': size,
                      'scenes': [s['name'] for s in selected], 'skins': len(skins),
                      'animations': len(doc['animations'])}))


if __name__ == '__main__':
    prepare()
