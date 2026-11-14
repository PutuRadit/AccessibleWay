import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const defaultModel = `${import.meta.env.BASE_URL}assets/models/accessible-city-animated.glb`;
const description = "Miniatur kota inklusif dengan rumah, toko, gedung, taman, pejalan kaki, pengguna kursi roda, dan kendaraan.";

/** One renderer for this Hero; GLB contains the complete 24-second animation. */
export function mountCityScene(host, options = {}) {
  const playbackRate = options.playbackRate ?? 0.5;
  const compact = matchMedia("(max-width: 640px)").matches || navigator.hardwareConcurrency <= 4;
  const renderer = new THREE.WebGLRenderer({ antialias: !compact, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = options.shadows ?? true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.className = "city-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", description);
  host.append(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f8f9ff");
  const camera = new THREE.OrthographicCamera(-16.4, 16.4, 12.3, -12.3, .1, 160);
  camera.position.set(25, 31, 34);
  camera.lookAt(0, 1.9, .3);

  scene.add(new THREE.HemisphereLight(0xe9f3ff, 0xc4d0b0, 2.1));
  const key = new THREE.DirectionalLight(0xfff1dc, 3.0);
  key.position.set(-14, 26, 18);
  key.castShadow = renderer.shadowMap.enabled;
  key.shadow.mapSize.set(compact ? 512 : 1024, compact ? 512 : 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -21;
  key.shadow.camera.right = key.shadow.camera.top = 21;
  key.shadow.camera.near = .5;
  key.shadow.camera.far = 90;
  key.shadow.normalBias = .06;
  key.shadow.bias = -.00015;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb5d7ff, 1.2);
  fill.position.set(16, 10, -7);
  scene.add(fill);

  let model, mixer, raf = 0, lastFrame = 0, destroyed = false;
  let paused = options.paused ?? matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = true;
  let failed = false;
  let byteLength = 0;
  let clips = [];
  const abort = new AbortController();

  function render() {
    if (model && !destroyed && !failed) renderer.render(scene, camera);
  }

  function cancelFrame() {
    cancelAnimationFrame(raf);
    raf = 0;
    lastFrame = 0;
  }

  function tick(now) {
    if (destroyed || failed || paused || !visible || document.hidden || !mixer) {
      cancelFrame();
      return;
    }
    if (!lastFrame) lastFrame = now;
    const delta = (now - lastFrame) / 1000;
    if (delta >= 1 / 24) {
      mixer.update(Math.min(delta, .12));
      render();
      lastFrame = now;
    }
    raf = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    cancelFrame();
    render();
    if (mixer && !paused && visible && !document.hidden && !destroyed && !failed) {
      raf = requestAnimationFrame(tick);
    }
  }

  function resize() {
    if (destroyed) return;
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    const aspect = width / height;
    const immersive = options.layout === "hero" && matchMedia("(min-width: 980px)").matches && aspect >= 1.25;
    const halfHeight = immersive ? 9.3 : Math.max(32.8 / 2 / (4 / 3), 32.8 / 2 / aspect);
    const halfWidth = halfHeight * aspect;
    const shift = immersive ? halfWidth * .30 : 0;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.right = halfWidth - shift;
    camera.left = -halfWidth - shift;
    camera.updateProjectionMatrix();
    renderer.setSize(Math.round(width), Math.round(height), false);
    render();
  }

  function onVisibility() { syncPlayback(); }
  function onContextLost(event) {
    event.preventDefault();
    if (destroyed) return;
    failed = true;
    cancelFrame();
    options.onError?.(new Error("WebGL context lost"));
  }
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const ready = (async () => {
    const response = await fetch(options.modelUrl ?? defaultModel, { signal: abort.signal });
    if (!response.ok) throw new Error(`City model: HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    byteLength = buffer.byteLength;
    const gltf = await new GLTFLoader().parseAsync(buffer, "");
    if (destroyed) {
      disposeModel(gltf.scene);
      return;
    }
    model = gltf.scene;
    clips = gltf.animations;
    model.traverse((node) => {
      if (!node.isMesh) return;
      let ancestor = node;
      let animated = node.isSkinnedMesh;
      while (ancestor) {
        if (/Animated_Vehicles|Animated_Residents/.test(ancestor.name)) animated = true;
        ancestor = ancestor.parent;
      }
      node.castShadow = !animated;
      node.receiveShadow = true;
    });
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    mixer.timeScale = playbackRate;
    for (const clip of clips) mixer.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity).play();
    mixer.setTime(0);
    renderer.shadowMap.needsUpdate = true;
    resize();
    syncPlayback();
    options.onReady?.();
  })();

  return {
    ready,
    get paused() { return paused; },
    setPaused(value) {
      paused = Boolean(value);
      syncPlayback();
      options.onPauseChange?.(paused);
    },
    setVisible(value) { visible = Boolean(value); syncPlayback(); },
    setTime(seconds) {
      if (mixer) {
        mixer.timeScale = 1;
        mixer.setTime(seconds);
        mixer.timeScale = playbackRate;
        render();
      }
    },
    getStats() {
      let meshes = 0, skinnedMeshes = 0;
      model?.traverse((node) => { if (node.isMesh) meshes++; if (node.isSkinnedMesh) skinnedMeshes++; });
      return { ready: Boolean(model), paused, visible, time: mixer?.time ?? 0, playbackRate,
        framing: { halfHeight: camera.top, horizontalShift: -(camera.left + camera.right) / 2 },
        byteLength, meshes, skinnedMeshes, clips: clips.map(c => ({ name: c.name, duration: c.duration, tracks: c.tracks.length })),
        drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
        renderer: renderer.capabilities.isWebGL2 ? "WebGL2" : "WebGL",
      };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      abort.abort();
      cancelFrame();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      mixer?.stopAllAction();
      if (model) { mixer?.uncacheRoot(model); disposeModel(model); }
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

function disposeModel(model) {
  const geometries = new Set(), materials = new Set(), textures = new Set(), skeletons = new Set();
  model.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    if (node.skeleton) skeletons.add(node.skeleton);
    for (const material of [node.material].flat().filter(Boolean)) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const item of [...geometries, ...materials, ...textures, ...skeletons]) item.dispose();
}
