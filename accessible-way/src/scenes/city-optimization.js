import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

function animationTargets(model, clips) {
  const targets = new Set();
  for (const clip of clips) for (const track of clip.tracks) {
    let node;
    try { node = THREE.PropertyBinding.findNode(model, THREE.PropertyBinding.parseTrackName(track.name).nodeName); } catch { /* Keep unfamiliar bindings untouched. */ }
    if (!node) return null;
    targets.add(node);
  }
  return targets;
}

/** Freeze only local transforms that are not written by the animation mixer. */
export function freezeCityTransforms(model, clips) {
  const targets = animationTargets(model, clips);
  if (!targets) return 0;
  let count = 0;
  model.updateMatrixWorld(true);
  model.traverse(node => {
    if (!targets.has(node)) { node.updateMatrix(); node.matrixAutoUpdate = false; count++; }
  });
  return count;
}

/** Batch only opaque, static leaf meshes. Animation targets keep their identity. */
export function optimizeCityModel(model, clips) {
  const stats = { meshesBefore: 0, meshesAfter: 0, mergedSources: 0, batches: 0, frozenTransforms: 0 };
  model.traverse(node => { if (node.isMesh) stats.meshesBefore++; });
  stats.meshesAfter = stats.meshesBefore;
  const targets = animationTargets(model, clips);
  if (!targets) return { ...stats, skipped: "unresolved-animation-binding" };
  const animated = node => {
    for (let parent = node; parent; parent = parent.parent) if (!parent.visible || targets.has(parent)) return true;
    return false;
  };
  model.updateMatrixWorld(true);
  const inverseRoot = model.matrixWorld.clone().invert();
  const buckets = new Map(), removed = [];
  model.traverse(node => {
    if (!node.isMesh || node.isSkinnedMesh || node.isInstancedMesh || node.children.length || animated(node)) return;
    const material = node.material, geometry = node.geometry;
    if (!material || Array.isArray(material) || material.transparent || !node.visible || !geometry) return;
    if (Object.keys(geometry.morphAttributes).length || geometry.groups.length > 1 || geometry.drawRange.start !== 0 || geometry.drawRange.count !== Infinity) return;
    const attributes = Object.entries(geometry.attributes);
    if (attributes.some(([, value]) => value.isInterleavedBufferAttribute)) return;
    const matrix = new THREE.Matrix4().multiplyMatrices(inverseRoot, node.matrixWorld);
    if (matrix.determinant() <= 0) return;
    const signature = attributes.map(([name, value]) => `${name}:${value.itemSize}:${value.normalized}:${value.array.constructor.name}`).sort().join("|");
    const key = `${material.uuid}:${Boolean(geometry.index)}:${signature}:${node.castShadow}:${node.receiveShadow}:${node.renderOrder}:${node.layers.mask}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ node, matrix });
  });
  for (const sources of buckets.values()) {
    if (sources.length < 2) continue;
    const copies = sources.map(({ node, matrix }) => node.geometry.clone().applyMatrix4(matrix));
    let geometry;
    try { geometry = mergeGeometries(copies, false); } finally { for (const copy of copies) copy.dispose(); }
    if (!geometry) continue;
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    const original = sources[0].node, mesh = new THREE.Mesh(geometry, original.material);
    mesh.name = `Hero_Static_Batch_${stats.batches + 1}`;
    mesh.castShadow = original.castShadow; mesh.receiveShadow = original.receiveShadow;
    mesh.renderOrder = original.renderOrder; mesh.layers.mask = original.layers.mask;
    model.add(mesh);
    for (const { node } of sources) { node.removeFromParent(); removed.push(node.geometry); }
    stats.mergedSources += sources.length; stats.batches++;
  }
  // A shared geometry may still be used by an animated or transparent mesh.
  const remaining = new Set();
  model.traverse(node => {
    if (node.geometry) remaining.add(node.geometry);
    if (!targets.has(node)) { node.updateMatrix(); node.matrixAutoUpdate = false; stats.frozenTransforms++; }
  });
  for (const geometry of new Set(removed)) if (!remaining.has(geometry)) geometry.dispose();
  model.updateMatrixWorld(true);
  stats.meshesAfter = 0;
  model.traverse(node => { if (node.isMesh) stats.meshesAfter++; });
  return stats;
}
