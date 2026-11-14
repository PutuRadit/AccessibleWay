import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { optimizeCityModel } from "../src/scenes/city-optimization.js";

// GLTFExporter uses FileReader for binary output; Node already supplies Blob.
globalThis.self ??= globalThis;
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }, error => this.onerror?.(error)); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString("base64")}`; this.onloadend?.(); }, error => this.onerror?.(error)); }
};

const source = fileURLToPath(new URL("../public/assets/models/accessible-city-animated.glb", import.meta.url));
const output = fileURLToPath(new URL("../public/assets/models/accessible-city-hero-optimized.glb", import.meta.url));
const bytes = await readFile(source);
const parse = data => new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), "");
const original = await parse(bytes), optimized = await parse(bytes);
const mixer = new THREE.AnimationMixer(optimized.scene);
for (const clip of optimized.animations) mixer.clipAction(clip).play();
mixer.setTime(0);
const started = performance.now();
const stats = optimizeCityModel(optimized.scene, optimized.animations);
if (stats.skipped || stats.meshesAfter >= stats.meshesBefore) throw new Error("The model was not safely optimized.");
optimized.scene.userData.heroOptimization = stats;
const binary = await new GLTFExporter().parseAsync(optimized.scene, { binary: true, animations: optimized.animations, trs: true });
const result = await parse(Buffer.from(binary));
const triangles = model => { let count = 0; model.traverse(node => { if (node.isMesh) count += (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3; }); return count; };
if (triangles(original.scene) !== triangles(result.scene)) throw new Error("The exported model lost geometry.");
if (original.animations.length !== result.animations.length || original.animations[0].duration !== result.animations[0].duration) throw new Error("The exported animation changed.");
const targetNames = new Set(original.animations.flatMap(clip => clip.tracks.map(track => THREE.PropertyBinding.parseTrackName(track.name).nodeName)));
const sourceMixer = new THREE.AnimationMixer(original.scene), resultMixer = new THREE.AnimationMixer(result.scene);
for (const clip of original.animations) sourceMixer.clipAction(clip).play();
for (const clip of result.animations) resultMixer.clipAction(clip).play();
for (const time of [0, 1.2, 4.25, 9, 18, 24]) {
  sourceMixer.setTime(time); resultMixer.setTime(time);
  original.scene.updateMatrixWorld(true); result.scene.updateMatrixWorld(true);
  for (const name of targetNames) {
    const a = THREE.PropertyBinding.findNode(original.scene, name), b = THREE.PropertyBinding.findNode(result.scene, name);
    if (!a || !b || a.matrixWorld.elements.some((value, index) => Math.abs(value - b.matrixWorld.elements[index]) > .00001)) throw new Error(`Animated target changed: ${name}`);
  }
  const a = new THREE.Box3().setFromObject(original.scene), b = new THREE.Box3().setFromObject(result.scene);
  if (a.min.distanceTo(b.min) > .0001 || a.max.distanceTo(b.max) > .0001) throw new Error("City bounds changed.");
}
await writeFile(output, Buffer.from(binary));
console.log(JSON.stringify({ output, sourceBytes: bytes.length, outputBytes: binary.byteLength, ...stats, animationTargets: targetNames.size, duration: result.animations[0].duration, preparationMs: performance.now() - started, verified: true }));
