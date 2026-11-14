import * as THREE from "three";

/** Articulated rigid parts avoid the stretched skin triangles in the source rig. */
export function createWheelchairResident() {
  const root = new THREE.Group();
  root.name = "Accessible Way wheelchair resident";
  const materials = {};
  const material = (name, color, extra = {}) => materials[name] ??= new THREE.MeshStandardMaterial({ color, roughness: .78, ...extra });
  const skin = material("skin", "#d8aa76");
  const shirt = material("shirt", "#249bc1");
  const trousers = material("trousers", "#dfae43");
  const hair = material("hair", "#68442b");
  const blue = material("chair", "#177db9");
  const metal = material("metal", "#b4c8d0", { metalness: .45, roughness: .45 });
  const rubber = material("rubber", "#34464f");
  const dark = material("dark", "#31404b");

  function add(geometry, mat, position = [0, 0, 0], parent = root) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  }
  const box = (size, mat, position, parent) => add(new THREE.BoxGeometry(...size), mat, position, parent);
  function ball(radius, mat, position, parent) {
    return add(new THREE.SphereGeometry(radius, 12, 8), mat, position, parent);
  }
  function bar(a, b, radius, mat, parent = root) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = add(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), mat,
      start.clone().add(end).multiplyScalar(.5).toArray(), parent);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    return mesh;
  }

  const wheels = [];
  for (const side of [-1, 1]) {
    const wheel = new THREE.Group();
    wheel.position.set(side * .345, .35, -.1);
    root.add(wheel);
    const tire = add(new THREE.TorusGeometry(.32, .033, 8, 28), rubber, [0, 0, 0], wheel);
    tire.rotation.y = Math.PI / 2;
    const rim = add(new THREE.TorusGeometry(.265, .012, 6, 24), metal, [side * .045, 0, 0], wheel);
    rim.rotation.y = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      bar([0, 0, 0], [0, Math.cos(angle) * .30, Math.sin(angle) * .30], .007, metal, wheel);
    }
    wheels.push({ wheel, side, radius: .32 });
    const caster = new THREE.Group();
    caster.position.set(side * .235, .10, .47);
    root.add(caster);
    const tireSmall = add(new THREE.TorusGeometry(.073, .022, 6, 16), rubber, [0, 0, 0], caster);
    tireSmall.rotation.y = Math.PI / 2;
    wheels.push({ wheel: caster, side, radius: .073 });
    bar([side * .27, .23, -.13], [side * .27, .61, .24], .025, blue);
    bar([side * .27, .60, -.25], [side * .27, 1.02, -.28], .025, metal);
    bar([side * .28, .78, -.18], [side * .28, .78, .29], .025, dark);
    bar([side * .22, .40, .27], [side * .22, .12, .51], .018, metal);
    bar([side * .27, 1.00, -.28], [side * .27, 1.00, -.43], .022, rubber);
  }
  box([.52, .09, .47], blue, [0, .59, .005]);
  box([.50, .46, .065], blue, [0, .83, -.255]);
  box([.46, .035, .23], metal, [0, .12, .49]);
  bar([-.30, .35, -.1], [.30, .35, -.1], .025, metal);
  const torso = box([.40, .42, .25], shirt, [0, .94, -.07]);
  ball(.14, shirt, [-.16, 1.11, -.07]);
  ball(.14, shirt, [.16, 1.11, -.07]);
  box([.34, .14, .29], trousers, [0, .68, .045]);
  for (const side of [-1, 1]) {
    const x = side * .12;
    bar([x, .69, .02], [x, .62, .35], .082, trousers);
    ball(.083, trousers, [x, .62, .35]);
    bar([x, .62, .35], [x, .20, .45], .065, trousers);
    box([.14, .09, .24], hair, [x, .19, .50]);
  }
  bar([0, 1.10, -.07], [0, 1.27, -.07], .065, skin);
  const head = new THREE.Group();
  head.position.set(0, 1.38, -.07);
  root.add(head);
  const headAnchor = new THREE.Object3D();
  headAnchor.position.set(0, .22, 0);
  head.add(headAnchor);
  const face = ball(.165, skin, [0, 0, 0], head);
  face.scale.set(.89, 1.10, .93);
  const cap = add(new THREE.SphereGeometry(.169, 12, 8, 0, Math.PI * 2, 0, Math.PI * .58), hair, [0, .024, -.018], head);
  cap.scale.set(.94, 1.04, 1);
  for (const side of [-1, 1]) ball(.014, dark, [side * .054, .005, .143], head);
  ball(.024, skin, [0, -.025, .157], head);

  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * .245, 1.09, -.065);
    root.add(shoulder);
    bar([0, 0, 0], [0, -.17, 0], .075, shirt, shoulder);
    bar([0, -.16, 0], [0, -.29, 0], .052, skin, shoulder);
    const elbow = new THREE.Group();
    elbow.position.y = -.29;
    shoulder.add(elbow);
    ball(.055, skin, [0, 0, 0], elbow);
    bar([0, 0, 0], [0, -.255, 0], .042, skin, elbow);
    ball(.052, skin, [0, -.265, 0], elbow);
    arms.push({ shoulder, elbow, side });
  }
  const phone = new THREE.Group();
  root.add(phone);
  box([.135, .225, .026], dark, [0, 0, 0], phone);
  const screen = box([.113, .185, .004], material("screen", "#c7edff", { emissive: "#8acced", emissiveIntensity: .25 }), [0, .004, -.016], phone);
  box([.075, .018, .005], blue, [0, .045, -.02], phone);
  box([.055, .016, .005], shirt, [-.01, .006, -.02], phone);
  screen.name = "Phone screen";

  return {
    root, headAnchor,
    update({ phone: phoneAmount = 0, distance = 0, moving = false, locomotion = moving ? 1 : 0, turn = 0 }) {
      const phase = distance * 3.1;
      torso.rotation.z = Math.sin(phase) * .012 * locomotion;
      head.rotation.x = phoneAmount * .24;
      arms.forEach(({ shoulder, elbow, side }) => {
        const push = Math.sin(phase) * .25 * locomotion;
        shoulder.rotation.x = -.15 + push;
        shoulder.rotation.z = -side * .10;
        elbow.rotation.x = -.5 - push * .65;
        if (side === 1) {
          shoulder.rotation.x += phoneAmount * -.42;
          elbow.rotation.x += phoneAmount * -1.30;
          shoulder.rotation.z += phoneAmount * .12;
        }
      });
      phone.visible = phoneAmount > .05;
      phone.position.set(.235, .72 + phoneAmount * .31, .32 + phoneAmount * .05);
      phone.rotation.set(-.15, 0, -.12);
      wheels.forEach(({ wheel, side, radius }) => { wheel.rotation.x = distance / radius + side * turn * .34 / radius; });
    },
  };
}
