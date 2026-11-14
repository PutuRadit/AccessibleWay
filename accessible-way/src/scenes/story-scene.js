import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { gsap } from "gsap";
import { createWheelchairResident } from "./wheelchair-resident.js";
import { HOUSE_FRAME, HOSPITAL_FRAME, HOSPITAL_YAW, HOUSE_END, ARRIVAL_DISTANCE,
  TOTAL_DISTANCE, STEP_DISTANCES, SECOND_BUILDING_DISTANCE, OUTDOOR_SPEED,
  pointAt, headingAt, turnDelta } from "./story-path.js";

const modelUrl = `${import.meta.env.BASE_URL}assets/models/accessible-story.glb`;
// Front/elevated room view from the supplied reference. The hospital view is
// aligned to its doorway, rather than viewing the building from its right side.
const FRONT_VIEW = new THREE.Vector3(8, 26, 34).normalize();
const SHORT_TRAVEL_METRES = 2.4;
const ARRIVAL_TRAVEL_METRES = 2.1;
// Keep the indoor journey visible from the entrance to the pharmacy without
// making each selection wait through the former full real-time route.
const INDOOR_TRAVEL_SECONDS = 6.8;
const VIEW_FADE_SECONDS = .28;
const CONFIRM_SECONDS = .7;
const descriptions = ["Pengguna kursi roda duduk di dalam rumah.",
  "Pengguna membuka ponsel dan memilih rumah sakit pada gelembung peta.",
  "Pengguna mengonfirmasi tujuan, dari tanda tiga titik menjadi OK.",
  "Pengguna keluar rumah dan berhenti di depan gedung kedua.",
  "Pengguna melanjutkan perjalanan sampai pintu masuk rumah sakit.",
  "Pengguna masuk ke rumah sakit dan menuju farmasi di belakang."];

export function mountStoryScene(host, options = {}) {
  let selected = options.initialStep ?? 0;
  let reducedMotion = options.reducedMotion ?? matchMedia("(prefers-reduced-motion: reduce)").matches;
  let destroyed = false, visible = true, transition, models = [], hospitalExterior, houseExterior;
  let phase = "idle", travelDirection = 1, lastDistance = 0, rolledDistance = 0, lastRender = 0;
  let motionFrames = [], slowPlaybackReported = false;
  const retired = new Set(), ribbons = [], doors = [];
  const cameraFrames = new Map();
  const audit = { retiredActors: 0, removedHelpers: 0, retiredStaff: 0, openedPortals: 0, simplifiedGlass: 0 };
  const abort = new AbortController();
  const compact = matchMedia("(max-width: 640px)").matches || navigator.hardwareConcurrency <= 4;
  const renderer = new THREE.WebGLRenderer({ antialias: !compact, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1 : 1.25));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.className = "story-canvas";
  canvas.setAttribute("role", "img");
  host.append(canvas);

  const bubble = document.createElement("div");
  bubble.className = "story-bubble";
  bubble.setAttribute("role", "img");
  bubble.hidden = true;
  bubble.innerHTML = `<div class="story-bubble__map"><span class="story-bubble__label">Pilih tujuan</span>
    <span class="story-bubble__map-art" aria-hidden="true"><i></i><b>+</b></span>
    <span class="story-bubble__destination">Rumah Sakit</span></div>
    <span class="story-bubble__thinking" aria-hidden="true">…</span>
    <span class="story-bubble__ok" aria-hidden="true">✓ OK</span>`;
  host.append(bubble);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe9f3ff, 0xc5d5ba, 2.1));
  const key = new THREE.DirectionalLight(0xfff3df, 3.1);
  key.position.set(-10, 25, 18);
  const fill = new THREE.DirectionalLight(0xb6d8ff, 1.2);
  fill.position.set(16, 10, -7);
  scene.add(key, fill);
  const camera = new THREE.OrthographicCamera(-10, 10, 8, -8, .1, 500);
  const scenery = new THREE.Group();
  scene.add(scenery);
  const resident = createWheelchairResident();
  resident.root.scale.setScalar(1.12);
  resident.root.traverse(node => { if (node.isMesh) node.renderOrder = 3; });
  scene.add(resident.root);
  const state = { distance: 0, yaw: 0, phone: 0, thought: 0, halfHeight: 6.3, locomotion: 0 };
  const viewDirection = FRONT_VIEW.clone();

  function rememberFrame(index, object) {
    const inverse = object.matrixWorld.clone().invert();
    const box = new THREE.Box3();
    object.traverse(node => {
      if (!node.isMesh || !node.geometry) return;
      node.geometry.computeBoundingBox();
      const bounds = node.geometry.boundingBox;
      const matrix = inverse.clone().multiply(node.matrixWorld);
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        box.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(matrix));
      }
    });
    if (index === 5) box.max.y = Math.max(box.max.y, 4.5);
    cameraFrames.set(index, { box, matrix: object.matrixWorld.clone() });
  }

  function frameCamera(width, height) {
    const indoorFrame = selected >= 4;
    viewDirection.copy(FRONT_VIEW);
    if (indoorFrame) viewDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), HOSPITAL_YAW);
    let frame = cameraFrames.get(selected <= 2 ? 0 : selected);
    if (!frame) frame = cameraFrames.get(0);
    const target = frame.box.getCenter(new THREE.Vector3()).applyMatrix4(frame.matrix);
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), viewDirection).normalize();
    const up = new THREE.Vector3().crossVectors(viewDirection, right).normalize();
    let horizontal = 0, vertical = 0;
    for (const x of [frame.box.min.x, frame.box.max.x]) for (const y of [frame.box.min.y, frame.box.max.y]) for (const z of [frame.box.min.z, frame.box.max.z]) {
      const p = new THREE.Vector3(x, y, z).applyMatrix4(frame.matrix).sub(target);
      horizontal = Math.max(horizontal, Math.abs(p.dot(right)));
      vertical = Math.max(vertical, Math.abs(p.dot(up)));
    }
    const desktop = matchMedia("(min-width: 980px)").matches;
    const availableAspect = width * (desktop ? .52 : .92) / height;
    state.halfHeight = Math.max(vertical, horizontal / availableAspect) * 1.08;
    const halfWidth = state.halfHeight * width / height;
    const shift = desktop ? halfWidth * .44 : 0;
    camera.left = -halfWidth + shift;
    camera.right = halfWidth + shift;
    camera.top = state.halfHeight;
    camera.bottom = -state.halfHeight;
    camera.position.copy(viewDirection).multiplyScalar(160).add(target);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }

  function collectResources(node, into = retired) {
    node.traverse(child => {
      if (child.geometry) into.add(child.geometry);
      if (child.skeleton) into.add(child.skeleton);
      for (const material of [child.material].flat().filter(Boolean)) {
        into.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) into.add(value);
      }
    });
  }
  function retire(node) {
    collectResources(node);
    node.removeFromParent();
  }

  function cleanSourceScene(model) {
    const remove = [];
    model.traverse(node => {
      // The source's tinted glass triggered a second full-scene transmission
      // pass, painting over the floor route. Solid tinted glazing preserves
      // this illustration style and avoids the extra render on small GPUs.
      for (const material of [node.material].flat().filter(Boolean)) {
        if (material.transmission > 0) {
          material.transmission = 0;
          material.thickness = 0;
          material.needsUpdate = true;
          audit.simplifiedGlass++;
        }
      }
      if (node.name.startsWith("Pengguna_KursiRoda_ROOT_")) {
        remove.push(node);
        audit.retiredActors++;
      } else if (node.name.startsWith("PETUGAS_FARMASI_ROOT")) {
        remove.push(node);
        audit.retiredStaff++;
      } else if (/^Rute_|Panduan_Animasi|Profil_Datar|Lantai_[Ss]tudio/.test(node.name) || node.isLine) {
        remove.push(node);
        audit.removedHelpers++;
      }
    });
    remove.forEach(retire);
  }

  function prepareHospitalCutaway(model) {
    let partition, back, right;
    model.traverse(node => {
      if (node.name === "Partisi_Koridor_Kiri") partition = node;
      if (node.name.startsWith("Dinding_Belakang")) back = node;
      if (node.name === "Dinding_Luar_Kanan") right = node;
      if (node.name === "Partisi_Ruang_Kiri") {
        // A low cutaway edge reveals the seated resident at the pharmacy
        // from the new front view, instead of leaving only their head visible.
        node.scale.y *= .30;
        node.position.y = .85 + .775 * .30;
      }
    });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#edf1ee", roughness: .9 });
    function wall(size, position) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
      mesh.position.set(...position);
      model.add(mesh);
    }
    if (partition) {
      retire(partition);
      // The old mesh was solid behind the painted door. Keep a real 1.4 m
      // passage at the pharmacy and examination room instead of crossing it.
      for (const [a, b] of [[-6.01, -4.4], [-3, -.6], [.8, 5.41]]) wall([.18, 2.8, b - a], [-2.35, 2.25, (a + b) / 2]);
      for (const z of [-3.7, .1]) wall([.18, .52, 1.4], [-2.35, 3.39, z]);
      audit.openedPortals = 2;
    }
    // Low dollhouse edges keep the fixed 2:30 viewpoint into the pharmacy.
    if (back) { retire(back); wall([14.6, .65, .18], [0, 1.175, -6.1]); }
    if (right) { retire(right); wall([.18, .65, 11.42], [7.3, 1.175, -.3]); }

    const staff = new THREE.Group();
    staff.name = "Pharmacy staff — rigid geometry";
    staff.position.set(-5.25, .85, -5.0);
    const white = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .85 });
    const navy = new THREE.MeshStandardMaterial({ color: "#216e9b", roughness: .85 });
    const skin = new THREE.MeshStandardMaterial({ color: "#d8aa76", roughness: .85 });
    function staffBox(size, position, material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      staff.add(mesh);
    }
    staffBox([.42, .55, .25], [0, 1.09, 0], white);
    staffBox([.09, .20, .265], [0, 1.20, .01], navy);
    for (const side of [-1, 1]) {
      staffBox([.13, .65, .14], [side * .11, .54, 0], navy);
      staffBox([.12, .45, .13], [side * .28, 1.01, .03], white);
      staffBox([.10, .12, .10], [side * .28, .75, .03], skin);
    }
    const head = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 8), skin);
    head.position.y = 1.54;
    staff.add(head);
    staffBox([.35, .08, .31], [0, 1.70, 0], navy);
    model.add(staff);

    const label = document.createElement("canvas");
    label.width = 512; label.height = 128;
    const context = label.getContext("2d");
    context.fillStyle = "#ffffff";
    context.beginPath(); context.roundRect(4, 4, 504, 116, 24); context.fill();
    context.strokeStyle = "#dce9ff"; context.lineWidth = 4; context.stroke();
    context.fillStyle = "#164e8a"; context.font = "700 52px sans-serif";
    context.textAlign = "center"; context.textBaseline = "middle";
    context.fillText("+  FARMASI", 256, 65);
    const texture = new THREE.CanvasTexture(label);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sign.name = "Pharmacy room marker";
    sign.position.set(-5.15, 4.0, -4.15);
    sign.scale.set(2.8, .7, 1);
    model.add(sign);
  }

  function mergeStaticMeshes(model) {
    const batches = new Map();
    model.traverse(node => {
      if (!node.isMesh || node.isSkinnedMesh || Array.isArray(node.material) || node.morphTargetInfluences) return;
      let ancestor = node, owner = model;
      while (ancestor && ancestor !== model) {
        if (/Pintu_(Utama|Geser)|^Pintu_Farmasi/.test(ancestor.name)) return;
        if (ancestor === hospitalExterior) owner = hospitalExterior;
        if (ancestor === houseExterior) owner = houseExterior;
        ancestor = ancestor.parent;
      }
      const layout = Object.keys(node.geometry.attributes).sort().map(name =>
        `${name}:${node.geometry.attributes[name].itemSize}:${node.geometry.attributes[name].array.constructor.name}`).join("|");
      const id = `${owner.uuid}/${node.material.uuid}/${Boolean(node.geometry.index)}/${layout}`;
      if (!batches.has(id)) batches.set(id, { owner, material: node.material, meshes: [] });
      batches.get(id).meshes.push(node);
    });
    for (const { owner, material, meshes } of batches.values()) {
      if (meshes.length < 2) continue;
      const inverse = owner.matrixWorld.clone().invert();
      const geometries = meshes.map(mesh => mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld)));
      const merged = mergeGeometries(geometries);
      geometries.forEach(geometry => geometry.dispose());
      if (!merged) continue;
      const batch = new THREE.Mesh(merged, material);
      batch.name = "Static scenery batch";
      owner.add(batch);
      for (const mesh of meshes) { retired.add(mesh.geometry); mesh.removeFromParent(); }
    }
  }

  function makeRibbon(start, end, indoor) {
    const count = Math.ceil((end - start) / .08), positions = [];
    function pair(distance) {
      const p = pointAt(distance), angle = headingAt(distance);
      const dx = Math.cos(angle) * .078, dz = -Math.sin(angle) * .078;
      return [[p[0] + dx, p[1] + .035, p[2] + dz], [p[0] - dx, p[1] + .035, p[2] - dz]];
    }
    for (let i = 0; i < count; i++) {
      const a = pair(start + (end - start) * i / count);
      const b = pair(start + (end - start) * (i + 1) / count);
      positions.push(...a[0], ...a[1], ...b[0], ...a[1], ...b[1], ...b[0]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    const base = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: "#cee3f7", side: THREE.DoubleSide, depthWrite: false, depthTest: !indoor }));
    const filledGeometry = geometry.clone();
    filledGeometry.setDrawRange(0, 0);
    const filled = new THREE.Mesh(filledGeometry, new THREE.MeshBasicMaterial({ color: "#168ff1", side: THREE.DoubleSide, depthWrite: false, depthTest: !indoor }));
    filled.position.y = .006;
    base.renderOrder = 1;
    filled.renderOrder = 2;
    const group = new THREE.Group();
    group.name = indoor ? "Indoor progressive blue route" : "Outdoor progressive blue route";
    group.add(base, filled);
    scene.add(group);
    ribbons.push({ group, geometry: filledGeometry, start, end, count, indoor, filledSegments: 0 });
  }

  function updateScenery() {
    // Choose the scenery from the selected step, independently of the short
    // clip's start point. Outdoor views use the intact city house; the
    // separate cutaway house belongs only to the three indoor home steps.
    const indoor = selected === 5;
    const outside = selected >= 3;
    models[0].visible = selected <= 2;
    models[1].visible = outside && !indoor;
    models[2].visible = indoor;
    if (houseExterior) houseExterior.visible = outside && !indoor;
    if (hospitalExterior) hospitalExterior.visible = !indoor;
    ribbons.forEach(ribbon => {
      ribbon.group.visible = outside && (ribbon.indoor ? indoor : !indoor);
      ribbon.filledSegments = Math.max(0, Math.min(ribbon.count,
        Math.floor((state.distance - ribbon.start) / (ribbon.end - ribbon.start) * ribbon.count)));
      ribbon.geometry.setDrawRange(0, ribbon.filledSegments * 6);
    });
    const houseDoor = Math.max(0, Math.min(1, (state.distance - HOUSE_END + 1.5) / 1.2));
    for (const door of doors) {
      if (door.kind === "house") door.node.quaternion.copy(door.quaternion).multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -1.25 * houseDoor));
      else if (door.kind === "hospital") {
        const open = Math.max(0, 1 - Math.abs(state.distance - ARRIVAL_DISTANCE) / 2.4);
        door.node.position.copy(door.position);
        door.node.position.x += door.side * .65 * open;
      } else if (door.kind === "pharmacy") {
        const local = models[2].worldToLocal(resident.root.position.clone());
        const near = Math.max(0, 1 - Math.hypot(local.x + 2.35, local.z + 3.7) / 2.3);
        door.node.quaternion.copy(door.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -1.45 * near));
      }
    }
    return indoor;
  }

  function headInViewport(width, height) {
    const head = resident.headAnchor.getWorldPosition(new THREE.Vector3()).project(camera);
    return { x: (head.x + 1) * width / 2, y: (1 - head.y) * height / 2 };
  }

  function updateBubble(width, height) {
    const showing = (selected === 1 || selected === 2) && state.distance < .02 && state.phone > .7;
    bubble.hidden = !showing;
    if (!showing) return;
    const kind = selected === 1 ? "map" : state.thought < .99 ? "thinking" : "confirmed";
    bubble.dataset.kind = kind;
    bubble.setAttribute("aria-label", kind === "map" ? "Memilih tujuan Rumah Sakit pada peta" : kind === "thinking" ? "Mengonfirmasi tujuan…" : "OK, tujuan dikonfirmasi");
    const head = headInViewport(width, height);
    const half = bubble.offsetWidth / 2;
    const center = Math.max(half + 8, Math.min(width - half - 8, head.x));
    bubble.style.left = `${center}px`;
    bubble.style.top = `${head.y - 16}px`;
    bubble.style.setProperty("--tail-x", `${head.x - center + half}px`);
    bubble.dataset.headX = head.x.toFixed(2);
    bubble.dataset.headY = head.y.toFixed(2);
  }

  function render(force = false) {
    if (destroyed || !models.length) return;
    const now = performance.now();
    const frameSeconds = lastRender ? (now - lastRender) / 1000 : 0;
    const elapsed = lastRender ? Math.min(.1, (now - lastRender) / 1000) : 1 / 60;
    lastRender = now;
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    const difference = state.distance - lastDistance;
    rolledDistance += Math.abs(difference);
    lastDistance = state.distance;
    if (phase === "moving") {
      const heading = headingAt(state.distance, travelDirection);
      state.yaw += turnDelta(state.yaw, heading) * (1 - Math.exp(-elapsed * 16));
    }
    resident.root.position.set(...pointAt(state.distance));
    resident.root.rotation.y = state.yaw;
    resident.update({ phone: state.phone, distance: rolledDistance, moving: phase === "moving", locomotion: state.locomotion, turn: state.yaw });
    updateScenery();
    frameCamera(width, height);
    renderer.render(scene, camera);
    updateBubble(width, height);
    host.dataset.motion = phase;
    host.dataset.distance = state.distance.toFixed(3);
    // Fixed-camera video keeps the same animation visible when a device can
    // create WebGL but cannot render it smoothly. Ignore seek/resize captures.
    if (!force && phase === "moving" && visible && !document.hidden && frameSeconds > .008 && options.onSlowPlayback && !slowPlaybackReported) {
      motionFrames.push(frameSeconds);
      if (motionFrames.length > 5) motionFrames.shift();
      if (motionFrames.length === 5 && motionFrames.reduce((a, b) => a + b, 0) / 5 > .15) {
        slowPlaybackReported = true;
        const seconds = transition?.time() ?? 0;
        queueMicrotask(() => { if (!destroyed) options.onSlowPlayback({ seconds }); });
      }
    }
  }

  function setStep(index, { immediate = false, animate = false } = {}) {
    if (index < 0 || index >= STEP_DISTANCES.length || destroyed) return;
    const previous = selected;
    motionFrames = [];
    selected = index;
    canvas.setAttribute("aria-label", descriptions[index]);
    transition?.kill();
    transition = null;
    if (!models.length) return;
    const target = STEP_DISTANCES[index];
    const backward = index < previous;
    const wasPhoneOpen = state.phone;
    // Change location immediately, then play only this step's journey. A new
    // selection cancels the old timeline, never queues a trip from home.
    state.distance = target;
    state.yaw = index <= 2 ? 0 : index === 5 ? HOSPITAL_YAW + Math.PI : headingAt(target, 1);
    state.phone = index === 1 || index === 2 ? wasPhoneOpen : 0;
    state.thought = 0;
    state.locomotion = 0;
    phase = "idle";
    if ((immediate || reducedMotion) && !animate) {
      state.phone = index === 1 || index === 2 ? 1 : 0;
      state.thought = index === 2 ? 1 : 0;
      canvas.style.opacity = "1";
      render(true);
      return;
    }
    const timeline = gsap.timeline({ paused: true, onUpdate: () => render(),
      onComplete() { state.distance = target; phase = "idle"; transition = null; render(true); } });
    transition = timeline;
    canvas.style.opacity = ".08";
    timeline.to(canvas, { opacity: 1, duration: VIEW_FADE_SECONDS, ease: "sine.out" }, 0);
    if (index >= 3) {
      travelDirection = backward ? -1 : 1;
      const metres = index === 3 ? SHORT_TRAVEL_METRES : ARRIVAL_TRAVEL_METRES;
      state.distance = index === 5 ? ARRIVAL_DISTANCE
        : Math.min(TOTAL_DISTANCE, target - metres * travelDirection);
      // Arrival returns from just inside the doorway when Previous is used.
      if (backward && index === 4) state.distance = target + 1.2;
      state.yaw = headingAt(state.distance, 1);
      const facing = headingAt(state.distance, travelDirection);
      const angle = turnDelta(state.yaw, facing);
      const turnTime = backward ? .42 : .10;
      const moveTime = index === 5 ? INDOOR_TRAVEL_SECONDS
        : Math.abs(target - state.distance) / OUTDOOR_SPEED;
      phase = backward ? "turning" : "moving";
      timeline.to(state, { yaw: state.yaw + angle, duration: turnTime, ease: "sine.inOut" }, 0);
      timeline.call(() => { phase = "moving"; }, [], turnTime);
      timeline.to(state, { distance: target, duration: moveTime, ease: "sine.inOut" }, turnTime);
      timeline.to(state, { locomotion: 1, duration: .2, ease: "sine.out" }, turnTime);
      timeline.to(state, { locomotion: 0, duration: .28, ease: "sine.inOut" }, turnTime + moveTime - .28);
    }
    if (index === 1 || index === 2) {
      timeline.to(state, { phone: 1, duration: .4, ease: "sine.inOut" }, 0);
      if (index === 2) timeline.to(state, { thought: 1, duration: CONFIRM_SECONDS, ease: "none" }, .1);
    }
    // A scenery change is a cut, not physical travel: keep wheel rotation
    // and arm cadence tied only to the distance inside the new clip.
    lastDistance = state.distance;
    render(true);
    syncVisibility();
  }

  function resize() {
    if (destroyed) return;
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    renderer.setSize(Math.round(width), Math.round(height), false);
    render(true);
  }
  function syncVisibility() {
    if (visible && !document.hidden) transition?.resume();
    else transition?.pause();
  }
  function onContextLost(event) {
    event.preventDefault();
    if (!destroyed) options.onError?.(new Error("Story WebGL context lost"));
  }
  document.addEventListener("visibilitychange", syncVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const ready = (async () => {
    const response = await fetch(modelUrl, { signal: abort.signal });
    if (!response.ok) throw new Error(`Story model: HTTP ${response.status}`);
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
    models = gltf.scenes;
    models.forEach(model => { scenery.add(model); cleanSourceScene(model); });
    if (destroyed) { dispose(); return; }
    models[0].position.set(...HOUSE_FRAME);
    models[2].position.set(...HOSPITAL_FRAME);
    models[2].rotation.y = HOSPITAL_YAW;
    prepareHospitalCutaway(models[2]);
    houseExterior = models[1].getObjectByName("02_Rumah_ROOT");
    hospitalExterior = models[1].getObjectByName("07_Kompleks_Rumah_Sakit_ROOT");
    scenery.updateMatrixWorld(true);
    scenery.traverse(node => {
      if (/^Rumah_Pintu_Utama/.test(node.name)) doors.push({ kind: "house", node, quaternion: node.quaternion.clone() });
      if (/^RS_Pintu_Geser_(Kanan|Kiri)/.test(node.name)) doors.push({ kind: "hospital", node,
        position: node.position.clone(), side: node.name.includes("Kanan") ? 1 : -1 });
      if (/^Pintu_Farmasi/.test(node.name)) doors.push({ kind: "pharmacy", node, quaternion: node.quaternion.clone() });
      if (node.isSkinnedMesh) node.frustumCulled = false;
    });
    rememberFrame(0, models[0]);
    rememberFrame(5, models[2]);
    if (hospitalExterior) rememberFrame(4, hospitalExterior);
    cameraFrames.set(3, { box: new THREE.Box3(new THREE.Vector3(-9.15, 0, -7), new THREE.Vector3(4.85, 12, 4)), matrix: new THREE.Matrix4() });
    models.forEach(mergeStaticMeshes);
    makeRibbon(0, ARRIVAL_DISTANCE, false);
    makeRibbon(ARRIVAL_DISTANCE, TOTAL_DISTANCE, true);
    setStep(selected, { immediate: reducedMotion });
    options.onReady?.({ scene, camera, renderer });
  })();

  function dispose() {
    collectResources(scene);
    retired.forEach(resource => resource.dispose());
  }

  return {
    ready, setStep,
    setVisible(value) { visible = Boolean(value); syncVisibility(); },
    setReducedMotion(value) { reducedMotion = Boolean(value); if (reducedMotion) setStep(selected, { immediate: true }); },
    // Deterministic preview/QA capture without waiting through a full journey.
    seekTransition(seconds) {
      if (transition) { transition.pause(); transition.time(seconds, false); }
      render(true);
    },
    getStats() {
      let actorSkins = 0;
      resident.root.traverse(node => { if (node.isSkinnedMesh) actorSkins++; });
      const actorSize = new THREE.Box3().setFromObject(resident.root).getSize(new THREE.Vector3()).toArray();
      return { ready: models.length > 0, step: selected, phase, distance: state.distance,
        targetDistance: STEP_DISTANCES[selected], totalDistance: TOTAL_DISTANCE,
        secondBuildingDistance: SECOND_BUILDING_DISTANCE, arrivalDistance: ARRIVAL_DISTANCE,
        position: resident.root.position.toArray(), yaw: state.yaw, phone: state.phone,
        thought: state.thought, locomotion: state.locomotion, bubble: bubble.hidden ? null : bubble.dataset.kind,
        transitioning: Boolean(transition), duration: transition?.duration() ?? 0,
        cameraDirection: viewDirection.toArray(), halfHeight: state.halfHeight,
        headScreen: headInViewport(host.clientWidth, host.clientHeight),
        viewport: { width: host.clientWidth, height: host.clientHeight },
        reducedMotion, drawCalls: renderer.info.render.calls, actorSkins, actorSize, ...audit,
        scenery: models.map(model => model.visible),
        house: { cutaway: models[0]?.visible ?? false,
          cityExterior: Boolean(models[1]?.visible && houseExterior?.visible) },
        route: ribbons.map(r => ({ indoor: r.indoor, visible: r.group.visible,
          filled: r.filledSegments, segments: r.count })),
      };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      abort.abort();
      transition?.kill();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      bubble.remove();
    },
  };
}
